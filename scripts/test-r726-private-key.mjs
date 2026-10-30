import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync,linkSync,unlinkSync,renameSync,symlinkSync,chmodSync} from 'node:fs';
import {join,resolve,relative,isAbsolute} from 'node:path';
import {randomBytes,createHmac} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {inspectPrivateKeyFixture,collectProofFromKeyFixture,validateWindowsPrivateAcl,inspectProductionPrivateKey} from './r6-css-private-key.mjs';
import {productionProofProtocol} from './r6-css-production-proof.mjs';
import {productionBindingPlan} from './r6-css-operator.mjs';
import {r6CssProfile} from './release-r6-css.mjs';
import {sha256} from './release-lib.mjs';

const summaryOnly=process.argv.length===3&&process.argv[2]==='--summary-only';assert.ok(process.argv.length===2||summaryOnly,'No target/key overrides');mkdirSync('tmp/tests',{recursive:true});
const fixture=mkdtempSync(resolve('tmp/tests/r726-key-')),privateRoot=join(fixture,'private'),file=join(privateRoot,'health-key.json'),token=randomBytes(32).toString('hex'),secret=randomBytes(32).toString('hex'),checks=[];
mkdirSync(privateRoot,{mode:0o700});writeFileSync(join(fixture,'.key-fixture-owned'),token);const record={format:1,key:secret,purpose:'r6-css-health-proof',target:productionBindingPlan().home},fp=sha256(Buffer.from(secret,'hex'));writeFileSync(file,JSON.stringify(record),{mode:0o600});
function owned(path){const absolute=resolve(path),rel=relative(fixture,absolute);assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel),'Only owned fixture ACL/path operations allowed');return absolute;}
function protect(path,broad=false){
 path=owned(path);
 if(process.platform==='win32'){
  const encoded=Buffer.from(path).toString('base64');
  const code='$ErrorActionPreference="Stop";$path=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("'+encoded+'"));$me=[Security.Principal.WindowsIdentity]::GetCurrent().User;$isDir=Test-Path -LiteralPath $path -PathType Container;$acl=if($isDir){[Security.AccessControl.DirectorySecurity]::new()}else{[Security.AccessControl.FileSecurity]::new()};$acl.SetAccessRuleProtection($true,$false);foreach($sid in @($me.Value,"S-1-5-18","S-1-5-32-544")){$identity=[Security.Principal.SecurityIdentifier]::new($sid);$rule=[Security.AccessControl.FileSystemAccessRule]::new($identity,[Security.AccessControl.FileSystemRights]::FullControl,[Security.AccessControl.AccessControlType]::Allow);$acl.AddAccessRule($rule)};'+(broad?'$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new("S-1-1-0"),[Security.AccessControl.FileSystemRights]::Read,[Security.AccessControl.AccessControlType]::Allow));':'')+'if($isDir){[IO.FileSystemAclExtensions]::SetAccessControl([IO.DirectoryInfo]::new($path),$acl)}else{[IO.FileSystemAclExtensions]::SetAccessControl([IO.FileInfo]::new($path),$acl)};$owner=if($isDir){[Security.AccessControl.DirectorySecurity]::new()}else{[Security.AccessControl.FileSecurity]::new()};$owner.SetOwner($me);if($isDir){[IO.FileSystemAclExtensions]::SetAccessControl([IO.DirectoryInfo]::new($path),$owner)}else{[IO.FileSystemAclExtensions]::SetAccessControl([IO.FileInfo]::new($path),$owner)};';
  execFileSync('pwsh.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(code,'utf16le').toString('base64')],{windowsHide:true,stdio:'pipe',timeout:15000});
 }else chmodSync(path,path===privateRoot?0o700:broad?0o644:0o600);
}
protect(privateRoot);protect(file);
const inspected=inspectPrivateKeyFixture(fixture,token,fp);assert.equal(inspected.keyFingerprintSha256,fp);assert.equal(inspected.keyReturned,false);assert.ok(!JSON.stringify(inspected).includes(secret));checks.push('native private file ACL/owner or POSIX mode verified and only fingerprint returned');
assert.throws(()=>inspectPrivateKeyFixture(fixture,'0'.repeat(64),fp),/ownership differs/);assert.throws(()=>inspectPrivateKeyFixture(resolve('.'),token,fp),/fixture required/);checks.push('fixture reader cannot select another root or bypass its ownership token');
assert.throws(()=>inspectProductionPrivateKey(fp,{path:file}),/override refused/);checks.push('production entry refuses any alternate key path before touching the real private store');
assert.throws(()=>inspectPrivateKeyFixture(fixture,token,'0'.repeat(64)),/fingerprint differs/);checks.push('wrong public fingerprint cannot load a key');
const linked=owned(join(fixture,'key-hardlink.json'));linkSync(file,linked);try{assert.throws(()=>inspectPrivateKeyFixture(fixture,token,fp),/links\/size invalid/);}finally{unlinkSync(linked);}checks.push('hard-linked key files refused on the native filesystem');
const kept=owned(join(fixture,'kept-private'));owned(privateRoot);renameSync(privateRoot,kept);
try{symlinkSync(kept,privateRoot,process.platform==='win32'?'junction':'dir');assert.throws(()=>inspectPrivateKeyFixture(fixture,token,fp),/symlink\/junction refused/);}finally{unlinkSync(privateRoot);renameSync(kept,privateRoot);}checks.push('native private directory junction or symlink refused and restored within the owned fixture');
protect(file,true);try{assert.throws(()=>inspectPrivateKeyFixture(fixture,token,fp),/ACL grants another|POSIX owner\/mode differs/);}finally{protect(file);}checks.push('native broadly-readable fixture key rejected before parsing secret data');
for(const [label,value] of [['invalid JSON','{bad'],['wrong target',JSON.stringify({...record,target:'https://example.invalid'})],['bare fixture envelope',JSON.stringify({key:secret})],['extra fields',JSON.stringify({...record,path:'/tmp/key'})],['oversized',JSON.stringify({...record,padding:'x'.repeat(5000)})]]){
 writeFileSync(file,value);assert.throws(()=>inspectPrivateKeyFixture(fixture,token,fp));checks.push('reject private file: '+label);
}writeFileSync(file,JSON.stringify(record));
writeFileSync(file,JSON.stringify({...record,[secret]:'synthetic'}));let redactedError;try{inspectPrivateKeyFixture(fixture,token,fp);}catch(error){redactedError=error;}assert.ok(redactedError);assert.ok(!String(redactedError.stack).includes(secret));assert.ok(!JSON.stringify(redactedError).includes(secret));writeFileSync(file,JSON.stringify(record));checks.push('invalid private JSON field names are not reflected into thrown errors');
const sid='S-1-5-21-test-user',rule={sid,type:'Allow',rights:2032127},node={owner:sid,protected:true,rules:[rule]},safe={currentSid:sid,nodes:[node,node]};assert.equal(validateWindowsPrivateAcl(safe).status,'PRIVATE_WINDOWS_DACL_VERIFIED');
for(const change of [{owner:'other'},{protected:false},{rules:[]},{rules:[{...rule,sid:'S-1-1-0'}]},{rules:[{...rule,type:'Unknown'}]},{rules:[{...rule,rights:'FullControl'}]}])assert.throws(()=>validateWindowsPrivateAcl({currentSid:sid,nodes:[{...node,...change},node]}));checks.push('ACL policy rejects owner inheritance empty broad malformed-type and malformed-rights snapshots');
const now=Math.floor(Date.now()/1000),a={environment:'production',protocol:productionProofProtocol,sourceSha:'a'.repeat(40),controllerSourceSha:'b'.repeat(40),payloadSha:'c'.repeat(40),expectedParent:r6CssProfile.payload,manifestSha256:'d'.repeat(64),receiverSha256:'e'.repeat(64),baselineSha256:'f'.repeat(64),owner:'1'.repeat(32),keyFingerprintSha256:fp},j={...a,phase:'AWAIT_HEALTH',challenge:'2'.repeat(64),issuedAt:now-1,expiresAt:now+119};
const fetchBefore=globalThis.fetch;let requests=0;
globalThis.fetch=async(url,options)=>{requests++;assert.ok([record.target+'/',record.target+'/wp-content/themes/vibelab-v2/style.css'].includes(url));assert.equal(options.redirect,'manual');return {url,status:200,body:new Response(url.endsWith('style.css')?'body{}':'<meta name="vibelab-release" content="r6-css-aaaaaaaaaaaa">').body};};
try{
 const result=await collectProofFromKeyFixture(fixture,token,a,j);assert.equal(requests,2);assert.ok(!JSON.stringify(result).includes(secret));assert.equal(result.proof.signature,createHmac('sha256',Buffer.from(secret,'hex')).update(Buffer.from(result.proof.body,'base64')).digest('hex'));assert.equal(JSON.parse(readFileSync(file,'utf8')).key,secret);checks.push('native private-file loader feeds the producer, signs mocked HTTP and leaves the key file unchanged');
 const before=requests;await assert.rejects(()=>collectProofFromKeyFixture(fixture,token,a,{...j,phase:'COMPLETE'}));assert.equal(requests,before);checks.push('terminal journal rejected before private-file loading or network');
}finally{globalThis.fetch=fetchBefore;}
const evidence='docs/acceptance/R726-private-key';if(!summaryOnly)mkdirSync(evidence,{recursive:true});
const result={status:'PASS_R726_NATIVE_PRIVATE_KEY_LOADER',checks,platform:process.platform,nativeWindowsAclTested:process.platform==='win32',nativePosixPermissionsTested:process.platform!=='win32',aclChangesRestrictedToOwnedSyntheticFixture:true,realProductionStoreTouched:false,productionKeyCreated:false,httpClientMocked:true,productionWriteAuthorized:false,sourceHashes:Object.fromEntries(['scripts/r6-css-private-key.mjs','scripts/r6-css-production-proof.mjs'].map(path=>[path,sha256(readFileSync(path))]))};
if(!summaryOnly)writeFileSync(join(evidence,'local-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,checks:checks.length,platform:process.platform,realProductionStoreTouched:false}));
