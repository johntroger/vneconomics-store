import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
const origin='https://staging-store.vneconomics.com',formOnly=process.argv.includes('--form-only');
const cacheMode=process.argv.find(a=>a.startsWith('--cache-mode='))?.split('=')[1];
if(cacheMode&&!['failed','recovered'].includes(cacheMode))throw new Error('Invalid cache probe mode');
const imported=JSON.parse(readFileSync('docs/acceptance/S15/content-import-results.json','utf8'));
assert.equal(imported.status,'IMPORTED_APPROVED_STAGING_CONTENT');
const checks=[],requests=[];let failure=null;
const ok=(v,label)=>{assert.ok(v,label);checks.push(label);};
const safe=s=>s.replace(/([?&]receipt=)[^&\s"'<>]+/g,'$1[REDACTED]').replace(/<input\b[^>]*type=["']hidden["'][^>]*>/gi,'[HIDDEN INPUT REDACTED]');
async function request(path,options={}){
 const url=new URL(path,origin);assert.equal(url.origin,origin);
 const start=performance.now(),response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(25000),...options}),body=await response.text();
 const headers=Object.fromEntries([...response.headers].filter(([k])=>k!=='set-cookie').map(([k,v])=>[k,safe(v)]));
 requests.push({path:safe(url.pathname+url.search),method:options.method??'GET',status:response.status,ms:Math.round(performance.now()-start),headers,body:safe(body).slice(0,1200)});
 return {response,body};
}
function noCache(r,label){ok(/no-store/.test(r.response.headers.get('cache-control')??''),label+' no-store');ok(r.response.headers.get('vne-cache-policy')==='bypass',label+' bypass');ok(!r.response.headers.has('etag')&&!r.response.headers.has('last-modified'),label+' no validators');}
try{
 if(cacheMode){
  for(const path of ['/','/wp-json/vne-library/v1/items','/?vne_support=ho-tro']){
   const r=await request(path,{headers:{'If-None-Match':'"s15-cache-probe"','If-Modified-Since':'Wed, 01 Jan 2031 00:00:00 GMT'}});
   ok(r.response.status===(cacheMode==='failed'?503:200),'cache '+cacheMode+' status '+path);noCache(r,'cache '+path);
   if(cacheMode==='failed'){const text=(r.response.headers.get('content-type')??'').includes('application/json')?JSON.parse(r.body).message:r.body;ok(/tạm dừng/i.test(text),'cache failure notice '+path);}
  }
 }else if(formOnly){
  const fixture=JSON.parse(readFileSync('docs/acceptance/S15/http-report-fixture.json','utf8'));
  assert.ok(fixture.marker.startsWith('S15 HTTP disposable report '));assert.equal(fixture.resource,108);assert.equal(fixture.cleanup,false);
  const path='/?vne_support=bao-loi&resource=108',page=await request(path);ok(page.response.status===200,'report form 200');noCache(page,'report form');
  const reportForm=/<form\b[^>]*id=["']resource-report-form["'][^>]*>([\s\S]*?)<\/form>/i.exec(page.body)?.[1];ok(!!reportForm,'report form isolated from search form');
  const params=new URLSearchParams();
  for(const tag of reportForm.match(/<input\b[^>]*>/gi)??[]){const name=/\bname=["']([^"']+)["']/i.exec(tag)?.[1],value=/\bvalue=["']([^"']*)["']/i.exec(tag)?.[1]??'';if(name&&/\btype=["']hidden["']/i.test(tag))params.set(name,value);}
  for(const key of ['nonce','resource_id','revision','issued','random','signature'])ok(params.has(key),'form hidden field '+key);
  params.set('kind','other');params.set('description',fixture.marker+' — temporary acceptance probe, not a real content issue.');params.set('email','');params.set('website','');params.set('consent','1');
  const invalid=new URLSearchParams(params);invalid.set('description','short');const bad=await request(path,{method:'POST',body:invalid});ok(bad.response.status===400,'short report rejected');
  const saved=await request(path,{method:'POST',body:params});ok(saved.response.status===303,'report submit redirects 303');noCache(saved,'report success');
  const receipt=saved.response.headers.get('location');assert.ok(receipt);const receiptUrl=new URL(receipt,origin);assert.equal(receiptUrl.origin,origin);
  const code=receiptUrl.searchParams.get('receipt')?.split('.')[0];ok(/^VNE-\d{8}-[A-F0-9]{10}$/.test(code??''),'valid report receipt code');
  fixture.receiptCode=code;writeFileSync('docs/acceptance/S15/http-report-fixture.json',JSON.stringify(fixture,null,2)+'\n');
  const confirmation=await request(receiptUrl.href);ok(confirmation.response.status===200&&confirmation.body.includes('Đã lưu báo cáo'),'report receipt confirms stored');ok(!confirmation.body.includes(fixture.marker),'receipt does not expose description');noCache(confirmation,'receipt');
  const duplicate=await request(path,{method:'POST',body:params});ok(duplicate.response.status===303,'duplicate report accepted idempotently');
  ok(new URL(duplicate.response.headers.get('location'),origin).searchParams.get('receipt')?.split('.')[0]===code,'duplicate has same receipt code');
  const privateList=await request('/?post_type=vne_report');ok(privateList.response.status===404&&!privateList.body.includes(fixture.marker),'private report list unavailable');
 }else{
  for(const [type,count] of [['vne_resource',6],['vne_guide',4],['vne_practice',1]]){
   const result=await request('/wp-json/vne-library/v1/items?post_type='+type);ok(result.response.status===200,'API 200 '+type);noCache(result,type);
   const items=JSON.parse(result.body);ok(items.length===count,'expected item count '+type);ok(items.every(i=>i.derived.validation_status==='not_tested'),'no imported PASS '+type);ok(items.every(i=>!('editorial_note' in i)),'no private fields '+type);
  }
  for(const entry of Object.values(imported.journal.map)){
   const result=await request(entry.url);ok(result.response.status===200,'content page 200 '+entry.id);noCache(result,'item '+entry.id);
   ok(!result.body.includes('__S15_ITEM_'),'links resolved '+entry.id);ok(!/Fatal error|Uncaught Error/.test(result.body),'no PHP fatal '+entry.id);
   ok(/noindex/i.test(result.body+' '+result.response.headers.get('x-robots-tag')),'noindex '+entry.id);
   ok(result.body.includes('Báo lỗi nội dung này'),'context report link '+entry.id);
  }
  const home=await request('/');ok(home.response.status===200,'populated home 200');noCache(home,'populated home');
  ok((home.body.match(/data-resource-id=/g)??[]).length===6,'six resource cards');
  ok(home.body.includes(imported.journal.map['7'].url),'start CTA points to imported lesson');
  ok(home.body.includes('Truy cập repo')&&home.body.includes('Xem chi tiết'),'both resource CTA labels');
  const lesson=await request(imported.journal.map['7'].url);ok(lesson.body.includes('MOC-WIN-1')&&lesson.body.includes('Windows'),'lesson environment and revision visible');
  ok(lesson.body.includes('aria-label="Mục lục bài thực hành"'),'lesson table of contents');
  const search=await request('/?vne_find=1&scope=resources&s=astro');ok(search.response.status===200&&search.body.includes('Astro Basics'),'search finds imported resource');noCache(search,'resource search');
 }
}catch(error){failure=String(error.stack??error);process.exitCode=1;}
finally{writeFileSync('docs/acceptance/S15/'+(cacheMode?'cache-'+cacheMode+'-http-results.json':formOnly?'http-report-results.json':'content-http-results.json'),JSON.stringify({status:failure?'FAIL':'PASS_STAGING_CONTENT_HTTP',observedAt:new Date().toISOString(),checks,requests,failure,limits:['TLS verified; anonymous HTTP only','No repository/tool execution or new resource validation claims','HTTP report test creates one disposable private report; server cleanup is separately verified']},null,2)+'\n');console.log((failure?'FAIL':'PASS')+' S15 content HTTP '+checks.length+' checks, '+requests.length+' requests');if(failure)console.error(failure);}
