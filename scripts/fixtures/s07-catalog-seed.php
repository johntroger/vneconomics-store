<?php
require '/wordpress/wp-load.php';
wp_set_current_user(get_user_by('login','admin')->ID);
$seed=json_decode(S07_SEED,true);$checks=array();
function s07_check($condition,$label){global $checks;if(!$condition){throw new Exception($label);}$checks[]=$label;}
function s07_payload($item){
    return array_intersect_key($item,array_flip(array('post_type','title','content','excerpt','status','primary_category','categories','needs','tools','data','document_source','editorial_note')));
}
$parent=get_term_by('name','Nền tảng web','vne_category');$starter=get_term_by('name','Mẫu dự án','vne_category');$skills=get_term_by('name','Skills cho AI agent','vne_category');
$child=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'HTML và CSS','parent'=>(int)$parent->term_id));
$empty=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'Chưa có tài nguyên'));
$hidden=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'RIENG-CHUA-DUYET'));
$need=vne_library_create_term(array('taxonomy'=>'vne_need','name'=>'Landing page'));
$tool=vne_library_create_term(array('taxonomy'=>'vne_tool','name'=>'Codex'));
foreach(array($child,$empty,$hidden,$need,$tool) as $term){s07_check(!is_wp_error($term),'create term '.$term['term_id']);}
wp_update_term($parent->term_id,'vne_category',array('description'=>'Học những phần cơ bản của trang web trước khi nhờ AI viết và sửa mã.'));
wp_update_term($child['term_id'],'vne_category',array('description'=>'Ví dụ nhỏ để hiểu cấu trúc và giao diện. Dữ liệu QA S07, không phải bộ repo mới được tuyển chọn.'));
$extra=array();
for($n=1;$n<=14;$n++){
    $data=vne_library_default_resource();$data['source_url']='https://github.com/example/s07-fixture-'.$n;$data['source_revision']='fixture-r1';$data['observed_at']='2026-10-21';$data['source_verified']=true;
    if($n===1){$data['claims']['requirements']=array('value'=>'Máy Windows và trình duyệt (dữ liệu QA hư cấu)','verification_status'=>'upstream_claimed','source_url'=>'https://example.com/s07-fixture','observed_at'=>'2026-10-21','note'=>'Chỉ kiểm thử giao diện','conflict_sources'=>array());}
    if($n===2){$data['claims']['requirements']=array('value'=>null,'verification_status'=>'conflicted','source_url'=>null,'observed_at'=>null,'note'=>'Dữ liệu QA','conflict_sources'=>array('https://example.com/a','https://example.com/b'));}
    $payload=array('title'=>'ZZ Bài mẫu '.str_pad((string)$n,2,'0',STR_PAD_LEFT),'excerpt'=>'Mục QA để kiểm tra danh mục, phân trang và liên kết. Không phải khuyến nghị repo thật.','content'=>'<p>Nội dung fixture S07, không xuất bản lên hosting.</p>','status'=>'publish','primary_category'=>$n<=12?(int)$child['term_id']:(int)$starter->term_id,'categories'=>$n===1?array((int)$parent->term_id,(int)$skills->term_id):array(),'needs'=>$n<=3?array((int)$need['term_id']):array(),'tools'=>$n<=2?array((int)$tool['term_id']):array(),'data'=>$data,'editorial_note'=>'INTERNAL-S07');
    if($n===1){$payload['title']='ZZ Nguồn mã mẫu '.str_repeat('LongName',20);}
    $item=vne_library_save_item($payload);s07_check(!is_wp_error($item),'create fixture '.$n);$extra[]=$item['id'];
    if($n===3||$n===4){
        $state=vne_library_default_state();
        if($n===3){$state['source_access']=array('status'=>'unavailable','source_url'=>'https://example.com/s07-fixture','observed_at'=>'2026-10-21','note'=>'Giả lập QA, không phải dữ kiện nguồn thật');}
        if($n===4){$state['recommendation']=array('status'=>'suspended','reason'=>'Tạm ngừng trong kiểm thử S07');}
        s07_check(!is_wp_error(vne_library_save_state($item['id'],$state)),'set fixture warning '.$n);
    }
}
wp_set_object_terms($seed['guide'],array((int)$empty['term_id'],(int)$hidden['term_id']),'vne_category',true);
wp_set_object_terms($seed['guide'],array((int)$need['term_id']),'vne_need',true);
wp_set_object_terms($seed['draft'],array((int)$hidden['term_id']),'vne_category');
wp_set_object_terms($seed['private'],array((int)$hidden['term_id']),'vne_category');
$first=vne_library_item($extra[0],true);$proposal=s07_payload($first);
$proposal['title']='PENDING-S07-MUST-NOT-LEAK';$proposal['categories']=array((int)$empty['term_id']);$proposal['primary_category']=(int)$empty['term_id'];$proposal['data']['source_url']='https://github.com/example/pending-s07';
s07_check(!is_wp_error(vne_library_create_proposal($extra[0],array('base_revision'=>$first['approved_revision'],'payload'=>$proposal))),'pending proposal with changed category/source');
// Deliberately make raw columns and taxonomy disagree with the approved public snapshot.
global $wpdb;
$wpdb->update($wpdb->posts,array('post_title'=>'RAW-S07-MUST-NOT-LEAK','post_excerpt'=>'RAW-EXCERPT-S07-MUST-NOT-LEAK'),array('ID'=>$seed['ids'][0]));clean_post_cache($seed['ids'][0]);
wp_set_object_terms($seed['ids'][0],array((int)$hidden['term_id']),'vne_category');
wp_set_object_terms($extra[0],array((int)$hidden['term_id']),'vne_category');
wp_set_object_terms($extra[0],array(),'vne_need');
wp_set_object_terms($extra[0],array(),'vne_tool');
wp_set_current_user(0);
$items=vibelab_catalog_all();s07_check(count($items)===20,'20 approved public resources only');
$terms=array('parent'=>get_term($parent->term_id),'child'=>get_term($child['term_id']),'starter'=>get_term($starter->term_id),'skills'=>get_term($skills->term_id),'empty'=>get_term($empty['term_id']),'hidden'=>get_term($hidden['term_id']),'need'=>get_term($need['term_id'],'vne_need'),'tool'=>get_term($tool['term_id'],'vne_tool'));
$out=array('checks'=>$checks,'all'=>array(),'terms'=>array(),'blocked'=>array($extra[2],$extra[3]),'long'=>$extra[0],'astro'=>$seed['ids'][3]);
foreach($items as $item){$out['all'][]=array('id'=>$item['id'],'title'=>$item['title'],'url'=>get_permalink($item['id']),'source'=>$item['data']['source_url'],'cta'=>$item['derived']['cta'],'badge'=>$item['derived']['primary_label']);}
foreach($terms as $key=>$term){
    $matches=array_values(array_filter($items,function($item)use($term){return vibelab_catalog_matches($item,$term);}));
    $out['terms'][$key]=array('id'=>(int)$term->term_id,'name'=>$term->name,'slug'=>$term->slug,'url'=>get_term_link($term),'ids'=>array_column($matches,'id'),'count'=>count($matches));
}
$out['archive']=get_post_type_archive_link('vne_resource');
echo wp_json_encode($out);
