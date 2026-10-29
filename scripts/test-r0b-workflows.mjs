import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const read=path=>readFileSync(path,'utf8'),pr=read('.github/workflows/pr-fast.yml'),candidate=read('.github/workflows/pipeline-check.yml'),promote=read('.github/workflows/promote-production.yml'),historical=read('.github/workflows/release-package-check.yml');
const pins=['actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1'];
for(const [name,text] of Object.entries({pr,candidate,promote,historical}))for(const pin of pins)assert.ok(text.includes(pin),`${name} misses ${pin}`);
assert.ok(!/actions\/(?:checkout|setup-node|upload-artifact)@v\d/.test([pr,candidate,promote,historical].join('\n')),'Floating official action tag remains');
assert.match(pr,/pull_request:/);assert.match(pr,/permissions:\s*\n\s*contents: read/);assert.doesNotMatch(pr,/contents: write|git push|release-production/);
assert.doesNotMatch(candidate,/pull_request:/);assert.match(candidate,/workflow_dispatch:/);assert.match(candidate,/permissions:\s*\n\s*contents: read/);assert.match(candidate,/retention-days: 21/);assert.doesNotMatch(candidate,/git push|Version: 0\.7\.3|test:release --/);
assert.ok(candidate.includes('actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9'),'Candidate upload action is not pinned');
assert.match(promote,/workflow_dispatch:/);assert.match(promote,/contents: write/);assert.match(promote,/environment: production/);assert.match(promote,/release-production moved/);assert.match(promote,/Candidate ref moved or differs/);assert.match(promote,/validate-payload-commit\.mjs/);assert.doesNotMatch(promote,/--force|force-with-lease|plesk|webhook/i);
assert.ok(![pr,candidate,promote].some(text=>/secrets\./.test(text)),'New workflows must not consume repository secrets');
assert.match(historical,/workflow_dispatch:/);assert.doesNotMatch(historical,/pull_request:/);
console.log('PASS R0B workflow security contract 4 workflows');

