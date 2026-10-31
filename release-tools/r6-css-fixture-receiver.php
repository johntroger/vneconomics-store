<?php
// Local rehearsal library only. No HTTP endpoint, downloader, scheduler or DB restore.
if(!defined('ABSPATH')||!defined('VNE_R711_FIXTURE_TOKEN')||PHP_SAPI!=='cli'||ABSPATH!=='/wordpress/'||!is_file(ABSPATH.'.r711-owned-fixture')||file_get_contents(ABSPATH.'.r711-owned-fixture')!==VNE_R711_FIXTURE_TOKEN){throw new RuntimeException('Isolated fixture CLI bootstrap required');}
function vne_css_need($ok,$message){if(!$ok)throw new RuntimeException($message);}
function vne_css_json($path){return json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);}
function vne_css_plain($path){
    for($p=$path;$p!==dirname($p);$p=dirname($p)){vne_css_need(!is_link($p),'Symlink refused');}
}
function vne_css_scope($a){
    vne_css_need(PHP_SAPI==='cli'&&ABSPATH==='/wordpress/','Only isolated Playground CLI fixture allowed');
    vne_css_need(($a['environment']??'')==='local-fixture'&&($a['productionApproved']??null)===false,'Production execution not implemented');
    vne_css_need(is_string(VNE_R711_FIXTURE_TOKEN)&&preg_match('/^[a-f0-9]{64}$/D',VNE_R711_FIXTURE_TOKEN),'Invalid fixture token');
    vne_css_need(file_get_contents(ABSPATH.'.r711-owned-fixture')===VNE_R711_FIXTURE_TOKEN,'Fixture owner differs');
    foreach(array('sourceSha'=>40,'payloadSha'=>40,'manifestSha256'=>64,'owner'=>32,'receiverSha256'=>64) as $key=>$length){vne_css_need(is_string($a[$key]??null)&&preg_match('/^[a-f0-9]{'.$length.'}$/D',$a[$key]),'Invalid approval pin '.$key);}
    vne_css_need(hash_file('sha256',__FILE__)===$a['receiverSha256'],'Controller library pin differs');
    vne_css_need(current_user_can('update_themes'),'Theme update capability required');
    return '/r711-private/';
}
function vne_css_zip($path,$spec,$slug,$count){
    vne_css_plain($path);vne_css_need(is_file($path)&&filesize($path)===($spec['bytes']??null)&&hash_file('sha256',$path)===($spec['sha256']??''),'ZIP bytes differ');
    vne_css_need(count($spec['files']??array())===$count,'Wrong ZIP allowlist count');$expected=array();
    foreach($spec['files'] as $file){$p=$file['path']??'';vne_css_need(preg_match('~^'.preg_quote($slug,'~').'/[a-z0-9_/-]+\.(php|css)$~D',$p)&&!str_contains($p,'..')&&!isset($expected[$p]),'Unsafe/duplicate ZIP path');$expected[$p]=$file;}
    $zip=new ZipArchive();vne_css_need($zip->open($path)===true,'Cannot open ZIP');$out=array();
    try{
        vne_css_need($zip->numFiles===$count,'Wrong ZIP member count');
        for($i=0;$i<$zip->numFiles;$i++){
            $s=$zip->statIndex($i);$name=$s['name'];vne_css_need(isset($expected[$name])&&!isset($out[$name])&&$s['size']<=1048576&&$s['comp_method']===0,'Unreviewed ZIP member');
            $zip->getExternalAttributesIndex($i,$system,$attributes);vne_css_need($system!==3||!in_array(($attributes>>16)&0170000,array(0120000,0040000),true),'ZIP link/directory refused');
            $bytes=$zip->getFromIndex($i);vne_css_need(is_string($bytes)&&strlen($bytes)===$expected[$name]['bytes']&&hash('sha256',$bytes)===$expected[$name]['sha256'],'ZIP member differs');$out[$name]=$bytes;
        }
    }finally{$zip->close();}
    ksort($out);return $out;
}
function vne_css_package($inbox,$a){
    $private=vne_css_scope($a);vne_css_plain($inbox);$directory=realpath($inbox);
    vne_css_need(is_string($directory)&&str_starts_with($directory,$private.'inbox-'),'Inbox must be outside document root');
    $expected=array('manifest.json','plugin.zip','previous-plugin.zip','previous-theme.zip','theme.zip');$actual=array();
    foreach(new DirectoryIterator($directory) as $file){if($file->isDot())continue;vne_css_need($file->isFile()&&!$file->isLink(),'Non-regular inbox file');$actual[]=$file->getFilename();}sort($actual);vne_css_need($actual===$expected,'Inbox allowlist differs');
    vne_css_need(hash_file('sha256',$directory.'/manifest.json')===$a['manifestSha256'],'Manifest pin differs');$m=vne_css_json($directory.'/manifest.json');
    vne_css_need(($m['format']??null)===1&&($m['profile']??'')==='vibelab-v2-r6-css-schema3'&&($m['scope']??'')==='theme-css-only'&&($m['sourceSha']??'')===$a['sourceSha'],'Wrong CSS profile/source');
    vne_css_need(($m['productionBaselinePayload']??'')==='fa4c67821008e0fcc4307fedf202bcdf95b85bb6'&&($m['expectedProductionParent']??'')===$m['productionBaselinePayload']&&($m['productionBaselineManifestSha256']??'')==='1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2','Wrong R6 baseline');
    vne_css_need(($m['schema']??null)===3&&($m['themeVersion']??'')==='2.0.1'&&($m['pluginVersion']??'')==='0.4.4'&&($m['pluginUnchanged']??null)===true,'Unreviewed component versions');
    vne_css_need(($m['approval']['deployAuthorized']??null)===false&&($m['installPolicy']['themeOnly']??null)===true&&($m['installPolicy']['reinstallPlugin']??null)===false&&($m['installPolicy']['switchTheme']??null)===false&&($m['installPolicy']['restoreDatabase']??null)===false,'Unreviewed install policy');
    $listed=array();foreach($m['files']??array() as $file){$name=$file['path']??'';vne_css_need(in_array($name,array_slice($expected,1),true)&&!isset($listed[$name]),'Manifest file list differs');$listed[$name]=true;vne_css_need(filesize($directory.'/'.$name)===$file['bytes']&&hash_file('sha256',$directory.'/'.$name)===$file['sha256'],'Package hash differs');}vne_css_need(count($listed)===4,'Missing package');
    $maps=array();foreach(array('theme'=>array('vibelab-v2',24),'previous-theme'=>array('vibelab-v2',24),'plugin'=>array('vne-library-core',11),'previous-plugin'=>array('vne-library-core',11)) as $key=>$spec){vne_css_need(($m['components'][$key]['archive']??'')===$key.'.zip','Archive path differs');$maps[$key]=vne_css_zip($directory.'/'.$key.'.zip',$m['components'][$key],$spec[0],$spec[1]);}
    vne_css_need(hash_file('sha256',$directory.'/previous-theme.zip')==='c79b067167dca3629bb2bd61a6480dd5f4c1fef14dc919c32fa5da8fd0796acc','Previous theme is not R6');
    foreach(array('plugin.zip','previous-plugin.zip') as $name)vne_css_need(hash_file('sha256',$directory.'/'.$name)==='2becd448fc8dcefd0da18e5fdda5ce07a2766a6dd1d63b394ccaff6aa9e6d7cf','Plugin is not exact R6');
    vne_css_need(array_keys($maps['theme'])===array_keys($maps['previous-theme']),'Theme member set differs');
    $marker='r6-css-'.substr($a['sourceSha'],0,12);vne_css_need(($m['themeMarker']??'')===$marker,'Marker differs');
    foreach($maps['theme'] as $path=>$bytes){
        $old=$maps['previous-theme'][$path];if($path==='vibelab-v2/style.css'){
            vne_css_need(strlen($bytes)<=262144&&preg_match('//u',$bytes)===1&&!str_contains($bytes,chr(92))&&!str_contains($bytes,'<')&&!preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f]/',$bytes),'Unreviewed CSS bytes');
            vne_css_need(!preg_match('/@import\b|url\s*\(|expression\s*\(/i',preg_replace('~/\*.*?\*/~s','',$bytes)),'Unreviewed CSS transport');
            vne_css_need(preg_match_all('/^Version: 2\.0\.1\r?$/m',$bytes)===1&&preg_replace('/^Version: 2\.0\.1(?=\r?$)/m','Version: 2.0.0',$bytes)!==$old,'Missing CSS change/version');continue;
        }
        if($path==='vibelab-v2/functions.php'){
            foreach(array("define('VIBELAB_V2_VERSION', '2.0.0');"=>"define('VIBELAB_V2_VERSION', '2.0.1');","define('VIBELAB_V2_RELEASE_MARKER', 'r52-v2-20261028');"=>"define('VIBELAB_V2_RELEASE_MARKER', '".$marker."');") as $from=>$to){vne_css_need(substr_count($old,$from)===1,'Identity template differs');$old=str_replace($from,$to,$old);}
        }vne_css_need($bytes===$old,'PHP/template changed beyond identity stamps');
    }
    return array('directory'=>$directory,'manifest'=>$m,'maps'=>$maps);
}
function vne_css_runtime_files($directory,$map){
    vne_css_plain($directory);$expected=array();foreach($map as $name=>$bytes){$path=$directory.'/'.substr($name,strpos($name,'/')+1);vne_css_plain($path);vne_css_need(is_file($path)&&hash_file('sha256',$path)===hash('sha256',$bytes),'Runtime file conflict: '.$name);$expected[$path]=true;}
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory,FilesystemIterator::SKIP_DOTS)) as $file)vne_css_need(!$file->isLink()&&(!$file->isFile()||isset($expected[$file->getPathname()])),'Unexpected runtime file');
}
function vne_css_state(){
    global $wpdb;$state=array();foreach(array('posts','postmeta','terms','term_taxonomy','term_relationships') as $key){$rows=$wpdb->get_results('SELECT * FROM '.$wpdb->$key,ARRAY_A);usort($rows,fn($a,$b)=>strcmp(wp_json_encode($a),wp_json_encode($b)));$state[$key]=hash('sha256',wp_json_encode($rows));}
    $options=array();foreach(array('home','siteurl','blog_public','active_plugins','stylesheet','template','vne_library_schema_version') as $key)$options[$key]=get_option($key);
    $options['vne_options']=$wpdb->get_results("SELECT option_name,option_value FROM {$wpdb->options} WHERE SUBSTR(option_name,1,4)='vne_' ORDER BY option_name",ARRAY_A);$state['protected_options']=hash('sha256',wp_json_encode($options));return $state;
}
function vne_css_paths($a){$root=vne_css_scope($a);return array($root.'journal-'.$a['owner'].'.json',$root.'receiver.lock');}
function vne_css_write_journal($path,$journal){
    vne_css_plain($path);$temp=$path.'.tmp-'.bin2hex(random_bytes(8));$bytes=json_encode($journal,JSON_THROW_ON_ERROR);
    try{vne_css_need(file_put_contents($temp,$bytes,LOCK_EX)===strlen($bytes),'Journal write failed');vne_css_need(rename($temp,$path),'Journal rename failed');}
    finally{if(is_file($temp))unlink($temp);}
}
function vne_css_owned($a,$phase){
    [$journalPath,$lock]=vne_css_paths($a);vne_css_plain($journalPath);vne_css_plain($lock);vne_css_need(is_file($journalPath)&&is_file($lock),'Journal/lock missing');$j=vne_css_json($journalPath);$l=vne_css_json($lock);
    foreach(array('owner','sourceSha','payloadSha','manifestSha256') as $key)vne_css_need(($j[$key]??null)===$a[$key]&&($l[$key]??null)===$a[$key],'Journal/lock ownership conflict');vne_css_need(($j['baseline']??null)===($l['baseline']??null),'Journal baseline differs from owner lock');vne_css_need(($j['phase']??'')===$phase,'Unexpected journal phase');return array($journalPath,$lock,$j);
}
function vne_css_upgrade($zip){
    require_once ABSPATH.'wp-admin/includes/class-wp-upgrader.php';require_once ABSPATH.'wp-admin/includes/file.php';WP_Filesystem();
    $u=new WP_Upgrader(new Automatic_Upgrader_Skin());$wasInstalling=wp_installing();wp_installing(true);$u->maintenance_mode(true);
    try{$result=$u->run(array('package'=>$zip,'destination'=>WP_CONTENT_DIR.'/themes/vibelab-v2/','clear_destination'=>true,'abort_if_destination_exists'=>false,'clear_working'=>true,'hook_extra'=>array('type'=>'theme','action'=>'update','theme'=>'vibelab-v2')));vne_css_need(!is_wp_error($result)&&$result,'Native theme update failed');}
    finally{wp_installing($wasInstalling);}
}
function vne_css_end_maintenance(){$u=new WP_Upgrader(new Automatic_Upgrader_Skin());$u->maintenance_mode(false);}
function vne_css_install_fixture($inbox,$a){
    $p=vne_css_package($inbox,$a);vne_css_need(get_stylesheet()==='vibelab-v2'&&defined('VNE_LIBRARY_VERSION')&&VNE_LIBRARY_VERSION==='0.4.4'&&(int)get_option('vne_library_schema_version')===3,'Wrong runtime pair');
    vne_css_runtime_files(WP_CONTENT_DIR.'/themes/vibelab-v2',$p['maps']['previous-theme']);vne_css_runtime_files(WP_PLUGIN_DIR.'/vne-library-core',$p['maps']['plugin']);
    vne_css_need(!file_exists(ABSPATH.'.maintenance')&&!is_link(ABSPATH.'.maintenance'),'Existing maintenance; inspect');
    [$journal,$lock]=vne_css_paths($a);vne_css_need(!file_exists($journal)&&!is_link($journal)&&!file_exists($lock)&&!is_link($lock),'Existing journal/lock; inspect instead of retry');
    $j=array_intersect_key($a,array_flip(array('owner','sourceSha','payloadSha','manifestSha256')));$j['baseline']=vne_css_state();$j['phase']='INSTALLING';$handle=fopen($lock,'x');vne_css_need($handle!==false,'Exclusive lock failed');fwrite($handle,json_encode($j,JSON_THROW_ON_ERROR));fclose($handle);vne_css_write_journal($journal,$j);
    try{vne_css_upgrade($p['directory'].'/theme.zip');vne_css_runtime_files(WP_CONTENT_DIR.'/themes/vibelab-v2',$p['maps']['theme']);vne_css_need(vne_css_state()===$j['baseline'],'Application data/options conflict');vne_css_end_maintenance();$j['phase']='AWAIT_HEALTH';vne_css_write_journal($journal,$j);return $j;}
    catch(Throwable $e){$j['phase']='STOPPED_INSPECT';vne_css_write_journal($journal,$j);throw $e;}
}
function vne_css_health_ok($health,$p,$previous){
    $m=$p['manifest'];return ($health['httpStatus']??0)===200&&($health['marker']??'')===($previous?'r52-v2-20261028':$m['themeMarker'])&&($health['cssSha256']??'')===hash('sha256',$p['maps'][$previous?'previous-theme':'theme']['vibelab-v2/style.css']);
}
function vne_css_finish_fixture($inbox,$a,$health){
    $p=vne_css_package($inbox,$a);[$path,$lock,$j]=vne_css_owned($a,'AWAIT_HEALTH');
    try{vne_css_runtime_files(WP_CONTENT_DIR.'/themes/vibelab-v2',$p['maps']['theme']);vne_css_runtime_files(WP_PLUGIN_DIR.'/vne-library-core',$p['maps']['plugin']);vne_css_need(vne_css_state()===$j['baseline'],'Application data/options conflict');}
    catch(Throwable $e){$j['phase']='CONFLICT_INSPECT';vne_css_write_journal($path,$j);throw $e;}
    if(!vne_css_health_ok($health,$p,false)){
        $j['phase']='ROLLING_BACK';vne_css_write_journal($path,$j);
        try{vne_css_upgrade($p['directory'].'/previous-theme.zip');vne_css_runtime_files(WP_CONTENT_DIR.'/themes/vibelab-v2',$p['maps']['previous-theme']);vne_css_need(vne_css_state()===$j['baseline'],'Rollback data conflict');vne_css_end_maintenance();$j['phase']='ROLLBACK_AWAIT_HEALTH';vne_css_write_journal($path,$j);return $j;}
        catch(Throwable $e){$j['phase']='STOPPED_INSPECT';vne_css_write_journal($path,$j);throw $e;}
    }
    $j['phase']='COMPLETE';vne_css_write_journal($path,$j);vne_css_owned($a,'COMPLETE');vne_css_need(unlink($lock),'Own lock cleanup failed');return $j;
}
function vne_css_confirm_rollback_fixture($inbox,$a,$health){
    $p=vne_css_package($inbox,$a);[$path,$lock,$j]=vne_css_owned($a,'ROLLBACK_AWAIT_HEALTH');vne_css_runtime_files(WP_CONTENT_DIR.'/themes/vibelab-v2',$p['maps']['previous-theme']);vne_css_runtime_files(WP_PLUGIN_DIR.'/vne-library-core',$p['maps']['plugin']);vne_css_need(vne_css_state()===$j['baseline']&&vne_css_health_ok($health,$p,true),'Rollback health/data not confirmed');$j['phase']='ROLLED_BACK';vne_css_write_journal($path,$j);vne_css_owned($a,'ROLLED_BACK');vne_css_need(unlink($lock),'Own rollback lock cleanup failed');return $j;
}
