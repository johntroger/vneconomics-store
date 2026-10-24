import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';
const php=resolve('.local/php-8.3.36-nts-x64/php.exe');
const template=readFileSync('scripts/fixtures/s15-http-fault-template.php','utf8');
mkdirSync('tmp/tests',{recursive:true});const root=mkdtempSync(resolve('tmp/tests/s15-http-fault-'));
const token='a'.repeat(32),checks=[];
for(const [name,mode,overrides,expected] of [
 ['missing','missing',{},'missing'],['error','error',{},'error'],['slow','slow',{},'slow'],
 ['unsigned','missing',{header:''},'inactive'],['wrong-token','error',{header:'error.'+'b'.repeat(32)},'inactive'],
 ['expired','error',{expires:1},'inactive'],['wrong-path','error',{path:'/'},'inactive'],
 ['wrong-root','error',{root:'/production/'},'inactive'],['wrong-db','error',{db:'production'},'inactive'],
 ['indexable','error',{public:1},'inactive'],['cli','error',{cli:true},'inactive'],
 ['wrong-method','error',{method:'POST'},'inactive'],
]) {
 const log=join(root,name+'.jsonl').replaceAll('\\','/'),file=join(root,name+'.php');
 const source=template.replaceAll('__S15_TOKEN__',token).replaceAll('__S15_EXPIRES__',String(overrides.expires??Math.floor(Date.now()/1000)+600)).replaceAll('__S15_LOG__',log);
 const setup=`<?php define('ABSPATH',${JSON.stringify(overrides.root??'/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/')});define('DB_NAME',${JSON.stringify(overrides.db??'vne35060_wp_udx1z')});define('WP_CLI',${overrides.cli?'true':'false'});function get_option($k){return ${overrides.public??0};}$hooks=array();function add_filter($h,$f,$p=10){global $hooks;$hooks[$h]=$f;}function add_action($h,$f,$p=10){add_filter($h,$f,$p);}class WP_Error{public function __construct(...$x){}}$_SERVER['REQUEST_URI']=${JSON.stringify(overrides.path??'/wp-json/vne-library/v1/items')};$_SERVER['REQUEST_METHOD']=${JSON.stringify(overrides.method??'GET')};$_SERVER['HTTP_X_S15_FAULT']=${JSON.stringify(overrides.header??mode+'.'+token)};?>`;
 const exercise=`<?php $kind='inactive';$start=hrtime(true);if(isset($hooks['option_active_plugins'])){$v=$hooks['option_active_plugins'](array('vne-library-core/vne-library-core.php','other/plugin.php'));if($v!==array('other/plugin.php'))throw new Exception('wrong plugin filter');$kind='missing';}if(isset($hooks['plugins_loaded'])){try{$hooks['plugins_loaded']();$kind='slow';}catch(RuntimeException $e){$kind='error';}}if($kind!=='inactive'){if($hooks['pre_wp_mail']()!==false)throw new Exception('mail not blocked');if(!($hooks['pre_http_request']() instanceof WP_Error))throw new Exception('HTTP not blocked');}echo json_encode(array('kind'=>$kind,'ms'=>(hrtime(true)-$start)/1000000));`;
 const fixture=join(root,name+'.fixture.php');writeFileSync(fixture,source);
 writeFileSync(file,setup.replace(/\?>$/,'')+'require '+JSON.stringify(fixture.replaceAll('\\','/'))+';'+exercise.replace(/^<\?php /,''));
 const r=spawnSync(php,['-n',file],{encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(r.status,0,r.stderr+r.stdout);const result=JSON.parse(r.stdout);assert.equal(result.kind,expected,name);if(expected==='slow')assert.ok(result.ms>=1900);if(expected==='inactive')assert.equal(existsSync(log),false);else assert.equal(JSON.parse(readFileSync(log,'utf8')).mode,mode);checks.push(name+' scoped behavior and shutdown ownership');
}
writeFileSync('docs/acceptance/S15/http-fault-tool-local-tests.json',JSON.stringify({status:'PASS_LOCAL_HTTP_FAULT_TOOL',observedAt:new Date().toISOString(),templateSha256:sha256(Buffer.from(template)),checks,initialHarnessFailure:'First local harness concatenated an extra PHP open tag. It failed before executing fixture logic; run-clean passed. Fixed by requiring a separate fixture file so guard returns are scoped correctly.',limit:'Stubbed WordPress hook contract only; actual HTTP behavior must be observed on staging'},null,2)+'\n');
console.log('PASS S15 request-scoped fault tool '+checks.length+' checks');
