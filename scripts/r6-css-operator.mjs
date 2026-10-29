import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {r6CssProfile} from './release-r6-css.mjs';

const pins={sourceSha:40,controllerSourceSha:40,payloadSha:40,expectedParent:40,manifestSha256:64,receiverSha256:64};
const runtimeModes=['inspect-state','install','finish','confirm-rollback','renew-health','import-health'];
function exactHex(value,length,label){assert.equal(typeof value,'string','Invalid '+label);assert.equal(value.length,length,'Invalid length '+label);assert.match(value,/^[a-f0-9]+$/,'Invalid hex '+label);}
export function validateOperatorRequest(mode,approval,fixtureToken){
 assert.ok(mode==='inspect-inbox'||runtimeModes.includes(mode),'Unknown operator mode');
 assert.ok(approval&&Object.getPrototypeOf(approval)===Object.prototype,'Plain approval required');
 const runtime=mode!=='inspect-inbox',environment=approval.environment;
 assert.ok(['production','local-fixture','local-runtime'].includes(environment),'Unknown operator environment');
 assert.ok(!runtime||environment==='local-runtime','Production runtime bootstrap disabled');
 const fields=[...Object.keys(pins),'environment',...(runtime?['owner','baselineSha256','requiredFreeBytes','productionApproved']:[]),...(mode==='renew-health'?['expectedChallenge']:[])].sort();
 assert.deepEqual(Object.keys(approval).sort(),fields,'Approval fields differ');
 for(const [key,length] of Object.entries(pins))exactHex(approval[key],length,key);
 assert.equal(approval.expectedParent,r6CssProfile.payload,'Unreviewed production parent');
 if(environment.startsWith('local-'))exactHex(fixtureToken,64,'fixture token');
 else assert.equal(fixtureToken,undefined,'Fixture token in production request');
 assert.ok(environment!=='local-runtime'||runtime,'Use local-fixture for no-WordPress inspect');
 if(runtime){
  assert.equal(approval.productionApproved,false,'Production approval cannot enable fixture bootstrap');
  exactHex(approval.owner,32,'owner');exactHex(approval.baselineSha256,64,'baseline hash');
  if(mode==='renew-health')exactHex(approval.expectedChallenge,64,'expected challenge');
  assert.ok(Number.isSafeInteger(approval.requiredFreeBytes)&&approval.requiredFreeBytes>=268435456,'Invalid approved disk reserve');
 }
 return {runtime,environment};
}
export function buildOperatorBootstrap(mode,approval,{fixtureToken,proof}={}){
 const {runtime,environment}=validateOperatorRequest(mode,approval,fixtureToken);
 if(mode==='import-health'){
  assert.ok(proof&&Object.getPrototypeOf(proof)===Object.prototype,'Signed health proof required');
  assert.deepEqual(Object.keys(proof).sort(),['body','signature']);
  assert.equal(typeof proof.body,'string');assert.ok(proof.body.length>0&&proof.body.length<=10924,'Invalid proof body size');
  exactHex(proof.signature,64,'proof signature');
 }else assert.equal(proof,undefined,'Proof input only allowed for import-health');
 const production=environment==='production',root=production?'/var/www/vhosts/vneconomics.com/store.vneconomics.com':runtime?'/wordpress':'/adapter-fixture/site';
 const inbox=production?'/var/www/vhosts/vneconomics.com/deploy-inbox/production':'/adapter-fixture/inbox';
 const receiver=inbox+'/receiver.php',manifest=inbox+'/manifest.json',data=Buffer.from(JSON.stringify(approval)).toString('base64');
 // No request-supplied path, PHP fragment, user ID, key, eval(), download or writer.
 const code=[
  'if(PHP_SAPI!=="cli"){throw new RuntimeException("CLI required");}',
  runtime?'if(!function_exists("current_user_can")||!isset($GLOBALS["wpdb"])){throw new RuntimeException("WordPress runtime context required");}':'if(function_exists("get_option")||isset($GLOBALS["wpdb"])){throw new RuntimeException("Use --skip-wordpress for inbox inspect");}',
  '$a=json_decode(base64_decode("'+data+'",true),true,32,JSON_THROW_ON_ERROR);',
  'foreach(["'+root+'","'+inbox+'","'+manifest+'","'+receiver+'"] as $p){for($q=$p;$q!==dirname($q);$q=dirname($q)){if(is_link($q)){throw new RuntimeException("Bootstrap symlink refused");}}if(realpath($p)!==$p){throw new RuntimeException("Bootstrap path differs");}}',
  'if(!is_file("'+receiver+'")||hash_file("sha256","'+receiver+'")!=="'+approval.receiverSha256+'"){throw new RuntimeException("Bootstrap controller pin differs");}',
  'if(!is_file("'+manifest+'")||hash_file("sha256","'+manifest+'")!=="'+approval.manifestSha256+'"){throw new RuntimeException("Bootstrap manifest pin differs");}',
  ...(production?[]:['if(defined("'+(runtime?'VNE_ADAPTER_RUNTIME_TOKEN':'VNE_ADAPTER_FIXTURE_TOKEN')+'")){throw new RuntimeException("Fixture token already set");}define("'+(runtime?'VNE_ADAPTER_RUNTIME_TOKEN':'VNE_ADAPTER_FIXTURE_TOKEN')+'","'+fixtureToken+'");']),
  'require "'+receiver+'";',
  'echo json_encode('+(runtime?'vne_adapter_runtime_dispatch':'vne_adapter_dispatch')+'("'+mode+'",$a'+(mode==='import-health'?',json_decode(base64_decode("'+Buffer.from(JSON.stringify(proof)).toString('base64')+'",true),true,32,JSON_THROW_ON_ERROR)':'')+'),JSON_THROW_ON_ERROR);',
 ].join('');
 assert.ok(!code.includes("'"),'Plesk single-quote wrapper must not contain single quotes');
 return {code,command:"eval '"+code+"' "+(runtime?'--user=1':'--skip-wordpress --skip-packages'),scope:runtime?'owned-local-runtime':'read-only-inbox',productionWriteAuthorized:false};
}
async function readBounded(response,limit){
 const reader=response.body?.getReader();assert.ok(reader,'HTTP response body missing');let bytes=0;const chunks=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;assert.ok(bytes<=limit,'Probe response exceeds limit');chunks.push(Buffer.from(value));}}
 catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
 return Buffer.concat(chunks);
}
export async function collectLocalHealthProof(approval,journal,{key,fixtureToken,fixtureHttp503=false}={}){
 validateOperatorRequest('finish',approval,fixtureToken);
 assert.ok(Buffer.isBuffer(key)&&key.length===32,'Private probe key must be 32 bytes');
 for(const field of ['owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','receiverSha256','baselineSha256'])assert.equal(journal[field],approval[field],'Journal/probe identity differs: '+field);
 assert.ok(['AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'].includes(journal.phase),'Probe phase is not awaiting health');
 exactHex(journal.challenge,64,'probe challenge');
 const fresh=()=>{const now=Math.floor(Date.now()/1000);assert.ok(Number.isSafeInteger(journal.issuedAt)&&Number.isSafeInteger(journal.expiresAt)&&journal.issuedAt<=now&&journal.expiresAt>=now&&journal.expiresAt>journal.issuedAt&&journal.expiresAt-journal.issuedAt<=120,'Probe challenge expired/invalid');return now;};fresh();
 const url='http://127.0.0.1:19482/',cssUrl=url+'wp-content/themes/vibelab-v2/style.css';
 const get=async(target,headers={})=>{
  const response=await fetch(target,{redirect:'manual',cache:'no-store',headers,signal:AbortSignal.timeout(30000)});
  if(response.status>=300&&response.status<400){await response.body?.cancel();throw new Error('Health probe redirect refused');}
  assert.equal(response.url,target,'Health probe response target differs');return response;
 };
 const page=await get(url,fixtureHttp503?{'X-R714-Health-Fail':'1'}:{}),html=(await readBounded(page,1024*1024)).toString('utf8');
 const css=await get(cssUrl),cssBytes=await readBounded(css,262144);
 const observation={owner:approval.owner,sourceSha:approval.sourceSha,controllerSourceSha:approval.controllerSourceSha,payloadSha:approval.payloadSha,manifestSha256:approval.manifestSha256,phase:journal.phase,challenge:journal.challenge,observedAt:fresh(),url,httpStatus:page.status,cssStatus:css.status,marker:html.match(/name="vibelab-release" content="([^"]+)"/)?.[1]??null,cssSha256:(await import('./release-lib.mjs')).sha256(cssBytes)};
 const body=Buffer.from(JSON.stringify(observation));
 return {observation,proof:{body:body.toString('base64'),signature:createHmac('sha256',key).update(body).digest('hex')}};
}
