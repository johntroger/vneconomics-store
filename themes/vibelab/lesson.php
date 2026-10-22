<?php
if(!defined('ABSPATH')){exit;}
function vibelab_lesson_guard(){
    if(!is_singular(array('vne_guide','vne_practice'))||!vibelab_ready()){return;}
    $item=vne_library_item(get_queried_object_id());
    if(is_wp_error($item)||empty($item['derived']['is_public'])){
        global $wp_query;$wp_query->set_404();status_header(404);nocache_headers();
    }
}
add_action('template_redirect','vibelab_lesson_guard',5);
function vibelab_lesson_template($template){
    return is_singular(array('vne_guide','vne_practice'))&&!is_404()?__DIR__.'/lesson-template.php':$template;
}
add_filter('template_include','vibelab_lesson_template',30);
function vibelab_lesson_assets(){
    if(is_singular(array('vne_guide','vne_practice'))&&!is_404()){
        wp_enqueue_style('vibelab-lesson',get_theme_file_uri('/assets/lesson.css'),array('vibelab'),wp_get_theme()->get('Version'));
        wp_enqueue_script('vibelab-lesson',get_theme_file_uri('/assets/lesson.js'),array(),wp_get_theme()->get('Version'),true);
    }
}
add_action('wp_enqueue_scripts','vibelab_lesson_assets');
function vibelab_lesson_body($item){
    // Only approved public content. Reuse source/code restrictions before enhancement.
    $content=vibelab_detail_content($item);$toc=array();$count=0;
    $content=preg_replace_callback('~<h2\b([^>]*)>(.*?)</h2\s*>~is',function($m)use(&$toc,$item){
        $id='lesson-'.$item['id'].'-section-'.(count($toc)+1);
        if(preg_match('~\\bid="([^"]+)"~',$m[1],$anchor)){$id=$anchor[1];}
        $toc[]=array('id'=>$id,'label'=>wp_strip_all_tags($m[2]));
        return '<h2 id="'.esc_attr($id).'" tabindex="-1">'.$m[2].'</h2>';
    },$content);
    $content=preg_replace_callback('~<ul\b[^>]*class="lesson-checklist"[^>]*>(.*?)</ul\s*>~is',function($m)use(&$count){
        return '<div class="lesson-checklist">'.preg_replace_callback('~<li\b[^>]*>(.*?)</li\s*>~is',function($li)use(&$count){
            $count++;return '<label><input type="checkbox" data-lesson-check="'.(int)$count.'"><span>'.wp_kses($li[1],array('code'=>array(),'strong'=>array(),'em'=>array())).'</span></label>';
        },$m[1]).'</div>';
    },$content);
    $sample='/assets/moc-studio/index.html';
    if(vibelab_image_exists($sample)){
        $content=preg_replace('~<p class="lesson-example">.*?</p>~s','<p class="lesson-example"><a href="'.esc_url(get_theme_file_uri($sample)).'" target="_blank" rel="noopener noreferrer">Xem trang Mộc Studio minh họa<span class="sr-only"> (mở tab mới)</span></a> · Đầu ra mẫu, không bảo đảm mọi lần AI sinh mã giống hệt.</p>',$content);
    }
    $code=0;
    $content=preg_replace_callback('~<pre\b([^>]*)>(.*?)</pre\s*>~is',function($m)use(&$code,$item){
        $code++;$id='lesson-'.$item['id'].'-code-'.$code;
        $label=str_contains($m[1],'language-powershell')?'Sao chép lệnh PowerShell':'Sao chép nội dung';
        return '<div class="lesson-code"><pre id="'.$id.'" tabindex="0">'.$m[2].'</pre><button hidden type="button" class="lesson-copy" data-copy-target="'.$id.'">'.esc_html($label).' '.$code.'</button></div>';
    },$content);
    return array('html'=>$content,'toc'=>$toc,'checks'=>$count);
}
