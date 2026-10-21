<?php
if (!defined('ABSPATH')) { exit; }

function vne_library_default_state() {
    $observation = array('status'=>'unknown', 'source_url'=>'', 'observed_at'=>'', 'note'=>'Chưa xác minh tình trạng hiện tại.');
    return array(
        'source_access'=>$observation,
        'maintenance'=>$observation,
        'recommendation'=>array('status'=>'normal', 'reason'=>''),
        'review'=>array('needed'=>false, 'reason'=>'', 'reviewed_at'=>'', 'review_due_at'=>'')
    );
}
function vne_library_state_input($id) {
    $stored=get_post_meta($id,'_vne_state',true);
    if (!is_array($stored)) { return vne_library_default_state(); }
    unset($stored['audit']);
    return array_replace_recursive(vne_library_default_state(),$stored);
}
function vne_library_validate_state($input) {
    $defaults=vne_library_default_state();
    if (!vne_library_keys($input,array_keys($defaults))) { return vne_library_error('Nhóm trạng thái không hợp lệ.'); }
    $input=array_replace($defaults,$input);
    foreach(array('source_access'=>array('available','unknown','unavailable'), 'maintenance'=>array('active','archived','unknown')) as $key=>$statuses) {
        $obs=$input[$key];
        if (!vne_library_keys($obs,array_keys($defaults[$key])) || count($obs)!==4 ||
            !in_array($obs['status']??null,$statuses,true) || !is_string($obs['note']??null) ||
            !is_string($obs['source_url']??null) || !is_string($obs['observed_at']??null) || strlen($obs['note'])>4000) {
            return vne_library_error('Quan sát nguồn không hợp lệ: '.$key);
        }
        if (($obs['source_url']!==''&&!vne_library_https_url($obs['source_url'])) ||
            ($obs['observed_at']!==''&&(!vne_library_date($obs['observed_at'])||$obs['observed_at']>current_time('Y-m-d'))) ||
            ($obs['status']!=='unknown'&&(!$obs['source_url']||!$obs['observed_at']||!trim($obs['note'])))) {
            return vne_library_error('Quan sát đã xác minh cần nguồn HTTPS, ngày và ghi chú.');
        }
        $input[$key]['note']=sanitize_textarea_field($obs['note']);
    }
    $rec=$input['recommendation'];$review=$input['review'];
    if (!vne_library_keys($rec,array('status','reason')) || count($rec)!==2 ||
        !in_array($rec['status']??null,array('normal','suspended'),true) || !is_string($rec['reason']??null) || strlen($rec['reason'])>4000) {
        return vne_library_error('Quyết định khuyến nghị không hợp lệ.');
    }
    $input['recommendation']['reason']=sanitize_textarea_field($rec['reason']);
    if (($rec['status']==='suspended'||$input['maintenance']['status']==='archived')&&!trim($input['recommendation']['reason'])) {
        return vne_library_error('Tạm ngừng hoặc duy trì repo archived cần lý do.');
    }
    if (!vne_library_keys($review,array('needed','reason','reviewed_at','review_due_at')) || count($review)!==4 ||
        !is_bool($review['needed']??null) || !is_string($review['reason']??null) || strlen($review['reason'])>4000) {
        return vne_library_error('Cờ rà soát không hợp lệ.');
    }
    foreach(array('reviewed_at','review_due_at') as $key) {
        if (!is_string($review[$key]??null)||($review[$key]!==''&&!vne_library_date($review[$key]))) { return vne_library_error('Ngày rà soát không hợp lệ.'); }
    }
    if (($review['reviewed_at']&&$review['reviewed_at']>current_time('Y-m-d')) ||
        ($review['reviewed_at']&&$review['review_due_at']&&$review['review_due_at']<$review['reviewed_at']) ||
        ($review['needed']&&!trim($review['reason']))) { return vne_library_error('Lý do hoặc thời hạn rà soát không hợp lệ.'); }
    $input['review']['reason']=sanitize_textarea_field($review['reason']);
    return $input;
}
function vne_library_save_state($id,$input) {
    if (!vne_library_can_edit($id)) { return vne_library_error('Không có quyền sửa trạng thái.',403); }
    $post=get_post($id);
    if (!$post||!isset(vne_library_types()[$post->post_type])) { return vne_library_error('Không tìm thấy.',404); }
    $valid=vne_library_validate_state($input);
    if (is_wp_error($valid)) { return $valid; }
    $old=vne_library_state_input($id);
    if (($valid['review']['needed']&&!$old['review']['needed']) || ($old['review']['review_due_at']&&$old['review']['review_due_at']<current_time('Y-m-d')&&$old['review']['review_due_at']!==$valid['review']['review_due_at'])) { update_post_meta($id,'_vne_review_epoch',(int)get_post_meta($id,'_vne_review_epoch',true)+1); }
    $valid['audit']=array('actor'=>get_current_user_id(),'changed_at'=>current_time('mysql',true));
    update_post_meta($id,'_vne_state',wp_slash($valid));
    return vne_library_item($id,true);
}
function vne_library_revision($id,$candidate=null) {
    $post=get_post($id);
    if (!$post||!isset(vne_library_types()[$post->post_type])) { return ''; }
    if ($post->post_type==='vne_resource') {
        $data=$candidate['data']??get_post_meta($id,'_vne_resource',true);
        $critical=array();
        foreach(array('source_url','source_path','source_revision') as $key) { $critical[$key]=$data[$key]??null; }
        $critical['claims']=array();
        foreach(array('cost','license','requirements','permissions','compatibility') as $name){
            $claim=$data['claims'][$name]??vne_library_default_claim();$sources=$claim['conflict_sources'];sort($sources);
            $critical['claims'][$name]=array('value'=>$claim['value'],'status'=>$claim['verification_status'],'source_url'=>$claim['source_url'],'conflict_sources'=>$sources);
        }
    } else {
        $critical=array('content'=>$candidate['content']??$post->post_content,'source'=>$candidate['document_source']['source_url']??(get_post_meta($id,'_vne_document_source',true)['source_url']??''),'dependencies'=>vne_library_dependencies($id));
    }
    return hash('sha256',wp_json_encode($critical,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
}
function vne_library_dependencies($id) {
    $value=get_post_meta($id,'_vne_dependencies',true);
    return is_array($value)?$value:array();
}
function vne_library_save_dependencies($id,$input) {
    if (!vne_library_can_edit($id)) { return vne_library_error('Không có quyền sửa liên kết.',403); }
    if (!in_array(get_post_type($id),array('vne_guide','vne_practice'),true)) { return vne_library_error('Chỉ hướng dẫn/bộ thực hành có dependency.'); }
    if (!is_array($input)||count($input)>30||array_values($input)!==$input) { return vne_library_error('Danh sách dependency không hợp lệ.'); }
    $seen=array();$clean=array();
    foreach($input as $dep) {
        if (!vne_library_keys($dep,array('resource_id','resource_revision','step','tool','version')) || count($dep)!==5 ||
            !is_int($dep['resource_id']??null) || get_post_type($dep['resource_id'])!=='vne_resource' || get_post_status($dep['resource_id'])!=='publish') {
            return vne_library_error('Dependency cần resource công khai có thật.');
        }
        foreach(array('resource_revision'=>64,'step'=>200,'tool'=>200,'version'=>200) as $key=>$limit) {
            if (!is_string($dep[$key]??null)||strlen($dep[$key])>$limit||!trim($dep[$key])) { return vne_library_error('Dependency thiếu revision/bước/công cụ/version.'); }
            $dep[$key]=sanitize_text_field($dep[$key]);
        }
        if (!hash_equals(vne_library_revision($dep['resource_id']),$dep['resource_revision'])) { return vne_library_error('Resource đã đổi; cần đối chiếu lại trước khi gắn.'); }
        $key=$dep['resource_id'].'/'.$dep['step'];
        if (isset($seen[$key])) { return vne_library_error('Dependency trùng bước.'); }
        $seen[$key]=true;$clean[]=$dep;
    }
    update_post_meta($id,'_vne_dependencies',wp_slash($clean));
    return vne_library_item($id,true);
}
function vne_library_validations($id) {
    $history=get_post_meta($id,'_vne_validation',false);
    return is_array($history)?$history:array();
}
function vne_library_record_validation($id,$input) {
    if (!vne_library_can_edit($id)||!current_user_can('vne_validate_library')) { return vne_library_error('Không có quyền ghi bằng chứng thử.',403); }
    if (!get_post($id)||!isset(vne_library_types()[get_post_type($id)])) { return vne_library_error('Không tìm thấy.',404); }
    $fields=array('revision','outcome','tested_at','os','tool','version','input','output','checklist','evidence_url');
    if (!vne_library_keys($input,$fields)||count($input)!==count($fields)) { return vne_library_error('Validation thiếu trường hoặc có trường không cho phép.'); }
    foreach($fields as $key) {
        if ($key==='checklist') { continue; }
        if (!is_string($input[$key])||!trim($input[$key])||strlen($input[$key])>4000) { return vne_library_error('Bằng chứng thiếu '.$key); }
    }
    if (!in_array($input['outcome'],array('pass','fail'),true)||!vne_library_date($input['tested_at'])||
        $input['tested_at']>current_time('Y-m-d')||!vne_library_https_url($input['evidence_url'])||
        !hash_equals(vne_library_revision($id),$input['revision'])||!is_array($input['checklist'])||
        !$input['checklist']||count($input['checklist'])>30) { return vne_library_error('Revision/ngày/nguồn/checklist bằng chứng không hợp lệ.'); }
    foreach($input['checklist'] as &$entry) {
        if (!is_string($entry)||!trim($entry)||strlen($entry)>1000) { return vne_library_error('Checklist cần mô tả kết quả từng mục.'); }
        $entry=sanitize_textarea_field($entry);if(!trim($entry)){return vne_library_error('Checklist không được rỗng sau làm sạch.');}
    }
    unset($entry);
    foreach($fields as $key) { if (!in_array($key,array('checklist','evidence_url'),true)) { $input[$key]=sanitize_textarea_field($input[$key]);if(!trim($input[$key])){return vne_library_error('Bằng chứng không được rỗng sau làm sạch.');} } }
    $input['review_epoch']=(int)get_post_meta($id,'_vne_review_epoch',true);
    $input['id']=wp_generate_uuid4();$input['actor']=get_current_user_id();$input['recorded_at']=current_time('mysql',true);
    if(!add_post_meta($id,'_vne_validation',wp_slash($input))){return vne_library_error('Không lưu được bằng chứng.',500);}
    return vne_library_item($id,true);
}
function vne_library_dependency_warnings($id) {
    $warnings=array();
    foreach(vne_library_dependencies($id) as $dep) {
        $resource=get_post($dep['resource_id']);$codes=array();
        if (!$resource||$resource->post_type!=='vne_resource'||$resource->post_status!=='publish') { $codes[]='dependency_hidden'; }
        else {
            if (!hash_equals(vne_library_revision($resource->ID),$dep['resource_revision'])) { $codes[]='dependency_changed'; }
            $state=vne_library_resolve_state($resource->ID);
            if ($state['recommendation_status']==='suspended') { $codes[]='dependency_suspended'; }
            if ($state['source_access_status']==='unavailable') { $codes[]='dependency_unavailable'; }
            if ($state['maintenance_status']==='archived') { $codes[]='dependency_archived'; }
            $data=get_post_meta($resource->ID,'_vne_resource',true);
            foreach(array('permissions','license','requirements') as $field){if(($data['claims'][$field]['verification_status']??'unknown')!=='upstream_claimed'){$codes[]='dependency_claim_risk';break;}}
            if ($state['validation_status']==='review_needed') { $codes[]='dependency_review_needed'; }
        }
        foreach($codes as $code) { $warnings[]=array('code'=>$code,'step'=>$dep['step']); }
    }
    return $warnings;
}
function vne_library_resolve_state($id,$candidate=null) {
    $post=get_post($id);$state=vne_library_state_input($id);$revision=vne_library_revision($id,$candidate);
    $history=vne_library_validations($id);$latest=$history?end($history):null;
    $dependencies=$post&&$post->post_type!=='vne_resource'?vne_library_dependency_warnings($id):array();
    $due=$state['review']['review_due_at'];
    $resource_data=$post&&$post->post_type==='vne_resource'?($candidate['data']??get_post_meta($id,'_vne_resource',true)):array();
    $claim_risk=false;$claim_warnings=array();
    foreach (($resource_data['claims']??array()) as $name=>$claim) {
        if ($claim['verification_status']==='conflicted') { $claim_warnings[]=array('code'=>'claim_conflicted','field'=>$name); }
        if ($claim['verification_status']==='unknown') { $claim_warnings[]=array('code'=>'claim_unknown','field'=>$name); }
        if (in_array($name,array('license','requirements','permissions'),true)&&$claim['verification_status']!=='upstream_claimed') { $claim_risk=true; }
    }
    $conflicted=(bool)array_filter($claim_warnings,function($warning){return $warning['code']==='claim_conflicted';});
    $needs_review=$conflicted||$state['review']['needed']||($due&&$due<current_time('Y-m-d'))||!empty($dependencies);
    $validation=$latest?'review_needed':'not_tested';
    if ($latest&&$latest['outcome']==='pass'&&hash_equals($revision,$latest['revision'])&&!$needs_review&&($latest['review_epoch']??0)===(int)get_post_meta($id,'_vne_review_epoch',true)) { $validation='tested'; }
    if ($needs_review) { $validation='review_needed'; }
    $access=$state['source_access']['status'];$maintenance=$state['maintenance']['status'];$recommendation=$state['recommendation']['status'];
    $warnings=array_merge($dependencies,$claim_warnings);
    foreach(array('unavailable'=>'source_unavailable','unknown'=>'access_unknown') as $value=>$code) {
        if ($access===$value) { $warnings[]=array('code'=>$code); }
    }
    if ($maintenance==='archived') { $warnings[]=array('code'=>'archived'); }
    if ($recommendation==='suspended') { $warnings[]=array('code'=>'suspended','reason'=>$state['recommendation']['reason']); }
    if ($validation==='review_needed') { $warnings[]=array('code'=>'review_needed','reason'=>$state['review']['reason']); }
    if ($due&&$due<current_time('Y-m-d')) { $warnings[]=array('code'=>'review_overdue'); }
    if (!$latest) { $warnings[]=array('code'=>'not_tested'); }
    $public=$post&&$post->post_status==='publish';
    $primary=!$public?'hidden':($recommendation==='suspended'?'suspended':($access==='unavailable'?'unavailable':($validation==='review_needed'?'review_needed':($maintenance==='archived'?'archived':($access==='unknown'?'access_unknown':$validation)))));
    $data=$post&&$post->post_type==='vne_resource'?($candidate['data']??get_post_meta($id,'_vne_resource',true)):($candidate['document_source']??get_post_meta($id,'_vne_document_source',true));
    $url=$data['source_url']??'';
    $verified=$post&&$post->post_type==='vne_resource'?($data['source_verified']??false):vne_library_https_url($url);
    $can_open=$public&&$recommendation!=='suspended'&&$access!=='unavailable'&&$verified&&vne_library_https_url($url);
    $cta=array('kind'=>$can_open?'source':(!$public?'none':($recommendation==='suspended'?'view_reason':'view_status')),'label'=>$can_open?($post->post_type==='vne_resource'?'Truy cập repo':'Xem nguồn'):(!$public?'':($recommendation==='suspended'?'Xem lý do':'Xem tình trạng')),'href'=>$can_open?$url:null);
    if ($latest) { unset($latest['actor'],$latest['review_epoch']); }
    $labels=array('hidden'=>'Không công khai','suspended'=>'Tạm ngừng khuyến nghị','unavailable'=>'Nguồn không truy cập được','review_needed'=>'Cần kiểm tra lại','archived'=>'Repo đã archived','access_unknown'=>'Chưa xác minh truy cập','tested'=>'Đã thử','not_tested'=>'Chưa thử');
    $messages=array('source_unavailable'=>'Nguồn không truy cập được theo lần đối chiếu đã ghi.','access_unknown'=>'Chưa xác minh truy cập hiện tại; không kết luận nguồn bị xóa.','archived'=>'Nguồn đã archived; cần xem giới hạn trước khi dùng.','suspended'=>'Tạm ngừng khuyến nghị theo quyết định biên tập.','review_needed'=>'Cần kiểm tra lại trước khi dựa vào kết quả thử cũ.','review_overdue'=>'Đã quá hạn rà soát.','not_tested'=>'Chưa có bằng chứng thử.','claim_unknown'=>'Thông tin này chưa xác định.','claim_conflicted'=>'Các nguồn cung cấp thông tin mâu thuẫn.','dependency_changed'=>'Phiên bản tài nguyên của bước này đã thay đổi.','dependency_hidden'=>'Tài nguyên của bước này không còn công khai.','dependency_suspended'=>'Tài nguyên của bước này đang tạm ngừng khuyến nghị.','dependency_unavailable'=>'Nguồn của bước này không truy cập được.','dependency_archived'=>'Nguồn của bước này đã archived.','dependency_review_needed'=>'Tài nguyên của bước này cần kiểm tra lại.','dependency_claim_risk'=>'Quyền, giấy phép hoặc yêu cầu của bước này chưa đủ rõ để đề xuất lệnh.');
    foreach($warnings as &$warning){$warning['message']=$messages[$warning['code']]??'Cần đối chiếu lại.';}unset($warning);
    return array('schema_version'=>1,'is_public'=>(bool)$public,'primary_badge'=>$primary,'primary_label'=>$labels[$primary],'observations'=>array('source_access'=>$state['source_access'],'maintenance'=>$state['maintenance']),'reviewed_at'=>$state['review']['reviewed_at'],'review_due_at'=>$due,'recommendation_reason'=>$state['recommendation']['reason'],'warnings'=>$warnings,
        'validation_status'=>$validation,'source_access_status'=>$access,'maintenance_status'=>$maintenance,'recommendation_status'=>$recommendation,
        'cta'=>$cta,'recommendation_eligible'=>(bool)($public&&$validation==='tested'&&$recommendation==='normal'&&$access==='available'&&($maintenance!=='archived'||trim($state['recommendation']['reason']))),
        'commands_allowed'=>(bool)($can_open&&$validation==='tested'&&$access==='available'&&$maintenance!=='archived'&&!$claim_risk),
        'current_revision'=>$revision,'latest_validation'=>$latest);
}
function vne_library_state_routes() {
    foreach(array('state'=>'vne_library_save_state','validations'=>'vne_library_record_validation','dependencies'=>'vne_library_save_dependencies') as $path=>$service) {
        register_rest_route('vne-library/v1','/items/(?P<id>\d+)/'.$path,array('methods'=>'POST',
            'permission_callback'=>function($request){return vne_library_can_edit((int)$request['id']);},
            'callback'=>function($request)use($service){return $service((int)$request['id'],$request->get_json_params());}));
    }
}

// Additive upgrade: no rewrite of existing posts, evidence, or source metadata.
function vne_library_maybe_upgrade(){
    if((int)get_option('vne_library_schema_version',0)!==1){return;}
    foreach(array('administrator','vne_library_editor') as $name){$role=get_role($name);if($role){$role->add_cap('vne_validate_library');}}
    update_option('vne_library_schema_version',2,false);
}