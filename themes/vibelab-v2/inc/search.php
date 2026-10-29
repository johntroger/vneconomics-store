<?php
if (!defined('ABSPATH')) { exit; }

function vibelab_v2_search_fold($text) {
    $text=html_entity_decode(wp_strip_all_tags((string)$text), ENT_QUOTES, 'UTF-8');
    if (class_exists('Normalizer')) { $text=Normalizer::normalize($text, Normalizer::FORM_C); }
    $text=strtolower(remove_accents($text));
    $text=preg_replace('/[^\p{L}\p{N}]+/u', ' ', $text);
    return trim(preg_replace('/\s+/u', ' ', $text));
}

function vibelab_v2_search_input($name, $default, &$errors) {
    if (!isset($_GET[$name])) { return $default; }
    if (!is_string($_GET[$name])) { $errors[]='Tham số tìm kiếm không đúng định dạng.'; return $default; }
    return trim(wp_unslash($_GET[$name]));
}

function vibelab_v2_search_status($item) {
    $derived=$item['derived']??array();
    if (!empty($derived['recommendation_eligible'])) { return 'recommended'; }
    if (($derived['validation_status']??'')==='tested') { return 'tested'; }
    return 'review';
}

function vibelab_v2_search_options($items) {
    $options=array('category'=>array(), 'need'=>array(), 'tool'=>array(), 'status'=>array(
        'recommended'=>array('label'=>'Có thể cân nhắc dùng', 'count'=>0),
        'tested'=>array('label'=>'Đã thử, còn lưu ý', 'count'=>0),
        'review'=>array('label'=>'Cần đọc tình trạng', 'count'=>0),
    ));
    foreach (array('category'=>'categories', 'need'=>'needs', 'tool'=>'tools') as $key=>$field) {
        $taxonomy='vne_'.$key;
        foreach ($items as $item) {
            foreach (array_unique(array_map('intval', $item[$field]??array())) as $id) {
                $term=get_term($id, $taxonomy);
                if (!$term || is_wp_error($term)) { continue; }
                if (!isset($options[$key][$term->slug])) { $options[$key][$term->slug]=array('term'=>$term, 'count'=>0); }
                $options[$key][$term->slug]['count']++;
            }
        }
        uasort($options[$key], function($a, $b) {
            return strnatcasecmp(vibelab_v2_search_fold($a['term']->name), vibelab_v2_search_fold($b['term']->name));
        });
    }
    foreach ($items as $item) { $options['status'][vibelab_v2_search_status($item)]['count']++; }
    return $options;
}

function vibelab_v2_search_state($query) {
    $errors=array();
    $keyword=vibelab_v2_search_input('s', '', $errors);
    if (strlen($keyword)>640 || preg_match_all('/./us', $keyword)>160 || wp_check_invalid_utf8($keyword)!==$keyword) {
        $errors[]='Từ khóa tối đa 160 ký tự.';
        $keyword='';
    }
    $keyword=sanitize_text_field($keyword);
    if ($keyword!=='' && vibelab_v2_search_fold($keyword)==='') { $errors[]='Hãy nhập chữ hoặc số để tìm kiếm.'; }

    $items=vibelab_v2_library_items('vne_resource', -1);
    $options=vibelab_v2_search_options($items);
    $category=vibelab_v2_search_input('category', '', $errors);
    if ($category!=='' && !isset($options['category'][$category])) { $errors[]='Danh mục không hợp lệ.'; $category=''; }

    $selected=array('need'=>array(), 'tool'=>array());
    foreach (array('need', 'tool') as $key) {
        $values=$_GET[$key]??array();
        if (!is_array($values) || count($values)>12) { $errors[]='Nhóm bộ lọc không đúng định dạng.'; continue; }
        foreach ($values as $value) {
            $value=is_string($value)?sanitize_title(wp_unslash($value)):'';
            if ($value==='' || !isset($options[$key][$value])) { $errors[]='Lựa chọn bộ lọc không hợp lệ.'; continue; }
            $selected[$key][]=$value;
        }
        $selected[$key]=array_values(array_unique($selected[$key]));
    }

    $status=vibelab_v2_search_input('status', '', $errors);
    if ($status!=='' && !isset($options['status'][$status])) { $errors[]='Tình trạng không hợp lệ.'; $status=''; }
    $sort=vibelab_v2_search_input('sort', $keyword!==''?'relevance':'name', $errors);
    if (!in_array($sort, array('relevance', 'name', 'name_desc', 'observed'), true)) { $errors[]='Thứ tự sắp xếp không hợp lệ.'; $sort='name'; }
    if ($keyword==='' && $sort==='relevance') { $sort='name'; }
    $page=max(1, (int)$query->get('paged'));
    if (isset($_GET['paged']) && (!is_string($_GET['paged']) || !ctype_digit($_GET['paged']) || (int)$_GET['paged']<1 || (int)$_GET['paged']>100000)) {
        $errors[]='Số trang không hợp lệ.';
        $page=1;
    }
    return array('s'=>$keyword, 'category'=>$category, 'need'=>$selected['need'], 'tool'=>$selected['tool'], 'status'=>$status, 'sort'=>$sort, 'paged'=>$page, 'errors'=>array_values(array_unique($errors)), 'options'=>$options, 'pool'=>$items);
}

function vibelab_v2_search_term_names($item, $field, $taxonomy) {
    $names=array();
    foreach ($item[$field]??array() as $id) {
        $term=get_term((int)$id, $taxonomy);
        if ($term && !is_wp_error($term)) { $names[]=$term->name; }
    }
    return implode(' ', $names);
}

