import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync,writeFileSync,readdirSync,lstatSync} from 'node:fs';
import {join} from 'node:path';
import {policy,releaseContract,previousThemeRef} from './release-policy.mjs';

export function git(args){
 const r=spawnSync('git',args,{encoding:null,maxBuffer:32*1024*1024,windowsHide:true});
 assert.equal(r.status,0,r.stderr?.toString()||'Git read failed');return r.stdout;
}
export const sha256=b=>createHash('sha256').update(b).digest('hex');
export function resolveRef(ref){
 assert.match(ref,/^[A-Za-z0-9][A-Za-z0-9_./-]*$/,'Invalid source ref');
 return git(['rev-parse','--verify',ref+'^{commit}']).toString().trim();
}
export function sourceFiles(sha,kind,{previous=false}={}){
 assert.match(sha,/^[0-9a-f]{40}$/);
 const p=policy[kind];assert.ok(p,'Unknown component');
 const rows=git(['ls-tree','-rz',sha+':'+p.source]).toString().split('\0').filter(Boolean).map(row=>{
  const [mode,type,oid,name]=row.split(/[\t ]/);return {mode,type,oid,name};
 });
 const expected=validateSourceTree(rows,kind,{previous});
 return expected.map(name=>({name:policy[kind].slug+'/'+name,data:git(['show',sha+':'+p.source+'/'+name])}));
}
export function validateSourceTree(rows,kind,{previous=false}={}){
 const p=policy[kind];assert.ok(p,'Unknown component');
 const expected=previous?p.files.filter(n=>n!=='seo.php'):p.files;
 assert.deepEqual(rows.map(r=>r.name).sort(),[...expected,'README.md'].sort(),'Component tree must match allowlist plus excluded README');
 for(const row of rows)assert.ok(row.mode==='100644'&&row.type==='blob','Reject executable, symlink or submodule '+row.name);
 return expected;
}
function version(files,kind){
 const file=files.find(f=>f.name===policy[kind].slug+'/'+policy[kind].header);
 const match=file.data.toString().match(/^\s*(?:\*\s*)?Version:\s*(\d+\.\d+\.\d+)\s*$/m);
 assert.ok(match,'Missing component version');return match[1];
}
const crcTable=Array.from({length:256},(_,i)=>{for(let j=0;j<8;j++)i=(i>>>1)^((i&1)?0xedb88320:0);return i>>>0;});
function crc32(b){let c=0xffffffff;for(const v of b)c=crcTable[(c^v)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
// ZIP STORE, fixed DOS epoch, sorted UTF-8 paths. No timestamps or machine paths.
export function makeZip(files){
 const local=[],central=[];let offset=0;
 for(const f of [...files].sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){
  assert.match(f.name,/^[a-z0-9][a-z0-9_/-]*\.[a-z]+$/);assert.ok(!f.name.includes('..'));
  const name=Buffer.from(f.name),crc=crc32(f.data),h=Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(33,12);
  h.writeUInt32LE(crc,14);h.writeUInt32LE(f.data.length,18);h.writeUInt32LE(f.data.length,22);h.writeUInt16LE(name.length,26);
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(33,14);
  c.writeUInt32LE(crc,16);c.writeUInt32LE(f.data.length,20);c.writeUInt32LE(f.data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);
  local.push(h,name,f.data);central.push(c,name);offset+=h.length+name.length+f.data.length;
 }
 const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...local,cd,end]);
}
export function prepareRelease(ref){
 const sha=resolveRef(ref),components={},buffers={};
 for(const kind of ['plugin','theme']){
  const files=sourceFiles(sha,kind),v=version(files,kind);assert.equal(v,releaseContract[kind],'Unreviewed version pair');
  const archive=policy[kind].slug+'-'+v+'.zip',data=makeZip(files);buffers[archive]=data;
  components[kind]={slug:policy[kind].slug,version:v,sourceTree:git(['rev-parse',sha+':'+policy[kind].source]).toString().trim(),archive,sha256:sha256(data),bytes:data.length,files:files.map(f=>({path:f.name,bytes:f.data.length,sha256:sha256(f.data)}))};
 }
 const model=git(['show',sha+':plugins/vne-library-core/model.php']).toString();
 assert.match(model,/update_option\('vne_library_schema_version',3,false\)/,'Unexpected schema');
 const manifest={format:1,sourceSha:sha,sourceCommitTime:git(['show','-s','--format=%cI',sha]).toString().trim(),schemaVersion:releaseContract.schema,
  runtime:{phpMinimum:'8.3',wordpressMinimum:'6.6',hostingValidation:'pending S15'},
  compatibility:{candidate:{plugin:releaseContract.plugin,theme:releaseContract.theme},intermediate:{plugin:releaseContract.plugin,theme:releaseContract.previousTheme,previousThemeSource:previousThemeRef},validation:'local fixture only; see S14 evidence; staging and owner acceptance still required'},
  sequence:['plugin payload','confirm plugin version/schema/health','theme payload','confirm theme version and public flows','cache verification'],
  approval:{purpose:'local S14 release candidate',deployAuthorized:false,productionSourceMustBeApprovedSeparately:true},components};
 buffers['manifest.json']=Buffer.from(JSON.stringify(manifest,null,2)+'\n');return {manifest,buffers};
}
export function writeRelease(ref,dir){
 assert.ok(!existsSync(dir),'Refuse to overwrite release directory');
 const result=prepareRelease(ref);mkdirSync(dir,{recursive:true});
 for(const [name,b]of Object.entries(result.buffers))writeFileSync(join(dir,name),b);
 return result.manifest;
}
export function verifyRelease(dir,ref){
 const expected=prepareRelease(ref);
 assert.deepEqual(readdirSync(dir).sort(),Object.keys(expected.buffers).sort(),'Unexpected release files');
 for(const [name,b]of Object.entries(expected.buffers)){
  const path=join(dir,name);assert.ok(lstatSync(path).isFile()&&!lstatSync(path).isSymbolicLink(),'Not a regular release file');
  assert.equal(sha256(readFileSync(path)),sha256(b),'Release bytes differ: '+name);
 }
 return expected.manifest;
}
// This reducer never deploys: confirmations are fixture data, not remote health.
export function dryRunGate({plugin,theme}){
 const events=['plugin attempted'];
 if(plugin!=='confirmed')return {state:'STOP_PLUGIN',events:[...events,'theme blocked','no database rollback']};
 events.push('plugin version/schema/health confirmed','theme attempted');
 if(theme!=='confirmed')return {state:'RESTORE_THEME_KEEP_PLUGIN',events:[...events,'restore previous theme files','verify intermediate compatible pair','no database rollback']};
 return {state:'AWAIT_CACHE_CHECK',events:[...events,'theme health confirmed','cache confirmation still required']};
}
