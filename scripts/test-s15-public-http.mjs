import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';

// Fixed staging target, anonymous requests only. Never use credentials or disable TLS.
const origin='https://staging-store.vneconomics.com';
const draftOnly=process.argv.includes('--draft-only');
const themeOnly=process.argv.includes('--theme-only');
const phase=process.argv.find(arg=>arg.startsWith('--fixture-phase='))?.split('=')[1];
if(phase&&!['before','after','report','cleanup'].includes(phase))throw new Error('Invalid fixture phase');
const checks=[],requests=[];
const ok=(condition,label)=>{assert.ok(condition,label);checks.push(label);};
async function request(path,options={}){
 const url=new URL(path,origin);
 assert.equal(url.hostname,'staging-store.vneconomics.com');
 const start=performance.now();
 const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000),...options});
 const body=await response.text();
 const headers=Object.fromEntries([...response.headers].filter(([key])=>!['set-cookie'].includes(key)));
 requests.push({path,method:options.method??'GET',status:response.status,ms:Math.round(performance.now()-start),headers,body:body.slice(0,1600)});
 return {response,body,headers};
}
function bypass(result,label){
 ok(/no-store/.test(result.headers['cache-control']??''),label+' no-store');
 ok(result.headers['vne-cache-policy']==='bypass',label+' bypass policy');
 ok(!result.headers.etag&&!result.headers['last-modified'],label+' no conditional validators');
 ok(result.response.status!==304,label+' full response');
}
let failure=null;
try{
 if(themeOnly){
  for(const path of ['/','/tai-nguyen/','/huong-dan/','/?vne_find=1&scope=resources&s=khong-co-s15','/?vne_support=ho-tro','/?vne_support=tieu-chi','/?vne_support=quyen-rieng-tu']){
   const result=await request(path);ok(result.response.status===200,'theme route 200 '+path);bypass(result,'theme '+path);
   ok(/noindex/i.test(result.body+' '+(result.headers['x-robots-tag']??'')),'theme noindex '+path);
   ok(!/Fatal error|Uncaught Error|Warning:.* on line/.test(result.body),'no PHP error '+path);
   if(path==='/'){
    ok(/VibeLab Việt/.test(result.body)&&/Chọn đúng công cụ/.test(result.body),'VibeLab home rendered');
    ok(/Hướng dẫn thực hành/.test(result.body)&&!/>Shop<|>Checkout<|>My account</.test(result.body),'VibeLab navigation without cloned commerce menu');
   }
  }
  const feed=await request('/?feed=rss2');ok(feed.response.status===404,'native feed disabled');bypass(feed,'feed');
 }else if(phase){
  const f=JSON.parse(readFileSync('docs/acceptance/S15/public-fixture.json','utf8'));
  assert.ok(Number.isSafeInteger(f.id)&&f.marker.startsWith('S15 PUBLIC DISPOSABLE '));
  if(phase==='report'){
   assert.ok(Number.isSafeInteger(f.report));
   for(const path of ['/?p='+f.report,'/?post_type=vne_report','/wp-json/wp/v2/vne_report/'+f.report,'/wp-json/vne-library/v1/items/'+f.report]){
    const result=await request(path);
    ok(result.response.status===404,'private report blocked '+path);
    ok(!result.body.includes('S15 disposable report only'),'report description absent '+path);
   }
   const admin=await request('/wp-admin/admin.php?page=vne-reports');
   ok([302,303,403].includes(admin.response.status),'anonymous report admin denied');
  }else{
  const item=await request('/wp-json/vne-library/v1/items/'+f.id);bypass(item,'fixture item');
  const list=await request('/wp-json/vne-library/v1/items?post_type=vne_guide');bypass(list,'guide list');
  if(phase==='cleanup'){
   ok(item.response.status===404,'removed fixture 404');
   ok(list.response.status===200&&!list.body.includes(f.marker),'fixture absent from public guide list');
  }else{
   const title=f.marker+(phase==='after'?' PROPOSED':'');
   ok(item.response.status===200&&JSON.parse(item.body).title===title,'public approved title '+phase);
   ok(!('editorial_note' in JSON.parse(item.body)),'no private editorial note');
   ok(list.response.status===200&&JSON.parse(list.body).some(x=>x.id===f.id&&x.title===title),'list matches approved item '+phase);
   const preview=await request('/wp-admin/admin.php?page=vne-library-preview&proposal='+f.proposal);
   ok([302,303,403].includes(preview.response.status),'anonymous private preview denied');
   ok(!preview.body.includes(f.marker+' PROPOSED'),'anonymous preview does not leak proposal');
   const proposal=await request('/wp-json/vne-library/v1/proposals/'+f.proposal);
   ok([401,403].includes(proposal.response.status),'anonymous proposal API denied');bypass(proposal,'private proposal');
  }
  }
 }else if(draftOnly){
  const fixture=JSON.parse(readFileSync('docs/acceptance/S15/ui-draft-results.json','utf8'));
  assert.equal(fixture.cleanup,false);assert.ok(Number.isSafeInteger(fixture.id)&&fixture.id>0);
  assert.ok(fixture.marker.startsWith('S15 UI disposable draft '));
  const privateItem=await request('/wp-json/vne-library/v1/items/'+fixture.id);
  ok(privateItem.response.status===404,'anonymous real draft hidden');bypass(privateItem,'real draft');
  ok(!privateItem.body.includes(fixture.marker),'draft title absent from anonymous response');
  const listing=await request('/wp-json/vne-library/v1/items');
  ok(listing.response.status===200&&!listing.body.includes(fixture.marker),'draft absent from public list');bypass(listing,'list with draft');
  const native=await request('/?p='+fixture.id);
  ok(native.response.status===404&&!native.body.includes(fixture.marker),'native anonymous draft URL hidden');
 }else{
 const home=await request('/');ok(home.response.status===200,'HTTPS home 200');
 ok(/name=['"]robots['"][^>]+content=['"][^'"]*noindex/i.test(home.body),'home noindex');
 ok(/astra/i.test(home.body),'Astra intermediate theme visible');
 const redirect=await fetch('http://staging-store.vneconomics.com/',{redirect:'manual',signal:AbortSignal.timeout(20000)});
 requests.push({path:'http://staging-store.vneconomics.com/',method:'GET',status:redirect.status,headers:Object.fromEntries(redirect.headers)});
 await redirect.body?.cancel();
 ok([301,302,307,308].includes(redirect.status),'HTTP redirects');
 ok(redirect.headers.get('location')===origin+'/','HTTP redirects to exact HTTPS staging');
 const robots=await request('/robots.txt');ok(robots.response.status===200&&/Disallow:\s*\//i.test(robots.body),'robots blocks indexing');
 const route='/wp-json/vne-library/v1/items';
 const first=await request(route);ok(first.response.status===200,'public items 200');
 ok(Array.isArray(JSON.parse(first.body)),'public items array');bypass(first,'public items');
 const warm=await request(route,{headers:{'If-None-Match':'"s15-probe"','If-Modified-Since':'Wed, 01 Jan 2031 00:00:00 GMT'}});
 ok(warm.response.status===200,'warm conditional items 200');bypass(warm,'warm items');
 const edit=await request(route+'?context=edit');ok(edit.response.status===403,'anonymous edit context denied');bypass(edit,'edit denial');
 const invalid=await request(route+'?post_type=post');ok(invalid.response.status===400,'invalid library type rejected');bypass(invalid,'invalid type');
 const missing=await request(route+'/2147483647');ok(missing.response.status===404,'missing item 404');bypass(missing,'missing item');
 // Empty payloads cannot create valid content even if permission handling regresses.
 for(const suffix of ['/items','/terms','/items/2147483647/proposals','/items/2147483647/state']){
  const denied=await request('/wp-json/vne-library/v1'+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  ok([401,403].includes(denied.response.status),'anonymous POST denied '+suffix);bypass(denied,'POST '+suffix);
 }
 const privateRoute=await request('/wp-json/vne-library/v1/items/2147483647/proposals');
 ok([401,403].includes(privateRoute.response.status),'anonymous proposal list denied');bypass(privateRoute,'proposal list');
 }
}catch(error){failure=String(error.stack??error);process.exitCode=1;}
finally{
 mkdirSync('docs/acceptance/S15',{recursive:true});
 writeFileSync('docs/acceptance/S15/'+(themeOnly?'theme-http-results.json':phase?'public-fixture-'+phase+'.json':draftOnly?'public-draft-http-results.json':'public-http-results.json'),JSON.stringify({status:failure?'FAIL':'PASS_PUBLIC_HTTP_ONLY',observedAt:new Date().toISOString(),target:origin,checks,requests,failure,limits:['Anonymous HTTP only; no authenticated revision/report/race or proxy purge certification','No fixture created by HTTP runner; empty anonymous POST probes must be denied; TLS verification enabled']},null,2)+'\n');
 console.log((failure?'FAIL':'PASS')+' S15 public HTTP: '+checks.length+' checks, '+requests.length+' requests.');
 if(failure)console.error(failure);
}
