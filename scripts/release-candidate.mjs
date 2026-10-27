import assert from 'node:assert/strict';
import {mkdtempSync,readdirSync,readFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {writeStarsRelease,verifyStarsRelease,starsProfile} from './github-stars-release.mjs';
import {resolveRef,sha256} from './release-lib.mjs';

const profiles=new Map([[starsProfile.id,{write:writeStarsRelease,verify:verifyStarsRelease}]]);
const [mode,profile,requested]=process.argv.slice(2);
assert.ok(['test','build'].includes(mode),'Use test or build');
assert.ok(profiles.has(profile),'Unknown or unreviewed candidate profile');
assert.match(requested??'',/^[a-f0-9]{40}$/,'Candidate source must be an exact 40-character SHA');
const source=resolveRef(requested);assert.equal(source,requested,'Candidate source ref must resolve to the exact requested SHA');
const selected=profiles.get(profile);

if(mode==='test'){
 mkdirSync('tmp/tests',{recursive:true});const root=mkdtempSync(resolve('tmp/tests/candidate-')),one=join(root,'one'),two=join(root,'two');
 const first=selected.write(source,one);selected.write(source,two);selected.verify(one,source);
 assert.equal(first.profile,profile,'Builder returned a different profile');
 const names=readdirSync(one).sort();assert.deepEqual(names,readdirSync(two).sort(),'Candidate members differ across builds');
 for(const name of names)assert.equal(sha256(readFileSync(join(one,name))),sha256(readFileSync(join(two,name))),'Candidate bytes differ: '+name);
 console.log(`PASS deterministic candidate ${profile} ${source} ${names.length} files`);
}else{
 const directory=resolve('artifacts/pipeline',source),manifest=selected.write(source,directory);selected.verify(directory,source);
 console.log(JSON.stringify({status:'LOCAL_CANDIDATE_ONLY',profile:manifest.profile,sourceSha:source,directory},null,2));
}
