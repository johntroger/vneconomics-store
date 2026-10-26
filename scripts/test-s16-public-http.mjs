import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const staging=process.argv.includes('--staging'),origin=staging?'https://staging-store.vneconomics.com':'https://store.vneconomics.com',final=process.argv.includes('--final');
const checks=[],requests=[];let failure=null;
const check=(v,n)=>{assert.ok(v,n);checks.push(n);};
async function get(path,headers={}){const url=new URL(path,origin);assert.equal(url.origin,origin);const start=Date.now();const response=await fetch(url,{redirect:'manual',headers,signal:AbortSignal.timeout(25000)});const body=await response.text();requests.push({path:url.pathname+url.search,status:response.status,ms:Date.now()-start,cacheControl:response.headers.get('cache-control'),cachePolicy:response.headers.get('vne-cache-policy')});return {response,body};}
function healthy(r,name){check(r.response.status===200,name+' HTTP200');check(!/Fatal error:|Uncaught Error|Warning:.* on line/.test(r.body),name+' no PHP error');}
function bypass(r,name){check(/no-store/.test(r.response.headers.get('cache-control')??''),name+' no-store');check(r.response.headers.get('vne-cache-policy')==='bypass',name+' bypass');check(!r.response.headers.has('etag')&&!r.response.headers.has('last-modified'),name+' no validators');}
try{
 const home=await get('/');healthy(home,'home');if(staging){check(/noindex/i.test(home.body+' '+(home.response.headers.get('x-robots-tag')??'')),'staging remains noindex');}else{check(!/noindex/i.test(home.response.headers.get('x-robots-tag')??''),'home header indexable');check(!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(home.body),'home robots indexable');}
 const api=await get('/wp-json/vne-library/v1/items',{'If-None-Match':'"s16-read-only-probe"'});healthy(api,'public API');bypass(api,'public API');const items=JSON.parse(api.body);check(Array.isArray(items),'API items array');
 const me=await get('/wp-json/wp/v2/users/me');check(me.response.status===401,'anonymous cannot read current private user');
 if(final){const support=await get('/?vne_support=ho-tro');healthy(support,'support');bypass(support,'support');}
 const robots=await get('/robots.txt');healthy(robots,'robots');check(staging?/^Disallow:\s*\/wp-admin\//m.test(robots.body):!/^Disallow:\s*\/\s*$/m.test(robots.body),staging?'staging robots retains admin exclusion; noindex checked separately':'production robots not blocking all');
 if(final){
  const imported=JSON.parse(readFileSync(staging?'docs/acceptance/S15/content-import-results.json':'docs/acceptance/S16/content-import-results.json','utf8'));check(imported.status===(staging?'IMPORTED_APPROVED_STAGING_CONTENT':'IMPORTED_APPROVED_PRODUCTION_CONTENT'),'approved import complete');
  const entries=Object.values(imported.journal.map);check(entries.length===11,'11 approved items');check(items.length===6,'6 public resources');
  for(const e of entries){const r=await get(e.url);healthy(r,'item '+e.id);bypass(r,'item '+e.id);check(r.body.includes(e.title.replaceAll('&','&amp;'))||r.body.includes(e.title),'item title '+e.id);check(!r.body.includes('__S15_ITEM_')&&(staging||!r.body.includes('staging-store.vneconomics.com')),'resolved origin links '+e.id);check(r.body.includes('Báo lỗi nội dung này'),'context report link '+e.id);}
  bypass(home,'VibeLab home');check((home.body.match(/data-resource-id=/g)??[]).length===6,'home 6 cards');check(home.body.includes('Truy cập repo')&&home.body.includes('Xem chi tiết'),'both resource CTA labels');
  const lesson=await get(imported.journal.map['7'].url);healthy(lesson,'Moc lesson');check(lesson.body.includes('MOC-WIN-1')&&lesson.body.includes('Windows'),'lesson revision/environment');check(lesson.body.includes('aria-label="Mục lục bài thực hành"'),'lesson table of contents');
  const search=await get('/?vne_find=1&scope=resources&s=astro');healthy(search,'search');bypass(search,'search');check(search.body.includes('Astro Basics'),'search resolves approved resource');
  for(const path of ['/tai-nguyen/','/huong-dan/']){const r=await get(path);healthy(r,path);bypass(r,path);}
 }
}catch(e){failure=String(e.stack??e);process.exitCode=1;}
finally{writeFileSync('docs/acceptance/S16/'+(staging?'legacy-fix-staging':final?'final':'plugin')+'-http-results.json',JSON.stringify({status:failure?'FAIL':staging?'PASS_STAGING_LEGACY_FIX_READ_ONLY_HTTP':'PASS_PRODUCTION_READ_ONLY_HTTP',origin,observedAt:new Date().toISOString(),checks,requests,failure,limits:['Anonymous GET only, TLS verification enabled','No report submission/payment/email/paid API','No fault injection on production','HTTP route checks do not repeat staging authenticated editing/race tests']},null,2)+'\n');console.log((failure?'FAIL':'PASS')+' '+origin+' '+checks.length+' checks / '+requests.length+' requests');if(failure)console.error(failure);}
