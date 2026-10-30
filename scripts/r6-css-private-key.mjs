// Read-only private key access; no provisioning, ACL changes, key export or logging.
import assert from 'node:assert/strict';
import {constants,lstatSync,realpathSync,openSync,fstatSync,readSync,closeSync,readFileSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {inspectProductionKeyRecord,collectProductionHealthProof,validateProductionProofRequest} from './r6-css-production-proof.mjs';

const workspace=resolve(fileURLToPath(new URL('../',import.meta.url))),productionRoot=join(workspace,'.local/private/production');
function need(ok,message){assert.ok(ok,message);}
export function validateWindowsPrivateAcl(snapshot){
 need(snapshot&&typeof snapshot.currentSid==='string'&&Array.isArray(snapshot.nodes)&&snapshot.nodes.length===2,'Invalid private ACL inspection');
 const permitted=new Set([snapshot.currentSid,'S-1-5-18','S-1-5-32-544']);
 for(const node of snapshot.nodes){
  need(node.owner===snapshot.currentSid&&node.protected===true&&Array.isArray(node.rules)&&node.rules.length>0,'Private key ACL owner/protection differs');
  need(node.rules.some(rule=>rule.type==='Allow'&&rule.sid===snapshot.currentSid&&Number.isSafeInteger(rule.rights)&&rule.rights>0),'Private ACL lacks current-user access');
  for(const rule of node.rules)need((rule.type==='Allow'||rule.type==='Deny')&&Number.isSafeInteger(rule.rights)&&(rule.type!=='Allow'||permitted.has(rule.sid)),'Private key ACL grants another identity access');
 }return {status:'PRIVATE_WINDOWS_DACL_VERIFIED',keyReturned:false};
}
function windowsAcl(root,file){
 const encodedPaths=Buffer.from(JSON.stringify([root,file])).toString('base64');
 const script='$ErrorActionPreference="Stop";$sid=[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value;$paths=[System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("'+encodedPaths+'"))|ConvertFrom-Json;$nodes=@(foreach($path in $paths){$acl=Get-Acl -LiteralPath $path;$rules=@($acl.GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier])|ForEach-Object{@{sid=$_.IdentityReference.Value;type=$_.AccessControlType.ToString();rights=[long]$_.FileSystemRights}});@{owner=$acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value;protected=$acl.AreAccessRulesProtected;rules=$rules}});@{currentSid=$sid;nodes=$nodes}|ConvertTo-Json -Depth 8 -Compress';
 let result;try{result=JSON.parse(execFileSync('pwsh.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{encoding:'utf8',windowsHide:true,timeout:15000,maxBuffer:1048576}));}catch{throw new Error('Windows private ACL inspection failed; PowerShell7 required');}
 validateWindowsPrivateAcl(result);return result;
}
function checkedPath(path){
 const absolute=resolve(path);for(let part=absolute;;part=dirname(part)){need(!lstatSync(part).isSymbolicLink(),'Private key symlink/junction refused');if(part===dirname(part))break;}
 need(realpathSync(absolute)===absolute,'Private key canonical path differs');return lstatSync(absolute);
}
function sameFile(a,b){return a.dev===b.dev&&a.ino===b.ino&&a.size===b.size&&a.mtimeMs===b.mtimeMs&&a.ctimeMs===b.ctimeMs;}
function aclEqual(a,b){
 const canonical=s=>JSON.stringify({currentSid:s.currentSid,nodes:s.nodes.map(n=>({owner:n.owner,protected:n.protected,rules:n.rules.map(r=>[r.sid,r.type,r.rights]).sort()}))});return canonical(a)===canonical(b);
}
function load(root,fingerprint){
 need(typeof fingerprint==='string'&&fingerprint.length===64&&/^[a-f0-9]+$/.test(fingerprint),'Invalid public key fingerprint');
 const file=join(root,'health-key.json'),directory=checkedPath(root),before=checkedPath(file);
 need(directory.isDirectory()&&before.isFile()&&before.nlink===1&&before.size>0&&before.size<=4096,'Private key file type/links/size invalid');
 let acl;
 if(process.platform==='win32')acl=windowsAcl(root,file);
 else{need(typeof process.getuid==='function','Private key platform unsupported');need(directory.uid===process.getuid()&&before.uid===process.getuid()&&(directory.mode&0o777)===0o700&&(before.mode&0o777)===0o600,'Private key POSIX owner/mode differs');}
 let fd,bytes;
 try{
  fd=openSync(file,constants.O_RDONLY|(process.platform==='win32'?0:constants.O_NOFOLLOW));const opened=fstatSync(fd);need(sameFile(before,opened),'Private key changed before read');
  bytes=Buffer.alloc(before.size+1);let total=0;
  while(total<bytes.length){const count=readSync(fd,bytes,total,bytes.length-total,null);if(!count)break;total+=count;}
  need(total===before.size&&sameFile(before,fstatSync(fd))&&sameFile(before,checkedPath(file)),'Private key changed during read');
  const afterDirectory=checkedPath(root);need(sameFile(directory,afterDirectory),'Private directory changed during read');
  if(process.platform==='win32')need(aclEqual(acl,windowsAcl(root,file)),'Private key ACL changed during read');
  else need((afterDirectory.mode&0o777)===0o700&&(fstatSync(fd).mode&0o777)===0o600,'Private key permissions changed during read');
  let record;try{record=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,total)));}catch{throw new Error('Private key JSON invalid');}
  inspectProductionKeyRecord(record,fingerprint);return record;
 }finally{if(bytes)bytes.fill(0);if(fd!==undefined)closeSync(fd);}
}
function ignoredProductionStore(relativePath='.local/private/production/health-key.json'){
 try{
  execFileSync('git',['check-ignore','-q','--no-index','--',relativePath],{cwd:workspace,windowsHide:true,stdio:'pipe'});
  need(execFileSync('git',['ls-files','-z','--',relativePath],{cwd:workspace,windowsHide:true}).length===0,'Private key file is tracked');
 }catch{throw new Error('Private key store must be ignored and untracked');}
}
export function inspectProductionPrivateKey(fingerprint,...extra){
 need(extra.length===0,'Private key target override refused');ignoredProductionStore();const record=load(productionRoot,fingerprint);try{return inspectProductionKeyRecord(record,fingerprint);}finally{record.key='';}
}
export async function collectProductionProofFromPrivateStore(a,j,...extra){
 need(extra.length===0,'Private key target override refused');validateProductionProofRequest(a,j);ignoredProductionStore();const record=load(productionRoot,a.keyFingerprintSha256);
 try{return await collectProductionHealthProof(a,j,record);}finally{record.key='';}
}
function fixtureRoot(root,token){
 const absolute=resolve(root),base=resolve(workspace,'tmp/tests'),rel=relative(base,absolute);
 need(rel&&!rel.startsWith('..')&&!isAbsolute(rel)&&/^(?:r726-key|r729-lifecycle)-[a-zA-Z0-9]+$/.test(rel),'Owned key fixture required');
 need(typeof token==='string'&&/^[a-f0-9]{64}$/.test(token)&&token.length===64,'Invalid fixture token');
 checkedPath(absolute);const sentinel=join(absolute,'.key-fixture-owned'),stat=checkedPath(sentinel);need(stat.isFile()&&stat.nlink===1&&stat.size===64,'Invalid key fixture sentinel');need(readFileSync(sentinel,'utf8')===token,'Key fixture ownership differs');return join(absolute,'private');
}
export function inspectPrivateKeyFixture(root,token,fingerprint){
 const record=load(fixtureRoot(root,token),fingerprint);try{return inspectProductionKeyRecord(record,fingerprint);}finally{record.key='';}
}
export async function collectProofFromKeyFixture(root,token,a,j){
 validateProductionProofRequest(a,j);const record=load(fixtureRoot(root,token),a.keyFingerprintSha256);try{return await collectProductionHealthProof(a,j,record);}finally{record.key='';}
}
export function privateKeyFixtureStore(root,token){return fixtureRoot(root,token);}
export function inspectPrivateDirectory(path){
 const stat=checkedPath(path);need(stat.isDirectory(),'Private directory required');
 if(process.platform==='win32')windowsAcl(path,path);else need(stat.uid===process.getuid()&&(stat.mode&0o777)===0o700,'Private directory owner/mode differs');
 return {status:'PRIVATE_DIRECTORY_VERIFIED'};
}
export function inspectPrivateFilePermissions(root,file){
 need(dirname(resolve(file))===resolve(root),'Private file must be a direct child');const d=checkedPath(root),f=checkedPath(file);need(d.isDirectory()&&f.isFile()&&f.nlink===1,'Private file type/links invalid');
 if(process.platform==='win32')windowsAcl(root,file);else need(d.uid===process.getuid()&&f.uid===process.getuid()&&(d.mode&0o777)===0o700&&(f.mode&0o777)===0o600,'Private file owner/mode differs');
 return {status:'PRIVATE_FILE_PERMISSIONS_VERIFIED'};
}
function candidateId(value){need(typeof value==='string'&&value.length===32&&/^[a-f0-9]+$/.test(value),'Invalid key candidate ID');return value;}
export function inspectProductionKeyCandidate(id,fingerprint,...extra){
 need(extra.length===0,'Private candidate override refused');id=candidateId(id);ignoredProductionStore('.local/private/production/candidates/'+id+'/health-key.json');const record=load(join(productionRoot,'candidates',id),fingerprint);try{return inspectProductionKeyRecord(record,fingerprint);}finally{record.key='';}
}
export function inspectKeyCandidateFixture(root,token,id,fingerprint){
 const record=load(join(fixtureRoot(root,token),'candidates',candidateId(id)),fingerprint);try{return inspectProductionKeyRecord(record,fingerprint);}finally{record.key='';}
}
