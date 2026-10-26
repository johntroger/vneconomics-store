import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {preparePipeline} from './pipeline-release.mjs';
import {git,sha256} from './release-lib.mjs';
const root='docs/acceptance/R5-production',out='docs/acceptance/R6-closeout',checks=[];
const check=(value,label)=>{assert.ok(value,label);checks.push(label);};
const load=name=>JSON.parse(readFileSync(join(root,name+'.json'),'utf8'));
const source='4266b71990702d87969a847e95d9c39933cb05a4',payload='dc4af296692ddac2dd71dc9f1be4a69f1af29959',manifest='02953f231825577da95d1a71887a44ba07e425015412b5448581588af042bf34';
const completion=load('completion'),baseline=load('production-baseline-backup'),comparison=load('candidate-comparison');
check(completion.status==='PASS_R5_BASELINE_ADOPTION','R5 complete');check(completion.sourceSha===source&&completion.payloadSha===payload&&completion.manifestSha256===manifest,'release pins');
check(comparison.files.length===11&&comparison.unchangedR2PayloadFiles===8,'CI/local and unchanged application evidence');
for(const env of ['staging','production']){
 const publication=load('publication-'+env),adopt=load(env+'-adoption'),retry=load(env+'-retry'),runtime=load(env+'-postflight'),received=load(env+'-received-final');
 check(publication.sourceSha===source&&publication.payloadSha===payload&&publication.manifestSha256===manifest,'publication '+env);
 check(adopt.status==='ADOPTED_EXISTING_BASELINE'&&adopt.onlyNewReceiptOption&&adopt.oldJournalsPreserved&&adopt.postsMetaRuntimeUnchanged,'only new receipt '+env);
 check(adopt.optionsBeforeSha256===adopt.optionsAfterSha256&&adopt.oldVneOptionsBeforeSha256===adopt.oldVneOptionsAfterSha256,'all old options '+env);
 check(retry.status==='ALREADY_ADOPTED','idempotency '+env);check(runtime.typedRows===130&&runtime.fingerprint===adopt.fingerprint,'postflight fingerprint '+env);
 check(runtime.indexing===(env==='production'?'1':'0'),'indexing '+env);check(runtime.pipelineLocks.length===0&&Object.values(runtime.nativeFolders).every(x=>Array.isArray(x)&&x.length===0),'server cleanup '+env);
 check(runtime.theme==='0.7.2'&&runtime.plugin==='0.4.2'&&Number(runtime.schema)===3,'runtime '+env);
 check(received.actualFileCount===10&&received.gitHead==='ref: refs/heads/release-'+env&&received.inboxMode==='0700','private Git transport '+env);
 for(const f of received.files)check(publication.files.some(p=>p.path===f.path&&p.sha256===f.sha256),'Plesk/GitHub hash '+env+' '+f.path);
 check(runtime.productionBackupSha256===baseline.backup.sha256,'backup retained '+env);
 if(env==='production')check(JSON.stringify(runtime.legacyJournals)===JSON.stringify(baseline.legacyJournals),'C100/G03 actual legacy journals unchanged');
}
check(baseline.backup.crcErrors.length===0&&baseline.backup.files===14413,'backup CRC evidence');
const http=load('http-after');check(http.status==='PASS_R5_HTTP_AFTER'&&http.checks.length===783&&http.requests.length===151,'public/legacy/SEO verification');
const ui=load('production-ui-checks'),cleanup=load('responsive-and-ui-cleanup');check(ui.length===3&&ui.every(x=>x.clipboardMatches&&x.checklistPersisted&&x.checklistRestored),'real UI three guides');check(cleanup.clipboardRestored&&cleanup.viewportReset&&cleanup.checks.length===6&&cleanup.checks.every(x=>x.pass),'responsive/UI cleanup');
const released=preparePipeline(source),current=preparePipeline('HEAD');
for(const f of released.files.filter(f=>f.name!=='manifest.json'))check(current.files.find(x=>x.name===f.name)?.data.equals(f.data),'docs closure leaves payload bytes unchanged '+f.name);
check(!git(['diff','--','themes','plugins','deploy/environments.json','deploy/receiver.php','deploy/evidence','scripts/pipeline-release.mjs','scripts/release-lib.mjs','scripts/release-profiles.mjs']).toString().trim(),'no uncommitted application/payload changes');
for(const file of ['AGENTS.md','README.md','deploy/README.vi.md','docs/deployment-runbook.vi.md','docs/release-checklist.vi.md','docs/acceptance/R6-closeout.vi.md','docs/S14-release-checklist.vi.md','docs/S14-release-contract.vi.md','docs/S15-deployment-gate.vi.md','docs/S16-deployment-proposal.vi.md'])check(existsSync(file),'documentation exists '+file);
check(readFileSync('AGENTS.md','utf8').includes('Đường phát hành bắt buộc'),'binding project policy');
for(const f of ['docs/S14-release-checklist.vi.md','docs/S14-release-contract.vi.md','docs/S15-deployment-gate.vi.md','docs/S16-deployment-proposal.vi.md'])check(/lịch sử/i.test(readFileSync(f,'utf8').slice(0,700)),'historical release path labelled '+f);
const inventory=readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>{const path=join(e.parentPath,e.name),data=readFileSync(path);if(/\.(?:json|txt|md)$/.test(path))check(!/github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----/.test(data.toString()),'no credential signature '+path);return {path:path.replaceAll('\\','/'),bytes:data.length,sha256:sha256(data)};}).sort((a,b)=>a.path.localeCompare(b.path));
if(process.argv.includes('--require-tracked')){const tracked=new Set(git(['ls-files',root]).toString().trim().split('\n'));for(const f of inventory){check(tracked.has(f.path),'R5 evidence tracked '+f.path);check(sha256(git(['show','HEAD:'+f.path]))===f.sha256,'Git blob preserves original evidence bytes '+f.path);}}
mkdirSync(out,{recursive:true});writeFileSync(join(out,'r5-evidence-inventory.json'),JSON.stringify({sourceSha:source,payloadSha:payload,files:inventory},null,2)+'\n');writeFileSync(join(out,process.argv.includes('--require-tracked')?'post-commit-verification.json':'local-verification.json'),JSON.stringify({status:'PASS_R6_LOCAL_CLOSEOUT',observedAt:new Date().toISOString(),repositoryHeadAtCheck:git(['rev-parse','HEAD']).toString().trim(),releasedSource:source,releasedPayload:payload,checks,evidenceFiles:inventory.length,limits:['Offline evidence and source audit; not a fresh hosting probe','No deployment, content mutation, remote push, journal relabelling or backup deletion','Manifest source SHA for future candidates can differ; deployed R5 pins stay unchanged']},null,2)+'\n');console.log('PASS R6 '+checks.length+' checks; '+inventory.length+' R5 evidence files inventoried;9 payload files unchanged');
