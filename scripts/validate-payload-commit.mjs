import assert from 'node:assert/strict';
import {git,sha256} from './release-lib.mjs';

const [payloadSha,sourceSha,expectedParent,profile]=process.argv.slice(2);
for(const [name,value] of Object.entries({payloadSha,sourceSha,expectedParent}))assert.match(value??'',/^[a-f0-9]{40}$/,`Invalid ${name}`);
assert.match(profile??'',/^[a-z0-9][a-z0-9._-]{2,80}$/,'Invalid profile');
assert.equal(git(['rev-parse','--verify',payloadSha+'^{commit}']).toString().trim(),payloadSha,'Payload commit differs');
const parents=git(['show','-s','--format=%P',payloadSha]).toString().trim().split(/\s+/).filter(Boolean);
assert.deepEqual(parents,[expectedParent],'Candidate must have exactly the approved production parent');
const manifest=JSON.parse(git(['show',payloadSha+':manifest.json']).toString());
assert.equal(manifest.sourceSha,sourceSha,'Manifest source differs');assert.equal(manifest.profile,profile,'Manifest profile differs');
assert.ok(Array.isArray(manifest.files)&&manifest.files.length>0&&manifest.files.length<=100,'Invalid manifest allowlist');
const paths=['manifest.json'],seen=new Set(paths);
for(const file of manifest.files){
 assert.deepEqual(Object.keys(file).sort(),['bytes','path','sha256'],'Unexpected manifest file fields');
 assert.match(file.path,/^[a-z0-9][a-z0-9._/-]*$/,'Unsafe payload path');assert.ok(!file.path.includes('..')&&!seen.has(file.path),'Duplicate/escaping payload path');seen.add(file.path);paths.push(file.path);
 assert.match(file.sha256,/^[a-f0-9]{64}$/);assert.ok(Number.isSafeInteger(file.bytes)&&file.bytes>=0);
 const blob=git(['show',payloadSha+':'+file.path]);assert.equal(blob.length,file.bytes,'Payload byte count differs: '+file.path);assert.equal(sha256(blob),file.sha256,'Payload hash differs: '+file.path);
}
const rows=git(['ls-tree','-r',payloadSha]).toString().trim().split(/\r?\n/).filter(Boolean).map(row=>{const match=row.match(/^(\d+)\s+(\w+)\s+([a-f0-9]+)\t(.+)$/);assert.ok(match,'Invalid tree row');return {mode:match[1],type:match[2],path:match[4]};});
assert.ok(rows.every(row=>row.mode==='100644'&&row.type==='blob'),'Payload must contain regular files only');
assert.deepEqual(rows.map(row=>row.path).sort(),paths.sort(),'Payload tree differs from manifest allowlist');
console.log(JSON.stringify({status:'VERIFIED_PAYLOAD_COMMIT',payloadSha,sourceSha,expectedParent,profile,files:paths.length},null,2));
