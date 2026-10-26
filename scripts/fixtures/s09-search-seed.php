<?php
require '/wordpress/wp-load.php';
require_once ABSPATH.'wp-admin/includes/plugin.php';
activate_plugin('vne-library-core/vne-library-core.php');wp_set_current_user(get_user_by('login','admin')->ID);switch_theme('vibelab');
update_option('blogname','VibeLab Việt');update_option('WPLANG','vi');update_option('permalink_structure','/%postname%/');flush_rewrite_rules(false);
$checks=array();function s09_check($ok,$label){global $checks;if(!$ok){throw new Exception($label);}$checks[]=$label;}
function s09_term($tax,$name,$parent=0){$r=vne_library_create_term(array('taxonomy'=>$tax,'name'=>$name,'parent'=>$parent));s09_check(!is_wp_error($r),'term '.$name);$t=get_term($r['term_id'],$tax);return array('id'=>$t->term_id,'slug'=>$t->slug,'url'=>get_term_link($t));}
$terms=array();$terms['web']=s09_term('vne_category','Làm website');$terms['skill']=s09_term('vne_category','Skills cho AI agent');$terms['html']=s09_term('vne_category','HTML cơ bản',$terms['web']['id']);$terms['empty']=s09_term('vne_category','Danh mục chưa có nội dung');
$terms['website']=s09_term('vne_need','Làm website');$terms['design']=s09_term('vne_need','Thiết kế giao diện');$terms['codex']=s09_term('vne_tool','Codex');$terms['claude']=s09_term('vne_tool','Claude Code');
$rows=array(
array('Landing page chụp ảnh','web',array('website'),array('codex'),'2026-10-20'),
array('Landing page cà phê','web',array('website'),array('claude'),'2026-10-21'),
array('Kỹ năng thiết kế','skill',array('design'),array('codex'),'2026-10-19'),
array('Bộ mẫu CSS','html',array('website'),array('codex','claude'),'2026-10-19'),
array('Vibe coding từ đầu','web',array('website'),array(),'2026-10-18'),
array('Vibecode cho dịch vụ','web',array('website'),array('codex'),'2026-10-21'),
array('Danh sách kiểm tra','web',array('design'),array(),'2026-10-21'),
array('Sửa giao diện CSS','html',array('design'),array('claude'),'2026-10-19'),
array('Mẫu portfolio','web',array('website'),array('codex'),'2026-10-20'),
array('Tự động ghi chú','skill',array(),array('claude'),'2026-10-20'),
array('Z Công cụ ảnh','skill',array('design'),array('codex'),'2026-10-21'),
array('Z Công cụ ảnh','skill',array('design'),array('codex'),'2026-10-21'));
$resources=array();$payloads=array();
foreach($rows as $i=>$row){
 $data=vne_library_default_resource();$data['source_url']='https://github.com/example/s09-fixture-'.($i+1);$data['source_revision']='qa-r1';$data['source_verified']=true;$data['observed_at']=$row[4];
 if($i===2){$data['resource_type']='skill';$data['source_url'].='/tree/main/skills/design';$data['source_path']='skills/design';}
 $p=array('title'=>$row[0],'excerpt'=>'Fixture QA S09, không phải repo thật được tuyển chọn.','content'=>$i===0?'<p>Mộc Studio là dịch vụ hư cấu cho bài mẫu.</p>':'<p>Nội dung giả lập cho kiểm thử.</p>','status'=>'publish','primary_category'=>$terms[$row[1]]['id'],'needs'=>array_map(function($key)use($terms){return $terms[$key]['id'];},$row[2]),'tools'=>array_map(function($key)use($terms){return $terms[$key]['id'];},$row[3]),'data'=>$data,'editorial_note'=>'INTERNAL-S09-MUST-NOT-LEAK');
 $item=vne_library_save_item($p);s09_check(!is_wp_error($item),'resource '.($i+1));$resources[]=array('id'=>$item['id'],'url'=>get_permalink($item['id']),'title'=>$item['title']);$payloads[]=$p;
}
$guides=array();foreach(array(array('Không mở được terminal','vne_guide','web'),array('Học HTML qua landing page','vne_guide','html'),array('Thực hành chụp ảnh','vne_practice','web'),array('Vibe coding trên Windows','vne_guide','web')) as $i=>$row){
 $p=array('post_type'=>$row[1],'title'=>$row[0],'excerpt'=>'Bài đọc QA, không phải hướng dẫn đã nghiệm thu.','content'=>'<p>Nội dung fixture, chưa có lệnh cài đặt.</p>','status'=>'publish','primary_category'=>$terms[$row[2]]['id'],'needs'=>array($terms[$i===2?'design':'website']['id']),'tools'=>$i===2?array():array($terms['codex']['id']),'document_source'=>array('source_url'=>'https://example.com/s09-guide','observed_at'=>'2026-10-21','note'=>'Fixture QA'));
 $r=vne_library_save_item($p);s09_check(!is_wp_error($r),'guide '.($i+1));$guides[]=array('id'=>$r['id'],'url'=>get_permalink($r['id']));
}
$hidden=s09_term('vne_need','PRIVATE-FACET-S09-MUST-NOT-LEAK');
foreach(array('draft','private') as $status){$p=$payloads[0];$p['title']=strtoupper($status).'-S09-MUST-NOT-LEAK';$p['status']=$status;$p['needs']=array($hidden['id']);$r=vne_library_save_item($p);s09_check(!is_wp_error($r),'hidden '.$status);}
$pending=$payloads[0];$pending['title']='PENDING-S09-MUST-NOT-LEAK';$pending['content']='<p>candidatesecretquery</p>';$pending['needs']=array($hidden['id']);
$r=vne_library_create_proposal($resources[0]['id'],array('base_revision'=>vne_library_item($resources[0]['id'],true)['approved_revision'],'payload'=>$pending));s09_check(!is_wp_error($r),'pending proposal excluded from search');
global $wpdb;$wpdb->update($wpdb->posts,array('post_title'=>'RAW-S09-MUST-NOT-LEAK','post_content'=>'rawsecretquery','post_excerpt'=>'RAW-EXCERPT-S09-MUST-NOT-LEAK'),array('ID'=>$resources[0]['id']));wp_set_object_terms($resources[0]['id'],array($hidden['id']),'vne_need');clean_post_cache($resources[0]['id']);
wp_set_current_user(0);
echo wp_json_encode(array('resources'=>$resources,'guides'=>$guides,'terms'=>$terms,'archive'=>get_post_type_archive_link('vne_resource'),'guide_archive'=>get_post_type_archive_link('vne_guide'),'checks'=>$checks));
