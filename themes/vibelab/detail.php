<?php
if(!defined('ABSPATH')){exit;}
function vibelab_detail_guard(){
    if(!is_singular('vne_resource')||!vibelab_ready()){return;}
    $item=vne_library_item(get_queried_object_id());
    if(is_wp_error($item)||empty($item['derived']['is_public'])){
        global $wp_query;$wp_query->set_404();status_header(404);nocache_headers();
    }
}
add_action('template_redirect','vibelab_detail_guard',5);
function vibelab_detail_labels(){return array('requirements'=>'Yêu cầu sử dụng','permissions'=>'Quyền truy cập','compatibility'=>'Tương thích công cụ','license'=>'Giấy phép','cost'=>'Chi phí liên quan');}
function vibelab_detail_source_allowed($item){return $item['derived']['cta']['kind']==='source'&&!empty($item['derived']['cta']['href']);}
function vibelab_detail_reference($url,$item,$label=null){
    if(!$url){echo '<span>Chưa có nguồn đối chiếu</span>';return;}
    $label=$label?:$url;
    if(vibelab_detail_source_allowed($item)&&wp_parse_url($url,PHP_URL_SCHEME)==='https'){
        echo '<a href="'.esc_url($url).'" target="_blank" rel="noopener noreferrer">'.esc_html($label).'<span aria-hidden="true"> ↗</span><span class="sr-only"> (mở tab mới)</span></a>';
    }else{echo '<span class="reference-text">'.esc_html($label).'</span>';}
}
function vibelab_detail_date($value,$empty='Chưa có ngày đối chiếu'){
    if($value){echo '<time datetime="'.esc_attr($value).'">'.esc_html($value).'</time>';}else{echo esc_html($empty);}
}
function vibelab_detail_content($item){
    $allowed=wp_kses_allowed_html('post');
    foreach(array('img','iframe','video','audio','source','form','input','button','h1') as $tag){unset($allowed[$tag]);}
    foreach($allowed as &$attributes){unset($attributes['style']);}unset($attributes);
    if(!vibelab_detail_source_allowed($item)){unset($allowed['a']);}
    $content=wp_kses($item['content'],$allowed);
    if(empty($item['derived']['commands_allowed'])){
        $content=preg_replace('~<pre\\b[^>]*>.*?(?:</pre\\s*>|$)~is','<p class="code-restricted">Khối mã chưa được hiển thị vì điều kiện sử dụng hoặc kiểm chứng chưa đủ rõ.</p>',$content);
    }
    $html=new WP_HTML_Tag_Processor($content);$anchors=array();$number=0;
    while($html->next_tag()){
        $id=$html->get_attribute('id');
        if(is_string($id)&&$id!==''){
            $prefixed='detail-content-'.$item['id'].'-'.(++$number);
            if(!isset($anchors[$id])){$anchors[$id]=$prefixed;}
            $html->set_attribute('id',$prefixed);
        }
    }
    $html=new WP_HTML_Tag_Processor($html->get_updated_html());
    $sections=array('gioi-thieu','dieu-kien','tinh-trang','bat-dau','nguon');
    while($html->next_tag()){
        if($html->get_tag()==='PRE'){$html->set_attribute('tabindex','0');}
        if($html->get_tag()!=='A'){continue;}
        $href=$html->get_attribute('href');
        if(is_string($href)&&in_array(wp_parse_url($href,PHP_URL_SCHEME),array('http','https'),true)&&wp_parse_url($href,PHP_URL_HOST)!==wp_parse_url(home_url('/'),PHP_URL_HOST)){
            $html->set_attribute('target','_blank');$html->set_attribute('rel','noopener noreferrer');$html->set_attribute('title','Liên kết ngoài, mở tab mới');
        }
        if(is_string($href)&&str_starts_with($href,'#')){
            $key=rawurldecode(substr($href,1));
            if(isset($anchors[$key])){$html->set_attribute('href','#'.$anchors[$key]);}
            elseif(!in_array($key,$sections,true)){$html->remove_attribute('href');$html->set_attribute('class','content-reference-unlinked');}
        }
    }
    return $html->get_updated_html();
}

function vibelab_detail_related($item,$type='vne_resource'){
    $all=$type==='vne_resource'?vibelab_catalog_all():vibelab_items($type,-1);$related=array();
    foreach($all as $other){
        if($other['id']===$item['id']||!array_intersect($item['categories'],$other['categories'])){continue;}
        if(($other['derived']['recommendation_status']??'')==='suspended'||($other['derived']['source_access_status']??'')==='unavailable'){continue;}
        $related[]=$other;if(count($related)===3){break;}
    }
    return $related;
}
function vibelab_detail_breadcrumb($item){
    $crumbs=array(array(home_url('/'),'Trang chủ'),array(vibelab_archive(),'Tài nguyên'));
    $term=get_term($item['primary_category'],'vne_category');
    if($term&&!is_wp_error($term)){
        foreach(array_merge(array_reverse(get_ancestors($term->term_id,'vne_category','taxonomy')),array($term->term_id)) as $id){
            $category=get_term($id,'vne_category');if(!$category||is_wp_error($category)){continue;}$url=get_term_link($category);
            if(!is_wp_error($url)){$crumbs[]=array($url,$category->name);}
        }
    }
    echo '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>';
    foreach($crumbs as $crumb){echo '<li><a href="'.esc_url($crumb[0]).'">'.esc_html($crumb[1]).'</a></li>';}
    echo '<li><span aria-current="page">'.esc_html($item['title']).'</span></li></ol></nav>';
}
function vibelab_detail_claim($key,$claim,$item){
    $status=$claim['verification_status']??'unknown'; ?>
    <article class="detail-claim" id="dieu-kien-<?php echo esc_attr($key); ?>">
    <h3><?php echo esc_html(vibelab_detail_labels()[$key]); ?></h3>
    <?php if($status==='upstream_claimed'){ ?><p class="claim-value"><?php echo esc_html($claim['value']); ?></p><p class="claim-status">Theo nguồn; chưa xác nhận độc lập.</p><?php }elseif($status==='conflicted'){ ?><p class="claim-value">Thông tin mâu thuẫn; cần đối chiếu.</p><?php }else{ ?><p class="claim-value">Chưa xác định</p><?php } ?>
    <?php if(!empty($claim['note'])){ ?><p><?php echo esc_html($claim['note']); ?></p><?php } ?>
    <?php if($status!=='unknown'){ ?><p class="claim-source"><?php vibelab_detail_reference($claim['source_url']??null,$item); ?> · <?php vibelab_detail_date($claim['observed_at']??null); ?></p><?php } ?>
    <?php if($status==='conflicted'){ ?><ul><?php foreach($claim['conflict_sources'] as $url){ ?><li><?php vibelab_detail_reference($url,$item); ?></li><?php } ?></ul><?php } ?>
    </article><?php
}