// R7.3: prevent accidental release builds and cancellation of production work.
const rebuild=read('.github/workflows/rebuild-candidate.yml');
const frozenSource='50437bd16eae1912d8cffea093401449786faaea';
function checkFast(text){
 const on=text.match(/^on:\r?\n([\s\S]*?)(?=^\S)/m)?.[1];assert.ok(on,'Missing fast trigger');
 assert.match(on,/^  pull_request:/m);assert.doesNotMatch(on,/paths(?:-ignore)?:/);
 assert.match(text,/group: fast-pr-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/);
 assert.match(text,/cancel-in-progress: true/);
 assert.doesNotMatch(text,/rebuild-release|test-rebuild-r52-native|build:candidate|git push|contents: write|secrets\./);
 for(const command of ['test:ci-fast','test:workflow-contract','test:pipeline-ci -- --u2'])assert.ok(text.includes('npm run '+command),'Missing fast gate '+command);
}
function checkRebuild(text){
 const on=text.match(/^on:\r?\n([\s\S]*?)(?=^\S)/m)?.[1];assert.ok(on,'Missing candidate trigger');
 assert.deepEqual([...on.matchAll(/^  ([a-z_]+):/gm)].map(match=>match[1]),['workflow_dispatch'],'Candidate must be manual only');
 assert.match(on,/source_sha:\s*\n\s+description:[^\n]*\n\s+required: true\s*\n\s+type: string/);
 for(const pin of pins)assert.ok(text.includes(pin),'Missing candidate action pin');
 assert.match(text,/permissions:\s*\n\s*contents: read/);
 assert.doesNotMatch(text,/contents: write|persist-credentials: true|secrets\.|git push|webhook|post-deploy|cancel-in-progress: true/);
 assert.match(text,/SOURCE_SHA: \$\{\{ inputs\.source_sha \}\}/);
 assert.match(text,/ref: \$\{\{ env\.SOURCE_SHA \}\}/);
 assert.doesNotMatch(text,/github\.sha/);
 assert.ok(text.includes("-cnotmatch '^[a-f0-9]{40}$'"),'Missing input shape guard');
 assert.ok(text.includes("-cne '"+frozenSource+"'"),'Missing frozen profile guard');
 assert.ok(text.includes('$actual -cne $env:SOURCE_SHA'),'Missing checkout identity guard');
 assert.ok(text.indexOf('Validate frozen R52 source')<text.indexOf('uses: actions/checkout@'),'Input must be checked before checkout');
 assert.ok(text.indexOf('Verify checked out source')<text.indexOf('npm ci'),'Checkout must be checked before dependency execution');
 for(const script of ['rebuild-release.mjs','test-rebuild-r52-native.mjs'])assert.ok(text.includes('scripts/'+script+' $env:SOURCE_SHA'),'Candidate gate missing '+script);
 assert.match(text,/name: rebuild-\$\{\{ env\.SOURCE_SHA \}\}/);assert.match(text,/artifacts\/rebuild\/\$\{\{ env\.SOURCE_SHA \}\}\//);
 for(const member of ['native-results.json','url-probes.json'])assert.ok(text.includes(member),'Missing evidence '+member);
 assert.match(text,/if-no-files-found: error/);assert.match(text,/retention-days: 21/);
 assert.ok(text.includes('actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9'),'Upload action must stay pinned');
}
checkFast(pr);checkRebuild(rebuild);
let rejected=0;
for(const mutate of [
 text=>text.replace('  workflow_dispatch:','  push:'),
 text=>text.replace('  workflow_dispatch:','  pull_request:\n  workflow_dispatch:'),
 text=>text.replace('contents: read','contents: write'),
 text=>text.replace('persist-credentials: false','persist-credentials: true'),
 text=>text.replace('ref: ${{ env.SOURCE_SHA }}','ref: main'),
 text=>text.replace('-cnotmatch','-cmatch'),
 text=>text.replace(frozenSource,'a'.repeat(40)),
 text=>text.replace('$actual -cne $env:SOURCE_SHA','$actual -ceq $env:SOURCE_SHA'),
 text=>text.replace('test-rebuild-r52-native.mjs','skipped-native.mjs'),
 text=>text.replace('if-no-files-found: error','if-no-files-found: warn'),
 text=>text.replace('name: rebuild-${{ env.SOURCE_SHA }}','name: rebuild-${{ github.sha }}'),
]){assert.throws(()=>checkRebuild(mutate(rebuild)));rejected++;}
for(const mutate of [
 text=>text.replace('cancel-in-progress: true','cancel-in-progress: false'),
 text=>text.replace('fast-pr-${{ github.event.pull_request.number || github.ref }}','production-payload-promotion'),
 text=>text.replace('test:workflow-contract','build:candidate'),
 text=>text.replace('  pull_request:','  pull_request:\n    paths-ignore: [docs/**]'),
]){assert.throws(()=>checkFast(mutate(pr)));rejected++;}
// Execute the actual PowerShell guard blocks, without checkout/build or network.
const inputGuard=rebuild.match(/name: Validate frozen R52 source\r?\n\s+shell: pwsh\r?\n\s+run: \|\r?\n([\s\S]*?)(?=^      -)/m)?.[1];
const checkoutGuard=rebuild.match(/name: Verify checked out source\r?\n\s+shell: pwsh\r?\n\s+run: \|\r?\n([\s\S]*?)(?=^      -)/m)?.[1];
assert.ok(inputGuard&&checkoutGuard,'Actual workflow guard blocks missing');
function runGuard(code,source){return spawnSync('pwsh',['-NoProfile','-NonInteractive','-Command',"$ErrorActionPreference='Stop';\n"+code],{encoding:'utf8',windowsHide:true,env:{...process.env,SOURCE_SHA:source}});}
for(const [source,accepted] of [[frozenSource,true],['main',false],['a'.repeat(40),false],[frozenSource.toUpperCase(),false],['$(throw "injection")',false]]){
 const result=runGuard(inputGuard,source);if(result.error)throw result.error;assert.equal(result.status===0,accepted,'Input validation behavior: '+source);
}
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true});assert.equal(head.status,0);
assert.equal(runGuard(checkoutGuard,head.stdout.trim()).status,0,'Exact checkout accepted');
assert.notEqual(runGuard(checkoutGuard,'a'.repeat(40)).status,0,'Wrong checkout refused');
console.log(`PASS R7.3 manual candidate/fast policy; ${rejected} unsafe mutations rejected; 7 actual PowerShell guard cases`);

