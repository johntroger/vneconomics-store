<?php
// Caller must pin this file BEFORE including it. Runtime writes are local-fixture-only.
if(PHP_SAPI!=='cli')throw new RuntimeException('CLI required');
function vne_adapter_need($ok,$message){if(!$ok)throw new RuntimeException($message);}
function vne_adapter_path($path){
    vne_adapter_need(is_string($path)&&str_starts_with($path,'/')&&!str_contains($path,chr(0))&&!preg_match('~(^|/)\.\.?(/|$)~',$path),'Unsafe path');
    for($part=$path;$part!==dirname($part);$part=dirname($part))vne_adapter_need(!is_link($part),'Symlink refused');
    $real=realpath($path);vne_adapter_need($real===$path,'Canonical path required');return $real;
}
function vne_adapter_paths($environment){
    if($environment==='local-runtime'){
        vne_adapter_need(defined('ABSPATH')&&ABSPATH==='/wordpress/'&&defined('VNE_ADAPTER_RUNTIME_TOKEN')&&preg_match('/^[a-f0-9]{64}$/D',VNE_ADAPTER_RUNTIME_TOKEN),'Runtime fixture required');
        vne_adapter_need(is_file('/wordpress/.adapter-owned')&&file_get_contents('/wordpress/.adapter-owned')===VNE_ADAPTER_RUNTIME_TOKEN,'Runtime fixture owner differs');
        return array('root'=>'/wordpress','inbox'=>'/adapter-fixture/inbox','clone'=>'/adapter-fixture/clone.git');
    }
    if($environment==='local-fixture'){
        vne_adapter_need(defined('VNE_ADAPTER_FIXTURE_TOKEN')&&preg_match('/^[a-f0-9]{64}$/D',VNE_ADAPTER_FIXTURE_TOKEN),'Fixture token required');
        vne_adapter_need(is_file('/adapter-fixture/owned')&&file_get_contents('/adapter-fixture/owned')===VNE_ADAPTER_FIXTURE_TOKEN,'Fixture owner differs');
        return array('root'=>'/adapter-fixture/site','inbox'=>'/adapter-fixture/inbox','clone'=>'/adapter-fixture/clone.git');
    }
    vne_adapter_need($environment==='production','Unknown environment');
    $base='/var/www/vhosts/vneconomics.com/';
    return array('root'=>$base.'store.vneconomics.com','inbox'=>$base.'deploy-inbox/production','clone'=>$base.'git/vneconomics-store-production.git');
}
function vne_adapter_ref($clone){
    vne_adapter_path($clone.'/HEAD');$head=trim(file_get_contents($clone.'/HEAD'));
    vne_adapter_need($head==='ref: refs/heads/release-production','Wrong Git HEAD/ref');
    $loose=$clone.'/refs/heads/release-production';
    if(file_exists($loose)||is_link($loose)){vne_adapter_path($loose);$sha=trim(file_get_contents($loose));}
    else{
        $packed=$clone.'/packed-refs';vne_adapter_path($packed);$sha=null;
        foreach(preg_split('/\r?\n/',file_get_contents($packed)) as $line){
            if($line===''||$line[0]==='#'||$line[0]==='^')continue;
            vne_adapter_need(preg_match('/^([a-f0-9]{40}) (refs\/[a-zA-Z0-9._\/-]+)$/D',$line,$match),'Malformed packed ref');
            if($match[2]==='refs/heads/release-production'){vne_adapter_need($sha===null,'Duplicate packed ref');$sha=$match[1];}
        }
    }
    vne_adapter_need(is_string($sha)&&preg_match('/^[a-f0-9]{40}$/D',$sha),'Invalid Git ref SHA');return $sha;
}
function vne_adapter_inspect($a){
    foreach(array('sourceSha'=>40,'controllerSourceSha'=>40,'payloadSha'=>40,'expectedParent'=>40,'manifestSha256'=>64,'receiverSha256'=>64) as $key=>$length)
        vne_adapter_need(is_string($a[$key]??null)&&preg_match('/^[a-f0-9]{'.$length.'}$/D',$a[$key]),'Invalid pin '.$key);
    vne_adapter_need(hash_file('sha256',__FILE__)===$a['receiverSha256'],'Controller external pin differs');
    $paths=vne_adapter_paths($a['environment']??'');foreach($paths as $path)vne_adapter_path($path);
    vne_adapter_need($paths['inbox']!==$paths['root']&&!str_starts_with($paths['inbox'],$paths['root'].'/'),'Public inbox refused');
    $expected=array('manifest.json','plugin.zip','previous-plugin.zip','previous-theme.zip','receiver.php','theme.zip');$actual=array();
    foreach(new DirectoryIterator($paths['inbox']) as $file){if($file->isDot())continue;vne_adapter_need($file->isFile()&&!$file->isLink(),'Non-regular inbox entry');$actual[]=$file->getFilename();}
    sort($actual);vne_adapter_need($actual===$expected,'Six-file allowlist differs');
    $manifestPath=$paths['inbox'].'/manifest.json';vne_adapter_path($manifestPath);
    vne_adapter_need(filesize($manifestPath)<=262144&&hash_file('sha256',$manifestPath)===$a['manifestSha256'],'Manifest external pin differs');
    $m=json_decode(file_get_contents($manifestPath),true,512,JSON_THROW_ON_ERROR);
    vne_adapter_need(($m['format']??null)===1&&($m['profile']??'')==='vibelab-v2-r6-css-adapter-schema3'&&($m['sourceSha']??'')===$a['sourceSha'],'Profile/source differs');
    vne_adapter_need(($m['controller']['sourceSha']??'')===$a['controllerSourceSha']&&($m['controller']['path']??'')==='receiver.php'&&($m['controller']['sha256']??'')===$a['receiverSha256'],'Controller identity differs');
    $baseline='fa4c67821008e0fcc4307fedf202bcdf95b85bb6';
    vne_adapter_need($a['expectedParent']===$baseline&&($m['expectedProductionParent']??'')===$baseline&&($m['productionBaselinePayload']??'')===$baseline&&($m['productionBaselineManifestSha256']??'')==='1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2','R6 parent/baseline differs');
    vne_adapter_need(($m['schema']??null)===3&&($m['pluginVersion']??'')==='0.4.4'&&($m['themeVersion']??'')==='2.0.1'&&($m['pluginUnchanged']??null)===true,'Versions differ');
    vne_adapter_need(($m['approval']['deployAuthorized']??null)===false&&($m['controller']['capabilities']??null)===array('inspect-inbox'),'Inspect-only policy differs');
    $listed=array();vne_adapter_need(count($m['files']??array())===5,'Manifest entry count differs');
    foreach($m['files'] as $file){
        $name=$file['path']??'';vne_adapter_need(in_array($name,array_slice($expected,1),true)&&!isset($listed[$name]),'Unsafe/duplicate manifest path');$listed[$name]=true;
        vne_adapter_need(is_int($file['bytes']??null)&&$file['bytes']>=0&&preg_match('/^[a-f0-9]{64}$/D',$file['sha256']??''),'Invalid file descriptor');
        $path=$paths['inbox'].'/'.$name;vne_adapter_path($path);
        vne_adapter_need(filesize($path)===$file['bytes']&&hash_file('sha256',$path)===$file['sha256'],'Inbox hash differs: '.$name);
    }
    vne_adapter_need(hash_file('sha256',$paths['inbox'].'/receiver.php')===$a['receiverSha256'],'Inbox controller differs from external pin');
    vne_adapter_need(hash_file('sha256',$paths['inbox'].'/previous-theme.zip')==='c79b067167dca3629bb2bd61a6480dd5f4c1fef14dc919c32fa5da8fd0796acc','Previous theme is not R6');
    foreach(array('plugin.zip','previous-plugin.zip') as $name)vne_adapter_need(hash_file('sha256',$paths['inbox'].'/'.$name)==='2becd448fc8dcefd0da18e5fdda5ce07a2766a6dd1d63b394ccaff6aa9e6d7cf','Plugin is not R6');
    vne_adapter_need(vne_adapter_ref($paths['clone'])===$a['payloadSha'],'Git ref differs');
    return array('status'=>'VERIFIED_INBOX_BYTES_AND_REF','profile'=>$m['profile'],'sourceSha'=>$a['sourceSha'],'controllerSourceSha'=>$a['controllerSourceSha'],'payloadSha'=>$a['payloadSha'],'manifestSha256'=>$a['manifestSha256'],'files'=>6,'gitObjectParentVerified'=>false,'archiveEntriesVerified'=>false,'runtimeVerified'=>false,'installAuthorized'=>false);
}
function vne_adapter_dispatch($mode,$approval){
    vne_adapter_need($mode==='inspect-inbox','Write/runtime modes not implemented; install blocked');
    return vne_adapter_inspect($approval);
}

