<?php
if(!defined('ABSPATH')){exit;}
function vibelab_catalog_taxonomies(){return array('vne_category'=>'categories','vne_need'=>'needs','vne_tool'=>'tools');}
function vibelab_catalog_all(){
    static $items=null;
    if($items!==null){return $items;}
    $items=vibelab_items('vne_resource',-1);
    usort($items,function($a,$b){$order=strnatcasecmp($a['title'],$b['title']);return $order?:($a['id']<=>$b['id']);});
    return $items;
}
function vibelab_catalog_members($term){
    if(!$term instanceof WP_Term){return array();}
    $ids=array((int)$term->term_id);
    if(is_taxonomy_hierarchical($term->taxonomy)){
        $children=get_term_children($term->term_id,$term->taxonomy);
        if(!is_wp_error($children)){$ids=array_merge($ids,array_map('intval',$children));}
    }
    return $ids;
}
function vibelab_catalog_matches($item,$term){
    if(!$term){return true;}
    $field=vibelab_catalog_taxonomies()[$term->taxonomy]??null;
    return $field&&(bool)array_intersect(array_map('intval',$item[$field]??array()),vibelab_catalog_members($term));
}
function vibelab_catalog_query($query){
    if(is_admin()||!$query->is_main_query()||$query->is_feed()||!vibelab_ready()){return;}
    if(!$query->is_post_type_archive('vne_resource')&&!$query->is_tax(array_keys(vibelab_catalog_taxonomies()))){return;}
    $object=$query->get_queried_object();
    $term=$object instanceof WP_Term?$object:null;
    if($query->is_tax()&&!$term){return;}
    $items=array_values(array_filter(vibelab_catalog_all(),function($item)use($term){return vibelab_catalog_matches($item,$term);}));
    $query->set('_vibelab_catalog',true);
    $query->set('_vibelab_catalog_term',$term);
    $query->set('post_type','vne_resource');$query->set('post_status','publish');
    $query->set('posts_per_page',9);$query->set('ignore_sticky_posts',true);
    $query->set('post__in',$items?array_column($items,'id'):array(0));
    $query->set('orderby','post__in');$query->set('order','ASC');
    // Keep the original queried object but replace raw membership with approved IDs.
    $query->set('tax_query',array());
    foreach(array_merge(array('taxonomy','term'),array_keys(vibelab_catalog_taxonomies())) as $key){$query->set($key,'');}
}
add_action('pre_get_posts','vibelab_catalog_query',20);
function vibelab_catalog_categories($active=null){
    $terms=get_terms(array('taxonomy'=>'vne_category','hide_empty'=>false,'orderby'=>'name'));
    if(is_wp_error($terms)){return array();}
    $keep=array();$active_ids=array();
    if($active instanceof WP_Term&&$active->taxonomy==='vne_category'){$active_ids=array_merge(array($active->term_id),get_ancestors($active->term_id,'vne_category','taxonomy'));}
    foreach($terms as $term){
        $count=0;foreach(vibelab_catalog_all() as $item){if(vibelab_catalog_matches($item,$term)){$count++;}}
        if($count||in_array($term->term_id,$active_ids)){
            $keep[]=array('term'=>$term,'count'=>$count,'depth'=>count(get_ancestors($term->term_id,'vne_category','taxonomy')));
        }
    }
    // Depth-first order keeps each parent with its children.
    $ordered=array();$walk=function($parent)use(&$walk,&$ordered,$keep){foreach($keep as $row){if((int)$row['term']->parent===$parent){$ordered[]=$row;$walk((int)$row['term']->term_id);}}};
    $walk(0);return $ordered;
}
function vibelab_catalog_breadcrumb($term){
    $crumbs=array(array(home_url('/'),'Trang chủ'),array(vibelab_archive(),'Tài nguyên'));
    if($term instanceof WP_Term){
        if(is_taxonomy_hierarchical($term->taxonomy)){
            foreach(array_reverse(get_ancestors($term->term_id,$term->taxonomy,'taxonomy')) as $id){
                $parent=get_term($id,$term->taxonomy);$url=get_term_link($parent);
                if($parent&&!is_wp_error($parent)&&!is_wp_error($url)){$crumbs[]=array($url,$parent->name);}
            }
        }
        $crumbs[]=array(null,$term->name);
    }else{$crumbs[count($crumbs)-1][0]=null;}
    echo '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>';
    foreach($crumbs as $index=>$crumb){echo '<li>';if($crumb[0]){echo '<a href="'.esc_url($crumb[0]).'">'.esc_html($crumb[1]).'</a>';}else{echo '<span aria-current="page">'.esc_html($crumb[1]).'</span>';}echo '</li>';}
    echo '</ol></nav>';
}
function vibelab_catalog_pagination(){
    global $wp_query;
    if($wp_query->max_num_pages<2){return;}
    $big=999999999;
    $links=paginate_links(array('base'=>str_replace($big,'%#%',esc_url(get_pagenum_link($big))),'format'=>'','current'=>max(1,(int)get_query_var('paged')),'total'=>(int)$wp_query->max_num_pages,'type'=>'array','prev_text'=>'Trang trước','next_text'=>'Trang tiếp','mid_size'=>1,'end_size'=>1,'before_page_number'=>'<span class="sr-only">Trang </span>'));
    if(!$links){return;}
    echo '<nav class="catalog-pagination" aria-label="Phân trang tài nguyên"><ul>';
    foreach($links as $link){echo '<li>'.wp_kses_post($link).'</li>';}
    echo '</ul></nav>';
}
