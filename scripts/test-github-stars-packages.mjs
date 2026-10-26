import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,cpSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {writeStarsRelease,verifyStarsRelease,prepareStarsRelease} from './github-stars-release.mjs';
import {sourceFiles,makeZip,sha256} from './release-lib.mjs';
import {componentProfile} from './release-profiles.mjs';
const ref=process.argv[2]||'HEAD',out=resolve('docs/acceptance/U2-github-stars/packages');mkdirSync(out,{recursive:true});mkdirSync('tmp/tests',{recursive:true});const root=mkdtempSync(resolve('tmp/tests/stars-package-')),checks=[],check=(v,n)=>{assert.ok(v,n);checks.push(n);},first=join(root,'one'),second=join(root,'two');
const m=writeStarsRelease(ref,first);writeStarsRelease(ref,second);verifyStarsRelease(first,ref);
for(const f of [...m.files,{path:'manifest.json'},{path:'payload.zip'}])check(readFileSync(join(first,f.path)).equals(readFileSync(join(second,f.path))),'deterministic '+f.path);
check(m.mode==='code-only'&&m.components.theme.version==='0.7.3'&&m.components.plugin.version==='0.4.3'&&m.schema===3,'new code-only pair/schema');check(m.components.theme.files.length===38&&m.components.plugin.files.length===11,'reviewed38/11 allowlist');
for(const [kind,version,count]of [['theme','0.6.0',35],['theme','0.7.0',36],['theme','0.7.1',36],['theme','0.7.2',38],['plugin','0.4.2',10]])check(componentProfile(kind,version).files.length===count,'frozen profile '+kind+version);
assert.throws(()=>componentProfile('plugin','0.4.4'));assert.throws(()=>prepareStarsRelease('4266b71990702d87969a847e95d9c39933cb05a4'));check(true,'unknown pair/old source cannot become stars release');
for(const spec of [...Object.values(m.components),...Object.values(m.previous.components)]){
 const dest=join(root,spec.archive),q=s=>"'"+s.replaceAll("'","''")+"'";const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath '+q(join(first,spec.archive))+' -DestinationPath '+q(dest)],{windowsHide:true,encoding:'utf8'});check(r.status===0,'independent extract '+spec.archive);for(const f of spec.files)check(sha256(readFileSync(join(dest,f.path)))===f.sha256,'archive member '+f.path);
}
for(const kind of ['theme','plugin'])check(sha256(makeZip(sourceFiles(m.previous.sourceSha,kind)))===m.previous.components[kind].sha256,'rollback exact released '+kind);
check(sha256(makeZip(sourceFiles('594ccd9a7de812a49f2c0d8260d20cbfced71752','theme')))==='f6124d7693e8c8af7e8dcd7668012b8c0ed986d338c2a9e864e0f77afa3f0778','frozen S14 ZIP unchanged');
const bad=join(root,'tampered');cpSync(first,bad,{recursive:true});writeFileSync(join(bad,'plugin.zip'),'tampered');assert.throws(()=>verifyStarsRelease(bad,ref));check(true,'tampered ZIP refused');writeFileSync(join(second,'extra.txt'),'unexpected');assert.throws(()=>verifyStarsRelease(second,ref));check(true,'unexpected package file refused');
writeFileSync(join(out,'results.json'),JSON.stringify({status:'PASS_U2_PACKAGES',sourceSha:m.sourceSha,profile:m.profile,checks,manifestSha256:sha256(readFileSync(join(first,'manifest.json'))),limits:['Local source/archives only; no GitHub publication or deployment']},null,2)+'\n');console.log('PASS U2 packages '+checks.length+' checks');
