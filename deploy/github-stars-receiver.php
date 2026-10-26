<?php
// Read-only U2 package/runtime verifier. No installer, importer, HTTP or scheduler.
if(!defined('ABSPATH')){exit(1);}
if(!defined('VNE_PIPELINE_LIBRARY_ONLY')){define('VNE_PIPELINE_LIBRARY_ONLY',true);}
require_once __DIR__.'/receiver.php';
function vne_stars_release_verify($directory,$approval){
 foreach(array('sourceSha'=>40,'manifestSha256'=>64) as $key=>$length){if(!is_string($approval[$key]??null)||!preg_match('/^[a-f0-9]{'.$length.'}$/D',$approval[$key])){throw new RuntimeException('Missing pinned approval');}}
 if(is_link($directory)||is_link($directory.'/manifest.json')||hash_file('sha256',$directory.'/manifest.json')!==$approval['manifestSha256']){throw new RuntimeException('Manifest hash differs');}
 $m=vne_pipeline_json($directory.'/manifest.json');
 if(($m['format']??null)!==1||($m['profile']??'')!=='vne-073-043-stars1-schema3'||($m['sourceSha']??'')!==$approval['sourceSha']||($m['schema']??null)!==3||($m['stats']??null)!==1||($m['mode']??'')!=='code-only'||($m['previous']['sourceSha']??'')!=='4266b71990702d87969a847e95d9c39933cb05a4'){throw new RuntimeException('Invalid stars profile');}
 $expected=array('theme.zip','plugin.zip','previous-theme.zip','previous-plugin.zip','receiver.php','github-stars-receiver.php','environments.json');$actual=array();
 foreach($m['files']??array() as $f){$p=$f['path']??'';if(!in_array($p,$expected,true)||in_array($p,$actual,true)||is_link($directory.'/'.$p)||!is_file($directory.'/'.$p)||hash_file('sha256',$directory.'/'.$p)!==($f['sha256']??'')){throw new RuntimeException('Package member differs');}$actual[]=$p;}
 sort($actual);sort($expected);if($actual!==$expected){throw new RuntimeException('Incomplete stars package');}
 $allowed=array_merge($expected,array('manifest.json','payload.zip'));foreach(new DirectoryIterator($directory) as $f){if(!$f->isDot()&&($f->isLink()||!$f->isFile()||!in_array($f->getFilename(),$allowed,true))){throw new RuntimeException('Unexpected package member');}}
 foreach(array('receiver.php','github-stars-receiver.php') as $path){$spec=array_values(array_filter($m['files'],fn($f)=>$f['path']===$path))[0];if(hash_file('sha256',__DIR__.'/'.$path)!==$spec['sha256']){throw new RuntimeException('Verifier source differs');}}
 foreach(array(array($m['components'],'0.7.3','0.4.3',11),array($m['previous']['components'],'0.7.2','0.4.2',10)) as $pair){vne_pipeline_zip($directory,$pair[0]['theme'],'vibelab','style.css',$pair[1],38);vne_pipeline_zip($directory,$pair[0]['plugin'],'vne-library-core','vne-library-core.php',$pair[2],$pair[3]);}
 return $m;
}
function vne_stars_release_runtime($directory,$approval,$previous=false){
 $m=vne_stars_release_verify($directory,$approval);$c=$previous?$m['previous']['components']:$m['components'];
 if(get_stylesheet()!=='vibelab'||wp_get_theme()->get('Version')!==$c['theme']['version']||VNE_LIBRARY_VERSION!==$c['plugin']['version']||(int)get_option('vne_library_schema_version')!==3||!vne_pipeline_component('themes',$c['theme'])||!vne_pipeline_component('plugins',$c['plugin'])){throw new RuntimeException('Stars runtime bytes/version differ');}
 return array('status'=>'VERIFIED_RUNTIME_ONLY','profile'=>$m['profile'],'pair'=>$previous?'previous':'current','sourceSha'=>$m['sourceSha']);
}
