import assert from 'node:assert/strict';
import {existsSync,lstatSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {git,sha256} from './release-lib.mjs';
import {prepareR6CssCandidate} from './release-r6-css.mjs';
import {productionBindingPlan} from './r6-css-operator.mjs';

export const adapterProfile='vibelab-v2-r6-css-adapter-schema3';
export const productionInspectionProfile='vibelab-v2-r6-css-production-inspect-schema3';
export const productionProofImportProfile='vibelab-v2-r6-css-production-proof-import-schema3';
export const controllerPath='release-tools/r6-css-adapter.php';
// Caller selects a reviewed exact controller SHA; no controller from working tree.
export function prepareCssAdapter(sourceSha,controllerSourceSha,{readGit=git}={}){
 assert.match(controllerSourceSha??'',/^[a-f0-9]{40}$/,'Use an exact controller SHA');
 assert.equal(readGit(['rev-parse','--verify',controllerSourceSha+'^{commit}']).toString().trim(),controllerSourceSha,'Controller source differs');
 const entry=readGit(['ls-tree',controllerSourceSha,'--',controllerPath]).toString().trim();
 assert.match(entry,/^100644 blob [a-f0-9]{40}\trelease-tools\/r6-css-adapter\.php$/,'Controller must be a regular Git file');
 const receiver=readGit(['show',controllerSourceSha+':'+controllerPath]);
 assert.ok(receiver.length>0&&receiver.length<=131072,'Invalid controller size');
 const base=prepareR6CssCandidate(sourceSha,{readGit});
 const manifest={...base.manifest,profile:adapterProfile,scope:'theme-css-with-inspection-controller',changeClass:null,applicationChangeClass:'A',controllerReviewRequired:true,
  controller:{sourceSha:controllerSourceSha,path:'receiver.php',bytes:receiver.length,sha256:sha256(receiver),capabilities:['inspect-inbox']},
  requiredRemainingGates:[...base.manifest.requiredRemainingGates,'controller-review-CI','production-adapter-install-health-recovery']};
 const buffers={...base.buffers,'receiver.php':receiver};delete buffers['manifest.json'];
 manifest.files=Object.entries(buffers).map(([path,data])=>({path,bytes:data.length,sha256:sha256(data)}));
 buffers['manifest.json']=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
 return {manifest,buffers};
}
export function writeCssAdapter(source,controller,directory,options){
 const prepared=prepareCssAdapter(source,controller,options);assert.ok(!existsSync(directory),'Immutable output already exists');
 mkdirSync(directory,{recursive:true});for(const [name,data] of Object.entries(prepared.buffers))writeFileSync(join(directory,name),data);return prepared;
}
export function verifyCssAdapter(source,controller,directory,options){
 const prepared=prepareCssAdapter(source,controller,options);assert.deepEqual(readdirSync(directory).sort(),Object.keys(prepared.buffers).sort());
 for(const [name,data] of Object.entries(prepared.buffers)){const path=join(directory,name),stat=lstatSync(path);assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'Non-regular package entry');assert.ok(readFileSync(path).equals(data),'Package bytes differ: '+name);}
 return prepared.manifest;
}
export function prepareProductionInspectionAdapter(source,controller,options){
 const base=prepareCssAdapter(source,controller,options);
 assert.ok(base.buffers['receiver.php'].includes(Buffer.from('function vne_adapter_production_inspection_dispatch(')),'Controller lacks production inspection dispatcher');
 const manifest={...base.manifest,profile:productionInspectionProfile,scope:'production-inspection-only',productionPolicy:productionBindingPlan(),
  controller:{...base.manifest.controller,capabilities:['inspect-inbox','inspect-production-context','inspect-production-storage']},
  requiredRemainingGates:[...base.manifest.requiredRemainingGates,'production-key-proof-transport','production-writer-profile-review']};
 return {manifest,buffers:{...base.buffers,'manifest.json':Buffer.from(JSON.stringify(manifest,null,2)+'\n')}};
}
export function prepareProductionProofImportAdapter(source,controller,options){
 const base=prepareProductionInspectionAdapter(source,controller,options);
 assert.ok(base.buffers['receiver.php'].includes(Buffer.from('function vne_adapter_import_production_proof(')),'Controller lacks production proof import backend');
 const manifest={...base.manifest,profile:productionProofImportProfile,scope:'production-proof-import-only',
  controller:{...base.manifest.controller,capabilities:[...base.manifest.controller.capabilities,'import-production-proof']},
  productionProofImportPolicy:{applicationWrites:false,databaseWrites:false,createsKeys:false,requiresExistingJournal:true,requiresExistingKey:true},
  requiredRemainingGates:[...base.manifest.requiredRemainingGates,'private-proof-write-hosting-approval']};
 return {manifest,buffers:{...base.buffers,'manifest.json':Buffer.from(JSON.stringify(manifest,null,2)+'\n')}};
}
