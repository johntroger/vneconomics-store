import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {writePipeline,preparePipeline} from './pipeline-release.mjs';
import {resolveRef,git,sha256} from './release-lib.mjs';
import {REQUIRED_PIPELINE_STEPS} from './pipeline-ci-policy.mjs';
import mock from './fixtures/pipeline-ci-api.cjs';
const out='docs/acceptance/PR1-ci-gate-fix';mkdirSync(out,{recursive:true});mkdirSync('tmp/tests',{recursive:true});const temporary=mkdtempSync(resolve('tmp/tests/ci-policy-cli-'));
const source=resolveRef('HEAD'),legacy='f587eea20526f32294a8826949d7407337040ec6',candidate=join(temporary,'candidate'),old=join(temporary,'legacy');writePipeline(source,candidate);writePipeline(legacy,old);
const before=git(['for-each-ref','--format=%(refname) %(objectname)']).toString(),inventory=JSON.parse(readFileSync('docs/acceptance/R6-closeout/r5-evidence-inventory.json'));
const preload=join(temporary,'api.cjs');writeFileSync(preload,`
const cp=require('node:child_process'),fs=require('node:fs'),original=cp.spawnSync,api=require(${JSON.stringify(resolve('scripts/fixtures/pipeline-ci-api.cjs'))}).apiFor(JSON.parse(fs.readFileSync(process.env.VNE_CI_MOCK_FILE,'utf8')));
cp.spawnSync=function(command,args,options){
 if(command==='gh'){if(args[0]==='api')return {status:0,stdout:JSON.stringify(api(args[1])),stderr:''};if(args[0]==='run'&&args[1]==='download')return {status:71,stdout:'',stderr:'GUARD_VALIDATED_DOWNLOAD_BOUNDARY'};throw Error('Unexpected remote command blocked');}
 if(command==='git'){if(!['rev-parse','show','ls-tree','for-each-ref','remote','cat-file','log','status','diff'].includes(args[0])||(args[0]==='remote'&&args[1]!=='get-url'))throw Error('Git mutation/network blocked');if(args[0]==='remote')return {status:0,stdout:'https://github.com/johntroger/vneconomics-store.git\\n',stderr:''};return original(command,args,options);}
 throw Error('Unexpected subprocess blocked');
};require('node:module').syncBuiltinESMExports();
`);
const cases=[];
for(const [name,script,args,sha,change,expect] of [
 ['R5 valid preview','publish-r5-payload.mjs',[candidate,source,'123456789','staging'],source,()=>{},'preview'],
 ['R5 wrong workflow rejected','publish-r5-payload.mjs',[candidate,source,'123456789','staging'],source,f=>f.run.path='.github/workflows/release-package-check.yml','reject'],
 ['R5 skipped test rejected','publish-r5-payload.mjs',[candidate,source,'123456789','staging'],source,f=>f.jobs[0].steps[0].conclusion='skipped','reject'],
 ['R5 stale artifact rejected','publish-r5-payload.mjs',[candidate,source,'123456789','staging'],source,f=>f.artifacts[0].created_at=new Date(f.now-60000).toISOString(),'reject'],
 ['R4 valid preview','publish-staging-payload.mjs',[old,legacy,'123456789'],legacy,()=>{},'preview'],
 ['R4 wrong workflow rejected','publish-staging-payload.mjs',[old,legacy,'123456789'],legacy,f=>f.run.path='.github/workflows/release-package-check.yml','reject'],
 ['artifact verifier valid gate','r3-verify-ci-candidate.mjs',['123456789',source,'--r5'],source,()=>{},'download-boundary'],
 ['artifact verifier wrong workflow rejected','r3-verify-ci-candidate.mjs',['123456789',source,'--r5'],source,f=>f.run.path='.github/workflows/release-package-check.yml','reject'],
 ['artifact verifier missing upload rejected','r3-verify-ci-candidate.mjs',['123456789',source,'--r5'],source,f=>f.jobs[0].steps.pop(),'reject']
]){
 const f=mock.fixture(sha,REQUIRED_PIPELINE_STEPS);change(f);const file=join(temporary,'response.json');writeFileSync(file,JSON.stringify(f));
 assert.ok(!existsSync('artifacts/pipeline/github-123456789'),'Synthetic download path must not pre-exist');
 const r=spawnSync(process.execPath,['--require',preload,'scripts/'+script,...args],{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:2*1024*1024,env:{...process.env,VNE_CI_MOCK_FILE:file}});
 if(expect==='preview'){assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).status,'PREVIEW_ONLY_NO_REFS_CHANGED');}
 else{assert.notEqual(r.status,0,name);assert.equal(r.stderr.includes('GUARD_VALIDATED_DOWNLOAD_BOUNDARY'),expect==='download-boundary',name+' must stop at the expected boundary');if(expect==='reject')assert.match(r.stderr,/Unexpected CI workflow path|Required step failed\/skipped|Artifact is not from|Missing\/ambiguous required step/,name+' relevant guard must reject');}
 cases.push({name,exitCode:r.status,expectedBoundary:expect});
}
assert.equal(git(['for-each-ref','--format=%(refname) %(objectname)']).toString(),before,'No ref changes');for(const f of inventory.files)assert.equal(sha256(readFileSync(f.path)),f.sha256,'Original R5 evidence preserved '+f.path);
const baseline=preparePipeline('4266b71990702d87969a847e95d9c39933cb05a4'),current=preparePipeline('HEAD');for(const f of baseline.files.filter(f=>f.name!=='manifest.json'))assert.ok(current.files.find(c=>c.name===f.name)?.data.equals(f.data),'Application payload changed '+f.name);
writeFileSync(out+'/cli-tests.json',JSON.stringify({status:'PASS_PIPELINE_CI_CLI',testedSource:source,cases,unchangedPayloadFiles:9,preservedR5EvidenceFiles:inventory.files.length,networkCalls:0,refMutations:0,downloadPerformed:false,limits:['Actual publisher/verifier CLIs; GitHub metadata and approved-origin response mocked (CI checkout URL can omit .git)','Preview only; download stopped at explicit mock boundary; no publication/hosting/DB/mail/AI']},null,2)+'\n');console.log('PASS pipeline CI CLI '+cases.length+' cases;9 payload files and50R5 evidence unchanged');
