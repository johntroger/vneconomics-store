<?php
/** Private PHP CLI theme installer. No network endpoint, scheduler or WP-CLI dependency. */
declare(strict_types=1);

final class VneThemeHostInstaller {
    private array $c;
    private array $m;
    private string $digest;
    private string $payload;
    private string $journal;
    private array $zipFiles = array();

    public function __construct(array $context, string $payload, string $digest) {
        self::need((bool)preg_match('/^[a-f0-9]{40}$/D', $payload), 'Exact payload SHA required');
        self::need((bool)preg_match('/^[a-f0-9]{64}$/D', $digest), 'Exact manifest SHA256 required');
        $this->c = $context; $this->digest = $digest; $this->payload = $payload;
        foreach (array('root', 'inbox', 'clone', 'control') as $name) self::safe($context[$name], true);
        self::need(($context['control'] !== $context['inbox']) && !str_starts_with($context['control'].'/', $context['root'].'/') && !str_starts_with($context['control'].'/', $context['inbox'].'/'), 'Control must be private and independent');
        self::need(!str_starts_with($context['inbox'].'/', $context['root'].'/'), 'Inbox must be outside webroot');
        self::need((fileperms($context['control']) & 0777) === 0700, 'Control mode must be0700');
        self::need(fileowner($context['control']) === fileowner($context['root']), 'Control owner differs');
        $this->journal = $context['control'].'/theme-active.json';
        $this->verifyRef();
        $path = $context['inbox'].'/manifest.json'; self::safe($path);
        self::need(hash_file('sha256', $path) === $digest && filesize($path) <= 256000, 'Manifest pin differs');
        $this->m = json_decode(file_get_contents($path), true, 64, JSON_THROW_ON_ERROR);
        $m = $this->m;
        self::need($m['profile'] === 'vibelab-v2-theme-update-schema3' && $m['scope'] === 'theme-only' && $m['schema'] === 3 && $m['pluginVersion'] === '0.4.4' && $m['pluginUnchanged'] === true, 'Unsupported profile');
        self::need((bool)preg_match('/^[a-f0-9]{40}$/D', $m['sourceSha']) && (bool)preg_match('/^[a-f0-9]{40}$/D', $m['expectedProductionParent']), 'Source/baseline identity differs');
        self::need(in_array($m['changeClass'], array('A','B'), true), 'Change class differs');
        self::need($m['installPolicy']['themeOnly'] === true && $m['installPolicy']['restoreDatabase'] === false && $m['installPolicy']['reinstallPlugin'] === false && $m['installPolicy']['switchTheme'] === false, 'Install policy differs');
        $names = array_column($m['files'], 'path'); sort($names);
        self::need($names === array('plugin.zip','previous-plugin.zip','previous-theme.zip','theme.zip'), 'Closed payload allowlist differs');
        foreach ($m['files'] as $f) {
            $path = $context['inbox'].'/'.$f['path']; self::safe($path);
            self::need(is_int($f['bytes']) && $f['bytes'] > 0 && $f['bytes'] <= 10485760 && filesize($path) === $f['bytes'] && hash_file('sha256', $path) === $f['sha256'], 'Payload hash/size differs');
        }
        foreach (array('theme'=>'vibelab-v2','previous-theme'=>'vibelab-v2','plugin'=>'vne-library-core','previous-plugin'=>'vne-library-core') as $kind=>$prefix) {
            $d = $m['components'][$kind];
            self::need($d['archive'] === $kind.'.zip', 'Component archive differs');
            $this->zipFiles[$kind] = $this->archive($d, $prefix);
        }
        self::need($m['components']['plugin']['sha256'] === $m['components']['previous-plugin']['sha256'], 'Plugin rollback differs');
        $a = array_keys($this->zipFiles['theme']); $b = array_keys($this->zipFiles['previous-theme']); sort($a); sort($b);
        self::need($a === $b, 'Theme file allowlist changed');
    }

