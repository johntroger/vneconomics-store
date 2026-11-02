// Assigned theme-only releases through the existing GitHub -> Plesk path.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync,existsSync,mkdirSync,lstatSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {hex,prepareThemeRelease,verifyThemeDirectory,assertReviewPath} from './theme-release.mjs';

const repo='johntroger/vneconomics-store';
const workflows=['.github/workflows/pr-fast.yml','.github/workflows/theme-release.yml','.github/workflows/theme-host-installer.yml'];
const hash=b=>createHash('sha256').update(b).digest('hex');
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
function command(name,args,input){
 const r=spawnSync(name,args,{input,encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:48*1024*1024});
 assert.equal(r.status,0,r.stderr||name+' failed');return r.stdout.trim();
}
const git=(...args)=>command('git',args);
const gh=(...args)=>command('gh',args);
const api=(path,data,method='POST')=>JSON.parse(data===undefined?gh('api','repos/'+repo+'/'+path):command('gh',['api','--method',method,'repos/'+repo+'/'+path,'--input','-'],JSON.stringify(data)));

export function successfulRuns(runs,source,required=workflows){
 const selected=required.map(path=>runs.filter(r=>r.path===path&&r.head_sha===source&&r.event==='pull_request').sort((a,b)=>b.id-a.id)[0]);
 for(const r of selected.filter(Boolean)){
  assert.equal(r.repository?.full_name,repo);assert.equal(r.head_repository?.full_name,repo);
  if(r.status==='completed')assert.equal(r.conclusion,'success','CI failed: '+r.html_url);
 }
 return selected.every(r=>r?.status==='completed'&&r.conclusion==='success')?selected:null;
}

// Persist intent BEFORE a remote write. An interrupted write is never retried blindly.
export async function checkpoint(state,name,save,operation,{mutation=false}={}){
 if(Object.hasOwn(state.steps,name))return state.steps[name].result;
 assert.ok(!state.pending,'Uncertain operation '+state.pending+'; inspect its remote result before continuing');
 if(mutation){state.pending=name;save();}
 const result=await operation();
 state.steps[name]={at:new Date().toISOString(),result};delete state.pending;save();
 console.log('Completed '+name);return result;
}

export async function publicPostflight(manifest,expectedCss,fetcher=fetch){
 const base='https://store.vneconomics.com/';
 const get=async url=>{const response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(20000)});assert.equal(response.status,200);return Buffer.from(await response.arrayBuffer());};
 const home=(await get(base)).toString();
 assert.ok(home.includes(manifest.themeMarker),'Homepage marker differs');
 assert.ok(home.includes('style.css?ver='+manifest.themeVersion),'Homepage version differs');
 const css=await get(base+'wp-content/themes/vibelab-v2/style.css?ver='+manifest.themeVersion);
 assert.equal(hash(css),expectedCss,'Live CSS differs');
 return {homepageHttp:200,cssHttp:200,cssSha256:hash(css),themeVersion:manifest.themeVersion,privateJournalRead:false};
}

async function waitCi(source,required=workflows){
 const deadline=Date.now()+12*60000;
 while(Date.now()<deadline){
  const page=api('actions/runs?head_sha='+source+'&event=pull_request&per_page=100');
  assert.ok(page.total_count<=100,'Too many CI runs; inspect pagination');
  const runs=successfulRuns(page.workflow_runs,source,required);if(runs)return runs;
  await sleep(4000);
 }
 throw new Error('CI deadline reached; receipt retained');
}
async function waitPromote(id){
 const deadline=Date.now()+12*60000;
 while(Date.now()<deadline){const r=api('actions/runs/'+id);assert.equal(r.path,'.github/workflows/promote-production.yml');
  assert.equal(r.event,'workflow_dispatch');assert.equal(r.repository.full_name,repo);
  if(r.status==='completed'){assert.equal(r.conclusion,'success','Promote failed: '+r.html_url);return {id:r.id,url:r.html_url};}
  await sleep(4000);
 }throw new Error('Promote deadline reached; inspect existing run, do not dispatch again');
}
function remote(ref){const sha=git('ls-remote','origin','refs/heads/'+ref).split(/\s+/)[0];assert.ok(hex(sha,40),'Missing ref '+ref);return sha;}
function baselineAt(sha){return JSON.parse(git('show',sha+':deploy/theme-release-baseline.json'));}
function sourcePr(number){const p=api('pulls/'+number);assert.equal(p.base.repo.full_name,repo);assert.equal(p.head.repo.full_name,repo);assert.equal(p.base.ref,'main');assert.ok(p.head.ref.startsWith('codex/'));assert.ok(hex(p.head.sha,40));return p;}
function assertPins(expected,main=remote('main')){git('fetch','--quiet','origin',main);assert.deepEqual(baselineAt(main),expected);assert.equal(remote('release-production'),expected.payloadSha);return main;}

