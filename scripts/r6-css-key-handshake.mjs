// Candidate possession protocol only. No filesystem, activation or server provisioning.
import assert from 'node:assert/strict';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {productionBindingPlan} from './r6-css-operator.mjs';
import {inspectProductionKeyRecord} from './r6-css-production-proof.mjs';

export const keyHandshakeProtocol='r6-css-key-candidate-possession-v1';
const fields=['protocol','target','operationId','kind','expectedActiveFingerprint','candidateFingerprint','challenge','issuedAt','expiresAt'];
const need=(ok,message)=>assert.ok(ok,message);
function closed(value,names,label){
 need(value&&Object.getPrototypeOf(value)===Object.prototype,'Invalid '+label);
 need(JSON.stringify(Object.keys(value).sort())===JSON.stringify([...names].sort()),label+' fields differ');
}
function hex(value,length){return typeof value==='string'&&value.length===length&&/^[a-f0-9]+$/.test(value);}
export function validateKeyHandshakeRequest(request,now=Math.floor(Date.now()/1000)){
 closed(request,fields,'Candidate handshake request');
 need(request.protocol===keyHandshakeProtocol&&request.target===productionBindingPlan().home,'Candidate handshake scope differs');
 need(hex(request.operationId,32)&&hex(request.challenge,64)&&hex(request.candidateFingerprint,64),'Invalid candidate handshake identity');
 need(request.kind==='initial'||request.kind==='rotation','Invalid candidate handshake kind');
 need(request.kind==='initial'?request.expectedActiveFingerprint===null:hex(request.expectedActiveFingerprint,64)&&request.expectedActiveFingerprint!==request.candidateFingerprint,'Candidate active fingerprint differs');
 need(Number.isSafeInteger(now)&&Number.isSafeInteger(request.issuedAt)&&Number.isSafeInteger(request.expiresAt)&&request.issuedAt>=0&&request.issuedAt<=now&&request.expiresAt>now&&request.expiresAt>request.issuedAt&&request.expiresAt-request.issuedAt<=60,'Candidate handshake stale/future or invalid lifetime');
 return Object.fromEntries(fields.map(name=>[name,request[name]]));
}
export function verifyKeyCandidatePossession(request,proof,record,now=Math.floor(Date.now()/1000)){
 const identity=validateKeyHandshakeRequest(request,now);closed(proof,['body','signature'],'Candidate proof');
 need(typeof proof.body==='string'&&proof.body.length>0&&proof.body.length<=4096&&hex(proof.signature,64),'Invalid candidate proof transport');
 const bytes=Buffer.from(proof.body,'base64');need(bytes.length<=3072&&bytes.toString('base64')===proof.body,'Non-canonical candidate proof transport');
 inspectProductionKeyRecord(record,identity.candidateFingerprint);
 const key=Buffer.from(record.key,'hex');
 try{
  need(timingSafeEqual(createHmac('sha256',key).update(bytes).digest(),Buffer.from(proof.signature,'hex')),'Candidate proof signature differs');
  let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new Error('Candidate proof JSON invalid');}
  closed(body,[...fields,'observedAt','status'],'Candidate proof body');
  for(const name of fields)need(body[name]===identity[name],'Candidate proof identity differs');
  need(body.status==='CANDIDATE_KEY_POSSESSION'&&Number.isSafeInteger(body.observedAt)&&body.observedAt>=identity.issuedAt&&body.observedAt<=now,'Candidate proof observation differs');
  const canonical={...identity,observedAt:body.observedAt,status:body.status};need(JSON.stringify(canonical)===bytes.toString('utf8'),'Candidate proof JSON is not canonical');
  return {status:'CANDIDATE_KEY_POSSESSION_VERIFIED',operationId:identity.operationId,candidateFingerprint:identity.candidateFingerprint,challenge:identity.challenge,observedAt:body.observedAt,serverOriginVerified:false,serverStorageVerified:false,serverProvisioned:false,writerReservationVerified:false,activationAuthorized:false};
 }finally{key.fill(0);}
}
