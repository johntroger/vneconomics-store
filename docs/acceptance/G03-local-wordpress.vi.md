# G03 — tích hợp bộ ba trong WordPress local

Ngày 25/10/2026. Chủ trả lời **“đồng ý”** cho bước tích hợp Codex – Claude Code – Antigravity vào WordPress local và kiểm thử giao diện, sau khi hoàn tất bản thảo/lượt thử chức năng có chủ hỗ trợ.

**PASS trong phạm vi local: 205 kiểm tra. Chưa phát hành staging/production.**

## Thay đổi

- Theme ứng viên **VibeLab 0.7.2**. Plugin vẫn 0.4.2/schema 3, không sửa mã plugin hoặc contract phát hành lịch sử.
- Trang /huong-dan/ hiển thị đúng ba lựa chọn chính theo thứ tự Codex, Claude Code, Antigravity IDE. Các bài chuẩn bị, sửa lỗi, HTML/CSS nằm trong Tài liệu bổ trợ, giữ URL và khả năng tìm kiếm.
- Trang chủ cũng có ba lựa chọn; nút “Tôi mới bắt đầu” dẫn tới trang chọn công cụ. Không còn tự chọn một bài theo thứ tự chữ cái.
- Registry ghép đúng ba slug bài đã chốt với snapshot công khai được duyệt. Thiếu bài, bài thành draft hoặc plugin không hoạt động thì hiển thị thông báo đang chuẩn bị, không dựng liên kết tới nội dung ẩn.
- Hai bản thảo giữ liên kết Codex cùng website bằng đường dẫn tương đối; file preview độc lập dùng liên kết live đầy đủ để vẫn đọc được.
- Thêm hai file PHP vào allowlist đóng gói. Các file nguồn/bằng chứng được ghim byte trong .gitattributes để checkout không đổi hash kiểm thử. Chưa tạo hoặc phát hành gói mới.

## Kiểm thử

WordPress thật/PHP 8.3.36 và SQLite trong fixture mới, Edge headless, tách DB/config đang dùng. Cả fixture và cache được dọn sau chạy; giữ nguồn, ảnh, bản mốc thật và kết quả.

- Cú pháp toàn bộ PHP deployable của theme; phiên bản theme/plugin đúng.
- Tạo hai bài qua API có quyền của plugin; 11 mục thư viện cũ trong fixture và metadata giữ nguyên theo hash.
- Trang chọn có ba bài chính và ba bổ trợ, trang chủ có ba lựa chọn, nút bắt đầu tới hub; layout 1280/390/320px không tràn ngang. Đã xem ảnh desktop/mobile.
- Hai bài mới: sáu nút copy, sáu mục tự kiểm tra, mục lục có đích duy nhất, điều hướng bàn phím, sao chép đúng byte, fallback khi clipboard bị từ chối, lưu/khôi phục/reset checklist, không tự nhận hoàn thành.
- Khi đổi revision, bằng chứng cũ thành lịch sử, khối lệnh/prompt bị ẩn và tiến độ cũ không áp dụng. Từng trạng thái review, nguồn unavailable, suspended được thử độc lập từ baseline đang cho phép lệnh.
- Không JavaScript hoặc localStorage bị chặn: checklist native vẫn dùng được, thông báo/fallback đúng.
- 14 URL legacy từ S16 được tái tạo bằng fixture và giữ pipeline nội dung/shortcode; URL Codex, ba bài bổ trợ và bài thực hành cũ vẫn trả 200. Trang private không lộ nội dung, trang có mật khẩu giữ kiểm soát truy cập.
- Tìm được bài mới; raw WordPress edits không ghi đè snapshot public; bài bị chuyển draft thành placeholder; mất plugin vẫn có trang chủ hợp lệ.
- Không request browser ngoài fixture, không lỗi JavaScript/PHP. DB/config local thật và nguồn Codex S10 giữ nguyên theo hash. Không email, API AI trả phí hoặc scheduler.

[Kết quả 205 điểm](G03/results.json), [ảnh desktop](G03/hub-1280.png), [ảnh mobile](G03/hub-390.png), [bản thảo/phạm vi thử công cụ thật](../content-guides/2026-10-25/README.vi.md).

## Lượt chưa đạt và xử lý

- Giữ environment-abort.json: Node24/undici dừng ở parser HTTP; chuyển runner sang node:http, tiêu thụ hết response, rồi chạy lại toàn bộ.
- Giữ failure-archive-routing.json: bộ tìm kiếm cũ ghi đè template archive hướng dẫn. Đã thêm chọn hub có điều kiện sau bộ tìm kiếm, chỉ khi archive không có bộ lọc/truy vấn.
- Giữ failure-test-update-argument.json và failure-before-final-pass.json: test cập nhật nhầm bằng payload.id thay vì tham số ID của API. Đã sửa test dùng đúng ID/base_revision và xác nhận bản ghi gốc đổi revision; không sửa plugin để làm test qua.
- Lượt cuối đạt đủ 205 điểm, cleanup thành công. Không bỏ qua ca bắt buộc hoặc ghi PASS từ lượt trước khi sửa.

## Giới hạn và bước tiếp theo

Các bản ghi validation của fixture là **QA tổng hợp có nhãn rõ**, URL example.test, chỉ để thử cổng hiển thị và tương tác. Không được nhập chúng lên staging/production. Bằng chứng thử đầu ra thật do chủ hỗ trợ nằm riêng trong hồ sơ Claude/Antigravity; cài mới, đăng nhập mới và model/review mode chưa được chứng nhận.

Kiểm tra legacy dùng marker/shortcode tại 14 đường dẫn thật, không phải kiểm thử giao dịch WooCommerce. Chưa kiểm MariaDB hosting, SSL, performance hoặc rollback của theme 0.7.2. Cảnh báo hiệu năng hosting S16 không được ghi là đã sửa.

Bước local này hoàn tất. Theo AGENTS.md, dừng chờ duyệt trước bước tiếp theo. Đề xuất tiếp: chuẩn bị gói/ref, payload chỉ hai bài mới và bằng chứng thật, phương án staging/rollback để chủ duyệt riêng; chưa có quyền triển khai từ lần đồng ý dành cho local.
