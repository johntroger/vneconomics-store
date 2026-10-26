import assert from 'node:assert/strict';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {sha256} from './release-lib.mjs';
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s15-active-'));
const runtime=resolve('.local/php-8.3.36-nts-x64'),php=join(runtime,'php.exe'),helper=resolve('scripts/fixtures/s15-live-rehearsal.php');
const base='http://127.0.0.1:19416',slash=p=>p.replaceAll('\\','/'),quote=s=>"'"+s.replaceAll("'","''")+"'";
const protectedPaths=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'];const before=protectedPaths.map(p=>sha256(readFileSync(p)));
const checks=[],visits=[];let server,exitPromise,logs='';const check=(v,n)=>{assert.ok(v,n);checks.push(n);};
const ini=join(fixture,'php.ini'),load='require '+JSON.stringify(slash(join(fixture,'wp-load.php')))+';',library="define('S15_LIVE_TEST',true);require "+JSON.stringify(slash(helper))+';';
function cli(code,name){const file=join(fixture,name+'.php');writeFileSync(file,"<?php $_SERVER['HTTP_HOST']='127.0.0.1:19416';$_SERVER['SERVER_NAME']='127.0.0.1';$_SERVER['REQUEST_METHOD']='GET';$_SERVER['REQUEST_URI']='/';$_SERVER['SERVER_PROTOCOL']='HTTP/1.1';"+code);const p=spawnSync(php,['-c',ini,file],{cwd:fixture,encoding:'utf8',windowsHide:true,timeout:120000});const diagnostic=existsSync(join(fixture,'php-errors.log'))?readFileSync(join(fixture,'php-errors.log'),'utf8').slice(-6000):'';assert.equal(p.status,0,name+' '+p.stderr+' '+diagnostic);return p.stdout.trim();}
function expand(zip,dest){const p=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath '+quote(zip)+' -DestinationPath '+quote(dest)],{encoding:'utf8',windowsHide:true,timeout:120000});assert.equal(p.status,0,p.stderr);}
async function visit(phase,token){const r=await fetch(base+'/',{headers:token?{'X-S15-Theme-Fault':token}:{},signal:AbortSignal.timeout(30000)});const body=await r.text();visits.push({phase,status:r.status});return {status:r.status,body};}
try {
 for(const d of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',d),join(fixture,d),{recursive:true});
 for(const e of readdirSync('.local/site',{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.php')&&e.name!=='wp-config.php')cpSync(join('.local/site',e.name),join(fixture,e.name));
 for(const d of ['database','mu-plugins','plugins','themes'])mkdirSync(join(fixture,'wp-content',d),{recursive:true});
 for(const kind of ['plugin','theme']){const slug=kind==='plugin'?'vne-library-core-0.4.2.zip':'vibelab-0.7.0.zip';expand(resolve('artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752',slug),join(fixture,'wp-content',kind==='plugin'?'plugins':'themes'));}
 expand(resolve('node_modules/@wp-playground/cli/sqlite-database-integration.zip'),join(fixture,'sqlite-package'));
 const sqlite=join(fixture,'wp-content/plugins/sqlite-database-integration');cpSync(join(fixture,'sqlite-package/plugin-sqlite-database-integration'),sqlite,{recursive:true});
 writeFileSync(join(fixture,'wp-content/db.php'),readFileSync(join(sqlite,'db.copy'),'utf8').replaceAll('{SQLITE_IMPLEMENTATION_FOLDER_PATH}',slash(sqlite)).replaceAll('{SQLITE_PLUGIN}','sqlite-database-integration/load.php'));
 writeFileSync(join(fixture,'wp-content/mu-plugins/mail-guard.php'),"<?php add_filter('pre_wp_mail','__return_false');add_filter('pre_http_request',function(){return new WP_Error('test_no_network','Blocked in fixture');},PHP_INT_MAX);");
 writeFileSync(ini,'extension_dir="'+slash(join(runtime,'ext'))+'"\nextension=pdo_sqlite\nextension=sqlite3\nextension=intl\nextension=mbstring\nextension=openssl\nextension=curl\nextension=zip\ndisplay_errors=0\nlog_errors=1\nerror_log="'+slash(join(fixture,'php-errors.log'))+'"\nmemory_limit=512M\n');
 writeFileSync(join(fixture,'wp-config.php'),`<?php
$table_prefix='wp_';define('DB_NAME','wordpress');define('DB_USER','wordpress');define('DB_PASSWORD','');define('DB_HOST','localhost');define('DB_CHARSET','utf8');define('DB_COLLATE','');
define('DB_ENGINE','sqlite');define('DB_PATH',${JSON.stringify(slash(join(fixture,'wp-content/database/.ht.sqlite')))});
define('WP_HOME',${JSON.stringify(base)});define('WP_SITEURL',${JSON.stringify(base)});define('AUTH_KEY',${JSON.stringify(randomBytes(32).toString('hex'))});
define('WP_CONTENT_DIR',${JSON.stringify(slash(join(fixture,'wp-content')))});define('WP_PLUGIN_DIR',${JSON.stringify(slash(join(fixture,'wp-content/plugins')))});define('WPMU_PLUGIN_DIR',${JSON.stringify(slash(join(fixture,'wp-content/mu-plugins')))});
define('DISABLE_WP_CRON',true);define('WP_HTTP_BLOCK_EXTERNAL',true);define('WP_DEBUG',false);define('WP_DEBUG_DISPLAY',false);
if(!defined('ABSPATH'))define('ABSPATH',${JSON.stringify(slash(fixture)+'/')});require_once ABSPATH.'wp-settings.php';
`);
 if(process.argv.includes('--diagnose-only')){
  const diagnostic=cli("define('WP_INSTALLING',true);"+load+"require_once ABSPATH.'wp-admin/includes/plugin.php';wp_cache_flush();$entries=array();foreach(scandir(WP_PLUGIN_DIR) as $n){if($n==='.'||$n==='..')continue;$p=WP_PLUGIN_DIR.'/'.$n;$entries[$n]=array('isDir'=>is_dir($p),'readable'=>is_readable($p),'entries'=>is_dir($p)?scandir($p):array());}echo json_encode(array('plugins'=>get_plugins(),'filesystem'=>$entries,'functionFile'=>(new ReflectionFunction('get_plugins'))->getFileName()));",'diagnostic');console.log(diagnostic);process.exitCode=0;
 }else{
 cli("define('WP_INSTALLING',true);"+load+"require_once ABSPATH.'wp-admin/includes/upgrade.php';wp_install('S15 active fixture','admin','admin@example.test',0,'',"+JSON.stringify(randomBytes(24).toString('hex'))+");",'install');
 const boot=JSON.parse(cli(load+"require_once ABSPATH.'wp-admin/includes/plugin.php';wp_clean_plugins_cache(false);$r=activate_plugin('vne-library-core/vne-library-core.php');update_option('stylesheet','vibelab');update_option('template','vibelab');echo json_encode(array('error'=>is_wp_error($r)?$r->get_error_message():null,'active'=>get_option('active_plugins'),'pluginDir'=>WP_PLUGIN_DIR,'found'=>array_keys(get_plugins()),'directoryEntries'=>scandir(WP_PLUGIN_DIR),'header'=>get_plugin_data(WP_PLUGIN_DIR.'/vne-library-core/vne-library-core.php',false,false)));",'activate'));
 assert.equal(boot.error,null,JSON.stringify(boot));check(boot.active.includes('vne-library-core/vne-library-core.php'),'native fixture VNE activated');
 const activation=JSON.parse(cli(load+library+"$db=new SQLite3(DB_PATH,SQLITE3_OPEN_READONLY);$r=s15_live_activation(fn()=>$db->querySingle(\"SELECT option_value FROM wp_options WHERE option_name='active_plugins'\"));$db->close();echo json_encode($r);",'activation-failure'));
 for(const [k,v]of Object.entries(activation))if(k!=='themeAttempted')check(v===true,'activation '+k);check(activation.themeAttempted===false,'activation failure does not attempt theme');
 const id=randomBytes(16).toString('hex'),work=join(fixture,'s15-live-'+id),token=randomBytes(16).toString('hex');mkdirSync(work);
 const workPhp=JSON.stringify(slash(work)),themePhp=JSON.stringify(slash(join(fixture,'wp-content/themes/vibelab')));
 const prepare=cli(load+library+'$live='+themePhp+';$source=array();foreach(s15_live_inventory($live) as $name=>$hash){$source[$name]=file_get_contents($live."/".$name);}s15_live_write_tree('+workPhp+'."/ready",$source);file_put_contents('+workPhp+'."/expected.json",json_encode(s15_live_source_hashes($source)));echo count($source);','prepare');check(prepare==='36','complete recovery theme prepared');
 const router=join(fixture,'router.php');writeFileSync(router,"<?php $path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));if(str_contains($path,'..')||str_starts_with($path,'/wp-content/database')||str_starts_with($path,'/.')){http_response_code(404);exit;}if($path!=='/'&&is_file(__DIR__.$path))return false;$_SERVER['SCRIPT_NAME']='/index.php';$_SERVER['PHP_SELF']='/index.php';require __DIR__.'/index.php';");
 server=spawn(php,['-c',ini,'-S','127.0.0.1:19416','-t',fixture,router],{cwd:fixture,windowsHide:true,stdio:['ignore','pipe','pipe']});exitPromise=once(server,'exit');for(const stream of[server.stdout,server.stderr])stream.on('data',b=>logs=(logs+b).slice(-4000));
 let ready=false;for(let n=0;n<40;n++){try{const r=await visit('startup');if(r.status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}check(ready,'native HTTP fixture healthy');
 cli(load+library+'$e=json_decode(file_get_contents('+workPhp+'."/expected.json"),true);s15_live_fault('+themePhp+',$e,'+JSON.stringify(id)+','+JSON.stringify(token)+',time()+120);echo "installed";','fault');
 check((await visit('ordinary-during-fault')).status===200,'ordinary request healthy while active theme has scoped fault');
 check((await visit('bad-token','0'.repeat(32))).status===200,'wrong token does not trigger active theme fault');
 check((await visit('scoped-active-theme-failure',token)).status===500,'actual active theme produces scoped HTTP500');
 const restored=JSON.parse(cli(load+library+'$w='+workPhp+';$e=json_decode(file_get_contents($w."/expected.json"),true);$failed=s15_live_restore('+themePhp+',$w."/ready",$w."/failed",$e);$before=count($failed);s15_live_remove_failed($w,$failed);echo json_encode(array("restored"=>s15_live_inventory('+themePhp+')===$e,"failedCount"=>$before,"failedRemoved"=>!file_exists($w."/failed"),"schema"=>get_option("vne_library_schema_version")));','restore'));
 check(restored.restored&&restored.failedRemoved&&restored.failedCount===37,'full active theme directory restored and obsolete file removed');check(Number(restored.schema)===3,'theme rollback does not lower schema');
 check((await visit('ordinary-after-restore')).status===200,'ordinary request healthy after active rollback');check((await visit('old-token-after-restore',token)).status===200,'old probe token no longer has effect');
 const refused=cli(library+'$refused=false;try{s15_live_remove_failed('+JSON.stringify(slash(fixture))+',array());}catch(RuntimeException $e){$refused=true;}echo $refused?"refused":"unsafe";','cleanup-guard');check(refused==='refused','cleanup refuses non-owned parent');
 assert.deepEqual(protectedPaths.map(p=>sha256(readFileSync(p))),before);check(true,'real local database/config preserved');
 writeFileSync('docs/acceptance/S15/live-rehearsal-local-tests.json',JSON.stringify({status:'PASS_NATIVE_WORDPRESS_LIVE_REHEARSAL',observedAt:new Date().toISOString(),helperSha256:sha256(readFileSync(helper)),checks,visits,limits:['Native WordPress/PHP8.3.36/SQLite fresh fixture; not MariaDB or Plesk','Actual WordPress activation hook is fault-injected before migration; no candidate bytes damaged','Scoped theme failure only; not a global outage']},null,2)+'\n');console.log('PASS S15 live rehearsal '+checks.length+' checks');}
}catch(e){const phpLog=existsSync(join(fixture,'php-errors.log'))?readFileSync(join(fixture,'php-errors.log'),'utf8'):'';writeFileSync('docs/acceptance/S15/live-rehearsal-local-failure-'+Date.now()+'.json',JSON.stringify({error:String(e.stack??e),checks,visits,logs,phpLog},null,2));throw e;}
finally{if(server&&!server.killed){server.kill();await exitPromise;}assert.deepEqual(protectedPaths.map(p=>sha256(readFileSync(p))),before);}
