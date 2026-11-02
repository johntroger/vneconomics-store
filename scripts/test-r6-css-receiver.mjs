import assert from 'node:assert/strict';
import {cpSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {startSite} from './local-runtime.mjs';
import {sha256} from './release-lib.mjs';
import {r6CssProfile} from './release-r6-css.mjs';

export async function exerciseCssReceiver({fixture,prepared}){
 const dir=join(fixture,'receiver-wordpress'),checks=[],token=randomBytes(32).toString('hex');let app;
 const kept=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'].filter(existsSync),before=Object.fromEntries(kept.map(path=>[path,sha256(readFileSync(path))]));
 const library=readFileSync('release-tools/r6-css-fixture-receiver.php'),receiverHash=sha256(library);
 mkdirSync(dir,{recursive:true});
 try{
  if(existsSync('.local/site/wp-load.php')){
   for(const name of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',name),join(dir,name),{recursive:true});
   for(const entry of readdirSync('.local/site',{withFileTypes:true}))if(entry.isFile()&&entry.name.endsWith('.php')&&entry.name!=='wp-config.php')cpSync(join('.local/site',entry.name),join(dir,entry.name));
  }
  app=await startSite(dir,19481,{workers:1});
  let phpCall=0;
  const php=async code=>{phpCall++;let r;const wrapped=code.replace('<?php',"<?php clearstatcache();register_shutdown_function(function(){$e=error_get_last();if($e)file_put_contents('/wordpress/r711-last-error.json',json_encode($e));});try{\n")+"\n}catch(Throwable $e){echo json_encode(array('receiverException'=>$e->getMessage(),'file'=>$e->getFile(),'line'=>$e->getLine()));exit(42);}";
   try{r=await app.playground.run({code:wrapped});}catch(error){const diagnostic=existsSync(join(dir,'r711-last-error.json'))?readFileSync(join(dir,'r711-last-error.json'),'utf8'):String(error.response?.errors||error.response?.text||error.message).slice(-4000);throw new Error('Receiver PHP call '+phpCall+': '+diagnostic);}assert.equal(r.exitCode,0,r.errors||r.text);assert.equal(r.errors,'',r.errors);return r.text;};
  writeFileSync(join(dir,'.r711-owned-fixture'),token);writeFileSync(join(dir,'r711-library.php'),library);
  mkdirSync(join(dir,'r711-stage'));for(const [name,bytes] of Object.entries(prepared.buffers))writeFileSync(join(dir,'r711-stage',name),bytes);
  await php("<?php mkdir('/r711-private',0700);mkdir('/r711-private/inbox-original',0700);foreach(array('manifest.json','theme.zip','plugin.zip','previous-theme.zip','previous-plugin.zip') as $name){copy('/wordpress/r711-stage/'.$name,'/r711-private/inbox-original/'.$name);unlink('/wordpress/r711-stage/'.$name);}rmdir('/wordpress/r711-stage');copy('/wordpress/r711-library.php','/r711-private/receiver.php');unlink('/wordpress/r711-library.php');define('FS_METHOD','direct');require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/file.php';WP_Filesystem();foreach(array('plugin.zip'=>'plugins','previous-theme.zip'=>'themes') as $zip=>$dest){$r=unzip_file('/r711-private/inbox-original/'.$zip,WP_CONTENT_DIR.'/'.$dest.'/');if(is_wp_error($r))throw new Exception($r->get_error_message());}");
  const obs=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
  const seed=readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(obs)+");").replace("switch_theme('vibelab');","switch_theme('vibelab-v2');");JSON.parse(await php(seed));
  const git=(args,input)=>{const r=spawnSync('git',args,{cwd:join(fixture,'git'),input,encoding:null,windowsHide:true});assert.equal(r.status,0,r.stderr?.toString());return r.stdout.toString().trim();};
  const rows=Object.entries(prepared.buffers).sort(([a],[b])=>a.localeCompare(b)).map(([name,data])=>'100644 blob '+git(['hash-object','-w','--stdin'],data)+'\t'+name+'\n').join('');
  const tree=git(['mktree'],rows),payload=git(['commit-tree',tree,'-p',r6CssProfile.payload,'-m','Local receiver fixture; never publish']);
  const verified=spawnSync(process.execPath,[resolve('scripts/validate-payload-commit.mjs'),payload,prepared.manifest.sourceSha,r6CssProfile.payload,r6CssProfile.id],{cwd:join(fixture,'git'),encoding:'utf8',windowsHide:true});assert.equal(verified.status,0,verified.stderr);
  const approval={environment:'local-fixture',productionApproved:false,owner:randomBytes(16).toString('hex'),sourceSha:prepared.manifest.sourceSha,payloadSha:payload,manifestSha256:sha256(prepared.buffers['manifest.json']),receiverSha256:receiverHash};
  const boot="<?php define('WP_DISABLE_FATAL_ERROR_HANDLER',true);define('FS_METHOD','direct');require '/wordpress/wp-load.php';define('VNE_R711_FIXTURE_TOKEN','"+token+"');wp_set_current_user(get_user_by('login','admin')->ID);require '/r711-private/receiver.php';$a=json_decode('"+JSON.stringify(approval)+"',true);$in='/r711-private/inbox-original';";
  const call=async code=>JSON.parse(await php(boot+code));
  const initial=await call('echo json_encode(vne_css_state());');
  const rejects=await call(readFileSync('scripts/fixtures/r711-negative-cases.php','utf8').replace('<?php',''));
  checks.push(...rejects);assert.deepEqual(await call('echo json_encode(vne_css_state());'),initial);checks.push('negative preflight cases preserve application data/options');console.log('PASS receiver negative preflight '+rejects.length+' cases; state preserved');
  const started=await call('echo json_encode(vne_css_install_fixture($in,$a));');assert.equal(started.phase,'AWAIT_HEALTH');
  const health=async()=>{const page=await fetch('http://127.0.0.1:19481/',{signal:AbortSignal.timeout(30000)}),text=await page.text();const css=await fetch('http://127.0.0.1:19481/wp-content/themes/vibelab-v2/style.css',{signal:AbortSignal.timeout(30000)});return {httpStatus:page.status,marker:text.match(/name="vibelab-release" content="([^"]+)"/)?.[1],cssSha256:sha256(Buffer.from(await css.arrayBuffer()))};};
  const good=await health();assert.equal(good.marker,prepared.manifest.themeMarker);
  const complete=await call("echo json_encode(vne_css_finish_fixture($in,$a,json_decode('"+JSON.stringify(good)+"',true)));");assert.equal(complete.phase,'COMPLETE');
  const closed=await call('[$jp,$lp]=vne_css_paths($a);echo json_encode(array("lock"=>file_exists($lp),"phase"=>vne_css_json($jp)["phase"]));');assert.deepEqual(closed,{lock:false,phase:'COMPLETE'});checks.push('successful native update plus real HTTP health completes and removes own lock');
  await call("vne_css_upgrade($in.'/previous-theme.zip');vne_css_end_maintenance();echo json_encode(true);");
  const rollbackOwner=randomBytes(16).toString('hex'),rollbackPrefix="$a['owner']='"+rollbackOwner+"';";
  await call(rollbackPrefix+'echo json_encode(vne_css_install_fixture($in,$a));');
  const badHealth={...await health(),marker:'DELIBERATE-HEALTH-MISMATCH'};
  const rolling=await call(rollbackPrefix+"echo json_encode(vne_css_finish_fixture($in,$a,json_decode('"+JSON.stringify(badHealth)+"',true)));");assert.equal(rolling.phase,'ROLLBACK_AWAIT_HEALTH');
  const restoredHealth=await health();assert.equal(restoredHealth.marker,'r52-v2-20261028');
  const rolled=await call(rollbackPrefix+"echo json_encode(vne_css_confirm_rollback_fixture($in,$a,json_decode('"+JSON.stringify(restoredHealth)+"',true)));");assert.equal(rolled.phase,'ROLLED_BACK');assert.deepEqual(await call('echo json_encode(vne_css_state());'),initial);checks.push('failed health rolls theme back and confirms baseline HTTP/data without DB restore');
  const conflictOwner=randomBytes(16).toString('hex'),conflictPrefix="$a['owner']='"+conflictOwner+"';";
  await call(conflictPrefix+'echo json_encode(vne_css_install_fixture($in,$a));');
  const conflict=await call(conflictPrefix+"$path=WP_CONTENT_DIR.'/themes/vibelab-v2/index.php';file_put_contents($path,file_get_contents($path).'/* concurrent owner edit */');try{vne_css_finish_fixture($in,$a,array('httpStatus'=>500));throw new Exception('Expected conflict');}catch(RuntimeException $e){[$jp,$lp]=vne_css_paths($a);echo json_encode(array('phase'=>vne_css_json($jp)['phase'],'lock'=>file_exists($lp),'edit'=>str_contains(file_get_contents($path),'concurrent owner edit')));}");
  assert.deepEqual(conflict,{phase:'CONFLICT_INSPECT',lock:true,edit:true});checks.push('concurrent file conflict stops rollback and preserves edit/lock');
  const privateResponse=await fetch('http://127.0.0.1:19481/r711-private/receiver.php',{signal:AbortSignal.timeout(30000)});assert.equal(privateResponse.status,404);assert.doesNotMatch(await privateResponse.text(),/function vne_css_/);checks.push('private inbox/controller unavailable through HTTP');
  assert.deepEqual(await call('echo json_encode(vne_css_state());'),initial);checks.push('all five tables and protected options unchanged through success/rollback/conflict');
  return checks;
 }finally{
  if(app)await app[Symbol.asyncDispose]();for(const path of kept)assert.equal(sha256(readFileSync(path)),before[path],'Existing local DB/config changed');
 }
}
