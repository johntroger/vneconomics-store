import assert from 'node:assert/strict';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {sha256} from './release-lib.mjs';
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/c100-'));
const runtime=resolve('.local/php-8.3.36-nts-x64'),php=join(runtime,'php.exe'),base='http://127.0.0.1:19418';
const slash=p=>p.replaceAll('\\','/'),quote=s=>"'"+s.replaceAll("'","''")+"'";
const protectedPaths=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'],before=protectedPaths.map(p=>sha256(readFileSync(p)));
const checks=[],visits=[];let server,exitPromise,logs='';const check=(v,n)=>{assert.ok(v,n);checks.push(n);};
const ini=join(fixture,'php.ini'),load='require '+JSON.stringify(slash(join(fixture,'wp-load.php')))+';';
function cli(code,name){const file=join(fixture,name+'.php');writeFileSync(file,"<?php $_SERVER['HTTP_HOST']='127.0.0.1:19418';$_SERVER['SERVER_NAME']='127.0.0.1';$_SERVER['REMOTE_ADDR']='127.0.0.1';$_SERVER['REQUEST_METHOD']='GET';$_SERVER['REQUEST_URI']='/';$_SERVER['SERVER_PROTOCOL']='HTTP/1.1';"+code);const p=spawnSync(php,['-c',ini,file],{cwd:fixture,encoding:'utf8',windowsHide:true,timeout:120000});const diagnostic=existsSync(join(fixture,'php-errors.log'))?readFileSync(join(fixture,'php-errors.log'),'utf8').slice(-6000):'';assert.equal(p.status,0,name+' '+p.stderr+' '+diagnostic);return p.stdout.trim();}
function expand(zip,dest){const p=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath '+quote(zip)+' -DestinationPath '+quote(dest)],{encoding:'utf8',windowsHide:true,timeout:120000});assert.equal(p.status,0,p.stderr);}
async function visit(name,path){const u=new URL(path,base);assert.equal(u.origin,base);const r=await fetch(u,{signal:AbortSignal.timeout(30000)});const body=await r.text();visits.push({name,path:u.pathname+u.search,status:r.status});return {status:r.status,body};}
try{
 for(const d of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',d),join(fixture,d),{recursive:true});
 for(const e of readdirSync('.local/site',{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.php')&&e.name!=='wp-config.php')cpSync(join('.local/site',e.name),join(fixture,e.name));
 for(const d of ['database','mu-plugins','plugins','themes'])mkdirSync(join(fixture,'wp-content',d),{recursive:true});
 for(const kind of ['plugin','theme'])expand(resolve('artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752',kind==='plugin'?'vne-library-core-0.4.2.zip':'vibelab-0.7.0.zip'),join(fixture,'wp-content',kind==='plugin'?'plugins':'themes'));
 expand(resolve('node_modules/@wp-playground/cli/sqlite-database-integration.zip'),join(fixture,'sqlite-package'));
 const sqlite=join(fixture,'wp-content/plugins/sqlite-database-integration');cpSync(join(fixture,'sqlite-package/plugin-sqlite-database-integration'),sqlite,{recursive:true});
 writeFileSync(join(fixture,'wp-content/db.php'),readFileSync(join(sqlite,'db.copy'),'utf8').replaceAll('{SQLITE_IMPLEMENTATION_FOLDER_PATH}',slash(sqlite)).replaceAll('{SQLITE_PLUGIN}','sqlite-database-integration/load.php'));
 writeFileSync(join(fixture,'wp-content/mu-plugins/fixture-guard.php'),"<?php add_filter('pre_wp_mail','__return_false');add_filter('pre_http_request',function(){return new WP_Error('fixture_no_network','Blocked in fixture');},PHP_INT_MAX);add_shortcode('s16_fixture',function(){return '<p id=\"shortcode-ok\">Shortcode pipeline retained</p>';});");
 writeFileSync(ini,'extension_dir="'+slash(join(runtime,'ext'))+'"\nextension=pdo_sqlite\nextension=sqlite3\nextension=intl\nextension=mbstring\nextension=openssl\nextension=curl\nextension=zip\ndisplay_errors=0\nlog_errors=1\nerror_log="'+slash(join(fixture,'php-errors.log'))+'"\nmemory_limit=512M\n');
 writeFileSync(join(fixture,'wp-config.php'),`<?php $table_prefix='wp_';define('DB_NAME','wordpress');define('DB_USER','wordpress');define('DB_PASSWORD','');define('DB_HOST','localhost');define('DB_CHARSET','utf8');define('DB_COLLATE','');define('DB_ENGINE','sqlite');define('DB_PATH',${JSON.stringify(slash(join(fixture,'wp-content/database/.ht.sqlite')))});define('WP_HOME',${JSON.stringify(base)});define('WP_SITEURL',${JSON.stringify(base)});define('AUTH_KEY',${JSON.stringify(randomBytes(32).toString('hex'))});define('WP_HTTP_BLOCK_EXTERNAL',true);define('DISABLE_WP_CRON',true);define('AUTOMATIC_UPDATER_DISABLED',true);define('WP_DEBUG',false);if(!defined('ABSPATH'))define('ABSPATH',${JSON.stringify(slash(fixture)+'/')});require_once ABSPATH.'wp-settings.php';`);
 cli("define('WP_INSTALLING',true);"+load+"require_once ABSPATH.'wp-admin/includes/upgrade.php';wp_install('S16 legacy fixture','admin','admin@example.test',0,'',"+JSON.stringify(randomBytes(24).toString('hex'))+");",'install');
 check(cli(load+"require_once ABSPATH.'wp-admin/includes/plugin.php';$r=activate_plugin('vne-library-core/vne-library-core.php');if(is_wp_error($r))throw new Exception($r->get_error_message());echo VNE_LIBRARY_VERSION;",'activate')==='0.4.2','actual plugin0.4.2 activated');

 cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 cpSync(resolve('docs/content-production/2026-10-25'),join(fixture,'campaign'),{recursive:true});
 cpSync(resolve('scripts/content-100-import.php'),join(fixture,'campaign/import.php'));
 const setup=cli(load+"wp_set_current_user(1);vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'Fixture base'));update_option('stylesheet','vibelab');update_option('template','vibelab');update_option('vne_c100_fixture_ceiling',(int) $GLOBALS['wpdb']->get_var('SELECT MAX(ID) FROM wp_posts'));echo wp_get_theme()->get('Version');",'setup');check(setup==='0.7.1','fixture actual theme0.7.1');
 const importer=load+"define('VNE_C100_TEST',true);require "+JSON.stringify(slash(join(fixture,'campaign/import.php')))+";";
 const campaign=JSON.stringify(slash(join(fixture,'campaign')));
 const attempt=(mode,batch)=>JSON.parse(cli(importer+"echo json_encode(vne_c100_run("+campaign+","+JSON.stringify(mode)+","+batch+"));",mode+'-'+batch));
 const read=attempt('dry-run',1);check(read.status==='READY_READ_ONLY','dry-run schema passes actual WordPress');
 check(attempt('apply',1).status==='IMPORTED','first batch saved via plugin API');
 check(attempt('apply',1).status==='ALREADY_IMPORTED','repeat apply creates no duplicates');
 const refused=cli(importer+"try{vne_c100_run("+campaign+",'apply',2);echo 'BAD';}catch(Throwable $e){echo $e->getMessage();}",'previous-gate');check(refused.includes('Previous batch'),'cannot advance before HTTP acceptance recorded');
 check(attempt('verify',1).status==='VERIFIED','first acceptance recorded');
 for(const batch of [2,3,4,5,6,7,8,9,10]){check(attempt('dry-run',batch).status==='READY_READ_ONLY','batch '+batch+' dry-run');check(attempt('apply',batch).status==='IMPORTED','batch '+batch+' import');check(attempt('verify',batch).status==='VERIFIED','batch '+batch+' acceptance');}
 const count=cli(load+"echo count(get_posts(array('post_type'=>'vne_resource','post_status'=>'publish','numberposts'=>-1)));",'count');check(count==='100','one hundred public articles without duplicates');
 const router=join(fixture,'router.php');writeFileSync(router,"<?php $path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));if(str_contains($path,'..')||str_starts_with($path,'/wp-content/database')||str_starts_with($path,'/.')){http_response_code(404);exit;}if($path!=='/'&&is_file(__DIR__.$path))return false;$_SERVER['SCRIPT_NAME']='/index.php';$_SERVER['PHP_SELF']='/index.php';require __DIR__.'/index.php';");
 server=spawn(php,['-c',ini,'-S','127.0.0.1:19418','-t',fixture,router],{cwd:fixture,windowsHide:true,stdio:['ignore','pipe','pipe']});exitPromise=once(server,'exit');for(const stream of [server.stdout,server.stderr])stream.on('data',b=>logs=(logs+b).slice(-5000));
 let ready=false;for(let i=0;i<40;i++){try{if((await visit('startup','/')).status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}check(ready,'native HTTP ready at100 articles');
 for(const path of ['/','/tai-nguyen/','/tai-nguyen/page/12/','/?vne_find=1&scope=resources&s=uptime']){const response=await visit('scale100',path);check(response.status===200,'100-item route200 '+path);check(!/Fatal error:|Uncaught Error/.test(response.body),'100-item route no PHP failure '+path);if(path.includes('uptime'))check(response.body.includes('Uptime Kuma'),'search reaches final batch');}
 const phpLog=existsSync(join(fixture,'php-errors.log'))?readFileSync(join(fixture,'php-errors.log'),'utf8'):'';check(!/PHP (Warning|Fatal error|Notice|Deprecated):/.test(phpLog),'no PHP errors in actual save/readback path');
 assert.deepEqual(protectedPaths.map(p=>sha256(readFileSync(p))),before);check(true,'real local database and config unchanged');
 writeFileSync('docs/content-production/2026-10-25/native-import-checks.json',JSON.stringify({status:'PASS_NATIVE_WORDPRESS_IMPORT',observedAt:new Date().toISOString(),checks,articles:100,limits:['Fresh PHP8.3.36/WordPress/SQLite fixture, not MariaDB hosting','CLI importer/data/schema/idempotence/gates and100-item HTTP search/pagination verified; production HTML checks separate','Fixture path gate is separate from production root/DB/backup pin']},null,2)+'\n');console.log('PASS campaign native importer '+checks.length+' checks');
}catch(error){console.error(String(error.stack??error));throw error;}finally{if(server&&!server.killed){server.kill();await exitPromise;}assert.deepEqual(protectedPaths.map(p=>sha256(readFileSync(p))),before);}
