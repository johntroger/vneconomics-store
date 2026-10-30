// Test harness only: two isolated WASM filesystems, no local private store or hosting adapter.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {PHP} from '@php-wasm/universal';
import {loadNodeRuntime} from '@php-wasm/node';
import {validateKeyHandshakeRequest} from './r6-css-key-handshake.mjs';
import {inspectProductionKeyRecord} from './r6-css-production-proof.mjs';
import {planKeyReconciliation} from './r6-css-key-reconciliation.mjs';
import {sha256} from './release-lib.mjs';

const need=(ok,message)=>assert.ok(ok,message),encode=v=>Buffer.from(JSON.stringify(v)).toString('base64');
const fixtureIdentities=new WeakMap();
export function twoSideKeyFixtureIdentity(fixture){need(fixtureIdentities.has(fixture),'Owned two-side fixture required');return fixtureIdentities.get(fixture);}
export function twoSideFixtureStateSha256(snapshot){
 return sha256(Buffer.from(JSON.stringify(Object.fromEntries(['local','server'].map(side=>[side,Object.fromEntries(['side','request','phase','activeFingerprint','candidatePresent','previousFingerprint','lockOwned'].map(field=>[field,snapshot[side][field]]))])))));
}
export async function createTwoSideKeyFixture(options,...extra){
 need(extra.length===0,'Fixture overrides refused');need(options&&Object.getPrototypeOf(options)===Object.prototype&&JSON.stringify(Object.keys(options).sort())===JSON.stringify(['baselineRecord','candidateRecord','request']),'Closed fixture options required');
 const request=validateKeyHandshakeRequest(options.request);inspectProductionKeyRecord(options.candidateRecord,request.candidateFingerprint);
 if(request.kind==='initial')need(options.baselineRecord===null,'Initial fixture baseline must be absent');else inspectProductionKeyRecord(options.baselineRecord,request.expectedActiveFingerprint);
 const candidate={...options.candidateRecord},baseline=options.baselineRecord?{...options.baselineRecord}:null,receiver=readFileSync(new URL('../release-tools/r6-css-adapter.php',import.meta.url)),runtimes=new Map(),tokens=new Map();let closed=false,busy=false;
 const single=async action=>{need(!closed,'Key fixture closed');need(!busy,'Key fixture operation busy');busy=true;try{return await action();}finally{busy=false;}};
 const sideName=side=>{need(side==='local'||side==='server','Unknown fixture side');need(!closed,'Key fixture closed');return side;};
 const run=async(side,code)=>{
  sideName(side);const out=await runtimes.get(side).run({code:'<?php clearstatcache();try{define("ABSPATH","/wordpress/");define("VNE_ADAPTER_RUNTIME_TOKEN","'+tokens.get(side)+'");require "/receiver.php";'+code+'}catch(Throwable $e){echo json_encode(array("fixtureError"=>$e->getMessage()));}'});
  need(out.exitCode===0&&out.errors==='','Two-side fixture PHP failed');let result;try{result=JSON.parse(out.text);}catch{throw new Error('Two-side fixture response invalid');}if(result&&Object.hasOwn(result,'fixtureError'))throw new Error('Two-side fixture refused: '+result.fixtureError);return result;
 };
 const requestCode='$request=json_decode(base64_decode("'+encode(request)+'"),true);';
 const collect=side=>run(side,requestCode+'$base="/adapter-fixture/control";$root=$base."/candidates/".$request["operationId"];'+
  'foreach(array($base,$base."/candidates",$root) as $dir){vne_adapter_path($dir);vne_adapter_need(is_dir($dir)&&(lstat($dir)["mode"]&07777)===0700,"Fixture private directory differs");}'+
  '$fingerprint=function($path)use($request){if(!file_exists($path)&&!is_link($path))return null;vne_adapter_path($path);$s=lstat($path);vne_adapter_need(($s["mode"]&07777)===0600,"Fixture key mode differs");$record=vne_adapter_read_key_descriptor($path,$s);vne_adapter_need(is_array($record)&&is_string($record["key"]??null)&&preg_match("/^[a-f0-9]{64}$/D",$record["key"]),"Fixture key envelope invalid");$fp=hash("sha256",hex2bin($record["key"]));vne_adapter_validate_candidate_key_record($record,$fp,$request["target"]);$record["key"]="";return $fp;};'+
  '$candidate=$fingerprint($root."/health-key.json");vne_adapter_need($candidate===null||$candidate===$request["candidateFingerprint"],"Fixture candidate fingerprint differs");'+
  '$phase=file_exists($root."/activation.json")||is_link($root."/activation.json")?vne_adapter_read_key_activation_fixture($request)["phase"]:"STAGED";$owned=file_exists($base."/receiver.lock")||is_link($base."/receiver.lock");'+
  'if($owned){vne_adapter_path($base."/receiver.lock");$h=fopen($base."/receiver.lock","r+");$held=false;try{$held=flock($h,LOCK_EX|LOCK_NB);vne_adapter_need($held,"Fixture observation busy");vne_adapter_key_reservation_owned_fixture($request,$h,true);}finally{if($held)flock($h,LOCK_UN);fclose($h);}}else{$j=vne_adapter_json($base."/journal-".$request["operationId"].".json");vne_adapter_validate_key_reservation_record($j,$request);vne_adapter_need($j["phase"]==="RELEASED","Fixture missing logical reservation");}'+
  'echo json_encode(array("side"=>"'+side+'","request"=>$request,"phase"=>$phase,"activeFingerprint"=>$fingerprint($base."/health-key.json"),"candidatePresent"=>$candidate!==null,"previousFingerprint"=>$fingerprint($root."/previous-health-key.json"),"lockOwned"=>$owned,"observedAt"=>time()));');
 const inspect=async(intent,...rest)=>{need(rest.length===0,'Fixture inspection overrides refused');const local=await collect('local'),server=await collect('server');return {local,server,decision:planKeyReconciliation({request,intent,local,server})};};
 const execute=async(intent,pin=null)=>{
  if(pin!==null){
   need(pin&&Object.getPrototypeOf(pin)===Object.prototype&&JSON.stringify(Object.keys(pin).sort())===JSON.stringify(['action','side','stateSha256']),'Fixture execution pin fields differ');
   need(typeof pin.stateSha256==='string'&&/^[a-f0-9]{64}$/.test(pin.stateSha256),'Invalid fixture state pin');pin=Object.freeze({...pin});
  }
  const before=await inspect(intent),d=before.decision;
  if(pin!==null){
   need(pin.stateSha256===twoSideFixtureStateSha256(before),'Fixture state pin changed; inspect');
   need(pin.action===d.nextAction&&pin.side===d.side,'Fixture decision pin changed; inspect');
  }
  if(['NONE','INSPECT'].includes(d.nextAction))return {decision:d,performed:false,fixtureOnly:true};
  let code;
  if(['ACTIVATE','RESUME_ACTIVATION','FINALIZE_ACTIVATION'].includes(d.nextAction))code='vne_adapter_activate_key_candidate_fixture(array("activationApproved"=>true,"request"=>$request))';
  else if(d.nextAction==='ROLLBACK')code='vne_adapter_rollback_key_candidate_fixture(array("recoveryApproved"=>true,"request"=>$request,"expectedPhase"=>"'+(before[d.side].phase==='ACTIVATED'?'ACTIVATED':'PREPARED')+'"))';
  else{need(d.nextAction==='RELEASE_RESERVATION','Unknown fixture action');code='vne_adapter_key_reservation_fixture("release",$request)';}
  const receipt=await run(d.side,requestCode+'echo json_encode('+code+');');return {decision:d,performed:true,receipt,after:await inspect(intent),fixtureOnly:true,productionExecutionAuthorized:false};
 };
 const close=()=>{if(closed)return;need(!busy,'Cannot close busy key fixture');closed=true;for(const runtime of runtimes.values())runtime.exit();runtimes.clear();tokens.clear();candidate.key='';if(baseline)baseline.key='';};
 try{
  // Sequential fixture creation and writes; never operate a host or the real local key store.
  for(const side of ['local','server']){
   const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:process.pid}}));runtimes.set(side,php);await php.setSapiName('cli');const token=randomBytes(32).toString('hex');tokens.set(side,token);
   for(const path of ['/wordpress','/adapter-fixture','/adapter-fixture/control'])php.mkdir(path);php.writeFile('/wordpress/.adapter-owned',token);php.writeFile('/receiver.php',receiver);
   if(baseline)php.writeFile('/adapter-fixture/control/health-key.json',JSON.stringify(baseline));
   await run(side,'chmod("/adapter-fixture/control",0700);'+(baseline?'chmod("/adapter-fixture/control/health-key.json",0600);':'')+requestCode+'vne_adapter_key_reservation_fixture("reserve",$request);$key=json_decode(base64_decode("'+encode(candidate)+'"),true);vne_adapter_stage_key_candidate_fixture($request,$key);$key["key"]="";echo json_encode(array("prepared"=>true));');
  }
  candidate.key='';if(baseline)baseline.key='';
  const api={
   controllerSha256:sha256(receiver),inspect,close,
   async advance(intent,...rest){
    need(rest.length===0,'Fixture execution overrides refused');return execute(intent);
   },
   async advancePinned(intent,pin,...rest){need(rest.length===0&&pin!==null&&pin!==undefined,'Fixture execution pin required');return execute(intent,pin);},
   async simulateInterruption(side,point,...rest){
    sideName(side);need(rest.length===0&&['old-key-moved','candidate-switched','corrupt-active'].includes(point),'Unknown fixture fault');need(point!=='old-key-moved'||request.kind==='rotation','Initial fixture has no old key');
    return run(side,requestCode+'$base="/adapter-fixture/control";$root=$base."/candidates/".$request["operationId"];'+(point==='corrupt-active'?'file_put_contents($base."/health-key.json","synthetic interrupted key");chmod($base."/health-key.json",0600);':
     'vne_adapter_need(!file_exists($root."/activation.json"),"Fixture fault requires staged key");vne_adapter_write_key_activation_fixture($request,"PREPARED");'+(request.kind==='rotation'?'vne_adapter_need(rename($base."/health-key.json",$root."/previous-health-key.json"),"Fixture old-key seed move failed");':'vne_adapter_need("'+point+'"!=="old-key-moved","Initial fixture has no old key");')+(point==='candidate-switched'?'vne_adapter_need(rename($root."/health-key.json",$base."/health-key.json"),"Fixture candidate seed switch failed");':''))+'echo json_encode(array("faultSeeded"=>true));');
   },
   async hashes(side,...rest){sideName(side);need(rest.length===0,'Fixture read overrides refused');return run(side,'$rows=array();foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator("/adapter-fixture/control",FilesystemIterator::SKIP_DOTS),RecursiveIteratorIterator::SELF_FIRST) as $f){$rows[$f->getPathname()]=array("mode"=>$f->getPerms(),"hash"=>$f->isFile()?hash_file("sha256",$f->getPathname()):null);}ksort($rows);echo json_encode($rows);');},
  };
  const fixture=Object.freeze({...api,inspect:(...args)=>single(()=>api.inspect(...args)),advance:(...args)=>single(()=>api.advance(...args)),advancePinned:(...args)=>single(()=>api.advancePinned(...args)),simulateInterruption:(...args)=>single(()=>api.simulateInterruption(...args)),hashes:(...args)=>single(()=>api.hashes(...args))});
  fixtureIdentities.set(fixture,Object.freeze({fixtureId:randomBytes(16).toString('hex'),request:Object.freeze({...request}),controllerSha256:sha256(receiver)}));return fixture;
 }catch(error){close();throw error;}
}
