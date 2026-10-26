<?php
// Isolated native fixture only; this file is not a production importer.
if(!defined('ABSPATH')||!str_contains(str_replace('\\','/',ABSPATH),'/tmp/tests/g03-')||DB_NAME!=='wordpress'){throw new Exception('G03 fixture only');}
wp_set_current_user(1);
function g03_need($result){if(is_wp_error($result)){throw new Exception($result->get_error_message());}return $result;}
function g03_validate_fixture($id){
    return g03_need(vne_library_record_validation($id,array('revision'=>vne_library_revision($id),'outcome'=>'pass','tested_at'=>'2026-10-25','os'=>'QA Windows fixture','tool'=>'QA kiểm tra giao diện WordPress; không chứng nhận công cụ AI','version'=>'Fixture controls; không phải phiên bản ứng dụng','input'=>'Hai bài đã soạn; dữ liệu chứng cứ tổng hợp cho kiểm tra cổng hiển thị','output'=>'QA fixture dùng để kiểm copy/checklist và cổng chứng cứ; thử đầu ra thật có hồ sơ local riêng. Chưa thử cài hoặc đăng nhập mới.','checklist'=>array('QA chế độ hiển thị','Không dùng bản ghi fixture để xuất bản'),'evidence_url'=>'https://example.test/g03-fixture/'.(int)$id)));
}
$drafts=json_decode(file_get_contents(__DIR__.'/guide-drafts.json'),true);$map=array();
$category=(int)get_option('vne_s13_seed')['resources'][0]['id'];$base=vne_library_item($category);$category=$base['primary_category'];
foreach($drafts['drafts'] as $draft){
    if($draft['functionalTrial']['status']!=='PASS_OWNER_ASSISTED_OUTPUT_AND_RESTORE'){throw new Exception('Functional trial missing');}
    $payload=array_intersect_key($draft,array_flip(array('post_type','title','excerpt','content','document_source')));$payload['status']='publish';$payload['primary_category']=$category;
    $item=g03_need(vne_library_save_item($payload));$id=$item['id'];
    $state=vne_library_default_state();$state['source_access']=array('status'=>'available','source_url'=>$draft['document_source']['source_url'],'observed_at'=>'2026-10-25','note'=>'Nguồn đối chiếu đã đọc; không phải chứng nhận cài mới.');g03_need(vne_library_save_state($id,$state));
    $map[$draft['key']]=array('id'=>$id,'url'=>get_permalink($id),'slug'=>get_post_field('post_name',$id));
}
update_option('g03_fixture_map',$map,false);echo wp_json_encode($map);
