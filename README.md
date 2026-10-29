# Vneconomics Store

Repository public của website https://store.vneconomics.com/.

## Trạng thái hiện hành

| Lớp | Trạng thái |
|---|---|
| Development | Theme v2 2.0.0, plugin header 0.4.3 trong working tree; không suy phiên bản production từ cây local |
| Rebuild candidate | Source `50437bd16eae1912d8cffea093401449786faaea`, CI `40660368997`; đã cài theo R6 |
| Production đã nghiệm thu 29/10/2026 | Payload `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`, theme 2.0.0, plugin 0.4.4, schema 3; [receipt R6](docs/acceptance/R6-rebuild.vi.md) |

Nguồn điều hành: [kế hoạch tái thiết v3](docs/website-rebuild-plan-current.vi.md), [bản đồ tài liệu](docs/current-docs-index.vi.md), [runbook](docs/deployment-runbook.vi.md) và [checklist phát hành](docs/release-checklist.vi.md).

S00–S16 và staging là lịch sử của website hiện tại, không phải menu triển khai website làm lại.


## Chạy local

~~~powershell
npm ci --ignore-scripts
# Chỉ khi clone mới/chưa có .local/site/wp-load.php:
npm run local:init
npm run dev:v2
~~~

Mở http://127.0.0.1:9472. Dừng bằng Ctrl+C trước khi chạy tác vụ có cleanup khác.
Preview v2 giữ database riêng ở `.local/rebuild-v2`, chỉ tạo nội dung mẫu lần đầu.
Sau khi lưu theme/plugin trong nguồn, đợi đồng bộ khoảng 750ms rồi refresh trình duyệt;
chưa có tự reload trang. Không sửa code bằng editor WordPress trong preview.
Mail, HTTP ngoài và cron bị tắt; nội dung mẫu không dùng để phát hành.

`.local/site` và `.local/s13-site` cũ được giữ nguyên. `npm run dev` vẫn mở baseline
ở cổng 9400 khi cần điều tra riêng. Không đưa `.local` lên GitHub hoặc xóa database
như file tạm. Không cài lại thư viện mỗi lần sửa CSS;
chạy `npm ci --ignore-scripts` khi thiếu dependency hoặc lockfile thay đổi.

## Kiểm thử

Chọn một module theo thay đổi, không chạy toàn bộ bảng cho mỗi chỉnh sửa.

| Thay đổi | Kiểm tra local |
|---|---|
| Tài liệu | `git diff --check` và link/ref bị tác động |
| Homepage CSS/CTA | `npm run test:v2-smoke -- home` |
| Catalog/detail v2 | `npm run test:v2-smoke -- discovery` và test logic bị ảnh hưởng |
| Search v2 | `npm run test:v2-smoke -- search` và test logic/filter bị ảnh hưởng |
| Guide v2 | `npm run test:v2-smoke -- guides` và test logic bị ảnh hưởng |
| Admin/importer/schema | Test quyền/import/migration đúng phần thay đổi; smoke UI không thay thế các kiểm tra này |
| Tokens/component dùng chung | Smoke các module trực tiếp bị ảnh hưởng |
| Runtime preview/đồng bộ | `npm run test:v2-preview` kiểm persistence, sync và failure |
| JavaScript/tooling | `npm run test:ci-fast` kiểm cú pháp; test hành vi đúng module nếu đổi logic |
| Runtime/bootstrap/persistence | `npm run test:fast` — hai boot WordPress, không phải smoke v2 một trang |

Module UI phải có smoke hành trình liên quan. Không tự chạy thêm smoke hai boot
khi module đã kiểm runtime/hành trình và không đổi bootstrap/persistence.
Smoke mới kiểm homepage và một hành trình được chọn trên desktop/mobile; không thay
unit/integration hoặc full gate release. Nó dùng preview local đã giữ dữ liệu, không
seed lại khi có marker. Lần đầu cần dữ liệu mẫu; nếu chủ dự án xóa/sửa mẫu đó, smoke
có thể FAIL và không tự khôi phục nội dung để vượt test. Mỗi lượt có evidence riêng
ở `docs/acceptance/R72-preview/<run-id>/`.

Runner dùng Playwright Node và Microsoft Edge đã có sẵn. Ngoài môi trường Codex,
đặt `VNE_PREVIEW_PLAYWRIGHT` tới file `index.mjs` của Playwright đã cài.
Các runner R2–R4 dùng marker cũ chỉ còn phục vụ tái tạo gate tương ứng, không dùng
chứng nhận source hiện tại. Xem [R7.1](docs/acceptance/R71-process.vi.md).

Các alias S02–S16/staging trong package.json được giữ để tái tạo lịch sử,
không thuộc menu mặc định. Full URL/privacy, build payload và backup theo cấp
thay đổi chỉ chạy khi tới gate release được duyệt.

Mọi runner qua scripts/run-clean.mjs, đóng browser/server trước khi dọn fixture
và cache mới tạo, kể cả khi thất bại. Giữ bằng chứng ở docs/acceptance.
Playwright Node sẵn trong runtime Codex và Microsoft Edge được dùng cho kiểm thử UI.
SQLite/PHP WebAssembly không thay thế kiểm thử PHP/MySQL/cache/plugin trên hosting.

## Quy trình phát hành

Fast CI kiểm PR; bản sửa R7.3 thêm hủy lượt fast cũ cùng PR và chuyển build
R52 sang gọi thủ công với exact source đã pin. Các sửa workflow cần được review
qua PR trước khi áp dụng vào default branch; xem [R7.3](docs/acceptance/R73-ci.vi.md). Builder R52 là lịch sử,
không dùng phát hành source mới sau R6 khi chưa có profile/baseline được duyệt.

Đường candidate CSS-only theo baseline R6 được mô tả tại [hợp đồng profile](docs/rebuild/R78-css-profile.vi.md).
Profile mới giữ nguyên plugin, chuẩn bị theme/rollback đúng R6 và còn cần review/CI/gate
production. Nó không tự cập nhật website và không dùng cho thay đổi PHP, nội dung hoặc schema.

`local → GitHub/CI → payload GitHub → Plesk private inbox → verify → production`.

Không dùng staging cho lượt mới. Production Plesk giữ Manual/no post-action; không upload ZIP/code trực tiếp từ local. Build, push, CI PASS hoặc merge không tự cấp quyền production. Nội dung thường ngày như bài viết hoặc CTA đã cấu hình đi qua WordPress Draft → Preview → Publish và không cần phát hành lại code.

## Lịch sử S00–S16

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
