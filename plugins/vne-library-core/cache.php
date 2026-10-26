<?php
if (!defined('ABSPATH')) { exit; }

// A deliberately bypasses rendered-page caches. Upstream caches must honor this policy.
function vne_library_cache_headers() {
    if (!defined('DONOTCACHEPAGE')) { define('DONOTCACHEPAGE', true); }
    nocache_headers();
    header('Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0', true);
    header('VNE-Cache-Policy: bypass', true);
}
add_action('template_redirect', function () {
    if (get_stylesheet()==='vibelab' || is_preview()) {
        vne_library_cache_headers();
        if (vne_library_cache_incident_active()) {
            wp_die('Thư viện tạm dừng để xác nhận nội dung mới nhất. Quản trị viên cần xử lý sự cố cache trước khi mở lại.', 'Thư viện tạm dừng', array('response'=>503));
        }
    }
}, 0);
add_action('admin_init', 'vne_library_cache_headers', 0);
add_filter('rest_post_dispatch', function ($response, $server, $request) {
    if (strpos($request->get_route(), '/vne-library/')===0) {
        $response=rest_ensure_response($response);
        $response->header('Cache-Control','private, no-store, no-cache, must-revalidate, max-age=0');
        $response->header('VNE-Cache-Policy','bypass');
        $headers=$response->get_headers();
        foreach (array_keys($headers) as $name) { if (in_array(strtolower($name),array('etag','last-modified'),true)) { unset($headers[$name]); } }
        $response->set_headers($headers);
    }
    return $response;
}, 999, 3);

// No cached derived state: resolve dependencies and time-sensitive warnings at read time.
function vne_library_cache_dirty($id) {
    if (isset(vne_library_types()[get_post_type($id)])) {
        $GLOBALS['vne_library_cache_dirty'][(int)$id]=true;
    }
}
add_action('save_post','vne_library_cache_dirty',999);
foreach (array('added_post_meta','updated_post_meta','deleted_post_meta') as $event) {
    add_action($event,function($meta_id,$id,$key) {
        if (strpos($key,'_vne_')===0) { vne_library_cache_dirty($id); }
    },999,3);
}
add_action('set_object_terms','vne_library_cache_dirty',999);
add_action('before_delete_post','vne_library_cache_dirty',999);

// Run after the content transaction. Native metadata/post caches are also invalidated by WP writes.
add_action('shutdown',function() {
    if (!empty($GLOBALS['vne_library_cache_dirty'])) {
        vne_library_cache_purge(array_keys($GLOBALS['vne_library_cache_dirty']));
    }
}, 1);
function vne_library_cache_purge($changed=array()) {
    $attempt=array('id'=>wp_generate_uuid4(),'at'=>gmdate('c'),'scope'=>'whole-library','changed'=>array_map('intval',$changed));
    try {
        // Full library scope includes dependent guides and every listing; never flush unrelated sites.
        $ids=get_posts(array('post_type'=>array_keys(vne_library_types()),'post_status'=>'any','numberposts'=>-1,'fields'=>'ids'));
        foreach (array_unique(array_merge($ids,$changed)) as $id) { if ($id>0) { clean_post_cache($id); } }
        // Optional adapter must return true only after all configured layers confirm purge.
        // No adapter means local WP object caches only, never hosting/CDN certification.
        $ok=apply_filters('vne_library_cache_purge_result',true,$attempt)===true;
    } catch (Throwable $error) { $ok=false; }
    $attempt['ok']=$ok;
    update_option('vne_library_cache_last_attempt',$attempt,false);
    if (!$ok) {
        update_option('vne_library_cache_incident',array('id'=>wp_generate_uuid4(),'at'=>$attempt['at'],'scope'=>'whole-library'),false);
    }
    return $attempt;
}
function vne_library_cache_retry($incident_id) {
    if (!current_user_can('vne_manage_library')) { return vne_library_error('Không có quyền.',403); }
    $incident=vne_library_cache_incident_read();
    if (!$incident || $incident['id']==='' || !hash_equals($incident['id'],(string)$incident_id)) {
        return vne_library_error('Sự cố đã thay đổi; hãy kiểm tra lại.',409);
    }
    $result=vne_library_cache_purge();
    if ($result['ok']) {
        // Delete only the incident acknowledged by this retry.
        global $wpdb;
        $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name=%s AND option_value=%s",
            'vne_library_cache_incident',maybe_serialize($incident)));
        wp_cache_delete('vne_library_cache_incident','options');
    }
    $result['resolved']=!vne_library_cache_incident_active();
    return $result;
}
add_action('admin_notices',function() {
    if (current_user_can('vne_manage_library') && ($incident=vne_library_cache_incident_read())) {
        echo '<div class="notice notice-error"><p>Thư viện công khai đang tạm dừng vì chưa xác nhận làm mới toàn bộ cache. Kiểm tra các tầng đã cấu hình theo checklist S12 trước khi mở lại.</p><form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';
        wp_nonce_field('vne_cache_retry');
        echo '<input type="hidden" name="action" value="vne_cache_retry"><input type="hidden" name="incident_id" value="'.esc_attr($incident['id']).'"><p><button class="button">Thử làm mới và xác nhận phục hồi</button></p></form></div>';
    }
});

