import {themeEvidence} from './theme-evidence.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash,randomBytes} from 'node:crypto';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};const {startSite}=await import('./local-runtime.mjs');
const files=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>files.map(p=>createHash('sha256').update(readFileSync(p)).digest('hex'));
const before=hashes(),checks=[],errors=[],badHTTP=[];
const check=(value,label)=>{assert.ok(value,label);checks.push(label);};
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s08-'));
const evidence=resolve(process.argv.includes('--s10')?'docs/acceptance/S10/S08-regression':process.argv.includes('--s09')?'docs/acceptance/S09/S08-regression':'docs/acceptance/S08');mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:19408',password=randomBytes(24).toString('hex');let app,browser;
const deadline=setTimeout(()=>{console.error('FAIL S08 exceeded 1200 seconds');process.exit(1);},1200000);deadline.unref();
async function php(code){let r;try{r=await app.playground.run({code});}catch(e){throw new Error(e.response?new TextDecoder().decode(Uint8Array.from(Object.values(e.response.bytes))):e.message);}assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;}
async function pageFor(options={}){
 const context=await browser.newContext(options);
 await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)badHTTP.push({url:r.url(),status:r.status()});});return {context,page};
}
async function go(page,url){const r=await page.goto(url);assert.equal(r.status(),200,url);await page.waitForLoadState('networkidle');assert.doesNotMatch(await page.content(),/Fatal error:|Warning:|Notice:|MUST-NOT-LEAK|INTERNAL-S08/);}
async function capture(page,name,allowBlockedAdminMedia=false){
 for(const img of await page.locator('img').all()){
  const src=await img.getAttribute('src');
  if(src&&new URL(src,base).origin!==base){assert.ok(allowBlockedAdminMedia,'public page must not contain external media');continue;}
  await img.scrollIntoViewIfNeeded();await img.evaluate(n=>n.decode());assert.ok(await img.evaluate(n=>n.naturalWidth>0));
 }
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:join(evidence,name+'.png'),fullPage:true});
 if(['detail-desktop','detail-mobile','detail-small-mobile','detail-unavailable','detail-tested-fixture','detail-stale-evidence','detail-conflicted-claim'].includes(name)){await page.screenshot({path:join(evidence,name+'-top.png')});}
}
async function response(url){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});return {status:r.status,html:await r.text(),headers:Object.fromEntries(r.headers)};}
async function change(id,body){
 return php("<?php require '/wordpress/wp-load.php';wp_set_current_user(get_user_by('login','admin')->ID);$id="+id+";$item=vne_library_item($id);$p=array_intersect_key($item,array_flip(array('post_type','title','content','excerpt','status','primary_category','categories','needs','tools','data','document_source')));"+body+"$result=vne_library_save_item($p,$id,vne_library_item($id,true)['approved_revision']);if(is_wp_error($result)){throw new Exception($result->get_error_message());}echo 'saved';");
}
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 console.log('START S08 isolated WordPress');
 app=await startSite(fixture,19408);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});
 cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 const obs=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
 const seed=JSON.parse(await php(readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(obs)+");")));
 const result=JSON.parse(await php(readFileSync('scripts/fixtures/s08-detail-seed.php','utf8').replace('<?php',"<?php define('S08_BASE',"+JSON.stringify(JSON.stringify(seed))+");define('S08_PASSWORD',"+JSON.stringify(password)+");")));
 console.log('PASS S08 fixture setup');
 if(process.argv.includes('--s09')){
  const invalidTax=await Promise.all([response(base+'/danh-muc/khong-ton-tai-s09/'),response(base+'/danh-muc/khong-ton-tai-s09/?s=css&vne_find=1')]);
  check(invalidTax.every(r=>r.status===404&&!/RAW-S08|PENDING-S08/.test(r.html)),'S09 unknown taxonomy remains404 with and without keyword, no broadened search');
 }
 const {context,page}=await pageFor({viewport:{width:1440,height:1000}});
 await go(page,result.target_url);
 check(await page.locator('[data-resource-detail="'+result.target+'"]').count()===1,'native single resource template');
 check(await page.locator('h1').count()===1&&await page.locator('h1').innerText()==='Web Design Guidelines','one h1, approved canonical title only');
 check((await page.title()).includes('Web Design Guidelines')&&!(await page.title()).includes('RAW-'),'head title uses approved snapshot');
 const source=page.locator('.detail-actions a[target="_blank"]');
 check(await source.getAttribute('href')===result.source,'primary source keeps exact repository skill path');
 check((await source.getAttribute('rel')).includes('noopener')&&(await source.getAttribute('rel')).includes('noreferrer'),'source has safe new-tab rel and accessible hint');
 check(await page.locator('.detail-claims article').count()===5,'five explicit decision conditions');
 check(await page.locator('.claim-value').allTextContents().then(a=>a.every(v=>v==='Chưa xác định')),'unknown claims not rendered as free/compatible/licensed');
 check((await page.locator('#nguon').innerText()).includes(result.source_path)&&(await page.locator('#nguon').innerText()).includes(result.source_revision),'real source path and recorded revision');
 check(!(await page.locator('#gioi-thieu').innerText()).includes('QA-CODE-BLOCKED')&&await page.locator('.code-restricted').count()===1,'unverified pre code withheld');
 check(await page.locator('#gioi-thieu img,#gioi-thieu form,#gioi-thieu iframe').count()===0,'intro strips remote media/forms');
 const ids=await page.locator('[id]').evaluateAll(ns=>ns.map(n=>n.id));
 check(new Set(ids).size===ids.length,'content IDs cannot collide with page sections');
 const example=page.getByRole('link',{name:'Đọc ví dụ trong bài',exact:true});const href=await example.getAttribute('href');
 check(href.startsWith('#detail-content-')&&await page.locator(href).count()===1,'content anchors rewritten to real unique target');
 check(await page.locator('.content-reference-unlinked').count()===1&&await page.locator('.content-reference-unlinked').getAttribute('href')===null,'missing content anchor becomes text');
 check(await page.locator('#gioi-thieu a').filter({hasText:'Nguồn giới thiệu'}).getAttribute('target')==='_blank','intro outbound links disclose new tab');
 const related=await page.locator('#cung-danh-muc [data-resource-id]').evaluateAll(ns=>ns.map(n=>Number(n.dataset.resourceId)));
 check(related.length===3&&related.every(id=>id!==result.target&&id!==result.private&&!result.related.slice(3).includes(id)),'related max3 approved same-category, no self/private/suspended/unavailable');
 check(await page.locator('.detail-guides').innerText().then(t=>t.includes('Bài đọc cùng chủ đề S08')&&t.includes('chưa khẳng định')),'guide relation truthful, not certified installation route');
 check(await page.locator('.detail-evidence').innerText().then(t=>t.includes('Chưa có bằng chứng chạy thử')),'no invented environment or trial evidence');
 for(const [name,width,height]of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844],['small-mobile',320,800]]){
  await page.setViewportSize({width,height});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'detail no overflow '+name);await capture(page,'detail-'+name);
 }
 const nav=page.getByRole('navigation',{name:'Nội dung trang tài nguyên'});
 for(const anchor of await nav.locator('a').all()){const id=await anchor.getAttribute('href');assert.equal(await page.locator(id).count(),1);}
 check(true,'every detail navigation anchor resolves');
 const stateLink=nav.getByRole('link',{name:'Tình trạng',exact:true});await stateLink.focus();await page.keyboard.press('Enter');
 check(page.url().endsWith('#tinh-trang')&&await page.evaluate(()=>document.activeElement.id)==='tinh-trang','keyboard native anchor moves focus to state section');
 console.log('PASS S08 approved data, claims, related, responsive and anchors');
 await go(page,result.lonely_url);
 check(await page.locator('#cung-danh-muc,.detail-guides').count()===0&&await nav.getByRole('link',{name:'Cùng danh mục',exact:true}).count()===0,'empty relations omitted with no dead tab');
 check(await page.locator('#gioi-thieu').innerText().then(t=>t.includes('Chưa có giới thiệu chi tiết')),'missing intro honestly explained');
 await capture(page,'detail-empty');
 await change(result.lonely,"$p['title']='QA '.str_repeat('TieudeRatDai',18);$p['content']='<p>'.str_repeat('NoidungLienTuc',30).'</p>';");await go(page,result.lonely_url);await page.setViewportSize({width:320,height:800});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'long unbroken approved title and text stay within 320px');await capture(page,'detail-long-title');
 await go(page,result.tested_url);
 check(await page.locator('.detail-badges').innerText().then(t=>t.includes('Đã thử đúng phiên bản')),'tested badge requires current resolver evidence');
 check(await page.locator('.evidence-validity').innerText().then(t=>t.includes('hiện hành')),'evidence current qualification');
 check(await page.locator('.detail-evidence').innerText().then(t=>['Windows QA','Agent QA','1.0 QA','Đầu vào QA','Đầu ra QA','Điểm kiểm tra QA hai'].every(v=>t.includes(v))),'recorded environment, IO and checklist visible');
 check(await page.locator('#gioi-thieu pre').innerText()==='QA-CODE-ALLOWED','current verified fixture pre block permitted');
 check(await page.locator('.claim-status').count()===5,'upstream values explicitly attributed');
 await capture(page,'detail-tested-fixture');
 await change(result.tested,"$p['data']['source_revision']='qa-tested-r2';");
 await go(page,result.tested_url);
 check(await page.locator('.detail-badges').innerText().then(t=>t.includes('Cần kiểm tra lại')&&!t.includes('Đã thử đúng phiên bản')),'changed revision invalidates tested label');
 check(await page.locator('.evidence-validity').innerText().then(t=>t.includes('chưa được dùng')),'old pass remains historical, not current certification');
 check(await page.locator('#gioi-thieu pre').count()===0&&await page.locator('.code-restricted').count()===1,'stale evidence closes code gate');
 await capture(page,'detail-stale-evidence');
 console.log('PASS S08 current and stale trial evidence');
 const stateCode="<?php require '/wordpress/wp-load.php';wp_set_current_user(get_user_by('login','admin')->ID);$state=vne_library_default_state();$state['source_access']=array('status'=>'unavailable','source_url'=>'https://example.com/qa','observed_at'=>'2026-10-21','note'=>'QA không truy cập được');$state['maintenance']=array('status'=>'archived','source_url'=>'https://example.com/qa','observed_at'=>'2026-10-21','note'=>'QA archived');$state['recommendation']['reason']='QA repo archived, giữ trang giải thích';";
 await php(stateCode+"$r=vne_library_save_state("+result.target+",$state);if(is_wp_error($r))throw new Exception($r->get_error_message());");
 await go(page,result.target_url);
 check(await source.count()===0&&await page.locator('.detail-actions a').first().getAttribute('href')===result.target_url+'#tinh-trang','unavailable primary CTA opens explanation, no repo CTA');
 check(await page.locator('#gioi-thieu a[href],#dieu-kien a[target="_blank"],#nguon a[target="_blank"],#tinh-trang a[target="_blank"]').count()===0,'blocked item has no source/reference/intro outbound links');
 check(await page.locator('#tinh-trang').innerText().then(t=>t.includes('archived')&&t.includes('QA không truy cập được')),'secondary archived and unavailable observation preserved');
 await capture(page,'detail-unavailable');
 await php(stateCode+"$state['recommendation']=array('status'=>'suspended','reason'=>'QA dừng đề xuất S08');$r=vne_library_save_state("+result.target+",$state);if(is_wp_error($r))throw new Exception($r->get_error_message());");
 await go(page,result.target_url);
 check(await page.locator('#tinh-trang').innerText().then(t=>t.includes('QA dừng đề xuất S08'))&&await source.count()===0,'suspension reason visible without active repo CTA');
 await capture(page,'detail-suspended');
 await change(result.tested,"$p['data']['claims']['cost']=array('value'=>null,'verification_status'=>'conflicted','source_url'=>null,'observed_at'=>'2026-10-21','note'=>'QA hai nguồn không thống nhất chi phí','conflict_sources'=>array('https://example.com/cost-a','https://example.com/cost-b'));");
 await go(page,result.tested_url);
 check(await page.locator('#dieu-kien-cost').innerText().then(t=>t.includes('Thông tin mâu thuẫn')&&t.includes('QA hai nguồn')),'conflicted claim explains uncertainty');
 check(await page.locator('#dieu-kien-cost a').count()===2,'conflict cites both actual recorded references');
 await capture(page,'detail-conflicted-claim');
 console.log('PASS S08 unavailable/suspended/conflicted variants');
 // Unpublish all other members: next request must not keep per-request related cache.
 await php("<?php require '/wordpress/wp-load.php';global $wpdb;$wpdb->query(\"UPDATE {$wpdb->posts} SET post_status='draft' WHERE post_type IN ('vne_resource','vne_guide') AND ID<>"+result.target+"\");wp_cache_flush();");
 await go(page,result.target_url);
 check(await page.locator('#cung-danh-muc,.detail-guides').count()===0,'withdrawn related resources and guides disappear next request');
 const hidden=await response(result.private_url),draft=await response(result.draft_url);
 check(hidden.status===404&&draft.status===404&&!hidden.html.includes('PRIVATE-RESOURCE-S08')&&!draft.html.includes('DRAFT-RESOURCE-S08'),'anonymous hidden/draft resources 404 without disclosure');
 const preview=base+'/wp-admin/admin.php?page=vne-library-preview&proposal='+result.proposal;
 const denied=await response(base+'/wp-json/vne-library/v1/proposals/'+result.proposal+'/preview');
 check(denied.status===403&&!denied.html.includes('PENDING-CONTENT'),'anonymous proposal API blocked');
 const native=await response(result.target_url+'?preview=true');
 check(!native.html.includes('PENDING-S08')&&!native.html.includes('RAW-S08'),'native preview cannot substitute pending or raw columns');
 console.log('PASS S08 withdrawal, anonymous and native preview isolation');
 const auth=await pageFor({viewport:{width:1440,height:1000}});
 await auth.page.goto(base+'/wp-login.php?redirect_to='+encodeURIComponent(preview));
 await auth.page.locator('#user_login').fill('admin');await auth.page.locator('#user_pass').fill(password);
 await Promise.all([auth.page.waitForURL('**/wp-admin/admin.php?**'),auth.page.locator('#wp-submit').click()]);
 const pr=await auth.page.goto(preview);await auth.page.waitForLoadState('networkidle');
 check(pr.status()===200&&(await auth.page.content()).includes('PENDING-S08-MUST-NOT-LEAK'),'authorized S05 editorial preview still shows candidate');
 check((pr.headers()['cache-control']||'').includes('no-store')&&(pr.headers()['x-robots-tag']||'').includes('noindex'),'editorial preview no-store and noindex');
 await capture(auth.page,'editorial-preview-fixture',true);
 const authHidden=await auth.context.request.get(result.private_url);
 check(authHidden.status()===404&&!(await authHidden.text()).includes('PRIVATE-RESOURCE-S08'),'authenticated frontend also hides private resource');
 await go(auth.page,result.target_url);check(await auth.page.locator('h1').innerText()==='Web Design Guidelines','public theme remains approved even for editor');await auth.context.close();
 console.log('PASS S08 authorized editorial preview and frontend privacy');
 const nojs=await pageFor({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await go(nojs.page,result.target_url);await nojs.page.getByRole('navigation',{name:'Nội dung trang tài nguyên'}).getByRole('link',{name:'Nguồn và mốc đối chiếu',exact:true}).click();
 check(nojs.page.url().endsWith('#nguon')&&await nojs.page.locator('#nguon').isVisible(),'detail state/source navigation works without JavaScript');
 await capture(nojs.page,'detail-no-js');await nojs.context.close();
 // Delete only fixture copies, never production source assets.
 await php("<?php require '/wordpress/wp-load.php';rename(get_theme_file_path('/assets/cover-web-design.svg'),get_theme_file_path('/assets/cover-web-design.svg.qa-disabled'));rename(get_theme_file_path('/assets/cover-default.svg'),get_theme_file_path('/assets/cover-default.svg.qa-disabled'));");
 await go(page,result.target_url);check(await page.locator('.detail-media .cover-placeholder').isVisible(),'missing images have labelled detail placeholder');await capture(page,'detail-image-placeholder');
 // Target known cover may have a different file name; test helper fallback with synthetic unknown source.
 const fallback=await php("<?php require '/wordpress/wp-load.php';$i=vne_library_item("+result.target+");$i['data']['source_url']='https://github.com/example/no-cover';echo vibelab_cover($i)===null?'placeholder':'unexpected';");
 check(fallback==='placeholder','missing default image helper returns null, no broken URL');
 await php("<?php require '/wordpress/wp-load.php';rename(get_theme_file_path('/assets/cover-default.svg.qa-disabled'),get_theme_file_path('/assets/cover-default.svg'));rename(get_theme_file_path('/assets/cover-web-design.svg.qa-disabled'),get_theme_file_path('/assets/cover-web-design.svg'));");
 // Explicit unclosed pre case tests restrictive handling, not browser repair.
 const unclosed=await php("<?php require '/wordpress/wp-load.php';$i=vne_library_item("+result.target+");$i['content']='<pre><code>UNCLOSED-MUST-NOT-RENDER';echo vibelab_detail_content($i);");
 check(!unclosed.includes('UNCLOSED-MUST-NOT-RENDER'),'unclosed pre cannot bypass code gate');
 assert.deepEqual(errors,[]);assert.deepEqual(badHTTP,[]);check(true,'no JS errors or unexpected internal HTTP failures');
 assert.deepEqual(hashes(),before);check(true,'protected local database/config unchanged');
 await context.close();await browser.close();browser=null;await app[Symbol.asyncDispose]();app=null;
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:process.argv.includes('--s10')?'2026-10-22':'2026-10-21',runtime:'WordPress7.1.3/PHP8.3/SQLite; Edge headless; Playwright Node1.62.1',testedThemeHashes:(process.argv.includes('--s09')||process.argv.includes('--s10'))?themeEvidence(fixture):undefined,checks,fixtureChecks:result.checks,errors,badHTTP,protectedHashes:before,liveFilesUnchanged:true,limits:['S02 cached sources; fabricated QA trial and extra resources only test state rendering, not external repo certification','Only pre code blocks gated; inline/prose installation content still requires editorial review','No hosting/MySQL/cache/load/cross-browser certification','No AI calls, deployment, main/release update']},null,2)+'\n');
 console.log('PASS S08 '+checks.length+' checks + '+result.checks.length+' fixture checks; protected data unchanged; closing cleanup');
}finally{if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(deadline);assert.deepEqual(hashes(),before);}
