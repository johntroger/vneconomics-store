import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,cpSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {writePipeline,verifyPipeline,preparePipeline} from './pipeline-release.mjs';
import {git,sha256,sourceFiles,makeZip} from './release-lib.mjs';
import {componentProfile} from './release-profiles.mjs';
const ref=process.argv[2]||'HEAD',out=resolve(process.argv[3]||'docs/acceptance/R2-pipeline'),checks=[];mkdirSync(out,{recursive:true});mkdirSync('tmp/tests',{recursive:true});const root=mkdtempSync(resolve('tmp/tests/r2-package-'));
// Exact-SHA Actions checkouts may have no local branches. Empty refs are valid.
const branchRefs=()=>git(['for-each-ref','--format=%(refname) %(objectname)','refs/heads/']).toString();
const check=(v,n)=>{assert.ok(v,n);checks.push(n);},refs=branchRefs();
try{
 const first=join(root,'one'),second=join(root,'two'),manifest=writePipeline(ref,first);writePipeline(ref,second);verifyPipeline(first,ref);
 for(const f of [...manifest.files,{path:'manifest.json'},{path:'payload.zip'}])check(readFileSync(join(first,f.path)).equals(readFileSync(join(second,f.path))),'deterministic '+f.path);
 check(manifest.components.theme.files.length===38&&manifest.components.plugin.files.length===10,'current profile38/10');check(manifest.previousTheme.files.length===36,'rollback profile36');
 for(const [version,count]of [['0.6.0',35],['0.7.0',36],['0.7.1',36],['0.7.2',38]])check(componentProfile('theme',version).files.length===count,'historical profile '+version);
 assert.throws(()=>componentProfile('theme','9.9.9'));check(true,'unknown profile rejected');
 const old=sourceFiles('594ccd9a7de812a49f2c0d8260d20cbfced71752','theme');check(old.length===36&&sha256(makeZip(old))==='f6124d7693e8c8af7e8dcd7668012b8c0ed986d338c2a9e864e0f77afa3f0778','historical theme ZIP exact original SHA');
 for(const spec of [manifest.components.theme,manifest.components.plugin,manifest.previousTheme]){
  const dest=join(root,spec.archive.replace('.zip',''));const q=s=>"'"+s.replaceAll("'","''")+"'";const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath '+q(join(first,spec.archive))+' -DestinationPath '+q(dest)],{windowsHide:true,encoding:'utf8'});check(r.status===0,'independent extract '+spec.archive);
  for(const f of spec.files)check(sha256(readFileSync(join(dest,f.path)))===f.sha256,'archive member '+f.path);
 }
 const content=JSON.parse(readFileSync(join(first,'content.json'),'utf8'));check(content.entries.length===103,'reuse100 introductions +2guides +Codex observation');check(content.entries.filter(e=>e.kind==='resource').length===100,'one hundred resource entries');check(content.entries.filter(e=>e.validation).length===3,'only scoped three-tool evidence');
 for(const e of content.entries.filter(e=>e.kind==='resource'))check(!e.validation&&e.payload.primary_category===0&&e.payload.categories.length===0,'environment-neutral resource '+e.key);
 for(const e of content.entries.filter(e=>e.kind==='guide'))check(sha256(Buffer.from(e.payload.content))===e.contentSha256,'approved guide body '+e.key);
 const config=JSON.parse(readFileSync(join(first,'environments.json'),'utf8'));check(!config.production.deploymentConfigured&&!config.staging.deploymentConfigured,'both remote targets fail closed until approved configuration');
 const bad=join(root,'bad');cpSync(first,bad,{recursive:true});writeFileSync(join(bad,'theme.zip'),'truncated');assert.throws(()=>verifyPipeline(bad,ref));check(true,'bad archive rejected');
 cpSync(first,bad,{recursive:true});writeFileSync(join(bad,'secret.env'),'fixture');assert.throws(()=>verifyPipeline(bad,ref));check(true,'extra payload file rejected');
 const raw=JSON.stringify(manifest)+readFileSync(join(first,'content.json'),'utf8');check(!/DB_PASSWORD|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|github_pat_[A-Za-z0-9]|g03-fixture/.test(raw),'no credentials or QA certificate in manifest/content');
 const prepared=preparePipeline(ref);check(prepared.files.every(f=>!/(?:wp-config|\.sqlite|\.sql$|wordpress-backups|node_modules|\.env)/.test(f.name)),'no runtime config/database/backup in payload');
 assert.equal(branchRefs(),refs);check(true,'all branch refs unchanged by packaging tests');
 writeFileSync(join(out,'package-results.json'),JSON.stringify({status:'PASS_LOCAL_PIPELINE_PACKAGES',observedAt:new Date().toISOString(),sourceSha:manifest.sourceSha,checks,components:manifest.components,manifestSha256:sha256(readFileSync(join(first,'manifest.json'))),limits:['Local execution of the CI command; GitHub Actions has not run','Native WordPress receiver/UI tests are separate; no remote publication/deployment']},null,2)+'\n');console.log('PASS pipeline packages '+checks.length+' checks');
}catch(e){writeFileSync(join(out,'package-failure.json'),JSON.stringify({error:String(e.stack??e),checks},null,2)+'\n');throw e;}
