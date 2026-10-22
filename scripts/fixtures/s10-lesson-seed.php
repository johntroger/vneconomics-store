<?php
require '/wordpress/wp-load.php';
require_once ABSPATH.'wp-admin/includes/plugin.php';
activate_plugin('vne-library-core/vne-library-core.php');
wp_set_current_user(get_user_by('login','admin')->ID);switch_theme('vibelab');
update_option('blogname','VibeLab Việt');update_option('WPLANG','vi');update_option('permalink_structure','/%postname%/');
$t=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'Nền tảng web'));if(is_wp_error($t)){throw new Exception($t->get_error_message());}
$category=(int)$t['term_id'];
function s10_save($p){$r=vne_library_save_item($p);if(is_wp_error($r)){throw new Exception($r->get_error_message());}return $r;}
$p=array('post_type'=>'vne_guide','title'=>'Làm landing page Mộc Studio với Codex trên Windows','excerpt'=>'Bắt đầu từ thư mục mới: làm trang cho dịch vụ chụp ảnh hư cấu, kiểm tra, sửa và quay lại bản mốc.','content'=>S10_CONTENT,'status'=>'publish','primary_category'=>$category,'document_source'=>array('source_url'=>'https://learn.chatgpt.com/docs/windows/windows-app','observed_at'=>'2026-10-22','note'=>'MOC-WIN-1. Tài liệu chính thức đã đọc; bài mẫu chạy từ thư mục mới trên máy đã có công cụ. Chưa thử cài/đăng nhập trên Windows sạch hoặc chạy phiên AI mới từ đầu.'));
$guide=s10_save($p);
$state=vne_library_default_state();$state['source_access']=array('status'=>'available','source_url'=>$p['document_source']['source_url'],'observed_at'=>'2026-10-22','note'=>'Đã mở và đọc tài liệu chính thức ngày 22/10/2026; không phải kết quả cài ứng dụng.');
$r=vne_library_save_state($guide['id'],$state);if(is_wp_error($r)){throw new Exception($r->get_error_message());}
$p['title']='Đọc HTML và CSS sau bài đầu';$p['content']='<h2>Hiểu trang vừa tạo</h2><p>HTML tổ chức nội dung; CSS điều chỉnh cách trình bày. Đọc nguồn trước khi đổi nhiều thứ.</p>';$related=s10_save($p);
$p['title']='PRIVATE-S10-MUST-NOT-LEAK';$p['status']='private';$private=s10_save($p);
$p['title']='Bộ thực hành QA S10';$p['status']='publish';$p['post_type']='vne_practice';$p['content']='<h2 id="muc-goc">Bước QA</h2><p><a href="#muc-goc">Quay lại bước</a></p><pre>QA-CODE-SECRET</pre><ul class="lesson-checklist"><li>QA output</li></ul>';$practice=s10_save($p);
$d=vne_library_default_resource();$d['source_url']='https://github.com/example/s10-dependency-qa';$d['source_verified']=true;$d['source_revision']='qa-v1';$d['observed_at']='2026-10-22';
foreach($d['claims'] as &$c){$c=array('value'=>'QA giả lập','verification_status'=>'upstream_claimed','source_url'=>$d['source_url'],'observed_at'=>'2026-10-22','note'=>'Chỉ kiểm thử trạng thái, không phải dữ kiện repo.','conflict_sources'=>array());}unset($c);
$resource=s10_save(array('title'=>'QA dependency S10','excerpt'=>'Fixture giả lập không phải tài nguyên khuyến nghị.','content'=>'<p>QA</p>','status'=>'publish','primary_category'=>$category,'data'=>$d));
$dep=vne_library_save_dependencies($practice['id'],array(array('resource_id'=>$resource['id'],'resource_revision'=>vne_library_revision($resource['id']),'step'=>'Bước QA','tool'=>'QA','version'=>'qa-v1')));if(is_wp_error($dep)){throw new Exception($dep->get_error_message());}
flush_rewrite_rules(false);
$out=array();foreach(array('guide'=>$guide,'practice'=>$practice,'private'=>$private,'related'=>$related,'resource'=>$resource) as $name=>$row){$out[$name]=array('id'=>$row['id'],'url'=>get_permalink($row['id']));}
wp_set_current_user(0);echo wp_json_encode($out);
