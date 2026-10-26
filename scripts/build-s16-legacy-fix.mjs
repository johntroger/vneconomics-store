import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {sourceFiles,resolveRef,sha256,makeZip,git} from './release-lib.mjs';
const baseSha='594ccd9a7de812a49f2c0d8260d20cbfced71752',sourceSha=resolveRef(process.argv[2]||'HEAD');
const base=JSON.parse(readFileSync('artifacts/releases/'+baseSha+'/manifest.json','utf8'));
const theme=sourceFiles(sourceSha,'theme'),plugin=sourceFiles(sourceSha,'plugin');
assert.match(theme.find(f=>f.name==='vibelab/style.css').data.toString(),/^Version: 0\.7\.1$/m);
const pluginZip=makeZip(plugin);assert.equal(sha256(pluginZip),base.components.plugin.sha256,'Plugin bytes must remain exact0.4.2');
const changed=theme.filter(f=>sha256(f.data)!==base.components.theme.files.find(old=>old.path===f.name).sha256).map(f=>f.name).sort();
assert.deepEqual(changed,['vibelab/index.php','vibelab/style.css'],'Only reviewed legacy patch and version may change');
const themeZip=makeZip(theme),folder=resolve('artifacts/production',sourceSha,'release');mkdirSync(folder,{recursive:true});
const component=(slug,version,archive,files,bytes)=>({slug,version,archive,sha256:sha256(bytes),bytes:bytes.length,sourceTree:git(['rev-parse',sourceSha+':'+(slug==='vibelab'?'themes/vibelab':'plugins/vne-library-core')]).toString().trim(),files:files.map(f=>({path:f.name,sha256:sha256(f.data),bytes:f.data.length}))});
const manifest={format:1,sourceSha,baseSourceSha:baseSha,sourceCommitTime:git(['show','-s','--format=%cI',sourceSha]).toString().trim(),schemaVersion:3,scope:'S16 legacy post/page rendering correction after production rollback',changedThemeFiles:changed,sequence:['verify retained plugin0.4.2/schema3','theme install and verify','legacy and VNE HTTP smoke','cache/data verification'],approval:{deployAuthorized:false,requiresSpecificProductionApproval:true},components:{plugin:component('vne-library-core','0.4.2','vne-library-core-0.4.2.zip',plugin,pluginZip),theme:component('vibelab','0.7.1','vibelab-0.7.1.zip',theme,themeZip)}};
const buffers={'vne-library-core-0.4.2.zip':pluginZip,'vibelab-0.7.1.zip':themeZip,'manifest.json':Buffer.from(JSON.stringify(manifest,null,2)+'\n')};
for(const [name,bytes]of Object.entries(buffers)){const p=join(folder,name);if(existsSync(p))assert.equal(sha256(readFileSync(p)),sha256(bytes));else writeFileSync(p,bytes);}
const result={status:'PASS_PINNED_LEGACY_FIX_PACKAGE',sourceSha,baseSourceSha:baseSha,artifactDirectory:folder,changed,pluginSha256:sha256(pluginZip),themeSha256:sha256(themeZip),manifestSha256:sha256(buffers['manifest.json']),themeFiles:theme.length,pluginFiles:plugin.length,checks:['Git source allowlist','Only two theme files changed','Plugin ZIP identical to approved0.4.2','Version0.7.1','Existing output immutable'],limits:['Package hashes only; native runtime tested separately','Production0.7.1 not authorized by this builder']};
writeFileSync('docs/acceptance/S16/legacy-fix-package.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
