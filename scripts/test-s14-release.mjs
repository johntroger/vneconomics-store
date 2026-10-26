import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,cpSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {writeRelease,verifyRelease,sha256,git,dryRunGate,makeZip,validateSourceTree} from './release-lib.mjs';
import {policy} from './release-policy.mjs';
const ref=process.argv[2]||'HEAD',evidence=resolve(process.argv[3]||'docs/acceptance/S14');mkdirSync(evidence,{recursive:true});
mkdirSync('tmp/tests',{recursive:true});const root=mkdtempSync(resolve('tmp/tests/s14-package-')),checks=[];
const check=(value,label)=>{assert.ok(value,label);checks.push(label);};
const protectedPaths=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'].filter(existsSync);
const before=protectedPaths.map(p=>sha256(readFileSync(p)));
const refs=git(['for-each-ref','--format=%(refname) %(objectname)','refs/heads/main','refs/heads/release','refs/heads/deploy-*']).toString();
try{
 const first=join(root,'one'),second=join(root,'two');const manifest=writeRelease(ref,first);writeRelease(manifest.sourceSha,second);
 for(const file of readdirSync(first))check(readFileSync(join(first,file)).equals(readFileSync(join(second,file))),'deterministic rebuild '+file);
 verifyRelease(first,manifest.sourceSha);check(true,'independent ref verification succeeds');
 for(const [kind,p]of Object.entries(manifest.components)){
  const dest=join(root,'expanded-'+kind),archive=join(first,p.archive);mkdirSync(dest);
  const ps="Expand-Archive -LiteralPath '"+archive.replaceAll("'","''")+"' -DestinationPath '"+dest.replaceAll("'","''")+"'";
  const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);
  const actual=readdirSync(dest,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>join(e.parentPath,e.name));
  check(actual.length===p.files.length,kind+' ZIP expands with exact file count');
  for(const f of p.files)check(sha256(readFileSync(join(dest,f.path)))===f.sha256,'extracted '+f.path);
  check(p.files.every(f=>!/(?:^|\/)(?:README|\.env|wp-config|database|uploads|node_modules|scripts|docs|\.git)/i.test(f.path)),kind+' no config/db/uploads/tooling');
 }
 const bad=join(root,'bad');cpSync(first,bad,{recursive:true});writeFileSync(join(bad,manifest.components.theme.archive),'partial theme transfer');
 assert.throws(()=>verifyRelease(bad,manifest.sourceSha));check(true,'truncated theme archive rejected before deployment');
 cpSync(first,bad,{recursive:true});const forged=JSON.parse(readFileSync(join(bad,'manifest.json')));forged.components.plugin.version='9.9.9';writeFileSync(join(bad,'manifest.json'),JSON.stringify(forged));
 assert.throws(()=>verifyRelease(bad,manifest.sourceSha));check(true,'forged version pair rejected');
 cpSync(first,bad,{recursive:true});writeFileSync(join(bad,'wp-config.php'),'fixture only');assert.throws(()=>verifyRelease(bad,manifest.sourceSha));check(true,'unlisted release file rejected');
 assert.throws(()=>makeZip([{name:'vibelab/../../wp-config.php',data:Buffer.from('fixture')} ]));check(true,'archive traversal rejected');
 const tree=[...policy.theme.files,'README.md'].map(name=>({name,mode:'100644',type:'blob'}));
 for(const name of ['wp-config.php','.env','uploads/private.jpg','assets/key.json']){
  assert.throws(()=>validateSourceTree([...tree,{name,mode:'100644',type:'blob'}],'theme'));check(true,'source allowlist rejects '+name);
 }
 for(const mode of ['120000','160000','100755']){
  assert.throws(()=>validateSourceTree(tree.map((r,i)=>i===0?{...r,mode}:r),'theme'));check(true,'source rejects Git mode '+mode);
 }
 assert.throws(()=>validateSourceTree(tree.slice(1),'theme'));check(true,'missing required source file rejected');
 for(const status of ['failed','pending','timeout','missing-confirmation']){
  const r=dryRunGate({plugin:status,theme:'confirmed'});check(r.state==='STOP_PLUGIN'&&!r.events.includes('theme attempted'),'plugin '+status+' blocks theme');
 }
 for(const status of ['failed','timeout','missing-confirmation']){
  const r=dryRunGate({plugin:'confirmed',theme:status});check(r.state==='RESTORE_THEME_KEEP_PLUGIN'&&r.events.includes('no database rollback'),'theme '+status+' restores files and retains compatible plugin');
 }
 check(dryRunGate({plugin:'confirmed',theme:'confirmed'}).state==='AWAIT_CACHE_CHECK','two confirmed packages still require cache confirmation');
 assert.deepEqual(protectedPaths.map(p=>sha256(readFileSync(p))),before);if(protectedPaths.length)check(true,'original database/config preserved');
 assert.equal(git(['for-each-ref','--format=%(refname) %(objectname)','refs/heads/main','refs/heads/release','refs/heads/deploy-*']).toString(),refs);check(true,'main/release/deploy refs unchanged');
 writeFileSync(join(evidence,'package-results.json'),JSON.stringify({status:'PASS',date:new Date().toISOString(),sourceSha:manifest.sourceSha,node:process.version,checks,components:manifest.components,protectedHashes:before,protectedRefs:refs,scope:'Packaging and fixture confirmations only; runtime compatibility separate; no remote API/deploy'},null,2)+'\n');
 console.log('PASS S14 packaging '+checks.length+' checks; fixture cleanup follows.');
}catch(e){writeFileSync(join(evidence,'package-failure-'+Date.now()+'.json'),JSON.stringify({message:e.stack,checks},null,2)+'\n');throw e;}
