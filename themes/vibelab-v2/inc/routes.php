<?php
if (!defined('ABSPATH')) { exit; }
function vibelab_v2_support_paths() { return array('gioi-thieu'=>'gioi-thieu','cau-hoi'=>'cau-hoi-thuong-gap','ho-tro'=>'tro-giup','tieu-chi'=>'tieu-chi-tuyen-chon','quyen-rieng-tu'=>'quyen-rieng-tu','dieu-kien'=>'dieu-kien-su-dung'); }
add_action('template_redirect',function() {
    if (is_admin() || is_preview() || !in_array($_SERVER['REQUEST_METHOD']??'GET',array('GET','HEAD'),true)) { return; }
    global $wp,$wp_query;$path=trim($wp->request,'/');
    $redirects=array('home'=>'','about'=>'gioi-thieu','shop'=>'tai-nguyen','san-pham'=>'tai-nguyen','lien-he'=>'tro-giup');
    if(array_key_exists($path,$redirects)){wp_safe_redirect(home_url('/'.($redirects[$path]!==''?$redirects[$path].'/':'')),301);exit;}
    $gone=array('hello-world','sample-page','cart','checkout','my-account','my-account/lost-password','tin-tuc','cap-nhat-thi-truong-tai-san-so-ngay-14-6-2026-sac-xanh-tro-lai-bitcoin-lay-lai-moc-64-000-usd','diem-tin-kinh-te-tai-chinh-viet-nam-24h-qua-15-6-2026-vang-but-pha-ty-gia-leo-thang-chung-khoan-dieu-chinh');
    if(in_array($path,$gone,true)){$GLOBALS['vibelab_v2_gone']=true;$wp_query->set_404();status_header(410);nocache_headers();return;}
    foreach(vibelab_v2_support_paths() as $key=>$slug){
        if($path===$slug){$_GET['vne_support']=$key;$GLOBALS['vibelab_v2_support_route']=$key;$wp_query->is_404=false;$wp_query->is_home=false;status_header(200);return;}
    }
    $key=$_GET['vne_support']??null;
    if(is_string($key)&&isset(vibelab_v2_support_paths()[$key])){wp_safe_redirect(home_url('/'.vibelab_v2_support_paths()[$key].'/'),301);exit;}
},0);
add_filter('redirect_canonical',function($url){return !empty($GLOBALS['vibelab_v2_support_route'])||!empty($GLOBALS['vibelab_v2_gone'])?false:$url;});
