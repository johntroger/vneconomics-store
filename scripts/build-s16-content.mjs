import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sha256,makeZip} from './release-lib.mjs';
const source='594ccd9a7de812a49f2c0d8260d20cbfced71752';
const previous=resolve('artifacts/staging',source,'content-import/edb20972c8e8');
const payload=readFileSync(join(previous,'content.json'));
assert.equal(sha256(payload),'d96ee1409998e06c6aae822adb0e60b609fc0cac927b1bd7ac1a68cb6ec5a934');
let importer=readFileSync(join(previous,'import.php'),'utf8');
assert.equal(sha256(Buffer.from(importer)),'edb20972c8e86cd4643540c281daac55a0ef335542d00b4f1ef5c92de71ad0c3');
// Keep placeholder resolution from the approved payload; only its target guard and journal change.
const replacements=[['Owner-approved staging content only.','Owner-approved production content only.'],['/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/','/var/www/vhosts/vneconomics.com/store.vneconomics.com/'],['vne35060_wp_udx1z','vne35060_wp_kmqnf'],["'home'=>'https://staging-store.vneconomics.com'","'home'=>'https://store.vneconomics.com'"],["'indexing'=>'0'","'indexing'=>'1'"],['Staging import guard:','Production import guard:'],["$registry='vne_s15_content_import'","$registry='vne_s16_content_import'"],['IMPORTED_APPROVED_STAGING_CONTENT','IMPORTED_APPROVED_PRODUCTION_CONTENT']];
for(const [a,b]of replacements){assert.equal(importer.split(a).length,2,'exact single replacement '+a);importer=importer.replace(a,b);}
const baseline='d6b5b93b7f7a4a235659ebfa9aa73d4e42f580636bfc0ffef69800531163a651';
const needle='    $data=vne_s15_import_payload';
assert.equal(importer.split(needle).length,2);
importer=importer.replace(needle,`    $originalRows=$wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE post_type IN (%s,%s) ORDER BY ID",'post','page'),ARRAY_A);
    if(hash('sha256',wp_json_encode($originalRows))!=='${baseline}')throw new RuntimeException('Original production posts/pages changed; review before import');
${needle}`);
mkdirSync('tmp/tests',{recursive:true});const tmp=mkdtempSync(resolve('tmp/tests/s16-content-'));
writeFileSync(join(tmp,'import.php'),importer);writeFileSync(join(tmp,'content.json'),payload);
const php=resolve('.local/php-8.3.36-nts-x64/php.exe');
const run=args=>{const r=spawnSync(php,args,{encoding:'utf8',windowsHide:true});return r;};
assert.equal(run(['-n','-l',join(tmp,'import.php')]).status,0,'PHP lint');
const denied=run(['-n',join(tmp,'import.php')]);assert.equal(denied.status,1);assert.equal(denied.stdout,'');
writeFileSync(join(tmp,'checks.php'),`<?php define('VNE_S15_IMPORT_TEST',true);require __DIR__.'/import.php';
$good=array('root'=>'/var/www/vhosts/vneconomics.com/store.vneconomics.com/','database'=>'vne35060_wp_kmqnf','home'=>'https://store.vneconomics.com','indexing'=>'1','plugin'=>'0.4.2','schema'=>3,'theme'=>'vibelab','themeVersion'=>'0.7.0');vne_s15_import_target($good);$checks=1;
foreach(array_keys($good) as $k){$bad=$good;$bad[$k]='wrong';$denied=false;try{vne_s15_import_target($bad);}catch(RuntimeException $e){$denied=true;}if(!$denied)throw new Exception('Accepted wrong '.$k);$checks++;}
$stage=$good;$stage['home']='https://staging-store.vneconomics.com';try{vne_s15_import_target($stage);throw new Exception('Accepted staging');}catch(RuntimeException $e){$checks++;}
$data=vne_s15_import_payload(__DIR__.'/content.json','${sha256(payload)}');$checks++;
try{vne_s15_import_payload(__DIR__.'/content.json',str_repeat('0',64));throw new Exception('Accepted wrong hash');}catch(RuntimeException $e){$checks++;}
$mapped=vne_s15_import_links(array('url'=>'https://staging-store.vneconomics.com/__S15_ITEM_7__/'),array(7=>array('url'=>'https://store.vneconomics.com/lesson/')));if($mapped['url']!=='https://store.vneconomics.com/lesson/')throw new Exception('Production mapping failed');$checks++;
try{vne_s15_import_links('https://staging-store.vneconomics.com/__S15_ITEM_9__/',array());throw new Exception('Accepted missing map');}catch(RuntimeException $e){$checks++;}echo $checks;`);
const checked=run(['-n',join(tmp,'checks.php')]);assert.equal(checked.status,0,checked.stderr+checked.stdout);
const directory=resolve('artifacts/production',source,'content-import',sha256(Buffer.from(importer)).slice(0,12));mkdirSync(directory,{recursive:true});
const zip=makeZip([{name:'s16-content/content.json',data:payload},{name:'s16-content/import.php',data:Buffer.from(importer)}]);
for(const [name,bytes]of [['content.json',payload],['import.php',Buffer.from(importer)],['s16-content-import.zip',zip]]){const p=join(directory,name);if(existsSync(p))assert.equal(sha256(readFileSync(p)),sha256(bytes));else writeFileSync(p,bytes);}
const result={status:'PASS_PRODUCTION_IMPORT_TOOL_GUARDS',sourceSha:source,artifactDirectory:directory,payloadSha256:sha256(payload),importerSha256:sha256(Buffer.from(importer)),zipSha256:sha256(zip),assertions:Number(checked.stdout),checks:['approved payload bytes unchanged','pinned derived importer','production-only target/indexing guard','reject every wrong target field and staging','payload hash and recursive production links','unknown link refused','original post/page baseline guard','PHP syntax and direct entry denied'],limits:['No runtime WordPress mutation in builder','Production dry-run and readback required','CLI tooling only; no application payload changes']};
writeFileSync(join(directory,'build-info.json'),JSON.stringify(result,null,2)+'\n');writeFileSync('docs/acceptance/S16/content-tool-local-tests.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
