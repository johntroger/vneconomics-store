// Data-only production proof transport. No CLI, key provisioning or server writer.
import assert from 'node:assert/strict';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {sha256} from './release-lib.mjs';
import {r6CssProfile} from './release-r6-css.mjs';
import {productionBindingPlan} from './r6-css-operator.mjs';

export const productionProofProtocol='r6-css-production-proof-v1';
const requestFields=['environment','protocol','sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256','baselineSha256','owner','keyFingerprintSha256'].sort();
const identity=['protocol','owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','receiverSha256','baselineSha256','keyFingerprintSha256'];
function hex(value,length,label){assert.ok(typeof value==='string'&&value.length===length&&/^[a-f0-9]+$/.test(value),'Invalid '+label);}
function plain(value,label){assert.ok(value&&Object.getPrototypeOf(value)===Object.prototype,'Plain '+label+' required');}
export function validateProductionProofRequest(a,j){
 plain(a,'proof request');plain(j,'journal');assert.deepEqual(Object.keys(a).sort(),requestFields,'Proof request fields differ');
 assert.equal(a.environment,'production');assert.equal(a.protocol,productionProofProtocol);assert.equal(a.expectedParent,r6CssProfile.payload);
 for(const name of ['sourceSha','controllerSourceSha','payloadSha','expectedParent'])hex(a[name],40,name);
 for(const name of ['manifestSha256','receiverSha256','baselineSha256','keyFingerprintSha256'])hex(a[name],64,name);hex(a.owner,32,'owner');
 for(const field of requestFields)assert.equal(j[field],a[field],'Journal identity differs: '+field);
 assert.ok(['AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'].includes(j.phase),'Journal not awaiting health');hex(j.challenge,64,'challenge');
 const now=Math.floor(Date.now()/1000);assert.ok(Number.isSafeInteger(j.issuedAt)&&Number.isSafeInteger(j.expiresAt)&&j.issuedAt<=now&&j.expiresAt>=now&&j.expiresAt>j.issuedAt&&j.expiresAt-j.issuedAt<=120,'Production challenge expired/invalid');return now;
}
function keyBytes(record,fingerprint){
 plain(record,'private key record');assert.ok(JSON.stringify(Object.keys(record).sort())===JSON.stringify(['format','key','purpose','target']),'Private key envelope fields differ');
 assert.ok(record.format===1&&record.purpose==='r6-css-health-proof'&&record.target===productionBindingPlan().home,'Private key target/purpose differs');
 hex(record.key,64,'private key bytes');hex(fingerprint,64,'key fingerprint');const bytes=Buffer.from(record.key,'hex');
 if(!timingSafeEqual(Buffer.from(sha256(bytes),'hex'),Buffer.from(fingerprint,'hex'))){bytes.fill(0);throw new Error('Private key fingerprint differs');}return bytes;
}
export function inspectProductionKeyRecord(record,fingerprint){
 const bytes=keyBytes(record,fingerprint);try{return {keyFingerprintSha256:sha256(bytes),keyReturned:false};}finally{bytes.fill(0);}
}
async function bounded(response,limit){
 const reader=response.body?.getReader();assert.ok(reader,'Missing HTTP body');let length=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;assert.ok(length<=limit,'Production probe body exceeds limit');chunks.push(Buffer.from(value));}}
 catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}return Buffer.concat(chunks);
}
export async function collectProductionHealthProof(a,j,privateKeyRecord){
 validateProductionProofRequest(a,j);a=Object.freeze({...a});j=Object.freeze({...j});const key=keyBytes(privateKeyRecord,a.keyFingerprintSha256);
 try{
  const url=productionBindingPlan().home+'/',cssUrl=url+'wp-content/themes/vibelab-v2/style.css';
  const get=async(target,limit)=>{const r=await fetch(target,{redirect:'manual',cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(30000)});if(r.status>=300&&r.status<400){await r.body?.cancel();throw new Error('Production probe redirect refused');}if(r.url!==target){await r.body?.cancel();throw new Error('Production probe target differs');}assert.ok(Number.isInteger(r.status)&&r.status>=100&&r.status<=599,'Invalid production HTTP status');return {status:r.status,body:await bounded(r,limit)};};
  const page=await get(url,1048576),css=await get(cssUrl,262144);const observedAt=validateProductionProofRequest(a,j);
  const observation={...Object.fromEntries(identity.map(field=>[field,a[field]])),phase:j.phase,challenge:j.challenge,observedAt,url,httpStatus:page.status,cssStatus:css.status,marker:page.body.toString('utf8').match(/name="vibelab-release" content="([^"]+)"/)?.[1]??null,cssSha256:sha256(css.body)};
  assert.ok(observation.marker===null||observation.marker.length<=128,'Production marker exceeds limit');
  const body=Buffer.from(JSON.stringify(observation));assert.ok(body.length<=8192,'Production observation too large');
  return {observation,proof:{body:body.toString('base64'),signature:createHmac('sha256',key).update(body).digest('hex')}};
 }finally{key.fill(0);}
}
export function encodeProductionProofTransport(a,j,proof,privateKeyRecord){
 const now=validateProductionProofRequest(a,j);plain(proof,'proof');assert.deepEqual(Object.keys(proof).sort(),['body','signature'],'Proof envelope fields differ');
 assert.ok(typeof proof.body==='string'&&proof.body.length>0&&proof.body.length<=10924,'Invalid proof size');hex(proof.signature,64,'proof signature');
 const body=Buffer.from(proof.body,'base64');assert.ok(body.length<=8192&&body.toString('base64')===proof.body,'Non-canonical proof body');const key=keyBytes(privateKeyRecord,a.keyFingerprintSha256);
 try{
  assert.ok(timingSafeEqual(createHmac('sha256',key).update(body).digest(),Buffer.from(proof.signature,'hex')),'Production proof signature differs');
  const observation=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(body));plain(observation,'observation');
  assert.deepEqual(Object.keys(observation).sort(),[...identity,'phase','challenge','observedAt','url','httpStatus','cssStatus','marker','cssSha256'].sort(),'Observation fields differ');
  for(const name of identity)assert.equal(observation[name],a[name],'Production proof identity differs: '+name);
  assert.ok(observation.phase===j.phase&&observation.challenge===j.challenge,'Production proof challenge/phase differs');
  assert.ok(Number.isSafeInteger(observation.observedAt)&&observation.observedAt>=j.issuedAt&&observation.observedAt<=now,'Production proof stale/future');
  assert.equal(observation.url,productionBindingPlan().home+'/');
  for(const name of ['httpStatus','cssStatus'])assert.ok(Number.isInteger(observation[name])&&observation[name]>=100&&observation[name]<=599,'Invalid HTTP status');
  hex(observation.cssSha256,64,'CSS hash');assert.ok(observation.marker===null||(typeof observation.marker==='string'&&observation.marker.length<=128),'Invalid release marker');
  return JSON.stringify({body:proof.body,signature:proof.signature});
 }finally{key.fill(0);}
}
