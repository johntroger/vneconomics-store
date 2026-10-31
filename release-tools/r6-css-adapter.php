<?php
// Pure candidate-key possession protocol. Not a provisioning or activation entry point.
function vne_adapter_validate_key_handshake_request($request, $now) {
    $fields = array('protocol','target','operationId','kind','expectedActiveFingerprint','candidateFingerprint','challenge','issuedAt','expiresAt');
    if (!is_array($request)) { throw new RuntimeException('Invalid candidate handshake request'); }
    $keys = array_keys($request); $expected = $fields; sort($keys); sort($expected);
    if ($keys !== $expected) { throw new RuntimeException('Candidate handshake request fields differ'); }
    $hex = function($value, $length) { return is_string($value) && strlen($value) === $length && preg_match('/^[a-f0-9]+$/D', $value) === 1; };
    if ($request['protocol'] !== 'r6-css-key-candidate-possession-v1' || $request['target'] !== vne_adapter_production_policy()['home'] || !$hex($request['operationId'],32) || !$hex($request['candidateFingerprint'],64) || !$hex($request['challenge'],64)) { throw new RuntimeException('Candidate handshake scope or identity differs'); }
    if (!in_array($request['kind'],array('initial','rotation'),true) || ($request['kind'] === 'initial' ? $request['expectedActiveFingerprint'] !== null : (!$hex($request['expectedActiveFingerprint'],64) || $request['expectedActiveFingerprint'] === $request['candidateFingerprint']))) { throw new RuntimeException('Candidate active fingerprint differs'); }
    if (!is_int($now) || !is_int($request['issuedAt']) || !is_int($request['expiresAt']) || $now > 9007199254740991 || $request['expiresAt'] > 9007199254740991 || $request['issuedAt'] < 0 || $request['issuedAt'] > $now || $request['expiresAt'] <= $now || $request['expiresAt'] <= $request['issuedAt'] || $request['expiresAt'] - $request['issuedAt'] > 60) { throw new RuntimeException('Candidate handshake stale/future or invalid lifetime'); }
    $canonical = array(); foreach ($fields as $field) { $canonical[$field] = $request[$field]; } return $canonical;
}
function vne_adapter_validate_candidate_key_record($record,$fingerprint,$target) {
    $hex = function($value, $length) { return is_string($value) && strlen($value) === $length && preg_match('/^[a-f0-9]+$/D', $value) === 1; };
    if (!is_array($record)) { throw new RuntimeException('Invalid candidate key record'); }
    $keys = array_keys($record); sort($keys);
    if ($keys !== array('format','key','purpose','target') || $record['format'] !== 1 || $record['purpose'] !== 'r6-css-health-proof' || $record['target'] !== $target || !$hex($record['key'],64)) { throw new RuntimeException('Candidate key record differs'); }
    if (!hash_equals($fingerprint,hash('sha256',hex2bin($record['key'])))) { throw new RuntimeException('Candidate key fingerprint differs'); }
}
function vne_adapter_key_candidate_possession($request, $record, $now) {
    $request = vne_adapter_validate_key_handshake_request($request,$now);
    vne_adapter_validate_candidate_key_record($record,$request['candidateFingerprint'],$request['target']);$key = hex2bin($record['key']);
    try {
    $body = $request;
    $body['observedAt'] = $now; $body['status'] = 'CANDIDATE_KEY_POSSESSION';
    $bytes = json_encode($body,JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    return array('body'=>base64_encode($bytes),'signature'=>hash_hmac('sha256',$bytes,$key));
    } finally { $record['key'] = ''; if (function_exists('sodium_memzero')) { sodium_memzero($key); } else { $key = ''; } }
}
// Read-only primitive; exposed only by the separate package-pinned observation profile.
function vne_adapter_validate_key_private_metadata($s,$directory) {
    $p=vne_adapter_production_policy();vne_adapter_need(is_array($s)&&is_bool($directory),'Candidate metadata invalid');
    foreach(array('uid','gid','mode','nlink','size') as $field)vne_adapter_need(isset($s[$field])&&is_int($s[$field]),'Candidate metadata field invalid');
    vne_adapter_need(($s['mode']&0170000)===($directory?0040000:0100000),'Candidate metadata type differs');
    vne_adapter_need($s['uid']===$p['uid']&&$s['gid']===$p['gid']&&($s['mode']&07777)===($directory?0700:0600),'Candidate private owner/mode differs');
    if(!$directory)vne_adapter_need($s['nlink']===1&&$s['size']>0&&$s['size']<=4096,'Candidate private file links/size differs');
}
function vne_adapter_key_private_stat($path,$directory) {
    vne_adapter_path($path);clearstatcache(true,$path);$s=lstat($path);
    vne_adapter_need(is_array($s)&&($directory?is_dir($path):is_file($path))&&!is_link($path),'Candidate private path/type differs');
    vne_adapter_validate_key_private_metadata($s,$directory);
    return $s;
}
function vne_adapter_key_stat_identity($s) {
    return array_intersect_key($s,array_flip(array('dev','ino','mode','nlink','uid','gid','size','mtime','ctime')));
}
function vne_adapter_read_key_observation($path) {
    $before=vne_adapter_key_private_stat($path,false);$record=vne_adapter_read_key_descriptor($path,$before);
    vne_adapter_need(vne_adapter_key_stat_identity(vne_adapter_key_private_stat($path,false))===vne_adapter_key_stat_identity($before),'Candidate private key changed after read');return $record;
}
function vne_adapter_read_key_descriptor($path,$before) {
    vne_adapter_need(is_array($before)&&($before['mode']&0170000)===0100000&&$before['nlink']===1&&$before['size']>0&&$before['size']<=4096,'Candidate descriptor metadata invalid');
    vne_adapter_path($path);$handle=@fopen($path,'rb');vne_adapter_need(is_resource($handle),'Candidate private key open failed');
    try {
        vne_adapter_need(vne_adapter_key_stat_identity(fstat($handle))===vne_adapter_key_stat_identity($before),'Candidate private file changed before read');
        $bytes=stream_get_contents($handle,4097);vne_adapter_need(is_string($bytes)&&strlen($bytes)===$before['size'],'Candidate private key read differs');
        clearstatcache(true,$path);vne_adapter_path($path);
        vne_adapter_need(vne_adapter_key_stat_identity(fstat($handle))===vne_adapter_key_stat_identity($before)&&vne_adapter_key_stat_identity(lstat($path))===vne_adapter_key_stat_identity($before),'Candidate private key changed during read');
        try { return json_decode($bytes,true,16,JSON_THROW_ON_ERROR); } catch(Throwable $e) { throw new RuntimeException('Candidate private key JSON invalid'); }
    } finally { fclose($handle);$bytes=''; }
}
function vne_adapter_observe_key_candidate($request,$contextPins) {
    $request=vne_adapter_validate_key_handshake_request($request,time());
    $fields=is_array($contextPins)?array_keys($contextPins):array();sort($fields);vne_adapter_need($fields===array('contextPhase','sourceSha'),'Candidate context pins differ');
    vne_adapter_validate_production_context(vne_adapter_observe_production_context(),$contextPins['contextPhase'],$contextPins['sourceSha']);
    $p=vne_adapter_production_policy();$root=$p['control'].'/candidates/'.$request['operationId'];$dirs=array($p['control'],$p['control'].'/candidates',$root);$before=array();
    foreach($dirs as $dir)$before[$dir]=vne_adapter_key_private_stat($dir,true);
    $key=null;$active=null;
    try {
        clearstatcache(true,$p['keyPath']);if($request['kind']==='initial'){vne_adapter_need(!file_exists($p['keyPath'])&&!is_link($p['keyPath']),'Initial candidate conflicts with active server key');}
        else {
            $active=vne_adapter_read_key_observation($p['keyPath']);
            vne_adapter_validate_candidate_key_record($active,$request['expectedActiveFingerprint'],$request['target']);
        }
        $key=vne_adapter_read_key_observation($root.'/health-key.json');$proof=vne_adapter_key_candidate_possession($request,$key,time());
        foreach($dirs as $dir)vne_adapter_need(vne_adapter_key_stat_identity(vne_adapter_key_private_stat($dir,true))===vne_adapter_key_stat_identity($before[$dir]),'Candidate private directory changed during observation');
        clearstatcache(true,$p['keyPath']);if($request['kind']==='initial')vne_adapter_need(!file_exists($p['keyPath'])&&!is_link($p['keyPath']),'Active server key appeared during observation');
        else vne_adapter_need(vne_adapter_read_key_observation($p['keyPath'])===$active,'Active server key changed during observation');
        vne_adapter_need(vne_adapter_read_key_observation($root.'/health-key.json')===$key,'Candidate server key changed during observation');
        vne_adapter_validate_key_handshake_request($request,time());
        return array('status'=>'SERVER_CANDIDATE_OBSERVATION','proof'=>$proof,'keyReturned'=>false,'serverOriginVerified'=>false,'writerReservationVerified'=>false,'activationAuthorized'=>false,'provisioningAuthorized'=>false);
    } finally { if(is_array($key))$key['key']='';if(is_array($active))$active['key']=''; }
}
function vne_adapter_production_key_observation_dispatch($a,$request){
    $fields=array('environment','profile','sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256','contextPhase');$actual=is_array($a)?array_keys($a):array();sort($fields);sort($actual);
    vne_adapter_need($actual===$fields&&$a['environment']==='production'&&$a['profile']==='vibelab-v2-r6-css-production-key-observe-schema3'&&in_array($a['contextPhase'],array('baseline','candidate'),true),'Key observation approval differs');
    vne_adapter_need(!defined('VNE_ADAPTER_RUNTIME_TOKEN')&&!defined('VNE_ADAPTER_FIXTURE_TOKEN'),'Fixture token refused by key observation');
    $request=vne_adapter_validate_key_handshake_request($request,time());$package=vne_adapter_inspect($a);
    vne_adapter_need($package['profile']===$a['profile'],'Key observation package profile differs');
    return vne_adapter_observe_key_candidate($request,array('contextPhase'=>$a['contextPhase'],'sourceSha'=>$a['sourceSha']));
}
// Reservation writer is fixture-only. It coordinates with the existing receiver.lock.
function vne_adapter_validate_key_reservation_record($record,$request) {
    $fields=is_array($record)?array_keys($record):array();sort($fields);
    vne_adapter_need($fields===array('createdAt','expiresAt','phase','protocol','request')&&$record['protocol']==='r6-css-key-reservation-v1'&&$record['request']===$request&&is_int($record['createdAt'])&&$record['createdAt']>=$request['issuedAt']&&$record['createdAt']<$request['expiresAt']&&$record['expiresAt']===$request['expiresAt']&&in_array($record['phase'],array('RESERVED','RELEASED'),true),'Key reservation identity/state differs');
}
function vne_adapter_key_reservation_fixture($mode,$request) {
    vne_adapter_write_scope();vne_adapter_need(in_array($mode,array('reserve','inspect','release'),true),'Unknown key reservation mode');
    $now=time();$request=vne_adapter_validate_key_handshake_request($request,$mode==='release'?($request['issuedAt']??$now):$now);
    vne_adapter_need($request['issuedAt']<=$now,'Key reservation request is from the future');
    $control='/adapter-fixture/control';$lock=$control.'/receiver.lock';$journal=$control.'/journal-'.$request['operationId'].'.json';
    $read=function($path) {
        vne_adapter_path($path);$s=lstat($path);vne_adapter_need(is_file($path)&&$s['nlink']===1&&$s['size']>0&&$s['size']<=4096,'Key reservation journal type/size differs');
        try { return json_decode(file_get_contents($path),true,16,JSON_THROW_ON_ERROR); } catch(Throwable $e) { throw new RuntimeException('Key reservation journal JSON invalid'); }
    };
    $validate=function($record)use($request) {
        vne_adapter_validate_key_reservation_record($record,$request);
    };
    if(!file_exists($lock)&&!is_link($lock)&&$mode==='release'&&file_exists($journal)){
        $j=$read($journal);$validate($j);vne_adapter_need($j['phase']==='RELEASED','Missing reservation lock; inspect');
        return array('status'=>'KEY_RESERVATION_ALREADY_RELEASED','activationAuthorized'=>false,'productionWriteAuthorized'=>false);
    }
    $created=false;$handle=null;$held=false;
    try {
        if(file_exists($lock)||is_link($lock)){
            vne_adapter_path($lock);$s=lstat($lock);vne_adapter_need(is_file($lock)&&$s['nlink']===1&&$s['size']>0&&$s['size']<=4096,'Key reservation lock invalid');$handle=@fopen($lock,'r+');
        }else{
            vne_adapter_need($mode==='reserve','Key reservation does not exist');
            vne_adapter_need(!file_exists($journal)&&!is_link($journal),'Existing key reservation journal; inspect');
            foreach(glob($control.'/journal-*.json') as $other){
                vne_adapter_need(preg_match('~/journal-[a-f0-9]{32}\.json$~D',$other),'Unknown journal filename; inspect');$old=$read($other);
                vne_adapter_need(is_array($old)&&in_array($old['phase']??null,array('COMPLETE','ROLLED_BACK','RELEASED'),true),'Nonterminal journal without lock; inspect');
            }
            $handle=@fopen($lock,'x+');$created=is_resource($handle);
        }
        vne_adapter_need(is_resource($handle),'Cannot acquire key reservation lock; inspect before retry');
        $held=flock($handle,LOCK_EX|LOCK_NB);vne_adapter_need($held,'Key reservation busy; inspect before retry');
        vne_adapter_path($lock);$opened=fstat($handle);clearstatcache(true,$lock);$current=lstat($lock);
        vne_adapter_need($opened['ino']===$current['ino']&&$opened['dev']===$current['dev']&&$current['nlink']===1,'Key reservation lock replaced');
        if($created){
            vne_adapter_need(chmod($lock,0600),'Key reservation lock mode failed');vne_adapter_validate_key_handshake_request($request,time());
            $j=array('protocol'=>'r6-css-key-reservation-v1','request'=>$request,'phase'=>'RESERVED','createdAt'=>time(),'expiresAt'=>$request['expiresAt']);$bytes=json_encode($j,JSON_THROW_ON_ERROR);
            vne_adapter_need(fwrite($handle,$bytes)===strlen($bytes)&&fflush($handle),'Key reservation lock write failed');
            vne_adapter_need(!file_exists($journal)&&!is_link($journal),'Key reservation journal appeared; inspect');vne_adapter_write_journal($journal,$j);
        }else{
            rewind($handle);$raw=stream_get_contents($handle,4097);vne_adapter_need(is_string($raw)&&strlen($raw)>0&&strlen($raw)<=4096,'Key reservation lock read failed');
            try {$l=json_decode($raw,true,16,JSON_THROW_ON_ERROR);}catch(Throwable $e){throw new RuntimeException('Key reservation lock JSON invalid');}
            $validate($l);vne_adapter_need($l['phase']==='RESERVED','Reservation lock phase differs');$j=$read($journal);$validate($j);
            vne_adapter_need($l['createdAt']===$j['createdAt']&&($j['phase']==='RESERVED'||$mode==='release'),'Reservation lock/journal phase differs');
        }
        $validate($j);vne_adapter_need($j['createdAt']<=time(),'Key reservation clock differs');
        rewind($handle);vne_adapter_need(stream_get_contents($handle,4097)===($created?$bytes:$raw)&&$read($journal)===$j,'Key reservation state changed; inspect');
        clearstatcache(true,$lock);$current=lstat($lock);vne_adapter_need($opened['ino']===$current['ino']&&$opened['dev']===$current['dev']&&!is_link($lock),'Key reservation lock changed');
        if($mode==='release'){
            $activation=$control.'/candidates/'.$request['operationId'].'/activation.json';
            if(file_exists($activation)||is_link($activation))vne_adapter_need(in_array(vne_adapter_read_key_activation_fixture($request)['phase'],array('ACTIVATED','ROLLED_BACK'),true),'Unfinished key activation; retain reservation and inspect');
            if($j['phase']!=='RELEASED'){$j['phase']='RELEASED';vne_adapter_write_journal($journal,$j);}
            vne_adapter_need(unlink($lock),'Key reservation own lock cleanup failed');
            return array('status'=>'KEY_RESERVATION_RELEASED','activationAuthorized'=>false,'productionWriteAuthorized'=>false);
        }
        vne_adapter_validate_key_handshake_request($request,time());
        return array('status'=>$created?'KEY_RESERVATION_CREATED':($mode==='inspect'?'KEY_RESERVATION_VERIFIED':'KEY_RESERVATION_ALREADY_HELD'),'operationId'=>$request['operationId'],'expiresAt'=>$j['expiresAt'],'candidateVerified'=>false,'activationAuthorized'=>false,'productionWriteAuthorized'=>false);
    }finally{
        // A partial journal/lock is evidence for inspect; never steal or auto-delete it.
        if($held)flock($handle,LOCK_UN);if(is_resource($handle))fclose($handle);
    }
}
function vne_adapter_key_reservation_owned_fixture($request,$handle,$allowExpired=false) {
    vne_adapter_write_scope();vne_adapter_need(is_bool($allowExpired),'Invalid key recovery clock mode');vne_adapter_validate_key_handshake_request($request,$allowExpired?($request['issuedAt']??time()):time());vne_adapter_need($request['issuedAt']<=time(),'Key recovery request is from the future');vne_adapter_need(is_resource($handle),'Key stage requires held reservation mutex');
    $lock='/adapter-fixture/control/receiver.lock';$journal='/adapter-fixture/control/journal-'.$request['operationId'].'.json';vne_adapter_path($lock);vne_adapter_path($journal);
    clearstatcache();$opened=fstat($handle);$current=lstat($lock);$js=lstat($journal);
    vne_adapter_need(is_file($lock)&&$current['nlink']===1&&$opened['dev']===$current['dev']&&$opened['ino']===$current['ino']&&is_file($journal)&&$js['nlink']===1&&$js['size']>0&&$js['size']<=4096,'Key stage lock/journal metadata differs');
    rewind($handle);$raw=stream_get_contents($handle,4097);vne_adapter_need(is_string($raw)&&strlen($raw)>0&&strlen($raw)<=4096,'Key stage lock size differs');
    try{$l=json_decode($raw,true,16,JSON_THROW_ON_ERROR);$j=json_decode(file_get_contents($journal),true,16,JSON_THROW_ON_ERROR);}catch(Throwable $e){throw new RuntimeException('Key stage reservation JSON invalid');}
    vne_adapter_validate_key_reservation_record($l,$request);vne_adapter_validate_key_reservation_record($j,$request);
    vne_adapter_need($l===$j&&$j['phase']==='RESERVED'&&$j['createdAt']<=time(),'Key stage reservation is not live/owned');return $raw;
}
function vne_adapter_read_key_stage_fixture($path,$fingerprint,$target) {
    vne_adapter_write_scope();vne_adapter_need(preg_match('~^/adapter-fixture/control/(?:health-key\.json|candidates/[a-f0-9]{32}/(?:health-key|previous-health-key)\.json)$~D',$path),'Key stage fixture path differs');vne_adapter_path($path);clearstatcache(true,$path);$s=lstat($path);
    vne_adapter_need(($s['mode']&07777)===0600,'Key stage fixture file mode differs');$record=vne_adapter_read_key_descriptor($path,$s);vne_adapter_validate_candidate_key_record($record,$fingerprint,$target);return $record;
}
function vne_adapter_stage_key_candidate_fixture($request,$record) {
    vne_adapter_write_scope();$request=vne_adapter_validate_key_handshake_request($request,time());vne_adapter_validate_candidate_key_record($record,$request['candidateFingerprint'],$request['target']);
    $control='/adapter-fixture/control';$lock=$control.'/receiver.lock';vne_adapter_path($lock);$handle=@fopen($lock,'r+');vne_adapter_need(is_resource($handle),'Key stage requires existing reservation');$held=false;$out=null;$active=null;$stored=null;
    try {
        $held=flock($handle,LOCK_EX|LOCK_NB);vne_adapter_need($held,'Key stage reservation busy');$lockRaw=vne_adapter_key_reservation_owned_fixture($request,$handle);
        $activeGuard=function()use($request,$control){
            clearstatcache(true,$control.'/health-key.json');
            if($request['kind']==='initial'){vne_adapter_need(!file_exists($control.'/health-key.json')&&!is_link($control.'/health-key.json'),'Initial stage conflicts with active key');return null;}
            return vne_adapter_read_key_stage_fixture($control.'/health-key.json',$request['expectedActiveFingerprint'],$request['target']);
        };
        $active=$activeGuard();$root=$control.'/candidates/'.$request['operationId'];
        foreach(array($control,$control.'/candidates',$root) as $dir){
            if(!file_exists($dir)&&!is_link($dir)){vne_adapter_need($dir!==$control&&mkdir($dir,0700),'Key stage private directory create failed');}
            vne_adapter_path($dir);clearstatcache(true,$dir);vne_adapter_need(is_dir($dir)&&(lstat($dir)['mode']&07777)===0700,'Key stage fixture directory mode/type differs');
        }
        $path=$root.'/health-key.json';$entries=array_values(array_diff(scandir($root),array('.','..')));$retry=file_exists($path)||is_link($path);
        vne_adapter_need($entries===($retry?array('health-key.json'):array()),'Incomplete key candidate retained; inspect');
        if(!$retry){
            vne_adapter_need(vne_adapter_key_reservation_owned_fixture($request,$handle)===$lockRaw,'Key stage reservation changed before write');
            $out=@fopen($path,'x');vne_adapter_need(is_resource($out),'Key stage exclusive create failed');vne_adapter_need(chmod($path,0600)&&(fstat($out)['mode']&07777)===0600,'Key stage private mode setup failed');
            $bytes=json_encode($record,JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);$offset=0;
            while($offset<strlen($bytes)){$n=fwrite($out,substr($bytes,$offset));vne_adapter_need(is_int($n)&&$n>0,'Key stage write interrupted; inspect retained candidate');$offset+=$n;}
            vne_adapter_need(fflush($out),'Key stage flush failed');fclose($out);$out=null;$bytes='';
        }
        $stored=vne_adapter_read_key_stage_fixture($path,$request['candidateFingerprint'],$request['target']);
        vne_adapter_need($activeGuard()===$active,'Active fixture key changed while staging');vne_adapter_need(vne_adapter_key_reservation_owned_fixture($request,$handle)===$lockRaw,'Key stage reservation changed after write');
        $proof=vne_adapter_key_candidate_possession($request,$stored,time());
        return array('status'=>$retry?'CANDIDATE_KEY_ALREADY_STAGED':'CANDIDATE_KEY_STAGED','proof'=>$proof,'candidateFingerprint'=>$request['candidateFingerprint'],'activeKeyChanged'=>false,'activationAuthorized'=>false,'productionWriteAuthorized'=>false);
    } finally {
        if(is_resource($out))fclose($out);$record['key']='';$bytes='';if(is_array($active))$active['key']='';if(is_array($stored))$stored['key']='';
        // Partial candidate is retained for inspect; it may already contain credential bytes.
        if($held)flock($handle,LOCK_UN);fclose($handle);
    }
}
function vne_adapter_read_key_activation_fixture($request) {
    vne_adapter_write_scope();$path='/adapter-fixture/control/candidates/'.$request['operationId'].'/activation.json';vne_adapter_path($path);clearstatcache(true,$path);$s=lstat($path);
    vne_adapter_need(($s['mode']&07777)===0600,'Key activation metadata mode differs');$state=vne_adapter_read_key_descriptor($path,$s);$fields=is_array($state)?array_keys($state):array();sort($fields);
    vne_adapter_need($fields===array('phase','protocol','request')&&$state['protocol']==='r6-css-key-activation-v1'&&$state['request']===$request&&in_array($state['phase'],array('PREPARED','ACTIVATED','ROLLBACK_PREPARED','ROLLED_BACK'),true),'Key activation identity/state differs');return $state;
}
function vne_adapter_write_key_activation_fixture($request,$phase) {
    vne_adapter_write_scope();vne_adapter_need(in_array($phase,array('PREPARED','ACTIVATED','ROLLBACK_PREPARED','ROLLED_BACK'),true),'Key activation phase differs');
    $path='/adapter-fixture/control/candidates/'.$request['operationId'].'/activation.json';vne_adapter_need(!is_link($path),'Key activation metadata symlink refused');$temp=$path.'.tmp-'.bin2hex(random_bytes(8));$out=null;
    try{$out=@fopen($temp,'x');vne_adapter_need(is_resource($out)&&chmod($temp,0600),'Key activation metadata temp create failed');$bytes=json_encode(array('protocol'=>'r6-css-key-activation-v1','request'=>$request,'phase'=>$phase),JSON_THROW_ON_ERROR);vne_adapter_need(fwrite($out,$bytes)===strlen($bytes)&&fflush($out),'Key activation metadata write failed');fclose($out);$out=null;vne_adapter_need(rename($temp,$path),'Key activation metadata rename failed');}
    finally{if(is_resource($out))fclose($out);if(is_file($temp))unlink($temp);}
}
function vne_adapter_activate_key_candidate_fixture($approval) {
    vne_adapter_write_scope();$fields=is_array($approval)?array_keys($approval):array();sort($fields);vne_adapter_need($fields===array('activationApproved','request')&&$approval['activationApproved']===true,'Explicit fixture key activation approval required');
    $request=vne_adapter_validate_key_handshake_request($approval['request'],time());$control='/adapter-fixture/control';$root=$control.'/candidates/'.$request['operationId'];$candidate=$root.'/health-key.json';$previous=$root.'/previous-health-key.json';$active=$control.'/health-key.json';$meta=$root.'/activation.json';$lock=$control.'/receiver.lock';
    foreach(array($control,$control.'/candidates',$root,$lock) as $path)vne_adapter_path($path);
    foreach(array($control,$control.'/candidates',$root) as $dir)vne_adapter_need(is_dir($dir)&&(lstat($dir)['mode']&07777)===0700,'Key activation private directory differs');
    $handle=@fopen($lock,'r+');vne_adapter_need(is_resource($handle),'Key activation requires reservation');$held=false;
    $exists=function($path){clearstatcache(true,$path);return file_exists($path)||is_link($path);};
    $verify=function($path,$fingerprint)use($request){$key=vne_adapter_read_key_stage_fixture($path,$fingerprint,$request['target']);$key['key']='';};
    try{
        $held=flock($handle,LOCK_EX|LOCK_NB);vne_adapter_need($held,'Key activation reservation busy');$raw=vne_adapter_key_reservation_owned_fixture($request,$handle);
        $allowed=array('health-key.json','previous-health-key.json','activation.json');foreach(array_diff(scandir($root),array('.','..')) as $entry)vne_adapter_need(in_array($entry,$allowed,true),'Incomplete activation files retained; inspect');
        $retry=$exists($meta);
        if(!$retry){
            vne_adapter_need(!$exists($previous),'Unexpected previous key; inspect');$verify($candidate,$request['candidateFingerprint']);
            if($request['kind']==='initial')vne_adapter_need(!$exists($active),'Initial activation conflicts with active key');else $verify($active,$request['expectedActiveFingerprint']);
            vne_adapter_write_key_activation_fixture($request,'PREPARED');
        }
        $state=vne_adapter_read_key_activation_fixture($request);vne_adapter_need(in_array($state['phase'],array('PREPARED','ACTIVATED'),true),'Rollback state refuses activation');$switched=false;
        if($exists($active)){
            try{$verify($active,$request['candidateFingerprint']);$switched=true;}
            catch(Throwable $e){if($request['kind']==='initial')throw $e;$verify($active,$request['expectedActiveFingerprint']);}
        }
        if($state['phase']==='ACTIVATED')vne_adapter_need($switched,'Activated key changed; inspect');
        if($switched){vne_adapter_need(!$exists($candidate),'Ambiguous active and candidate copies; inspect');}
        else{
            vne_adapter_need($state['phase']==='PREPARED','Key activation cannot resume');$verify($candidate,$request['candidateFingerprint']);
            if($request['kind']==='rotation'){
                if($exists($previous)){vne_adapter_need(!$exists($active),'Both previous and old active key present; inspect');$verify($previous,$request['expectedActiveFingerprint']);}
                else{vne_adapter_need($exists($active),'Missing old active/previous key; inspect');$verify($active,$request['expectedActiveFingerprint']);vne_adapter_need(rename($active,$previous),'Old key preservation failed');}
            }else vne_adapter_need(!$exists($previous)&&!$exists($active),'Initial activation state conflict');
            vne_adapter_need(vne_adapter_key_reservation_owned_fixture($request,$handle)===$raw,'Key activation reservation changed before switch');vne_adapter_need(!$exists($active),'Active key appeared; inspect');
            vne_adapter_need(rename($candidate,$active),'Candidate key switch failed; previous key retained');
        }
        $verify($active,$request['candidateFingerprint']);if($request['kind']==='rotation')$verify($previous,$request['expectedActiveFingerprint']);else vne_adapter_need(!$exists($previous),'Initial activation has unexpected previous key');
        vne_adapter_need(vne_adapter_key_reservation_owned_fixture($request,$handle)===$raw,'Key activation reservation changed after switch');
        if($state['phase']!=='ACTIVATED')vne_adapter_write_key_activation_fixture($request,'ACTIVATED');
        return array('status'=>$state['phase']==='ACTIVATED'?'FIXTURE_KEY_ALREADY_ACTIVATED':'FIXTURE_KEY_ACTIVATED','candidateFingerprint'=>$request['candidateFingerprint'],'previousFingerprint'=>$request['expectedActiveFingerprint'],'previousKeyRetained'=>$request['kind']==='rotation','productionWriteAuthorized'=>false,'twoSideCommitImplemented'=>false);
    }finally{if($held)flock($handle,LOCK_UN);fclose($handle);}
}
function vne_adapter_rollback_key_candidate_fixture($approval) {
    vne_adapter_write_scope();$fields=is_array($approval)?array_keys($approval):array();sort($fields);
    vne_adapter_need($fields===array('expectedPhase','recoveryApproved','request')&&$approval['recoveryApproved']===true&&in_array($approval['expectedPhase'],array('PREPARED','ACTIVATED'),true),'Explicit fixture key recovery approval required');
    $request=$approval['request'];$request=vne_adapter_validate_key_handshake_request($request,is_array($request)?($request['issuedAt']??time()):time());vne_adapter_need($request['issuedAt']<=time(),'Key recovery request is from the future');
    $control='/adapter-fixture/control';$root=$control.'/candidates/'.$request['operationId'];$active=$control.'/health-key.json';$candidate=$root.'/health-key.json';$previous=$root.'/previous-health-key.json';$lock=$control.'/receiver.lock';
    foreach(array($control,$control.'/candidates',$root,$lock) as $path)vne_adapter_path($path);foreach(array($control,$control.'/candidates',$root) as $dir)vne_adapter_need(is_dir($dir)&&(lstat($dir)['mode']&07777)===0700,'Key recovery directory mode/type differs');
    $handle=@fopen($lock,'r+');vne_adapter_need(is_resource($handle),'Key recovery requires own reservation');$held=false;
    $exists=function($path){clearstatcache(true,$path);return file_exists($path)||is_link($path);};$verify=function($path,$fp)use($request){$record=vne_adapter_read_key_stage_fixture($path,$fp,$request['target']);$record['key']='';};
    try{
        $held=flock($handle,LOCK_EX|LOCK_NB);vne_adapter_need($held,'Key recovery reservation busy');$raw=vne_adapter_key_reservation_owned_fixture($request,$handle,true);$state=vne_adapter_read_key_activation_fixture($request);
        vne_adapter_need(in_array($state['phase'],array($approval['expectedPhase'],'ROLLBACK_PREPARED','ROLLED_BACK'),true),'Key recovery expected phase differs');
        foreach(array_diff(scandir($root),array('.','..')) as $entry)vne_adapter_need(in_array($entry,array('health-key.json','previous-health-key.json','activation.json'),true),'Unknown key recovery file; inspect');
        $hasCandidate=$exists($candidate);$hasPrevious=$exists($previous);$activeKind='absent';
        if($hasCandidate)$verify($candidate,$request['candidateFingerprint']);if($hasPrevious){vne_adapter_need($request['kind']==='rotation','Unexpected previous key in initial recovery');$verify($previous,$request['expectedActiveFingerprint']);}
        if($exists($active)){try{$verify($active,$request['candidateFingerprint']);$activeKind='candidate';}catch(Throwable $e){if($request['kind']!=='rotation')throw $e;$verify($active,$request['expectedActiveFingerprint']);$activeKind='previous';}}
        if($request['kind']==='initial')$baseline=$activeKind==='absent'&&$hasCandidate&&!$hasPrevious;
        else $baseline=$activeKind==='previous'&&$hasCandidate&&!$hasPrevious;
        $between=$request['kind']==='rotation'&&$activeKind==='absent'&&$hasCandidate&&$hasPrevious;
        $switched=$activeKind==='candidate'&&!$hasCandidate&&($request['kind']==='rotation'?$hasPrevious:!$hasPrevious);
        vne_adapter_need($baseline||$between||$switched,'Key recovery file arrangement conflicts; inspect');
        if($state['phase']==='ACTIVATED')vne_adapter_need($switched,'Activated key drift before recovery; inspect');
        if($state['phase']==='ROLLED_BACK')vne_adapter_need($baseline,'Rolled-back key drift; inspect');
        else{
            if($state['phase']!=='ROLLBACK_PREPARED')vne_adapter_write_key_activation_fixture($request,'ROLLBACK_PREPARED');
            vne_adapter_need(vne_adapter_key_reservation_owned_fixture($request,$handle,true)===$raw,'Key recovery reservation changed');
            if($switched){vne_adapter_need(!$exists($candidate),'Recovery candidate appeared; inspect');vne_adapter_need(rename($active,$candidate),'Preserve candidate before rollback failed');}
            if($request['kind']==='rotation'&&($between||$switched)){vne_adapter_need(!$exists($active),'Recovery active key appeared; inspect');$verify($previous,$request['expectedActiveFingerprint']);vne_adapter_need(rename($previous,$active),'Previous key restore failed; inspect retained files');}
            $verify($candidate,$request['candidateFingerprint']);if($request['kind']==='rotation')$verify($active,$request['expectedActiveFingerprint']);else vne_adapter_need(!$exists($active),'Initial rollback active key conflict');
            vne_adapter_need(!$exists($previous)&&vne_adapter_key_reservation_owned_fixture($request,$handle,true)===$raw,'Key recovery state changed after restore');vne_adapter_write_key_activation_fixture($request,'ROLLED_BACK');
        }
        return array('status'=>$state['phase']==='ROLLED_BACK'?'FIXTURE_KEY_ALREADY_ROLLED_BACK':'FIXTURE_KEY_ROLLED_BACK','candidateRetained'=>true,'activeFingerprint'=>$request['expectedActiveFingerprint'],'productionWriteAuthorized'=>false,'twoSideRecoveryImplemented'=>false);
    }finally{if($held)flock($handle,LOCK_UN);fclose($handle);}
}
// Caller must pin this file BEFORE including it. Runtime writes are local-fixture-only.
if(PHP_SAPI!=='cli')throw new RuntimeException('CLI required');
function vne_adapter_need($ok,$message){if(!$ok)throw new RuntimeException($message);}
function vne_adapter_path($path){
    vne_adapter_need(is_string($path)&&str_starts_with($path,'/')&&!str_contains($path,chr(0))&&!preg_match('~(^|/)\.\.?(/|$)~',$path),'Unsafe path');
    for($part=$path;$part!==dirname($part);$part=dirname($part))vne_adapter_need(!is_link($part),'Symlink refused');
    $real=realpath($path);vne_adapter_need($real===$path,'Canonical path required');return $real;
}
function vne_adapter_paths($environment){
    if($environment==='local-runtime'){
        vne_adapter_need(defined('ABSPATH')&&ABSPATH==='/wordpress/'&&defined('VNE_ADAPTER_RUNTIME_TOKEN')&&preg_match('/^[a-f0-9]{64}$/D',VNE_ADAPTER_RUNTIME_TOKEN),'Runtime fixture required');
        vne_adapter_need(is_file('/wordpress/.adapter-owned')&&file_get_contents('/wordpress/.adapter-owned')===VNE_ADAPTER_RUNTIME_TOKEN,'Runtime fixture owner differs');
        return array('root'=>'/wordpress','inbox'=>'/adapter-fixture/inbox','clone'=>'/adapter-fixture/clone.git');
    }
    if($environment==='local-fixture'){
        vne_adapter_need(defined('VNE_ADAPTER_FIXTURE_TOKEN')&&preg_match('/^[a-f0-9]{64}$/D',VNE_ADAPTER_FIXTURE_TOKEN),'Fixture token required');
        vne_adapter_need(is_file('/adapter-fixture/owned')&&file_get_contents('/adapter-fixture/owned')===VNE_ADAPTER_FIXTURE_TOKEN,'Fixture owner differs');
        return array('root'=>'/adapter-fixture/site','inbox'=>'/adapter-fixture/inbox','clone'=>'/adapter-fixture/clone.git');
    }
    vne_adapter_need($environment==='production','Unknown environment');
    $base='/var/www/vhosts/vneconomics.com/';
    return array('root'=>$base.'store.vneconomics.com','inbox'=>$base.'deploy-inbox/production','clone'=>$base.'git/vneconomics-store-production.git');
}
function vne_adapter_ref($clone){
    vne_adapter_path($clone.'/HEAD');$head=trim(file_get_contents($clone.'/HEAD'));
    vne_adapter_need($head==='ref: refs/heads/release-production','Wrong Git HEAD/ref');
    $loose=$clone.'/refs/heads/release-production';
    if(file_exists($loose)||is_link($loose)){vne_adapter_path($loose);$sha=trim(file_get_contents($loose));}
    else{
        $packed=$clone.'/packed-refs';vne_adapter_path($packed);$sha=null;
        foreach(preg_split('/\r?\n/',file_get_contents($packed)) as $line){
            if($line===''||$line[0]==='#'||$line[0]==='^')continue;
            vne_adapter_need(preg_match('/^([a-f0-9]{40}) (refs\/[a-zA-Z0-9._\/-]+)$/D',$line,$match),'Malformed packed ref');
            if($match[2]==='refs/heads/release-production'){vne_adapter_need($sha===null,'Duplicate packed ref');$sha=$match[1];}
        }
    }
    vne_adapter_need(is_string($sha)&&preg_match('/^[a-f0-9]{40}$/D',$sha),'Invalid Git ref SHA');return $sha;
}
function vne_adapter_inspect($a){
    foreach(array('sourceSha'=>40,'controllerSourceSha'=>40,'payloadSha'=>40,'expectedParent'=>40,'manifestSha256'=>64,'receiverSha256'=>64) as $key=>$length)
        vne_adapter_need(is_string($a[$key]??null)&&preg_match('/^[a-f0-9]{'.$length.'}$/D',$a[$key]),'Invalid pin '.$key);
    vne_adapter_need(hash_file('sha256',__FILE__)===$a['receiverSha256'],'Controller external pin differs');
    $paths=vne_adapter_paths($a['environment']??'');foreach($paths as $path)vne_adapter_path($path);
    vne_adapter_need($paths['inbox']!==$paths['root']&&!str_starts_with($paths['inbox'],$paths['root'].'/'),'Public inbox refused');
    $expected=array('manifest.json','plugin.zip','previous-plugin.zip','previous-theme.zip','receiver.php','theme.zip');$actual=array();
    foreach(new DirectoryIterator($paths['inbox']) as $file){if($file->isDot())continue;vne_adapter_need($file->isFile()&&!$file->isLink(),'Non-regular inbox entry');$actual[]=$file->getFilename();}
    sort($actual);vne_adapter_need($actual===$expected,'Six-file allowlist differs');
    $manifestPath=$paths['inbox'].'/manifest.json';vne_adapter_path($manifestPath);
    vne_adapter_need(filesize($manifestPath)<=262144&&hash_file('sha256',$manifestPath)===$a['manifestSha256'],'Manifest external pin differs');
    $m=json_decode(file_get_contents($manifestPath),true,512,JSON_THROW_ON_ERROR);
    $productionRuntime=($m['profile']??'')==='vibelab-v2-r6-css-production-runtime-schema3';
    $keyObservation=($m['profile']??'')==='vibelab-v2-r6-css-production-key-observe-schema3';
    $proofImport=($m['profile']??'')==='vibelab-v2-r6-css-production-proof-import-schema3';$productionInspection=($m['profile']??'')==='vibelab-v2-r6-css-production-inspect-schema3'||$proofImport||$productionRuntime||$keyObservation;
    vne_adapter_need(($m['format']??null)===1&&(($m['profile']??'')==='vibelab-v2-r6-css-adapter-schema3'||$productionInspection)&&($m['sourceSha']??'')===$a['sourceSha'],'Profile/source differs');
    vne_adapter_need(($m['controller']['sourceSha']??'')===$a['controllerSourceSha']&&($m['controller']['path']??'')==='receiver.php'&&($m['controller']['sha256']??'')===$a['receiverSha256'],'Controller identity differs');
    $baseline='fa4c67821008e0fcc4307fedf202bcdf95b85bb6';
    vne_adapter_need($a['expectedParent']===$baseline&&($m['expectedProductionParent']??'')===$baseline&&($m['productionBaselinePayload']??'')===$baseline&&($m['productionBaselineManifestSha256']??'')==='1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2','R6 parent/baseline differs');
    vne_adapter_need(($m['schema']??null)===3&&($m['pluginVersion']??'')==='0.4.4'&&($m['themeVersion']??'')==='2.0.1'&&($m['pluginUnchanged']??null)===true,'Versions differ');
    $capabilities=$productionInspection?array('inspect-inbox','inspect-production-context','inspect-production-storage'):array('inspect-inbox');
    if($proofImport)$capabilities[]='import-production-proof';
    if($productionRuntime)$capabilities[]='css-runtime';
    if($keyObservation)$capabilities[]='observe-key-candidate';
    vne_adapter_need(($m['approval']['deployAuthorized']??null)===false&&($m['controller']['capabilities']??null)===$capabilities,'Inspect-only policy differs');
    if($productionInspection)vne_adapter_need(($m['scope']??null)===($keyObservation?'production-key-candidate-observation':($productionRuntime?'production-css-runtime':($proofImport?'production-proof-import-only':'production-inspection-only')))&&($m['productionPolicy']??null)===vne_adapter_production_policy(),'Production inspection policy differs');
    if($keyObservation)vne_adapter_need(($m['productionKeyObservationPolicy']??null)===array('applicationWrites'=>false,'databaseWrites'=>false,'privateWrites'=>false,'createsKeys'=>false,'activatesKeys'=>false),'Key observation policy differs');
    if($productionRuntime)vne_adapter_need(($m['productionRuntimePolicy']??null)===array('themeOnly'=>true,'databaseRestore'=>false,'createsKeys'=>false,'requiresExistingKey'=>true,'automatic'=>false),'Production runtime policy differs');
    if($proofImport)vne_adapter_need(($m['productionProofImportPolicy']??null)===array('applicationWrites'=>false,'databaseWrites'=>false,'createsKeys'=>false,'requiresExistingJournal'=>true,'requiresExistingKey'=>true),'Production proof import policy differs');
    $listed=array();vne_adapter_need(count($m['files']??array())===5,'Manifest entry count differs');
    foreach($m['files'] as $file){
        $name=$file['path']??'';vne_adapter_need(in_array($name,array_slice($expected,1),true)&&!isset($listed[$name]),'Unsafe/duplicate manifest path');$listed[$name]=true;
        vne_adapter_need(is_int($file['bytes']??null)&&$file['bytes']>=0&&preg_match('/^[a-f0-9]{64}$/D',$file['sha256']??''),'Invalid file descriptor');
        $path=$paths['inbox'].'/'.$name;vne_adapter_path($path);
        vne_adapter_need(filesize($path)===$file['bytes']&&hash_file('sha256',$path)===$file['sha256'],'Inbox hash differs: '.$name);
    }
    vne_adapter_need(hash_file('sha256',$paths['inbox'].'/receiver.php')===$a['receiverSha256'],'Inbox controller differs from external pin');
    vne_adapter_need(hash_file('sha256',$paths['inbox'].'/previous-theme.zip')==='c79b067167dca3629bb2bd61a6480dd5f4c1fef14dc919c32fa5da8fd0796acc','Previous theme is not R6');
    foreach(array('plugin.zip','previous-plugin.zip') as $name)vne_adapter_need(hash_file('sha256',$paths['inbox'].'/'.$name)==='2becd448fc8dcefd0da18e5fdda5ce07a2766a6dd1d63b394ccaff6aa9e6d7cf','Plugin is not R6');
    vne_adapter_need(vne_adapter_ref($paths['clone'])===$a['payloadSha'],'Git ref differs');
    return array('status'=>'VERIFIED_INBOX_BYTES_AND_REF','profile'=>$m['profile'],'sourceSha'=>$a['sourceSha'],'controllerSourceSha'=>$a['controllerSourceSha'],'payloadSha'=>$a['payloadSha'],'manifestSha256'=>$a['manifestSha256'],'files'=>6,'gitObjectParentVerified'=>false,'archiveEntriesVerified'=>false,'runtimeVerified'=>false,'installAuthorized'=>false);
}
function vne_adapter_dispatch($mode,$approval){
    vne_adapter_need($mode==='inspect-inbox','Write/runtime modes not implemented; install blocked');
    return vne_adapter_inspect($approval);
}
function vne_adapter_production_inspection_dispatch($mode,$a){
    vne_adapter_need(in_array($mode,array('inspect-inbox','inspect-production-context','inspect-production-storage'),true),'Production inspection mode only');
    $fields=array('sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256','environment','profile');if($mode==='inspect-production-context')$fields[]='contextPhase';
    $actual=is_array($a)?array_keys($a):array();sort($fields);sort($actual);vne_adapter_need($actual===$fields&&($a['environment']??null)==='production'&&in_array($a['profile']??null,array('vibelab-v2-r6-css-production-inspect-schema3','vibelab-v2-r6-css-production-proof-import-schema3','vibelab-v2-r6-css-production-runtime-schema3','vibelab-v2-r6-css-production-key-observe-schema3'),true),'Production inspection approval differs');
    if($mode==='inspect-production-context')vne_adapter_need(in_array($a['contextPhase'],array('baseline','candidate'),true),'Production inspection context phase differs');
    if($mode!=='inspect-production-context')vne_adapter_need(!function_exists('get_option')&&!isset($GLOBALS['wpdb']),'Use no-WordPress file inspection');
    $inbox=vne_adapter_inspect($a);vne_adapter_need($inbox['profile']===$a['profile'],'Production inspection profile differs');
    if($mode==='inspect-inbox')return $inbox;
    $result=$mode==='inspect-production-context'?vne_adapter_validate_production_context(vne_adapter_observe_production_context(),$a['contextPhase'],$a['sourceSha']):vne_adapter_inspect_production_storage();
    return array('status'=>'PRODUCTION_INSPECTION_COMPLETE','mode'=>$mode,'sourceSha'=>$a['sourceSha'],'controllerSourceSha'=>$a['controllerSourceSha'],'payloadSha'=>$a['payloadSha'],'manifestSha256'=>$a['manifestSha256'],'inspection'=>$result,'productionRuntimeEnabled'=>false,'installAuthorized'=>false);
}

// Runtime integration is deliberately restricted to an owned LOCAL WordPress fixture.
// Production binding is validated separately; these helpers do not enable writers
// or appear in the public dispatch/profile capabilities.
function vne_adapter_production_policy(){
    $base='/var/www/vhosts/vneconomics.com';
    return array('root'=>$base.'/store.vneconomics.com','home'=>'https://store.vneconomics.com','database'=>'vne35060_wp_kmqnf','control'=>$base.'/deploy-control/production','keyPath'=>$base.'/deploy-control/production/health-key.json','uid'=>10044,'gid'=>1004,'stylesheet'=>'vibelab-v2','pluginVersion'=>'0.4.4','schema'=>3,'activePlugins'=>array('ai-provider-for-anthropic/plugin.php','visa-acceptance-solutions/visa-acceptance-solutions.php','vne-library-core/vne-library-core.php','woocommerce/woocommerce.php'));
}
function vne_adapter_observe_production_context(){
    vne_adapter_need(PHP_SAPI==='cli'&&function_exists('get_option')&&function_exists('current_user_can')&&isset($GLOBALS['wpdb']),'Loaded CLI WordPress context required');
    $root=defined('ABSPATH')?rtrim(ABSPATH,'/'):'';vne_adapter_need($root===vne_adapter_production_policy()['root'],'Production root differs');vne_adapter_path($root);
    $wpdb=$GLOBALS['wpdb'];$theme=wp_get_theme();
    return array('root'=>$root,'database'=>defined('DB_NAME')?DB_NAME:null,'mysql'=>($wpdb instanceof wpdb)&&($wpdb->is_mysql??null)===true,'sqlite'=>defined('DB_FILE')||defined('DB_DIR'),'home'=>home_url(),'siteurl'=>get_option('siteurl'),'indexing'=>(string)get_option('blog_public'),'stylesheet'=>get_stylesheet(),'template'=>get_template(),'themeVersion'=>$theme->get('Version'),'marker'=>defined('VIBELAB_V2_RELEASE_MARKER')?VIBELAB_V2_RELEASE_MARKER:null,'pluginVersion'=>defined('VNE_LIBRARY_VERSION')?VNE_LIBRARY_VERSION:null,'schema'=>(int)get_option('vne_library_schema_version'),'activePlugins'=>get_option('active_plugins'),'canUpdateThemes'=>current_user_can('update_themes'));
}
function vne_adapter_validate_production_context($c,$phase,$sourceSha){
    $p=vne_adapter_production_policy();vne_adapter_need(in_array($phase,array('baseline','candidate'),true),'Unknown production context phase');
    vne_adapter_need(is_string($sourceSha)&&preg_match('/^[a-f0-9]{40}$/D',$sourceSha),'Exact source required');
    $fields=array('root','database','mysql','sqlite','home','siteurl','indexing','stylesheet','template','themeVersion','marker','pluginVersion','schema','activePlugins','canUpdateThemes');$keys=is_array($c)?array_keys($c):array();sort($fields);sort($keys);vne_adapter_need($keys===$fields,'Production context fields differ');
    foreach(array('root','database','home','stylesheet','pluginVersion','schema') as $field)vne_adapter_need(($c[$field]??null)===$p[$field],'Production context differs: '.$field);
    vne_adapter_need($c['mysql']===true&&$c['sqlite']===false,'Production MySQL context required');
    vne_adapter_need($c['siteurl']===$p['home']&&$c['indexing']==='1'&&$c['template']===$p['stylesheet'],'Production URL/indexing/template differs');
    vne_adapter_need($c['canUpdateThemes']===true,'Production theme update capability required');
    vne_adapter_need(is_array($c['activePlugins'])&&array_is_list($c['activePlugins']),'Production plugins invalid');$actual=$c['activePlugins'];$expected=$p['activePlugins'];sort($actual);sort($expected);vne_adapter_need($actual===$expected,'Production active plugins differ');
    vne_adapter_need($c['themeVersion']===($phase==='baseline'?'2.0.0':'2.0.1')&&$c['marker']===($phase==='baseline'?'r52-v2-20261028':'r6-css-'.substr($sourceSha,0,12)),'Production theme version/marker differs');
    return array('status'=>'PRODUCTION_CONTEXT_BINDING_VERIFIED','phase'=>$phase,'databaseHostVerified'=>false,'databaseContentsVerified'=>false,'productionRuntimeEnabled'=>false,'installAuthorized'=>false);
}
function vne_adapter_validate_production_storage($s,$key){
    $p=vne_adapter_production_policy();$expected=array('path','canonical','directory','symlink','uid','gid','mode','keyPath','keyCanonical','keyRegular','keySymlink','keyUid','keyMode');
    $fields=is_array($s)?array_keys($s):array();sort($expected);sort($fields);vne_adapter_need($fields===$expected,'Production storage fields differ');
    vne_adapter_need($s['path']===$p['control']&&$s['keyPath']===$p['keyPath']&&$s['canonical']===true&&$s['keyCanonical']===true&&$s['directory']===true&&$s['keyRegular']===true&&$s['symlink']===false&&$s['keySymlink']===false,'Private control path/type differs');
    vne_adapter_need($s['uid']===$p['uid']&&$s['gid']===$p['gid']&&$s['mode']==='0700'&&$s['keyUid']===$p['uid']&&$s['keyMode']==='0600','Private control owner/mode differs');
    $keyFields=is_array($key)?array_keys($key):array();sort($keyFields);vne_adapter_need($keyFields===array('format','key','purpose','target')&&$key['format']===1&&$key['purpose']==='r6-css-health-proof'&&$key['target']===$p['home'],'Production key envelope differs');
    vne_adapter_need(is_string($key['key'])&&preg_match('/^[a-f0-9]{64}$/D',$key['key']),'Production key must encode32 bytes');
    return array('status'=>'PRODUCTION_STORAGE_BINDING_VERIFIED','keyFingerprintSha256'=>hash('sha256',hex2bin($key['key'])),'keyReturned'=>false,'storageProvisioningAuthorized'=>false,'productionRuntimeEnabled'=>false,'installAuthorized'=>false);
}
function vne_adapter_inspect_production_storage(){
    $p=vne_adapter_production_policy();vne_adapter_path($p['control']);vne_adapter_path($p['keyPath']);
    vne_adapter_need(is_dir($p['control'])&&is_file($p['keyPath'])&&filesize($p['keyPath'])<=4096,'Private control/key file invalid');
    $directory=stat($p['control']);$file=stat($p['keyPath']);
    $s=array('path'=>$p['control'],'canonical'=>true,'directory'=>true,'symlink'=>false,'uid'=>$directory['uid'],'gid'=>$directory['gid'],'mode'=>sprintf('%04o',$directory['mode']&0777),'keyPath'=>$p['keyPath'],'keyCanonical'=>true,'keyRegular'=>true,'keySymlink'=>false,'keyUid'=>$file['uid'],'keyMode'=>sprintf('%04o',$file['mode']&0777));
    return vne_adapter_validate_production_storage($s,json_decode(file_get_contents($p['keyPath']),true,16,JSON_THROW_ON_ERROR));
}
function vne_adapter_runtime_scope($a){
    vne_adapter_need(($a['environment']??'')==='local-runtime'&&($a['productionApproved']??null)===false,'Production runtime is disabled');
    $paths=vne_adapter_paths('local-runtime');
    vne_adapter_need(current_user_can('update_themes'),'Theme update capability required');
    foreach(array('owner'=>32,'baselineSha256'=>64) as $key=>$length)vne_adapter_need(is_string($a[$key]??null)&&preg_match('/^[a-f0-9]{'.$length.'}$/D',$a[$key]),'Invalid runtime pin '.$key);
    vne_adapter_need(home_url()==='http://127.0.0.1:19482'&&get_option('siteurl')===home_url()&&(string)get_option('blog_public')==='1','Runtime URL/indexing differs');
    vne_adapter_need(defined('DB_FILE')&&DB_FILE==='.ht.sqlite'&&defined('DB_DIR')&&DB_DIR==='/wordpress/wp-content/database/','Unexpected fixture database');
    vne_adapter_need(get_stylesheet()==='vibelab-v2'&&defined('VNE_LIBRARY_VERSION')&&VNE_LIBRARY_VERSION==='0.4.4'&&(int)get_option('vne_library_schema_version')===3,'Runtime component pair differs');
    return $paths;
}
// Pure verification only: not exposed by the production inspection dispatcher.
function vne_adapter_verify_production_proof($a,$j,$proof,$key,$expectedCssSha256){
    $requestFields=array('environment','protocol','sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256','baselineSha256','owner','keyFingerprintSha256');$actual=is_array($a)?array_keys($a):array();sort($actual);sort($requestFields);vne_adapter_need($actual===$requestFields,'Production proof request fields differ');
    vne_adapter_need($a['environment']==='production'&&$a['protocol']==='r6-css-production-proof-v1'&&$a['expectedParent']==='fa4c67821008e0fcc4307fedf202bcdf95b85bb6','Production proof scope differs');
    foreach(array('sourceSha'=>40,'controllerSourceSha'=>40,'payloadSha'=>40,'expectedParent'=>40,'manifestSha256'=>64,'receiverSha256'=>64,'baselineSha256'=>64,'owner'=>32,'keyFingerprintSha256'=>64) as $field=>$length)vne_adapter_need(is_string($a[$field])&&preg_match('/^[a-f0-9]{'.$length.'}$/D',$a[$field]),'Invalid production proof pin');
    foreach($requestFields as $field)vne_adapter_need(($j[$field]??null)===$a[$field],'Production journal identity differs');
    vne_adapter_need(in_array($j['phase']??null,array('AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'),true)&&is_string($j['challenge']??null)&&preg_match('/^[a-f0-9]{64}$/D',$j['challenge']),'Production proof phase/challenge invalid');
    $now=time();vne_adapter_need(is_int($j['issuedAt']??null)&&is_int($j['expiresAt']??null)&&$j['issuedAt']<=$now&&$j['expiresAt']>=$now&&$j['expiresAt']>$j['issuedAt']&&$j['expiresAt']-$j['issuedAt']<=120,'Production challenge expired/invalid');
    $h=vne_adapter_decode_production_proof($a,$proof,$key);
    vne_adapter_need($h['phase']===$j['phase']&&$h['challenge']===$j['challenge'],'Production proof challenge/phase differs');
    vne_adapter_need(is_int($h['observedAt'])&&$h['observedAt']>=$j['issuedAt']&&$h['observedAt']<=$now,'Production proof stale/future');
    $expectedMarker=$j['phase']==='AWAIT_HEALTH'?'r6-css-'.substr($a['sourceSha'],0,12):'r52-v2-20261028';
    vne_adapter_need(is_string($expectedCssSha256)&&preg_match('/^[a-f0-9]{64}$/D',$expectedCssSha256),'Expected production health pins invalid');
    return array('status'=>'AUTHENTIC_PRODUCTION_HEALTH_OBSERVATION','healthPassed'=>$h['httpStatus']===200&&$h['cssStatus']===200&&$h['marker']===$expectedMarker&&$h['cssSha256']===$expectedCssSha256,'productionWriteAuthorized'=>false);
}
function vne_adapter_decode_production_proof($a,$proof,$key){
    $keyFields=is_array($key)?array_keys($key):array();sort($keyFields);vne_adapter_need($keyFields===array('format','key','purpose','target')&&$key['format']===1&&$key['purpose']==='r6-css-health-proof'&&$key['target']===vne_adapter_production_policy()['home']&&is_string($key['key'])&&preg_match('/^[a-f0-9]{64}$/D',$key['key']),'Production key envelope invalid');
    vne_adapter_need(hash_equals($a['keyFingerprintSha256'],hash('sha256',hex2bin($key['key']))),'Production key fingerprint differs');
    $fields=is_array($proof)?array_keys($proof):array();sort($fields);vne_adapter_need($fields===array('body','signature')&&is_string($proof['body'])&&strlen($proof['body'])<=10924&&is_string($proof['signature'])&&preg_match('/^[a-f0-9]{64}$/D',$proof['signature']),'Production proof envelope invalid');
    $body=base64_decode($proof['body'],true);vne_adapter_need(is_string($body)&&strlen($body)<=8192&&base64_encode($body)===$proof['body']&&hash_equals(hash_hmac('sha256',$body,hex2bin($key['key'])),$proof['signature']),'Production proof signature invalid');
    $h=json_decode($body,true,32,JSON_THROW_ON_ERROR);$identity=array('protocol','owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','receiverSha256','baselineSha256','keyFingerprintSha256');$expected=array_merge($identity,array('phase','challenge','observedAt','url','httpStatus','cssStatus','marker','cssSha256'));$fields=is_array($h)?array_keys($h):array();sort($expected);sort($fields);vne_adapter_need($fields===$expected,'Production observation fields differ');
    foreach($identity as $field)vne_adapter_need($h[$field]===$a[$field],'Production proof identity differs');
    vne_adapter_need(in_array($h['phase'],array('AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'),true)&&is_string($h['challenge'])&&preg_match('/^[a-f0-9]{64}$/D',$h['challenge'])&&is_int($h['observedAt'])&&$h['observedAt']>=0&&$h['observedAt']<=time(),'Production observation clock/phase invalid');
    vne_adapter_need($h['url']===vne_adapter_production_policy()['home'].'/','Production proof target differs');
    foreach(array('httpStatus','cssStatus') as $field)vne_adapter_need(is_int($h[$field])&&$h[$field]>=100&&$h[$field]<=599,'Production HTTP status invalid');
    vne_adapter_need(is_string($h['cssSha256'])&&preg_match('/^[a-f0-9]{64}$/D',$h['cssSha256'])&&($h['marker']===null||(is_string($h['marker'])&&strlen($h['marker'])<=128)),'Production CSS/marker invalid');return $h;
}
// Separate production entry requests proof-only writes; fixture entry keeps its guard.
function vne_adapter_store_production_proof_fixture($a,$proof,$expectedCssSha256){
    return vne_adapter_store_production_proof_transaction($a,$proof,$expectedCssSha256,'fixture');
}
function vne_adapter_import_production_proof($approval,$proof){
    $fields=array('environment','profile','protocol','sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256','owner','baselineSha256','keyFingerprintSha256','proofImportApproved','expectedChallenge','phase');$actual=is_array($approval)?array_keys($approval):array();sort($fields);sort($actual);
    vne_adapter_need($fields===$actual&&$approval['environment']==='production'&&$approval['profile']==='vibelab-v2-r6-css-production-proof-import-schema3'&&$approval['proofImportApproved']===true,'Production proof import approval differs');
    vne_adapter_need(in_array($approval['phase'],array('AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'),true)&&is_string($approval['expectedChallenge'])&&preg_match('/^[a-f0-9]{64}$/D',$approval['expectedChallenge']),'Production proof import phase/challenge invalid');
    $fields=array('environment','protocol','sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256','baselineSha256','owner','keyFingerprintSha256');$a=array_intersect_key($approval,array_flip($fields));
    return vne_adapter_store_production_proof_transaction($a,$proof,null,'production',$approval);
}
function vne_adapter_production_proof_preflight($approval,$a,$j){
    $p=vne_adapter_verified_package($approval);vne_adapter_need($p['manifest']['profile']==='vibelab-v2-r6-css-production-proof-import-schema3','Production proof import profile differs');
    vne_adapter_need($j['phase']===$approval['phase']&&$j['challenge']===$approval['expectedChallenge'],'Production import journal changed phase/challenge');
    $previous=$j['phase']==='ROLLBACK_AWAIT_HEALTH';vne_adapter_validate_production_context(vne_adapter_observe_production_context(),$previous?'baseline':'candidate',$a['sourceSha']);
    vne_adapter_need(defined('WP_CONTENT_DIR')&&WP_CONTENT_DIR===$p['paths']['root'].'/wp-content'&&defined('WP_PLUGIN_DIR')&&WP_PLUGIN_DIR===WP_CONTENT_DIR.'/plugins','Production content/plugin path differs');
    vne_adapter_need(vne_adapter_runtime_state($p,$previous)===$j['baseline'],'Production proof import file/data baseline differs');
    return hash('sha256',$p['maps'][$previous?'previous-theme':'theme']['vibelab-v2/style.css']);
}
function vne_adapter_store_production_proof_transaction($a,$proof,$expectedCssSha256,$backend,$approval=null){
    vne_adapter_need(in_array($backend,array('fixture','production'),true),'Unknown proof storage backend');
    if($backend==='fixture'){vne_adapter_write_scope();$control='/adapter-fixture/control';}
    else{
        vne_adapter_need(is_array($approval)&&($approval['proofImportApproved']??null)===true&&($approval['profile']??null)==='vibelab-v2-r6-css-production-proof-import-schema3','Production proof backend requires approval');
        foreach($a as $field=>$value)vne_adapter_need(($approval[$field]??null)===$value,'Production proof request/approval differs');
        vne_adapter_validate_production_context(vne_adapter_observe_production_context(),$approval['phase']==='ROLLBACK_AWAIT_HEALTH'?'baseline':'candidate',$a['sourceSha']);vne_adapter_inspect($approval);$storage=vne_adapter_inspect_production_storage();vne_adapter_need($storage['keyFingerprintSha256']===($a['keyFingerprintSha256']??null),'Production storage key fingerprint differs');$control=vne_adapter_production_policy()['control'];
    }
    vne_adapter_need(is_string($a['owner']??null)&&preg_match('/^[a-f0-9]{32}$/D',$a['owner']),'Invalid proof store owner');
    vne_adapter_need(($a['receiverSha256']??null)===hash_file('sha256',__FILE__),'Proof store controller pin differs');
    $paths=array($control.'/journal-'.$a['owner'].'.json',$control.'/receiver.lock');[$journal,$lock]=$paths;vne_adapter_path($journal);vne_adapter_path($lock);$handle=fopen($lock,'r+');vne_adapter_need($handle!==false,'Cannot open proof store mutex');$held=false;
    try{
        $held=flock($handle,LOCK_EX|LOCK_NB);vne_adapter_need($held,'Proof store busy; inspect before retry');
        $journalRaw=file_get_contents($journal);$journalHash=hash('sha256',$journalRaw);$j=json_decode($journalRaw,true,32,JSON_THROW_ON_ERROR);rewind($handle);$lockRaw=stream_get_contents($handle);$lockHash=hash('sha256',$lockRaw);$l=json_decode($lockRaw,true,32,JSON_THROW_ON_ERROR);
        $snapshot=$j;[$journal,$lock,$j]=vne_adapter_owned_at($a,$j['phase']??'', $handle,$paths);vne_adapter_need($j===$snapshot,'Proof store journal changed during read; inspect');
        foreach($a as $field=>$value)vne_adapter_need(($j[$field]??null)===$value&&($l[$field]??null)===$value,'Proof store journal/lock identity differs');
        if($backend==='production')$expectedCssSha256=vne_adapter_production_proof_preflight($approval,$a,$j);
        $keyPath=vne_adapter_path($control.'/health-key.json');$keyRaw=file_get_contents($keyPath);$keyHash=hash('sha256',$keyRaw);$key=json_decode($keyRaw,true,32,JSON_THROW_ON_ERROR);$verified=vne_adapter_verify_production_proof($a,$j,$proof,$key,$expectedCssSha256);
        $unchanged=function()use($journal,$journalHash,$handle,$lockHash,$keyPath,$keyHash){rewind($handle);vne_adapter_need(hash_file('sha256',$journal)===$journalHash&&hash('sha256',stream_get_contents($handle))===$lockHash&&hash_file('sha256',$keyPath)===$keyHash,'Proof store journal/lock/key changed; inspect');};
        $path=$control.'/proof-'.$a['owner'].'.json';vne_adapter_need(!is_link($path),'Proof store symlink refused');$bytes=json_encode(array('body'=>$proof['body'],'signature'=>$proof['signature']),JSON_THROW_ON_ERROR);$same=false;
        if(file_exists($path)){
            vne_adapter_path($path);vne_adapter_need(is_file($path)&&filesize($path)<=12000,'Existing production proof invalid');$old=file_get_contents($path);$same=$old===$bytes;
            $prior=vne_adapter_decode_production_proof($a,json_decode($old,true,32,JSON_THROW_ON_ERROR),$key);$next=vne_adapter_decode_production_proof($a,$proof,$key);
            vne_adapter_need($same||$next['observedAt']>$prior['observedAt']||($next['observedAt']===$prior['observedAt']&&$next['challenge']!==$prior['challenge']),'Production proof observation regressed/replayed');
        }
        $unchanged();vne_adapter_owned_at($a,$j['phase'],$handle,$paths);
        if($backend==='production'){vne_adapter_inspect($approval);vne_adapter_need(vne_adapter_inspect_production_storage()['keyFingerprintSha256']===$a['keyFingerprintSha256'],'Production key changed before proof write');}
        if(!$same){
            $temp=$path.'.tmp-'.bin2hex(random_bytes(8));$out=null;
            try{$out=fopen($temp,'x');vne_adapter_need($out!==false,'Exclusive proof store temp create failed');vne_adapter_need(chmod($temp,0600),'Proof store mode failed');vne_adapter_need(fwrite($out,$bytes)===strlen($bytes),'Proof store write failed');vne_adapter_need(fclose($out),'Proof store close failed');$out=null;vne_adapter_need(rename($temp,$path),'Proof store rename failed');}
            finally{if(is_resource($out))fclose($out);if(is_file($temp))unlink($temp);}
        }
        $unchanged();
        return array('status'=>$same?'PRODUCTION_PROOF_ALREADY_STORED':'PRODUCTION_PROOF_STORED','phase'=>$j['phase'],'proofSha256'=>hash('sha256',$bytes),'healthPassed'=>$verified['healthPassed'],'backend'=>$backend==='production'?'production-private-control':'owned-local-fixture','productionWriteAuthorized'=>$backend==='production','applicationWritePerformed'=>false);
    }finally{if($held)flock($handle,LOCK_UN);fclose($handle);}
}
function vne_adapter_data(){
    global $wpdb;$state=array();
    foreach(array('posts','postmeta','terms','term_taxonomy','term_relationships') as $key){
        $rows=$wpdb->get_results('SELECT * FROM '.$wpdb->$key,ARRAY_A);vne_adapter_need(is_array($rows)&&!$wpdb->last_error,'Database read failed');
        usort($rows,fn($a,$b)=>strcmp(wp_json_encode($a),wp_json_encode($b)));$state[$key]=hash('sha256',wp_json_encode($rows));
    }
    $options=array();foreach(array('home','siteurl','blog_public','active_plugins','stylesheet','template','vne_library_schema_version') as $key)$options[$key]=get_option($key);
    $options['vne_options']=$wpdb->get_results("SELECT option_name,option_value FROM {$wpdb->options} WHERE SUBSTR(option_name,1,4)='vne_' ORDER BY option_name",ARRAY_A);
    vne_adapter_need(is_array($options['vne_options'])&&!$wpdb->last_error,'Options read failed');$state['protected_options']=hash('sha256',wp_json_encode($options));return $state;
}
function vne_adapter_files($directory,$map){
    vne_adapter_path($directory);$expected=array();
    foreach($map as $name=>$bytes){$path=$directory.'/'.substr($name,strpos($name,'/')+1);vne_adapter_path($path);vne_adapter_need(is_file($path)&&hash_file('sha256',$path)===hash('sha256',$bytes),'Runtime file conflict: '.$name);$expected[$path]=true;}
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory,FilesystemIterator::SKIP_DOTS)) as $file)vne_adapter_need(!$file->isLink()&&(!$file->isFile()||isset($expected[$file->getPathname()])),'Unexpected runtime file');
}
function vne_adapter_zip($path,$spec,$slug,$count){
    vne_adapter_path($path);vne_adapter_need(filesize($path)===($spec['bytes']??null)&&hash_file('sha256',$path)===($spec['sha256']??''),'Archive spec differs');
    $expected=array();foreach($spec['files']??array() as $f){$name=$f['path']??'';vne_adapter_need(preg_match('~^'.preg_quote($slug,'~').'/[a-z0-9_/-]+\.(php|css)$~D',$name)&&!str_contains($name,'..')&&!isset($expected[$name]),'Unsafe archive path');$expected[$name]=$f;}
    vne_adapter_need(count($expected)===$count,'Archive allowlist differs');$z=new ZipArchive();vne_adapter_need($z->open($path)===true,'Cannot open archive');$out=array();
    try{
        vne_adapter_need($z->numFiles===$count,'Archive count differs');
        for($i=0;$i<$count;$i++){$s=$z->statIndex($i);$name=$s['name'];vne_adapter_need(isset($expected[$name])&&!isset($out[$name])&&$s['size']<=1048576&&$s['comp_method']===0,'Unreviewed archive entry');
            $z->getExternalAttributesIndex($i,$system,$attr);vne_adapter_need($system!==3||!in_array(($attr>>16)&0170000,array(0120000,0040000),true),'Archive symlink/directory refused');
            $bytes=$z->getFromIndex($i);vne_adapter_need(is_string($bytes)&&strlen($bytes)===$expected[$name]['bytes']&&hash('sha256',$bytes)===$expected[$name]['sha256'],'Archive entry hash differs');$out[$name]=$bytes;
        }
    }finally{$z->close();}ksort($out);return $out;
}
function vne_adapter_runtime_package($a){
    vne_adapter_runtime_scope($a);$p=vne_adapter_verified_package($a);vne_adapter_need($p['manifest']['profile']==='vibelab-v2-r6-css-adapter-schema3','Production inspection profile cannot enter fixture writer');return $p;
}
function vne_adapter_verified_package($a){
    vne_adapter_inspect($a);$paths=vne_adapter_paths($a['environment']);$m=json_decode(file_get_contents($paths['inbox'].'/manifest.json'),true,512,JSON_THROW_ON_ERROR);
    vne_adapter_need(($m['installPolicy']['themeOnly']??null)===true&&($m['installPolicy']['reinstallPlugin']??null)===false&&($m['installPolicy']['switchTheme']??null)===false&&($m['installPolicy']['restoreDatabase']??null)===false,'Unreviewed install policy');
    $maps=array();foreach(array('theme'=>array('vibelab-v2',24),'previous-theme'=>array('vibelab-v2',24),'plugin'=>array('vne-library-core',11),'previous-plugin'=>array('vne-library-core',11)) as $key=>$spec){
        vne_adapter_need(($m['components'][$key]['archive']??'')===$key.'.zip','Archive name differs');$maps[$key]=vne_adapter_zip($paths['inbox'].'/'.$key.'.zip',$m['components'][$key],$spec[0],$spec[1]);
    }
    vne_adapter_need(array_keys($maps['theme'])===array_keys($maps['previous-theme']),'Theme entries differ');
    $marker='r6-css-'.substr($a['sourceSha'],0,12);vne_adapter_need(($m['themeMarker']??'')===$marker,'Marker differs');
    foreach($maps['theme'] as $name=>$bytes){
        $old=$maps['previous-theme'][$name];
        if($name==='vibelab-v2/style.css'){
            vne_adapter_need(strlen($bytes)<=262144&&preg_match('//u',$bytes)===1&&!preg_match('/[\\\\<\x00-\x08\x0b\x0c\x0e-\x1f]/',$bytes),'Unsafe CSS bytes');
            vne_adapter_need(!preg_match('/@import\b|url\s*\(|expression\s*\(/i',preg_replace('~/\*.*?\*/~s','',$bytes)),'Unsafe CSS transport');
            vne_adapter_need(preg_match_all('/^Version: 2\.0\.1\r?$/m',$bytes)===1&&preg_replace('/^Version: 2\.0\.1(?=\r?$)/m','Version: 2.0.0',$bytes)!==$old,'Missing CSS change');continue;
        }
        if($name==='vibelab-v2/functions.php')foreach(array("define('VIBELAB_V2_VERSION', '2.0.0');"=>"define('VIBELAB_V2_VERSION', '2.0.1');","define('VIBELAB_V2_RELEASE_MARKER', 'r52-v2-20261028');"=>"define('VIBELAB_V2_RELEASE_MARKER', '".$marker."');") as $from=>$to){vne_adapter_need(substr_count($old,$from)===1,'Identity template differs');$old=str_replace($from,$to,$old);}
        vne_adapter_need($bytes===$old,'PHP/template changed beyond identity');
    }
    return array('paths'=>$paths,'manifest'=>$m,'maps'=>$maps);
}
function vne_adapter_runtime_state($p,$previous){
    vne_adapter_files(WP_CONTENT_DIR.'/themes/vibelab-v2',$p['maps'][$previous?'previous-theme':'theme']);
    vne_adapter_files(WP_PLUGIN_DIR.'/vne-library-core',$p['maps']['plugin']);return vne_adapter_data();
}
function vne_adapter_json($path){vne_adapter_path($path);return json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);}
function vne_adapter_journal_paths($a){return array('/adapter-fixture/control/journal-'.$a['owner'].'.json','/adapter-fixture/control/receiver.lock');}
function vne_adapter_write_scope(){
    vne_adapter_need(defined('ABSPATH')&&ABSPATH==='/wordpress/'&&defined('VNE_ADAPTER_RUNTIME_TOKEN')&&is_file('/wordpress/.adapter-owned')&&file_get_contents('/wordpress/.adapter-owned')===VNE_ADAPTER_RUNTIME_TOKEN,'Runtime fixture write guard');
    vne_adapter_path('/adapter-fixture/control');
}
function vne_adapter_write_journal($path,$j){
    vne_adapter_write_scope();vne_adapter_need(preg_match('~^/adapter-fixture/control/journal-[a-f0-9]{32}\.json$~D',$path)&&!is_link($path),'Journal path/symlink refused');$temp=$path.'.tmp-'.bin2hex(random_bytes(8));
    $handle=null;
    try{$bytes=json_encode($j,JSON_THROW_ON_ERROR);$handle=fopen($temp,'x');vne_adapter_need($handle!==false,'Exclusive journal temp create failed');vne_adapter_need(fwrite($handle,$bytes)===strlen($bytes),'Journal write failed');vne_adapter_need(fclose($handle),'Journal temp close failed');$handle=null;vne_adapter_need(rename($temp,$path),'Journal rename failed');}
    finally{if(is_resource($handle))fclose($handle);if(is_file($temp))unlink($temp);}
}
function vne_adapter_owned($a,$phase,$operationHandle=null){
    return vne_adapter_owned_at($a,$phase,$operationHandle,vne_adapter_journal_paths($a));
}
function vne_adapter_owned_at($a,$phase,$operationHandle,$paths){
    [$path,$lock]=$paths;$j=vne_adapter_json($path);
    if(is_resource($operationHandle)){
        vne_adapter_path($lock);$opened=fstat($operationHandle);$current=stat($lock);vne_adapter_need($opened['ino']===$current['ino']&&$opened['dev']===$current['dev'],'Operation lock replaced');
        rewind($operationHandle);$l=json_decode(stream_get_contents($operationHandle),true,512,JSON_THROW_ON_ERROR);
    }else{$l=vne_adapter_json($lock);}
    foreach(array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','baselineSha256','receiverSha256') as $key)vne_adapter_need(($j[$key]??null)===$a[$key]&&($l[$key]??null)===$a[$key],'Journal/lock ownership differs');
    vne_adapter_need(($j['baseline']??null)===($l['baseline']??null)&&hash('sha256',wp_json_encode($j['baseline']??null))===$a['baselineSha256'],'Journal baseline differs');
    vne_adapter_need(is_int($j['createdAt']??null)&&$j['createdAt']===($l['createdAt']??null),'Journal operation clock differs; historical journal unsupported');
    vne_adapter_need(($j['phase']??null)===$phase,'Unexpected journal phase');return array($path,$lock,$j);
}
function vne_adapter_upgrade_local($zip){
    vne_adapter_write_scope();
    require_once ABSPATH.'wp-admin/includes/class-wp-upgrader.php';require_once ABSPATH.'wp-admin/includes/file.php';WP_Filesystem();
    $u=new WP_Upgrader(new Automatic_Upgrader_Skin());$previous=wp_installing();wp_installing(true);$u->maintenance_mode(true);
    try{$r=$u->run(array('package'=>$zip,'destination'=>WP_CONTENT_DIR.'/themes/vibelab-v2/','clear_destination'=>true,'abort_if_destination_exists'=>false,'clear_working'=>true,'hook_extra'=>array('type'=>'theme','action'=>'update','theme'=>'vibelab-v2')));vne_adapter_need(!is_wp_error($r)&&$r,'Native update failed');}
    finally{wp_installing($previous);}
}
function vne_adapter_maintenance_off(){vne_adapter_write_scope();(new WP_Upgrader(new Automatic_Upgrader_Skin()))->maintenance_mode(false);}
function vne_adapter_challenge(&$j,$phase){
    if(($j['healthLease']['phase']??null)!==$phase)$j['healthLease']=array('version'=>1,'phase'=>$phase,'phaseStartedAt'=>time());
    $j['phase']=$phase;$j['challenge']=bin2hex(random_bytes(32));$j['issuedAt']=time();$j['expiresAt']=$j['issuedAt']+120;
}
function vne_adapter_renew_health($a,$path,$j){
    vne_adapter_need(is_string($a['expectedChallenge']??null)&&preg_match('/^[a-f0-9]{64}$/D',$a['expectedChallenge']),'Expected renewal challenge required');
    $now=time();$lease=$j['healthLease']??array();$history=$j['renewalHistory']??null;
    vne_adapter_need(($lease['version']??null)===1&&($lease['phase']??null)===$j['phase']&&is_int($lease['phaseStartedAt']??null)&&is_int($j['issuedAt']??null)&&is_int($j['expiresAt']??null)&&$lease['phaseStartedAt']>=$j['createdAt']&&$lease['phaseStartedAt']<=$j['issuedAt']&&$j['expiresAt']===$j['issuedAt']+120&&$j['issuedAt']<=$now&&is_array($history)&&array_is_list($history),'Invalid health lease/history');
    $phaseCount=0;foreach($history as $i=>$entry){
        vne_adapter_need(is_array($entry)&&($entry['sequence']??null)===$i+1&&in_array($entry['phase']??null,array('AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'),true)&&is_int($entry['renewedAt']??null)&&$entry['renewedAt']>=$j['createdAt']&&$entry['renewedAt']<=$now&&preg_match('/^[a-f0-9]{64}$/D',$entry['previousChallengeSha256']??'')&&preg_match('/^[a-f0-9]{64}$/D',$entry['newChallengeSha256']??''),'Invalid renewal audit');
        if($entry['phase']===$j['phase'])$phaseCount++;
    }
    if(!hash_equals($j['challenge'],$a['expectedChallenge'])){
        $last=$history?end($history):null;
        vne_adapter_need($last&&$last['phase']===$j['phase']&&$last['previousChallengeSha256']===hash('sha256',$a['expectedChallenge'])&&$last['newChallengeSha256']===hash('sha256',$j['challenge']),'Stale renewal challenge');
        return array_merge($j,array('renewalOutcome'=>'ALREADY_RENEWED'));
    }
    vne_adapter_need($now>=$j['createdAt']&&$now-$j['createdAt']<=900,'Renewal recovery window exceeded');
    vne_adapter_need($phaseCount<2&&count($history)<4,'Phase/operation renewal limit reached');
    vne_adapter_need(!file_exists(ABSPATH.'.maintenance')&&!is_link(ABSPATH.'.maintenance'),'Existing maintenance; inspect');
    $old=$j;vne_adapter_challenge($j,$j['phase']);
    $j['renewalHistory'][]=array('sequence'=>count($history)+1,'phase'=>$j['phase'],'previousChallengeSha256'=>hash('sha256',$old['challenge']),'newChallengeSha256'=>hash('sha256',$j['challenge']),'issuedAt'=>$old['issuedAt'],'expiresAt'=>$old['expiresAt'],'renewedAt'=>$now);
    vne_adapter_write_journal($path,$j);return array_merge($j,array('renewalOutcome'=>'RENEWED'));
}
function vne_adapter_health($a,$j,$p,$previous){
    // The private key/proof are local harness resources, never in the Git payload.
    return vne_adapter_health_proof($a,$j,$p,$previous,vne_adapter_json('/adapter-fixture/control/proof-'.$a['owner'].'.json'));
}
function vne_adapter_decode_health($proof){
    vne_adapter_need(is_array($proof)&&count($proof)===2&&isset($proof['body'],$proof['signature'])&&is_string($proof['body'])&&strlen($proof['body'])<=10924&&is_string($proof['signature'])&&preg_match('/^[a-f0-9]{64}$/D',$proof['signature']),'Health envelope invalid');
    $key=vne_adapter_json('/adapter-fixture/control/health-key.json');
    vne_adapter_need(is_string($key['key']??null)&&preg_match('/^[a-f0-9]{64}$/D',$key['key']),'Health key invalid');
    $body=base64_decode($proof['body']??'',true);vne_adapter_need(is_string($body)&&strlen($body)<=8192&&hash_equals(hash_hmac('sha256',$body,hex2bin($key['key'])),$proof['signature']??''),'Health signature invalid');
    $h=json_decode($body,true,32,JSON_THROW_ON_ERROR);
    $fields=array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','phase','challenge','observedAt','url','httpStatus','cssStatus','marker','cssSha256');$keys=is_array($h)?array_keys($h):array();sort($fields);sort($keys);vne_adapter_need($keys===$fields,'Health observation fields differ');
    return $h;
}
function vne_adapter_health_proof($a,$j,$p,$previous,$proof){
    $h=vne_adapter_decode_health($proof);
    foreach(array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256') as $pin)vne_adapter_need(($h[$pin]??null)===$a[$pin],'Health identity differs');
    vne_adapter_need(($h['challenge']??null)===$j['challenge']&&($h['phase']??null)===$j['phase'],'Health challenge/phase differs');
    vne_adapter_need(is_int($h['observedAt']??null)&&$h['observedAt']>=$j['issuedAt']&&$h['observedAt']<=time()&&time()<=$j['expiresAt'],'Health proof expired/stale');
    vne_adapter_need(($h['url']??null)==='http://127.0.0.1:19482/','Health target differs');
    return ($h['httpStatus']??0)===200&&($h['cssStatus']??0)===200&&($h['marker']??'')===($previous?'r52-v2-20261028':$p['manifest']['themeMarker'])&&($h['cssSha256']??'')===hash('sha256',$p['maps'][$previous?'previous-theme':'theme']['vibelab-v2/style.css']);
}
function vne_adapter_proof_path($a){
    vne_adapter_write_scope();vne_adapter_need(is_string($a['owner']??null)&&preg_match('/^[a-f0-9]{32}$/D',$a['owner']),'Invalid proof owner');
    $path='/adapter-fixture/control/proof-'.$a['owner'].'.json';vne_adapter_need(!is_link($path),'Proof symlink refused');return $path;
}
function vne_adapter_import_health($a,$j,$p,$proof,$operationHandle){
    vne_adapter_write_scope();vne_adapter_need(is_resource($operationHandle),'Proof import requires operation mutex');vne_adapter_owned($a,$j['phase'],$operationHandle);
    $good=vne_adapter_health_proof($a,$j,$p,$j['phase']==='ROLLBACK_AWAIT_HEALTH',$proof);
    $path=vne_adapter_proof_path($a);$bytes=json_encode($proof,JSON_THROW_ON_ERROR);
    $same=false;
    if(file_exists($path)){
        vne_adapter_path($path);vne_adapter_need(is_file($path)&&filesize($path)<=12000,'Existing proof invalid');$old=file_get_contents($path);$same=$old===$bytes;
        $prior=json_decode($old,true,32,JSON_THROW_ON_ERROR);
        $oldHealth=vne_adapter_decode_health($prior);$newHealth=vne_adapter_decode_health($proof);
        foreach(array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256') as $pin)vne_adapter_need(($oldHealth[$pin]??null)===$a[$pin],'Existing proof identity differs');
        // A new challenge may replace a previously valid signed proof after renewal.
        vne_adapter_need(is_int($oldHealth['observedAt']??null)&&$newHealth['observedAt']>=$oldHealth['observedAt'],'Health proof observation regressed');
    }
    if(!$same){
        $temp=$path.'.tmp-'.bin2hex(random_bytes(8));$handle=null;
        try{$handle=fopen($temp,'x');vne_adapter_need($handle!==false,'Exclusive proof temp create failed');vne_adapter_need(fwrite($handle,$bytes)===strlen($bytes),'Proof write failed');vne_adapter_need(fclose($handle),'Proof temp close failed');$handle=null;vne_adapter_need(rename($temp,$path),'Proof rename failed');}
        finally{if(is_resource($handle))fclose($handle);if(is_file($temp))unlink($temp);}
    }
    return array('status'=>$same?'HEALTH_PROOF_ALREADY_IMPORTED':'HEALTH_PROOF_IMPORTED','owner'=>$a['owner'],'phase'=>$j['phase'],'challenge'=>$j['challenge'],'proofSha256'=>hash('sha256',$bytes),'healthPassed'=>$good,'productionWriteAuthorized'=>false);
}
function vne_adapter_runtime_dispatch($mode,$a,$proof=null){
    vne_adapter_runtime_scope($a);
    vne_adapter_need($mode==='import-health'||$proof===null,'Proof input only allowed for import-health');
    if(!in_array($mode,array('import-health','renew-health','finish','confirm-rollback'),true))return vne_adapter_runtime_dispatch_locked($mode,$a);
    // Serialize cooperative journal writers; keep the existing logical owner lock.
    [$path,$lock]=vne_adapter_journal_paths($a);vne_adapter_path($lock);$handle=fopen($lock,'r+');vne_adapter_need($handle!==false,'Cannot open operation lock');
    $held=false;try{$held=flock($handle,LOCK_EX|LOCK_NB);vne_adapter_need($held,'Operation busy; inspect before retry');return vne_adapter_runtime_dispatch_locked($mode,$a,$handle,$proof);}
    finally{if($held)flock($handle,LOCK_UN);fclose($handle);}
}
function vne_adapter_runtime_dispatch_locked($mode,$a,$operationHandle=null,$proof=null){
    vne_adapter_runtime_scope($a);$p=vne_adapter_runtime_package($a);[$path,$lock]=vne_adapter_journal_paths($a);vne_adapter_path('/adapter-fixture/control');
    if($mode==='inspect-state'){
        $exists=file_exists($path)||file_exists($lock);$data=$exists?vne_adapter_data():vne_adapter_runtime_state($p,true);
        return array('data'=>$data,'baselineSha256'=>hash('sha256',wp_json_encode($data)),'phase'=>is_file($path)?vne_adapter_json($path)['phase']:($exists?'UNKNOWN_LOCK':'BASELINE'),'lockPresent'=>file_exists($lock),'runtimeFilesVerified'=>!$exists,'installAuthorized'=>false);
    }
    if($mode==='install'){
        $data=vne_adapter_runtime_state($p,true);vne_adapter_need(hash('sha256',wp_json_encode($data))===$a['baselineSha256'],'Approved runtime baseline differs');
        vne_adapter_need(!file_exists(ABSPATH.'.maintenance')&&!is_link(ABSPATH.'.maintenance'),'Existing maintenance; inspect');
        vne_adapter_need(!file_exists($path)&&!is_link($path)&&!file_exists($lock)&&!is_link($lock),'Existing journal/lock; inspect');
        $needed=268435456;foreach($p['manifest']['components'] as $component){$needed+=$component['bytes'];foreach($component['files'] as $f)$needed+=$f['bytes'];}
        vne_adapter_need(is_int($a['requiredFreeBytes']??null)&&$a['requiredFreeBytes']>=$needed,'Disk reserve not approved');
        $free=disk_free_space(WP_CONTENT_DIR);vne_adapter_need($free!==false&&$free>=$a['requiredFreeBytes'],'Insufficient disk reserve');
        $j=array_intersect_key($a,array_flip(array('owner','sourceSha','controllerSourceSha','payloadSha','manifestSha256','baselineSha256','receiverSha256')));$j['baseline']=$data;$j['phase']='INSTALLING';$j['createdAt']=time();$j['renewalHistory']=array();
        $handle=fopen($lock,'x');vne_adapter_need($handle!==false,'Exclusive lock failed');$bytes=json_encode($j,JSON_THROW_ON_ERROR);vne_adapter_need(fwrite($handle,$bytes)===strlen($bytes),'Lock write failed');fclose($handle);vne_adapter_write_journal($path,$j);
        try{vne_adapter_upgrade_local($p['paths']['inbox'].'/theme.zip');vne_adapter_need(vne_adapter_runtime_state($p,false)===$data,'Install data conflict');vne_adapter_maintenance_off();vne_adapter_challenge($j,'AWAIT_HEALTH');vne_adapter_write_journal($path,$j);return $j;}
        catch(Throwable $e){$j['phase']='STOPPED_INSPECT';vne_adapter_write_journal($path,$j);throw $e;}
    }
    vne_adapter_need(in_array($mode,array('import-health','finish','confirm-rollback','renew-health'),true),'Unknown runtime mode');
    vne_adapter_need($mode!=='import-health'||is_resource($operationHandle),'Proof import requires operation mutex');
    $phase=in_array($mode,array('import-health','renew-health'),true)?(vne_adapter_json($path)['phase']??'') : ($mode==='finish'?'AWAIT_HEALTH':'ROLLBACK_AWAIT_HEALTH');
    vne_adapter_need(in_array($phase,array('AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'),true),'Phase cannot renew/finalize');
    [$path,$lock,$j]=vne_adapter_owned($a,$phase,$operationHandle);
    try{vne_adapter_need(vne_adapter_runtime_state($p,$phase==='ROLLBACK_AWAIT_HEALTH')===$j['baseline'],'Runtime data conflict');}
    catch(Throwable $e){$j['phase']='CONFLICT_INSPECT';vne_adapter_write_journal($path,$j);throw $e;}
    if($mode==='renew-health')return vne_adapter_renew_health($a,$path,$j);
    if($mode==='import-health')return vne_adapter_import_health($a,$j,$p,$proof,$operationHandle);
    $good=vne_adapter_health($a,$j,$p,$mode==='confirm-rollback');
    if($mode==='confirm-rollback'){vne_adapter_need($good,'Rollback HTTP health failed');$j['phase']='ROLLED_BACK';}
    elseif($good)$j['phase']='COMPLETE';
    else{
        $j['phase']='ROLLING_BACK';vne_adapter_write_journal($path,$j);
        try{vne_adapter_upgrade_local($p['paths']['inbox'].'/previous-theme.zip');vne_adapter_need(vne_adapter_runtime_state($p,true)===$j['baseline'],'Rollback data conflict');vne_adapter_maintenance_off();vne_adapter_challenge($j,'ROLLBACK_AWAIT_HEALTH');vne_adapter_write_journal($path,$j);return $j;}
        catch(Throwable $e){$j['phase']='STOPPED_INSPECT';vne_adapter_write_journal($path,$j);throw $e;}
    }
    vne_adapter_write_journal($path,$j);vne_adapter_owned($a,$j['phase'],$operationHandle);vne_adapter_need(unlink($lock),'Own lock cleanup failed');return $j;
}

// Separate production transaction. No fixture/environment override in its entry.
function vne_adapter_validate_css_runtime_request($mode,$a,$proof){
    vne_adapter_need(in_array($mode,array('inspect-state','install','import-health','finish','rollback','confirm-rollback'),true),'Unknown production runtime mode');
    $pins=array('sourceSha'=>40,'controllerSourceSha'=>40,'payloadSha'=>40,'expectedParent'=>40,'manifestSha256'=>64,'receiverSha256'=>64,'owner'=>32,'baselineSha256'=>64,'keyFingerprintSha256'=>64);
    $fields=array_merge(array_keys($pins),array('environment','profile','protocol','productionApproved','requiredFreeBytes'));$actual=is_array($a)?array_keys($a):array();sort($fields);sort($actual);
    vne_adapter_need($fields===$actual&&$a['environment']==='production'&&$a['profile']==='vibelab-v2-r6-css-production-runtime-schema3'&&$a['protocol']==='r6-css-production-proof-v1'&&$a['productionApproved']===true,'Production runtime approval differs');
    foreach($pins as $key=>$length)vne_adapter_need(is_string($a[$key])&&preg_match('/^[a-f0-9]{'.$length.'}$/D',$a[$key]),'Invalid production runtime pin '.$key);
    vne_adapter_need($a['expectedParent']==='fa4c67821008e0fcc4307fedf202bcdf95b85bb6'&&is_int($a['requiredFreeBytes'])&&$a['requiredFreeBytes']>=268435456,'Production parent/disk approval differs');
    vne_adapter_need($mode==='import-health'||$proof===null,'Proof input only allowed for import-health');
    if($mode==='import-health')vne_adapter_need(is_array($proof),'Signed proof required');
}
function vne_adapter_css_runtime_identity($a){
    return array_intersect_key($a,array_flip(array('environment','protocol','sourceSha','controllerSourceSha','payloadSha','expectedParent','manifestSha256','receiverSha256','baselineSha256','owner','keyFingerprintSha256')));
}
// IO is constructed inside the production entry; tests supply an owned local backend.
// This engine alone grants no filesystem access or production certification.
function vne_adapter_css_transaction($mode,$a,$io,$proof=null){
    vne_adapter_validate_css_runtime_request($mode,$a,$proof);
    $release=$io['acquire']();
    try{
        $j=$io['read']('journal');$lock=$io['read']('lock');
        if($j!==null){
            vne_adapter_need(is_array($j)&&isset($j['approval'],$j['baseline'],$j['createdAt'],$j['phase'])&&$j['approval']===$a,'Runtime journal approval differs; inspect');
            foreach(vne_adapter_css_runtime_identity($a) as $key=>$value)vne_adapter_need(($j[$key]??null)===$value,'Runtime journal identity differs');
            vne_adapter_need(is_int($j['createdAt'])&&$j['createdAt']<=time()&&hash('sha256',wp_json_encode($j['baseline']))===$a['baselineSha256'],'Runtime journal baseline/clock differs');
            vne_adapter_need(in_array($j['phase'],array('INSTALLING','AWAIT_HEALTH','ROLLING_BACK','ROLLBACK_AWAIT_HEALTH','STOPPED_INSPECT','COMPLETE','ROLLED_BACK'),true),'Runtime journal phase differs');
            if($lock!==null)vne_adapter_need($lock===array('approval'=>$a,'baseline'=>$j['baseline'],'createdAt'=>$j['createdAt']),'Runtime lock ownership differs; inspect');
            else vne_adapter_need(in_array($j['phase'],array('COMPLETE','ROLLED_BACK'),true),'Missing runtime lock; inspect');
        }else vne_adapter_need($lock===null,'Foreign runtime lock; inspect');
        $phase=$j===null?'baseline':(in_array($j['phase'],array('ROLLBACK_AWAIT_HEALTH','ROLLED_BACK'),true)?'baseline':(in_array($j['phase'],array('INSTALLING','ROLLING_BACK','STOPPED_INSPECT'),true)?'mixed':'candidate'));
        $data=$io['preflight']($phase);
        vne_adapter_need(hash('sha256',wp_json_encode($data))===$a['baselineSha256']&&($j===null||$data===$j['baseline']),'Production runtime data baseline differs; inspect');
        if($mode==='inspect-state')return array('phase'=>$j['phase']??'BASELINE','data'=>$data,'baselineSha256'=>$a['baselineSha256'],'lockPresent'=>$lock!==null,'installAuthorized'=>false);
        if($j!==null&&in_array($j['phase'],array('COMPLETE','ROLLED_BACK'),true)){
            vne_adapter_need(($j['phase']==='COMPLETE'&&in_array($mode,array('install','finish'),true))||($j['phase']==='ROLLED_BACK'&&in_array($mode,array('rollback','confirm-rollback'),true)),'Terminal operation differs');
            if($lock!==null)$io['releaseLogical']($lock);return $j;
        }
        if($mode==='install'){
            if($j!==null){vne_adapter_need($j['phase']==='AWAIT_HEALTH','Interrupted install; inspect or explicit rollback');return $j;}
            $j=array_merge(vne_adapter_css_runtime_identity($a),array('approval'=>$a,'baseline'=>$data,'createdAt'=>time(),'phase'=>'INSTALLING'));
            $lock=array('approval'=>$a,'baseline'=>$data,'createdAt'=>$j['createdAt']);$io['begin']($lock,$j);
            try{vne_adapter_css_validate_before_upgrade($a,$j,$io);$io['upgrade'](false);vne_adapter_need($io['preflight']('candidate')===$data,'Install data conflict');$io['maintenanceOff']();vne_adapter_challenge($j,'AWAIT_HEALTH');$io['save']($j);return $j;}
            catch(Throwable $e){$j['phase']='STOPPED_INSPECT';$io['save']($j);throw $e;}
        }
        vne_adapter_need($j!==null,'Runtime operation not started');
        if($mode==='import-health'){
            vne_adapter_need(in_array($j['phase'],array('AWAIT_HEALTH','ROLLBACK_AWAIT_HEALTH'),true),'Proof phase differs');
            $good=$io['health']($j,$proof);$io['storeProof']($proof,$j);
            return array('status'=>'CSS_RUNTIME_PROOF_STORED','phase'=>$j['phase'],'healthPassed'=>$good,'proofSha256'=>hash('sha256',json_encode($proof,JSON_THROW_ON_ERROR)));
        }
        if($mode==='confirm-rollback'){
            vne_adapter_need($j['phase']==='ROLLBACK_AWAIT_HEALTH','Rollback confirmation phase differs');
            vne_adapter_need($io['health']($j,$io['read']('proof')),'Rollback HTTP health failed');$j['phase']='ROLLED_BACK';
        }elseif($mode==='finish'){
            vne_adapter_need($j['phase']==='AWAIT_HEALTH','Finish phase differs');
            if($io['health']($j,$io['read']('proof')))$j['phase']='COMPLETE';
            else return vne_adapter_css_rollback_transaction($a,$j,$io);
        }else{
            if($mode==='rollback'&&$j['phase']==='ROLLBACK_AWAIT_HEALTH')return $j;
            vne_adapter_need($mode==='rollback'&&in_array($j['phase'],array('AWAIT_HEALTH','INSTALLING','ROLLING_BACK','STOPPED_INSPECT'),true),'Rollback phase differs');
            return vne_adapter_css_rollback_transaction($a,$j,$io);
        }
        $io['save']($j);$io['releaseLogical']($lock);return $j;
    }finally{$release();}
}
function vne_adapter_css_rollback_transaction($a,$j,$io){
    // Preflight has already required unchanged persisted data and reviewed file bytes.
    $j['phase']='ROLLING_BACK';$io['save']($j);
    try{vne_adapter_css_validate_before_upgrade($a,$j,$io);$io['upgrade'](true);vne_adapter_need($io['preflight']('baseline')===$j['baseline'],'Rollback data conflict');$io['maintenanceOff']();vne_adapter_challenge($j,'ROLLBACK_AWAIT_HEALTH');$io['save']($j);return $j;}
    catch(Throwable $e){$j['phase']='STOPPED_INSPECT';$io['save']($j);throw $e;}
}
function vne_adapter_css_validate_before_upgrade($a,$j,$io){
    $current=$io['preflight']('mixed');
    vne_adapter_need($current===$j['baseline']&&hash('sha256',wp_json_encode($current))===$a['baselineSha256'],'Production runtime data changed before native update; inspect');
}
function vne_adapter_production_runtime_file($path){
    vne_adapter_path($path);clearstatcache(true,$path);$s=lstat($path);$p=vne_adapter_production_policy();
    vne_adapter_need(($s['mode']&0170000)===0100000&&$s['nlink']===1&&$s['uid']===$p['uid']&&($s['mode']&07777)===0600&&$s['size']<=262144,'Private runtime file metadata differs');
    $h=fopen($path,'rb');vne_adapter_need(is_resource($h),'Private runtime file open failed');
    try{
        $identity=vne_adapter_key_stat_identity($s);vne_adapter_need(vne_adapter_key_stat_identity(fstat($h))===$identity,'Private runtime file replaced before read');
        $bytes=stream_get_contents($h,262145);clearstatcache(true,$path);vne_adapter_path($path);
        vne_adapter_need(is_string($bytes)&&strlen($bytes)===$s['size']&&vne_adapter_key_stat_identity(fstat($h))===$identity&&vne_adapter_key_stat_identity(lstat($path))===$identity,'Private runtime file changed during read');return $bytes;
    }finally{fclose($h);}
}
// Fixed private filesystem only. No application/database operation or key
// provisioning. Public runtime entry still performs all package/context gates.
function vne_adapter_css_private_store($owner){
    vne_adapter_need(PHP_SAPI==='cli'&&is_string($owner)&&preg_match('/^[a-f0-9]{32}$/D',$owner),'Private runtime owner invalid');
    $policy=vne_adapter_production_policy();vne_adapter_key_private_stat($policy['control'],true);vne_adapter_production_runtime_file($policy['keyPath']);vne_adapter_inspect_production_storage();
    $control=$policy['control'];$paths=array('journal'=>$control.'/journal-'.$owner.'.json','lock'=>$control.'/receiver.lock','proof'=>$control.'/proof-'.$owner.'.json');
    $hashes=array();$mutexGuard=null;
    $kindGuard=function($kind)use($paths){vne_adapter_need(is_string($kind)&&isset($paths[$kind]),'Private runtime kind invalid');};
    $read=function($kind)use($paths,&$hashes,$kindGuard){$kindGuard($kind);$path=$paths[$kind];vne_adapter_need(!is_link($path),'Private runtime symlink refused');if(!file_exists($path)){$hashes[$kind]=null;return null;}$raw=vne_adapter_production_runtime_file($path);$hashes[$kind]=hash('sha256',$raw);return json_decode($raw,true,32,JSON_THROW_ON_ERROR);};
    $check=function($kind)use($paths,&$hashes,&$mutexGuard,$kindGuard){$kindGuard($kind);if($mutexGuard!==null)$mutexGuard();$path=$paths[$kind];vne_adapter_need(!is_link($path),'Private runtime symlink refused');$now=file_exists($path)?hash('sha256',vne_adapter_production_runtime_file($path)):null;vne_adapter_need(array_key_exists($kind,$hashes)&&$now===$hashes[$kind],'Private runtime changed; inspect');};
    $write=function($kind,$value,$exclusive=false)use($paths,&$hashes,&$mutexGuard,$check){
        vne_adapter_need($mutexGuard!==null,'Private runtime mutex required');$check($kind);$path=$paths[$kind];$bytes=json_encode($value,JSON_THROW_ON_ERROR);vne_adapter_need(strlen($bytes)<=262144,'Private runtime JSON too large');vne_adapter_need(!$exclusive||!file_exists($path),'Exclusive private runtime target exists');$temp=$exclusive?$path:$path.'.tmp-'.bin2hex(random_bytes(8));$h=null;
        try{
            // umask is set before create; no interval with world-readable bytes.
            $mask=umask(0077);try{$h=fopen($temp,'x');}finally{umask($mask);}vne_adapter_need($h!==false,'Exclusive private runtime create failed');
            vne_adapter_need(chmod($temp,0600)&&fwrite($h,$bytes)===strlen($bytes)&&fflush($h),'Private runtime write failed');vne_adapter_need(fclose($h),'Private runtime close failed');$h=null;
            if(!$exclusive){$check($kind);vne_adapter_need(rename($temp,$path),'Private runtime atomic rename failed');}$hashes[$kind]=hash('sha256',$bytes);
        }finally{if(is_resource($h))fclose($h);if(!$exclusive&&is_file($temp))unlink($temp);}
    };
    $acquire=function($readOnly=false)use($control,&$mutexGuard){
        vne_adapter_need(is_bool($readOnly)&&$mutexGuard===null,'Private runtime mutex already held or mode invalid');
        $path=$control.'/runtime-mutex.lock';vne_adapter_need(!is_link($path),'Runtime mutex symlink refused');
        if($readOnly&&!file_exists($path))return function(){};
        if(!file_exists($path)){$mask=umask(0077);try{$h=fopen($path,'x+');}finally{umask($mask);}vne_adapter_need($h!==false,'Runtime mutex create failed');}
        else{vne_adapter_production_runtime_file($path);$h=fopen($path,'r+');}
        vne_adapter_need(is_resource($h),'Runtime mutex open failed');$held=false;
        try{
            $s=fstat($h);clearstatcache(true,$path);$now=lstat($path);vne_adapter_need($s['ino']===$now['ino']&&$s['dev']===$now['dev'],'Runtime mutex replaced');vne_adapter_production_runtime_file($path);
            $held=flock($h,LOCK_EX|LOCK_NB);vne_adapter_need($held,'Production runtime busy; inspect');
            $mutexGuard=function()use($h,$path,$s){clearstatcache(true,$path);vne_adapter_production_runtime_file($path);$current=lstat($path);$opened=fstat($h);vne_adapter_need($current['ino']===$s['ino']&&$current['dev']===$s['dev']&&$opened['ino']===$s['ino']&&$opened['dev']===$s['dev'],'Runtime mutex changed; inspect');};
            return function()use($h,&$mutexGuard){$mutexGuard=null;flock($h,LOCK_UN);fclose($h);};
        }catch(Throwable $e){if($held)flock($h,LOCK_UN);fclose($h);throw $e;}
    };
    $releaseLogical=function($lock)use($read,$check,$paths,&$mutexGuard){vne_adapter_need($mutexGuard!==null,'Private runtime mutex required');vne_adapter_need($read('lock')===$lock,'Runtime terminal lock differs');$check('journal');$check('lock');vne_adapter_need(unlink($paths['lock']),'Runtime lock cleanup failed');};
    return array('read'=>$read,'check'=>$check,'write'=>$write,'acquire'=>$acquire,'releaseLogical'=>$releaseLogical);
}
function vne_adapter_production_runtime_dispatch($mode,$a,$proof=null){
    vne_adapter_validate_css_runtime_request($mode,$a,$proof);
    vne_adapter_need(!defined('VNE_ADAPTER_RUNTIME_TOKEN')&&!defined('VNE_ADAPTER_FIXTURE_TOKEN'),'Fixture token refused by production runtime');
    $policy=vne_adapter_production_policy();
    vne_adapter_need(PHP_SAPI==='cli'&&defined('ABSPATH')&&ABSPATH===$policy['root'].'/'&&defined('WP_CONTENT_DIR')&&WP_CONTENT_DIR===$policy['root'].'/wp-content'&&defined('WP_PLUGIN_DIR')&&WP_PLUGIN_DIR===WP_CONTENT_DIR.'/plugins','Production runtime paths differ');
    $p=vne_adapter_verified_package($a);vne_adapter_need($p['manifest']['profile']===$a['profile'],'Production runtime profile differs');
    $keyFile=$policy['keyPath'];$keyBytes=vne_adapter_production_runtime_file($keyFile);$keyHash=hash('sha256',$keyBytes);$key=json_decode($keyBytes,true,16,JSON_THROW_ON_ERROR);unset($keyBytes);
    $storage=vne_adapter_inspect_production_storage();vne_adapter_need($storage['keyFingerprintSha256']===$a['keyFingerprintSha256'],'Production runtime key differs');
    $store=vne_adapter_css_private_store($a['owner']);$read=$store['read'];$check=$store['check'];$write=$store['write'];
    $preflight=function($phase)use($a,$p,$keyFile,$keyHash){
        vne_adapter_inspect($a);vne_adapter_need(hash('sha256',vne_adapter_production_runtime_file($keyFile))===$keyHash,'Production runtime key changed');
        vne_adapter_need(vne_adapter_inspect_production_storage()['keyFingerprintSha256']===$a['keyFingerprintSha256'],'Production runtime storage changed');
        $context=vne_adapter_observe_production_context();
        // PHP constants describe the code loaded at CLI startup, not the files
        // after an in-process upgrade. Verify that loaded identity separately;
        // maps below always verify the current on-disk theme for the phase.
        vne_adapter_need(defined('VIBELAB_V2_VERSION'),'Loaded theme version required');$context['themeVersion']=VIBELAB_V2_VERSION;
        $which=$context['marker']==='r52-v2-20261028'?'baseline':'candidate';vne_adapter_validate_production_context($context,$which,$a['sourceSha']);
        if($phase==='mixed'){vne_adapter_css_mixed_files($p);return vne_adapter_data();}
        return vne_adapter_runtime_state($p,$phase==='baseline');
    };
    // Reject wrong application/data/capability before creating the private mutex;
    // repeat the phase-specific checks under the mutex in the transaction.
    vne_adapter_need(hash('sha256',wp_json_encode($preflight('mixed')))===$a['baselineSha256'],'Production runtime data baseline differs; inspect');
    $maintenanceReceipt=null;
    $io=array(
        // Persistent mutex is never unlinked: fresh opens share the same inode.
        'acquire'=>function()use($store,$mode){return $store['acquire']($mode==='inspect-state');},
        'read'=>$read,'preflight'=>$preflight,
        'begin'=>function($lock,$j)use($write,$read,$a,$p){
            vne_adapter_need(!file_exists(ABSPATH.'.maintenance')&&!is_link(ABSPATH.'.maintenance'),'Existing maintenance; inspect');
            $needed=268435456;foreach($p['manifest']['components'] as $component){$needed+=$component['bytes'];foreach($component['files'] as $f)$needed+=$f['bytes'];}
            vne_adapter_need($a['requiredFreeBytes']>=$needed,'Disk reserve not approved');$free=disk_free_space(WP_CONTENT_DIR);vne_adapter_need($free!==false&&$free>=$a['requiredFreeBytes'],'Insufficient disk reserve (hosting quota needs separate verification)');
            $write('lock',$lock,true);$write('journal',$j,true);
        },
        'save'=>function($j)use($write,$check){$check('lock');$write('journal',$j);},
        'health'=>function($j,$envelope)use($a,$key,$p){vne_adapter_need(is_array($envelope),'Signed runtime proof missing');$css=hash('sha256',$p['maps'][$j['phase']==='ROLLBACK_AWAIT_HEALTH'?'previous-theme':'theme']['vibelab-v2/style.css']);return vne_adapter_verify_production_proof(vne_adapter_css_runtime_identity($a),$j,$envelope,$key,$css)['healthPassed'];},
        'storeProof'=>function($envelope,$j)use($read,$write,$check,$a,$key){$prior=$read('proof');if($prior!==null){$old=vne_adapter_decode_production_proof(vne_adapter_css_runtime_identity($a),$prior,$key);$new=vne_adapter_decode_production_proof(vne_adapter_css_runtime_identity($a),$envelope,$key);vne_adapter_need($prior===$envelope||$new['observedAt']>$old['observedAt']||($new['observedAt']===$old['observedAt']&&$new['challenge']!==$old['challenge']),'Runtime proof regressed/replayed');}$check('journal');$check('lock');if($prior!==$envelope)$write('proof',$envelope);},
        'releaseLogical'=>$store['releaseLogical'],
        'upgrade'=>function($previous)use($p,$preflight,$check,$a,&$maintenanceReceipt){
            $maintenanceReceipt=vne_adapter_css_native_upgrade($p['paths']['inbox'].'/'.($previous?'previous-theme':'theme').'.zip',$a['owner'],function()use($preflight,$check,$a){vne_adapter_need(hash('sha256',wp_json_encode($preflight('mixed')))===$a['baselineSha256'],'Production runtime data changed at native boundary; inspect');$check('journal');$check('lock');});
        },
        'maintenanceOff'=>function()use(&$maintenanceReceipt){vne_adapter_css_end_maintenance($maintenanceReceipt);$maintenanceReceipt=null;}
    );
    return vne_adapter_css_transaction($mode,$a,$io,$proof);
}
function vne_adapter_css_mixed_files($p){
    $directory=WP_CONTENT_DIR.'/themes/vibelab-v2';vne_adapter_path($directory);$expected=array();
    foreach($p['maps']['theme'] as $name=>$bytes){$path=$directory.'/'.substr($name,strpos($name,'/')+1);vne_adapter_path($path);$hash=hash_file('sha256',$path);vne_adapter_need(is_file($path)&&in_array($hash,array(hash('sha256',$bytes),hash('sha256',$p['maps']['previous-theme'][$name])),true),'Interrupted runtime file conflict');$expected[$path]=true;}
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory,FilesystemIterator::SKIP_DOTS)) as $f)vne_adapter_need(!$f->isLink()&&(!$f->isFile()||isset($expected[$f->getPathname()])),'Unexpected interrupted runtime file');
    vne_adapter_files(WP_PLUGIN_DIR.'/vne-library-core',$p['maps']['plugin']);
}
// Shared native primitive, tested using owned local WordPress; callers provide
// their own full scope guard. It never consumes a request-supplied destination.
function vne_adapter_css_native_upgrade($zip,$owner,$guard){
    $guard();vne_adapter_need(is_string($owner)&&preg_match('/^[a-f0-9]{32}$/D',$owner),'Maintenance owner invalid');vne_adapter_path($zip);
    $path=ABSPATH.'.maintenance';vne_adapter_need(!is_link($path),'Maintenance symlink refused');
    if(file_exists($path)){
        vne_adapter_path($path);clearstatcache(true,$path);$s=lstat($path);
        vne_adapter_need(($s['mode']&0170000)===0100000&&$s['nlink']===1&&$s['size']<=512&&$s['uid']===stat(ABSPATH)['uid'],'Foreign maintenance metadata; inspect');$raw=file_get_contents($path);
        vne_adapter_need(preg_match('~^<\?php \$upgrading = [0-9]+; /\* vne-css-runtime:'.preg_quote($owner,'~').' \*/$~D',$raw),'Foreign maintenance; inspect');
    }else{
        $raw='<?php $upgrading = '.time().'; /* vne-css-runtime:'.$owner.' */';$mask=umask(0077);try{$h=fopen($path,'x');}finally{umask($mask);}vne_adapter_need($h!==false,'Exclusive maintenance create failed');
        try{vne_adapter_need(fwrite($h,$raw)===strlen($raw)&&fflush($h),'Maintenance write failed');}finally{fclose($h);}$s=lstat($path);
    }
    $receipt=array('path'=>$path,'sha256'=>hash('sha256',$raw),'ino'=>$s['ino'],'dev'=>$s['dev']);
    require_once ABSPATH.'wp-admin/includes/class-wp-upgrader.php';require_once ABSPATH.'wp-admin/includes/file.php';vne_adapter_need(WP_Filesystem(),'Direct filesystem unavailable');global $wp_filesystem;vne_adapter_need($wp_filesystem instanceof WP_Filesystem_Direct,'Direct filesystem required');
    $u=new WP_Upgrader(new Automatic_Upgrader_Skin());$was=wp_installing();wp_installing(true);
    try{$r=$u->run(array('package'=>$zip,'destination'=>WP_CONTENT_DIR.'/themes/vibelab-v2/','clear_destination'=>true,'abort_if_destination_exists'=>false,'clear_working'=>true,'hook_extra'=>array('type'=>'theme','action'=>'update','theme'=>'vibelab-v2')));vne_adapter_need(!is_wp_error($r)&&$r,'Production native update failed');}finally{wp_installing($was);}
    return $receipt;
}
function vne_adapter_css_end_maintenance($receipt){
    vne_adapter_need(is_array($receipt)&&($receipt['path']??null)===ABSPATH.'.maintenance','Owned maintenance receipt required');$path=vne_adapter_path($receipt['path']);clearstatcache(true,$path);$s=lstat($path);
    vne_adapter_need(($s['mode']&0170000)===0100000&&$s['nlink']===1&&$s['ino']===$receipt['ino']&&$s['dev']===$receipt['dev']&&hash_file('sha256',$path)===$receipt['sha256'],'Maintenance changed; inspect');vne_adapter_need(unlink($path),'Owned maintenance cleanup failed');
}
