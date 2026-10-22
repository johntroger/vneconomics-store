import {pluginEvidence} from './theme-evidence.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {randomBytes,createHash} from 'node:crypto';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};const {startSite}=await import('./local-runtime.mjs');
const liveFiles=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>liveFiles.map(p=>createHash('sha256').update(readFileSync(p)).digest('hex'));
const before=hashes(),password=randomBytes(24).toString('hex');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s05-'));
const evidence=resolve(process.argv.includes('--s12')?'docs/acceptance/S12/S05-regression':process.argv.includes('--s11')?'docs/acceptance/S11/S05-regression':'docs/acceptance/S05');mkdirSync(evidence,{recursive:true});
const deadline=setTimeout(()=>{console.error('FAIL S05 exceeded 1200 seconds');process.exit(1);},1200000);deadline.unref();
let app,browser;const base='http://127.0.0.1:19405';
async function php(code){let r;try{r=await app.playground.run({code});}catch(e){throw new Error(e.response?new TextDecoder().decode(Uint8Array.from(Object.values(e.response.bytes))):e.message);}assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;}
async function login(user,path){
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const page=await context.newPage();await page.goto(base+'/wp-login.php?redirect_to='+encodeURIComponent(base+path));
 await page.locator('#user_login').fill(user);await page.locator('#user_pass').fill(password);
 await Promise.all([page.waitForURL(url=>url.pathname.endsWith('admin.php')),page.locator('#wp-submit').click()]);
 await page.goto(base+path);await page.waitForLoadState('networkidle');
 return {context,page};
}
async function rest(page,path,method='GET',body){
 return page.evaluate(async({path,method,body})=>{
   const nonce=await (await fetch('/wp-admin/admin-ajax.php?action=rest-nonce')).text();
   const response=await fetch('/wp-json/vne-library/v1'+path,{method,headers:{'Content-Type':'application/json','X-WP-Nonce':nonce},...(body?{body:JSON.stringify(body)}:{})});
   return {status:response.status,body:await response.json(),headers:Object.fromEntries(response.headers)};
 },{path,method,body});
}
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 app=await startSite(fixture,19405);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});
 const regression=JSON.parse(await php(readFileSync('scripts/fixtures/s03-library-checks.php','utf8').replace('<?php',"<?php define('S03_PASSWORD',"+JSON.stringify(password)+");")));
 console.log('PASS S03 regression '+regression.checks.length);
 const state=JSON.parse(await php(readFileSync('scripts/fixtures/s04-state-checks.php','utf8')));
 console.log('PASS S04 regression '+state.checks.length+' / matrix '+state.matrix.length);
 const result=JSON.parse(await php(readFileSync('scripts/fixtures/s05-revision-checks.php','utf8').replace('<?php',"<?php define('S03_PASSWORD',"+JSON.stringify(password)+" );" )));
 console.log('PASS S05 backend '+result.checks.length);
 const errors=[];const adminPath='/wp-admin/admin.php?page=vne-library&id='+result.ui_id;
 const first=await login('s03editor',adminPath);const page=first.page;page.on('pageerror',e=>errors.push(e.stack));
 const oldFormBase=await page.locator('input[name="base_revision"]').inputValue();
 const externalEdit=await rest(page,'/items/'+result.ui_id,'POST',{...result.ui_payload,title:'UI edited elsewhere',base_revision:oldFormBase});assert.equal(externalEdit.status,200);
 await page.getByLabel('Tiêu đề',{exact:true}).fill('UI stale overwrite must fail');
 for(let retry=0;retry<2;retry++){
   await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Lưu nội dung',exact:true}).click()]);
   assert.match(await page.locator('.notice-error').innerText(),/Phiên bản đã đổi/);
   assert.equal(await page.locator('input[name="base_revision"]').inputValue(),oldFormBase,'stale form must not silently rebase itself');
   const latest=await (await fetch(base+'/wp-json/vne-library/v1/items/'+result.ui_id)).json();assert.equal(latest.title,'UI edited elsewhere');
 }
 const latestEdit=await rest(page,'/items/'+result.ui_id+'?context=edit');
 const restore=await rest(page,'/items/'+result.ui_id,'POST',{...result.ui_payload,base_revision:latestEdit.body.approved_revision});assert.equal(restore.status,200);
 await page.goto(base+adminPath);await page.waitForLoadState('networkidle');
 await page.getByLabel('Tiêu đề',{exact:true}).fill('UI-Bản sửa riêng S05');
 await page.getByLabel('Nội dung (HTML cơ bản)',{exact:true}).fill('<p>Nội dung thử S05 trên trình duyệt.</p>');
 await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Tạo bản sửa chờ duyệt',exact:true}).click()]);
 assert.match(await page.locator('.notice-success').innerText(),/Đã lưu/);
 assert.equal(await page.getByLabel('Tiêu đề',{exact:true}).inputValue(),result.ui_original);
 let publicBody=await (await fetch(base+'/wp-json/vne-library/v1/items/'+result.ui_id)).json();
 assert.equal(publicBody.title,result.ui_original);
 const list=await rest(page,'/items/'+result.ui_id+'/proposals');assert.equal(list.status,200);
 const proposal=list.body.find(p=>p.payload.title==='UI-Bản sửa riêng S05');assert.ok(proposal);assert.deepEqual([...proposal.changed_fields].sort(),['content','title']);
 const previewPath='/wp-admin/admin.php?page=vne-library-preview&proposal='+proposal.id;
 for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   await page.setViewportSize({width,height});const response=await page.goto(base+previewPath);await page.waitForLoadState('networkidle');
   assert.match(response.headers()['cache-control'],/no-store/);assert.match(response.headers()['x-robots-tag'],/noindex/);
   assert.equal(await page.locator('[data-preview-card] h2').innerText(),'UI-Bản sửa riêng S05');
   assert.equal(await page.locator('[data-preview-detail] h2').innerText(),'UI-Bản sửa riêng S05');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'preview overflow '+label);
   await page.screenshot({path:join(evidence,'private-preview-'+label+'.png'),fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});
 const denied=await fetch(base+'/wp-json/vne-library/v1/proposals/'+proposal.id+'/preview');
 assert.equal(denied.status,403);assert.match(denied.headers.get('cache-control'),/no-store/);assert.match(denied.headers.get('x-robots-tag'),/noindex/);
 assert.doesNotMatch(await denied.text(),/UI-Bản sửa riêng S05/);
 assert.equal((await fetch(base+'/wp-json/wp/v2/vne_proposal')).status,404);
 const csrf=await page.evaluate(async(id)=>{const r=await fetch('/wp-admin/admin.php?page=vne-library&id='+id,{method:'POST',body:new URLSearchParams({operation:'approve'})});return r.status;},result.ui_id);
 assert.equal(csrf,403);
 await page.getByLabel('Ghi chú duyệt hoặc bỏ',{exact:true}).fill('Duyệt fixture từ trình duyệt');
 await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'Duyệt bản sửa',exact:true}).click()]);
 assert.match(await page.locator('.notice-success').innerText(),/Đã lưu/);
 publicBody=await (await fetch(base+'/wp-json/vne-library/v1/items/'+result.ui_id)).json();
 assert.equal(publicBody.title,'UI-Bản sửa riêng S05');
 console.log('PASS browser propose/private preview/approve/headers/nonce');
 mkdirSync(join(fixture,'wp-content/mu-plugins'),{recursive:true});
 writeFileSync(join(fixture,'wp-content/mu-plugins/s05-concurrency-fixture.php'),"<?php add_action('vne_library_before_approval_commit',function($id,$pid,$decision){if($id==="+result.race_id+"&&$decision==='approved'){usleep(400000);}},10,3);");
 const second=await login('s05reviewer2','/wp-admin/admin.php?page=vne-library&id='+result.race_id);
 const race=await Promise.all([rest(page,'/proposals/'+result.race_a+'/approve','POST',{reason:'Reviewer A race fixture'}),rest(second.page,'/proposals/'+result.race_b+'/approve','POST',{reason:'Reviewer B race fixture'})]);
 assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);
 const racePublic=await (await fetch(base+'/wp-json/vne-library/v1/items/'+result.race_id)).json();
 assert.ok(['Race winner A','Race winner B'].includes(racePublic.title));
 const raceRecords=await rest(page,'/items/'+result.race_id+'/proposals');
 assert.equal(raceRecords.body.filter(p=>p.status==='approved').length,1);
 assert.equal(raceRecords.body.filter(p=>p.status==='pending').length,1);
 assert.deepEqual(errors,[]);
 console.log('PASS two reviewers concurrent HTTP: one approve, one conflict');
 await browser.close();browser=null;await app[Symbol.asyncDispose]();app=null;
 app=await startSite(fixture,19405);
 const persisted=JSON.parse(await php("<?php require '/wordpress/wp-load.php'; $ids=get_option('s05_persist_ids'); echo wp_json_encode(array('title'=>vne_library_item($ids['ui'])['title'],'race_title'=>vne_library_item($ids['race'])['title'],'history'=>count(get_post_meta($ids['ui'],'_vne_approval',false)),'ui_author'=>(int)get_post_field('post_author',$ids['ui']),'schema'=>get_option('vne_library_schema_version')));"));
 assert.equal(persisted.title,'UI-Bản sửa riêng S05');assert.equal(persisted.race_title,racePublic.title);assert.equal(persisted.history,4);assert.equal(persisted.ui_author,result.ui_author);assert.equal(Number(persisted.schema),3);
 for(const path of ['/','/wp-login.php','/wp-json/']){const r=await fetch(base+path);assert.equal(r.status,200);assert.doesNotMatch(await r.text(),/Fatal error:|Error establishing a database connection/);}
 assert.deepEqual(hashes(),before);
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:process.argv.includes('--s11')?'2026-10-22':'2026-10-21',testedPluginHashes:process.argv.includes('--s11')?pluginEvidence(fixture):undefined,regression:regression.checks,stateRegression:state.checks,matrix:state.matrix,checks:result.checks,browser:['propose without changing public','desktop/mobile private preview','no-store/noindex including denied REST','nonce 403','approve from UI','no page errors','stale manual form retries remain conflicted'],concurrentApproval:{statuses:race.map(r=>r.status),winner:racePublic.title},restart:persisted,liveFilesUnchanged:true},null,2)+'\n');
 console.log('PASS S05 restart, baseline, protected files unchanged');
}finally{
 if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(deadline);assert.deepEqual(hashes(),before);
}
