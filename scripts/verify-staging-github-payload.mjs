import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {preparePipeline} from './pipeline-release.mjs';
import {git,sha256} from './release-lib.mjs';
const receipt=JSON.parse(readFileSync('docs/acceptance/R4-staging/payload-publication.json'));
assert.equal(receipt.branch,'release-staging');assert.match(receipt.payloadSha,/^[a-f0-9]{40}$/);
function api(path){const r=spawnSync('gh',['api','repos/johntroger/vneconomics-store/'+path],{encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
const remote=api('git/ref/heads/release-staging').object.sha;assert.equal(remote,receipt.payloadSha);
git(['fetch','origin','refs/heads/release-staging']);assert.equal(git(['rev-parse','FETCH_HEAD']).toString().trim(),remote);
const expected=preparePipeline(receipt.sourceSha).files,paths=git(['ls-tree','-r','--name-only',remote]).toString().trim().split('\n').sort();assert.deepEqual(paths,expected.map(f=>f.name).sort());
const compared=expected.map(f=>{const data=git(['show',remote+':'+f.name]);assert.ok(data.equals(f.data),'Remote payload differs '+f.name);return {path:f.name,bytes:data.length,sha256:sha256(data)};});
const release=api('git/ref/heads/release').object.sha;assert.equal(release,'4fe952ac7eec550d3125be9885fa6271aece2718');
writeFileSync('docs/acceptance/R4-staging/github-payload-verification.json',JSON.stringify({status:'PASS_GITHUB_PAYLOAD_READY_FOR_PLESK',observedAt:new Date().toISOString(),sourceSha:receipt.sourceSha,payloadSha:remote,manifestSha256:receipt.manifestSha256,files:compared,releaseUnchanged:release,limits:['Local fetch and GitHub read only; no Plesk pull or deployment','No claim that Plesk has received this payload yet']},null,2)+'\n');console.log('PASS10 GitHub payload files match source-derived bytes; awaiting Plesk receipt');