function checkCssWorkflow(text){
 const on=text.match(/^on:\r?\n([\s\S]*?)(?=^\S)/m)?.[1];assert.ok(on);
 assert.deepEqual([...on.matchAll(/^  ([a-z_]+):/gm)].map(match=>match[1]),['workflow_dispatch']);
 assert.ok(text.includes("if: github.ref == 'refs/heads/main'"),'Only trusted main controller is allowed');
 assert.match(text,/permissions:\s*\n\s+contents: read/);
 assert.doesNotMatch(text,/contents: write|persist-credentials: true|secrets\.|git push|gh pr merge|webhook|cancel-in-progress: true/);
 for(const pin of pins)assert.ok(text.includes(pin),'CSS workflow action is not pinned');
 assert.ok(text.includes('actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9'));
 assert.ok(text.includes('SOURCE_SHA: ${{ inputs.source_sha }}'));
 assert.ok(text.includes('CONTROLLER_SHA: ${{ github.sha }}'));
 assert.ok(text.includes('ref: ${{ env.CONTROLLER_SHA }}'),'Do not execute candidate source scripts');
 assert.ok(!text.includes('ref: ${{ env.SOURCE_SHA }}'));
 assert.ok(text.includes("$env:SOURCE_SHA -cnotmatch '^[a-f0-9]{40}$'"));
 assert.ok(text.includes('$actual -cne $env:CONTROLLER_SHA'));
 assert.ok(text.includes("'^fa4c67821008e0fcc4307fedf202bcdf95b85bb6\\s+refs/heads/release-production$'"),'Live Git payload baseline pin missing');
 assert.ok(text.includes('$source -cne $env:SOURCE_SHA'));
 for(const command of ['scripts/release-r6-css.mjs build $env:SOURCE_SHA','scripts/test-r6-css-candidate.mjs $env:SOURCE_SHA'])assert.ok(text.includes(command));
 assert.ok(text.includes('artifacts/r6-css/${{ env.SOURCE_SHA }}/'));
 assert.ok(text.includes('docs/acceptance/r6-css-candidates/${{ env.SOURCE_SHA }}/'));
 assert.match(text,/if-no-files-found: error/);assert.match(text,/retention-days: 21/);
}
const cssWorkflow=read('.github/workflows/r6-css-candidate.yml');checkCssWorkflow(cssWorkflow);
let cssRejected=0;
for(const mutate of [
 text=>text.replace('  workflow_dispatch:','  push:'),
 text=>text.replace('contents: read','contents: write'),
 text=>text.replace('persist-credentials: false','persist-credentials: true'),
 text=>text.replace("if: github.ref == 'refs/heads/main'",'if: true'),
 text=>text.replace('ref: ${{ env.CONTROLLER_SHA }}','ref: ${{ env.SOURCE_SHA }}'),
 text=>text.replace('fa4c67821008e0fcc4307fedf202bcdf95b85bb6','a'.repeat(40)),
 text=>text.replace('test-r6-css-candidate.mjs','skipped.mjs'),
]){assert.throws(()=>checkCssWorkflow(mutate(cssWorkflow)));cssRejected++;}
assert.ok(pr.includes('scripts/test-r6-css-profile.mjs'),'Fast CI must test the candidate policy');
assert.ok(!pr.includes('test-r6-css-profile.mjs --native'),'Native release rehearsal does not belong in every fast PR');
console.log(`PASS R7.8 trusted-controller CSS workflow; ${cssRejected} unsafe workflow mutations rejected`);

