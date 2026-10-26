import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
const configPath='tmp/tests/s15-live-http-session.json';
const bytes=readFileSync(configPath,'utf8'),config=JSON.parse(bytes);
const origin='https://staging-store.vneconomics.com';
assert.equal(config.origin,origin);assert.match(config.id,/^[a-f0-9]{32}$/);assert.match(config.token,/^[a-f0-9]{32}$/);
const restored=process.argv.includes('--restored'),checks=[],requests=[];let failure=null;
const check=(v,n)=>{assert.ok(v,n);checks.push(n);};
async function visit(phase,token){
 const response=await fetch(origin+'/',{redirect:'manual',headers:token?{'X-S15-Theme-Fault':token}:{},signal:AbortSignal.timeout(25000)});
 const body=await response.text();requests.push({phase,status:response.status,cacheControl:response.headers.get('cache-control'),cachePolicy:response.headers.get('vne-cache-policy')});
 return {response,body};
}
try{
 const ordinary=await visit('ordinary');check(ordinary.response.status===200,'ordinary homepage healthy');check(/no-store/.test(ordinary.response.headers.get('cache-control')??''),'ordinary no-store');check(ordinary.response.headers.get('vne-cache-policy')==='bypass','ordinary bypass');
 const wrong=await visit('wrong-token','0'.repeat(32));check(wrong.response.status===200,'wrong token stays healthy');
 const signed=await visit(restored?'old-token-after-restore':'scoped-active-theme-fault',config.token);
 check(signed.response.status===(restored?200:500),restored?'old token no longer triggers fault':'active theme scoped request fails with HTTP500');
 check(!signed.body.includes('S15 scoped active-theme failure')&&!/Uncaught|Stack trace:/.test(signed.body),'exception details not exposed');
 const after=await visit('ordinary-after-probe');check(after.response.status===200,'ordinary homepage healthy after probe');
}catch(e){failure=String(e.stack??e);process.exitCode=1;}
finally{
 assert.equal(readFileSync(configPath,'utf8'),bytes,'Refuse another session config');unlinkSync(configPath);
 writeFileSync('docs/acceptance/S15/live-theme-http-'+(restored?'restored':'fault')+'.json',JSON.stringify({status:failure?'FAIL':'PASS',observedAt:new Date().toISOString(),id:config.id,checks,requests,failure,localSessionConfigRemoved:true,limits:['Active theme fault is conditional on an exact GET homepage request and random expiring header','No global theme outage or automatic deployment watchdog certified']},null,2)+'\n');
 console.log((failure?'FAIL':'PASS')+' S15 live theme HTTP '+checks.length+' checks / '+requests.length+' requests');if(failure)console.error(failure);
}
