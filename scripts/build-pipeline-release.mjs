import {resolve} from 'node:path';
import {writePipeline} from './pipeline-release.mjs';
import {resolveRef} from './release-lib.mjs';
const ref=resolveRef(process.argv[2]||'HEAD'),directory=resolve('artifacts/pipeline/'+ref);
const manifest=writePipeline(ref,directory);console.log(JSON.stringify({status:'LOCAL_CANDIDATE_ONLY',directory,sourceSha:ref,profile:manifest.profile,files:manifest.files.length},null,2));
