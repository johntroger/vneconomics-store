<?php
if (!defined('ABSPATH')) { exit; }

function vne_library_state_form_handle($id,$raw) {
    if (!$id) { return vne_library_error('Lưu nội dung trước khi nhập trạng thái/bằng chứng.'); }
    switch($raw['operation']) {
        case 'state':
            $input=$raw['state']??array();
            if (!is_array($input)||!is_array($input['review']??null)) { return vne_library_error('Form trạng thái không hợp lệ.'); }
            $input['review']['needed']=isset($input['review']['needed']);
            return vne_library_save_state($id,$input);
        case 'validation':
            $input=$raw['validation']??array();
            if (!is_array($input)||!is_string($input['checklist']??null)) { return vne_library_error('Form bằng chứng không hợp lệ.'); }
            $input['checklist']=array_values(array_filter(array_map('trim',explode("\n",$input['checklist']))));
            return vne_library_record_validation($id,$input);
        case 'dependency':
            $resource=absint($raw['resource_id']??0);$step=sanitize_text_field($raw['step']??'');
            $deps=array_values(array_filter(vne_library_dependencies($id),function($dep)use($resource,$step){return $dep['resource_id']!==$resource||$dep['step']!==$step;}));
            $deps[]=array('resource_id'=>$resource,'resource_revision'=>vne_library_revision($resource),'step'=>$step,'tool'=>$raw['tool']??'','version'=>$raw['version']??'');
            return vne_library_save_dependencies($id,$deps);
    }
    return vne_library_error('Thao tác không hợp lệ.');
}
function vne_library_state_select($label,$name,$current,$values) {
    static $index=0;$index++;$id='vne-select-'.$index;
    echo '<p><label for="'.esc_attr($id).'">'.esc_html($label).'</label> <select id="'.esc_attr($id).'" name="'.esc_attr($name).'">';
    foreach($values as $value=>$text) { echo '<option value="'.esc_attr($value).'" '.selected($current,$value,false).'>'.esc_html($text).'</option>'; }
    echo '</select></p>';
}
function vne_library_state_form_start($id,$operation) {
    echo '<form method="post" action="'.esc_url(admin_url('admin.php?page=vne-library&id='.$id)).'">';
    wp_nonce_field('vne_library_save');
    echo '<input type="hidden" name="operation" value="'.esc_attr($operation).'">';
}
function vne_library_state_admin($id) {
    if (!$id) { return; }
    $state=vne_library_state_input($id);$derived=vne_library_resolve_state($id);
    echo '<section id="vne-state"><h2>Trạng thái và bằng chứng</h2><p data-vne-badge="'.esc_attr($derived['primary_badge']).'">Badge chuẩn: <strong>'.esc_html($derived['primary_label']).'</strong> · Xác nhận: '.esc_html($derived['validation_status']).'</p>';
    echo '<p>Đối chiếu nguồn không thay thế thử thực tế. Cập nhật lịch rà soát và liên kết trước khi ghi lần thử mới. Bằng chứng cũ luôn được giữ.</p>';
    echo '<ul>';foreach($derived['warnings'] as $warning){echo '<li>'.esc_html((isset($warning['step'])?$warning['step'].': ':'').$warning['message']).'</li>';}echo '</ul>';
    vne_library_state_form_start($id,'state');
    foreach(array('source_access'=>'Truy cập nguồn','maintenance'=>'Duy trì nguồn') as $axis=>$label) {
        $options=$axis==='source_access'?array('unknown'=>'Chưa xác minh truy cập','available'=>'Truy cập được','unavailable'=>'Không truy cập được'):array('unknown'=>'Chưa rõ tình trạng duy trì','active'=>'Chưa archived theo nguồn','archived'=>'Đã archived');
        vne_library_state_select($label,'state['.$axis.'][status]',$state[$axis]['status'],$options);
        foreach(array('source_url'=>'Nguồn quan sát HTTPS','observed_at'=>'Ngày quan sát YYYY-MM-DD','note'=>'Ghi chú quan sát') as $field=>$text) { vne_library_field($label.' · '.$text,'state['.$axis.']['.$field.']',$state[$axis][$field]); }
    }
    vne_library_state_select('Khuyến nghị','state[recommendation][status]',$state['recommendation']['status'],array('normal'=>'Bình thường','suspended'=>'Tạm ngừng khuyến nghị'));
    vne_library_field('Lý do quyết định khuyến nghị','state[recommendation][reason]',$state['recommendation']['reason'],true);
    echo '<p><label><input type="checkbox" name="state[review][needed]" value="1" '.checked($state['review']['needed'],true,false).'>Cần kiểm tra lại</label></p>';
    foreach(array('reason'=>'Lý do cần rà soát','reviewed_at'=>'Ngày rà soát YYYY-MM-DD','review_due_at'=>'Hạn rà soát YYYY-MM-DD') as $field=>$label) { vne_library_field($label,'state[review]['.$field.']',$state['review'][$field]); }
    submit_button('Lưu trạng thái');echo '</form>';
    if (get_post_type($id)!=='vne_resource') {
        echo '<h3>Liên kết bước thực hành với tài nguyên</h3><p>Gắn lại chỉ xác nhận snapshot đang tham chiếu; không tự xác nhận bài đã thử.</p>';
        vne_library_state_form_start($id,'dependency');
        echo '<p><label for="vne-dependency-resource">Tài nguyên phụ thuộc</label> <select id="vne-dependency-resource" name="resource_id">';
        foreach(get_posts(array('post_type'=>'vne_resource','post_status'=>'publish','numberposts'=>-1,'orderby'=>'title','order'=>'ASC')) as $post) { echo '<option value="'.(int)$post->ID.'">'.esc_html($post->post_title).'</option>'; }
        echo '</select></p>';
        vne_library_field('Bước phụ thuộc','step','');vne_library_field('Công cụ phụ thuộc','tool','');vne_library_field('Phiên bản phụ thuộc','version','');
        submit_button('Gắn hoặc đối chiếu lại liên kết');echo '</form>';
    }
    if (current_user_can('vne_validate_library')) {
        echo '<h3>Ghi bằng chứng thử thủ công</h3><p>Chỉ ghi kết quả đã thực hiện; không ghi pass chỉ vì URL mở được.</p>';
        vne_library_state_form_start($id,'validation');
        echo '<input type="hidden" name="validation[revision]" value="'.esc_attr(vne_library_revision($id)).'">';
        vne_library_state_select('Kết quả thử','validation[outcome]','fail',array('fail'=>'Chưa đạt','pass'=>'Đạt checklist'));
        foreach(array('tested_at'=>'Ngày thử YYYY-MM-DD','os'=>'Hệ điều hành thử','tool'=>'Công cụ thử','version'=>'Phiên bản công cụ','input'=>'Đầu vào đã thử','output'=>'Kết quả quan sát','evidence_url'=>'URL bằng chứng HTTPS') as $field=>$label) { vne_library_field($label,'validation['.$field.']',''); }
        vne_library_field('Checklist và kết quả (mỗi dòng một mục)','validation[checklist]','',true);
        submit_button('Lưu bằng chứng thử');echo '</form>';
    }
    echo '<p>Số lần thử đã lưu: '.count(vne_library_validations($id)).'. CTA: '.esc_html($derived['cta']['label']).'</p></section>';
}
