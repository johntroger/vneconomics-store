# S06 — Theme nền và trang chủ
Ngày 21/10/2026. Chủ dự án cho phép S06; chưa cho phép S07 hoặc triển khai hosting.

Thiết kế bám bản S02: nền #F6F8FC, surface #FFFFFF, chữ #16243A, primary #2456B8,
hỗ trợ #126A61, viền #D7DFEA. Hướng trái, nội dung dưới 80 ký tự/dòng; thẻ 12px,
button 7px. Hero là mô phỏng landing page Mộc Studio hư cấu, không phải demo chạy repo.
Ảnh bìa SVG S02 do dự án biên soạn, không là logo/screenshot của tác giả.

Rà soát trước xây: giữ cửa hàng với ảnh/tên/CTA thay vì landing SaaS, bỏ số sao,
rating, giá, claim AI, và số lượng tài nguyên viết cứng. Danh mục chỉ lấy từ các
tài nguyên công khai trong khối trang chủ. Không gợi ý "hot" hoặc "đã thử" khi thiếu bằng chứng.

Font S06 dùng Segoe UI Variable / Segoe UI / system-ui như prototype đã duyệt,
đọc tiếng Việt offline, không gọi Google Fonts. Be Vietnam Pro từng là dự kiến
cho theme thật; chưa đóng gói font vì chưa có asset/font/license được chọn trong
repo. Quyết định S06 là system font, không xem bản này đã hoàn tất lựa chọn Be Vietnam Pro.

Luồng:
Header → tìm kiếm cơ bản WordPress → danh sách văn bản.
Home → ảnh/tên → trang đọc cơ bản; CTA → nguồn hoặc mục tình trạng tùy resolver.
Home → danh mục → danh sách văn bản cơ bản.
Home → bài hướng dẫn công khai đầu tiên → nội dung đã duyệt.
Footer → tài nguyên / mục cho người mới / tiêu chí tuyển chọn.

Chỉ home và chrome là giao diện S06. index.php là fallback đọc/danh sách an toàn
để liên kết có đích; chưa phải thiết kế category/card đầy đủ S07, detail S08,
search/filter S09, hay bài học tương tác S10.

Theme không tự seed nội dung và không ghi database. WP_Query lấy ID publish,
vne_library_item() lấy approved snapshot và derived state. Không đọc raw meta
để hiển thị công khai, không tự suy ra trạng thái. Proposal/private/draft không
được hiển thị. Link nguồn bị ngừng dẫn tới phần giải thích ở trang đọc, không
mở repo từ href null. Ảnh dự phòng SVG nội bộ dùng cho URL chưa có bìa minh họa.

Menu là progressive enhancement: không có JS vẫn hiện toàn bộ link. Chỉ đóng
menu mobile sau khi gắn thành công các handler. Có aria-expanded, Escape trả
focus về Menu, chuyển breakpoint xử lý focus, không dùng keyboard trap.
Menu do quản trị cấu hình hỗ trợ tối đa hai cấp hiển thị trực tiếp.

Không cài theme/plugin hoặc nạp mẫu vào database local đang dùng, không deploy.
Kiểm thử trong fixture WordPress/PHP8.3/SQLite, dọn sau khi đóng browser/server.
Playwright Node sẵn trong runtime thay Python Playwright chưa có, như S02–S05.
