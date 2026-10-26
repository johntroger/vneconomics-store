import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {git,resolveRef,sourceFiles,makeZip,sha256} from './release-lib.mjs';
export const starsProfile=Object.freeze({id:'vne-073-043-stars1-schema3',theme:'0.7.3',plugin:'0.4.3',schema:3,stats:1});
const baseline='4266b71990702d87969a847e95d9c39933cb05a4';
export function prepareStarsRelease(ref){
 const sourceSha=resolveRef(ref),files=[],components={},previous={};
 for(const [label,sha,versions,target]of [['current',sourceSha,starsProfile,components],['previous',baseline,{theme:'0.7.2',plugin:'0.4.2'},previous]]){
  for(const kind of ['theme','plugin']){
   const members=sourceFiles(sha,kind),header=members.find(f=>f.name===(kind==='theme'?'vibelab/style.css':'vne-library-core/vne-library-core.php')).data.toString();assert.match(header,new RegExp('Version:\\s*'+versions[kind].replaceAll('.','\\.')+'\\s*[\\r\\n]'));
   const archive=(label==='current'?'':'previous-')+kind+'.zip',data=makeZip(members);files.push({name:archive,data});target[kind]={version:versions[kind],archive,sha256:sha256(data),files:members.map(f=>({path:f.name,sha256:sha256(f.data),bytes:f.data.length}))};
  }
 }
 for(const path of ['receiver.php','github-stars-receiver.php','environments.json'])files.push({name:path,data:git(['show',sourceSha+':deploy/'+path])});
 const manifest={format:1,profile:starsProfile.id,sourceSha,schema:3,stats:1,mode:'code-only',components,previous:{sourceSha:baseline,components:previous},files:files.map(f=>({path:f.name,sha256:sha256(f.data),bytes:f.data.length})),policy:'Keep posts/meta/taxonomy/validation/import journals and stats options; no content import, scheduler or live transport. GitHub CI and separate hosting approval required.'};
 files.push({name:'manifest.json',data:Buffer.from(JSON.stringify(manifest,null,2)+'\n')});return {manifest,files,zip:makeZip(files.map(f=>({name:'vne-pipeline/'+f.name,data:f.data})))};
}
export function writeStarsRelease(ref,directory){const r=prepareStarsRelease(ref);assert.ok(!existsSync(directory),'Immutable output already exists');mkdirSync(directory,{recursive:true});for(const f of [...r.files,{name:'payload.zip',data:r.zip}])writeFileSync(join(directory,f.name),f.data);return r.manifest;}
export function verifyStarsRelease(directory,ref){const r=prepareStarsRelease(ref);assert.deepEqual(readdirSync(directory).sort(),[...r.files.map(f=>f.name),'payload.zip'].sort());for(const f of [...r.files,{name:'payload.zip',data:r.zip}])assert.equal(sha256(readFileSync(join(directory,f.name))),sha256(f.data),'Different package '+f.name);return r.manifest;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const ref=resolveRef(process.argv[2]||'HEAD'),directory=resolve('artifacts/pipeline/'+ref);const m=writeStarsRelease(ref,directory);console.log(JSON.stringify({status:'LOCAL_CANDIDATE_ONLY',directory,sourceSha:ref,profile:m.profile}));}
