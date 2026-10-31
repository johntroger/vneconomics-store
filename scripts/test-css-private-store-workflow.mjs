import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';
assert.equal(process.argv.length,2,'No source/host/key overrides');
const path='.github/workflows/css-private-store-check.yml',text=readFileSync(path,'utf8').replace(/\r\n/g,'\n');
const input="const s=process.env.SOURCE_SHA||''; if(s.length!==40||!/^[a-f0-9]+$/.test(s)) throw Error('Exact source SHA required')",checkout="const s=require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(); if(s!==process.env.SOURCE_SHA) throw Error('Checkout SHA differs'); console.log('SOURCE_SHA='+s)",image='php@sha256:d07db734bd519927010bbc66fa42c0d6f0207a4ee8419998df40931b884a5919';
function validate(raw){
 const v=raw.replace(/\r\n/g,'\n');assert.deepEqual(v.split('\n').filter(l=>/^\S/.test(l)).map(l=>l.split(':')[0]),['name','on','permissions','concurrency','jobs']);
 const trigger=v.match(/^on:\n([\s\S]*?)(?=^\S)/m)?.[1];assert.ok(trigger);assert.deepEqual([...trigger.matchAll(/^  ([a-z_]+):/gm)].map(m=>m[1]),['pull_request','workflow_dispatch']);
 for(const dep of ['release-tools/r6-css-adapter.php','test-css-private-store*.mjs','scripts/fixtures/css-private-store.php','scripts/run-clean.mjs','package*.json','css-private-store-check.yml'])assert.ok(trigger.includes(dep));
 assert.match(v,/^permissions:\n  contents: read\n/m);assert.equal((v.match(/permissions:/g)||[]).length,1);assert.doesNotMatch(v,/\bsecrets\b|contents: write|persist-credentials: true|continue-on-error:|git push|environment:|\bif:|container:|services:/);
 assert.match(v,/group: css-private-store-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/);assert.match(v,/cancel-in-progress: true/);
 assert.deepEqual([...v.split('jobs:\n')[1].matchAll(/^  ([a-z-]+):$/gm)].map(m=>m[1]),['store']);assert.match(v,/runs-on: ubuntu-24\.04\n    timeout-minutes: 10/);
 assert.match(v,/SOURCE_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
 assert.deepEqual([...v.matchAll(/^\s+(?:- )?uses: (.+)$/gm)].map(m=>m[1]),['actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1']);
 assert.match(v,/ref: \$\{\{ env\.SOURCE_SHA \}\}\n          fetch-depth: 1\n          persist-credentials: false/);assert.match(v,/node-version: '22'/);
 assert.deepEqual([...v.matchAll(/^        run: (.+)$/gm)].map(m=>m[1]),['node -e "'+input+'"','node -e "'+checkout+'"','npm ci --ignore-scripts','npm run test:css-private-store-workflow','docker --context default pull '+image,'npm run test:css-private-store']);
 assert.equal((v.match(/^\s+(?:- )?run:/gm)||[]).length,6);assert.ok(v.indexOf('name: Validate exact source SHA')<v.indexOf('uses: actions/checkout@'));assert.ok(v.indexOf('name: Verify checkout source')<v.indexOf('run: npm ci'));
}
validate(text);validate(text.replace(/\n/g,'\r\n'));let rejected=0;
for(const change of [v=>v.replace('pull_request:','push:'),v=>v.replace('contents: read','contents: write'),v=>v.replace('persist-credentials: false','persist-credentials: true'),v=>v.replace('ref: ${{ env.SOURCE_SHA }}','ref: main'),v=>v.replace('checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','checkout@v7'),v=>v.replace('fetch-depth: 1','fetch-depth: 0'),v=>v.replace('ubuntu-24.04','ubuntu-latest'),v=>v.replace('timeout-minutes: 10','timeout-minutes: 1'),v=>v.replace('s.length!==40||',''),v=>v.replace('s!==process.env.SOURCE_SHA','false'),v=>v.replace('npm ci --ignore-scripts','npm ci'),v=>v.replace(image,'php:8.3-cli'),v=>v.replace('docker --context default pull','docker --context production pull'),v=>v.replace('npm run test:css-private-store\n','npm run build:candidate\n'),v=>v.replace('cancel-in-progress: true','cancel-in-progress: false'),v=>v+'"on":\n  push:\n']){
 const bad=change(text);assert.notEqual(bad,text);for(const eol of ['\n','\r\n']){assert.throws(()=>validate(bad.replace(/\n/g,eol)));rejected++;}
}
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true});assert.equal(head.status,0);const sha=head.stdout.trim();let guards=0;
for(const [code,cases] of [[input,[[sha,true],['main',false],[sha.toUpperCase(),false],[sha+'\n',false],[sha+';console.log(1)',false]]],[checkout,[[sha,true],['0'.repeat(40),false]]]])for(const [s,valid] of cases){const r=spawnSync(process.execPath,['-e',code],{env:{...process.env,SOURCE_SHA:s},encoding:'utf8',windowsHide:true});assert.equal(r.status===0,valid);guards++;}
console.log(JSON.stringify({status:'PASS_CSS_PRIVATE_STORE_WORKFLOW',rejectedMutations:rejected,executedNodeGuards:guards,hostingTouched:false,sourceHashes:Object.fromEntries([path,'scripts/test-css-private-store-workflow.mjs'].map(p=>[p,sha256(readFileSync(p))]))}));
