import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {makeZip,sha256} from './release-lib.mjs';
const base='docs/content-production/2026-10-25',batches={};
const files=[{name:'content-100-20261025/import.php',data:readFileSync('scripts/content-100-import.php')}];
for(const name of readdirSync(base).filter(n=>/^batch-\d\d$/.test(n)).sort()){
 const payload=readFileSync(base+'/'+name+'/content.json'),review=JSON.parse(readFileSync(base+'/'+name+'/review.json','utf8')),data=JSON.parse(payload);
 if(review.status!=='PASS_LOCAL_EDITORIAL_AND_STRUCTURE_GATE'||review.payloadSha256!==sha256(payload))throw Error('Unreviewed payload '+name);
 batches[data.batch]={sha256:sha256(payload),count:data.items.length};files.push({name:'content-100-20261025/'+name+'/content.json',data:payload});
}
const manifest={campaign:'github-100-20261025',count:100,preparedCount:Object.values(batches).reduce((n,x)=>n+x.count,0),target:'https://store.vneconomics.com',importerSha256:sha256(files[0].data),batches};
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');writeFileSync(base+'/manifest.json',bytes);files.push({name:'content-100-20261025/manifest.json',data:bytes});
const zip=makeZip(files),hash=sha256(zip);mkdirSync(base+'/packages',{recursive:true});const path=base+'/packages/content-100-'+manifest.preparedCount+'-'+hash.slice(0,12)+'.zip';writeFileSync(path,zip);
writeFileSync(base+'/package-current.json',JSON.stringify({path,sha256:hash,size:zip.length,manifestSha256:sha256(bytes),...manifest},null,2)+'\n');
console.log(JSON.stringify({path,sha256:hash,size:zip.length,preparedCount:manifest.preparedCount}));
