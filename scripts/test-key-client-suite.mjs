// Native key-client fixtures only. No real private store or hosting access.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './release-lib.mjs';

assert.equal(process.argv.length,2,'No suite/key/path overrides');
const workspace=fileURLToPath(new URL('../',import.meta.url)),started=performance.now();
const cases=[['private-loader','scripts/test-r726-private-key.mjs','PASS_R726_NATIVE_PRIVATE_KEY_LOADER','docs/acceptance/R726-private-key/local-result.json'],['candidate-staging','scripts/test-r729-key-lifecycle.mjs','PASS_R729_NATIVE_KEY_CANDIDATE_STAGING','docs/acceptance/R729-key-lifecycle/local-result.json']];
const fingerprint=path=>existsSync(path)?{hash:sha256(readFileSync(path)),mtimeMs:statSync(path).mtimeMs}:null;
const before=cases.map(([, , ,path])=>fingerprint(path)),results=[];
for(const [name,path,status] of cases){
 const start=performance.now(),result=spawnSync(process.execPath,[resolve(workspace,path),'--summary-only'],{cwd:workspace,encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024,timeout:180000});
 if(result.status!==0){process.stderr.write(result.stdout??'');process.stderr.write(result.stderr??'');throw new Error('Key client case failed: '+name+(result.error?' ('+result.error.code+')':''));}
 let summary;try{summary=JSON.parse(result.stdout.trim().split(/\r?\n/).filter(line=>line.startsWith('{')).at(-1));}catch{throw new Error('Key client summary invalid: '+name);}
 assert.ok(summary.status===status&&Number.isSafeInteger(summary.checks)&&summary.checks>0,'Key client result differs: '+name);
 if(result.stderr)process.stderr.write('['+name+'] '+result.stderr);
 results.push({name,status,checks:summary.checks,elapsedMs:Math.round(performance.now()-start),diagnosticLines:result.stderr.trim()?result.stderr.trim().split(/\r?\n/).length:0});
}
assert.deepEqual(cases.map(([, , ,path])=>fingerprint(path)),before,'Historical key-client receipts changed');
const sources=['scripts/test-key-client-suite.mjs','scripts/run-clean.mjs','package.json','scripts/r6-css-private-key.mjs','scripts/r6-css-key-lifecycle.mjs','scripts/r6-css-production-proof.mjs',...cases.map(([,path])=>path)];
console.log(JSON.stringify({status:'PASS_KEY_CLIENT_SUITE',checks:results.reduce((sum,r)=>sum+r.checks,0),cases:results,elapsedMs:Math.round(performance.now()-started),platform:process.platform,nativeWindowsAclTested:process.platform==='win32',nativePosixPermissionsTested:process.platform!=='win32',historicalReceiptsUnchanged:true,protectedReceiptsPresent:before.filter(Boolean).length,syntheticKeysOnly:true,actualProductionStoreTouched:false,hostingTouched:false,productionKeyCreated:false,ciCertified:false,sourceHashes:Object.fromEntries(sources.map(path=>[path,sha256(readFileSync(path))]))}));
