import {themeEvidence,pluginEvidence} from './theme-evidence.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};
const {startSite}=await import('./local-runtime.mjs');
const liveFiles=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>liveFiles.map(p=>createHash('sha256').update(readFileSync(p)).digest('hex'));
const before=hashes(),checks=[];
function check(value,label){assert.ok(value,label);checks.push(label);}
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s06-'));
const evidence=resolve(process.argv.includes('--s11')?'docs/acceptance/S11/S06-regression':process.argv.includes('--s10')?'docs/acceptance/S10/S06-regression':process.argv.includes('--s09')?'docs/acceptance/S09/S06-regression':process.argv.includes('--s08')?'docs/acceptance/S08/S06-regression':process.argv.includes('--s07')?'docs/acceptance/S07/S06-regression':'docs/acceptance/S06');mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:19406';let app,browser;
const deadline=setTimeout(()=>{console.error('FAIL S06 exceeded 1200 seconds');process.exit(1);},1200000);deadline.unref();
async function php(code){
 let r;try{r=await app.playground.run({code});}catch(e){throw new Error(e.response?new TextDecoder().decode(Uint8Array.from(Object.values(e.response.bytes))):e.message);}
 assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;
}
async function request(path='/'){
 const response=await fetch(path.startsWith(base)?path:base+path),html=await response.text();
 assert.doesNotMatch(html,/Fatal error:|Warning:|Notice:|Error establishing a database connection/);
 return {response,html};
}
async function openPage(options={}){
 const context=await browser.newContext(options);
 await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 return {context,page};
}
async function capture(page,options){
 // Real scrolling triggers native lazy loading before the full-page evidence.
 for(const img of await page.locator('img').all()){
   await img.scrollIntoViewIfNeeded();await img.evaluate(n=>n.decode());assert.ok(await img.evaluate(n=>n.complete&&n.naturalWidth>0),'evidence image loaded');
 }
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot(options);
}
const errors=[],failedInternal=[],views=[];
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 console.log('START S06 isolated WordPress fixture');
 app=await startSite(fixture,19406);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});
 cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 const obs=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
 const seed=readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(obs)+");");
 const result=JSON.parse(await php(seed));check(result.cards.length===6,'six approved resource fixtures, source revisions from S02');
 console.log('PASS S06 seed: six resources, guide, draft/private/pending');
 const {context,page}=await openPage({viewport:{width:1440,height:1000}});
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failedInternal.push({url:r.url(),status:r.status()});});
 await page.goto(base);await page.waitForLoadState('networkidle');
 // Inspect rendered state before choosing actions.
 check(await page.getByRole('heading',{level:1}).count()===1,'one homepage h1');
 check(await page.locator('[data-resource-id]').count()===6,'homepage renders plugin resources');
 for(const item of result.cards){
   const card=page.locator('[data-resource-id="'+item.id+'"]');
   assert.equal(await card.locator('h3').innerText(),item.title);assert.ok((await card.locator('.badge').allTextContents()).includes('Chưa thử'));
   assert.equal(await card.locator('h3 a').getAttribute('href'),item.url);
   assert.equal(await card.locator('.card-cover').getAttribute('href'),item.url);
   assert.equal(await card.getByRole('link',{name:'Truy cập repo'}).getAttribute('href'),item.source);
   assert.ok((await card.locator('.badge').allTextContents()).includes(item.badge));
   checks.push('approved title / image-detail / exact source-path / resolver badge: '+item.title);
 }
 const home=await page.content();assert.doesNotMatch(home,/DRAFT-MUST-NOT-LEAK|PRIVATE-MUST-NOT-LEAK|PENDING-MUST-NOT-LEAK|PRIVATE-EDITORIAL-S06|_vne_|base_revision/);
 check(true,'draft/private/proposal/internal fields absent from homepage');
 for(const [label,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844],['small-mobile',320,800]]){
   await page.setViewportSize({width,height});await page.waitForLoadState('networkidle');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow '+label);
   check(await page.locator('img').evaluateAll(nodes=>nodes.every(n=>n.complete&&n.naturalWidth>0)),'local illustrations load '+label);
   await capture(page,{path:join(evidence,'home-'+label+'.png'),fullPage:true});views.push({label,width,height});if(label==='mobile'){await capture(page,{path:join(evidence,'home-mobile-first-screen.png'),fullPage:false});}
 }
 await page.setViewportSize({width:390,height:844});
 const menu=page.getByRole('button',{name:'Menu',exact:true});
 check(await menu.isVisible(),'mobile menu button visible');
 check(!(await page.getByRole('navigation',{name:'Điều hướng chính'}).isVisible()),'enhanced mobile menu initially collapsed');
 await menu.focus();await page.keyboard.press('Enter');
 check(await menu.getAttribute('aria-expanded')==='true','Enter opens mobile menu');
 await page.keyboard.press('Tab');check(await page.evaluate(()=>document.activeElement.closest('#main-nav')!==null),'Tab reaches menu links');
 await page.keyboard.press('Escape');
 check(await menu.getAttribute('aria-expanded')==='false'&&await menu.evaluate(n=>n===document.activeElement),'Escape closes menu and returns focus');
 await menu.click();await page.getByRole('navigation').getByRole('link',{name:'Cách chúng tôi tuyển chọn',exact:true}).click();check(await page.locator('#cach-chon').evaluate(n=>n===document.activeElement),'mobile anchor closes menu and focuses destination');await menu.click();await page.setViewportSize({width:1440,height:1000});
 check(await page.getByRole('navigation',{name:'Điều hướng chính'}).isVisible(),'desktop nav remains visible after breakpoint change');
 await page.reload();await page.waitForLoadState('networkidle');await page.keyboard.press('Tab');
 check(await page.getByRole('link',{name:'Đến nội dung',exact:true}).evaluate(n=>n===document.activeElement),'first Tab reaches skip link');
 await page.keyboard.press('Enter');check(await page.locator('#main').evaluate(n=>n===document.activeElement),'skip link focuses main');
 const localLinks=await page.locator('a[href]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.href).filter(h=>new URL(h).origin===location.origin))]);
 for(const url of localLinks){
   const r=await request(url);assert.equal(r.response.status,200,'homepage link '+url);
   const anchor=new URL(url).hash;if(anchor){assert.ok(r.html.includes('id="'+anchor.slice(1)+'"'),'anchor exists '+url);}
 }
 check(true,'every home link resolves locally; anchors exist');
 await page.locator('#global-search').fill('MDN');
 await Promise.all([page.waitForURL(url=>url.searchParams.get('s')==='MDN'),page.getByRole('button',{name:'Tìm',exact:true}).click()]);
 await page.waitForLoadState('networkidle');
 check(await page.locator('main').innerText().then(t=>t.includes('MDN Learning Area')),'core search finds approved resource');
 assert.doesNotMatch(await page.locator('main').innerText(),/MUST-NOT-LEAK|PRIVATE-EDITORIAL/);
 for(const item of result.cards){
   const r=await request(item.url);assert.equal(r.response.status,200);assert.ok(r.html.includes('id="tinh-trang"'));assert.ok(r.html.includes(item.title));
 }
 check(true,'baseline detail reads approved content and exposes state explanation');
 const notFound=await request('/missing-s06-page/');check(notFound.response.status===404&&notFound.html.includes('Không tìm thấy trang'),'404 has usable recovery');
 console.log('PASS S06 desktop/tablet/mobile, menu, keyboard, search, link destinations');
 const nojs=await openPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.page.goto(base);await nojs.page.waitForLoadState('networkidle');
 check(await nojs.page.locator('[data-resource-id]').count()===6,'all resources readable without JS');
 check(await nojs.page.getByRole('navigation',{name:'Điều hướng chính'}).isVisible(),'no-JS mobile navigation visible');
 await capture(nojs.page,{path:join(evidence,'home-no-js.png'),fullPage:true});await nojs.context.close();
 const blocked=await openPage({viewport:{width:390,height:844}});
 await blocked.context.route('**/menu.js*',route=>route.abort());
 await blocked.page.goto(base);await blocked.page.waitForLoadState('networkidle');
 check(await blocked.page.getByRole('navigation',{name:'Điều hướng chính'}).isVisible(),'failed menu script retains usable navigation');await blocked.context.close();
 // Canonical getter must win even when raw post columns contain unapproved values.
 const target=result.ids[0];
 await php("<?php require '/wordpress/wp-load.php';global $wpdb;$wpdb->update($wpdb->posts,array('post_title'=>'RAW-MUST-NOT-LEAK','post_excerpt'=>'RAW-EXCERPT-MUST-NOT-LEAK'),array('ID'=>"+target+"));clean_post_cache("+target+");");
 let body=(await request()).html;assert.ok(body.includes(result.cards[0].title));assert.doesNotMatch(body,/RAW-MUST-NOT-LEAK|RAW-EXCERPT-MUST-NOT-LEAK/);check(true,'approved snapshot wins over raw post data');
 const approvedHead=await request(result.cards[0].url);assert.doesNotMatch(approvedHead.html,/RAW-MUST-NOT-LEAK|RAW-EXCERPT-MUST-NOT-LEAK/);
 check(true,'detail document title and head use approved snapshot');
 await php("<?php require '/wordpress/wp-load.php';$t=wp_insert_term('RAW-TAX-MUST-NOT-LEAK','vne_category');wp_set_object_terms("+target+",array($t['term_id']),'vne_category');");
 body=(await request()).html;assert.doesNotMatch(body,/RAW-TAX-MUST-NOT-LEAK/);
 check(true,'home category strip uses approved category IDs');
 // Synthetic state transitions verify theme obeys resolver; no external observation is performed.
 for(const [name,access,rec,review] of [['unknown','unknown','normal',false],['unavailable','unavailable','normal',false],['suspended','available','suspended',false],['review-needed','available','normal',true],['not-tested','available','normal',false]]){
   const state=await php("<?php require '/wordpress/wp-load.php';wp_set_current_user(get_user_by('login','admin')->ID);$s=vne_library_default_state();$s['source_access']=array('status'=>'"+access+"','source_url'=>'https://example.com/s06-fixture','observed_at'=>'2026-10-21','note'=>'Synthetic fixture, not external evidence');$s['recommendation']=array('status'=>'"+rec+"','reason'=>'Synthetic fixture reason');$s['review']['needed']="+(review?'true':'false')+";$s['review']['reason']='Synthetic review';$saved=vne_library_save_state("+target+",$s);if(is_wp_error($saved)){throw new Exception($saved->get_error_message());}echo wp_json_encode(vne_library_item("+target+")['derived']);");
   const derived=JSON.parse(state);
   await page.goto(base);await page.waitForLoadState('networkidle');const card=page.locator('[data-resource-id="'+target+'"]');
   check((await card.locator('.badge').allTextContents()).includes(derived.primary_label),'resolver badge '+name);
   const cta=card.locator('.card-actions>a').first();
   if(derived.cta.kind==='source'){assert.equal(await cta.getAttribute('href'),derived.cta.href);}
   else{
     const href=await cta.getAttribute('href');assert.equal(href,result.cards[0].url+'#tinh-trang');
     await cta.click();await page.waitForLoadState('networkidle');assert.ok(await page.locator('#tinh-trang').isVisible());
     check(await page.locator('#tinh-trang a[target="_blank"]').count()===0,'blocked source CTA absent on detail '+name);
   }
   checks.push('source CTA / explanation destination '+name);
 }
 // Unknown repo gets a real local fallback illustration, not a broken image.
 await php("<?php require '/wordpress/wp-load.php';wp_set_current_user(get_user_by('login','admin')->ID);$i=vne_library_item("+target+",true);unset($i['derived'],$i['approved_revision'],$i['state_input'],$i['dependencies'],$i['validations'],$i['approval_history']);$i['data']['source_url']='https://github.com/example/s06-fixture';$i['excerpt']='Fixture tên dài và hình bìa dự phòng, không là dữ kiện nguồn.';$i['title']='Nguồn mã mẫu '.str_repeat('LongResourceName',12);$r=vne_library_save_item($i,"+target+");if(is_wp_error($r)){throw new Exception($r->get_error_message());}");
 await page.setViewportSize({width:320,height:800});await page.goto(base);await page.waitForLoadState('networkidle');
 check(await page.locator('[data-resource-id="'+target+'"] img').getAttribute('src').then(s=>s.endsWith('cover-default.svg')),'unknown source uses local fallback cover');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'long title does not overflow 320px');
 await capture(page,{path:join(evidence,'long-title-fallback.png'),fullPage:true});
 check(await page.locator('[data-resource-id="'+target+'"] img').evaluate(n=>n.complete&&n.naturalWidth>0),'fallback image actually loads after scrolling');
 // WordPress assigned menu works, including child links; remains accessible without JS.
 await php("<?php require '/wordpress/wp-load.php';$menu=wp_create_nav_menu('S06 fixture menu');$parent=wp_update_nav_menu_item($menu,0,array('menu-item-title'=>'Menu tùy chỉnh','menu-item-url'=>home_url('/'),'menu-item-status'=>'publish'));wp_update_nav_menu_item($menu,0,array('menu-item-title'=>'Mục con','menu-item-url'=>home_url('/#tai-nguyen'),'menu-item-parent-id'=>$parent,'menu-item-status'=>'publish'));set_theme_mod('nav_menu_locations',array('primary'=>$menu));");
 await page.goto(base);await page.waitForLoadState('networkidle');await menu.click();
 check(await page.getByRole('navigation').getByRole('link',{name:'Mục con',exact:true}).isVisible(),'assigned two-level WordPress menu renders');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'assigned menu no overflow');
 // Empty dataset and unavailable plugin must never fabricate entries or broken guide CTAs.
 await php("<?php require '/wordpress/wp-load.php';remove_theme_mod('nav_menu_locations');global $wpdb;$wpdb->query(\"UPDATE {$wpdb->posts} SET post_status='draft' WHERE post_type IN ('vne_resource','vne_guide','vne_practice')\");wp_cache_flush();");
 await page.goto(base);await page.waitForLoadState('networkidle');
 check(await page.locator('[data-resource-id]').count()===0&&await page.locator('.empty-state').isVisible(),'empty library is explicit, no placeholder products');
 check(await page.getByRole('link',{name:'Xem hướng dẫn thực hành',exact:true}).count()===0,'missing guide creates no fabricated lesson link');
 await capture(page,{path:join(evidence,'empty-library.png'),fullPage:true});
 await php("<?php require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/plugin.php';deactivate_plugins('vne-library-core/vne-library-core.php');");
 await page.goto(base);await page.waitForLoadState('networkidle');
 check(await page.locator('.empty-state').innerText().then(t=>t.includes('Chưa có dữ liệu thư viện')),'plugin absent handled without fatal error');
 await capture(page,{path:join(evidence,'plugin-unavailable.png'),fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(failedInternal,[]);
 check(true,'no browser JS errors or failed internal HTTP requests');
 check(JSON.stringify(hashes())===JSON.stringify(before),'live local DB and configuration unchanged');
 await context.close();await browser.close();browser=null;await app[Symbol.asyncDispose]();app=null;
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:process.argv.includes('--s10')?'2026-10-22':'2026-10-21',runtime:'WordPress 7.1.3 / PHP 8.3 / SQLite; Edge headless; Playwright Node 1.62.1',testedPluginHashes:process.argv.includes('--s11')?pluginEvidence(fixture):undefined,testedThemeHashes:(process.argv.includes('--s09')||process.argv.includes('--s10'))?themeEvidence(fixture):undefined,checks,views,errors,failedInternal,liveFilesUnchanged:true,protectedHashes:before,externalRequests:'Browser blocks non-loopback; WordPress HTTP external disabled; no paid API or deployment',limits:['Fixture source observations are cached S02, not refreshed S06','No hosting MySQL/cache validation',process.argv.includes('--s11')?'S06 regression on theme0.6.0/plugin0.4.0; support S11 covered separately; no hosting/human trial certification':process.argv.includes('--s10')?'S06 regression on theme0.5.0; lesson S10 covered separately; no human novice/hosting certification':process.argv.includes('--s09')?'S06 regression on theme0.4.0; discovery S09 covered separately; guide/practice reader remains baseline':process.argv.includes('--s08')?'S06 regression on theme0.3.0; S07/S08 covered separately; core search and guide/practice fallback remain':'Core search and simple read/list fallback, not S07-S10 implementation','System font; Be Vietnam Pro not packaged']},null,2)+'\n');
 console.log('PASS S06 '+checks.length+' checks; browsers/server closed; live data unchanged');
}finally{
 if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(deadline);assert.deepEqual(hashes(),before);
}
