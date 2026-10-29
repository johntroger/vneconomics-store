import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {git,sha256} from './release-lib.mjs';
import {prepareR6CssCandidate,verifyR6CssCandidate} from './release-r6-css.mjs';
import {exerciseR6CssNative} from './test-r6-css-native.mjs';
const [source,...extra]=process.argv.slice(2);assert.ok(extra.length===0,'Use exact source SHA');
const directory=resolve('artifacts/r6-css',source??'invalid');verifyR6CssCandidate(source,directory);
const prepared=prepareR6CssCandidate(source),runId=randomUUID();
const evidence=resolve('docs/acceptance/r6-css-candidates',source,runId);mkdirSync(evidence,{recursive:true});
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/r6-css-native-'));
const proof={status:'FAIL',profile:prepared.manifest.profile,sourceSha:source,controllerSha:git(['rev-parse','HEAD']).toString().trim(),manifestSha256:sha256(prepared.buffers['manifest.json']),productionBaselinePayload:prepared.manifest.productionBaselinePayload,deployAuthorized:false};
const deadline=setTimeout(()=>{console.error('CSS candidate native gate exceeded 600 seconds');process.exit(1);},600000);deadline.unref();
try{proof.checks=await exerciseR6CssNative({fixture,prepared});proof.status='PASS_NATIVE_CSS_CANDIDATE';}
catch(error){proof.error=String(error.stack??error);throw error;}
finally{clearTimeout(deadline);writeFileSync(join(evidence,'native.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({status:proof.status,evidence,sourceSha:source,deployAuthorized:false}));}
