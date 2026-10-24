import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';
const php=resolve('.local/php-8.3.36-nts-x64/php.exe');
const helper=resolve('scripts/fixtures/s15-file-rollback.php');
mkdirSync('tmp/tests',{recursive:true});
const root=mkdtempSync(resolve('tmp/tests/s15-rollback-'));
const args=['-n','-d','extension_dir='+resolve('.local/php-8.3.36-nts-x64/ext'),'-d','extension=zip'];
const checks=[];
const before=['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'].map(p=>sha256(readFileSync(p)));
const lint=spawnSync(php,[...args,'-l',helper],{encoding:'utf8',windowsHide:true});
assert.equal(lint.status,0,lint.stdout+lint.stderr); checks.push('helper PHP lint');
const denied=spawnSync(php,[...args,helper],{encoding:'utf8',windowsHide:true});
assert.equal(denied.status,1);assert.equal(denied.stdout,'');checks.push('direct entry without WP-CLI denied');
const release=resolve('artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752');
const script=join(root,'test.php');
const slash=p=>p.replaceAll('\\','/');
writeFileSync(script,`<?php
define('VNE_S15_ROLLBACK_TEST',true);require ${JSON.stringify(slash(helper))};
$checks=array();function check($v,$n){global $checks;if(!$v)throw new RuntimeException($n);$checks[]=$n;}
foreach(array('../outside','theme/../../config.php','/absolute','theme//file.php','theme/evil'.chr(92).'path.php') as $bad){$denied=false;try{s15_rb_name($bad);}catch(RuntimeException $e){$denied=true;}check($denied,'unsafe path denied: '.$bad);}
$manifest=json_decode(file_get_contents(${JSON.stringify(slash(join(release,'manifest.json')))}),true);$source=array();
foreach(array('plugin','theme') as $kind){$zip=new ZipArchive();check($zip->open(${JSON.stringify(slash(release))}.'/'.$manifest['components'][$kind]['archive'])===true,'open release '.$kind);foreach($manifest['components'][$kind]['files'] as $entry){$bytes=$zip->getFromName($entry['path']);check($bytes!==false&&hash('sha256',$bytes)===$entry['sha256'],'source hash '.$entry['path']);$source[$kind.'/'.substr($entry['path'],strpos($entry['path'],'/')+1)]=$bytes;}$zip->close();}
$result=s15_rb_run(__DIR__,$source);check($result['cleanup']===true,'full candidate rehearsal cleaned');check($result['sourceFiles']===46,'all release component files used');
$preserved=__DIR__.'/ownership';mkdir($preserved);file_put_contents($preserved.'/keep.txt','pre-existing');$owned=array('files'=>array(),'dirs'=>array());$refused=false;try{s15_rb_put($preserved,'keep.txt','replace',$owned);}catch(RuntimeException $e){$refused=true;}check($refused&&file_get_contents($preserved.'/keep.txt')==='pre-existing','unowned file never overwritten');s15_rb_put($preserved,'nested/owned.txt','owned',$owned);s15_rb_clear($preserved,$owned);check(file_get_contents($preserved.'/keep.txt')==='pre-existing'&&!file_exists($preserved.'/nested'),'cleanup preserves unowned neighbor');
$failed=false;try{s15_rb_run(__DIR__,array('plugin/vne-library-core.php'=>'<?php','theme/functions.php'=>'<?php','../escape'=>'bad'));}catch(RuntimeException $e){$failed=true;}check($failed,'malicious source refused before fixture creation');
echo json_encode(array('checks'=>$checks,'rehearsal'=>$result));
`);
const run=spawnSync(php,[...args,script],{encoding:'utf8',windowsHide:true,timeout:30000});
assert.equal(run.status,0,run.stderr+run.stdout);
const result=JSON.parse(run.stdout);checks.push(...result.checks,...result.rehearsal.checks);
assert.deepEqual(['.local/site/wp-config.php','.local/site/wp-content/database/.ht.sqlite'].map(p=>sha256(readFileSync(p))),before);
checks.push('genuine local database and config unchanged');
assert.equal(readdirSync(root).filter(n=>n.startsWith('s15-rollback-')).length,0);checks.push('no rehearsal directories remain');
writeFileSync('docs/acceptance/S15/file-rollback-local-tests.json',JSON.stringify({status:'PASS_LOCAL_ROLLBACK_TOOL',observedAt:new Date().toISOString(),helperSha256:sha256(readFileSync(helper)),checks,limits:result.rehearsal.limits},null,2)+'\n');
console.log('PASS S15 isolated rollback helper '+checks.length+' checks');
