import {themeEvidence,pluginEvidence} from './theme-evidence.mjs';
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
const before=hashes(),checks=[],errors=[],badHTTP=[],queries=[];
const check=(v,label)=>{assert.ok(v,label);checks.push(label);};
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s09-'));
const evidence=resolve(process.argv.includes('--s13')?'docs/acceptance/S13/S09-regression':process.argv.includes('--s10')?'docs/acceptance/S10/S09-regression':'docs/acceptance/S09');mkdirSync(evidence,{recursive:true});
const base='http://127.0.0.1:19409';let app,browser;
const deadline=setTimeout(()=>{console.error('FAIL S09 timeout');process.exit(1);},1200000);deadline.unref();
async function php(code){let r;try{r=await app.playground.run({code});}catch(e){throw new Error(e.response?new TextDecoder().decode(Uint8Array.from(Object.values(e.response.bytes))):e.message);}assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;}
function url(args={}){const u=new URL(base);u.searchParams.set('vne_find','1');for(const [k,v]of Object.entries(args)){for(const item of Array.isArray(v)?v:[v])u.searchParams.append(k+(Array.isArray(v)?'[]':''),item);}return u.href;}
async function response(address){const r=await fetch(address,{signal:AbortSignal.timeout(60000)}),html=await r.text();assert.doesNotMatch(html,/Fatal error:|Warning:|Notice:|MUST-NOT-LEAK/);return {status:r.status,html};}
async function all(args,kind='resource'){
 const first=await response(url(args));assert.equal(first.status,200);assert.ok(first.html.includes('data-discovery-scope='),'finder template');
 let ids=[...first.html.matchAll(new RegExp('data-'+kind+'-id="(\\d+)"','g'))].map(m=>Number(m[1]));
 const total=Number(first.html.match(/trong (\d+) (?:tài nguyên|hướng dẫn)/)?.[1]||ids.length);
 for(let page=2;page<=Math.ceil(total/9);page++){const r=await response(url({...args,paged:page}));assert.equal(r.status,200);ids.push(...[...r.html.matchAll(new RegExp('data-'+kind+'-id="(\\d+)"','g'))].map(m=>Number(m[1])));}
 assert.equal(new Set(ids).size,ids.length);return ids;
}
async function newPage(options={}){
 const context=await browser.newContext(options);await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)badHTTP.push({url:r.url(),status:r.status()});});return {context,page};
}
async function go(page,address){const r=await page.goto(address);assert.equal(r.status(),200,address);await page.waitForLoadState('networkidle');assert.doesNotMatch(await page.content(),/Fatal error:|Warning:|Notice:|MUST-NOT-LEAK/);}
async function capture(page,name){for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(n=>n.decode());}await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(evidence,name+'.png'),fullPage:true});if(['search-desktop','search-mobile'].includes(name))await page.screenshot({path:join(evidence,name+'-top.png')});}
const pageIDs=page=>page.locator('[data-resource-id],[data-guide-id]').evaluateAll(ns=>ns.map(n=>Number(n.dataset.resourceId||n.dataset.guideId)));
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});console.log('START S09 isolated WordPress');app=await startSite(fixture,19409);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 const result=JSON.parse(await php(readFileSync('scripts/fixtures/s09-search-seed.php','utf8')));
 const R=n=>result.resources[n-1].id,G=n=>result.guides[n-1].id,T=key=>result.terms[key].slug;
 const cases=[
 ['Vietnamese',{s:'chụp ảnh'},[1]],
 ['no accents',{s:'chup anh'},[1]],
 ['decomposed NFC',{s:'chụp ảnh'},[1]],
 ['case and token AND',{s:'LANDING PAGE'},[1,2]],
 ['skill alias',{s:'skill'},[3,10,11,12]],
 ['ky nang alias',{s:'kỹ năng'},[3,10,11,12]],
 ['vibe coding alias',{s:'vibe coding'},[5,6]],
 ['vibecode alias',{s:'vibecode'},[5,6]],
 ['CSS title',{s:'css'},[4,8]],
 ['approved content vs raw',{s:'moc studio'},[1]],
 ['wrong resource scope',{s:'khong mo duoc terminal'},[]],
 ['guide terminal',{s:'khong mo duoc terminal',scope:'guides'},[1],'guide'],
 ['guide landing',{s:'landing page',scope:'guides'},[2],'guide'],
 ['need AND tool',{need:[T('website')],tool:[T('codex')]},[1,4,6,9]],
 ['need OR',{need:[T('website'),T('design')]},[1,2,3,4,5,6,7,8,9,11,12]],
 ['tool OR',{tool:[T('codex'),T('claude')]},[1,2,3,4,6,8,9,10,11,12]],
 ['cross group AND',{need:[T('website')],tool:[T('claude')]},[2,4]],
 ['parent includes child',{category:T('web')},[1,2,4,5,6,7,8,9]],
 ['keyword AND two groups',{s:'css',need:[T('website')],tool:[T('claude')]},[4]],
 ['valid empty combination',{category:T('skill'),need:[T('website')],tool:[T('claude')]},[]]
 ];
 const fallbackOrder=await php("<?php require '/wordpress/wp-load.php';$a=array('id'=>1,'title'=>'A','data'=>array());$b=array('id'=>2,'title'=>'B','data'=>array('observed_at'=>'2026-10-21'));echo vibelab_find_compare($a,$b,array('sort'=>'observed','finder'=>true),array());");check(Number(fallbackOrder)>0,'missing source date sorts after known date defensively');
 console.log('PASS S09 fixture setup; running20 independent query expectations');
 for(const [name,args,expected,kind='resource']of cases){
  const ids=await all(args,kind);const expectedIDs=expected.map(kind==='guide'?G:R);assert.deepEqual([...ids].sort((a,b)=>a-b),expectedIDs.sort((a,b)=>a-b),name);queries.push({name,args,ids});check(true,'query: '+name);
 }
 for(const token of ['rawsecretquery','candidatesecretquery','INTERNAL-S09','PRIVATE-S09']){assert.deepEqual(await all({s:token}),[]);}
 check(true,'raw body, proposal, private and editorial note never searchable');
 assert.deepEqual((await all({scope:'guides'},'guide')).sort((a,b)=>a-b),[G(1),G(2),G(3),G(4)].sort((a,b)=>a-b));check(true,'guide scope includes practice, no resource cards');
 assert.deepEqual(await all({sort:'name'}),[4,7,3,2,1,9,8,10,6,5,11,12].map(R));check(true,'name ordering and ID tie stable over 2 pages');
 assert.deepEqual(await all({sort:'name_desc'}),[12,11,5,6,10,8,9,1,2,3,7,4].map(R));check(true,'descending order and tie stable');
 assert.deepEqual(await all({sort:'observed'}),[7,2,6,11,12,1,9,10,4,3,8,5].map(R));check(true,'observed date sort, stable ties and truthful source date');
 check((await all({s:'thiết kế'}))[0]===R(3),'ranking prefers title over need label');
 const {context,page}=await newPage({viewport:{width:1440,height:1000}});
 await go(page,url({s:'landing page'}));check(await page.locator('h1').count()===1&&await page.locator('#global-search').inputValue()==='landing page','single h1 and query retained in header');
 check((await page.locator('.discovery-scopes [aria-current]').innerText())==='Tài nguyên','resource scope visible');const categoryLabels=await page.locator('.catalog-categories a').allTextContents();check(categoryLabels[1].includes('Làm website')&&categoryLabels[2].includes('HTML cơ bản'),'finder categories keep parent before child');
 await capture(page,'search-desktop');
 for(const [name,width,height]of [['tablet',820,1180],['mobile',390,844],['small-mobile',320,800]]){
  await page.setViewportSize({width,height});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow '+name);await capture(page,'search-'+name);
 }
 await page.setViewportSize({width:1440,height:1000});await go(page,url({s:'khong mo duoc terminal'}));
 await page.getByRole('navigation',{name:'Phạm vi tìm kiếm'}).getByRole('link',{name:'Hướng dẫn và sửa lỗi',exact:true}).click();await page.waitForLoadState('networkidle');
 check(await page.locator('#global-search').inputValue()==='khong mo duoc terminal'&&(await pageIDs(page)).includes(G(1)),'scope switch retains keyword and finds relevant guide');
 await capture(page,'guide-results');
 await go(page,url({s:'landing page',tool:[T('codex')]}));await page.getByRole('link',{name:'Bỏ Codex',exact:true}).click();await page.waitForLoadState('networkidle');
 check((await pageIDs(page)).length===2&&new URL(page.url()).searchParams.get('s')==='landing page','chip removes one criterion, keeps keyword');
 // Start page2, change sort: page resets; browser Back recovers exact URL/results.
 await go(page,url({sort:'name',paged:2}));const pageTwo=await pageIDs(page),pageTwoURL=page.url();await page.locator('#discovery-sort').selectOption('name_desc');await page.locator('.discovery-sort button').click();await page.waitForLoadState('networkidle');
 check(!new URL(page.url()).searchParams.has('paged')&&(await pageIDs(page))[0]===R(12),'sort resets page1');
 await page.goBack();await page.waitForLoadState('networkidle');check(page.url()===pageTwoURL&&JSON.stringify(await pageIDs(page))===JSON.stringify(pageTwo)&&await page.locator('#discovery-sort').inputValue()==='name','Back recovers page2 URL/results and selected sort');
 const detail=page.locator('[data-resource-id] h3 a').first();await detail.click();await page.waitForLoadState('networkidle');await page.goBack();await page.waitForLoadState('networkidle');check(page.url()===pageTwoURL&&JSON.stringify(await pageIDs(page))===JSON.stringify(pageTwo),'detail Back preserves filtered page state');
 await go(page,url({need:[T('website')],tool:[T('codex')],sort:'observed'}));const sharedURL=page.url(),sharedIDs=await pageIDs(page);
 const shared=await newPage();await go(shared.page,sharedURL);check(JSON.stringify(await pageIDs(shared.page))===JSON.stringify(sharedIDs),'shared URL reproduces scope/filter/sort/results');await shared.context.close();
 await go(page,url({s:'landing page'}));await page.locator('#global-search').fill('css');await page.getByRole('button',{name:'Tìm',exact:true}).click();await page.waitForLoadState('networkidle');await page.goBack();await page.waitForLoadState('networkidle');
 check(await page.locator('#global-search').inputValue()==='landing page'&&(await pageIDs(page)).length===2,'Back restores applied header keyword and matching results');
 console.log('PASS S09 search semantics, sorting, scopes, chips and URL history');
 // Mobile dialog: drafts do not change URL/results, every dismissal rolls back.
 await page.setViewportSize({width:390,height:844});await go(page,url({need:[T('website')],tool:[T('codex')]}));
 const open=page.getByRole('button',{name:/^Bộ lọc/});const dialog=page.getByRole('dialog',{name:'Bộ lọc',exact:true});
 async function opened(){await open.click();await dialog.waitFor({state:'visible'});}
 async function dismissed(){await dialog.waitFor({state:'hidden'});check(await open.evaluate(n=>n===document.activeElement),'dialog dismissal restores focus');}
 const beforeURL=page.url(),beforeIDs=await pageIDs(page);
 await opened();await dialog.getByLabel('Claude Code',{exact:true}).check();
 check(page.url()===beforeURL&&JSON.stringify(await pageIDs(page))===JSON.stringify(beforeIDs),'mobile selections remain draft before Apply');
 for(let i=0;i<18;i++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement.closest('dialog')!==null));}
 check(true,'native modal traps keyboard focus');await page.keyboard.press('Escape');await dismissed();
 await opened();check(!(await dialog.getByLabel('Claude Code',{exact:true}).isChecked()),'Escape discards draft');await dialog.getByLabel('Claude Code',{exact:true}).check();await dialog.getByRole('button',{name:'Đóng bộ lọc'}).click();await dismissed();
 await opened();check(!(await dialog.getByLabel('Claude Code',{exact:true}).isChecked()),'X discards draft');await dialog.getByLabel('Claude Code',{exact:true}).check();await page.goBack();await dismissed();
 await opened();check(!(await dialog.getByLabel('Claude Code',{exact:true}).isChecked()),'Back discards draft');await dialog.getByLabel('Claude Code',{exact:true}).check();await page.mouse.click(1,1);await dismissed();
 await opened();check(!(await dialog.getByLabel('Claude Code',{exact:true}).isChecked()),'backdrop discards draft');
 await dialog.getByRole('button',{name:'Xóa tất cả',exact:true}).click();
 check(!(await dialog.getByLabel('Codex',{exact:true}).isChecked())&&page.url()===beforeURL,'clear all panel changes only draft');await page.keyboard.press('Escape');await dismissed();
 await opened();check(await dialog.getByLabel('Codex',{exact:true}).isChecked(),'reopen restores applied filters');await dialog.getByLabel('Claude Code',{exact:true}).check();
 await page.screenshot({path:join(evidence,'mobile-filter-draft.png')});
 await dialog.getByRole('button',{name:'Áp dụng',exact:true}).click();await page.waitForLoadState('networkidle');await page.waitForURL(u=>u.searchParams.getAll('tool[]').includes(T('claude')));
 check((await pageIDs(page)).length===5&&await page.getByRole('dialog').isVisible()===false,'Apply commits OR tool and closes dialog');
 await page.goBack();await page.waitForLoadState('networkidle');check(page.url()===beforeURL&&JSON.stringify(await pageIDs(page))===JSON.stringify(beforeIDs)&&!(await page.getByRole('dialog').isVisible()),'Back after Apply returns prior results, no ghost panel');
 // Submit GET with JS disabled and with failed enhancement.
 for(const mode of ['no-js','script-blocked']){
  const fallback=await newPage({javaScriptEnabled:mode!=='no-js',viewport:{width:390,height:844}});
  if(mode==='script-blocked')await fallback.context.route(base+'/**',async route=>{if(route.request().resourceType()!=='document')return route.fallback();const response=await route.fetch();return route.fulfill({response,headers:{...response.headers(),'content-security-policy':"script-src 'none'"}});});
  await go(fallback.page,url({s:'landing page'}));check(await fallback.page.locator('#discovery-form').isVisible(),'inline filter available '+mode);
  await fallback.page.locator('#discovery-form').getByLabel('Codex',{exact:true}).check();await fallback.page.locator('#discovery-form').getByRole('button',{name:'Áp dụng'}).click();await fallback.page.waitForLoadState('networkidle');
  check(JSON.stringify(await pageIDs(fallback.page))===JSON.stringify([R(1)]),'native GET filters work '+mode);await capture(fallback.page,mode);await fallback.context.close();
 }
 console.log('PASS S09 mobile drafts, focus, close/Back/Apply and no-JS fallback');
 for(const args of [{scope:'invalid'},{need:'array-wrong'},{tool:['no-such-tool']},{s:'a'.repeat(161)},{s:['array']},{sort:'fake-stars'},{s:'<script></script>'},{category:'not-a-category'}]){
  await go(page,url(args));check(await page.getByRole('alert').innerText().then(t=>t.includes('Chưa áp dụng'))&&await pageIDs(page).then(ids=>ids.length===0)&&await page.locator('.result-count').innerText()==='Chưa có kết quả để hiển thị','invalid input yields explicit error '+JSON.stringify(args));
 }
 await capture(page,'invalid-input');
 const missing=await response(url({s:'css',paged:99}));check(missing.status===404,'out-of-range filtered page404');
 await go(page,result.terms.empty.url);check(await page.locator('.result-count').innerText()==='0 tài nguyên','existing empty category200, no fabricated products');await page.setViewportSize({width:1440,height:1000});await page.locator('#discovery-form').getByRole('button',{name:'Áp dụng'}).click();await page.waitForLoadState('networkidle');check(await page.locator('.result-count').innerText()==='0 tài nguyên'&&await page.getByRole('alert').count()===0,'empty category survives GET apply and share');
 await go(page,url({category:T('skill'),need:[T('website')],tool:[T('claude')]}));await capture(page,'empty-combination');
 await php("<?php require '/wordpress/wp-load.php';wp_update_post(array('ID'=>"+R(1)+",'post_status'=>'draft'));wp_cache_flush();");
 check((await all({s:'chup anh'})).length===0,'withdrawal removed from next search request');
 await php("<?php require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/plugin.php';deactivate_plugins('vne-library-core/vne-library-core.php');");
 await go(page,url({s:'css'}));check(await page.getByRole('alert').innerText().then(t=>t.includes('Thư viện chưa sẵn sàng')),'plugin missing is service state, not false zero results');
 await capture(page,'library-unavailable');
 assert.deepEqual(errors,[]);assert.deepEqual(badHTTP,[]);check(true,'no JS or unexpected internal HTTP failures');assert.deepEqual(hashes(),before);check(true,'live database/config hashes unchanged');
 await context.close();await browser.close();browser=null;await app[Symbol.asyncDispose]();app=null;
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:process.argv.includes('--s10')?'2026-10-22':'2026-10-21',runtime:'WordPress7.1.3 PHP8.3 SQLite Edge headless PlaywrightNode1.62.1',testedThemeHashes:themeEvidence(fixture),testedPluginHashes:pluginEvidence(fixture),checks,queries,fixtureChecks:result.checks,errors,badHTTP,protectedHashes:before,liveFilesUnchanged:true,limits:['Synthetic QA fixtures, no external repository/API certification','No hosting/MySQL/cache/load/cross-browser/usability certification','No stars/editorial recommendations without data; no semantic search or AI','Existing source date required by schema; missing-date ordering is defensive fallback']},null,2)+'\n');
 console.log('PASS S09 '+checks.length+' checks + '+result.checks.length+' fixture checks,20 query cases');
}finally{if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(deadline);assert.deepEqual(hashes(),before);}
