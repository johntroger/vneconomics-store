<?php
if (!defined('ABSPATH')) { exit; }
function vne_library_types() { return array('vne_resource' => array('Tài nguyên','tai-nguyen','vne_resource','vne_resources'), 'vne_guide' => array('Hướng dẫn','huong-dan','vne_guide','vne_guides'), 'vne_practice' => array('Bộ thực hành','bo-thuc-hanh','vne_practice','vne_practices')); }
function vne_library_taxonomies() { return array('vne_category' => 'Danh mục', 'vne_need' => 'Nhu cầu', 'vne_tool' => 'Công cụ'); }
function vne_library_register_types() {
    foreach (vne_library_types() as $type => $config) {
        if (!post_type_exists($type)) { register_post_type($type, array('label'=>$config[0], 'public'=>true, 'show_ui'=>false, 'show_in_rest'=>false, 'has_archive'=>true, 'rewrite'=>array('slug'=>$config[1], 'with_front'=>false), 'capability_type'=>array($config[2],$config[3]), 'map_meta_cap'=>true, 'supports'=>array('title','editor','excerpt','revisions'), 'taxonomies'=>array_keys(vne_library_taxonomies()))); }
        foreach (array('_vne_resource'=>'object', '_vne_document_source'=>'object', '_vne_primary_category'=>'integer', '_vne_editorial_note'=>'string') as $key=>$kind) {
            register_post_meta($type,$key,array('type'=>$kind,'single'=>true,'show_in_rest'=>false,'auth_callback'=>function($allowed,$meta_key,$post_id){ return current_user_can('vne_manage_library') && current_user_can('edit_post',$post_id); }));
        }
    }
    foreach (vne_library_taxonomies() as $name=>$label) {
        if (!taxonomy_exists($name)) { register_taxonomy($name,array_keys(vne_library_types()),array('label'=>$label,'public'=>true,'show_ui'=>false,'show_in_rest'=>false,'hierarchical'=>$name==='vne_category','rewrite'=>array('slug'=>$name==='vne_category'?'danh-muc':$name),'capabilities'=>array('manage_terms'=>'vne_manage_library','edit_terms'=>'vne_manage_library','delete_terms'=>'vne_manage_library','assign_terms'=>'vne_manage_library'))); }
    }
}
function vne_library_activate() {
    vne_library_register_types();
    $role=get_role('vne_library_editor');
    if (!$role) { $role=add_role('vne_library_editor','Biên tập thư viện',array('read'=>true)); }
    foreach (array($role,get_role('administrator')) as $target) {
        if (!$target) { continue; }
        $target->add_cap('vne_manage_library');
        foreach (vne_library_types() as $config) {
            foreach (array('edit_posts','edit_others_posts','publish_posts','read_private_posts','delete_posts','delete_private_posts','delete_published_posts','delete_others_posts','edit_private_posts','edit_published_posts','create_posts') as $cap) {
                $target->add_cap(str_replace('posts',$config[3],$cap));
            }
        }
    }
    update_option('vne_library_schema_version',1,false);flush_rewrite_rules(false);
}
function vne_library_error($message,$status=400) { return new WP_Error('vne_library_invalid',$message,array('status'=>$status)); }
function vne_library_keys($array,$allowed) { return is_array($array) && !array_diff(array_keys($array),$allowed); }
function vne_library_date($value) {
    if (!is_string($value) || !preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D',$value,$parts)) { return false; }
    return checkdate((int)$parts[2],(int)$parts[3],(int)$parts[1]);
}
function vne_library_https_url($value,$github=false) {
    if (!is_string($value) || strlen($value)>2048 || preg_match('/[\s\x00-\x1f]/',$value)) { return false; }
    $parts=wp_parse_url($value);
    if (!$parts || ($parts['scheme']??'')!=='https' || empty($parts['host']) || isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) { return false; }
    if ($github) {
        if (strtolower($parts['host'])!=='github.com' || isset($parts['query']) || isset($parts['fragment'])) { return false; }
        return (bool)preg_match('~^/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:/(?:tree|blob)/[A-Za-z0-9_./%+\~-]+)?/?$~D',$parts['path']??'');
    }
    return (bool)filter_var($value,FILTER_VALIDATE_URL);
}
function vne_library_default_claim() { return array('value'=>null,'verification_status'=>'unknown','source_url'=>null,'observed_at'=>null,'note'=>'Chưa xác định; cần kiểm tra nguồn trước khi sử dụng.','conflict_sources'=>array()); }
function vne_library_default_resource() {
    $claims=array();foreach(array('cost','license','requirements','permissions','compatibility') as $key){$claims[$key]=vne_library_default_claim();}
    return array('resource_type'=>'learn','source_url'=>'','repo_id'=>null,'source_path'=>'','source_revision'=>'','source_verified'=>false,'observed_at'=>'','claims'=>$claims);
}
function vne_library_validate_claim($claim,$name) {
    $allowed=array_keys(vne_library_default_claim());
    if (!vne_library_keys($claim,$allowed) || count($claim)!==count($allowed)) { return vne_library_error('Claim '.$name.' thiếu trường hoặc có trường không hợp lệ.'); }
    if (!in_array($claim['verification_status'],array('unknown','upstream_claimed','conflicted'),true) || !is_string($claim['note']) || strlen($claim['note'])>4000 || !is_array($claim['conflict_sources'])) { return vne_library_error('Trạng thái hoặc ghi chú claim '.$name.' không hợp lệ.'); }
    $note=sanitize_textarea_field($claim['note']);
    if ($claim['value']!==null && (!is_string($claim['value']) || strlen($claim['value'])>4000)) { return vne_library_error('Giá trị claim '.$name.' phải là text hoặc null.'); }
    if ($claim['source_url']!==null && !vne_library_https_url($claim['source_url'])) { return vne_library_error('Nguồn claim '.$name.' cần HTTPS hợp lệ.'); }
    if ($claim['observed_at']!==null && !vne_library_date($claim['observed_at'])) { return vne_library_error('Ngày claim '.$name.' không hợp lệ.'); }
    foreach($claim['conflict_sources'] as $url){if(!vne_library_https_url($url)){return vne_library_error('Nguồn mâu thuẫn không hợp lệ.');}}
    if(count($claim['conflict_sources'])>8){return vne_library_error('Quá nhiều nguồn mâu thuẫn.');}
    if($claim['verification_status']==='unknown' && ($claim['value']!==null || $note==='')){return vne_library_error('Chưa xác định phải giữ value null và có ghi chú.');}
    if($claim['verification_status']==='upstream_claimed' && ($claim['value']===null || trim($claim['value'])==='' || !$claim['source_url'] || !$claim['observed_at'])){return vne_library_error('Thông tin theo tác giả phải có giá trị, nguồn và ngày.');}
    if($claim['verification_status']==='conflicted' && (count(array_unique($claim['conflict_sources']))<2 || $note==='')){return vne_library_error('Thông tin mâu thuẫn cần ít nhất hai nguồn và ghi chú.');}
    $claim['value']=$claim['value']===null?null:sanitize_textarea_field($claim['value']);$claim['note']=$note;
    $claim['conflict_sources']=array_values(array_unique($claim['conflict_sources']));return $claim;
}
function vne_library_validate_resource($input,$publishing) {
    $default=vne_library_default_resource();
    if (!vne_library_keys($input,array_keys($default))) { return vne_library_error('Resource có trường không được phép.'); }
    $data=array_replace($default,$input);
    foreach(array('resource_type','source_url','source_path','source_revision','observed_at') as $key){if(!is_string($data[$key])){return vne_library_error('Trường '.$key.' phải là text.');}}
    if(!in_array($data['resource_type'],array('learn','skill','starter','tool'),true) || !is_bool($data['source_verified'])){return vne_library_error('Loại hoặc xác nhận nguồn không hợp lệ.');}
    if($data['source_url']!=='' && !vne_library_https_url($data['source_url'],true)){return vne_library_error('Nguồn tài nguyên cần URL GitHub HTTPS đúng repo/thư mục, không query hoặc userinfo.');}
    if($data['observed_at']!=='' && !vne_library_date($data['observed_at'])){return vne_library_error('Ngày đối chiếu nguồn không hợp lệ.');}
    if($data['repo_id']!==null && (!is_string($data['repo_id']) || !preg_match('/^[1-9][0-9]*$/D',$data['repo_id']))){return vne_library_error('Repo ID phải là chuỗi số dương hoặc null.');}
    if(strlen($data['source_path'])>256 || strlen($data['source_revision'])>128 || preg_match('~(^|/)\.\.?(/|$)|[\x00-\x1f<>]~',$data['source_path']) || preg_match('/[\x00-\x1f<>]/',$data['source_revision'])){return vne_library_error('Đường dẫn hoặc revision không hợp lệ.');}
    if($publishing && (!$data['source_url'] || !$data['source_verified'] || !$data['observed_at'] || !trim($data['source_revision']))){return vne_library_error('Chưa đủ nguồn, revision, ngày và xác nhận đối chiếu để xuất bản.');}
    if($data['resource_type']==='skill' && $publishing){$path=wp_parse_url($data['source_url'],PHP_URL_PATH);if(!$data['source_path'] || !preg_match('~/(tree|blob)/~',$path) || !str_ends_with(rtrim($path,'/'),'/'.$data['source_path'])){return vne_library_error('Skill cần URL và path thư mục cụ thể, không chỉ repo gốc.');}}
    if(!vne_library_keys($data['claims'],array_keys($default['claims']))){return vne_library_error('Nhóm claim không hợp lệ.');}
    foreach($default['claims'] as $name=>$claim){$validated=vne_library_validate_claim($data['claims'][$name]??$claim,$name);if(is_wp_error($validated)){return $validated;}$data['claims'][$name]=$validated;}
    return $data;
}
function vne_library_validate_payload($payload) {
    $allowed=array('id','post_type','title','content','excerpt','status','data','document_source','primary_category','categories','needs','tools','editorial_note');
    if(!vne_library_keys($payload,$allowed)){return vne_library_error('Payload có trường không được phép.');}
    $type=$payload['post_type']??'vne_resource';$status=$payload['status']??'draft';
    if(!is_string($type) || !isset(vne_library_types()[$type]) || !in_array($status,array('draft','publish','private'),true)){return vne_library_error('Loại nội dung hoặc trạng thái không hợp lệ.');}
    $clean=array('post_type'=>$type,'status'=>$status);
    foreach(array('title'=>240,'excerpt'=>1200,'content'=>60000,'editorial_note'=>8000) as $name=>$limit){$value=$payload[$name]??'';if(!is_string($value)||strlen($value)>$limit){return vne_library_error('Độ dài/kiểu '.$name.' không hợp lệ.');}$clean[$name]=$name==='content'?wp_kses_post($value):sanitize_textarea_field($value);}
    $clean['title']=sanitize_text_field($clean['title']);
    $primary=$payload['primary_category']??0;if(!is_int($primary)||$primary<0){return vne_library_error('Danh mục chính cần ID nguyên không âm.');}$clean['primary_category']=$primary;
    foreach(array('categories'=>'vne_category','needs'=>'vne_need','tools'=>'vne_tool') as $field=>$taxonomy){$ids=$payload[$field]??array();if(!is_array($ids)||count($ids)>30){return vne_library_error('Danh sách taxonomy không hợp lệ.');}foreach($ids as $id){if(!is_int($id)||$id<=0||!term_exists($id,$taxonomy)){return vne_library_error('ID taxonomy không tồn tại hoặc sai loại.');}}$clean[$field]=array_values(array_unique($ids));}
    if($primary){if(!term_exists($primary,'vne_category')){return vne_library_error('Danh mục chính không tồn tại.');}$clean['categories']=array_values(array_unique(array_merge($clean['categories'],array($primary))));}
    if($status==='publish' && (!$clean['title'] || !$clean['excerpt'] || !$primary)){return vne_library_error('Xuất bản cần tiêu đề, công dụng ngắn và danh mục chính.');}
    if($type==='vne_resource'){
        if(isset($payload['document_source'])){return vne_library_error('Tài nguyên dùng data, không dùng document_source.');}
        $clean['data']=vne_library_validate_resource($payload['data']??array(),$status==='publish');if(is_wp_error($clean['data'])){return $clean['data'];}
    }else{
        if(isset($payload['data'])){return vne_library_error('Hướng dẫn/bộ thực hành không dùng schema repo.');}
        $source=$payload['document_source']??array('source_url'=>'','observed_at'=>'','note'=>'');
        if(!vne_library_keys($source,array('source_url','observed_at','note')) || !isset($source['source_url'],$source['observed_at'],$source['note']) || !is_string($source['note']) || strlen($source['note'])>4000){return vne_library_error('Nguồn bài hướng dẫn không hợp lệ.');}
        if(($source['source_url']!==''&&!vne_library_https_url($source['source_url'])) || ($source['observed_at']!==''&&!vne_library_date($source['observed_at'])) || ($status==='publish'&&(!$source['source_url']||!$source['observed_at']||!$clean['content']))){return vne_library_error('Nguồn/ngày/nội dung hướng dẫn còn thiếu hoặc sai.');}
        $source['note']=sanitize_textarea_field($source['note']);$clean['document_source']=$source;
    }
    return $clean;
}
function vne_library_can_edit($id=0){return current_user_can('vne_manage_library') && (!$id || current_user_can('edit_post',$id));}
function vne_library_save_item($payload,$id=0) {
    if(!is_array($payload)){return vne_library_error('Payload phải là object.');}
    $id=absint($id);
    if(!vne_library_can_edit($id)){return vne_library_error('Bạn không có quyền sửa thư viện.',403);}
    if($id){$old=get_post($id);if(!$old||!isset(vne_library_types()[$old->post_type])){return vne_library_error('Không tìm thấy nội dung thư viện.',404);}if(isset($payload['post_type'])&&$payload['post_type']!==$old->post_type){return vne_library_error('Không đổi loại nội dung đã có.');}$payload['post_type']=$old->post_type;}
    $valid=vne_library_validate_payload($payload);if(is_wp_error($valid)){return $valid;}
    $object=get_post_type_object($valid['post_type']);if($valid['status']==='publish'&&!current_user_can($object->cap->publish_posts)){return vne_library_error('Không có quyền xuất bản.',403);}
    $meta=array('_vne_primary_category'=>$valid['primary_category'],'_vne_editorial_note'=>$valid['editorial_note']);
    $meta[$valid['post_type']==='vne_resource'?'_vne_resource':'_vne_document_source']=$valid['data']??$valid['document_source'];
    $saved=wp_insert_post(wp_slash(array('ID'=>$id,'post_type'=>$valid['post_type'],'post_title'=>$valid['title'],'post_content'=>$valid['content'],'post_excerpt'=>$valid['excerpt'],'post_status'=>$valid['status'],'meta_input'=>$meta,'tax_input'=>array('vne_category'=>$valid['categories'],'vne_need'=>$valid['needs'],'vne_tool'=>$valid['tools']))),true);
    if(is_wp_error($saved)){return $saved;}
    return vne_library_item($saved,true);
}
function vne_library_item($id,$edit=false) {
    $post=get_post($id);if(!$post||!isset(vne_library_types()[$post->post_type])){return vne_library_error('Không tìm thấy.',404);}
    if($edit){if(!vne_library_can_edit($id)){return vne_library_error('Không có quyền xem bản sửa.',403);}}elseif($post->post_status!=='publish'){return vne_library_error('Không tìm thấy.',404);}
    $result=array('id'=>(int)$id,'post_type'=>$post->post_type,'title'=>$post->post_title,'content'=>$post->post_content,'excerpt'=>$post->post_excerpt,'status'=>$post->post_status,'primary_category'=>(int)get_post_meta($id,'_vne_primary_category',true),'categories'=>wp_get_object_terms($id,'vne_category',array('fields'=>'ids')),'needs'=>wp_get_object_terms($id,'vne_need',array('fields'=>'ids')),'tools'=>wp_get_object_terms($id,'vne_tool',array('fields'=>'ids')));
    if($post->post_type==='vne_resource'){$result['data']=get_post_meta($id,'_vne_resource',true);}else{$result['document_source']=get_post_meta($id,'_vne_document_source',true);}
    if($edit){$result['editorial_note']=get_post_meta($id,'_vne_editorial_note',true);}
    return $result;
}
function vne_library_publication_guard($data,$postarr,$unsanitized=array(),$update=false) {
    if(($data['post_status']??'')!=='publish'||!isset(vne_library_types()[$data['post_type']??''])){return $data;}
    $id=absint($postarr['ID']??0);$input=array('post_type'=>$data['post_type'],'status'=>'publish','title'=>wp_unslash($data['post_title']),'content'=>wp_unslash($data['post_content']),'excerpt'=>wp_unslash($data['post_excerpt']),'primary_category'=>(int)($postarr['meta_input']['_vne_primary_category']??($id?get_post_meta($id,'_vne_primary_category',true):0)));
    if($data['post_type']==='vne_resource'){$input['data']=(isset($postarr['meta_input']['_vne_resource'])?wp_unslash($postarr['meta_input']['_vne_resource']):null)??($id?get_post_meta($id,'_vne_resource',true):array());}else{$input['document_source']=(isset($postarr['meta_input']['_vne_document_source'])?wp_unslash($postarr['meta_input']['_vne_document_source']):null)??($id?get_post_meta($id,'_vne_document_source',true):array());}
    if(is_wp_error(vne_library_validate_payload($input))){$data['post_status']='draft';}
    return $data;
}
