<?php
if(!defined('ABSPATH')){exit;}
$main_ids=array();foreach(vibelab_beginner_guides() as $guide){if($guide['item']){$main_ids[]=$guide['item']['id'];}}
$support=array_filter(vibelab_items('vne_guide',-1),function($item)use($main_ids){return !in_array($item['id'],$main_ids,true);});
get_header(); ?>
<div class="container guide-hub">
<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="<?php echo esc_url(home_url('/')); ?>">Trang chủ</a></li><li aria-current="page">Hướng dẫn thực hành</li></ol></nav>
<header class="guide-hub-heading"><span class="topic-label">Bắt đầu từ một kết quả cụ thể</span><h1>Chọn công cụ cho bài thực hành đầu tiên</h1><p>Cùng làm landing page Mộc Studio: giao việc, kiểm tra kết quả, sửa một chi tiết rồi quay lại bản mốc. Chỉ cần chọn một công cụ cho lượt đầu.</p><p>Đọc bài miễn phí. Tài khoản và hạn mức công cụ ngoài có điều kiện riêng; phạm vi đã thử được ghi trong từng bài.</p></header>
<section aria-labelledby="main-guides"><h2 id="main-guides">Ba bài thực hành chính</h2><?php vibelab_beginner_cards(); ?></section>
<section class="guide-support" aria-labelledby="support-guides"><h2 id="support-guides">Tài liệu bổ trợ</h2><p>Đọc khi cần chuẩn bị công cụ, xử lý lỗi hoặc hiểu HTML/CSS vừa tạo.</p>
<?php if($support){ ?><ul class="simple-list"><?php foreach($support as $item){ ?><li><h3><a href="<?php echo esc_url(get_permalink($item['id'])); ?>"><?php echo esc_html($item['title']); ?></a></h3><p><?php echo esc_html($item['excerpt']); ?></p></li><?php } ?></ul><?php }else{ ?><p>Tài liệu bổ trợ đang được chuẩn bị.</p><?php } ?>
<a href="<?php echo esc_url(add_query_arg(array('vne_find'=>1,'scope'=>'guides'),home_url('/'))); ?>">Tìm trong hướng dẫn và sửa lỗi</a></section>
</div><?php get_footer(); ?>
