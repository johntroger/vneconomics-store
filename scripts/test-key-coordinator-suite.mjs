// Targeted key-coordinator checks. One parent cleanup wrapper owns all sequential fixtures.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './release-lib.mjs';

assert.equal(process.argv.length,2,'No suite/host/path overrides');
const workspace=fileURLToPath(new URL('../',import.meta.url)),started=performance.now();
const cases=[['single-flight','scripts/test-r738-fixture-single-flight.mjs','PASS_R738_FIXTURE_SINGLE_FLIGHT'],['checkpoint','scripts/test-r739-checkpoint-fixture.mjs','PASS_R739_CHECKPOINT_FIXTURE'],['state-pin','scripts/test-r740-fixture-state-pin.mjs','PASS_R740_FIXTURE_STATE_PIN']];
const receipts=cases.map(([,path])=>'docs/acceptance/'+({'scripts/test-r738-fixture-single-flight.mjs':'R738-fixture-single-flight','scripts/test-r739-checkpoint-fixture.mjs':'R739-checkpoint-fixture','scripts/test-r740-fixture-state-pin.mjs':'R740-fixture-state-pin'}[path])+'/local-result.json');
const fingerprint=path=>existsSync(path)?{hash:sha256(readFileSync(path)),mtimeMs:statSync(path).mtimeMs}:null;
const before=receipts.map(fingerprint),results=[];
for(const [name,path,status] of cases){
 const start=performance.now(),result=spawnSync(process.execPath,[resolve(workspace,path),'--summary-only'],{cwd:workspace,encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024,timeout:90000});
 if(result.status!==0){process.stderr.write(result.stdout??'');process.stderr.write(result.stderr??'');throw new Error('Key coordinator case failed: '+name+(result.error?' ('+result.error.code+')':''));}
 let summary;try{summary=JSON.parse(result.stdout.trim().split(/\r?\n/).filter(line=>line.startsWith('{')).at(-1));}catch{throw new Error('Key coordinator summary invalid: '+name);}
 assert.ok(summary.status===status&&Number.isSafeInteger(summary.checks)&&summary.checks>0,'Key coordinator result differs: '+name);
 if(result.stderr)process.stderr.write('['+name+'] '+result.stderr);
 results.push({name,status,checks:summary.checks,elapsedMs:Math.round(performance.now()-start),diagnosticLines:result.stderr.trim()?result.stderr.trim().split(/\r?\n/).length:0});
}
assert.deepEqual(receipts.map(fingerprint),before,'Historical receipts changed during summary-only suite');
const sources=['scripts/test-key-coordinator-suite.mjs','scripts/run-clean.mjs','package.json','scripts/r6-css-key-two-side-fixture.mjs','scripts/r6-css-key-checkpoint-fixture.mjs','scripts/r6-css-key-reconciliation.mjs','scripts/r6-css-key-handshake.mjs','release-tools/r6-css-adapter.php',...cases.map(([,path])=>path)];
console.log(JSON.stringify({status:'PASS_KEY_COORDINATOR_SUITE',checks:results.reduce((sum,r)=>sum+r.checks,0),cases:results,elapsedMs:Math.round(performance.now()-started),historicalReceiptsUnchanged:true,protectedReceiptsPresent:before.filter(Boolean).length,hostingTouched:false,productionExecutorImplemented:false,ciCertified:false,sourceHashes:Object.fromEntries(sources.map(path=>[path,sha256(readFileSync(path))]))}));
