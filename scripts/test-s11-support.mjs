import {themeEvidence} from './theme-evidence.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash,randomBytes} from 'node:crypto';
const {chromium}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};const {startSite}=await import('./local-runtime.mjs');
const evidence=resolve(process.argv.includes('--s12')?'docs/acceptance/S12/S11-regression':'docs/acceptance/S11');mkdirSync(evidence,{recursive:true});mkdirSync('tmp/tests',{recursive:true});const fixture=mkdtempSync(resolve('tmp/tests/s11-'));
const files=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'],hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),hashes=()=>files.map(hash),before=hashes();
const checks=[],errors=[],badHTTP=[],externalPublic=[];const check=(v,n)=>{assert.ok(v,n);checks.push(n);};
const base='http://127.0.0.1:19411',password=randomBytes(24).toString('hex');let app,browser;
const timeout=setTimeout(()=>{console.error('S11 timeout');process.exit(1);},1200000);timeout.unref();
async function php(code){let r;try{r=await app.playground.run({code});}catch(e){throw new Error(e.response?new TextDecoder().decode(Uint8Array.from(Object.values(e.response.bytes))):e.message);}assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;}
async function admin(code){return php("<?php require '/wordpress/wp-load.php';wp_set_current_user(get_user_by('login','admin')->ID);"+code);}
async function count(){return Number(await php("<?php require '/wordpress/wp-load.php';global $wpdb;echo $wpdb->get_var(\"SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='vne_report'\");"));}
function support(page='bao-loi',args={}){const u=new URL(base);u.searchParams.set('vne_support',page);for(const[k,v]of Object.entries(args))u.searchParams.set(k,v);return u.href;}
async function newPage(options={},adminMedia=false){
 const ctx=await browser.newContext(options);
 await ctx.route('**/*',r=>{if(new URL(r.request().url()).origin===base)return r.continue();if(!adminMedia)externalPublic.push(r.request().url());return r.abort();});
 const page=await ctx.newPage(),expected=new Set();
 page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400&&!(expected.has(r.status())&&r.request().isNavigationRequest()))badHTTP.push({url:r.url(),status:r.status()});});
 return {ctx,page,expected};
}
async function go(page,url,status=200){const r=await page.goto(url);assert.equal(r.status(),status,url);await page.waitForLoadState('networkidle');assert.doesNotMatch(await page.content(),/Fatal error:|Warning:|Notice:|MUST-NOT-LEAK/);}
async function shot(page,name){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(evidence,name+'.png'),fullPage:true});await page.screenshot({path:join(evidence,name+'-top.png')});}
async function values(page){return page.locator('#resource-report-form').evaluate(f=>Object.fromEntries(new FormData(f)));}
async function submitFailure(f,data,status){f.expected.add(status);await f.page.locator('#resource-report-form').evaluate((form,data)=>{form.noValidate=true;for(const[k,v]of Object.entries(data)){const n=form.elements.namedItem(k);if(n){if(n.type==='checkbox')n.checked=v==='1';else n.value=v;}}},data);const response=f.page.waitForResponse(r=>r.request().isNavigationRequest()&&r.url().startsWith(base));await f.page.locator('button[type=submit]').last().click();const observed=await response;assert.equal(observed.status(),status,'failure form HTTP status');await f.page.waitForLoadState('networkidle');f.expected.clear();}
async function login(f,user){await go(f.page,base+'/wp-login.php?redirect_to='+encodeURIComponent(base+'/wp-admin/admin.php?page=vne-reports'));await f.page.locator('#user_login').fill(user);await f.page.locator('#user_pass').fill(password);await f.page.locator('#wp-submit').click();await f.page.waitForLoadState('networkidle');}
function pluginHashes(root){
 const result={};function scan(dir,relative=''){for(const e of readdirSync(dir,{withFileTypes:true})){const name=relative+e.name,p=join(dir,e.name);if(e.isDirectory())scan(p,name+'/');else if(e.name.endsWith('.php'))result[name]=hash(p);}}scan(root);return result;
}
try{
 app=await startSite(fixture,19411);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 mkdirSync(join(fixture,'wp-content/mu-plugins'),{recursive:true});
 writeFileSync(join(fixture,'wp-content/mu-plugins/s11-rate-fixture.php'),"<?php $_SERVER['REMOTE_ADDR']='203.0.113.211';");
 writeFileSync(join(fixture,'wp-content/mu-plugins/s11-mail-guard.php'),"<?php add_filter('pre_wp_mail',function(){update_option('s11_mail_attempts',(int)get_option('s11_mail_attempts')+1);return false;});");
 const obs=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
 const seed=JSON.parse(await php(readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(obs)+");")));
 const unit=JSON.parse(await php(readFileSync('scripts/fixtures/s11-reports-test.php','utf8').replace('<?php',"<?php define('S11_BASE',"+JSON.stringify(JSON.stringify(seed))+");")));
 console.log('PASS S11 backend '+unit.checks.length+' checks');
 await admin("wp_set_password("+JSON.stringify(password)+",get_user_by('login','admin')->ID);wp_insert_user(array('user_login'=>'s11-editor','user_pass'=>"+JSON.stringify(password)+",'role'=>'vne_library_editor'));wp_insert_user(array('user_login'=>'s11-subscriber','user_pass'=>"+JSON.stringify(password)+",'role'=>'subscriber'));");
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});const f=await newPage({viewport:{width:1440,height:1000}}),{page,ctx}=f;
 for(const key of ['gioi-thieu','tieu-chi','quyen-rieng-tu','dieu-kien','cau-hoi','ho-tro']){
  await go(page,support(key));check(await page.locator('h1').count()===1&&await page.locator('.support-content').textContent().then(t=>t.length>500),'real support content '+key);
  check(await page.locator('.support-nav [aria-current=page]').count()===1,'support nav current '+key);
 }
 await shot(page,'support-help-desktop');
 await go(page,base);for(const name of ['Về thư viện','Trợ giúp và liên hệ','Tiêu chí tuyển chọn','Quyền riêng tư','Điều kiện sử dụng','Câu hỏi thường gặp'])check(await page.locator('.site-footer').getByRole('link',{name,exact:true}).count()===1,'footer real link '+name);
 await go(page,seed.cards[0].url);const report=page.getByRole('link',{name:'Báo lỗi nội dung này',exact:true});check(await report.count()===1,'resource report entrypoint');await report.click();await page.waitForLoadState('networkidle');
 check(await page.locator('.report-context').innerText().then(t=>t.includes(seed.cards[0].title)),'canonical resource context');
 check(await page.locator('input[type=file],input[type=password]').count()===0,'no attachment or secret fields');
 const headers=await ctx.request.get(page.url());check(/no-store|no-cache/.test(headers.headers()['cache-control'])&&headers.headers()['x-robots-tag'].includes('noindex')&&headers.headers()['referrer-policy']==='no-referrer','form private cache/index/referrer headers');
 await shot(page,'report-form-desktop');
 const validDescription='UI-S11: Tôi mở đúng nội dung nhưng đường dẫn minh họa không ra kết quả mong đợi.';
 await page.locator('#report-description').fill(validDescription);await page.locator('#report-kind').selectOption('link');await page.locator('#report-consent').check();
 const payload=await values(page),initial=await count();
 const race=await Promise.all([ctx.request.post(page.url(),{form:payload,maxRedirects:0}),ctx.request.post(page.url(),{form:payload,maxRedirects:0})]);
 check(race.some(r=>r.status()===303)&&race.every(r=>[303,409,429].includes(r.status()))&&(await count())===initial+1,'simultaneous same-ticket submission stores one row');
 const accepted=race.find(r=>r.status()===303);await go(page,new URL(accepted.headers().location,base).href);
 check(await page.getByRole('heading',{name:'Đã lưu báo cáo',exact:true}).count()===1&&(await count())===initial+1,'native submit persists exactly once and confirms');
 const receiptURL=page.url(),code=await page.locator('.receipt-code').innerText();check(!receiptURL.includes('UI-S11')&&!receiptURL.includes('email'),'receipt URL contains no message/email');
 await page.reload();check((await count())===initial+1&&await page.locator('.receipt-code').innerText()===code,'refresh receipt does not submit again');await shot(page,'report-success');
 const duplicate=await ctx.request.post(support('bao-loi',{resource:seed.ids[0]}),{form:payload,maxRedirects:0});check(duplicate.status()===303&&(await count())===initial+1,'same ticket HTTP retry idempotent');
 await go(page,support('bao-loi',{resource:seed.ids[0]}));await submitFailure(f,{kind:'link',description:'ngắn',consent:'1'},400);
 check(await page.getByRole('alert').innerText().then(t=>t.includes('20 đến'))&&await page.locator('#report-description').inputValue()==='ngắn','invalid input clear error preserves safe input');await shot(page,'report-validation-error');
 await go(page,support('bao-loi',{resource:seed.ids[0]}));
 await admin("update_option('s11_fail_storage','pre');");
 writeFileSync(join(fixture,'wp-content/mu-plugins/s11-storage-failure.php'),"<?php add_filter('wp_insert_post_empty_content',function($empty,$p){return get_option('s11_fail_storage')==='pre'&&($p['post_type']??'')==='vne_report'?true:$empty;},10,2);add_action('wp_insert_post',function($id,$p){if(get_option('s11_fail_storage')==='post'&&$p->post_type==='vne_report'){throw new RuntimeException('QA post-insert failure');}},10,2);");
 const beforeFailure=await count(),retryTicket=await values(page);await submitFailure(f,{kind:'instructions',description:validDescription,consent:'1'},503);
 check(await page.getByRole('alert').innerText().then(t=>t.includes('Chưa lưu'))&&(await count())===beforeFailure&&await page.locator('#report-description').inputValue()===validDescription,'storage failure no false success and preserved description');
 check((await values(page)).signature===retryTicket.signature,'definitive storage error keeps original ticket for retry');await shot(page,'report-storage-error');
 await admin("update_option('s11_fail_storage','post');");await submitFailure(f,{kind:'instructions',description:validDescription,consent:'1'},503);
 check(await page.getByRole('alert').innerText().then(t=>t.includes('Chưa xác nhận'))&&(await count())===beforeFailure+1&&(await values(page)).signature===retryTicket.signature,'ambiguous post-insert error preserves same ticket, one row and honest status');await shot(page,'report-ambiguous-error');
 await admin("delete_option('s11_fail_storage');");await page.getByRole('button',{name:'Gửi báo lỗi',exact:true}).click();await page.waitForURL(u=>u.searchParams.has('receipt'));check((await count())===beforeFailure+1,'retry after ambiguous recovery confirms existing row without duplicate');
 await go(page,support('bao-loi',{resource:seed.ids[0]}));const secret='api_key = FAKEKEYFORTESTONLY123456';await submitFailure(f,{kind:'other',description:secret,consent:'1'},400);
 check(!(await page.content()).includes(secret)&&await page.locator('#report-description').inputValue()==='','recognized secrets not reflected or saved');
 for(const [mode,options]of [['no-js',{javaScriptEnabled:false}],['script-blocked',{}]]){
  const g=await newPage({...options,viewport:{width:390,height:844}});
  if(mode==='script-blocked')await g.ctx.route('**/support.js*',r=>r.abort());
  await go(g.page,support('bao-loi',{resource:seed.ids[1]}));await g.page.locator('#report-kind').selectOption('other');await g.page.locator('#report-description').fill(validDescription+' '+mode);await g.page.locator('#report-consent').check();await shot(g.page,'report-'+mode);
  check(await g.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile no overflow '+mode);
  if(mode==='no-js'){const n=await count();await g.page.getByRole('button',{name:'Gửi báo lỗi',exact:true}).click();await g.page.waitForURL(u=>u.searchParams.has('receipt'));check((await count())===n+1,'no JS native form succeeds');}
  await g.ctx.close();
 }
 // Prime the UI boundary immediately; preceding flows may cross the real 15-minute window.
 await admin("$bucket=(int)floor(time()/900);foreach(array($bucket,$bucket+1) as $b){$key='vne_report_rate_'.hash_hmac('sha256','203.0.113.211|'.$b,wp_salt('auth'));set_transient($key,array('attempts'=>3,'saved'=>3),900);}");
 await go(page,support('bao-loi',{resource:seed.ids[0]}));await submitFailure(f,{kind:'other',description:validDescription,consent:'1'},429);check(await page.getByRole('alert').innerText().then(t=>t.includes('15 phút')),'rate limited UI status no success');await shot(page,'report-rate-limit');
 await page.setViewportSize({width:320,height:760});await shot(page,'report-small-mobile');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px error form no overflow');
 await go(page,support('cau-hoi'));await page.locator('summary').first().focus();await page.keyboard.press('Enter');check(await page.locator('details').first().getAttribute('open')!==null,'FAQ keyboard/native details');await shot(page,'faq-mobile');
 await go(page,seed.cards[1].url);check(!(await page.content()).includes('UI-S11'),'resource no report content');await go(page,base+'/?post_type=vne_guide&p='+seed.guide);check(await page.getByRole('link',{name:'Báo lỗi nội dung này',exact:true}).getAttribute('href').then(u=>new URL(u).searchParams.get('resource')===String(seed.guide)),'guide report entrypoint keeps guide ID');
 await go(page,base+'/?s=UNIT-S11&vne_find=1');check(!(await page.locator('main').innerText()).includes('qa-s11@example.com'),'public search no report email');
 const requests=[
  [support('bao-loi',{resource:seed.private}),404],[support('bao-loi',{resource:'999999999'}),404],[support('no-such-page'),404],
  [support('bao-loi',{receipt:'forged'}),410],[base+'/?p='+unit.report_id,404],[base+'/?post_type=vne_report',404],
  [base+'/?post_type%5B%5D=vne_report&feed=rss2',404],[base+'/wp-json/wp/v2/vne_report',404]
 ];
 for(const[url,status]of requests){const r=await ctx.request.get(url);const html=await r.text();check(r.status()===status&&!html.includes('qa-s11@example.com')&&!html.includes('QA Unicode'),'privacy/status '+url.replace(base,'')+' actual='+r.status());}
 const invalidReceipt=receiptURL.replace(/.$/,last=>last==='0'?'1':'0');assert.notEqual(invalidReceipt,receiptURL,'forged receipt must differ from valid receipt');const rr=await ctx.request.get(invalidReceipt);check(rr.status()===410,'forged signature never confirms, HTTP '+rr.status());
 const rawEmail='EDITOR-PRIVATE-S11@example.com';
 // View and delete are administrative capabilities, independent of public form nonces.
 const a=await newPage({viewport:{width:1440,height:1000}},true);await login(a,'admin');
 check(await a.page.getByRole('heading',{name:'Báo lỗi riêng',exact:true}).count()===1&&await a.page.locator('body').innerText().then(t=>t.includes('qa-s11@example.com')),'authorized queue sees private reports');
 check(await a.page.locator('script').evaluateAll(nodes=>nodes.every(n=>!n.textContent.includes('alert(1)'))),'admin output not executable submitted markup');await shot(a.page,'admin-private-queue');
 const row=a.page.locator('article').first(),n=await count();await row.getByRole('button',{name:'Xóa báo cáo này'}).click();await a.page.waitForLoadState('networkidle');check((await count())===n-1,'authorized nonce delete removes only chosen report');
 const badDelete=await a.ctx.request.post(base+'/wp-admin/admin.php?page=vne-reports',{form:{report_id:String(unit.report_id),_wpnonce:'invalid'},maxRedirects:0});check(badDelete.status()===403,'admin invalid nonce deletion denied');await a.ctx.close();
 const editor=await newPage({},true);await login(editor,'s11-editor');check(await editor.page.getByRole('heading',{name:'Báo lỗi riêng',exact:true}).count()===1,'library editor allowed queue');await editor.ctx.close();
 const subscriber=await newPage({},true);subscriber.expected.add(403);await login(subscriber,'s11-subscriber');check(await subscriber.page.locator('body').innerText().then(t=>t.includes('quyền')||t.includes('allowed')),'subscriber denied queue');await subscriber.ctx.close();
 await admin("require_once ABSPATH.'wp-admin/includes/plugin.php';deactivate_plugins('vne-library-core/vne-library-core.php');");
 f.expected.add(503);await go(page,support('bao-loi',{resource:seed.ids[0]}),503);f.expected.clear();check(await page.locator('form#resource-report-form').count()===0,'plugin missing503 no fake form');await shot(page,'report-service-unavailable');
 check(await php("<?php require '/wordpress/wp-load.php';echo (int)get_option('s11_mail_attempts');")==='0','no mail attempted');
 check(externalPublic.length===0,'no external browser media/API calls');assert.deepEqual(errors,[]);assert.deepEqual(badHTTP,[]);
 assert.deepEqual(hashes(),before);check(true,'protected live data unchanged');
 await ctx.close();await browser.close();browser=null;await app[Symbol.asyncDispose]();app=null;
 const sourcePlugin=pluginHashes(resolve('plugins/vne-library-core'));assert.deepEqual(sourcePlugin,pluginHashes(join(fixture,'wp-content/plugins/vne-library-core')));
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:'2026-10-22',checks,backendChecks:unit.checks,rateUIFixture:{remoteAddress:'203.0.113.211',quota:'saved=3/attempts=3 in current and next bucket immediately before UI POST; backend separately exercises real three-save cap'},testedThemeHashes:themeEvidence(fixture),testedPluginHashes:sourcePlugin,errors,badHTTP,externalPublic,protectedHashes:before,liveFilesUnchanged:true,limits:['Local fixture/mock storage failures; no external messages/API/deployment','Basic IP bucket/honeypot/token controls, not hosting WAF or distributed abuse certification','No hosting/MySQL/cache/real user or legal compliance certification']},null,2)+'\n');
 console.log('PASS S11 '+checks.length+' browser/HTTP checks + '+unit.checks.length+' backend checks');
}finally{if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(timeout);assert.deepEqual(hashes(),before);}
