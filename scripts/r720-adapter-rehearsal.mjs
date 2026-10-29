// Frozen package rehearsal: no host, key input, ref publication or deploy permission.
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {git,sha256} from './release-lib.mjs';
import {r6CssProfile} from './release-r6-css.mjs';
import {prepareCssAdapter,writeCssAdapter,verifyCssAdapter} from './release-r6-css-adapter.mjs';

const native=process.argv.length===3&&process.argv[2]==='--native';
assert.ok(process.argv.length===2||native,'Use optional --native; no source/target overrides');
const source='364e89f6b2a053c48937606ab6bba73200bfffcb',controller='1f37575347a70a833b4920cf8fbbdf7a49312b50';
const directory=resolve('artifacts/r720-adapter/files'),evidence=resolve('artifacts/r720-adapter/evidence');
const checkout=git(['rev-parse','HEAD']).toString().trim(),orchestrator=process.env.ORCHESTRATOR_SOURCE_SHA||checkout;
assert.equal(orchestrator.length,40);assert.match(orchestrator,/^[a-f0-9]+$/);
const clean=git(['status','--porcelain','--untracked-files=no']).toString().trim()==='';
const versioned=git(['ls-tree',orchestrator,'--','scripts/r720-adapter-rehearsal.mjs']).toString().trim()!=='';
const treeMatches=versioned&&git(['diff','--name-only',orchestrator,'HEAD']).toString().trim()==='';
if(process.env.CI==='true'){assert.ok(clean&&versioned&&treeMatches,'CI requires exact clean versioned orchestrator tree');assert.ok(native,'CI must test the actual package natively');}
const prepared=prepareCssAdapter(source,controller),checks=[];
if(!existsSync(directory))writeCssAdapter(source,controller,directory);
verifyCssAdapter(source,controller,directory);
assert.equal(Object.keys(prepared.buffers).length,6);checks.push('actual six-file package equals canonical source/controller Git build');
assert.equal(prepared.manifest.approval.deployAuthorized,false);assert.deepEqual(prepared.manifest.controller.capabilities,['inspect-inbox']);checks.push('importer controller retains inspect-only production capability and no deploy approval');
const old=prepareCssAdapter(source,'f7f060466cd57457ed7adc1c165b8c035ed11ff2');
for(const name of ['theme.zip','plugin.zip','previous-theme.zip','previous-plugin.zip'])assert.ok(prepared.buffers[name].equals(old.buffers[name]));
assert.ok(!prepared.buffers['receiver.php'].equals(old.buffers['receiver.php']));checks.push('only controller and manifest differ from R717; all four application archives unchanged');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/r720-package-')),repo=join(fixture,'git');
const inGit=(args,input,cwd=repo)=>{const r=spawnSync('git',args,{cwd,input,encoding:null,windowsHide:true,maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr?.toString());return r.stdout.toString().trim();};
inGit(['clone','--shared','--no-checkout',resolve('.'),repo],undefined,fixture);
inGit(['config','user.name','R720 fixture']);inGit(['config','user.email','fixture@example.invalid']);
const files=Object.keys(prepared.buffers).sort().map(path=>({path,bytes:prepared.buffers[path].length,sha256:sha256(prepared.buffers[path])}));
const rows=files.map(({path})=>'100644 blob '+inGit(['hash-object','-w','--stdin'],prepared.buffers[path])+'\t'+path+'\n');
const tree=inGit(['mktree'],rows.join('')),payload=inGit(['commit-tree',tree,'-p',r6CssProfile.payload,'-m','R720 isolated fixture; never publish']);
function validate(s=source,p=r6CssProfile.payload,profile=prepared.manifest.profile){return spawnSync(process.execPath,[resolve('scripts/validate-payload-commit.mjs'),payload,s,p,profile],{cwd:repo,encoding:'utf8',windowsHide:true});}
assert.equal(validate().status,0);for(const [s,p,id] of [['a'.repeat(40),r6CssProfile.payload,prepared.manifest.profile],[source,'a'.repeat(40),prepared.manifest.profile],[source,r6CssProfile.payload,r6CssProfile.id]])assert.notEqual(validate(s,p,id).status,0);
checks.push('real six-file Git payload has R6 parent; three source/parent/profile mismatches rejected');
assert.ok(readFileSync(join(directory,'receiver.php')).equals(git(['show',controller+':release-tools/r6-css-adapter.php'])));checks.push('transport importer is exact pinned Git controller blob rather than working file');
const receipt={format:1,status:'FAIL_R720',native,sourceSha:source,controllerSourceSha:controller,orchestratorSourceSha:orchestrator,executorCheckoutSha:checkout,executorClean:clean,executorVersioned:versioned,executorTreeMatches:treeMatches,profile:prepared.manifest.profile,manifestSha256:sha256(prepared.buffers['manifest.json']),files,checks,payloadFixtureOnly:payload,expectedProductionParent:r6CssProfile.payload,rehearsalOnly:true,deployAuthorized:false,payloadPublished:false,privateStateIncluded:false};
const deadline=setTimeout(()=>{console.error('R720 actual package test exceeded600seconds');process.exit(1);},600000);deadline.unref();
mkdirSync(evidence,{recursive:true});
try{
 if(native){const {exerciseAdapterRuntime}=await import('./test-r6-css-adapter-runtime.mjs');checks.push(...await exerciseAdapterRuntime({fixture,prepared,payload}));}
 verifyCssAdapter(source,controller,directory);checks.push('package remains byte identical after policy/native checks');
 receipt.status=native?'PASS_R720_ACTUAL_PACKAGE_NATIVE':'PASS_R720_PACKAGE_POLICY';
}catch(error){receipt.error=String(error.stack??error);throw error;}
finally{
 clearTimeout(deadline);const path=join(evidence,'package-'+orchestrator+'-'+(clean?'clean':'working')+'.json'),bytes=JSON.stringify(receipt,null,2)+'\n';
 if(existsSync(path))assert.equal(readFileSync(path,'utf8'),bytes,'Existing immutable receipt differs');else writeFileSync(path,bytes,{flag:'wx'});
 console.log(JSON.stringify(receipt));
}
