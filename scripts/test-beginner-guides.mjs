import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,cpSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base=resolve('docs/content-guides/2026-10-25'),manifest=JSON.parse(readFileSync(join(base,'drafts.json'),'utf8'));
mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/beginner-guides-'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const protectedPaths=['docs/content-samples/S10-moc-studio-lesson.html','.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'];
const before=protectedPaths.map(hash),checks=[],errors=[],requests=[];
const check=(v,name)=>{assert.ok(v,name);checks.push(name);};
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&');
function ps(shell,code,cwd,ok=true){const script=join(fixture,'run.ps1');writeFileSync(script,'\ufeff'+code);const p=spawnSync(shell,['-NoProfile','-NonInteractive','-File',script],{cwd,encoding:'utf8',windowsHide:true,timeout:30000});if(ok)assert.equal(p.status,0,p.stderr);else assert.notEqual(p.status,0,'expected refusal');return p;}
let browser;
try{
 check(manifest.drafts.length===2&&new Set(manifest.drafts.map(x=>x.key)).size===2,'two distinct new drafts; Codex reference retained');
 for(const d of manifest.drafts){
  check(d.status==='draft'&&d.wordpressValidationRecorded===false,'no public status or fabricated WordPress validation '+d.key);
  check(createHash('sha256').update(d.content).digest('hex')===d.contentSha256,'content pinned '+d.key);
  check(!/<(?:script|iframe|form|img)\b/i.test(d.content),'no active content or remote media '+d.key);
  check((d.content.match(/<h2>/g)||[]).length===12,'all12 teaching/check/source sections '+d.key);
  const blocks=[...d.content.matchAll(/<pre class="language-powershell"><code>([\s\S]*?)<\/code><\/pre>/g)].map(m=>decode(m[1]));
  check(blocks.length===4,'four exact PowerShell command blocks '+d.key);
  for(const shell of ['powershell.exe','pwsh.exe']){
   const root=join(fixture,d.key+'-'+shell);mkdirSync(root);ps(shell,blocks[0],root);const folder=join(root,d.key==='claude-code'?'moc-studio-claude':'moc-studio-antigravity');
   check(existsSync(folder),'setup directory '+d.key+' '+shell);
   cpSync('examples/s10-moc-studio/index.html',join(folder,'index.html'));cpSync('examples/s10-moc-studio/style.css',join(folder,'style.css'));
   ps(shell,blocks[1],folder);const initial=hash(join(folder,'index.html')),style=hash(join(folder,'style.css'));
   ps(shell,blocks[2],folder);const checkpoint=hash(join(folder,'checkpoint-v1/index.html'));
   const changed=readFileSync(join(folder,'index.html'),'utf8').replace('Ảnh đẹp để sản phẩm lên tiếng','Hình ảnh chỉn chu cho sản phẩm của bạn');writeFileSync(join(folder,'index.html'),changed);
   check(hash(join(folder,'index.html'))!==initial,'title change replay '+d.key+' '+shell);
   ps(shell,blocks[2],folder,false);check(hash(join(folder,'checkpoint-v1/index.html'))===checkpoint,'existing checkpoint refuses overwrite '+d.key+' '+shell);
   ps(shell,blocks[3],folder);check(hash(join(folder,'index.html'))===initial&&hash(join(folder,'style.css'))===style,'restore exact original bytes '+d.key+' '+shell);
   ps(shell,blocks[0],root,false);check(hash(join(folder,'index.html'))===initial,'existing exercise refuses overwrite '+d.key+' '+shell);
  }
 }
 const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));await page.route('**/*',r=>{if(r.request().url().startsWith('file:'))return r.continue();requests.push(r.request().url());return r.abort();});
 await page.goto(pathToFileURL(join(base,'preview.html')).href);check(await page.locator('nav a').count()===3,'exactly three main lesson choices');
 for(const width of [1280,390,320]){await page.setViewportSize({width,height:900});await page.goto(pathToFileURL(join(base,'preview.html')).href);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow '+width);for(const key of ['claude-code','antigravity']){await page.locator('nav a[href="#'+key+'"]').click();check(page.url().endsWith('#'+key),'lesson navigation '+key+' '+width);}await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(base,'preview-'+width+'.png')});}
 check(errors.length===0&&requests.length===0,'preview has no page errors or external requests');
 check(JSON.stringify(protectedPaths.map(hash))===JSON.stringify(before),'original Codex source and local DB/config unchanged');
 writeFileSync(join(base,'local-checks.json'),JSON.stringify({status:'PASS_LOCAL_GUIDE_DRAFTS',observedAt:new Date().toISOString(),checks,errors,requests,protectedHashes:before,limitations:['This preview runner makes no new AI requests or installation/sign-in tests; owner-assisted output trials have separate evidence','Fixture replay uses existing Codex example; not an extra run of the other tools','Standalone content preview; WordPress publication/commands gate not changed','Production unchanged']},null,2)+'\n');console.log('PASS two guide drafts: '+checks.length+' checks; no production changes');
}finally{if(browser)await browser.close();}