function checkReceiverWorkflow(text){
 for(const pin of pins)assert.ok(text.includes(pin));
 assert.match(text,/permissions:\s*\n\s*contents: read/);
 assert.match(text,/persist-credentials: false/);
 assert.match(text,/group: css-receiver-/);
 assert.match(text,/pull_request:\s*\n\s*paths:/);
 assert.ok(text.includes("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'"));
 assert.ok(text.includes('node scripts/run-clean.mjs script scripts/test-r6-css-profile.mjs --receiver'));
 assert.ok(text.includes('scripts/fixtures/r711-negative-cases.php'));
 for(const dependency of ['scripts/release-lib.mjs','scripts/validate-payload-commit.mjs','scripts/run-clean.mjs','scripts/fixtures/s06-theme-seed.php','docs/acceptance/S02/source-observations.json'])assert.ok(text.includes(dependency),'Missing receiver dependency '+dependency);
 assert.doesNotMatch(text,/contents: write|secrets\.|git push|gh pr merge|upload-artifact|release-production|themes\/\*\*|style\.css/);
}
const receiverWorkflow=read('.github/workflows/css-receiver-check.yml');checkReceiverWorkflow(receiverWorkflow);
let receiverRejected=0;
for(const mutate of [
 text=>text.replace('contents: read','contents: write'),
 text=>text.replace('persist-credentials: false','persist-credentials: true'),
 text=>text.replace(' --receiver',' --native'),
 text=>text.replace("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'",'if: true'),
]){assert.throws(()=>checkReceiverWorkflow(mutate(receiverWorkflow)));receiverRejected++;}
console.log('PASS R7.11 fixture receiver CI policy; '+receiverRejected+' unsafe mutations rejected');

function checkAdapterWorkflow(text){
 for(const pin of pins)assert.ok(text.includes(pin));
 assert.match(text,/permissions:\s*\n\s*contents: read/);
 assert.match(text,/persist-credentials: false/);
 assert.match(text,/group: css-adapter-/);
 assert.match(text,/pull_request:\s*\n\s*paths:/);
 assert.ok(text.includes("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'"));
 assert.ok(text.includes('node scripts/run-clean.mjs script scripts/test-r6-css-adapter.mjs --native'));
 for(const dependency of ['scripts/r6-css-operator.mjs','scripts/test-r6-css-operator.mjs'])assert.ok(text.includes(dependency),'Missing operator dependency '+dependency);
 for(const dependency of ['release-tools/r6-css-adapter.php','scripts/release-r6-css-adapter.mjs','scripts/test-r6-css-adapter-runtime.mjs','scripts/local-runtime.mjs','scripts/fixtures/s06-theme-seed.php','docs/acceptance/S02/source-observations.json','scripts/release-r6-css.mjs','scripts/release-lib.mjs','scripts/validate-payload-commit.mjs','scripts/run-clean.mjs','package*.json'])assert.ok(text.includes(dependency));
 assert.doesNotMatch(text,/contents: write|secrets\.|git push|gh pr merge|upload-artifact|release-production|themes\/\*\*|style\.css/);
}
const adapterWorkflow=read('.github/workflows/css-adapter-check.yml');checkAdapterWorkflow(adapterWorkflow);
let adapterRejected=0;
for(const ending of ['\n','\r\n']){
 const text=adapterWorkflow.replace(/\r?\n/g,ending);checkAdapterWorkflow(text);
 for(const mutate of [
  value=>value.replace('contents: read','contents: write'),
  value=>value.replace('persist-credentials: false','persist-credentials: true'),
  value=>value.replace(/run: node scripts\/run-clean\.mjs script scripts\/test-r6-css-adapter\.mjs/,'run: node scripts/skipped.mjs'),
  value=>value.replace("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'",'if: true'),
 ]){const changed=mutate(text);assert.notEqual(changed,text,'Workflow mutation did not apply');assert.throws(()=>checkAdapterWorkflow(changed));adapterRejected++;}
}
console.log('PASS R7.13 inspect adapter CI policy; '+adapterRejected+' unsafe mutations rejected');

