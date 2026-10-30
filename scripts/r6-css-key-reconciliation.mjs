// Pure decision policy. No executor, filesystem/network access or authentication provider.
import assert from 'node:assert/strict';
import {validateKeyHandshakeRequest} from './r6-css-key-handshake.mjs';
import {sha256} from './release-lib.mjs';

const need=(ok,message)=>assert.ok(ok,message);
function closed(value,fields,label){need(value&&Object.getPrototypeOf(value)===Object.prototype,'Invalid '+label);need(JSON.stringify(Object.keys(value).sort())===JSON.stringify([...fields].sort()),label+' fields differ');}
function observe(value,side,request,now){
 closed(value,['side','request','phase','activeFingerprint','candidatePresent','previousFingerprint','lockOwned','observedAt'],'Key side observation');
 need(value.side===side,'Key observation side differs');
 const identity=validateKeyHandshakeRequest(value.request,value.request?.issuedAt);need(JSON.stringify(identity)===JSON.stringify(request),'Key observation identity differs');
 need(['STAGED','PREPARED','ACTIVATED','ROLLBACK_PREPARED','ROLLED_BACK'].includes(value.phase),'Unknown key observation phase');
 need(typeof value.candidatePresent==='boolean'&&typeof value.lockOwned==='boolean','Invalid key observation flags');
 need(Number.isSafeInteger(value.observedAt)&&value.observedAt>=request.issuedAt&&value.observedAt<=now&&now-value.observedAt<=30,'Key observation stale/future');
 const old=request.expectedActiveFingerprint,next=request.candidateFingerprint;
 const baseline=value.activeFingerprint===old&&value.candidatePresent&&value.previousFingerprint===null;
 const between=request.kind==='rotation'&&value.activeFingerprint===null&&value.candidatePresent&&value.previousFingerprint===old;
 const switched=value.activeFingerprint===next&&!value.candidatePresent&&value.previousFingerprint===(request.kind==='rotation'?old:null);
 need(baseline||between||switched,'Key observation fingerprint/file arrangement differs');
 need(value.phase!=='STAGED'||baseline,'Staged key is not at baseline');need(value.phase!=='ROLLED_BACK'||baseline,'Rolled-back key is not at baseline');need(value.phase!=='ACTIVATED'||switched,'Activated key is not current');
 return {...Object.fromEntries(['side','phase','activeFingerprint','candidatePresent','previousFingerprint','lockOwned','observedAt'].map(field=>[field,value[field]])),shape:baseline?'baseline':between?'between':'switched'};
}
export function planKeyReconciliation(input,now=Math.floor(Date.now()/1000)){
 closed(input,['request','intent','local','server'],'Key reconciliation input');need(Number.isSafeInteger(now)&&now>=0,'Invalid reconciliation clock');
 const request=validateKeyHandshakeRequest(input.request,input.request?.issuedAt);need(request.issuedAt<=now,'Key request is from the future');need(['commit','rollback'].includes(input.intent),'Unknown key reconciliation intent');
 const local=observe(input.local,'local',request,now),server=observe(input.server,'server',request,now);
 const basisSha256=sha256(Buffer.from(JSON.stringify({request,intent:input.intent,local,server,evaluatedAt:now})));
 const result=(status,nextAction='INSPECT',side=null)=>Object.freeze({status,nextAction,side,operationId:request.operationId,basisSha256,evaluatedAt:now,executionAuthorized:false,observationsAuthenticated:false,twoSideCommitImplemented:false});
 const release=(status)=>local.lockOwned?result(status,'RELEASE_RESERVATION','local'):server.lockOwned?result(status,'RELEASE_RESERVATION','server'):result(status,'NONE');
 if(input.intent==='commit'){
  if(local.phase==='ACTIVATED'&&server.phase==='ACTIVATED')return release('BOTH_ACTIVATED_OBSERVED');
  if([local,server].some(s=>['ROLLBACK_PREPARED','ROLLED_BACK'].includes(s.phase)))return result('STOP_ROLLBACK_STARTED');
  if(!local.lockOwned||!server.lockOwned)return result('STOP_RESERVATION_MISSING');
  if(now>=request.expiresAt)return result('STOP_COMMIT_EXPIRED');
  if(server.phase!=='ACTIVATED'){
   if(local.shape!=='baseline'||local.phase==='ACTIVATED')return result('STOP_LOCAL_AHEAD');
   return result('SERVER_ACTIVATION_REQUIRED',server.shape==='switched'?'FINALIZE_ACTIVATION':server.shape==='between'?'RESUME_ACTIVATION':'ACTIVATE','server');
  }
  return result('LOCAL_ACTIVATION_REQUIRED',local.shape==='switched'?'FINALIZE_ACTIVATION':local.shape==='between'?'RESUME_ACTIVATION':'ACTIVATE','local');
 }
 // Roll local back first. A merely staged candidate needs only reservation release.
 const finished=s=>s.phase==='ROLLED_BACK'||(s.phase==='STAGED'&&!s.lockOwned);
 for(const side of ['local','server']){
  const state=side==='local'?local:server;if(finished(state))continue;
  if(!state.lockOwned)return result('STOP_RECOVERY_RESERVATION_MISSING');
  if(state.phase==='STAGED')return result('ABORT_STAGED_REQUIRED','RELEASE_RESERVATION',side);
  return result('KEY_ROLLBACK_REQUIRED','ROLLBACK',side);
 }
 return release('BOTH_BASELINES_OBSERVED');
}
