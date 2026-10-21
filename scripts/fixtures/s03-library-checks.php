<?php
require '/wordpress/wp-load.php';
require_once ABSPATH.'wp-admin/includes/plugin.php';
$checks=array();
function check_s03($condition,$label){global $checks;if(!$condition){throw new Exception('FAIL '.$label);}$checks[]=$label;}
function request_s03($method,$path,$body=null){$parts=explode('?',$path,2);$request=new WP_REST_Request($method,'/vne-library/v1'.$parts[0]);if(isset($parts[1])){parse_str($parts[1],$query);$request->set_query_params($query);}if($body!==null){$request->set_header('Content-Type','application/json');$request->set_body(wp_json_encode($body));}return rest_do_request($request);}
$admin=get_user_by('login','admin');wp_set_current_user($admin->ID);
$activated=activate_plugin('vne-library-core/vne-library-core.php');
wp_set_current_user(0);wp_set_current_user($admin->ID);
check_s03(!is_wp_error($activated)&&get_option('vne_library_schema_version')===3,'activate/schema');
check_s03(count(array_filter(array_keys(vne_library_types()),'post_type_exists'))===3,'three CPTs');
check_s03(count(array_filter(array_keys(vne_library_taxonomies()),'taxonomy_exists'))===3,'three taxonomies');
$category=vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'Bắt đầu'));
$need=vne_library_create_term(array('taxonomy'=>'vne_need','name'=>'Landing page'));
$tool=vne_library_create_term(array('taxonomy'=>'vne_tool','name'=>'Codex'));
check_s03(!is_wp_error($category)&&!is_wp_error($need)&&!is_wp_error($tool),'manual taxonomy creation');
$payload=array('title'=>'Tài nguyên mẫu S03','excerpt'=>'Giúp tìm hiểu công cụ','content'=>'<p>Nội dung mẫu</p>','primary_category'=>(int)$category['term_id'],'needs'=>array((int)$need['term_id']),'tools'=>array((int)$tool['term_id']),'editorial_note'=>'INTERNAL-S03','status'=>'draft');
$draft=vne_library_save_item($payload);check_s03(!is_wp_error($draft)&&$draft['status']==='draft','incomplete draft allowed');
$data=vne_library_default_resource();$data['source_url']='https://github.com/example/resource';$data['source_revision']='fixture-revision';$data['observed_at']='2026-10-21';$data['source_verified']=true;
$payload['data']=$data;$payload['status']='publish';
$published=vne_library_save_item($payload);check_s03(!is_wp_error($published)&&$published['status']==='publish','publish validated resource');
check_s03($published['data']['claims']['cost']['value']===null&&$published['data']['claims']['cost']['verification_status']==='unknown','unknown preserved as null');
check_s03($published['needs']===$payload['needs']&&$published['tools']===$payload['tools'],'taxonomy IDs roundtrip');
$payload['data']['claims']['license']=array('value'=>null,'verification_status'=>'conflicted','source_url'=>null,'observed_at'=>null,'note'=>'Hai nguồn khác nhau','conflict_sources'=>array('https://example.com/license-a','https://example.com/license-b'));
$conflict=vne_library_save_item($payload,$published['id']);check_s03(!is_wp_error($conflict)&&$conflict['data']['claims']['license']['verification_status']==='conflicted','conflicted source roundtrip');
$payload['data']['claims']['cost']=array('value'=>'Theo thông tin tác giả','verification_status'=>'upstream_claimed','source_url'=>'https://example.com/pricing','observed_at'=>'2026-10-21','note'=>'Chưa tự kiểm thử','conflict_sources'=>array());
$claimed=vne_library_save_item($payload,$published['id']);check_s03(!is_wp_error($claimed)&&$claimed['data']['claims']['cost']['verification_status']==='upstream_claimed','upstream claim retains source and date');
$invalids=array(
'missing title'=>function($p){$p['title']='';return $p;},
'missing category'=>function($p){$p['primary_category']=0;return $p;},
'missing excerpt'=>function($p){$p['excerpt']='';return $p;},
'unverified source'=>function($p){$p['data']['source_verified']=false;return $p;},
'missing revision'=>function($p){$p['data']['source_revision']='';return $p;},
'bad date'=>function($p){$p['data']['observed_at']='2026-02-30';return $p;},
'HTTP source'=>function($p){$p['data']['source_url']='http://github.com/example/resource';return $p;},
'userinfo source'=>function($p){$p['data']['source_url']='https://user@github.com/example/resource';return $p;},
'wrong host'=>function($p){$p['data']['source_url']='https://github.com.evil.test/example/resource';return $p;},
'unknown field'=>function($p){$p['automatic_tested']=true;return $p;},
'array post type'=>function($p){$p['post_type']=array();return $p;},
'wrong taxonomy'=>function($p)use($tool){$p['primary_category']=(int)$tool['term_id'];return $p;},
'false free claim'=>function($p){$p['data']['claims']['cost']=vne_library_default_claim();$p['data']['claims']['cost']['value']='0';return $p;},
'unsupported tested state'=>function($p){$p['data']['claims']['cost']['verification_status']='confirmed';return $p;},
'one conflict source'=>function($p){$p['data']['claims']['license']['conflict_sources']=array('https://example.com/a');return $p;},
'skill root URL'=>function($p){$p['data']['resource_type']='skill';$p['data']['source_path']='skills/demo';return $p;}
);
foreach($invalids as $name=>$mutate){$before=vne_library_item($published['id'],true);$result=vne_library_save_item($mutate($payload),$published['id']);check_s03(is_wp_error($result),'reject '.$name);check_s03(vne_library_item($published['id'],true)===$before,'invalid update preserves all fields: '.$name);}
$skill=$payload;$skill['data']['resource_type']='skill';$skill['data']['source_path']='skills/demo';$skill['data']['source_url']='https://github.com/example/resource/tree/main/skills/demo';
check_s03(!is_wp_error(vne_library_save_item($skill)),'skill folder source accepted');
foreach(array('vne_guide','vne_practice') as $type){
    $doc=array('post_type'=>$type,'title'=>'Bài mẫu '.$type,'excerpt'=>'Hướng dẫn có nguồn','content'=>'<p>Bước thực hành</p>','status'=>'publish','primary_category'=>(int)$category['term_id'],'document_source'=>array('source_url'=>'https://example.com/docs','observed_at'=>'2026-10-21','note'=>'Nguồn mẫu fixture'));
    check_s03(!is_wp_error(vne_library_save_item($doc)),'publish document without repo: '.$type);
}
$private=$payload;$private['status']='private';$private=vne_library_save_item($private);
$raw=wp_insert_post(array('post_type'=>'vne_resource','post_title'=>'Bypass','post_status'=>'publish'));
check_s03(get_post_status($raw)==='draft','core publication guard');
$escaped=$payload;$escaped['content']='<p>Đường dẫn C:\tools\demo và "dấu nháy"</p>';$escaped['data']['claims']['requirements']['note']='C:\tools\demo và "dấu nháy"';$escaped=vne_library_save_item($escaped);check_s03(!is_wp_error($escaped)&&$escaped['content']==='<p>Đường dẫn C:\tools\demo và "dấu nháy"</p>'&&$escaped['data']['claims']['requirements']['note']==='C:\tools\demo và "dấu nháy"','backslash and quotes roundtrip');
$unsafe=$payload;$unsafe['content']='<script>alert(1)</script><p onclick="alert(1)">An toàn</p>';
$sanitized=vne_library_save_item($unsafe);check_s03(!is_wp_error($sanitized)&&!str_contains($sanitized['content'],'<script')&&!str_contains($sanitized['content'],'onclick'),'HTML sanitized');
$editor=wp_create_user('s03editor',S03_PASSWORD,'editor@example.test');$user=new WP_User($editor);$user->set_role('vne_library_editor');
$subscriber=wp_create_user('s03subscriber',S03_PASSWORD,'subscriber@example.test');$user=new WP_User($subscriber);$user->set_role('subscriber');
wp_set_current_user($editor);
check_s03(current_user_can('vne_manage_library')&&!current_user_can('manage_options'),'dedicated editor least privilege');
check_s03(!is_wp_error(vne_library_save_item($payload)),'editor may publish');
check_s03(!is_wp_error(vne_library_save_item($payload,$published['id'])),'editor may edit other author resource');
wp_set_current_user($subscriber);
check_s03(is_wp_error(vne_library_save_item($payload)),'subscriber cannot save');
check_s03(is_wp_error(vne_library_create_term(array('taxonomy'=>'vne_category','name'=>'Denied'))),'subscriber cannot create term');
check_s03(!current_user_can('edit_post_meta',$published['id'],'_vne_resource'),'subscriber cannot edit registered meta');
check_s03(request_s03('POST','/items',$payload)->get_status()===403,'REST subscriber write denied');
wp_set_current_user(0);
$list=request_s03('GET','/items');check_s03($list->get_status()===200,'anonymous public list');
foreach($list->get_data() as $item){check_s03($item['status']==='publish'&&!isset($item['editorial_note']),'public approved only / no internal note: '.$item['id']);}
check_s03(request_s03('GET','/items/'.$draft['id'])->get_status()===404,'draft hidden');
check_s03(request_s03('GET','/items/'.$private['id'])->get_status()===404,'private hidden');
check_s03(request_s03('GET','/items?context=edit')->get_status()>=400,'anonymous edit denied');
check_s03(request_s03('POST','/items',$payload)->get_status()===401,'anonymous write denied');
wp_set_current_user($admin->ID);
check_s03(request_s03('POST','/items',$payload)->get_status()===201,'REST manual creation');
check_s03(request_s03('POST','/items',array('post_type'=>array()))->get_status()===400,'REST malformed input handled');
deactivate_plugins('vne-library-core/vne-library-core.php');check_s03(get_post($published['id'])!==null,'deactivation preserves content');
activate_plugin('vne-library-core/vne-library-core.php');check_s03(get_role('vne_library_editor')->has_cap('vne_manage_library'),'reactivation restores capabilities');
update_option('s03_persist_id',$published['id']);
echo wp_json_encode(array('checks'=>$checks,'resource_id'=>$published['id'],'editor_id'=>$editor,'category_id'=>(int)$category['term_id']));
