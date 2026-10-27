import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(path,'utf8'),pr=read('.github/workflows/pr-fast.yml'),candidate=read('.github/workflows/pipeline-check.yml'),promote=read('.github/workflows/promote-production.yml'),historical=read('.github/workflows/release-package-check.yml');
const pins=['actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683','actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020'];
for(const [name,text] of Object.entries({pr,candidate,promote,historical}))for(const pin of pins)assert.ok(text.includes(pin),`${name} misses ${pin}`);
assert.ok(!/actions\/(?:checkout|setup-node|upload-artifact)@v\d/.test([pr,candidate,promote,historical].join('\n')),'Floating official action tag remains');
assert.match(pr,/pull_request:/);assert.match(pr,/permissions:\s*\n\s*contents: read/);assert.doesNotMatch(pr,/contents: write|git push|release-production/);
assert.doesNotMatch(candidate,/pull_request:/);assert.match(candidate,/workflow_dispatch:/);assert.match(candidate,/permissions:\s*\n\s*contents: read/);assert.match(candidate,/retention-days: 21/);assert.doesNotMatch(candidate,/git push|Version: 0\.7\.3|test:release --/);
assert.ok(candidate.includes('actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02'),'Candidate upload action is not pinned');
assert.match(promote,/workflow_dispatch:/);assert.match(promote,/contents: write/);assert.match(promote,/environment: production/);assert.match(promote,/release-production moved/);assert.match(promote,/Candidate ref moved or differs/);assert.match(promote,/validate-payload-commit\.mjs/);assert.doesNotMatch(promote,/--force|force-with-lease|plesk|webhook/i);
assert.ok(![pr,candidate,promote].some(text=>/secrets\./.test(text)),'New workflows must not consume repository secrets');
assert.match(historical,/workflow_dispatch:/);assert.doesNotMatch(historical,/pull_request:/);
console.log('PASS R0B workflow security contract 4 workflows');
