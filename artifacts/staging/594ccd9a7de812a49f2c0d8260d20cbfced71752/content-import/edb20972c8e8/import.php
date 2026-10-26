<?php
// Owner-approved staging content only. Default operation is read-only preflight.
if (!defined('VNE_S15_IMPORT_TEST') && (!defined('WP_CLI') || !WP_CLI || !defined('ABSPATH'))) { exit(1); }
function vne_s15_import_target($observed) {
    $expected=array('root'=>'/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/','database'=>'vne35060_wp_udx1z','home'=>'https://staging-store.vneconomics.com','indexing'=>'0','plugin'=>'0.4.2','schema'=>3,'theme'=>'vibelab','themeVersion'=>'0.7.0');
    foreach($expected as $key=>$value){if(($observed[$key]??null)!==$value)throw new RuntimeException('Staging import guard: '.$key);}
}
function vne_s15_import_payload($path,$hash) {
    if(!is_file($path)||!hash_equals($hash,hash_file('sha256',$path)))throw new RuntimeException('Content hash mismatch');
    $data=json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);
    if(($data['format']??null)!==1||count($data['categories']??array())!==3||count($data['items']??array())!==11)throw new RuntimeException('Unexpected approved content shape');
    $counts=array_count_values(array_map(fn($i)=>$i['payload']['post_type']??'',$data['items']));
    if($counts!==array('vne_resource'=>6,'vne_guide'=>4,'vne_practice'=>1))throw new RuntimeException('Unexpected content counts');
    $titles=array();foreach($data['items'] as $item){$p=$item['payload'];if(($p['status']??'')!=='publish'||!is_string($p['title']??null)||!$p['title']||isset($titles[$p['title']])||isset($item['validations']))throw new RuntimeException('Unexpected content item');$titles[$p['title']]=true;}
    return $data;
}
function vne_s15_import_links($value,$map) {
    if(is_array($value)){foreach($value as $key=>$child)$value[$key]=vne_s15_import_links($child,$map);return $value;}
    if(!is_string($value))return $value;
    return preg_replace_callback('~https://staging-store\.vneconomics\.com/__S15_ITEM_([0-9]+)__/~',function($match)use($map){$id=(int)$match[1];if(!isset($map[$id]))throw new RuntimeException('Unresolved content link');return $map[$id]['url'];},$value);
}
if(defined('VNE_S15_IMPORT_TEST'))return;

