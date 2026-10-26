<?php
// Read-only WP-CLI helper. This is tooling, never a theme/plugin payload.
if (!defined('VNE_S15_AUDIT_TEST') && (!defined('WP_CLI') || !WP_CLI || !defined('ABSPATH'))) {
    if (PHP_SAPI !== 'cli') { http_response_code(404); }
    exit(1);
}

function vne_s15_verify_target($observed, $expected) {
    foreach (array('root','database','home','siteurl') as $key) {
        if (($observed[$key] ?? null) !== $expected[$key]) {
            throw new RuntimeException('Target mismatch: '.$key.'. Refuse staging audit.');
        }
    }
    if ((string)($observed['blog_public'] ?? '') !== '0') {
        throw new RuntimeException('Staging indexing must be disabled.');
    }
}

function vne_s15_verify_bundle($directory, $pins) {
    $manifest_file=$directory.'/manifest.json';$archive=$directory.'/plugin.zip';
    foreach (array($manifest_file=>$pins['manifest'], $archive=>$pins['plugin']) as $file=>$hash) {
        if (!is_file($file) || is_link($file) || !hash_equals($hash,hash_file('sha256',$file))) {
            throw new RuntimeException('Bundle missing or hash mismatch: '.basename($file));
        }
    }
    $manifest=json_decode(file_get_contents($manifest_file),true,512,JSON_THROW_ON_ERROR);
    if ($manifest['sourceSha'] !== $pins['source'] || $manifest['components']['plugin']['sha256'] !== $pins['plugin']) {
        throw new RuntimeException('Unapproved release source.');
    }
    return $manifest;
}

function vne_s15_installed_files($directory, $files) {
    if (!file_exists($directory)) { return array('present'=>false,'hashesMatch'=>false,'missing'=>array(),'unexpected'=>array(),'changed'=>array()); }
    if (!is_dir($directory) || is_link($directory)) { throw new RuntimeException('Plugin directory must be a real directory.'); }
    $expected=array();$missing=array();$changed=array();$actual=array();
    foreach ($files as $file) {
        $prefix='vne-library-core/';
        if (!str_starts_with($file['path'],$prefix) || str_contains($file['path'],'..')) { throw new RuntimeException('Invalid manifest path.'); }
        $name=substr($file['path'],strlen($prefix));$expected[]=$name;$path=$directory.'/'.$name;
        if (!is_file($path)) { $missing[]=$name; }
        elseif (is_link($path) || !hash_equals($file['sha256'],hash_file('sha256',$path))) { $changed[]=$name; }
    }
    $walk=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory,FilesystemIterator::SKIP_DOTS));
    foreach ($walk as $file) {
        if ($file->isLink()) { throw new RuntimeException('Plugin tree contains a link.'); }
        if ($file->isFile()) { $actual[]=str_replace('\\','/',substr($file->getPathname(),strlen($directory)+1)); }
    }
    $unexpected=array_values(array_diff($actual,$expected));sort($unexpected);sort($missing);sort($changed);
    return array('present'=>true,'hashesMatch'=>!$missing&&!$unexpected&&!$changed,'missing'=>$missing,'unexpected'=>$unexpected,'changed'=>$changed);
}

function vne_s15_collect_audit($bundle_directory) {
    global $wpdb;
    $observed=array('root'=>str_replace('\\','/',ABSPATH),'database'=>DB_NAME,'home'=>get_option('home'),'siteurl'=>get_option('siteurl'),'blog_public'=>get_option('blog_public'));
    $expected=array('root'=>'/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/','database'=>'vne35060_wp_udx1z','home'=>'https://staging-store.vneconomics.com','siteurl'=>'https://staging-store.vneconomics.com');
    vne_s15_verify_target($observed,$expected);
    $pins=array('source'=>'__SOURCE_SHA__','manifest'=>'__MANIFEST_SHA__','plugin'=>'__PLUGIN_SHA__');
    $manifest=vne_s15_verify_bundle($bundle_directory,$pins);
    $installed=vne_s15_installed_files(WP_PLUGIN_DIR.'/vne-library-core',$manifest['components']['plugin']['files']);
    require_once ABSPATH.'wp-admin/includes/plugin.php';
    $active=is_plugin_active('vne-library-core/vne-library-core.php');
    $runtime=defined('VNE_LIBRARY_VERSION')?VNE_LIBRARY_VERSION:null;
    $schema=get_option('vne_library_schema_version',null);
    $theme=wp_get_theme();
    $readiness=!$installed['present']?'READY_FOR_PLUGIN_INSTALL':($installed['hashesMatch']?($active?'ACTIVE_PLUGIN_OBSERVED':'INSTALLED_NOT_ACTIVE'):'STOP_INSTALLED_HASH_MISMATCH');
    if ($active && ($runtime!=='0.4.2' || (int)$schema!==3 || !$installed['hashesMatch'])) { $readiness='STOP_ACTIVE_PLUGIN_MISMATCH'; }
    return array('status'=>$readiness,'target'=>$observed,'sourceSha'=>$pins['source'],
        'runtime'=>array('phpCLI'=>PHP_VERSION,'databaseVersion'=>$wpdb->get_var('SELECT VERSION()'),'mysqli'=>extension_loaded('mysqli'),'curl'=>extension_loaded('curl'),'zip'=>class_exists('ZipArchive'),'WP_CACHE'=>defined('WP_CACHE')?(bool)WP_CACHE:false,'objectCache'=>wp_using_ext_object_cache()),
        'bundle'=>array('manifestHashVerified'=>true,'pluginArchiveHashVerified'=>true),
        'plugin'=>array('active'=>$active,'runtimeVersion'=>$runtime,'schema'=>$schema,'files'=>$installed),
        'theme'=>array('stylesheet'=>get_stylesheet(),'version'=>$theme->get('Version')),
        'limits'=>array('Read-only observation; no install/activation/seed/purge/mail/network/subprocess','Does not certify Astra compatibility, mutex/concurrency, HTTP/HTTPS or server/CDN cache','Theme gate stays closed until required plugin checks are completed'));
}

if (!defined('VNE_S15_AUDIT_TEST')) {
    try {
        $report=vne_s15_collect_audit(__DIR__);
        echo wp_json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES).PHP_EOL;
        if (str_starts_with($report['status'],'STOP_')) { WP_CLI::halt(1); }
    } catch (Throwable $error) {
        WP_CLI::error($error->getMessage());
    }
}
