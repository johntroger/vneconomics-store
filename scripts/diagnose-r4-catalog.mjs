import {get} from 'node:https';
import {writeFileSync} from 'node:fs';
const rows=[];
for(const path of ['/tai-nguyen/','/tai-nguyen/page/2/','/tai-nguyen/page/12/']){
 const r=await new Promise((ok,no)=>{const q=get('https://staging-store.vneconomics.com'+path,{headers:{'Accept-Encoding':'identity'}},s=>{const a=[];s.on('data',x=>a.push(x));s.on('end',()=>ok({status:s.statusCode,headers:s.headers,html:Buffer.concat(a).toString()}));});q.on('error',no);q.setTimeout(25000,()=>q.destroy(new Error('Timeout')));});
 rows.push({path,status:r.status,location:r.headers.location,ids:[...r.html.matchAll(/data-resource-id=["'](\d+)["']/g)].map(m=>m[1]),count:r.html.match(/<p class="result-count"[^>]*>(.*?)<\/p>/)?.[1],resourceLinks:[...r.html.matchAll(/href=["']([^"']*tai-nguyen[^"']*)["']/g)].map(m=>m[1]).slice(0,12)});
}
writeFileSync('docs/acceptance/R4-staging/catalog-diagnostic.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(rows,null,2));
