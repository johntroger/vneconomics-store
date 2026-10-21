# S02 — Thiết kế và nội dung mẫu

Ngày: 19/10/2026. User cho phép S02 và chọn dịch vụ chụp ảnh sản phẩm hư cấu.
Tên bài mẫu: Mộc Studio. Tên website VibeLab Việt chỉ là tên làm việc.

Hướng thiết kế: cửa hàng tài nguyên sáng, tìm kiếm nổi bật, hàng danh mục, lưới ảnh
sản phẩm và trang chi tiết hai cột. Dùng hình bìa SVG biên soạn riêng để biểu diễn
công dụng, không lấy logo/screenshot tác giả và không giả kết quả chạy repo.

Token: nền #F6F8FC, surface #FFFFFF, chữ #16243A, primary #2456B8, hỗ trợ #126A61,
viền #D7DFEA. Font Segoe UI Variable/Segoe UI/system-ui để đọc tiếng Việt offline;
font Be Vietnam Pro chốt/tự host ở theme thật sau. Tiêu đề trái, line length nội
dung dưới 80 ký tự; radius thẻ 12px, button 7px, không shadow đồng loạt, không motion.

Bốn template: home (tìm/nhóm/nổi bật/bắt đầu), category (lọc/lưới), resource (ảnh trái,
quyết định phải trên), guide (bước/chứng cứ/checklist). Các resource dùng cùng một
template với dữ liệu riêng. Một trang mẫu Mộc Studio minh họa đầu ra bài học, không
là template website thứ năm cần xây backend. Không giỏ hàng/giá giả/AI chưa hoạt động.

Tự rà brief trước code: bỏ biểu đồ sao/ratings/trending không có dữ liệu; không biến
home thành landing SaaS. Tập trung một hình mô phỏng landing page trong hero; các
thẻ còn lại yên, có ảnh/tên/loại/yêu cầu/CTA thật. Link ảnh/tên vào chi tiết; nút đi
thẳng repo/thư mục đã xác minh. Dùng 6 resource thật và nhãn chưa thử; Pico đã archived
được cảnh báo như nguồn quan sát, không kết luận độc hại/an toàn. Vercel license
chưa xác định từ API nên không ghi MIT; Astro cần đọc file license đúng phạm vi.

Nguồn đọc ngày 19/10: source-observations.json trong docs/acceptance/S02, README và
repo gốc. Nội dung là tóm lược biên tập tự viết, không dịch toàn README hay cài skill.
Phần Codex theo Windows/quickstart chính thức, không ghi tên nút theo trí nhớ khi
chưa đối chiếu phiên bản, không hứa quota hay miễn phí công cụ ngoài.

Kiểm thử: hành vi 2 luồng nguồn/chi tiết, home/category/resource/guide/sample,
search/filter thử trong tập tĩnh, URL, desktop/mobile, menu/bàn phím, overflow, lỗi
JS/HTTP nội bộ, ảnh và link nội bộ; không tự mở URL bên ngoài. Browser test dùng
Playwright Node 1.62.1 đã có trong runtime (module Python Playwright không có),
chạy qua npm/run-clean. Không cài Python package để làm trùng chức năng sẵn có.
Đây là ngoại lệ triển khai của hướng dẫn webapp-testing để giữ runner hiện có.

Scope S02 là prototype HTML/CSS/JS tĩnh, không CPT/API/DB hay test nghiệp vụ WordPress.
Các thao tác lọc chỉ dùng bộ dữ liệu mẫu; backend nằm ở S03 trở đi và chỉ làm khi
duyệt. Không gọi AI có phí hoặc deploy. Chủ dự án còn phải nghiệm thu giao diện;
chưa tuyển/nghiệm thu với nhóm người mới ngoài chủ dự án.
