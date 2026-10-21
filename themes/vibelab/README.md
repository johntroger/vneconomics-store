# VibeLab Việt — theme 0.3.0

Theme nền/trang chủ S06, danh mục/thẻ S07 và trang chi tiết S08.
Dùng plugin vne-library-core 0.3.0/schema 3. Không WooCommerce, giỏ hàng hay thanh toán.
Thư viện miễn phí, CTA mở đúng repo/path; không bắt kết nối AI để đọc hoặc mở nguồn.

## Dữ liệu và điều hướng

Theme không tạo dữ liệu khi kích hoạt. vne_library_item() public trả approved snapshot
và derived state. Home tối đa 6 resource; guide đầu tiên theo tên. Thẻ ghi loại,
chủ repo theo namespace URL, yêu cầu và mức xác minh; không tự nhận đã thử.

Archive và taxonomy category/need/tool: breadcrumb, danh mục có counts, grid 3/2/1,
9 mục/trang theo tên approved. Category cha gồm con; đa danh mục không đếm trùng.
Guide/private/draft/proposal không vào số resource; không dùng WP term.count.
Tập approved ID thống nhất main query, membership, count và pagination.
Danh mục có thật nhưng rỗng trả 200; taxonomy không có hoặc ngoài phạm vi trả 404.
Snapshot chỉ cache trong request; chưa có index/cache cho thư viện lớn.
MVP dự kiến 20 resource; xem hợp đồng S07 trước khi tăng quy mô.

## Trang tài nguyên chi tiết S08

single-vne_resource.php và detail.php: ảnh trái/thông tin phải trên desktop,
một cột mobile, CTA nguồn, điều hướng mục bằng anchor HTML.
Có giới thiệu; yêu cầu/quyền/tương thích/giấy phép/chi phí; tình trạng và phạm vi
kiểm chứng; cách tìm hiểu; nguồn/path/revision và các mốc đã ghi.
Không dựng gallery, rating, FAQ hoặc lịch sử thiếu dữ liệu.

Unknown / theo nguồn / mâu thuẫn được trình bày riêng, không nâng thành đã xác minh.
Bằng chứng cũ vẫn có thể được đọc nhưng không xác nhận phiên bản hiện tại.
Không hiển thị audit nội bộ. Suspended/unavailable chỉ mở giải thích, URL nguồn
và tham chiếu trên trang đó không còn là link ngoài. Các cảnh báo phụ được giữ.

Giới thiệu được lọc HTML, không media/form/shortcode ngoài, không h1/style;
ID/anchor được prefix để tránh đụng template. commands_allowed=false thay khối pre
bằng giải thích. Không sinh/copy/chạy lệnh; mã inline/văn xuôi vẫn cần biên tập.
Related dùng category approved chung, tối đa3, bỏ suspended/unavailable;
guide cùng chủ đề không được coi là đã sử dụng repo. Không dữ liệu thì bỏ mục.
Frontend private/draft không hiển thị kể cả đã đăng nhập; preview S05 ở admin riêng.

Ảnh SVG S02 là minh họa tự biên soạn, không là demo. Thiếu bìa dùng bìa chung;
thiếu cả bìa chung hiện placeholder có nhãn. Không tải font/ảnh từ dịch vụ ngoài.
Font Segoe UI/system-ui. Menu hai cấp, liên kết và nội dung vẫn dùng được khi tắt JS.

## Kiểm thử và giới hạn

Chạy tuần tự tại root:

- npm run test:detail
- npm run test:detail-catalog-regression
- npm run test:detail-home-regression

Hai lệnh hồi quy ghi riêng vào docs/acceptance/S08/S07-regression và S06-regression.
Hồ sơ S06/S07 gốc giữ nguyên. Mọi runner qua run-clean, fixture độc lập;
không nạp QA vào database local đang dùng, không deploy hoặc gọi API trả phí.

index.php còn là bản đọc nền cho guide/practice và fallback chung.
Chưa làm tìm/lọc kết hợp S09, bài học tương tác S10 hoặc hỗ trợ S11.
SQLite/PHP WebAssembly/Edge local chưa chứng nhận hosting MySQL/cache/browser khác.
