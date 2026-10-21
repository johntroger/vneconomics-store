<?php
if(!defined('ABSPATH')){exit;}
global $wp_query;$state=vibelab_find_current();
if(!$state){require __DIR__.'/index.php';return;}
$guideScope=$state['scope']==='guides';$label=$guideScope?'hướng dẫn':'tài nguyên';
$total=(int)$wp_query->found_posts;$first=$total?($state['paged']-1)*9+1:0;$last=min($state['paged']*9,$total);
$term=$state['category']?get_term_by('slug',$state['category'],'vne_category'):$state['term'];
$title=$state['s']!==''?'Kết quả cho “'.$state['s'].'”':($term instanceof WP_Term?$term->name:($guideScope?'Hướng dẫn và sửa lỗi':'Tài nguyên để khám phá'));
$filterCount=($state['category']!==''?1:0)+count($state['need'])+count($state['tool']);
$clear=vibelab_find_url($state,array('s'=>'','category'=>'','need'=>array(),'tool'=>array(),'sort'=>'name'));
get_header(); ?>
<div class="container catalog-page discovery-page" data-discovery-scope="<?php echo esc_attr($state['scope']); ?>">
<?php if(!$guideScope&&$state['s']===''){vibelab_catalog_breadcrumb($term);}else{ ?>
<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="<?php echo esc_url(home_url('/')); ?>">Trang chủ</a></li><li><span aria-current="page"><?php echo $guideScope?'Hướng dẫn và sửa lỗi':'Tìm tài nguyên'; ?></span></li></ol></nav><?php } ?>
<header class="catalog-heading"><h1><?php echo esc_html($title); ?></h1>
<?php if($term instanceof WP_Term&&trim($term->description)&&$state['s']===''){ ?><div class="catalog-description"><?php echo wpautop(esc_html($term->description)); ?></div><?php }else{ ?><p><?php echo $guideScope?'Tìm bài giải thích, hướng dẫn và bộ thực hành đã biên tập.':'Tìm repo, skill hoặc mẫu dự án theo việc bạn muốn làm.'; ?></p><?php } ?></header>
<nav class="discovery-scopes" aria-label="Phạm vi tìm kiếm">
<?php foreach(array('resources'=>'Tài nguyên','guides'=>'Hướng dẫn và sửa lỗi') as $scope=>$name){ ?>
<a href="<?php echo esc_url(vibelab_find_url($state,array('scope'=>$scope,'category'=>'','need'=>array(),'tool'=>array()))); ?>" <?php if($state['scope']===$scope){echo 'aria-current="page"';} ?>><?php echo esc_html($name); ?></a><?php } ?></nav>
<div class="catalog-layout"><aside class="catalog-sidebar">
<nav aria-label="Chọn danh mục"><h2><?php echo $guideScope?'Danh mục hướng dẫn':'Danh mục tài nguyên'; ?></h2><ul class="catalog-categories">
<li><a href="<?php echo esc_url(!$state['finder']&&!$guideScope?vibelab_archive():vibelab_find_url($state,array('category'=>''))); ?>" <?php if(!$state['category']){echo 'aria-current="page"';} ?>><span><?php echo $guideScope?'Tất cả hướng dẫn':'Tất cả tài nguyên'; ?></span><span class="category-count"><?php echo count($state['pool']); ?></span></a></li>
<?php
$rows=$state['options']['category'];
if(!$state['finder']&&!$guideScope){$rows=array();foreach(vibelab_catalog_categories($state['term']) as $row){$rows[$row['term']->slug]=$row;}}
foreach($rows as $row){$category=$row['term'];$url=!$state['finder']&&!$guideScope?get_term_link($category):vibelab_find_url($state,array('category'=>$category->slug));if(is_wp_error($url)){continue;} ?>
<li class="<?php echo $category->parent?'category-child':''; ?>"><a href="<?php echo esc_url($url); ?>" <?php if($state['category']===$category->slug){echo 'aria-current="page"';} ?>><span><?php echo esc_html($category->name); ?></span><span class="category-count"><?php echo (int)$row['count']; ?></span></a></li><?php } ?></ul></nav>
<p class="catalog-note">Số lượng danh mục tính trước bộ lọc.<br>Website miễn phí; công cụ gốc có điều kiện riêng.</p>
<div class="filter-host">
<form id="discovery-form" class="discovery-filter-form" method="get" action="<?php echo esc_url(home_url('/')); ?>">
<h2 class="filter-inline-title">Bộ lọc</h2>
<?php vibelab_find_hidden($state,array('category','need','tool')); ?>
<label for="filter-category">Danh mục</label><select id="filter-category" name="category"><option value="">Tất cả danh mục</option>
<?php foreach($state['options']['category'] as $slug=>$row){ ?><option value="<?php echo esc_attr($slug); ?>" <?php selected($state['category'],$slug); ?>><?php echo esc_html($row['term']->name); ?></option><?php } ?></select>
<?php foreach(array('need'=>'Bạn muốn làm gì?','tool'=>'Nhãn công cụ') as $key=>$name){ ?>
<fieldset><legend><?php echo esc_html($name); ?></legend>
<?php if(!$state['options'][$key]){ ?><p>Chưa có nhãn trong phạm vi này.</p><?php } ?>
<?php foreach($state['options'][$key] as $slug=>$row){ ?><label><input type="checkbox" name="<?php echo esc_attr($key); ?>[]" value="<?php echo esc_attr($slug); ?>" <?php checked(in_array($slug,$state[$key],true)); ?>><span><?php echo esc_html($row['term']->name); ?></span></label><?php } ?></fieldset><?php } ?>
<p class="filter-help">Cùng nhóm: một trong các lựa chọn. Khác nhóm: cần đồng thời thỏa mãn. Nhãn công cụ không thay xác nhận tương thích ở trang chi tiết.</p>
<div class="filter-actions"><button class="button primary" type="submit">Áp dụng</button><button type="button" class="draft-clear" data-clear-draft hidden>Xóa tất cả</button><a href="<?php echo esc_url($clear); ?>">Xóa tất cả trên danh sách</a></div>
</form></div></aside>
<section class="catalog-results" aria-label="<?php echo $guideScope?'Danh sách hướng dẫn':'Danh sách tài nguyên'; ?>"><h2 class="sr-only"><?php echo $guideScope?'Danh sách hướng dẫn':'Danh sách tài nguyên'; ?></h2>
<div class="catalog-toolbar"><p class="result-count" role="status"><?php echo (!vibelab_ready()||$state['errors'])?'Chưa có kết quả để hiển thị':($total?'Hiển thị '.$first.'–'.$last.' trong '.$total.' '.$label:'0 '.$label); ?></p>
<button class="button filter-open" type="button" hidden>Bộ lọc<?php echo $filterCount?' ('.$filterCount.')':''; ?></button>
<form class="discovery-sort" method="get" action="<?php echo esc_url(home_url('/')); ?>"><?php vibelab_find_hidden($state,array('sort')); ?><label for="discovery-sort">Sắp xếp</label><select id="discovery-sort" name="sort">
<?php $sorts=array('name'=>'Tên A–Z','name_desc'=>'Tên Z–A','observed'=>'Đối chiếu nguồn gần nhất');if($state['s']!==''){$sorts=array('relevance'=>'Phù hợp từ khóa')+$sorts;}foreach($sorts as $value=>$name){ ?><option value="<?php echo esc_attr($value); ?>" <?php selected($state['sort'],$value); ?>><?php echo esc_html($name); ?></option><?php } ?></select><button type="submit">Sắp xếp</button></form></div>
<div class="discovery-chips" aria-label="Tiêu chí đang áp dụng">
<?php if($state['s']!==''){ ?><a href="<?php echo esc_url(vibelab_find_url($state,array('s'=>''))); ?>" aria-label="<?php echo esc_attr('Bỏ từ khóa '.$state['s']); ?>">Từ khóa: <?php echo esc_html($state['s']); ?> <span aria-hidden="true">×</span></a><?php } ?>
<?php if($state['category']!==''&&$term instanceof WP_Term){ ?><a href="<?php echo esc_url(vibelab_find_url($state,array('category'=>''))); ?>" aria-label="<?php echo esc_attr('Bỏ danh mục '.$term->name); ?>"><?php echo esc_html($term->name); ?> <span aria-hidden="true">×</span></a><?php } ?>
<?php foreach(array('need','tool') as $key){foreach($state[$key] as $slug){$row=$state['options'][$key][$slug]??null;if(!$row){continue;}$remaining=array_values(array_diff($state[$key],array($slug))); ?><a href="<?php echo esc_url(vibelab_find_url($state,array($key=>$remaining))); ?>" aria-label="<?php echo esc_attr('Bỏ '.$row['term']->name); ?>"><?php echo esc_html($row['term']->name); ?> <span aria-hidden="true">×</span></a><?php }} ?>
<?php if($state['s']!==''||$filterCount){ ?><a class="clear-applied" href="<?php echo esc_url($clear); ?>">Xóa tất cả</a><?php } ?></div>
<?php if(!vibelab_ready()){ ?><div class="empty-state" role="alert"><h2>Thư viện chưa sẵn sàng</h2><p>Chưa thể tìm kiếm lúc này. Hãy thử lại sau hoặc về trang chủ.</p><a href="<?php echo esc_url(home_url('/')); ?>">Về trang chủ</a></div>
<?php }elseif($state['errors']){ ?><div class="empty-state" role="alert"><h2>Chưa áp dụng được tiêu chí</h2><ul><?php foreach($state['errors'] as $error){ ?><li><?php echo esc_html($error); ?></li><?php } ?></ul><a class="button" href="<?php echo esc_url($clear); ?>">Đặt lại tìm kiếm</a></div>
<?php }elseif($total){ ?><div class="<?php echo $guideScope?'guide-results':'resource-grid'; ?>">
<?php while(have_posts()){the_post();$item=vne_library_item(get_the_ID());if(is_wp_error($item)||empty($item['derived']['is_public'])){continue;}if(!$guideScope){vibelab_card($item);}else{ ?>
<article class="guide-result" data-guide-id="<?php echo (int)$item['id']; ?>"><p class="guide-kind"><?php echo $item['post_type']==='vne_practice'?'Bộ thực hành':'Hướng dẫn'; ?></p><h3><a href="<?php echo esc_url(get_permalink($item['id'])); ?>"><?php echo esc_html($item['title']); ?></a></h3><p><?php echo esc_html($item['excerpt']); ?></p><span class="badge"><?php echo esc_html($item['derived']['primary_label']); ?></span><a href="<?php echo esc_url(get_permalink($item['id'])); ?>">Đọc hướng dẫn</a></article>
<?php }} ?></div><?php vibelab_find_pagination($state); ?>
<?php }else{ ?><div class="empty-state"><h2><?php echo $state['s']!==''||$filterCount?'Chưa có kết quả phù hợp':($guideScope?'Chưa có hướng dẫn trong mục này':'Chưa có tài nguyên trong mục này'); ?></h2><p>Thử từ khóa ngắn hơn, bỏ bớt bộ lọc hoặc chuyển phạm vi tìm kiếm.</p><a class="button" href="<?php echo esc_url($state['s']!==''||$filterCount?$clear:($term?vibelab_archive():home_url('/'))); ?>"><?php echo $state['s']!==''||$filterCount?'Xóa tất cả':($term?'Xem tất cả tài nguyên':'Về trang chủ'); ?></a>
<a href="<?php echo esc_url(vibelab_find_url($state,array('scope'=>$guideScope?'resources':'guides','category'=>'','need'=>array(),'tool'=>array()))); ?>"><?php echo $guideScope?'Tìm tài nguyên với từ khóa này':'Tìm hướng dẫn và sửa lỗi với từ khóa này'; ?></a></div><?php } ?>
</section></div></div><?php get_footer(); ?>
