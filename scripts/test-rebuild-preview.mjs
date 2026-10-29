import assert from 'node:assert/strict';
import {appendFileSync,cpSync,existsSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {setTimeout as wait} from 'node:timers/promises';
import {startPreview,php} from './rebuild-preview-runtime.mjs';
import {evidenceRoot,smokePreview} from './rebuild-preview.mjs';

const deadline=setTimeout(()=>{console.error('Preview tests exceeded 600 seconds');process.exit(1);},600000);deadline.unref();
const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const originals=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php','themes/vibelab-v2/style.css','plugins/vne-library-core/vne-library-core.php'];
const before=Object.fromEntries(originals.filter(existsSync).map(path=>[path,sha(path)]));
mkdirSync('tmp/tests',{recursive:true});
const fixture=mkdtempSync(resolve('tmp/tests/rebuild-preview-')),directory=join(fixture,'site'),sourceRoot=join(fixture,'source'),output=evidenceRoot(),checks=[],timings=[];
let preview;
const result={status:'FAIL',checks,timings};
try{
 const unowned=join(fixture,'unowned');mkdirSync(unowned);writeFileSync(join(unowned,'keep.txt'),'owner data');
 await assert.rejects(startPreview({directory:unowned,port:19472}),/unowned/);
 assert.equal(readFileSync(join(unowned,'keep.txt'),'utf8'),'owner data');checks.push('existing unowned site refused without modification');
 await assert.rejects(startPreview({directory:resolve('.local/site'),port:19472}),/directory must/);checks.push('baseline local site cannot be selected as preview');
 for(const base of ['themes/vibelab-v2','plugins/vne-library-core'])cpSync(base,join(sourceRoot,base),{recursive:true});
 preview=await startPreview({directory,sourceRoot,port:19472});timings.push({stage:'first-start',...preview.timings});
 const seed=preview.seed;
 await php(preview.app,"<?php require '/wordpress/wp-load.php';update_option('r72_owner_value','retained-owner-change');$id=wp_insert_post(array('post_type'=>'page','post_status'=>'draft','post_title'=>'R72 owner draft'));update_option('r72_owner_draft',$id);");
 const initial=await php(preview.app,"<?php require '/wordpress/wp-load.php';echo wp_json_encode(array('posts'=>(int)$wpdb->get_var('SELECT COUNT(*) FROM '.$wpdb->posts),'draft'=>get_option('r72_owner_draft')));");
 const css=join(sourceRoot,'themes/vibelab-v2/style.css');appendFileSync(css,'\nbody { --r72-hot: updated; }\n');
 const hotStarted=Date.now();
 for(;;){
  const response=await fetch(preview.base+'/wp-content/themes/vibelab-v2/style.css?hot='+Date.now(),{signal:AbortSignal.timeout(15000)});
  if((await response.text()).includes('--r72-hot: updated'))break;
  assert.ok(Date.now()-hotStarted<10000,'Source CSS did not sync');await wait(150);
 }
 timings.push({stage:'source-css-visible',ms:Date.now()-hotStarted});
 const pass=join(output,'discovery');mkdirSync(pass);await smokePreview(preview,'discovery',pass,{cssToken:'updated'});checks.push('live CSS source sync and discovery desktop/mobile smoke without restart');
 const failed=join(output,'expected-failure');mkdirSync(failed);
 await assert.rejects(smokePreview(preview,'home',failed,{marker:'DELIBERATE-WRONG-MARKER'}),/Preview smoke failed/);
 assert.equal(JSON.parse(readFileSync(join(failed,'browser/result.json'),'utf8')).status,'FAIL');checks.push('wrong marker fails smoke and retains separate failure result');
 await preview[Symbol.asyncDispose]();preview=undefined;
 await assert.rejects(fetch('http://127.0.0.1:19472/',{signal:AbortSignal.timeout(2000)}));checks.push('server and workers stop after failed smoke');
 preview=await startPreview({directory,sourceRoot,port:19472});timings.push({stage:'retained-restart',...preview.timings});
 assert.deepEqual(preview.seed,seed);
 const retained=JSON.parse(await php(preview.app,"<?php require '/wordpress/wp-load.php';echo wp_json_encode(array('posts'=>(int)$wpdb->get_var('SELECT COUNT(*) FROM '.$wpdb->posts),'draft'=>get_option('r72_owner_draft'),'value'=>get_option('r72_owner_value'),'title'=>get_the_title(get_option('r72_owner_draft'))));"));
 const saved=JSON.parse(initial);assert.equal(retained.posts,saved.posts);assert.equal(retained.draft,saved.draft);assert.equal(retained.value,'retained-owner-change');assert.equal(retained.title,'R72 owner draft');checks.push('restart preserves owner content/options and seed IDs without duplicates');
 for(const module of ['search','guides']){const out=join(output,module);mkdirSync(out);await smokePreview(preview,module,out);checks.push(module+' selected desktop/mobile smoke');}
 const copiedCss=join(directory,'wp-content/themes/vibelab-v2/style.css');appendFileSync(copiedCss,'\n/* unexpected target edit */\n');
 assert.throws(()=>preview.sync(),/edited outside source/);assert.ok(readFileSync(copiedCss,'utf8').includes('unexpected target edit'));checks.push('target code conflict stops sync and preserves edit');
 result.status='PASS';
}catch(error){result.error=String(error.stack??error);throw error;}
finally{
 if(preview)await preview[Symbol.asyncDispose]();clearTimeout(deadline);
 const after=Object.fromEntries(Object.keys(before).map(path=>[path,sha(path)]));
 result.baselineUnchanged=JSON.stringify(before)===JSON.stringify(after);result.baselineHashes=after;
 if(!result.baselineUnchanged)result.status='FAIL';
 writeFileSync(join(output,'result.json'),JSON.stringify(result,null,2)+'\n');
 assert.ok(result.baselineUnchanged,'Existing local DB/config and original source unchanged');
 console.log(result.status+' R7.2 preview workflow — '+output);
}
