<?php
// Development compatibility entry; the packaged plugin owns the implementation.
if (!defined('ABSPATH')) { exit; }
if (!function_exists('vne_stars_sync_batch')) { require_once __DIR__.'/../../plugins/vne-library-core/stars.php'; }
