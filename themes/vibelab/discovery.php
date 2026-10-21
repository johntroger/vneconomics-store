<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_find_fold($text) {
    $text=html_entity_decode(wp_strip_all_tags($text),ENT_QUOTES,'UTF-8');
    if(class_exists('Normalizer')){$text=Normalizer::normalize($text,Normalizer::FORM_C);}
    $text=strtolower(remove_accents($text));
    $text=preg_replace('/[^\p{L}\p{N}]+/u',' ',$text);
    return trim(preg_replace('/\s+/u',' ',$text));
}
function vibelab_find_normalize($text) {
    $text=vibelab_find_fold($text);
    $text=preg_replace('/\b(?:vibe coding|vibecode)\b/u','vibecoding',$text);
    $text=preg_replace('/\b(?:ky nang|skills|skill)\b/u','skill',$text);
    return trim(preg_replace('/\s+/u',' ',$text));
}
function vibelab_find_pool($scope) {
    static $cache=array();
    if(!isset($cache[$scope])){
        $cache[$scope]=array();
        foreach($scope==='guides'?array('vne_guide','vne_practice'):array('vne_resource') as $type){
            $cache[$scope]=array_merge($cache[$scope],vibelab_items($type,-1));
        }
    }
    return $cache[$scope];
}
function vibelab_find_options($items) {
    $options=array('category'=>array(),'need'=>array(),'tool'=>array());
    foreach(array('category'=>'categories','need'=>'needs','tool'=>'tools') as $key=>$field){
        $taxonomy='vne_'.$key;
        foreach($items as $item){
            $ids=array_map('intval',$item[$field]??array());
            if($key==='category'){
                foreach($ids as $id){$ids=array_merge($ids,get_ancestors($id,$taxonomy,'taxonomy'));}
            }
            foreach(array_unique($ids) as $id){
                $term=get_term($id,$taxonomy);
                if(!$term||is_wp_error($term)){continue;}
                if(!isset($options[$key][$term->slug])){$options[$key][$term->slug]=array('term'=>$term,'count'=>0);}
                $options[$key][$term->slug]['count']++;
            }
        }
        uasort($options[$key],function($a,$b){return strnatcasecmp(vibelab_find_fold($a['term']->name),vibelab_find_fold($b['term']->name))?:($a['term']->term_id<=>$b['term']->term_id);});
    }
    $categories=$options['category'];$ordered=array();
    $walk=function($parent)use(&$walk,&$ordered,$categories){
        foreach($categories as $slug=>$row){if((int)$row['term']->parent===$parent){$ordered[$slug]=$row;$walk((int)$row['term']->term_id);}}
    };
    $walk(0);$options['category']=$ordered;
    return $options;
}
function vibelab_find_input($name,$default,&$errors) {
    if(!isset($_GET[$name])){return $default;}
    if(!is_string($_GET[$name])){$errors[]='Tham số tìm kiếm không đúng định dạng.';return $default;}
    return trim(wp_unslash($_GET[$name]));
}
function vibelab_find_state($query) {
    $errors=array();$type=$query->get('post_type');
    $scope=vibelab_find_input('scope',in_array($type,array('vne_guide','vne_practice'),true)?'guides':'resources',$errors);
    if(!in_array($scope,array('resources','guides'),true)){$errors[]='Phạm vi tìm kiếm không hợp lệ.';$scope='resources';}
    $keyword=vibelab_find_input('s','',$errors);
    if(strlen($keyword)>640||preg_match_all('/./us',$keyword)>160||wp_check_invalid_utf8($keyword)!==$keyword){
        $errors[]='Từ khóa tối đa 160 ký tự.';$keyword='';
    }
    $clean=sanitize_text_field($keyword);
    if($keyword!==''&&$clean===''){$errors[]='Hãy nhập từ khóa bằng văn bản.';}
    $keyword=$clean;
    if($keyword!==''&&vibelab_find_normalize($keyword)===''){$errors[]='Hãy nhập chữ hoặc số để tìm kiếm.';}
    $items=vibelab_ready()?vibelab_find_pool($scope):array();$options=vibelab_find_options($items);
    $term=$query->get_queried_object();$term=$term instanceof WP_Term?$term:null;
    $category=vibelab_find_input('category',$term&&$term->taxonomy==='vne_category'?$term->slug:'',$errors);
    if($category!==''&&!isset($options['category'][$category])){
        // Existing empty categories are legitimate routes, unlike a fabricated filter.
        $existing=get_term_by('slug',$category,'vne_category');
        if(!$existing||is_wp_error($existing)){$errors[]='Danh mục không hợp lệ.';}
        else{$options['category'][$category]=array('term'=>$existing,'count'=>0);}
    }
    $selected=array('need'=>array(),'tool'=>array());
    foreach(array('need','tool') as $key){
        $values=$_GET[$key]??array();
        if(!is_array($values)||count($values)>12){$errors[]='Nhóm bộ lọc không đúng định dạng.';continue;}
        foreach($values as $value){
            if(!is_string($value)||!isset($options[$key][wp_unslash($value)])){$errors[]='Lựa chọn bộ lọc không thuộc phạm vi đang xem.';continue;}
            $selected[$key][]=wp_unslash($value);
        }
        $selected[$key]=array_values(array_unique($selected[$key]));
        if($term&&$term->taxonomy==='vne_'.$key){$selected[$key][]=$term->slug;}
    }
    $sort=vibelab_find_input('sort',$keyword!==''?'relevance':'name',$errors);
    if(!in_array($sort,array('name','name_desc','relevance','observed'),true)){$errors[]='Thứ tự sắp xếp không hợp lệ.';$sort='name';}
    if($keyword===''&&$sort==='relevance'){$sort='name';}
    $page=max(1,(int)$query->get('paged'));
    if(isset($_GET['paged'])&&(!is_string($_GET['paged'])||!ctype_digit($_GET['paged'])||(int)$_GET['paged']<1||(int)$_GET['paged']>100000)){$errors[]='Số trang không hợp lệ.';$page=1;}
    return array('scope'=>$scope,'s'=>$keyword,'category'=>$category,'need'=>array_values(array_unique($selected['need'])),'tool'=>array_values(array_unique($selected['tool'])),'sort'=>$sort,'paged'=>$page,'errors'=>array_unique($errors),'options'=>$options,'term'=>$term,'pool'=>$items,'finder'=>($term&&in_array($term->taxonomy,array('vne_need','vne_tool'),true))||isset($_GET['vne_find'])||$query->is_search()||isset($_GET['category'])||isset($_GET['need'])||isset($_GET['tool'])||isset($_GET['sort'])||isset($_GET['scope']));
}
function vibelab_find_names($item,$field,$taxonomy) {
    $names=array();
    foreach($item[$field]??array() as $id){$term=get_term($id,$taxonomy);if($term&&!is_wp_error($term)){$names[]=$term->name;}}
    return implode(' ',$names);
}
function vibelab_find_score($item,$keyword) {
    if($keyword===''){return 0;}
    $title=vibelab_find_normalize($item['title']);
    $need=vibelab_find_normalize(vibelab_find_names($item,'needs','vne_need'));
    $excerpt=vibelab_find_normalize($item['excerpt']);
    $other=vibelab_find_normalize($item['content'].' '.vibelab_find_names($item,'categories','vne_category').' '.vibelab_find_names($item,'tools','vne_tool').' '.(($item['data']['resource_type']??'')==='skill'?'skill':''));
    $score=$title===$keyword?100:(str_contains($title,$keyword)?40:0);
    foreach(explode(' ',$keyword) as $word){
        if(str_contains($title,$word)){$score+=10;}
        elseif(str_contains($need,$word)){$score+=6;}
        elseif(str_contains($excerpt,$word)){$score+=4;}
        elseif(str_contains($other,$word)){$score+=1;}
        else{return -1;}
    }
    return $score;
}
function vibelab_find_compare($a,$b,$state,$scores) {
        if($state['sort']==='relevance'){$order=$scores[$b['id']]<=>$scores[$a['id']];if($order){return $order;}}
        if($state['sort']==='observed'){
            $dateA=$a['data']['observed_at']??$a['document_source']['observed_at']??'';
            $dateB=$b['data']['observed_at']??$b['document_source']['observed_at']??'';
            $order=strcmp($dateB,$dateA);if($order){return $order;}
        }
        // Existing archive ordering remains natural, with a stable ID tie.
        $order=strnatcasecmp($state['finder']?vibelab_find_fold($a['title']):$a['title'],$state['finder']?vibelab_find_fold($b['title']):$b['title'])?:($a['id']<=>$b['id']);
        return $state['sort']==='name_desc'?-$order:$order;
}
function vibelab_find_query($query) {
    if(is_admin()||!$query->is_main_query()||$query->is_feed()||$query->is_singular()){return;}
    if(!$query->is_search()&&!$query->is_post_type_archive(array('vne_resource','vne_guide','vne_practice'))&&!$query->is_tax(array_keys(vibelab_catalog_taxonomies()))&&!isset($_GET['vne_find'])){return;}
    if($query->is_tax()&&!($query->get_queried_object() instanceof WP_Term)){$query->set('_vibelab_invalid_taxonomy',true);$query->set('post__in',array(0));return;}
    $state=vibelab_find_state($query);$matches=array();$scores=array();$normalized=vibelab_find_normalize($state['s']);
    $category=$state['category']!==''?get_term_by('slug',$state['category'],'vne_category'):null;
    if(!$state['errors']){
        foreach($state['pool'] as $item){
            if($category&&!vibelab_catalog_matches($item,$category)){continue;}
            foreach(array('need'=>'needs','tool'=>'tools') as $key=>$field){
                if(!$state[$key]){continue;}
                $ids=array();foreach($state[$key] as $slug){if(isset($state['options'][$key][$slug])){$ids[]=$state['options'][$key][$slug]['term']->term_id;}}
                if(!array_intersect($ids,$item[$field]??array())){continue 2;}
            }
            $score=vibelab_find_score($item,$normalized);if($score<0){continue;}
            $scores[$item['id']]=$score;$matches[]=$item;
        }
    }
    usort($matches,function($a,$b)use($state,$scores){return vibelab_find_compare($a,$b,$state,$scores);});
    $query->set('_vibelab_find',$state);
    $query->set('_vibelab_catalog',true);$query->set('_vibelab_catalog_term',$state['term']);
    $query->set('post_type',$state['scope']==='guides'?array('vne_guide','vne_practice'):'vne_resource');
    $query->set('post_status','publish');$query->set('posts_per_page',9);$query->set('paged',$state['paged']);
    $query->set('post__in',$matches?array_column($matches,'id'):array(0));$query->set('orderby','post__in');$query->set('ignore_sticky_posts',true);
    $query->set('s','');$query->set('tax_query',array());
    foreach(array_merge(array('taxonomy','term'),array_keys(vibelab_catalog_taxonomies())) as $key){$query->set($key,'');}
    if($state['finder']){$query->is_home=false;$query->is_search=true;}
}
remove_action('pre_get_posts','vibelab_catalog_query',20);
remove_action('pre_get_posts','vibelab_search_query');
add_action('pre_get_posts','vibelab_find_query',20);
function vibelab_find_current(){global $wp_query;return $wp_query?$wp_query->get('_vibelab_find'):null;}
function vibelab_find_url($state,$changes=array()) {
    $args=array_intersect_key(array_merge($state,$changes),array_flip(array('s','scope','category','need','tool','sort','paged')));
    if(!array_key_exists('paged',$changes)){unset($args['paged']);}
    foreach($args as $key=>$value){if($value===''||$value===array()){unset($args[$key]);}}
    return add_query_arg(array_merge(array('vne_find'=>'1'),$args),home_url('/'));
}
function vibelab_find_hidden($state,$except=array()){
    $args=array_intersect_key($state,array_flip(array('s','scope','category','need','tool','sort')));
    echo '<input type="hidden" name="vne_find" value="1">';
    foreach($args as $key=>$values){if(in_array($key,$except,true)){continue;}
        foreach(is_array($values)?$values:array($values) as $value){echo '<input type="hidden" name="'.esc_attr($key.(is_array($values)?'[]':'')).'" value="'.esc_attr($value).'">';}
    }
}
function vibelab_find_pagination($state){
    global $wp_query;
    if(!$state['finder']&&$state['scope']==='resources'){vibelab_catalog_pagination();return;}
    if($wp_query->max_num_pages<2){return;}
    $links=paginate_links(array('base'=>str_replace('999999999','%#%',esc_url(vibelab_find_url($state,array('paged'=>999999999)))),'format'=>'','current'=>$state['paged'],'total'=>(int)$wp_query->max_num_pages,'type'=>'array','prev_text'=>'Trang trước','next_text'=>'Trang tiếp','before_page_number'=>'<span class="sr-only">Trang </span>'));
    echo '<nav class="catalog-pagination" aria-label="Phân trang kết quả"><ul>';foreach($links?:array() as $link){echo '<li>'.wp_kses_post($link).'</li>';}echo '</ul></nav>';
}
add_filter('template_include',function($template){
    return vibelab_find_current()&&!is_404()?__DIR__.'/discovery-template.php':$template;
},30);
add_action('template_redirect',function(){
    $state=vibelab_find_current();global $wp_query;
    if($wp_query->get('_vibelab_invalid_taxonomy')||($state&&$state['paged']>max(1,(int)$wp_query->max_num_pages))){$wp_query->set_404();status_header(404);nocache_headers();}
},6);
add_filter('get_search_query',function($value){$state=vibelab_find_current();return $state?$state['s']:$value;});
add_filter('document_title_parts',function($parts){$state=vibelab_find_current();if($state&&!is_404()){$parts['title']=($state['scope']==='guides'?'Hướng dẫn và sửa lỗi':'Tài nguyên').($state['s']!==''?' — '.$state['s']:'');}return $parts;});
add_action('wp_enqueue_scripts',function(){
    if(vibelab_find_current()){wp_enqueue_script('vibelab-discovery',get_theme_file_uri('/assets/discovery.js'),array(),wp_get_theme()->get('Version'),true);}
});
