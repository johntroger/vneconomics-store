<?php
require '/wordpress/wp-load.php';
wp_set_current_user(0);$checks=array();
function s11_check($v,$name){global $checks;if(!$v){throw new Exception($name);}$checks[]=$name;}
function s11_count(){global $wpdb;return (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='vne_report'");}
function s11_input($id){$i=vne_library_item($id);return array_merge(vne_report_ticket($i),array('nonce'=>wp_create_nonce('vne_report_submit'),'kind'=>'instructions','description'=>'QA UNIT-S11: tôi mở liên kết theo hướng dẫn nhưng kết quả chưa đúng.','email'=>'','website'=>'','consent'=>'1'));}
function s11_error($data,$status,$name){$before=s11_count();$r=vne_report_submit($data);s11_check(is_wp_error($r)&&$r->get_error_data()['status']===$status&&s11_count()===$before,$name);}
$base=json_decode(S11_BASE,true);$id=$base['ids'][0];$_SERVER['REMOTE_ADDR']='198.51.100.10';
$p=s11_input($id);$r=vne_report_submit($p);s11_check(!is_wp_error($r),'valid anonymous saves');
$r2=vne_report_submit($p);s11_check(!is_wp_error($r2)&&$r['code']===$r2['code']&&s11_count()===1,'same ticket idempotent');
$post=get_posts(array('post_type'=>'vne_report','post_status'=>'private','numberposts'=>1))[0];$record=json_decode($post->post_content,true);
s11_check($post->post_status==='private'&&$record['resource_id']===$id&&$record['resource_title']===vne_library_item($id)['title']&&$record['approved_revision']===vne_library_item($id)['approved_revision'],'server context snapshot and private status');
s11_check(array_keys($record)===array('resource_id','resource_title','resource_url','approved_revision','kind','description','email','submitted_at','ticket_hash'),'record least data, no IP/useragent/nonce');
foreach(array(
array('kind'=>'not-valid'),array('kind'=>array('link')),array('description'=>'ngắn'),
array('description'=>str_repeat('a',2001)),array('email'=>'not-email'),array('consent'=>''),
array('website'=>'bot.example'),array('source_url'=>'https://example.com/evil'),
array('post_status'=>'publish'),array('description'=>"api_key = FAKEKEYFORTESTONLY123456")
) as $changes){s11_error(array_replace(s11_input($id),$changes),400,'reject '.implode(',',array_keys($changes)));}
s11_error(array_replace(s11_input($id),array('resource_id'=>'01')),403,'malformed resource ticket');
s11_error(array_replace(s11_input($id),array('nonce'=>'wrong')),403,'nonce rejects');
s11_error(array_replace(s11_input($id),array('resource_id'=>(string)$base['ids'][1])),403,'target signature tamper');
$p=s11_input($id);$p['issued']=(string)(time()-7201);$p['signature']=vne_report_signature($p);s11_error($p,403,'expired ticket');
$p=s11_input($id);$p['issued']=(string)(time()+60);$p['signature']=vne_report_signature($p);s11_error($p,403,'future ticket');
$p=s11_input($id);$p['random']='abcd';s11_error($p,403,'malformed ticket');
$p=s11_input($id);$lock=vne_report_lock(hash('sha256',$p['signature']));s11_error($p,409,'active ticket lock blocks duplicate');vne_report_unlock($lock);
wp_set_current_user(get_user_by('login','admin')->ID);
$hidden=vne_library_item($base['private'],true);$p=array_merge(vne_report_ticket($hidden),array('nonce'=>'','kind'=>'link','description'=>'QA private must not be accepted.','email'=>'','website'=>'','consent'=>'1'));wp_set_current_user(0);$p['nonce']=wp_create_nonce('vne_report_submit');s11_error($p,404,'private target rejects');
$p=s11_input($id);wp_set_current_user(get_user_by('login','admin')->ID);$i=vne_library_item($id,true);$payload=array_intersect_key($i,array_flip(array('post_type','title','content','excerpt','status','primary_category','categories','needs','tools','data')));$payload['excerpt'].=' QA thay đổi.';$saved=vne_library_save_item($payload,$id,$i['approved_revision']);s11_check(!is_wp_error($saved),'change approved revision for fixture');wp_set_current_user(0);s11_error($p,409,'stale approved revision');
$_SERVER['REMOTE_ADDR']='198.51.100.11';$before=s11_count();
for($i=0;$i<3;$i++){$r=vne_report_submit(s11_input($id));s11_check(!is_wp_error($r),'rate accepts '.$i);}
s11_error(s11_input($id),429,'fourth saved report rate limited');
s11_check(s11_count()===$before+3,'rate limit preserves row count');
$_SERVER['REMOTE_ADDR']='198.51.100.12';
$failure=function($empty,$post){return ($post['post_type']??'')==='vne_report'?true:$empty;};add_filter('wp_insert_post_empty_content',$failure,10,2);
$p=s11_input($id);s11_error($p,503,'storage error does not claim success');remove_filter('wp_insert_post_empty_content',$failure,10);
$r=vne_report_submit($p);s11_check(!is_wp_error($r),'same ticket retries after storage recovery');
$_SERVER['REMOTE_ADDR']='198.51.100.13';$p=s11_input($id);$p['description']='QA Unicode tiếng Việt, "dấu ngoặc" và \\ đường dẫn; <img src=x onerror=alert(1)> không thực thi.';$p['email']='qa-s11@example.com';
$r=vne_report_submit($p);s11_check(!is_wp_error($r),'optional email and plain text accepted');
$last=get_posts(array('post_type'=>'vne_report','post_status'=>'private','numberposts'=>1,'orderby'=>'ID','order'=>'DESC'))[0];$stored=json_decode($last->post_content,true);
s11_check(is_array($stored)&&str_contains($stored['description'],'"dấu ngoặc"')&&str_contains($stored['description'],'\\')&&!str_contains($stored['description'],'<img')&&$stored['email']==='qa-s11@example.com','quotes slash unicode roundtrip, tags stripped');
$locks=array();global $wpdb;$locks=$wpdb->get_col("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE 'vne_report_lock_%'");s11_check(!$locks,'all owned locks released on errors/success');
$type=get_post_type_object('vne_report');s11_check(!$type->public&&!$type->publicly_queryable&&!$type->show_in_rest&&!$type->can_export,'private type not public/REST/export');
wp_set_current_user(get_user_by('login','admin')->ID);$ordinary=wp_insert_user(array('user_login'=>'s11-ordinary-author','user_pass'=>wp_generate_password(24),'role'=>'author'));
s11_check(!is_wp_error($ordinary)&&!user_can($ordinary,'read_post',$last->ID)&&!user_can($ordinary,'edit_post',$last->ID),'ordinary WP author cannot read/edit report through native caps');
s11_check(current_user_can('read_post',$last->ID)&&current_user_can('vne_manage_library'),'authorized custom capability owns report type');wp_set_current_user(0);
echo wp_json_encode(array('checks'=>$checks,'report_id'=>$last->ID,'report_code'=>$last->post_title,'count'=>s11_count()));
