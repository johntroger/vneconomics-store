<?php
if (!defined('ABSPATH')) { exit; }

define('VIBELAB_V2_VERSION', '2.0.0-alpha.4');
define('VIBELAB_V2_CONTRACT_VERSION', '1');
define('VIBELAB_V2_RELEASE_MARKER', 'r33-guides-local');

require_once __DIR__.'/inc/contract.php';
require_once __DIR__.'/inc/components.php';
require_once __DIR__.'/inc/catalog.php';
require_once __DIR__.'/inc/search.php';
require_once __DIR__.'/inc/detail.php';
require_once __DIR__.'/inc/guides.php';
require_once __DIR__.'/inc/seo.php';

function vibelab_v2_setup() {
    add_theme_support('title-tag');
    add_theme_support('html5', array('search-form', 'gallery', 'caption', 'style', 'script'));
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
}
add_action('after_setup_theme', 'vibelab_v2_setup');

function vibelab_v2_assets() {
    wp_enqueue_style('vibelab-v2', get_stylesheet_uri(), array(), VIBELAB_V2_VERSION);
}
add_action('wp_enqueue_scripts', 'vibelab_v2_assets');

function vibelab_v2_release_meta() {
    echo '<meta name="vibelab-release" content="'.esc_attr(VIBELAB_V2_RELEASE_MARKER).'">'."\n";
    echo '<meta name="vibelab-contract" content="'.esc_attr(VIBELAB_V2_CONTRACT_VERSION).'">'."\n";
}
add_action('wp_head', 'vibelab_v2_release_meta', 1);

function vibelab_v2_body_classes($classes) {
    $classes[]='vibelab-v2';
    $classes[]='vibelab-release-'.sanitize_html_class(VIBELAB_V2_RELEASE_MARKER);
    return $classes;
}
add_filter('body_class', 'vibelab_v2_body_classes');

// The foundation deliberately has no theme-side writes or scheduled work.
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_enqueue_scripts', 'wp_enqueue_emoji_styles');
remove_action('wp_print_styles', 'print_emoji_styles');
