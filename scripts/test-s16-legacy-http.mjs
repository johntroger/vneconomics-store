import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const baseline=JSON.parse(readFileSync('docs/acceptance/S16/postflight-results.json','utf8'));
const staging=process.argv.includes('--staging'),origin=staging?'https://staging-store.vneconomics.com':'https://store.vneconomics.com',requests=[],failures=[];
for(const item of baseline.legacyPublic){
 try{
  const original=new URL(item.url);assert.equal(original.origin,'https://store.vneconomics.com');const url=new URL(original.pathname+original.search,origin);
  const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(25000)});const body=await r.text();
  const unsupported=body.includes('Nội dung chưa có trong thư viện');
  const location=r.headers.get('location');const validRedirect=[301,302,303,307,308].includes(r.status)&&location&&new URL(location,url).origin===origin;
  requests.push({id:item.id,path:url.pathname,status:r.status,location:location?new URL(location,url).pathname:null,unsupportedLibraryFallback:unsupported});
  if((r.status!==200&&!validRedirect)||unsupported||/Fatal error:|Uncaught Error/.test(body))failures.push(item.id);
 }catch(e){requests.push({id:item.id,error:e.name});failures.push(item.id);}
}
const result={status:failures.length?'FAIL_LEGACY_PUBLIC_RENDER':'PASS_LEGACY_PUBLIC_RENDER',observedAt:new Date().toISOString(),requests,failures,limits:['Anonymous GET only','No cart mutations, checkout submission, payment or email','Detects unsupported-library fallback/status errors; not full legacy visual equivalence']};
writeFileSync('docs/acceptance/S16/'+(staging?'legacy-fix-staging-legacy':'legacy')+'-http-results.json',JSON.stringify({...result,origin},null,2)+'\n');console.log(result.status+' '+requests.length+' requests, '+failures.length+' failed');if(failures.length)process.exitCode=1;
