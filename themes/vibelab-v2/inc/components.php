<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_v2_navigation() {
    $links=array(
        'Trang chủ'=>home_url('/'),
        'Tài nguyên'=>vibelab_v2_archive_url('vne_resource'),
        'Hướng dẫn'=>vibelab_v2_archive_url('vne_guide'),
        'Tiêu chí'=>home_url('/#tieu-chi'),
    );
    echo '<nav class="v2-nav" aria-label="Điều hướng chính">';
    foreach($links as $label=>$url) {
        echo '<a href="'.esc_url($url).'">'.esc_html($label).'</a>';
    }
    echo '</nav>';
}

function vibelab_v2_resource_type($item) {
    $types=array('learn'=>'Tài liệu học', 'skill'=>'Skill', 'starter'=>'Dự án mẫu', 'tool'=>'Công cụ');
    return $types[$item['data']['resource_type']??'']??'Tài nguyên';
}

function vibelab_v2_resource_row($item, $index) {
    $label=(string)($item['derived']['primary_label']??'Chưa xác định');
    $url=get_permalink((int)$item['id']);
    echo '<article class="v2-resource-row" data-resource-id="'.esc_attr((string)$item['id']).'">';
    echo '<span class="v2-resource-number" aria-hidden="true">'.esc_html(str_pad((string)$index, 2, '0', STR_PAD_LEFT)).'</span>';
    echo '<div class="v2-resource-copy"><h3><a href="'.esc_url($url).'">'.esc_html($item['title']).'</a></h3><p>'.esc_html($item['excerpt']).'</p></div>';
    echo '<span class="v2-resource-kind">'.esc_html(vibelab_v2_resource_type($item)).' · '.esc_html(vibelab_v2_category_name($item)).'</span>';
    echo '<span class="v2-status">'.esc_html($label).'</span>';
    echo '<a class="v2-resource-action" href="'.esc_url($url).'">Xem chi tiết<span class="screen-reader-text">: '.esc_html($item['title']).'</span></a>';
    echo '</article>';
}
