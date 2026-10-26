import assert from 'node:assert/strict';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,readdirSync,existsSync,rmSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {verifyRelease,sourceFiles,sha256,dryRunGate} from './release-lib.mjs';
import {previousThemeRef} from './release-policy.mjs';
const packageDir=resolve(process.argv[2]||''),ref=process.argv[3]||'HEAD';
const manifest=verifyRelease(packageDir,ref),evidence=resolve('docs/acceptance/S14');mkdirSync(evidence,{recursive:true});
const runtime=resolve('.local/php-8.3.36-nts-x64'),php=join(runtime,'php.exe');assert.ok(existsSync(php),'Pinned PHP dependency required');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s14-runtime-'));
const slash=p=>p.replaceAll('\\','/'),quote=s=>"'"+s.replaceAll("'","''")+"'",base='http://127.0.0.1:19415';
const originalPaths=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'],before=originalPaths.map(p=>sha256(readFileSync(p)));
let server,exitPromise,logs='';const checks=[],visits=[];
const check=(v,label)=>{assert.ok(v,label);checks.push(label);};
const ini=join(fixture,'php.ini');
function expand(archive,dest){
 mkdirSync(dest,{recursive:true});const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath '+quote(archive)+' -DestinationPath '+quote(dest)],{encoding:'utf8',windowsHide:true,timeout:120000});assert.equal(r.status,0,r.stderr);
}
function cli(code,name){
 const file=join(fixture,name+'.php');writeFileSync(file,"<?php $_SERVER['HTTP_HOST']='127.0.0.1:19415';$_SERVER['SERVER_NAME']='127.0.0.1';$_SERVER['REQUEST_METHOD']='GET';$_SERVER['REQUEST_URI']='/';$_SERVER['SERVER_PROTOCOL']='HTTP/1.1';$_SERVER['REMOTE_ADDR']='127.0.0.1';"+code);
 const r=spawnSync(php,['-c',ini,file],{cwd:fixture,encoding:'utf8',windowsHide:true,timeout:120000});assert.equal(r.status,0,r.stderr+' '+r.stdout);return r.stdout.trim();
}
const load="require "+JSON.stringify(slash(join(fixture,'wp-load.php')))+";";
function replaceTheme(files){
 const target=resolve(fixture,'wp-content/themes/vibelab');assert.ok(relative(fixture,target).startsWith('wp-content'));
 rmSync(target,{recursive:true,force:true});
 for(const f of files){const path=join(fixture,'wp-content/themes',f.name);mkdirSync(resolve(path,'..'),{recursive:true});writeFileSync(path,f.data);}
}
async function flows(label,themeVersion,urls){
 const state=JSON.parse(cli(load+"echo wp_json_encode(array('theme'=>wp_get_theme()->get('Version'),'plugin'=>VNE_LIBRARY_VERSION,'schema'=>(int)get_option('vne_library_schema_version')));",'health'));
 assert.deepEqual(state,{theme:themeVersion,plugin:'0.4.2',schema:3});check(true,label+' exact running version/schema');
 for(const [name,url]of urls){
  const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(60000)}),html=await r.text();
  check(r.status===200&&html.includes('<h1')&&!/Fatal error:|Warning:|Notice:/.test(html),label+' '+name+' renders HTTP200');
  check((r.headers.get('cache-control')||'').includes('no-store'),label+' '+name+' retains no-store');
  if(name==='home')check((html.match(/data-resource-id=/g)||[]).length===6,label+' six public resource cards');
  if(name==='resource')check(html.includes('https://github.com/microsoft/Web-Dev-For-Beginners'),label+' source CTA retained');
  if(name==='lesson')check(html.includes('Mộc Studio'),label+' lesson content retained');
  visits.push({phase:label,page:name,status:r.status,themeVersion});
 }
}
try{
 for(const d of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',d),join(fixture,d),{recursive:true});
 for(const e of readdirSync('.local/site',{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.php')&&e.name!=='wp-config.php')cpSync(join('.local/site',e.name),join(fixture,e.name));
 for(const d of ['database','mu-plugins','plugins','themes'])mkdirSync(join(fixture,'wp-content',d),{recursive:true});
 expand(join(packageDir,manifest.components.plugin.archive),join(fixture,'wp-content/plugins'));
 expand(join(packageDir,manifest.components.theme.archive),join(fixture,'wp-content/themes'));
 for(const [kind,p]of Object.entries(manifest.components))for(const file of p.files)check(sha256(readFileSync(join(fixture,'wp-content',kind==='plugin'?'plugins':'themes',file.path)))===file.sha256,'installed package bytes '+file.path);
 const currentTheme=manifest.components.theme.files.map(f=>({name:f.path,data:readFileSync(join(fixture,'wp-content/themes',f.path))}));
 const previousTheme=sourceFiles(previousThemeRef,'theme',{previous:true});
 expand(resolve('node_modules/@wp-playground/cli/sqlite-database-integration.zip'),join(fixture,'sqlite-package'));
 const sqlite=join(fixture,'wp-content/plugins/sqlite-database-integration');cpSync(join(fixture,'sqlite-package/plugin-sqlite-database-integration'),sqlite,{recursive:true});
 writeFileSync(join(fixture,'wp-content/db.php'),readFileSync(join(sqlite,'db.copy'),'utf8').replaceAll('{SQLITE_IMPLEMENTATION_FOLDER_PATH}',slash(sqlite)).replaceAll('{SQLITE_PLUGIN}','sqlite-database-integration/load.php'));
 writeFileSync(join(fixture,'wp-content/mu-plugins/s14-guard.php'),"<?php add_filter('pre_wp_mail','__return_false');");
 writeFileSync(ini,'extension_dir="'+slash(join(runtime,'ext'))+'"\nextension=pdo_sqlite\nextension=sqlite3\nextension=intl\nextension=mbstring\nextension=openssl\nextension=curl\ndate.timezone=UTC\nmemory_limit=512M\ndisplay_errors=0\nlog_errors=1\nerror_log="'+slash(join(fixture,'php-errors.log'))+'"\nallow_url_fopen=0\n');
 for(const [kind,p]of Object.entries(manifest.components))for(const file of p.files.filter(f=>f.path.endsWith('.php'))){
  const r=spawnSync(php,['-c',ini,'-l',join(fixture,'wp-content',kind==='plugin'?'plugins':'themes',file.path)],{encoding:'utf8',windowsHide:true,timeout:30000});
  check(r.status===0,'PHP lint package '+file.path);
 }
 writeFileSync(join(fixture,'wp-config.php'),"<?php $table_prefix='wp_';define('DB_NAME','wordpress');define('DB_USER','wordpress');define('DB_PASSWORD','');define('DB_HOST','localhost');define('DB_CHARSET','utf8');define('DB_COLLATE','');define('DB_ENGINE','sqlite');define('DB_PATH',"+JSON.stringify(slash(join(fixture,'wp-content/database/.ht.sqlite')))+");define('WP_HOME',"+JSON.stringify(base)+");define('WP_SITEURL',"+JSON.stringify(base)+");define('AUTH_KEY',"+JSON.stringify(randomBytes(32).toString('hex'))+");define('WP_ENVIRONMENT_TYPE','local');define('WP_HTTP_BLOCK_EXTERNAL',true);define('DISABLE_WP_CRON',true);define('AUTOMATIC_UPDATER_DISABLED',true);define('WP_DEBUG',true);define('WP_DEBUG_DISPLAY',false);if(!defined('ABSPATH'))define('ABSPATH',"+JSON.stringify(slash(fixture)+'/')+");require_once ABSPATH.'wp-settings.php';");
 const version=cli("echo PHP_VERSION;",'version');assert.equal(version,'8.3.36');
 cli("define('WP_INSTALLING',true);"+load+"require_once ABSPATH.'wp-admin/includes/upgrade.php';wp_install('S14 fixture','admin','admin@example.test',0,'',"+JSON.stringify(randomBytes(24).toString('hex'))+",'vi');",'install');
 const activated=cli(load+"require_once ABSPATH.'wp-admin/includes/plugin.php';$r=activate_plugin('vne-library-core/vne-library-core.php');if(is_wp_error($r))throw new Exception($r->get_error_message());echo function_exists('vne_library_create_term')?'loaded':'missing';",'activate');assert.equal(activated,'loaded');
 const seedCode=readFileSync('scripts/fixtures/s13-integrated-seed.php','utf8').replace("require '/wordpress/wp-load.php';",load).replace('<?php',"define('S13_CONTENT',"+JSON.stringify(readFileSync('docs/content-samples/S10-moc-studio-lesson.html','utf8'))+");define('S13_OBSERVATIONS',"+JSON.stringify(readFileSync('docs/acceptance/S02/source-observations.json','utf8'))+");");
 const seed=JSON.parse(cli(seedCode,'seed'));check(seed.resources.length===6,'seed in fresh database only');
 const router=join(fixture,'router.php');writeFileSync(router,"<?php $path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));if(str_contains($path,'..')||str_starts_with($path,'/wp-content/database')||str_starts_with($path,'/.')){http_response_code(404);exit;}if($path!=='/'&&is_file(__DIR__.$path))return false;$_SERVER['SCRIPT_NAME']='/index.php';$_SERVER['PHP_SELF']='/index.php';require __DIR__.'/index.php';");
 replaceTheme(previousTheme);
 server=spawn(php,['-c',ini,'-S','127.0.0.1:19415','-t',fixture,router],{cwd:fixture,windowsHide:true,stdio:['ignore','pipe','pipe']});exitPromise=once(server,'exit');for(const stream of [server.stdout,server.stderr])stream.on('data',b=>logs=(logs+b).slice(-12000));
 let ready=false;for(let n=0;n<40;n++){try{const r=await fetch(base,{signal:AbortSignal.timeout(3000)});await r.arrayBuffer();if(r.status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}check(ready,'native fixture server ready');
 const urls=[['home',base+'/'],['catalog',base+'/tai-nguyen/'],['resource',seed.resources[0].url],['lesson',seed.lesson.url]];
 await flows('plugin-new/theme-old','0.6.0',urls);
 replaceTheme(currentTheme);await flows('candidate-pair','0.7.0',urls);
 // Represent a partial theme transfer on disk, then exercise the file-only restore.
 writeFileSync(join(fixture,'wp-content/themes/vibelab/functions.php'),'<?php /* incomplete transfer fixture */');
 writeFileSync(join(fixture,'wp-content/themes/vibelab/obsolete-fixture.txt'),'obsolete fixture');
 check(dryRunGate({plugin:'confirmed',theme:'failed'}).state==='RESTORE_THEME_KEEP_PLUGIN','theme failure chooses tested intermediate pair');
 replaceTheme(previousTheme);
 check(!existsSync(join(fixture,'wp-content/themes/vibelab/obsolete-fixture.txt'))&&!existsSync(join(fixture,'wp-content/themes/vibelab/seo.php')),'restore removes files absent in previous theme');
 for(const f of previousTheme)check(sha256(readFileSync(join(fixture,'wp-content/themes',f.name)))===sha256(f.data),'restored bytes '+f.name);
 await flows('theme-restore/plugin-retained','0.6.0',urls);
 const warnings=existsSync(join(fixture,'php-errors.log'))?readFileSync(join(fixture,'php-errors.log'),'utf8'):'';check(!/PHP (Warning|Fatal error|Notice|Deprecated):/.test(warnings),'no PHP errors across candidate/intermediate/restored flows');
 assert.deepEqual(originalPaths.map(p=>sha256(readFileSync(p))),before);check(true,'original database/config unchanged');
 writeFileSync(join(evidence,'runtime-results.json'),JSON.stringify({status:'PASS_LOCAL_PACKAGE_RUNTIME',date:new Date().toISOString(),sourceSha:manifest.sourceSha,previousThemeSource:previousThemeRef,php:version,checks,visits,protectedHashes:before,limits:['Native PHP built-in server/SQLite, not Plesk/MySQL','Fixture confirms file restore and old theme/new plugin only; real target backup and restore remain S15','No database rollback, migration downgrade, remote API, email, deployment or ref changes']},null,2)+'\n');
 console.log('PASS S14 package runtime '+checks.length+' checks / '+visits.length+' HTTP page visits.');
}catch(e){const path=join(fixture,'php-errors.log');writeFileSync(join(evidence,'runtime-failure-'+Date.now()+'.json'),JSON.stringify({message:e.stack,checks,logs,phpLog:existsSync(path)?readFileSync(path,'utf8'):''},null,2)+'\n');throw e;}
finally{if(server&&!server.killed){server.kill();await exitPromise;}assert.deepEqual(originalPaths.map(p=>sha256(readFileSync(p))),before);}
