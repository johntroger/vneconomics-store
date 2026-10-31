<?php
// Test-only CLI in an isolated Docker namespace. No production path overrides.
$base='/var/www/vhosts/vneconomics.com';$root=$base.'/store.vneconomics.com';$control=$base.'/deploy-control/production';$inbox=$base.'/deploy-inbox/production';
function native_need($ok,$message){if(!$ok)throw new RuntimeException($message);}
native_need(PHP_SAPI==='cli'&&is_file('/.dockerenv')&&preg_match('/^[a-f0-9]{64}$/D',getenv('RUNTIME_NATIVE_FIXTURE')?:''),'Isolated native fixture required');
native_need(PHP_MAJOR_VERSION===8&&PHP_MINOR_VERSION===3&&class_exists('ZipArchive')&&extension_loaded('mysqli'),'Native PHP8.3 Zip/MySQL required');
function native_copy($from,$to){if(is_dir($from)){if(!is_dir($to))mkdir($to,0755,true);foreach(scandir($from) as $name)if($name!=='.'&&$name!=='..')native_copy($from.'/'.$name,$to.'/'.$name);}else native_need(copy($from,$to),'Fixture core copy failed');}
function native_own($path,$gid=1004){chown($path,10044);chgrp($path,$gid);if(is_dir($path))foreach(scandir($path) as $name)if($name!=='.'&&$name!=='..')native_own($path.'/'.$name,$gid);}
$mode=$argv[1]??'';
try{
 if($mode==='--setup'){
  native_need(posix_geteuid()===0&&scandir($base)===array('.','..'),'Fresh root-owned tmpfs required');
  require '/fixture/package/receiver.php';$policy=vne_adapter_production_policy();native_need($policy['root']===$root&&$policy['control']===$control,'Fixture policy differs');
  native_copy('/usr/src/wordpress',$root);
  foreach(array($control,$inbox,$base.'/git/vneconomics-store-production.git/refs/heads') as $dir)mkdir($dir,0700,true);
  foreach(scandir('/fixture/package') as $name)if($name!=='.'&&$name!=='..')copy('/fixture/package/'.$name,$inbox.'/'.$name);
  $meta=json_decode(file_get_contents('/fixture/meta.json'),true,32,JSON_THROW_ON_ERROR);
  file_put_contents($base.'/git/vneconomics-store-production.git/HEAD','ref: refs/heads/release-production'.PHP_EOL);file_put_contents($base.'/git/vneconomics-store-production.git/refs/heads/release-production',$meta['approval']['payloadSha'].PHP_EOL);
  foreach(array('previous-theme.zip'=>'themes','plugin.zip'=>'plugins') as $zip=>$dest){$z=new ZipArchive();native_need($z->open($inbox.'/'.$zip)===true,'Fixture archive open failed');native_need($z->extractTo($root.'/wp-content/'.$dest),'Fixture archive extract failed');$z->close();}
  foreach($policy['activePlugins'] as $plugin)if($plugin!=='vne-library-core/vne-library-core.php'){$path=$root.'/wp-content/plugins/'.$plugin;if(!is_dir(dirname($path)))mkdir(dirname($path),0755,true);file_put_contents($path,'<?php /* Plugin Name: Native fixture metadata stub */');}
  $config=<<<'PHP_CONFIG'
<?php
define('DB_NAME','vne35060_wp_kmqnf');define('DB_USER','native_fixture');define('DB_PASSWORD',getenv('FIXTURE_DB_PASSWORD'));define('DB_HOST','fixture-db');define('DB_CHARSET','utf8mb4');define('DB_COLLATE','');$table_prefix='wp_';
define('WP_HOME','https://store.vneconomics.com');define('WP_SITEURL','https://store.vneconomics.com');define('WP_HTTP_BLOCK_EXTERNAL',true);define('DISABLE_WP_CRON',true);define('FS_METHOD','direct');define('WP_DISABLE_FATAL_ERROR_HANDLER',true);
$GLOBALS['wp_filter']['pre_wp_mail'][10][]=array('function'=>function(){return false;},'accepted_args'=>1);
if(PHP_SAPI==='cli')$GLOBALS['wp_filter']['enable_maintenance_mode'][10][]=array('function'=>function(){return false;},'accepted_args'=>1);
if(!defined('ABSPATH'))define('ABSPATH',__DIR__.'/');require_once ABSPATH.'wp-settings.php';
PHP_CONFIG;
  file_put_contents($root.'/wp-config.php',$config);
  $key=array('format'=>1,'purpose'=>'r6-css-health-proof','target'=>$policy['home'],'key'=>bin2hex(random_bytes(32)));file_put_contents($control.'/health-key.json',json_encode($key));chmod($control.'/health-key.json',0600);
  file_put_contents($base.'/.dispatcher-native-owned',getenv('RUNTIME_NATIVE_FIXTURE'));native_own($base);chmod($control,0700);chmod($inbox,0700);
  echo json_encode(array('setup'=>true));exit;
 }
 native_need(posix_geteuid()===10044&&posix_getegid()===1004&&file_get_contents($base.'/.dispatcher-native-owned')===getenv('RUNTIME_NATIVE_FIXTURE'),'Native fixture ownership differs');
 $input=json_decode(stream_get_contents(STDIN),true,32,JSON_THROW_ON_ERROR);
 $_SERVER['HTTP_HOST']='store.vneconomics.com';$_SERVER['SERVER_NAME']='store.vneconomics.com';$_SERVER['HTTPS']='on';$_SERVER['REQUEST_URI']='/';
 if($mode==='--install-db')define('WP_INSTALLING',true);
 require $root.'/wp-load.php';
 if($mode==='--install-db'){
  require_once ABSPATH.'wp-admin/includes/upgrade.php';wp_install('Native dispatcher fixture','native_admin','fixture@example.invalid',true,'',bin2hex(random_bytes(16)));
  require_once ABSPATH.'wp-admin/includes/plugin.php';wp_set_current_user(1);$r=activate_plugin('vne-library-core/vne-library-core.php');native_need(!is_wp_error($r),'Fixture plugin activation failed');switch_theme('vibelab-v2');
  $meta=json_decode(file_get_contents('/fixture/meta.json'),true);update_option('active_plugins',$meta['activePlugins']);update_option('blog_public','1');update_option('home','https://store.vneconomics.com');update_option('siteurl','https://store.vneconomics.com');
  wp_insert_post(array('post_type'=>'vne_resource','post_status'=>'draft','post_title'=>'Native fixture owner resource'));
  echo json_encode(array('installed'=>true,'wordpress'=>$wp_version,'database'=>$wpdb->db_version()));exit;
 }
 wp_set_current_user($mode==='--run-no-user'?0:1);
 if($mode==='--kill-after-reservation'){
  native_need(array_keys($input)===array('code','expectedStatus')&&is_string($input['code'])&&in_array($input['expectedStatus'],array('KEY_RESERVATION_CREATED','KEY_RESERVATION_RELEASED'),true),'Fixture reservation crash request differs');
  ob_start();eval($input['code']);$raw=ob_get_clean();$r=json_decode($raw,true,32,JSON_THROW_ON_ERROR);native_need(($r['status']??null)===$input['expectedStatus'],'Reservation did not reach lost-receipt checkpoint');
  file_put_contents($base.'/.native-key-crash',json_encode(array('pid'=>getmypid(),'status'=>$r['status'])));chmod($base.'/.native-key-crash',0600);native_need(posix_kill(getmypid(),9),'Cannot stop reservation fixture PHP');throw new RuntimeException('Reservation SIGKILL did not stop PHP');
 }
 if($mode==='--run-mutex-held'){
  native_need(array_keys($input)===array('code')&&is_string($input['code']),'Fixture mutex command differs');$h=fopen($control.'/runtime-mutex.lock','r+');native_need(is_resource($h)&&flock($h,LOCK_EX|LOCK_NB),'Fixture shared mutex unavailable');try{eval($input['code']);}finally{flock($h,LOCK_UN);fclose($h);}exit;
 }
 if($mode==='--crash-run'){
  native_need(is_array($input)&&array_keys($input)===array('code','expectedPhase','expectedCssSha256')&&is_string($input['code'])&&in_array($input['expectedPhase'],array('INSTALLING','ROLLING_BACK'),true)&&preg_match('/^[a-f0-9]{64}$/D',$input['expectedCssSha256']),'Native crash request differs');
  add_action('upgrader_process_complete',function()use($input,$base,$control){
   // Read owner from the durable lock; setup metadata belongs to the first case.
   $lock=json_decode(file_get_contents($control.'/receiver.lock'),true,32,JSON_THROW_ON_ERROR);$owner=$lock['approval']['owner']??'';
   native_need(is_string($owner)&&preg_match('/^[a-f0-9]{32}$/D',$owner),'Crash lock owner differs');
   $j=vne_adapter_json($control.'/journal-'.$owner.'.json');$css=hash_file('sha256',WP_CONTENT_DIR.'/themes/vibelab-v2/style.css');
   native_need($j['phase']===$input['expectedPhase']&&$css===$input['expectedCssSha256']&&file_exists(ABSPATH.'.maintenance'),'Native update did not reach crash checkpoint');
   $path=$base.'/.native-crash-checkpoint';file_put_contents($path,json_encode(array('pid'=>getmypid(),'phase'=>$j['phase'],'cssSha256'=>$css,'signal'=>9)),LOCK_EX);chmod($path,0600);
   native_need(posix_kill(getmypid(),9),'Cannot SIGKILL owned fixture PHP');throw new RuntimeException('SIGKILL did not stop fixture PHP');
  },PHP_INT_MAX);
  eval($input['code']);throw new RuntimeException('Native crash hook was not reached');
 }
 if($mode==='--run'||$mode==='--run-no-user'){
  native_need(is_array($input)&&array_keys($input)===array('code')&&is_string($input['code']),'Fixture command shape differs');eval($input['code']);exit;
 }
 require $inbox.'/receiver.php';
 if($mode==='--select-package'){
  native_need(in_array($input['package']??null,array('runtime','observer','reservation'),true),'Unknown fixture package');$which=$input['package'];$from=$which==='runtime'?'/fixture/package':($which==='observer'?'/fixture/observer-package':'/fixture/reservation-package');
  foreach(array('manifest.json','receiver.php','theme.zip','previous-theme.zip','plugin.zip','previous-plugin.zip') as $name)native_need(copy($from.'/'.$name,$inbox.'/'.$name),'Fixture package switch failed');
  $meta=json_decode(file_get_contents('/fixture/meta.json'),true);file_put_contents($base.'/git/vneconomics-store-production.git/refs/heads/release-production',($which==='runtime'?$meta['approval']['payloadSha']:($which==='observer'?$meta['observerPayload']:$meta['reservationPayload'])).PHP_EOL);echo json_encode(array('selected'=>$which));exit;
 }
 if($mode==='--private-snapshot'){
  $out=array();$paths=array($control);foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($control,FilesystemIterator::SKIP_DOTS),RecursiveIteratorIterator::SELF_FIRST) as $f)$paths[]=$f->getPathname();
  foreach($paths as $path){$s=lstat($path);$out[$path]=array_intersect_key($s,array_flip(array('dev','ino','mode','nlink','uid','gid','size','mtime','ctime')));if(is_file($path))$out[$path]['sha256']=hash_file('sha256',$path);}ksort($out);echo json_encode($out);exit;
 }
 if($mode==='--observer-fixture'){
  $request=vne_adapter_validate_key_handshake_request($input['request'],time());$dir=$control.'/candidates/'.$request['operationId'];$path=$dir.'/health-key.json';$action=$input['action']??'';
  if($action==='stage'){
   vne_adapter_validate_candidate_key_record($input['record'],$request['candidateFingerprint'],$request['target']);
   foreach(array($control.'/candidates',$dir) as $d)if(!is_dir($d))native_need(mkdir($d,0700),'Fixture candidate directory failed');
   $mask=umask(0077);try{$h=fopen($path,'x');}finally{umask($mask);}native_need(is_resource($h),'Fixture candidate exists');try{fwrite($h,json_encode($input['record'],JSON_THROW_ON_ERROR));}finally{fclose($h);}
  }elseif($action==='broad-mode'||$action==='private-mode')native_need(chmod($path,$action==='broad-mode'?0644:0600),'Fixture candidate chmod failed');
  elseif($action==='active-away')native_need(!file_exists($base.'/.native-kept-active-key')&&rename($control.'/health-key.json',$base.'/.native-kept-active-key'),'Fixture active stash failed');
  elseif($action==='active-back')native_need(!file_exists($control.'/health-key.json')&&rename($base.'/.native-kept-active-key',$control.'/health-key.json'),'Fixture active restore failed');
  elseif($action==='activation-marker'){native_need(is_dir($dir),'Fixture candidate directory missing');file_put_contents($dir.'/activation.json','{"fixture":true}');chmod($dir.'/activation.json',0600);}
  elseif($action==='remove-activation-marker')native_need(unlink($dir.'/activation.json'),'Fixture marker cleanup failed');
  else throw new RuntimeException('Unknown observer fixture action');
  echo json_encode(array('prepared'=>true));exit;
 }
 if($mode==='--key-crash-state'){echo json_encode(array('checkpoint'=>json_decode(file_get_contents($base.'/.native-key-crash'),true),'pid'=>getmypid()));exit;}
 if($mode==='--reservation-record-fixture'){
  native_need(in_array($input['kind']??null,array('journal','lock'),true)&&preg_match('/^[a-f0-9]{32}$/D',$input['operationId']??''),'Fixture record identity differs');$kind=$input['kind'];$target=$kind==='journal'?$control.'/journal-'.$input['operationId'].'.json':$control.'/receiver.lock';$saved=$base.'/.native-record-'.$kind;$action=$input['action']??'';
  if($action==='null'||$action==='away'){native_need(!file_exists($saved)&&is_file($target)&&!is_link($target)&&rename($target,$saved),'Fixture record stash failed');if($action==='null'){file_put_contents($target,'null');chmod($target,0600);}}
  elseif($action==='restore'){native_need(is_file($saved)&&(!file_exists($target)||file_get_contents($target)==='null'),'Fixture record restore precondition differs');if(file_exists($target))native_need(unlink($target),'Fixture invalid record cleanup failed');native_need(rename($saved,$target),'Fixture record restore failed');}
  else throw new RuntimeException('Unknown fixture record action');echo json_encode(array('prepared'=>true));exit;
 }
 if($mode==='--baseline'){
  $data=vne_adapter_data();$key=json_decode(vne_adapter_production_runtime_file($control.'/health-key.json'),true);
  echo json_encode(array('data'=>$data,'baselineSha256'=>hash('sha256',wp_json_encode($data)),'keyFingerprintSha256'=>hash('sha256',hex2bin($key['key'])),'php'=>PHP_VERSION,'wordpress'=>$wp_version,'database'=>$wpdb->db_version(),'dbName'=>DB_NAME,'mysql'=>$wpdb instanceof wpdb&&$wpdb->is_mysql===true,'uid'=>posix_geteuid(),'gid'=>posix_getegid()));exit;
 }
 if($mode==='--proof'){
  $a=$input['approval'];vne_adapter_validate_css_runtime_request('finish',$a,null);$j=vne_adapter_json($control.'/journal-'.$a['owner'].'.json');$key=json_decode(vne_adapter_production_runtime_file($control.'/health-key.json'),true);
  $fields=array('protocol','owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','receiverSha256','baselineSha256','keyFingerprintSha256');$h=array_intersect_key($a,array_flip($fields));
  $h=array_merge($h,array('phase'=>$j['phase'],'challenge'=>$j['challenge'],'observedAt'=>time(),'url'=>vne_adapter_production_policy()['home'].'/','httpStatus'=>($input['fail']??false)?503:200,'cssStatus'=>200,'marker'=>VIBELAB_V2_RELEASE_MARKER,'cssSha256'=>hash_file('sha256',WP_CONTENT_DIR.'/themes/vibelab-v2/style.css')));
  $body=json_encode($h,JSON_THROW_ON_ERROR);echo json_encode(array('body'=>base64_encode($body),'signature'=>hash_hmac('sha256',$body,hex2bin($key['key']))));exit;
 }
 if($mode==='--restore-baseline'){
  $p=vne_adapter_verified_package($input['approval']);$receipt=vne_adapter_css_native_upgrade($p['paths']['inbox'].'/previous-theme.zip',str_repeat('a',32),function()use($p){vne_adapter_css_mixed_files($p);});vne_adapter_css_end_maintenance($receipt);echo json_encode(array('restored'=>true));exit;
 }
 if($mode==='--owner-edit'){update_option('vne_native_owner_edit','keep');echo json_encode(array('edited'=>true));exit;}
 if($mode==='--state'){
  $a=$input['approval'];vne_adapter_validate_css_runtime_request('finish',$a,null);$j=$control.'/journal-'.$a['owner'].'.json';$hash=function($p){return is_file($p)?hash_file('sha256',$p):null;};echo json_encode(array('phase'=>is_file($j)?vne_adapter_json($j)['phase']:null,'lockPresent'=>file_exists($control.'/receiver.lock'),'mutexPresent'=>file_exists($control.'/runtime-mutex.lock'),'maintenancePresent'=>file_exists(ABSPATH.'.maintenance'),'ownerEdit'=>get_option('vne_native_owner_edit'),'cssSha256'=>hash_file('sha256',WP_CONTENT_DIR.'/themes/vibelab-v2/style.css'),'marker'=>VIBELAB_V2_RELEASE_MARKER,'journalSha256'=>$hash($j),'lockSha256'=>$hash($control.'/receiver.lock'),'maintenanceSha256'=>$hash(ABSPATH.'.maintenance'),'pid'=>getmypid(),'crashCheckpoint'=>is_file($base.'/.native-crash-checkpoint')?json_decode(file_get_contents($base.'/.native-crash-checkpoint'),true):null));exit;
 }
 throw new RuntimeException('Unknown native fixture mode');
}catch(Throwable $e){echo json_encode(array('error'=>$e->getMessage()));}
