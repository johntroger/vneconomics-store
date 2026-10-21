<?php if (!defined('ABSPATH')) { exit; } $guide=vibelab_guide(); ?>
<!doctype html>
<html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>><?php wp_body_open(); ?><a class="skip-link" href="#main">Đến nội dung</a>
<header class="site-header"><div class="container header-main">
<a class="brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="VibeLab Việt, trang chủ"><span class="brand-mark" aria-hidden="true">vl</span><span>VibeLab Việt<small>Kho tài nguyên để bắt đầu</small></span></a>
<form class="header-search" action="<?php echo esc_url(home_url('/')); ?>" method="get" role="search"><label class="sr-only" for="global-search">Tìm tài nguyên</label><input id="global-search" name="s" placeholder="Bạn muốn làm được việc gì?" type="search" value="<?php echo esc_attr(get_search_query()); ?>"><button type="submit">Tìm</button></form>
<a class="start-link" href="<?php echo esc_url($guide?get_permalink($guide['id']):home_url('/#bat-dau')); ?>">Tôi mới bắt đầu</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button></div>
<nav id="main-nav" class="container site-nav" aria-label="Điều hướng chính" data-open="false">
<?php if(has_nav_menu('primary')){wp_nav_menu(array('theme_location'=>'primary','container'=>false,'menu_class'=>'custom-menu','depth'=>2,'fallback_cb'=>false));}else{ ?>
<a href="<?php echo esc_url(home_url('/')); ?>" <?php if(is_front_page()){echo 'aria-current="page"';} ?>>Trang chủ</a>
<a href="<?php echo esc_url(vibelab_archive()); ?>">Tài nguyên</a>
<a href="<?php echo esc_url(vibelab_archive('vne_guide')); ?>">Hướng dẫn thực hành</a>
<a href="<?php echo esc_url(home_url('/#cach-chon')); ?>">Cách chúng tôi tuyển chọn</a>
<?php } ?></nav></header><main id="main" tabindex="-1">
