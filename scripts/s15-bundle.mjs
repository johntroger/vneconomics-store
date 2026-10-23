import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {makeZip,sha256,verifyRelease} from './release-lib.mjs';
export const s15Source='594ccd9a7de812a49f2c0d8260d20cbfced71752';
export function s15Bundle(){
 const dir=resolve('artifacts/releases',s15Source),manifest=verifyRelease(dir,s15Source);
 const json=readFileSync(join(dir,'manifest.json')),plugin=readFileSync(join(dir,manifest.components.plugin.archive));
 const audit=readFileSync('scripts/fixtures/s15-audit.php','utf8').replaceAll('__SOURCE_SHA__',s15Source).replaceAll('__MANIFEST_SHA__',sha256(json)).replaceAll('__PLUGIN_SHA__',sha256(plugin));
 assert.ok(!audit.includes('__SOURCE_SHA__')&&!audit.includes('__MANIFEST_SHA__')&&!audit.includes('__PLUGIN_SHA__'));
 const files=[{name:'s15-release/audit.php',data:Buffer.from(audit)},{name:'s15-release/manifest.json',data:json},{name:'s15-release/plugin.zip',data:plugin}];
 return {files,zip:makeZip(files),sourceSha:s15Source};
}
export function writeS15Bundle(){
 const bundle=s15Bundle(),dir=resolve('artifacts/staging',s15Source),path=join(dir,'s15-plugin-preflight.zip');
 mkdirSync(dir,{recursive:true});
 if(existsSync(path))assert.equal(sha256(readFileSync(path)),sha256(bundle.zip),'Refuse overwriting a different staging bundle');
 else writeFileSync(path,bundle.zip);
 const info={sourceSha:s15Source,file:'s15-plugin-preflight.zip',sha256:sha256(bundle.zip),bytes:bundle.zip.length,files:bundle.files.map(f=>({path:f.name,sha256:sha256(f.data)})),purpose:'Private staging tooling; not part of theme/plugin payload; never production or web root',command:'eval-file /var/www/vhosts/vneconomics.com/s15-release/audit.php',hostingRun:'not yet run'};
 writeFileSync(join(dir,'bundle-info.json'),JSON.stringify(info,null,2)+'\n');return info;
}
