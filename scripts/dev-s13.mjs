import {resolve,join} from 'node:path';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {startSite} from './local-runtime.mjs';
import {seedS13} from './s13-content.mjs';
const dir=resolve('.local/s13-site');let app,closing=false;
async function close(){if(closing)return;closing=true;if(app)await app[Symbol.asyncDispose]();process.exitCode=0;}
try{
 app=await startSite(dir,9430);
 const seed=await seedS13(app,dir);
 const privacy=await app.playground.run({code:"<?php require '/wordpress/wp-load.php';update_option('blog_public',0);"});if(privacy.errors||privacy.exitCode)throw new Error(privacy.errors||privacy.text);
 const config=resolve('.local/s13-admin.json');
 if(!existsSync(config)){
  const password=randomBytes(24).toString('base64url');
  const r=await app.playground.run({code:"<?php require '/wordpress/wp-load.php';wp_set_password("+JSON.stringify(password)+",get_user_by('login','admin')->ID);update_option('blog_public',0);"});
  if(r.errors||r.exitCode)throw new Error(r.errors||r.text);
  writeFileSync(config,JSON.stringify({login:'admin',password,localOnly:true},null,2)+'\n');
 }
 mkdirSync(join(dir,'wp-content/mu-plugins'),{recursive:true});
 writeFileSync(join(dir,'wp-content/mu-plugins/s13-review.php'),"<?php add_filter('pre_wp_mail','__return_false');add_filter('wp_robots',function($r){$r['noindex']=true;return $r;});add_action('wp_body_open',function(){echo '<aside style=\"padding:10px;background:#fff4ce;text-align:center\">Bản nghiệm thu S13 local · Nội dung và báo lỗi lưu trên máy này · Chưa phát hành</aside>';});");
 writeFileSync(resolve('.local/s13-manifest.json'),JSON.stringify(seed,null,2)+'\n');

 const {themeEvidence,pluginEvidence}=await import('./theme-evidence.mjs');
 const url='http://127.0.0.1:9430/';
 let response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(60000)});
 // Playground sends one self-redirect to reset browser cookies after PHP runs.
 // Accept only this known local reset; a second or different redirect fails smoke.
 const cookieReset=response.status===302&&response.headers.get('location')==='/';
 if(cookieReset){await response.arrayBuffer();response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(60000)});}
 const html=await response.text();
 const reviewCheck={status:response.status,cookieReset,resources:(html.match(/data-resource-id=/g)||[]).length,noindex:/name=['"]robots['"][^>]*noindex/.test(html),noStore:(response.headers.get('cache-control')||'').includes('no-store'),banner:html.includes('Bản nghiệm thu S13 local'),testedThemeHashes:themeEvidence(dir),testedPluginHashes:pluginEvidence(dir)};
 if(reviewCheck.status!==200||reviewCheck.resources!==6||!reviewCheck.noindex||!reviewCheck.noStore||!reviewCheck.banner)throw new Error('Retained preview smoke failed: '+JSON.stringify({...reviewCheck,location:response.headers.get('location')}));
 mkdirSync(resolve('docs/acceptance/S13'),{recursive:true});writeFileSync(resolve('docs/acceptance/S13/preview-check.json'),JSON.stringify(reviewCheck,null,2)+'\n');
 console.log('S13 review: http://127.0.0.1:9430/ — retained .local/s13-site; no hosting changes.');
 console.log('Lesson: '+seed.lesson.url);console.log('Admin credentials retained only in ignored .local/s13-admin.json (do not share).');
 process.on('SIGINT',close);process.on('SIGTERM',close);
}catch(e){await close();throw e;}
