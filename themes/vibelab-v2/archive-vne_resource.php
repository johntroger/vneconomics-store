<?php
if(!defined('ABSPATH')){exit;}
$term=is_tax('vne_category')?get_queried_object():null;
if(!$term instanceof WP_Term)$term=null;
$categories=vibelab_v2_catalog_categories();
global $wp_query;$total=(int)$wp_query->found_posts;$page=max(1,(int)get_query_var('paged'));
$first=$total?($page-1)*12+1:0;$last=$total?min($page*12,$total):0;
get_header();
?>
<main id="main" tabindex="-1">
<div class="v2-shell"><?php vibelab_v2_breadcrumb(array(array('', $term?$term->name:'Tài nguyên'))); ?>
<header class="v2-catalog-header"><h1><?php echo esc_html($term?$term->name:'Tài nguyên để khám phá'); ?></h1><p><?php echo esc_html($term&&trim($term->description)?$term->description:'Chọn theo chủ đề, sau đó đọc nguồn, điều kiện và tình trạng trước khi dùng.'); ?></p></header>
<div class="v2-catalog-layout"><aside><nav class="v2-category-nav" aria-label="Danh mục tài nguyên"><h2>Chọn danh mục</h2><ul class="v2-category-list"><li><a href="<?php echo esc_url(vibelab_v2_archive_url('vne_resource')); ?>" <?php if(!$term)echo 'aria-current="page"'; ?>><span>Tất cả tài nguyên</span><span class="v2-category-count"><?php echo (int)wp_count_posts('vne_resource')->publish; ?></span></a></li><?php foreach($categories as $category){$url=get_term_link($category);if(is_wp_error($url))continue; ?><li><a href="<?php echo esc_url($url); ?>" <?php if($term&&$term->term_id===$category->term_id)echo 'aria-current="page"'; ?>><span><?php echo esc_html($category->name); ?></span><span class="v2-category-count"><?php echo (int)$category->count; ?></span></a></li><?php } ?></ul></nav><p class="v2-catalog-note">Website miễn phí. Tài nguyên gốc có điều kiện riêng.</p></aside>
<section aria-label="Danh sách tài nguyên"><div class="v2-result-bar"><p role="status"><?php echo $total?'Hiển thị '.(int)$first.'–'.(int)$last.' trong '.(int)$total.' tài nguyên':'0 tài nguyên'; ?></p><span>Sắp theo tên</span></div>
<?php if(have_posts()){ ?><div class="v2-resource-list"><?php $index=$first;while(have_posts()){the_post();$item=vne_library_item(get_the_ID());if(!is_wp_error($item)&&!empty($item['derived']['is_public'])){vibelab_v2_resource_row($item,$index++);} } ?></div><?php vibelab_v2_pagination(); ?>
<?php }else{ ?><div class="v2-empty"><p>Chưa có tài nguyên trong mục này. Hãy chọn danh mục khác hoặc xem toàn bộ thư viện.</p></div><?php } ?>
</section></div></div>
</main>
<?php get_footer(); ?>
