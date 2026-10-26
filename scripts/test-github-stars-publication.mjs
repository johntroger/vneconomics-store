import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,writeFileSync,readFileSync,cpSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {writeStarsRelease} from './github-stars-release.mjs';
import {validateStarsPublication} from './publish-github-stars.mjs';
import {resolveRef,git} from './release-lib.mjs';
import {REQUIRED_PIPELINE_STEPS} from './pipeline-ci-policy.mjs';
import mock from './fixtures/pipeline-ci-api.cjs';
mkdirSync('tmp/tests',{recursive:true});const root=mkdtempSync(resolve('tmp/tests/stars-publication-')),directory=join(root,'candidate'),source=resolveRef('HEAD'),refs=git(['for-each-ref']).toString(),checks=[];writeStarsRelease(source,directory);
const fresh=()=>mock.fixture(source,REQUIRED_PIPELINE_STEPS),verify=(f,dir=directory)=>validateStarsPublication({directory:dir,source,runId:String(f.requestedId),api:mock.apiFor(f),now:f.now});
const valid=verify(fresh());assert.equal(valid.paths.length,8);assert.ok(!valid.paths.includes('content.json'));checks.push('code-only8members; no content importer payload');
for(const [name,change]of [['wrong workflow',f=>f.run.path='.github/workflows/release-package-check.yml'],['wrong source',f=>f.run.head_sha='a'.repeat(40)],['failed test',f=>f.jobs[0].steps[0].conclusion='failure'],['artifact missing',f=>f.artifacts=[]],['artifact expired',f=>f.artifacts[0].expired=true],['wrong attempt',f=>f.jobs[0].run_attempt=2],['no upload',f=>f.jobs[0].steps.pop()],['wrong repository',f=>f.run.repository.full_name='other/repo'],['stale upload',f=>f.artifacts[0].created_at=new Date(f.now-60000).toISOString()]]){const f=fresh();change(f);assert.throws(()=>verify(f));checks.push('reject '+name);}
const bad=join(root,'bad');cpSync(directory,bad,{recursive:true});writeFileSync(join(bad,'plugin.zip'),'tampered');assert.throws(()=>verify(fresh(),bad));checks.push('reject changed application archive');cpSync(directory,bad,{recursive:true});writeFileSync(join(bad,'content.json'),'unexpected');assert.throws(()=>verify(fresh(),bad));checks.push('reject old content payload member');
assert.equal(git(['for-each-ref']).toString(),refs);checks.push('no Git ref mutation');
mkdirSync('docs/acceptance/U4-github-stars',{recursive:true});writeFileSync('docs/acceptance/U4-github-stars/publication-tests.json',JSON.stringify({status:'PASS_STARS_PUBLICATION_GATE',sourceSha:source,checks,externalRequests:0,limits:['Injected GitHub API only; preview validation, not publication/deployment']},null,2)+'\n');console.log('PASS stars publication '+checks.length+' checks');
