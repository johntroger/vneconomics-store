import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
function git(args,input){const result=spawnSync('git',args,{input,encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||'Git command failed');return result.stdout;}
const previous=git(['rev-parse','release']).trim();
assert.deepEqual(git(['ls-tree','-rz','--name-only',previous]).split('\0').filter(Boolean),['connection-check.txt']);
const payload='Vneconomics Store deployment connection check\nStatus: OK\nRevision: connection-v2\n';
const current=git(['show','release:connection-check.txt']);
if(current===payload){console.log('Release v2 already prepared.');process.exit(0);}
assert.ok(current.includes('Revision: connection-v1'),'Unexpected previous payload');
const blob=git(['hash-object','-w','--stdin'],payload).trim();
const tree=git(['mktree'],`100644 blob ${blob}\tconnection-check.txt\n`).trim();
const commit=git(['commit-tree',tree,'-p',previous],'Verify automatic hosting deployment connection v2\n').trim();
assert.deepEqual(git(['ls-tree','-rz','--name-only',commit]).split('\0').filter(Boolean),['connection-check.txt']);
assert.equal(git(['show',`${commit}:connection-check.txt`]),payload);
git(['update-ref','refs/heads/release',commit,previous]);
console.log('PASS: v2 changes only the isolated connection-check.txt.');
console.log('Release commit: '+commit);
