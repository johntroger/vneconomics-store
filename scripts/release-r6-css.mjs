import assert from 'node:assert/strict';
import {existsSync,lstatSync,mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {git,makeZip,sha256} from './release-lib.mjs';

// One baseline, one version transition. This module never publishes or installs.
export const r6CssProfile=Object.freeze({
 id:'vibelab-v2-r6-css-schema3',
 source:'50437bd16eae1912d8cffea093401449786faaea',
 payload:'fa4c67821008e0fcc4307fedf202bcdf95b85bb6',
 manifestSha256:'1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2',
 themeVersion:'2.0.1',pluginVersion:'0.4.4',schema:3,
});
const cssPath='themes/vibelab-v2/style.css';
export function prepareR6CssCandidate(sourceSha,{readGit=git}={}){
 assert.match(sourceSha??'',/^[a-f0-9]{40}$/,'Use an exact lowercase source SHA');
 assert.equal(readGit(['rev-parse','--verify',sourceSha+'^{commit}']).toString().trim(),sourceSha,'Source resolution mismatch');
 const raw=readGit(['show',r6CssProfile.payload+':manifest.json']);
 assert.equal(sha256(raw),r6CssProfile.manifestSha256,'R6 manifest pin differs');
 const baseline=JSON.parse(raw);
 assert.equal(baseline.sourceSha,r6CssProfile.source);assert.equal(baseline.themeVersion,'2.0.0');
 assert.equal(baseline.pluginVersion,'0.4.4');assert.equal(baseline.schema,3);
 const changed=readGit(['diff','--name-only',r6CssProfile.source,sourceSha,'--','themes','plugins','deploy']).toString().trim().split(/\r?\n/).filter(Boolean);
 assert.deepEqual(changed,[cssPath],'Only a real change to v2 style.css is permitted; no-op and logic/data changes are rejected');
 const rows=readGit(['ls-tree','-rz',sourceSha+':themes/vibelab-v2']).toString().split('\0').filter(Boolean);
 assert.ok(rows.every(row=>/^100644 blob [a-f0-9]{40}\t/.test(row)),'Theme entries must be regular non-executable files');
 const cssBytes=readGit(['show',sourceSha+':'+cssPath]),css=cssBytes.toString('utf8');
 assert.ok(Buffer.from(css,'utf8').equals(cssBytes),'CSS must be valid UTF-8');
 assert.ok(Buffer.byteLength(css)<=256*1024,'CSS exceeds reviewed size limit');
 assert.doesNotMatch(css,/[\\<\x00-\x08\x0b\x0c\x0e-\x1f]/,'Escapes, markup or control bytes require a different profile');
 assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g,''),/@import\b|url\s*\(|expression\s*\(/i,'Network/legacy executable CSS requires a different profile');
 assert.equal((css.match(/^Version: 2\.0\.0\r?$/gm)||[]).length,1,'Input theme must retain the R6 version header');
 const oldTheme=baseline.components.theme,oldPlugin=baseline.components.plugin;
 const previousTheme=readGit(['show',r6CssProfile.payload+':theme.zip']);
 const plugin=readGit(['show',r6CssProfile.payload+':plugin.zip']);
 assert.equal(sha256(previousTheme),oldTheme.sha256,'R6 theme ZIP differs');
 assert.equal(sha256(plugin),oldPlugin.sha256,'R6 plugin ZIP differs');
 assert.equal(previousTheme.length,oldTheme.bytes);assert.equal(plugin.length,oldPlugin.bytes);
 const original=oldTheme.files.map(file=>{
  assert.match(file.path,/^vibelab-v2\/[a-z0-9_/-]+\.(?:php|css)$/);assert.ok(!file.path.includes('..'));
  const data=readGit(['show',r6CssProfile.source+':themes/'+file.path]);
  assert.equal(sha256(data),file.sha256,'Baseline source/ZIP member mismatch');assert.equal(data.length,file.bytes);
  return {name:file.path,data};
 });
 assert.equal(sha256(makeZip(original)),oldTheme.sha256,'Baseline archive is not reproduced exactly');
 const marker='r6-css-'+sourceSha.slice(0,12);
 const themeFiles=original.map(file=>{
  if(file.name==='vibelab-v2/style.css')return {...file,data:Buffer.from(css.replace(/^Version: 2\.0\.0(?=\r?$)/m,'Version: '+r6CssProfile.themeVersion))};
  if(file.name==='vibelab-v2/functions.php'){
   let text=file.data.toString();
   for(const [from,to] of [["define('VIBELAB_V2_VERSION', '2.0.0');",`define('VIBELAB_V2_VERSION', '${r6CssProfile.themeVersion}');`],["define('VIBELAB_V2_RELEASE_MARKER', 'r52-v2-20261028');",`define('VIBELAB_V2_RELEASE_MARKER', '${marker}');`]]){
    assert.equal(text.split(from).length,2,'Identity stamp must have exactly one reviewed replacement');text=text.replace(from,to);
   }
   return {...file,data:Buffer.from(text)};
  }
  return file;
 });
 const theme=makeZip(themeFiles),buffers={'theme.zip':theme,'plugin.zip':plugin,'previous-theme.zip':previousTheme,'previous-plugin.zip':plugin};
 const members=files=>files.map(file=>({path:file.name,bytes:file.data.length,sha256:sha256(file.data)}));
 const descriptor=(archive,files)=>({archive,bytes:buffers[archive].length,sha256:sha256(buffers[archive]),files});
 const manifest={format:1,profile:r6CssProfile.id,sourceSha,schema:3,changeClass:'A',scope:'theme-css-only',
  productionBaselineSource:r6CssProfile.source,productionBaselinePayload:r6CssProfile.payload,productionBaselineManifestSha256:r6CssProfile.manifestSha256,
  expectedProductionParent:r6CssProfile.payload,themeVersion:r6CssProfile.themeVersion,themeMarker:marker,pluginVersion:'0.4.4',pluginUnchanged:true,
  sourceChanges:[cssPath],generatedIdentityFiles:['vibelab-v2/style.css','vibelab-v2/functions.php'],
  components:{theme:descriptor('theme.zip',members(themeFiles)),plugin:descriptor('plugin.zip',oldPlugin.files),'previous-theme':descriptor('previous-theme.zip',oldTheme.files),'previous-plugin':descriptor('previous-plugin.zip',oldPlugin.files)},
  files:Object.entries(buffers).map(([path,data])=>({path,bytes:data.length,sha256:sha256(data)})),
  installPolicy:{themeOnly:true,reinstallPlugin:false,switchTheme:false,restoreDatabase:false,applicationDataWrites:false,nativeCacheRefreshPossible:true},
  approval:{candidateOnly:true,deployAuthorized:false},requiredRemainingGates:['exact-source-CI','native-install-rollback','visual-review','payload-commit','owner-production-approval','live-baseline-lock-health-receipt']};
 buffers['manifest.json']=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
 return {manifest,buffers};
}
export function writeR6CssCandidate(source,directory,options){
 const prepared=prepareR6CssCandidate(source,options);assert.ok(!existsSync(directory),'Immutable output already exists');
 mkdirSync(directory,{recursive:true});for(const [name,data] of Object.entries(prepared.buffers))writeFileSync(join(directory,name),data);
 return prepared.manifest;
}
export function verifyR6CssCandidate(source,directory,options){
 const prepared=prepareR6CssCandidate(source,options);assert.deepEqual(readdirSync(directory).sort(),Object.keys(prepared.buffers).sort());
 for(const [name,data] of Object.entries(prepared.buffers)){
  const path=join(directory,name),stat=lstatSync(path);assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'Candidate members must be regular files');
  assert.equal(sha256(readFileSync(path)),sha256(data),'Candidate bytes differ: '+name);
 }
 return prepared.manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [mode,source,...extra]=process.argv.slice(2);assert.ok(mode==='build'&&extra.length===0,'Use build <exact source SHA>');
 const directory=resolve('artifacts/r6-css',source??'invalid');const manifest=writeR6CssCandidate(source,directory);verifyR6CssCandidate(source,directory);
 console.log(JSON.stringify({status:'LOCAL_CANDIDATE_ONLY',profile:manifest.profile,sourceSha:source,directory,deployAuthorized:false},null,2));
}
