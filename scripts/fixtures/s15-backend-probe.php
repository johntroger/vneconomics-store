<?php
// One disposable draft on the verified staging database. Always clean in finally.
if (!defined('WP_CLI') || !WP_CLI || !defined('ABSPATH')) { if(PHP_SAPI!=='cli')http_response_code(404);exit(1); }
if (str_replace('\\','/',ABSPATH)!=='/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/' || DB_NAME!=='vne35060_wp_udx1z' || get_option('home')!=='https://staging-store.vneconomics.com' || (string)get_option('blog_public')!=='0') { WP_CLI::error('Refuse: wrong staging target or indexing is enabled.'); }
if (!defined('VNE_LIBRARY_VERSION') || VNE_LIBRARY_VERSION!=='0.4.2' || (int)get_option('vne_library_schema_version')!==3) { WP_CLI::error('Refuse: expected plugin/schema not active.'); }
global $wpdb;
$checks=array();$id=0;$actor=get_current_user_id();$theme=get_stylesheet();$failure=null;
$tag='S15 disposable draft '.wp_generate_uuid4();
$baseline=$wpdb->get_results("SELECT ID,post_type,post_title,post_status FROM {$wpdb->posts} WHERE post_type IN ('post','page') ORDER BY ID",ARRAY_A);
$assert=function($ok,$label)use(&$checks){if(!$ok)throw new RuntimeException($label);$checks[]=$label;};
$need=function($result){if(is_wp_error($result))throw new RuntimeException($result->get_error_message());return $result;};
$mail_block=function(){return false;};$http_block=function(){return new WP_Error('s15_no_network','Network disabled for this fixture request.');};
add_filter('pre_wp_mail',$mail_block,PHP_INT_MAX);add_filter('pre_http_request',$http_block,PHP_INT_MAX);
try {
    foreach(array($wpdb->posts,$wpdb->postmeta,$wpdb->options) as $table){
        $engine=$wpdb->get_var($wpdb->prepare('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s',$table));
        $assert(strcasecmp((string)$engine,'InnoDB')===0,'InnoDB table: '.$table);
    }
    $admins=get_users(array('role'=>'administrator','number'=>1,'fields'=>'ID'));$assert(count($admins)===1,'existing administrator available');
    wp_set_current_user((int)$admins[0]);$assert(current_user_can('vne_manage_library')&&current_user_can('vne_approve_library'),'administrator plugin capabilities');
    $payload=array('post_type'=>'vne_resource','status'=>'draft','title'=>$tag,'excerpt'=>'Disposable S15 database test; never published.','content'=>'<p>Temporary draft, automatically removed.</p>','primary_category'=>0,'data'=>vne_library_default_resource());
    $created=$need(vne_library_save_item($payload));$id=(int)$created['id'];
    $assert($id>0&&get_post_status($id)==='draft','draft saved through plugin on MariaDB');
    $old=vne_library_approved_revision($id);$assert((bool)preg_match('/^[a-f0-9]{64}$/D',$old),'approved revision generated');
    wp_set_current_user(0);$hidden=vne_library_item($id);$assert(is_wp_error($hidden)&&($hidden->get_error_data()['status']??0)===404,'anonymous cannot read draft');
    $denied=vne_library_save_item($payload,$id,$old);$assert(is_wp_error($denied)&&($denied->get_error_data()['status']??0)===403,'anonymous cannot change draft');
    wp_set_current_user((int)$admins[0]);$payload['title']=$tag.' updated';$updated=$need(vne_library_save_item($payload,$id,$old));
    $assert($updated['title']===$payload['title'],'approved-base update persisted');
    $fresh=vne_library_approved_revision($id);$assert($fresh!==$old,'revision changes after update');
    $stale_payload=$payload;$stale_payload['title']=$tag.' stale overwrite';$stale=vne_library_save_item($stale_payload,$id,$old);
    $assert(is_wp_error($stale)&&($stale->get_error_data()['status']??0)===409,'stale base rejected with 409');
    $assert(get_post_field('post_title',$id)===$payload['title']&&vne_library_approved_revision($id)===$fresh,'stale write leaves approved data unchanged');
    $invalid=$payload;$invalid['unlisted_field']='not allowed';$bad=vne_library_save_item($invalid,$id,$fresh);
    $assert(is_wp_error($bad)&&vne_library_approved_revision($id)===$fresh,'invalid payload rolls back without revision change');
    $state=vne_library_default_state();$state['recommendation']=array('status'=>'suspended','reason'=>'S15 disposable fixture only.');
    $saved_state=$need(vne_library_save_state($id,$state));
    $assert(vne_library_state_input($id)['recommendation']['status']==='suspended','state saved and read back');
    $assert($saved_state['derived']['validation_status']==='not_tested','state does not promote validation');
    $assert(get_stylesheet()===$theme,'active theme preserved');
} catch(Throwable $error) { $failure=$error->getMessage(); }
finally {
    try {
        if($id){
            if(!isset($admins[0]))throw new RuntimeException('Missing cleanup actor.');
            wp_set_current_user((int)$admins[0]);$post=get_post($id);
            if($post&&$post->post_type==='vne_resource'&&str_starts_with($post->post_title,$tag)){
                wp_delete_post($id,true);
            } elseif($post) { throw new RuntimeException('Cleanup refused unrelated post.'); }
            $assert(!get_post($id),'fixture post and core revisions deleted');
            $assert((int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE post_id=%d",$id))===0,'fixture postmeta removed');
            $assert((int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name=%s",vne_library_content_lock_key($id)))===0,'fixture content lock released');
        }
        $after=$wpdb->get_results("SELECT ID,post_type,post_title,post_status FROM {$wpdb->posts} WHERE post_type IN ('post','page') ORDER BY ID",ARRAY_A);
        $assert($baseline===$after,'existing posts/pages unchanged');
        $assert(get_stylesheet()===$theme,'theme unchanged after cleanup');
    } catch(Throwable $cleanup_error){$failure=($failure?$failure.'; ':'').'CLEANUP: '.$cleanup_error->getMessage();}
    wp_set_current_user($actor);remove_filter('pre_wp_mail',$mail_block,PHP_INT_MAX);remove_filter('pre_http_request',$http_block,PHP_INT_MAX);
}
echo wp_json_encode(array('status'=>$failure?'FAIL':'PASS_STAGING_BACKEND_DRAFT','plugin'=>VNE_LIBRARY_VERSION,'schema'=>(int)get_option('vne_library_schema_version'),'theme'=>$theme,'checks'=>$checks,'failure'=>$failure,'limits'=>array('One draft only, no publication or seed','No parallel contender, HTTP/HTTPS, proxy cache or theme certification')),JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES).PHP_EOL;
if($failure)WP_CLI::halt(1);
