import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
const origin='https://staging-store.vneconomics.com',path='/wp-json/vne-library/v1/items';
const configPath='tmp/tests/s15-http-fault-session.json',configBytes=readFileSync(configPath,'utf8');
const config=JSON.parse(configBytes);
assert.equal(config.origin,origin);assert.match(config.token,/^[a-f0-9]{32}$/);
assert.match(config.fixtureId,/^[a-f0-9-]{36}$/);assert.ok(config.expires>Date.now()/1000);
const checks=[],requests=[];let failure=null;
const check=(v,n)=>{assert.ok(v,n);checks.push(n);};
async function get(mode,timeout=15000,token=config.token){
 const start=performance.now();let response;
 try {response=await fetch(origin+path,{headers:mode?{'X-S15-Fault':mode+'.'+token}:{},signal:AbortSignal.timeout(timeout)});const body=await response.text();requests.push({mode:mode??'ordinary',status:response.status,ms:Math.round(performance.now()-start),body:body.slice(0,1000)});return {response,body};}
 catch(e){requests.push({mode,status:null,ms:Math.round(performance.now()-start),error:e.name});throw e;}
}
try {
 const ordinary=await get();check(ordinary.response.status===200,'ordinary API stays healthy with fixture installed');check(Array.isArray(JSON.parse(ordinary.body)),'ordinary API returns items');
 const bad=await get('error',15000,'0'.repeat(32));check(bad.response.status===200,'invalid probe token cannot trigger failure');
 const missing=await get('missing');check(missing.response.status===404,'request-scoped missing plugin removes its REST route');check(!/Fatal error|Uncaught/.test(missing.body),'missing plugin does not leak a fatal trace');
 const failed=await get('error');check(failed.response.status>=500&&failed.response.status<600,'injected plugin-load error gives HTTP failure');check(!failed.body.includes('S15 disposable plugin-load failure'),'injected exception detail not public');
 let timedOut=false;try{await get('slow',750);}catch(e){timedOut=e.name==='TimeoutError'||e.name==='AbortError';}check(timedOut,'client deadline expires before slow request acknowledgement');
 // Server completion is checked separately through the private shutdown log before fixture cleanup.
 await new Promise(r=>setTimeout(r,2500));
 const recovered=await get();check(recovered.response.status===200,'ordinary API healthy after failed and timed-out probes');check(/no-store/.test(recovered.response.headers.get('cache-control')??''),'recovered API no-store');check(recovered.response.headers.get('vne-cache-policy')==='bypass','recovered API bypass');
 check(!recovered.body.includes('s15-http-fault'),'fixture state absent from public items');
}catch(e){failure=String(e.stack??e);process.exitCode=1;}
finally{assert.equal(readFileSync(configPath,'utf8'),configBytes,'Refuse deleting another session config');unlinkSync(configPath);writeFileSync('docs/acceptance/S15/http-fault-results.json',JSON.stringify({status:failure?'FAIL':'PASS_SCOPED_STAGING_HTTP_FAULTS',observedAt:new Date().toISOString(),checks,requests,failure,themeAttempted:false,localSessionConfigRemoved:true,limits:['Temporary MU fixture targets only the exact API path and a random probe header','Exception is injected in plugins_loaded; candidate plugin files were not corrupted','Client timeout does not cancel or certify completion of the server request','Server shutdown log and cleanup verified separately; no production or theme update']},null,2)+'\n');console.log((failure?'FAIL':'PASS')+' S15 scoped HTTP faults '+checks.length+' checks / '+requests.length+' requests');if(failure)console.error(failure);}
