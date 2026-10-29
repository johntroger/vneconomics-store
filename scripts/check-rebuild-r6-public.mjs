import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const dir='docs/acceptance/R6-rebuild',base='https://store.vneconomics.com';
const snapshot=JSON.parse(readFileSync('docs/acceptance/R52-rebuild/production-url-snapshot.json'));
const visits=[],checks=[];const remaining=process.argv.includes('--remaining');
async function get(path,{status=200,canonical,marker=false,noindex=false}={}){
 const url=new URL(path,base);assert.equal(url.origin,base);const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)}),body=await r.text();
 const entry={path:url.pathname+url.search,status:r.status,expectedStatus:status};visits.push(entry);assert.equal(r.status,status,entry.path);
 assert.doesNotMatch(body,/Fatal error:|Warning: Undefined array|R52-SECRET-REPORT-SENTINEL|PRIVATE-EDITORIAL-S06/);
 if(marker)assert.ok(body.includes('r52-v2-20261028'),'Release marker '+path);
 if(canonical)assert.equal(body.match(/<link rel="canonical" href="([^"]+)"/)?.[1],canonical,'Canonical '+path);
 if(noindex)assert.ok(/<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(body),'Noindex '+path);
 return body;
}
try{
 if(remaining){
  const prior=JSON.parse(readFileSync(dir+'/http-postflight-failure.json'));
  assert.equal(prior.status,'FAIL_R6_PUBLIC_POSTFLIGHT');assert.equal(prior.visits.length,144);assert.equal(prior.visits.at(-1).path,'/?s=Codex');assert.ok(prior.error.includes('noindex'));
  const expected=[...snapshot.urls.map(u=>({path:new URL(u).pathname,status:200})),...['/','/tai-nguyen/','/huong-dan/','/tro-giup/'].map(path=>({path,status:200})),...JSON.parse(readFileSync('docs/acceptance/R52-rebuild/url-probes.json')).probes.map(p=>({path:p.path,status:p.expectedStatus}))];
  assert.equal(expected.length,143);for(let i=0;i<expected.length;i++){assert.equal(prior.visits[i].path,expected[i].path);assert.equal(prior.visits[i].status,expected[i].status);}visits.push(...prior.visits.slice(0,143));
  console.log('Reusing 143 checks completed before robots quote-parser failure; rechecking remaining endpoints');
 }else{
 for(const url of snapshot.urls){await get(url,{canonical:url,marker:true});if(visits.length%25===0)console.log('R6 verified '+visits.length+' production URL paths');}
 }
 checks.push('126 existing public URL paths 200, self canonical and exact v2 marker');
 if(!remaining){for(const path of ['/','/tai-nguyen/','/huong-dan/','/tro-giup/'])await get(path,{marker:true});
 for(const probe of JSON.parse(readFileSync('docs/acceptance/R52-rebuild/url-probes.json')).probes)await get(probe.path,{status:probe.expectedStatus});}
 checks.push('main navigation routes and all 13 support/legacy probes');
 const search=await get('/?s=Codex',{marker:true,noindex:true});assert.ok(!search.includes('<link rel="canonical"'));
 await get('/wp-json/vne-library/v1/items?context=edit',{status:403});
 await get('/wp-json/wp/v2/vne_report',{status:404});
 const reportQuery=await fetch(base+'/?post_type=vne_report',{redirect:'manual',signal:AbortSignal.timeout(20000)});assert.ok([200,404].includes(reportQuery.status));const privateBody=await reportQuery.text();assert.doesNotMatch(privateBody,/R52-SECRET-REPORT-SENTINEL|PRIVATE-EDITORIAL-S06/);visits.push({path:'/?post_type=vne_report',status:reportQuery.status});
 checks.push('search noindex/no canonical; anonymous edit API forbidden; report REST unavailable');
 const index=await get('/wp-sitemap.xml');assert.ok(!/posts-post-|posts-page-|users-/.test(index));const paths=[];
 const children=[...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(children.length,4);
 for(const url of children){const body=await get(url.replaceAll('&amp;','&'));for(const m of body.matchAll(/<loc>([^<]+)<\/loc>/g))paths.push(m[1].replaceAll('&amp;','&'));}
 assert.deepEqual(paths.sort(),[...snapshot.urls].sort());checks.push('four sitemap children match all 126 production baseline URLs exactly');
 writeFileSync(dir+'/http-postflight.json',JSON.stringify({status:'PASS_R6_PUBLIC_POSTFLIGHT',sourceSha:'50437bd16eae1912d8cffea093401449786faaea',payloadSha:'fa4c67821008e0fcc4307fedf202bcdf95b85bb6',checks,visits,resumedAfterParserFix:remaining,reusedChecks:remaining?143:0,priorEvidence:remaining?'http-postflight-failure.json':null,limits:['Read-only GET; no report submitted or paid API called','Private endpoints checked without creating production canaries; local private-content canaries passed R5.2']},null,2)+'\n');console.log('PASS R6 public postflight: '+visits.length+' GET checks');
}catch(error){writeFileSync(dir+(remaining?'/http-postflight-remaining-failure.json':'/http-postflight-failure.json'),JSON.stringify({status:'FAIL_R6_PUBLIC_POSTFLIGHT',error:error.message,visits},null,2)+'\n');throw error;}
