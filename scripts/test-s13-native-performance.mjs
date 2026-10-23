import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {spawnSync,spawn} from 'node:child_process';
import {once} from 'node:events';
import {createHash,randomBytes} from 'node:crypto';
import {themeEvidence,pluginEvidence} from './theme-evidence.mjs';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const runtime=resolve('.local/php-8.3.36-nts-x64'),php=join(runtime,'php.exe');
assert.ok(existsSync(php),'Pinned native PHP dependency missing; see S13 runtime contract.');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s13-native-'));
const evidence=resolve('docs/acceptance/S13'),base='http://127.0.0.1:19414';mkdirSync(evidence,{recursive:true});
const slash=p=>p.replaceAll('\\','/'),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const originals=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'],before=originals.map(hash);
const checks=[],metrics=[],errors=[],external=[],httpErrors=[];let browser,server,exited,logs='';
const check=(v,label)=>{assert.ok(v,label);checks.push(label);};
const ini=join(fixture,'php.ini');
function cli(code,name){const p=join(fixture,name+'.php');writeFileSync(p,code.replace('<?php',"<?php $_SERVER['HTTP_HOST']='127.0.0.1:19414';$_SERVER['SERVER_NAME']='127.0.0.1';$_SERVER['REQUEST_METHOD']='GET';$_SERVER['REQUEST_URI']='/';$_SERVER['SERVER_PROTOCOL']='HTTP/1.1';$_SERVER['REMOTE_ADDR']='127.0.0.1';"));const r=spawnSync(php,['-c',ini,p],{cwd:fixture,encoding:'utf8',windowsHide:true,timeout:120000,env:process.env});assert.equal(r.status,0,r.stderr+' '+r.stdout);assert.doesNotMatch(r.stdout,/Fatal error:|Warning:|Notice:/);return r.stdout.trim();}
try{
 // Copy only core files. Never copy the genuine local database or wp-config.
 for(const d of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',d),join(fixture,d),{recursive:true});
 for(const e of readdirSync('.local/site',{withFileTypes:true})){if(e.isFile()&&e.name.endsWith('.php')&&e.name!=='wp-config.php')cpSync(join('.local/site',e.name),join(fixture,e.name));}
 for(const d of ['wp-content/database','wp-content/plugins','wp-content/themes','wp-content/mu-plugins'])mkdirSync(join(fixture,d),{recursive:true});
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 const quote=s=>"'"+s.replaceAll("'","''")+"'";
 const unzip=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath '+quote(resolve('node_modules/@wp-playground/cli/sqlite-database-integration.zip'))+' -DestinationPath '+quote(join(fixture,'sqlite-package'))],{encoding:'utf8',windowsHide:true,timeout:120000});assert.equal(unzip.status,0,unzip.stderr);
 const sqlite=join(fixture,'wp-content/plugins/sqlite-database-integration');cpSync(join(fixture,'sqlite-package/plugin-sqlite-database-integration'),sqlite,{recursive:true});
 writeFileSync(join(fixture,'wp-content/db.php'),readFileSync(join(sqlite,'db.copy'),'utf8').replaceAll('{SQLITE_IMPLEMENTATION_FOLDER_PATH}',slash(sqlite)).replaceAll('{SQLITE_PLUGIN}','sqlite-database-integration/load.php'));
 writeFileSync(join(fixture,'wp-content/mu-plugins/s13-native-mail-guard.php'),"<?php add_filter('pre_wp_mail',function(){update_option('s13_native_mail_attempts',(int)get_option('s13_native_mail_attempts')+1);return false;});");
 writeFileSync(ini,'extension_dir="'+slash(join(runtime,'ext'))+'"\nextension=pdo_sqlite\nextension=sqlite3\nextension=intl\nextension=mbstring\nextension=openssl\nextension=curl\ndate.timezone=UTC\nmemory_limit=512M\ndisplay_errors=0\nlog_errors=1\nerror_log="'+slash(join(fixture,'native-debug.log'))+'"\nallow_url_fopen=0\n');
 const key=randomBytes(32).toString('hex');
 writeFileSync(join(fixture,'wp-config.php'),"<?php\n$table_prefix='wp_';\ndefine('DB_NAME','wordpress');define('DB_USER','wordpress');define('DB_PASSWORD','');define('DB_HOST','localhost');define('DB_CHARSET','utf8');define('DB_COLLATE','');define('DB_ENGINE','sqlite');define('DB_PATH',"+JSON.stringify(slash(join(fixture,'wp-content/database/.ht.sqlite')))+");\ndefine('WP_HOME',"+JSON.stringify(base)+");define('WP_SITEURL',"+JSON.stringify(base)+");define('AUTH_KEY',"+JSON.stringify(key)+");define('WP_ENVIRONMENT_TYPE','local');define('WP_HTTP_BLOCK_EXTERNAL',true);define('DISABLE_WP_CRON',true);define('AUTOMATIC_UPDATER_DISABLED',true);define('WP_DEBUG',true);define('WP_DEBUG_DISPLAY',false);if(!defined('ABSPATH'))define('ABSPATH',"+JSON.stringify(slash(fixture)+'/')+");require_once ABSPATH.'wp-settings.php';");
 const version=JSON.parse(cli("<?php echo json_encode(array('php'=>PHP_VERSION,'sqlite'=>SQLite3::version(),'intl'=>extension_loaded('intl'),'mbstring'=>extension_loaded('mbstring')));",'runtime'));
 assert.equal(version.php,'8.3.36');check(version.intl&&version.mbstring,'native PHP extensions available');
 const install=cli("<?php define('WP_INSTALLING',true);require "+JSON.stringify(slash(join(fixture,'wp-load.php')))+";require_once ABSPATH.'wp-admin/includes/upgrade.php';wp_install('VibeLab Việt','admin','admin@example.test',0,'',"+JSON.stringify(randomBytes(24).toString('base64url'))+",'vi');echo 'installed';",'install');assert.equal(install,'installed');
 const seedCode=readFileSync('scripts/fixtures/s13-integrated-seed.php','utf8').replace("require '/wordpress/wp-load.php';","require "+JSON.stringify(slash(join(fixture,'wp-load.php')))+";").replace('<?php','<?php define("S13_CONTENT",'+JSON.stringify(readFileSync('docs/content-samples/S10-moc-studio-lesson.html','utf8'))+');define("S13_OBSERVATIONS",'+JSON.stringify(readFileSync('docs/acceptance/S02/source-observations.json','utf8'))+');');
 const activation=JSON.parse(cli("<?php require "+JSON.stringify(slash(join(fixture,'wp-load.php')))+";require_once ABSPATH.'wp-admin/includes/plugin.php';$result=activate_plugin('vne-library-core/vne-library-core.php');echo wp_json_encode(array('error'=>is_wp_error($result)?$result->get_error_message():null,'loaded'=>function_exists('vne_library_create_term'),'plugin_dir'=>WP_PLUGIN_DIR));",'activate'));
 assert.equal(activation.error,null,JSON.stringify(activation));check(activation.loaded,'native library plugin activated before seed');
 const seed=JSON.parse(cli(seedCode,'seed'));check(seed.resources.length===6&&seed.guides.length===3,'same integrated content set native');

 async function contender(kind,index){
  const name=kind==='content'?'vne_content_lock_'+seed.lesson.id:'vne_report_lock_'+'a'.repeat(64);
  const body="<?php require "+JSON.stringify(slash(join(fixture,'wp-load.php')))+";add_filter('query',function($q){if(preg_match('/^\\s*INSERT\\b/i',$q)&&(strpos($q,'vne_content_lock_')!==false||strpos($q,'vne_report_lock_')!==false)){usleep(1000000);}return $q;});$name="+JSON.stringify(name)+";$token=wp_generate_uuid4();"+
  (kind==='report'?"$lock=vne_report_lock(str_repeat('a',64));$won=(bool)$lock;if($lock)$token=$lock['value'];":"$won=function_exists('vne_library_lock_insert')?vne_library_lock_insert($name,$token):add_option($name,$token,'',false);")+
  "echo wp_json_encode(array('won'=>(bool)$won,'token_hash'=>hash('sha256',$token)));";
  const file=join(fixture,'contender-'+kind+'-'+index+'.php');writeFileSync(file,body.replace('<?php',"<?php $_SERVER['HTTP_HOST']='127.0.0.1:19414';$_SERVER['SERVER_NAME']='127.0.0.1';$_SERVER['REQUEST_METHOD']='GET';$_SERVER['REQUEST_URI']='/';$_SERVER['SERVER_PROTOCOL']='HTTP/1.1';$_SERVER['REMOTE_ADDR']='127.0.0.1';"));
  const child=spawn(php,['-c',ini,file],{cwd:fixture,stdio:['ignore','pipe','pipe'],windowsHide:true});let output='',error='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>error+=b);
  const [status]=await once(child,'exit');assert.equal(status,0,error+output);return JSON.parse(output);
 }
 const lockRace={};
 for(const kind of ['content','report']){
  const results=await Promise.all([contender(kind,1),contender(kind,2)]);
  lockRace[kind]={results,winners:results.filter(x=>x.won).length,expected:1};
 }
 const atomic=cli("<?php require "+JSON.stringify(slash(join(fixture,'wp-load.php')))+";echo function_exists('vne_library_lock_insert')?'yes':'no';",'atomic-check')==='yes';
 writeFileSync(join(evidence,atomic?'lock-race-after-fix.json':'lock-race-before-fix.json'),JSON.stringify({runtime:'PHP8.3.36 native, separate concurrent CLI processes, shared fresh SQLite DB',barrier:'1s delay in query filter immediately before INSERT for both contenders; no owner releases before both results',lockRace,testedPluginHashes:pluginEvidence(fixture)},null,2)+'\n');
 check(Object.values(lockRace).every(x=>x.winners===1),'both lock families admit exactly one simultaneous contender without replacing owner');
 // The fixture alone owns these two test locks; clear only these exact names after contenders exit.
 cli("<?php require "+JSON.stringify(slash(join(fixture,'wp-load.php')))+";global $wpdb;$wpdb->query($wpdb->prepare(\"DELETE FROM {$wpdb->options} WHERE option_name IN (%s,%s)\",'vne_content_lock_"+seed.lesson.id+"','vne_report_lock_"+'a'.repeat(64)+"'));echo 'cleared';",'clear-probe-locks');
 if(!process.argv.includes('--lock-probe-only')){
 const router=join(fixture,'router.php');
 writeFileSync(router,"<?php $path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));if(str_contains($path,'..')||str_starts_with($path,'/wp-content/database')||str_starts_with($path,'/.')){http_response_code(404);exit;}if($path!=='/'&&is_file(__DIR__.$path))return false;$_SERVER['SCRIPT_NAME']='/index.php';$_SERVER['PHP_SELF']='/index.php';require __DIR__.'/index.php';");
 server=spawn(php,['-c',ini,'-S','127.0.0.1:19414','-t',fixture,router],{cwd:fixture,stdio:['ignore','pipe','pipe'],windowsHide:true,env:process.env});exited=once(server,'exit');
 for(const stream of [server.stdout,server.stderr])stream.on('data',b=>{logs=(logs+b.toString()).slice(-18000);});
 let ready=false;for(let i=0;i<40;i++){try{const r=await fetch(base,{signal:AbortSignal.timeout(3000),redirect:'error'});await r.arrayBuffer();if(r.status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}check(ready,'native loopback server ready');
 browser=await chromium.launch({channel:'msedge',headless:true});
 const pages=[['home',base+'/'],['catalog',base+'/tai-nguyen/'],['resource',seed.resources[0].url],['lesson',seed.lesson.url]];
 for(const [label,url]of pages){
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(30000)}),html=await response.text();check(response.status===200&&!/Fatal error:|Warning:|Notice:/.test(html),label+' native HTML200 without PHP errors');check((response.headers.get('cache-control')||'').includes('no-store'),label+' native no-store unchanged');check(html.includes('lang="vi"')&&html.includes('<h1'),label+' native Vietnamese heading');
  for(let run=1;run<=3;run++){
   const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
   await ctx.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():(external.push(r.request().url()),r.abort()));
   await ctx.addInitScript(()=>{window.__p={lcp:0,cls:0,shifts:[]};new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__p.lcp=e.startTime;window.__p.element=e.element?.tagName;}}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){window.__p.cls+=e.value;window.__p.shifts.push({time:e.startTime,value:e.value});}}).observe({type:'layout-shift',buffered:true});});
   const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),status:r.status()});});
   const cdp=await ctx.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   const nav=await page.goto(url,{waitUntil:'load',timeout:60000});assert.equal(nav.status(),200);await page.waitForTimeout(1500);
   const result=await page.evaluate(()=>({...window.__p,ttfb:performance.getEntriesByType('navigation')[0].responseStart,resources:performance.getEntriesByType('resource').map(e=>({name:e.name,start:e.startTime,end:e.responseEnd,bytes:e.transferSize}))}));
   metrics.push({page:label,run,...result});console.log('NATIVE PERF',label,run,result.lcp,result.cls,result.ttfb);
   if(run===1)await page.screenshot({path:join(evidence,'native-lab-'+label+'.png')});await ctx.close();
  }
 }
 const budget=metrics.map(p=>({page:p.page,run:p.run,lcpPass:p.lcp>0&&p.lcp<=2500,clsPass:p.cls<=0.1})),pass=budget.every(p=>p.lcpPass&&p.clsPass);
 check(errors.length===0&&external.length===0&&httpErrors.length===0,'native public flows no JS/HTTP/external request errors');assert.deepEqual(originals.map(hash),before);
 const warnings=existsSync(join(fixture,'native-debug.log'))?readFileSync(join(fixture,'native-debug.log'),'utf8'):'';
 if(warnings){writeFileSync(join(evidence,'native-php-warnings.txt'),warnings);console.log('Native PHP log',warnings.slice(-3500));}
 check(!/PHP (Warning|Fatal error|Notice|Deprecated):/.test(warnings),'native PHP no warning/fatal/notice/deprecated');
 writeFileSync(join(evidence,'native-performance.json'),JSON.stringify({date:new Date().toISOString(),status:pass?'PASS_NATIVE_LAB':'FAIL_NATIVE_LAB',checks,version,core:'WordPress7.1.3; fresh SQLite DB; bundled CLI SQLite integration',runtimeSource:JSON.parse(readFileSync(join(runtime,'source.json'),'utf8').replace(/^\uFEFF/,'')),profile:{viewport:'390x844',cpu:4,rttMs:40,downloadBytesPerSecond:1.6*1024*1024/8,uploadBytesPerSecond:750*1024/8,coldCache:true,runsPerPage:3,observation:'load+1500ms'},metrics,budget,errors,httpErrors,external,testedThemeHashes:themeEvidence(fixture),testedPluginHashes:pluginEvidence(fixture),originalFilesUnchanged:true,limits:['Native PHP built-in server and SQLite, not hosting/MySQL/CDN/load/field certification','WASM lab failure retained separately; no averaging or discarded slow runs','No paid API/mail/deployment; no global PATH or service install']},null,2)+'\n');
 console.log((pass?'PASS':'FAIL')+' native S13 lab; checks '+checks.length);if(!pass)process.exitCode=1;
 }
}catch(e){const diagnostic=join(fixture,'native-debug.log');writeFileSync(join(evidence,'native-failure-'+Date.now()+'.json'),JSON.stringify({message:e.stack,checks,metrics,logs,phpLog:existsSync(diagnostic)?readFileSync(diagnostic,'utf8'):''},null,2)+'\n');throw e;}
finally{if(browser)await browser.close();if(server&&!server.killed){server.kill();await exited;}assert.deepEqual(originals.map(hash),before);}