global $wpdb;
$registry='vne_s15_content_import';$payloadHash='d96ee1409998e06c6aae822adb0e60b609fc0cac927b1bd7ac1a68cb6ec5a934';$actor=get_current_user_id();$journal=null;$ownsJournal=false;$failure=null;$mailBlock=fn()=>false;$httpBlock=fn()=>new WP_Error('s15_import_no_network','Network blocked during content import');$noPing=fn()=>0;$closed=fn()=>'closed';
$snapshot=fn()=>hash('sha256',wp_json_encode($wpdb->get_results($wpdb->prepare("SELECT ID,post_type,post_title,post_status FROM {$wpdb->posts} WHERE post_type IN (%s,%s) ORDER BY ID",'post','page'),ARRAY_A)));
try{
    vne_s15_import_target(array('root'=>str_replace('\\','/',ABSPATH),'database'=>DB_NAME,'home'=>get_option('home'),'indexing'=>(string)get_option('blog_public'),'plugin'=>defined('VNE_LIBRARY_VERSION')?VNE_LIBRARY_VERSION:'','schema'=>(int)get_option('vne_library_schema_version'),'theme'=>get_stylesheet(),'themeVersion'=>wp_get_theme()->get('Version')));
    $data=vne_s15_import_payload(__DIR__.'/content.json',$payloadHash);
    $existing=get_option($registry);
    if($existing){if(($existing['status']??'')!=='complete'||($existing['payloadHash']??'')!==$payloadHash)throw new RuntimeException('Existing import needs review; refusing duplicate or overwrite');foreach($existing['map'] as $entry){if(!get_post($entry['id']))throw new RuntimeException('Previously imported item missing; refusing automatic reimport');}echo wp_json_encode(array('status'=>'ALREADY_IMPORTED','journal'=>$existing),JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES).PHP_EOL;return;}
    if(get_posts(array('post_type'=>array('vne_resource','vne_guide','vne_practice'),'post_status'=>'any','numberposts'=>1,'fields'=>'ids')))throw new RuntimeException('Refuse to overwrite existing library content');
    foreach($data['categories'] as $name){if(term_exists($name,'vne_category'))throw new RuntimeException('Existing category requires mapping review');}
    if(($args[0]??'dry-run')!=='apply'){echo wp_json_encode(array('status'=>'READY_FOR_APPROVED_CONTENT_IMPORT','payloadHash'=>$payloadHash,'categories'=>$data['categories'],'titles'=>array_column(array_column($data['items'],'payload'),'title'),'existingPostsPagesHash'=>$snapshot(),'validationPolicy'=>'No validation records imported; no new PASS claims'),JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE).PHP_EOL;return;}
    $admins=get_users(array('role'=>'administrator','number'=>1,'fields'=>'ID'));if(!$admins)throw new RuntimeException('No existing administrator');wp_set_current_user((int)$admins[0]);if(!current_user_can('vne_approve_library'))throw new RuntimeException('Administrator lacks library capabilities');
    add_filter('pre_wp_mail',$mailBlock,PHP_INT_MAX);add_filter('pre_http_request',$httpBlock,PHP_INT_MAX);
    add_filter('pre_option_default_pingback_flag',$noPing,PHP_INT_MAX);add_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);add_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);
    $journal=array('status'=>'in_progress','payloadHash'=>$payloadHash,'beforePostsPagesHash'=>$snapshot(),'createdTerms'=>array(),'map'=>array(),'sourceFiles'=>$data['sourceFiles'],'validationPolicy'=>'No validation records imported; not_tested remains unless separately verified');
    if(!vne_library_lock_insert($registry,maybe_serialize($journal)))throw new RuntimeException('Cannot create import journal');$ownsJournal=true;
    $need=function($result){if(is_wp_error($result))throw new RuntimeException($result->get_error_message());return $result;};
    $groups=array();foreach($data['categories'] as $index=>$name){$term=$need(vne_library_create_term(array('taxonomy'=>'vne_category','name'=>$name)));$groups[$index+1]=(int)$term['term_id'];$journal['createdTerms'][]=(int)$term['term_id'];update_option($registry,$journal,false);}
    foreach($data['items'] as $entry){
        $p=vne_s15_import_links($entry['payload'],$journal['map']);$p['primary_category']=$groups[$p['primary_category']];
        foreach(array('categories','needs','tools') as $field){if(isset($p[$field])&&$p[$field])throw new RuntimeException('Unexpected taxonomy list in approved payload');}
        $item=$need(vne_library_save_item($p));$id=(int)$item['id'];
        $journal['map'][$entry['key']]=array('id'=>$id,'title'=>$item['title'],'type'=>$item['post_type'],'url'=>get_permalink($id));update_option($registry,$journal,false);
        if(isset($entry['state']))$need(vne_library_save_state($id,$entry['state']));
        $read=$need(vne_library_item($id,true));if($read['status']!=='publish'||$read['title']!==$p['title']||$read['validations'])throw new RuntimeException('Imported item readback failed');
    }
    if(!hash_equals($journal['beforePostsPagesHash'],$snapshot()))throw new RuntimeException('Existing posts/pages changed during import');
    $journal['status']='complete';$journal['completedAt']=gmdate('c');$journal['existingPostsPagesUnchanged']=true;update_option($registry,$journal,false);
    echo wp_json_encode(array('status'=>'IMPORTED_APPROVED_STAGING_CONTENT','journal'=>$journal),JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).PHP_EOL;
}catch(Throwable $error){
    $failure=$error->getMessage();$cleanupErrors=array();
    // Roll back only IDs recorded as created by this import. Never remove pre-existing content.
    if($ownsJournal&&is_array($journal)&&($journal['status']??'')==='in_progress'){
        foreach(array_reverse($journal['map']) as $entry){$post=get_post($entry['id']);if($post&&$post->post_type===$entry['type']&&$post->post_title===$entry['title']){wp_delete_post($entry['id'],true);if(get_post($entry['id']))$cleanupErrors[]='post '.$entry['id'];}elseif($post)$cleanupErrors[]='ownership '.$entry['id'];}
        foreach(array_reverse($journal['createdTerms']) as $id){$term=get_term($id,'vne_category');if($term&&!is_wp_error($term)&&in_array($term->name,$data['categories'],true))wp_delete_term($id,'vne_category');if(term_exists($id,'vne_category'))$cleanupErrors[]='term '.$id;}
        if(!$cleanupErrors)delete_option($registry);else{$journal['status']='cleanup_incomplete';$journal['cleanupErrors']=$cleanupErrors;update_option($registry,$journal,false);}
    }
    echo wp_json_encode(array('status'=>'FAIL_IMPORT','failure'=>$failure,'cleanupErrors'=>$cleanupErrors),JSON_PRETTY_PRINT).PHP_EOL;
}finally{wp_set_current_user($actor);remove_filter('pre_wp_mail',$mailBlock,PHP_INT_MAX);remove_filter('pre_http_request',$httpBlock,PHP_INT_MAX);remove_filter('pre_option_default_pingback_flag',$noPing,PHP_INT_MAX);remove_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);remove_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);}
if($failure)WP_CLI::halt(1);
