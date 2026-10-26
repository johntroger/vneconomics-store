import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {s15Bundle} from './s15-bundle.mjs';
import {sha256} from './release-lib.mjs';
mkdirSync('tmp/tests',{recursive:true});const root=mkdtempSync(resolve('tmp/tests/s15-audit-')),evidence=resolve('docs/acceptance/S15');mkdirSync(evidence,{recursive:true});
const before=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'].map(p=>sha256(readFileSync(p)));
const one=s15Bundle(),two=s15Bundle();assert.ok(one.zip.equals(two.zip),'Bundle deterministic');
const checks=['bundle rebuild identical'];
const php=resolve('.local/php-8.3.36-nts-x64/php.exe'),audit=join(root,'audit.php');writeFileSync(audit,one.files.find(f=>f.name.endsWith('/audit.php')).data);
const lint=spawnSync(php,['-n','-l',audit],{encoding:'utf8',windowsHide:true});assert.equal(lint.status,0,lint.stderr+lint.stdout);checks.push('PHP syntax valid');
const ps="Expand-Archive -LiteralPath '"+join(root,'bundle.zip').replaceAll("'","''")+"' -DestinationPath '"+join(root,'expanded').replaceAll("'","''")+"'";
writeFileSync(join(root,'bundle.zip'),one.zip);const expanded=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8',windowsHide:true});assert.equal(expanded.status,0,expanded.stderr);
for(const file of one.files){assert.equal(sha256(readFileSync(join(root,'expanded',file.name))),sha256(file.data));checks.push('extracted bytes '+file.name);}
const pins={source:one.sourceSha,manifest:sha256(one.files.find(f=>f.name.endsWith('/manifest.json')).data),plugin:sha256(one.files.find(f=>f.name.endsWith('/plugin.zip')).data)};
const test=join(root,'test.php');
writeFileSync(test,`<?php
define('VNE_S15_AUDIT_TEST',true);require ${JSON.stringify(audit.replaceAll('\\','/'))};
$checks=array();function ok($value,$label){if(!$value)throw new Exception($label);global $checks;$checks[]=$label;}
function rejects($fn,$label){try{$fn();}catch(RuntimeException $e){ok(true,$label);return;}throw new Exception('Accepted invalid case: '.$label);}
$expected=array('root'=>'/staging/','database'=>'staging_db','home'=>'https://stage.example.test','siteurl'=>'https://stage.example.test');$good=$expected+array('blog_public'=>'0');
vne_s15_verify_target($good,$expected);ok(true,'expected staging accepted');
foreach(array('root','database','home','siteurl') as $key){$bad=$good;$bad[$key]='production';rejects(function()use($bad,$expected){vne_s15_verify_target($bad,$expected);},'wrong target rejected: '.$key);}
$bad=$good;$bad['blog_public']='1';rejects(function()use($bad,$expected){vne_s15_verify_target($bad,$expected);},'indexable target rejected');
$dir=__DIR__.'/expanded/s15-release';$pins=json_decode(${JSON.stringify(JSON.stringify(pins))},true);$m=vne_s15_verify_bundle($dir,$pins);ok($m['sourceSha']===$pins['source'],'release manifest and plugin hashes verified');
$original=file_get_contents($dir.'/plugin.zip');file_put_contents($dir.'/plugin.zip','truncated');rejects(function()use($dir,$pins){vne_s15_verify_bundle($dir,$pins);},'truncated package rejected');file_put_contents($dir.'/plugin.zip',$original);
$manifest=file_get_contents($dir.'/manifest.json');file_put_contents($dir.'/manifest.json','{}');rejects(function()use($dir,$pins){vne_s15_verify_bundle($dir,$pins);},'changed manifest rejected');file_put_contents($dir.'/manifest.json',$manifest);
$plugin=__DIR__.'/installed';$files=array(array('path'=>'vne-library-core/test.php','sha256'=>hash('sha256','approved')));
ok(!vne_s15_installed_files($plugin,$files)['present'],'missing plugin observed without installation');mkdir($plugin);file_put_contents($plugin.'/test.php','approved');ok(vne_s15_installed_files($plugin,$files)['hashesMatch'],'installed bytes verified');
file_put_contents($plugin.'/test.php','changed');ok(!vne_s15_installed_files($plugin,$files)['hashesMatch'],'changed installed file rejected');file_put_contents($plugin.'/test.php','approved');
file_put_contents($plugin.'/extra.php','extra');ok(!vne_s15_installed_files($plugin,$files)['hashesMatch'],'extra installed file rejected');unlink($plugin.'/extra.php');unlink($plugin.'/test.php');ok(!vne_s15_installed_files($plugin,$files)['hashesMatch'],'missing installed file rejected');
rejects(function()use($plugin){vne_s15_installed_files($plugin,array(array('path'=>'vne-library-core/../../config.php','sha256'=>'x')));},'manifest traversal rejected');
echo json_encode($checks);
`);
const result=spawnSync(php,['-n',test],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr+result.stdout);checks.push(...JSON.parse(result.stdout));
const web=spawnSync(php,['-n',audit],{encoding:'utf8',windowsHide:true});assert.equal(web.status,1);assert.equal(web.stdout,'');checks.push('direct invocation without WP-CLI denied');
const backend=resolve('scripts/fixtures/s15-backend-probe.php');
const backendLint=spawnSync(php,['-n','-l',backend],{encoding:'utf8',windowsHide:true});assert.equal(backendLint.status,0,backendLint.stderr+backendLint.stdout);checks.push('backend fixture PHP syntax valid');
const backendDirect=spawnSync(php,['-n',backend],{encoding:'utf8',windowsHide:true});assert.equal(backendDirect.status,1);assert.equal(backendDirect.stdout,'');checks.push('backend fixture denied outside bootstrapped WP-CLI');
assert.deepEqual(['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'].map(p=>sha256(readFileSync(p))),before);checks.push('original database/config unchanged');
writeFileSync(join(evidence,'audit-tool-local-tests.json'),JSON.stringify({status:'PASS_LOCAL_AUDIT_TOOL_ONLY',date:new Date().toISOString(),sourceSha:one.sourceSha,checks,bundleSha256:sha256(one.zip),limit:'Standalone PHP guard/hash checks and independent ZIP extraction, not WordPress/MariaDB integration or staging acceptance; cleanup by wrapper after exit'},null,2)+'\n');console.log('PASS S15 audit helper '+checks.length+' local checks.');
