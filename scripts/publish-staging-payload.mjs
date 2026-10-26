import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {verifyPipeline} from './pipeline-release.mjs';
import {sha256} from './release-lib.mjs';
import {verifyPipelineCi,assertPipelineCiRunCurrent,pipelineCiSummary} from './pipeline-ci-policy.mjs';
const [directoryArg,source,runId]=process.argv.slice(2),publish=process.argv.includes('--publish'),directory=resolve(directoryArg||'');
assert.match(source??'',/^[a-f0-9]{40}$/);assert.match(runId??'',/^\d+$/);
// Flat name: the preserved historical branch `release` blocks `release/*` refs.
const branch='release-staging',repo='johntroger/vneconomics-store';
function call(cmd,args,input){const p=spawnSync(cmd,args,{input,encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:8*1024*1024});assert.equal(p.status,0,p.stderr);return p.stdout.trim();}
function git(args,input){return call('git',args,input);}
const manifest=verifyPipeline(directory,source),config=JSON.parse(readFileSync(join(directory,'environments.json')));
assert.equal(config.production.deploymentConfigured,false);assert.equal(config.staging.deploymentConfigured,true);
assert.equal(config.staging.payloadBranch,branch);
const api=path=>JSON.parse(call('gh',['api',path])),ciEvidence=verifyPipelineCi({runId,sourceSha:source,api}),run=ciEvidence.run;
assert.equal(git(['remote','get-url','origin']),'https://github.com/'+repo+'.git');
const files=[...manifest.files.map(f=>f.path),'manifest.json'].sort();assert.equal(files.length,10);
const paths=files.map(path=>({path,sha256:sha256(readFileSync(join(directory,path)))}));
if(!publish){console.log(JSON.stringify({status:'PREVIEW_ONLY_NO_REFS_CHANGED',branch,source,runId,files:paths},null,2));process.exit(0);}
const remote=git(['ls-remote','origin','refs/heads/'+branch]);const parent=remote?remote.split(/\s+/)[0]:null;if(parent)git(['fetch','origin','refs/heads/'+branch]);
const existing=git(['for-each-ref','--format=%(objectname)','refs/heads/'+branch]);assert.ok(!existing||existing===parent,'Unpublished local payload ref requires review');
const tree={};for(const path of files){const parts=path.split('/');let node=tree;for(const part of parts.slice(0,-1))node=node[part]??={};node[parts.at(-1)]=git(['hash-object','-w','--stdin'],readFileSync(join(directory,path)));}
function treeOid(node){const lines=Object.entries(node).sort(([a],[b])=>a.localeCompare(b)).map(([name,value])=>typeof value==='string'?'100644 blob '+value+'\t'+name:'040000 tree '+treeOid(value)+'\t'+name);return git(['mktree'],lines.join('\n')+'\n');}
const root=treeOid(tree),manifestHash=sha256(readFileSync(join(directory,'manifest.json')));
const commit=git(['commit-tree',root,...(parent?['-p',parent]:[])],`Staging payload from ${source}\n\nCI run ${runId}\nManifest SHA256 ${manifestHash}\n`);
const actual=git(['ls-tree','-r','--name-only',commit]).split('\n').sort();assert.deepEqual(actual,files);
assertPipelineCiRunCurrent(ciEvidence,api);git(['update-ref','refs/heads/'+branch,commit,existing||'0'.repeat(40)]);
git(['push','origin','refs/heads/'+branch+':refs/heads/'+branch]);
const received=JSON.parse(call('gh',['api','repos/'+repo+'/git/ref/heads/'+branch])).object.sha;assert.equal(received,commit);
mkdirSync('docs/acceptance/R4-staging',{recursive:true});writeFileSync('docs/acceptance/R4-staging/payload-publication.json',JSON.stringify({status:'PUSHED_CI_VERIFIED_STAGING_PAYLOAD',sourceSha:source,payloadSha:commit,tree:root,parent,branch,runUrl:run.html_url,ciGate:pipelineCiSummary(ciEvidence),manifestSha256:manifestHash,files:paths,limits:['GitHub source/payload publication only; not proof of Plesk receipt/application','No checkout or mutation of the source working tree','Production disabled; no force push or release/production ref']},null,2)+'\n');console.log('PUSHED '+branch+' '+commit+' from CI-verified '+source);
