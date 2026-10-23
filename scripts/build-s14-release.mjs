import {resolve,join} from 'node:path';
import {writeRelease,resolveRef,verifyRelease} from './release-lib.mjs';
const ref=process.argv[2]||'HEAD',sha=resolveRef(ref),dir=resolve(join('artifacts/releases',sha));
const manifest=writeRelease(sha,dir);verifyRelease(dir,sha);
console.log(JSON.stringify({status:'BUILT_AND_VERIFIED',sourceSha:sha,directory:dir,versions:Object.fromEntries(Object.entries(manifest.components).map(([k,v])=>[k,v.version])),deployAuthorized:false},null,2));
