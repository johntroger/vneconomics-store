# Vneconomics Store

> Hiện hành26/10/2026: R1–R5 đã tiếp nhận baseline qua local → GitHub → Plesk; R6 chốt hồ sơ theo phê duyệt riêng. Xem [runbook](docs/deployment-runbook.vi.md), [checklist](docs/release-checklist.vi.md) và [R6](docs/acceptance/R6-closeout.vi.md). Source đang phát hành4266b71/payload dc4af29, theme0.7.2/plugin0.4.2/schema3. Các mục trạng thái S13 bên dưới là lịch sử local, không phải hướng dẫn phát hành hiện hành.

Dự án riêng cho https://store.vneconomics.com/.

## Trạng thái

- WordPress Playground, PHP 8.3, SQLite; chưa phải bản sao dữ liệu/plugin/theme trên hosting.
- Đã có prototype S02, plugin dữ liệu/trạng thái/bản sửa S05, theme nền/trang chủ S06, danh mục/thẻ S07, trang chi tiết S08 và tìm/lọc S09 (PASS kỹ thuật local).
- Baseline .local/site chưa kích hoạt theme/plugin; bản thử S13 dùng database riêng. Chưa đưa code thư viện lên hosting.
- Repository riêng tư: https://github.com/johntroger/vneconomics-store


## Bản thử S13

`npm run dev:s13` mở thư viện tích hợp tại http://127.0.0.1:9430/ với database riêng .local/s13-site.
Lệnh tạo bản thử lần đầu; những lần sau không seed đè nội dung đã sửa. Bản này noindex, không gửi email, không cần API key để đọc bài.
.local/site là baseline gốc, vẫn được giữ nguyên; không đưa .local lên Git hoặc hosting.
Chỉ chạy sau khi các bộ fixture đã kết thúc vì cùng dùng khóa run-clean.

S13 dùng plugin0.4.2, theme0.7.0; 122 kiểm tra tích hợp và sáu bộ hồi quy S05/S06/S09/S10/S11/S12 đạt; hậu kiểm hash/bảo toàn/cleanup đạt. Budget lab chưa đạt đủ: native có một lượt LCP3016ms vượt2500ms; WASM chậm hơn. Chưa nghiệm thu S13 hoặc cho phép S14.
Chủ dự án trực tiếp thử và phản hồi theo [hướng dẫn](docs/S13-owner-review.vi.md).
Xem [báo cáo](docs/acceptance/S13-local-integrated-acceptance.vi.md) và [hợp đồng nghiệm thu](docs/S13-local-acceptance-contract.vi.md).

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
S10–S12 đã hoàn tất kỹ thuật local; S13 còn chờ phản hồi trải nghiệm.
S14 được cho phép riêng ngày 23/10/2026 và PASS local: [báo cáo](docs/acceptance/S14-release-and-dry-run.vi.md),
[checklist phát hành/restore](docs/S14-release-checklist.vi.md). Gói từ SHA `594ccd9` nằm trong
`artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752/`.
Chưa deploy hoặc push nhánh phát hành; S15 cần duyệt riêng.
