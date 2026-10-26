<?php
// U1 library only. No hooks, schedule, HTTP implementation, UI, or editorial writes.
if (!defined('ABSPATH')) { exit; }
function vne_stars_id($id) {
    if (!is_string($id) && !is_int($id)) { return null; }
    $id=(string)$id;
    return preg_match('/^[1-9][0-9]{0,18}$/D',$id) ? $id : null;
}
function vne_stars_name($name) {
    return is_string($name) && strlen($name)<=200 && preg_match('~^[A-Za-z0-9][A-Za-z0-9_.-]*/[A-Za-z0-9][A-Za-z0-9_.-]*$~D',$name);
}
function vne_stars_header($response,$name) {
    $value=wp_remote_retrieve_header($response,$name);
    return is_string($value)||is_int($value) ? trim((string)$value) : '';
}
function vne_stars_put($key,$value) {
    if (!update_option($key,$value,false) && get_option($key)!==$value) { throw new RuntimeException('storage'); }
}
function vne_stars_pause($response,$now) {
    $wait=0;$retry=vne_stars_header($response,'retry-after');$reset=vne_stars_header($response,'x-ratelimit-reset');
    if (preg_match('/^[0-9]{1,10}$/D',$retry)) { $wait=$now+(int)$retry; }
    if (preg_match('/^[0-9]{1,10}$/D',$reset)) { $wait=max($wait,(int)$reset); }
    return max($now+60,$wait ?: $now+3600);
}
function vne_stars_snapshot($id,$now=null) {
    $id=vne_stars_id($id);if ($id===null) { return null; }
    $r=get_option('vne_stars_repo_'.$id);$now=$now??time();
    if (!is_array($r)||($r['repo_id']??null)!==$id||!is_int($r['stars']??null)||$r['stars']<0||!is_int($r['last_success_at']??null)) { return null; }
    return array_intersect_key($r,array_flip(array('repo_id','full_name','stars','observed_at','last_success_at','status')))+array('stale'=>($r['status']??'')!=='ok'||$now-$r['last_success_at']>172800);
}
function vne_stars_sync_batch($repos,$transport=null,$enabled=false,$now=null) {
    if ($enabled!==true) { return new WP_Error('vne_stars_disabled','Đồng bộ đang tắt.'); }
    if (!current_user_can('vne_manage_library')) { return new WP_Error('vne_stars_permission','Không có quyền đồng bộ.'); }
    if (!is_callable($transport)) { return new WP_Error('vne_stars_transport','U1 cần transport được truyền rõ ràng.'); }
    $now=$now??time();if (!is_int($now)||$now<1) { return new WP_Error('vne_stars_clock','Thời điểm không hợp lệ.'); }
    if (!is_array($repos)||count($repos)>25) { return new WP_Error('vne_stars_input','Danh sách không hợp lệ.'); }
    $unique=array();foreach ($repos as $repo) {
        if (!is_array($repo)||array_diff(array_keys($repo),array('id','full_name'))||!($id=vne_stars_id($repo['id']??null))||!vne_stars_name($repo['full_name']??null)) { return new WP_Error('vne_stars_input','Repo không hợp lệ.'); }
        if (isset($unique[$id])&&strcasecmp($unique[$id]['full_name'],$repo['full_name'])!==0) { return new WP_Error('vne_stars_identity','Một ID có nhiều danh tính.'); }
        $unique[$id]=array('id'=>$id,'full_name'=>$repo['full_name']);
    }
    if (count($unique)>5) { return new WP_Error('vne_stars_batch','Mỗi lượt tối đa 5 repo.'); }
    $key='vne_stars_sync_lock';$token=wp_generate_uuid4();
    if (!vne_library_lock_insert($key,$token)) { return new WP_Error('vne_stars_busy','Đã có lượt đồng bộ đang chạy.'); }
    global $wpdb;$owns=function()use($wpdb,$key,$token){return $wpdb->get_var($wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name=%s",$key))===$token;};
    $result=array('requests'=>0,'items'=>array(),'paused_until'=>null);
    try {
        foreach ($unique as $repo) {
            $id=$repo['id'];$until=(int)get_option('vne_stars_backoff_until',0);
            if ($until>$now) { $result['paused_until']=$until;break; }
            $name='vne_stars_repo_'.$id;$old=get_option($name,array());$old=is_array($old)?$old:array();
            if (($old['next_attempt_at']??0)>$now) { $result['items'][]=array('repo_id'=>$id,'status'=>'not_due');continue; }
            $hour=intdiv($now,3600);$budget=get_option('vne_stars_budget',array());
            $used=($budget['hour']??null)===$hour ? (int)($budget['used']??0) : 0;
            if ($used>=20) { $result['paused_until']=($hour+1)*3600;break; }
            if (!$owns()) { throw new RuntimeException('lock_lost'); }
            // Count before invoking transport: a crash cannot refund a possibly sent request.
            vne_stars_put('vne_stars_budget',array('hour'=>$hour,'used'=>$used+1));
            $url='https://api.github.com/repos/'.$repo['full_name'];$context='public|2026-03-10|application/vnd.github+json';
            $headers=array('Accept'=>'application/vnd.github+json','X-GitHub-Api-Version'=>'2026-03-10','User-Agent'=>'VneconomicsStore-GitHubStars');
            $etag=$old['etag']??'';
            if (($old['repo_id']??null)===$id&&($old['request_url']??'')===$url&&($old['context']??'')===$context&&is_int($old['stars']??null)&&$old['stars']>=0&&is_string($etag)&&$etag!==''&&strlen($etag)<=1024&&!preg_match('/[^\x20-\x7e]/',$etag)) { $headers['If-None-Match']=$etag; }
            try { $response=$transport($url,array('method'=>'GET','headers'=>$headers,'timeout'=>10,'redirection'=>0,'reject_unsafe_urls'=>true,'limit_response_size'=>65536)); }
            catch (Throwable $ignored) { $response=new WP_Error('transport','Transport failed'); }
            $result['requests']++;
            if (!$owns()) { throw new RuntimeException('lock_lost'); }
            $status='transport_error';$code=0;$next=$old;
            if (!is_wp_error($response)) {
                $code=(int)wp_remote_retrieve_response_code($response);$status='http_'.$code;
                if ($code===200) {
                    $body=wp_remote_retrieve_body($response);$type=vne_stars_header($response,'content-type');
                    $data=is_string($body)&&strlen($body)<=65536&&preg_match('~^application/(?:json|[a-z0-9.+-]+\+json)(?:;|$)~i',$type) ? json_decode($body,true,32,JSON_BIGINT_AS_STRING) : null;
                    if (is_array($data)&&vne_stars_id($data['id']??null)===$id&&vne_stars_name($data['full_name']??null)&&strcasecmp($data['full_name'],$repo['full_name'])===0&&is_int($data['stargazers_count']??null)&&$data['stargazers_count']>=0&&$data['stargazers_count']<=9007199254740991) {
                        $tag=vne_stars_header($response,'etag');if (strlen($tag)>1024||preg_match('/[^\x20-\x7e]/',$tag)) { $tag=''; }
                        $next=array('repo_id'=>$id,'full_name'=>$data['full_name'],'stars'=>$data['stargazers_count'],'observed_at'=>$now,'last_success_at'=>$now,'etag'=>$tag,'request_url'=>$url,'context'=>$context);$status='ok';
                    } else { $status='invalid_response'; }
                } elseif ($code===304) {
                    if (isset($headers['If-None-Match'])&&is_int($old['stars']??null)&&is_int($old['last_success_at']??null)) { $next['last_success_at']=$now;$status='ok'; }
                    else { $status='invalid_304'; }
                }
                if (in_array($code,array(403,429),true)||vne_stars_header($response,'x-ratelimit-remaining')==='0') { $pause=vne_stars_pause($response,$now);vne_stars_put('vne_stars_backoff_until',$pause);$result['paused_until']=$pause; }
            }
            $failures=$status==='ok'?0:min((int)($old['failures']??0)+1,9);
            $next['last_attempt_at']=$now;$next['http_status']=$code;$next['status']=$status;$next['failures']=$failures;
            $next['next_attempt_at']=$now+($status==='ok'||$code===404?86400:min(300*(2**min(max(0,$failures-1),8)),86400));
            // Never store bodies, error messages, auth material, or editorial data.
            vne_stars_put($name,$next);$result['items'][]=array('repo_id'=>$id,'status'=>$status,'http_status'=>$code);
        }
        return $result;
    } catch (Throwable $error) {
        return new WP_Error($error->getMessage()==='lock_lost'?'vne_stars_lock_lost':'vne_stars_storage','Chưa xác nhận được lượt đồng bộ; kiểm tra trạng thái trước khi thử lại.');
    } finally {
        $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name=%s AND option_value=%s",$key,$token));wp_cache_delete($key,'options');
    }
}
