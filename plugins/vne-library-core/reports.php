<?php
if(!defined('ABSPATH')){exit;}
function vne_report_register(){
    register_post_type('vne_report',array('label'=>'Báo lỗi riêng','public'=>false,'publicly_queryable'=>false,'exclude_from_search'=>true,'show_ui'=>false,'show_in_rest'=>false,'rewrite'=>false,'query_var'=>false,'can_export'=>false,'supports'=>array(),'map_meta_cap'=>false,'capabilities'=>array_fill_keys(array('read_post','edit_post','delete_post','edit_posts','edit_others_posts','publish_posts','read_private_posts','delete_posts','delete_private_posts','delete_published_posts','delete_others_posts','edit_private_posts','edit_published_posts','create_posts'),'vne_manage_library')));
}
add_action('init','vne_report_register');
function vne_support_pages(){return array('ho-tro'=>'Trợ giúp và liên hệ','gioi-thieu'=>'Về VibeLab Việt','tieu-chi'=>'Tiêu chí tuyển chọn','quyen-rieng-tu'=>'Quyền riêng tư','dieu-kien'=>'Điều kiện sử dụng','cau-hoi'=>'Câu hỏi thường gặp','bao-loi'=>'Báo lỗi nội dung');}
function vne_support_url($page='ho-tro',$args=array()){return add_query_arg(array_merge(array('vne_support'=>$page),$args),home_url('/'));}
function vne_report_error($code,$message,$status=400,$field=''){return new WP_Error('vne_report_'.$code,$message,array('status'=>$status,'field'=>$field));}
function vne_report_ticket($item){
    $ticket=array('resource_id'=>(string)$item['id'],'revision'=>$item['approved_revision'],'issued'=>(string)time(),'random'=>bin2hex(random_bytes(16)));
    $ticket['signature']=vne_report_signature($ticket);return $ticket;
}
function vne_report_signature($ticket){
    return hash_hmac('sha256',implode('|',array($ticket['resource_id'],$ticket['revision'],$ticket['issued'],$ticket['random'])),wp_salt('nonce'));
}
function vne_report_reusable_ticket($raw,$item){
    $keys=array('resource_id','revision','issued','random','signature');
    foreach($keys as $key){if(!is_string($raw[$key]??null)){return null;}}
    if($raw['resource_id']!==(string)$item['id']||$raw['revision']!==$item['approved_revision']||
        !preg_match('/^[0-9]{10}$/D',$raw['issued'])||!preg_match('/^[a-f0-9]{32}$/D',$raw['random'])||!preg_match('/^[a-f0-9]{64}$/D',$raw['signature'])){return null;}
    $age=time()-(int)$raw['issued'];
    if($age<0||$age>7200||!hash_equals(vne_report_signature($raw),$raw['signature'])){return null;}
    return array_intersect_key($raw,array_flip($keys));
}
function vne_report_receipt($post){
    $value=$post->post_title.'.'.time();
    return array('receipt'=>$value.'.'.hash_hmac('sha256',$value,wp_salt('auth')),'code'=>$post->post_title);
}
function vne_report_lock($key){
    $name='vne_report_lock_'.$key;$value=wp_generate_uuid4();
    return vne_library_lock_insert($name,$value)?array('name'=>$name,'value'=>$value):false;
}
function vne_report_unlock($lock){
    global $wpdb;
    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name=%s AND option_value=%s",$lock['name'],$lock['value']));
    wp_cache_delete($lock['name'],'options');
}
function vne_report_submit($raw){
    $allowed=array('nonce','resource_id','revision','issued','random','signature','kind','description','email','website','consent');
    if(!is_array($raw)||array_diff(array_keys($raw),$allowed)){return vne_report_error('fields','Biểu mẫu có trường không hợp lệ. Hãy mở lại từ trang nội dung.');}
    foreach($raw as $value){if(!is_string($value)||strlen($value)>8000){return vne_report_error('shape','Dữ liệu biểu mẫu không hợp lệ hoặc quá dài.');}}
    if(!wp_verify_nonce($raw['nonce']??'','vne_report_submit')){return vne_report_error('nonce','Phiên biểu mẫu không hợp lệ. Tải lại trang trước khi gửi.',403);}
    if(!preg_match('/^[1-9][0-9]{0,9}$/D',$raw['resource_id']??'')||!preg_match('/^[a-f0-9]{64}$/D',$raw['revision']??'')||!preg_match('/^[0-9]{10}$/D',$raw['issued']??'')||!preg_match('/^[a-f0-9]{32}$/D',$raw['random']??'')||!preg_match('/^[a-f0-9]{64}$/D',$raw['signature']??'')){
        return vne_report_error('ticket','Biểu mẫu không còn hợp lệ. Mở lại từ trang nội dung.',403);
    }
    $age=time()-(int)$raw['issued'];
    if($age<0||$age>7200||!hash_equals(vne_report_signature($raw),$raw['signature'])){return vne_report_error('ticket','Biểu mẫu đã hết hạn hoặc bị thay đổi. Tải lại trang.',403);}
    if(($raw['website']??'')!==''){return vne_report_error('spam','Chưa nhận báo cáo. Hãy tải lại biểu mẫu và thử lại.',400);}
    $ticket_hash=hash('sha256',$raw['signature']);
    $lock=vne_report_lock($ticket_hash);if(!$lock){return vne_report_error('busy','Yêu cầu này đang được xử lý. Chờ một chút rồi thử lại.',409);}
    $rate_lock=false;
    try{
        $previous=get_posts(array('post_type'=>'vne_report','post_status'=>'private','name'=>'report-'.$ticket_hash,'numberposts'=>1,'suppress_filters'=>true));
        if($previous){return vne_report_receipt($previous[0]);}
        $item=vne_library_item((int)$raw['resource_id']);
        if(is_wp_error($item)||empty($item['derived']['is_public'])){return vne_report_error('target','Nội dung này không còn công khai; báo cáo chưa được lưu.',404);}
        if(!hash_equals($item['approved_revision'],$raw['revision'])){return vne_report_error('revision','Nội dung đã đổi phiên bản. Đọc lại thông tin hiện tại trước khi gửi lại.',409);}
        $kinds=vne_report_kinds();$kind=$raw['kind']??'';
        if(!isset($kinds[$kind])){return vne_report_error('kind','Chọn một loại vấn đề trong danh sách.',400,'report-kind');}
        $description=sanitize_textarea_field($raw['description']??'');
        $length=preg_match_all('/./us',$description);
        if($length===false||$length<20||$length>2000){return vne_report_error('description','Mô tả cần từ 20 đến 2.000 ký tự; nêu điều bạn làm và kết quả quan sát được.',400,'report-description');}
        if(vne_report_contains_secret($raw['description']??'')||vne_report_contains_secret($description)){return vne_report_error('secret','Mô tả có dạng khóa hoặc mật khẩu. Hãy xóa bí mật và viết lại; nội dung này chưa được lưu.',400,'report-description');}
        $email=trim($raw['email']??'');
        if(strlen($email)>254||($email!==''&&!is_email($email))){return vne_report_error('email','Email chưa đúng định dạng; có thể để trống.',400,'report-email');}
        if(($raw['consent']??'')!=='1'){return vne_report_error('consent','Cần đồng ý gửi thông tin vào hàng đợi riêng trước khi lưu.',400,'report-consent');}
        // Only REMOTE_ADDR, never trust forwarded headers or retain the raw address.
        $bucket='vne_report_rate_'.hash_hmac('sha256',(string)($_SERVER['REMOTE_ADDR']??'unknown').'|'.floor(time()/900),wp_salt('auth'));
        $rate_lock=vne_report_lock(hash('sha256',$bucket));if(!$rate_lock){return vne_report_error('rate_busy','Có yêu cầu khác đang xử lý; chờ một chút rồi thử lại.',429);}
        $rate=get_transient($bucket);$rate=is_array($rate)?$rate:array('attempts'=>0,'saved'=>0);
        if($rate['attempts']>=10||$rate['saved']>=3){return vne_report_error('rate','Bạn đã gửi nhiều lần. Vui lòng chờ khoảng 15 phút trước khi thử lại.',429);}
        $rate['attempts']++;$rate['saved']++;set_transient($bucket,$rate,900);
        $record=array('resource_id'=>$item['id'],'resource_title'=>$item['title'],'resource_url'=>get_permalink($item['id']),'approved_revision'=>$item['approved_revision'],'kind'=>$kind,'description'=>$description,'email'=>$email,'submitted_at'=>gmdate('c'),'ticket_hash'=>$ticket_hash);
        $code='VNE-'.gmdate('Ymd').'-'.strtoupper(bin2hex(random_bytes(5)));
        $id=wp_insert_post(wp_slash(array('post_type'=>'vne_report','post_status'=>'private','post_name'=>'report-'.$ticket_hash,'post_title'=>$code,'post_content'=>wp_json_encode($record,JSON_UNESCAPED_UNICODE),'post_author'=>0,'comment_status'=>'closed','ping_status'=>'closed')),true);
        if(is_wp_error($id)||!$id){$rate['saved']--;set_transient($bucket,$rate,900);return vne_report_error('storage','Chưa lưu được báo cáo. Nội dung bạn nhập vẫn ở biểu mẫu; hãy thử lại sau.',503);}
        return vne_report_receipt(get_post($id));
    }catch(Throwable $error){return vne_report_error('storage','Chưa xác nhận được việc lưu. Hãy thử lại cùng biểu mẫu để tránh gửi lặp.',503);}
    finally{if($rate_lock){vne_report_unlock($rate_lock);}vne_report_unlock($lock);}
}
function vne_report_contains_secret($text){
    return (bool)preg_match('/(?:sk-[a-zA-Z0-9_-]{16,}|AIza[a-zA-Z0-9_-]{25,}|gh[pousr]_[a-zA-Z0-9]{20,}|-----BEGIN[^\r\n]*PRIVATE KEY-----|(?:password|api[_ -]?key|mật khẩu)\s*[:=]\s*\S{6,})/iu',$text);
}
function vne_report_kinds(){return array('link'=>'Liên kết nguồn bị lỗi','outdated'=>'Nội dung hoặc phiên bản lỗi thời','instructions'=>'Hướng dẫn không làm được','claims'=>'Chi phí, quyền hoặc giấy phép chưa đúng','other'=>'Vấn đề khác');}
function vne_support_controller(){
    if(!isset($_GET['vne_support'])){return;}
    $page=is_string($_GET['vne_support'])?$_GET['vne_support']:'';
    $ctx=array('page'=>$page,'error'=>null,'values'=>array(),'item'=>null,'receipt'=>null);
    if(!in_array($_SERVER['REQUEST_METHOD']??'GET',array('GET','HEAD','POST'),true)){$ctx['error']=vne_report_error('method','Trang này chỉ nhận phương thức của biểu mẫu.',405);status_header(405);nocache_headers();$GLOBALS['vne_support_context']=$ctx;return;}
    if(!isset(vne_support_pages()[$page])){$ctx['error']=vne_report_error('page','Không tìm thấy trang hỗ trợ.',404);}
    if($page==='bao-loi'){
        nocache_headers();header('X-Robots-Tag: noindex, nofollow');header('Referrer-Policy: no-referrer');
        if(isset($_GET['receipt'])){
            $token=is_string($_GET['receipt'])?$_GET['receipt']:'';
            $parts=explode('.',$token);$ctx['receipt']=false;
            if(count($parts)===3&&preg_match('/^VNE-[0-9]{8}-[A-F0-9]{10}$/D',$parts[0])&&preg_match('/^[0-9]{10}$/D',$parts[1])&&preg_match('/^[a-f0-9]{64}$/D',$parts[2])){
                $age=time()-(int)$parts[1];$expected=hash_hmac('sha256',$parts[0].'.'.$parts[1],wp_salt('auth'));
                if($age>=0&&$age<=900&&hash_equals($expected,$parts[2])){$ctx['receipt']=array('code'=>$parts[0]);}
            }
            if(!$ctx['receipt']){$ctx['error']=vne_report_error('receipt','Phiên xác nhận đã hết hạn hoặc không tồn tại. Điều này không chứng minh báo cáo trước đó đã thất bại.',410);}
        }elseif(isset($_GET['resource'])){
            $id=is_string($_GET['resource'])&&preg_match('/^[1-9][0-9]{0,9}$/D',$_GET['resource'])?(int)$_GET['resource']:0;
            $item=$id?vne_library_item($id):null;
            if(!$item||is_wp_error($item)||empty($item['derived']['is_public'])){$ctx['error']=vne_report_error('target','Nội dung không có trong thư viện công khai. Không có biểu mẫu để gửi.',404);}
            else{$ctx['item']=$item;}
        }
        if(($_SERVER['REQUEST_METHOD']??'GET')==='POST'){
            $raw=wp_unslash($_POST);$ctx['receipt']=null;$ctx['ticket']=$ctx['item']?vne_report_reusable_ticket($raw,$ctx['item']):null;
            $ctx['values']=array_map(function($value){return substr($value,0,8000);},array_intersect_key(array_filter($raw,'is_string'),array_flip(array('kind','description','email','consent'))));
            if(isset($ctx['values']['email'])&&vne_report_contains_secret($ctx['values']['email'])){$ctx['values']['email']='';}
            if(isset($ctx['values']['description'])&&vne_report_contains_secret($ctx['values']['description'])){$ctx['values']['description']='';}
            if(!empty($_FILES)){$ctx['error']=vne_report_error('files','Biểu mẫu không nhận tệp đính kèm.',400);}
            elseif(!$ctx['item']){$ctx['error']=vne_report_error('target','Mở biểu mẫu từ một nội dung công khai trước khi gửi.',404);}
            elseif(($raw['resource_id']??'')!==(string)$ctx['item']['id']){$ctx['error']=vne_report_error('target','Nội dung của biểu mẫu không khớp.',400);}
            else{
                $result=vne_report_submit($raw);
                if(is_wp_error($result)){$ctx['error']=$result;if($result->get_error_code()==='vne_report_secret'){$ctx['values']['description']='';}}
                else{wp_safe_redirect(vne_support_url('bao-loi',array('receipt'=>$result['receipt'])),303);exit;}
            }
        }
    }elseif(($_SERVER['REQUEST_METHOD']??'GET')!=='GET'&&($_SERVER['REQUEST_METHOD']??'GET')!=='HEAD'){
        $ctx['error']=vne_report_error('method','Trang này không nhận dữ liệu gửi.',405);
    }
    if($ctx['error']){status_header($ctx['error']->get_error_data()['status']);}
    $GLOBALS['vne_support_context']=$ctx;
}
add_action('template_redirect','vne_support_controller',1);
function vne_report_frontend_guard(){
    if(get_post_type(get_queried_object_id())==='vne_report'||get_query_var('post_type')==='vne_report'){
        global $wp_query;$wp_query->set_404();status_header(404);nocache_headers();
    }
}
add_action('template_redirect','vne_report_frontend_guard',2);
function vne_report_admin_menu(){add_submenu_page('vne-library','Báo lỗi riêng','Báo lỗi riêng','vne_manage_library','vne-reports','vne_report_admin_page');}
add_action('admin_menu','vne_report_admin_menu');
function vne_report_admin_preflight(){
    if(($_GET['page']??'')!=='vne-reports'){return;}
    if(!current_user_can('vne_manage_library')){wp_die('Không có quyền xem báo cáo.','',array('response'=>403));}
    nocache_headers();
    if(($_SERVER['REQUEST_METHOD']??'')==='POST'){check_admin_referer('vne_reports_delete');
        $id=is_string($_POST['report_id']??null)&&preg_match('/^[1-9][0-9]{0,9}$/D',$_POST['report_id'])?(int)$_POST['report_id']:0;
        if(!$id||get_post_type($id)!=='vne_report'){wp_die('Báo cáo không hợp lệ.','',array('response'=>400));}
        if(!wp_delete_post($id,true)){wp_die('Chưa xóa được báo cáo.','',array('response'=>503));}
        wp_safe_redirect(admin_url('admin.php?page=vne-reports&removed=1'));exit;
    }
}
add_action('admin_init','vne_report_admin_preflight');
function vne_report_admin_page(){
    if(!current_user_can('vne_manage_library')){wp_die('Không có quyền.','',array('response'=>403));}
    $page=isset($_GET['paged'])&&is_scalar($_GET['paged'])?max(1,absint($_GET['paged'])):1;
    $q=new WP_Query(array('post_type'=>'vne_report','post_status'=>'private','posts_per_page'=>20,'paged'=>$page,'orderby'=>'ID','order'=>'DESC'));
    echo '<div class="wrap"><h1>Báo lỗi riêng</h1><p>Hàng đợi nội bộ. Không có email tự động, không tự sửa tài nguyên. Chỉ người có quyền biên tập thư viện được xem/xóa. Xóa khi không còn cần; rà soát ít nhất các báo cáo quá 30 ngày.</p>';
    if(isset($_GET['removed'])){echo '<div class="notice notice-success"><p>Đã xóa báo cáo khỏi database hiện tại. Bản sao lưu có vòng đời riêng.</p></div>';}
    if(!$q->posts){echo '<p>Chưa có báo cáo trong hàng đợi.</p>';}
    foreach($q->posts as $post){$r=json_decode($post->post_content,true);if(!is_array($r)){continue;}
        echo '<article style="background:white;border:1px solid #ccd0d4;padding:18px;margin:18px 0"><h2>'.esc_html($post->post_title).'</h2><p>'.esc_html($r['submitted_at']).' · '.esc_html(vne_report_kinds()[$r['kind']]??'Vấn đề khác').'</p><h3>'.esc_html($r['resource_title']).'</h3><p><a href="'.esc_url($r['resource_url']).'">Mở nội dung liên quan</a> · ID '.(int)$r['resource_id'].'</p><p>Phiên bản đã nhận: <code>'.esc_html($r['approved_revision']).'</code></p><p style="white-space:pre-wrap">'.esc_html($r['description']).'</p><p>Email tùy chọn: '.esc_html($r['email']?:'Không cung cấp').'</p><form method="post">';
        wp_nonce_field('vne_reports_delete');echo '<input type="hidden" name="report_id" value="'.(int)$post->ID.'"><button type="submit" class="button">Xóa báo cáo này</button></form></article>';
    }
    echo paginate_links(array('base'=>add_query_arg('paged','%#%'),'format'=>'','current'=>$page,'total'=>$q->max_num_pages));echo '</div>';
}

function vne_report_block_front_query($query){
    if(is_admin()||!$query->is_main_query()){return;}
    $raw_types=array_map('sanitize_key',array_filter((array)($_GET['post_type']??array()),'is_string'));
    $types=array_merge((array)$query->get('post_type'),$raw_types);$id=(int)($query->get('p')?:$query->get('page_id'));
    if(in_array('vne_report',$types,true)||($id&&get_post_type($id)==='vne_report')){
        $query->set('_vne_report_blocked',true);$query->set('post__in',array(0));$query->set('p',0);$query->set('page_id',0);$query->set('post_type','post');
    }
}
add_action('pre_get_posts','vne_report_block_front_query',999);
add_action('template_redirect',function(){global $wp_query;if($wp_query->get('_vne_report_blocked')){$wp_query->set_404();status_header(404);nocache_headers();}},2);