function vibelab_v2_search_score($item, $keyword) {
    if ($keyword==='') { return 0; }
    $title=vibelab_v2_search_fold($item['title']);
    $needs=vibelab_v2_search_fold(vibelab_v2_search_term_names($item, 'needs', 'vne_need'));
    $excerpt=vibelab_v2_search_fold($item['excerpt']);
    $other=vibelab_v2_search_fold($item['content'].' '.vibelab_v2_search_term_names($item, 'categories', 'vne_category').' '.vibelab_v2_search_term_names($item, 'tools', 'vne_tool'));
    $score=$title===$keyword?100:(str_contains($title, $keyword)?40:0);
    foreach (explode(' ', $keyword) as $word) {
        if (str_contains($title, $word)) { $score+=10; }
        elseif (str_contains($needs, $word)) { $score+=6; }
        elseif (str_contains($excerpt, $word)) { $score+=4; }
        elseif (str_contains($other, $word)) { $score+=1; }
        else { return -1; }
    }
    return $score;
}

function vibelab_v2_search_query($query) {
    if (is_admin() || !$query->is_main_query() || $query->is_feed() || $query->is_singular() || !isset($_GET['vne_find']) || (isset($_GET['scope']) && $_GET['scope']==='guides')) { return; }
    $state=vibelab_v2_search_state($query);
    $matches=array();$scores=array();$needle=vibelab_v2_search_fold($state['s']);
    if (!$state['errors']) {
        foreach ($state['pool'] as $item) {
            foreach (array('category'=>'categories', 'need'=>'needs', 'tool'=>'tools') as $key=>$field) {
                $slugs=$key==='category'?array_filter(array($state[$key])):$state[$key];
                if (!$slugs) { continue; }
                $ids=array();
                foreach ($slugs as $slug) { if (isset($state['options'][$key][$slug])) { $ids[]=(int)$state['options'][$key][$slug]['term']->term_id; } }
                if (!array_intersect($ids, array_map('intval', $item[$field]??array()))) { continue 2; }
            }
            if ($state['status']!=='' && vibelab_v2_search_status($item)!==$state['status']) { continue; }
            $score=vibelab_v2_search_score($item, $needle);
            if ($score<0) { continue; }
            $scores[$item['id']]=$score;$matches[]=$item;
        }
    }
    usort($matches, function($a, $b) use ($state, $scores) {
        if ($state['sort']==='relevance') { $order=$scores[$b['id']]<=>$scores[$a['id']]; if ($order) { return $order; } }
        if ($state['sort']==='observed') { $order=strcmp($b['data']['observed_at']??'', $a['data']['observed_at']??''); if ($order) { return $order; } }
        $order=strnatcasecmp(vibelab_v2_search_fold($a['title']), vibelab_v2_search_fold($b['title']))?:($a['id']<=>$b['id']);
        return $state['sort']==='name_desc'?-$order:$order;
    });
    $query->set('_vibelab_v2_search', $state);
    $query->set('post_type', 'vne_resource');
    $query->set('post_status', 'publish');
    $query->set('posts_per_page', 9);
    $query->set('paged', $state['paged']);
    $query->set('post__in', $matches?array_column($matches, 'id'):array(0));
    $query->set('orderby', 'post__in');
    $query->set('ignore_sticky_posts', true);
    $query->set('s', '');
    $query->is_home=false;$query->is_search=true;
}
add_action('pre_get_posts', 'vibelab_v2_search_query', 30);

function vibelab_v2_search_current() { global $wp_query; return $wp_query?$wp_query->get('_vibelab_v2_search'):null; }

function vibelab_v2_search_url($state, $changes=array()) {
    $args=array_intersect_key(array_merge($state, $changes), array_flip(array('s', 'category', 'need', 'tool', 'status', 'sort', 'paged')));
    if (!array_key_exists('paged', $changes)) { unset($args['paged']); }
    foreach ($args as $key=>$value) { if ($value==='' || $value===array()) { unset($args[$key]); } }
    return add_query_arg(array_merge(array('vne_find'=>'1', 'scope'=>'resources'), $args), home_url('/'));
}

function vibelab_v2_search_hidden($state, $except=array()) {
    foreach (array('s', 'category', 'need', 'tool', 'status', 'sort') as $key) {
        if (in_array($key, $except, true)) { continue; }
        foreach (is_array($state[$key])?$state[$key]:array($state[$key]) as $value) {
            if ($value!=='') { echo '<input type="hidden" name="'.esc_attr($key.(is_array($state[$key])?'[]':'')).'" value="'.esc_attr($value).'">'; }
        }
    }
    echo '<input type="hidden" name="vne_find" value="1"><input type="hidden" name="scope" value="resources">';
}

function vibelab_v2_search_pagination($state) {
    global $wp_query;
    if ($wp_query->max_num_pages<2) { return; }
    $links=paginate_links(array('base'=>str_replace('999999999', '%#%', vibelab_v2_search_url($state, array('paged'=>999999999))), 'format'=>'', 'current'=>$state['paged'], 'total'=>(int)$wp_query->max_num_pages, 'type'=>'array', 'prev_text'=>'Trang trước', 'next_text'=>'Trang sau'));
    echo '<nav class="v2-pagination" aria-label="Phân trang kết quả">';
    foreach ($links?:array() as $link) { echo wp_kses_post($link); }
    echo '</nav>';
}

add_filter('template_include', function($template) { return vibelab_v2_search_current()&&!is_404()?__DIR__.'/../search.php':$template; }, 40);
add_filter('get_search_query', function($value) { $state=vibelab_v2_search_current(); return $state?$state['s']:$value; });
add_filter('document_title_parts', function($parts) { $state=vibelab_v2_search_current(); if ($state&&!is_404()) { $parts['title']=$state['s']!==''?'Tìm tài nguyên — '.$state['s']:'Tìm tài nguyên'; } return $parts; }, 45);

