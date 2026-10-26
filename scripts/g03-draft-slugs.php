<?php
// Repair only this release's journaled drafts; the original private package stays immutable.
if(!defined('WP_CLI')||!WP_CLI){throw new RuntimeException('WP-CLI required');}
$g03Directory='/var/www/vhosts/vneconomics.com/g03-production';
$args=array('preflight');require $g03Directory.'/import.php';
$g03Manifest=json_decode(file_get_contents($g03Directory.'/manifest.json'),true,512,JSON_THROW_ON_ERROR);
if(hash_file('sha256',$g03Directory.'/manifest.json')!=='f0de4e7ecbfdc7c60f915fa466952978d3138e13d5c6e17f3ee9efb0018e332a'){throw new RuntimeException('Unexpected release manifest');}
$g03Content=json_decode(file_get_contents($g03Directory.'/content.json'),true,512,JSON_THROW_ON_ERROR);
$g03Journal=get_option('vne_g03_production');
if($g03Journal['status']!=='prepared'||count($g03Journal['map'])<1||count($g03Journal['map'])>2){throw new RuntimeException('Unexpected phase');}
$g03Actor=get_current_user_id();$g03Admins=get_users(array('role'=>'administrator','number'=>1,'fields'=>'ID'));if(!$g03Admins){throw new RuntimeException('No actor');}wp_set_current_user((int)$g03Admins[0]);$g03Repairs=array();
try{
    foreach($g03Content['guides'] as $g03Entry){
        if(!isset($g03Journal['map'][$g03Entry['key']])){continue;}
        $g03Id=(int)$g03Journal['map'][$g03Entry['key']]['id'];
        if(in_array($g03Id,$g03Manifest['baseline']['originalIds'],true)||!vne_library_can_edit($g03Id)){throw new RuntimeException('Not an owned new draft');}
        $g03Item=g03_need(vne_library_item($g03Id,true));
        if($g03Item['status']!=='draft'||$g03Item['post_type']!=='vne_guide'||$g03Item['title']!==$g03Entry['payload']['title']||hash('sha256',$g03Item['content'])!==$g03Entry['contentSha256']){throw new RuntimeException('Draft changed');}
        $g03OldSlug=get_post_field('post_name',$g03Id);$g03Collision=get_page_by_path($g03Entry['slug'],OBJECT,'vne_guide');
        if(($g03OldSlug!==''&&$g03OldSlug!==$g03Entry['slug'])||($g03Collision&&(int)$g03Collision->ID!==$g03Id)){throw new RuntimeException('Slug collision');}
        if($g03OldSlug===''){g03_need(wp_update_post(array('ID'=>$g03Id,'post_name'=>$g03Entry['slug']),true));}
        if(get_post_field('post_name',$g03Id)!==$g03Entry['slug']||hash('sha256',get_post_field('post_content',$g03Id))!==$g03Entry['contentSha256']){throw new RuntimeException('Slug/body readback mismatch');}
        $g03Repairs[]=array('key'=>$g03Entry['key'],'id'=>$g03Id,'before'=>$g03OldSlug,'after'=>$g03Entry['slug'],'bodyUnchanged'=>true,'existingContentTouched'=>false);
    }
    echo 'G03_SLUGS='.wp_json_encode(array('status'=>'DRAFT_SLUGS_READY','repairs'=>$g03Repairs,'original'=>g03_hashes($g03Manifest['baseline']['originalIds'],107)),JSON_UNESCAPED_SLASHES).PHP_EOL;
}finally{wp_set_current_user($g03Actor);}
