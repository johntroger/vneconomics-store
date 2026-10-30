import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';
assert.equal(process.argv.length,2,'No source/key/host overrides');
const path='.github/workflows/key-client-check.yml',text=readFileSync(path,'utf8').replace(/\r\n/g,'\n');
const inputCode="const s=process.env.SOURCE_SHA||''; if(s.length!==40||!/^[a-f0-9]+$/.test(s)) throw Error('Exact source SHA required')";
const checkoutCode="const s=require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(); if(s!==process.env.SOURCE_SHA) throw Error('Checkout SHA differs'); console.log('SOURCE_SHA='+s)";
function validate(raw){
 const value=raw.replace(/\r\n/g,'\n');assert.deepEqual(value.split('\n').filter(l=>/^\S/.test(l)).map(l=>l.split(':')[0]),['name','on','permissions','concurrency','jobs']);
 const trigger=value.match(/^on:\n([\s\S]*?)(?=^\S)/m)?.[1];assert.ok(trigger);assert.deepEqual([...trigger.matchAll(/^  ([a-z_]+):/gm)].map(m=>m[1]),['pull_request','workflow_dispatch']);assert.match(trigger,/pull_request:\n    paths:/);
 for(const dependency of ['r6-css-private-key.mjs','r6-css-key-lifecycle.mjs','test-key-client*.mjs','test-r726-private-key.mjs','test-r729-key-lifecycle.mjs','package*.json','key-client-check.yml'])assert.ok(trigger.includes(dependency));
 assert.match(value,/^permissions:\n  contents: read\n/m);assert.equal((value.match(/permissions:/g)||[]).length,1);assert.doesNotMatch(value,/\bsecrets\b|contents: write|persist-credentials: true|continue-on-error:|git push|environment:|\bif:|container:|services:/);
 assert.match(value,/group: key-client-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/);assert.match(value,/cancel-in-progress: true/);
 assert.match(value,/fail-fast: false\n      matrix:\n        os: \[windows-2025, ubuntu-24\.04\]\n    runs-on: \$\{\{ matrix\.os \}\}\n    timeout-minutes: 10/);
 assert.match(value,/SOURCE_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
 assert.deepEqual([...value.matchAll(/^\s+(?:- )?uses: (.+)$/gm)].map(m=>m[1]),['actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1']);
 assert.match(value,/ref: \$\{\{ env\.SOURCE_SHA \}\}\n          fetch-depth: 1\n          persist-credentials: false/);assert.match(value,/node-version: '22'/);
 const runs=[...value.matchAll(/^        run: (.+)$/gm)].map(m=>m[1]);assert.deepEqual(runs,['node -e "'+inputCode+'"','node -e "'+checkoutCode+'"','npm ci --ignore-scripts','npm run test:key-client-workflow','npm run test:key-client']);assert.equal((value.match(/^\s+(?:- )?run:/gm)||[]).length,5);
 assert.ok(value.indexOf('name: Validate exact source SHA')<value.indexOf('uses: actions/checkout@'));assert.ok(value.indexOf('name: Verify checkout source')<value.indexOf('run: npm ci'));
}
validate(text);validate(text.replace(/\n/g,'\r\n'));let rejected=0;
for(const change of [v=>v.replace('pull_request:','push:'),v=>v.replace('contents: read','contents: write'),v=>v.replace('persist-credentials: false','persist-credentials: true'),v=>v.replace('ref: ${{ env.SOURCE_SHA }}','ref: main'),v=>v.replace('checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','checkout@v7'),v=>v.replace('fail-fast: false','fail-fast: true'),v=>v.replace('windows-2025, ubuntu-24.04','windows-2025'),v=>v.replace('s.length!==40||',''),v=>v.replace('s!==process.env.SOURCE_SHA','false'),v=>v.replace('npm ci --ignore-scripts','npm ci'),v=>v.replace('npm run test:key-client\n','npm run build:candidate\n'),v=>v+'"on":\n  push:\n']){const altered=change(text);assert.notEqual(altered,text);for(const ending of ['\n','\r\n']){assert.throws(()=>validate(altered.replace(/\n/g,ending)));rejected++;}}
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true});assert.equal(head.status,0);const sha=head.stdout.trim(),run=(code,s)=>spawnSync(process.execPath,['-e',code],{encoding:'utf8',windowsHide:true,env:{...process.env,SOURCE_SHA:s}});let guards=0;
for(const [s,valid] of [[sha,true],['main',false],[sha.toUpperCase(),false],[sha+'\n',false],[sha+';console.log(1)',false]]){assert.equal(run(inputCode,s).status===0,valid);guards++;}for(const [s,valid] of [[sha,true],['0'.repeat(40),false]]){assert.equal(run(checkoutCode,s).status===0,valid);guards++;}
console.log(JSON.stringify({status:'PASS_KEY_CLIENT_WORKFLOW',rejectedMutations:rejected,executedNodeGuards:guards,sourceHashes:Object.fromEntries([path,'scripts/test-key-client-workflow.mjs'].map(p=>[p,sha256(readFileSync(p))])),hostingTouched:false}));
