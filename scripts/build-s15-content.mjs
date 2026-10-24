import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sha256,makeZip} from './release-lib.mjs';
const source='594ccd9a7de812a49f2c0d8260d20cbfced71752',php=resolve('.local/php-8.3.36-nts-x64/php.exe');
mkdirSync('tmp/tests',{recursive:true});const tmp=mkdtempSync(resolve('tmp/tests/s15-content-'));
const paths={seed:'scripts/fixtures/s13-integrated-seed.php',lesson:'docs/content-samples/S10-moc-studio-lesson.html',observations:'docs/acceptance/S02/source-observations.json',model:'plugins/vne-library-core/model.php',state:'plugins/vne-library-core/state.php'};
const sourceFiles=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,{path:p,sha256:sha256(readFileSync(p))}]));
let seed=readFileSync(paths.seed,'utf8');
seed=seed.slice(seed.indexOf('function s13_save'),seed.indexOf('// Only initial installer defaults'));
assert.equal((seed.match(/\$r=vne_library_record_validation/g)??[]).length,1);
seed=seed.split(/\r?\n/).filter(line=>!line.startsWith('$r=vne_library_record_validation')).join('\n');
for(const forbidden of ['activate_plugin(','switch_theme(','update_option(','wp_update_post(','wp-load.php','vne_library_record_validation('])assert.ok(!seed.includes(forbidden),'Forbidden local-seed side effect '+forbidden);
const b64=p=>readFileSync(p).toString('base64');
const stateCapture=join(tmp,'state-capture.php');
writeFileSync(stateCapture,readFileSync(paths.state,'utf8').replace('function vne_library_save_state(','function vne_s15_unused_save_state('));
const capture=`<?php define('ABSPATH',__DIR__.'/');require ${JSON.stringify(resolve(paths.model).replaceAll('\\','/'))};
function add_action(...$args){} function add_filter(...$args){} require ${JSON.stringify(stateCapture.replaceAll('\\','/'))};
define('S13_CONTENT',base64_decode('${b64(paths.lesson)}'));define('S13_OBSERVATIONS',base64_decode('${b64(paths.observations)}'));
$GLOBALS['items']=array();$GLOBALS['states']=array();
function is_wp_error($r){return false;} function wp_parse_url($v,$part=-1){return parse_url($v,$part);} function esc_html($v){return htmlspecialchars($v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');} function esc_url($v){return $v;}
function get_permalink($id){return 'https://staging-store.vneconomics.com/__S15_ITEM_'.$id.'__/';}
function vne_library_create_term($p){static $id=0;return array('term_id'=>++$id);}
function vne_library_save_item($p){$id=count($GLOBALS['items'])+1;$p['post_type']=$p['post_type']??'vne_resource';$GLOBALS['items'][]=array('key'=>$id,'payload'=>$p);return array('id'=>$id);}
function vne_library_save_state($id,$s){$GLOBALS['states'][$id]=$s;return true;}
${seed}
foreach($GLOBALS['items'] as &$i){if(isset($GLOBALS['states'][$i['key']]))$i['state']=$GLOBALS['states'][$i['key']];}unset($i);
echo json_encode($GLOBALS['items'],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);`;
const capturePath=join(tmp,'capture.php');writeFileSync(capturePath,capture);
const run=()=>{const r=spawnSync(php,['-n',capturePath],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr+r.stdout);return JSON.parse(r.stdout);};
const items=run();assert.deepEqual(items,run());
assert.equal(items.length,11);assert.deepEqual(items.map(x=>x.key),Array.from({length:11},(_,i)=>i+1));
assert.equal(items.filter(x=>x.payload.post_type==='vne_resource').length,6);assert.equal(items.filter(x=>x.payload.post_type==='vne_guide').length,4);assert.equal(items.filter(x=>x.payload.post_type==='vne_practice').length,1);
assert.ok(items.every(x=>!x.validations));assert.ok(items.slice(0,6).every(x=>x.payload.data.observed_at==='2026-10-19'));
const payload=Buffer.from(JSON.stringify({format:1,sourceFiles,categories:['Nền tảng web','Mẫu dự án','Skills cho AI agent'],items},null,2)+'\n');
const payloadSha=sha256(payload),importer=readFileSync('scripts/fixtures/s15-content-import.php','utf8').replace('__PAYLOAD_SHA256__',payloadSha);
const importPath=join(tmp,'import.php');writeFileSync(importPath,importer);writeFileSync(join(tmp,'content.json'),payload);
const lint=spawnSync(php,['-n','-l',importPath],{encoding:'utf8',windowsHide:true});assert.equal(lint.status,0,lint.stderr+lint.stdout);
const direct=spawnSync(php,['-n',importPath],{encoding:'utf8',windowsHide:true});assert.equal(direct.status,1);assert.equal(direct.stdout,'');
const unit=join(tmp,'checks.php');writeFileSync(unit,`<?php define('VNE_S15_IMPORT_TEST',true);require ${JSON.stringify(importPath.replaceAll('\\','/'))};
$good=array('root'=>'/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/','database'=>'vne35060_wp_udx1z','home'=>'https://staging-store.vneconomics.com','indexing'=>'0','plugin'=>'0.4.2','schema'=>3,'theme'=>'vibelab','themeVersion'=>'0.7.0');vne_s15_import_target($good);$checks=1;
foreach(array_keys($good) as $key){$bad=$good;$bad[$key]='wrong';try{vne_s15_import_target($bad);throw new Exception('Accepted wrong '.$key);}catch(RuntimeException $e){$checks++;}}
$data=vne_s15_import_payload(__DIR__.'/content.json','${payloadSha}');$checks++;
try{vne_s15_import_payload(__DIR__.'/content.json',str_repeat('0',64));throw new Exception('Accepted wrong hash');}catch(RuntimeException $e){$checks++;}
$url=vne_s15_import_links('https://staging-store.vneconomics.com/__S15_ITEM_7__/',array(7=>array('url'=>'https://staging-store.vneconomics.com/lesson/')));if($url!=='https://staging-store.vneconomics.com/lesson/')throw new Exception('Link mapping');$checks++;
try{vne_s15_import_links('https://staging-store.vneconomics.com/__S15_ITEM_9__/',array());throw new Exception('Accepted missing mapping');}catch(RuntimeException $e){$checks++;}
echo $checks;`);
const checked=spawnSync(php,['-n',unit],{encoding:'utf8',windowsHide:true});assert.equal(checked.status,0,checked.stderr+checked.stdout);
const files=[{name:'s15-content/content.json',data:payload},{name:'s15-content/import.php',data:Buffer.from(importer)}],zip=makeZip(files);
const folder=resolve('artifacts/staging',source,'content-import',sha256(Buffer.from(importer)).slice(0,12));mkdirSync(folder,{recursive:true});
for(const [name,data] of [['content.json',payload],['import.php',Buffer.from(importer)],['s15-content-import.zip',zip]]){const path=join(folder,name);if(existsSync(path))assert.equal(sha256(readFileSync(path)),sha256(data),'Existing artifact differs');else writeFileSync(path,data);}
const info={status:'PASS_CONTENT_BUILD_LOCAL_ONLY',artifactDirectory:folder,sourceFiles,payloadSha256:payloadSha,importerSha256:sha256(Buffer.from(importer)),zipSha256:sha256(zip),counts:{resources:6,guides:4,practice:1,categories:3},checks:['deterministic capture','forbidden local bootstrap/settings writes removed','no validation records imported','historical source dates retained','PHP syntax','direct entry denied',Number(checked.stdout)+' guard/hash/link assertions'],limits:'No local WordPress mutation or remote import performed by builder; remote dry-run required'};
writeFileSync(join(folder,'build-info.json'),JSON.stringify(info,null,2)+'\n');console.log(JSON.stringify(info,null,2));
