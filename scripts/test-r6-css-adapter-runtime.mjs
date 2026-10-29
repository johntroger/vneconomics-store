import assert from 'node:assert/strict';
import {cpSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {randomBytes,createHmac} from 'node:crypto';
import {startSite} from './local-runtime.mjs';
import {sha256} from './release-lib.mjs';
import {r6CssProfile} from './release-r6-css.mjs';
import {buildOperatorBootstrap,collectLocalHealthProof} from './r6-css-operator.mjs';

export async function exerciseAdapterRuntime({fixture,prepared,payload}){
 const directory=join(fixture,'adapter-runtime'),checks=[],token=randomBytes(32).toString('hex'),healthKey=randomBytes(32),keyHex=healthKey.toString('hex'),began=Date.now();let app;
 const progress=label=>{const seconds=Math.round((Date.now()-began)/1000);writeFileSync(join(fixture,'runtime-progress.json'),JSON.stringify({label,seconds}));console.log('PASS adapter runtime '+label+' ('+seconds+'s)');};
 const localFetch=async(path,options={})=>{
  let url=new URL(path,'http://127.0.0.1:19482/');
  for(let hop=0;hop<4;hop++){
   assert.equal(url.origin,'http://127.0.0.1:19482','Fixture redirect escaped loopback');
   const response=await fetch(url,{...options,redirect:'manual',signal:AbortSignal.timeout(30000)});
   if(![301,302,303,307,308].includes(response.status))return response;
   const location=response.headers.get('location');assert.ok(location,'Redirect missing location');await response.body?.cancel();url=new URL(location,url);
  }throw new Error('Too many fixture redirects');
 };
 const kept=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'].filter(existsSync),before=Object.fromEntries(kept.map(path=>[path,sha256(readFileSync(path))]));
 mkdirSync(directory,{recursive:true});
 try{
  if(existsSync('.local/site/wp-load.php')){
   for(const name of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',name),join(directory,name),{recursive:true});
   for(const entry of readdirSync('.local/site',{withFileTypes:true}))if(entry.isFile()&&entry.name.endsWith('.php')&&entry.name!=='wp-config.php')cpSync(join('.local/site',entry.name),join(directory,entry.name));
  }
  app=await startSite(directory,19482,{workers:1});
  const php=async code=>{let result;try{result=await app.playground.run({code:"<?php clearstatcache();try{"+code+"}catch(Throwable $e){echo json_encode(array('error'=>$e->getMessage()));}"});}catch(e){throw new Error('Runtime PHP: '+String(e.response?.text||e.response?.errors||e.message).slice(-2000));}assert.equal(result.exitCode,0,result.errors||result.text);assert.equal(result.errors,'',result.errors);return result.text;};
  const json=async code=>JSON.parse(await php(code));
  writeFileSync(join(directory,'.adapter-owned'),token);mkdirSync(join(directory,'adapter-stage'));
  for(const [name,data] of Object.entries(prepared.buffers))writeFileSync(join(directory,'adapter-stage',name),data);
  await php("mkdir('/adapter-fixture',0700);mkdir('/adapter-fixture/inbox',0700);mkdir('/adapter-fixture/control',0700);mkdir('/adapter-fixture/clone.git',0700);mkdir('/adapter-fixture/clone.git/refs',0700);mkdir('/adapter-fixture/clone.git/refs/heads',0700);foreach(scandir('/wordpress/adapter-stage') as $n)if($n!=='.'&&$n!=='..'){copy('/wordpress/adapter-stage/'.$n,'/adapter-fixture/inbox/'.$n);unlink('/wordpress/adapter-stage/'.$n);}rmdir('/wordpress/adapter-stage');file_put_contents('/adapter-fixture/clone.git/HEAD',\"ref: refs/heads/release-production\\n\");file_put_contents('/adapter-fixture/clone.git/refs/heads/release-production','"+payload+"'.chr(10));file_put_contents('/adapter-fixture/control/health-key.json',json_encode(array('key'=>'"+keyHex+"')));define('FS_METHOD','direct');require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/file.php';WP_Filesystem();foreach(array('plugin.zip'=>'plugins','previous-theme.zip'=>'themes') as $zip=>$dest){$r=unzip_file('/adapter-fixture/inbox/'.$zip,WP_CONTENT_DIR.'/'.$dest.'/');if(is_wp_error($r))throw new Exception($r->get_error_message());}");
  const observations=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
  const seed=readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"define('S06_OBSERVATIONS',"+JSON.stringify(observations)+");").replace("switch_theme('vibelab');","switch_theme('vibelab-v2');");
  const seeded=await json(seed);assert.ok(!seeded.error,JSON.stringify(seeded));
  // Fault injection exists only in this synthetic WordPress fixture.
  mkdirSync(join(directory,'wp-content/mu-plugins'),{recursive:true});writeFileSync(join(directory,'wp-content/mu-plugins/r714-health.php'),"<?php add_action('template_redirect',function(){if(($_SERVER['HTTP_X_R714_HEALTH_FAIL']??'')==='1'){status_header(503);echo 'fixture health failure';exit;}});");
  const approval={environment:'local-runtime',productionApproved:false,owner:randomBytes(16).toString('hex'),baselineSha256:'0'.repeat(64),requiredFreeBytes:300000000,sourceSha:prepared.manifest.sourceSha,controllerSourceSha:prepared.manifest.controller.sourceSha,payloadSha:payload,expectedParent:r6CssProfile.payload,manifestSha256:sha256(prepared.buffers['manifest.json']),receiverSha256:sha256(prepared.buffers['receiver.php'])};
  const call=async(mode,a=approval,extra='')=>{
   if(mode&&!extra&&a.environment==='local-runtime'&&a.productionApproved===false&&a.requiredFreeBytes>=268435456){
    const bootstrap=buildOperatorBootstrap(mode,a,{fixtureToken:token});
    return json("define('WP_DISABLE_FATAL_ERROR_HANDLER',true);define('FS_METHOD','direct');require '/wordpress/wp-load.php';wp_set_current_user(get_user_by('login','admin')->ID);"+bootstrap.code);
   }
   const encoded=Buffer.from(JSON.stringify(a)).toString('base64');
   return json("define('WP_DISABLE_FATAL_ERROR_HANDLER',true);define('FS_METHOD','direct');require '/wordpress/wp-load.php';define('VNE_ADAPTER_RUNTIME_TOKEN','"+token+"');wp_set_current_user(get_user_by('login','admin')->ID);$a=json_decode(base64_decode('"+encoded+"'),true);if(is_link('/adapter-fixture/inbox/receiver.php')||hash_file('sha256','/adapter-fixture/inbox/receiver.php')!==$a['receiverSha256'])throw new RuntimeException('External controller pin differs');require '/adapter-fixture/inbox/receiver.php';"+extra+(mode?"echo json_encode(vne_adapter_runtime_dispatch('"+mode+"',$a));":''));
  };
  const read=async path=>json("echo file_get_contents('"+path+"');");
  const initial=await call('inspect-state');assert.ok(!initial.error,JSON.stringify(initial));approval.baselineSha256=initial.baselineSha256;assert.equal(initial.phase,'BASELINE');checks.push('six-file adapter validates actual baseline theme/plugin/data/runtime before install');
  const privatePaths=await call(null,approval,"echo json_encode(array('outside'=>!str_starts_with(vne_adapter_path('/adapter-fixture/inbox'),ABSPATH)&&!str_starts_with(vne_adapter_path('/adapter-fixture/control'),ABSPATH),'publicCopy'=>file_exists(ABSPATH.'adapter-fixture/inbox/receiver.php')||file_exists(ABSPATH.'adapter-fixture/control/health-key.json')));");
  assert.deepEqual(privatePaths,{outside:true,publicCopy:false});
  const privateResponse=await localFetch('/adapter-fixture/inbox/receiver.php'),privateBody=await privateResponse.text();
  assert.doesNotMatch(privateBody,/function vne_adapter_|CLI required/);assert.notEqual(sha256(Buffer.from(privateBody)),approval.receiverSha256);assert.match(privateResponse.headers.get('content-type')??'',/text\/html/);
  const keyResponse=await localFetch('/adapter-fixture/control/health-key.json'),keyBody=await keyResponse.text();assert.ok(!keyBody.includes(keyHex));assert.match(keyResponse.headers.get('content-type')??'',/text\/html/);
  checks.push('private paths outside webroot; public HTML fallback serves neither controller nor key (HTTP '+privateResponse.status+'/'+keyResponse.status+')');
  const reject=async(name,mode,a,expected,extra='')=>{const r=await call(mode,a,extra);assert.ok(r.error?.includes(expected),name+': '+JSON.stringify(r));checks.push(name);};
  await reject('production runtime remains blocked','install',{...approval,environment:'production',productionApproved:true},'Production runtime is disabled');
  await reject('runtime capability guard','install',approval,'Theme update capability required','wp_set_current_user(0);');
  await reject('runtime baseline mismatch blocked','install',{...approval,baselineSha256:'a'.repeat(64)},'Approved runtime baseline differs');
  await reject('insufficient disk blocked before writer','install',{...approval,requiredFreeBytes:Number.MAX_SAFE_INTEGER},'Insufficient disk reserve');
  await reject('unapproved small disk reserve blocked','install',{...approval,requiredFreeBytes:1},'Disk reserve not approved');
  const foreignMaintenance='<?php $upgrading=0; /* fixture owner */';
  await php("file_put_contents('/wordpress/.maintenance',base64_decode('"+Buffer.from(foreignMaintenance).toString('base64')+"'));");
  await reject('existing maintenance preserved','install',approval,'Existing maintenance');
  assert.equal(await php("echo file_get_contents('/wordpress/.maintenance');"),foreignMaintenance);await php("unlink('/wordpress/.maintenance');");
  await php("file_put_contents('/adapter-fixture/control/receiver.lock','foreign owner');");
  await reject('foreign global lock preserved','install',approval,'Existing journal/lock');
  assert.equal(await php("echo file_get_contents('/adapter-fixture/control/receiver.lock');"),'foreign owner');await php("unlink('/adapter-fixture/control/receiver.lock');");
  const forged=await call(null,approval,"$in='/adapter-fixture/inbox/';copy($in.'theme.zip','/adapter-fixture/control/theme-original.zip');copy($in.'manifest.json','/adapter-fixture/control/manifest-original.json');$z=new ZipArchive();$z->open($in.'theme.zip');$name='vibelab-v2/index.php';$evil=$z->getFromName($name).'/* unreviewed PHP fixture */';$z->addFromString($name,$evil);$z->setCompressionName($name,ZipArchive::CM_STORE);$z->close();clearstatcache();$m=json_decode(file_get_contents($in.'manifest.json'),true);foreach($m['components']['theme']['files'] as &$f)if($f['path']===$name){$f['bytes']=strlen($evil);$f['sha256']=hash('sha256',$evil);}unset($f);$m['components']['theme']['bytes']=filesize($in.'theme.zip');$m['components']['theme']['sha256']=hash_file('sha256',$in.'theme.zip');foreach($m['files'] as &$f)if($f['path']==='theme.zip'){$f['bytes']=$m['components']['theme']['bytes'];$f['sha256']=$m['components']['theme']['sha256'];}unset($f);file_put_contents($in.'manifest.json',json_encode($m));echo json_encode(array('hash'=>hash_file('sha256',$in.'manifest.json')));");
  assert.ok(forged.hash,JSON.stringify(forged));await reject('forged PHP rejected despite updated ZIP manifest and external pin','install',{...approval,manifestSha256:forged.hash},'PHP/template changed beyond identity');
  await php("copy('/adapter-fixture/control/theme-original.zip','/adapter-fixture/inbox/theme.zip');copy('/adapter-fixture/control/manifest-original.json','/adapter-fixture/inbox/manifest.json');unlink('/adapter-fixture/control/theme-original.zip');unlink('/adapter-fixture/control/manifest-original.json');");
  assert.deepEqual((await call('inspect-state')).data,initial.data);
  progress('preflight guards and baseline');
  let active=approval,started=await call('install');assert.ok(!started.error,JSON.stringify(started));assert.equal(started.phase,'AWAIT_HEALTH');
  const journalPath=a=>'/adapter-fixture/control/journal-'+a.owner+'.json';
  const prove=async({a=active,fail=false,alter={},badSignature=false}={})=>{
   const j=await read(journalPath(a)),collected=await collectLocalHealthProof(a,j,{key:healthKey,fixtureToken:token,fixtureHttp503:fail});
   // Adversarial proofs below belong only to this fault-injection harness.
   const h={...collected.observation,...alter};
   const body=Buffer.from(JSON.stringify(h)),proof=Object.keys(alter).length||badSignature?{body:body.toString('base64'),signature:badSignature?'0'.repeat(64):createHmac('sha256',healthKey).update(body).digest('hex')}:collected.proof;
   await php("file_put_contents('/adapter-fixture/control/proof-"+a.owner+".json',base64_decode('"+Buffer.from(JSON.stringify(proof)).toString('base64')+"'));");return h;
  };
  // A timeout/retry reads state; it does not restart the writer or relabel a journal.
  const jBefore=await read(journalPath(active)),inspected=await call('inspect-state');assert.equal(inspected.phase,'AWAIT_HEALTH');assert.equal(inspected.lockPresent,true);assert.deepEqual(await read(journalPath(active)),jBefore);checks.push('inspect after simulated client timeout preserves journal/lock');
  const corrupt={...jBefore,baseline:{...jBefore.baseline,protected_options:'corrupted'}};
  await php("file_put_contents('"+journalPath(active)+"',base64_decode('"+Buffer.from(JSON.stringify(corrupt)).toString('base64')+"'));");
  await reject('journal baseline corruption cannot bypass pinned approval','finish',active,'Journal baseline differs');
  await php("file_put_contents('"+journalPath(active)+"',base64_decode('"+Buffer.from(JSON.stringify(jBefore)).toString('base64')+"'));");
  await prove({badSignature:true});await reject('unsigned arbitrary health rejected','finish',active,'Health signature invalid');
  await prove({alter:{observedAt:0}});await reject('stale health proof rejected','finish',active,'Health proof expired/stale');
  await prove({alter:{challenge:'old-challenge'}});await reject('replayed health challenge rejected','finish',active,'Health challenge/phase differs');
  await prove({alter:{payloadSha:'a'.repeat(40)}});await reject('health payload binding enforced','finish',active,'Health identity differs');
  await reject('foreign owner cannot finalize','finish',{...active,owner:'f'.repeat(32)},'Canonical path required');
  assert.equal((await read(journalPath(active))).phase,'AWAIT_HEALTH');
  const good=await prove();assert.equal(good.httpStatus,200);assert.equal(good.marker,prepared.manifest.themeMarker);
  const completed=await call('finish');assert.equal(completed.phase,'COMPLETE');assert.equal(await php("echo file_exists('/adapter-fixture/control/receiver.lock')?'yes':'no';"),'no');checks.push('native update plus fresh signed real HTTP health completes and cleans own lock');
  progress('native update and signed HTTP health');
  await call(null,active,"vne_adapter_upgrade_local('/adapter-fixture/inbox/previous-theme.zip');vne_adapter_maintenance_off();echo json_encode(true);");
  // Reset only fixture application code; immutable completed journal is preserved.
  await reject('completed journal cannot be relabeled','install',active,'Existing journal/lock');assert.equal((await read(journalPath(active))).phase,'COMPLETE');
  active={...approval,owner:randomBytes(16).toString('hex')};started=await call('install',active);assert.equal(started.phase,'AWAIT_HEALTH');
  const failed=await prove({fail:true});assert.equal(failed.httpStatus,503);
  const rolling=await call('finish',active);assert.equal(rolling.phase,'ROLLBACK_AWAIT_HEALTH');
  await prove({alter:{challenge:started.challenge}});await reject('pre-rollback proof cannot confirm rollback','confirm-rollback',active,'Health challenge/phase differs');
  const baselineHealth=await prove();assert.equal(baselineHealth.marker,'r52-v2-20261028');const rolled=await call('confirm-rollback',active);assert.equal(rolled.phase,'ROLLED_BACK');assert.deepEqual(await call(null,active,'echo json_encode(vne_adapter_data());'),initial.data);checks.push('real HTTP503 rolls theme back then requires fresh baseline HTTP proof; data unchanged');
  progress('rollback and fresh baseline HTTP health');
  active={...approval,owner:randomBytes(16).toString('hex')};assert.equal((await call('install',active)).phase,'AWAIT_HEALTH');
  await call(null,active,"update_option('vne_fixture_owner_edit','keep-owner-edit');echo json_encode(true);");
  const editedData=await call(null,active,'echo json_encode(vne_adapter_data());');
  await prove({fail:true});await reject('application data conflict stops rollback','finish',active,'Runtime data conflict');
  assert.equal((await read(journalPath(active))).phase,'CONFLICT_INSPECT');assert.deepEqual(await call(null,active,'echo json_encode(vne_adapter_data());'),editedData);checks.push('intentional owner option edit survives data conflict with lock retained');
  assert.equal(await php("echo file_exists('/adapter-fixture/control/receiver.lock')?'yes':'no';"),'yes');
  // Reset ONLY this deliberate fixture conflict; preserve its CONFLICT_INSPECT journal.
  await call(null,active,"delete_option('vne_fixture_owner_edit');vne_adapter_upgrade_local('/adapter-fixture/inbox/previous-theme.zip');vne_adapter_maintenance_off();unlink('/adapter-fixture/control/receiver.lock');echo json_encode(true);");
  // Native updater error is simulated inside this owned fixture, then inspected.
  active={...approval,owner:randomBytes(16).toString('hex')};
  await reject('native update error stops for inspection','install',active,'Native update failed',"add_filter('upgrader_pre_install',fn()=>new WP_Error('fixture_error','forced local updater error'));");
  assert.equal((await read(journalPath(active))).phase,'STOPPED_INSPECT');assert.equal(await php("echo file_exists('/adapter-fixture/control/receiver.lock')?'yes':'no';"),'yes');checks.push('failed native update retains journal and lock');
  // Remove ONLY the lock created by the deliberate error simulation to run final conflict case.
  await php("unlink('/adapter-fixture/control/receiver.lock');if(file_exists('/wordpress/.maintenance'))unlink('/wordpress/.maintenance');");
  active={...approval,owner:randomBytes(16).toString('hex')};assert.equal((await call('install',active)).phase,'AWAIT_HEALTH');
  await call(null,active,"$p=WP_CONTENT_DIR.'/themes/vibelab-v2/index.php';file_put_contents($p,file_get_contents($p).'/* concurrent owner edit */');echo json_encode(true);");
  await prove({fail:true});await reject('file conflict prevents rollback overwrite','finish',active,'Runtime file conflict');
  const conflict=await read(journalPath(active));assert.equal(conflict.phase,'CONFLICT_INSPECT');
  assert.equal(await php("echo file_exists('/adapter-fixture/control/receiver.lock')?'yes':'no';"),'yes');assert.ok((await php("echo file_get_contents('/wordpress/wp-content/themes/vibelab-v2/index.php');")).includes('concurrent owner edit'));checks.push('conflict preserves concurrent edit and own lock');
  assert.deepEqual(await call(null,active,'echo json_encode(vne_adapter_data());'),initial.data);checks.push('all five tables and protected options preserved through success rollback failure conflict');
  progress('native failure conflict data preservation and private HTTP');
  return checks;
 }finally{if(app)await app[Symbol.asyncDispose]();for(const path of kept)assert.equal(sha256(readFileSync(path)),before[path],'Existing local DB/config changed');}
}
