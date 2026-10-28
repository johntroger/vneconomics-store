<?php
if (!defined('ABSPATH')) { exit; }
$items=array_merge(vibelab_v2_library_items('vne_guide',-1),vibelab_v2_library_items('vne_practice',-1));
$search=vibelab_v2_is_guide_search();$error='';$keyword='';
if ($search) {
    if (isset($_GET['s']) && !is_string($_GET['s'])) { $error='Từ khóa không đúng định dạng.'; }
    else {
        $keyword=trim(wp_unslash($_GET['s']??''));
        if (strlen($keyword)>640 || wp_check_invalid_utf8($keyword)!==$keyword || preg_match_all('/./us',$keyword)>160) { $error='Từ khóa tối đa 160 ký tự.'; $keyword=''; }
        else { $keyword=sanitize_text_field($keyword); if ($keyword!=='' && vibelab_v2_search_fold($keyword)==='') { $error='Hãy nhập chữ hoặc số để tìm kiếm.'; } }
    }
    $needle=vibelab_v2_search_fold($keyword);
    $items=$error?array():array_values(array_filter($items,function($item) use ($needle) { return vibelab_v2_search_score($item,$needle)>=0; }));
}
$groups=array();foreach ($items as $item) { $name=vibelab_v2_category_name($item);$groups[$name][]=$item; }ksort($groups,SORT_NATURAL|SORT_FLAG_CASE);
get_header(); ?>
<main id="main" tabindex="-1"><div class="v2-shell">
<?php vibelab_v2_breadcrumb(array(array('','Hướng dẫn'))); ?>
<header class="v2-catalog-header"><h1>Hướng dẫn và thực hành</h1><p>Chọn một mục tiêu, đọc phần chuẩn bị và làm từng bước theo hướng dẫn.</p></header>
<section class="v2-section" aria-labelledby="v2-guides-title"><h2 id="v2-guides-title">Chọn bài phù hợp</h2>
<form class="v2-guide-search" role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>"><input type="hidden" name="vne_find" value="1"><input type="hidden" name="scope" value="guides"><label for="v2-guide-query">Tìm trong hướng dẫn</label><div><input id="v2-guide-query" name="s" type="search" value="<?php echo esc_attr($keyword); ?>" placeholder="Nhập mục tiêu hoặc từ khóa"><button type="submit">Tìm hướng dẫn</button></div></form>
<?php if ($search && !$error) { ?><p role="status"><?php echo (int)count($items); ?> hướng dẫn phù hợp<?php if ($keyword!=='') echo ' với “'.esc_html($keyword).'”'; ?>.</p><?php } ?>
<?php if ($error) { ?><div class="v2-empty" role="alert"><p><?php echo esc_html($error); ?></p><a href="<?php echo esc_url(vibelab_v2_archive_url('vne_guide')); ?>">Đặt lại tìm kiếm</a></div><?php } elseif ($items) { $index=0;foreach ($groups as $name=>$group) { ?><section class="v2-guide-group"><h3><?php echo esc_html($name); ?></h3><div class="v2-resource-list"><?php foreach ($group as $item) { $index++; ?><article class="v2-guide-row"><span aria-hidden="true"><?php echo esc_html(str_pad((string)$index,2,'0',STR_PAD_LEFT)); ?></span><div><p class="v2-guide-kind"><?php echo $item['post_type']==='vne_practice'?'Bộ thực hành':'Hướng dẫn'; ?></p><h4><a href="<?php echo esc_url(get_permalink($item['id'])); ?>"><?php echo esc_html($item['title']); ?></a></h4><p><?php echo esc_html($item['excerpt']); ?></p></div><span class="v2-status"><?php echo esc_html($item['derived']['primary_label']); ?></span></article><?php } ?></div></section><?php } } else { ?><div class="v2-empty"><p><?php echo $search?'Chưa có hướng dẫn phù hợp. Hãy thử từ khóa ngắn hơn.':'Chưa có hướng dẫn công khai.'; ?></p><a href="<?php echo esc_url($search?vibelab_v2_archive_url('vne_guide'):vibelab_v2_archive_url()); ?>"><?php echo $search?'Xem tất cả hướng dẫn':'Xem tài nguyên'; ?></a></div><?php } ?>
</section></div></main><?php get_footer(); ?>
