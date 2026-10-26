<?php
// CLI-only rehearsal. Candidate files are damaged only in a newly owned directory outside web roots.
if (!defined('VNE_S15_ROLLBACK_TEST') && (!defined('WP_CLI') || !WP_CLI || !defined('ABSPATH'))) { exit(1); }

function s15_rb_name($name) {
    if (!is_string($name) || !preg_match('~^[a-z0-9][a-z0-9_./-]*$~D', $name) ||
        str_contains($name, '..') || str_contains($name, '//')) {
        throw new RuntimeException('Unsafe candidate name');
    }
    return $name;
}
function s15_rb_put($root, $name, $bytes, &$owned) {
    s15_rb_name($name);
    if (!is_dir($root) || is_link($root)) { throw new RuntimeException('Invalid owned root'); }
    $parts = explode('/', $name); array_pop($parts); $dir = $root;
    foreach ($parts as $part) {
        $dir .= '/'.$part;
        if (is_link($dir)) { throw new RuntimeException('Refuse directory link'); }
        if (!is_dir($dir)) {
            if (file_exists($dir) || !mkdir($dir, 0700)) { throw new RuntimeException('Cannot create owned directory'); }
            $owned['dirs'][] = $dir;
        }
    }
    $path = $root.'/'.$name;
    if (is_link($path) || (file_exists($path) && !in_array($path, $owned['files'], true))) {
        throw new RuntimeException('Refuse unowned file');
    }
    if (!in_array($path, $owned['files'], true)) { $owned['files'][] = $path; }
    if (file_put_contents($path, $bytes, LOCK_EX) !== strlen($bytes)) { throw new RuntimeException('Incomplete file write'); }
}
function s15_rb_clear($root, &$owned) {
    $real = realpath($root);
    if ($real === false || is_link($root)) { throw new RuntimeException('Cleanup root changed'); }
    foreach (array_reverse($owned['files']) as $file) {
        if (!str_starts_with($file, $root.'/') || is_link($file)) { throw new RuntimeException('Cleanup ownership changed'); }
        if (file_exists($file) && (realpath(dirname($file)) === false ||
            !str_starts_with(realpath($file), $real.DIRECTORY_SEPARATOR))) {
            throw new RuntimeException('Cleanup escaped owned directory');
        }
        if (is_file($file) && !unlink($file)) { throw new RuntimeException('Owned file cleanup failed'); }
    }
    foreach (array_reverse($owned['dirs']) as $dir) {
        if (!str_starts_with($dir, $root.'/') || is_link($dir) || (is_dir($dir) && !rmdir($dir))) {
            throw new RuntimeException('Owned directory cleanup failed');
        }
    }
    $owned = array('files'=>array(), 'dirs'=>array());
}
function s15_rb_hashes($root, $source) {
    $out = array();
    foreach ($source as $name=>$bytes) {
        s15_rb_name($name); $path = $root.'/'.$name;
        $out[$name] = is_file($path) && !is_link($path) ? hash_file('sha256', $path) : null;
    }
    return $out;
}
function s15_rb_gate($confirmed, $elapsedMs, $budgetMs) {
    return $confirmed === true && $elapsedMs <= $budgetMs ? 'PLUGIN_CONFIRMED' : 'STOP_PLUGIN_KEEP_THEME';
}
function s15_rb_run($parent, $source) {
    if (!is_dir($parent) || is_link($parent)) { throw new RuntimeException('Invalid rehearsal parent'); }
    foreach ($source as $name=>$bytes) { s15_rb_name($name); }
    if (!isset($source['plugin/vne-library-core.php'], $source['theme/functions.php'])) { throw new RuntimeException('Incomplete source pair'); }
    $root = $parent.'/s15-rollback-'.bin2hex(random_bytes(12));
    if (file_exists($root) || !mkdir($root, 0700)) { throw new RuntimeException('Cannot create rehearsal root'); }
    $owned = array('files'=>array(), 'dirs'=>array()); $checks = array(); $error = null; $cleanup = false;
    $check = function($value, $label) use (&$checks) { if (!$value) { throw new RuntimeException($label); } $checks[] = $label; };
    try {
        foreach ($source as $name=>$bytes) { s15_rb_put($root, $name, $bytes, $owned); }
        $expected = array_map(fn($v)=>hash('sha256', $v), $source);
        $check(s15_rb_hashes($root, $source) === $expected, 'isolated candidate matches verified source');
        $themeBefore = array_filter($expected, fn($key)=>str_starts_with($key, 'theme/'), ARRAY_FILTER_USE_KEY);
        $check(s15_rb_gate(true, 1, 50) === 'PLUGIN_CONFIRMED', 'timely confirmation accepted');
        $check(s15_rb_gate(false, 1, 50) === 'STOP_PLUGIN_KEEP_THEME', 'failed plugin confirmation blocks theme');
        $check(s15_rb_gate(null, 1, 50) === 'STOP_PLUGIN_KEEP_THEME', 'missing acknowledgement blocks theme');
        s15_rb_put($root, 'plugin/vne-library-core.php', '<?php if (', $owned);
        $parseFailed = false;
        try { token_get_all(file_get_contents($root.'/plugin/vne-library-core.php'), TOKEN_PARSE); }
        catch (ParseError $parseError) { $parseFailed = true; }
        $check($parseFailed, 'truncated plugin raises PHP parser error');
        $pluginConfirmed = s15_rb_hashes($root, $source) === $expected;
        $check(s15_rb_gate($pluginConfirmed, 1, 50) === 'STOP_PLUGIN_KEEP_THEME', 'damaged plugin bytes block theme');
        $check(s15_rb_hashes($root, $themeBefore) === $themeBefore, 'theme unchanged while plugin gate blocked');
        s15_rb_put($root, 'plugin/vne-library-core.php', $source['plugin/vne-library-core.php'], $owned);
        $start = hrtime(true); usleep(120000); $elapsed = (hrtime(true)-$start)/1000000;
        $check($elapsed > 50 && s15_rb_gate(true, $elapsed, 50) === 'STOP_PLUGIN_KEEP_THEME', 'real delayed acknowledgement exceeds 50ms rehearsal budget');
        $check(s15_rb_gate(null, 51, 50) === 'STOP_PLUGIN_KEEP_THEME', 'expired unconfirmed observation fails closed');
        $check(s15_rb_hashes($root, $source) === $expected, 'candidate restored after plugin corruption');
        s15_rb_put($root, 'theme/functions.php', '<?php if (', $owned);
        s15_rb_put($root, 'theme/obsolete-fixture.txt', 'owned disposable file', $owned);
        $themeParseFailed = false;
        try { token_get_all(file_get_contents($root.'/theme/functions.php'), TOKEN_PARSE); }
        catch (ParseError $parseError) { $themeParseFailed = true; }
        $check($themeParseFailed, 'truncated theme raises PHP parser error');
        $check(s15_rb_hashes($root, $source) !== $expected, 'partial theme transfer detected');
        // Clear the entire owned candidate tree, including obsolete files; never overlay a rollback.
        s15_rb_clear($root, $owned);
        foreach ($source as $name=>$bytes) { s15_rb_put($root, $name, $bytes, $owned); }
        $check(!file_exists($root.'/theme/obsolete-fixture.txt'), 'whole-tree restore removes obsolete candidate file');
        $check(s15_rb_hashes($root, $source) === $expected, 'whole-tree restore recovers every candidate hash');
        $check(count(array_filter($expected, fn($k)=>str_starts_with($k, 'plugin/'), ARRAY_FILTER_USE_KEY)) ===
            count(array_filter(s15_rb_hashes($root, $source), fn($k)=>str_starts_with($k, 'plugin/'), ARRAY_FILTER_USE_KEY)), 'plugin remains in recovered candidate pair');
    } catch (Throwable $failure) { $error = $failure->getMessage(); }
    finally {
        s15_rb_clear($root, $owned);
        $cleanup = rmdir($root) && !file_exists($root);
    }
    if ($error !== null || !$cleanup) { throw new RuntimeException($error ?? 'Cleanup failed'); }
    return array('checks'=>$checks, 'sourceFiles'=>count($source), 'delayedAckMs'=>round($elapsed, 3), 'cleanup'=>$cleanup,
        'limits'=>array('Isolated filesystem and PHP parser rehearsal, not a live plugin/theme outage',
            '50ms budget and 120ms delay are rehearsal values; no hosting process or HTTP request was killed',
            'Gate observations are injected; not a Plesk deployment watchdog certification'));
}
if (defined('VNE_S15_ROLLBACK_TEST')) { return; }

