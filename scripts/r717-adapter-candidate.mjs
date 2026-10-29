// Frozen rehearsal source/controller. No ref publication, host access or key input.
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {git,sha256} from './release-lib.mjs';
import {r6CssProfile} from './release-r6-css.mjs';
import {prepareCssAdapter,writeCssAdapter,verifyCssAdapter} from './release-r6-css-adapter.mjs';

export const r717=Object.freeze({
 source:'364e89f6b2a053c48937606ab6bba73200bfffcb',
 controller:'f7f060466cd57457ed7adc1c165b8c035ed11ff2',
 directory:'artifacts/r717-adapter/files',
 evidence:'artifacts/r717-adapter/evidence',
});
const six=['manifest.json','plugin.zip','previous-plugin.zip','previous-theme.zip','receiver.php','theme.zip'];
function executor(){
 const checkout=git(['rev-parse','HEAD']).toString().trim(),source=process.env.ORCHESTRATOR_SOURCE_SHA||checkout;
 assert.match(source,/^[a-f0-9]{40}$/);assert.equal(source.length,40);assert.equal(git(['rev-parse','--verify',source+'^{commit}']).toString().trim(),source);
 const clean=git(['status','--porcelain','--untracked-files=no']).toString().trim()==='';
 const versioned=git(['ls-tree',source,'--','scripts/r717-adapter-candidate.mjs']).toString().trim()!=='';
 const matches=versioned&&git(['diff','--name-only',source,'HEAD']).toString().trim()==='';
 if(process.env.CI==='true'){assert.ok(clean,'CI checkout has tracked changes');assert.ok(matches,'Executor checkout differs from exact orchestrator source');}
 return {orchestratorSourceSha:source,executorCheckoutSha:checkout,executorClean:clean,executorVersioned:versioned,executorTreeMatches:matches};
}
export function verifyR717(){
 const directory=resolve(r717.directory),prepared=prepareCssAdapter(r717.source,r717.controller);
 verifyCssAdapter(r717.source,r717.controller,directory);
 assert.deepEqual(readdirSync(directory).sort(),six);
 assert.equal(prepared.manifest.approval.deployAuthorized,false);
 assert.deepEqual(prepared.manifest.controller.capabilities,['inspect-inbox']);
 assert.equal(prepared.manifest.expectedProductionParent,r6CssProfile.payload);
 return prepared;
}
export function buildR717(){
 const prepared=existsSync(r717.directory)?verifyR717():(writeCssAdapter(r717.source,r717.controller,r717.directory),verifyR717());
 const receipt={format:1,status:'R717_REHEARSAL_PACKAGE_VERIFIED',...executor(),sourceSha:r717.source,controllerSourceSha:r717.controller,profile:prepared.manifest.profile,expectedProductionParent:r6CssProfile.payload,manifestSha256:sha256(prepared.buffers['manifest.json']),controllerSha256:sha256(prepared.buffers['receiver.php']),files:six.map(path=>({path,bytes:prepared.buffers[path].length,sha256:sha256(prepared.buffers[path])})),rehearsalOnly:true,deployAuthorized:false,payloadPublished:false,privateStateIncluded:false};
 mkdirSync(r717.evidence,{recursive:true});
 // Different local/CI executor receipts have their own filename; never relabel one.
 const name='package-'+receipt.orchestratorSourceSha+'-'+(receipt.executorClean?'clean':'working')+'.json',path=join(r717.evidence,name),bytes=JSON.stringify(receipt,null,2)+'\n';
 if(existsSync(path))assert.equal(readFileSync(path,'utf8'),bytes,'Existing package receipt differs');else writeFileSync(path,bytes,{flag:'wx'});
 return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 assert.equal(process.argv.length,2,'Frozen rehearsal accepts no arguments');
 console.log(JSON.stringify(buildR717()));
}
