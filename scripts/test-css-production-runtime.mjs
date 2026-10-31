import assert from 'node:assert/strict';
import {cpSync,existsSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {randomBytes,createHmac} from 'node:crypto';
import {startCssRuntimeTestProcess} from './css-runtime-test-process.mjs';
import {prepareProductionRuntimeAdapter,prepareProductionInspectionAdapter,productionRuntimeProfile} from './release-r6-css-adapter.mjs';
import {buildProductionRuntimeBootstrap} from './r6-css-operator.mjs';
import {r6CssProfile} from './release-r6-css.mjs';
import {sha256} from './release-lib.mjs';

const restartOnly=process.argv.length===3&&process.argv[2]==='--restart-only';
assert.ok(process.argv.length===2||restartOnly,'Only optional --restart-only; no host/key/path overrides');
const testedPaths=['release-tools/r6-css-adapter.php','scripts/release-r6-css-adapter.mjs','scripts/r6-css-operator.mjs','scripts/test-css-production-runtime.mjs','scripts/css-runtime-test-process.mjs'],testedHashes=Object.fromEntries(testedPaths.map(path=>[path,sha256(readFileSync(path))]));
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/css-production-runtime-')),repo=join(fixture,'git'),checks=[],began=Date.now();
const git=(args,input)=>{const r=spawnSync('git',args,{cwd:repo,input,encoding:null,windowsHide:true,maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr?.toString());return r.stdout;};
const clone=spawnSync('git',['clone','--shared','--no-checkout',resolve('.'),repo],{encoding:'utf8',windowsHide:true});assert.equal(clone.status,0,clone.stderr);
git(['config','user.name','Runtime local fixture']);git(['config','user.email','fixture@example.invalid']);
// Generate the CSS source from the pinned R6 commit. A clean runner must not
// depend on a historical sample commit reachable only in a local object store.
git(['read-tree',r6CssProfile.source]);const cssPath='themes/vibelab-v2/style.css';
const css=Buffer.concat([git(['show',r6CssProfile.source+':'+cssPath]),Buffer.from('\nbody { --runtime-local-probe: candidate; }\n')]);
const cssBlob=git(['hash-object','-w','--stdin'],css).toString().trim();git(['update-index','--add','--cacheinfo','100644,'+cssBlob+','+cssPath]);
const source=git(['commit-tree',git(['write-tree']).toString().trim(),'-p',r6CssProfile.source,'-m','Synthetic CSS runtime source; never publish']).toString().trim();git(['read-tree','HEAD']);
const controllerBytes=readFileSync('release-tools/r6-css-adapter.php'),blob=git(['hash-object','-w','--stdin'],controllerBytes).toString().trim();
git(['update-index','--add','--cacheinfo','100644,'+blob+',release-tools/r6-css-adapter.php']);
const controller=git(['commit-tree',git(['write-tree']).toString().trim(),'-p','HEAD','-m','Synthetic runtime controller; never publish']).toString().trim();
const options={readGit:args=>git(args)},prepared=prepareProductionRuntimeAdapter(source,controller,options),old=prepareProductionInspectionAdapter(source,controller,options);
assert.equal(prepared.manifest.profile,productionRuntimeProfile);assert.equal(prepared.manifest.approval.deployAuthorized,false);
assert.deepEqual(Object.keys(prepared.buffers).sort(),['manifest.json','plugin.zip','previous-plugin.zip','previous-theme.zip','receiver.php','theme.zip']);
for(const name of ['theme.zip','previous-theme.zip','plugin.zip','previous-plugin.zip'])assert.ok(prepared.buffers[name].equals(old.buffers[name]));
checks.push('separate runtime profile retains six files and exact CSS-only application archives; manifest grants no deployment');
const rows=Object.entries(prepared.buffers).sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>'100644 blob '+git(['hash-object','-w','--stdin'],bytes).toString().trim()+'\t'+name+'\n').join('');
const payload=git(['commit-tree',git(['mktree'],rows).toString().trim(),'-p',r6CssProfile.payload,'-m','Synthetic runtime payload; never publish']).toString().trim();
const key=randomBytes(32),record={format:1,purpose:'r6-css-health-proof',target:'https://store.vneconomics.com',key:key.toString('hex')};
let a={environment:'production',profile:productionRuntimeProfile,protocol:'r6-css-production-proof-v1',productionApproved:true,requiredFreeBytes:300000000,sourceSha:source,controllerSourceSha:controller,payloadSha:payload,expectedParent:r6CssProfile.payload,manifestSha256:sha256(prepared.buffers['manifest.json']),receiverSha256:sha256(controllerBytes),owner:randomBytes(16).toString('hex'),baselineSha256:'0'.repeat(64),keyFingerprintSha256:sha256(key)};
for(const mode of ['inspect-state','install','import-health','finish','rollback','confirm-rollback']){
 const b=buildProductionRuntimeBootstrap(mode,a,mode==='import-health'?{body:'e30=',signature:'0'.repeat(64)}:undefined);
 assert.equal(b.requiresSeparateHostingApproval,true);assert.equal(b.automationEnabled,false);assert.match(b.command,/--user=1$/);assert.ok(!b.code.includes("'"));
}
for(const change of [{productionApproved:false},{environment:'local-runtime'},{profile:old.manifest.profile},{path:'/tmp/x'},{key:'secret'},{baselineSha256:'0'.repeat(64)+'\n'},{requiredFreeBytes:1}])assert.throws(()=>buildProductionRuntimeBootstrap('install',{...a,...change}));
assert.throws(()=>buildProductionRuntimeBootstrap('finish',a,{body:'e30=',signature:'0'.repeat(64)}));checks.push('bootstrap closes approval/modes/paths/keys and preserves separate hosting approval requirement');
const directory=join(fixture,'site'),control=join(fixture,'private'),token=randomBytes(32).toString('hex'),kept=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'].filter(existsSync),before=Object.fromEntries(kept.map(path=>[path,sha256(readFileSync(path))]));let app;
const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64');
try{
 mkdirSync(directory);mkdirSync(control);mkdirSync(join(fixture,'inbox'));mkdirSync(join(fixture,'clone-state'));writeFileSync(join(fixture,'.runtime-test-owned'),token);
 if(existsSync('.local/site/wp-load.php')){
  for(const name of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',name),join(directory,name),{recursive:true});
  for(const e of readdirSync('.local/site',{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.php')&&e.name!=='wp-config.php')cpSync(join('.local/site',e.name),join(directory,e.name));
 }
 app=await startCssRuntimeTestProcess({fixture,token});
 const run=async code=>{const r=await app.playground.run({code:'<?php clearstatcache();try{'+code+'}catch(Throwable $e){echo json_encode(array("error"=>$e->getMessage()));}'});assert.equal(r.exitCode,0,r.errors||r.text);assert.equal(r.errors,'',r.errors);return JSON.parse(r.text);};
 writeFileSync(join(directory,'.adapter-owned'),token);mkdirSync(join(directory,'adapter-stage'));
 for(const [name,bytes] of Object.entries(prepared.buffers))writeFileSync(join(directory,'adapter-stage',name),bytes);
 await run('mkdir("/adapter-fixture/clone.git/refs/heads",0700,true);foreach(scandir("/wordpress/adapter-stage") as $n)if($n!=="."&&$n!==".."){copy("/wordpress/adapter-stage/".$n,"/adapter-fixture/inbox/".$n);unlink("/wordpress/adapter-stage/".$n);}rmdir("/wordpress/adapter-stage");file_put_contents("/adapter-fixture/clone.git/HEAD","ref: refs/heads/release-production".chr(10));file_put_contents("/adapter-fixture/clone.git/refs/heads/release-production","'+payload+'".chr(10));define("FS_METHOD","direct");require "/wordpress/wp-load.php";require_once ABSPATH."wp-admin/includes/file.php";WP_Filesystem();foreach(array("plugin.zip"=>"plugins","previous-theme.zip"=>"themes") as $zip=>$dest){$r=unzip_file("/adapter-fixture/inbox/".$zip,WP_CONTENT_DIR."/".$dest."/");if(is_wp_error($r))throw new Exception($r->get_error_message());}echo json_encode(true);');
 const observations=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
 const seed=readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"define('S06_OBSERVATIONS',"+JSON.stringify(observations)+");").replace("switch_theme('vibelab');","switch_theme('vibelab-v2');");assert.ok(!(await run(seed)).error);console.log('PASS native WordPress seed');
 // Playground boots WordPress to check its DB before our request bootstrap runs.
 // Like WP-CLI, this owned fixture must be able to load WP for recovery while
 // maintenance remains present. Configure that BEFORE crashing; never remove or
 // relabel maintenance/journal during restart to make the test pass.
 const configPath=join(directory,'wp-config.php'),config=readFileSync(configPath,'utf8');assert.ok(config.startsWith('<?php'));
 const cliGuard='\n/* runtime fixture CLI recovery only */\nif(PHP_SAPI==="cli"){$GLOBALS["wp_filter"]["enable_maintenance_mode"][10][]=array("function"=>function(){return false;},"accepted_args"=>1);}\n';
 writeFileSync(configPath,config.replace('<?php','<?php'+cliGuard));const restartConfigHash=sha256(readFileSync(configPath));
 const boot='define("WP_DISABLE_FATAL_ERROR_HANDLER",true);define("FS_METHOD","direct");$GLOBALS["wp_filter"]["enable_maintenance_mode"][10][]=array("function"=>function(){return false;},"accepted_args"=>1);require "/wordpress/wp-load.php";define("VNE_ADAPTER_RUNTIME_TOKEN","'+token+'");wp_set_current_user(get_user_by("login","admin")->ID);require "/adapter-fixture/inbox/receiver.php";';
 // Owned fixture backend uses the SAME PHP transaction and real WP_Upgrader.
 // Production IO, native Plesk permissions/MySQL/quota and HTTP are not certified.
 const harness=`
function runtime_test_io($a){
 vne_adapter_write_scope();$local=$a;$local['environment']='local-runtime';$local['productionApproved']=false;
 $p=vne_adapter_verified_package($local);$base='/adapter-fixture/control/';
 $paths=array('journal'=>$base.'journal-'.$a['owner'].'.json','lock'=>$base.'receiver.lock','proof'=>$base.'proof-'.$a['owner'].'.json');
 $read=function($kind)use($paths){return file_exists($paths[$kind])?vne_adapter_json($paths[$kind]):null;};
 $save=function($kind,$value)use($paths){file_put_contents($paths[$kind],json_encode($value,JSON_THROW_ON_ERROR));};$maintenanceReceipt=null;
 return array(
 'acquire'=>function()use($base){$h=fopen($base.'test-mutex','c+');if(!flock($h,LOCK_EX|LOCK_NB)){fclose($h);throw new Exception('Test operation busy');}return function()use($h){flock($h,LOCK_UN);fclose($h);};},
 'read'=>$read,
 'preflight'=>function($phase)use($p,$local){vne_adapter_runtime_scope($local);vne_adapter_verified_package($local);if($phase==='mixed'){vne_adapter_css_mixed_files($p);return vne_adapter_data();}return vne_adapter_runtime_state($p,$phase==='baseline');},
 'begin'=>function($lock,$j)use($save,$paths){if(file_exists(ABSPATH.'.maintenance')||is_link(ABSPATH.'.maintenance'))throw new Exception('Existing maintenance');foreach(array('journal','lock') as $kind)if(file_exists($paths[$kind]))throw new Exception('Existing state');$save('lock',$lock);$save('journal',$j);if(($GLOBALS['runtime_test_fault']??'')==='after-install-intent')update_option('vne_r748_intent_edit','keep');},
 'save'=>function($j)use($save){$save('journal',$j);if($j['phase']==='ROLLING_BACK'&&($GLOBALS['runtime_test_fault']??'')==='after-rollback-intent')update_option('vne_r748_intent_edit','keep');},
 'upgrade'=>function($previous)use($p,$a,&$maintenanceReceipt){if(($GLOBALS['runtime_test_fault']??'')==='before-upgrade')throw new Exception('Injected native failure');$maintenanceReceipt=vne_adapter_css_native_upgrade($p['paths']['inbox'].'/'.($previous?'previous-theme':'theme').'.zip',$a['owner'],function(){vne_adapter_write_scope();});if(($GLOBALS['runtime_test_fault']??'')==='crash-after-upgrade'){file_put_contents('/adapter-fixture/control/test-crash-point',$a['owner']);while(true)usleep(100000);}if(($GLOBALS['runtime_test_fault']??'')==='after-upgrade')throw new Exception('Injected lost update receipt');},
 'maintenanceOff'=>function()use(&$maintenanceReceipt){vne_adapter_css_end_maintenance($maintenanceReceipt);$maintenanceReceipt=null;},
 'health'=>function($j,$proof)use($a,$p){if(!is_array($proof))throw new Exception('Signed runtime proof missing');$key=json_decode(file_get_contents('/adapter-fixture/control/test-key.json'),true);return vne_adapter_verify_production_proof(vne_adapter_css_runtime_identity($a),$j,$proof,$key,hash('sha256',$p['maps'][$j['phase']==='ROLLBACK_AWAIT_HEALTH'?'previous-theme':'theme']['vibelab-v2/style.css']))['healthPassed'];},
 'storeProof'=>function($proof,$j)use($save){$save('proof',$proof);},
 'releaseLogical'=>function($lock)use($read,$paths){if($read('lock')!==$lock)throw new Exception('Lock changed');unlink($paths['lock']);}
 );
}`;
 writeFileSync(join(control,'harness.php'),'<?php '+harness);writeFileSync(join(control,'test-key.json'),JSON.stringify(record));
 const call=(mode,{approval=a,proof,extra=''}={})=>run(boot+'require "/adapter-fixture/control/harness.php";$a=json_decode(base64_decode("'+encode(approval)+'"),true);'+extra+'echo json_encode(vne_adapter_css_transaction("'+mode+'",$a,runtime_test_io($a),'+(proof?'json_decode(base64_decode("'+encode(proof)+'"),true)':'null')+'));');
 const initial=await run(boot+'echo json_encode(vne_adapter_data());');assert.ok(!initial.error,JSON.stringify(initial));a.baselineSha256=sha256(Buffer.from(JSON.stringify(initial)));
 const ok=async promise=>{const result=await promise;assert.ok(!result.error,JSON.stringify(result));return result;};
 const reject=async(promise,pattern)=>{const result=await promise;assert.match(result.error??'',pattern,JSON.stringify(result));return result;};
 const journal=()=>JSON.parse(readFileSync(join(control,'journal-'+a.owner+'.json'))),proofFor=(j,{fail=false,badSignature=false,alter={}}={})=>{
  const css=prepared.manifest.components[j.phase==='ROLLBACK_AWAIT_HEALTH'?'previous-theme':'theme'].files.find(f=>f.path==='vibelab-v2/style.css').sha256;
  const h={...Object.fromEntries(['protocol','owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','receiverSha256','baselineSha256','keyFingerprintSha256'].map(k=>[k,a[k]])),phase:j.phase,challenge:j.challenge,observedAt:Math.floor(Date.now()/1000),url:record.target+'/',httpStatus:fail?503:200,cssStatus:200,marker:j.phase==='ROLLBACK_AWAIT_HEALTH'?'r52-v2-20261028':'r6-css-'+source.slice(0,12),cssSha256:css,...alter};
  const body=Buffer.from(JSON.stringify(h));return {body:body.toString('base64'),signature:badSignature?'0'.repeat(64):createHmac('sha256',key).update(body).digest('hex')};
 };
 const reset=async()=>{await ok(run(boot+'vne_adapter_upgrade_local("/adapter-fixture/inbox/previous-theme.zip");vne_adapter_maintenance_off();echo json_encode(true);'));a={...a,owner:randomBytes(16).toString('hex')};};
 let j;
 if(!restartOnly){
 assert.equal((await ok(call('inspect-state'))).phase,'BASELINE');
 await reject(call('install',{approval:{...a,productionApproved:false}}),/approval differs/);
 await reject(call('install',{approval:{...a,baselineSha256:'f'.repeat(64)}}),/baseline differs/);
 await reject(call('install',{extra:'wp_set_current_user(0);'}),/capability/);
 assert.equal(existsSync(join(control,'receiver.lock')),false);checks.push('actual WordPress data baseline capability and closed PHP approval fail before application mutation');
 writeFileSync(join(control,'receiver.lock'),'{}');await reject(call('install'),/Foreign runtime lock/);assert.equal(readFileSync(join(control,'receiver.lock'),'utf8'),'{}');
 // Only synthetic fixture state created by this test is removed here.
 await run('unlink("/adapter-fixture/control/receiver.lock");echo json_encode(true);');checks.push('foreign logical lock remains unchanged');
 const foreignMaintenance='<?php $upgrading=0; /* owned test foreign maintenance */';await run('file_put_contents("/wordpress/.maintenance",base64_decode("'+Buffer.from(foreignMaintenance).toString('base64')+'"));echo json_encode(true);');await reject(call('install'),/Existing maintenance/);assert.equal(readFileSync(join(directory,'.maintenance'),'utf8'),foreignMaintenance);await run('unlink("/wordpress/.maintenance");echo json_encode(true);');checks.push('existing maintenance preserved before native update');
 await reject(run(boot+'$r=vne_adapter_css_native_upgrade("/adapter-fixture/inbox/previous-theme.zip","'+a.owner+'",function(){vne_adapter_write_scope();});file_put_contents(ABSPATH.".maintenance",base64_decode("'+Buffer.from(foreignMaintenance).toString('base64')+'"));vne_adapter_css_end_maintenance($r);echo json_encode(true);'),/Maintenance changed/);
 assert.equal(readFileSync(join(directory,'.maintenance'),'utf8'),foreignMaintenance);await run('unlink("/wordpress/.maintenance");echo json_encode(true);');checks.push('shared native maintenance cleanup refuses replacement bytes and leaves the foreign file');
 j=await ok(call('install'));assert.equal(j.phase,'AWAIT_HEALTH');assert.deepEqual(await ok(call('install')),j);checks.push('native WordPress theme update enters health gate; install retry does not rewrite challenge');
 const unchanged=readFileSync(join(control,'journal-'+a.owner+'.json'));
 const logical=join(control,'receiver.lock'),logicalBytes=readFileSync(logical),foreignLock=JSON.parse(logicalBytes);foreignLock.approval.owner='f'.repeat(32);writeFileSync(logical,JSON.stringify(foreignLock));await reject(call('finish'),/lock ownership differs/);assert.equal(readFileSync(logical,'utf8'),JSON.stringify(foreignLock));writeFileSync(logical,logicalBytes);checks.push('changed lock ownership stops finalization and preserves conflict');
 await reject(call('import-health',{proof:proofFor(j,{badSignature:true})}),/signature/);
 await reject(call('import-health',{proof:proofFor(j,{alter:{challenge:'e'.repeat(64)}})}),/challenge/);
 assert.ok(readFileSync(join(control,'journal-'+a.owner+'.json')).equals(unchanged));checks.push('invalid signature or stale challenge preserves journal and active theme');
 assert.equal((await ok(call('import-health',{proof:proofFor(j)}))).healthPassed,true);
 assert.equal((await ok(call('finish'))).phase,'COMPLETE');assert.equal(existsSync(join(control,'receiver.lock')),false);assert.equal((await ok(call('finish'))).phase,'COMPLETE');checks.push('authentic production-protocol proof completes transaction and terminal retry is idempotent');console.log('PASS native install proof finish retry');
 await reset();j=await ok(call('install'));assert.equal((await ok(call('import-health',{proof:proofFor(j,{fail:true})}))).healthPassed,false);
 j=await ok(call('finish'));assert.equal(j.phase,'ROLLBACK_AWAIT_HEALTH');assert.deepEqual(await ok(call('rollback')),j);await reject(call('confirm-rollback'),/challenge\/phase/);
 await ok(call('import-health',{proof:proofFor(j)}));assert.equal((await ok(call('confirm-rollback'))).phase,'ROLLED_BACK');assert.equal((await ok(call('confirm-rollback'))).phase,'ROLLED_BACK');checks.push('signed failed HTTP health triggers native rollback and requires a fresh baseline proof');console.log('PASS native failed health rollback confirmation');
 for(const fault of ['before-upgrade','after-upgrade']){
  await reset();await reject(call('install',{extra:'$GLOBALS["runtime_test_fault"]="'+fault+'";'}),/Injected/);assert.equal(journal().phase,'STOPPED_INSPECT');assert.ok(existsSync(join(control,'receiver.lock')));
  await reject(call('install'),/Interrupted install/);j=await ok(call('rollback'));assert.equal(j.phase,'ROLLBACK_AWAIT_HEALTH');await ok(call('import-health',{proof:proofFor(j)}));assert.equal((await ok(call('confirm-rollback'))).phase,'ROLLED_BACK');
 }
 checks.push('native failure before mutation and lost receipt after mutation preserve lock; explicit rollback recovers both');
 for(const intent of ['install','rollback']){
  await reset();if(intent==='rollback')await ok(call('install'));
  const map=prepared.manifest.components[intent==='install'?'previous-theme':'theme'].files;
  await reject(call(intent,{extra:'$GLOBALS["runtime_test_fault"]="after-'+intent+'-intent";'}),/data changed before native update/);
  assert.equal(journal().phase,'STOPPED_INSPECT');assert.ok(existsSync(join(control,'receiver.lock')));assert.equal(existsSync(join(directory,'.maintenance')),false);
  for(const f of map)assert.equal(sha256(readFileSync(join(directory,'wp-content/themes',f.path))),f.sha256,'Theme mutated after intent conflict: '+f.path);
  assert.equal(await run(boot+'echo json_encode(get_option("vne_r748_intent_edit"));'),'keep');await reject(call('rollback'),/data baseline differs/);
  // Remove only the injected option from this isolated disposable test database;
  // production recovery never removes owner edits or restores a database.
  await ok(run(boot+'delete_option("vne_r748_intent_edit");echo json_encode(true);'));j=await ok(call('rollback'));await ok(call('import-health',{proof:proofFor(j)}));assert.equal((await ok(call('confirm-rollback'))).phase,'ROLLED_BACK');
  checks.push(intent+' data drift after durable intent blocks native mutation and preserves edit lock and journal');
 }
 console.log('PASS install and rollback data drift after intent');
 }
 const processRestarts=[];
 for(const interruptedMode of ['install','rollback']){
  await reset();if(interruptedMode==='rollback')await ok(call('install'));
  const oldPid=app.pid,stalled=call(interruptedMode,{extra:'$GLOBALS["runtime_test_fault"]="crash-after-upgrade";'}).then(value=>({value}),error=>({error:error.message}));
  const marker=join(control,'test-crash-point'),deadline=Date.now()+60000;
  while(!existsSync(marker)&&Date.now()<deadline)await new Promise(done=>setTimeout(done,100));
  assert.ok(existsSync(marker),'Native crash point was not reached');assert.equal(readFileSync(marker,'utf8'),a.owner);
  const pendingJournal=readFileSync(join(control,'journal-'+a.owner+'.json'));assert.equal(journal().phase,interruptedMode==='install'?'INSTALLING':'ROLLING_BACK');
  assert.ok(existsSync(join(directory,'.maintenance')));await app.crash();assert.ok((await stalled).error,'Killed PHP request unexpectedly returned');
  app=await startCssRuntimeTestProcess({fixture,token});assert.notEqual(app.pid,oldPid);assert.equal(sha256(readFileSync(configPath)),restartConfigHash,'Restart rewrote fixture config');assert.ok(readFileSync(join(control,'journal-'+a.owner+'.json')).equals(pendingJournal),'Restart rewrote journal');
  assert.equal((await ok(call('inspect-state'))).phase,interruptedMode==='install'?'INSTALLING':'ROLLING_BACK');await reject(call('install'),/Interrupted install/);
  j=await ok(call('rollback'));assert.equal(j.phase,'ROLLBACK_AWAIT_HEALTH');await ok(call('import-health',{proof:proofFor(j)}));assert.equal((await ok(call('confirm-rollback'))).phase,'ROLLED_BACK');assert.equal(existsSync(join(directory,'.maintenance')),false);
  processRestarts.push({interruptedMode,oldPid,newPid:app.pid,phasePreserved:true,recovered:true});
  await run('unlink("/adapter-fixture/control/test-crash-point");echo json_encode(true);');
  checks.push('hard-stop after native '+interruptedMode+' preserves disk journal lock maintenance and recovers in a new Node/PHP process');
 }
 console.log('PASS hard process stops and disk-backed recovery');
 if(!restartOnly){
 await reset();j=await ok(call('install'));const index=join(directory,'wp-content/themes/vibelab-v2/index.php'),original=readFileSync(index);writeFileSync(index,Buffer.concat([original,Buffer.from('/* synthetic owner edit */')]));
 await reject(call('rollback'),/Runtime file conflict/);assert.ok(readFileSync(index).includes(Buffer.from('synthetic owner edit')));assert.equal(journal().phase,'AWAIT_HEALTH');checks.push('concurrent theme edit blocks rollback without overwriting the edit or relabeling journal');
 writeFileSync(index,original);await ok(run(boot+'update_option("vne_r747_owner_edit","keep");echo json_encode(true);'));
 await reject(call('rollback'),/data baseline differs/);assert.equal(journal().phase,'AWAIT_HEALTH');assert.ok(existsSync(join(control,'receiver.lock')));assert.equal(await run(boot+'echo json_encode(get_option("vne_r747_owner_edit"));'),'keep');checks.push('protected data drift blocks recovery and preserves persisted owner edit; no database restore');
 }
 const blocked=await run(boot+'$a=json_decode(base64_decode("'+encode(a)+'"),true);echo json_encode(vne_adapter_production_runtime_dispatch("install",$a));');assert.match(blocked.error,/Fixture token refused/);checks.push('actual production entry refuses fixture credentials rather than promoting the harness');
 // Production builder code is parsed/executed only against local paths: it must
 // stop at the canonical production root, before delivered code can run.
 await reject(run('define("ABSPATH","/wordpress/");function current_user_can(){return true;}$GLOBALS["wpdb"]=new stdClass();'+buildProductionRuntimeBootstrap('install',a).code),/Production bootstrap path differs/);
 checks.push('production bootstrap stops at absent canonical production path; no host contact');
 for(const path of testedPaths)assert.equal(sha256(readFileSync(path)),testedHashes[path],'Source changed during test: '+path);
 console.log(JSON.stringify({status:'PASS_CSS_PRODUCTION_RUNTIME_LOCAL',restartOnly,checks:checks.length,cases:checks,processRestarts,fixtureCliMaintenanceBypass:true,elapsedMs:Date.now()-began,nativeWordPressUpgrader:true,productionProtocolSyntheticProofs:true,productionIoPositiveWriteTested:false,mariaDbTested:false,hostingContacted:false,realKeyCreated:false,sourceHashes:testedHashes}));
}finally{
 key.fill(0);record.key='';if(app)await app[Symbol.asyncDispose]();for(const path of kept)assert.equal(sha256(readFileSync(path)),before[path],'Existing local config/database changed');
}
