import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {writePipeline} from './pipeline-release.mjs';
import {resolveRef,git} from './release-lib.mjs';
const out=resolve('docs/acceptance/PR1-premerge-2026-10-26');mkdirSync(out,{recursive:true});mkdirSync('tmp/tests',{recursive:true});
// Replay the originally reviewed publisher, never assume the current source remains vulnerable.
const temporary=mkdtempSync(resolve('tmp/tests/pr1-ci-gate-')),candidate=join(temporary,'candidate'),source=resolveRef('6964a4c345112f5088af1d9eae79f5a2c067d47f');writePipeline(source,candidate);
const publisher=join(temporary,'reviewed-publisher.mjs');writeFileSync(publisher,git(['show',source+':scripts/publish-r5-payload.mjs']).toString().replace("'./pipeline-release.mjs'",JSON.stringify(pathToFileURL(resolve('scripts/pipeline-release.mjs')).href)).replace("'./release-lib.mjs'",JSON.stringify(pathToFileURL(resolve('scripts/release-lib.mjs')).href)));
const before=git(['for-each-ref','--format=%(refname) %(objectname)']).toString();
const preload=join(temporary,'mock-ci.cjs');writeFileSync(preload,`
const cp=require('node:child_process');const fs=require('node:fs');const original=cp.spawnSync;
cp.spawnSync=function(command,args,options){
 if(command==='gh'){if(args[0]!=='api'||!args[1].endsWith('/actions/runs/123456789'))throw Error('Unexpected remote call blocked');return {status:0,stdout:fs.readFileSync(process.env.VNE_PR1_MOCK_RUN,'utf8'),stderr:''};}
 if(command==='git'){if(!['rev-parse','show','ls-tree','for-each-ref','remote','cat-file','log','status','diff'].includes(args[0])||(args[0]==='remote'&&args[1]!=='get-url'))throw Error('Git mutation/network blocked in reproduction');return original(command,args,options);}
 throw Error('Unexpected subprocess blocked');
};require('node:module').syncBuiltinESMExports();
`);
const cases=[];
for(const [name,patch,expectedAccepted] of [
 ['expected workflow success',{path:'.github/workflows/pipeline-check.yml',conclusion:'success'},true],
 ['expected workflow failure',{path:'.github/workflows/pipeline-check.yml',conclusion:'failure'},false],
 ['historical-only workflow success',{path:'.github/workflows/release-package-check.yml',conclusion:'success'},true],
 ['unrelated workflow success',{path:'.github/workflows/unrelated.yml',conclusion:'success'},true]
]){
 const run={head_sha:source,status:'completed',event:'workflow_dispatch',html_url:'https://example.invalid/mock-only',...patch},path=join(temporary,'run.json');writeFileSync(path,JSON.stringify(run));
 const result=spawnSync(process.execPath,['--require',preload,publisher,candidate,source,'123456789','staging'],{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:2*1024*1024,env:{...process.env,VNE_PR1_MOCK_RUN:path}});
 const accepted=result.status===0;assert.equal(accepted,expectedAccepted,name+' unexpected reproduction result '+result.stderr);
 const preview=accepted?JSON.parse(result.stdout):null;if(accepted)assert.equal(preview.status,'PREVIEW_ONLY_NO_REFS_CHANGED');
 cases.push({name,mockedRun:run,exitCode:result.status,accepted,previewStatus:preview?.status??null,error:accepted?null:result.stderr.slice(0,650)});
}
assert.equal(git(['for-each-ref','--format=%(refname) %(objectname)']).toString(),before,'No refs may change');
writeFileSync(join(out,'ci-gate-reproduction.json'),JSON.stringify({status:'REPRODUCED_UNRELATED_CI_ACCEPTED',reviewedSource:source,cases,realNetworkCalls:0,refMutations:0,publishFlagUsed:false,limits:['Actual publisher CLI with actual source-derived candidate; only gh API response mocked','Preview mode; Git mutation/network commands blocked by preload','No hosting, database, mail, AI, workflow dispatch or remote publication']},null,2)+'\n');
console.log('REPRODUCED: historical/unrelated successful workflows satisfy publisher gate; failing expected workflow rejected. No network/ref writes.');
