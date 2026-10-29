import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {sha256} from './release-lib.mjs';
const origin='https://store.vneconomics.com';const documents=[];
const locs=xml=>[...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
async function get(url){assert.equal(new URL(url).origin,origin);const r=await fetch(url,{signal:AbortSignal.timeout(45000)});assert.equal(r.status,200,url);const xml=await r.text();documents.push({url,sha256:sha256(Buffer.from(xml)),bytes:Buffer.byteLength(xml)});return xml;}
const index=await get(origin+'/wp-sitemap.xml');const children=locs(index);assert.equal(children.length,4,'Unexpected sitemap family diff');
const urls=[];for(const child of children)urls.push(...locs(await get(child)));
assert.equal(new Set(urls).size,urls.length,'Duplicate sitemap URLs');
const counts={resources:0,guides:0,practice:0,categories:0};for(const url of urls){assert.equal(new URL(url).origin,origin);const path=new URL(url).pathname;if(path.startsWith('/tai-nguyen/'))counts.resources++;else if(path.startsWith('/huong-dan/'))counts.guides++;else if(path.startsWith('/bo-thuc-hanh/'))counts.practice++;else if(path.startsWith('/danh-muc/'))counts.categories++;else throw new Error('Unclassified URL '+url);}
const expected={resources:106,guides:6,practice:1,categories:13};const snapshot={status:JSON.stringify(counts)===JSON.stringify(expected)?'PASS_R1_BASELINE_MATCH':'BASELINE_DIFF_REQUIRES_REVIEW',observedAt:new Date().toISOString(),origin,documents,counts,expected,urls:urls.sort(),urlListSha256:sha256(Buffer.from(urls.sort().join('\n')+'\n')),limits:['Public sitemap snapshot only, not a production DB export or candidate content-equivalence proof']};mkdirSync('docs/acceptance/R52-rebuild',{recursive:true});writeFileSync('docs/acceptance/R52-rebuild/production-url-snapshot.json',JSON.stringify(snapshot,null,2)+'\n');console.log(JSON.stringify({status:snapshot.status,counts,hash:snapshot.urlListSha256}));assert.deepEqual(counts,expected,'Production sitemap differs from approved R1 baseline');
