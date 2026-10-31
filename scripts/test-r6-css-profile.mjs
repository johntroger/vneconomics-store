import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync,existsSync,cpSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';
import {r6CssProfile,prepareR6CssCandidate,writeR6CssCandidate,verifyR6CssCandidate} from './release-r6-css.mjs';

const native=process.argv.includes('--native'),receiver=process.argv.includes('--receiver');assert.ok(process.argv.slice(2).every(arg=>['--native','--receiver'].includes(arg)),'Use optional --native or --receiver');
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/r6-css-'));
const repo=join(fixture,'git'),checks=[];const deadline=setTimeout(()=>{console.error('R6 CSS tests exceeded 600 seconds');process.exit(1);},600000);deadline.unref();
function runGit(args,{input,cwd=repo}={}){const r=spawnSync('git',args,{cwd,input,encoding:null,windowsHide:true,maxBuffer:32*1024*1024});assert.equal(r.status,0,r.stderr?.toString());return r.stdout;}
runGit(['clone','--shared','--no-checkout',resolve('.'),repo],{cwd:fixture});
runGit(['config','user.name','R6 CSS fixture']);runGit(['config','user.email','fixture@example.invalid']);
const base=r6CssProfile.source,cssPath='themes/vibelab-v2/style.css';
const originalCss=runGit(['show',base+':'+cssPath]);
function sourceWith(path,data,{mode='100644'}={}){
 runGit(['read-tree',base]);const blob=runGit(['hash-object','-w','--stdin'],{input:data}).toString().trim();
 runGit(['update-index','--add','--cacheinfo',mode+','+blob+','+path]);const tree=runGit(['write-tree']).toString().trim();
 return runGit(['commit-tree',tree,'-p',base,'-m','Synthetic local profile test; no publish']).toString().trim();
}
const css=Buffer.concat([originalCss,Buffer.from('\nbody { --r78-probe: candidate; }\n')]);
const source=sourceWith(cssPath,css),cache=new Map();
const reader=args=>{const key=JSON.stringify(args);if(!cache.has(key))cache.set(key,runGit(args));return cache.get(key);};
let prepared;
try{
 prepared=prepareR6CssCandidate(source,{readGit:reader});const second=prepareR6CssCandidate(source,{readGit:reader});
 for(const [name,data] of Object.entries(prepared.buffers))assert.equal(sha256(data),sha256(second.buffers[name]));checks.push('two builds for exact SHA are byte identical');
 assert.equal(prepared.manifest.productionBaselinePayload,r6CssProfile.payload);assert.equal(prepared.manifest.pluginVersion,'0.4.4');
 assert.equal(sha256(prepared.buffers['plugin.zip']),sha256(reader(['show',r6CssProfile.payload+':plugin.zip'])));
 assert.equal(sha256(prepared.buffers['previous-plugin.zip']),sha256(prepared.buffers['plugin.zip']));
 assert.equal(sha256(prepared.buffers['previous-theme.zip']),sha256(reader(['show',r6CssProfile.payload+':theme.zip'])));checks.push('rollback uses actual R6 v2/plugin0.4.4 archives including stars');
 for(const invalid of ['HEAD',source.toUpperCase(),'a'.repeat(39)])assert.throws(()=>prepareR6CssCandidate(invalid,{readGit:reader}));checks.push('branch refs, uppercase and short SHAs rejected');
 assert.throws(()=>prepareR6CssCandidate(base,{readGit:reader}),/Only a real change/);checks.push('no-op release rejected');
 for(const path of ['themes/vibelab-v2/functions.php','plugins/vne-library-core/model.php','deploy/receiver.php','themes/vibelab-v2/new.php']){
  const changed=sourceWith(path,Buffer.from('<?php /* forbidden fixture */'));assert.throws(()=>prepareR6CssCandidate(changed,{readGit:reader}),/Only a real change/);
 }checks.push('PHP, schema/plugin, deploy and extra app files rejected');
 const linked=sourceWith(cssPath,Buffer.from('../private.css'),{mode:'120000'});assert.throws(()=>prepareR6CssCandidate(linked,{readGit:reader}),/regular/);checks.push('CSS symlink rejected');
 for(const suffix of ['\n@import "https://example.invalid/style.css";','\nbody{background:url(https://example.invalid/a)}','\nbody{background:u\\72l(x)}','\n<?php echo 1;']){
  const changed=sourceWith(cssPath,Buffer.concat([originalCss,Buffer.from(suffix)]));assert.throws(()=>prepareR6CssCandidate(changed,{readGit:reader}));
 }checks.push('external/escaped CSS and PHP markup rejected');
 for(const data of [Buffer.concat([originalCss,Buffer.from([255])]),Buffer.concat([originalCss,Buffer.alloc(256*1024,32)])]){
  const changed=sourceWith(cssPath,data);assert.throws(()=>prepareR6CssCandidate(changed,{readGit:reader}));
 }checks.push('invalid UTF-8 and oversized CSS rejected');
 for(const blob of ['manifest.json','theme.zip','plugin.zip']){
  const badReader=args=>{const bytes=reader(args);return args[0]==='show'&&args[1]===r6CssProfile.payload+':'+blob?Buffer.concat([bytes,Buffer.from('bad')]):bytes;};
  assert.throws(()=>prepareR6CssCandidate(source,{readGit:badReader}));
 }checks.push('manifest and both actual baseline ZIP hash drift rejected');
 const dir=join(fixture,'candidate');writeR6CssCandidate(source,dir,{readGit:reader});verifyR6CssCandidate(source,dir,{readGit:reader});
 assert.throws(()=>writeR6CssCandidate(source,dir,{readGit:reader}),/Immutable/);
 writeFileSync(join(dir,'theme.zip'),'tampered');assert.throws(()=>verifyR6CssCandidate(source,dir,{readGit:reader}),/bytes differ/);checks.push('immutable output and package tampering guards');
 if(native){
  const {exerciseR6CssNative}=await import('./test-r6-css-native.mjs');
  checks.push(...await exerciseR6CssNative({fixture,prepared}));
 }
 if(receiver){const {exerciseCssReceiver}=await import('./test-r6-css-receiver.mjs');checks.push(...await exerciseCssReceiver({fixture,prepared}));}
 console.log(JSON.stringify({status:'PASS_R6_CSS_PROFILE',native,receiver,checks,sourceFixtureOnly:source,deployAuthorized:false}));
}finally{clearTimeout(deadline);}
