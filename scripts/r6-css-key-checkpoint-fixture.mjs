// Public-metadata checkpoint for an owned RAM fixture. No key or hosting persistence.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,openSync,closeSync,lstatSync,realpathSync,existsSync,renameSync,unlinkSync} from 'node:fs';
import {resolve,relative,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {twoSideKeyFixtureIdentity,twoSideFixtureStateSha256} from './r6-css-key-two-side-fixture.mjs';
import {sha256} from './release-lib.mjs';

const workspace=resolve(fileURLToPath(new URL('../',import.meta.url))),need=(ok,message)=>assert.ok(ok,message),hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
function closed(value,fields,label){need(value&&Object.getPrototypeOf(value)===Object.prototype&&JSON.stringify(Object.keys(value).sort())===JSON.stringify([...fields].sort()),label+' fields differ');}
function canonical(path){for(let p=resolve(path);;p=dirname(p)){need(!lstatSync(p).isSymbolicLink(),'Checkpoint symlink/junction refused');if(p===dirname(p))break;}need(realpathSync(path)===resolve(path),'Checkpoint canonical path differs');return lstatSync(path);}
function physical(snapshot){return Object.fromEntries(['local','server'].map(side=>[side,Object.fromEntries(['phase','activeFingerprint','candidatePresent','previousFingerprint','lockOwned'].map(field=>[field,snapshot[side][field]]))]));}
const digest=state=>sha256(Buffer.from(JSON.stringify(state)));
export function createKeyCheckpointFixture(options,...extra){
 need(extra.length===0,'Checkpoint overrides refused');closed(options,['root','token','fixture','intent'],'Checkpoint options');need(['commit','rollback'].includes(options.intent),'Checkpoint intent differs');
 const identity=twoSideKeyFixtureIdentity(options.fixture),root=resolve(options.root),rel=relative(join(workspace,'tmp/tests'),root);
 need(/^r739-coordinator-[a-zA-Z0-9]+$/.test(rel),'Owned checkpoint fixture path required');need(hex(options.token),'Checkpoint fixture token invalid');
 const guard=()=>{need(canonical(root).isDirectory(),'Checkpoint fixture directory required');const sentinel=join(root,'.key-coordinator-owned'),s=canonical(sentinel);need(s.isFile()&&s.nlink===1&&s.size===64&&readFileSync(sentinel,'utf8')===options.token,'Checkpoint fixture ownership differs');};
 const path=join(root,'checkpoint.json'),mutex=join(root,'coordinator.lock'),intent=options.intent,fixture=options.fixture;guard();
 const validate=j=>{
  closed(j,['format','identity','intent','phase','sequence','pending','history'],'Checkpoint');need(j.format===1&&JSON.stringify(j.identity)===JSON.stringify(identity)&&j.intent===intent,'Checkpoint identity/intent differs');
  need(['READY','PENDING','COMPLETE','STOPPED'].includes(j.phase)&&Array.isArray(j.history)&&j.history.length<=16&&j.sequence===j.history.length,'Checkpoint phase/sequence differs');
  const actions=['ACTIVATE','RESUME_ACTIVATION','FINALIZE_ACTIVATION','ROLLBACK','RELEASE_RESERVATION'];
  for(const [i,event] of j.history.entries()){closed(event,['sequence','action','side','beforeHash','afterHash','outcome'],'Checkpoint event');need(event.sequence===i+1&&actions.includes(event.action)&&['local','server'].includes(event.side)&&hex(event.beforeHash)&&hex(event.afterHash)&&['APPLIED','RECONCILED_APPLIED','RECONCILED_NO_EFFECT'].includes(event.outcome),'Checkpoint history differs');}
  if(j.phase==='PENDING'){closed(j.pending,['action','side','before','beforeHash'],'Pending checkpoint');closed(j.pending.before,['local','server'],'Pending state');for(const side of ['local','server']){const s=j.pending.before[side];closed(s,['phase','activeFingerprint','candidatePresent','previousFingerprint','lockOwned'],'Pending side');need(['STAGED','PREPARED','ACTIVATED','ROLLBACK_PREPARED','ROLLED_BACK'].includes(s.phase)&&(s.activeFingerprint===null||hex(s.activeFingerprint))&&(s.previousFingerprint===null||hex(s.previousFingerprint))&&typeof s.candidatePresent==='boolean'&&typeof s.lockOwned==='boolean','Pending state types differ');}need(hex(j.pending.beforeHash)&&digest(j.pending.before)===j.pending.beforeHash&&['local','server'].includes(j.pending.side)&&actions.includes(j.pending.action),'Pending checkpoint differs');}
  else need(j.pending===null,'Unexpected pending checkpoint');return j;
 };
 const load=()=>{guard();const s=canonical(path);need(s.isFile()&&s.nlink===1&&s.size>0&&s.size<=262144,'Checkpoint file type/size differs');let j;try{j=JSON.parse(readFileSync(path,'utf8'));}catch{throw new Error('Checkpoint JSON invalid');}return validate(j);};
 const save=(j,expectedHash=null)=>{
  guard();validate(j);if(expectedHash!==null){need(digestBytes()===expectedHash,'Checkpoint changed; inspect');}else need(!lstatSync(path,{throwIfNoEntry:false}),'Checkpoint appeared; inspect');
  const temp=path+'.tmp-'+randomBytes(8).toString('hex');let fd;
  try{fd=openSync(temp,'wx',0o600);writeFileSync(fd,JSON.stringify(j));closeSync(fd);fd=undefined;renameSync(temp,path);}finally{if(fd!==undefined)closeSync(fd);if(existsSync(temp))unlinkSync(temp);}
 };
 const digestBytes=()=>{canonical(path);return sha256(readFileSync(path));};
 const acquire=()=>{guard();let fd;try{fd=openSync(mutex,'wx',0o600);}catch{throw new Error('Checkpoint busy or interrupted lock; inspect');}const token=randomBytes(32).toString('hex');let held;try{writeFileSync(fd,token);held=lstatSync(mutex);}catch(error){closeSync(fd);throw error;}return()=>{closeSync(fd);guard();const current=canonical(mutex);need(current.dev===held.dev&&current.ino===held.ino&&current.nlink===1&&readFileSync(mutex,'utf8')===token,'Checkpoint mutex changed; retained for inspect');unlinkSync(mutex);};};
 if(!lstatSync(path,{throwIfNoEntry:false})){const release=acquire();try{save({format:1,identity,intent,phase:'READY',sequence:0,pending:null,history:[]});}finally{release();}}else load();
 const expectedAfter=pending=>{
  const after=structuredClone(pending.before),side=after[pending.side],r=identity.request;
  if(pending.action==='RELEASE_RESERVATION')side.lockOwned=false;
  else if(pending.action==='ROLLBACK')Object.assign(side,{phase:'ROLLED_BACK',activeFingerprint:r.expectedActiveFingerprint,candidatePresent:true,previousFingerprint:null});
  else Object.assign(side,{phase:'ACTIVATED',activeFingerprint:r.candidateFingerprint,candidatePresent:false,previousFingerprint:r.expectedActiveFingerprint});return after;
 };
 const finish=(j,current,outcome)=>{
  const after=physical(current);j.history.push({sequence:j.sequence+1,action:j.pending.action,side:j.pending.side,beforeHash:j.pending.beforeHash,afterHash:digest(after),outcome});j.sequence++;j.pending=null;j.phase=current.decision.nextAction==='NONE'?'COMPLETE':current.decision.nextAction==='INSPECT'?'STOPPED':'READY';
 };
 return Object.freeze({
  inspect(...rest){need(rest.length===0,'Checkpoint read overrides refused');return structuredClone(load());},
  async advance(control={simulateReceiptLoss:false},...rest){
   need(rest.length===0,'Checkpoint execution overrides refused');closed(control,['simulateReceiptLoss'],'Checkpoint execution control');need(typeof control.simulateReceiptLoss==='boolean','Invalid checkpoint fault flag');const release=acquire();
   try{
    const j=load(),startingHash=digestBytes();need(j.phase!=='PENDING','Pending receipt requires reconciliation');need(j.phase!=='STOPPED','Stopped checkpoint requires inspection');
    const observed=await fixture.inspect(intent),d=observed.decision;if(d.nextAction==='NONE'||d.nextAction==='INSPECT'){const phase=d.nextAction==='NONE'?'COMPLETE':'STOPPED';if(j.phase!==phase){j.phase=phase;save(j,startingHash);}return {status:j.phase,performed:false,fixtureOnly:true};}need(j.sequence<16,'Checkpoint attempt budget exhausted');
    const before=physical(observed);j.phase='PENDING';j.pending={action:d.nextAction,side:d.side,before,beforeHash:digest(before)};save(j,startingHash);const pendingHash=digestBytes();
    const result=await fixture.advancePinned(intent,{stateSha256:twoSideFixtureStateSha256(observed),action:d.nextAction,side:d.side});need(result.performed&&result.decision.nextAction===d.nextAction&&result.decision.side===d.side,'Fixture action changed; reconcile pending receipt');
    if(control.simulateReceiptLoss)return {status:'FIXTURE_RECEIPT_LOST',performed:true,fixtureOnly:true};
    need(digest(physical(result.after))===digest(expectedAfter(j.pending)),'Unexpected fixture result; reconcile pending receipt');finish(j,result.after,'APPLIED');save(j,pendingHash);return {status:j.phase,performed:true,fixtureOnly:true};
   }finally{release();}
  },
  async reconcilePending(...rest){need(rest.length===0,'Checkpoint reconciliation overrides refused');const release=acquire();try{const j=load();need(j.phase==='PENDING','No pending checkpoint receipt');const beforeHash=digestBytes(),current=await fixture.inspect(intent),actual=digest(physical(current));let outcome;
    if(actual===digest(expectedAfter(j.pending)))outcome='RECONCILED_APPLIED';else if(actual===j.pending.beforeHash)outcome='RECONCILED_NO_EFFECT';else throw new Error('Pending outcome conflicts; keep checkpoint and inspect');
    finish(j,current,outcome);save(j,beforeHash);return {status:j.phase,outcome,performed:false,fixtureOnly:true};
   }finally{release();}},
 });
}
