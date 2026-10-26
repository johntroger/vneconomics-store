import {themeEvidence} from './theme-evidence.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};const {startSite}=await import('./local-runtime.mjs');
const files=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>files.map(p=>createHash('sha256').update(readFileSync(p)).digest('hex'));
const before=hashes(),checks=[],errors=[],badHTTP=[];
const check=(value,label)=>{assert.ok(value,label);checks.push(label);};
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s07-'));
const evidence=resolve(process.argv.includes('--s10')?'docs/acceptance/S10/S07-regression':process.argv.includes('--s09')?'docs/acceptance/S09/S07-regression':process.argv.includes('--s08')?'docs/acceptance/S08/S07-regression':'docs/acceptance/S07');mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:19407';let app,browser;
const deadline=setTimeout(()=>{console.error('FAIL S07 exceeded 1200 seconds');process.exit(1);},1200000);deadline.unref();
async function php(code){let r;try{r=await app.playground.run({code});}catch(e){throw new Error(e.response?new TextDecoder().decode(Uint8Array.from(Object.values(e.response.bytes))):e.message);}assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;}
async function newPage(options={}){
 const context=await browser.newContext(options);
 await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)badHTTP.push({url:r.url(),status:r.status()});});
 return {context,page};
}
async function go(page,url){const r=await page.goto(url);assert.equal(r.status(),200,url);await page.waitForLoadState('networkidle');assert.doesNotMatch(await page.content(),/Fatal error:|Warning:|Notice:|MUST-NOT-LEAK|INTERNAL-S07|PRIVATE-EDITORIAL/);}
async function capture(page,name){
 for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(n=>n.decode());assert.ok(await image.evaluate(n=>n.complete&&n.naturalWidth>0));}
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(evidence,name+'.png'),fullPage:true});
}
async function cards(page){return page.locator('[data-resource-id]').evaluateAll(nodes=>nodes.map(n=>({id:Number(n.dataset.resourceId),title:n.querySelector('h3').textContent.trim(),imageURL:n.querySelector('.card-cover').href,titleURL:n.querySelector('h3 a').href,ctaURL:n.querySelector('.card-actions a').href,ctaLabel:n.querySelector('.card-actions a').textContent,external:n.querySelector('.card-actions a').target,rel:n.querySelector('.card-actions a').rel,badges:[...n.querySelectorAll('.badge')].map(b=>b.textContent),requirements:n.querySelector('.card-requirements').textContent}))); }
async function response(url){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});const html=await r.text();assert.doesNotMatch(html,/Fatal error:|Warning:|Notice:/);return {status:r.status,html,url:r.url};}
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 console.log('START S07 isolated WordPress');
 app=await startSite(fixture,19407);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});
 cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 const obs=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
 const seed=JSON.parse(await php(readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(obs)+");")));
 const result=JSON.parse(await php(readFileSync('scripts/fixtures/s07-catalog-seed.php','utf8').replace('<?php',"<?php define('S07_SEED',"+JSON.stringify(JSON.stringify(seed))+");")));
 assert.equal(result.all.length,20);
 for(const [key,total]of Object.entries({parent:13,child:12,starter:5,skills:3,empty:0,hidden:0,need:3,tool:2})){assert.equal(result.terms[key].count,total,'independent expected count '+key);}
 check(true,'fixture counts: all20 / parent13 / child12 / starter5 / skills3 / need3 / tool2 / empty0');
 const expected=new Map(result.all.map(item=>[item.id,item]));
 console.log('PASS S07 fixture setup and independent expected totals');
 const {context,page}=await newPage({viewport:{width:1440,height:1000}});
 const allIDs=[];
 await go(page,result.archive);
 check(await page.locator('h1').count()===1,'one catalogue h1');
 check(await page.locator('.result-count').innerText()==='Hiển thị 1–9 trong 20 tài nguyên','archive page1 count and 9-per-page');
 check((await cards(page)).slice(0,6).map(c=>c.title).join('|')==='Astro Basics|MDN Learning Area|Pico CSS|React Best Practices|Web Design Guidelines|Web Dev for Beginners','approved title determines ordering, not raw title');
 check(!(await page.locator('.catalog-categories').innerText()).includes('RIENG-CHUA-DUYET'),'sidebar omits hidden/guide-only category');
 for(const [key,count]of Object.entries({parent:13,child:12,starter:5,skills:3})){
   const link=page.locator('.catalog-categories a').filter({has:page.getByText(result.terms[key].name,{exact:true})});
   assert.equal(await link.locator('.category-count').innerText(),String(count));
 }
 check(true,'sidebar counts approved resources, ancestors, multi-category once, no guides/private');
 await capture(page,'archive-desktop');
 for(let number=1;number<=3;number++){
   if(number>1){await Promise.all([page.waitForNavigation(),page.getByRole('navigation',{name:'Phân trang tài nguyên'}).getByRole('link',{name:'Trang tiếp',exact:true}).click()]);await page.waitForLoadState('networkidle');}
   const row=await cards(page);assert.equal(row.length,number<3?9:2);allIDs.push(...row.map(i=>i.id));
   assert.equal(await page.locator('.result-count').innerText(),'Hiển thị '+((number-1)*9+1)+'–'+Math.min(number*9,20)+' trong 20 tài nguyên');
   for(const card of row){
     const item=expected.get(card.id);assert.ok(item);assert.equal(card.title,item.title);assert.equal(card.imageURL,item.url);assert.equal(card.titleURL,item.url);assert.ok(card.badges.includes(item.badge));
     assert.equal(card.ctaURL,item.cta.kind==='source'?item.source:item.url+'#tinh-trang');
     if(item.cta.kind==='source'){assert.equal(card.external,'_blank');assert.ok(card.rel.includes('noopener')&&card.rel.includes('noreferrer'));}
     else{assert.equal(card.external,'');assert.doesNotMatch(card.ctaLabel,/Truy cập repo/);}
   }
   check(true,'page '+number+': counts, every card canonical title/image/detail/source-path/state');
 }
 assert.equal(new Set(allIDs).size,20);assert.deepEqual(allIDs,result.all.map(i=>i.id));check(true,'3 pages cover all20 exactly once, stable order');
 check(await page.getByRole('navigation',{name:'Phân trang tài nguyên'}).getByRole('link',{name:'Trang tiếp',exact:true}).count()===0,'last page has no dead next link');
 check(await page.locator('[data-resource-id="'+result.long+'"] .card-requirements').innerText().then(t=>t.includes('Theo nguồn:')),'upstream requirements labelled, not independently certified');
 await page.setViewportSize({width:320,height:800});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'long unbroken title no overflow 320px');
 await capture(page,'long-title-mobile');
 // Keyboard: pagination stays native links; current page is identified.
 await page.setViewportSize({width:1440,height:1000});
 const previous=page.getByRole('navigation',{name:'Phân trang tài nguyên'}).getByRole('link',{name:'Trang trước',exact:true});await previous.focus();
 await Promise.all([page.waitForNavigation(),page.keyboard.press('Enter')]);await page.waitForLoadState('networkidle');
 check(await page.locator('.catalog-pagination [aria-current="page"]').innerText().then(t=>t.includes('2')),'keyboard Enter navigates pagination and current page is marked');
 console.log('PASS S07 archive pages, card contracts, counts and keyboard');
 for(const [label,width,height]of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844],['small-mobile',320,800]]){
   await page.setViewportSize({width,height});await go(page,result.terms.starter.url);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'category no overflow '+label);
   check(await page.locator('[data-resource-id]').count()===5,'category grid5 '+label);
   await capture(page,'category-'+label);
 }
 const crumbs=await page.getByRole('navigation',{name:'Breadcrumb'}).innerText();assert.match(crumbs,/Trang chủ/);assert.match(crumbs,/Tài nguyên/);assert.match(crumbs,/Mẫu dự án/);
 check(true,'category breadcrumb home/resource/current');
 const taxonomyResults={};
 for(const key of ['parent','child','skills','need','tool','empty','hidden']){
   await go(page,result.terms[key].url);const total=result.terms[key].count;taxonomyResults[key]=await page.locator('.result-count').innerText();
   if(total){assert.equal(await page.locator('[data-resource-id]').count(),Math.min(total,9));assert.match(taxonomyResults[key],new RegExp('trong '+total+' tài nguyên$'));}
   else{assert.equal(taxonomyResults[key],'0 tài nguyên');assert.equal(await page.locator('[data-resource-id]').count(),0);assert.ok(await page.locator('.empty-state').isVisible());assert.equal(await page.locator('.catalog-pagination').count(),0);}
   if(key==='child'){const names=await page.getByRole('navigation',{name:'Breadcrumb'}).innerText();assert.ok(names.includes(result.terms.parent.name)&&names.includes(result.terms.child.name));check(true,'child breadcrumb includes parent');}
   check(true,'taxonomy '+key+' real URL / count / scope / empty behavior');
 }
 await capture(page,'empty-category');
 await go(page,result.terms.parent.url);const parentIDs=(await cards(page)).map(c=>c.id);
 await Promise.all([page.waitForNavigation(),page.getByRole('navigation',{name:'Phân trang tài nguyên'}).getByRole('link',{name:'Trang tiếp',exact:true}).click()]);await page.waitForLoadState('networkidle');
 parentIDs.push(...(await cards(page)).map(c=>c.id));assert.equal(parentIDs.length,13);assert.equal(new Set(parentIDs).size,13);assert.ok(parentIDs.includes(seed.ids[0])&&parentIDs.includes(result.long));
 check(true,'parent includes children and approved memberships missing from raw tax, no duplicates');
 if(process.argv.includes('--s09')){
   await page.setViewportSize({width:1440,height:1000});
   await go(page,result.archive+'page/2/');
   await page.locator('#discovery-form').getByLabel('Landing page',{exact:true}).check();
   await page.locator('#discovery-form').getByRole('button',{name:'Áp dụng',exact:true}).click();await page.waitForLoadState('networkidle');
   check(!new URL(page.url()).searchParams.has('paged')&&await page.locator('[data-resource-id]').count()===3,'S09 filter Apply resets page2 to page1 with correct approved result set');
   await go(page,result.terms.need.url);
   await page.getByRole('navigation',{name:'Chọn danh mục'}).getByRole('link').filter({hasText:result.terms.skills.name}).click();await page.waitForLoadState('networkidle');
   check(await page.locator('[data-resource-id]').count()===1&&await page.locator('[data-resource-id]').getAttribute('data-resource-id')===String(result.long),'S09 category navigation preserves implicit need from native taxonomy URL');
 }
 const edge=await Promise.all([response(result.archive+'page/4/'),response(base+'/danh-muc/khong-ton-tai-s07/'),response(base+'/?vne_category='+encodeURIComponent(result.terms.parent.slug)+'&paged=2')]);
 assert.equal(edge[0].status,404);assert.equal(edge[1].status,404);assert.equal(edge[2].status,200);assert.ok(edge[2].html.includes('10–13 trong 13 tài nguyên'));
 check(true,'out-of-range / unknown term404; query-string taxonomy page2 resolves correctly');
 const nojs=await newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await go(nojs.page,result.terms.child.url);assert.equal(await nojs.page.locator('[data-resource-id]').count(),9);
 await Promise.all([nojs.page.waitForNavigation(),nojs.page.getByRole('navigation',{name:'Phân trang tài nguyên'}).getByRole('link',{name:'Trang tiếp',exact:true}).click()]);await nojs.page.waitForLoadState('networkidle');
 check(await nojs.page.locator('[data-resource-id]').count()===3&&await nojs.page.getByRole('navigation',{name:'Chọn danh mục'}).isVisible(),'no-JS category navigation and pagination work');
 await capture(nojs.page,'no-js-mobile');await nojs.context.close();
 console.log('PASS S07 all taxonomy routes, nested membership, empty404, no-JS and responsive');
 // Actual image/title and blocked CTA navigation, not just href comparison.
 await page.setViewportSize({width:1440,height:1000});await go(page,result.archive);
 const astro=page.locator('[data-resource-id="'+result.astro+'"]');await astro.locator('.card-cover').click();await page.waitForLoadState('networkidle');
 check(page.url()===expected.get(result.astro).url&&await page.locator('#tinh-trang').isVisible(),'image opens usable baseline detail');
 await go(page,result.archive);await page.locator('[data-resource-id="'+result.astro+'"] h3 a').click();await page.waitForLoadState('networkidle');
 check(page.url()===expected.get(result.astro).url,'title opens same canonical detail');
 await go(page,result.terms.child.url);
 const blockedCard=page.locator('[data-resource-id="'+result.blocked[0]+'"]');await blockedCard.locator('.card-actions a').first().click();await page.waitForLoadState('networkidle');
 check(page.url().endsWith('#tinh-trang')&&await page.locator('#tinh-trang a[target="_blank"]').count()===0,'unavailable CTA opens explanation with no source button');
 // Remove fixture image files only. The production tree is never mutated.
 await php("<?php require '/wordpress/wp-load.php';rename(get_theme_file_path('/assets/cover-astro.svg'),get_theme_file_path('/assets/cover-astro.svg.qa-disabled'));");
 await go(page,result.archive);
 check(await page.locator('[data-resource-id="'+result.astro+'"] img').getAttribute('src').then(u=>u.endsWith('cover-default.svg')),'missing known cover uses readable local default');
 await php("<?php require '/wordpress/wp-load.php';rename(get_theme_file_path('/assets/cover-default.svg'),get_theme_file_path('/assets/cover-default.svg.qa-disabled'));");
 await go(page,result.archive);
 check(await page.locator('[data-resource-id="'+result.astro+'"] .cover-placeholder').isVisible(),'missing default has labelled stable placeholder, no broken image');
 await capture(page,'missing-image-placeholder');
 await php("<?php require '/wordpress/wp-load.php';rename(get_theme_file_path('/assets/cover-astro.svg.qa-disabled'),get_theme_file_path('/assets/cover-astro.svg'));rename(get_theme_file_path('/assets/cover-default.svg.qa-disabled'),get_theme_file_path('/assets/cover-default.svg'));wp_update_post(array('ID'=>"+result.long+",'post_status'=>'draft'));");
 await go(page,result.archive);assert.equal(await page.locator('.result-count').innerText(),'Hiển thị 1–9 trong 19 tài nguyên');
 check(await page.locator('.catalog-categories').innerText().then(t=>!t.includes('RIENG-CHUA-DUYET')),'withdrawal reflected next request, private taxonomy still excluded');
 await php("<?php require '/wordpress/wp-load.php';global $wpdb;$wpdb->query(\"UPDATE {$wpdb->posts} SET post_status='draft' WHERE post_type='vne_resource'\");wp_cache_flush();");
 await go(page,result.archive);check(await page.locator('.result-count').innerText()==='0 tài nguyên'&&await page.locator('.catalog-pagination').count()===0,'empty archive200 and no phantom pages');
 check(await page.locator('.empty-state a.button').getAttribute('href')===base+'/','empty archive recovery returns home, not itself');
 await capture(page,'empty-archive');
 assert.deepEqual(errors,[]);assert.deepEqual(badHTTP,[]);check(true,'no JS errors or unexpected internal HTTP failures');
 assert.deepEqual(hashes(),before);check(true,'protected local database/config unchanged');
 await context.close();await browser.close();browser=null;await app[Symbol.asyncDispose]();app=null;
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:process.argv.includes('--s10')?'2026-10-22':'2026-10-21',runtime:'WordPress7.1.3/PHP8.3/SQLite; Edge headless; Playwright Node1.62.1',testedThemeHashes:(process.argv.includes('--s09')||process.argv.includes('--s10'))?themeEvidence(fixture):undefined,checks,fixtureChecks:result.checks,counts:Object.fromEntries(Object.entries(result.terms).map(([k,v])=>[k,v.count])),taxonomyResults,archivePages:allIDs,errors,badHTTP,protectedHashes:before,liveFilesUnchanged:true,limits:['Cached S02 sources, synthetic extra14 and state fixtures; no external source certification','No hosting/MySQL/cache/large-library/browser compatibility certification',process.argv.includes('--s10')?'S07 regression on theme0.5.0; lesson S10 covered separately; no human novice/hosting certification':process.argv.includes('--s09')?'S07 regression on theme0.4.0; filter/search semantics covered in S09 suite':process.argv.includes('--s08')?'S07 regression on theme0.3.0; detailed resource covered by S08 suite; filters/sort still S09':'Basic read detail retained until S08; combined filters/sort S09','No AI calls, deploy or main/release update']},null,2)+'\n');
 console.log('PASS S07 '+checks.length+' checks + '+result.checks.length+' fixture checks; protected data unchanged; closing cleanup');
}finally{if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(deadline);assert.deepEqual(hashes(),before);}
