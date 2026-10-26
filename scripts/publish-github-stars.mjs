import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {verifyStarsRelease} from './github-stars-release.mjs';
import {sha256} from './release-lib.mjs';
import {verifyPipelineCi,assertPipelineCiRunCurrent,pipelineCiSummary} from './pipeline-ci-policy.mjs';
export function validateStarsPublication({directory,source,runId,api,now=Date.now()}){
 assert.match(source,/^[a-f0-9]{40}$/);const manifest=verifyStarsRelease(directory,source),ci=verifyPipelineCi({runId,sourceSha:source,api,now});
 const config=JSON.parse(readFileSync(join(directory,'environments.json'))).production;
 assert.deepEqual(config,{root:'/var/www/vhosts/vneconomics.com/store.vneconomics.com/',database:'vne35060_wp_kmqnf',home:'https://store.vneconomics.com',indexing:'1',payloadBranch:'release-production',repositoryDirectory:'/var/www/vhosts/vneconomics.com/git/vneconomics-store-production.git',inboxDirectory:'/var/www/vhosts/vneconomics.com/deploy-inbox/production',deploymentConfigured:true});
 const paths=[...manifest.files.map(f=>f.path),'manifest.json'].sort();assert.equal(paths.length,8);assert.ok(paths.every(p=>/^[a-z-]+\.(?:php|json|zip)$/.test(p)));
 return {manifest,ci,paths,manifestSha256:sha256(readFileSync(join(directory,'manifest.json')))};
}
function call(command,args,input){const p=spawnSync(command,args,{input,encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:8*1024*1024});assert.equal(p.status,0,p.stderr);return p.stdout.trim();}
async function main(){
 const [source,runId]=process.argv.slice(2),publish=process.argv.includes('--publish'),parentAt=process.argv.indexOf('--expected-parent'),expected=parentAt>=0?process.argv[parentAt+1]:null;
 assert.match(source??'',/^[a-f0-9]{40}$/);assert.match(runId??'',/^\d+$/);if(publish)assert.match(expected??'',/^[a-f0-9]{40}$/,'Explicit production parent required');
 const git=(args,input)=>call('git',args,input),api=path=>JSON.parse(call('gh',['api',path])),repo='johntroger/vneconomics-store',branch='release-production',out='docs/acceptance/U4-github-stars';mkdirSync(out,{recursive:true});
 assert.equal(git(['remote','get-url','origin']),'https://github.com/'+repo+'.git');
 const local=resolve('artifacts/pipeline',source),directory=resolve('artifacts/pipeline/github-stars-'+runId);const initial=validateStarsPublication({directory:local,source,runId,api});
 if(!existsSync(directory))call('gh',['run','download',runId,'--repo',repo,'--name',initial.ci.artifact.name,'--dir',directory]);
 const candidate=validateStarsPublication({directory,source,runId,api});for(const p of [...candidate.paths,'payload.zip'])assert.equal(sha256(readFileSync(join(directory,p))),sha256(readFileSync(join(local,p))),'GitHub/local differs '+p);
 const remote=()=>git(['ls-remote','origin','refs/heads/'+branch]).split(/\s+/)[0],parent=remote();assert.match(parent,/^[a-f0-9]{40}$/);
 const protectedRefs=()=>git(['ls-remote','origin','refs/heads/release-staging','refs/heads/release']),protectedBefore=protectedRefs();
 const proof={status:'VERIFIED_CI_ARTIFACT_PREVIEW',target:'production',sourceSha:source,profile:candidate.manifest.profile,manifestSha256:candidate.manifestSha256,runUrl:candidate.ci.run.html_url,ciGate:pipelineCiSummary(candidate.ci),previousRemote:parent,files:candidate.paths.map(path=>({path,sha256:sha256(readFileSync(join(directory,path)))})),downloadDirectory:directory,stagingSkippedByOwner:true,limits:['GitHub payload publication only; no Plesk/application/DB operation','No scheduler, live GitHub collector or content import']};
 if(!publish){writeFileSync(join(out,'artifact-verification.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));return;}
 assert.equal(parent,expected,'Production payload parent changed');git(['fetch','origin','refs/heads/'+branch]);
 const existing=git(['for-each-ref','--format=%(objectname)','refs/heads/'+branch]);assert.ok(!existing||existing===parent,'Unpublished local payload ref requires inspection');
 const entries=candidate.paths.map(p=>'100644 blob '+git(['hash-object','-w','--stdin'],readFileSync(join(directory,p)))+'\t'+p);
 const tree=git(['mktree'],entries.join('\n')+'\n'),commit=git(['commit-tree',tree,'-p',parent],`GitHub Stars code-only production payload\n\nSource ${source}\nCI ${runId}\nManifest SHA256 ${candidate.manifestSha256}\n`);
 assertPipelineCiRunCurrent(candidate.ci,api);assert.equal(remote(),parent,'Remote changed before publication');git(['update-ref','refs/heads/'+branch,commit,existing||'0'.repeat(40)]);git(['push','origin','refs/heads/'+branch+':refs/heads/'+branch]);assert.equal(remote(),commit);assert.equal(protectedRefs(),protectedBefore,'Historical/staging refs changed');
 writeFileSync(join(out,'publication-production.json'),JSON.stringify({...proof,status:'PUSHED_CI_VERIFIED_STARS_PAYLOAD',payloadSha:commit,tree},null,2)+'\n');console.log('PUSHED '+branch+' '+commit);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
