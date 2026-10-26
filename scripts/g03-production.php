<?php
// Private WP-CLI entry. Never deployed inside a public directory.
if(!defined('G03_TOOL_TEST')&&(!defined('WP_CLI')||!WP_CLI||!defined('ABSPATH'))){exit(1);}
function g03_target($data){
    $required=array('root'=>'/var/www/vhosts/vneconomics.com/store.vneconomics.com/','database'=>'vne35060_wp_kmqnf','home'=>'https://store.vneconomics.com','stylesheet'=>'vibelab','plugin'=>'0.4.2','schema'=>3,'indexing'=>'1');
    foreach($required as $key=>$value){if(!array_key_exists($key,$data)||(string)$data[$key] !== (string)$value){throw new RuntimeException('Target refused: '.$key);}}
}
function g03_need($r){if(is_wp_error($r)){throw new RuntimeException($r->get_error_message());}return $r;}
function g03_hashes($ids,$codex){
    global $wpdb;$list=implode(',',array_map('intval',$ids));if(!$list){throw new RuntimeException('Empty baseline');}
    $rows=$wpdb->get_results("SELECT * FROM {$wpdb->posts} WHERE ID IN ($list) ORDER BY ID",ARRAY_A);
    $meta=$wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id IN ($list) AND NOT(post_id=%d AND meta_key=%s) ORDER BY meta_id",$codex,'_vne_validation'),ARRAY_A);
    return array('count'=>count($rows),'rowHash'=>hash('sha256',wp_json_encode($rows)),'metaExceptCodexValidationHash'=>hash('sha256',wp_json_encode($meta)));
}
function g03_disk($directory,$files){foreach($files as $file){$path=$directory.'/'.$file['path'];if(!is_file($path)||is_link($path)||!hash_equals($file['sha256'],hash_file('sha256',$path))){throw new RuntimeException('File mismatch: '.$file['path']);}}}
function g03_validate_once($id,$validation){$history=vne_library_validations($id);if($history){$last=end($history);if(array_intersect_key($last,$validation)===$validation){return;}throw new RuntimeException('Unexpected validation history: '.$id);}g03_need(vne_library_record_validation($id,$validation));}
function g03_run($directory,$mode){
    if(!in_array($mode,array('preflight','prepare','stage-content','publish','verify','hold'),true)){throw new RuntimeException('Unknown mode');}
    g03_target(array('root'=>ABSPATH,'database'=>DB_NAME,'home'=>get_option('home'),'stylesheet'=>get_stylesheet(),'plugin'=>VNE_LIBRARY_VERSION,'schema'=>get_option('vne_library_schema_version'),'indexing'=>get_option('blog_public')));
    $manifest=json_decode(file_get_contents($directory.'/manifest.json'),true,512,JSON_THROW_ON_ERROR);
    if(($manifest['campaign']??'')!=='g03-20261025'||hash_file('sha256',__FILE__)!==$manifest['importerSha256']||hash_file('sha256',$directory.'/content.json')!==$manifest['contentSha256']||hash_file('sha256',$directory.'/theme.zip')!==$manifest['theme']['sha256']){throw new RuntimeException('Package identity mismatch');}
    $content=json_decode(file_get_contents($directory.'/content.json'),true,512,JSON_THROW_ON_ERROR);
    if(count($content['guides'])!==2||array_column($content['guides'],'key')!==array('claude-code','antigravity')){throw new RuntimeException('Wrong guide set');}
    $baseline=$manifest['baseline'];$codex=(int)$baseline['codex']['id'];$codexItem=g03_need(vne_library_item($codex));
    if(hash('sha256',$codexItem['content'])!==$manifest['codexContentSha256']){throw new RuntimeException('Existing Codex body changed');}
    $hashes=g03_hashes($baseline['originalIds'],$codex);
    foreach(array('contentCount'=>'count','rowHash'=>'rowHash','metaExceptCodexValidationHash'=>'metaExceptCodexValidationHash') as $old=>$now){if($baseline[$old]!==$hashes[$now]){throw new RuntimeException('Existing data changed: '.$old);}}
    if(get_option('active_plugins')!==$baseline['activePlugins']){throw new RuntimeException('Plugin activation set changed');}
    g03_disk(ABSPATH.'wp-content/plugins',$manifest['plugin']['files']);
    $themeVersion=wp_get_theme()->get('Version');
    if(!in_array($themeVersion,array('0.7.1','0.7.2'),true)){throw new RuntimeException('Unexpected theme version');}
    g03_disk(ABSPATH.'wp-content/themes',$themeVersion==='0.7.1'?$manifest['previousTheme']['files']:$manifest['theme']['files']);
    $registry='vne_g03_production';$journal=get_option($registry);$manifestHash=hash_file('sha256',$directory.'/manifest.json');
    if($journal&&$journal['manifestHash']!==$manifestHash){throw new RuntimeException('Different release already journaled');}
    if($mode==='preflight'){
        if(!$journal){foreach($content['guides'] as $entry){if(get_page_by_path($entry['slug'],OBJECT,'vne_guide')){throw new RuntimeException('Existing slug collision: '.$entry['slug']);}g03_need(vne_library_validate_payload(array_merge($entry['payload'],array('status'=>'draft','primary_category'=>$codexItem['primary_category']))));}}
        return array('status'=>'READY_READ_ONLY','theme'=>$themeVersion,'baseline'=>$hashes,'journalStatus'=>$journal['status']??null);
    }
    $backup=dirname(ABSPATH).'/wordpress-backups/'.$manifest['backup']['name'];
    if(!is_file($backup)||hash_file('sha256',$backup)!==$manifest['backup']['sha256']||$manifest['backup']['crcErrors']!==0||$manifest['backup']['unsafeEntries']!==0){throw new RuntimeException('Pinned verified backup missing/changed');}
    if($mode==='prepare'){
        if($journal){return array('status'=>'ALREADY_PREPARED','journal'=>$journal);}
        if($themeVersion!=='0.7.1'){throw new RuntimeException('Prepare before upgrade');}
        $oldZip=$directory.'/previous-theme.zip';if(file_exists($oldZip)){throw new RuntimeException('Unjournaled recovery ZIP exists');}
        $zip=new ZipArchive();if($zip->open($oldZip,ZipArchive::CREATE|ZipArchive::EXCL)!==true){throw new RuntimeException('Recovery archive failed');}
        foreach($manifest['previousTheme']['files'] as $file){$zip->addFile(ABSPATH.'wp-content/themes/'.$file['path'],$file['path']);}$zip->close();chmod($oldZip,0600);
        $journal=array('status'=>'prepared','manifestHash'=>$manifestHash,'previousThemeSha256'=>hash_file('sha256',$oldZip),'map'=>array(),'startedAt'=>gmdate('c'),'baseline'=>$hashes);
        if(!add_option($registry,$journal,'',false)){throw new RuntimeException('Journal already exists');}
        return array('status'=>'PREPARED','journal'=>$journal,'recoveryArchive'=>$oldZip);
    }
    if(!$journal){throw new RuntimeException('Prepare required');}
    if(!is_file($directory.'/previous-theme.zip')||hash_file('sha256',$directory.'/previous-theme.zip')!==$journal['previousThemeSha256']){throw new RuntimeException('Recovery ZIP mismatch');}
    $actor=get_current_user_id();$admins=get_users(array('role'=>'administrator','number'=>1,'fields'=>'ID'));if(!$admins){throw new RuntimeException('No editorial actor');}wp_set_current_user((int)$admins[0]);
    $mail=fn()=>false;$network=fn()=>new WP_Error('g03_no_network','No network during import');$closed=fn()=>'closed';$zero=fn()=>0;
    add_filter('pre_wp_mail',$mail,PHP_INT_MAX);add_filter('pre_http_request',$network,PHP_INT_MAX);add_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);add_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);add_filter('pre_option_default_pingback_flag',$zero,PHP_INT_MAX);
    try{
        if(!current_user_can('vne_approve_library')||!current_user_can('vne_validate_library')){throw new RuntimeException('Missing editorial capability');}
        if($mode==='hold'){foreach($journal['map'] as $row){wp_update_post(array('ID'=>$row['id'],'post_status'=>'draft'));}$journal['status']='held';update_option($registry,$journal,false);return array('status'=>'HELD','journal'=>$journal);}
        if($mode==='stage-content'){
            if(in_array($journal['status'],array('content_ready','published','verified'),true)){return array('status'=>'ALREADY_STAGED','journal'=>$journal);}
            if($journal['status']!=='prepared'){throw new RuntimeException('Journal needs review');}
            $evidenceRoot=ABSPATH.'wp-content/uploads/vne-guide-evidence/'.$manifest['evidenceDirectory'];
            if(!wp_mkdir_p($evidenceRoot)){throw new RuntimeException('Evidence directory failed');}
            foreach($manifest['evidence'] as $file){$source=$directory.'/'.$file['file'];$target=$evidenceRoot.'/'.$file['key'].'.html';if(hash_file('sha256',$source)!==$file['sha256']){throw new RuntimeException('Evidence hash mismatch');}if(file_exists($target)&&hash_file('sha256',$target)!==$file['sha256']){throw new RuntimeException('Evidence collision');}if(!file_exists($target)&&!copy($source,$target)){throw new RuntimeException('Evidence publication failed');}chmod($target,0644);}
            foreach($content['guides'] as $entry){
                $payload=array_merge($entry['payload'],array('status'=>'draft','primary_category'=>$codexItem['primary_category']));
                if(isset($journal['map'][$entry['key']])){$id=(int)$journal['map'][$entry['key']]['id'];if(in_array($id,$baseline['originalIds'],true)){throw new RuntimeException('Journal points at old content');}$item=g03_need(vne_library_item($id,true));if($item['status']!=='draft'||$item['post_type']!=='vne_guide'||$item['title']!==$payload['title']||hash('sha256',$item['content'])!==$entry['contentSha256']){throw new RuntimeException('Partial draft changed');}}
                else{if(get_page_by_path($entry['slug'],OBJECT,'vne_guide')){throw new RuntimeException('Unjournaled slug collision');}$item=g03_need(vne_library_save_item($payload));$id=(int)$item['id'];$journal['map'][$entry['key']]=array('id'=>$id,'url'=>get_permalink($id),'title'=>$entry['payload']['title'],'contentSha256'=>$entry['contentSha256']);update_option($registry,$journal,false);}
                if(get_post_field('post_name',$id)!==$entry['slug']){throw new RuntimeException('Slug changed');}
                $state=vne_library_default_state();$state['source_access']=array('status'=>'available','source_url'=>$payload['document_source']['source_url'],'observed_at'=>'2026-10-25','note'=>'Tài liệu đã đối chiếu; bằng chứng đầu ra có chủ hỗ trợ ghi riêng.');g03_need(vne_library_save_state($id,$state));
                $validation=$content['validations'][$entry['key']];$validation['revision']=vne_library_revision($id);$validation['evidence_url']=home_url('/wp-content/uploads/vne-guide-evidence/'.$manifest['evidenceDirectory'].'/'.$entry['key'].'.html');g03_validate_once($id,$validation);
            }
            $validation=$content['validations']['codex'];$validation['revision']=vne_library_revision($codex);$validation['evidence_url']=home_url('/wp-content/uploads/vne-guide-evidence/'.$manifest['evidenceDirectory'].'/codex.html');g03_validate_once($codex,$validation);
            $journal['status']='content_ready';$journal['stagedAt']=gmdate('c');update_option($registry,$journal,false);return array('status'=>'CONTENT_STAGED_AS_DRAFT','journal'=>$journal);
        }
        if($mode==='publish'){
            if($themeVersion!=='0.7.2'||!in_array($journal['status'],array('content_ready','published','verified'),true)){throw new RuntimeException('Theme/content not ready');}
            foreach($content['guides'] as $entry){$id=$journal['map'][$entry['key']]['id'];$item=g03_need(vne_library_item($id,true));if(hash('sha256',$item['content'])!==$entry['contentSha256']||$item['derived']['validation_status']!=='tested'){throw new RuntimeException('Staged item changed/unvalidated');}if($item['status']!=='publish'){g03_need(vne_library_save_item(array_merge($entry['payload'],array('status'=>'publish','primary_category'=>$codexItem['primary_category'])),$id,vne_library_approved_revision($id)));}$journal['map'][$entry['key']]['url']=get_permalink($id);}
            $journal['status']='published';$journal['publishedAt']=gmdate('c');update_option($registry,$journal,false);
        }
        foreach(array_merge(array($codex),array_column($journal['map'],'id')) as $id){$item=g03_need(vne_library_item($id));if(!$item['derived']['commands_allowed']){throw new RuntimeException('Guide commands gate not satisfied: '.$id);}}
        if($mode==='verify'){$journal['status']='verified';$journal['verifiedAt']=gmdate('c');update_option($registry,$journal,false);}
        return array('status'=>$mode==='verify'?'VERIFIED':'PUBLISHED','journal'=>$journal,'original'=>g03_hashes($baseline['originalIds'],$codex),'theme'=>$themeVersion,'counts'=>array('vne_resource'=>(int)wp_count_posts('vne_resource')->publish,'vne_guide'=>(int)wp_count_posts('vne_guide')->publish,'vne_practice'=>(int)wp_count_posts('vne_practice')->publish));
    }finally{wp_set_current_user($actor);remove_filter('pre_wp_mail',$mail,PHP_INT_MAX);remove_filter('pre_http_request',$network,PHP_INT_MAX);remove_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);remove_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);remove_filter('pre_option_default_pingback_flag',$zero,PHP_INT_MAX);}
}
if(defined('G03_TOOL_TEST')){return;}
try{echo 'G03_RESULT='.wp_json_encode(g03_run(__DIR__,$args[0]??'preflight'),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).PHP_EOL;}catch(Throwable $e){echo 'G03_RESULT='.wp_json_encode(array('status'=>'FAIL','error'=>$e->getMessage()),JSON_UNESCAPED_UNICODE).PHP_EOL;WP_CLI::halt(1);}
