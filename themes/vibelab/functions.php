<?php
if (!defined('ABSPATH')) { exit; }
function vibelab_setup() {
    add_theme_support('title-tag');
    add_theme_support('html5',array('search-form','gallery','caption','style','script'));
    add_theme_support('responsive-embeds');
    register_nav_menus(array('primary'=>'Điều hướng chính'));
}
add_action('after_setup_theme','vibelab_setup');
function vibelab_assets() {
    $version=wp_get_theme()->get('Version');
    wp_enqueue_style('vibelab',get_stylesheet_uri(),array(),$version);
    wp_enqueue_script('vibelab-menu',get_theme_file_uri('/assets/menu.js'),array(),$version,true);
}
add_action('wp_enqueue_scripts','vibelab_assets');
function vibelab_ready() { return function_exists('vne_library_item'); }
function vibelab_items($type='vne_resource',$limit=6) {
    if (!vibelab_ready()) { return array(); }
    $ids=get_posts(array('post_type'=>$type,'post_status'=>'publish','numberposts'=>$limit,'fields'=>'ids','orderby'=>'title','order'=>'ASC','suppress_filters'=>false));
    $items=array();
    foreach($ids as $id) {
        $item=vne_library_item($id);
        if (!is_wp_error($item)&&!empty($item['derived']['is_public'])) { $items[]=$item; }
    }
    return $items;
}
function vibelab_archive($type='vne_resource') {
    return post_type_exists($type)?get_post_type_archive_link($type):home_url('/#tai-nguyen');
}
function vibelab_guide() { $items=vibelab_items('vne_guide',1);return $items?$items[0]:null; }
function vibelab_category_name($item) {
    $term=get_term($item['primary_category'],'vne_category');
    return $term&&!is_wp_error($term)?$term->name:'Tài nguyên';
}
function vibelab_cover($item) {
    $map=array('https://github.com/microsoft/Web-Dev-For-Beginners'=>'web-basics','https://github.com/mdn/learning-area'=>'mdn','https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines'=>'web-design','https://github.com/withastro/astro/tree/main/examples/basics'=>'astro','https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices'=>'react','https://github.com/picocss/pico'=>'pico');
    $key=$map[$item['data']['source_url']??'']??'default';
    $file='/assets/cover-'.$key.'.svg';
    if(!vibelab_image_exists($file)){$file='/assets/cover-default.svg';}
    return vibelab_image_exists($file)?get_theme_file_uri($file):null;
}
function vibelab_cta($item,$class='button') {
    $cta=$item['derived']['cta'];$url=get_permalink($item['id']).'#tinh-trang';$external=false;
    if ($cta['kind']==='source'&&!empty($cta['href'])) { $url=$cta['href'];$external=true; }
    if ($cta['kind']==='none') { return; }
    echo '<a class="'.esc_attr($class).'" href="'.esc_url($url).'"'.($external?' target="_blank" rel="noopener noreferrer"':'').'>'.esc_html($cta['label']);
    if($external){echo '<span aria-hidden="true"> ↗</span><span class="sr-only"> (mở tab mới)</span>';}
    echo '</a>';
}
function vibelab_card($item) {
    $url=get_permalink($item['id']);$cover=vibelab_cover($item);
    $kinds=array('learn'=>'Nền tảng web','skill'=>'Skill cho AI agent','starter'=>'Mẫu dự án','tool'=>'Công cụ');
    $kind=$kinds[$item['data']['resource_type']??'']??'Tài nguyên';
    $path=explode('/',trim(wp_parse_url($item['data']['source_url']??'',PHP_URL_PATH)??'','/'));
    $owner=$path[0]??'';
    $claim=$item['data']['claims']['requirements']??array();
    $requirements=($claim['verification_status']??'unknown')==='upstream_claimed'&&is_string($claim['value']??null)?'Theo nguồn: '.wp_html_excerpt($claim['value'],140,'…'):((($claim['verification_status']??'unknown')==='conflicted')?'Thông tin mâu thuẫn':'Chưa xác định');
    ?>
    <article class="resource-card" data-resource-id="<?php echo (int)$item['id']; ?>">
        <a class="card-cover" href="<?php echo esc_url($url); ?>" aria-label="<?php echo esc_attr('Xem chi tiết '.$item['title']); ?>">
        <?php if($cover){ ?><img src="<?php echo esc_url($cover); ?>" width="720" height="430" alt="Minh họa biên soạn riêng, không phải ảnh chạy thử" loading="lazy"><?php }else{ ?><span class="cover-placeholder" role="img" aria-label="Chưa có ảnh minh họa">Chưa có ảnh minh họa</span><?php } ?></a>
        <div class="card-body"><div class="card-meta"><?php echo esc_html($kind); ?> <span><?php echo esc_html(vibelab_category_name($item)); ?></span></div>
        <h3><a href="<?php echo esc_url($url); ?>"><?php echo esc_html($item['title']); ?></a></h3>
        <?php if($owner){ ?><p class="repo-owner">Chủ repo: <?php echo esc_html($owner); ?></p><?php } ?>
        <p><?php echo esc_html($item['excerpt']?:'Đọc thông tin và tình trạng nguồn trước khi lựa chọn.'); ?></p>
        <p class="card-requirements"><strong>Yêu cầu:</strong> <?php echo esc_html($requirements); ?></p>
        <div class="card-badges"><span class="badge"><?php echo esc_html($item['derived']['primary_label']); ?></span>
        <?php if($item['derived']['validation_status']==='not_tested'&&$item['derived']['primary_badge']!=='not_tested'){ ?><span class="badge">Chưa thử</span><?php } ?></div>
        <div class="card-actions"><?php vibelab_cta($item); ?><a href="<?php echo esc_url($url); ?>">Xem chi tiết</a></div></div>
    </article>
    <?php
}
// Core search is a simple baseline. Advanced discovery belongs to S09.
function vibelab_search_query($query) {
    if(!is_admin()&&$query->is_main_query()&&$query->is_search()){
        $query->set('post_type',vibelab_ready()?array('vne_resource','vne_guide','vne_practice'):array('page'));
        $query->set('post_status','publish');
    }
}
add_action('pre_get_posts','vibelab_search_query');

// Keep document/head titles on the approved public snapshot as well as body content.
function vibelab_public_title($title,$id=0) {
    if(!is_admin()&&vibelab_ready()&&in_array(get_post_type($id),array('vne_resource','vne_guide','vne_practice'),true)){
        $item=vne_library_item($id);
        return is_wp_error($item)?'Nội dung chưa công khai':$item['title'];
    }
    return $title;
}
add_filter('the_title','vibelab_public_title',10,2);
function vibelab_document_title($parts) {
    if(is_singular(array('vne_resource','vne_guide','vne_practice'))){
        $parts['title']=vibelab_public_title($parts['title']??'',get_queried_object_id());
    }
    return $parts;
}
add_filter('document_title_parts','vibelab_document_title');

require_once __DIR__.'/catalog.php';

function vibelab_image_exists($file){
    $path=get_theme_file_path($file);
    clearstatcache(true,$path);
    return is_file($path)&&is_readable($path);
}
require_once __DIR__.'/detail.php';

require_once __DIR__.'/discovery.php';

require_once __DIR__.'/lesson.php';
