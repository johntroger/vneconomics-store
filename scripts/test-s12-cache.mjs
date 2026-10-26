import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {themeEvidence,pluginEvidence} from './theme-evidence.mjs';
const {chromium,request}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browserEnv={...process.env};
const {startSite}=await import('./local-runtime.mjs');
const evidence=resolve(process.argv.includes('--s13')?'docs/acceptance/S13/S12-regression':'docs/acceptance/S12');mkdirSync(evidence,{recursive:true});mkdirSync('tmp/tests',{recursive:true});
const fixture=mkdtempSync(resolve('tmp/tests/s12-')),base='http://127.0.0.1:19412';
const protectedFiles=['.local/site/wp-content/database/.ht.sqlite','.local/site/wp-config.php'];
const hashes=()=>protectedFiles.map(p=>createHash('sha256').update(readFileSync(p)).digest('hex'));
const before=hashes(),checks=[],observations=[],mutations=[],password=randomBytes(24).toString('hex');let app,browser;
const check=(v,n)=>{assert.ok(v,n);checks.push(n);};
async function php(code){let r;try{r=await app.playground.run({code:"<?php require '/wordpress/wp-load.php';"+code});}catch(e){throw new Error(e.response?new TextDecoder().decode(Uint8Array.from(Object.values(e.response.bytes))):e.message);}assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);return r.text;}
const admin=async code=>{const event={number:mutations.length+1,started:new Date().toISOString()};try{return await php("wp_set_current_user(get_user_by('login','admin')->ID);"+code);}finally{event.completed=new Date().toISOString();mutations.push(event);}};
function assertHeaders(r,label){check(/private/.test(r.headers()['cache-control']??'')&&/no-store/.test(r.headers()['cache-control']??''),label+' bypass');}
async function get(url,status=200){const r=await browser.request.get(url);check(r.status()===status,url.replace(base,'')+' HTTP '+status);assertHeaders(r,url.replace(base,''));return r;}
const timeout=setTimeout(()=>{console.error('S12 timeout');process.exit(1);},1200000);timeout.unref();
try {
 app=await startSite(fixture,19412);
 cpSync(resolve('plugins/vne-library-core'),join(fixture,'wp-content/plugins/vne-library-core'),{recursive:true});
 cpSync(resolve('themes/vibelab'),join(fixture,'wp-content/themes/vibelab'),{recursive:true});
 const obs=readFileSync('docs/acceptance/S02/source-observations.json','utf8').replace(/^\uFEFF/,'');
 let r=await app.playground.run({code:readFileSync('scripts/fixtures/s06-theme-seed.php','utf8').replace('<?php',"<?php define('S06_OBSERVATIONS',"+JSON.stringify(obs)+");")});
 assert.equal(r.errors,'');assert.equal(r.exitCode,0,r.text);const seed=JSON.parse(r.text),id=seed.ids[0],source=seed.cards[0].source;
 await admin("$id="+id+";$s=vne_library_default_state();$s['source_access']=array('status'=>'available','source_url'=>"+JSON.stringify(source)+",'observed_at'=>'2026-10-22','note'=>'Fixture only');$s['maintenance']=array('status'=>'active','source_url'=>"+JSON.stringify(source)+",'observed_at'=>'2026-10-22','note'=>'Fixture only');$r=vne_library_save_state($id,$s);if(is_wp_error($r))throw new Exception($r->get_error_message());$r=vne_library_save_dependencies("+seed.guide+",array(array('resource_id'=>$id,'resource_revision'=>vne_library_revision($id),'step'=>'Bước kiểm tra S12','tool'=>'Codex','version'=>'fixture')));if(is_wp_error($r))throw new Exception($r->get_error_message());update_option('s12_original',vne_library_editorial_snapshot($id),false);wp_set_password("+JSON.stringify(password)+",get_user_by('login','admin')->ID);");
 browser=await chromium.launch({channel:'msedge',headless:true,env:browserEnv});
 // APIRequestContext uses the same HTTP boundary, without browser cache.
 browser.request=await request.newContext();
 const ctx=await browser.newContext({viewport:{width:1280,height:900}});
 await ctx.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const archive=await php("echo get_post_type_archive_link('vne_resource');"),category=await php("$i=vne_library_item("+id+");echo get_term_link($i['primary_category'],'vne_category');");
 const guide=await php("echo get_permalink("+seed.guide+");");
 const listURLs=[base+'/',archive,category,base+'/?s=Web&vne_find=1'];
 const api=base+'/wp-json/vne-library/v1/items/'+id;
 async function snapshot(label,status='normal',hidden=false,title=seed.cards[0].title){
   const at=new Date().toISOString(),values=[];
   for(const url of listURLs){
    const response=await page.goto(url);assert.equal(response.status(),200);assertHeaders(response,label+' listing');
    const card=page.locator('[data-resource-id="'+id+'"]');
    check((await card.count())===(hidden?0:1),label+' listing membership '+url.replace(base,''));
    if(!hidden){check((await card.locator('h3').innerText())===title,label+' approved title');if(status==='suspended')check(await card.locator('a[href="'+source+'"]').count()===0,label+' card source blocked');}
    values.push({url:url.replace(base,''),status:response.status(),at:new Date().toISOString()});
   }
   const d=await page.goto(seed.cards[0].url);assert.equal(d.status(),hidden?404:200);assertHeaders(d,label+' detail');
   if(!hidden){check(await page.locator('h1').innerText()===title,label+' detail title');if(status==='suspended')check(await page.locator('main a[href="'+source+'"]').count()===0,label+' detail source blocked');}
   const a=await get(api,hidden?404:200),item=await a.json();
   if(!hidden){check(item.title===title&&item.derived.recommendation_status===status,label+' API canonical');}
   const list=await get(base+'/wp-json/vne-library/v1/items');check((await list.json()).some(i=>i.id===id)===!hidden,label+' API list membership');
   const g=await page.goto(guide);assert.equal(g.status(),200);assertHeaders(g,label+' guide');
   const gi=await get(base+'/wp-json/vne-library/v1/items/'+seed.guide);
   const state=(await gi.json()).derived;
   if(hidden||status==='suspended')check(state.commands_allowed===false&&state.warnings.length>0,label+' dependent guide blocked');
   if(hidden||status==='suspended')check(state.warnings.some(w=>w.code===(hidden?'dependency_hidden':'dependency_suspended')),label+' exact dependency warning');
   if(hidden||status==='suspended')check((await page.locator('main').innerText()).includes(hidden?'không còn công khai':'tạm ngừng khuyến nghị'),label+' visible dependency warning');
   observations.push({label,started:at,completed:new Date().toISOString(),mutation:mutations.at(-1),values,guideWarnings:state.warnings});console.log('PASS scenario '+label);
 }
 await snapshot('warm');
 await admin("$p=get_option('s12_original');$p['title']='Web S12 revision mới';$p['excerpt']='Web S12 nội dung đã duyệt mới';$r=vne_library_save_item($p,"+id+");if(is_wp_error($r))throw new Exception($r->get_error_message());");
 await snapshot('approved-edit','normal',false,'Web S12 revision mới');
 await page.goto(seed.cards[0].url);
 await Promise.all([page.waitForEvent('load'),page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})))]);
 check(await page.locator('h1').innerText()==='Web S12 revision mới','restored history page reloads current snapshot');
 const renamed=JSON.parse(await admin("$p=vne_library_item("+id+");wp_update_term($p['primary_category'],'vne_category',array('name'=>'Danh mục S12 mới'));echo wp_json_encode($GLOBALS['vne_library_cache_dirty']);"));
 check(Object.hasOwn(renamed,'0'),'taxonomy rename marks whole library dirty');
 await page.goto(base+'/');check(await page.locator('[data-resource-id="'+id+'"]').innerText().then(t=>t.includes('Danh mục S12 mới')),'warm home shows renamed taxonomy');

 await admin("$s=vne_library_state_input("+id+");$s['recommendation']=array('status'=>'suspended','reason'=>'S12 cảnh báo fixture');vne_library_save_state("+id+",$s);");
 await snapshot('suspended','suspended',false,'Web S12 revision mới');
 await page.screenshot({path:join(evidence,'dependent-guide-warning.png'),fullPage:true});
 await admin("wp_update_post(array('ID'=>"+id+",'post_status'=>'draft'));");
 await snapshot('withdrawn','suspended',true);
 await admin("$p=get_option('s12_original');vne_library_save_item($p,"+id+");");
 // Restored publication does not erase the suspension.
 await snapshot('republished-still-suspended','suspended');
 const objectFault=JSON.parse(await admin("add_action('clean_post_cache',function(){throw new RuntimeException('private object failure');});echo wp_json_encode(vne_library_cache_purge(array("+id+")));"));
 check(objectFault.ok===false,'native object-cache exception recorded without fatal response');
 const failure=JSON.parse(await admin("add_filter('vne_library_cache_purge_result','__return_false');$r=vne_library_cache_purge(array("+id+"));echo wp_json_encode(array('attempt'=>$r,'incident'=>get_option('vne_library_cache_incident')));"));
 check(failure.attempt.ok===false&&!!failure.incident.id,'purge failure recorded without false success');
 for(const url of [...listURLs,seed.cards[0].url,guide,api,base+'/wp-json/vne-library/v1/items']){
   const response=await get(url,503);const text=await response.text();
   check(!text.includes('PRIVATE-EDITORIAL')&&!text.includes('href="'+source+'"'),'purge failure blocks potentially stale public content '+url.replace(base,''));
 }
 check(await php("wp_cache_set('vne_library_cache_incident',false,'options');echo vne_library_cache_incident_active()?'1':'0';")==='1','safety switch read bypasses stale object-cache option');
 const notice=JSON.parse(await admin("$real=vne_library_cache_incident_read();add_filter('pre_option_vne_library_cache_incident',function(){return array('id'=>'STALE-CACHE-ID');});ob_start();do_action('admin_notices');$html=ob_get_clean();echo wp_json_encode(array('real'=>strpos($html,$real['id'])!==false,'stale'=>strpos($html,'STALE-CACHE-ID')!==false));"));
 check(notice.real&&!notice.stale,'recovery notice reads actual DB incident despite stale cached option');
 const persistent=JSON.parse(await admin("vne_library_cache_purge();echo wp_json_encode(get_option('vne_library_cache_incident'));"));
 check(persistent.id===failure.incident.id,'ordinary successful purge does not clear incident');
 const unauthorized=await php("$r=vne_library_cache_retry("+JSON.stringify(failure.incident.id)+");echo is_wp_error($r)?$r->get_error_data()['status']:0;");
 check(unauthorized==='403','anonymous retry denied');
 check(await admin("$r=vne_library_cache_retry('wrong');echo $r->get_error_data()['status'];")==='409','wrong incident retry denied');
 await admin("add_filter('vne_library_cache_purge_result',function(){throw new RuntimeException('PRIVATE-MUST-NOT-LEAK');});vne_library_cache_purge();");
 const incident=JSON.parse(await php("echo wp_json_encode(get_option('vne_library_cache_incident'));"));
 check(!JSON.stringify(incident).includes('PRIVATE'),'purge exception does not store raw message');
 const recovery=JSON.parse(await admin("add_filter('pre_option_vne_library_cache_incident',function(){return array('id'=>'STALE-CACHE-ID');});$r=vne_library_cache_retry("+JSON.stringify(incident.id)+");echo wp_json_encode(array('ok'=>$r['ok'],'incident'=>vne_library_cache_incident_read()));"));
 check(recovery.ok===true&&recovery.incident===false,'authorized exact-incident recovery confirmed');
 const concurrent=JSON.parse(await admin("add_filter('vne_library_cache_purge_result','__return_false');vne_library_cache_purge();remove_filter('vne_library_cache_purge_result','__return_false');$old=get_option('vne_library_cache_incident');add_filter('vne_library_cache_purge_result',function($ok){update_option('vne_library_cache_incident',array('id'=>'newer-incident','at'=>gmdate('c'),'scope'=>'whole-library'),false);return true;});$r=vne_library_cache_retry($old['id']);echo wp_json_encode(array('result'=>$r,'incident'=>get_option('vne_library_cache_incident')));"));
 check(concurrent.incident.id==='newer-incident'&&concurrent.result.resolved===false,'recovery cannot erase a newer concurrent incident');
 await admin("vne_library_cache_retry('newer-incident');");

 await snapshot('purge-recovered-still-suspended','suspended');
 await admin("add_filter('vne_library_cache_purge_result','__return_false');vne_library_cache_purge();");
 const recoveryContext=await browser.newContext();await recoveryContext.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
 const recoveryPage=await recoveryContext.newPage();
 await recoveryPage.goto(base+'/wp-login.php?redirect_to='+encodeURIComponent(base+'/wp-admin/admin.php?page=vne-library'));
 await recoveryPage.locator('#user_login').fill('admin');await recoveryPage.locator('#user_pass').fill(password);await recoveryPage.locator('#wp-submit').click();await recoveryPage.waitForURL(u=>u.pathname.endsWith('admin.php'));
 check(await recoveryPage.getByRole('button',{name:'Thử làm mới và xác nhận phục hồi',exact:true}).count()===1,'operator sees durable incident and recovery action');
 await recoveryPage.screenshot({path:join(evidence,'admin-cache-incident.png'),fullPage:false});
 const nonceDenied=await recoveryContext.request.post(base+'/wp-admin/admin-post.php',{form:{action:'vne_cache_retry',incident_id:'bad',_wpnonce:'bad'},maxRedirects:0});
 check(nonceDenied.status()===403,'recovery UI invalid nonce rejected');
 await Promise.all([recoveryPage.waitForNavigation(),recoveryPage.getByRole('button',{name:'Thử làm mới và xác nhận phục hồi',exact:true}).click()]);
 check(await php("echo vne_library_cache_incident_active()?'1':'0';")==='0','operator recovery UI clears only confirmed incident');
 await get(api);await recoveryContext.close();
 // Reverse proxy simulation honors no-store: repeated warm requests cannot populate this HTTP cache.
 const cache=new Map();let stored=0;
 for(let i=0;i<2;i++){const response=await get(api);if(!/no-store|private/.test(response.headers()['cache-control']??'')){cache.set(api,await response.text());stored++;}}
 check(stored===0&&cache.size===0,'compliant shared cache refuses warmed public API');
 const denied=await get(api+'?context=edit',403);check(!(await denied.text()).includes('PRIVATE-EDITORIAL'),'edit response private');
 const pending=await get(base+'/wp-json/vne-library/v1/proposals/'+seed.pending,403);check(!(await pending.text()).includes('PENDING-MUST-NOT-LEAK'),'pending preview denied');
 await get(base+'/wp-json/vne-library/v1/byok',404);
 const feed=await browser.request.get(base+'/?feed=rss2&post_type=vne_resource',{headers:{'If-Modified-Since':'Thu, 01 Jan 2099 00:00:00 GMT'}});
 check(feed.status()===404,'unsupported native feed cannot bypass policy with conditional 304');assertHeaders(feed,'native feed');
 await get(base+'/?vne_support=bao-loi&resource='+id);
 await get(base+'/?vne_support=bao-loi&receipt=invalid',410);
 const a=await ctx.newPage();await a.goto(base+'/wp-login.php?redirect_to='+encodeURIComponent(base+'/wp-admin/admin.php?page=vne-library-preview&proposal='+seed.pending));
 await a.locator('#user_login').fill('admin');await a.locator('#user_pass').fill(password);await a.locator('#wp-submit').click();await a.waitForURL(u=>u.pathname.endsWith('admin.php'));
 const preview=await a.reload();assertHeaders(preview,'authorized private preview');check((preview.headers()['x-robots-tag']??'').includes('noindex'),'private preview noindex');
 await a.close();
 await ctx.clearCookies();await page.goto(base+'/');check(!(await page.content()).includes('PENDING-MUST-NOT-LEAK'),'preview never contaminates public cache');
 check(errors.length===0,'no browser script errors');
 check(JSON.parse(await php("echo wp_json_encode(get_option('vne_library_cache_last_attempt'));")).scope==='whole-library','mutation shutdown coordinator ran');
 assert.deepEqual(hashes(),before);
 writeFileSync(join(evidence,'test-results.json'),JSON.stringify({date:'2026-10-22',checks,observations,mutations,testedThemeHashes:themeEvidence(fixture),testedPluginHashes:pluginEvidence(fixture),protectedHashes:before,errors,limits:['Local WordPress/SQLite only; external cache not configured or verified','BYOK not built; namespace denial only','No deployment, external API, messages or paid requests']},null,2)+'\n');
 console.log('PASS S12 '+checks.length+' checks');
 await ctx.close();await browser.request.dispose();await browser.close();browser=null;
}finally{if(browser)await browser.close();if(app)await app[Symbol.asyncDispose]();clearTimeout(timeout);assert.deepEqual(hashes(),before);}
