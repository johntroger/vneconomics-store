# S03 — Plugin dữ liệu và nhập tay

Ngày nghiệm thu kỹ thuật: 21/10/2026.
**PASS local trong phạm vi S03; dừng chờ chủ dự án cho phép S04.**

Chủ dự án cho phép bằng yêu cầu “bắt đầu S03”. Nhánh codex/s03-library-data,
dựa trên S02 tại 9c50e04. Không đổi main/release hoặc cài plugin lên hosting.

## Đầu ra

- Plugin [vne-library-core](../../plugins/vne-library-core/README.md), version 0.1.0.
- CPT tài nguyên, hướng dẫn, bộ thực hành; taxonomy danh mục, nhu cầu, công cụ.
- Màn hình nhập tay tiếng Việt, lưu nháp/xuất bản/riêng tư, xem dữ liệu hiện tại,
  tạo phân loại. Cùng một service validation cho form và REST API.
- Administrator và role Biên tập thư viện có capability riêng. Không tự thêm
  quyền thư viện cho Editor/Author/Subscriber có sẵn.
- Nguồn/revision/ngày/đối chiếu thủ công; các claim chi phí, giấy phép, yêu cầu,
  quyền và tương thích phân biệt unknown/upstream_claimed/conflicted.
- Unknown giữ null; không tự coi là miễn phí hoặc đã thử. Skill cần URL/path
  thư mục cụ thể. Hướng dẫn/bộ thực hành có thể dùng nguồn HTTPS ngoài GitHub.
- Điều kiện xuất bản kiểm tra trước khi ghi; cập nhật sai giữ nguyên toàn bộ
  dữ liệu cũ. Guard chặn core publish khi thiếu field bắt buộc.
- Public API chỉ trả publish; loại bản nháp, riêng tư và ghi chú nội bộ.
  Generic CPT REST tắt; form kiểm tra capability và nonce trước khi xuất header.

Chi tiết field và phạm vi: [hợp đồng S03](../S03-data-contract.vi.md).

## Kiểm thử và bằng chứng

Lệnh: npm run test:library — qua scripts/run-clean.mjs. Exit code cuối: 0.

| Nhóm | Kết quả |
|---|---|
| Model / WordPress / quyền / REST nội bộ | 69 assertion PASS |
| Trình duyệt Edge + Playwright | Đăng nhập biên tập thẳng trang Thư viện, lưu/đọc nháp, thiếu nonce trả 403; không pageerror trong luồng này |
| HTTP công khai | Không lộ nháp/ghi chú, generic CPT REST trả 404 |
| Restart cùng fixture | Plugin vẫn active, bài publish và unknown null giữ nguyên, nháp nhập từ form còn đủ một bản |
| Baseline sau restart | Home, login, REST trả 200; không lỗi PHP/database trong nội dung response |
| Dữ liệu local thật | SHA256 DB và wp-config.php không đổi |
| Cleanup | Runner đã dọn fixture/cache; tmp/tests không còn entry mới, không còn lock; port 19403 không listen |
| Diff | git diff --check đạt |

Chi tiết máy: [test-results.json](S03/test-results.json).
Ảnh form vừa lưu: [admin-manual-entry.png](S03/admin-manual-entry.png).

Môi trường: Node 24.19.0; @wp-playground/cli 3.1.58; PHP 8.3.33;
WordPress 7.1.3; SQLite; Playwright Node 1.62.1 với Edge headless.
Tiếp tục dùng Playwright Node đã có của S02 vì Python Playwright không có;
không thêm package trùng chức năng. Server/browser đóng trước cleanup.
Các URL example trong fixture là dữ liệu kiểm thử hư cấu, không phải tài nguyên
đã xác minh để xuất bản. Fixture/tài khoản/mật khẩu kiểm thử không được giữ lại.

SHA256 bảo vệ:
- DB: F2A35E44C395FB790E6EA5524B21F2525D49F75D19FF129E8E3894FA08721FD8
- wp-config.php: B2B3F3FE6DBF560B38DB952A868DF3120FFF14BB39BA96EA34E2F26B5C2892F8

## Lỗi phát hiện và xử lý

Các lượt trước chưa được tính PASS; runner đã dọn dữ liệu sau từng lượt lỗi.

1. Setup fixture giữ cache capability từ trước activation: nạp lại người dùng
   sau khi thêm role/cap, mô phỏng request mới.
2. Regex URL dùng delimiter chưa escape: sửa để nhận đúng URL GitHub; thêm
   kiểm tra giữ dấu nháy/backslash khi lưu qua WordPress.
3. Edge kế thừa USERPROFILE tạm của WordPress: tách environment trình duyệt.
4. Nonce kiểm tra trong callback sau admin header khiến response lỗi trả 200:
   chuyển preflight sang admin_init; lần cuối xác nhận HTTP 403.
5. Luồng đăng nhập mặc định rồi chuyển trang ghi nhận một pageerror “serialize”.
   Chuyển test sang redirect đăng nhập trực tiếp trang Thư viện, ghi đầy đủ
   URL/stack nếu có lỗi. Luồng S03 cuối không ghi nhận pageerror. Chưa xác định
   nguyên nhân lỗi ở luồng trung gian và không kết luận đã sửa Dashboard core.

## Giới hạn và bước tiếp

PASS này áp dụng plugin/form/API S03 trên local. Dashboard mặc định WordPress,
MySQL/Plesk, staging và production chưa được nghiệm thu trong lượt này. Không
chuyển kết quả SQLite thành xác nhận hosting. Plugin chưa được cài vào .local/site;
database hiện có được giữ nguyên, chỉ fixture dùng cho test rồi dọn.

Chưa làm resolver/quan hệ kiểm chứng S04, bản sửa/duyệt S05, theme S06, collector,
AI/BYOK hoặc gọi API trả phí. Public publish ở S03 là quyết định biên tập thủ công,
chưa có quy trình đề xuất/duyệt nhiều phiên bản. API list hiện giới hạn 50 mục;
phân trang/lọc catalog thuộc các bước giao diện tiếp theo.

Theo AGENTS.md và kế hoạch gated, không code S04 cho tới khi chủ dự án cho phép rõ ràng.
