<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_v2_detail_guard() {
    if(!is_singular('vne_resource')){return;}
    if(!vibelab_v2_contract_status()['ready']){$valid=false;}
    else{$item=vne_library_item(get_queried_object_id());$valid=!is_wp_error($item)&&!empty($item['derived']['is_public']);}
    if(!$valid){global $wp_query;$wp_query->set_404();status_header(404);nocache_headers();}
}
add_action('template_redirect','vibelab_v2_detail_guard',5);

function vibelab_v2_source_allowed($item) {
    return ($item['derived']['cta']['kind']??'')==='source' && !empty($item['derived']['cta']['href']);
}

function vibelab_v2_claim_labels() {
    return array('requirements'=>'Yêu cầu sử dụng','permissions'=>'Quyền truy cập','compatibility'=>'Tương thích','license'=>'Giấy phép','cost'=>'Chi phí');
}

function vibelab_v2_claim_value($claim) {
    $status=$claim['verification_status']??'unknown';
    if($status==='upstream_claimed')return $claim['value']?:'Chưa xác định';
    if($status==='conflicted')return 'Thông tin đang mâu thuẫn';
    return 'Chưa xác định';
}

function vibelab_v2_detail_content($item) {
    $allowed=wp_kses_allowed_html('post');
    foreach(array('form','input','button','iframe','h1') as $tag){unset($allowed[$tag]);}
    foreach($allowed as &$attributes){unset($attributes['style']);}unset($attributes);
    $html=wp_kses($item['content'],$allowed);
    $processor=new WP_HTML_Tag_Processor($html);
    while($processor->next_tag('A')){
        $href=$processor->get_attribute('href');
        if(is_string($href)&&in_array(wp_parse_url($href,PHP_URL_SCHEME),array('http','https'),true)&&wp_parse_url($href,PHP_URL_HOST)!==wp_parse_url(home_url('/'),PHP_URL_HOST)){
            $processor->set_attribute('target','_blank');
            $processor->set_attribute('rel','noopener noreferrer');
        }
    }
    return $processor->get_updated_html();
}

function vibelab_v2_related_items($item,$limit=3) {
    $related=array();
    foreach(vibelab_v2_library_items('vne_resource',-1) as $other){
        if($other['id']===$item['id']||!array_intersect($item['categories'],$other['categories']))continue;
        if(($other['derived']['recommendation_status']??'')==='suspended'||($other['derived']['source_access_status']??'')==='unavailable')continue;
        $related[]=$other;if(count($related)===$limit)break;
    }
    return $related;
}
