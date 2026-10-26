import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,lstatSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {git,resolveRef,sourceFiles,makeZip,sha256} from './release-lib.mjs';
import {pipelineProfile} from './release-profiles.mjs';
const json=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const blob=(ref,path)=>git(['show',ref+':'+path]);
export function pipelineContent(ref){
 const entries=[{key:'codex',kind:'observe',slug:'lam-landing-page-moc-studio-voi-codex-tren-windows',post_type:'vne_guide',title:'Làm landing page Mộc Studio với Codex trên Windows',contentSha256:'0aa89fcfbdbc62d6822a770c222055c2515edbbec8c430f7e72ccd17a2eb3d47',sourceUrl:'https://learn.chatgpt.com/docs/windows/windows-app'}];
 for(let n=1;n<=10;n++){
  const data=JSON.parse(blob(ref,'docs/content-production/2026-10-25/batch-'+String(n).padStart(2,'0')+'/content.json'));
  assert.equal(data.items.length,10);assert.equal(data.batch,n);
  for(const e of data.items){assert.equal(e.payload.primary_category,0);assert.ok(!e.validations);entries.push({key:'c100-'+String(e.key).padStart(3,'0'),kind:'resource',batch:n,category:e.category,need:e.need,payload:e.payload,state:e.state,contentSha256:e.contentHash});}
 }
 const guides=JSON.parse(blob(ref,'deploy/content/guides.json'));
 for(const e of guides.guides)entries.push({...e,kind:'guide',categoryFrom:'codex'});
 assert.equal(entries.length,103);assert.equal(new Set(entries.map(e=>e.key)).size,103);
 for(const key of ['codex','claude-code','antigravity']){
  const e=entries.find(x=>x.key===key);e.validation=guides.validations[key];
  assert.ok(e.validation&&e.validation.outcome==='pass'&&!e.validation.evidence_url&&!e.validation.revision);
  assert.ok(!JSON.stringify(e.validation).includes('example.test/g03-fixture'),'QA cannot become published evidence');
 }
 return {format:1,campaign:'vne-existing-content-20261026',evidenceDirectory:'g03-0499402e4708',entries};
}
export function preparePipeline(ref){
 const sourceSha=resolveRef(ref),files=[],components={};
 for(const kind of ['theme','plugin']){
  const source=sourceFiles(sourceSha,kind),bytes=makeZip(source),name=kind+'.zip';
  const header=source.find(e=>e.name===(kind==='theme'?'vibelab/style.css':'vne-library-core/vne-library-core.php')).data.toString();assert.match(header,new RegExp('Version:\\s*'+pipelineProfile[kind].replaceAll('.','\\.')));
  components[kind]={version:pipelineProfile[kind],archive:name,sha256:sha256(bytes),files:source.map(e=>({path:e.name,sha256:sha256(e.data),bytes:e.data.length}))};files.push({name,data:bytes});
 }
 const rollback=sourceFiles(resolveRef('18a91ca0d5445479acd110e7886067e8fe5ab083'),'theme'),rollbackZip=makeZip(rollback);files.push({name:'rollback.zip',data:rollbackZip});
 files.push({name:'content.json',data:json(pipelineContent(sourceSha))},{name:'receiver.php',data:blob(sourceSha,'deploy/receiver.php')},{name:'environments.json',data:blob(sourceSha,'deploy/environments.json')});
 for(const key of ['codex','claude-code','antigravity'])files.push({name:'evidence/'+key+'.html',data:blob(sourceSha,'deploy/evidence/'+key+'.html')});
 const config=JSON.parse(files.find(f=>f.name==='environments.json').data);for(const env of ['production','staging'])assert.equal(typeof config[env].deploymentConfigured,'boolean');
 const manifest={format:1,profile:pipelineProfile.id,sourceSha,schema:3,components,previousTheme:{version:'0.7.1',archive:'rollback.zip',sha256:sha256(rollbackZip),files:rollback.map(f=>({path:f.name,sha256:sha256(f.data),bytes:f.data.length}))},evidenceDirectory:'g03-0499402e4708',files:files.map(f=>({path:f.name,sha256:sha256(f.data),bytes:f.data.length})),transport:'GitHub payload branch -> private Plesk inbox; receiver verifies private Git HEAD against approved payload SHA',authorization:'A build is not publication/deployment authorization; each environment needs a separately approved ref and configured target'};
 files.push({name:'manifest.json',data:json(manifest)});return {manifest,files,zip:makeZip(files.map(f=>({name:'vne-pipeline/'+f.name,data:f.data})))};
}
export function writePipeline(ref,directory){
 const result=preparePipeline(ref);assert.ok(!existsSync(directory),'Immutable output already exists');mkdirSync(directory,{recursive:true});
 for(const file of result.files){const path=join(directory,file.name);mkdirSync(resolve(path,'..'),{recursive:true});writeFileSync(path,file.data);}writeFileSync(join(directory,'payload.zip'),result.zip);return result.manifest;
}
export function verifyPipeline(directory,ref){
 const expected=preparePipeline(ref);const actual=readdirSync(directory,{recursive:true,withFileTypes:true});
 for(const e of actual)assert.ok(!e.isSymbolicLink(),'Payload symlink refused');
 assert.deepEqual(actual.filter(e=>e.isFile()).map(e=>join(e.parentPath,e.name).slice(resolve(directory).length+1).replaceAll('\\','/')).sort(),[...expected.files.map(f=>f.name),'payload.zip'].sort());
 for(const f of [...expected.files,{name:'payload.zip',data:expected.zip}])assert.equal(sha256(readFileSync(join(directory,f.name))),sha256(f.data),'Payload differs '+f.name);
 return expected.manifest;
}