// Runtime integration is deliberately restricted to an owned LOCAL WordPress fixture.
function vne_adapter_runtime_scope($a){
    vne_adapter_need(($a['environment']??'')==='local-runtime'&&($a['productionApproved']??null)===false,'Production runtime is disabled');
    $paths=vne_adapter_paths('local-runtime');
    vne_adapter_need(current_user_can('update_themes'),'Theme update capability required');
    foreach(array('owner'=>32,'baselineSha256'=>64) as $key=>$length)vne_adapter_need(is_string($a[$key]??null)&&preg_match('/^[a-f0-9]{'.$length.'}$/D',$a[$key]),'Invalid runtime pin '.$key);
    vne_adapter_need(home_url()==='http://127.0.0.1:19482'&&get_option('siteurl')===home_url()&&(string)get_option('blog_public')==='1','Runtime URL/indexing differs');
    vne_adapter_need(defined('DB_FILE')&&DB_FILE==='.ht.sqlite'&&defined('DB_DIR')&&DB_DIR==='/wordpress/wp-content/database/','Unexpected fixture database');
    vne_adapter_need(get_stylesheet()==='vibelab-v2'&&defined('VNE_LIBRARY_VERSION')&&VNE_LIBRARY_VERSION==='0.4.4'&&(int)get_option('vne_library_schema_version')===3,'Runtime component pair differs');
    return $paths;
}
function vne_adapter_data(){
    global $wpdb;$state=array();
    foreach(array('posts','postmeta','terms','term_taxonomy','term_relationships') as $key){
        $rows=$wpdb->get_results('SELECT * FROM '.$wpdb->$key,ARRAY_A);vne_adapter_need(is_array($rows)&&!$wpdb->last_error,'Database read failed');
        usort($rows,fn($a,$b)=>strcmp(wp_json_encode($a),wp_json_encode($b)));$state[$key]=hash('sha256',wp_json_encode($rows));
    }
    $options=array();foreach(array('home','siteurl','blog_public','active_plugins','stylesheet','template','vne_library_schema_version') as $key)$options[$key]=get_option($key);
    $options['vne_options']=$wpdb->get_results("SELECT option_name,option_value FROM {$wpdb->options} WHERE SUBSTR(option_name,1,4)='vne_' ORDER BY option_name",ARRAY_A);
    vne_adapter_need(is_array($options['vne_options'])&&!$wpdb->last_error,'Options read failed');$state['protected_options']=hash('sha256',wp_json_encode($options));return $state;
}
function vne_adapter_files($directory,$map){
    vne_adapter_path($directory);$expected=array();
    foreach($map as $name=>$bytes){$path=$directory.'/'.substr($name,strpos($name,'/')+1);vne_adapter_path($path);vne_adapter_need(is_file($path)&&hash_file('sha256',$path)===hash('sha256',$bytes),'Runtime file conflict: '.$name);$expected[$path]=true;}
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory,FilesystemIterator::SKIP_DOTS)) as $file)vne_adapter_need(!$file->isLink()&&(!$file->isFile()||isset($expected[$file->getPathname()])),'Unexpected runtime file');
}
function vne_adapter_zip($path,$spec,$slug,$count){
    vne_adapter_path($path);vne_adapter_need(filesize($path)===($spec['bytes']??null)&&hash_file('sha256',$path)===($spec['sha256']??''),'Archive spec differs');
    $expected=array();foreach($spec['files']??array() as $f){$name=$f['path']??'';vne_adapter_need(preg_match('~^'.preg_quote($slug,'~').'/[a-z0-9_/-]+\.(php|css)$~D',$name)&&!str_contains($name,'..')&&!isset($expected[$name]),'Unsafe archive path');$expected[$name]=$f;}
    vne_adapter_need(count($expected)===$count,'Archive allowlist differs');$z=new ZipArchive();vne_adapter_need($z->open($path)===true,'Cannot open archive');$out=array();
    try{
        vne_adapter_need($z->numFiles===$count,'Archive count differs');
        for($i=0;$i<$count;$i++){$s=$z->statIndex($i);$name=$s['name'];vne_adapter_need(isset($expected[$name])&&!isset($out[$name])&&$s['size']<=1048576&&$s['comp_method']===0,'Unreviewed archive entry');
            $z->getExternalAttributesIndex($i,$system,$attr);vne_adapter_need($system!==3||!in_array(($attr>>16)&0170000,array(0120000,0040000),true),'Archive symlink/directory refused');
            $bytes=$z->getFromIndex($i);vne_adapter_need(is_string($bytes)&&strlen($bytes)===$expected[$name]['bytes']&&hash('sha256',$bytes)===$expected[$name]['sha256'],'Archive entry hash differs');$out[$name]=$bytes;
        }
    }finally{$z->close();}ksort($out);return $out;
}
function vne_adapter_runtime_package($a){
    vne_adapter_inspect($a);$paths=vne_adapter_runtime_scope($a);$m=json_decode(file_get_contents($paths['inbox'].'/manifest.json'),true,512,JSON_THROW_ON_ERROR);
    vne_adapter_need(($m['installPolicy']['themeOnly']??null)===true&&($m['installPolicy']['reinstallPlugin']??null)===false&&($m['installPolicy']['switchTheme']??null)===false&&($m['installPolicy']['restoreDatabase']??null)===false,'Unreviewed install policy');
    $maps=array();foreach(array('theme'=>array('vibelab-v2',24),'previous-theme'=>array('vibelab-v2',24),'plugin'=>array('vne-library-core',11),'previous-plugin'=>array('vne-library-core',11)) as $key=>$spec){
        vne_adapter_need(($m['components'][$key]['archive']??'')===$key.'.zip','Archive name differs');$maps[$key]=vne_adapter_zip($paths['inbox'].'/'.$key.'.zip',$m['components'][$key],$spec[0],$spec[1]);
    }
    vne_adapter_need(array_keys($maps['theme'])===array_keys($maps['previous-theme']),'Theme entries differ');
    $marker='r6-css-'.substr($a['sourceSha'],0,12);vne_adapter_need(($m['themeMarker']??'')===$marker,'Marker differs');
    foreach($maps['theme'] as $name=>$bytes){
        $old=$maps['previous-theme'][$name];
        if($name==='vibelab-v2/style.css'){
            vne_adapter_need(strlen($bytes)<=262144&&preg_match('//u',$bytes)===1&&!preg_match('/[\\\\<\x00-\x08\x0b\x0c\x0e-\x1f]/',$bytes),'Unsafe CSS bytes');
            vne_adapter_need(!preg_match('/@import\b|url\s*\(|expression\s*\(/i',preg_replace('~/\*.*?\*/~s','',$bytes)),'Unsafe CSS transport');
            vne_adapter_need(preg_match_all('/^Version: 2\.0\.1\r?$/m',$bytes)===1&&preg_replace('/^Version: 2\.0\.1(?=\r?$)/m','Version: 2.0.0',$bytes)!==$old,'Missing CSS change');continue;
        }
        if($name==='vibelab-v2/functions.php')foreach(array("define('VIBELAB_V2_VERSION', '2.0.0');"=>"define('VIBELAB_V2_VERSION', '2.0.1');","define('VIBELAB_V2_RELEASE_MARKER', 'r52-v2-20261028');"=>"define('VIBELAB_V2_RELEASE_MARKER', '".$marker."');") as $from=>$to){vne_adapter_need(substr_count($old,$from)===1,'Identity template differs');$old=str_replace($from,$to,$old);}
        vne_adapter_need($bytes===$old,'PHP/template changed beyond identity');
    }
    return array('paths'=>$paths,'manifest'=>$m,'maps'=>$maps);
}
function vne_adapter_runtime_state($p,$previous){
    vne_adapter_files(WP_CONTENT_DIR.'/themes/vibelab-v2',$p['maps'][$previous?'previous-theme':'theme']);
    vne_adapter_files(WP_PLUGIN_DIR.'/vne-library-core',$p['maps']['plugin']);return vne_adapter_data();
}
function vne_adapter_json($path){vne_adapter_path($path);return json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);}
function vne_adapter_journal_paths($a){return array('/adapter-fixture/control/journal-'.$a['owner'].'.json','/adapter-fixture/control/receiver.lock');}
function vne_adapter_write_scope(){
    vne_adapter_need(defined('ABSPATH')&&ABSPATH==='/wordpress/'&&defined('VNE_ADAPTER_RUNTIME_TOKEN')&&is_file('/wordpress/.adapter-owned')&&file_get_contents('/wordpress/.adapter-owned')===VNE_ADAPTER_RUNTIME_TOKEN,'Runtime fixture write guard');
    vne_adapter_path('/adapter-fixture/control');
}
function vne_adapter_write_journal($path,$j){
    vne_adapter_write_scope();vne_adapter_need(preg_match('~^/adapter-fixture/control/journal-[a-f0-9]{32}\.json$~D',$path)&&!is_link($path),'Journal path/symlink refused');$temp=$path.'.tmp-'.bin2hex(random_bytes(8));
    try{$bytes=json_encode($j,JSON_THROW_ON_ERROR);vne_adapter_need(file_put_contents($temp,$bytes,LOCK_EX)===strlen($bytes),'Journal write failed');vne_adapter_need(rename($temp,$path),'Journal rename failed');}finally{if(is_file($temp))unlink($temp);}
}
function vne_adapter_owned($a,$phase){
    [$path,$lock]=vne_adapter_journal_paths($a);$j=vne_adapter_json($path);$l=vne_adapter_json($lock);
    foreach(array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','baselineSha256','receiverSha256') as $key)vne_adapter_need(($j[$key]??null)===$a[$key]&&($l[$key]??null)===$a[$key],'Journal/lock ownership differs');
    vne_adapter_need(($j['baseline']??null)===($l['baseline']??null)&&hash('sha256',wp_json_encode($j['baseline']??null))===$a['baselineSha256'],'Journal baseline differs');
    vne_adapter_need(($j['phase']??null)===$phase,'Unexpected journal phase');return array($path,$lock,$j);
}
function vne_adapter_upgrade_local($zip){
    vne_adapter_write_scope();
    require_once ABSPATH.'wp-admin/includes/class-wp-upgrader.php';require_once ABSPATH.'wp-admin/includes/file.php';WP_Filesystem();
    $u=new WP_Upgrader(new Automatic_Upgrader_Skin());$previous=wp_installing();wp_installing(true);$u->maintenance_mode(true);
    try{$r=$u->run(array('package'=>$zip,'destination'=>WP_CONTENT_DIR.'/themes/vibelab-v2/','clear_destination'=>true,'abort_if_destination_exists'=>false,'clear_working'=>true,'hook_extra'=>array('type'=>'theme','action'=>'update','theme'=>'vibelab-v2')));vne_adapter_need(!is_wp_error($r)&&$r,'Native update failed');}
    finally{wp_installing($previous);}
}
function vne_adapter_maintenance_off(){vne_adapter_write_scope();(new WP_Upgrader(new Automatic_Upgrader_Skin()))->maintenance_mode(false);}
function vne_adapter_challenge(&$j,$phase){$j['phase']=$phase;$j['challenge']=bin2hex(random_bytes(32));$j['issuedAt']=time();$j['expiresAt']=$j['issuedAt']+120;}
function vne_adapter_health($a,$j,$p,$previous){
    // The private key/proof are local harness resources, never in the Git payload.
    $key=vne_adapter_json('/adapter-fixture/control/health-key.json');$proof=vne_adapter_json('/adapter-fixture/control/proof-'.$a['owner'].'.json');
    vne_adapter_need(is_string($key['key']??null)&&preg_match('/^[a-f0-9]{64}$/D',$key['key']),'Health key invalid');
    $body=base64_decode($proof['body']??'',true);vne_adapter_need(is_string($body)&&strlen($body)<=8192&&hash_equals(hash_hmac('sha256',$body,hex2bin($key['key'])),$proof['signature']??''),'Health signature invalid');
    $h=json_decode($body,true,32,JSON_THROW_ON_ERROR);
    foreach(array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256') as $pin)vne_adapter_need(($h[$pin]??null)===$a[$pin],'Health identity differs');
    vne_adapter_need(($h['challenge']??null)===$j['challenge']&&($h['phase']??null)===$j['phase'],'Health challenge/phase differs');
    vne_adapter_need(is_int($h['observedAt']??null)&&$h['observedAt']>=$j['issuedAt']&&$h['observedAt']<=time()&&time()<=$j['expiresAt'],'Health proof expired/stale');
    vne_adapter_need(($h['url']??null)==='http://127.0.0.1:19482/','Health target differs');
    return ($h['httpStatus']??0)===200&&($h['cssStatus']??0)===200&&($h['marker']??'')===($previous?'r52-v2-20261028':$p['manifest']['themeMarker'])&&($h['cssSha256']??'')===hash('sha256',$p['maps'][$previous?'previous-theme':'theme']['vibelab-v2/style.css']);
}
function vne_adapter_runtime_dispatch($mode,$a){
    vne_adapter_runtime_scope($a);$p=vne_adapter_runtime_package($a);[$path,$lock]=vne_adapter_journal_paths($a);vne_adapter_path('/adapter-fixture/control');
    if($mode==='inspect-state'){
        $exists=file_exists($path)||file_exists($lock);$data=$exists?vne_adapter_data():vne_adapter_runtime_state($p,true);
        return array('data'=>$data,'baselineSha256'=>hash('sha256',wp_json_encode($data)),'phase'=>is_file($path)?vne_adapter_json($path)['phase']:($exists?'UNKNOWN_LOCK':'BASELINE'),'lockPresent'=>file_exists($lock),'runtimeFilesVerified'=>!$exists,'installAuthorized'=>false);
    }
    if($mode==='install'){
        $data=vne_adapter_runtime_state($p,true);vne_adapter_need(hash('sha256',wp_json_encode($data))===$a['baselineSha256'],'Approved runtime baseline differs');
        vne_adapter_need(!file_exists(ABSPATH.'.maintenance')&&!is_link(ABSPATH.'.maintenance'),'Existing maintenance; inspect');
        vne_adapter_need(!file_exists($path)&&!is_link($path)&&!file_exists($lock)&&!is_link($lock),'Existing journal/lock; inspect');
        $needed=268435456;foreach($p['manifest']['components'] as $component){$needed+=$component['bytes'];foreach($component['files'] as $f)$needed+=$f['bytes'];}
        vne_adapter_need(is_int($a['requiredFreeBytes']??null)&&$a['requiredFreeBytes']>=$needed,'Disk reserve not approved');
        $free=disk_free_space(WP_CONTENT_DIR);vne_adapter_need($free!==false&&$free>=$a['requiredFreeBytes'],'Insufficient disk reserve');
        $j=array_intersect_key($a,array_flip(array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','baselineSha256','receiverSha256')));$j['baseline']=$data;$j['phase']='INSTALLING';
        $handle=fopen($lock,'x');vne_adapter_need($handle!==false,'Exclusive lock failed');$bytes=json_encode($j,JSON_THROW_ON_ERROR);vne_adapter_need(fwrite($handle,$bytes)===strlen($bytes),'Lock write failed');fclose($handle);vne_adapter_write_journal($path,$j);
        try{vne_adapter_upgrade_local($p['paths']['inbox'].'/theme.zip');vne_adapter_need(vne_adapter_runtime_state($p,false)===$data,'Install data conflict');vne_adapter_maintenance_off();vne_adapter_challenge($j,'AWAIT_HEALTH');vne_adapter_write_journal($path,$j);return $j;}
        catch(Throwable $e){$j['phase']='STOPPED_INSPECT';vne_adapter_write_journal($path,$j);throw $e;}
    }
    vne_adapter_need(in_array($mode,array('finish','confirm-rollback'),true),'Unknown runtime mode');
    [$path,$lock,$j]=vne_adapter_owned($a,$mode==='finish'?'AWAIT_HEALTH':'ROLLBACK_AWAIT_HEALTH');
    try{vne_adapter_need(vne_adapter_runtime_state($p,$mode==='confirm-rollback')===$j['baseline'],'Runtime data conflict');}
    catch(Throwable $e){$j['phase']='CONFLICT_INSPECT';vne_adapter_write_journal($path,$j);throw $e;}
    $good=vne_adapter_health($a,$j,$p,$mode==='confirm-rollback');
    if($mode==='confirm-rollback'){vne_adapter_need($good,'Rollback HTTP health failed');$j['phase']='ROLLED_BACK';}
    elseif($good)$j['phase']='COMPLETE';
    else{
        $j['phase']='ROLLING_BACK';vne_adapter_write_journal($path,$j);
        try{vne_adapter_upgrade_local($p['paths']['inbox'].'/previous-theme.zip');vne_adapter_need(vne_adapter_runtime_state($p,true)===$j['baseline'],'Rollback data conflict');vne_adapter_maintenance_off();vne_adapter_challenge($j,'ROLLBACK_AWAIT_HEALTH');vne_adapter_write_journal($path,$j);return $j;}
        catch(Throwable $e){$j['phase']='STOPPED_INSPECT';vne_adapter_write_journal($path,$j);throw $e;}
    }
    vne_adapter_write_journal($path,$j);vne_adapter_owned($a,$j['phase']);vne_adapter_need(unlink($lock),'Own lock cleanup failed');return $j;
}
