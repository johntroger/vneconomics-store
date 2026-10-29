// Read-only GitHub artifact verification; no payload publication or hosting action.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,lstatSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {r717} from './r717-adapter-candidate.mjs';
import {prepareCssAdapter,verifyCssAdapter} from './release-r6-css-adapter.mjs';
import {git,sha256} from './release-lib.mjs';

const [runText,source,...extra]=process.argv.slice(2);assert.equal(extra.length,0,'Use run ID and exact orchestrator source SHA');
const runId=Number(runText);assert.ok(Number.isSafeInteger(runId)&&runId>0&&String(runId)===runText);assert.equal(source?.length,40);assert.match(source,/^[a-f0-9]+$/);
assert.equal(git(['rev-parse','HEAD']).toString().trim(),source,'Use the reviewed exact verifier checkout');
assert.equal(git(['diff','--name-only','HEAD','--','scripts/verify-r717-artifact.mjs','scripts/r717-adapter-candidate.mjs','scripts/release-r6-css-adapter.mjs']).toString().trim(),'','Verifier/build source has uncommitted changes');
const repo='johntroger/vneconomics-store',api=path=>JSON.parse(execFileSync('gh',['api','repos/'+repo+path],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024}));
function checkRun(){
 const r=api('/actions/runs/'+runId);assert.equal(r.repository.full_name,repo);assert.equal(r.head_repository.full_name,repo);assert.equal(r.head_sha,source);assert.equal(r.event,'pull_request');assert.equal(r.status,'completed');assert.equal(r.conclusion,'success');assert.equal(r.run_attempt,1,'Rerun requires inspection');
 const workflow=api('/actions/workflows/'+r.workflow_id);assert.equal(workflow.path,'.github/workflows/r717-adapter-rehearsal.yml');return r;
}
const run=checkRun(),jobs=api('/actions/runs/'+runId+'/jobs?filter=latest&per_page=100');assert.equal(jobs.total_count,1);
const job=jobs.jobs[0];assert.equal(job.name,'rehearsal');assert.equal(job.conclusion,'success');assert.equal(job.run_attempt,1);
for(const name of ['Verify frozen R6 production parent before build','Build exact six-file rehearsal package','Native test the actual package','Verify frozen R6 production parent after native','Upload exactly six transport files','Upload separate public proof receipts']){const steps=job.steps.filter(step=>step.name===name);assert.equal(steps.length,1);assert.equal(steps[0].conclusion,'success');}
const listing=api('/actions/runs/'+runId+'/artifacts?per_page=100');assert.equal(listing.total_count,2);
const artifacts=listing.artifacts;for(const a of artifacts){
 assert.ok(['r717-six-file-rehearsal','r717-rehearsal-proofs'].includes(a.name));assert.equal(a.expired,false);assert.ok(Date.parse(a.expires_at)>Date.now());assert.equal(a.workflow_run.id,runId);assert.equal(a.workflow_run.head_sha,source);assert.equal(a.workflow_run.repository_id,run.repository.id);
 assert.match(a.digest,/^sha256:[a-f0-9]{64}$/);assert.ok(a.size_in_bytes>0&&a.size_in_bytes<4*1024*1024);
 const step=job.steps.find(step=>step.name===(a.name==='r717-six-file-rehearsal'?'Upload exactly six transport files':'Upload separate public proof receipts'));
 assert.ok(Date.parse(a.created_at)>=Date.parse(step.started_at)-2000&&Date.parse(a.created_at)<=Date.parse(step.completed_at)+2000,'Artifact upload window differs');
}
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/r717-artifact-')),dirs={};
for(const a of artifacts){
 const archive=execFileSync('gh',['api','repos/'+repo+'/actions/artifacts/'+a.id+'/zip'],{encoding:null,windowsHide:true,maxBuffer:8*1024*1024});
 assert.equal('sha256:'+sha256(archive),a.digest,'Downloaded ZIP container digest differs');
 const directory=join(fixture,a.name);mkdirSync(directory);execFileSync('gh',['run','download',runText,'--repo',repo,'--name',a.name,'--dir',directory],{stdio:'inherit',windowsHide:true});dirs[a.name]=directory;
}
const directory=dirs['r717-six-file-rehearsal'],prepared=prepareCssAdapter(r717.source,r717.controller);
verifyCssAdapter(r717.source,r717.controller,directory);
const proofDir=dirs['r717-rehearsal-proofs'],names=readdirSync(proofDir);assert.equal(names.length,2);
assert.ok(names.every(name=>lstatSync(join(proofDir,name)).isFile()&&!lstatSync(join(proofDir,name)).isSymbolicLink()));
const packageName=names.find(name=>name==='package-'+source+'-clean.json'),nativeName=names.find(name=>/^test-[a-f0-9-]{36}\.json$/.test(name));assert.ok(packageName&&nativeName,'Unexpected proof allowlist');
const rawPackage=readFileSync(join(proofDir,packageName)),rawNative=readFileSync(join(proofDir,nativeName)),p=JSON.parse(rawPackage),n=JSON.parse(rawNative);
for(const receipt of [p,n]){assert.equal(receipt.sourceSha,r717.source);assert.equal(receipt.controllerSourceSha,r717.controller);assert.equal(receipt.orchestratorSourceSha,source);assert.equal(receipt.manifestSha256,sha256(prepared.buffers['manifest.json']));assert.equal(receipt.rehearsalOnly,true);assert.equal(receipt.deployAuthorized,false);assert.equal(receipt.payloadPublished,false);}
assert.equal(p.status,'R717_REHEARSAL_PACKAGE_VERIFIED');assert.equal(p.executorClean,true);assert.equal(p.executorVersioned,true);assert.equal(p.executorTreeMatches,true);assert.equal(p.privateStateIncluded,false);
assert.deepEqual(p.files,Object.keys(prepared.buffers).sort().map(path=>({path,bytes:prepared.buffers[path].length,sha256:sha256(prepared.buffers[path])})));
assert.equal(n.status,'PASS_R717_ACTUAL_PACKAGE_NATIVE');assert.equal(n.native,true);assert.equal(n.checks.length,48);assert.equal(n.executorCheckoutSha,p.executorCheckoutSha);
assert.match(p.executorCheckoutSha,/^[a-f0-9]{40}$/);assert.equal(p.executorCheckoutSha.length,40);
try{git(['cat-file','-e',p.executorCheckoutSha+'^{commit}']);}catch{git(['fetch','origin',p.executorCheckoutSha]);}
assert.equal(git(['diff','--name-only',source,p.executorCheckoutSha]).toString().trim(),'','Executor merge tree differs from orchestrator source');
const after=checkRun(),afterArtifacts=api('/actions/runs/'+runId+'/artifacts?per_page=100').artifacts;
assert.equal(after.run_attempt,run.run_attempt);assert.deepEqual(afterArtifacts.map(a=>[a.id,a.digest]).sort(),artifacts.map(a=>[a.id,a.digest]).sort());
const evidence=resolve('docs/acceptance/R717-controller-artifact');mkdirSync(evidence,{recursive:true});
function keep(name,data){const path=join(evidence,name);if(existsSync(path))assert.equal(sha256(readFileSync(path)),sha256(data),'Existing evidence differs');else writeFileSync(path,data,{flag:'wx'});}
keep('ci-package.json',rawPackage);keep('ci-native.json',rawNative);
const result={status:'PASS_R717_CI_ARTIFACT',runId,orchestratorSourceSha:source,executorCheckoutSha:p.executorCheckoutSha,sourceSha:r717.source,controllerSourceSha:r717.controller,manifestSha256:p.manifestSha256,packageFiles:6,nativeChecks:n.checks.length,artifacts:artifacts.map(a=>({id:a.id,name:a.name,digest:a.digest,bytes:a.size_in_bytes})),zipContainerDigestsVerified:true,canonicalPackageBytesVerified:true,rehearsalOnly:true,deployAuthorized:false,payloadPublished:false,temporaryDownloads:'owned tmp/tests/r717-artifact-*; run-clean'};
keep('artifact-verification.json',Buffer.from(JSON.stringify(result,null,2)+'\n'));console.log(JSON.stringify(result));
