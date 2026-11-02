import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {checkpoint,successfulRuns,publicPostflight} from './release-auto.mjs';

const repo='johntroger/vneconomics-store',source='a'.repeat(40);
const paths=['pr-fast.yml','theme-release.yml','theme-host-installer.yml'];
const runs=paths.map((name,i)=>({id:i+1,path:'.github/workflows/'+name,head_sha:source,event:'pull_request',status:'completed',conclusion:'success',repository:{full_name:repo},head_repository:{full_name:repo}}));
assert.equal(successfulRuns(runs,source).length,3);
assert.equal(successfulRuns(runs.slice(0,2),source),null);
assert.equal(successfulRuns(runs.slice(0,2),source,paths.slice(0,2).map(p=>'.github/workflows/'+p)).length,2);
assert.equal(successfulRuns(runs,'b'.repeat(40)),null);
assert.equal(successfulRuns([...runs,{...runs[0],id:9,status:'in_progress',conclusion:null}],source),null);
assert.throws(()=>successfulRuns([...runs,{...runs[0],id:9,conclusion:'failure'}],source));
assert.throws(()=>successfulRuns([{...runs[0],head_repository:{full_name:'outsider/fork'}},...runs.slice(1)],source));

const state={steps:{}},saves=[];let mutations=0;
const save=()=>saves.push(structuredClone(state));
const mutation=()=>{mutations++;assert.equal(saves.at(-1).pending,'candidate');return {payload:'exact'};};
assert.deepEqual(await checkpoint(state,'candidate',save,mutation,{mutation:true}),{payload:'exact'});
assert.deepEqual(await checkpoint(state,'candidate',save,mutation,{mutation:true}),{payload:'exact'});
assert.equal(mutations,1);assert.equal(state.pending,undefined);
const uncertain={steps:{}};let attempts=0;
await assert.rejects(checkpoint(uncertain,'promote',()=>{},()=>{attempts++;throw new Error('connection lost after server write');},{mutation:true}));
assert.equal(uncertain.pending,'promote');
await assert.rejects(checkpoint(uncertain,'promote',()=>{},()=>{attempts++;},{mutation:true}),/Uncertain/);
await assert.rejects(checkpoint(uncertain,'closeout',()=>{},()=>{}, {mutation:true}),/Uncertain/);
assert.equal(attempts,1);
const readable={steps:{}};
await assert.rejects(checkpoint(readable,'http',()=>{},()=>{throw new Error('not ready');}));
assert.equal(readable.pending,undefined);
assert.equal(await checkpoint(readable,'http',()=>{},()=>200),200);

const css=Buffer.from(':root{--ink:#10243e}'),digest=createHash('sha256').update(css).digest('hex');
const manifest={themeMarker:'theme-abcdef',themeVersion:'2.0.8'};
const home='<body>theme-abcdef <link href="style.css?ver=2.0.8"></body>';
const fetcher=(html=home,style=css,status=200)=>async(url,options)=>{
 assert.equal(options.redirect,'error');assert.ok(options.signal);
 return new Response(url.endsWith('/')?html:style,{status});
};
assert.equal((await publicPostflight(manifest,digest,fetcher())).privateJournalRead,false);
await assert.rejects(publicPostflight(manifest,digest,fetcher('old homepage')),/marker/);
await assert.rejects(publicPostflight(manifest,digest,fetcher(home,Buffer.from('stale CSS'))),/CSS differs/);
await assert.rejects(publicPostflight(manifest,digest,fetcher(home,css,503)));
await assert.rejects(publicPostflight({...manifest,themeVersion:'9.0.0'},digest,fetcher()),/version/);

const text=readFileSync('scripts/release-auto.mjs','utf8');
assert.ok(text.includes("assert.equal(prepared.manifest.changeClass,'A'"));
assert.ok(text.includes("'--match-head-commit',initial.source"));
assert.ok(text.includes("'--match-head-commit',closeout.source"));
assert.ok(text.includes("'scripts/theme-candidate.mjs','candidate'"));
assert.ok(!text.includes("'--force'"));
console.log('PASS release coordinator: exact CI, rerun failure, fork rejection, durable intent, no duplicate writes, read retry, HTTP marker/version/hash, CSS-only scope');