add_action('wp_footer',function() {
    if (get_stylesheet()==='vibelab') {
        wp_print_inline_script_tag("window.addEventListener('pageshow',function(event){if(event.persisted){window.location.reload();}});",array('id'=>'vne-cache-history'));
    }
});

foreach (array('created_term','edited_term','delete_term') as $event) {
    add_action($event,function($term_id,$tt_id,$taxonomy) {
        if (isset(vne_library_taxonomies()[$taxonomy])) { $GLOBALS['vne_library_cache_dirty'][0]=true; }
    },999,3);
}

function vne_library_cache_incident_read() {
    // The safety switch and recovery controls must not depend on the cache being repaired.
    global $wpdb;
    $value=$wpdb->get_var($wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name=%s",'vne_library_cache_incident'));
    if (!empty($wpdb->last_error)) { return array('id'=>'','unreadable'=>true); }
    if ($value===null || $value==='') { return false; }
    $incident=maybe_unserialize($value);
    return is_array($incident) && is_string($incident['id']??null) && $incident['id']!=='' ? $incident : array('id'=>'','unreadable'=>true);
}
function vne_library_cache_incident_active() { return vne_library_cache_incident_read()!==false; }
add_filter('rest_pre_dispatch',function($result,$server,$request) {
    if (strpos($request->get_route(),'/vne-library/')===0 &&
        in_array($request->get_method(),array('GET','HEAD'),true) &&
        $request->get_param('context')!=='edit' &&
        strpos($request->get_route(),'/vne-library/v1/proposals/')!==0 &&
        vne_library_cache_incident_active()) {
        return vne_library_error('Thư viện tạm dừng để xác nhận nội dung mới nhất.',503);
    }
    return $result;
},0,3);
add_action('admin_post_vne_cache_retry',function() {
    if (!current_user_can('vne_manage_library')) { wp_die('Không có quyền.','',array('response'=>403)); }
    if ($_SERVER['REQUEST_METHOD']!=='POST') { wp_die('Yêu cầu POST.','',array('response'=>405)); }
    check_admin_referer('vne_cache_retry');
    $id=$_POST['incident_id']??null;
    if (!is_string($id)) { wp_die('Sự cố không hợp lệ.','',array('response'=>400)); }
    $result=vne_library_cache_retry(wp_unslash($id));
    if (is_wp_error($result)) { wp_die(esc_html($result->get_error_message()),'',array('response'=>$result->get_error_data()['status'])); }
    wp_safe_redirect(admin_url('admin.php?page=vne-library'));exit;
});

add_action('parse_request',function($wp) {
    // Native feeds are not an approved library projection. Stop before WP's conditional 304 exit.
    if (get_stylesheet()==='vibelab' && !empty($wp->query_vars['feed'])) {
        vne_library_cache_headers();
        header('X-Robots-Tag: noindex, nofollow',true);
        wp_die('Thư viện chưa cung cấp RSS. Vui lòng truy cập danh mục trên website.','RSS chưa được hỗ trợ',array('response'=>404));
    }
},0);
