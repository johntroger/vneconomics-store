import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join,basename} from 'node:path';
import {git,verifyRelease,sha256} from './release-lib.mjs';
const dir=resolve(process.argv[2]||''),evidence=resolve('docs/acceptance/S14');
const read=name=>JSON.parse(readFileSync(join(evidence,name),'utf8'));
const packages=read('package-results.json'),runtime=read('runtime-results.json');
assert.equal(packages.status,'PASS');assert.equal(runtime.status,'PASS_LOCAL_PACKAGE_RUNTIME');
assert.equal(packages.sourceSha,runtime.sourceSha);const manifest=verifyRelease(dir,packages.sourceSha);
const paths=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'];
assert.deepEqual(paths.map(p=>sha256(readFileSync(p))),packages.protectedHashes);
assert.deepEqual(packages.protectedHashes,runtime.protectedHashes);
const prior=JSON.parse(readFileSync('docs/acceptance/S13/postflight.json','utf8'));
for(const path of paths)assert.equal(sha256(readFileSync(path)),prior.protectedHashes[path]);
assert.equal(git(['diff','--name-only','71d3f21','--','docs/acceptance/S13']).toString().trim(),'','S13 evidence preserved');
assert.equal(git(['diff',packages.sourceSha,'--','plugins/vne-library-core','themes/vibelab','scripts/release-lib.mjs','scripts/release-policy.mjs','scripts/build-s14-release.mjs','scripts/test-s14-release.mjs','scripts/test-s14-runtime.mjs']).toString().trim(),'','Source and runners still match tested commit');
assert.equal(git(['for-each-ref','--format=%(refname) %(objectname)','refs/heads/main','refs/heads/release','refs/heads/deploy-*']).toString(),packages.protectedRefs);
assert.deepEqual(existsSync('tmp/tests')?readdirSync('tmp/tests'):[],[],'Fixtures cleaned');
const caches=readdirSync('tmp').filter(n=>n.startsWith('transient-run-'));
assert.deepEqual(caches,[basename(process.env.TEMP||'')],'Only current postflight cache active');
const report={status:'PASS_LOCAL_S14_POSTFLIGHT',date:new Date().toISOString(),sourceSha:packages.sourceSha,
 packagingChecks:packages.checks.length,runtimeChecks:runtime.checks.length,httpVisits:runtime.visits.length,
 originalDatabaseAndConfigUnchanged:true,S13EvidenceUnchanged:true,mainReleaseDeployRefsUnchanged:true,
 fixturesRemaining:[],temporaryCache:'Only own active postflight cache; wrapper removes after exit',
 artifacts:Object.fromEntries(Object.entries(manifest.components).map(([kind,c])=>[kind,{archive:c.archive,sha256:c.sha256,files:c.files.length,bytes:c.bytes}])),
 limitations:{remoteCI:'not run; manual validation workflow prepared only',S13OwnerReview:'pending',S15:'not authorized',S16:'not authorized',hosting:'PHP/MySQL/Plesk/cache/real backup restore not tested'}};
writeFileSync(join(evidence,'postflight.json'),JSON.stringify(report,null,2)+'\n');
console.log('PASS S14 postflight: source, artifact, protected data/refs/evidence and fixture cleanup verified.');
