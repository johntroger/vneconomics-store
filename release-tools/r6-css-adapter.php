<?php
// Inbox inspection only. The caller must pin this file BEFORE including it.
if(PHP_SAPI!=='cli')throw new RuntimeException('CLI required');
function vne_adapter_need($ok,$message){if(!$ok)throw new RuntimeException($message);}
function vne_adapter_path($path){
    vne_adapter_need(is_string($path)&&str_starts_with($path,'/')&&!str_contains($path,chr(0))&&!preg_match('~(^|/)\.\.?(/|$)~',$path),'Unsafe path');
    for($part=$path;$part!==dirname($part);$part=dirname($part))vne_adapter_need(!is_link($part),'Symlink refused');
    $real=realpath($path);vne_adapter_need($real===$path,'Canonical path required');return $real;
}
function vne_adapter_paths($environment){
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
