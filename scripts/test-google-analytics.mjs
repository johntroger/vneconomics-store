import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync,mkdtempSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {runInNewContext} from 'node:vm';
import {startSite} from './local-runtime.mjs';

mkdirSync('tmp/tests',{recursive:true});
const fixture=mkdtempSync(resolve('tmp/tests/google-analytics-'));
const header=readFileSync('themes/vibelab-v2/header.php','utf8').split('<?php wp_head(); ?>')[0];
const checks=[];
let site;
try {
 site=await startSite(join(fixture,'wordpress'),19479,{workers:1});
 for (const [home,preview,expected] of [
  ['https://store.vneconomics.com',false,true],
  ['https://staging-store.vneconomics.com',false,false],
  ['http://127.0.0.1:19479',false,false],
  ['https://store.vneconomics.com',true,false],
 ]) {
  const code=`<?php define('ABSPATH','/wordpress/'); function language_attributes(){echo 'lang="vi"';} function bloginfo($key){echo 'UTF-8';} function home_url($path){return '${home}'.$path;} function wp_parse_url($url,$part){return parse_url($url,$part);} function is_preview(){return ${preview?'true':'false'};} ?>`+header;
  const result=await site.playground.run({code});
  assert.equal(result.exitCode,0,result.errors);assert.equal(result.errors,'');
  assert.equal(result.text.includes('googletagmanager.com/gtag/js?id=G-H6KT7TDC9P'),expected);
  if(expected){
   assert.equal((result.text.match(/<script async /g)||[]).length,1);
   const js=result.text.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
   const context={window:{}};context.window=context;
   runInNewContext(js,context);
   assert.equal(context.dataLayer.length,2);
   assert.equal(context.dataLayer[0][0],'js');
   assert.equal(context.dataLayer[1][0],'config');
   assert.equal(context.dataLayer[1][1],'G-H6KT7TDC9P');
  }
  checks.push({home,preview,tagPresent:expected});
 }
 const report={status:'PASS',checks,externalAnalyticsRequests:false};
 mkdirSync('docs/acceptance/google-analytics',{recursive:true});
 writeFileSync('docs/acceptance/google-analytics/local-test.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
} finally {if(site)await site[Symbol.asyncDispose]();}
