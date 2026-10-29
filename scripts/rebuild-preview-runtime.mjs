import assert from 'node:assert/strict';
import {cpSync,existsSync,lstatSync,mkdirSync,readFileSync,readdirSync,realpathSync,unlinkSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {startSite} from './local-runtime.mjs';

const root=resolve('.');
const owner='vne-rebuild-preview-v1';
export const previewDirectory=resolve('.local/rebuild-v2');
const codeRoots=['themes/vibelab-v2','plugins/vne-library-core'];
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
function plainPath(path){
 for(let p=resolve(path);;p=dirname(p)){
  const stat=lstatSync(p,{throwIfNoEntry:false});
  if(stat)assert.ok(!stat.isSymbolicLink(),'Preview refuses symbolic links: '+p);
  if(p===dirname(p))break;
 }
}
function children(directory){
 plainPath(directory);
 return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  const path=join(directory,entry.name);plainPath(path);
  assert.ok(entry.isDirectory()||entry.isFile(),'Unsupported code entry: '+path);
  return entry.isDirectory()?children(path):[path];
 });
}
function allowedDirectory(directory){
 const rel=relative(resolve('tmp/tests'),directory);
 assert.ok(directory===previewDirectory||rel&&!rel.startsWith('..')&&!isAbsolute(rel),'Preview directory must be .local/rebuild-v2 or a test fixture');
 plainPath(directory);
}
export async function php(app,code){
 const result=await app.playground.run({code});
 assert.equal(result.exitCode,0,result.errors||result.text);
 assert.equal(result.errors,'',result.errors);
 return result.text;
}
export async function startPreview({directory=previewDirectory,port=9472,sourceRoot=root,watch=true}={}){
 directory=resolve(directory);sourceRoot=realpathSync(sourceRoot);allowedDirectory(directory);
 assert.ok(Number.isInteger(port)&&port>=1024&&port<=65535,'Invalid local port');
 const started=performance.now(),timings={};
 const owned=join(directory,'.preview-owner.json');
 plainPath(owned);
 if(existsSync(owned))assert.equal(JSON.parse(readFileSync(owned,'utf8')).owner,owner,'Unknown preview owner');
 else{
  assert.ok(!existsSync(directory)||readdirSync(directory).length===0,'Refusing an existing unowned site');
  mkdirSync(directory,{recursive:true});writeFileSync(owned,JSON.stringify({owner,localOnly:true})+'\n',{flag:'wx'});
 }
 const ownership=JSON.parse(readFileSync(owned,'utf8'));plainPath(owned);
 if(!existsSync(join(directory,'wp-load.php'))){
  // Copy only reusable WordPress core. Never copy the baseline DB, config or uploads.
  for(const name of ['wp-admin','wp-includes'])cpSync(resolve('.local/site',name),join(directory,name),{recursive:true});
  for(const entry of readdirSync('.local/site',{withFileTypes:true}))if(entry.isFile()&&entry.name.endsWith('.php')&&entry.name!=='wp-config.php')cpSync(join('.local/site',entry.name),join(directory,entry.name));
 }
 const manifestPath=join(directory,'.preview-code.json');plainPath(manifestPath);
 let previous=existsSync(manifestPath)?JSON.parse(readFileSync(manifestPath,'utf8')):{};
 function targetFor(name){
  assert.ok(codeRoots.some(base=>name.startsWith(base+'/'))&&!name.split('/').includes('..')&&!name.includes('\\'),'Invalid preview manifest entry');
  const target=join(directory,'wp-content',name);plainPath(target);return target;
 }
 function sync(){
  const next={},updates=[];
  for(const base of codeRoots)for(const source of children(join(sourceRoot,base))){
   const name=relative(sourceRoot,source).replaceAll('\\','/'),digest=hash(source),target=targetFor(name);
   next[name]=digest;
   if(existsSync(target)&&!Object.hasOwn(previous,name))throw new Error('Unrecorded preview code; inspect before sync: '+name);
   if(existsSync(target)&&previous[name]&&hash(target)!==previous[name])throw new Error('Preview code was edited outside source: '+name);
   if(!existsSync(target)||hash(target)!==digest)updates.push({source,target});
  }
  // Validate the entire operation before writing; only recorded owned files may be removed.
  const removed=Object.keys(previous).filter(name=>!Object.hasOwn(next,name)).map(name=>{
   const target=targetFor(name);if(existsSync(target))assert.equal(hash(target),previous[name],'Refusing to delete changed preview code');return target;
  });
  for(const {source,target} of updates){mkdirSync(dirname(target),{recursive:true});cpSync(source,target);}
  for(const target of removed)if(existsSync(target))unlinkSync(target);
  if(updates.length||removed.length||!existsSync(manifestPath))writeFileSync(manifestPath,JSON.stringify(next,null,2)+'\n');
  previous=next;return {updated:updates.length,removed:removed.length};
 }
 sync();
 const mu=join(directory,'wp-content/mu-plugins/rebuild-preview.php');plainPath(mu);mkdirSync(dirname(mu),{recursive:true});
 writeFileSync(mu,"<?php add_filter('pre_wp_mail','__return_false');add_filter('pre_http_request',function(){return new WP_Error('local_preview','External HTTP disabled');});add_filter('wp_robots',function($r){$r['noindex']=true;$r['nofollow']=true;return $r;});add_action('send_headers',function(){nocache_headers();});add_action('wp_body_open',function(){echo '<aside data-local-preview style=\"padding:12px;background:#fff4ce;text-align:center\">Preview v2 local · Nội dung mẫu trên máy · Chưa phát hành</aside>';});");
 timings.prepareMs=Math.round(performance.now()-started);
 let app,timer;
 try{
  const boot=performance.now();app=await startSite(directory,port,{workers:2});timings.bootMs=Math.round(performance.now()-boot);
  const init=performance.now();
  await php(app,"<?php require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/plugin.php';$r=activate_plugin('vne-library-core/vne-library-core.php');if(is_wp_error($r))throw new Exception($r->get_error_message());");
  const seed=JSON.parse(await php(app,readFileSync('scripts/fixtures/rebuild-preview-seed.php','utf8')));
  assert.equal(seed.owner,ownership.owner,'Preview seed owner mismatch');
  timings.initializeMs=Math.round(performance.now()-init);timings.readyMs=Math.round(performance.now()-started);
  let syncError;
  if(watch)timer=setInterval(()=>{try{sync();syncError=undefined;}catch(error){if(syncError!==error.message)console.error('Preview sync paused: '+error.message);syncError=error.message;}},750);
  return {app,directory,port,base:`http://127.0.0.1:${port}`,seed,timings,sync,get syncError(){return syncError;},async [Symbol.asyncDispose](){clearInterval(timer);await app[Symbol.asyncDispose]();}};
 }catch(error){clearInterval(timer);if(app)await app[Symbol.asyncDispose]();throw error;}
}
