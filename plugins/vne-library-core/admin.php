<?php
if (!defined('ABSPATH')) { exit; }
// Check before WordPress outputs admin headers, so nonce errors retain HTTP 403.
function vne_library_admin_preflight(){
    if(($_GET['page']??'')==='vne-library' && ($_SERVER['REQUEST_METHOD']??'')==='POST'){
        if(!vne_library_can_edit()){wp_die('Không có quyền.','',array('response'=>403));}
        check_admin_referer('vne_library_save');
    }
}
function vne_library_admin_menu(){add_menu_page('Thư viện','Thư viện','vne_manage_library','vne-library','vne_library_admin_page','dashicons-book-alt');}
function vne_library_field($label,$name,$value,$textarea=false){
    static $index=0;$index++;$id='vne-field-'.$index;
    echo '<p><label for="'.esc_attr($id).'">'.esc_html($label).'</label><br>';
    if($textarea){echo '<textarea id="'.esc_attr($id).'" rows="3" class="large-text" name="'.esc_attr($name).'">'.esc_textarea($value??'').'</textarea>';}
    else{echo '<input id="'.esc_attr($id).'" class="regular-text" name="'.esc_attr($name).'" value="'.esc_attr($value??'').'">';}
    echo '</p>';
}
function vne_library_admin_payload($raw,$type){
    $input=array('post_type'=>$type,'title'=>$raw['title']??'','excerpt'=>$raw['excerpt']??'','content'=>$raw['content']??'','status'=>$raw['status']??'draft','primary_category'=>absint($raw['primary_category']??0),'editorial_note'=>$raw['editorial_note']??'');
    foreach(array('categories','needs','tools') as $name){$input[$name]=array_map('absint',(array)($raw[$name]??array()));}
    if($type==='vne_resource'){
        $data=$raw['data']??array();$data['source_verified']=isset($data['source_verified']);
        $data['repo_id']=($data['repo_id']??'')===''?null:$data['repo_id'];
        foreach(($data['claims']??array()) as $key=>$claim){
            foreach(array('value','source_url','observed_at') as $field){if(($claim[$field]??'')===''){$claim[$field]=null;}}
            $claim['conflict_sources']=array_values(array_filter(array_map('trim',explode("\n",$claim['conflict_sources']??''))));
            $data['claims'][$key]=$claim;
        }
        $input['data']=$data;
    }else{$input['document_source']=$raw['document_source']??array();}
    return $input;
}
function vne_library_admin_page(){
    if(!vne_library_can_edit()){wp_die('Không có quyền.',403);}
    $type=isset($_GET['kind'])&&is_string($_GET['kind'])?sanitize_key($_GET['kind']):'vne_resource';
    if(!isset(vne_library_types()[$type])){$type='vne_resource';}
    $id=absint($_GET['id']??0);$notice='';$error=false;
    $item=$id?vne_library_item($id,true):array('post_type'=>$type,'title'=>'','excerpt'=>'','content'=>'','status'=>'draft','primary_category'=>0,'categories'=>array(),'needs'=>array(),'tools'=>array(),'editorial_note'=>'','data'=>vne_library_default_resource(),'document_source'=>array('source_url'=>'','observed_at'=>'','note'=>''));
    if(is_wp_error($item)){echo '<div class="wrap"><p>'.esc_html($item->get_error_message()).'</p></div>';return;}
    $type=$item['post_type'];
    if($_SERVER['REQUEST_METHOD']==='POST'){
        check_admin_referer('vne_library_save');
        $raw=wp_unslash($_POST);
        if(($raw['operation']??'')==='term'){
            $result=vne_library_create_term(array('taxonomy'=>$raw['taxonomy']??'','name'=>$raw['term_name']??'','parent'=>absint($raw['parent']??0)));
        }elseif(in_array($raw['operation']??'',array('state','validation','dependency'),true)){
            $result=vne_library_state_form_handle($id,$raw);
            if(!is_wp_error($result)){$item=$result;}
        }else{
            $payload=vne_library_admin_payload($raw,$type);$result=vne_library_save_item($payload,$id);
            $item=array_replace($item,$payload);
            if(!is_wp_error($result)){$item=$result;$id=$result['id'];}
        }
        $error=is_wp_error($result);$notice=$error?$result->get_error_message():'Đã lưu dữ liệu.';
    }
    echo '<div class="wrap"><h1>Thư viện · Nhập liệu thủ công</h1><p>Nguồn được đối chiếu không có nghĩa là tài nguyên đã được kiểm thử. Các thông tin chưa biết cần giữ “Chưa xác định”.</p>';
    if($notice){echo '<div class="notice '.($error?'notice-error':'notice-success').'"><p>'.esc_html($notice).'</p></div>';}
    foreach(vne_library_types() as $key=>$config){echo '<a class="button" href="'.esc_url(admin_url('admin.php?page=vne-library&kind='.$key)).'">'.esc_html($config[0]).'</a> ';}
    echo '<form method="post" action="'.esc_url(admin_url('admin.php?page=vne-library&kind='.$type.($id?'&id='.$id:''))).'">';
    wp_nonce_field('vne_library_save');echo '<input type="hidden" name="operation" value="item">';
    vne_library_field('Tiêu đề','title',$item['title']);
    vne_library_field('Công dụng ngắn','excerpt',$item['excerpt'],true);
    vne_library_field('Nội dung (HTML cơ bản)','content',$item['content'],true);
    echo '<p><label>Trạng thái <select name="status">';
    foreach(array('draft'=>'Bản nháp','publish'=>'Xuất bản','private'=>'Riêng tư') as $value=>$label){echo '<option value="'.esc_attr($value).'" '.selected($item['status'],$value,false).'>'.esc_html($label).'</option>';}echo '</select></label></p>';
    echo '<p><label>Danh mục chính <select name="primary_category"><option value="0">Chưa chọn</option>';
    foreach(get_terms(array('taxonomy'=>'vne_category','hide_empty'=>false)) as $term){echo '<option value="'.(int)$term->term_id.'" '.selected($item['primary_category'],$term->term_id,false).'>'.esc_html($term->name).'</option>';}echo '</select></label></p>';
    foreach(array('categories'=>'vne_category','needs'=>'vne_need','tools'=>'vne_tool') as $field=>$tax){
        echo '<fieldset><legend>'.esc_html(vne_library_taxonomies()[$tax]).'</legend>';
        foreach(get_terms(array('taxonomy'=>$tax,'hide_empty'=>false)) as $term){echo '<label style="margin-right:16px"><input type="checkbox" name="'.esc_attr($field).'[]" value="'.(int)$term->term_id.'" '.checked(in_array($term->term_id,$item[$field]),true,false).'>'.esc_html($term->name).'</label>';}echo '</fieldset>';
    }
    if($type==='vne_resource'){
        $data=$item['data'];echo '<h2>Nguồn tài nguyên</h2><p><label>Loại tài nguyên <select name="data[resource_type]">';
        foreach(array('learn'=>'Tài liệu học','skill'=>'Skill','starter'=>'Mã khởi đầu','tool'=>'Công cụ') as $value=>$label){echo '<option value="'.$value.'" '.selected($data['resource_type'],$value,false).'>'.esc_html($label).'</option>';}echo '</select></label></p>';
        foreach(array('source_url'=>'URL GitHub','repo_id'=>'Repo ID (có thể để trống)','source_path'=>'Path trong repo','source_revision'=>'Revision nguồn','observed_at'=>'Ngày đối chiếu YYYY-MM-DD') as $name=>$label){vne_library_field($label,'data['.$name.']',$data[$name]);}
        echo '<p><label><input type="checkbox" name="data[source_verified]" value="1" '.checked($data['source_verified'],true,false).'>Tôi đã đối chiếu đúng nguồn</label></p>';
        foreach(array('cost'=>'Chi phí','license'=>'Giấy phép','requirements'=>'Yêu cầu cài đặt','permissions'=>'Quyền truy cập','compatibility'=>'Tương thích') as $name=>$label){
            $claim=$data['claims'][$name]??vne_library_default_claim();$prefix='data[claims]['.$name.']';
            echo '<fieldset style="border:1px solid #ccd0d4;padding:12px;margin:12px 0"><legend>'.esc_html($label).'</legend><label>Độ xác minh <select name="'.esc_attr($prefix.'[verification_status]').'">';
            foreach(array('unknown'=>'Chưa xác định','upstream_claimed'=>'Theo tác giả','conflicted'=>'Nguồn mâu thuẫn') as $value=>$text){echo '<option value="'.$value.'" '.selected($claim['verification_status'],$value,false).'>'.esc_html($text).'</option>';}echo '</select></label>';
            foreach(array('value'=>'Giá trị (để trống khi chưa xác định)','source_url'=>'Nguồn HTTPS','observed_at'=>'Ngày ghi nhận YYYY-MM-DD','note'=>'Ghi chú') as $field=>$text){vne_library_field($text,$prefix.'['.$field.']',$claim[$field],$field==='note');}
            vne_library_field('Nguồn mâu thuẫn (mỗi dòng một URL)',$prefix.'[conflict_sources]',implode("\n",$claim['conflict_sources']),true);echo '</fieldset>';
        }
    }else{
        foreach(array('source_url'=>'URL nguồn HTTPS','observed_at'=>'Ngày đối chiếu YYYY-MM-DD','note'=>'Ghi chú nguồn') as $field=>$text){vne_library_field($text,'document_source['.$field.']',$item['document_source'][$field]);}
    }
    vne_library_field('Ghi chú nội bộ (không trả về API công khai)','editorial_note',$item['editorial_note'],true);
    submit_button('Lưu nội dung');echo '</form>';vne_library_state_admin($id);echo '<h2>Phân loại mới</h2><form method="post">';
    wp_nonce_field('vne_library_save');echo '<input type="hidden" name="operation" value="term"><label>Loại phân loại <select name="taxonomy">';
    foreach(vne_library_taxonomies() as $key=>$label){echo '<option value="'.$key.'">'.esc_html($label).'</option>';}echo '</select></label>';
    vne_library_field('Tên phân loại','term_name','');vne_library_field('ID danh mục cha (0 nếu không có)','parent','0');submit_button('Thêm phân loại','secondary');echo '</form>';
    echo '<h2>Nội dung đã nhập</h2><ul>';
    foreach(get_posts(array('post_type'=>array_keys(vne_library_types()),'post_status'=>array('draft','publish','private'),'numberposts'=>50)) as $post){echo '<li><a href="'.esc_url(admin_url('admin.php?page=vne-library&id='.$post->ID)).'">'.esc_html($post->post_title?:'(Chưa có tiêu đề)').'</a> · '.esc_html($post->post_status).'</li>';}
    echo '</ul><h2>Xem dữ liệu hiện tại</h2><pre style="white-space:pre-wrap">'.esc_html(wp_json_encode($item,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)).'</pre></div>';
}
