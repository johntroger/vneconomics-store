import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {verifyPipelineCi,pipelineCiSummary} from './pipeline-ci-policy.mjs';
const [runId,sourceSha]=process.argv.slice(2);
const api=path=>{const r=spawnSync('gh',['api',path],{encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:8*1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);};
const e=verifyPipelineCi({runId,sourceSha,api}),out='docs/acceptance/PR1-ci-gate-fix';mkdirSync(out,{recursive:true});writeFileSync(out+'/verified-ci-run-'+runId+'.json',JSON.stringify({status:'PASS_REAL_GITHUB_CI_POLICY',observedAt:new Date().toISOString(),sourceSha,url:e.run.html_url,...pipelineCiSummary(e),requiredJob:{name:e.job.name,status:e.job.status,conclusion:e.job.conclusion,steps:e.job.steps.map(s=>({name:s.name,status:s.status,conclusion:s.conclusion}))},limits:['GitHub read-only metadata; no artifact download, payload publication or hosting mutation']},null,2)+'\n');console.log('PASS real GitHub CI policy: workflow/attempt/job/steps/artifact verified for '+sourceSha);
