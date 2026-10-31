// Theme-only packages from immutable Git objects. No hosting, key or database operations.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,lstatSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {git,makeZip,sha256} from './release-lib.mjs';
export const themeReleaseProfile='vibelab-v2-theme-update-schema3';
export const themePayloadNames=['manifest.json','plugin.zip','previous-plugin.zip','previous-theme.zip','theme.zip'];
export const hex=(value,n)=>typeof value==='string'&&value.length===n&&!/[^a-f0-9]/.test(value);
const semver=v=>{assert.match(v??'',/^\d+\.\d+\.\d+$/);const n=v.split('.').map(Number);assert.ok(n.every(Number.isSafeInteger));return n;};
export function canonicalZipFiles(bytes,descriptor,prefix){
 assert.ok(Buffer.isBuffer(bytes)&&bytes.length<=10*1024*1024);assert.equal(bytes.length,descriptor.bytes);assert.equal(sha256(bytes),descriptor.sha256);
 const files=[];let p=0;
 while(p+30<=bytes.length&&bytes.readUInt32LE(p)===0x04034b50){
  assert.equal(bytes.readUInt16LE(p+6),0x800);assert.equal(bytes.readUInt16LE(p+8),0,'Only canonical STORE archives');
  const size=bytes.readUInt32LE(p+18),rawSize=bytes.readUInt32LE(p+22),len=bytes.readUInt16LE(p+26),extra=bytes.readUInt16LE(p+28);assert.equal(size,rawSize);assert.equal(extra,0);
  const end=p+30+len+size;assert.ok(end<=bytes.length&&files.length<100);const name=bytes.subarray(p+30,p+30+len).toString('utf8');
  assert.ok(name.startsWith(prefix+'/')&&!name.includes('..')&&/^[a-z0-9_/-]+\.(?:php|css)$/.test(name),'Unsafe archive member');files.push({name,data:bytes.subarray(p+30+len,end)});p=end;
 }
 assert.ok(files.length>0);assert.ok(makeZip(files).equals(bytes),'Noncanonical archive/CRC/central directory');
 assert.deepEqual(files.map(f=>({path:f.name,bytes:f.data.length,sha256:sha256(f.data)})).sort((a,b)=>a.path.localeCompare(b.path)),[...descriptor.files].sort((a,b)=>a.path.localeCompare(b.path)),'Archive members differ');return files;
}
export function prepareThemeRelease(sourceSha,baseline,{readGit=git}={}){
 assert.ok(hex(sourceSha,40)&&hex(baseline?.payloadSha,40)&&hex(baseline?.manifestSha256,64),'Exact source/baseline pins required');
 assert.deepEqual(Object.keys(baseline).sort(),['manifestSha256','payloadSha']);assert.equal(readGit(['rev-parse','--verify',sourceSha+'^{commit}']).toString().trim(),sourceSha);
 const raw=readGit(['show',baseline.payloadSha+':manifest.json']);assert.equal(sha256(raw),baseline.manifestSha256,'Baseline manifest pin differs');const old=JSON.parse(raw);
 assert.ok(['vibelab-v2-cutover-schema3','vibelab-v2-r6-css-schema3',themeReleaseProfile].includes(old.profile),'Unsupported application baseline');assert.ok(hex(old.sourceSha,40));assert.equal(old.schema,3);assert.equal(old.pluginVersion,'0.4.4');
 const previousTheme=readGit(['show',baseline.payloadSha+':theme.zip']),plugin=readGit(['show',baseline.payloadSha+':plugin.zip']);
 canonicalZipFiles(previousTheme,old.components.theme,'vibelab-v2');canonicalZipFiles(plugin,old.components.plugin,'vne-library-core');
 const allowed=old.components.theme.files.map(f=>'themes/'+f.path).sort();
 const changed=readGit(['diff','--name-only',old.sourceSha,sourceSha,'--','themes','plugins','deploy']).toString().trim().split(/\r?\n/).filter(Boolean);
 // The baseline receipt is controller configuration, not an application payload.
 const appChanges=changed.filter(p=>p!=='deploy/theme-release-baseline.json'&&p!=='themes/vibelab-v2/README.md');
 assert.ok(appChanges.every(p=>allowed.includes(p)),'Only existing v2 theme files may change; plugin/schema/deploy changes need a separate release');
 if(!appChanges.length)return {review:{status:'NO_APPLICATION_CHANGE',sourceSha,baselinePayload:baseline.payloadSha,baselineManifestSha256:baseline.manifestSha256,profile:themeReleaseProfile,deployAuthorized:false},manifest:null,buffers:{}};
 const rows=readGit(['ls-tree','-rz',sourceSha+':themes/vibelab-v2']).toString().split('\0').filter(Boolean).map(r=>{const m=r.match(/^100644 blob [a-f0-9]{40}\t(.+)$/);assert.ok(m,'Nonregular theme member');return m[1];});
 assert.deepEqual(rows.map(n=>'themes/vibelab-v2/'+n).sort(),[...allowed,'themes/vibelab-v2/README.md'].sort(),'Theme source allowlist differs');
 const files=rows.filter(n=>n!=='README.md').map(n=>{const data=readGit(['show',sourceSha+':themes/vibelab-v2/'+n]);assert.ok(data.length<=512*1024&&Buffer.from(data.toString('utf8')).equals(data),'Theme text size/UTF8 differs');return {name:'vibelab-v2/'+n,data};});
 const v=semver(old.themeVersion);v[2]++;const version=v.join('.'),marker='theme-'+sourceSha.slice(0,12),css=files.find(f=>f.name.endsWith('/style.css')),functions=files.find(f=>f.name==='vibelab-v2/functions.php');
 const header=/^Version: (\d+\.\d+\.\d+)\r?$/gm,headers=[...css.data.toString().matchAll(header)];assert.equal(headers.length,1,'Single source version header required');const input=semver(headers[0][1]);assert.ok(input[0]===v[0]&&input[1]===v[1]&&input[2]<=v[2],'Source version requires another profile');
 const functionVersion=/define\('VIBELAB_V2_VERSION', '(\d+\.\d+\.\d+)'\);/g,found=[...functions.data.toString().matchAll(functionVersion)];assert.equal(found.length,1);assert.equal(found[0][1],headers[0][1],'Source version stamps disagree');
 css.data=Buffer.from(css.data.toString().replace(header,'Version: '+version));let text=functions.data.toString().replace(functionVersion,"define('VIBELAB_V2_VERSION', '"+version+"');");
 const mark=/define\('VIBELAB_V2_RELEASE_MARKER', '([a-z0-9-]{1,80})'\);/g;assert.equal([...text.matchAll(mark)].length,1);functions.data=Buffer.from(text.replace(mark,"define('VIBELAB_V2_RELEASE_MARKER', '"+marker+"');"));
 const buffers={'theme.zip':makeZip(files),'plugin.zip':plugin,'previous-theme.zip':previousTheme,'previous-plugin.zip':plugin};assert.ok(buffers['theme.zip'].length<=10*1024*1024,'Theme archive exceeds profile size');
 const members=files.map(f=>({path:f.name,bytes:f.data.length,sha256:sha256(f.data)}));const component=(archive,files)=>({archive,bytes:buffers[archive].length,sha256:sha256(buffers[archive]),files});
 const manifest={format:1,profile:themeReleaseProfile,sourceSha,schema:3,scope:'theme-only',changeClass:appChanges.length===1&&appChanges[0].endsWith('/style.css')?'A':'B',
  productionBaselineSource:old.sourceSha,productionBaselinePayload:baseline.payloadSha,productionBaselineManifestSha256:baseline.manifestSha256,expectedProductionParent:baseline.payloadSha,baselineThemeVersion:old.themeVersion,
  themeVersion:version,themeMarker:marker,pluginVersion:'0.4.4',pluginUnchanged:true,sourceChanges:appChanges,generatedIdentityFiles:['vibelab-v2/style.css','vibelab-v2/functions.php'],
  components:{theme:component('theme.zip',members),plugin:component('plugin.zip',old.components.plugin.files),'previous-theme':component('previous-theme.zip',old.components.theme.files),'previous-plugin':component('previous-plugin.zip',old.components.plugin.files)},
  files:Object.entries(buffers).map(([path,data])=>({path,bytes:data.length,sha256:sha256(data)})),installPolicy:{themeOnly:true,reinstallPlugin:false,switchTheme:false,restoreDatabase:false,applicationDataWrites:false,nativeCacheRefreshPossible:true},
  approval:{candidateOnly:true,deployAuthorized:false},requiredRemainingGates:['exact-source-CI','native-install-rollback','visual-review','owner-production-approval','live-baseline-backup-health-receipt']};
 buffers['manifest.json']=Buffer.from(JSON.stringify(manifest,null,2)+'\n');return {manifest,buffers,review:{status:'THEME_CANDIDATE',sourceSha,baselinePayload:baseline.payloadSha,manifestSha256:sha256(buffers['manifest.json']),themeVersion:version,changeClass:manifest.changeClass,sourceChanges:appChanges,deployAuthorized:false}};
}
export function assertReviewPath(path){for(let p=resolve(path);;p=dirname(p)){const s=lstatSync(p,{throwIfNoEntry:false});if(s)assert.ok(!s.isSymbolicLink(),'Review path symlink/junction refused');if(p===dirname(p))break;}}
export function writeThemeRelease(prepared,directory){assertReviewPath(directory);assert.ok(!existsSync(directory),'Immutable review output exists');mkdirSync(directory,{recursive:true});for(const [name,data] of Object.entries(prepared.buffers))writeFileSync(join(directory,name),data,{flag:'wx'});writeFileSync(join(directory,'review.json'),JSON.stringify(prepared.review,null,2)+'\n',{flag:'wx'});}
export function verifyThemeDirectory(directory){
 const names=readdirSync(directory).sort();assert.deepEqual(names.filter(n=>n!=='verification.json'),[...themePayloadNames,'native-proof.json','review.json','test-result.json'].sort());for(const n of names)assert.ok(lstatSync(join(directory,n)).isFile()&&!lstatSync(join(directory,n)).isSymbolicLink());
 const m=JSON.parse(readFileSync(join(directory,'manifest.json')));assert.equal(m.profile,themeReleaseProfile);assert.equal(m.approval.deployAuthorized,false);assert.deepEqual(m.files.map(f=>f.path).sort(),themePayloadNames.filter(n=>n!=='manifest.json'));
 for(const f of m.files){const b=readFileSync(join(directory,f.path));assert.equal(b.length,f.bytes);assert.equal(sha256(b),f.sha256);}const p=JSON.parse(readFileSync(join(directory,'native-proof.json')));assert.equal(p.status,'PASS_NATIVE_THEME_RELEASE');assert.equal(p.sourceSha,m.sourceSha);assert.equal(p.fixtureOnly,false);assert.equal(p.manifestSha256,sha256(readFileSync(join(directory,'manifest.json'))));return m;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const [mode,source,...extra]=process.argv.slice(2);assert.ok(mode==='build'&&extra.length===0);const baseline=JSON.parse(readFileSync('deploy/theme-release-baseline.json'));const p=prepareThemeRelease(source,baseline),directory=resolve('artifacts/theme-release',source);writeThemeRelease(p,directory);console.log(JSON.stringify({...p.review,directory}));}
