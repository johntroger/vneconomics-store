<?php
if (!defined('ABSPATH')) { exit; }
function vibelab_seo_context() {
    $ctx=vibelab_support_current();$find=vibelab_find_current();
    $private=is_404()||is_preview()||is_search()||is_tax(array('vne_need','vne_tool'))||($find&&!empty($find['finder']))||($ctx&&($ctx['error']||$ctx['page']==='bao-loi'));
    $canonical=null;$description='';
    if (!$private) {
        if ($ctx) { $canonical=vibelab_support_url($ctx['page']);$description=wp_strip_all_tags(vibelab_support_content($ctx['page'])); }
        elseif (is_singular(array('vne_resource','vne_guide','vne_practice')) && vibelab_ready()) {
            $item=vne_library_item(get_queried_object_id());
            if (!is_wp_error($item)&&$item['derived']['is_public']) {$canonical=get_permalink($item['id']);$description=$item['excerpt'];} else {$private=true;}
        } elseif (is_tax('vne_category')) {
            $canonical=get_term_link(get_queried_object());$description='Tài nguyên trong danh mục '.single_term_title('',false).'. Đọc yêu cầu, nguồn và tình trạng kiểm chứng trước khi chọn.';
        } elseif (is_post_type_archive()) {
            $type=get_query_var('post_type');$type=is_array($type)?reset($type):$type;$canonical=get_post_type_archive_link($type);
            $description='Khám phá tài nguyên và hướng dẫn thực hành tiếng Việt. Xem nguồn, yêu cầu và phạm vi kiểm chứng trước khi dùng.';
        } elseif (is_front_page()) {
            $canonical=home_url('/');$description='Thư viện tiếng Việt giúp người mới tìm hiểu vibe coding, chọn tài nguyên và làm bài landing page từng bước. Đọc miễn phí, không cần API key.';
        }
        if ((int)get_query_var('paged')>1 && $canonical) {$canonical=get_pagenum_link((int)get_query_var('paged'));}
    }
    if (is_wp_error($canonical)) {$canonical=null;}
    return array('private'=>$private,'canonical'=>$canonical,'description'=>wp_html_excerpt(trim(wp_strip_all_tags($description)),180,'…'));
}
remove_action('wp_head','rel_canonical');
add_action('wp_head',function() {
    $seo=vibelab_seo_context();
    if ($seo['canonical']) {echo '<link rel="canonical" href="'.esc_url($seo['canonical']).'">'."\n";}
    if ($seo['description']!=='') {echo '<meta name="description" content="'.esc_attr($seo['description']).'">'."\n";}
},2);
add_filter('wp_robots',function($robots) {
    if (vibelab_seo_context()['private']) {$robots['noindex']=true;unset($robots['index']);}
    return $robots;
},30);
function vibelab_sitemap_items($type) {
    if (!vibelab_ready()) {return array();}
    $items=array();
    foreach(get_posts(array('post_type'=>$type,'post_status'=>'publish','numberposts'=>-1,'fields'=>'ids')) as $id) {
        $approved=get_post_meta($id,'_vne_approved_content',true);$item=vne_library_item($id);
        if (is_array($approved)&&isset($approved['payload'])&&!is_wp_error($item)&&$item['derived']['is_public']) {$items[]=$item;}
    }
    return $items;
}
add_filter('wp_sitemaps_post_types',function($types) {return array_intersect_key($types,array_flip(array('vne_resource','vne_guide','vne_practice')));});
add_filter('wp_sitemaps_posts_query_args',function($args,$type) {
    $args['post__in']=array_column(vibelab_sitemap_items($type),'id')?:array(0);
    $args['post_status']='publish';return $args;
},10,2);
add_filter('wp_sitemaps_add_provider',function($provider,$name) {return $name==='users'?false:$provider;},10,2);
add_filter('wp_sitemaps_taxonomies',function($types) {return array_intersect_key($types,array('vne_category'=>true));});
add_filter('wp_sitemaps_taxonomies_query_args',function($args) {
    $ids=array();foreach(array('vne_resource','vne_guide','vne_practice') as $type) {foreach(vibelab_sitemap_items($type) as $item){$ids=array_merge($ids,$item['categories']);}}
    $args['include']=array_values(array_unique($ids))?:array(0);return $args;
});

add_filter('document_title_parts',function($parts) {
    $ctx=vibelab_support_current();
    if ($ctx) {$parts['site']=get_bloginfo('name');unset($parts['page']);}
    elseif (is_tax('vne_category')&&!is_404()) {$parts['title']=single_term_title('',false);}
    return $parts;
},60);
