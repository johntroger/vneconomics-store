import {catalog} from './content-100-catalog.mjs';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base='docs/content-production/2026-10-25';mkdirSync(base+'/research',{recursive:true});
const batch=Number(process.argv[2]??0),requests=[];
if(!Number.isInteger(batch)||batch<0||batch>10)throw Error('Batch 0(metadata) or 1..10');
async function get(url){const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Vneconomics-Owner-Editorial-Research','Accept':'application/vnd.github+json'}});const body=await r.text();requests.push({url,status:r.status,remaining:r.headers.get('x-ratelimit-remaining')});if(r.status===403||r.status===429)throw Error('GitHub quota reached; stop rather than bypass');return {status:r.status,body,location:r.headers.get('location')};}
const wanted=new Set(catalog.map(x=>x.repo.toLowerCase()));
if(batch===0){
 let repos=existsSync(base+'/research/repositories.json')?JSON.parse(readFileSync(base+'/research/repositories.json','utf8')).repos:{};
 for(let page=1;!process.argv.includes('--fill')&&page<=10;page++){
  const r=await get('https://api.github.com/search/repositories?q='+encodeURIComponent('stars:>5000 archived:false')+'&sort=stars&order=desc&per_page=100&page='+page);if(r.status!==200)throw Error('Search metadata HTTP'+r.status);const d=JSON.parse(r.body);for(const x of d.items??[]){if(wanted.has(x.full_name.toLowerCase()))repos[x.full_name.toLowerCase()]=x;}
  console.log('Metadata page '+page+': '+Object.keys(repos).length+'/100 selected repo matches');
 }
 for(const row of catalog){const key=row.repo.toLowerCase();if(repos[key]?.full_name)continue;if(process.argv.includes('--fill')){const [owner,name]=row.repo.split('/');const r=await get('https://api.github.com/search/repositories?q='+encodeURIComponent('user:'+owner+' '+name+' in:name')+'&per_page=10');const hit=r.status===200?JSON.parse(r.body).items.find(x=>x.full_name.toLowerCase()===key):null;if(!hit)throw Error('Exact replacement search failed '+row.repo);repos[key]=hit;continue;}const r=await get('https://api.github.com/repos/'+row.repo);if(r.status===200)repos[key]=JSON.parse(r.body);else if(r.status===301&&r.location?.startsWith('https://api.github.com/')){const redirected=await get(r.location);if(redirected.status===200)repos[key]=JSON.parse(redirected.body);else repos[key]={error:'redirect '+redirected.status};}else repos[key]={error:'HTTP '+r.status};}
 writeFileSync(base+'/research/repositories.json',JSON.stringify({observedAt:new Date().toISOString(),repos,requests},null,2)+'\n');
 console.log('Metadata complete; unresolved: '+JSON.stringify(Object.entries(repos).filter(([,v])=>v.error).map(([k,v])=>[k,v.error])));
}else{
 const meta=JSON.parse(readFileSync(base+'/research/repositories.json','utf8')),results=[];
 for(const row of catalog.filter(x=>x.batch===batch)){
  const repo=meta.repos[row.repo.toLowerCase()];if(!repo?.full_name)throw Error('Missing metadata '+row.repo);
  let found=null;for(const path of ['README.md','readme.md','README.rst','README','docs/README.md']){const url='https://raw.githubusercontent.com/'+repo.full_name+'/'+repo.default_branch+'/'+path;const r=await get(url);if(r.status===200&&r.body.length>200){found={url,path,text:r.body,sha256:createHash('sha256').update(r.body).digest('hex')};break;}if(r.status!==404)throw Error('Unexpected README HTTP'+r.status+' '+repo.full_name);}
  if(!found)throw Error('No README found '+repo.full_name);
  const source={key:row.key,repo:repo.full_name,repoId:String(repo.id),url:repo.html_url,stars:repo.stargazers_count,archived:repo.archived,disabled:repo.disabled,branch:repo.default_branch,pushedAt:repo.pushed_at,license:repo.license?.spdx_id??null,description:repo.description,homepage:repo.homepage,observedAt:new Date().toISOString(),readme:found};
  writeFileSync(base+'/research/'+String(row.key).padStart(3,'0')+'.json',JSON.stringify(source,null,2)+'\n');
  results.push({key:row.key,repo:repo.full_name,stars:source.stars,archived:source.archived,readmeBytes:Buffer.byteLength(found.text),source:found.url,sha256:found.sha256});console.log(row.key+' '+repo.full_name+' | '+source.stars+' stars | '+found.text.length+' README chars | archived='+repo.archived);
 }
 writeFileSync(base+'/research/batch-'+String(batch).padStart(2,'0')+'.json',JSON.stringify({observedAt:new Date().toISOString(),status:'SOURCE_CAPTURED_NOT_YET_EDITORIALLY_REVIEWED',results,requests},null,2)+'\n');
}