function checkR717Workflow(text){
 for(const pin of pins)assert.ok(text.includes(pin));
 assert.ok(text.includes('actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9'));
 assert.match(text,/permissions:\s*\n\s*contents: read/);assert.match(text,/persist-credentials: false/);
 assert.match(text,/pull_request:\s*\n\s*paths:/);assert.match(text,/group: r717-rehearsal-/);
 assert.ok(text.includes("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'"));
 assert.ok(text.includes('ORCHESTRATOR_SOURCE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}'));
 assert.ok(text.includes('node scripts/run-clean.mjs script scripts/r717-adapter-candidate.mjs'));
 assert.ok(text.includes('node scripts/run-clean.mjs script scripts/test-r717-adapter-candidate.mjs --native'));
 assert.equal((text.match(/git ls-remote origin refs\/heads\/release-production/g)||[]).length,2);
 assert.ok(text.includes('fa4c67821008e0fcc4307fedf202bcdf95b85bb6'));
 for(const name of ['manifest.json','receiver.php','theme.zip','plugin.zip','previous-theme.zip','previous-plugin.zip'])assert.ok(text.includes('artifacts/r717-adapter/files/'+name));
 assert.match(text,/name: r717-rehearsal-proofs/);assert.match(text,/path: artifacts\/r717-adapter\/evidence\//);
 assert.doesNotMatch(text,/contents: write|secrets\.|git push|gh pr merge|webhook|path: tmp|path: \.local/);
}
const r717Workflow=read('.github/workflows/r717-adapter-rehearsal.yml');checkR717Workflow(r717Workflow);let r717Rejected=0;
for(const mutate of [
 value=>value.replace('contents: read','contents: write'),
 value=>value.replace('persist-credentials: false','persist-credentials: true'),
 value=>value.replace(' --native',''),
 value=>value.replace('artifacts/r717-adapter/files/receiver.php','tmp/private/health-key.json'),
 value=>value.replace("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'",'if: true'),
]){const changed=mutate(r717Workflow);assert.notEqual(changed,r717Workflow);assert.throws(()=>checkR717Workflow(changed));r717Rejected++;}
console.log('PASS R7.17 rehearsal artifact policy; '+r717Rejected+' unsafe mutations rejected');

function checkR720Workflow(text){
 for(const pin of pins)assert.ok(text.includes(pin));
 assert.match(text,/permissions:\s*\n\s*contents: read/);assert.match(text,/persist-credentials: false/);
 assert.ok(text.includes('actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9'));
 assert.ok(text.includes("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'"));
 assert.ok(text.includes('ORCHESTRATOR_SOURCE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}'));
 assert.ok(text.includes('node scripts/run-clean.mjs script scripts/r720-adapter-rehearsal.mjs --native'));
 assert.equal((text.match(/git ls-remote origin refs\/heads\/release-production/g)||[]).length,2);
 assert.ok(text.includes('fa4c67821008e0fcc4307fedf202bcdf95b85bb6'));
 const block=text.match(/name: r720-six-file-rehearsal\s*\n\s*path: \|([\s\S]+?)\s+if-no-files-found: error/);assert.ok(block);
 assert.deepEqual(block[1].trim().split(/\r?\n/).map(line=>line.trim()).sort(),['manifest.json','receiver.php','theme.zip','plugin.zip','previous-theme.zip','previous-plugin.zip'].map(name=>'artifacts/r720-adapter/files/'+name).sort());
 assert.match(text,/name: r720-rehearsal-proofs/);assert.match(text,/path: artifacts\/r720-adapter\/evidence\//);
 assert.doesNotMatch(text,/contents: write|secrets\.|git push|gh pr merge|webhook|path: tmp|path: \.local/);
}
const r720Workflow=read('.github/workflows/r720-adapter-rehearsal.yml');let r720Rejected=0;
for(const ending of ['\n','\r\n']){
 const text=r720Workflow.replace(/\r?\n/g,ending);checkR720Workflow(text);
 for(const mutate of [
  value=>value.replace('contents: read','contents: write'),
  value=>value.replace('persist-credentials: false','persist-credentials: true'),
  value=>value.replace(' --native',''),
  value=>value.replace('artifacts/r720-adapter/files/receiver.php','tmp/private/health-key.json'),
  value=>value.replace("if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'",'if: true'),
 ]){const changed=mutate(text);assert.notEqual(changed,text);assert.throws(()=>checkR720Workflow(changed));r720Rejected++;}
}
console.log('PASS R7.20 importer artifact policy; '+r720Rejected+' unsafe mutations rejected');
