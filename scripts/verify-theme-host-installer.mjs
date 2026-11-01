// Read-only GitHub provenance/digest/bytes check. Does not publish refs or contact hosting.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,existsSync,readdirSync,lstatSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {ZipReader,Uint8ArrayReader,Uint8ArrayWriter} from '@zip.js/zip.js';
import {sha256} from './release-lib.mjs';
import {assertReviewPath} from './theme-release.mjs';
const [id,...extra]=process.argv.slice(2);assert.ok(typeof id==='string'&&/^[0-9]{1,20}$/.test(id)&&!extra.length,'Use exact CI run ID');
const call=(cmd,args,binary=false)=>{const r=spawnSync(cmd,args,{encoding:binary?null:'utf8',windowsHide:true,maxBuffer:8*1024*1024,timeout:120000});assert.equal(r.status,0,r.stderr?.toString());return binary?r.stdout:r.stdout.trim();};
const repo='johntroger/vneconomics-store',api=p=>JSON.parse(call('gh',['api','repos/'+repo+'/'+p]));
assert.equal(call('git',['remote','get-url','origin']),'https://github.com/'+repo+'.git');
const run=api('actions/runs/'+id),wf=api('actions/workflows/'+run.workflow_id),jobs=api('actions/runs/'+id+'/jobs?filter=latest&per_page=100');
assert.equal(run.repository.full_name,repo);assert.equal(run.head_repository.full_name,repo);assert.match(run.head_sha,/^[a-f0-9]{40}$/);assert.equal(run.status,'completed');assert.equal(run.conclusion,'success');assert.ok(['pull_request','workflow_dispatch'].includes(run.event));assert.ok(Number.isSafeInteger(run.run_attempt)&&run.run_attempt>0);assert.equal(wf.path,'.github/workflows/theme-host-installer.yml');assert.equal(wf.id,run.workflow_id);
assert.equal(jobs.total_count,1);assert.equal(jobs.jobs[0].name,'native');assert.equal(jobs.jobs[0].conclusion,'success');assert.equal(jobs.jobs[0].steps.find(s=>s.name==='Native PHP install health rollback and guard tests')?.conclusion,'success');
const artifacts=api('actions/runs/'+id+'/artifacts?per_page=100');assert.ok(artifacts.total_count<=100);const matches=artifacts.artifacts.filter(a=>a.name==='theme-host-installer-'+run.head_sha);assert.equal(matches.length,1);const a=matches[0];assert.equal(a.expired,false);assert.match(a.digest,/^sha256:[a-f0-9]{64}$/);assert.ok(a.size_in_bytes>0&&a.size_in_bytes<2*1024*1024);assert.ok(Date.parse(a.created_at)>=Date.parse(run.run_started_at)&&Date.parse(a.created_at)<=Date.parse(run.updated_at));
const bytes=call('gh',['api','repos/'+repo+'/actions/artifacts/'+a.id+'/zip'],true);assert.equal('sha256:'+sha256(bytes),a.digest);
const allowed=['manifest.json','post-deploy-command.txt','test-result.json','theme-host-installer.php'],files={},reader=new ZipReader(new Uint8ArrayReader(Uint8Array.from(bytes)));let total=0;
try {for(const e of await reader.getEntries()){assert.ok(!e.directory&&allowed.includes(e.filename)&&!Object.hasOwn(files,e.filename));const type=(e.externalFileAttributes>>>16)&0o170000;assert.ok(type===0||type===0o100000);assert.ok(e.uncompressedSize<1024*1024);total+=e.uncompressedSize;assert.ok(total<2*1024*1024);files[e.filename]=Buffer.from(await e.getData(new Uint8ArrayWriter()));}}finally{await reader.close();}
assert.deepEqual(Object.keys(files).sort(),allowed);
const m=JSON.parse(files['manifest.json']),result=JSON.parse(files['test-result.json']),controller=call('git',['show',run.head_sha+':scripts/theme-host-installer.php'],true);
assert.equal(m.profile,'vibelab-theme-host-installer-v1');assert.equal(m.sourceSha,run.head_sha);assert.equal(m.productionAuthorized,false);assert.equal(m.applicationPayloadIncluded,false);assert.deepEqual(m.files,[{path:'theme-host-installer.php',bytes:controller.length,sha256:sha256(controller)}]);assert.ok(controller.equals(files['theme-host-installer.php']));
assert.equal(result.status,'PASS_THEME_HOST_INSTALLER');assert.equal(result.sourceSha,run.head_sha);assert.equal(result.controllerSha256,sha256(controller));assert.equal(result.fixtureOnly,true);assert.equal(result.hostingContacted,false);assert.equal(result.productionAuthorized,false);assert.ok(Number.isSafeInteger(result.checks)&&result.checks>=16&&result.cases.length===result.checks);assert.ok(files['post-deploy-command.txt'].toString().includes(sha256(controller)));
const latest=api('actions/runs/'+id);assert.equal(latest.head_sha,run.head_sha);assert.equal(latest.run_attempt,run.run_attempt);assert.equal(latest.conclusion,'success');
const directory=resolve('artifacts/theme-host-installer-ci',id+'-'+run.run_attempt);assertReviewPath(directory);
if(existsSync(directory)){for(const n of readdirSync(directory)){assert.ok(allowed.includes(n)||n==='verification.json');const s=lstatSync(join(directory,n));assert.ok(s.isFile()&&!s.isSymbolicLink()&&s.nlink===1);}for(const n of allowed)assert.ok(readFileSync(join(directory,n)).equals(files[n]),'Existing evidence differs');}
else {mkdirSync(directory,{recursive:true});for(const [n,b] of Object.entries(files))writeFileSync(join(directory,n),b,{flag:'wx'});}
const receipt={status:'VERIFIED_THEME_HOST_INSTALLER_ARTIFACT',sourceSha:run.head_sha,runUrl:run.html_url,attempt:run.run_attempt,archiveDigest:a.digest,controllerSha256:sha256(controller),checks:result.checks,directory,fixtureOnly:true,hostingContacted:false,productionAuthorized:false};
if(existsSync(join(directory,'verification.json'))){const prior=JSON.parse(readFileSync(join(directory,'verification.json')));assert.equal(prior.sourceSha,receipt.sourceSha);assert.equal(prior.archiveDigest,receipt.archiveDigest);}
writeFileSync(join(directory,'verification.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
