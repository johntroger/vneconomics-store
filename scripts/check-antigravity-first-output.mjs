import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const edited=process.argv.includes('--edited'),restored=process.argv.includes('--restored');assert.ok(!(edited&&restored));
const claude=process.argv.includes('--claude'),tool=claude?'claude':'antigravity';
const stage=tool+(edited?'-title-edit':restored?'-restored':process.argv.includes('--recheck')?'-recheck':'-first-check');
const source=resolve('examples/moc-studio-'+tool),out=resolve('docs/content-guides/2026-10-25/'+stage);mkdirSync(out,{recursive:true});
const expectedTitle=edited?'Hình ảnh chỉn chu cho sản phẩm của bạn':'Ảnh đẹp để sản phẩm lên tiếng';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const files=['index.html','style.css'],before=Object.fromEntries(files.map(f=>[f,hash(join(source,f))]));
const checks=[],errors=[],outsideRequests=[],views=[];
const check=(ok,name,details)=>checks.push({name,ok:Boolean(ok),...(details?{details}:{} )});
let browser;
try{
 const expectedFiles=edited||restored?[...files,'checkpoint-v1']:files;
 check(JSON.stringify(readdirSync(source).sort())===JSON.stringify(expectedFiles.sort()),'two output files and expected checkpoint only');
 const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));
 const allowed=new Set(files.map(f=>pathToFileURL(join(source,f)).href));
 await page.route('**/*',r=>{if(allowed.has(r.request().url()))return r.continue();outsideRequests.push(r.request().url());return r.abort();});
 const url=pathToFileURL(join(source,'index.html')).href;
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(url);await page.waitForLoadState('networkidle');
  check(await page.locator('h1').count()===1&&await page.locator('h1').innerText()===expectedTitle,'single expected h1 '+width);
  check(await page.locator('html').getAttribute('lang')==='vi','Vietnamese language '+width);
  check(await page.locator('script,form,input,iframe,object,embed').count()===0,'no scripts/forms/embedded application '+width);
  check(await page.evaluate(()=>![...document.querySelectorAll('*')].some(e=>[...e.attributes].some(a=>/^on/i.test(a.name)))),'no inline handlers '+width);
  check(await page.locator(claude?'section[aria-labelledby="dich-vu"] .card':'#dich-vu article').count()===3&&await page.locator(claude?'section[aria-labelledby="quy-trinh"] .steps > li':'#quy-trinh .process-step').count()===3,'three services and three process steps '+width);
  check((await page.locator('#lien-he').innerText()).includes('chưa nhận đặt lịch'),'contact clearly illustrative '+width);
  check(await page.locator('link[rel="stylesheet"]').getAttribute('href')==='style.css'&&await page.evaluate(expected=>getComputedStyle(document.body).backgroundColor===expected,claude?'rgb(250, 245, 236)':'rgb(251, 249, 245)'),'local CSS loaded '+width);
  const layout=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left< -1||e.right>innerWidth+1).slice(0,15)}));
  check(layout.scrollWidth<=width,'no horizontal overflow '+width,layout);views.push({width,layout});
  await page.screenshot({path:join(out,'original-'+width+'.png'),fullPage:true});await page.screenshot({path:join(out,'original-'+width+'-top.png')});
  const links=await page.locator('a').all();
  for(let i=0;i<links.length;i++){
   const a=page.locator('a').nth(i),href=await a.getAttribute('href'),text=await a.innerText();check(Boolean(href?.startsWith('#')),'internal link '+width+' '+text);
   if(!href?.startsWith('#'))continue;
   check(await page.locator(href).count()===1,'unique anchor '+width+' '+href);
   await a.click();await page.waitForFunction(()=>new Promise(resolve=>{let previous=scrollY,stable=0;function tick(){const current=scrollY;if(Math.abs(current-previous)<0.5)stable++;else stable=0;previous=current;if(stable>=8)resolve(true);else requestAnimationFrame(tick);}requestAnimationFrame(tick);}));
   check(new URL(page.url()).hash===href,'clicked link target '+width+' '+text);
   const visible=await page.locator(href).evaluate(e=>{const h=e.querySelector('h2')||e,header=document.querySelector('header'),position=getComputedStyle(header).position;return {headingTop:h.getBoundingClientRect().top,headerBottom:['sticky','fixed'].includes(position)?header.getBoundingClientRect().bottom:0};});
   check(visible.headingTop>=visible.headerBottom-1,'target heading not covered by sticky header '+width+' '+href,visible);
   if(visible.headingTop<visible.headerBottom-1&&href==='#loi-ich')await page.screenshot({path:join(out,'anchor-overlap-'+width+'.png')});
   if((process.argv.includes('--recheck')||edited||restored)&&href==='#loi-ich')await page.screenshot({path:join(out,'anchor-check-'+width+'.png')});
  }
  await page.getByRole('link',{name:'Xem cách liên hệ',exact:true}).click();await page.waitForFunction(()=>location.hash==='#lien-he');
 }
 check(errors.length===0,'no browser JavaScript errors',errors);check(outsideRequests.length===0,'no external or unexpected file requests',outsideRequests);
 const after=Object.fromEntries(files.map(f=>[f,hash(join(source,f))]));check(JSON.stringify(before)===JSON.stringify(after),'original output bytes unchanged');
 const failed=checks.filter(x=>!x.ok);
 writeFileSync(join(out,'results.json'),JSON.stringify({status:failed.length?'NEEDS_OUTPUT_FIXES':edited?'PASS_EDITED_OUTPUT':restored?'PASS_RESTORED_OUTPUT':'PASS_INITIAL_OUTPUT',tool,stage,observedAt:new Date().toISOString(),expectedTitle,sourceHashes:before,checks,passed:checks.length-failed.length,failed,views,errors,outsideRequests,originalUnchanged:true,limitations:['Output checked in the named tool folder; model/session not recorded by this runner','This script checks the named output stage without changing it; restoration has a separate guarded runner','Not a production publication or certificate of installation/sign-in or whole tutorial']},null,2)+'\n');
 console.log(JSON.stringify({status:failed.length?'NEEDS_OUTPUT_FIXES':edited?'PASS_EDITED_OUTPUT':restored?'PASS_RESTORED_OUTPUT':'PASS_INITIAL_OUTPUT',checks:checks.length,passed:checks.length-failed.length,failed},null,2));if(failed.length)process.exitCode=1;
}finally{if(browser)await browser.close();}
