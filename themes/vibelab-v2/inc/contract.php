<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_v2_contract_status() {
    $required=array('vne_library_types', 'vne_library_taxonomies', 'vne_library_item');
    $missing=array_values(array_filter($required, function($name){ return !function_exists($name); }));
    $schema=(int)get_option('vne_library_schema_version', 0);
    return array(
        'contract_version'=>VIBELAB_V2_CONTRACT_VERSION,
        'ready'=>count($missing)===0 && $schema>=3,
        'schema'=>$schema,
        'missing'=>$missing,
    );
}

function vibelab_v2_library_items($type='vne_resource', $limit=4) {
    $contract=vibelab_v2_contract_status();
    if (!$contract['ready']) { return array(); }
    $types=vne_library_types();
    if (!isset($types[$type])) { return array(); }
    $ids=get_posts(array(
        'post_type'=>$type,
        'post_status'=>'publish',
        'numberposts'=>(int)$limit<0?-1:max(1, min(12, (int)$limit)),
        'fields'=>'ids',
        'orderby'=>'title',
        'order'=>'ASC',
        'suppress_filters'=>false,
    ));
    $items=array();
    foreach($ids as $id) {
        $item=vne_library_item($id);
        if (!is_wp_error($item) && !empty($item['derived']['is_public'])) { $items[]=$item; }
    }
    return $items;
}

function vibelab_v2_archive_url($type='vne_resource') {
    return post_type_exists($type) ? get_post_type_archive_link($type) : home_url('/');
}

function vibelab_v2_category_name($item) {
    $id=(int)($item['primary_category']??0);
    if (!$id) { return 'Chưa phân loại'; }
    $term=get_term($id, 'vne_category');
    return $term && !is_wp_error($term) ? $term->name : 'Chưa phân loại';
}
