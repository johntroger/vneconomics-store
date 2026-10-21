# Vneconomics Store

Dự án riêng cho https://store.vneconomics.com/.

## Trạng thái

- WordPress Playground, PHP 8.3, SQLite; chưa phải bản sao dữ liệu/plugin/theme trên hosting.
- Đã có prototype S02, plugin dữ liệu/trạng thái/bản sửa S05, theme nền/trang chủ S06, danh mục/thẻ S07, trang chi tiết S08 và tìm/lọc S09 (PASS kỹ thuật local).
- Theme/plugin chưa cài vào database local đang dùng hoặc đưa lên hosting.
- Repository riêng tư: https://github.com/johntroger/vneconomics-store

## Chạy local

~~~powershell
npm ci
npm run dev
~~~

Mở http://127.0.0.1:9400. Dừng bằng Ctrl+C.
Database local giữ ở .local/site; runtime WordPress ở .local/home. Không đưa hai
thư mục này lên GitHub, không xóa database như file tạm. Lệnh dev mở site local
hiện có, không tự kích hoạt theme/plugin hoặc nạp dữ liệu mẫu.

## Kiểm thử

~~~powershell
npm test
npm run test:revisions
npm run test:theme
npm run test:catalog
npm run test:catalog-regression
npm run test:detail
npm run test:detail-catalog-regression
npm run test:detail-home-regression
npm run test:search
npm run test:search-catalog-regression
npm run test:search-detail-regression
npm run test:search-home-regression
~~~

Chạy từng lệnh, không song song. npm test kiểm tra baseline hai boot; test:revisions
kiểm tra S03–S05; test:theme khởi động fixture riêng với plugin/theme và dữ liệu
QA để kiểm tra home, responsive, liên kết, bàn phím, JS lỗi, snapshot và state.

test:catalog kiểm tra taxonomy, counts, phân trang và thẻ. test:catalog-regression
chạy lại S06 trên theme mới, ghi riêng tại docs/acceptance/S07/S06-regression.

test:detail kiểm tra single resource, điều kiện/nguồn/evidence/preview và responsive.
Hai lệnh test:detail-*-regression ghi riêng bằng chứng hồi quy S07/S06 vào hồ sơ S08.

Mọi runner qua scripts/run-clean.mjs, đóng browser/server trước khi dọn fixture
và cache mới tạo, kể cả khi thất bại. Giữ bằng chứng ở docs/acceptance.
Playwright Node sẵn trong runtime Codex và Microsoft Edge được dùng cho kiểm thử UI.
SQLite/PHP WebAssembly không thay thế kiểm thử PHP/MySQL/cache/plugin trên hosting.

## Quy trình phát hành

Local → kiểm thử → GitHub → Plesk webhook → thư mục mã tùy chỉnh.
Chi tiết: [plesk-setup.md](docs/plesk-setup.md).
Không đưa database, uploads, wp-config.php, khóa bí mật hoặc WordPress core vào
nhánh triển khai. release chỉ nhận payload đã kiểm thử và được duyệt triển khai.

## Tiến độ theo bước

[Báo cáo S05](docs/acceptance/S05-revisions-and-preview.vi.md) và
[báo cáo S06](docs/acceptance/S06-theme-and-home.vi.md) (59 điểm kiểm tra PASS local).
Theme: [themes/vibelab](themes/vibelab/README.md).
Phạm vi và quyền từng bước theo [kế hoạch gated](docs/implementation-plan-gated.vi.md).
S07: [báo cáo nghiệm thu](docs/acceptance/S07-catalog-and-cards.vi.md) — 44 điểm UI/HTTP,
23 kiểm tra fixture, hồi quy S06 59 điểm PASS local.
S08: [báo cáo nghiệm thu](docs/acceptance/S08-resource-detail.vi.md) — 54 điểm UI/HTTP,
19 kiểm tra fixture; hồi quy S07 44/23 và S06 59 PASS. Chủ dự án đã cho phép S09.

S09: [báo cáo nghiệm thu](docs/acceptance/S09-search-and-filters.vi.md) — 74 kiểm tra,
28 fixture và 20 truy vấn; hồi quy S07 46/23, S08 55/19, S06 59 PASS.
Dừng chờ phê duyệt S10. Chưa deploy hosting.
