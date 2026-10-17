import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
function git(args,input){const result=spawnSync('git',args,{input,encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||`git ${args[0]} failed`);return result.stdout;}
const payload='Vneconomics Store deployment connection check\nStatus: OK\nRevision: connection-v1\n';
const old=spawnSync('git',['rev-parse','--verify','refs/heads/release'],{encoding:'utf8'});
const previous=old.status===0?old.stdout.trim():'0'.repeat(40);
if(old.status===0){
 const files=git(['ls-tree','-rz','--name-only','release']).split('\0').filter(Boolean);
 if(files.length===1&&files[0]==='connection-check.txt'&&git(['show','release:connection-check.txt'])===payload){console.log('Existing release payload verified.');process.exit(0);}
 assert.ok(previous.startsWith('8814314')&&files.length===1&&files[0]==='connection-check.txt\r','Refuse to replace unexpected existing release');
}
const blob=git(['hash-object','-w','--stdin'],payload).trim();
const tree=git(['mktree'],`100644 blob ${blob}\tconnection-check.txt\n`).trim();
const commit=git(['commit-tree',tree],'Prepare isolated hosting connection check v1\n').trim();
git(['update-ref','refs/heads/release',commit,previous]);
assert.deepEqual(git(['ls-tree','-rz','--name-only','release']).split('\0').filter(Boolean),['connection-check.txt']);
assert.equal(git(['show','release:connection-check.txt']),payload);
console.log('PASS: release has exactly one plain-text verification file, with expected contents.');
console.log('Release commit: '+commit);
