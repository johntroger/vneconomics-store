<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_v2_catalog_query($query) {
    if (is_admin() || !$query->is_main_query()) { return; }
    if ($query->is_post_type_archive('vne_resource') || $query->is_tax('vne_category')) {
        $query->set('post_type', 'vne_resource');
        $query->set('post_status', 'publish');
        $query->set('posts_per_page', 12);
        $query->set('orderby', 'title');
        $query->set('order', 'ASC');
    }
}
add_action('pre_get_posts', 'vibelab_v2_catalog_query');

function vibelab_v2_catalog_categories() {
    if (!vibelab_v2_contract_status()['ready']) { return array(); }
    $terms=get_terms(array('taxonomy'=>'vne_category', 'hide_empty'=>true, 'orderby'=>'name'));
    return is_wp_error($terms) ? array() : $terms;
}

function vibelab_v2_breadcrumb($trail=array()) {
    echo '<nav class="v2-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="'.esc_url(home_url('/')).'">Trang chủ</a></li>';
    foreach($trail as $index=>$entry) {
        $last=$index===array_key_last($trail);
        echo '<li>';
        if(!$last && !empty($entry[0]))echo '<a href="'.esc_url($entry[0]).'">'.esc_html($entry[1]).'</a>';
        else echo '<span aria-current="page">'.esc_html($entry[1]).'</span>';
        echo '</li>';
    }
    echo '</ol></nav>';
}

function vibelab_v2_pagination() {
    $links=paginate_links(array('type'=>'array', 'prev_text'=>'Trang trước', 'next_text'=>'Trang sau'));
    if(!$links){return;}
    echo '<nav class="v2-pagination" aria-label="Phân trang">';
    foreach($links as $link){echo wp_kses_post($link);}
    echo '</nav>';
}