export async function release(number,{receivedAt=new Date().toISOString()}={}){
 assert.match(String(number),/^[1-9][0-9]*$/);assert.ok(Number.isFinite(Date.parse(receivedAt)));
 assert.equal(git('remote','get-url','origin'),'https://github.com/'+repo+'.git');
 assert.equal(git('diff','--name-only'),'','Tracked working tree must be clean');assert.equal(git('diff','--cached','--name-only'),'','Index must be clean');
 const directory=resolve('artifacts/release-auto',String(number));
 assertReviewPath(directory);mkdirSync(directory,{recursive:true});
 const file=join(directory,'receipt.json');
 if(existsSync(file))assert.ok(lstatSync(file).isFile()&&!lstatSync(file).isSymbolicLink());
 const state=existsSync(file)?JSON.parse(readFileSync(file)): {version:1,repository:repo,pr:Number(number),receivedAt,steps:{}};
 assert.equal(state.version,1);assert.equal(state.repository,repo);assert.equal(state.pr,Number(number));
 const save=()=>{const next=file+'.next';writeFileSync(next,JSON.stringify(state,null,2)+'\n');renameSync(next,file);};
 const step=(name,fn,mutation=false)=>checkpoint(state,name,save,fn,{mutation});
 // Stop even if an earlier step can be read from the receipt. Unknown writes need inspection.
 assert.ok(!state.pending,'Uncertain '+state.pending+'; inspect remote state and retain receipt');
 save();
 const initial=await step('preflight',()=>{
  const p=sourcePr(number);assert.equal(p.state,'open');assert.equal(p.draft,false);
  const main=remote('main');git('fetch','--quiet','origin',main,p.head.sha);
  const baseline=baselineAt(main);assertPins(baseline,main);git('fetch','--quiet','origin',baseline.payloadSha);
  assert.equal(git('merge-base',main,p.head.sha),main,'Source branch must include current main');
  const prepared=prepareThemeRelease(p.head.sha,baseline);assert.ok(prepared.manifest,'No application change; use normal tooling PR flow');
  assert.equal(prepared.manifest.changeClass,'A','Automatic coordinator currently supports CSS class A only; other changes need scoped backup verification');
  return {source:p.head.sha,baseline,branch:p.head.ref};
 });
 // CSS triggers fast + package; package includes real native update/rollback proof.
 // The standalone host-installer workflow does not trigger for theme CSS.
 const runs=await step('source_ci',()=>waitCi(initial.source,workflows.slice(0,2)));
 const candidate=await step('candidate',()=>{
  assert.equal(sourcePr(number).head.sha,initial.source);assertPins(initial.baseline);
  const run=runs.find(r=>r.path===workflows[1]);
  const out=command(process.execPath,['scripts/theme-candidate.mjs','candidate',String(run.id)]);
  const receipt=JSON.parse(out.split(/\r?\n/).findLast(line=>line.startsWith('{')));
  assert.equal(receipt.status,'PUBLISHED_THEME_CANDIDATE_ONLY');assert.equal(receipt.sourceSha,initial.source);
  assert.ok(hex(receipt.payloadSha,40));assert.equal(receipt.expectedParent,initial.baseline.payloadSha);return receipt;
 },true);
 const merge=await step('source_merge',async()=>{
  assertPins(initial.baseline);assert.equal(sourcePr(number).head.sha,initial.source);
  await waitCi(initial.source,workflows.slice(0,2));
  gh('pr','merge',String(number),'--repo',repo,'--merge','--match-head-commit',initial.source);
  const p=sourcePr(number);assert.equal(p.merged,true);assert.ok(hex(p.merge_commit_sha,40));
  const main=remote('main');git('fetch','--quiet','origin',main,initial.source);
  assert.equal(main,p.merge_commit_sha,'Main advanced unexpectedly');
  assert.equal(git('rev-parse',main+'^{tree}'),git('rev-parse',initial.source+'^{tree}'),'Merge tree differs from CI source');return main;
 },true);
 const promote=await step('promote_dispatch',()=>{
  assertPins(initial.baseline);assert.equal(remote('main'),merge);assert.equal(remote(candidate.candidateBranch),candidate.payloadSha);
  const out=gh('workflow','run','promote-production.yml','--repo',repo,'--ref','main',
   '-f','candidate_ref='+candidate.candidateBranch,'-f','payload_sha='+candidate.payloadSha,'-f','source_sha='+initial.source,
   '-f','expected_parent='+initial.baseline.payloadSha,'-f','profile='+candidate.profile);
  const match=out.match(/actions\/runs\/(\d+)/);assert.ok(match,'Dispatch response missing run URL; inspect existing run');return match[1];
 },true);
 await step('promote_ci',()=>waitPromote(promote));
 await step('public_postflight',async()=>{
  assert.equal(remote('release-production'),candidate.payloadSha);
  const manifest=verifyThemeDirectory(candidate.directory);assert.equal(manifest.sourceSha,initial.source);
  assert.equal(hash(readFileSync(join(candidate.directory,'manifest.json'))),candidate.manifestSha256);
  const css=manifest.components.theme.files.find(f=>f.path==='vibelab-v2/style.css');assert.ok(css);
  let error;for(let i=0;i<24;i++){try{return await publicPostflight(manifest,css.sha256);}catch(e){error=e;if(i<23)await sleep(5000);}}throw error;
 });
 const closeout=await step('closeout_pr',()=>{
  assert.equal(remote('release-production'),candidate.payloadSha);
  const main=remote('main');assert.equal(main,merge,'Main advanced; inspect before closeout');
  const content=JSON.stringify({payloadSha:candidate.payloadSha,manifestSha256:candidate.manifestSha256},null,2)+'\n';
  const blob=api('git/blobs',{content,encoding:'utf-8'}).sha;
  const parent=api('git/commits/'+main);
  const tree=api('git/trees',{base_tree:parent.tree.sha,tree:[{path:'deploy/theme-release-baseline.json',mode:'100644',type:'blob',sha:blob}]}).sha;
  const commit=api('git/commits',{message:'Pin verified production theme for PR '+number,tree,parents:[main]}).sha;
  const branch='codex/closeout-'+initial.source.slice(0,12);
  api('git/refs',{ref:'refs/heads/'+branch,sha:commit});
  const p=api('pulls',{title:'Pin verified production theme for PR '+number,head:branch,base:'main',body:'Pin the payload and manifest after automatic promotion and public HTTP/CSS verification. Application bytes are unchanged; private hosting journal was not read.'});
  return {number:p.number,url:p.html_url,source:commit};
 },true);
 await step('closeout_ci',()=>waitCi(closeout.source));
 await step('closeout_merge',()=>{
  assert.equal(remote('main'),merge,'Main advanced before closeout merge');
  assert.equal(remote('release-production'),candidate.payloadSha);
  const p=sourcePr(closeout.number);assert.equal(p.head.sha,closeout.source);
  gh('pr','merge',String(closeout.number),'--repo',repo,'--merge','--match-head-commit',closeout.source);
  const merged=sourcePr(closeout.number);assert.equal(merged.merged,true);
  assertPins({payloadSha:candidate.payloadSha,manifestSha256:candidate.manifestSha256});return merged.merge_commit_sha;
 },true);
 assertPins({payloadSha:candidate.payloadSha,manifestSha256:candidate.manifestSha256});
 state.status='PASS';state.readyToReportAt??=new Date().toISOString();state.secondsRequestToReadyReport=(Date.parse(state.readyToReportAt)-Date.parse(state.receivedAt))/1000;save();
 console.log(JSON.stringify({status:'PASS',receipt:file,closeoutUrl:closeout.url,seconds:state.secondsRequestToReadyReport}));return state;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [number,receivedAt,...extra]=process.argv.slice(2);assert.equal(extra.length,0,'Use <source PR number> [request ISO timestamp]');
 await release(number,receivedAt?{receivedAt}:{});
}
