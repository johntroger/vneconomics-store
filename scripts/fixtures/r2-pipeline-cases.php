<?php
if(!str_contains(str_replace(chr(92),'/',ABSPATH),'/tmp/tests/r2-')||DB_NAME!=='wordpress'){throw new RuntimeException('Isolated fixture only');}
define('VNE_PIPELINE_LIBRARY_ONLY',true);define('VNE_PIPELINE_FIXTURE',true);require R2_INBOX.'/receiver.php';wp_set_current_user(1);
$checks=array();function r2_check($v,$name){global $checks;if(!$v){throw new RuntimeException($name);}$checks[]=$name;}
function r2_refused($call,$name){try{$call();}catch(Throwable $e){r2_check(true,$name);return;}throw new RuntimeException('Accepted unsafe case: '.$name);}
$c=array('root'=>ABSPATH,'database'=>DB_NAME,'home'=>get_option('home'),'indexing'=>'0','payloadBranch'=>'release/staging','repositoryDirectory'=>R2_REPO,'inboxDirectory'=>R2_INBOX,'deploymentConfigured'=>true);
list($manifest,$content,$manifestHash)=vne_pipeline_package(R2_INBOX);
$original=vne_pipeline_ids();$before=vne_pipeline_fingerprint($original);$optionsBefore=$wpdb->get_results("SELECT * FROM {$wpdb->options} ORDER BY option_id",ARRAY_A);
$inspect=vne_pipeline_run(R2_INBOX,'inspect','fixture',array(),$c);
r2_check($inspect['status']==='INSPECTED_READ_ONLY'&&count($inspect['entries'])===103,'full103-entry inspect');r2_check($before===vne_pipeline_fingerprint($original),'inspect leaves original posts/meta/terms/runtime unchanged');r2_check($optionsBefore===$wpdb->get_results("SELECT * FROM {$wpdb->options} ORDER BY option_id",ARRAY_A),'inspect writes no options');
$approval=array('payloadSha'=>str_repeat('a',40),'manifestSha256'=>$manifestHash,'sourceSha'=>$manifest['sourceSha'],'baselineSha256'=>$inspect['baselineSha256']);
foreach(array('root'=>'/wrong/','database'=>'wrong','home'=>'https://wrong.example','indexing'=>'1') as $key=>$bad){$badContext=$c;$badContext[$key]=$bad;r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$badContext),'target guard '.$key);}
$bad=$c;$bad['deploymentConfigured']=false;r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$bad),'unconfigured transport fails closed');
$bad=$c;$bad['payloadBranch']='release/production';r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$bad),'wrong payload branch rejected');
foreach(array('payloadSha','sourceSha','manifestSha256','baselineSha256') as $key){$bad=$approval;$bad[$key]=str_repeat('b',strlen($bad[$key]));r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'apply-content','fixture',$bad,$c),'approval mismatch '.$key);}
wp_set_current_user(0);r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$c),'no implicit administrator elevation');r2_check(get_current_user_id()===0,'denied actor unchanged');wp_set_current_user(1);
r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'adopt','fixture',$approval,$c),'adopt refuses missing content/evidence');
r2_check($before===vne_pipeline_fingerprint($original),'rejected gates preserve baseline');
$foreign=$content['entries'][101]['payload'];$foreign['status']='draft';$codex=vne_pipeline_find($content['entries'][0]);$foreign['primary_category']=(int)get_post_meta($codex->ID,'_vne_primary_category',true);$foreignId=vne_pipeline_need(vne_library_save_item($foreign))['id'];
r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'inspect','fixture',array(),$c),'foreign draft with empty slug is not adopted/duplicated');
// Delete only this named, disposable fixture record before continuing the scenario.
if(get_post_type($foreignId)!=='vne_guide'||get_post_field('post_title',$foreignId)!==$foreign['title']){throw new RuntimeException('Fixture cleanup guard');}wp_delete_post($foreignId,true);
r2_check($before===vne_pipeline_fingerprint($original),'foreign fixture removed without altering originals');
$oldValidation=vne_library_validations($codex->ID);
foreach(array(1,2) as $nth){
 $fault=function($event,$count,$key)use($nth){if($event==='after-create-before-journal'&&$count===$nth){throw new RuntimeException('Injected interruption');}};
 r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$c,$fault),'interruption after '.$nth.' new records before journal map');
 $owned=get_posts(array('post_type'=>array('vne_resource','vne_guide'),'post_status'=>'draft','posts_per_page'=>-1));$marked=array_values(array_filter($owned,fn($p)=>str_starts_with($p->post_content_filtered,'vne-pipeline:'.$manifestHash.':')));
 r2_check(count($marked)===($nth===1?1:3),'no duplicate creation across partial retry '.$nth);
 foreach($marked as $p){r2_check($p->post_name!==''&&get_post_meta($p->ID,'_vne_approved_content',true)['revision']===vne_library_approved_revision($p->ID),'slug sealed atomically in owned draft '.$p->ID);}
 r2_check((int)wp_count_posts('vne_resource')->publish===6,'interrupted new content remains draft');
}
$result=vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$c);
r2_check($result['status']==='APPLIED_MISSING_CONTENT','resume completes full content set');r2_check(count($result['journal']['map'])===103,'receipt has103 environment-local IDs');
r2_check((int)wp_count_posts('vne_resource')->publish===106&&(int)wp_count_posts('vne_guide')->publish===6&&(int)wp_count_posts('vne_practice')->publish===1,'full library106/6/1');
r2_check($result['journal']['map']['codex']!==(int)107,'Codex mapped without production ID');
foreach($content['entries'] as $e){$p=vne_pipeline_find($e);r2_check($p&&$p->post_status==='publish','published natural key '.$e['key']);if($e['kind']==='guide'){r2_check(count(vne_library_validations($p->ID))===1&&vne_library_item($p->ID)['derived']['commands_allowed'],'new guide has one scoped validation '.$e['key']);}}
r2_check(count(vne_library_validations($codex->ID))===count($oldValidation)+1,'Codex scoped evidence appended once');r2_check(vne_pipeline_equal(array_slice(vne_library_validations($codex->ID),0,count($oldValidation)),$oldValidation),'historical Codex evidence retained');
$afterIds=vne_pipeline_ids();$after=vne_pipeline_fingerprint($afterIds);$validationCounts=array_map(fn($key)=>count(vne_library_validations($result['journal']['map'][$key])),array('codex','claude-code','antigravity'));
$again=vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$c);r2_check($again['journal']['map']===$result['journal']['map']&&$after===vne_pipeline_fingerprint($afterIds),'apply retry creates no duplicate or data writes');
r2_check($validationCounts===array_map(fn($key)=>count(vne_library_validations($result['journal']['map'][$key])),array('codex','claude-code','antigravity')),'validation retry creates no duplicates');
$adopt=vne_pipeline_run(R2_INBOX,'adopt','fixture',$approval,$c);r2_check($adopt['status']==='ADOPTED_EXISTING_BASELINE'&&$after===vne_pipeline_fingerprint($afterIds),'adoption writes only a traceability receipt');
r2_check(vne_pipeline_run(R2_INBOX,'adopt','fixture',$approval,$c)['status']==='ALREADY_ADOPTED','adoption retry is idempotent');
$resource=$result['journal']['map']['c100-001'];$oldState=vne_library_state_input($resource);$state=$oldState;$state['review']['needed']=true;$state['review']['reason']='Owner review fixture';vne_pipeline_need(vne_library_save_state($resource,$state));
r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'apply-content','fixture',$approval,$c),'human review flag is a conflict, not reset');r2_check(vne_library_state_input($resource)['review']['needed'],'human review flag preserved');vne_pipeline_need(vne_library_save_state($resource,$oldState));
$guide=$result['journal']['map']['claude-code'];wp_update_post(array('ID'=>$guide,'post_title'=>'Owner unapproved edit fixture'));
r2_refused(fn()=>vne_pipeline_run(R2_INBOX,'adopt','fixture',$approval,$c),'unapproved raw content is not silently adopted');r2_check(get_post_field('post_title',$guide)==='Owner unapproved edit fixture','human raw edit preserved after rejection');
r2_check(!has_filter('wp_insert_post_data',isset($filter)?$filter:'r2_nonexistent'),'receiver insertion hook removed');
echo wp_json_encode(array('status'=>'PASS_NATIVE_RECEIVER','checks'=>$checks,'counts'=>array('resources'=>(int)wp_count_posts('vne_resource')->publish,'guides'=>(int)wp_count_posts('vne_guide')->publish),'map'=>$result['journal']['map'],'limits'=>array('Isolated SQLite native WordPress, not MariaDB/Plesk','Git HEAD is an explicit local filesystem fixture, not a GitHub delivery','Validation rows are test-only records in a disposable fixture; never shipped')));
