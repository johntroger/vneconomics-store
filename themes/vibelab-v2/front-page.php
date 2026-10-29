<?php
if (!defined('ABSPATH')) { exit; }
$contract=vibelab_v2_contract_status();
$items=vibelab_v2_library_items('vne_resource', 4);
get_header();
?>
<main id="main" tabindex="-1">
<section class="v2-shell v2-hero">
<div class="v2-hero-copy"><span class="v2-kicker">Thư viện công cụ có biên tập</span><h1>Tìm công cụ. Hiểu trước khi dùng.</h1><p>Giải thích bằng tiếng Việt, dẫn về nguồn gốc và nói rõ điều kiện. Bắt đầu từ việc bạn muốn hoàn thành, không phải từ danh sách công nghệ.</p>
<form class="v2-hero-search" action="<?php echo esc_url(home_url('/')); ?>" method="get" role="search"><input type="hidden" name="vne_find" value="1"><input type="hidden" name="scope" value="resources"><label class="screen-reader-text" for="v2-hero-query">Tìm theo việc cần làm</label><input id="v2-hero-query" name="s" type="search" placeholder="Ví dụ: đọc PDF scan, làm landing page"><button type="submit">Tìm tài nguyên</button></form></div>
<dl class="v2-hero-index" aria-label="Ba lớp thông tin của thư viện"><div><dt>Nguồn</dt><dd>Đi đến đúng tác giả</dd></div><div><dt>Điều kiện</dt><dd>Biết cần chuẩn bị gì</dd></div><div><dt>Phạm vi</dt><dd>Phân biệt đã đọc và đã thử</dd></div></dl>
</section>

<nav class="v2-shell v2-paths" aria-label="Chọn cách bắt đầu"><a class="v2-path" href="<?php echo esc_url(vibelab_v2_archive_url('vne_resource')); ?>"><strong>Khám phá theo nhu cầu</strong><span>Lọc công cụ theo việc cần làm</span></a><a class="v2-path" href="#tai-nguyen"><strong>Xem tài nguyên được chọn</strong><span>Đọc công dụng và tình trạng</span></a><a class="v2-path" href="<?php echo esc_url(vibelab_v2_archive_url('vne_guide')); ?>"><strong>Làm theo hướng dẫn</strong><span>Đi từng bước tới một đầu ra nhỏ</span></a></nav>

<section id="tai-nguyen" class="v2-shell v2-section"><div class="v2-section-heading"><div><span class="v2-kicker">Chọn có lý do</span><h2>Tài nguyên để bắt đầu</h2></div><p>Mỗi mục cho biết công dụng, loại tài nguyên và tình trạng. Mở chi tiết trước khi sang nguồn bên ngoài.</p></div>
<?php if($items){ ?><div class="v2-resource-list"><?php foreach($items as $index=>$item){vibelab_v2_resource_row($item, $index+1);} ?></div><?php }else{ ?><div class="v2-empty"><p>Thư viện chưa có dữ liệu công khai để hiển thị. Giao diện nền vẫn hoạt động và không tạo nội dung mẫu.</p></div><?php } ?>
<?php if(!$contract['ready']){ ?><div class="v2-contract-note"><p>Dữ liệu thư viện chưa sẵn sàng. Không có nội dung nào được tạo hoặc thay đổi bởi theme.</p></div><?php } ?>
</section>

<section class="v2-steps"><div class="v2-shell v2-section"><div class="v2-section-heading"><div><span class="v2-kicker">Một lộ trình ngắn</span><h2>Từ câu hỏi đến việc làm được</h2></div><p>Ba bước này là trình tự thật, không phải nhãn trang trí.</p></div><div class="v2-step-grid"><article class="v2-step"><span class="v2-step-number">Bước 1</span><h3>Nói việc bạn cần làm</h3><p>Tìm bằng kết quả mong muốn, chẳng hạn chuyển tài liệu hoặc dựng một trang giới thiệu.</p></article><article class="v2-step"><span class="v2-step-number">Bước 2</span><h3>Đọc điều kiện và giới hạn</h3><p>Kiểm tra nguồn, quyền, chi phí, môi trường và phạm vi thư viện đã xác minh.</p></article><article class="v2-step"><span class="v2-step-number">Bước 3</span><h3>Bắt đầu với đầu ra nhỏ</h3><p>Mở hướng dẫn phù hợp, làm một thay đổi có thể kiểm tra và giữ đường quay lại.</p></article></div></div></section>

<section id="tieu-chi" class="v2-shell v2-section v2-principles"><div><span class="v2-kicker">Tiêu chí tuyển chọn</span><h2>Ít phỏng đoán hơn. Nhiều dấu vết hơn.</h2><p>Thư viện ưu tiên nội dung giúp người mới quyết định có nên dùng một công cụ, thay vì biến độ phổ biến thành lời khuyên.</p><a class="v2-button" href="<?php echo esc_url(home_url('/?vne_support=tieu-chi')); ?>">Đọc tiêu chí đầy đủ</a></div><dl class="v2-principle-list"><div><dt>Dẫn về nguồn cụ thể</dt><dd>Repo, thư mục hoặc tài liệu của tác giả được ghi rõ.</dd></div><div><dt>Giữ trạng thái không chắc chắn</dt><dd>Thông tin chưa biết hoặc mâu thuẫn được nói thẳng.</dd></div><div><dt>Không tạo bằng chứng giả</dt><dd>Số sao, demo và nhãn kiểm thử không thay thế việc đọc nguồn.</dd></div></dl></section>
</main>
<?php get_footer(); ?>
