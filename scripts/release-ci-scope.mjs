import assert from 'node:assert/strict';
import {readFileSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const hex40=value=>typeof value==='string'&&/^[a-f0-9]{40}$/.test(value);
export function metadataOnly(paths){
 return paths.length>0&&paths.every(p=>p==='AGENTS.md'||p==='README.md'||p==='deploy/theme-release-baseline.json'||/^docs\/(?!.*(?:^|\/)\.\.\/)[^\r\n]+\.md$/.test(p));
}
export function validateMetadataBaseline({baseline,remote,manifestBytes,rows,readBlob,applicationChanges}){
 assert.deepEqual(Object.keys(baseline).sort(),['manifestSha256','payloadSha']);
 assert.ok(hex40(baseline.payloadSha));assert.match(baseline.manifestSha256,/^[a-f0-9]{64}$/);
 assert.equal(baseline.payloadSha,remote,'Baseline is not current production');
 assert.equal(sha(manifestBytes),baseline.manifestSha256,'Manifest hash differs');
 const m=JSON.parse(manifestBytes);
 assert.equal(m.profile,'vibelab-v2-theme-update-schema3');assert.equal(m.scope,'theme-only');assert.equal(m.schema,3);
 assert.equal(m.pluginVersion,'0.4.4');assert.equal(m.pluginUnchanged,true);assert.ok(hex40(m.sourceSha));
 const names=['manifest.json','plugin.zip','previous-plugin.zip','previous-theme.zip','theme.zip'];
 assert.deepEqual(rows.map(r=>r.path).sort(),names);assert.ok(rows.every(r=>r.mode==='100644'&&r.type==='blob'));
 assert.deepEqual(m.files.map(f=>f.path).sort(),names.filter(p=>p!=='manifest.json'));
 for(const f of m.files){const bytes=readBlob(f.path);assert.equal(bytes.length,f.bytes);assert.equal(sha(bytes),f.sha256,'Payload file hash differs');}
 assert.deepEqual(applicationChanges,[],'Metadata closeout changes deployed application source');
 return {status:'VERIFIED_METADATA_ONLY',payloadSha:remote,sourceSha:m.sourceSha,files:names.length};
}
function git(args){const r=spawnSync('git',args,{encoding:null,windowsHide:true,maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr?.toString()||'Git inspection failed');return r.stdout;}
export function main(){
 const base=process.env.BASE_SHA,head=process.env.SOURCE_SHA;
 let result={status:'FULL_CHECKS_REQUIRED',metadataOnly:false};
 if(base){
  assert.ok(hex40(base)&&hex40(head),'Exact CI base/head required');
  assert.equal(git(['rev-parse','HEAD']).toString().trim(),head,'Checkout is not CI source');
  const paths=git(['diff','--no-renames','--name-only','-z',base,head]).toString().split('\0').filter(Boolean);
  if(metadataOnly(paths)){
   const baseline=JSON.parse(readFileSync('deploy/theme-release-baseline.json','utf8'));
   assert.ok(hex40(baseline.payloadSha),'Invalid baseline');
   const remote=git(['ls-remote','--exit-code','origin','refs/heads/release-production']).toString().split(/\s+/)[0];
   assert.equal(remote,baseline.payloadSha,'Production baseline moved');
   git(['fetch','--quiet','--no-tags','origin',remote]);
   const manifestBytes=git(['show',remote+':manifest.json']),m=JSON.parse(manifestBytes);
   assert.ok(hex40(m.sourceSha));git(['fetch','--quiet','--no-tags','origin',m.sourceSha]);
   const rows=git(['ls-tree','-r',remote]).toString().trim().split(/\r?\n/).map(row=>{const match=row.match(/^(\d+) (\w+) [a-f0-9]+\t(.+)$/);assert.ok(match);return {mode:match[1],type:match[2],path:match[3]};});
   const applicationChanges=git(['diff','--name-only',m.sourceSha,head,'--','themes','plugins']).toString().trim().split(/\r?\n/).filter(Boolean);
   result={...validateMetadataBaseline({baseline,remote,manifestBytes,rows,readBlob:p=>git(['show',remote+':'+p]),applicationChanges}),metadataOnly:true};
  }
 }
 if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,'metadata_only='+result.metadataOnly+'\n');
 console.log(JSON.stringify(result));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main();
