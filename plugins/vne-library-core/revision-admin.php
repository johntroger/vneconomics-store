<?php
if (!defined('ABSPATH')) { exit; }
function vne_library_revision_menu() {
    add_submenu_page(null,'Preview bản sửa','Preview bản sửa','vne_manage_library','vne-library-preview','vne_library_render_proposal_preview');
}
function vne_library_preview_preflight() {
    if (($_GET['page']??'')!=='vne-library-preview') { return; }
    nocache_headers();header('Cache-Control: private, no-store, max-age=0');header('X-Robots-Tag: noindex, nofollow, noarchive');
    $preview=vne_library_preview_proposal(absint($_GET['proposal']??0));
    if (is_wp_error($preview)) { wp_die(esc_html($preview->get_error_message()),'',array('response'=>(int)($preview->get_error_data()['status']??403))); }
}
function vne_library_revision_admin_list($id) {
    if (!$id) { return; }
    echo '<section id="vne-proposals"><h2>Bản sửa chờ duyệt</h2><p>Lưu bản sửa không thay nội dung đang công khai. Khi phiên bản gốc đổi, cần đối chiếu và tạo đề xuất mới.</p><ul>';
    foreach(get_posts(array('post_type'=>'vne_proposal','post_status'=>'private','post_parent'=>$id,'numberposts'=>50,'orderby'=>'ID','order'=>'DESC')) as $post) {
        $record=vne_library_get_proposal($post->ID);
        if(is_wp_error($record)){continue;}
        echo '<li><a href="'.esc_url(admin_url('admin.php?page=vne-library-preview&proposal='.$post->ID)).'">Xem bản sửa #'.(int)$post->ID.'</a> · '.esc_html($record['status']).($record['is_stale']?' · Phiên bản gốc đã đổi':'').'</li>';
    }
    echo '</ul></section>';
}
function vne_library_render_proposal_preview() {
    $pid=absint($_GET['proposal']??0);$preview=vne_library_preview_proposal($pid);
    if(is_wp_error($preview)){echo '<p>'.esc_html($preview->get_error_message()).'</p>';return;}
    $p=$preview['payload'];$derived=$preview['derived'];$record=vne_library_get_proposal($pid);
    echo '<div class="wrap vne-private-preview"><h1>Bản sửa riêng — chưa phát hành</h1><p>ID nội dung: '.(int)$preview['item_id'].' · Trạng thái đề xuất: '.esc_html($preview['status']).'</p>';
    if($preview['is_stale']){echo '<div class="notice notice-warning"><p>Phiên bản gốc đã đổi. Cần đối chiếu và tạo đề xuất mới; không ghi đè.</p></div>';}
    echo '<p>Trường thay đổi: '.esc_html(implode(', ',$preview['changed_fields'])).'</p>';
    echo '<style>.vne-preview-grid{display:grid;grid-template-columns:minmax(220px,1fr) minmax(0,2fr);gap:24px;max-width:1100px}.vne-preview-card,.vne-preview-detail{padding:24px;background:#fff;border:1px solid #c3c4c7;overflow-wrap:anywhere}.vne-preview-detail p{max-width:75ch}.vne-preview-cover{padding:24px;background:#eef3f8}.vne-private-preview pre{overflow-wrap:anywhere;word-break:break-word}.vne-preview-detail img{max-width:100%;height:auto}@media(max-width:700px){.vne-preview-grid{grid-template-columns:1fr}.vne-preview-card,.vne-preview-detail{padding:16px}}</style>';
    echo '<div class="vne-preview-grid"><article class="vne-preview-card" data-preview-card><div class="vne-preview-cover">Preview thẻ · Chưa có ảnh</div><h2>'.esc_html($p['title']).'</h2><p>'.esc_html($p['excerpt']).'</p><p>'.esc_html($derived['primary_label']).'</p><span>'.esc_html($derived['cta']['label']).'</span></article>';
    echo '<article class="vne-preview-detail" data-preview-detail><h2>'.esc_html($p['title']).'</h2><p>'.esc_html($p['excerpt']).'</p><p><strong>'.esc_html($derived['primary_label']).'</strong></p><ul>';
    foreach($derived['warnings'] as $warning){echo '<li>'.esc_html((isset($warning['step'])?$warning['step'].': ':'').$warning['message']).'</li>';}
    // No remote media, embeds or forms in this private data preview.
    $allowed=wp_kses_allowed_html('post');unset($allowed['img'],$allowed['iframe'],$allowed['form'],$allowed['video'],$allowed['audio'],$allowed['source']);foreach($allowed as &$attrs){unset($attrs['style']);}unset($attrs);
    echo '</ul>'.wp_kses($p['content'],$allowed).'<p>URL nguồn: '.esc_html($p['data']['source_url']??$p['document_source']['source_url']??'').'</p></article></div>';
    echo '<h2>Đối chiếu với bản đang duyệt</h2><table class="widefat striped"><thead><tr><th>Trường</th><th>Bản gốc khi đề xuất</th><th>Bản hiện tại</th><th>Bản sửa</th></tr></thead><tbody>';
    $current=vne_library_editorial_snapshot($preview['item_id']);
    foreach($preview['changed_fields'] as $field) {echo '<tr><th>'.esc_html($field).'</th>';foreach(array($record['base_snapshot'][$field]??null,$current[$field]??null,$record['payload'][$field]??null) as $value){echo '<td><pre style="white-space:pre-wrap;max-width:35ch">'.esc_html(is_string($value)?$value:wp_json_encode($value,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)).'</pre></td>';}echo '</tr>';}
    echo '</tbody></table>';
    if($record['status']==='pending'&&current_user_can('vne_approve_library')){
        echo '<form method="post" action="'.esc_url(admin_url('admin.php?page=vne-library&id='.$preview['item_id'])).'">';
        wp_nonce_field('vne_library_save');echo '<input type="hidden" name="proposal_id" value="'.(int)$pid.'">';
        vne_library_field('Ghi chú duyệt hoặc bỏ','decision_reason','');
        if(!$preview['is_stale']){echo '<button class="button button-primary" name="operation" value="approve">Duyệt bản sửa</button> ';}
        echo '<button class="button" name="operation" value="reject">Bỏ bản sửa</button></form>';
    }
    echo '</div>';
}
