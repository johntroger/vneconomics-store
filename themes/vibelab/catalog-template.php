<?php
if(!defined('ABSPATH')){exit;}
global $wp_query;
$term=get_query_var('_vibelab_catalog_term',null);
if(!$term instanceof WP_Term){$term=null;}
$total=(int)$wp_query->found_posts;$page=max(1,(int)get_query_var('paged'));
$first=$total?($page-1)*9+1:0;$last=$total?min($page*9,$total):0;
$categories=vibelab_ready()?vibelab_catalog_categories($term):array();
get_header(); ?>
<div class="container catalog-page">
<?php vibelab_catalog_breadcrumb($term); ?>
<header class="catalog-heading"><h1><?php echo esc_html($term?$term->name:'Tài nguyên để khám phá'); ?></h1>
<?php if($term&&trim($term->description)){ ?><div class="catalog-description"><?php echo wpautop(esc_html($term->description)); ?></div><?php }else{ ?><p>Chọn tài nguyên theo việc bạn muốn làm. Đọc yêu cầu và tình trạng nguồn trước khi dùng.</p><?php } ?></header>
<div class="catalog-layout"><aside class="catalog-sidebar">
<nav aria-label="Chọn danh mục"><h2>Danh mục tài nguyên</h2><ul class="catalog-categories">
<li><a href="<?php echo esc_url(vibelab_archive()); ?>" <?php if(!$term){echo 'aria-current="page"';} ?>><span>Tất cả tài nguyên</span><span class="category-count"><?php echo (int)count(vibelab_catalog_all()); ?></span></a></li>
<?php foreach($categories as $row){$category=$row['term'];$url=get_term_link($category);if(is_wp_error($url)){continue;} ?>
<li class="<?php echo $row['depth']?'category-child':''; ?>"><a href="<?php echo esc_url($url); ?>" <?php if($term&&$term->taxonomy==='vne_category'&&$term->term_id===$category->term_id){echo 'aria-current="page"';} ?>><span><?php echo esc_html($category->name); ?></span><span class="category-count"><?php echo (int)$row['count']; ?></span></a></li>
<?php } ?></ul></nav>
<p class="catalog-note">Website miễn phí.<br>Công cụ và tài nguyên gốc có điều kiện sử dụng riêng.</p></aside>
<section class="catalog-results" aria-label="Danh sách tài nguyên"><h2 class="sr-only">Danh sách tài nguyên</h2>
<div class="catalog-toolbar"><p class="result-count" role="status"><?php echo $total?'Hiển thị '.(int)$first.'–'.(int)$last.' trong '.(int)$total.' tài nguyên':'0 tài nguyên'; ?></p><span>Theo tên tài nguyên</span></div>
<?php if($total){ ?><div class="resource-grid">
<?php while(have_posts()){the_post();$item=vne_library_item(get_the_ID());if(!is_wp_error($item)&&!empty($item['derived']['is_public'])){vibelab_card($item);} } ?>
</div><?php vibelab_catalog_pagination(); ?>
<?php }else{ ?><div class="empty-state"><h2>Chưa có tài nguyên trong mục này</h2><p>Nội dung đang được chuẩn bị. Hãy quay lại sau hoặc tiếp tục khám phá website.</p><a class="button" href="<?php echo esc_url($term?vibelab_archive():home_url('/')); ?>"><?php echo $term?'Xem tất cả tài nguyên':'Về trang chủ'; ?></a></div><?php } ?>
</section></div></div><?php get_footer(); ?>
