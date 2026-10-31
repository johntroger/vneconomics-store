import assert from 'node:assert/strict';
import {cpSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {startSite} from './local-runtime.mjs';
import {sha256} from './release-lib.mjs';

// Test helper only: all installation and rollback happens in the owned fixture.
export async function exerciseR6CssNative({fixture,prepared,expectedHtml=null}){
 const directory=join(fixture,'wordpress'),checks=[],before=new Map();
 for(const path of ['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'])if(existsSync(path))before.set(path,sha256(readFileSync(path)));
 mkdirSync(directory,{recursive:true});let app;
 try{
  if(existsSync('.local/site/wp-load.php')){
   for(const name of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',name),join(directory,name),{recursive:true});
   for(const entry of readdirSync('.local/site',{withFileTypes:true}))if(entry.isFile()&&entry.name.endsWith('.php')&&entry.name!=='wp-config.php')cpSync(join('.local/site',entry.name),join(directory,entry.name));
  }
  app=await startSite(directory,19478,{workers:1});
  const php=async code=>{const r=await app.playground.run({code:code.replace('<?php','<?php clearstatcache();')});assert.equal(r.exitCode,0,r.errors||r.text);assert.equal(r.errors,'',r.errors);return r.text;};
  for(const [name,data] of Object.entries({'baseline-theme.zip':prepared.buffers['previous-theme.zip'],'baseline-plugin.zip':prepared.buffers['plugin.zip'],'candidate-theme.zip':prepared.buffers['theme.zip']}))writeFileSync(join(directory,name),data);
  await php("<?php define('FS_METHOD','direct');require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/file.php';WP_Filesystem();foreach(array('baseline-plugin'=>'plugins','baseline-theme'=>'themes') as $zip=>$dest){$r=unzip_file(ABSPATH.$zip.'.zip',WP_CONTENT_DIR.'/'.$dest.'/');if(is_wp_error($r))throw new Exception($r->get_error_message());}");
  const observations=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
  const seed=readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(observations)+");").replace("switch_theme('vibelab');","switch_theme('vibelab-v2');");
  JSON.parse(await php(seed));
  const state=async()=>JSON.parse(await php("<?php require '/wordpress/wp-load.php';$out=array('theme'=>get_stylesheet(),'version'=>VIBELAB_V2_VERSION,'marker'=>VIBELAB_V2_RELEASE_MARKER,'plugin'=>VNE_LIBRARY_VERSION,'schema'=>(int)get_option('vne_library_schema_version'),'data'=>array());foreach(array('posts','postmeta','terms','term_taxonomy','term_relationships') as $name){$rows=$wpdb->get_results('SELECT * FROM '.$wpdb->$name,ARRAY_A);usort($rows,function($a,$b){return strcmp(wp_json_encode($a),wp_json_encode($b));});$out['data'][$name]=hash('sha256',wp_json_encode($rows));}echo wp_json_encode($out);"));
  const initial=await state();assert.equal(initial.version,prepared.manifest.baselineThemeVersion??'2.0.0');assert.equal(initial.plugin,'0.4.4');assert.equal(initial.schema,3);checks.push('native fixture starts with pinned baseline theme/plugin0.4.4/schema3');
  const boot="<?php define('WP_INSTALLING',true);define('FS_METHOD','direct');require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/class-wp-upgrader.php';require_once ABSPATH.'wp-admin/includes/file.php';WP_Filesystem();";
  async function install(zip){
   const text=await php(boot+"$u=new WP_Upgrader(new Automatic_Upgrader_Skin());$r=$u->run(array('package'=>ABSPATH.'"+zip+".zip','destination'=>WP_CONTENT_DIR.'/themes/vibelab-v2/','clear_destination'=>true,'abort_if_destination_exists'=>false,'clear_working'=>true,'hook_extra'=>array('type'=>'theme','action'=>'update','theme'=>'vibelab-v2')));if(is_wp_error($r)||!$r)throw new Exception(is_wp_error($r)?$r->get_error_message():'Native update failed');echo 'INSTALLED';");
   assert.ok(text.includes('INSTALLED'));assert.ok(!existsSync(join(directory,'.maintenance')),'No stale maintenance');
  }
  await install('candidate-theme');
  const candidate=await state();assert.equal(candidate.theme,'vibelab-v2');assert.equal(candidate.version,prepared.manifest.themeVersion);assert.equal(candidate.marker,prepared.manifest.themeMarker);
  assert.equal(candidate.plugin,'0.4.4');assert.deepEqual(candidate.data,initial.data);checks.push('native theme-only update stamps version/marker and preserves all five application tables');
  const names=prepared.manifest.components.theme.files.map(file=>file.path);
  const hashes=JSON.parse(await php("<?php $out=array();foreach(json_decode('"+JSON.stringify(names)+"',true) as $name)$out[$name]=hash_file('sha256','/wordpress/wp-content/themes/'.$name);echo json_encode($out);"));
  for(const file of prepared.manifest.components.theme.files)assert.equal(hashes[file.path],file.sha256);checks.push('every installed candidate theme file matches manifest');
  const response=await fetch('http://127.0.0.1:19478/',{signal:AbortSignal.timeout(30000)}),html=await response.text();assert.equal(response.status,200);assert.ok(html.includes(prepared.manifest.themeMarker));assert.ok(html.includes('style.css?ver='+prepared.manifest.themeVersion));if(expectedHtml)assert.ok(html.includes(expectedHtml),'Changed template must render through HTTP');checks.push('homepage HTTP200 with candidate marker and dynamic CSS cache version');
  const cssResponse=await fetch('http://127.0.0.1:19478/wp-content/themes/vibelab-v2/style.css',{signal:AbortSignal.timeout(30000)});assert.equal(cssResponse.status,200);assert.equal(sha256(Buffer.from(await cssResponse.arrayBuffer())),prepared.manifest.components.theme.files.find(file=>file.path==='vibelab-v2/style.css').sha256);checks.push('candidate CSS bytes delivered through local HTTP match manifest');
  await install('baseline-theme');const restored=await state();assert.deepEqual(restored,initial);checks.push('native code rollback restores deployed baseline version/marker/data without DB restore');
  const pluginNames=prepared.manifest.components.plugin.files.map(file=>file.path);
  const pluginHashes=JSON.parse(await php("<?php $out=array();foreach(json_decode('"+JSON.stringify(pluginNames)+"',true) as $name)$out[$name]=hash_file('sha256','/wordpress/wp-content/plugins/'.$name);echo json_encode($out);"));
  for(const file of prepared.manifest.components.plugin.files)assert.equal(pluginHashes[file.path],file.sha256);checks.push('plugin including stars remains byte identical after update/rollback');
  assert.deepEqual(readdirSync(join(directory,'wp-content/upgrade')),[],'Upgrade workspace must be empty');
  return checks;
 }finally{
  if(app)await app[Symbol.asyncDispose]();for(const [path,digest] of before)assert.equal(sha256(readFileSync(path)),digest,'Existing local data changed: '+path);
 }
}
