<?php
if (!defined('ABSPATH')) { exit; }

function vne_library_register_proposals() {
    register_post_type('vne_proposal',array('label'=>'Bản sửa thư viện','public'=>false,'publicly_queryable'=>false,'show_ui'=>false,'show_in_rest'=>false,'exclude_from_search'=>true,'query_var'=>false,'rewrite'=>false,'supports'=>array(),'capability_type'=>'vne_proposal','map_meta_cap'=>true));
}
function vne_library_editorial_snapshot($id) {
    $post=get_post($id);
    if (!$post||!isset(vne_library_types()[$post->post_type])) { return null; }
    $payload=array('post_type'=>$post->post_type,'title'=>$post->post_title,'content'=>$post->post_content,'excerpt'=>$post->post_excerpt,'status'=>$post->post_status,'primary_category'=>(int)get_post_meta($id,'_vne_primary_category',true),'editorial_note'=>get_post_meta($id,'_vne_editorial_note',true));
    foreach(array('categories'=>'vne_category','needs'=>'vne_need','tools'=>'vne_tool') as $key=>$tax) {
        $ids=wp_get_object_terms($id,$tax,array('fields'=>'ids'));$ids=array_map('intval',$ids);sort($ids);$payload[$key]=$ids;
    }
    $key=$post->post_type==='vne_resource'?'data':'document_source';
    $payload[$key]=get_post_meta($id,$post->post_type==='vne_resource'?'_vne_resource':'_vne_document_source',true);
    return $payload;
}
function vne_library_canonical_value($value) {
    if(!is_array($value)){return $value;}
    $is_list=array_is_list($value);
    foreach($value as $key=>$child){$value[$key]=vne_library_canonical_value($child);}
    if(!$is_list){ksort($value);}
    return $value;
}
function vne_library_approved_revision($id) {
    return hash('sha256',wp_json_encode(vne_library_canonical_value(array('generation'=>(int)get_post_meta($id,'_vne_content_generation',true),'slug'=>get_post_field('post_name',$id),'payload'=>vne_library_editorial_snapshot($id))),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
}

// add_option() can UPSERT after a concurrent existence check. A lock must never replace its owner.
function vne_library_lock_insert($name,$token) {
    global $wpdb;
    $created=$wpdb->query($wpdb->prepare("INSERT IGNORE INTO `{$wpdb->options}` (`option_name`,`option_value`,`autoload`) VALUES (%s,%s,'no')",$name,$token));
    wp_cache_delete($name,'options');
    wp_cache_delete('notoptions','options');
    return $created===1;
}

function vne_library_content_lock_key($id) { return 'vne_content_lock_'.(int)$id; }
function vne_library_content_transaction($id,$callback) {
    global $wpdb;
    $key=vne_library_content_lock_key($id);$token=wp_generate_uuid4();
    if (!vne_library_lock_insert($key,$token)) { return vne_library_error('Nội dung đang được xử lý; tải lại rồi đối chiếu phiên bản.',409); }
    $started=false;
    try {
        clean_post_cache($id);
        if ($wpdb->query('START TRANSACTION')===false) { throw new RuntimeException('Không khởi tạo được giao dịch.'); }
        $started=true;$result=$callback();
        if (is_wp_error($result)) {
            $wpdb->query('ROLLBACK');$started=false;clean_post_cache($id);wp_cache_delete('alloptions','options');
            return $result;
        }
        if ($wpdb->query('COMMIT')===false) { throw new RuntimeException('Không hoàn tất được giao dịch.'); }
        $started=false;clean_post_cache($id);
        return $result;
    } catch (Throwable $error) {
        if ($started) { $wpdb->query('ROLLBACK'); }
        clean_post_cache($id);wp_cache_delete('alloptions','options');
        return vne_library_error('Không áp dụng được thay đổi; giao dịch đã hủy. Vui lòng tải lại để kiểm tra.',500);
    } finally {
        // Only the owner removes the lock. No TTL or automatic lock stealing.
        $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name=%s AND option_value=%s",$key,$token));
        wp_cache_delete($key,'options');
    }
}
function vne_library_seal_content($id,$before,$event,$proposal_id=0) {
    $generation=(int)get_post_meta($id,'_vne_content_generation',true)+1;
    if (!update_post_meta($id,'_vne_content_generation',$generation)) { throw new RuntimeException('Generation write failed'); }
    $payload=vne_library_editorial_snapshot($id);$revision=vne_library_approved_revision($id);
    if (!update_post_meta($id,'_vne_approved_content',wp_slash(array('payload'=>$payload,'revision'=>$revision)))) { throw new RuntimeException('Snapshot write failed'); }
    if (!add_post_meta($id,'_vne_approval',wp_slash(array('event'=>$event,'proposal_id'=>$proposal_id,'before'=>$before,'after'=>$payload,'revision'=>$revision,'actor'=>get_current_user_id(),'recorded_at'=>current_time('mysql',true))))) { throw new RuntimeException('History write failed'); }
}
function vne_library_save_item($payload,$id=0,$base_revision=null) {
    if (!vne_library_can_edit($id)) { return vne_library_error('Không có quyền sửa nội dung.',403); }
    if ($id&&!current_user_can('vne_approve_library')) { return vne_library_error('Hãy tạo bản sửa chờ duyệt thay vì ghi trực tiếp.',403); }
    if(!$id&&is_array($payload)&&($payload['status']??'draft')==='publish'&&!current_user_can('vne_approve_library')){return vne_library_error('Không có quyền phát hành nội dung mới.',403);}
    if (!$id) {
        return vne_library_content_transaction(0,function()use($payload){
            $result=vne_library_write_item($payload,0);
            if (!is_wp_error($result)) { vne_library_seal_content($result['id'],null,'create');return vne_library_item($result['id'],true); }
            return $result;
        });
    }
    return vne_library_content_transaction($id,function()use($payload,$id,$base_revision){
        if (!vne_library_can_edit($id)||!current_user_can('vne_approve_library')) { return vne_library_error('Không còn quyền ghi.',403); }
        if ($base_revision!==null&&(!is_string($base_revision)||!hash_equals(vne_library_approved_revision($id),$base_revision))) { return vne_library_error('Phiên bản đã đổi; cần đối chiếu trước khi lưu.',409); }
        $before=vne_library_editorial_snapshot($id);
        $result=vne_library_write_item($payload,$id);
        if (is_wp_error($result)) { return $result; }
        vne_library_seal_content($id,$before,'manual');
        return vne_library_item($id,true);
    });
}
function vne_library_manual_api_save($request) {
    $payload=$request->get_json_params();$base=is_array($payload)?($payload['base_revision']??null):null;
    if (!is_string($base)||!preg_match('/^[a-f0-9]{64}$/D',$base)) { return vne_library_error('Lưu bài có sẵn cần base_revision.'); }
    unset($payload['base_revision']);
    return vne_library_save_item($payload,(int)$request['id'],$base);
}
function vne_library_proposal_record($pid) {
    $post=get_post($pid);
    if (!$post||$post->post_type!=='vne_proposal') { return vne_library_error('Không tìm thấy bản sửa.',404); }
    $record=get_post_meta($pid,'_vne_proposal_record',true);
    return is_array($record)?$record:vne_library_error('Bản sửa không đọc được.',500);
}
function vne_library_get_proposal($pid) {
    if(!vne_library_can_edit()){return vne_library_error('Không có quyền xem bản sửa.',403);}
    $record=vne_library_proposal_record($pid);
    if (is_wp_error($record)) { return $record; }
    if (!vne_library_can_edit($record['item_id'])) { return vne_library_error('Không có quyền xem bản sửa.',403); }
    $record['id']=(int)$pid;
    $record['is_stale']=$record['status']==='pending'&&!hash_equals($record['base_revision'],vne_library_approved_revision($record['item_id']));
    return $record;
}
function vne_library_create_proposal($id,$input) {
    if (!vne_library_can_edit($id)) { return vne_library_error('Không có quyền đề xuất.',403); }
    if (!vne_library_keys($input,array('base_revision','payload'))||!is_string($input['base_revision']??null)||!is_array($input['payload']??null)) { return vne_library_error('Đề xuất cần base_revision và payload.'); }
    return vne_library_content_transaction($id,function()use($id,$input){
        $base=vne_library_editorial_snapshot($id);
        if (!$base||!in_array($base['status'],array('publish','private','draft'),true)) { return vne_library_error('Nội dung chưa hỗ trợ đề xuất ở trạng thái này.'); }
        if (!hash_equals(vne_library_approved_revision($id),$input['base_revision'])) { return vne_library_error('Phiên bản gốc đã đổi; cần đối chiếu.',409); }
        $candidate=$input['payload'];
        if (($candidate['post_type']??$base['post_type'])!==$base['post_type']) { return vne_library_error('Không đổi loại nội dung.'); }
        $candidate['post_type']=$base['post_type'];$candidate['status']='publish';
        $valid=vne_library_validate_payload($candidate);
        if (is_wp_error($valid)) { return $valid; }
        $valid['status']=$base['status'];foreach(array('categories','needs','tools') as $taxonomy_field){sort($valid[$taxonomy_field],SORT_NUMERIC);}
        $changed=array();
        foreach($valid as $key=>$value) { if (vne_library_canonical_value($base[$key]??null)!==vne_library_canonical_value($value)) { $changed[]=$key; } }
        if (!$changed) { return vne_library_error('Bản sửa chưa có thay đổi.'); }
        $record=array('item_id'=>(int)$id,'base_revision'=>$input['base_revision'],'proposed_revision'=>hash('sha256',wp_json_encode($valid).wp_generate_uuid4()),'base_snapshot'=>$base,'payload'=>$valid,'changed_fields'=>$changed,'status'=>'pending','created_by'=>get_current_user_id(),'created_at'=>current_time('mysql',true),'decision'=>null);
        $pid=wp_insert_post(wp_slash(array('post_type'=>'vne_proposal','post_status'=>'private','post_parent'=>$id,'post_title'=>'Bản sửa cho #'.$id,'post_content'=>'')),true);
        if (is_wp_error($pid)) { return $pid; }
        if(!add_post_meta($pid,'_vne_proposal_record',wp_slash($record),true)){throw new RuntimeException('Proposal write failed');}
        // Seal legacy approved content without changing its revision or publication.
        if (!get_post_meta($id,'_vne_approved_content',true)) { update_post_meta($id,'_vne_approved_content',wp_slash(array('payload'=>$base,'revision'=>$input['base_revision']))); }
        return vne_library_get_proposal($pid);
    });
}
function vne_library_decide_proposal($pid,$decision,$reason) {
    $initial=vne_library_get_proposal($pid);
    if (is_wp_error($initial)) { return $initial; }
    if (!current_user_can('vne_approve_library')) { return vne_library_error('Không có quyền duyệt/bỏ.',403); }
    if (!in_array($decision,array('approved','rejected'),true)||!is_string($reason)||strlen($reason)>4000||!trim(sanitize_textarea_field($reason))) { return vne_library_error('Cần quyết định và ghi chú hợp lệ.'); }
    $id=$initial['item_id'];
    $result=vne_library_content_transaction($id,function()use($id,$pid,$decision,$reason){
        clean_post_cache($pid);$record=vne_library_proposal_record($pid);
        if (!vne_library_can_edit($id)||!current_user_can('vne_approve_library')) { return vne_library_error('Không còn quyền duyệt.',403); }
        if (is_wp_error($record)) { return $record; }
        if ($record['status']!=='pending') { return vne_library_error('Bản sửa đã được xử lý.',409); }
        if ($decision==='approved') {
            if (!hash_equals($record['base_revision'],vne_library_approved_revision($id))) { return vne_library_error('Bản sửa đã cũ; đối chiếu và tạo đề xuất mới.',409); }
            $result=vne_library_write_item($record['payload'],$id);
            if (is_wp_error($result)) { return $result; }
            vne_library_seal_content($id,$record['base_snapshot'],'approve',$pid);
        }
        $record['status']=$decision;
        $record['decision']=array('actor'=>get_current_user_id(),'recorded_at'=>current_time('mysql',true),'reason'=>sanitize_textarea_field($reason));
        if(!update_post_meta($pid,'_vne_proposal_record',wp_slash($record))){throw new RuntimeException('Decision write failed');}
        do_action('vne_library_before_approval_commit',$id,$pid,$decision);
        return $record;
    });
    clean_post_cache($pid);
    return is_wp_error($result)?$result:vne_library_get_proposal($pid);
}
function vne_library_preview_proposal($pid) {
    $record=vne_library_get_proposal($pid);
    if (is_wp_error($record)) { return $record; }
    $payload=$record['payload'];unset($payload['editorial_note']);
    $derived=vne_library_resolve_state($record['item_id'],$record['payload']);
    $derived['is_public']=false;$derived['recommendation_eligible']=false;
    return array('preview'=>true,'proposal_id'=>(int)$pid,'item_id'=>$record['item_id'],'status'=>$record['status'],'is_stale'=>$record['is_stale'],'base_revision'=>$record['base_revision'],'proposed_revision'=>$record['proposed_revision'],'changed_fields'=>$record['changed_fields'],'payload'=>$payload,'derived'=>$derived,'public_url'=>get_permalink($record['item_id']));
}
function vne_library_proposal_routes() {
    register_rest_route('vne-library/v1','/items/(?P<id>\d+)/proposals',array(
        array('methods'=>'POST','permission_callback'=>function($r){return vne_library_can_edit((int)$r['id']);},'callback'=>function($r){$result=vne_library_create_proposal((int)$r['id'],$r->get_json_params());return is_wp_error($result)?$result:new WP_REST_Response($result,201);}),
        array('methods'=>'GET','permission_callback'=>function($r){return vne_library_can_edit((int)$r['id']);},'callback'=>function($r){$posts=get_posts(array('post_type'=>'vne_proposal','post_status'=>'private','post_parent'=>(int)$r['id'],'numberposts'=>50,'orderby'=>'ID','order'=>'DESC'));return array_map(function($p){return vne_library_get_proposal($p->ID);},$posts);})
    ));
    foreach(array(''=>'GET','/preview'=>'GET','/approve'=>'POST','/reject'=>'POST') as $suffix=>$method) {
        register_rest_route('vne-library/v1','/proposals/(?P<pid>\d+)'.$suffix,array('methods'=>$method,'permission_callback'=>function($r){$result=vne_library_get_proposal((int)$r['pid']);return is_wp_error($result)?$result:true;},'callback'=>function($r)use($suffix){
            $pid=(int)$r['pid'];
            if ($suffix==='/preview') { return vne_library_preview_proposal($pid); }
            if ($suffix==='') { return vne_library_get_proposal($pid); }
            return vne_library_decide_proposal($pid,$suffix==='/approve'?'approved':'rejected',$r->get_json_params()['reason']??'');
        }));
    }
}
function vne_library_private_revision_headers($response,$server,$request) {
    if (preg_match('~^/vne-library/v1/(proposals(?:/|$)|items/\d+/proposals(?:/|$))~',$request->get_route())) {
        $response=rest_ensure_response($response);
        $response->header('Cache-Control','private, no-store, max-age=0');
        $response->header('X-Robots-Tag','noindex, nofollow, noarchive');
        $response->header('Vary','Cookie, Authorization');
    }
    return $response;
}
function vne_library_revision_upgrade() {
    $version=(int)get_option('vne_library_schema_version',0);
    if ($version!==2) { return; }
    foreach(array('administrator','vne_library_editor') as $name) { $role=get_role($name);if($role){$role->add_cap('vne_approve_library');} }
    update_option('vne_library_schema_version',3,false);
}
