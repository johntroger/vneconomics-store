import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sha256,git} from './release-lib.mjs';
function api(path){const r=spawnSync('gh',['api',path],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,'GitHub read failed');return JSON.parse(r.stdout);}
const repo='repos/johntroger/vneconomics-store',old=JSON.parse(readFileSync('docs/acceptance/R1-pipeline-audit/github-hooks-redacted.json'));
const hooks=api(repo+'/hooks');assert.equal(hooks.length,1,'Unexpected hook requires review');const hook=hooks[0];assert.equal(hook.id,old.id);assert.equal(hook.active,true);assert.deepEqual(hook.events,['push']);assert.equal(hook.config.insecure_ssl,'0');assert.equal(sha256(Buffer.from(hook.config.url)),old.webhookSha256);
const release=api(repo+'/git/ref/heads/release').object.sha;assert.equal(release,'4fe952ac7eec550d3125be9885fa6271aece2718');
const heads=api(repo+'/git/matching-refs/heads/').map(r=>({ref:r.ref,sha:r.object.sha}));
mkdirSync('docs/acceptance/R3-github-ci',{recursive:true});
const report={status:'PASS_PRE_PUSH_READ_ONLY',observedAt:new Date().toISOString(),localHead:git(['rev-parse','HEAD']).toString().trim(),hook:{id:hook.id,active:hook.active,events:hook.events,sha256:old.webhookSha256,sslVerification:true},heads,pleskObserved:{repository:'git@github.com:johntroger/vneconomics-store.git',branch:'release',lastCommit:'4fe952a',deploymentDirectory:'/store.vneconomics.com/codex-deploy-check',mode:'Automatic',postDeployActions:false,method:'Read Git card and repository settings in authenticated Plesk UI; Cancel without Apply'},limits:['No webhook ping or hosting write','Legacy billing API unavailable with current token scope; no added scope, budget or paid runner configured','Only existing GitHub Actions permissions/runner allowance; job timeout10m, artifact retention1day']};
writeFileSync('docs/acceptance/R3-github-ci/preflight.json',JSON.stringify(report,null,2)+'\n');console.log('PASS GitHub hook/ref and observed Plesk branch/target match R1; no secret URL persisted');
