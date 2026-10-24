<?php
// Disposable, request-scoped staging MU fixture. Placeholders are rendered by the guarded installer.
if (!defined('ABSPATH') || ABSPATH !== '/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/' ||
    !defined('DB_NAME') || DB_NAME !== 'vne35060_wp_udx1z' ||
    (defined('WP_CLI') && WP_CLI) || (int)get_option('blog_public') !== 0 || time() >= __S15_EXPIRES__) { return; }
$s15FaultPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET' || $s15FaultPath !== '/wp-json/vne-library/v1/items') { return; }
$s15FaultHeader = explode('.', $_SERVER['HTTP_X_S15_FAULT'] ?? '', 2);
if (count($s15FaultHeader) !== 2 || !in_array($s15FaultHeader[0], array('missing','error','slow'), true) ||
    !hash_equals('__S15_TOKEN__', $s15FaultHeader[1])) { return; }
$s15FaultMode = $s15FaultHeader[0];
add_filter('pre_wp_mail', function() { return false; }, PHP_INT_MAX);
add_filter('pre_http_request', function() { return new WP_Error('s15_probe_no_network', 'External HTTP blocked in this fixture request'); }, PHP_INT_MAX);
register_shutdown_function(function() use ($s15FaultMode) {
    file_put_contents('__S15_LOG__', json_encode(array('mode'=>$s15FaultMode, 'finishedAt'=>time(),
        'libraryLoaded'=>defined('VNE_LIBRARY_VERSION'))) . PHP_EOL, FILE_APPEND | LOCK_EX);
});
if ($s15FaultMode === 'missing') {
    add_filter('option_active_plugins', function($plugins) {
        return array_values(array_diff($plugins, array('vne-library-core/vne-library-core.php')));
    }, PHP_INT_MAX);
} elseif ($s15FaultMode === 'error') {
    ini_set('display_errors', '0');
    add_action('plugins_loaded', function() { throw new RuntimeException('S15 disposable plugin-load failure'); }, 0);
} else {
    add_action('plugins_loaded', function() { usleep(2000000); }, 0);
}
