<?php
require '/wordpress/wp-load.php';
wp_set_current_user(get_user_by('login','admin')->ID);
wp_set_password(S08_PASSWORD,get_current_user_id());
$base=json_decode(S08_BASE,true);$target=$base['ids'][2];$checks=array();
function s08_check($ok,$label){global $checks;if(!$ok){throw new Exception($label);}$checks[]=$label;}
function s08_payload($item){return array_intersect_key($item,array_flip(array('post_type','title','content','excerpt','status','primary_category','categories','needs','tools','data','document_source','editorial_note')));}
function s08_save($payload,$id=0){$token=$id?vne_library_item($id,true)['approved_revision']:null;$item=vne_library_save_item($payload,$id,$token);s08_check(!is_wp_error($item),'save '.($payload['title']??''));return $item;}
$item=vne_library_item($target,true);$category=$item['primary_category'];
$p=s08_payload($item);$p['editorial_note']='INTERNAL-S08-NOTE';$p['content']='<h1 id="nguon">Giới thiệu đã duyệt S08</h1><p>Nội dung minh họa cách trình bày, không phải kết quả cài skill.</p><h2 id="vi-du">Ví dụ đã duyệt</h2><p><a href="#vi-du">Đọc ví dụ trong bài</a> / <a href="#khong-co">Chú thích không có đích</a></p><p><a href="'.$p['data']['source_url'].'">Nguồn giới thiệu</a></p><img src="https://example.com/s08-tracker.png" alt="REMOTE-MEDIA-MUST-NOT-LOAD"><pre><code>QA-CODE-BLOCKED</code></pre>';
$item=s08_save($p,$target);
$pending=$p;$pending['title']='PENDING-S08-MUST-NOT-LEAK';$pending['excerpt']='PENDING-EXCERPT-S08-MUST-NOT-LEAK';$pending['content']='<p>PENDING-CONTENT-S08-MUST-NOT-LEAK</p>';$pending['data']['source_url']='https://github.com/example/pending-s08';$pending['data']['source_path']='';$pending['data']['resource_type']='learn';
$proposal=vne_library_create_proposal($target,array('base_revision'=>$item['approved_revision'],'payload'=>$pending));s08_check(!is_wp_error($proposal),'create private changed title/source/content proposal');
$normal=array();
for($n=1;$n<=5;$n++){
    $data=vne_library_default_resource();$data['source_url']='https://github.com/example/s08-related-'.$n;$data['source_revision']='qa-r1';$data['source_verified']=true;$data['observed_at']='2026-10-21';
    $related=s08_save(array('title'=>'QA Cùng chủ đề '.$n,'excerpt'=>'Dữ liệu QA S08, không phải đề xuất repo thật.','content'=>'<p>Fixture S08.</p>','status'=>'publish','primary_category'=>$category,'data'=>$data));
    $normal[]=$related['id'];
    if($n>=4){$state=vne_library_default_state();if($n===4){$state['recommendation']=array('status'=>'suspended','reason'=>'QA tạm ngừng');}else{$state['source_access']=array('status'=>'unavailable','source_url'=>'https://example.com/qa','observed_at'=>'2026-10-21','note'=>'QA giả lập không truy cập được');}s08_check(!is_wp_error(vne_library_save_state($related['id'],$state)),'related warning '.$n);}
}
$guide=s08_save(array('post_type'=>'vne_guide','title'=>'Bài đọc cùng chủ đề S08','excerpt'=>'Nội dung QA, chưa xác nhận đã sử dụng skill này.','content'=>'<p>Đọc cùng chủ đề, chưa có quy trình cài đặt.</p>','status'=>'publish','primary_category'=>$category,'document_source'=>array('source_url'=>'https://example.com/qa-guide','observed_at'=>'2026-10-21','note'=>'QA')));
$privateGuide=s08_payload(vne_library_item($guide['id'],true));$privateGuide['title']='PRIVATE-GUIDE-S08-MUST-NOT-LEAK';$privateGuide['status']='private';$privateGuide=s08_save($privateGuide);
$hidden=s08_payload(vne_library_item($normal[0],true));$hidden['title']='PRIVATE-RESOURCE-S08-MUST-NOT-LEAK';$hidden['status']='private';$hidden=s08_save($hidden);
$draft=s08_payload(vne_library_item($normal[0],true));$draft['title']='DRAFT-RESOURCE-S08-MUST-NOT-LEAK';$draft['status']='draft';$draft=s08_save($draft);
$data=vne_library_default_resource();$data['source_url']='https://github.com/example/s08-tested';$data['source_revision']='qa-tested-r1';$data['source_verified']=true;$data['observed_at']='2026-10-21';
foreach($data['claims'] as $key=>&$claim){$claim=array('value'=>'Giá trị QA của '.$key.'; không là cam kết về repo thật','verification_status'=>'upstream_claimed','source_url'=>'https://example.com/qa-'.$key,'observed_at'=>'2026-10-21','note'=>'Fixture S08 để kiểm thử, không xác minh nguồn bên ngoài','conflict_sources'=>array());}unset($claim);
$tested=s08_save(array('title'=>'QA Tài nguyên có ghi nhận thử S08','excerpt'=>'Bằng chứng giả lập trong fixture để kiểm tra nhãn, không phải repo thật đã chạy.','content'=>'<p>Fixture phiên bản đã ghi thử.</p><pre><code>QA-CODE-ALLOWED</code></pre>','status'=>'publish','primary_category'=>$category,'data'=>$data));
$state=vne_library_default_state();foreach(array('source_access'=>'available','maintenance'=>'active') as $axis=>$value){$state[$axis]=array('status'=>$value,'source_url'=>'https://example.com/qa-observation','observed_at'=>'2026-10-21','note'=>'QA giả lập, không phải dữ kiện thực');}
s08_check(!is_wp_error(vne_library_save_state($tested['id'],$state)),'set tested fixture observations');
$validation=vne_library_record_validation($tested['id'],array('revision'=>vne_library_revision($tested['id']),'outcome'=>'pass','tested_at'=>'2026-10-21','os'=>'Windows QA','tool'=>'Agent QA','version'=>'1.0 QA','input'=>'Đầu vào QA','output'=>'Đầu ra QA','checklist'=>array('Điểm kiểm tra QA một','Điểm kiểm tra QA hai'),'evidence_url'=>'https://example.com/qa-evidence'));
s08_check(!is_wp_error($validation),'record current QA evidence');
$newcat=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'Mục riêng S08'));s08_check(!is_wp_error($newcat),'create lonely category');
$lonely=s08_payload(vne_library_item($normal[0],true));$lonely['title']='Tài nguyên riêng S08';$lonely['primary_category']=(int)$newcat['term_id'];$lonely['categories']=array();$lonely['content']='';$lonely['data']['source_url']='https://github.com/example/s08-lonely';$lonely=s08_save($lonely);
// Raw post columns disagree with snapshot; no unapproved rendering in body or head.
global $wpdb;$wpdb->update($wpdb->posts,array('post_title'=>'RAW-S08-MUST-NOT-LEAK','post_content'=>'RAW-CONTENT-S08-MUST-NOT-LEAK','post_excerpt'=>'RAW-EXCERPT-S08-MUST-NOT-LEAK'),array('ID'=>$target));clean_post_cache($target);
wp_set_current_user(0);$public=vne_library_item($target);s08_check($public['title']==='Web Design Guidelines','canonical target unchanged');
echo wp_json_encode(array('checks'=>$checks,'target'=>$target,'target_url'=>get_permalink($target),'source'=>$public['data']['source_url'],'source_path'=>$public['data']['source_path'],'source_revision'=>$public['data']['source_revision'],'proposal'=>$proposal['id'],'related'=>$normal,'guide'=>$guide['id'],'private_guide'=>$privateGuide['id'],'private'=>$hidden['id'],'private_url'=>get_permalink($hidden['id']),'draft_url'=>get_permalink($draft['id']),'tested'=>$tested['id'],'tested_url'=>get_permalink($tested['id']),'lonely'=>$lonely['id'],'lonely_url'=>get_permalink($lonely['id'])));
