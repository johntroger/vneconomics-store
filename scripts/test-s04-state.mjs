import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {randomBytes,createHash} from 'node:crypto';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};
const {startSite}=await import('./local-runtime.mjs');
const liveFiles=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>liveFiles.map(path=>createHash('sha256').update(readFileSync(path)).digest('hex'));
const before=hashes(),password=randomBytes(24).toString('hex');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s04-'));
const evidence=resolve('docs/acceptance/S04');mkdirSync(evidence,{recursive:true});
const deadline=setTimeout(()=>{console.error('FAIL S04 exceeded 900 seconds');process.exit(1);},900000);deadline.unref();
let app,browser;const base='http://127.0.0.1:19404';
async function php(code){
 let result;try{result=await app.playground.run({code});}catch(error){throw new Error(error.response?new TextDecoder().decode(Uint8Array.from(Object.values(error.response.bytes))):error.message);}
 assert.equal(result.errors,'',result.errors);assert.equal(result.exitCode,0,result.text);return result.text;
}
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 console.log('START S04 isolated WordPress');
 app=await startSite(fixture,19404);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});
 const regression=JSON.parse(await php(readFileSync('scripts/fixtures/s03-library-checks.php','utf8').replace('<?php',"<?php define('S03_PASSWORD',"+JSON.stringify(password)+");")));
 console.log('PASS S03 regression: '+regression.checks.length);
 const result=JSON.parse(await php(readFileSync('scripts/fixtures/s04-state-checks.php','utf8')));
 console.log('PASS S04 assertions: '+result.checks.length+'; matrix combinations: '+result.matrix.length);
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const errors=[];page.on('pageerror',error=>{errors.push({url:page.url(),stack:error.stack});console.error(error.stack);});
 console.log('START S04 browser state form');
 const adminPath='/wp-admin/admin.php?page=vne-library&id='+result.resource_id;
 await page.goto(base+'/wp-login.php?redirect_to='+encodeURIComponent(base+adminPath));
 await page.locator('#user_login').fill('s03editor');await page.locator('#user_pass').fill(password);
 await Promise.all([page.waitForURL(url=>url.pathname.endsWith('admin.php')&&url.searchParams.get('page')==='vne-library'),page.locator('#wp-submit').click()]);
 await page.goto(base+adminPath);await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('#vne-state').count(),1,'state form rendered');
 await page.screenshot({path:join(evidence,'state-before-save.png'),fullPage:false});
 await page.getByLabel('Khuyến nghị',{exact:true}).selectOption('suspended');
 await page.getByLabel('Lý do quyết định khuyến nghị',{exact:true}).fill('Quyết định từ form S04');
 await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Lưu trạng thái',exact:true}).click()]);
 assert.match(await page.locator('.notice-success').innerText(),/Đã lưu/);
 assert.equal(await page.locator('[data-vne-badge]').getAttribute('data-vne-badge'),'suspended');
 await page.locator('#vne-state').scrollIntoViewIfNeeded();
 await page.screenshot({path:join(evidence,'state-manual-entry.png'),fullPage:false});
 const nonceStatus=await page.evaluate(async(path)=>{const response=await fetch(path,{method:'POST',body:new URLSearchParams({operation:'state'})});return response.status;},adminPath);
 assert.equal(nonceStatus,403);
 const httpState=await (await fetch(base+'/wp-json/vne-library/v1/items/'+result.resource_id)).json();
 assert.equal(httpState.derived.primary_badge,'suspended');assert.equal(httpState.derived.cta.href,null);
 assert.ok(!('state_input' in httpState)&&!('validations' in httpState));
 const httpGuide=await (await fetch(base+'/wp-json/vne-library/v1/items/'+result.guide_id)).json();
 assert.ok(httpGuide.derived.warnings.some(warning=>warning.code==='dependency_suspended'&&warning.step==='Bước 2'));
 // The guide branch has its own dependency picker and validation form.
 await page.goto(base+'/wp-admin/admin.php?page=vne-library&id='+result.guide_id);await page.waitForLoadState('networkidle');
 await page.getByLabel('Tài nguyên phụ thuộc',{exact:true}).selectOption(String(result.resource_id));
 await page.getByLabel('Bước phụ thuộc',{exact:true}).fill('Bước 2');
 await page.getByLabel('Công cụ phụ thuộc',{exact:true}).fill('Fixture tool');
 await page.getByLabel('Phiên bản phụ thuộc',{exact:true}).fill('fixture-1');
 await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Gắn hoặc đối chiếu lại liên kết',exact:true}).click()]);
 assert.match(await page.locator('.notice-success').innerText(),/Đã lưu/);
 assert.equal(await page.locator('[data-vne-badge]').getAttribute('data-vne-badge'),'review_needed');
 await page.getByLabel('Kết quả thử',{exact:true}).selectOption('fail');
 for(const [label,value] of [['Ngày thử YYYY-MM-DD','2026-10-21'],['Hệ điều hành thử','Windows fixture'],['Công cụ thử','Fixture tool'],['Phiên bản công cụ','fixture-1'],['Đầu vào đã thử','Đầu vào fixture qua form'],['Kết quả quan sát','Kết quả chưa đạt fixture'],['URL bằng chứng HTTPS','https://example.com/browser-fixture-evidence'],['Checklist và kết quả (mỗi dòng một mục)','Bước 2: chưa đạt trong fixture']]){await page.getByLabel(label,{exact:true}).fill(value);}
 await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Lưu bằng chứng thử',exact:true}).click()]);
 assert.match(await page.locator('.notice-success').innerText(),/Đã lưu/);
 const guideAfter=await (await fetch(base+'/wp-json/vne-library/v1/items/'+result.guide_id)).json();
 assert.equal(guideAfter.derived.latest_validation.outcome,'fail');assert.equal(guideAfter.derived.validation_status,'review_needed');
 await page.locator('#vne-state').scrollIntoViewIfNeeded();await page.screenshot({path:join(evidence,'guide-dependency-evidence.png'),fullPage:false});
 assert.deepEqual(errors,[]);
 await browser.close();browser=null;
 await app[Symbol.asyncDispose]();app=null;
 console.log('PASS browser state save, nonce, HTTP public resolver; restarting');
 app=await startSite(fixture,19404);
 const persisted=JSON.parse(await php("<?php require '/wordpress/wp-load.php'; $ids=get_option('s04_persist_ids'); echo wp_json_encode(array('state'=>vne_library_resolve_state($ids['resource']),'guide'=>vne_library_resolve_state($ids['guide']),'history_count'=>count(vne_library_validations($ids['resource'])),'guide_history_count'=>count(vne_library_validations($ids['guide'])),'schema'=>get_option('vne_library_schema_version')));"));
 assert.equal(persisted.state.primary_badge,'suspended');assert.equal(persisted.guide.validation_status,'review_needed');
 assert.equal(persisted.history_count,2);assert.equal(persisted.guide_history_count,3);assert.equal(Number(persisted.schema),3);
 for(const route of ['/','/wp-login.php','/wp-json/']){const response=await fetch(base+route);assert.equal(response.status,200);assert.doesNotMatch(await response.text(),/Fatal error:|Error establishing a database connection/);}
 assert.deepEqual(hashes(),before);
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:'2026-10-21',regressionChecks:regression.checks,stateChecks:result.checks,matrix:result.matrix,browser:['editor login','state form saved','nonce 403','HTTP public state matches','guide step warning','no page errors','manual dependency bind','manual validation append'],restart:persisted,baseline:['home 200','login 200','REST 200'],liveFilesUnchanged:true},null,2)+'\n');
 console.log('PASS S04 restart, baseline, protected local DB/config unchanged');
}finally{
 if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(deadline);
 assert.deepEqual(hashes(),before,'protected files unchanged after test');
}