    private static function need(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); }
    private static function safe(string $path, bool $directory = false): void {
        for ($q = $path; $q !== dirname($q); $q = dirname($q)) self::need(!is_link($q), 'Symlink refused');
        self::need(realpath($path) === $path && ($directory ? is_dir($path) : is_file($path)), 'Missing/noncanonical path');
        if (!$directory) self::need(stat($path)['nlink'] === 1, 'Hardlink refused');
    }
    private function verifyRef(): void {
        $git = $this->c['clone']; self::safe($git.'/HEAD');
        self::need(trim(file_get_contents($git.'/HEAD')) === 'ref: refs/heads/release-production', 'Plesk branch differs');
        $path = $git.'/refs/heads/release-production'; $sha = null;
        if (file_exists($path)) { self::safe($path); $sha = trim(file_get_contents($path)); }
        elseif (file_exists($git.'/packed-refs')) {
            self::safe($git.'/packed-refs');
            foreach (file($git.'/packed-refs', FILE_IGNORE_NEW_LINES) as $row) if (preg_match('/^([a-f0-9]{40}) refs\/heads\/release-production$/D', $row, $match)) $sha = $match[1];
        }
        self::need($sha === $this->payload, 'Plesk payload ref differs');
    }
    private function archive(array $d, string $prefix): array {
        $path = $this->c['inbox'].'/'.$d['archive'];
        self::need(filesize($path) === $d['bytes'] && hash_file('sha256', $path) === $d['sha256'], 'Component pin differs');
        self::need(count($d['files']) > 0 && count($d['files']) <= 100, 'Archive count differs');
        $zip = new ZipArchive(); self::need($zip->open($path, ZipArchive::CHECKCONS) === true, 'Invalid archive'); $actual = array();
        try {
            self::need($zip->numFiles === count($d['files']), 'Archive allowlist differs');
            foreach ($d['files'] as $file) {
                $name = $file['path'];
                self::need((bool)preg_match('~^'.preg_quote($prefix,'~').'/[a-z0-9_/-]+\.(?:php|css)$~D', $name) && !str_contains($name, '..') && !isset($actual[$name]), 'Unsafe/duplicate archive member');
                $index = $zip->locateName($name); self::need($index !== false, 'Missing archive member');
                $stat = $zip->statIndex($index); self::need(is_int($file['bytes']) && $file['bytes'] > 0 && $file['bytes'] <= 524288 && $stat['size'] === $file['bytes'], 'Member size differs');
                if ($zip->getExternalAttributesIndex($index, $opsys, $attr)) self::need((($attr >> 16) & 0170000) === 0 || (($attr >> 16) & 0170000) === 0100000, 'Nonregular archive member');
                $bytes = $zip->getFromIndex($index); self::need(is_string($bytes) && hash('sha256', $bytes) === $file['sha256'], 'Archive member hash differs'); $actual[$name] = $file;
            }
        } finally { $zip->close(); }
        return $actual;
    }
    private function tree(string $kind, string $directory): void {
        self::safe($directory, true); $expected = $this->zipFiles[$kind]; $names = array(); $prefix = basename($directory);
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)) as $f) {
            self::need(!$f->isLink() && $f->isFile(), 'Nonregular installed member');
            $name = $prefix.'/'.substr($f->getPathname(), strlen($directory)+1); $names[] = $name;
            self::need(isset($expected[$name]), 'Unexpected installed file'); self::safe($f->getPathname());
            self::need($f->getSize() === $expected[$name]['bytes'] && hash_file('sha256', $f->getPathname()) === $expected[$name]['sha256'], 'Live baseline/file drift');
        }
        sort($names); $want = array_keys($expected); sort($want); self::need($names === $want, 'Installed allowlist differs');
    }
    private function boot(): void {
        if (!defined('ABSPATH')) {
            if (!defined('DISABLE_WP_CRON')) define('DISABLE_WP_CRON', true);
            if (!defined('FS_METHOD')) define('FS_METHOD', 'direct');
            require $this->c['root'].'/wp-load.php';
        }
        global $wpdb;
        self::need(rtrim(ABSPATH,'/') === $this->c['root'] && WP_CONTENT_DIR === $this->c['root'].'/wp-content', 'WordPress paths differ');
        self::need(get_option('home') === $this->c['home'] && get_option('siteurl') === $this->c['home'] && DB_NAME === $this->c['database'], 'Home/database differs');
        self::need(get_stylesheet() === 'vibelab-v2' && get_template() === 'vibelab-v2', 'Active theme differs');
        self::need((int)get_option('vne_library_schema_version') === 3, 'Schema differs');
        self::need(defined('VNE_LIBRARY_VERSION') && VNE_LIBRARY_VERSION === '0.4.4', 'Loaded plugin differs');
        self::need(!file_exists(ABSPATH.'.maintenance'), 'Existing maintenance must be inspected');
        $this->tree('plugin', WP_CONTENT_DIR.'/plugins/vne-library-core');
    }
    private function data(): array {
        global $wpdb; $out = array();
        foreach (array('posts','postmeta','terms','term_taxonomy','term_relationships') as $name) {
            $rows = $wpdb->get_results('SELECT * FROM '.$wpdb->$name, ARRAY_A); self::need(is_array($rows) && $wpdb->last_error === '', 'Data inspection failed');
            usort($rows, static fn($a,$b)=>strcmp(wp_json_encode($a),wp_json_encode($b))); $out[$name] = hash('sha256', wp_json_encode($rows));
        }
        return $out;
    }
    private function readJournal(): ?array {
        self::need(!is_link($this->journal), 'Journal symlink refused');
        if (!file_exists($this->journal)) return null;
        self::safe($this->journal); self::need((fileperms($this->journal)&0777) === 0600 && filesize($this->journal) <= 32768, 'Journal permissions/size differ');
        $j = json_decode(file_get_contents($this->journal),true,32,JSON_THROW_ON_ERROR);
        self::need(isset($j['status'],$j['manifestSha256'],$j['payloadSha'],$j['sourceSha'],$j['data']), 'Journal shape differs'); return $j;
    }
    private function save(array $j): void {
        self::need(!is_link($this->journal), 'Journal symlink refused');
        if (file_exists($this->journal)) self::safe($this->journal);
        $fd = fopen($this->journal, 'c+b'); self::need($fd !== false, 'Cannot write journal');
        try { self::need(chmod($this->journal,0600), 'Journal chmod failed'); $bytes = json_encode($j,JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT)."\n"; self::need(ftruncate($fd,0) && fwrite($fd,$bytes) === strlen($bytes) && fflush($fd), 'Journal write failed'); }
        finally { fclose($fd); }
    }
    private function installZip(string $name): void {
        require_once ABSPATH.'wp-admin/includes/class-wp-upgrader.php'; require_once ABSPATH.'wp-admin/includes/file.php';
        self::need(WP_Filesystem(), 'Direct filesystem unavailable');
        $u = new WP_Upgrader(new Automatic_Upgrader_Skin());
        $r = $u->run(array('package'=>$this->c['inbox'].'/'.$name.'.zip','destination'=>WP_CONTENT_DIR.'/themes/vibelab-v2/','clear_destination'=>true,'abort_if_destination_exists'=>false,'clear_working'=>true,'hook_extra'=>array('type'=>'theme','action'=>'update','theme'=>'vibelab-v2')));
        self::need(!is_wp_error($r) && (bool)$r, 'Native theme installation failed'); wp_clean_themes_cache(true); clearstatcache();
        self::need(!file_exists(ABSPATH.'.maintenance'), 'Stale maintenance after install');
    }
    private function same(array $j): void {
        self::need($j['manifestSha256'] === $this->digest && $j['payloadSha'] === $this->payload && $j['sourceSha'] === $this->m['sourceSha'], 'Journal conflicts; inspect without overwriting');
    }
    private function health(): void {
        $r = wp_remote_get($this->c['home'].'/?vne_release_check='.substr($this->digest,0,16), array('timeout'=>20,'redirection'=>0,'sslverify'=>true,'headers'=>array('Cache-Control'=>'no-cache')));
        self::need(!is_wp_error($r) && wp_remote_retrieve_response_code($r) === 200, 'Homepage health failed'); $html = wp_remote_retrieve_body($r);
        self::need(str_contains($html,$this->m['themeMarker']) && str_contains($html,'style.css?ver='.$this->m['themeVersion']), 'HTTP identity differs');
        $r = wp_remote_get($this->c['home'].'/wp-content/themes/vibelab-v2/style.css?vne_release_check='.substr($this->digest,0,16), array('timeout'=>20,'redirection'=>0,'sslverify'=>true,'headers'=>array('Cache-Control'=>'no-cache')));
        self::need(!is_wp_error($r) && wp_remote_retrieve_response_code($r) === 200 && hash('sha256',wp_remote_retrieve_body($r)) === $this->zipFiles['theme']['vibelab-v2/style.css']['sha256'], 'HTTP CSS differs');
    }
    public function run(string $mode): array {
        self::need(in_array($mode,array('inspect','install','finish','rollback','apply'),true), 'Unsupported mode');
        if ($mode === 'inspect') return array('status'=>'INSPECTED_THEME_PACKAGE','payloadSha'=>$this->payload,'manifestSha256'=>$this->digest,'sourceSha'=>$this->m['sourceSha'],'journal'=>$this->readJournal(),'writes'=>false);
        $lock = $this->c['control'].'/theme-install.lock'; self::need(!is_link($lock), 'Lock symlink refused'); if (file_exists($lock)) self::safe($lock);
        $fd = fopen($lock,'c+b'); self::need($fd !== false, 'Cannot open lock');
        try {
            self::need(chmod($lock,0600) && flock($fd,LOCK_EX|LOCK_NB), 'Installer busy'); $this->verifyRef(); $j = $this->readJournal();
            // Validate executable theme/plugin bytes and unresolved state before WordPress can load them.
            if (in_array($mode,array('install','apply'),true)) {
                if ($j && $j['status'] === 'COMPLETE' && $j['manifestSha256'] === $this->digest) $this->same($j);
                elseif ($j) {
                    self::need($j['status'] === 'COMPLETE', 'Previous run not complete; inspect');
                    self::need($j['payloadSha'] === $this->m['expectedProductionParent'], 'Previous receipt is not baseline');
                }
                $this->tree($j && $j['status'] === 'COMPLETE' && $j['manifestSha256'] === $this->digest ? 'theme' : 'previous-theme', $this->c['root'].'/wp-content/themes/vibelab-v2');
            } else {
                self::need($j !== null, 'No pending release'); $this->same($j);
                self::need($j['status'] === 'PENDING_HEALTH' && time()-$j['startedAt'] <= 300, 'Release phase/timeout requires inspection');
                $this->tree('theme', $this->c['root'].'/wp-content/themes/vibelab-v2');
            }
            $this->tree('plugin', $this->c['root'].'/wp-content/plugins/vne-library-core'); $this->boot();
            if (in_array($mode,array('install','apply'),true)) {
                if ($j && $j['status'] === 'COMPLETE' && $j['manifestSha256'] === $this->digest) { $this->same($j); $this->tree('theme',WP_CONTENT_DIR.'/themes/vibelab-v2'); return array('status'=>'ALREADY_COMPLETE','manifestSha256'=>$this->digest); }
                if ($j) {
                    self::need($j['status'] === 'COMPLETE', 'Previous run not complete; inspect');
                    self::need($j['payloadSha'] === $this->m['expectedProductionParent'], 'Previous receipt is not baseline');
                    $receipt = $this->c['control'].'/theme-'.$j['manifestSha256'].'.json';
                    self::need(!file_exists($receipt) && !is_link($receipt), 'Immutable receipt already exists; inspect'); self::need(copy($this->journal,$receipt) && chmod($receipt,0600), 'Cannot preserve receipt');
                }
                $this->tree('previous-theme',WP_CONTENT_DIR.'/themes/vibelab-v2');
                $j = array('status'=>'INSTALLING','payloadSha'=>$this->payload,'manifestSha256'=>$this->digest,'sourceSha'=>$this->m['sourceSha'],'data'=>$this->data(),'startedAt'=>time()); $this->save($j);
                // A thrown install/timeout leaves INSTALLING. Never guess how far a partial write reached.
                $this->installZip('theme'); $this->tree('theme',WP_CONTENT_DIR.'/themes/vibelab-v2'); self::need($this->data() === $j['data'], 'Application data drift; inspect');
                $j['status'] = 'PENDING_HEALTH'; $this->save($j); if ($mode === 'install') return $j;
                $mode = 'finish';
            }
            self::need($j !== null, 'No pending release'); $this->same($j);
            self::need($j['status'] === 'PENDING_HEALTH', 'Journal phase requires inspection');
            self::need(time()-$j['startedAt'] <= 300, 'Release timeout; inspect');
            $this->tree('theme',WP_CONTENT_DIR.'/themes/vibelab-v2'); self::need($this->data() === $j['data'], 'Data drift; inspect');
            if ($mode === 'finish') {
                try { $this->health(); $this->verifyRef(); $this->tree('theme',WP_CONTENT_DIR.'/themes/vibelab-v2'); $this->tree('plugin',WP_CONTENT_DIR.'/plugins/vne-library-core'); self::need($this->data() === $j['data'], 'Data drift after HTTP'); }
                catch (Throwable $e) { $j['healthFailure'] = $e->getMessage(); $mode = 'rollback'; }
            }
            if ($mode === 'rollback') {
                // Recheck before writing: a changed ref/file/data must stop, not be overwritten by recovery.
                $this->verifyRef(); $this->tree('theme',WP_CONTENT_DIR.'/themes/vibelab-v2'); $this->tree('plugin',WP_CONTENT_DIR.'/plugins/vne-library-core'); self::need($this->data() === $j['data'], 'Data drift before rollback');
                $j['status'] = 'ROLLING_BACK'; $this->save($j); $this->installZip('previous-theme'); $this->tree('previous-theme',WP_CONTENT_DIR.'/themes/vibelab-v2'); self::need($this->data() === $j['data'], 'Data drift after rollback'); $j['status'] = 'ROLLED_BACK';
            } else $j['status'] = 'COMPLETE';
            $j['finishedAt'] = time(); $this->save($j); return $j;
        } finally { if (is_resource($fd)) { flock($fd,LOCK_UN); fclose($fd); } }
    }
}

function vne_theme_host_main(array $args): void {
    if (PHP_SAPI !== 'cli' || count($args) !== 4) throw new RuntimeException('Use PHP CLI: installer.php inspect|apply|install|finish|rollback <payloadSHA> <manifestSHA256>');
    $base = '/var/www/vhosts/vneconomics.com';
    $context = array('root'=>$base.'/store.vneconomics.com','inbox'=>$base.'/deploy-inbox/production','clone'=>$base.'/git/vneconomics-store-production.git','control'=>$base.'/deploy-control/theme-release','home'=>'https://store.vneconomics.com','database'=>'vne35060_wp_kmqnf');
    $result = (new VneThemeHostInstaller($context,$args[2],$args[3]))->run($args[1]);
    echo json_encode($result,JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT)."\n";
    if ($result['status'] === 'ROLLED_BACK') exit(2);
}
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    try { vne_theme_host_main($argv); } catch (Throwable $e) { fwrite(STDERR,'STOP: '.$e->getMessage()."\n"); exit(1); }
}
