import assert from 'node:assert/strict';
import {get} from 'node:https';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {sha256} from './release-lib.mjs';
const origin='https://staging-store.vneconomics.com',after=process.argv.includes('--after'),phase=after?'after':(process.argv.includes('--rollback')?'rollback':'before'),out=resolve('docs/acceptance/R4-staging'),checks=[],requests=[];
mkdirSync(out,{recursive:true});let failure=null;
const check=(v,label)=>{assert.ok(v,label);checks.push(label);};
async function request(path,depth=0){
 const url=new URL(path,origin);assert.equal(url.origin,origin,'Staging-only requests');assert.ok(depth<5,'Redirect limit');
 const start=Date.now();const r=await new Promise((ok,no)=>{const req=get(url,{headers:{'User-Agent':'Vneconomics-R4-read-only-check/1.0','Accept-Encoding':'identity'}},res=>{const data=[];let size=0;res.on('data',p=>{size+=p.length;if(size>4*1024*1024){req.destroy(new Error('Response size limit'));return;}data.push(p);});res.on('end',()=>ok({url:url.href,status:res.statusCode,headers:res.headers,bytes:Buffer.concat(data)}));res.on('error',no);});req.setTimeout(25000,()=>req.destroy(new Error('HTTP timeout')));req.on('error',no);});
 requests.push({url:r.url,status:r.status,ms:Date.now()-start,cacheControl:r.headers['cache-control'],robots:r.headers['x-robots-tag']});
 if([301,302,303,307,308].includes(r.status)){assert.ok(r.headers.location,'Redirect location');return request(new URL(r.headers.location,url),depth+1);}return {...r,text:r.bytes.toString('utf8')};
}
function healthy(r,label){check(r.status===200,'HTTP200 '+label);check(!/There has been a critical error|PHP Fatal error|Uncaught Error|Warning:.*\.php on line/.test(r.text),'no PHP error '+label);}
function noindex(r,label){check(/noindex/i.test((r.headers['x-robots-tag']||'')+' '+(r.text.match(/<meta\b[^>]*name=["']robots["'][^>]*>/gi)||[]).join(' ')),'noindex '+label);}
function links(html){const result=[];for(const m of html.matchAll(/\bhref=["']([^"']+)["']/g)){try{const u=new URL(m[1].replaceAll('&amp;','&'),origin);if(u.origin===origin)result.push(u);}catch{}}return result;}
try{
 const home=await request('/');healthy(home,'home');noindex(home,'home');
 const archive=await request('/tai-nguyen/');healthy(archive,'resource archive');noindex(archive,'resource archive');
 const hub=await request('/huong-dan/');healthy(hub,'guide hub');noindex(hub,'guide hub');
 const api=await request('/wp-json/vne-library/v1/items');healthy(api,'public resource API');check(Array.isArray(JSON.parse(api.text)),'public API array');
 const me=await request('/wp-json/wp/v2/users/me');check(me.status===401,'anonymous private-user access denied');
 const privatePath=await request('/deploy-inbox/staging/manifest.json');check([403,404].includes(privatePath.status)&&!privatePath.text.includes('vne-072-042-schema3'),'private inbox not served from staging document root');
 const legacy=JSON.parse(readFileSync('docs/acceptance/S16/postflight-results.json')).legacyPublic;check(legacy.length===14,'legacy baseline14 URLs');
 for(const row of legacy){const old=new URL(row.url);assert.equal(old.origin,'https://store.vneconomics.com');const r=await request(old.pathname+old.search);healthy(r,'legacy '+old.pathname);check(!r.text.includes('Nội dung chưa có trong thư viện'),'legacy supported '+old.pathname);}
 if(after){
  const publication=JSON.parse(readFileSync(join(out,'payload-publication.json'))),dir=resolve('artifacts/pipeline',publication.sourceSha),manifest=JSON.parse(readFileSync(join(dir,'manifest.json'))),content=JSON.parse(readFileSync(join(dir,'content.json')));
  check((home.text.match(/data-beginner-tool="/g)||[]).length===3,'home3 beginner tools');check((hub.text.match(/data-beginner-tool="/g)||[]).length===3,'hub3 beginner tools');
  for(const e of content.entries.filter(e=>e.validation)){
   const r=await request('/huong-dan/'+e.slug+'/');healthy(r,'guide '+e.key);noindex(r,'guide '+e.key);
   check((r.text.match(/class="lesson-copy"/g)||[]).length===6,'copy controls6 '+e.key);check((r.text.match(/data-lesson-check="/g)||[]).length===6,'checklist6 '+e.key);
   check(r.text.includes(manifest.evidenceDirectory+'/'+e.key+'.html'),'real evidence linked '+e.key);check(!r.text.includes('example.test/g03-fixture'),'no synthetic QA evidence '+e.key);
   const proof=await request('/wp-content/uploads/vne-guide-evidence/'+manifest.evidenceDirectory+'/'+e.key+'.html');healthy(proof,'evidence '+e.key);check(sha256(proof.bytes)===manifest.files.find(f=>f.path==='evidence/'+e.key+'.html').sha256,'exact evidence bytes '+e.key);check(/noindex/i.test(proof.text),'evidence noindex '+e.key);
  }
  const search=await request('/?vne_find=1&scope=guides&s=Antigravity');healthy(search,'guide search');check(search.text.includes('/huong-dan/lam-landing-page-moc-studio-voi-antigravity-ide-tren-windows/'),'Antigravity searchable');
  const resources=new Set(),ids=new Set();
  for(let page=1;page<=12;page++){const r=page===1?archive:await request('/tai-nguyen/page/'+page+'/');healthy(r,'catalog page'+page);for(const card of r.text.matchAll(/<article\b[^>]*data-resource-id=["'](\d+)["'][^>]*>([\s\S]*?)<\/article>/g)){ids.add(card[1]);const detail=links(card[2]).find(u=>/^\/tai-nguyen\/[^/]+\/$/.test(u.pathname));check(!!detail,'resource card has detail link '+card[1]);resources.add(detail.href);}}
  check(resources.size===106&&ids.size===106,'catalog106 unique resources across12 pages');
  const urls=[...resources].sort();for(let i=0;i<urls.length;i+=2){const pair=await Promise.all(urls.slice(i,i+2).map(url=>request(url)));for(const r of pair){healthy(r,'resource '+new URL(r.url).pathname);noindex(r,'resource '+new URL(r.url).pathname);check(r.text.includes('Báo lỗi nội dung này'),'resource contextual report link '+new URL(r.url).pathname);}}
 }
}catch(e){failure=String(e.stack??e);process.exitCode=1;}
finally{writeFileSync(join(out,'http-'+phase+'.json'),JSON.stringify({status:failure?'FAIL_R4_HTTP':'PASS_R4_HTTP_'+phase.toUpperCase(),observedAt:new Date().toISOString(),origin,checks,requests,failure,limits:['Read-only anonymous HTTPS GET; TLS verification enabled, same-origin redirects only','No report submission, payment, mail, login, API mutation or server deployment','Before phase is baseline only; after phase requires completed receiver import','Interactive copy/checklist and hosting hashes are checked separately']},null,2)+'\n');console.log((failure?'FAIL':'PASS')+' R4 '+phase+' HTTP '+checks.length+' checks / '+requests.length+' requests');if(failure)console.error(failure);}