if (ABSPATH !== '/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/' || DB_NAME !== 'vne35060_wp_udx1z' ||
    home_url() !== 'https://staging-store.vneconomics.com' || (int)get_option('blog_public') !== 0 ||
    !defined('VNE_LIBRARY_VERSION') || VNE_LIBRARY_VERSION !== '0.4.2' || (int)get_option('vne_library_schema_version') !== 3 ||
    get_stylesheet() !== 'vibelab' || wp_get_theme()->get('Version') !== '0.7.0') { throw new RuntimeException('Wrong staging target or pair'); }
$backup = '/var/www/vhosts/vneconomics.com/wordpress-backups/staging-store.vneconomics.com__2026-10-24T09_59_46+0700.zip';
$manifestPath = '/var/www/vhosts/vneconomics.com/s15-release/manifest.json';
if (hash_file('sha256', $backup) !== 'f25d308309091275deb1d9036b40507af91a1443640b8a5fa0c7b28accdbfce7' ||
    hash_file('sha256', $manifestPath) !== '985b5286324e301925abc0369ef0bc47ff8a2ea3c8252c6f569508da74b08a0c') { throw new RuntimeException('Changed backup/manifest'); }
$manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
$archive = new ZipArchive(); if ($archive->open($backup) !== true) { throw new RuntimeException('Backup cannot open'); }
$source = array(); $live = array();
try {
    foreach (array('plugin'=>'plugins', 'theme'=>'themes') as $kind=>$folder) {
        foreach ($manifest['components'][$kind]['files'] as $entry) {
            s15_rb_name($entry['path']); $bytes = $archive->getFromName('files/wp-content/'.$folder.'/'.$entry['path']);
            if ($bytes === false || hash('sha256', $bytes) !== $entry['sha256']) { throw new RuntimeException('Backup candidate hash differs'); }
            $relative = $kind.'/'.substr($entry['path'], strpos($entry['path'], '/')+1); $source[$relative] = $bytes;
            $path = WP_CONTENT_DIR.'/'.$folder.'/'.$entry['path'];
            if (!is_file($path) || is_link($path) || hash_file('sha256', $path) !== $entry['sha256']) { throw new RuntimeException('Live release hash differs'); }
            $live[$path] = hash_file('sha256', $path);
        }
    }
} finally { $archive->close(); }
$result = s15_rb_run('/var/www/vhosts/vneconomics.com/s15-release', $source);
foreach ($live as $path=>$hash) { if (hash_file('sha256', $path) !== $hash) { throw new RuntimeException('Live component changed'); } }
$result['liveReleaseFilesUnchanged'] = count($live); $result['databaseWrites'] = false; $result['status'] = 'PASS_ISOLATED_HOSTING_FILE_REHEARSAL';
echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
