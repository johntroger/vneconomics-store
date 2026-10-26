<?php
// Private, operator-invoked receiver. Includes no installer, downloader or scheduler.
if(!defined('ABSPATH')){exit(1);}
function vne_pipeline_need($result){if(is_wp_error($result)){throw new RuntimeException($result->get_error_message());}return $result;}
function vne_pipeline_equal($a,$b){return vne_library_canonical_value($a)===vne_library_canonical_value($b);}
function vne_pipeline_json($path){return json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);}
function vne_pipeline_zip($directory,$spec,$slug,$header,$version,$count){
 if(count($spec['files']??array())!==$count||($spec['version']??'')!==$version||hash_file('sha256',$directory.'/'.$spec['archive'])!==$spec['sha256']){throw new RuntimeException('Component profile/archive mismatch');}
 $z=new ZipArchive();if($z->open($directory.'/'.$spec['archive'])!==true){throw new RuntimeException('Invalid component ZIP');}
 try{
  if($z->numFiles!==$count){throw new RuntimeException('ZIP entry count differs');}$expected=array();
  foreach($spec['files'] as $f){$p=$f['path'];if(!preg_match('~^'.$slug.'/[a-z0-9_/-]+\.[a-z]+$~D',$p)||str_contains($p,'..')||isset($expected[$p])){throw new RuntimeException('Unsafe/duplicate component path');}$expected[$p]=$f['sha256'];}
  $seen=array();for($i=0;$i<$z->numFiles;$i++){$s=$z->statIndex($i);$p=$s['name'];if(!isset($expected[$p])||isset($seen[$p])||$s['size']>1048576){throw new RuntimeException('Unexpected ZIP member');}$seen[$p]=true;$z->getExternalAttributesIndex($i,$system,$attributes);if($system===3&&(($attributes>>16)&0170000)===0120000){throw new RuntimeException('ZIP symlink refused');}$stream=$z->getStream($p);if(!$stream){throw new RuntimeException('ZIP stream failed');}try{$hash=hash_init('sha256');hash_update_stream($hash,$stream);if(hash_final($hash)!==$expected[$p]){throw new RuntimeException('ZIP member hash differs');}}finally{fclose($stream);}}
  if(!preg_match('/^\s*(?:\*\s*)?Version:\s*'.preg_quote($version,'/').'\s*$/m',$z->getFromName($slug.'/'.$header))){throw new RuntimeException('ZIP component header differs');}
 }finally{$z->close();}
}
function vne_pipeline_fingerprint($ids,$validationExceptions=array()){
 global $wpdb;if(!$ids){return hash('sha256','empty');}$list=implode(',',array_map('intval',$ids));
 $posts=$wpdb->get_results("SELECT * FROM {$wpdb->posts} WHERE ID IN ($list) ORDER BY ID",ARRAY_A);$meta=$wpdb->get_results("SELECT * FROM {$wpdb->postmeta} WHERE post_id IN ($list) ORDER BY meta_id",ARRAY_A);
 $meta=array_values(array_filter($meta,fn($m)=>!($m['meta_key']==='_vne_validation'&&in_array((int)$m['post_id'],$validationExceptions,true))));
 $terms=$wpdb->get_results("SELECT r.object_id,r.term_taxonomy_id,r.term_order,t.name,t.slug,tt.taxonomy,tt.description,tt.parent FROM {$wpdb->term_relationships} r JOIN {$wpdb->term_taxonomy} tt ON r.term_taxonomy_id=tt.term_taxonomy_id JOIN {$wpdb->terms} t ON tt.term_id=t.term_id WHERE r.object_id IN ($list) ORDER BY r.object_id,r.term_taxonomy_id",ARRAY_A);
 return hash('sha256',wp_json_encode(array($posts,$meta,$terms,get_option('active_plugins'),get_stylesheet(),wp_get_theme()->get('Version'),get_option('vne_library_schema_version'),get_option('blog_public'))));
}
function vne_pipeline_ids(){global $wpdb;return array_map('intval',$wpdb->get_col($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_type IN (%s,%s,%s,%s,%s) ORDER BY ID",array('post','page','vne_resource','vne_guide','vne_practice'))));}
function vne_pipeline_package($directory){
 $m=vne_pipeline_json($directory.'/manifest.json');
 if(($m['format']??null)!==1||($m['profile']??'')!=='vne-072-042-schema3'||!preg_match('/^[a-f0-9]{40}$/D',$m['sourceSha']??'')||($m['schema']??null)!==3){throw new RuntimeException('Invalid release profile');}
 $listed=array('manifest.json');foreach($m['files'] as $f){$p=$f['path'];if(!preg_match('~^(?:theme.zip|plugin.zip|rollback.zip|content.json|receiver.php|environments.json|evidence/(?:codex|claude-code|antigravity).html)$~D',$p)||in_array($p,$listed,true)){throw new RuntimeException('Unlisted/duplicate package path');}$listed[]=$p;if(is_link($directory.'/'.$p)||!is_file($directory.'/'.$p)||hash_file('sha256',$directory.'/'.$p)!==$f['sha256']){throw new RuntimeException('Package hash mismatch: '.$p);}}
 $required=array('theme.zip','plugin.zip','rollback.zip','content.json','receiver.php','environments.json','evidence/codex.html','evidence/claude-code.html','evidence/antigravity.html');$actual=array_column($m['files'],'path');sort($required);sort($actual);if($required!==$actual){throw new RuntimeException('Incomplete package');}
 if(hash_file('sha256',__FILE__)!==array_values(array_filter($m['files'],fn($f)=>$f['path']==='receiver.php'))[0]['sha256']){throw new RuntimeException('Receiver source differs');}
 foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory,FilesystemIterator::SKIP_DOTS)) as $f){if($f->isLink()){throw new RuntimeException('Payload symlink');}if($f->isFile()){$p=substr($f->getPathname(),strlen($directory)+1);if(!in_array(str_replace(chr(92),'/',$p),array_merge($listed,array('payload.zip')),true)){throw new RuntimeException('Unexpected payload file');}}}
 vne_pipeline_zip($directory,$m['components']['theme'],'vibelab','style.css','0.7.2',38);vne_pipeline_zip($directory,$m['components']['plugin'],'vne-library-core','vne-library-core.php','0.4.2',10);vne_pipeline_zip($directory,$m['previousTheme'],'vibelab','style.css','0.7.1',36);
 $content=vne_pipeline_json($directory.'/content.json');if(count($content['entries']??array())!==103||($content['campaign']??'')!=='vne-existing-content-20261026'||($content['evidenceDirectory']??'')!=='g03-0499402e4708'||($m['evidenceDirectory']??'')!==$content['evidenceDirectory']){throw new RuntimeException('Unexpected content set');}
 $keys=array_column($content['entries'],'key');if(count(array_unique($keys))!==103){throw new RuntimeException('Duplicate content key');}
 foreach($content['entries'] as $e){if(!in_array($e['kind'],array('observe','guide','resource'),true)||(!empty($e['validation'])&&(!in_array($e['key'],array('codex','claude-code','antigravity'),true)||str_contains(wp_json_encode($e['validation']),'g03-fixture')))){throw new RuntimeException('Unexpected evidence/content kind');}}
 return array($m,$content,hash_file('sha256',$directory.'/manifest.json'));
}
function vne_pipeline_context($directory,$environment,$override=null){
 $all=vne_pipeline_json($directory.'/environments.json');$c=$all[$environment]??null;
 if($override!==null){if($environment!=='fixture'||!defined('VNE_PIPELINE_FIXTURE')||!VNE_PIPELINE_FIXTURE||!str_contains(str_replace(chr(92),'/',ABSPATH),'/tmp/tests/r2-')||DB_NAME!=='wordpress'||!str_starts_with(get_option('home'),'http://127.0.0.1:19423')){throw new RuntimeException('Fixture override refused');}$c=$override;}
 if(!$c||!in_array($environment,array('production','staging','fixture'),true)){throw new RuntimeException('Unknown environment');}
 foreach(array('root'=>ABSPATH,'database'=>DB_NAME,'home'=>get_option('home'),'indexing'=>(string)get_option('blog_public')) as $key=>$value){if(($c[$key]??null)!==$value){throw new RuntimeException('Target mismatch: '.$key);}}
 if(get_stylesheet()!=='vibelab'||VNE_LIBRARY_VERSION!=='0.4.2'||(int)get_option('vne_library_schema_version')!==3){throw new RuntimeException('Runtime mismatch');}
 if(!current_user_can('vne_approve_library')||!current_user_can('vne_validate_library')){throw new RuntimeException('Use an existing authorized WordPress reviewer via --user');}
 return $c;
}
function vne_pipeline_git($directory,$c,$approval,$manifestHash,$sourceSha){
 foreach(array('payloadSha','manifestSha256','sourceSha','baselineSha256') as $key){if(!is_string($approval[$key]??null)||!preg_match('/^[a-f0-9]{'.(in_array($key,array('payloadSha','sourceSha'),true)?40:64).'}$/D',$approval[$key])){throw new RuntimeException('Missing explicit approval: '.$key);}}
 if($approval['manifestSha256']!==$manifestHash||$approval['sourceSha']!==$sourceSha){throw new RuntimeException('Approved source/manifest differs');}
 if(empty($c['deploymentConfigured'])||!is_string($c['repositoryDirectory'])||!is_string($c['inboxDirectory'])){throw new RuntimeException('Transport is not configured/approved');}
 $inbox=realpath($c['inboxDirectory']);$repo=realpath($c['repositoryDirectory']);$site=realpath(ABSPATH);$payload=realpath($directory);
 if(!$inbox||!$repo||!$payload||$inbox!==$payload||str_starts_with(str_replace(chr(92),'/',$inbox).'/',str_replace(chr(92),'/',$site).'/')||is_link($directory)||is_link($c['repositoryDirectory'])){throw new RuntimeException('Inbox/repository must be private pinned paths');}
 $head=trim(file_get_contents($repo.'/HEAD'));$ref='refs/heads/'.$c['payloadBranch'];if($head!=='ref: '.$ref||!preg_match('~^refs/heads/[a-zA-Z0-9/_-]+$~D',$ref)){throw new RuntimeException('Unexpected payload branch');}
 $sha=is_file($repo.'/'.$ref)?trim(file_get_contents($repo.'/'.$ref)):null;
 if(!$sha&&is_file($repo.'/packed-refs')){foreach(file($repo.'/packed-refs',FILE_IGNORE_NEW_LINES) as $line){if(str_ends_with($line,' '.$ref)){$sha=substr($line,0,40);}}}
 if($sha!==$approval['payloadSha']){throw new RuntimeException('Plesk Git HEAD differs from approved GitHub payload');}
 return $sha;
}
function vne_pipeline_component($folder,$spec){
 $base=ABSPATH.'wp-content/'.$folder.'/'.($folder==='themes'?'vibelab':'vne-library-core');$expected=array();
 foreach($spec['files'] as $f){$name=substr($f['path'],strpos($f['path'],'/')+1);$expected[]=$name;if(!is_file($base.'/'.$name)||is_link($base.'/'.$name)||hash_file('sha256',$base.'/'.$name)!==$f['sha256']){return false;}}
 $actual=array();foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base,FilesystemIterator::SKIP_DOTS)) as $f){if($f->isLink()){return false;}if($f->isFile()){$actual[]=str_replace(chr(92),'/',substr($f->getPathname(),strlen($base)+1));}}sort($actual);sort($expected);return $actual===$expected;
}
function vne_pipeline_find($e){
 $matches=array();$slug=$e['slug']??sanitize_title($e['payload']['title']);
 foreach(get_posts(array('post_type'=>$e['kind']==='resource'?'vne_resource':'vne_guide','post_status'=>array_values(get_post_stati()),'posts_per_page'=>-1,'orderby'=>'ID','order'=>'ASC','suppress_filters'=>true)) as $p){
 $match=$p->post_name===$slug||$p->post_title===($e['title']??$e['payload']['title']);
  if($e['kind']==='resource'){$d=get_post_meta($p->ID,'_vne_resource',true);$match=$match||($d['source_url']??null)===$e['payload']['data']['source_url']||($d['repo_id']??null)===$e['payload']['data']['repo_id'];}
  if($match){$matches[]=$p;}
 }
 if(count($matches)>1){throw new RuntimeException('Ambiguous natural key: '.$e['key']);}return $matches[0]??null;
}
function vne_pipeline_validation($id,$e,$content){$v=$e['validation']??null;if(!$v){return null;}$v['revision']=vne_library_revision($id);$v['evidence_url']=home_url('/wp-content/uploads/vne-guide-evidence/'.$content['evidenceDirectory'].'/'.$e['key'].'.html','https');return $v;}
function vne_pipeline_has_validation($id,$v){if(!$v){return true;}$h=vne_library_validations($id);if(!$h){return false;}$last=end($h);return vne_pipeline_equal(array_intersect_key($last,$v),$v);}
function vne_pipeline_entry($e,$p,$marker){
 if(!$p){if($e['kind']==='observe'){throw new RuntimeException('Required baseline guide absent');}return;}
 $owned=$p->post_content_filtered===$marker&&$p->post_status==='draft';$raw=vne_library_editorial_snapshot($p->ID);$saved=get_post_meta($p->ID,'_vne_approved_content',true);
 if(!$saved||!hash_equals($saved['revision'],vne_library_approved_revision($p->ID))||(!$owned&&$p->post_status!=='publish')){throw new RuntimeException('Unapproved edit/nonpublic collision: '.$e['key']);}
 if(!in_array($p->post_status,array('publish','draft'),true)){throw new RuntimeException('Unexpected owned status');}
 if($e['kind']==='observe'){
  if($raw['title']!==$e['title']||hash('sha256',$raw['content'])!==$e['contentSha256']||($raw['document_source']['source_url']??null)!==$e['sourceUrl']){throw new RuntimeException('Baseline guide changed');}
 }else{
  $payload=$e['payload'];$payload['status']='draft';$payload['primary_category']=0;$payload['categories']=array();$payload['needs']=array();$payload['tools']=array();$clean=vne_pipeline_need(vne_library_validate_payload($payload));
  if(hash('sha256',$clean['content'])!==$e['contentSha256']){throw new RuntimeException('Approved body digest differs');}
  foreach(array('title','content','excerpt','editorial_note',$e['kind']==='resource'?'data':'document_source') as $key){if(!vne_pipeline_equal($raw[$key],$clean[$key])){throw new RuntimeException('Existing content conflict: '.$e['key'].'/'.$key);}}
  if(!$owned){$category=get_term($raw['primary_category'],'vne_category');if(is_wp_error($category)||!$category||($e['kind']==='resource'&&$category->name!==$e['category'])){throw new RuntimeException('Category differs');}
   if($raw['categories']!==array($raw['primary_category'])||$raw['tools']){throw new RuntimeException('Category/tool assignment differs');}
   if($e['kind']==='guide'){$codex=get_page_by_path('lam-landing-page-moc-studio-voi-codex-tren-windows',OBJECT,'vne_guide');if(!$codex||$raw['primary_category']!==(int)get_post_meta($codex->ID,'_vne_primary_category',true)||$raw['needs']){throw new RuntimeException('Guide category differs');}}
   if($e['kind']==='resource'){$needs=wp_get_object_terms($p->ID,'vne_need',array('fields'=>'names'));if($needs!==array($e['need'])||!vne_pipeline_equal(vne_library_state_input($p->ID),$e['state'])||vne_library_validations($p->ID)){throw new RuntimeException('Resource state/taxonomy differs');}}
  }
 }
 if($p->post_name!==($e['slug']??sanitize_title($e['payload']['title']))){throw new RuntimeException('Slug conflict: '.$e['key']);}
 if(!$owned&&$e['kind']!=='resource'){$s=vne_library_state_input($p->ID);if($s['source_access']['status']!=='available'||$s['maintenance']['status']==='archived'||$s['recommendation']['status']!=='normal'||$s['review']['needed']||($s['review']['review_due_at']&&$s['review']['review_due_at']<current_time('Y-m-d'))){throw new RuntimeException('Guide state requires review');}}
}
function vne_pipeline_run($directory,$mode='inspect',$environment='production',$approval=array(),$override=null,$fault=null){
 if(!in_array($mode,array('inspect','apply-content','adopt'),true)){throw new RuntimeException('Unknown receiver mode');}
 list($m,$content,$manifestHash)=vne_pipeline_package($directory);$c=vne_pipeline_context($directory,$environment,$override);
 if($fault!==null&&($environment!=='fixture'||!defined('VNE_PIPELINE_FIXTURE')||!VNE_PIPELINE_FIXTURE)){throw new RuntimeException('Fault injection is fixture-only');}
 $components=array('theme'=>vne_pipeline_component('themes',$m['components']['theme'])?'MATCH':(vne_pipeline_component('themes',$m['previousTheme'])?'PREVIOUS_MATCH':'CONFLICT'),'plugin'=>vne_pipeline_component('plugins',$m['components']['plugin'])?'MATCH':'CONFLICT');
 $key='vne_pipeline_'.substr($manifestHash,0,24);$journal=get_option($key);$ids=vne_pipeline_ids();$fingerprint=vne_pipeline_fingerprint($ids);$plan=array();$exceptions=array();
 foreach($content['entries'] as $e){$p=vne_pipeline_find($e);$marker='vne-pipeline:'.$manifestHash.':'.$e['key'];vne_pipeline_entry($e,$p,$marker);$v=$p?vne_pipeline_validation($p->ID,$e,$content):null;$valid=$p&&vne_pipeline_has_validation($p->ID,$v);if($p&&!$valid&&$v){$exceptions[]=(int)$p->ID;}$plan[]=array('key'=>$e['key'],'id'=>$p?(int)$p->ID:null,'owned'=>$p&&$p->post_content_filtered===$marker,'status'=>$p?$p->post_status:null,'validationReady'=>(bool)$valid);}
 $evidence=array();foreach(array('codex','claude-code','antigravity') as $name){$source=$directory.'/evidence/'.$name.'.html';$target=ABSPATH.'wp-content/uploads/vne-guide-evidence/'.$content['evidenceDirectory'].'/'.$name.'.html';if(is_link($target)||(file_exists($target)&&hash_file('sha256',$target)!==hash_file('sha256',$source))){throw new RuntimeException('Evidence conflict');}$evidence[$name]=is_file($target);}
 if($mode==='inspect'){return array('status'=>'INSPECTED_READ_ONLY','sourceSha'=>$m['sourceSha'],'manifestSha256'=>$manifestHash,'baselineSha256'=>$fingerprint,'components'=>$components,'transportConfigured'=>$c['deploymentConfigured'],'entries'=>$plan,'evidence'=>$evidence,'journalStatus'=>$journal['status']??null);}
 vne_pipeline_git($directory,$c,$approval,$manifestHash,$m['sourceSha']);if($components!==array('theme'=>'MATCH','plugin'=>'MATCH')){throw new RuntimeException('Install/verify approved components before content/adoption');}
 if($journal&&($journal['approval']!==$approval||$journal['environment']!==$environment)){throw new RuntimeException('Different approval already recorded');}
 if(!$journal&&$approval['baselineSha256']!==$fingerprint){throw new RuntimeException('Baseline changed since approval');}
 if(($journal['status']??null)==='complete'){foreach($plan as $p){if(!$p['id']||$p['status']!=='publish'||!$p['validationReady']){throw new RuntimeException('Completed content was changed/hidden; review required');}}}
 if($mode==='adopt'){foreach($plan as $p){if(!$p['id']||$p['status']!=='publish'||!$p['validationReady']){throw new RuntimeException('Adoption cannot create/repair content');}}if(in_array(false,$evidence,true)){throw new RuntimeException('Adoption cannot publish missing evidence');}}
 global $wpdb;$lock='vne_pipeline_lock_'.substr(hash('sha256',wp_json_encode($content)),0,24);$token=wp_generate_uuid4();if(!vne_library_lock_insert($lock,$token)){throw new RuntimeException('Pipeline operation already running');}
 $mail=fn()=>false;$network=fn()=>new WP_Error('pipeline_no_network','Network blocked during receiver write');$closed=fn()=>'closed';$zero=fn()=>0;
 add_filter('pre_wp_mail',$mail,PHP_INT_MAX);add_filter('pre_http_request',$network,PHP_INT_MAX);add_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);add_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);add_filter('pre_option_default_pingback_flag',$zero,PHP_INT_MAX);
 try{
  if(!$journal){$prefix=array();foreach($exceptions as $id){$prefix[$id]=vne_library_validations($id);}$journal=array('status'=>'in_progress','environment'=>$environment,'approval'=>$approval,'originalIds'=>$ids,'validationExceptions'=>$exceptions,'validationPrefixes'=>$prefix,'protectedSha256'=>vne_pipeline_fingerprint($ids,$exceptions),'map'=>array());if(!vne_library_lock_insert($key,maybe_serialize($journal))){throw new RuntimeException('Receipt creation race');}}
  if(vne_pipeline_fingerprint($journal['originalIds'],$journal['validationExceptions'])!==$journal['protectedSha256']){throw new RuntimeException('Pre-existing content changed during/resuming operation');}
  foreach($journal['validationPrefixes'] as $id=>$prefix){if(!vne_pipeline_equal(array_slice(vne_library_validations($id),0,count($prefix)),$prefix)){throw new RuntimeException('Historical validation altered');}}
  if($mode==='adopt'&&$journal['status']==='complete'&&($journal['outcome']??null)==='ADOPTED_EXISTING_BASELINE'){return array('status'=>'ALREADY_ADOPTED','journal'=>$journal);}
  if($mode==='apply-content'){
   $evidenceRoot=ABSPATH.'wp-content/uploads/vne-guide-evidence/'.$content['evidenceDirectory'];$cursor=$evidenceRoot;while($cursor!==rtrim(ABSPATH,'/')){if(is_link($cursor)){throw new RuntimeException('Evidence path symlink refused');}$parent=dirname($cursor);if($parent===$cursor){throw new RuntimeException('Evidence path escaped site');}$cursor=$parent;}if(!is_dir($evidenceRoot)&&!wp_mkdir_p($evidenceRoot)){throw new RuntimeException('Cannot create evidence directory');}
   foreach($evidence as $name=>$exists){if(!$exists&&!copy($directory.'/evidence/'.$name.'.html',$evidenceRoot.'/'.$name.'.html')){throw new RuntimeException('Cannot publish evidence');}}
   $processed=0;
   foreach($content['entries'] as $e){
    $p=vne_pipeline_find($e);$marker='vne-pipeline:'.$manifestHash.':'.$e['key'];
    if(!$p){
     $payload=$e['payload'];$payload['status']='draft';
     if($e['kind']==='resource'){$term=term_exists($e['category'],'vne_category');if(!$term){$term=vne_pipeline_need(vne_library_create_term(array('taxonomy'=>'vne_category','name'=>$e['category'])));}$payload['primary_category']=(int)$term['term_id'];$payload['categories']=array($payload['primary_category']);$need=term_exists($e['need'],'vne_need');if(!$need){$need=vne_pipeline_need(vne_library_create_term(array('taxonomy'=>'vne_need','name'=>$e['need'])));}$payload['needs']=array((int)$need['term_id']);}
     else{$codex=vne_pipeline_find($content['entries'][0]);$payload['primary_category']=(int)get_post_meta($codex->ID,'_vne_primary_category',true);}
     $slug=$e['slug']??sanitize_title($payload['title']);
     $filter=function($data,$postarr)use($payload,$slug,$marker){if(empty($postarr['ID'])&&$data['post_type']===$payload['post_type']&&wp_unslash($data['post_title'])===$payload['title']){if(wp_unique_post_slug($slug,0,'publish',$payload['post_type'],0)!==$slug){throw new RuntimeException('Concurrent slug collision');}$data['post_name']=$slug;$data['post_content_filtered']=$marker;}return $data;};
     add_filter('wp_insert_post_data',$filter,20,2);try{$item=vne_pipeline_need(vne_library_save_item($payload));}finally{remove_filter('wp_insert_post_data',$filter,20);}$p=get_post($item['id']);
     if($fault){$fault('after-create-before-journal',++$processed,$e['key']);}
    }
    vne_pipeline_entry($e,$p,$marker);$id=(int)$p->ID;$journal['map'][$e['key']]=$id;update_option($key,$journal,false);
    if($p->post_content_filtered===$marker){$state=$e['state']??vne_library_default_state();if($e['kind']==='guide'){$state['source_access']=array('status'=>'available','source_url'=>$e['payload']['document_source']['source_url'],'observed_at'=>'2026-10-25','note'=>'Tài liệu đã đối chiếu; bằng chứng đầu ra có chủ hỗ trợ ghi riêng.');}if(!vne_pipeline_equal(vne_library_state_input($id),$state)){vne_pipeline_need(vne_library_save_state($id,$state));}}
    $v=vne_pipeline_validation($id,$e,$content);if($v&&!vne_pipeline_has_validation($id,$v)){vne_pipeline_need(vne_library_record_validation($id,$v));}
   }
   foreach($content['entries'] as $e){$id=$journal['map'][$e['key']];$p=get_post($id);if($p->post_content_filtered==='vne-pipeline:'.$manifestHash.':'.$e['key']&&$p->post_status==='draft'){$item=vne_pipeline_need(vne_library_item($id,true));$payload=array_intersect_key($item,array_flip(array('post_type','title','content','excerpt','status','primary_category','categories','needs','tools','data','document_source','editorial_note')));$payload['status']='publish';vne_pipeline_need(vne_library_save_item($payload,$id,vne_library_approved_revision($id)));}}
  }else{foreach($plan as $p){$journal['map'][$p['key']]=$p['id'];}}
  foreach($content['entries'] as $e){$p=vne_pipeline_find($e);vne_pipeline_entry($e,$p,'vne-pipeline:'.$manifestHash.':'.$e['key']);if(!$p||$p->post_status!=='publish'||!vne_pipeline_has_validation($p->ID,vne_pipeline_validation($p->ID,$e,$content))){throw new RuntimeException('Final readback failed');}}
  if(vne_pipeline_fingerprint($journal['originalIds'],$journal['validationExceptions'])!==$journal['protectedSha256']){throw new RuntimeException('Existing rows/meta changed');}
  $journal['status']='complete';$journal['outcome']=$mode==='adopt'?'ADOPTED_EXISTING_BASELINE':'APPLIED_MISSING_CONTENT';update_option($key,$journal,false);return array('status'=>$journal['outcome'],'journal'=>$journal);
 }finally{$wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name=%s AND option_value=%s",$lock,$token));wp_cache_delete($lock,'options');remove_filter('pre_wp_mail',$mail,PHP_INT_MAX);remove_filter('pre_http_request',$network,PHP_INT_MAX);remove_filter('pre_option_default_comment_status',$closed,PHP_INT_MAX);remove_filter('pre_option_default_ping_status',$closed,PHP_INT_MAX);remove_filter('pre_option_default_pingback_flag',$zero,PHP_INT_MAX);}
}
if(defined('VNE_PIPELINE_LIBRARY_ONLY')&&VNE_PIPELINE_LIBRARY_ONLY){return;}
if(!defined('WP_CLI')||!WP_CLI){exit(1);}
try{$approval=isset($args[2])?json_decode($args[2],true,512,JSON_THROW_ON_ERROR):array();echo 'PIPELINE_RESULT='.wp_json_encode(vne_pipeline_run(__DIR__,$args[0]??'inspect',$args[1]??'production',$approval),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).PHP_EOL;}catch(Throwable $e){echo 'PIPELINE_RESULT='.wp_json_encode(array('status'=>'FAIL','error'=>$e->getMessage())).PHP_EOL;WP_CLI::halt(1);}
