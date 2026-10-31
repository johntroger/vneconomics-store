// GitHub CI artifact -> candidate Git branch only. Never modifies release-production or hosting.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync,lstatSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {ZipReader,Uint8ArrayReader,Uint8ArrayWriter} from '@zip.js/zip.js';
import {sha256} from './release-lib.mjs';
import {hex,prepareThemeRelease,verifyThemeDirectory,themePayloadNames,assertReviewPath} from './theme-release.mjs';
const repository='johntroger/vneconomics-store';
function call(command,args,{input,binary=false}={}){const r=spawnSync(command,args,{input,encoding:binary?null:'utf8',windowsHide:true,timeout:120000,maxBuffer:48*1024*1024});assert.equal(r.status,0,r.stderr?.toString()||command+' failed');return binary?r.stdout:r.stdout.trim();}
export function validateThemeCi(run,workflow,jobs,artifacts){
 assert.equal(run.repository?.full_name,repository);assert.equal(run.head_repository?.full_name,repository);assert.ok(hex(run.head_sha,40));assert.equal(run.status,'completed');assert.equal(run.conclusion,'success');assert.ok(['pull_request','workflow_dispatch'].includes(run.event));assert.ok(Number.isSafeInteger(run.run_attempt)&&run.run_attempt>0);
 assert.equal(workflow.path,'.github/workflows/theme-release.yml');assert.equal(workflow.id,run.workflow_id);assert.equal(jobs.total_count,1);const job=jobs.jobs[0];assert.equal(job.name,'package');assert.equal(job.conclusion,'success');for(const name of ['Check publisher and native install rollback','Upload review package'])assert.equal(job.steps.find(s=>s.name===name)?.conclusion,'success');
 assert.ok(artifacts.total_count<=100);const matches=artifacts.artifacts.filter(a=>a.name==='theme-release-'+run.head_sha);assert.equal(matches.length,1);const artifact=matches[0];assert.equal(artifact.expired,false);assert.match(artifact.digest??'',/^sha256:[a-f0-9]{64}$/);assert.ok(artifact.size_in_bytes>0&&artifact.size_in_bytes<=32*1024*1024);assert.ok(Date.parse(artifact.created_at)>=Date.parse(run.run_started_at)&&Date.parse(artifact.created_at)<=Date.parse(run.updated_at));return artifact;
}
export async function decodeThemeArtifact(bytes,digest){
 assert.equal('sha256:'+sha256(bytes),digest,'GitHub archive digest differs');const reader=new ZipReader(new Uint8ArrayReader(Uint8Array.from(bytes)));const files={};let total=0;
 try{for(const entry of await reader.getEntries()){assert.ok(!entry.directory&&[...themePayloadNames,'native-proof.json','review.json','test-result.json'].includes(entry.filename)&&!Object.hasOwn(files,entry.filename),'Unknown/duplicate artifact entry');const type=(entry.externalFileAttributes>>>16)&0o170000;assert.ok(type===0||type===0o100000,'Nonregular archive entry');assert.ok(entry.uncompressedSize<=10*1024*1024);total+=entry.uncompressedSize;assert.ok(total<=32*1024*1024);files[entry.filename]=Buffer.from(await entry.getData(new Uint8ArrayWriter()));}}finally{await reader.close();}return files;
}
async function main(){
 const [mode,runId,...extra]=process.argv.slice(2);assert.ok(['review','candidate'].includes(mode)&&typeof runId==='string'&&runId.length>0&&runId.length<=20&&!/[^0-9]/.test(runId)&&extra.length===0,'Use review|candidate <CI run ID>');
 const git=(args,input)=>call('git',args,{input}),api=path=>JSON.parse(call('gh',['api','repos/'+repository+'/'+path]));assert.equal(git(['remote','get-url','origin']),'https://github.com/'+repository+'.git');
 const run=api('actions/runs/'+runId),workflow=api('actions/workflows/'+run.workflow_id),jobs=api('actions/runs/'+runId+'/jobs?filter=latest&per_page=100'),artifacts=api('actions/runs/'+runId+'/artifacts?per_page=100'),artifact=validateThemeCi(run,workflow,jobs,artifacts);
 const archive=call('gh',['api','repos/'+repository+'/actions/artifacts/'+artifact.id+'/zip'],{binary:true}),files=await decodeThemeArtifact(archive,artifact.digest),directory=resolve('artifacts/theme-ci',runId+'-'+run.run_attempt);
 assertReviewPath(directory);
 if(!existsSync(directory)){mkdirSync(directory,{recursive:true});for(const [name,b] of Object.entries(files))writeFileSync(join(directory,name),b,{flag:'wx'});}else{assert.ok(lstatSync(directory).isDirectory());for(const name of readdirSync(directory)){assert.ok(Object.hasOwn(files,name)||name==='verification.json','Unknown existing review file');const s=lstatSync(join(directory,name));assert.ok(s.isFile()&&!s.isSymbolicLink()&&s.nlink===1,'Unsafe review file');}for(const [name,b] of Object.entries(files))assert.ok(readFileSync(join(directory,name)).equals(b),'Existing artifact differs; inspect');}
 if(existsSync(join(directory,'verification.json'))){const prior=JSON.parse(readFileSync(join(directory,'verification.json')));assert.equal(prior.sourceSha,run.head_sha);assert.equal(prior.artifactDigest,artifact.digest);}
 const review=JSON.parse(readFileSync(join(directory,'review.json')));assert.equal(review.sourceSha,run.head_sha);
 if(review.status==='NO_APPLICATION_CHANGE'){assert.equal(mode,'review','No app change: no candidate may be published');const receipt={status:'REVIEW_ONLY_NO_APP_CHANGE',sourceSha:run.head_sha,runUrl:run.html_url,artifactDigest:artifact.digest,directory,deployAuthorized:false};writeFileSync(join(directory,'verification.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));return;}
 const manifest=verifyThemeDirectory(directory);assert.equal(manifest.sourceSha,run.head_sha);
 const mainSha=git(['ls-remote','origin','refs/heads/main']).split(/\s+/)[0];assert.ok(hex(mainSha,40));git(['fetch','--quiet','origin',mainSha,run.head_sha]);
 const controls=git(['diff','--name-only',mainSha,run.head_sha]).split(/\r?\n/).filter(Boolean).filter(p=>!p.startsWith('themes/vibelab-v2/')&&!/^docs\/.*\.md$/.test(p)&&p!=='README.md');assert.deepEqual(controls,[],'Publisher/control changes must first be reviewed and merged on main');
 const remote=()=>git(['ls-remote','origin','refs/heads/release-production']).split(/\s+/)[0],baseline=JSON.parse(git(['show',mainSha+':deploy/theme-release-baseline.json']));assert.equal(remote(),baseline.payloadSha,'Production baseline moved');git(['fetch','--quiet','origin',baseline.payloadSha]);
 const expected=prepareThemeRelease(run.head_sha,baseline);for(const name of themePayloadNames)assert.ok(expected.buffers[name].equals(files[name]),'CI/Git bytes differ: '+name);assert.equal(remote(),manifest.expectedProductionParent,'Production baseline moved');
 const receipt={status:'VERIFIED_THEME_CANDIDATE_ARTIFACT',sourceSha:run.head_sha,runUrl:run.html_url,runAttempt:run.run_attempt,artifactDigest:artifact.digest,manifestSha256:sha256(files['manifest.json']),expectedParent:manifest.expectedProductionParent,profile:manifest.profile,directory,deployAuthorized:false};
 if(mode==='candidate'){
  const latest=api('actions/runs/'+runId);assert.equal(latest.run_attempt,run.run_attempt);assert.equal(latest.conclusion,'success');assert.equal(latest.head_sha,run.head_sha);assert.equal(remote(),manifest.expectedProductionParent);
  const branch='candidate-production/'+run.head_sha,prior=git(['ls-remote','origin','refs/heads/'+branch]);assert.equal(prior,'','Candidate already exists; inspect rather than overwrite');
  const post=(path,data)=>JSON.parse(call('gh',['api','--method','POST','repos/'+repository+'/'+path,'--input','-'],{input:JSON.stringify(data)}));
  const tree=post('git/trees',{tree:themePayloadNames.map(name=>({path:name,mode:'100644',type:'blob',sha:post('git/blobs',{content:files[name].toString('base64'),encoding:'base64'}).sha}))}).sha;
  const sha=post('git/commits',{message:'Theme candidate from verified GitHub CI '+runId,tree,parents:[manifest.expectedProductionParent]}).sha;assert.equal(remote(),manifest.expectedProductionParent,'Production moved before candidate ref creation');
  // GitHub create-ref fails if the branch exists; it never updates/forces a ref.
  post('git/refs',{ref:'refs/heads/'+branch,sha});assert.equal(git(['ls-remote','origin','refs/heads/'+branch]).split(/\s+/)[0],sha);receipt.status='PUBLISHED_THEME_CANDIDATE_ONLY';receipt.payloadSha=sha;receipt.candidateBranch=branch;
 }
 writeFileSync(join(directory,'verification.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
