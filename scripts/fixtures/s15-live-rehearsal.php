<?php
// Private WP-CLI tooling. No production target, schema downgrade, external HTTP or email.
if (!defined('S15_LIVE_TEST') && (!defined('WP_CLI') || !WP_CLI || !defined('ABSPATH'))) { exit(1); }
function s15_live_check($value, $message) { if (!$value) { throw new RuntimeException($message); } }
function s15_live_inventory($root) {
    s15_live_check(is_dir($root) && !is_link($root), 'Invalid tree root'); $out = array();
    $walk = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($walk as $file) {
        s15_live_check(!$file->isLink(), 'Tree contains a link');
        if ($file->isFile()) { $out[str_replace('\\', '/', substr($file->getPathname(), strlen($root)+1))] = hash_file('sha256', $file->getPathname()); }
    }
    ksort($out); return $out;
}
function s15_live_source_hashes($source) { $out = array_map(fn($v)=>hash('sha256', $v), $source); ksort($out); return $out; }
function s15_live_write_tree($root, $source) {
    s15_live_check(!file_exists($root) && !is_link($root), 'Refuse existing recovery tree');
    foreach ($source as $name=>$bytes) {
        s15_live_check(preg_match('~^[a-z0-9][a-z0-9_./-]*$~D', $name) && !str_contains($name, '..') && !str_contains($name, '//'), 'Unsafe source path');
    }
    s15_live_check(mkdir($root, 0700), 'Create recovery tree failed');
    foreach ($source as $name=>$bytes) {
        $path = $root.'/'.$name; if (!is_dir(dirname($path))) { s15_live_check(mkdir(dirname($path), 0755, true), 'Create source directory failed'); }
        s15_live_check(file_put_contents($path, $bytes, LOCK_EX) === strlen($bytes), 'Write recovery file failed'); chmod($path, 0644);
    }
    chmod($root, 0755); s15_live_check(s15_live_inventory($root) === s15_live_source_hashes($source), 'Prepared recovery hash differs');
}
function s15_live_invalidate($root) {
    $count = 0; if (function_exists('opcache_invalidate')) {
        foreach (array_keys(s15_live_inventory($root)) as $name) { if (str_ends_with($name, '.php')) { if (@opcache_invalidate($root.'/'.$name, true)) { $count++; } } }
    }
    return $count;
}
function s15_live_fault($live, $expected, $id, $token, $expires) {
    s15_live_check(preg_match('/^[a-f0-9]{32}$/D', $id) && preg_match('/^[a-f0-9]{32}$/D', $token), 'Invalid probe identity');
    s15_live_check(s15_live_inventory($live) === $expected, 'Live theme changed before fault');
    $original = file_get_contents($live.'/functions.php'); s15_live_check(str_starts_with($original, '<?php'), 'Unexpected theme entry');
    $prefix = '<?php if ((!defined("WP_CLI") || !WP_CLI) && time() < '.(int)$expires.' && ($_SERVER["REQUEST_METHOD"] ?? "") === "GET" && parse_url($_SERVER["REQUEST_URI"] ?? "", PHP_URL_PATH) === "/" && hash_equals("'.$token.'", $_SERVER["HTTP_X_S15_THEME_FAULT"] ?? "")) { ini_set("display_errors","0"); add_filter("pre_wp_mail",function(){return false;},PHP_INT_MAX); add_filter("pre_http_request",function(){return new WP_Error("s15_theme_no_network","Blocked in theme test request");},PHP_INT_MAX); throw new RuntimeException("S15 scoped active-theme failure"); } ';
    $bytes = $prefix.substr($original, 5); token_get_all($bytes, TOKEN_PARSE);
    $temp = $live.'/.s15-next-'.$id; $extra = $live.'/s15-obsolete-'.$id.'.txt';
    s15_live_check(!file_exists($temp) && !file_exists($extra), 'Fault fixture collision');
    $installed = false;
    try {
        $h = fopen($temp, 'x'); s15_live_check($h !== false, 'Create next entry failed');
        $written = fwrite($h, $bytes); fclose($h); s15_live_check($written === strlen($bytes), 'Incomplete fault entry'); chmod($temp, 0644);
        s15_live_check(file_put_contents($extra, $id, LOCK_EX) === strlen($id), 'Extra fixture failed');
        s15_live_check(rename($temp, $live.'/functions.php'), 'Atomic fault entry swap failed'); $installed = true;
    } finally {
        if (is_file($temp)) { unlink($temp); }
        if (!$installed && is_file($extra) && file_get_contents($extra) === $id) { unlink($extra); }
    }
    s15_live_invalidate($live); return s15_live_inventory($live);
}
function s15_live_restore($live, $ready, $failed, $expected) {
    s15_live_check(is_dir($live) && !is_link($live) && !file_exists($failed) && !is_link($failed), 'Unsafe restore paths');
    s15_live_check(s15_live_inventory($ready) === $expected, 'Recovery tree hash differs');
    s15_live_check(rename($live, $failed), 'Quarantine live theme failed');
    if (!rename($ready, $live)) {
        s15_live_check(rename($failed, $live), 'Restore and reverse rename both failed');
        throw new RuntimeException('Recovery swap failed; original tree returned');
    }
    s15_live_invalidate($live); s15_live_check(s15_live_inventory($live) === $expected, 'Restored live theme hash differs');
    return s15_live_inventory($failed);
}
function s15_live_remove_failed($work, $hashes) {
    // On Windows and Linux, resolve the exact owned target before recursive file operations.
    $base = realpath($work); $root = realpath($work.'/failed');
    s15_live_check($base !== false && preg_match('/^s15-live-[a-f0-9]{32}$/D', basename($base)) && !is_link($work), 'Invalid owned work directory');
    s15_live_check($root !== false && dirname($root) === $base && basename($root) === 'failed' && !is_link($work.'/failed'), 'Cleanup target escaped work');
    s15_live_check(s15_live_inventory($root) === $hashes, 'Failed tree ownership changed');
    foreach (array_keys($hashes) as $name) { s15_live_check(unlink($root.'/'.$name), 'Failed tree file cleanup failed'); }
    $walk = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($walk as $entry) { s15_live_check($entry->isDir() && !$entry->isLink() && rmdir($entry->getPathname()), 'Unexpected leftover in failed tree'); }
    s15_live_check(rmdir($root), 'Failed tree cleanup incomplete');
}
function s15_live_activation($observerRead) {
    global $wpdb, $wp_filter;
    require_once ABSPATH.'wp-admin/includes/plugin.php'; $plugin = 'vne-library-core/vne-library-core.php';
    s15_live_check(!is_multisite(), 'Activation test requires single site');
    s15_live_check(!wp_is_recovery_mode(), 'Activation test refuses recovery mode');
    s15_live_check(!wp_using_ext_object_cache(), 'Activation test refuses external object cache');
    s15_live_check(is_plugin_active($plugin), 'Activation test requires active VNE plugin');
    $raw = $wpdb->get_var($wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name=%s", 'active_plugins'));
    $theme = get_stylesheet(); $schema = get_option('vne_library_schema_version'); $level = ob_get_level();
    $generic = $wp_filter['activate_plugin'] ?? null; unset($wp_filter['activate_plugin']);
    $throw = function() { throw new RuntimeException('S15 expected activation hook failure'); };
    $mail = fn()=>false; $http = fn()=>new WP_Error('s15_activation_no_network', 'Blocked in activation test');
    add_filter('pre_wp_mail', $mail, PHP_INT_MAX); add_filter('pre_http_request', $http, PHP_INT_MAX);
    add_action('activate_'.$plugin, $throw, PHP_INT_MIN); $started = false; $result = null;
    try {
        s15_live_check($wpdb->query('BEGIN') !== false, 'Transaction start failed'); $started = true;
        deactivate_plugins($plugin, true, false); s15_live_check(!is_plugin_active($plugin), 'Transaction did not deactivate target');
        $externalBefore = $observerRead(); s15_live_check($externalBefore === $raw, 'Uncommitted deactivation became externally visible');
        $caught = false;
        try { activate_plugin($plugin, '', false, false); }
        catch (RuntimeException $failure) { $caught = $failure->getMessage() === 'S15 expected activation hook failure'; }
        s15_live_check($caught && !is_plugin_active($plugin), 'Expected activation failure not observed');
        s15_live_check(get_stylesheet() === $theme && get_option('vne_library_schema_version') === $schema, 'Theme/schema changed after activation failure');
        s15_live_check($observerRead() === $raw, 'Failed activation changed externally visible plugin option');
        $result = array('expectedActivationFailureCaught'=>true, 'failedPluginInactiveInsideTransaction'=>true,
            'otherConnectionSawOriginalActivePlugins'=>true, 'themeAttempted'=>false, 'schemaUnchanged'=>true);
    } finally {
        if ($started) { s15_live_check($wpdb->query('ROLLBACK') !== false, 'Transaction rollback failed'); }
        while (ob_get_level() > $level) { ob_end_clean(); }
        remove_action('activate_'.$plugin, $throw, PHP_INT_MIN);
        if ($generic !== null) { $wp_filter['activate_plugin'] = $generic; }
        remove_filter('pre_wp_mail', $mail, PHP_INT_MAX); remove_filter('pre_http_request', $http, PHP_INT_MAX);
        wp_cache_delete('active_plugins', 'options'); wp_cache_delete('alloptions', 'options'); wp_cache_delete('notoptions', 'options');
    }
    s15_live_check(is_plugin_active($plugin) && $wpdb->get_var($wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name=%s", 'active_plugins')) === $raw, 'Active plugins not restored');
    $result['activePluginsRestored'] = true; $result['transactionRolledBack'] = true; return $result;
}
if (defined('S15_LIVE_TEST')) { return; }

s15_live_check(ABSPATH === '/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/' && DB_NAME === 'vne35060_wp_udx1z' &&
    home_url() === 'https://staging-store.vneconomics.com' && (int)get_option('blog_public') === 0 && defined('VNE_LIBRARY_VERSION') &&
    VNE_LIBRARY_VERSION === '0.4.2' && (int)get_option('vne_library_schema_version') === 3 && get_stylesheet() === 'vibelab', 'Wrong staging target or pair');
$key = 'vne_s15_live_rehearsal'; $mode = $args[0] ?? 'status'; $live = get_theme_root().'/vibelab';
$manifestPath = '/var/www/vhosts/vneconomics.com/s15-release/manifest.json';
s15_live_check(hash_file('sha256', $manifestPath) === '985b5286324e301925abc0369ef0bc47ff8a2ea3c8252c6f569508da74b08a0c', 'Manifest hash differs');
$manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR); $expected = array();
foreach ($manifest['components']['theme']['files'] as $entry) { $expected[substr($entry['path'], 8)] = $entry['sha256']; } ksort($expected);
foreach ($manifest['components']['plugin']['files'] as $entry) { s15_live_check(hash_file('sha256', WP_PLUGIN_DIR.'/'.$entry['path']) === $entry['sha256'], 'Live plugin differs'); }
if ($mode === 'activation') {
    global $wpdb;
    s15_live_check(strtolower($wpdb->get_var($wpdb->prepare('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s', DB_NAME, $wpdb->options))) === 'innodb', 'Options must be transactional');
    s15_live_check(s15_live_inventory($live) === $expected, 'Theme differs before activation test');
    $observer = new wpdb(DB_USER, DB_PASSWORD, DB_NAME, DB_HOST);
    try { $result = s15_live_activation(fn()=>$observer->get_var($wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name=%s", 'active_plugins'))); }
    finally { $observer->close(); }
    $result['themeFilesUnchanged'] = s15_live_inventory($live) === $expected;
} elseif ($mode === 'prepare') {
    s15_live_check(get_option($key, false) === false && s15_live_inventory($live) === $expected, 'Existing rehearsal or changed theme');
    $backup = '/var/www/vhosts/vneconomics.com/wordpress-backups/staging-store.vneconomics.com__2026-10-24T09_59_46+0700.zip';
    s15_live_check(hash_file('sha256', $backup) === 'f25d308309091275deb1d9036b40507af91a1443640b8a5fa0c7b28accdbfce7', 'Backup hash differs');
    $zip = new ZipArchive(); s15_live_check($zip->open($backup) === true, 'Backup cannot open'); $source = array();
    try { foreach ($expected as $name=>$hash) { $bytes = $zip->getFromName('files/wp-content/themes/vibelab/'.$name); s15_live_check(is_string($bytes) && hash('sha256', $bytes) === $hash, 'Recovery source differs'); $source[$name] = $bytes; } }
    finally { $zip->close(); }
    $id = bin2hex(random_bytes(16)); $work = '/var/www/vhosts/vneconomics.com/s15-release/s15-live-'.$id;
    s15_live_check(mkdir($work, 0700), 'Cannot create work directory');
    $state = array('id'=>$id, 'work'=>$work, 'phase'=>'preparing', 'expected'=>$expected, 'activePluginsHash'=>hash('sha256', wp_json_encode(get_option('active_plugins'))),
        'themeModsHash'=>hash('sha256', wp_json_encode(get_option('theme_mods_vibelab'))));
    s15_live_check(add_option($key, $state, '', false), 'Registry ownership collision');
    try { s15_live_write_tree($work.'/ready', $source); }
    catch (Throwable $failure) {
        if (is_dir($work.'/ready') && !is_link($work.'/ready')) {
            $partial = s15_live_inventory($work.'/ready');
            foreach ($partial as $name=>$hash) { s15_live_check(isset($expected[$name]) && $expected[$name] === $hash, 'Unexpected partial recovery file; retained for review'); }
            s15_live_check(rename($work.'/ready', $work.'/failed'), 'Partial recovery cleanup rename failed'); s15_live_remove_failed($work, $partial);
        }
        s15_live_check(rmdir($work), 'Partial work directory cleanup failed'); delete_option($key); throw $failure;
    }
    $state['phase'] = 'prepared'; update_option($key, $state, false);
    $result = array('id'=>$id, 'phase'=>'prepared', 'themeFiles'=>count($expected), 'readyOutsideWebroot'=>true);
} elseif (in_array($mode, array('fault','restore'), true)) {
    $state = get_option($key); s15_live_check(is_array($state) && ($args[1] ?? '') === $state['id'] &&
        $state['work'] === '/var/www/vhosts/vneconomics.com/s15-release/s15-live-'.$state['id'] && $state['expected'] === $expected, 'Rehearsal ownership differs');
    if ($mode === 'fault') {
        s15_live_check($state['phase'] === 'prepared', 'Fault requires prepared recovery'); $token = bin2hex(random_bytes(16)); $expires = time()+600;
        $state['phase'] = 'installing-fault'; update_option($key, $state, false);
        $state['faultHashes'] = s15_live_fault($live, $expected, $state['id'], $token, $expires); $state['phase'] = 'fault-installed'; update_option($key, $state, false);
        $result = array('id'=>$state['id'], 'phase'=>'fault-installed', 'token'=>$token, 'expires'=>$expires, 'normalRequestsUnaffectedByCondition'=>true);
    } else {
        s15_live_check(in_array($state['phase'], array('installing-fault','fault-installed','live-restored'), true), 'Restore requires a faulted theme');
        if ($state['phase'] !== 'live-restored') {
            $state['failedHashes'] = s15_live_restore($live, $state['work'].'/ready', $state['work'].'/failed', $expected);
            $state['phase'] = 'live-restored'; update_option($key, $state, false);
        }
        s15_live_check(s15_live_inventory($live) === $expected, 'Live theme changed during recovery cleanup'); $failedHashes = $state['failedHashes'];
        $archivePath = $state['work'].'/faulty-theme-evidence.zip'; $zip = new ZipArchive();
        if (!file_exists($archivePath)) {
            s15_live_check($zip->open($archivePath, ZipArchive::CREATE | ZipArchive::EXCL) === true, 'Cannot archive failed tree');
            foreach ($failedHashes as $name=>$hash) { s15_live_check($zip->addFile($state['work'].'/failed/'.$name, 'vibelab/'.$name), 'Archive failed tree entry failed'); }
            s15_live_check($zip->close(), 'Close failed tree archive failed');
        }
        s15_live_check($zip->open($archivePath) === true && $zip->numFiles === count($failedHashes), 'Failed archive incomplete; preserved for review');
        foreach ($failedHashes as $name=>$hash) { s15_live_check(hash('sha256', $zip->getFromName('vibelab/'.$name)) === $hash, 'Failed archive hash differs'); } $zip->close();
        if (is_dir($state['work'].'/failed')) { s15_live_remove_failed($state['work'], $failedHashes); }
        s15_live_check(hash('sha256', wp_json_encode(get_option('active_plugins'))) === $state['activePluginsHash'] &&
            hash('sha256', wp_json_encode(get_option('theme_mods_vibelab'))) === $state['themeModsHash'], 'Plugin list or theme settings changed');
        $result = array('id'=>$state['id'], 'phase'=>'restored', 'restoredThemeFiles'=>count($expected), 'obsoleteFileAbsent'=>!file_exists($live.'/s15-obsolete-'.$state['id'].'.txt'),
            'activePluginsUnchanged'=>true, 'themeModsUnchanged'=>true, 'schema'=>get_option('vne_library_schema_version'), 'faultyArchive'=>$archivePath,
            'faultyArchiveSha256'=>hash_file('sha256', $archivePath), 'failedTreeCleaned'=>!file_exists($state['work'].'/failed'));
        s15_live_check(delete_option($key), 'Registry cleanup failed'); $result['registryRemoved'] = get_option($key, false) === false;
        file_put_contents($state['work'].'/receipt.json', wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
} else { $result = array('phase'=>(get_option($key)['phase'] ?? 'none'), 'themeHashesMatch'=>s15_live_inventory($live) === $expected); }
echo 'S15_LIVE_RESULT ', wp_json_encode($result, JSON_UNESCAPED_SLASHES), PHP_EOL;
