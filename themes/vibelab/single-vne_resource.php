<?php
if(!defined('ABSPATH')){exit;}
$item=vibelab_ready()?vne_library_item(get_queried_object_id()):null;
if(!$item||is_wp_error($item)||empty($item['derived']['is_public'])){
    global $wp_query;$wp_query->set_404();status_header(404);nocache_headers();require get_index_template();return;
}
$data=$item['data'];$state=$item['derived'];$cover=vibelab_cover($item);
$related=vibelab_detail_related($item);$guides=vibelab_detail_related($item,'vne_guide');
$path=explode('/',trim(wp_parse_url($data['source_url'],PHP_URL_PATH),'/'));
$kinds=array('learn'=>'Nền tảng web','skill'=>'Skill cho AI agent','starter'=>'Mẫu dự án','tool'=>'Công cụ');
$trial=array('tested'=>'Đã thử đúng phiên bản','not_tested'=>'Chưa thử','review_needed'=>'Cần kiểm tra lại');
get_header(); ?>
<div class="container detail-page" data-resource-detail="<?php echo (int)$item['id']; ?>">
<?php vibelab_detail_breadcrumb($item); ?>
<div class="detail-hero">
<figure class="detail-media"><?php if($cover){ ?><img src="<?php echo esc_url($cover); ?>" width="720" height="430" alt="Minh họa biên soạn riêng cho tài nguyên, không phải kết quả chạy thử" fetchpriority="high"><?php }else{ ?><div class="cover-placeholder" role="img" aria-label="Chưa có ảnh minh họa">Chưa có ảnh minh họa</div><?php } ?><figcaption>Ảnh minh họa biên soạn riêng. Không phải demo đã chạy hoặc ảnh của tác giả.</figcaption></figure>
<div class="detail-decision"><p class="detail-kind"><?php echo esc_html($kinds[$data['resource_type']]??'Tài nguyên'); ?></p><h1><?php echo esc_html($item['title']); ?></h1>
<p class="detail-excerpt"><?php echo esc_html($item['excerpt']); ?></p><p class="detail-owner">Chủ repo: <strong><?php echo esc_html($path[0]); ?></strong></p>
<div class="detail-badges"><span class="badge"><?php echo esc_html($state['primary_label']); ?></span><span class="badge"><?php echo esc_html($trial[$state['validation_status']]); ?></span></div>
<p class="detail-disclaimer">Đối chiếu nguồn không đồng nghĩa đã cài hoặc thử. Xem điều kiện và phạm vi kiểm chứng trước khi dùng.</p>
<div class="detail-actions"><?php vibelab_cta($item,'button primary'); ?><a href="#dieu-kien">Xem điều kiện sử dụng</a></div>
<p class="detail-free">Đọc trên website miễn phí. Chi phí của tài nguyên/công cụ gốc xem bên dưới.</p>
</div></div>
<nav class="detail-tabs" aria-label="Nội dung trang tài nguyên"><a href="#gioi-thieu">Giới thiệu</a><a href="#dieu-kien">Điều kiện sử dụng</a><a href="#tinh-trang">Tình trạng</a><a href="#bat-dau">Bắt đầu tìm hiểu</a><a href="#nguon">Nguồn và mốc đối chiếu</a><?php if($related){ ?><a href="#cung-danh-muc">Cùng danh mục</a><?php } ?></nav>
<div class="detail-body">
<section id="gioi-thieu" class="detail-section" tabindex="-1"><h2>Giới thiệu</h2><div class="reading"><?php if(trim($item['content'])){echo vibelab_detail_content($item);}else{ ?><p>Chưa có giới thiệu chi tiết. Đọc mô tả ngắn và nguồn gốc trước khi lựa chọn.</p><?php } ?></div></section>
<section id="dieu-kien" class="detail-section" tabindex="-1"><h2>Điều kiện sử dụng</h2><p>Thông tin theo từng nguồn, không phải cam kết thay tác giả hoặc nhà cung cấp.</p><div class="detail-claims"><?php foreach(vibelab_detail_labels() as $key=>$label){vibelab_detail_claim($key,$data['claims'][$key],$item);} ?></div></section>
<section id="tinh-trang" class="detail-section state-panel" tabindex="-1"><h2>Tình trạng và phạm vi kiểm chứng</h2>
<p><strong><?php echo esc_html($state['primary_label']); ?></strong> · <?php echo esc_html($trial[$state['validation_status']]); ?></p>
<?php if($state['recommendation_reason']){ ?><p><?php echo esc_html($state['recommendation_reason']); ?></p><?php } ?>
<ul class="detail-warnings"><?php foreach($state['warnings'] as $warning){ ?><li><?php if(isset($warning['field'])&&array_key_exists($warning['field'],vibelab_detail_labels())){ ?><a href="#dieu-kien-<?php echo esc_attr($warning['field']); ?>"><?php echo esc_html(vibelab_detail_labels()[$warning['field']]); ?></a>: <?php } ?><?php echo esc_html($warning['message']); ?><?php if(!empty($warning['reason'])&&$warning['reason']!==$state['recommendation_reason']){echo ' '.esc_html($warning['reason']);} ?></li><?php } ?></ul>
<div class="detail-observations"><?php foreach(array('source_access'=>'Truy cập nguồn','maintenance'=>'Tình trạng duy trì') as $axis=>$label){$observation=$state['observations'][$axis];$labels=array('unknown'=>'Chưa xác định','available'=>'Truy cập được theo lần đối chiếu','unavailable'=>'Không truy cập được theo lần đối chiếu','active'=>'Có hoạt động theo lần đối chiếu','archived'=>'Repo đã archived'); ?>
<div><h3><?php echo esc_html($label); ?></h3><p><?php echo esc_html($labels[$observation['status']]); ?> · <?php vibelab_detail_date($observation['observed_at']); ?></p><p><?php echo esc_html($observation['note']); ?></p><?php if($observation['source_url']){ ?><p class="reference-text">Nguồn ghi nhận: <?php echo esc_html($observation['source_url']); ?></p><?php } ?></div>
<?php } ?></div>
<div class="detail-evidence"><?php $evidence=$state['latest_validation'];if($evidence){ ?><h3>Bằng chứng ghi nhận gần nhất</h3><p class="evidence-validity"><?php echo $state['validation_status']==='tested'?'Kết quả hiện hành cho phiên bản và điều kiện đã ghi.':'Ghi nhận này chưa được dùng để xác nhận phiên bản hiện tại.'; ?></p><dl><dt>Kết quả ghi nhận</dt><dd><?php echo $evidence['outcome']==='pass'?'Đạt theo ghi nhận':'Chưa đạt theo ghi nhận'; ?></dd><dt>Ngày thử</dt><dd><?php vibelab_detail_date($evidence['tested_at']); ?></dd><dt>Môi trường</dt><dd><?php echo esc_html($evidence['os'].' / '.$evidence['tool'].' / '.$evidence['version']); ?></dd><dt>Đầu vào</dt><dd><?php echo esc_html($evidence['input']); ?></dd><dt>Đầu ra</dt><dd><?php echo esc_html($evidence['output']); ?></dd></dl><ul><?php foreach($evidence['checklist'] as $entry){ ?><li><?php echo esc_html($entry); ?></li><?php } ?></ul>
<p class="reference-text">Bằng chứng: <?php echo esc_html($evidence['evidence_url']); ?></p>
<?php }else{ ?><h3>Chưa có bằng chứng chạy thử</h3><p>Chưa có kết quả kèm môi trường và đầu ra để xác nhận tài nguyên đã được thử.</p><?php } ?></div>
</section>
<section id="bat-dau" class="detail-section" tabindex="-1"><h2>Bắt đầu tìm hiểu</h2>
<?php if(!$state['commands_allowed']){ ?><p class="detail-notice">Chưa đủ điều kiện để đề xuất lệnh cài đặt ở trang này. Hãy đọc yêu cầu, giấy phép, quyền truy cập và các cảnh báo trước khi thực hành.</p><?php }else{ ?><p>Đối chiếu môi trường, phiên bản và phạm vi của bằng chứng với trường hợp của bạn. Kết quả đã thử không bảo đảm phù hợp với mọi máy hoặc mọi công cụ.</p><?php } ?>
<?php if(vibelab_detail_source_allowed($item)){ ?><p>Đọc tài liệu gốc để biết cách bắt đầu đúng với nguồn và phiên bản:</p><?php vibelab_cta($item,'button'); ?><?php }else{ ?><p>Đọc <a href="#tinh-trang">lý do và tình trạng hiện tại</a> trước khi lựa chọn tài nguyên khác.</p><?php } ?>
<?php if($guides){ ?><div class="detail-guides"><h3>Bài đọc cùng chủ đề</h3><p>Các bài có chung danh mục, chưa khẳng định đã dùng cùng repo này.</p><ul><?php foreach($guides as $guide){ ?><li><a href="<?php echo esc_url(get_permalink($guide['id'])); ?>"><?php echo esc_html($guide['title']); ?></a><span class="badge"><?php echo esc_html($guide['derived']['primary_label']); ?></span><p><?php echo esc_html($guide['excerpt']); ?></p></li><?php } ?></ul></div><?php } ?>
</section>
<section id="nguon" class="detail-section" tabindex="-1"><h2>Nguồn và mốc đối chiếu</h2><dl class="detail-facts"><dt>Repo hoặc thư mục gốc</dt><dd><?php vibelab_detail_reference($data['source_url'],$item); ?></dd><dt>Phạm vi trong repo</dt><dd><?php echo esc_html($data['source_path']?:'Gốc repo'); ?></dd><dt>Revision nguồn đã ghi</dt><dd><code><?php echo esc_html($data['source_revision']?:'Chưa xác định'); ?></code></dd><dt>Đối chiếu nguồn</dt><dd><?php vibelab_detail_date($data['observed_at']); ?></dd><dt>Rà soát biên tập</dt><dd><?php vibelab_detail_date($state['reviewed_at'],'Chưa có mốc rà soát biên tập'); ?></dd><?php if($state['review_due_at']){ ?><dt>Hạn rà soát</dt><dd><?php vibelab_detail_date($state['review_due_at']); ?></dd><?php } ?></dl><p class="detail-footnote">Ngày đối chiếu nguồn không phải ngày chạy thử. Chỉ các mốc đã ghi được hiển thị; chưa có lịch sử thay đổi công khai khác.</p></section>
</div>
<?php if($related){ ?><section id="cung-danh-muc" class="detail-related" tabindex="-1"><div class="section-heading"><div><h2>Tài nguyên cùng danh mục</h2><p>Có chung chủ đề; không mặc định thay thế cho nhau hoặc đã được thử cùng nhau.</p></div></div><div class="resource-grid"><?php foreach($related as $other){vibelab_card($other);} ?></div></section><?php } ?>
<?php vibelab_report_link($item); ?></div><?php get_footer(); ?>
