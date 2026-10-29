import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHmac,randomBytes} from 'node:crypto';
import {buildOperatorBootstrap,collectLocalHealthProof} from './r6-css-operator.mjs';
import {sha256} from './release-lib.mjs';

export async function exerciseOperator({php,approval,token,receiver}){
 const checks=[],controller='/adapter-fixture/inbox/receiver.php',manifest='/adapter-fixture/inbox/manifest.json';
 const run=async code=>{const r=await php.run({code:'<?php try{'+code+'}catch(Throwable $e){echo json_encode(array("error"=>$e->getMessage()));}'});assert.equal(r.exitCode,0,r.errors||r.text);assert.equal(r.errors,'',r.errors);return JSON.parse(r.text);};
 const make=a=>buildOperatorBootstrap('inspect-inbox',a,{fixtureToken:token});
 const good=make(approval);assert.match(good.command,/^eval '[^']+' --skip-wordpress --skip-packages$/);assert.equal(good.productionWriteAuthorized,false);
 assert.equal((await run(good.code)).status,'VERIFIED_INBOX_BYTES_AND_REF');checks.push('generated inspect bootstrap executes pinned controller without WordPress');
 for(const change of [{sourceSha:'HEAD'},{expectedParent:'a'.repeat(40)},{path:'/tmp/unsafe.php'},{receiverSha256:'";touch evil;#'},{environment:'unknown'}])assert.throws(()=>make({...approval,...change}));checks.push('invalid refs parent unknown fields paths and code injection rejected');
 for(const field of ['sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256'])assert.throws(()=>make({...approval,[field]:approval[field]+'\n'}));
 assert.throws(()=>buildOperatorBootstrap('inspect-inbox',approval,{fixtureToken:token+'\n'}));
 const prod={...approval,environment:'production'};assert.match(buildOperatorBootstrap('inspect-inbox',prod).command,/--skip-wordpress/);
 for(const mode of ['install','inspect-state','finish','confirm-rollback'])assert.throws(()=>buildOperatorBootstrap(mode,prod),/Production runtime/);
 assert.throws(()=>buildOperatorBootstrap('arbitrary();',approval,{fixtureToken:token}));checks.push('production only permits read-only inbox command; all runtime modes blocked');
 assert.equal((await run('function get_option(){};'+good.code)).error,'Use --skip-wordpress for inbox inspect');checks.push('already bootstrapped WordPress context rejected before inspect');
 const oldManifest=php.readFileAsBuffer(manifest);php.writeFile(manifest,'tampered');
 assert.equal((await run(good.code)).error,'Bootstrap manifest pin differs');php.writeFile(manifest,oldManifest);checks.push('external manifest pin checked before include');
 php.writeFile(controller,'<?php file_put_contents("/adapter-fixture/EXECUTED","bad");');
 assert.equal((await run(good.code)).error,'Bootstrap controller pin differs');assert.equal(php.fileExists('/adapter-fixture/EXECUTED'),false);php.writeFile(controller,receiver);checks.push('tampered controller never executes through generated bootstrap');
 php.writeFile('/adapter-fixture/controller-copy.php',receiver);php.unlink(controller);php.symlink('/adapter-fixture/controller-copy.php',controller);
 assert.equal((await run(good.code)).error,'Bootstrap symlink refused');php.unlink(controller);php.writeFile(controller,receiver);php.unlink('/adapter-fixture/controller-copy.php');checks.push('controller symlink blocked before include');
 const runtime={...approval,environment:'local-runtime',productionApproved:false,owner:randomBytes(16).toString('hex'),baselineSha256:'a'.repeat(64),requiredFreeBytes:300000000};
 for(const field of ['owner','baselineSha256'])assert.throws(()=>buildOperatorBootstrap('finish',{...runtime,[field]:runtime[field]+'\n'},{fixtureToken:token}));
 const key=randomBytes(32),now=Math.floor(Date.now()/1000),journal={...runtime,phase:'AWAIT_HEALTH',challenge:randomBytes(32).toString('hex'),issuedAt:now,expiresAt:now+120};
 let behavior='good',requests=0;const css=Buffer.from('body{color:#123}'),marker='r6-css-'+runtime.sourceSha.slice(0,12);
 const server=createServer((req,res)=>{
  requests++;
  if(behavior==='redirect'){res.writeHead(302,{location:'http://example.invalid/never-call'});res.end();return;}
  if(req.url==='/wp-content/themes/vibelab-v2/style.css'){res.setHeader('content-type','text/css');res.end(behavior==='large-css'?Buffer.alloc(262145,32):css);return;}
  res.setHeader('content-type','text/html');
  if(behavior==='large-html'){res.end(Buffer.alloc(1048577,32));return;}
  if(req.headers['x-r714-health-fail']==='1'){res.statusCode=503;res.end('fixture failure');return;}
  res.end('<meta name="vibelab-release" content="'+marker+'">');
 });
 await new Promise((done,fail)=>server.once('error',fail).listen(19482,'127.0.0.1',done));
 try{
  const options={key,fixtureToken:token},result=await collectLocalHealthProof(runtime,journal,options);
  assert.equal(result.observation.marker,marker);assert.equal(result.observation.cssSha256,sha256(css));assert.equal(result.observation.httpStatus,200);
  assert.equal(result.proof.signature,createHmac('sha256',key).update(Buffer.from(result.proof.body,'base64')).digest('hex'));
  assert.ok(!JSON.stringify(result).includes(key.toString('hex')));checks.push('probe collects real bounded HTTP responses and signs identity without exposing key');
  const failure=await collectLocalHealthProof(runtime,journal,{...options,fixtureHttp503:true});assert.equal(failure.observation.httpStatus,503);checks.push('real HTTP503 is recorded rather than converted to success');
  const before=requests;
  await assert.rejects(()=>collectLocalHealthProof(runtime,{...journal,payloadSha:'a'.repeat(40)},options),/identity differs/);
  await assert.rejects(()=>collectLocalHealthProof(runtime,{...journal,expiresAt:now-1},options),/expired/);
  await assert.rejects(()=>collectLocalHealthProof(runtime,{...journal,phase:'COMPLETE'},options),/not awaiting/);
  await assert.rejects(()=>collectLocalHealthProof(runtime,{...journal,challenge:journal.challenge+'\n'},options),/Invalid length/);
  await assert.rejects(()=>collectLocalHealthProof(runtime,journal,{...options,key:Buffer.alloc(1)}),/32 bytes/);
  await assert.rejects(()=>collectLocalHealthProof({...runtime,environment:'production'},journal,options),/Production runtime/);
  assert.equal(requests,before);checks.push('identity phase expiry key and production mismatch rejected before network');
  behavior='redirect';await assert.rejects(()=>collectLocalHealthProof(runtime,journal,options),/redirect refused/);checks.push('redirect refused without contacting another origin');
  behavior='large-css';await assert.rejects(()=>collectLocalHealthProof(runtime,journal,options),/exceeds limit/);
  behavior='large-html';await assert.rejects(()=>collectLocalHealthProof(runtime,journal,options),/exceeds limit/);checks.push('streaming byte limits reject oversized CSS and HTML');
 }finally{server.closeAllConnections();await new Promise((done,fail)=>server.close(error=>error?fail(error):done()));}
 return checks;
}
