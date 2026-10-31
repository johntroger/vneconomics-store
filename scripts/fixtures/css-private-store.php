<?php
// Isolated Linux tmpfs only; never run against a host subscription.
require '/work/release-tools/r6-css-adapter.php';
function test_need($ok,$message){if(!$ok)throw new RuntimeException($message);}
function test_reject($call,$pattern){try{$call();}catch(Throwable $e){test_need(preg_match($pattern,$e->getMessage())===1,'Unexpected rejection: '.$e->getMessage());return;}throw new RuntimeException('Expected rejection');}
$owner=str_repeat('1',32);$policy=vne_adapter_production_policy();$control=$policy['control'];
test_need(PHP_SAPI==='cli'&&PHP_MAJOR_VERSION===8&&PHP_MINOR_VERSION===3,'Native PHP8.3 required');
test_need(is_file('/.dockerenv')&&preg_match('/^[a-f0-9]{64}$/D',getenv('RUNTIME_NATIVE_FIXTURE')?:''),'Docker fixture required');
if(($argv[1]??'')==='--contend'){
    test_need(posix_geteuid()===10044&&posix_getegid()===1004,'Child identity differs');
    $store=vne_adapter_css_private_store($owner);test_reject(fn()=>$store['acquire'](),'/busy/');echo json_encode(array('status'=>'BUSY_CONFIRMED'));exit(0);
}
test_need(count($argv)===1&&posix_geteuid()===0,'Root setup only in fresh container');
$base='/var/www/vhosts/vneconomics.com';test_need(realpath($base)===$base&&scandir($base)===array('.','..'),'Fresh empty mount required');
test_need(str_contains(file_get_contents('/proc/self/mountinfo'),' '.$base.' ')&&str_contains(file_get_contents('/proc/self/mountinfo'),' - tmpfs '),'Temporary mount required');
mkdir(dirname($control),0700);mkdir($control,0700);
foreach(array(dirname($control),$control) as $path){chown($path,10044);chgrp($path,1004);chmod($path,0700);}
$key=array('format'=>1,'key'=>bin2hex(random_bytes(32)),'purpose'=>'r6-css-health-proof','target'=>$policy['home']);
file_put_contents($policy['keyPath'],json_encode($key,JSON_THROW_ON_ERROR));chown($policy['keyPath'],10044);chgrp($policy['keyPath'],1004);chmod($policy['keyPath'],0600);
$foreign=$control.'/foreign-root-owned.json';file_put_contents($foreign,'{"foreign":true}');chmod($foreign,0600);$foreignInode=fileinode($foreign);
test_need(posix_setgid(1004)&&posix_setuid(10044),'Cannot drop fixture identity');test_need(posix_geteuid()===10044&&posix_getegid()===1004,'Fixture identity differs');
$checks=array();$store=vne_adapter_css_private_store($owner);$checks[]='fixed production private path and key metadata accept actual UID10044 GID1004 and private modes';
test_need(rename($policy['keyPath'],$control.'/kept-synthetic-key'),'Cannot stash fixture key');
test_reject(fn()=>vne_adapter_css_private_store($owner),'/Canonical path|metadata|private/i');$metadata=vne_adapter_private_store($owner);$readOnly=$metadata['acquire'](true);$readOnly();test_need(!file_exists($control.'/runtime-mutex.lock'),'Metadata inspector created mutex');test_need(rename($control.'/kept-synthetic-key',$policy['keyPath']),'Cannot restore fixture key');$checks[]='application wrapper retains missing-active-key guard while key-agnostic metadata core can inspect without creating a key or mutex';
$noop=$store['acquire'](true);test_need(!file_exists($control.'/runtime-mutex.lock'),'Readonly created mutex');$noop();
test_reject(fn()=>$store['write']('journal',array('phase'=>'READY'),true),'/mutex required/');$checks[]='readonly missing-mutex inspection creates no file and cannot write';
$release=$store['acquire']();$mutex=$control.'/runtime-mutex.lock';$mutexInode=fileinode($mutex);$store['read']('journal');$store['read']('lock');
$j=array('phase'=>'READY','sequence'=>0);$lock=array('owner'=>$owner);$store['write']('lock',$lock,true);$store['write']('journal',$j,true);
$journal=$control.'/journal-'.$owner.'.json';$proof=$control.'/proof-'.$owner.'.json';
foreach(array($mutex,$journal,$control.'/receiver.lock') as $path){clearstatcache(true,$path);test_need((fileperms($path)&07777)===0600&&fileowner($path)===10044&&lstat($path)['nlink']===1,'Private file mode/owner/links differ');}
$checks[]='exclusive mutex logical lock and journal are created with native0600 permissions';
$pipes=array();$process=proc_open(array(PHP_BINARY,__FILE__,'--contend'),array(0=>array('pipe','r'),1=>array('pipe','w'),2=>array('pipe','w')),$pipes);test_need(is_resource($process),'Cannot spawn contention probe');fclose($pipes[0]);$out=stream_get_contents($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);test_need(proc_close($process)===0&&$err===''&&json_decode($out,true)['status']==='BUSY_CONFIRMED','Native cross-process lock failed');$checks[]='second native PHP process cannot take held flock';
$oldHandle=fopen($journal,'rb');$oldBytes=stream_get_contents($oldHandle);$oldInode=fstat($oldHandle)['ino'];$next=array('phase'=>'READY','sequence'=>1);$store['write']('journal',$next);rewind($oldHandle);clearstatcache(true,$journal);
test_need(stream_get_contents($oldHandle)===$oldBytes&&fileinode($journal)!==$oldInode&&$store['read']('journal')===$next,'Atomic replacement differs');fclose($oldHandle);$checks[]='atomic rename preserves complete old descriptor while new readers see complete new JSON';
$external=array('phase'=>'OWNER_EDIT');file_put_contents($journal,json_encode($external));test_reject(fn()=>$store['write']('journal',$next),'/changed/');test_need(json_decode(file_get_contents($journal),true)===$external,'CAS overwrote edit');$store['read']('journal');$checks[]='compare-before-write preserves concurrent journal edit';
test_reject(fn()=>$store['write']('journal',$next,true),'/target exists/');test_reject(fn()=>$store['write']('journal',array('large'=>str_repeat('x',262144))),'/too large/');test_need(json_decode(file_get_contents($journal),true)===$external,'Bounds changed journal');$checks[]='exclusive-existing and oversized writes fail without truncation';
test_reject(fn()=>$store['read']('../health-key.json'),'/kind invalid/');test_reject(fn()=>vne_adapter_css_private_store('../bad'),'/owner invalid/');$checks[]='closed owner and kind reject escaping paths';
$store['read']('proof');$store['write']('proof',array('signed'=>'synthetic'));$saved=$control.'/proof-owned-copy';rename($proof,$saved);symlink($policy['keyPath'],$proof);test_reject(fn()=>$store['read']('proof'),'/symlink/');unlink($proof);rename($saved,$proof);$checks[]='proof symlink is rejected before following the target';
$link=$control.'/journal-hardlink';link($journal,$link);test_reject(fn()=>$store['read']('journal'),'/metadata/');unlink($link);chmod($journal,0644);test_reject(fn()=>$store['read']('journal'),'/metadata/');chmod($journal,04600);test_reject(fn()=>$store['read']('journal'),'/metadata/');chmod($journal,0600);$store['read']('journal');$checks[]='native hardlinks public permissions and setuid bits are refused';
$savedJournal=$control.'/journal-owned-copy';rename($journal,$savedJournal);rename($foreign,$journal);test_reject(fn()=>$store['read']('journal'),'/metadata/');rename($journal,$foreign);rename($savedJournal,$journal);clearstatcache(true,$foreign);test_need(fileowner($foreign)===0&&fileinode($foreign)===$foreignInode,'Foreign file changed');$store['read']('journal');$checks[]='wrong owner is refused and preserved without permission repair';
test_reject(fn()=>$store['releaseLogical'](array('owner'=>'foreign')),'/lock differs/');test_need(file_exists($control.'/receiver.lock'),'Foreign cleanup removed lock');$checks[]='terminal cleanup preserves mismatched logical lock';
$store['releaseLogical']($lock);test_need(!file_exists($control.'/receiver.lock')&&file_exists($journal)&&file_exists($proof),'Terminal cleanup scope differs');$release();clearstatcache(true,$mutex);test_need(fileinode($mutex)===$mutexInode,'Mutex inode was removed');$checks[]='own logical lock cleanup retains journal proof and persistent mutex inode';
$fresh=vne_adapter_css_private_store($owner);$unlock=$fresh['acquire']();$fresh['read']('proof');$held=$control.'/mutex-owned-copy';rename($mutex,$held);file_put_contents($mutex,'');chmod($mutex,0600);test_reject(fn()=>$fresh['write']('proof',array('new'=>true)),'/mutex changed/');$unlock();unlink($mutex);rename($held,$mutex);$checks[]='replaced mutex inode is detected before private mutation';
$fresh=vne_adapter_css_private_store($owner);$unlock=$fresh['acquire']();$fresh['read']('journal');$fresh['write']('journal',array('phase'=>'AFTER_HANDOVER'));$unlock();$checks[]='new store instance acquires released persistent mutex and writes normally';
chmod($control,0750);test_reject(fn()=>vne_adapter_css_private_store($owner),'/owner\/mode/');chmod($control,02700);test_reject(fn()=>vne_adapter_css_private_store($owner),'/owner\/mode/');chmod($control,0700);$checks[]='private directory group access and setgid bits are refused';
$keyLink=$control.'/key-hardlink';link($policy['keyPath'],$keyLink);test_reject(fn()=>vne_adapter_css_private_store($owner),'/metadata/');unlink($keyLink);vne_adapter_css_private_store($owner);$checks[]='hardlinked private key cannot initialize a store';
test_need(count(glob($control.'/*.tmp-*'))===0,'Temporary private JSON remains');
echo json_encode(array('status'=>'PASS_CSS_PRIVATE_STORE_NATIVE','checks'=>count($checks),'cases'=>$checks,'php'=>PHP_VERSION,'uid'=>posix_geteuid(),'gid'=>posix_getegid(),'platform'=>PHP_OS_FAMILY,'filesystemOnly'=>true,'productionDispatcherExercised'=>false,'mariaDbTested'=>false,'hostingContacted'=>false,'keyReturned'=>false,'sourceSha256'=>hash_file('sha256','/work/release-tools/r6-css-adapter.php')),JSON_THROW_ON_ERROR).PHP_EOL;
