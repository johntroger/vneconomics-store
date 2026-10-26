import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {verifyPipeline} from './pipeline-release.mjs';
import {sha256} from './release-lib.mjs';
import {verifyPipelineCi,assertPipelineCiRunCurrent,pipelineCiSummary} from './pipeline-ci-policy.mjs';
// R5 only: GitHub publication, never installation/import or a Plesk API call.
const [directoryArg,source,runId,target]=process.argv.slice(2),publish=process.argv.includes('--publish'),directory=resolve(directoryArg||'');
assert.match(source??'',/^[a-f0-9]{40}$/);assert.match(runId??'',/^\d+$/);assert.ok(['staging','production'].includes(target),'Explicit R5 target required');
const branch='release-'+target,repo='johntroger/vneconomics-store',out='docs/acceptance/R5-production';
function call(cmd,args,input){const p=spawnSync(cmd,args,{input,encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:8*1024*1024});assert.equal(p.status,0,p.stderr);return p.stdout.trim();}
function git(args,input){return call('git',args,input);}
const manifest=verifyPipeline(directory,source),config=JSON.parse(readFileSync(join(directory,'environments.json'))),manifestHash=sha256(readFileSync(join(directory,'manifest.json')));
for(const environment of ['staging','production']){const c=config[environment];assert.equal(c.deploymentConfigured,true);assert.equal(c.payloadBranch,'release-'+environment);assert.equal(c.repositoryDirectory,'/var/www/vhosts/vneconomics.com/git/vneconomics-store-'+environment+'.git');assert.equal(c.inboxDirectory,'/var/www/vhosts/vneconomics.com/deploy-inbox/'+environment);}
const api=path=>JSON.parse(call('gh',['api',path])),ciEvidence=verifyPipelineCi({runId,sourceSha:source,api}),ci=ciEvidence.run;
assert.equal(git(['remote','get-url','origin']),'https://github.com/'+repo+'.git');
const files=[...manifest.files.map(f=>f.path),'manifest.json'].sort();assert.equal(files.length,10);
const paths=files.map(path=>({path,sha256:sha256(readFileSync(join(directory,path)))}));
let commit=null;
if(target==='production'){
 const staged=JSON.parse(readFileSync(join(out,'publication-staging.json'))),proof=JSON.parse(readFileSync(join(out,'staging-adoption.json'))),backup=JSON.parse(readFileSync(join(out,'production-baseline-backup.json')));
 assert.equal(staged.sourceSha,source);assert.equal(staged.manifestSha256,manifestHash);assert.deepEqual(staged.files,paths);
 assert.equal(proof.status,'ADOPTED_EXISTING_BASELINE');assert.equal(proof.onlyNewReceiptOption,true);assert.equal(proof.postsMetaRuntimeUnchanged,true);assert.equal(proof.oldJournalsPreserved,true);assert.equal(proof.typedRows,130);assert.equal(proof.newReceiptKey,'vne_pipeline_'+manifestHash.slice(0,24));assert.equal(proof.result.journal.status,'complete');
 assert.deepEqual(proof.result.journal.approval,{payloadSha:staged.payloadSha,sourceSha:source,manifestSha256:manifestHash,baselineSha256:proof.fingerprint});assert.equal(proof.result.journal.environment,'staging');
 assert.equal(backup.root,config.production.root);assert.equal(backup.database,config.production.database);assert.equal(backup.indexing,'1');assert.equal(backup.canManage,true);assert.equal(backup.backup.crcErrors.length,0);assert.ok(backup.backup.files>14000);assert.match(backup.backup.sha256,/^[a-f0-9]{64}$/);
 const stageRemote=git(['ls-remote','origin','refs/heads/release-staging']).split(/\s+/)[0];assert.equal(stageRemote,staged.payloadSha);git(['fetch','origin','refs/heads/release-staging']);commit=staged.payloadSha;
 const actual=git(['ls-tree','-r','--name-only',commit]).split('\n').sort();assert.deepEqual(actual,files);
 for(const file of paths){assert.equal(git(['rev-parse',commit+':'+file.path]),git(['hash-object','--stdin'],readFileSync(join(directory,file.path))),file.path+' production must use exactly the staged blob');}
}
if(!publish){console.log(JSON.stringify({status:'PREVIEW_ONLY_NO_REFS_CHANGED',target,branch,source,runId,reuseStagedPayload:commit,files:paths},null,2));process.exit(0);}
const remote=git(['ls-remote','origin','refs/heads/'+branch]),parent=remote?remote.split(/\s+/)[0]:null;if(parent)git(['fetch','origin','refs/heads/'+branch]);
const existing=git(['for-each-ref','--format=%(objectname)','refs/heads/'+branch]);assert.ok(!existing||existing===parent,'Unpublished local payload ref requires review');
if(target==='staging'){
 const tree={};for(const path of files){const parts=path.split('/');let node=tree;for(const part of parts.slice(0,-1))node=node[part]??={};node[parts.at(-1)]=git(['hash-object','-w','--stdin'],readFileSync(join(directory,path)));}
 function treeOid(node){const lines=Object.entries(node).sort(([a],[b])=>a.localeCompare(b)).map(([name,value])=>typeof value==='string'?'100644 blob '+value+'\t'+name:'040000 tree '+treeOid(value)+'\t'+name);return git(['mktree'],lines.join('\n')+'\n');}
 commit=git(['commit-tree',treeOid(tree),...(parent?['-p',parent]:[])],`R5 payload from ${source}\n\nCI run ${runId}\nManifest SHA256 ${manifestHash}\n`);
}else if(parent){git(['merge-base','--is-ancestor',parent,commit]);}
assertPipelineCiRunCurrent(ciEvidence,api);git(['update-ref','refs/heads/'+branch,commit,existing||'0'.repeat(40)]);git(['push','origin','refs/heads/'+branch+':refs/heads/'+branch]);
const received=JSON.parse(call('gh',['api','repos/'+repo+'/git/ref/heads/'+branch])).object.sha;assert.equal(received,commit);
mkdirSync(out,{recursive:true});writeFileSync(join(out,'publication-'+target+'.json'),JSON.stringify({status:'PUSHED_CI_VERIFIED_R5_PAYLOAD',target,sourceSha:source,payloadSha:commit,tree:git(['rev-parse',commit+'^{tree}']),previousRemote:parent,branch,runUrl:ci.html_url,ciGate:pipelineCiSummary(ciEvidence),manifestSha256:manifestHash,files:paths,limits:['GitHub publication only; Plesk receipt and adoption require independent verification','Production reuses the exact staging-tested payload commit, not a rebuild','No checkout, force push, application installation, content import or DB restore']},null,2)+'\n');console.log('PUSHED '+branch+' '+commit+' from CI-verified '+source);
