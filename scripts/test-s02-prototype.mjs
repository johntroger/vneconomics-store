import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readdirSync,readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createPrototypeServer,closePrototypeServer} from './s02-prototype-server.mjs';
const browserModule=process.env.VNE_PLAYWRIGHT_MODULE||resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
assert.ok(existsSync(browserModule),'Set VNE_PLAYWRIGHT_MODULE to installed Playwright index.mjs');
const {chromium}=await import(pathToFileURL(browserModule));
const evidence=resolve('docs/acceptance/S02');mkdirSync(evidence,{recursive:true});
const root=resolve('prototype/s02');
const pages=readdirSync(root).filter(f=>f.endsWith('.html'));
const results=[],issues=[];
let server,browser;
const deadline=setTimeout(()=>{console.error('FAIL: S02 browser checks exceeded 180 seconds');process.exit(1);},180000);deadline.unref();
try{
 server=await createPrototypeServer(0);
 const base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext();
 const blocked=[];
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin===base)return route.continue();blocked.push(url.origin);return route.abort();});
 const page=await context.newPage();
 page.on('pageerror',error=>issues.push(error.message));
 page.on('console',message=>{if(message.type()==='error')issues.push(message.text());});
 for(const [label,width,height] of [['desktop',1440,1000],['tablet',834,1112],['mobile',390,844],['small-mobile',360,800]]){
  await page.setViewportSize({width,height});
  for(const file of pages){
   const response=await page.goto(`${base}/${file}`);assert.equal(response.status(),200,file);
   await page.waitForLoadState('networkidle');
   // Visit lazy images before checking naturalWidth; offscreen images are not broken.
   for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(element=>element.decode());}
   await page.evaluate(()=>scrollTo(0,0));
   assert.equal(await page.locator('h1').count(),1,`${file} h1`);
   const layout=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,missingImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length,duplicateIDs:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i)}));
   assert.ok(layout.document<=layout.width+1,`${file} overflow at ${width}: ${layout.document}`);
   assert.equal(layout.missingImages,0,`${file} broken images`);assert.deepEqual(layout.duplicateIDs,[],`${file} duplicate IDs`);
   if(['desktop','mobile'].includes(label)&&['index.html','category.html','resource-web-basics.html','guide.html','sample.html'].includes(file))await page.screenshot({path:join(evidence,`${file.replace('.html','')}-${label}.png`),fullPage:true});
  }
  results.push(`PASS ${label}: ${pages.length} pages, no overflow/broken images/duplicate IDs`);console.log(results.at(-1));
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(`${base}/index.html`);
 const firstCard=page.locator('[data-resource]').first();
 assert.equal(await firstCard.locator('.card-cover').getAttribute('href'),'resource-web-basics.html');
 assert.equal(await firstCard.locator('h3 a').getAttribute('href'),'resource-web-basics.html');
 assert.equal(await firstCard.locator('.repo-button').getAttribute('href'),'https://github.com/microsoft/Web-Dev-For-Beginners');
 assert.equal(await firstCard.locator('.repo-button').getAttribute('target'),'_blank');
 await firstCard.locator('h3 a').click();await page.waitForURL('**/resource-web-basics.html');
 assert.match(await page.locator('h1').innerText(),/Web Dev/);
 await page.getByRole('link',{name:'Tôi chưa biết bắt đầu từ đâu'}).click();await page.waitForURL('**/guide.html');
 await page.getByRole('link',{name:'Mở landing page mẫu'}).click();await page.waitForURL('**/sample.html');
 await page.getByRole('link',{name:'Xem thông tin liên hệ mẫu'}).click();assert.equal(new URL(page.url()).hash,'#lien-he');
 await page.getByRole('link',{name:'Học cách thay nội dung này'}).click();await page.waitForURL('**/guide.html#thay-doi');
 results.push('PASS journeys: home -> detail -> guide -> sample -> contact -> guide');
 await page.goto(`${base}/category.html?type=skill`);await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('[data-resource]:visible').count(),2);
 await page.locator('#catalog-type').selectOption('');await page.locator('#catalog-query').fill('giao dien');await page.locator('#catalog-filters').getByRole('button',{name:'Áp dụng bộ lọc'}).click();
 assert.ok(await page.locator('[data-resource]:visible').count()>0);assert.equal(new URL(page.url()).searchParams.get('q'),'giao dien');
 await page.locator('#catalog-query').fill('zzzz-no-match');await page.locator('#catalog-filters').getByRole('button',{name:'Áp dụng bộ lọc'}).click();
 assert.equal(await page.locator('[data-resource]:visible').count(),0);assert.ok(await page.locator('#empty-state').isVisible());
 await page.goBack();assert.equal(await page.locator('#catalog-query').inputValue(),'giao dien');
 await page.getByRole('button',{name:'Xóa bộ lọc',exact:true}).click();assert.equal(await page.locator('[data-resource]:visible').count(),6);
 results.push('PASS static filters: type, accentless query, empty state, URL, Back, reset');
 await page.goto(`${base}/resource-pico.html`);assert.ok(await page.locator('.notice.warning').isVisible());
 await page.goto(`${base}/resource-web-design.html`);assert.match(await page.locator('#nguon-goc').innerText(),/Chưa xác định/);
 assert.equal(await page.locator('.product-repo').getAttribute('href'),'https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines');
 await page.goto(`${base}/guide.html`);await page.locator('.lesson-checklist input').first().check();assert.equal(await page.locator('#check-progress').innerText(),'1/5 mục bạn tự đánh dấu');
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.getByRole('button',{name:'Sao chép brief'}).click();await page.waitForFunction(()=>document.querySelector('#copy-status').textContent.includes('Đã sao chép'));assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Mộc Studio/);
 await page.setViewportSize({width:390,height:844});await page.goto(`${base}/index.html`);const menu=page.getByRole('button',{name:'Menu',exact:true});await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');assert.ok(await page.locator('#main-nav').isVisible());await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.ok(await menu.evaluate(e=>e===document.activeElement));
 results.push('PASS source/status truthfulness, checklist, clipboard, mobile menu and Escape focus');
 const linkedPages=new Set();
 for(const file of pages){
  await page.goto(`${base}/${file}`);
  const links=await page.locator('a[href]').evaluateAll(elements=>elements.map(e=>e.getAttribute('href')));
  for(const href of links){
   if(/^https:/.test(href))continue;
   const url=new URL(href,`${base}/${file}`);assert.equal(url.origin,base,'unexpected origin');
   const target=join(root,url.pathname.slice(1));assert.ok(existsSync(target),`${file} broken internal link ${href}`);
   if(url.hash){const html=readFileSync(target,'utf8');assert.ok(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${file} missing anchor ${href}`);}
   linkedPages.add(url.pathname);
  }
 }
 results.push(`PASS internal targets and anchors: ${linkedPages.size} pages linked`);
 assert.deepEqual(issues,[],'console/page errors');assert.deepEqual(blocked,[],'prototype attempted remote requests');
 const outside=await fetch(`${base}/package.json`);assert.equal(outside.status,404);
 writeFileSync(join(evidence,'browser-results.json'),JSON.stringify({date:'2026-10-19',browser:'Microsoft Edge headless through Playwright',playwright:'1.62.1',viewportChecks:4,pages:pages.length,results,issues,remoteRequests:blocked,screenshots:'index/category/resource-web-basics/guide/sample at desktop and mobile',scope:'static S02 only; not WordPress or human novice acceptance'},null,2)+'\n');
 console.log('PASS: S02 browser checks completed with 0 console/page errors and 0 remote requests.');
 await context.close();
}finally{
 if(browser)await browser.close();if(server)await closePrototypeServer(server);clearTimeout(deadline);
}
