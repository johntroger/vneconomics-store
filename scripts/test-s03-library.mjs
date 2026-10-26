import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {randomBytes,createHash} from 'node:crypto';
const playwrightPath=join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const {chromium}=await import(pathToFileURL(playwrightPath).href);
const browserEnv={...process.env};
const {startSite}=await import('./local-runtime.mjs');
const liveFiles=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>liveFiles.map(path=>createHash('sha256').update(readFileSync(path)).digest('hex'));
const before=hashes();const password=randomBytes(24).toString('hex');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s03-'));
const evidence=resolve('docs/acceptance/S03');mkdirSync(evidence,{recursive:true});
const deadline=setTimeout(()=>{console.error('FAIL: S03 exceeded 480 seconds');process.exit(1);},480000);deadline.unref();
let app,browser;const base='http://127.0.0.1:19403';
async function php(code){let result;try{result=await app.playground.run({code});}catch(error){throw new Error(error.response?new TextDecoder().decode(Uint8Array.from(Object.values(error.response.bytes))):error.message);}assert.equal(result.errors,'',result.errors);assert.equal(result.exitCode,0,result.text);return result.text;}
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 console.log('PASS browser startup; START S03 fixture WordPress');
 app=await startSite(fixture,19403);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});
 const code=readFileSync('scripts/fixtures/s03-library-checks.php','utf8').replace('<?php',"<?php define('S03_PASSWORD',"+JSON.stringify(password)+");");
 const result=JSON.parse(await php(code));console.log('PASS '+result.checks.length+' PHP model/permissions/API checks');

 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());const errors=[];page.on('pageerror',error=>{errors.push({url:page.url(),stack:error.stack});console.error('BROWSER ERROR '+page.url()+' '+error.stack);});
 console.log('START browser login and manual entry');
 await page.goto(base+'/wp-login.php?redirect_to='+encodeURIComponent(base+'/wp-admin/admin.php?page=vne-library'));
 await page.locator('#user_login').fill('s03editor');await page.locator('#user_pass').fill(password);
 await Promise.all([page.waitForURL(url=>url.pathname.endsWith('admin.php')&&url.searchParams.get('page')==='vne-library'),page.locator('#wp-submit').click()]);
 await page.goto(base+'/wp-admin/admin.php?page=vne-library');await page.waitForLoadState('networkidle');
 assert.match(await page.locator('h1').innerText(),/Nhập liệu/);
 await page.getByLabel('Tiêu đề',{exact:true}).fill('Bản nháp từ form S03');
 await page.getByLabel('Công dụng ngắn',{exact:true}).fill('Kiểm tra nhập tay qua trình duyệt');
 await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Lưu nội dung',exact:true}).click()]);
 assert.match(await page.locator('.notice-success').innerText(),/Đã lưu/);
 assert.equal(await page.getByLabel('Tiêu đề',{exact:true}).inputValue(),'Bản nháp từ form S03');
 await page.screenshot({path:join(evidence,'admin-manual-entry.png'),fullPage:false});
 const nonceResult=await page.evaluate(async()=>{
   const form=new URLSearchParams({operation:'item',title:'CSRF MUST NOT SAVE',status:'draft'});
   const response=await fetch('/wp-admin/admin.php?page=vne-library',{method:'POST',body:form});
   return response.status;
 });
 assert.equal(nonceResult,403,'missing nonce rejected');
 console.log('PASS manual form save and missing nonce rejection');
 const publicResponse=await fetch(base+'/wp-json/vne-library/v1/items');
 assert.equal(publicResponse.status,200);assert.doesNotMatch(await publicResponse.text(),/INTERNAL-S03|Bản nháp từ form S03|CSRF MUST NOT SAVE/);
 assert.equal((await fetch(base+'/wp-json/wp/v2/vne_resource')).status,404,'generic CPT REST disabled');
 assert.deepEqual(errors,[],'no browser script errors');
 await browser.close();browser=null;
 await app[Symbol.asyncDispose]();app=null;
 console.log('PASS browser manual entry / nonce / anonymous HTTP API; restarting same fixture');
 app=await startSite(fixture,19403);
 const persisted=JSON.parse(await php("<?php require '/wordpress/wp-load.php'; require_once ABSPATH.'wp-admin/includes/plugin.php'; $id=get_option('s03_persist_id'); echo wp_json_encode(array('active'=>is_plugin_active('vne-library-core/vne-library-core.php'),'title'=>get_the_title($id),'state'=>get_post_status($id),'unknown'=>get_post_meta($id,'_vne_resource',true)['claims']['requirements']['value'],'forms'=>count(get_posts(array('post_type'=>'vne_resource','post_status'=>'draft','title'=>'Bản nháp từ form S03')))));"));
 assert.equal(persisted.active,true);assert.equal(persisted.state,'publish');assert.equal(persisted.title,'Tài nguyên mẫu S03');assert.equal(persisted.unknown,null);assert.equal(persisted.forms,1);
 for(const route of ['/','/wp-login.php','/wp-json/']){const response=await fetch(base+route);assert.equal(response.status,200);assert.doesNotMatch(await response.text(),/Fatal error:|Error establishing a database connection/);}
 assert.deepEqual(hashes(),before,'live DB/config unchanged');
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:'2026-10-21',checks:result.checks,browser:['editor login','manual draft save/read','nonce rejection','public HTTP API isolation','generic CPT REST disabled','no page errors'],restart:persisted,baseline:['homepage 200','login 200','REST 200'],liveFilesUnchanged:true},null,2)+'\n');
 console.log('PASS restart persistence, baseline routes, live database/config unchanged');
}finally{
 if(browser)await browser.close();
 if(app)await app[Symbol.asyncDispose]();
 clearTimeout(deadline);
 assert.deepEqual(hashes(),before,'protected live files unchanged after cleanup');
}
