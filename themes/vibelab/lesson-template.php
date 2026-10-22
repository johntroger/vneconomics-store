<?php
if(!defined('ABSPATH')){exit;}
$item=vibelab_ready()?vne_library_item(get_queried_object_id()):null;
if(!$item||is_wp_error($item)||empty($item['derived']['is_public'])){
    global $wp_query;$wp_query->set_404();status_header(404);nocache_headers();require get_index_template();return;
}
$body=vibelab_lesson_body($item);$state=$item['derived'];$related=vibelab_detail_related($item,'vne_guide');
get_header(); ?>
<div class="container lesson-page" data-lesson="<?php echo (int)$item['id']; ?>" data-lesson-revision="<?php echo esc_attr($state['current_revision']); ?>">
<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="<?php echo esc_url(home_url('/')); ?>">Trang chủ</a></li><li><a href="<?php echo esc_url(vibelab_archive($item['post_type'])); ?>">Thực hành</a></li><li aria-current="page"><?php echo esc_html($item['title']); ?></li></ol></nav>
<header class="lesson-heading"><p class="detail-kind"><?php echo $item['post_type']==='vne_practice'?'Bộ thực hành':'Hướng dẫn'; ?></p><h1><?php echo esc_html($item['title']); ?></h1><p><?php echo esc_html($item['excerpt']); ?></p>
<div class="detail-badges"><span class="badge"><?php echo esc_html($state['primary_label']); ?></span></div>
<p>Đọc bài miễn phí. Tài khoản và chi phí công cụ ngoài có điều kiện riêng.</p><p>Kiểm chứng chỉ áp dụng cho phạm vi ghi cuối bài, không xác nhận máy hoặc tài khoản của bạn đã sẵn sàng.</p></header>
<div class="lesson-layout"><aside class="lesson-sidebar"><nav aria-label="Mục lục bài thực hành"><h2>Trong bài này</h2><ol><?php foreach($body['toc'] as $entry){ ?><li><a href="#<?php echo esc_attr($entry['id']); ?>"><?php echo esc_html($entry['label']); ?></a></li><?php } ?><li><a href="#tinh-trang">Nguồn và kiểm chứng</a></li></ol></nav>
<?php if($body['checks']){ ?><div class="lesson-progress"><p id="lesson-progress" role="status" aria-live="polite">0/<?php echo (int)$body['checks']; ?> mục bạn tự đánh dấu</p><p id="lesson-storage">Ghi chú tự kiểm tra; không phải chứng nhận hoàn thành. Chưa lưu tiến độ.</p><button hidden type="button" id="lesson-reset">Bỏ các dấu đã chọn</button><noscript><p>JavaScript đang tắt. Đánh dấu chỉ dùng trên trang đang mở; tự ghi lại trước khi đóng.</p></noscript></div><?php } ?></aside>
<article class="lesson-article reading">
<?php if(empty($state['commands_allowed'])){ ?><div class="lesson-warning" role="note"><strong>Đọc điều kiện trước khi thực hành</strong><p>Khối lệnh và prompt đang được ẩn vì bài chưa có kiểm chứng hiện hành hoặc cần rà soát. Không xem lần thử cũ là hướng dẫn đã sẵn sàng.</p></div><?php } ?>
<?php if($state['warnings']){ ?><section class="lesson-warning" aria-label="Cảnh báo bài thực hành"><h2>Cảnh báo cần đọc</h2><ul><?php foreach($state['warnings'] as $warning){ ?><li><?php if(!empty($warning['step'])){ ?><strong><?php echo esc_html($warning['step']); ?>: </strong><?php } ?><?php echo esc_html($warning['message']); ?><?php if(!empty($warning['reason'])&&$warning['reason']!==$state['recommendation_reason']){ ?> <?php echo esc_html($warning['reason']); ?><?php } ?></li><?php } ?></ul></section><?php } ?>
<?php echo $body['html']; ?>
<p id="lesson-copy-status" role="status" aria-live="polite"></p>
<section id="tinh-trang" class="state-panel" tabindex="-1"><h2>Nguồn và kiểm chứng</h2>
<p><?php vibelab_detail_reference($item['document_source']['source_url']??'',$item,'Tài liệu đối chiếu'); ?> · <?php vibelab_detail_date($item['document_source']['observed_at']??''); ?></p><p><?php echo esc_html($item['document_source']['note']??''); ?></p>
<?php if($state['recommendation_reason']){ ?><p><?php echo esc_html($state['recommendation_reason']); ?></p><?php } ?>
<?php $trial=$state['latest_validation'];if($trial){ ?>
<p class="lesson-evidence-label"><strong><?php echo $state['validation_status']==='tested'?'Bằng chứng đúng phiên bản hiện tại':'Bằng chứng lịch sử — không xác nhận bài hiện tại'; ?></strong></p>
<dl class="lesson-environment"><?php foreach(array('tested_at'=>'Ngày thử','os'=>'Hệ điều hành','tool'=>'Công cụ','version'=>'Phiên bản','input'=>'Đầu vào','output'=>'Kết quả đã ghi') as $key=>$label){ ?><dt><?php echo esc_html($label); ?></dt><dd><?php echo esc_html($trial[$key]); ?></dd><?php } ?></dl><ul><?php foreach($trial['checklist'] as $result){ ?><li><?php echo esc_html($result); ?></li><?php } ?></ul><p><?php vibelab_detail_reference($trial['evidence_url'],$item,'Xem bằng chứng'); ?></p>
<?php }else{ ?><p>Chưa có bằng chứng chạy thử cho bài này. Việc đọc nguồn hoặc sao chép nội dung không tạo kết quả thử.</p><?php } ?></section>
<?php if($related){ ?><section class="lesson-related"><h2>Bài đọc liên quan</h2><p>Cùng chủ đề; không mặc định là điều kiện bắt buộc hoặc đã thử cùng bài này.</p><ul><?php foreach($related as $other){ ?><li><a href="<?php echo esc_url(get_permalink($other['id'])); ?>"><?php echo esc_html($other['title']); ?></a></li><?php } ?></ul></section><?php } ?>
<?php vibelab_report_link($item); ?></article></div></div><?php get_footer(); ?>
