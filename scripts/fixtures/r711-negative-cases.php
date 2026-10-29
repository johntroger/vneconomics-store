<?php
$checks=array();
function reject_case($name,$work,$expected){
    try{$work();}catch(RuntimeException $e){vne_css_need(str_contains($e->getMessage(),$expected),'Wrong rejection for '.$name.': '.$e->getMessage());$GLOBALS['checks'][]=$name;return $e->getMessage();}
    throw new Exception('Expected rejection: '.$name);
}
$bad=$a;$bad['environment']='production';$bad['productionApproved']=true;
reject_case('production environment blocked',fn()=>vne_css_package($in,$bad),'Production execution not implemented');
wp_set_current_user(0);reject_case('anonymous update blocked',fn()=>vne_css_package($in,$a),'Theme update capability required');wp_set_current_user(get_user_by('login','admin')->ID);
$bad=$a;$bad['manifestSha256']=str_repeat('f',64);reject_case('manifest pin mismatch blocked',fn()=>vne_css_package($in,$bad),'Manifest pin differs');
$bad=$a;$bad['sourceSha']=str_repeat('a',40);reject_case('source pin mismatch blocked',fn()=>vne_css_package($in,$bad),'Wrong CSS profile/source');
mkdir(ABSPATH.'r711-public');reject_case('document-root inbox blocked',fn()=>vne_css_package(ABSPATH.'r711-public',$a),'Inbox must be outside document root');rmdir(ABSPATH.'r711-public');
file_put_contents($in.'/extra.txt','fixture');reject_case('extra payload member blocked',fn()=>vne_css_package($in,$a),'Inbox allowlist differs');unlink($in.'/extra.txt');
$old=file_get_contents($in.'/plugin.zip');file_put_contents($in.'/plugin.zip',$old.'bad');reject_case('ZIP byte tampering blocked',fn()=>vne_css_package($in,$a),'Package hash differs');file_put_contents($in.'/plugin.zip',$old);
mkdir('/r711-private/inbox-forged');foreach(scandir($in) as $name)if($name!=='.'&&$name!=='..')copy($in.'/'.$name,'/r711-private/inbox-forged/'.$name);
$forged='/r711-private/inbox-forged';$z=new ZipArchive();$z->open($forged.'/theme.zip');$name='vibelab-v2/index.php';
$evil=$z->getFromName($name)."\n/* unexpected template change */\n";$z->addFromString($name,$evil);$z->setCompressionName($name,ZipArchive::CM_STORE);$z->close();
$m=vne_css_json($forged.'/manifest.json');
foreach($m['components']['theme']['files'] as &$f)if($f['path']===$name){$f['bytes']=strlen($evil);$f['sha256']=hash('sha256',$evil);}unset($f);
$m['components']['theme']['bytes']=filesize($forged.'/theme.zip');$m['components']['theme']['sha256']=hash_file('sha256',$forged.'/theme.zip');
foreach($m['files'] as &$f)if($f['path']==='theme.zip'){$f['bytes']=$m['components']['theme']['bytes'];$f['sha256']=$m['components']['theme']['sha256'];}unset($f);
file_put_contents($forged.'/manifest.json',json_encode($m));$bad=$a;$bad['manifestSha256']=hash_file('sha256',$forged.'/manifest.json');
$error=reject_case('forged PHP despite repinned manifest blocked',fn()=>vne_css_package($forged,$bad),'PHP/template changed');
vne_css_need(str_contains($error,'PHP/template changed'),'Wrong forged-PHP rejection: '.$error);
$bad=$a;$bad['owner']=substr(hash('sha256','foreign-lock'),0,32);[$jp,$lp]=vne_css_paths($bad);
$foreign='{"owner":"somebody-else","createdAt":1}';file_put_contents($lp,$foreign);
reject_case('foreign stale lock preserved',fn()=>vne_css_install_fixture($in,$bad),'Existing journal/lock');vne_css_need(file_get_contents($lp)===$foreign,'Foreign lock changed');
// Remove only the foreign-lock simulation created above, inside this owned fixture.
unlink($lp);
$path=WP_CONTENT_DIR.'/themes/vibelab-v2/index.php';$old=file_get_contents($path);file_put_contents($path,$old.'/* owner edit */');
reject_case('baseline code edit preserved',fn()=>vne_css_install_fixture($in,$a),'Runtime file conflict');vne_css_need(file_get_contents($path)===$old.'/* owner edit */','Owner edit lost');file_put_contents($path,$old);
file_put_contents(ABSPATH.'.maintenance','owned fixture maintenance');
reject_case('existing maintenance preserved',fn()=>vne_css_install_fixture($in,$a),'Existing maintenance');vne_css_need(file_get_contents(ABSPATH.'.maintenance')==='owned fixture maintenance','Maintenance changed');unlink(ABSPATH.'.maintenance');
$bad=$a;$bad['owner']=substr(hash('sha256','completed'),0,32);[$jp,$lp]=vne_css_paths($bad);$old='{"phase":"COMPLETE"}';file_put_contents($jp,$old);
reject_case('completed journal not relabeled',fn()=>vne_css_install_fixture($in,$bad),'Existing journal/lock');vne_css_need(file_get_contents($jp)===$old,'Old journal changed');
echo json_encode($checks);
