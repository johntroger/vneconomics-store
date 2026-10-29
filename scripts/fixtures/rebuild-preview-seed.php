<?php
require '/wordpress/wp-load.php';
$saved=get_option('vne_rebuild_preview_seed');
if($saved){
    if(($saved['owner']??'')!=='vne-rebuild-preview-v1')throw new Exception('Unknown seed owner');
    if(get_stylesheet()!=='vibelab-v2')throw new Exception('Preview theme changed; inspect before retry');
    echo wp_json_encode($saved);return;
}
foreach(array('vne_resource','vne_guide','vne_practice') as $type){
    if(get_posts(array('post_type'=>$type,'post_status'=>'any','numberposts'=>1)))throw new Exception('Refusing to seed existing library content');
}
wp_set_current_user(get_user_by('login','admin')->ID);
switch_theme('vibelab-v2');update_option('blog_public',0);update_option('blogname','VibeLab — Preview local');
update_option('permalink_structure','/%postname%/');
$term=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'Mẫu local'));
if(is_wp_error($term))throw new Exception($term->get_error_message());
$category=(int)$term['term_id'];$resources=array();
foreach(array('Astro','Pico CSS') as $index=>$name){
    $data=vne_library_default_resource();$data['source_url']=$index?'https://github.com/picocss/pico':'https://github.com/withastro/astro';
    $data['source_verified']=true;$data['source_revision']='LOCAL-FIXTURE-NOT-VERIFICATION';$data['observed_at']='2026-10-29';
    $item=vne_library_save_item(array('title'=>'Mẫu local '.$name,'excerpt'=>'Nội dung tổng hợp để thử giao diện; chưa xác minh hoặc thử công cụ.','content'=>'<p>Dữ liệu mẫu local, không dùng để phát hành.</p>','status'=>'publish','primary_category'=>$category,'data'=>$data,'editorial_note'=>'LOCAL-PRIVATE-NOTE-MUST-NOT-LEAK'));
    if(is_wp_error($item))throw new Exception($item->get_error_message());
    $resources[]=array('id'=>$item['id'],'path'=>wp_parse_url(get_permalink($item['id']),PHP_URL_PATH));
}
$guide=vne_library_save_item(array('post_type'=>'vne_guide','title'=>'Mẫu local: hướng dẫn Astro','excerpt'=>'Bài mẫu để thử danh sách và mục lục.','content'=>'<h2>Chuẩn bị</h2><p>Ví dụ local tổng hợp, không cần gọi dịch vụ ngoài.</p><h2>Kiểm tra</h2><p>Đọc kết quả và giữ bản mốc.</p>','status'=>'publish','primary_category'=>$category,'document_source'=>array('source_url'=>'https://github.com/withastro/astro','observed_at'=>'2026-10-29','note'=>'Synthetic local preview fixture; no external verification performed.')));
if(is_wp_error($guide))throw new Exception($guide->get_error_message());
$draft=wp_insert_post(array('post_type'=>'vne_resource','post_status'=>'draft','post_title'=>'LOCAL-DRAFT-MUST-NOT-LEAK'));
flush_rewrite_rules(false);
$out=array('owner'=>'vne-rebuild-preview-v1','resources'=>$resources,'guide'=>array('id'=>$guide['id'],'path'=>wp_parse_url(get_permalink($guide['id']),PHP_URL_PATH)),'draft'=>$draft);
update_option('vne_rebuild_preview_seed',$out,false);wp_set_current_user(0);echo wp_json_encode($out);
