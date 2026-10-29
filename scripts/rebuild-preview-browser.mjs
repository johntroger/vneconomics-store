// Local-only browser smoke; the parent preview runner owns server lifecycle.
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';

const args=Object.fromEntries(Array.from({length:(process.argv.length-2)/2},(_,i)=>[process.argv[2+i*2],process.argv[3+i*2]]));
const base=new URL(args['--base']),module=args['--module'],output=resolve(args['--output']);
assert.ok(base.protocol==='http:'&&base.hostname==='127.0.0.1'&&base.port,'Only loopback HTTP is allowed');
assert.ok(['home','discovery','search','guides'].includes(module),'Unknown module');
assert.ok(!existsSync(output),'Evidence directory already exists');mkdirSync(output,{recursive:true});
const seed=JSON.parse(readFileSync(args['--seed'],'utf8')),checks=[],visits=[],errors=[],blocked=[];
const result={status:'FAIL',module};const started=Date.now();let browser;
try{
 const library=process.env.VNE_PREVIEW_PLAYWRIGHT??join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
 const {chromium}=await import(pathToFileURL(library).href);
 browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 await context.route('**/*',route=>{
  if(new URL(route.request().url()).origin===base.origin)return route.continue();
  blocked.push(route.request().url());return route.abort();
 });
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(String(error)));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 async function visit(path){
  assert.ok(path.startsWith('/')&&!path.startsWith('//')&&new URL(path,base).origin===base.origin,'Unsafe fixture path');
  const t=Date.now(),response=await page.goto(new URL(path,base).href,{waitUntil:'networkidle',timeout:30000});
  assert.equal(response.status(),200,path+' HTTP');
  assert.equal(await page.locator('meta[name="vibelab-release"]').getAttribute('content'),args['--marker'],'Current release marker');
  assert.equal(await page.locator('[data-local-preview]').count(),1);
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
  assert.equal(await page.locator('main h1').count(),1,'One main h1');
  assert.doesNotMatch(await page.locator('body').innerText(),/LOCAL-(?:PRIVATE-NOTE|DRAFT)-MUST-NOT-LEAK|Fatal error:|Error establishing a database connection/);
  visits.push({path,ms:Date.now()-t});
 }
 await visit('/');checks.push('homepage: HTTP200, current marker, local banner, noindex, h1, no private fixture');
 if(args['--expect-css-token']){
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--r72-hot').trim()),args['--expect-css-token']);
  checks.push('saved source CSS appears in browser without restarting WordPress');
 }
 if(module==='discovery'){
  await page.getByRole('navigation',{name:'Điều hướng chính'}).first().getByRole('link',{name:'Tài nguyên',exact:true}).click();
  await page.waitForLoadState('networkidle');assert.equal(new URL(page.url()).pathname,'/tai-nguyen/');
  await visit('/tai-nguyen/');assert.ok(await page.locator('[data-resource-id]').count()>=2);
  await visit(seed.resources[0].path);checks.push('homepage → catalog → seeded resource detail');
 }else if(module==='search'){
  await visit('/?vne_find=1&scope=resources&s=Astro');assert.ok(await page.getByRole('link',{name:'Mẫu local Astro',exact:true}).count()>=1);
  assert.equal(await page.getByRole('link',{name:'Mẫu local Pico CSS',exact:true}).count(),0,'Search excludes unrelated resource');
  assert.equal(await page.locator('link[rel="canonical"]').count(),0);checks.push('search Astro includes match, excludes unrelated resource, noindex, no canonical');
 }else if(module==='guides'){
  await visit('/huong-dan/');assert.ok(await page.getByRole('link',{name:'Mẫu local: hướng dẫn Astro',exact:true}).count()>=1);
  await visit(seed.guide.path);const anchor=page.locator('a[href^="#guide-"]').first(),target=await anchor.getAttribute('href');
  assert.equal(await page.locator(target).count(),1);await anchor.click();assert.equal(new URL(page.url()).hash,target);
  checks.push('guide list → detail → table-of-contents anchor');
 }
 for(const [label,width,height] of [['desktop',1280,800],['mobile',390,844]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' overflow');
  await page.screenshot({path:join(output,label+'.png'),fullPage:true});
 }
 checks.push('selected module desktop/mobile: no horizontal overflow');assert.deepEqual(errors,[]);
 checks.push('no browser console/page errors; external requests blocked');result.status='PASS';
}catch(error){result.error=String(error.stack??error);}
finally{
 if(browser)await browser.close();
 Object.assign(result,{checks,visits,browserErrors:errors,blockedExternalRequests:blocked.length,durationMs:Date.now()-started});
 writeFileSync(join(output,'result.json'),JSON.stringify(result,null,2)+'\n');
}
console.log(JSON.stringify(result));process.exitCode=result.status==='PASS'?0:1;
