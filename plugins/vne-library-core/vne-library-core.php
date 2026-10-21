<?php
/**
 * Plugin Name: Vneconomics Library Core
 * Description: Nhập tay tài nguyên, hướng dẫn và nguồn có kiểm tra dữ liệu/quyền.
 * Version: 0.1.0
 * Requires PHP: 8.1
 * Text Domain: vne-library-core
 */
if (!defined('ABSPATH')) { exit; }
define('VNE_LIBRARY_VERSION', '0.1.0');
require_once __DIR__ . '/model.php';
require_once __DIR__ . '/admin.php';
require_once __DIR__ . '/api.php';
add_action('init', 'vne_library_register_types');
add_action('admin_menu', 'vne_library_admin_menu');
add_action('admin_init', 'vne_library_admin_preflight');
add_action('rest_api_init', 'vne_library_register_routes');
add_filter('wp_insert_post_data', 'vne_library_publication_guard', 10, 4);
register_activation_hook(__FILE__, 'vne_library_activate');
register_deactivation_hook(__FILE__, function () { flush_rewrite_rules(false); });
