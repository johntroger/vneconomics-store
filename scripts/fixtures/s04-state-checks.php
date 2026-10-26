<?php
require '/wordpress/wp-load.php';
$admin=get_user_by('login','admin');wp_set_current_user($admin->ID);
$checks=array();$matrix=array();
function s04_check($condition,$label){global $checks;if(!$condition){throw new Exception('FAIL S04 '.$label);}$checks[]=$label;}
function s04_payload($title) {
    $category=get_terms(array('taxonomy'=>'vne_category','hide_empty'=>false))[0];
    $data=vne_library_default_resource();
    $data['source_url']='https://github.com/example/s04';$data['source_revision']='fixture-r1';$data['source_verified']=true;$data['observed_at']='2026-10-21';
    foreach($data['claims'] as &$claim){$claim=array('value'=>'Fixture only','verification_status'=>'upstream_claimed','source_url'=>'https://example.com/evidence','observed_at'=>'2026-10-21','note'=>'Dữ liệu thử hư cấu, không phát hành','conflict_sources'=>array());}unset($claim);
    return array('title'=>$title,'excerpt'=>'Fixture S04','content'=>'<p>Fixture</p>','status'=>'publish','primary_category'=>(int)$category->term_id,'data'=>$data);
}
function s04_state($access='available',$maintenance='active',$rec='normal') {
    $state=vne_library_default_state();
    foreach(array('source_access'=>$access,'maintenance'=>$maintenance) as $axis=>$value){$state[$axis]=array('status'=>$value,'source_url'=>'https://example.com/observation','observed_at'=>'2026-10-21','note'=>'Quan sát fixture, không phải dữ kiện thật');}
    $state['recommendation']=array('status'=>$rec,'reason'=>'Quyết định fixture có ghi lý do');return $state;
}
function s04_evidence($id,$outcome='pass') {
    return array('revision'=>vne_library_revision($id),'outcome'=>$outcome,'tested_at'=>'2026-10-21','os'=>'Windows fixture','tool'=>'Công cụ fixture','version'=>'fixture-1','input'=>'Đầu vào fixture','output'=>'Đầu ra fixture','checklist'=>array('Bước fixture đạt mục tiêu giả lập'),'evidence_url'=>'https://example.com/fixture-evidence');
}
$items=array();
foreach(array('not_tested','tested','review_needed') as $kind) {
    $created=vne_library_save_item(s04_payload('Ma trận '.$kind));
    s04_check(!is_wp_error($created),'create matrix '.$kind);$id=$created['id'];$items[$kind]=$id;
    if($kind!=='not_tested'){s04_check(!is_wp_error(vne_library_record_validation($id,s04_evidence($id,$kind==='tested'?'pass':'fail'))),'record '.$kind);}
}
foreach($items as $validation=>$id) {
    foreach(array('available','unknown','unavailable') as $access) {
        foreach(array('active','archived','unknown') as $maintenance) {
            foreach(array('normal','suspended') as $rec) {
                $saved=vne_library_save_state($id,s04_state($access,$maintenance,$rec));
                s04_check(!is_wp_error($saved),'valid observation '.$validation.'/'.$access.'/'.$maintenance.'/'.$rec);
                $resolved=vne_library_resolve_state($id);
                $badge=$rec==='suspended'?'suspended':($access==='unavailable'?'unavailable':($validation==='review_needed'?'review_needed':($maintenance==='archived'?'archived':($access==='unknown'?'access_unknown':$validation))));
                $cta=$rec==='suspended'?'view_reason':($access==='unavailable'?'view_status':'source');
                $eligible=$validation==='tested'&&$rec==='normal'&&$access==='available';
                s04_check($resolved['primary_badge']===$badge&&$resolved['cta']['kind']===$cta&&$resolved['validation_status']===$validation&&$resolved['recommendation_eligible']===$eligible,'matrix badge/CTA/eligibility '.$validation.'/'.$access.'/'.$maintenance.'/'.$rec);
                s04_check($resolved['commands_allowed']===($eligible&&$maintenance!=='archived'),'matrix commands '.$validation.'/'.$access.'/'.$maintenance.'/'.$rec);
                $codes=array_column($resolved['warnings'],'code');
                if($maintenance==='archived'){s04_check(in_array('archived',$codes,true),'archived secondary preserved '.$access.'/'.$validation.'/'.$rec);}
                if($access==='unavailable'){s04_check(in_array('source_unavailable',$codes,true),'unavailable warning preserved '.$maintenance.'/'.$validation.'/'.$rec);}
                $matrix[]=array('validation'=>$validation,'access'=>$access,'maintenance'=>$maintenance,'recommendation'=>$rec,'badge'=>$badge,'cta'=>$cta,'eligible'=>$eligible);
            }
        }
    }
}
$id=$items['tested'];vne_library_save_state($id,s04_state());
foreach(array('draft','pending','future','private','trash') as $status) {
    $date=$status==='future'?'2027-10-21 12:00:00':'2026-10-20 12:00:00';
    wp_update_post(array('ID'=>$id,'post_status'=>$status,'post_date'=>$date,'post_date_gmt'=>$date));
    s04_check(get_post_status($id)===$status,'core status '.$status);
    $resolved=vne_library_resolve_state($id);
    s04_check(!$resolved['is_public']&&$resolved['primary_badge']==='hidden'&&$resolved['cta']['kind']==='none'&&!$resolved['recommendation_eligible'],'hidden resolver '.$status);
    s04_check(is_wp_error(vne_library_item($id)),'public hides '.$status);
}
wp_update_post(array('ID'=>$id,'post_status'=>'publish','post_date'=>'2026-10-20 12:00:00','post_date_gmt'=>'2026-10-20 12:00:00'));
s04_check(vne_library_resolve_state($id)['is_public'],'restore publish');
$before=vne_library_state_input($id);
$bad=s04_state();$bad['source_access']['observed_at']='2026-02-30';
s04_check(is_wp_error(vne_library_save_state($id,$bad))&&vne_library_state_input($id)===$before,'reject invalid observation atomically');
$bad=s04_state();$bad['source_access']['source_url']='';
s04_check(is_wp_error(vne_library_save_state($id,$bad)),'verified unavailable/available requires evidence');
$bad=s04_state();$bad['validation_status']='tested';
s04_check(is_wp_error(vne_library_save_state($id,$bad)),'cannot post tested status');
$bad=s04_state('available','archived');$bad['recommendation']['reason']='';
s04_check(is_wp_error(vne_library_save_state($id,$bad)),'archived recommendation needs decision');
$evidence=s04_evidence($id);$evidence['evidence_url']='';
$count=count(vne_library_validations($id));
s04_check(is_wp_error(vne_library_record_validation($id,$evidence))&&count(vne_library_validations($id))===$count,'missing evidence cannot promote');
$evidence=s04_evidence($id);$evidence['revision']=str_repeat('0',64);
s04_check(is_wp_error(vne_library_record_validation($id,$evidence)),'stale validation revision rejected');
$review=s04_state();$review['review']=array('needed'=>true,'reason'=>'Thay đổi cần rà soát','reviewed_at'=>'2026-10-20','review_due_at'=>'2026-11-20');
vne_library_save_state($id,$review);s04_check(vne_library_resolve_state($id)['validation_status']==='review_needed','manual review masks green');
$review['review']['needed']=false;vne_library_save_state($id,$review);
s04_check(vne_library_resolve_state($id)['validation_status']==='review_needed','clearing review cannot restore old green');
vne_library_record_validation($id,s04_evidence($id));
s04_check(vne_library_resolve_state($id)['validation_status']==='tested'&&count(vne_library_validations($id))===$count+1,'new evidence restores current tested and retains history');
$due=s04_state();$due['review']=array('needed'=>false,'reason'=>'','reviewed_at'=>'2026-10-19','review_due_at'=>'2026-10-20');
vne_library_save_state($id,$due);
s04_check(in_array('review_overdue',array_column(vne_library_resolve_state($id)['warnings'],'code'),true),'overdue derived without cron');
$due['review']['review_due_at']='2026-11-20';vne_library_save_state($id,$due);
s04_check(vne_library_resolve_state($id)['validation_status']==='review_needed','moving deadline does not renew test');
vne_library_record_validation($id,s04_evidence($id));vne_library_save_state($id,s04_state('unknown'));
s04_check(vne_library_resolve_state($id)['validation_status']==='tested'&&vne_library_resolve_state($id)['primary_badge']==='access_unknown','unknown access preserves tested history');
vne_library_save_state($id,s04_state());
$payload=s04_payload('Tài nguyên phụ thuộc');$resource=vne_library_save_item($payload);$rid=$resource['id'];
vne_library_save_state($rid,s04_state());vne_library_record_validation($rid,s04_evidence($rid));
$doc=array('post_type'=>'vne_guide','title'=>'Bài phụ thuộc S04','excerpt'=>'Bài fixture','content'=>'<p>Bước 2 fixture</p>','status'=>'publish','primary_category'=>$payload['primary_category'],'document_source'=>array('source_url'=>'https://example.com/guide','observed_at'=>'2026-10-21','note'=>'Fixture'));
$guide=vne_library_save_item($doc);$gid=$guide['id'];vne_library_save_state($gid,s04_state());
$dep=array('resource_id'=>$rid,'resource_revision'=>vne_library_revision($rid),'step'=>'Bước 2','tool'=>'Fixture tool','version'=>'fixture-1');
s04_check(!is_wp_error(vne_library_save_dependencies($gid,array($dep))),'manual dependency bound');
vne_library_record_validation($gid,s04_evidence($gid));s04_check(vne_library_resolve_state($gid)['validation_status']==='tested','guide tested on pinned version');
$old_revision=vne_library_revision($rid);$payload['title']='Đổi tên không đổi kỹ thuật';vne_library_save_item($payload,$rid);
s04_check(vne_library_revision($rid)===$old_revision&&vne_library_resolve_state($gid)['validation_status']==='tested','cosmetic edit leaves dependency current');
$payload['data']['observed_at']='2026-10-20';foreach($payload['data']['claims'] as &$claim){$claim['observed_at']='2026-10-20';$claim['note']='Chỉ cập nhật ghi chú/ngày đối chiếu';}unset($claim);vne_library_save_item($payload,$rid);
s04_check(vne_library_revision($rid)===$old_revision&&vne_library_resolve_state($gid)['validation_status']==='tested','observation date and note refresh does not invalidate tests');
$payload['data']['claims']['permissions']['value']='Thay đổi quyền quan trọng';vne_library_save_item($payload,$rid);
s04_check(vne_library_resolve_state($rid)['validation_status']==='review_needed'&&vne_library_resolve_state($gid)['validation_status']==='review_needed','critical change warns resource and guide');
s04_check(in_array('dependency_changed',array_column(vne_library_resolve_state($gid)['warnings'],'code'),true),'step warning for changed dependency');
s04_check(count(vne_library_validations($gid))===1,'dependency change preserves guide history');
$dep['resource_revision']=vne_library_revision($rid);vne_library_save_dependencies($gid,array($dep));
s04_check(vne_library_resolve_state($gid)['validation_status']==='review_needed','rebinding alone does not restore tested');
vne_library_record_validation($rid,s04_evidence($rid));vne_library_record_validation($gid,s04_evidence($gid));
s04_check(vne_library_resolve_state($gid)['validation_status']==='tested','explicit retest after rebind restores guide');
vne_library_save_state($rid,s04_state('unavailable','archived'));
$warn=vne_library_resolve_state($gid)['warnings'];$codes=array_column($warn,'code');
s04_check(in_array('dependency_unavailable',$codes,true)&&in_array('dependency_archived',$codes,true),'combined dependency warnings retained');
s04_check($warn[0]['step']==='Bước 2','warning attached to dependent step');
wp_update_post(array('ID'=>$rid,'post_status'=>'private'));
$public=vne_library_item($gid);$json=wp_json_encode($public);
s04_check(in_array('dependency_hidden',array_column($public['derived']['warnings'],'code'),true)&&!isset($public['dependencies'])&&!str_contains($json,'Đổi tên không đổi kỹ thuật')&&!str_contains($json,'resource_id'),'hidden resource metadata not exposed through guide');
wp_update_post(array('ID'=>$rid,'post_status'=>'publish'));vne_library_save_state($rid,s04_state());
$subscriber=get_user_by('login','s03subscriber');wp_set_current_user($subscriber->ID);
s04_check(is_wp_error(vne_library_save_state($id,s04_state())),'subscriber denied state');
s04_check(is_wp_error(vne_library_record_validation($id,s04_evidence($id))),'subscriber denied validation');
s04_check(is_wp_error(vne_library_save_dependencies($gid,array($dep))),'subscriber denied dependency');
foreach(array('state'=>s04_state(),'validations'=>s04_evidence($id),'dependencies'=>array()) as $route=>$body){$request=new WP_REST_Request('POST','/vne-library/v1/items/'.$id.'/'.$route);$request->set_header('Content-Type','application/json');$request->set_body(wp_json_encode($body));s04_check(rest_do_request($request)->get_status()===403,'REST subscriber denied '.$route);}
wp_set_current_user($admin->ID);
$legacy=vne_library_save_item(s04_payload('Legacy S03'));$legacy=vne_library_resolve_state($legacy['id']);
s04_check($legacy['source_access_status']==='unknown'&&$legacy['validation_status']==='not_tested','S03 records default unknown/not tested without migration rewrite');
$history=vne_library_validations($id);$last=end($history);
s04_check($last['actor']===$admin->ID&&isset($last['id'],$last['recorded_at']),'validation audit server assigned');
s04_check(!isset(vne_library_item($id)['derived']['latest_validation']['actor']),'public validation omits actor');
// Validate state provenance, strict authority, and non-destructive schema upgrade.
$resolved=vne_library_resolve_state($id);
s04_check($resolved['observations']['source_access']['observed_at']==='2026-10-21'&&$resolved['observations']['source_access']['source_url']==='https://example.com/observation','public observation provenance retained');
s04_check($resolved['primary_label']==='Đã thử','badge label resolved by plugin');
$copy=get_post_meta($rid,'_vne_resource',true);$hist=vne_library_validations($rid);
update_option('vne_library_schema_version',1);get_role('vne_library_editor')->remove_cap('vne_validate_library');
vne_library_maybe_upgrade();
s04_check((int)get_option('vne_library_schema_version')===2&&get_role('vne_library_editor')->has_cap('vne_validate_library'),'v1 additive capability upgrade');
s04_check(get_post_meta($rid,'_vne_resource',true)===$copy&&vne_library_validations($rid)===$hist,'upgrade preserves source and evidence');
$editor=get_user_by('login','s03editor');$editor->add_cap('vne_validate_library',false);wp_set_current_user(0);wp_set_current_user($editor->ID);
s04_check(vne_library_can_edit($rid)&&!current_user_can('vne_validate_library'),'state editor can lack validation authority');
s04_check(is_wp_error(vne_library_record_validation($rid,s04_evidence($rid))),'no validation promotion without dedicated capability');
$editor->remove_cap('vne_validate_library');wp_set_current_user(0);wp_set_current_user($admin->ID);
$bad=s04_evidence($rid);$bad['actor']=999;
s04_check(is_wp_error(vne_library_record_validation($rid,$bad)),'client cannot forge evidence actor');
$bad=s04_state();$bad['audit']=array('actor'=>999);
s04_check(is_wp_error(vne_library_save_state($rid,$bad)),'client cannot forge state audit');
$bad=$dep;$bad['resource_revision']=str_repeat('0',64);
s04_check(is_wp_error(vne_library_save_dependencies($gid,array($bad))),'stale dependency snapshot rejected');
s04_check(is_wp_error(vne_library_save_dependencies($gid,array($dep,$dep))),'duplicate dependency rejected');
$risk=s04_payload('Rủi ro claim fixture');$risk['data']['claims']['permissions']=vne_library_default_claim();$risk=vne_library_save_item($risk);vne_library_save_state($risk['id'],s04_state());vne_library_record_validation($risk['id'],s04_evidence($risk['id']));
s04_check(!vne_library_resolve_state($risk['id'])['commands_allowed'],'unknown permissions keep commands blocked despite recorded test');
$unknown_id=$risk['id'];$doc['title']='Guide quyền chưa rõ';$risk_guide=vne_library_save_item($doc);vne_library_save_state($risk_guide['id'],s04_state());
vne_library_save_dependencies($risk_guide['id'],array(array('resource_id'=>$unknown_id,'resource_revision'=>vne_library_revision($unknown_id),'step'=>'Bước rủi ro','tool'=>'Fixture','version'=>'fixture-1')));vne_library_record_validation($risk_guide['id'],s04_evidence($risk_guide['id']));
s04_check(!vne_library_resolve_state($risk_guide['id'])['commands_allowed']&&in_array('dependency_claim_risk',array_column(vne_library_resolve_state($risk_guide['id'])['warnings'],'code'),true),'guide cannot bypass unknown dependency permissions');
$risk=s04_payload('Mâu thuẫn fixture');$risk['data']['claims']['license']=array('value'=>null,'verification_status'=>'conflicted','source_url'=>null,'observed_at'=>null,'note'=>'Hai nguồn mâu thuẫn fixture','conflict_sources'=>array('https://example.com/a','https://example.com/b'));$risk=vne_library_save_item($risk);vne_library_save_state($risk['id'],s04_state());vne_library_record_validation($risk['id'],s04_evidence($risk['id']));
s04_check(vne_library_resolve_state($risk['id'])['validation_status']==='review_needed'&&!vne_library_resolve_state($risk['id'])['commands_allowed'],'conflicted claim masks green and commands');
update_option('s04_persist_ids',array('resource'=>$rid,'guide'=>$gid,'matrix'=>$id));
echo wp_json_encode(array('checks'=>$checks,'matrix'=>$matrix,'resource_id'=>$rid,'guide_id'=>$gid));
