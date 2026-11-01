import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {metadataOnly,validateMetadataBaseline} from './release-ci-scope.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.ok(metadataOnly(['deploy/theme-release-baseline.json','AGENTS.md','docs/receipt.md']));
for(const path of ['themes/vibelab-v2/style.css','plugins/vne-library-core/model.php','scripts/release-ci-scope.mjs','.github/workflows/pr-fast.yml','package.json','docs/run.mjs'])assert.equal(metadataOnly(['docs/receipt.md',path]),false,path);
assert.equal(metadataOnly([]),false);
const remote='a'.repeat(40),source='b'.repeat(40),blobs=Object.fromEntries(['plugin.zip','previous-plugin.zip','previous-theme.zip','theme.zip'].map(name=>[name,Buffer.from(name)]));
const manifest={profile:'vibelab-v2-theme-update-schema3',scope:'theme-only',schema:3,pluginVersion:'0.4.4',pluginUnchanged:true,sourceSha:source,files:Object.entries(blobs).map(([path,b])=>({path,bytes:b.length,sha256:hash(b)}))};
const manifestBytes=Buffer.from(JSON.stringify(manifest)),baseline={payloadSha:remote,manifestSha256:hash(manifestBytes)};
const rows=['manifest.json',...Object.keys(blobs)].map(path=>({mode:'100644',type:'blob',path}));
const good={baseline,remote,manifestBytes,rows,readBlob:p=>blobs[p],applicationChanges:[]};
assert.equal(validateMetadataBaseline(good).status,'VERIFIED_METADATA_ONLY');
for(const bad of [
 {...good,remote:'c'.repeat(40)},
 {...good,baseline:{...baseline,manifestSha256:'0'.repeat(64)}},
 {...good,rows:[...rows,{mode:'100644',type:'blob',path:'extra.php'}]},
 {...good,rows:rows.map((r,i)=>i? r:{...r,mode:'120000'})},
 {...good,readBlob:()=>Buffer.from('tampered')},
 {...good,applicationChanges:['themes/vibelab-v2/front-page.php']},
])assert.throws(()=>validateMetadataBaseline(bad));
for(const file of ['pr-fast.yml','theme-release.yml','theme-host-installer.yml']){
 const text=readFileSync('.github/workflows/'+file,'utf8');
 assert.ok(text.includes('id: scope'));assert.ok(text.includes('scripts/release-ci-scope.mjs'));
 assert.ok(text.includes("if: steps.scope.outputs.metadata_only != 'true'"));
 assert.ok(text.includes('persist-credentials: false'));assert.ok(!text.includes('contents: write'));
}
console.log('PASS metadata scope: application/tool changes require full checks; bad ref/hash/tree/blob/application rejected; three workflows wired');
