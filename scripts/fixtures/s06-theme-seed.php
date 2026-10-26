<?php
require '/wordpress/wp-load.php';
require_once ABSPATH.'wp-admin/includes/plugin.php';
activate_plugin('vne-library-core/vne-library-core.php');
wp_set_current_user(get_user_by('login','admin')->ID);
switch_theme('vibelab');
update_option('blogname','VibeLab Việt');
update_option('WPLANG','vi');
update_option('permalink_structure','/%postname%/');
flush_rewrite_rules(false);
$groups=array();
foreach(array('Nền tảng web','Mẫu dự án','Skills cho AI agent') as $name){
    $t=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>$name));
    if(is_wp_error($t)){throw new Exception($t->get_error_message());}
    $groups[]=(int)$t['term_id'];
}
$rows=array(
array('Web Dev for Beginners','Hiểu các phần của một trang web trước khi nhờ AI viết và sửa mã.','https://github.com/microsoft/Web-Dev-For-Beginners','learn',0),
array('MDN Learning Area','Xem các ví dụ nhỏ để hiểu cấu trúc, bố cục và cách trình duyệt hiển thị.','https://github.com/mdn/learning-area','starter',1),
array('Web Design Guidelines','Một nguồn tham khảo để rà soát giao diện theo các quy tắc web.','https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines','skill',2),
array('Astro Basics','Tham khảo cấu trúc dự án Astro khi đã sẵn sàng dùng framework.','https://github.com/withastro/astro/tree/main/examples/basics','starter',1),
array('React Best Practices','Tham khảo hướng dẫn tối ưu React khi đã có dự án dùng công nghệ này.','https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices','skill',2),
array('Pico CSS','Tham khảo CSS tối giản; đọc tình trạng duy trì trước khi dùng.','https://github.com/picocss/pico','tool',1));
$ids=array();$observations=json_decode(S06_OBSERVATIONS,true);
foreach($rows as $row){
    $data=vne_library_default_resource();$data['resource_type']=$row[3];$data['source_url']=$row[2];$data['source_verified']=true;$parts=explode('/',trim(wp_parse_url($row[2],PHP_URL_PATH),'/'));$data['source_path']=count($parts)>4?implode('/',array_slice($parts,4)):'';foreach($observations as $observation){if($observation['repo']===$parts[0].'/'.$parts[1]){$data['source_revision']=$observation['sha'];}}$data['observed_at']='2026-10-19';
    $payload=array('title'=>$row[0],'excerpt'=>$row[1],'content'=>'<p>Giới thiệu biên tập từ mẫu S02. Chưa cài hoặc chạy thử bằng agent. Đọc tài liệu gốc trước khi sử dụng.</p>','status'=>'publish','primary_category'=>$groups[$row[4]],'data'=>$data,'editorial_note'=>'PRIVATE-EDITORIAL-S06');
    $item=vne_library_save_item($payload);
    if(is_wp_error($item)){throw new Exception($item->get_error_message());}
    $ids[]=$item['id'];
    if($row[0]==='Pico CSS'){
        $state=vne_library_default_state();$state['maintenance']=array('status'=>'archived','source_url'=>$row[2],'observed_at'=>'2026-10-19','note'=>'Quan sát lưu ở bằng chứng S02; không kiểm tra nguồn lại trong S06.');
        $state['recommendation']=array('status'=>'normal','reason'=>'Giữ để tham khảo và giải thích giới hạn; không đề xuất cho bài đầu.');
        $saved=vne_library_save_state($item['id'],$state);if(is_wp_error($saved)){throw new Exception($saved->get_error_message());}
    }
}
$guide=vne_library_save_item(array('post_type'=>'vne_guide','title'=>'Làm landing page cho một dịch vụ chụp ảnh.','excerpt'=>'Từ một brief nhỏ đến một trang có thể mở, sửa và tự kiểm tra. Ví dụ Mộc Studio là dịch vụ hư cấu.','content'=>'<p>Nội dung fixture S06 để thử liên kết tới bài đã duyệt. Bài học đầy đủ và tương tác thuộc S10.</p>','status'=>'publish','primary_category'=>$groups[0],'document_source'=>array('source_url'=>'https://github.com/microsoft/Web-Dev-For-Beginners','observed_at'=>'2026-10-19','note'=>'Nguồn mẫu S02; không thử cài Codex trong S06.')));
if(is_wp_error($guide)){throw new Exception($guide->get_error_message());}
$draft=$payload;$draft['title']='DRAFT-MUST-NOT-LEAK';$draft['status']='draft';$hidden=vne_library_save_item($draft);
if(is_wp_error($hidden)){throw new Exception($hidden->get_error_message());}
$private=$payload;$private['title']='PRIVATE-MUST-NOT-LEAK';$private['status']='private';$private=vne_library_save_item($private);
if(is_wp_error($private)){throw new Exception($private->get_error_message());}
$original=vne_library_item($ids[0],true);
$proposal=$payload;$proposal['title']='PENDING-MUST-NOT-LEAK';$proposal['data']=$original['data'];
$pending=vne_library_create_proposal($ids[0],array('base_revision'=>$original['approved_revision'],'payload'=>$proposal));
if(is_wp_error($pending)){throw new Exception($pending->get_error_message());}
wp_set_current_user(0);
$out=array('ids'=>$ids,'guide'=>$guide['id'],'draft'=>$hidden['id'],'private'=>$private['id'],'pending'=>$pending['id'],'cards'=>array());
foreach($ids as $id){$item=vne_library_item($id);$out['cards'][]=array('id'=>$id,'title'=>$item['title'],'url'=>get_permalink($id),'source'=>$item['data']['source_url'],'badge'=>$item['derived']['primary_label']);}
echo wp_json_encode($out);
