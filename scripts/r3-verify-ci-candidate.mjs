import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {verifyPipeline} from './pipeline-release.mjs';
import {sha256,git} from './release-lib.mjs';
const [runId,source]=process.argv.slice(2);assert.match(runId??'',/^\d+$/);assert.match(source??'',/^[a-f0-9]{40}$/);
const repo='repos/johntroger/vneconomics-store',out=resolve('docs/acceptance/R3-github-ci');mkdirSync(out,{recursive:true});
function gh(args){const p=spawnSync('gh',args,{encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:8*1024*1024});assert.equal(p.status,0,p.stderr);return p.stdout;}
function api(path){return JSON.parse(gh(['api',path]));}
const run=api(repo+'/actions/runs/'+runId);assert.equal(run.conclusion,'success');assert.equal(run.head_sha,source);
const artifacts=api(repo+'/actions/runs/'+runId+'/artifacts').artifacts;
const artifact=artifacts.find(a=>a.name==='pipeline-'+source);assert.ok(artifact&&!artifact.expired,'Successful candidate artifact required');
const directory=resolve('artifacts/pipeline/github-'+runId);assert.ok(!existsSync(directory),'Keep downloaded artifact immutable; select a fresh output');
gh(['run','download',runId,'--repo','johntroger/vneconomics-store','--name',artifact.name,'--dir',directory]);
verifyPipeline(directory,source);const local=resolve('artifacts/pipeline',source);verifyPipeline(local,source);
const files=readdirSync(directory,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>join(e.parentPath,e.name).slice(directory.length+1).replaceAll('\\','/')).sort();
const compared=files.map(path=>{const digest=sha256(readFileSync(join(directory,path)));assert.equal(digest,sha256(readFileSync(join(local,path))),path+' GitHub/local differs');return {path,sha256:digest};});
const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'))),baseline=JSON.parse(readFileSync('artifacts/pipeline/21b26c9adf41343c9dfa2fe1cec442ba3fbc1e0c/manifest.json'));
for(const old of baseline.files)assert.equal(manifest.files.find(f=>f.path===old.path)?.sha256,old.sha256,'R2 payload bytes changed '+old.path);
const release=api(repo+'/git/ref/heads/release').object.sha;assert.equal(release,'4fe952ac7eec550d3125be9885fa6271aece2718');
const sourceRemote=api(repo+'/git/ref/heads/codex/deployment-pipeline').object.sha;assert.equal(sourceRemote,source);assert.equal(git(['rev-parse','HEAD']).toString().trim(),source);
const jobs=api(repo+'/actions/runs/'+runId+'/jobs').jobs.map(j=>({name:j.name,conclusion:j.conclusion,runner:j.runner_name,labels:j.labels,steps:j.steps.map(s=>({name:s.name,conclusion:s.conclusion}))}));
writeFileSync(join(out,'ci-run.json'),JSON.stringify({id:run.id,url:run.html_url,event:run.event,headSha:run.head_sha,status:run.status,conclusion:run.conclusion,createdAt:run.created_at,updatedAt:run.updated_at,jobs,artifact:{id:artifact.id,name:artifact.name,bytes:artifact.size_in_bytes,digest:artifact.digest,expiresAt:artifact.expires_at}},null,2)+'\n');
writeFileSync(join(out,'candidate-comparison.json'),JSON.stringify({status:'PASS_GITHUB_LOCAL_BYTE_MATCH',observedAt:new Date().toISOString(),sourceSha:source,runUrl:run.html_url,manifestSha256:sha256(readFileSync(join(directory,'manifest.json'))),files:compared,unchangedR2PayloadFiles:baseline.files.length,themeFiles:manifest.components.theme.files.length,pluginFiles:manifest.components.plugin.files.length,remoteReleaseUnchanged:release,localDirectory:local,downloadDirectory:directory,limits:['No Plesk install/pull/configuration change performed','Artifact retention1day on GitHub; immutable downloaded/local candidate retained','Native/UI R2 evidence applies to unchanged application/receiver bytes; CI executes package/S14 checks only']},null,2)+'\n');
const log=gh(['run','view',runId,'--repo','johntroger/vneconomics-store','--log']);writeFileSync(join(out,'ci-check-summary.txt'),log.split('\n').filter(l=>/PASS |Temporary test data|Node\.js|node --version|Version 22/.test(l)).join('\n')+'\n');
console.log('PASS '+compared.length+' GitHub/local files match;9 payload files unchanged from R2; remote release unchanged');
