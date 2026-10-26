# Kiểm chứng thiết lập local

Ngày thực hiện: 2026-10-17 (Asia/Saigon).

- WordPress Playground CLI: 3.1.58, WordPress: 7.1.3, PHP: 8.3.
- npm test: PASS trên Windows với hai lần boot dùng cùng database fixture.
- Trang chủ, wp-login.php và REST API trả HTTP 200 ở cả hai lần.
- Giá trị vne_local_persistence_probe được ghi ở lần đầu, đọc lại đúng ở lần sau.
- Database SQLite nằm trong thư mục site đã mount, không nằm trong runtime tạm.
- Server được đóng trước khi bộ chạy dọn fixture và cache của lần chạy.
- Chưa có giao diện tùy chỉnh hoặc kiểm thử nghiệp vụ cửa hàng.
- Chưa kiểm thử hosting, webhook hoặc MySQL/MariaDB.

Một lần thử đầu thất bại do database không được lưu ở đường dẫn mong đợi.
Đã sửa bằng cấu hình rõ DB_DIR/DB_FILE và kiểm thử lại thành công.

## S01 — xác nhận lại baseline ngày 19/10/2026

Chủ dự án đã cho phép S01. Sau sửa workers 2 -> 6 theo khuyến nghị CLI, npm test
PASS hai lần boot cùng fixture, home/login/REST 200 và option tồn tại sau restart.
Lần chạy đầu bị dừng chưa hoàn tất, wrapper vẫn cleanup; lần cuối exit 0 và không
còn cảnh báo worker. Đã xác nhận hash DB/config local không đổi, fixture/cache/lock
đã dọn, port 19400 và smoke process đóng. Có deadline smoke 300 giây.
Chi tiết và giới hạn: [S01-local-baseline.vi.md](acceptance/S01-local-baseline.vi.md).
Chưa bắt đầu S02; kết quả này không xác nhận UI/nghiệp vụ hoặc PHP/MySQL hosting.
