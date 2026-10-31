import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
assert.equal(process.argv.length,2,'No Docker/host/key/path overrides');
const context=process.platform==='win32'?'desktop-linux':'default',image='php@sha256:d07db734bd519927010bbc66fa42c0d6f0207a4ee8419998df40931b884a5919';
const token=randomBytes(32).toString('hex'),name='vne-css-store-'+randomBytes(8).toString('hex'),root=resolve('.');assert.ok(!root.includes(','));
const sourcePaths=['release-tools/r6-css-adapter.php','scripts/fixtures/css-private-store.php','scripts/test-css-private-store.mjs'],sourceHashes=Object.fromEntries(sourcePaths.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));
const run=(args,options={})=>spawnSync('docker',['--context',context,...args],{encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:4*1024*1024,...options});
const endpoint=run(['context','inspect','--format','{{json .Endpoints.docker.Host}}']);assert.equal(endpoint.status,0,endpoint.stderr);assert.ok(['npipe:////./pipe/dockerDesktopLinuxEngine','unix:///var/run/docker.sock'].includes(JSON.parse(endpoint.stdout)),'Local Docker endpoint required');
let result;
try{
 result=run(['run','--rm','--pull','never','--name',name,'--label','com.vneconomics.fixture='+token,'--network','none','--read-only','--tmpfs','/var/www/vhosts/vneconomics.com:rw,nosuid,nodev,size=16m,mode=0755','--tmpfs','/tmp:rw,nosuid,nodev,noexec,size=16m',...['release-tools/r6-css-adapter.php','scripts/fixtures/css-private-store.php'].flatMap(path=>['--mount','type=bind,source='+resolve(path)+',target=/work/'+path+',readonly']),'--env','RUNTIME_NATIVE_FIXTURE='+token,image,'php','/work/scripts/fixtures/css-private-store.php']);
}finally{
 const remaining=run(['ps','-aq','--filter','label=com.vneconomics.fixture='+token]);assert.equal(remaining.status,0,remaining.stderr);
 for(const id of remaining.stdout.trim().split(/\s+/).filter(Boolean)){assert.match(id,/^[a-f0-9]{12,64}$/);const removed=run(['rm','-f',id]);assert.equal(removed.status,0,removed.stderr);}
 const after=run(['ps','-aq','--filter','label=com.vneconomics.fixture='+token]);assert.equal(after.status,0,after.stderr);assert.equal(after.stdout.trim(),'','Owned fixture container remains');
}
assert.equal(result.status,0,result.stderr||result.stdout);assert.equal(result.stderr,'',result.stderr);const machine=JSON.parse(result.stdout);assert.equal(machine.status,'PASS_CSS_PRIVATE_STORE_NATIVE');assert.equal(machine.uid,10044);assert.equal(machine.gid,1004);
assert.equal(machine.sourceSha256,sourceHashes['release-tools/r6-css-adapter.php']);for(const path of sourcePaths)assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),sourceHashes[path],'Source changed during native test');
console.log(JSON.stringify({...machine,imageDigest:image,sourceHashes,sourceReadOnly:true,networkDisabled:true,containerRemoved:true}));
