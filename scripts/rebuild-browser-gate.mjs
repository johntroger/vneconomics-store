import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
export async function runBrowserGate({base,source,seeded,evidence}){
 process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('.local/playwright-browsers');
 const module=process.env.REBUILD_PLAYWRIGHT_MODULE;assert.ok(module,'Set REBUILD_PLAYWRIGHT_MODULE to the installed Playwright index.mjs');
 const engines=await import(pathToFileURL(module).href);const checks=[];const visits=[];
 const check=(ok,label)=>{assert.ok(ok,label);checks.push(label);};
 for(const engine of ['chromium','firefox','webkit']){
  const browser=await engines[engine].launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000}});const errors=[];const external=[];
   await context.route('**/*',route=>{if(new URL(route.request().url()).origin===base)return route.continue();external.push(route.request().url());return route.abort();});
   const page=await context.newPage();page.on('pageerror',error=>errors.push(String(error)));
   async function visit(path){const r=await page.goto(base+path);await page.waitForLoadState('networkidle');assert.equal(r.status(),200,path);assert.doesNotMatch(await page.locator('main').innerText(),/DRAFT-MUST-NOT-LEAK|PRIVATE-MUST-NOT-LEAK|PENDING-MUST-NOT-LEAK|PRIVATE-EDITORIAL-S06/);visits.push({engine,path,status:r.status()});}
   await visit('/');await Promise.all([page.waitForURL(base+'/tai-nguyen/'),page.getByRole('navigation',{name:'Điều hướng chính'}).first().getByRole('link',{name:'Tài nguyên',exact:true}).click()]);await page.waitForLoadState('networkidle');const count=await page.locator('[data-resource-id]').count();if(count!==6){await page.screenshot({path:join(evidence,engine+'-catalog-failure.png'),fullPage:true});writeFileSync(join(evidence,engine+'-catalog-failure.html'),await page.content());}check(count===6,engine+' discovery lists six approved resources; actual '+count);
   await Promise.all([page.waitForURL(url=>url.pathname.includes('astro')),page.getByRole('link',{name:'Astro Basics',exact:true}).click()]);await page.waitForLoadState('networkidle');check(await page.locator('h1').innerText()==='Astro Basics',engine+' discovery reaches detail');
   await Promise.all([page.waitForURL(url=>url.searchParams.get('vne_support')==='bao-loi'),page.getByRole('link',{name:'Báo lỗi nội dung này',exact:true}).click()]);await page.waitForLoadState('networkidle');check(await page.locator('#resource-report-form').count()===1,engine+' report form reachable without submitting');check((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'),engine+' report noindex');
   await visit('/');await page.locator('.v2-header-search').first().getByRole('searchbox').fill('Astro');await Promise.all([page.waitForURL(url=>url.searchParams.get('s')==='Astro'),page.locator('.v2-header-search').first().getByRole('button',{name:'Tìm',exact:true}).click()]);await page.waitForLoadState('networkidle');check(await page.locator('[data-resource-id]').count()===1,engine+' search narrows results');check(await page.locator('link[rel="canonical"]').count()===0,engine+' search has no canonical');
   await visit('/huong-dan/');await Promise.all([page.waitForURL(url=>url.pathname.startsWith('/huong-dan/')&&url.pathname!=='/huong-dan/'),page.getByRole('link',{name:/Làm landing page/}).click()]);await page.waitForLoadState('networkidle');check(await page.locator('.v2-guide-toc').count()===1,engine+' guide journey reaches toc');
   await visit('/cau-hoi-thuong-gap/');await page.locator('.support-content summary').first().focus();await page.keyboard.press('Enter');check(await page.locator('.support-content details').first().getAttribute('open')!==null,engine+' FAQ keyboard opens');
   for(const path of ['/','/tai-nguyen/','/huong-dan/','/tro-giup/']){
    await visit(path);
    for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:1000});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),engine+' no overflow '+path+' '+width);}
    if(engine==='chromium'){await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(evidence,'release-'+(path==='/'?'home':path.split('/')[1])+'-mobile.png'),fullPage:true});}
    await page.setViewportSize({width:1440,height:1000});
   }
   check(errors.length===0,engine+' no page errors');check(external.length===0,engine+' no external requests');await context.close();console.log('PASS browser engine '+engine);
  }finally{await browser.close();}
 }
 writeFileSync(join(evidence,'browser-results.json'),JSON.stringify({status:'PASS_R52_THREE_BROWSERS',sourceSha:source,checks,visits,limits:['Synthetic approved fixtures from installed candidate ZIP; not production data','Report GET only; no submission/email/external service call']},null,2)+'\n');console.log('PASS three-browser release gate '+checks.length+' checks');
}
