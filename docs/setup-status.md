# Trạng thái kết nối — 2026-10-17

- Local: C:\Users\trant\CodexProjects\VneconomicsStore
- GitHub private repository: https://github.com/johntroger/vneconomics-store
- Nhánh main đã được đẩy; đây là công cụ phát triển, không phải payload đưa vào web root.
- Đã thêm Deploy key do người dùng lấy từ Plesk, tên Plesk store.vneconomics.com.
- GitHub key ID: 166728434. Đã xác minh read_only = true.
- WordPress 7.1.3 / PHP 8.3 / SQLite đã khởi tạo ở .local/site và đóng server.
- npm test: đạt hai lần boot, các HTTP endpoint và dữ liệu option tồn tại sau restart.
- Bộ chạy đã dọn fixture/cache của các lần chạy. Cache npm riêng của lần cài đã được dọn.
- Ảnh Plesk xác nhận repository đã clone được nhánh main và hiển thị commit; No deployment đang được chọn.
- Đã tạo webhook GitHub cho sự kiện push, active=true, xác minh HTTPS bật; hook ID 699352374. GitHub delivery xác nhận ping và push đều OK, HTTP 204. Push được chấp nhận lúc 11:22:26 ngày 2026-10-17 (Asia/Saigon). Chưa bật triển khai website.
- Chưa có giao diện riêng hoặc nội dung cửa hàng; chưa sửa mã nguồn trên hosting.
- Công cụ trình duyệt chỉ thấy in-app browser trống, không thấy phiên Plesk của người dùng.

Lần tiếp theo: đối chiếu commit mới nhất trên Plesk để xác minh đã pull sau webhook; webhook đã được endpoint chấp nhận nhưng chưa đọc được trạng thái pull bên Plesk. Giữ Disabled. Sau khi có mã giao diện,
chuẩn bị payload và nhánh phát hành riêng, kiểm thử staging rồi mới bật tự động.

## Kiểm tra triển khai vào thư mục tách biệt

- Nhánh release đã tạo độc lập, commit ca6488b.
- Chỉ có connection-check.txt với Status: OK và Revision: connection-v1.
- Script chuẩn bị: node scripts/run-clean.mjs script scripts/prepare-connection-release.mjs.
- Mã công cụ local và dữ liệu WordPress không nằm trong nhánh release.
- Thư mục triển khai dự kiến: /store.vneconomics.com/codex-deploy-check.
- URL cần kiểm chứng sau khi Plesk bật Automatic cho release:
  https://store.vneconomics.com/codex-deploy-check/connection-check.txt
- Người dùng cần chọn release, chọn đúng thư mục riêng và Automatic trong Plesk.
- Chưa xác minh file đã được triển khai; không được coi HTTP 204 webhook là bằng chứng file đã xuất hiện.
