<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_v2_seo_context() {
    $canonical=null;$description='';$private=is_404()||is_preview()||is_search();
    if(!empty($GLOBALS['vibelab_v2_support_route'])){
        $key=$GLOBALS['vibelab_v2_support_route'];$private=false;$canonical=home_url('/'.vibelab_v2_support_paths()[$key].'/');$description=vibelab_v2_support_pages()[$key];
    }elseif(!$private&&is_singular(array('vne_resource','vne_guide','vne_practice'))&&vibelab_v2_contract_status()['ready']){
        $item=vne_library_item(get_queried_object_id());
        if(!is_wp_error($item)&&!empty($item['derived']['is_public'])){$canonical=get_permalink($item['id']);$description=$item['excerpt'];}else{$private=true;}
    }elseif(!$private&&is_post_type_archive('vne_guide')){
        $canonical=get_post_type_archive_link('vne_guide');
        $description='Hướng dẫn và bài thực hành theo từng mục tiêu, kèm nguồn và tình trạng kiểm chứng.';
    }elseif(!$private&&is_tax('vne_category')){
        $canonical=get_term_link(get_queried_object());
        $description='Tài nguyên trong danh mục '.single_term_title('',false).'. Đọc nguồn, điều kiện và tình trạng trước khi chọn.';
    }elseif(!$private&&is_post_type_archive('vne_resource')){
        $canonical=get_post_type_archive_link('vne_resource');
        $description='Khám phá tài nguyên tiếng Việt theo nhu cầu. Đọc nguồn, điều kiện và phạm vi kiểm chứng trước khi dùng.';
    }elseif(!$private&&is_front_page()){
        $canonical=home_url('/');
        $description='VibeLab Việt giúp người mới tìm công cụ, hiểu điều kiện và bắt đầu từ một việc nhỏ.';
    }
    if(is_wp_error($canonical))$canonical=null;
    if($canonical&&(int)get_query_var('paged')>1){$private=true;$canonical=null;}
    if(isset($_GET['vne_support'])&&($_GET['vne_support']==='bao-loi')){$private=true;$canonical=null;}
    return array('canonical'=>$canonical,'description'=>wp_html_excerpt(wp_strip_all_tags($description),180,'…'),'private'=>$private);
}

remove_action('wp_head','rel_canonical');
add_action('wp_head',function(){
    $seo=vibelab_v2_seo_context();
    if($seo['canonical'])echo '<link rel="canonical" href="'.esc_url($seo['canonical']).'">'."\n";
    if($seo['description']!=='')echo '<meta name="description" content="'.esc_attr($seo['description']).'">'."\n";
},3);

add_filter('wp_robots',function($robots){
    if(vibelab_v2_seo_context()['private']){$robots['noindex']=true;unset($robots['index']);}
    return $robots;
},30);

add_filter('document_title_parts',function($parts){
    if(is_singular('vne_resource')&&vibelab_v2_contract_status()['ready']){
        $item=vne_library_item(get_queried_object_id());if(!is_wp_error($item))$parts['title']=$item['title'];
    }elseif(is_tax('vne_category')){$parts['title']=single_term_title('',false);}
    return $parts;
},40);

add_filter('wp_sitemaps_post_types',function($types){return array_intersect_key($types,array_flip(array('vne_resource','vne_guide','vne_practice')));});
add_filter('wp_sitemaps_add_provider',function($provider,$name){return $name==='users'?false:$provider;},10,2);
add_filter('wp_sitemaps_taxonomies',function($types){return array_intersect_key($types,array('vne_category'=>true));});
