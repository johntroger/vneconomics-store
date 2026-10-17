# Vneconomics Store

Dự án riêng cho https://store.vneconomics.com/.

## Trạng thái

- Môi trường phát triển mới bằng WordPress Playground, PHP 8.3, SQLite.
- Đây chưa phải bản sao dữ liệu, plugin hay theme của website hiện tại.
- Chưa có giao diện tùy chỉnh, chưa kết nối Plesk, chưa triển khai hosting.
- Repository riêng tư: https://github.com/johntroger/vneconomics-store

## Chạy local

```powershell
npm ci
npm run dev
```

Mở http://127.0.0.1:9400. Dừng bằng Ctrl+C.
Dữ liệu local được giữ ở `.local/site`, thành phần WordPress tải về ở `.local/home`.
Các thư mục này không đưa lên GitHub. Không xóa database local như dữ liệu tạm.

## Kiểm thử

```powershell
npm test
```

Kiểm thử khởi động WordPress hai lần với cùng database fixture; kiểm tra trang chủ,
trang đăng nhập và REST API. Bộ chạy `scripts/run-clean.mjs` dọn fixture/cache mới
của lần chạy sau khi server đã đóng, kể cả khi thất bại. Không chạy fixture song song.

SQLite/PHP WebAssembly giúp bắt đầu nhanh. Trước phát hành cần kiểm tra trên staging
PHP/MySQL của hosting, nhất là tính năng WooCommerce và các plugin bên thứ ba.

## Quy trình phát hành dự kiến

Local -> kiểm thử -> GitHub -> Plesk Git webhook -> thư mục mã tùy chỉnh.
Chi tiết: [docs/plesk-setup.md](docs/plesk-setup.md).
Không đưa database, uploads, wp-config.php, khóa bí mật hoặc toàn bộ WordPress core
vào nhánh triển khai. Nhánh phát hành chỉ tạo khi có bộ mã tùy chỉnh đã kiểm thử.
