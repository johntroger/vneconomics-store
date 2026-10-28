<?php if (!defined('ABSPATH')) { exit; } ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> data-vibelab-release="<?php echo esc_attr(VIBELAB_V2_RELEASE_MARKER); ?>">
<?php wp_body_open(); ?>
<a class="v2-skip-link" href="#main">Đến nội dung</a>
<header class="v2-site-header">
<div class="v2-shell v2-header-row">
<a class="v2-brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="VibeLab Việt, trang chủ"><span class="v2-brand-mark" aria-hidden="true">V</span><span>VibeLab Việt<small>Kho công cụ có biên tập</small></span></a>
<form class="v2-header-search" action="<?php echo esc_url(home_url('/')); ?>" method="get" role="search">
<input type="hidden" name="vne_find" value="1"><input type="hidden" name="scope" value="resources">
<label class="screen-reader-text" for="v2-header-query">Tìm tài nguyên</label><input id="v2-header-query" name="s" type="search" placeholder="Bạn muốn làm việc gì?" value="<?php echo esc_attr(get_search_query()); ?>"><button type="submit">Tìm</button>
</form>
<div class="v2-desktop-nav"><?php vibelab_v2_navigation(); ?></div>
<details class="v2-mobile-nav"><summary aria-label="Mở điều hướng">Menu</summary><div class="v2-mobile-panel"><?php vibelab_v2_navigation(); ?><form class="v2-header-search" action="<?php echo esc_url(home_url('/')); ?>" method="get" role="search"><input type="hidden" name="vne_find" value="1"><input type="hidden" name="scope" value="resources"><label class="screen-reader-text" for="v2-mobile-query">Tìm tài nguyên</label><input id="v2-mobile-query" name="s" type="search" placeholder="Bạn muốn làm việc gì?"><button type="submit">Tìm</button></form></div></details>
</div>
</header>
