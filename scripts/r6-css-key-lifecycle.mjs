// Stage inactive key candidates only. No activation, active-key replacement or server API.
import assert from 'node:assert/strict';
import {existsSync,lstatSync,realpathSync,mkdirSync,openSync,closeSync,writeSync,fstatSync,readFileSync,chmodSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {sha256} from './release-lib.mjs';
import {inspectProductionKeyRecord} from './r6-css-production-proof.mjs';
import {productionBindingPlan} from './r6-css-operator.mjs';
import {privateKeyFixtureStore,inspectPrivateDirectory,inspectPrivateFilePermissions,inspectProductionPrivateKey,inspectPrivateKeyFixture,inspectProductionKeyCandidate,inspectKeyCandidateFixture} from './r6-css-private-key.mjs';

const workspace=resolve(fileURLToPath(new URL('../',import.meta.url)));
function need(ok,message){assert.ok(ok,message);}
function validate(a){
 need(a&&Object.getPrototypeOf(a)===Object.prototype,'Plain key stage approval required');
 need(JSON.stringify(Object.keys(a).sort())===JSON.stringify(['expectedActiveFingerprint','keyStageApproved','kind','operationId','target']),'Key stage approval fields differ');
 need(a.keyStageApproved===true&&a.target===productionBindingPlan().home&&['initial','rotation'].includes(a.kind),'Key stage scope differs');
 need(typeof a.operationId==='string'&&a.operationId.length===32&&/^[a-f0-9]+$/.test(a.operationId),'Invalid key stage operation ID');
 need(a.kind==='initial'?a.expectedActiveFingerprint===null:typeof a.expectedActiveFingerprint==='string'&&a.expectedActiveFingerprint.length===64&&/^[a-f0-9]+$/.test(a.expectedActiveFingerprint),'Active key fingerprint required for rotation');
}
function ancestors(path){for(let p=resolve(path);;p=dirname(p)){const stat=lstatSync(p,{throwIfNoEntry:false});if(stat){need(!stat.isSymbolicLink(),'Key stage symlink/junction refused');need(realpathSync(p)===p,'Key stage canonical path differs');}if(p===dirname(p))break;}}
function protectNew(path,directory){
 if(process.platform==='win32'){
  const code='$ErrorActionPreference="Stop";$path=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("'+Buffer.from(path).toString('base64')+'"));$me=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value;$isDir='+ (directory?'$true':'$false')+';$acl=if($isDir){[Security.AccessControl.DirectorySecurity]::new()}else{[Security.AccessControl.FileSecurity]::new()};$acl.SetAccessRuleProtection($true,$false);foreach($sid in @($me,"S-1-5-18","S-1-5-32-544")){$r=[Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid),[Security.AccessControl.FileSystemRights]::FullControl,[Security.AccessControl.AccessControlType]::Allow);$acl.AddAccessRule($r)};if($isDir){[IO.FileSystemAclExtensions]::SetAccessControl([IO.DirectoryInfo]::new($path),$acl)}else{[IO.FileSystemAclExtensions]::SetAccessControl([IO.FileInfo]::new($path),$acl)};$owner=if($isDir){[Security.AccessControl.DirectorySecurity]::new()}else{[Security.AccessControl.FileSecurity]::new()};$owner.SetOwner([Security.Principal.SecurityIdentifier]::new($me));if($isDir){[IO.FileSystemAclExtensions]::SetAccessControl([IO.DirectoryInfo]::new($path),$owner)}else{[IO.FileSystemAclExtensions]::SetAccessControl([IO.FileInfo]::new($path),$owner)};';
  try{execFileSync('pwsh.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(code,'utf16le').toString('base64')],{windowsHide:true,stdio:'pipe',timeout:15000});}catch{throw new Error('New private candidate ACL setup failed; inspect retained files');}
 }else chmodSync(path,directory?0o700:0o600);
}
function directory(path){
 ancestors(path);if(!existsSync(path)){mkdirSync(path,{mode:0o700});protectNew(path,true);}inspectPrivateDirectory(path);
}
function privateFile(root,name,content){
 const path=join(root,name);ancestors(path);let fd=openSync(path,'wx',0o600);closeSync(fd);protectNew(path,false);inspectPrivateFilePermissions(root,path);
 const before=lstatSync(path);need(before.size===0&&before.nlink===1,'New private candidate file changed');
 fd=openSync(path,'r+');const bytes=Buffer.from(content);try{const opened=fstatSync(fd);need(opened.ino===before.ino&&opened.dev===before.dev&&opened.size===0,'New private file replaced');let total=0;while(total<bytes.length){const written=writeSync(fd,bytes,total,bytes.length-total);need(written>0,'Private candidate write failed');total+=written;}}finally{bytes.fill(0);closeSync(fd);}
 inspectPrivateFilePermissions(root,path);return path;
}
function stage(root,a,inspectActive,inspectCandidate){
 validate(a);ancestors(root);const active=join(root,'health-key.json');
 if(a.kind==='initial')need(!lstatSync(active,{throwIfNoEntry:false}),'Initial candidate cannot coexist with an active key');else inspectActive(a.expectedActiveFingerprint);
 directory(root);directory(join(root,'candidates'));const candidateRoot=join(root,'candidates',a.operationId),receiptFile=join(candidateRoot,'candidate.json');
 if(existsSync(candidateRoot)){
  inspectPrivateDirectory(candidateRoot);need(existsSync(receiptFile),'Incomplete private candidate retained; inspect before retry');inspectPrivateFilePermissions(candidateRoot,receiptFile);
  need(lstatSync(receiptFile).size<=4096,'Private candidate receipt too large');let prior;try{prior=JSON.parse(readFileSync(receiptFile,'utf8'));}catch{throw new Error('Private candidate receipt invalid');}
  const fields=['activationAuthorized','candidateFingerprint','expectedActiveFingerprint','kind','operationId','serverProvisioned','status','target'];
  need(prior&&Object.getPrototypeOf(prior)===Object.prototype&&JSON.stringify(Object.keys(prior).sort())===JSON.stringify(fields),'Private candidate receipt fields differ');
  need(prior.status==='STAGED_NOT_ACTIVE'&&prior.operationId===a.operationId&&prior.kind===a.kind&&prior.target===a.target&&prior.expectedActiveFingerprint===a.expectedActiveFingerprint&&prior.activationAuthorized===false&&prior.serverProvisioned===false,'Private candidate receipt conflicts');
  inspectCandidate(a.operationId,prior.candidateFingerprint);return {...prior,retry:true};
 }
 directory(candidateRoot);const bytes=randomBytes(32);const record={format:1,key:bytes.toString('hex'),purpose:'r6-css-health-proof',target:a.target},fingerprint=sha256(bytes);bytes.fill(0);
 try{privateFile(candidateRoot,'health-key.json',JSON.stringify(record));}finally{record.key='';}
 inspectCandidate(a.operationId,fingerprint);
 const receipt={status:'STAGED_NOT_ACTIVE',operationId:a.operationId,kind:a.kind,target:a.target,expectedActiveFingerprint:a.expectedActiveFingerprint,candidateFingerprint:fingerprint,activationAuthorized:false,serverProvisioned:false};
 privateFile(candidateRoot,'candidate.json',JSON.stringify(receipt));return {...receipt,retry:false};
}
export function stageProductionKeyCandidate(a,...extra){
 need(extra.length===0,'Key stage target override refused');validate(a);
 const relative='.local/private/production/candidates/'+a.operationId+'/health-key.json';
 try{execFileSync('git',['check-ignore','-q','--no-index','--',relative],{cwd:workspace,windowsHide:true,stdio:'pipe'});need(execFileSync('git',['ls-files','-z','--','.local/private'],{cwd:workspace,windowsHide:true}).length===0,'Private namespace tracked');}catch{throw new Error('Key stage requires an ignored untracked private namespace');}
 const parent=join(workspace,'.local/private');ancestors(parent);need(existsSync(dirname(parent)),'Local namespace must exist before key staging');directory(parent);
 return stage(join(parent,'production'),a,inspectProductionPrivateKey,inspectProductionKeyCandidate);
}
export function stageKeyCandidateFixture(root,token,a){
 validate(a);const store=privateKeyFixtureStore(root,token);return stage(store,a,fp=>inspectPrivateKeyFixture(root,token,fp),(id,fp)=>inspectKeyCandidateFixture(root,token,id,fp));
}
export function seedActiveKeyFixture(root,token,record){
 const store=privateKeyFixtureStore(root,token),fingerprint=sha256(Buffer.from(record.key??'','hex'));inspectProductionKeyRecord(record,fingerprint);directory(store);privateFile(store,'health-key.json',JSON.stringify(record));return inspectPrivateKeyFixture(root,token,fingerprint);
}
