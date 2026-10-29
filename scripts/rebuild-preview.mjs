import assert from 'node:assert/strict';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {startPreview} from './rebuild-preview-runtime.mjs';
import {localRuntimeUserHome} from './local-runtime.mjs';

export function evidenceRoot(){
 const directory=resolve('docs/acceptance/R72-preview',new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8));
 mkdirSync(directory,{recursive:true});return directory;
}
export async function smokePreview(preview,module,output,{marker,cssToken}={}){
 assert.ok(['home','discovery','search','guides'].includes(module),'Unknown preview smoke module');
 marker??=readFileSync('themes/vibelab-v2/functions.php','utf8').match(/define\('VIBELAB_V2_RELEASE_MARKER',\s*'([^']+)'\)/)?.[1];
 assert.ok(marker,'Current source marker missing');
 const seedPath=join(output,'seed.json');writeFileSync(seedPath,JSON.stringify(preview.seed)+'\n');
 const library=process.env.VNE_PREVIEW_PLAYWRIGHT??join(localRuntimeUserHome,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
 assert.ok(existsSync(library),'Set VNE_PREVIEW_PLAYWRIGHT to the installed Playwright index.mjs');
 const started=Date.now();
 const exitCode=await new Promise((done,fail)=>{
  const child=spawn(process.execPath,['scripts/rebuild-preview-browser.mjs','--base',preview.base,'--module',module,'--marker',marker,'--seed',seedPath,'--output',join(output,'browser'),...(cssToken?['--expect-css-token',cssToken]:[])],{stdio:'inherit',windowsHide:true,env:{...process.env,VNE_PREVIEW_PLAYWRIGHT:library}});
  child.once('error',fail);child.once('exit',code=>done(code));
 });
 const result={module,exitCode,durationMs:Date.now()-started,timings:preview.timings,browserResult:'browser/result.json'};
 writeFileSync(join(output,'smoke.json'),JSON.stringify(result,null,2)+'\n');
 assert.equal(exitCode,0,'Preview smoke failed; inspect '+join(output,'browser/result.json'));
 return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const [mode='dev',module='home',...extra]=process.argv.slice(2);
 assert.ok(['dev','smoke'].includes(mode)&&extra.length===0,'Use dev or smoke [home|discovery|search|guides]');
 if(mode==='smoke')assert.ok(['home','discovery','search','guides'].includes(module),'Unknown module');
 const preview=await startPreview();
 let closing=false;
 async function close(){if(closing)return;closing=true;await preview[Symbol.asyncDispose]();}
 if(mode==='dev'){
  console.log(`Preview v2: ${preview.base} — retained .local/rebuild-v2; source sync every 750ms. Refresh the browser after saving.`);
  console.log('Local synthetic content only. Mail/external HTTP/cron disabled. Stop with Ctrl+C before running another managed task.');
  console.log(JSON.stringify(preview.timings));
  process.once('SIGINT',()=>{void close();});process.once('SIGTERM',()=>{void close();});
 }else{
  try{const output=evidenceRoot();await smokePreview(preview,module,output);console.log('PASS preview '+module+' — '+output);}finally{await close();}
 }
}
