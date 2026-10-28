<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_v2_guide_guard() {
    if (!is_singular(array('vne_guide','vne_practice'))) { return; }
    $item=vibelab_v2_contract_status()['ready']?vne_library_item(get_queried_object_id()):null;
    if (!$item || is_wp_error($item) || empty($item['derived']['is_public'])) {
        global $wp_query; $wp_query->set_404(); status_header(404); nocache_headers();
    }
}
add_action('template_redirect','vibelab_v2_guide_guard',5);

add_action('template_redirect',function() {
    if (is_post_type_archive('vne_practice') && !is_feed()) {
        wp_safe_redirect(vibelab_v2_archive_url('vne_guide'),301);
        exit;
    }
},10);

function vibelab_v2_is_guide_search() {
    return isset($_GET['vne_find'],$_GET['scope']) && is_string($_GET['scope']) && wp_unslash($_GET['scope'])==='guides';
}
add_action('pre_get_posts',function($query) {
    if (is_admin() || !$query->is_main_query() || $query->is_feed() || $query->is_singular() || !vibelab_v2_is_guide_search()) { return; }
    $query->set('post_type',array('vne_guide','vne_practice'));
    $query->set('post_status','publish');
    $query->set('posts_per_page',-1);
    $query->set('s','');
    $query->is_home=false;$query->is_search=true;
},40);
add_filter('template_include',function($template) {
    return vibelab_v2_is_guide_search() && !is_404()?__DIR__.'/../archive-vne_guide.php':$template;
},50);

function vibelab_v2_guide_body($item) {
    $html=vibelab_v2_detail_content($item);
    if (empty($item['derived']['commands_allowed'])) {
        $html=preg_replace('~<pre\b[^>]*>.*?(?:</pre\s*>|$)~is','<p>Khối mã chưa hiển thị vì điều kiện hoặc kiểm chứng chưa đủ rõ.</p>',$html);
    }
    $toc=array();
    $html=preg_replace_callback('~<h2\b([^>]*)>(.*?)</h2\s*>~is',function($match) use (&$toc,$item) {
        $id='guide-'.(int)$item['id'].'-section-'.(count($toc)+1);
        if (preg_match('~\bid\s*=\s*([\x22\x27])(.*?)\1~is',$match[1],$anchor) && $anchor[2]!=='') { $id=html_entity_decode($anchor[2],ENT_QUOTES,'UTF-8'); }
        $toc[]=array('id'=>$id,'label'=>wp_strip_all_tags($match[2]));
        return '<h2 id="'.esc_attr($id).'" tabindex="-1">'.$match[2].'</h2>';
    },$html);
    return array('html'=>$html,'toc'=>$toc);
}

function vibelab_v2_guide_resources($item) {
    if (!function_exists('vne_library_dependencies')) { return array(); }
    $items=array();
    foreach (vne_library_dependencies($item['id']) as $dependency) {
        $id=(int)($dependency['resource_id']??0);
        if (!$id || isset($items[$id])) { continue; }
        $resource=vne_library_item($id);
        if (!is_wp_error($resource) && !empty($resource['derived']['is_public'])) { $items[$id]=$resource; }
    }
    return array_values($items);
}
