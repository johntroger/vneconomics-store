import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync,existsSync,cpSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {startSite} from './local-runtime.mjs';
import {prepareThemeRelease} from './theme-release.mjs';
import {sha256} from './release-lib.mjs';

assert.equal(process.argv.length,2,'No fixture/production path overrides');
const controller=readFileSync('scripts/theme-host-installer.php'),digest=sha256(controller),checks=[],started=Date.now();
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/theme-host-')),repo=join(fixture,'git');
let r=spawnSync('git',['clone','--shared','--no-checkout',resolve('.'),repo],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);
const git=(args,input)=>{const r=spawnSync('git',args,{cwd:repo,input,encoding:null,windowsHide:true,maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr?.toString());return r.stdout;};
git(['config','user.name','Installer fixture']);git(['config','user.email','fixture@example.invalid']);
const baseline=JSON.parse(readFileSync('deploy/theme-release-baseline.json')),old=JSON.parse(git(['show',baseline.payloadSha+':manifest.json']));
const path='themes/vibelab-v2/front-page.php',page=git(['show',old.sourceSha+':'+path]);
git(['read-tree',old.sourceSha]);const blob=git(['hash-object','-w','--stdin'],Buffer.from(page.toString().replace('<?php get_footer(); ?>','<p data-installer-fixture="true">Native installer fixture</p>\n<?php get_footer(); ?>'))).toString().trim();
git(['update-index','--add','--cacheinfo','100644,'+blob+','+path]);const source=git(['commit-tree',git(['write-tree']).toString().trim(),'-p',old.sourceSha,'-m','Synthetic fixture only']).toString().trim();
const p=prepareThemeRelease(source,baseline,{readGit:args=>git(args)}),pin=sha256(p.buffers['manifest.json']),payload='b'.repeat(40),directory=join(fixture,'wordpress'),preserved=new Map();
for(const path of ['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'])if(existsSync(path))preserved.set(path,sha256(readFileSync(path)));
mkdirSync(directory,{recursive:true});let app;
try {
 if(existsSync('.local/site/wp-load.php')) {
  for(const name of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',name),join(directory,name),{recursive:true});
  for(const e of readdirSync('.local/site',{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.php')&&e.name!=='wp-config.php')cpSync(join('.local/site',e.name),join(directory,e.name));
 }
 app=await startSite(directory,19479,{workers:1});
 const php=async code=>{const r=await app.playground.run({code:'<?php clearstatcache();'+code});assert.equal(r.exitCode,0,r.errors||r.text);assert.equal(r.errors,'',r.errors);return r.text;};
 const put=async(path,bytes)=>php('file_put_contents('+JSON.stringify(path)+',base64_decode('+JSON.stringify(Buffer.from(bytes).toString('base64'))+'));');
 await php('mkdir("/wordpress-private",0700);foreach(array("inbox","control","git","git/refs","git/refs/heads") as $p)mkdir("/wordpress-private/".$p,0700);');
 await put('/wordpress-private/theme-host-installer.php',controller);
 for(const [name,bytes] of Object.entries(p.buffers))await put('/wordpress-private/inbox/'+name,bytes);
 await put('/wordpress-private/git/HEAD','ref: refs/heads/release-production\n');await put('/wordpress-private/git/refs/heads/release-production',payload+'\n');
 writeFileSync(join(directory,'baseline-theme.zip'),p.buffers['previous-theme.zip']);writeFileSync(join(directory,'baseline-plugin.zip'),p.buffers['plugin.zip']);
 await php('define("FS_METHOD","direct");require "/wordpress/wp-load.php";require_once ABSPATH."wp-admin/includes/file.php";WP_Filesystem();foreach(array("baseline-plugin"=>"plugins","baseline-theme"=>"themes") as $z=>$d){$r=unzip_file(ABSPATH.$z.".zip",WP_CONTENT_DIR."/".$d."/");if(is_wp_error($r))throw new Exception($r->get_error_message());}');
 const observations=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
 const seed=readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(observations)+");").replace("switch_theme('vibelab');","switch_theme('vibelab-v2');");JSON.parse(await php(seed.replace('<?php','')));
 const context={root:'/wordpress',inbox:'/wordpress-private/inbox',control:'/wordpress-private/control',clone:'/wordpress-private/git',home:'http://127.0.0.1:19479',database:await php('require "/wordpress/wp-load.php";echo DB_NAME;')};
 const ctx=Buffer.from(JSON.stringify(context)).toString('base64');
 const run=async(mode,{config=ctx,sha=payload,hash=pin,extra=''}={})=>JSON.parse(await php('define("FS_METHOD","direct");require "/wordpress-private/theme-host-installer.php";try{'+extra+'$i=new VneThemeHostInstaller(json_decode(base64_decode("'+config+'"),true),"'+sha+'","'+hash+'");echo json_encode($i->run("'+mode+'"));}catch(Throwable $e){echo json_encode(array("error"=>$e->getMessage()));}'));
 const journal=()=>php('echo file_exists("/wordpress-private/control/theme-active.json")?file_get_contents("/wordpress-private/control/theme-active.json"):"ABSENT";');
 const state=async()=>JSON.parse(await php('require "/wordpress/wp-load.php";$out=array("data"=>array(),"files"=>array());foreach(array("posts","postmeta","terms","term_taxonomy","term_relationships") as $n){$r=$wpdb->get_results("SELECT * FROM ".$wpdb->$n,ARRAY_A);usort($r,fn($a,$b)=>strcmp(wp_json_encode($a),wp_json_encode($b)));$out["data"][$n]=hash("sha256",wp_json_encode($r));}foreach(array("themes/vibelab-v2","plugins/vne-library-core") as $p)foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator(WP_CONTENT_DIR."/".$p,FilesystemIterator::SKIP_DOTS)) as $f)$out["files"][$f->getPathname()]=hash_file("sha256",$f->getPathname());ksort($out["files"]);echo json_encode($out);'));
 const initial=await state();assert.equal((await run('inspect')).status,'INSPECTED_THEME_PACKAGE');assert.equal(await journal(),'ABSENT');assert.deepEqual(await state(),initial);checks.push('inspect verifies exact payload/ref/archive pins without writing journal or application');
 for(const patch of [{hash:'0'.repeat(64)},{sha:'c'.repeat(40)},{config:Buffer.from(JSON.stringify({...context,home:'https://wrong.invalid'})).toString('base64')}])assert.ok((await run('install',patch)).error);
 assert.equal(await journal(),'ABSENT');assert.deepEqual(await state(),initial);checks.push('wrong manifest/ref/home rejected before application writes');
 const bytes=p.buffers['theme.zip'];await put(context.inbox+'/theme.zip',Buffer.concat([bytes,Buffer.from('tamper')]));assert.ok((await run('install')).error);await put(context.inbox+'/theme.zip',bytes);checks.push('tampered package refused before WordPress upgrade');
 await php('chmod("/wordpress-private/control",0755);');assert.ok((await run('install')).error);await php('chmod("/wordpress-private/control",0700);');
 await php('symlink("/wordpress-private/control","/wordpress-private/link");');assert.ok((await run('install',{config:Buffer.from(JSON.stringify({...context,control:'/wordpress-private/link'})).toString('base64')})).error);checks.push('nonprivate permissions and symlink control path refused');
 const target='/wordpress/wp-content/themes/vibelab-v2/style.css',originalCss=await php('echo base64_encode(file_get_contents('+JSON.stringify(target)+'));');await put(target,Buffer.from(originalCss,'base64').toString()+'\n/* outside edit */');assert.match((await run('install')).error,/drift/);await put(target,Buffer.from(originalCss,'base64'));assert.equal(await journal(),'ABSENT');checks.push('live theme baseline drift is retained and blocks installation');
 assert.equal((await run('install')).status,'PENDING_HEALTH');const installed=await state();assert.deepEqual(installed.data,initial.data);assert.notDeepEqual(installed.files,initial.files);checks.push('actual PHP installer uses WordPress native upgrader and preserves five application tables');
 const pending=await journal();assert.ok((await run('install')).error);assert.equal(await journal(),pending);checks.push('pending/repeated install cannot overwrite unresolved journal');
 const home=await fetch(context.home+'/',{signal:AbortSignal.timeout(30000)}),html=await home.text();assert.equal(home.status,200);assert.ok(html.includes(p.manifest.themeMarker)&&html.includes('data-installer-fixture="true"')&&html.includes('style.css?ver='+p.manifest.themeVersion));
 const css=await fetch(context.home+'/wp-content/themes/vibelab-v2/style.css',{signal:AbortSignal.timeout(30000)}),cssText=await css.text();assert.equal(css.status,200);assert.equal(sha256(Buffer.from(cssText)),p.manifest.components.theme.files.find(f=>f.path==='vibelab-v2/style.css').sha256);checks.push('fresh local HTTP renders changed PHP template marker and exact candidate CSS');
 // WASM blocks external networking. Feed actual HTTP observations through only the WP transport filter;
 // the production controller still executes its own URL/options/status/body/hash checks.
 const responses=Buffer.from(JSON.stringify({html,css:cssText})).toString('base64');
 const transport='require "/wordpress/wp-load.php";$observed=json_decode(base64_decode("'+responses+'"),true);add_filter("pre_http_request",function($pre,$args,$url)use($observed){if($args["redirection"]!==0||$args["sslverify"]!==true||$args["timeout"]!==20)throw new Exception("HTTP policy changed");return array("headers"=>array(),"response"=>array("code"=>200),"body"=>$observed[str_contains($url,"style.css?")?"css":"html"]);},10,3);';
 assert.equal((await run('finish',{extra:transport})).status,'COMPLETE');assert.equal((await run('apply')).status,'ALREADY_COMPLETE');checks.push('controller validates HTTP status marker CSS hash then completes; duplicate completed apply is idempotent');
 const completed=await journal();await put(context.clone+'/refs/heads/release-production','c'.repeat(40)+'\n');assert.ok((await run('apply')).error);assert.equal(await journal(),completed);await put(context.clone+'/refs/heads/release-production',payload+'\n');checks.push('changed Git payload ref blocks retries and preserves receipt');
 // Owned fixture resets only: production exposes no reset/delete-journal command.
 const resetPending=async patch=>{const j=JSON.parse(completed);Object.assign(j,{status:'PENDING_HEALTH'},patch);await put(context.control+'/theme-active.json',JSON.stringify(j));await php('chmod("/wordpress-private/control/theme-active.json",0600);');};
 await resetPending({startedAt:Math.floor(Date.now()/1000)-301});const expired=await journal();assert.match((await run('finish')).error,/timeout/);assert.equal(await journal(),expired);checks.push('expired pending release is retained for inspection rather than automatic recovery');
 await resetPending({status:'INSTALLING'});const interrupted=await journal();assert.ok((await run('apply')).error);assert.ok((await run('rollback')).error);assert.equal(await journal(),interrupted);checks.push('partial/crashed installation never guesses rollback state or clears journal');
 await resetPending();const wrong=JSON.parse(await journal());wrong.manifestSha256='0'.repeat(64);await put(context.control+'/theme-active.json',JSON.stringify(wrong));const conflict=await journal();assert.ok((await run('finish')).error);assert.equal(await journal(),conflict);checks.push('conflicting approval/journal cannot be relabelled');
 await resetPending();const failure='require "/wordpress/wp-load.php";add_filter("pre_http_request",fn()=>new WP_Error("fixture_http_failure","HTTP unavailable"));';
 const rolled=await run('finish',{extra:failure});assert.equal(rolled.status,'ROLLED_BACK');assert.match(rolled.healthFailure,/health/);assert.deepEqual(await state(),initial);assert.ok((await run('apply')).error);checks.push('failed health restores exact previous theme and data, retains rolled-back journal and blocks automatic reapply');
 // Run the one-shot production entry path on the same native code, using previously verified HTTP bytes.
 await php('unlink("/wordpress-private/control/theme-active.json");');assert.equal((await run('apply',{extra:transport})).status,'COMPLETE');assert.deepEqual((await state()).data,initial.data);checks.push('one-shot apply executes install and checked finish without calling WP-CLI');
 assert.deepEqual(readdirSync(join(directory,'wp-content/upgrade')),[]);checks.push('WordPress upgrade workspace and maintenance cleaned after successful install and rollback');
 const actual=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim(),out=resolve('artifacts/theme-host-installer',digest);mkdirSync(out,{recursive:true});
 if(process.env.GITHUB_OUTPUT)writeFileSync(process.env.GITHUB_OUTPUT,'directory='+out+'\n',{flag:'a'});
 const result={status:'PASS_THEME_HOST_INSTALLER',sourceSha:actual,controllerSha256:digest,checks:checks.length,cases:checks,fixtureOnly:true,hostingContacted:false,productionAuthorized:false,wpCliRequired:false,keysRequired:false,httpTransport:'WordPress transport filter carrying actual local HTTP observations; no live HTTPS certification',elapsedMs:Date.now()-started};
 const manifest={format:1,profile:'vibelab-theme-host-installer-v1',sourceSha:actual,scope:'private-cli-tool-only',files:[{path:'theme-host-installer.php',bytes:controller.length,sha256:digest}],productionAuthorized:false,applicationPayloadIncluded:false};
 writeFileSync(join(out,'theme-host-installer.php'),controller);writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');writeFileSync(join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');
 const command='/opt/plesk/php/8.3/bin/php -r \'$p="/var/www/vhosts/vneconomics.com/deploy-tools/theme-host/theme-host-installer.php";if(hash_file("sha256",$p)!=="'+digest+'")throw new RuntimeException("Installer pin differs");require $p;vne_theme_host_main($argv);\' -- apply <APPROVED_PAYLOAD_SHA> <APPROVED_MANIFEST_SHA256>';
 writeFileSync(join(out,'post-deploy-command.txt'),'REVIEW TEMPLATE ONLY — not configured or authorized on production.\n'+command+'\n');console.log(JSON.stringify({...result,directory:out}));
} finally { if(app)await app[Symbol.asyncDispose]();for(const [path,d] of preserved)assert.equal(sha256(readFileSync(path)),d,'Existing local database/config changed'); }
