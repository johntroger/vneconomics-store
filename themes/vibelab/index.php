<?php
if(!defined('ABSPATH')){exit;}
get_header(); ?>
<div class="container simple-page">
<?php if(is_singular(array('post','page'))){
    while(have_posts()){the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class('legacy-content'); ?>>
        <h1><?php echo esc_html(get_the_title()); ?></h1>
        <div class="reading"><?php the_content(); wp_link_pages(array('before'=>'<nav class="pager" aria-label="Các phần của bài viết">','after'=>'</nav>')); ?></div>
    </article>
    <?php }
}elseif(is_singular()&&vibelab_ready()){
    $item=vne_library_item(get_queried_object_id());
    if(!is_wp_error($item)){ ?>
    <a href="<?php echo esc_url(home_url('/#tai-nguyen')); ?>">Về trang chủ</a><h1><?php echo esc_html($item['title']); ?></h1><p><?php echo esc_html($item['excerpt']); ?></p><div class="reading"><?php echo wp_kses_post($item['content']); ?></div>
    <section id="tinh-trang" class="state-panel"><h2>Tình trạng và nguồn</h2><p><?php echo esc_html($item['derived']['primary_label']); ?></p>
    <?php if(!empty($item['derived']['recommendation_reason'])){ ?><p><?php echo esc_html($item['derived']['recommendation_reason']); ?></p><?php } ?>
    <ul><?php foreach($item['derived']['warnings'] as $warning){ ?><li><?php echo esc_html($warning['message']); ?></li><?php } ?></ul>
    <?php if($item['derived']['cta']['kind']==='source'){vibelab_cta($item);} ?>
    </section>
    <?php }else{ ?><h1>Nội dung chưa có trong thư viện</h1><p><a href="<?php echo esc_url(home_url('/')); ?>">Về trang chủ</a> để tìm tài nguyên công khai.</p><?php }
}else{ ?>
<h1><?php echo esc_html(is_search()?'Kết quả tìm kiếm: '.get_search_query():(is_404()?'Không tìm thấy trang':(is_tax()?single_term_title('',false):post_type_archive_title('',false)))); ?></h1>
<?php $shown=0; ?><ul class="simple-list">
<?php while(have_posts()){the_post();$item=vibelab_ready()?vne_library_item(get_the_ID()):null;
if(!$item||is_wp_error($item)||empty($item['derived']['is_public'])){continue;}$shown++; ?>
<li><h2><a href="<?php echo esc_url(get_permalink($item['id'])); ?>"><?php echo esc_html($item['title']); ?></a></h2><p><?php echo esc_html($item['excerpt']); ?></p><span class="badge"><?php echo esc_html($item['derived']['primary_label']); ?></span></li>
<?php } ?></ul>
<?php if(!$shown){ ?><p>Chưa tìm thấy nội dung phù hợp. Thử từ khóa khác hoặc <a href="<?php echo esc_url(home_url('/')); ?>">về trang chủ</a>.</p><?php } ?>
<div class="pager"><?php previous_posts_link('Trang trước');next_posts_link('Trang tiếp'); ?></div>
<?php } ?></div><?php get_footer(); ?>
