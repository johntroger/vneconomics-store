<?php
// Private CLI-only campaign importer. No HTTP entry, no theme/plugin changes.
if (!defined('VNE_C100_TEST') && (!defined('WP_CLI') || !WP_CLI || !defined('ABSPATH'))) { exit(1); }
function vne_c100_hashes($where='1=1') {
    global $wpdb;
    $types="'post','page','vne_resource','vne_guide','vne_practice'";
    $rows=$wpdb->get_results("SELECT * FROM {$wpdb->posts} WHERE post_type IN ($types) AND ($where) ORDER BY ID",ARRAY_A);
    $ids=array_map('intval',array_column($rows,'ID'));
    $meta=$ids?$wpdb->get_results("SELECT * FROM {$wpdb->postmeta} WHERE post_id IN (".implode(',',$ids).") ORDER BY meta_id",ARRAY_A):array();
    return array('count'=>count($rows),'rows'=>hash('sha256',wp_json_encode($rows)),'meta'=>hash('sha256',wp_json_encode($meta)));
}
function vne_c100_run($directory,$mode,$batch) {
    global $wpdb;
    if(!in_array($mode,array('dry-run','apply','verify'),true)||$batch<1||$batch>10)throw new RuntimeException('Invalid campaign action');
    $fixture=defined('VNE_C100_TEST')&&VNE_C100_TEST;
    if($fixture){
        if(DB_NAME!=='wordpress'||!str_starts_with(get_option('home'),'http://127.0.0.1:19418')||!str_contains(str_replace('\\','/',ABSPATH),'/tmp/tests/c100-'))throw new RuntimeException('Fixture target refused');
    }else{
        if(str_replace('\\','/',ABSPATH)!=='/var/www/vhosts/vneconomics.com/store.vneconomics.com/'||DB_NAME!=='vne35060_wp_kmqnf'||get_option('home')!=='https://store.vneconomics.com'||(string)get_option('blog_public')!=='1')throw new RuntimeException('Production target refused');
    }
    if(VNE_LIBRARY_VERSION!=='0.4.2'||(int)get_option('vne_library_schema_version')!==3||get_stylesheet()!=='vibelab'||wp_get_theme()->get('Version')!=='0.7.1')throw new RuntimeException('Runtime release changed');
    $manifest=json_decode(file_get_contents($directory.'/manifest.json'),true,512,JSON_THROW_ON_ERROR);
    if(($manifest['campaign']??'')!=='github-100-20261025'||($manifest['count']??0)!==100)throw new RuntimeException('Wrong campaign manifest');
    $path=$directory.'/batch-'.sprintf('%02d',$batch).'/content.json';
    $expected=$manifest['batches'][(string)$batch]['sha256']??'';
    if(!is_file($path)||!hash_equals($expected,hash_file('sha256',$path)))throw new RuntimeException('Payload hash refused');
    $data=json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);
    if(($data['batch']??0)!==$batch||count($data['items']??array())!==10)throw new RuntimeException('Batch shape refused');
    $registry='vne_c100_20261025_b'.sprintf('%02d',$batch);
    $originalCeiling=$fixture?(int)get_option('vne_c100_fixture_ceiling'):111;
    $original=vne_c100_hashes('ID<='.$originalCeiling);
    if(!$fixture&&($original['count']!==28||$original['rows']!=='d8507571df09e7c52b5636c78de7685525cb7ad90ccf52de51528995fb6e5d74'||$original['meta']!=='5aacbe74b52871a062ae589acfcd5a0f7d9ce903fa3544ecafa1df8654c373f6'))throw new RuntimeException('Existing content changed before batch');
    if(!$fixture){$backup=dirname(ABSPATH).'/wordpress-backups/store.vneconomics.com__2026-10-25T10_05_23+0700.zip';if(!is_file($backup)||hash_file('sha256',$backup)!=='5631842c2ca6271a4fe4ca5e8a948aff2148ee911944732be4d8d2d6758fe8cf')throw new RuntimeException('Pinned recovery backup missing or changed');}
    $previous=$batch>1?get_option('vne_c100_20261025_b'.sprintf('%02d',$batch-1)):null;
    if($batch>1&&($previous['status']??'')!=='verified')throw new RuntimeException('Previous batch HTTP acceptance not recorded');
    $existing=get_option($registry);
    if($existing){
        if(($existing['hash']??'')!==$expected||!in_array($existing['status']??'',array('complete','verified'),true))throw new RuntimeException('Incomplete/changed journal needs review');
        foreach($existing['map'] as $entry){$item=vne_library_item($entry['id']);if(is_wp_error($item)||$item['title']!==$entry['title']||$item['data']['source_url']!==$entry['source']||hash('sha256',$item['content'])!==$entry['contentHash'])throw new RuntimeException('Previously created article changed');}
        if($mode==='verify'){$existing['status']='verified';$existing['verifiedAt']=gmdate('c');update_option($registry,$existing,false);}
        return array('status'=>$mode==='verify'?'VERIFIED':'ALREADY_IMPORTED','journal'=>$existing,'original'=>$original);
    }
    if($mode==='verify')throw new RuntimeException('Cannot verify unimported batch');
    $existingSources=$wpdb->get_col("SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key='_vne_resource'");$seen=array();
    foreach($existingSources as $serialized){$value=maybe_unserialize($serialized);if(is_array($value)&&!empty($value['source_url']))$seen[rtrim(strtolower($value['source_url']),'/')]=true;}
    $categoryProbe=(int)($wpdb->get_var("SELECT term_id FROM {$wpdb->term_taxonomy} WHERE taxonomy='vne_category' LIMIT 1")??0);
    if(!$categoryProbe)throw new RuntimeException('No category available for read-only schema preflight');
    foreach($data['items'] as $entry){
        $p=$entry['payload'];$source=rtrim(strtolower($p['data']['source_url']??''),'/');if(isset($seen[$source]))throw new RuntimeException('Duplicate existing repo source');$seen[$source]=true;
        if(($p['post_type']??'')!=='vne_resource'||($p['status']??'')!=='publish'||isset($p['id'])||isset($entry['validations'])||!empty($entry['evidence']['runtimeValidated'])||!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$entry['slug']??''))throw new RuntimeException('Unexpected approved item');
        if($wpdb->get_var($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_type='vne_resource' AND (post_title=%s OR post_name=%s) LIMIT 1",$p['title'],$entry['slug'])))throw new RuntimeException('Existing title/slug collision');
        $p['primary_category']=$categoryProbe;$p['categories']=array($categoryProbe);$valid=vne_library_validate_payload($p);if(is_wp_error($valid))throw new RuntimeException($valid->get_error_message());
        $state=vne_library_validate_state($entry['state']);if(is_wp_error($state))throw new RuntimeException($state->get_error_message());
    }
    if($mode==='dry-run')return array('status'=>'READY_READ_ONLY','batch'=>$batch,'hash'=>$expected,'count'=>10,'titles'=>array_column(array_column($data['items'],'payload'),'title'),'original'=>$original);
    $actor=get_current_user_id();$admins=get_users(array('role'=>'administrator','number'=>1,'fields'=>'ID'));if(!$admins)throw new RuntimeException('No administrator');
    wp_set_current_user((int)$admins[0]);
    if(!current_user_can('vne_approve_library')){wp_set_current_user($actor);throw new RuntimeException('Missing editorial capability');}
    $before=vne_c100_hashes();$journal=array('status'=>'in_progress','hash'=>$expected,'batch'=>$batch,'map'=>array(),'terms'=>array(),'startedAt'=>gmdate('c'));
    $mail=fn()=>false;$network=fn()=>new WP_Error('c100_no_network','Network disabled during campaign import');$closed=fn()=>'closed';$zero=fn()=>0;
    add_filter('pre_wp_mail',$mail,PHP_INT_MAX);add_filter('pre_http_request',$network,PHP_INT_MAX);add_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);add_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);add_filter('pre_option_default_pingback_flag',$zero,PHP_INT_MAX);
    $owns=false;
    try{
        if(!vne_library_lock_insert($registry,maybe_serialize($journal)))throw new RuntimeException('Campaign lock busy');$owns=true;
        $need=function($value){if(is_wp_error($value))throw new RuntimeException($value->get_error_message());return $value;};
        $term=function($taxonomy,$name)use(&$journal,$registry,$need){$old=term_exists($name,$taxonomy);if($old)return (int)(is_array($old)?$old['term_id']:$old);$created=$need(vne_library_create_term(array('taxonomy'=>$taxonomy,'name'=>$name)));$id=(int)$created['term_id'];$journal['terms'][]=array('id'=>$id,'taxonomy'=>$taxonomy,'name'=>$name);update_option($registry,$journal,false);return $id;};
        foreach($data['items'] as $entry){
            $p=$entry['payload'];$category=$term('vne_category',$entry['category']);$p['primary_category']=$category;$p['categories']=array($category);$p['needs']=array($term('vne_need',$entry['need']));
            $item=$need(vne_library_save_item($p));$id=(int)$item['id'];
            $journal['map'][(string)$entry['key']]=array('id'=>$id,'title'=>$p['title'],'source'=>$p['data']['source_url'],'contentHash'=>$entry['contentHash'],'url'=>get_permalink($id));update_option($registry,$journal,false);
            // Create with the validated API, then record a stable name via the same permissioned API path.
            $need(vne_library_save_state($id,$entry['state']));
            $public=$need(vne_library_item($id));
            if($public['status']!=='publish'||$public['title']!==$p['title']||hash('sha256',$public['content'])!==$entry['contentHash']||$public['derived']['validation_status']!=='not_tested'||$public['data']['repo_id']!==$p['data']['repo_id']||get_post_meta($id,'_vne_validation',false)||get_post_field('comment_status',$id)!=='closed'||get_post_field('ping_status',$id)!=='closed')throw new RuntimeException('Article readback failed');
        }
        $created=array_map('intval',array_column($journal['map'],'id'));$after=vne_c100_hashes('ID NOT IN ('.implode(',',$created).')');
        if($before!==$after)throw new RuntimeException('Pre-existing content changed during batch');
        $journal['status']='complete';$journal['completedAt']=gmdate('c');$journal['preExistingUnchanged']=true;update_option($registry,$journal,false);
        return array('status'=>'IMPORTED','journal'=>$journal,'original'=>$original);
    }catch(Throwable $e){
        if($owns){foreach($journal['map'] as $entry){$post=get_post($entry['id']);if($post&&$post->post_title===$entry['title'])wp_update_post(array('ID'=>$post->ID,'post_status'=>'draft'));}$journal['status']='held_after_failure';$journal['failure']=$e->getMessage();update_option($registry,$journal,false);}
        throw $e;
    }finally{wp_set_current_user($actor);remove_filter('pre_wp_mail',$mail,PHP_INT_MAX);remove_filter('pre_http_request',$network,PHP_INT_MAX);remove_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);remove_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);remove_filter('pre_option_default_pingback_flag',$zero,PHP_INT_MAX);}
}
if(defined('VNE_C100_TEST'))return;
try{$result=vne_c100_run(__DIR__,$args[0]??'dry-run',(int)($args[1]??0));echo 'CONTENT100_RESULT='.wp_json_encode($result,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).PHP_EOL;}catch(Throwable $e){echo 'CONTENT100_RESULT='.wp_json_encode(array('status'=>'FAIL','error'=>$e->getMessage()),JSON_UNESCAPED_UNICODE).PHP_EOL;WP_CLI::halt(1);}
