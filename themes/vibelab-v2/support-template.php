<?php
if(!defined('ABSPATH')){exit;}
$ctx=vibelab_v2_support_current();$page=$ctx['page'];$error=$ctx['error'];$item=$ctx['item'];$values=$ctx['values'];
$title=vibelab_v2_support_pages()[$page]??'Không tìm thấy trang hỗ trợ';get_header(); ?>
<main id="main" tabindex="-1" class="v2-shell support-page" data-support-page="<?php echo esc_attr($page); ?>">
<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="<?php echo esc_url(home_url('/')); ?>">Trang chủ</a></li><li><a href="<?php echo esc_url(vibelab_v2_support_url()); ?>">Trợ giúp</a></li><li aria-current="page"><?php echo esc_html($title); ?></li></ol></nav>
<header class="support-heading"><h1><?php echo esc_html($title); ?></h1><p>Thông tin rõ ràng để bạn chọn tài nguyên và biết cách phản hồi khi gặp vấn đề.</p></header>
<div class="support-layout"><nav class="support-nav" aria-label="Các trang hỗ trợ"><?php foreach(vibelab_v2_support_pages() as $key=>$label){if($key==='bao-loi'){continue;} ?><a href="<?php echo esc_url(vibelab_v2_support_url($key)); ?>" <?php if($page===$key){echo 'aria-current="page"';} ?>><?php echo esc_html($label); ?></a><?php } ?></nav>
<article class="support-content reading">
<?php if($error){$data=$error->get_error_data(); ?><div class="support-notice error" role="alert" id="report-error" tabindex="-1"><h2>Chưa hoàn tất yêu cầu</h2><p><?php echo esc_html($error->get_error_message()); ?></p><?php if(!empty($data['field'])){ ?><a href="#<?php echo esc_attr($data['field']); ?>">Đến trường cần kiểm tra</a><?php } ?></div><?php } ?>
<?php if($page==='bao-loi'){
if($ctx['receipt']){ ?><section class="support-notice success" role="status"><h2>Đã lưu báo cáo</h2><p>Mã báo cáo: <strong class="receipt-code"><?php echo esc_html($ctx['receipt']['code']); ?></strong></p><p>Báo cáo đã vào hàng đợi riêng của người biên tập. Đây là xác nhận đã lưu, không có nghĩa tài nguyên đã được sửa hoặc có người trực trả lời ngay.</p><p>Bạn có thể ghi lại mã này. Phiên xác nhận hết hạn sau 15 phút; không có tra cứu nội dung báo cáo công khai.</p><a href="<?php echo esc_url(vibelab_v2_archive_url()); ?>">Quay lại thư viện</a></section><?php
}elseif($item&&!$ctx['receipt']&&function_exists('vne_report_ticket')){ $ticket=$ctx['ticket']??vne_report_ticket($item); ?>
<section class="report-context"><h2>Nội dung bạn đang báo lỗi</h2><p><a href="<?php echo esc_url(get_permalink($item['id'])); ?>"><?php echo esc_html($item['title']); ?></a></p><p>Phiên bản đang hiển thị được tự đính kèm. Báo cáo không thay đổi trạng thái hoặc nội dung tài nguyên.</p></section>
<div class="support-notice"><strong>Không gửi thông tin bí mật</strong><p>Chỉ mô tả lỗi đã che thông tin riêng. Không gửi API key, mật khẩu, dữ liệu khách hàng hoặc tệp cấu hình. Không có đính kèm.</p></div>
<form id="resource-report-form" class="report-form" method="post" action="<?php echo esc_url(vibelab_v2_support_url('bao-loi',array('resource'=>$item['id']))); ?>">
<?php echo wp_nonce_field('vne_report_submit','nonce',false,false);foreach($ticket as $key=>$value){ ?><input type="hidden" name="<?php echo esc_attr($key); ?>" value="<?php echo esc_attr($value); ?>"><?php } ?>
<div class="report-trap" aria-hidden="true"><label for="report-website">Để trống trường này</label><input id="report-website" name="website" value="" tabindex="-1" autocomplete="off"></div>
<p><label for="report-kind">Loại vấn đề <span>(bắt buộc)</span></label><select id="report-kind" name="kind" required><option value="">Chọn loại vấn đề</option><?php foreach(vne_report_kinds() as $key=>$label){ ?><option value="<?php echo esc_attr($key); ?>" <?php selected($values['kind']??'',$key); ?>><?php echo esc_html($label); ?></option><?php } ?></select></p>
<p><label for="report-description">Mô tả điều bạn gặp <span>(bắt buộc)</span></label><span id="description-help" class="field-help">20–2.000 ký tự. Nêu bước đã làm, kết quả mong đợi và điều bạn nhìn thấy. Chỉ ghi hệ điều hành/phiên bản công cụ nếu liên quan.</span><textarea id="report-description" name="description" rows="7" minlength="20" maxlength="2000" required aria-describedby="description-help"><?php echo esc_textarea($values['description']??''); ?></textarea></p>
<p><label for="report-email">Email liên hệ <span>(tùy chọn)</span></label><input id="report-email" name="email" type="email" maxlength="254" autocomplete="email" value="<?php echo esc_attr($values['email']??''); ?>"><span class="field-help">Có thể để trống. Không có email tự động hoặc cam kết thời gian phản hồi.</span></p>
<p class="report-consent"><label><input id="report-consent" name="consent" type="checkbox" value="1" required <?php checked($values['consent']??'','1'); ?>><span>Tôi đồng ý gửi mô tả và email nếu có vào hàng đợi riêng theo <a href="<?php echo esc_url(vibelab_v2_support_url('quyen-rieng-tu')); ?>">quyền riêng tư của biểu mẫu</a>.</span></label></p>
<button class="button primary" type="submit">Gửi báo lỗi</button><p id="report-submit-state" role="status" aria-live="polite"></p>
<p class="field-help">Tối đa 3 báo cáo được lưu trong mỗi khoảng 15 phút theo mã giới hạn của kết nối. Chỉ coi đã nhận khi thấy “Đã lưu báo cáo” và mã xác nhận. Biểu mẫu này hết hạn sau 2 giờ.</p>
</form><?php
}elseif(!$error){ ?><p>Mở một tài nguyên hoặc bài thực hành rồi chọn <strong>Báo lỗi nội dung này</strong> để form gắn đúng ngữ cảnh.</p><p><a class="button" href="<?php echo esc_url(vibelab_v2_archive_url()); ?>">Chọn tài nguyên trong thư viện</a></p><?php }
}else{echo vibelab_v2_support_content($page);}
?>
</article></div></main><?php get_footer(); ?>
