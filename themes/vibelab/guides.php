<?php
if(!defined('ABSPATH')){exit;}
function vibelab_is_guide_hub(){
    $state=vibelab_find_current();
    return is_post_type_archive('vne_guide')&&$state&&$state['scope']==='guides'&&!$state['finder']&&(int)$state['paged']===1&&!is_404();
}
add_filter('template_include',function($template){return vibelab_is_guide_hub()?__DIR__.'/archive-vne_guide.php':$template;},40);
add_filter('document_title_parts',function($parts){if(vibelab_is_guide_hub()){$parts['title']='Thực hành với Codex, Claude Code và Antigravity';}return $parts;},20);
function vibelab_beginner_url(){
    return post_type_exists('vne_guide')?vibelab_archive('vne_guide'):home_url('/#bat-dau');
}
function vibelab_beginner_guides(){
    $definitions=array(
        'codex'=>array('label'=>'Codex','slug'=>'lam-landing-page-moc-studio-voi-codex-tren-windows','description'=>'Làm trang đầu tiên trong ứng dụng Codex trên Windows.'),
        'claude-code'=>array('label'=>'Claude Code','slug'=>'lam-landing-page-moc-studio-voi-claude-code-tren-windows','description'=>'Làm trang với tab Code của Claude desktop và xem từng thay đổi.'),
        'antigravity'=>array('label'=>'Antigravity IDE','slug'=>'lam-landing-page-moc-studio-voi-antigravity-ide-tren-windows','description'=>'Làm trang trong IDE, đọc phương án và kiểm tra đầu ra của Agent.')
    );
    foreach($definitions as &$definition){
        $definition['item']=null;
        if(!vibelab_ready()){continue;}
        $post=get_page_by_path($definition['slug'],OBJECT,'vne_guide');
        if(!$post){continue;}
        $item=vne_library_item($post->ID);
        if(!is_wp_error($item)&&$item['post_type']==='vne_guide'&&!empty($item['derived']['is_public'])){$definition['item']=$item;}
    }
    unset($definition);return $definitions;
}
function vibelab_beginner_cards(){
    echo '<div class="beginner-grid">';
    foreach(vibelab_beginner_guides() as $key=>$guide){
        echo '<article class="beginner-card" data-beginner-tool="'.esc_attr($key).'"><span class="topic-label">Bài thực hành đầu tiên</span><h3>'.esc_html($guide['label']).'</h3><p>'.esc_html($guide['description']).'</p>';
        if($guide['item']){
            echo '<p class="beginner-state">'.esc_html($guide['item']['derived']['primary_label']).' · Đọc phạm vi kiểm chứng trong bài.</p><a class="button primary" href="'.esc_url(get_permalink($guide['item']['id'])).'">Thực hành với '.esc_html($guide['label']).'</a>';
        }else{echo '<p class="beginner-state">Bài đang được chuẩn bị.</p>';}
        echo '</article>';
    }
    echo '</div>';
}
