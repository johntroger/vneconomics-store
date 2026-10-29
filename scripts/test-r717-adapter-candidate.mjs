import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {buildR717,verifyR717,r717} from './r717-adapter-candidate.mjs';
import {r6CssProfile} from './release-r6-css.mjs';

const native=process.argv.includes('--native');assert.ok(process.argv.slice(2).every(value=>value==='--native'),'Use optional --native');
const receipt=buildR717(),prepared=verifyR717(),checks=[];
assert.equal(receipt.files.length,6);assert.equal(receipt.privateStateIncluded,false);assert.equal(receipt.deployAuthorized,false);checks.push('actual six-file package excludes private key proof journal DB and config');
const again=verifyR717();for(const [name,bytes] of Object.entries(prepared.buffers))assert.ok(bytes.equals(again.buffers[name]));checks.push('artifact bytes match canonical build from frozen CSS/controller Git sources');
assert.equal(receipt.controllerSourceSha,r717.controller);assert.equal(receipt.sourceSha,r717.source);assert.deepEqual(prepared.manifest.controller.capabilities,['inspect-inbox']);checks.push('rehearsal source and controller are separate; production capability remains disabled');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/r717-candidate-')),repo=join(fixture,'git');
const git=(args,input,cwd=repo)=>{const r=spawnSync('git',args,{cwd,input,encoding:null,windowsHide:true,maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr?.toString());return r.stdout.toString().trim();};
git(['clone','--shared','--no-checkout',resolve('.'),repo],undefined,fixture);git(['config','user.name','R717 fixture']);git(['config','user.email','fixture@example.invalid']);
const rows=Object.entries(prepared.buffers).sort(([a],[b])=>a.localeCompare(b)).map(([name,data])=>'100644 blob '+git(['hash-object','-w','--stdin'],data)+'\t'+name+'\n').join('');
const tree=git(['mktree'],rows),payload=git(['commit-tree',tree,'-p',r6CssProfile.payload,'-m','R717 isolated payload fixture; never publish']);
const validate=(source=receipt.sourceSha,parent=r6CssProfile.payload,profile=receipt.profile)=>spawnSync(process.execPath,[resolve('scripts/validate-payload-commit.mjs'),payload,source,parent,profile],{cwd:repo,encoding:'utf8',windowsHide:true});
assert.equal(validate().status,0);for(const [source,parent,profile] of [['a'.repeat(40),r6CssProfile.payload,receipt.profile],[receipt.sourceSha,'a'.repeat(40),receipt.profile],[receipt.sourceSha,r6CssProfile.payload,r6CssProfile.id]])assert.notEqual(validate(source,parent,profile).status,0);checks.push('real temporary Git payload has exact six-file tree and R6 parent; mismatched pins/profile rejected');
const controllerBefore=readFileSync(join(r717.directory,'receiver.php'));assert.ok(controllerBefore.equals(prepared.buffers['receiver.php']));checks.push('transport controller bytes are exact Git blob, not local working file');
const runId=randomUUID(),proof={status:'FAIL',native,checks,sourceSha:receipt.sourceSha,controllerSourceSha:receipt.controllerSourceSha,orchestratorSourceSha:receipt.orchestratorSourceSha,executorCheckoutSha:receipt.executorCheckoutSha,manifestSha256:receipt.manifestSha256,payloadFixtureOnly:payload,expectedProductionParent:r6CssProfile.payload,rehearsalOnly:true,deployAuthorized:false,payloadPublished:false};
const deadline=setTimeout(()=>{console.error('R717 native package test exceeded600seconds');process.exit(1);},600000);deadline.unref();
try{
 if(native){const {exerciseAdapterRuntime}=await import('./test-r6-css-adapter-runtime.mjs');checks.push(...await exerciseAdapterRuntime({fixture,prepared,payload}));}
 verifyR717();checks.push('package remains byte identical after verification/native test');
 proof.status=native?'PASS_R717_ACTUAL_PACKAGE_NATIVE':'PASS_R717_PACKAGE_POLICY';
}catch(error){proof.error=String(error.stack??error);throw error;}
finally{clearTimeout(deadline);writeFileSync(join(r717.evidence,'test-'+runId+'.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(proof));}
