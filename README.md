# Vneconomics Store

Dự án riêng cho https://store.vneconomics.com/.

## Trạng thái

- Môi trường phát triển mới bằng WordPress Playground, PHP 8.3, SQLite.
- Đây chưa phải bản sao dữ liệu, plugin hay theme của website hiện tại.
- Đã có prototype tĩnh S02 và plugin dữ liệu S03 đạt kiểm thử local; chưa phát hành theme/plugin lên hosting.
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
PHP/MySQL của hosting, bao gồm plugin/theme tùy chỉnh và các plugin bên thứ ba.

## Quy trình phát hành dự kiến

Local -> kiểm thử -> GitHub -> Plesk Git webhook -> thư mục mã tùy chỉnh.
Chi tiết: [docs/plesk-setup.md](docs/plesk-setup.md).
Không đưa database, uploads, wp-config.php, khóa bí mật hoặc toàn bộ WordPress core
vào nhánh triển khai. Nhánh release chỉ nhận payload đã kiểm thử và được duyệt triển khai.

## Tiến độ theo bước

S03 đã đạt kiểm thử local; xem [báo cáo S03](docs/acceptance/S03-library-data.vi.md).
Chạy kiểm thử plugin: npm run test:library. Plugin chưa cài vào database local đang dùng.
Chờ chủ dự án cho phép S04 theo [kế hoạch gated](docs/implementation-plan-gated.vi.md).
