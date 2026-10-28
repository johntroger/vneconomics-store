import assert from 'node:assert/strict';
import {existsSync,mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {git,makeZip,sha256,resolveRef} from './release-lib.mjs';
export const rebuildProfile='vibelab-v2-cutover-schema3';
export const rebuildBaseline='4266b71990702d87969a847e95d9c39933cb05a4';
const themeFiles=['404.php','archive-vne_guide.php','archive-vne_resource.php','footer.php','front-page.php','functions.php','header.php','inc/catalog.php','inc/components.php','inc/contract.php','inc/detail.php','inc/guides.php','inc/search.php','inc/seo.php','index.php','search.php','single-vne_guide.php','single-vne_practice.php','single-vne_resource.php','style.css','taxonomy-vne_category.php'];
function tree(sha,path,expected){
 const rows=git(['ls-tree','-rz',sha+':'+path]).toString().split('\0').filter(Boolean).map(row=>{const [mode,type,oid,name]=row.split(/[\t ]/);return {mode,type,oid,name};});
 for(const row of rows)assert.ok(row.type==='blob'&&row.mode==='100644','Unsafe tree member '+row.name);
 if(expected)assert.deepEqual(rows.map(r=>r.name).sort(),[...expected,'README.md'].sort(),'Exact source allowlist');
 return rows.filter(r=>r.name!=='README.md').map(r=>({name:path.split('/').at(-1)+'/'+r.name,data:git(['show',sha+':'+path+'/'+r.name])}));
}
export function prepareRebuildRelease(ref){
 assert.match(ref,/^[a-f0-9]{40}$/);const sourceSha=resolveRef(ref);assert.equal(sourceSha,ref);
 const theme=tree(sourceSha,'themes/vibelab-v2',themeFiles);
 assert.ok(theme.find(f=>f.name.endsWith('/functions.php')).data.toString().includes("'r33-guides-local'"),'Unreviewed theme marker');
 // Compose only the approved R4 change over the pinned production plugin.
 const plugin=tree(rebuildBaseline,'plugins/vne-library-core');
 const admin=plugin.find(f=>f.name==='vne-library-core/state-admin.php');
 const previousLine="'numberposts'=>50)) as $post)";
 const nextLine="'numberposts'=>-1,'orderby'=>'title','order'=>'ASC')) as $post)";
 const approved=git(['show',sourceSha+':plugins/vne-library-core/state-admin.php']);
 assert.equal(approved.toString().replaceAll('\r\n','\n'),admin.data.toString().replace(previousLine,nextLine).replaceAll('\r\n','\n'),'Plugin must contain only approved R4 diff');admin.data=approved;
 const header=plugin.find(f=>f.name==='vne-library-core/vne-library-core.php');
 // New release version tracks this scoped patch; no stars module is included.
 assert.ok(header.data.toString().includes('0.4.2'));header.data=Buffer.from(header.data.toString().replaceAll('0.4.2','0.4.4'));
 const previousTheme=tree(rebuildBaseline,'themes/vibelab');const previousPlugin=tree(rebuildBaseline,'plugins/vne-library-core');
 const buffers={};const components={};
 for(const [key,files] of [['theme',theme],['plugin',plugin],['previous-theme',previousTheme],['previous-plugin',previousPlugin]]){
  const archive=key+'.zip';buffers[archive]=makeZip(files);components[key]={archive,sha256:sha256(buffers[archive]),bytes:buffers[archive].length,files:files.map(f=>({path:f.name,bytes:f.data.length,sha256:sha256(f.data)}))};
 }
 const manifest={format:1,profile:rebuildProfile,sourceSha,productionBaselineSource:rebuildBaseline,schema:3,changeClass:'B',themeVersion:'2.0.0-alpha.4',themeMarker:'r33-guides-local',pluginVersion:'0.4.4',pluginComposition:'production baseline plus exact source state-admin R4 patch and explicit 0.4.4 version stamp',components,approval:{candidateOnly:true,deployAuthorized:false},requiredRemainingGates:['native-install-maintenance-rollback','full-release-flows','CI-exact-SHA','payload-commit','owner-R6-approval']};
 buffers['manifest.json']=Buffer.from(JSON.stringify(manifest,null,2)+'\n');return {manifest,buffers};
}
export function writeRebuildRelease(source,dir){assert.ok(!existsSync(dir),'Immutable output exists');const r=prepareRebuildRelease(source);mkdirSync(dir,{recursive:true});for(const [name,data] of Object.entries(r.buffers))writeFileSync(join(dir,name),data);return r.manifest;}
export function verifyRebuildRelease(source,dir){const r=prepareRebuildRelease(source);assert.deepEqual(readdirSync(dir).sort(),Object.keys(r.buffers).sort());for(const [name,data] of Object.entries(r.buffers))assert.equal(sha256(readFileSync(join(dir,name))),sha256(data),name);return r.manifest;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const source=process.argv[2];const dir=resolve('artifacts/rebuild',source??'invalid');writeRebuildRelease(source,dir);verifyRebuildRelease(source,dir);console.log(JSON.stringify({status:'CANDIDATE_PACKAGES_ONLY',source,dir}));}
