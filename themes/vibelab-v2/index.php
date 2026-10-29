<?php if (!defined('ABSPATH')) { exit; } get_header(); ?>
<main id="main" class="v2-shell v2-reading" tabindex="-1">
<?php if(have_posts()){while(have_posts()){the_post(); ?><article><h1><?php the_title(); ?></h1><div><?php the_content(); ?></div></article><?php }}else{ ?><h1>Chưa tìm thấy nội dung</h1><p>Thử tìm với cụm từ ngắn hơn hoặc quay lại <a href="<?php echo esc_url(home_url('/')); ?>">trang chủ</a>.</p><?php } ?>
</main>
<?php get_footer(); ?>
