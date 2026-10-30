import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';

assert.equal(process.argv.length,2,'No source/host/path overrides');
const path='.github/workflows/key-coordinator-check.yml',text=readFileSync(path,'utf8');
const inputGuard="$ErrorActionPreference = 'Stop'\nif ($env:SOURCE_SHA -cnotmatch '^[a-f0-9]{40}\\z') { throw 'Exact lowercase source SHA required' }";
const checkoutGuard="$ErrorActionPreference = 'Stop'\n$actual = (git rev-parse HEAD).Trim()\nif ($LASTEXITCODE -ne 0 -or $actual -cne $env:SOURCE_SHA) { throw 'Checked-out source differs' }\nWrite-Output ('SOURCE_SHA=' + $actual)";
const block=(value,name)=>value.match(new RegExp('      - name: '+name+'\n        shell: pwsh\n        run: \\|\n([\\s\\S]*?)(?=^      -)','m'))?.[1].trim().split('\n').map(line=>line.trim()).join('\n');
function validate(raw){
 const value=raw.replace(/\r\n/g,'\n'),trigger=value.match(/^on:\n([\s\S]*?)(?=^\S)/m)?.[1];assert.ok(trigger);
 assert.deepEqual(value.split('\n').filter(line=>/^\S/.test(line)&&!line.startsWith('#')).map(line=>line.split(':')[0]),['name','on','permissions','concurrency','jobs']);
 assert.deepEqual([...trigger.matchAll(/^  ([a-z_]+):/gm)].map(m=>m[1]),['workflow_dispatch']);
 assert.match(trigger,/source_sha:\n        description: [^\n]+\n        required: true\n        type: string/);
 assert.match(value,/^permissions:\n  contents: read\n/m);assert.equal((value.match(/\bpermissions:/g)||[]).length,1);
 assert.doesNotMatch(value,/contents: write|\bsecrets\b|persist-credentials: true|git push|gh pr merge|environment:|continue-on-error:|\bif:|\bservices:|\bcontainer:/);
 assert.match(value,/group: key-coordinator-check-\$\{\{ github\.ref \}\}/);assert.match(value,/cancel-in-progress: true/);
 const jobs=value.split('jobs:\n')[1];assert.ok(jobs);assert.deepEqual([...jobs.matchAll(/^  ([a-z-]+):$/gm)].map(m=>m[1]),['key-coordinator']);
 assert.match(value,/runs-on: windows-2025\n    timeout-minutes: 10/);assert.match(value,/env:\n      SOURCE_SHA: \$\{\{ inputs\.source_sha \}\}\n    steps:/);
 assert.deepEqual([...value.matchAll(/^\s+(?:- )?uses: (.+)$/gm)].map(m=>m[1]),['actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1']);
 assert.match(value,/ref: \$\{\{ env\.SOURCE_SHA \}\}\n          fetch-depth: 1\n          persist-credentials: false/);assert.match(value,/node-version: '22'\n          cache: npm/);
 assert.equal(block(value,'Validate source SHA'),inputGuard);assert.equal(block(value,'Verify checked-out source'),checkoutGuard);
 assert.ok(value.indexOf('name: Validate source SHA')<value.indexOf('uses: actions/checkout@'));assert.ok(value.indexOf('name: Verify checked-out source')<value.indexOf('run: npm ci'));
 assert.equal((value.match(/^\s+(?:- )?run:/gm)||[]).length,5);
 assert.deepEqual([...value.matchAll(/^        run: (?!\|)(.+)$/gm)].map(m=>m[1]),['npm ci --ignore-scripts','npm run test:key-coordinator-workflow','npm run test:key-coordinator']);
 return true;
}
validate(text);validate(text.replace(/\r?\n/g,'\r\n'));let rejected=0;
for(const change of [
 v=>v.replace('  workflow_dispatch:','  push:'),v=>v.replace('  workflow_dispatch:','  pull_request:\n  workflow_dispatch:'),v=>v.replace('contents: read','contents: write'),v=>v.replace('persist-credentials: false','persist-credentials: true'),v=>v.replace('ref: ${{ env.SOURCE_SHA }}','ref: main'),v=>v.replace('checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','checkout@v7'),v=>v.replace('-cnotmatch','-cmatch'),v=>v.replace('$actual -cne','$actual -ceq'),v=>v.replace('npm ci --ignore-scripts','npm ci'),v=>v.replace('npm run test:key-coordinator\n','npm run build:candidate\n'),v=>v.replace('timeout-minutes: 10','timeout-minutes: 120'),v=>v.replace('key-coordinator-check-${{ github.ref }}','production-payload-promotion'),v=>v.replace('run: npm run test:key-coordinator','if: false\n        run: npm run test:key-coordinator'),v=>v+'      - run: git push\n',v=>v.replace('    steps:','    secrets: inherit\n    steps:'),
 v=>v.replace('jobs:\n',"env:\n  EXTRA: ${{ secrets['KEY'] }}\njobs:\n"),
 v=>v+'"on":\n  push:\n',
]){const changed=change(text);assert.notEqual(changed,text);assert.throws(()=>validate(changed));rejected++;}
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true});assert.equal(head.status,0);const sha=head.stdout.trim(),run=(code,source)=>spawnSync('pwsh',['-NoProfile','-NonInteractive','-Command',code],{encoding:'utf8',windowsHide:true,timeout:15000,env:{...process.env,SOURCE_SHA:source}});
const actualInput=block(text.replace(/\r\n/g,'\n'),'Validate source SHA'),actualCheckout=block(text.replace(/\r\n/g,'\n'),'Verify checked-out source');let executed=0;
for(const [source,accepted] of [[sha,true],['main',false],[sha.toUpperCase(),false],['a'.repeat(40)+';Write-Output INJECTED',false],['a'.repeat(40)+'\n',false]]){const result=run(actualInput,source);assert.equal(result.status===0,accepted,'Actual workflow input guard differs');executed++;}
for(const [source,accepted] of [[sha,true],['0'.repeat(40),false]]){const result=run(actualCheckout,source);assert.equal(result.status===0,accepted,'Actual workflow checkout guard differs');executed++;}
console.log(JSON.stringify({status:'PASS_KEY_COORDINATOR_WORKFLOW_LOCAL',validLineEndings:2,rejectedMutations:rejected,executedPowerShellGuards:executed,hostingTouched:false,remoteCiDispatched:false,yamlServiceValidationPerformed:false,sourceHashes:Object.fromEntries([path,'scripts/test-key-coordinator-workflow.mjs','package.json'].map(p=>[p,sha256(readFileSync(p))]))}));
