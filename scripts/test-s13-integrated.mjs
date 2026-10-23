import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {themeEvidence,pluginEvidence} from './theme-evidence.mjs';
import {seedS13} from './s13-content.mjs';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};const {startSite}=await import('./local-runtime.mjs');
const evidence=resolve('docs/acceptance/S13');mkdirSync(evidence,{recursive:true});mkdirSync('tmp/tests',{recursive:true});
const fixture=mkdtempSync(resolve('tmp/tests/s13-')),base='http://127.0.0.1:19413';
const protectedFiles=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>protectedFiles.map(p=>createHash('sha256').update(readFileSync(p)).digest('hex'));const before=hashes();
const checks=[],errors=[],performance=[],audits=[],external=[],repoTargets=[];let app,browser;
const check=(v,s)=>{assert.ok(v,s);checks.push(s);};
const timeout=setTimeout(()=>{console.error('S13 deadline');process.exit(1);},1200000);timeout.unref();
async function php(code){const r=await app.playground.run({code:"<?php require '/wordpress/wp-load.php';"+code});assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;}
async function go(page,url){const r=await page.goto(url);assert.equal(r.status(),200,url);await page.waitForLoadState('networkidle');assert.doesNotMatch(await page.content(),/Fatal error:|Warning:|Notice:|MUST-NOT-LEAK/);return r;}
async function audit(page,label){
 await page.locator('main h1').waitFor({state:'visible',timeout:60000});
 const a=await page.evaluate(()=>({
 lang:document.documentElement.lang,h1:document.querySelectorAll('main h1').length,main:document.querySelectorAll('main').length,
 title:document.title,description:document.querySelector('meta[name="description"]')?.content,
 canonical:[...document.querySelectorAll('link[rel="canonical"]')].map(n=>n.href),
 unnamed:[...document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea')].filter(n=>!n.hidden&&n.getClientRects().length&&!((n.getAttribute('aria-label')||n.textContent||n.getAttribute('title')||'').trim()||n.labels?.length)).map(n=>n.outerHTML),
 missingAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).map(i=>i.src),
 overflow:document.documentElement.scrollWidth>innerWidth
 }));
 audits.push({label,...a});console.log('AUDIT',label,JSON.stringify(a));
 check(a.lang.startsWith('vi')&&a.h1===1&&a.main===1&&!!a.title,label+' language/title/main/h1');
 check(a.unnamed.length===0&&a.missingAlt.length===0,label+' visible controls named and image alt present');
 check(!a.overflow,label+' no horizontal page overflow');
 check(a.canonical.length===1&&!!a.description,label+' one canonical and description');
 if(label==='category desktop')check(a.title.includes('Mẫu dự án'),'category title describes exact category');
 if(label==='support')check(!a.title.includes('Page ho-tro')&&a.title.includes('VibeLab Việt'),'support title contains brand without fake pagination');
 if(label.endsWith('desktop')){await page.screenshot({path:join(evidence,label.split(' ')[0]+'-desktop.png'),fullPage:true});await page.screenshot({path:join(evidence,label.split(' ')[0]+'-desktop-top.png')});}
}
try{
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 app=await startSite(fixture,19413);const seed=await seedS13(app,fixture);
 check(seed.resources.length===6&&seed.guides.length===3,'six approved resources and five-piece lesson cluster');
 const second=await seedS13(app,fixture);assert.deepEqual(second,seed);checks.push('seed rerun retains ids and does not duplicate/overwrite');
 if(!process.argv.includes('--seo-only')){
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
 await ctx.route('**/*',r=>{
 if(new URL(r.request().url()).origin===base)return r.continue();
 if(r.request().isNavigationRequest()&&r.request().url()==='https://github.com/microsoft/Web-Dev-For-Beginners'){repoTargets.push(r.request().url());return r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Intercepted source navigation</title><p>Local QA interception; upstream not fetched.</p>'});}
 external.push(r.request().url());return r.abort();
});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await go(page,base+'/');await audit(page,'home desktop');
 check(await page.locator('article.resource-card').count()===6,'home contains six catalog cards');
 const first=page.locator('article.resource-card').first();
 check(await first.locator('a[href*="github.com"]').count()>0,'repo action distinct from internal detail');
 const sourcePopup=page.waitForEvent('popup');await page.locator('article.resource-card a[href="https://github.com/microsoft/Web-Dev-For-Beginners"]').click();
 const popup=await sourcePopup;await popup.waitForLoadState('domcontentloaded');check(popup.url()==='https://github.com/microsoft/Web-Dev-For-Beginners','repo CTA opens correct URL in new tab (intercepted, no upstream request)');check(await popup.evaluate(()=>window.opener===null),'repo target has no opener');await popup.close();
 await page.locator('article.resource-card a[href="'+seed.resources[0].url+'"]').first().click();check(page.url()===seed.resources[0].url,'internal card opens exact resource detail');await audit(page,'resource desktop');
 check(await page.getByRole('link').filter({hasText:'repo'}).count()>0||await page.locator('a[href*="github.com/microsoft/Web-Dev-For-Beginners"]').count()>0,'resource exposes original repo');
 await go(page,base+'/tai-nguyen/');await audit(page,'catalog desktop');
 const category=await page.locator('a[href*="/danh-muc/"]').first().getAttribute('href').catch(()=>null);
 check(!!category,'catalog has navigable category');await go(page,category);await audit(page,'category desktop');
 await go(page,base+'/?vne_find=1&scope=resources&s=css');
 check((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'),'search results noindex');
 check(await page.locator('article.resource-card').count()>0,'accentless CSS query returns catalog result');
 check(await page.locator('link[rel="canonical"]').count()===0,'search does not claim unrelated canonical');
 await go(page,seed.lesson.url);await audit(page,'lesson desktop');
 check(await page.locator('.lesson-copy:visible').count()>=4,'lesson commands visible only with scoped historical validation');
 const box=page.locator('[data-lesson-check]').first();await box.check();await page.reload();check(await page.locator('[data-lesson-check]').first().isChecked(),'lesson checklist survives reload');
 await page.locator('#lesson-reset').click();check(!await page.locator('[data-lesson-check]').first().isChecked(),'lesson progress reset works');
 for(const row of [...seed.guides,seed.practice]){await go(page,row.url);await audit(page,'supporting lesson '+row.id);}
 await go(page,base+'/?vne_support=ho-tro');await audit(page,'support');
 for(const width of [360,390]){
  await page.setViewportSize({width,height:900});
  for(const [label,url] of [['home',base+'/'],['catalog',base+'/tai-nguyen/'],['resource',seed.resources[0].url],['lesson',seed.lesson.url]]){
   await go(page,url);await audit(page,label+' mobile '+width);
   await page.evaluate(async()=>{for(const i of document.images){i.loading='eager';await i.decode().catch(()=>{});}});
   await page.screenshot({path:join(evidence,label+'-'+width+'.png'),fullPage:true});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await go(page,base+'/');
 await page.keyboard.press('Tab');check(await page.evaluate(()=>document.activeElement.classList.contains('skip-link')),'first Tab reaches skip link');await page.keyboard.press('Enter');check(await page.evaluate(()=>document.activeElement.id==='main'),'skip link focuses main');
 await ctx.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:900}});await nojs.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
 const np=await nojs.newPage();await go(np,seed.lesson.url);check(await np.locator('h1').count()===1&&await np.locator('pre').count()>=4,'lesson instructions readable without JavaScript');await nojs.close();

 }
 const excluded=JSON.parse(await php("wp_set_current_user(get_user_by('login','admin')->ID);$i=vne_library_item("+seed.lesson.id+",true);$p=array_intersect_key($i,array_flip(array('post_type','title','content','excerpt','status','primary_category','categories','needs','tools','document_source')));$ids=array();foreach(array('draft','private','publish') as $status){$p['title']='S13 SEO fixture '.$status;$p['status']=$status;$r=vne_library_save_item($p);if(is_wp_error($r))throw new Exception($r->get_error_message());$ids[]=$r['id'];if($status==='publish')delete_post_meta($r['id'],'_vne_approved_content');}echo wp_json_encode($ids);"));

 // Test indexing on an isolated loopback fixture only. Retained human preview remains noindex.
 await php("update_option('blog_public',1);");

 for(const type of ['vne_resource','vne_guide','vne_practice']){
  const r=await fetch(base+'/wp-sitemap-posts-'+type+'-1.xml',{redirect:'error',signal:AbortSignal.timeout(60000)});check(r.status===200,'sitemap '+type+' status');
  const xml=await r.text();check(/^<\?xml/.test(xml),'raw network XML rather than browser XSL presentation '+type);writeFileSync(join(evidence,'sitemap-'+type+'.xml'),xml);console.log('SITEMAP',type,r.url,r.headers.get('content-type'),(xml.match(/<loc>/g)||[]).length,xml.slice(0,180));const expected=type==='vne_resource'?seed.resources:(type==='vne_guide'?[seed.lesson,...seed.guides]:[seed.practice]);check((xml.match(/<loc>/g)||[]).length===expected.length,'sitemap exact approved public count '+type);for(const row of expected)check(xml.includes(row.url),'sitemap includes approved URL '+row.id);check(!xml.includes('s13-seo-fixture'),'draft/private/unapproved entries excluded');check(!xml.includes('sample-page')&&!xml.includes('hello-world')&&!xml.includes('vne_report'),'sitemap excludes installer and private system content '+type);
 }
 const xml=await (await fetch(base+'/wp-sitemap.xml',{redirect:'error',signal:AbortSignal.timeout(60000)})).text();check(!xml.includes('wp-sitemap-users')&&!xml.includes('wp-sitemap-posts-post-'),'index sitemap only library content');
 await php("wp_set_current_user(get_user_by('login','admin')->ID);foreach("+JSON.stringify(excluded).replace('[','array(').replace(']',')')+" as $id){wp_delete_post($id,true);}update_option('blog_public',0);");
 if(process.argv.includes('--seo-only')){writeFileSync(join(evidence,'seo-results.json'),JSON.stringify({checks,testedThemeHashes:themeEvidence(fixture),testedPluginHashes:pluginEvidence(fixture)},null,2)+'\n');console.log('PASS S13 SEO '+checks.length);}else{
 if(!process.argv.includes('--functional-only')){
 // Cold browser caches, mobile viewport, explicit CPU/network profile; local PHP time included.
 for(const [label,url] of [['home',base+'/'],['catalog',base+'/tai-nguyen/'],['resource',seed.resources[0].url],['lesson',seed.lesson.url]]){
  for(let run=1;run<=3;run++){
   const pc=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
   await pc.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
   await pc.addInitScript(()=>{window.__vnePerf={lcp:0,cls:0,shifts:[]};new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__vnePerf.lcp=e.startTime;window.__vnePerf.lcpElement=e.element?.tagName+':'+(e.element?.textContent||'').slice(0,100);}}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){window.__vnePerf.cls+=e.value;window.__vnePerf.shifts.push({time:e.startTime,value:e.value,sources:e.sources?.map(s=>({tag:s.node?.tagName,previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))});}}).observe({type:'layout-shift',buffered:true});});
   const pp=await pc.newPage(),cdp=await pc.newCDPSession(pp);
   await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   const navigation=await pp.goto(url,{waitUntil:'load',timeout:60000});assert.equal(navigation.status(),200);await pp.waitForTimeout(1500);
   const p=await pp.evaluate(()=>({...window.__vnePerf,ttfb:performance.getEntriesByType('navigation')[0].responseStart,transfer:performance.getEntriesByType('resource').reduce((s,e)=>s+e.transferSize,0),resources:performance.getEntriesByType('resource').map(e=>({name:e.name,start:e.startTime,end:e.responseEnd,bytes:e.transferSize}))}));
   performance.push({page:label,run,...p});if(run===1)await pp.screenshot({path:join(evidence,'lab-'+label+'.png')});console.log('PERF',label,run,JSON.stringify(p));await pc.close();
  }
 }
 }
 const budget=performance.map(p=>({page:p.page,run:p.run,lcpPass:p.lcp>0&&p.lcp<=2500,clsPass:p.cls<=0.1}));const performancePass=performance.length===12&&budget.every(p=>p.lcpPass&&p.clsPass);const functionalOnly=process.argv.includes('--functional-only');
 check(repoTargets.length===1,'exactly one source navigation intercepted without external service call');
 check(errors.length===0,'no blocking JavaScript errors');check(external.length===0,'no external requests in public local flows');assert.deepEqual(hashes(),before);
 writeFileSync(join(evidence,functionalOnly?'functional-results.json':'test-results.json'),JSON.stringify({date:'2026-10-22',status:functionalOnly?'PASS_FUNCTIONAL':(performancePass?'PASS_TECHNICAL':'FAIL_PERFORMANCE'),labExecuted:!functionalOnly,functionalStatus:'PASS',checks,audits,performance,budget,profile:{browser:'Edge headless',viewport:'390x844',cpu:4,rttMs:40,downloadMbps:1.6,uploadKbps:750,coldCache:true,observationWindow:'navigation load +1500ms, no user interaction',runsPerPage:3,network:'synthetic local loopback; not field data'},errors,external,repoTargets,testedThemeHashes:themeEvidence(fixture),testedPluginHashes:pluginEvidence(fixture),protectedHashes:before,ownerReview:'pending; owner replaced mandatory beginner recruitment on 2026-10-22',limits:['Basic automated accessibility checks only; no WCAG certification','No real beginner, fresh Windows install, external repo verification, hosting/MySQL/CDN or field INP test','No paid API, mail or deployment']},null,2)+'\n');
 console.log((functionalOnly?'PASS FUNCTIONAL (lab separate)':(performancePass?'PASS':'FAIL performance budget; functional PASS'))+' S13 integrated '+checks.length+' functional checks');if(!functionalOnly&&!performancePass)process.exitCode=1;
 }
}catch(e){writeFileSync(join(evidence,'failure-'+new Date().toISOString().replaceAll(':','-')+'.json'),JSON.stringify({message:e.stack,checks,performance,audits},null,2)+'\n');throw e;}
finally{if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(timeout);assert.deepEqual(hashes(),before);}
