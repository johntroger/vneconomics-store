# Kế hoạch hiện hành tái thiết Vneconomics Store — v3

Ngày cập nhật: 28/10/2026
Trạng thái: R0–R5.1 đã được duyệt; R5.2 full gate/CI/payload candidate PASS, chờ chủ dự án duyệt R6; chưa cấp quyền merge hoặc production

Đây là kế hoạch điều hành duy nhất cho website làm lại. `website-rebuild-master-plan-2026-10-27.vi.md` và S00–S16 là lịch sử, không phải checklist thực thi. Xem [bản đồ tài liệu hiện hành](current-docs-index.vi.md).

## 1. Quyết định đã chốt

1. Giữ WordPress Hosting v5/Plesk hiện tại; chưa chuyển Cloud Server hoặc Vibe Host.
2. Không dùng staging. Đường phát hành là **local → GitHub/CI → payload `release-production` → private inbox Plesk production → gate production → hậu kiểm**.
3. Plesk API/MCP và SSH/SFTP bằng SSH key không khả dụng. Chủ dự án đăng nhập; Codex thao tác Plesk qua browser khi đến gate được duyệt.
4. GitHub public lưu source, test, migration và payload tái tạo được. Không lưu secret, database, uploads, backup hoặc dữ liệu riêng.
5. MariaDB, uploads, `.env`, logs và backup nằm trên Plesk hoặc kho backup riêng.
6. Giai đoạn tái thiết đầu tiên **giữ WordPress làm CMS/backend dữ liệu**, xây lại giao diện và trải nghiệm bằng theme/plugin có kiểm soát. Không viết lại ngay authentication, CMS, importer và toàn bộ database bằng Laravel/custom PHP.
7. Chỉ đánh giá bỏ WordPress sau khi giao diện mới ổn định và có yêu cầu mà backend hiện tại thực sự không đáp ứng.
8. Vòng lặp local dùng ma trận kiểm thử nhanh trong `AGENTS.md`; full regression và hồ sơ production chỉ chạy ở gate phát hành.

## 1A. Nguồn sự thật và trạng thái phiên bản

Không dùng một con số “phiên bản hiện tại” chung cho development và production.

| Trạng thái | Nguồn sự thật | Trạng thái tại 27/10/2026 |
|---|---|---|
| Development | Working tree/nhánh đang làm; chưa phải bằng chứng phát hành | Theme 0.7.3, plugin 0.4.3, schema 3 trên nhánh `codex/github-stars-u2` tại HEAD `7b7ae3454512576e676d43ebb10f274920ee2a34`, có thay đổi chưa commit |
| Rebuild candidate | Manifest R5, source SHA, CI run và payload SHA | Chưa có candidate v3 |
| Production | Receipt U4 ngày 27/10/2026 | Source `7b7ae3454512576e676d43ebb10f274920ee2a34`, payload `80729d511b2f2f168a96a495a4e5cadc93377759`, theme 0.7.3, plugin 0.4.3, schema 3; xem `acceptance/U4-github-stars.vi.md` |

Nếu working tree, README, manifest và receipt khác nhau, production được xác định bằng receipt/runbook đã nghiệm thu; source mới hơn không tự trở thành production.

## 2. Vì sao giữ backend hiện tại trong giai đoạn đầu

Website hiện đã có dữ liệu, WordPress Admin, quyền, nội dung, URL, sitemap và đường GitHub → Plesk hoạt động. Viết lại toàn bộ backend ngay sẽ phải xây lại đăng nhập, quản trị, media, import, revision, phân quyền, SEO và migration trước khi người dùng thấy giao diện mới.

Phương án hiện hành tách hai mục tiêu:

- **Tái thiết trải nghiệm trước:** theme v2, điều hướng, danh mục, chi tiết, tìm kiếm và trang hướng dẫn.
- **Thay backend sau nếu cần:** chỉ mở khi có danh sách hạn chế cụ thể, phương án migration và lợi ích lớn hơn chi phí/rủi ro.

Giữ WordPress không có nghĩa phải thiết kế trực tiếp trong WordPress Admin. Codex vẫn phát triển local, kiểm thử, push GitHub và phát hành bằng payload.

## 3. Kiến trúc mục tiêu giai đoạn 1

```text
Local
├── WordPress fixture riêng
├── theme v2: giao diện, template, CSS/JS
├── plugin nghiệp vụ: dữ liệu, validation, admin/importer
└── test theo module
       │
       ▼
GitHub public
├── source + lockfile
├── fast CI / release CI
├── manifest + hash
└── release-production payload
       │ R6: Manual Pull/Deploy qua browser
       ▼
Plesk production
├── private Git clone
├── /deploy-inbox/production
├── WordPress + MariaDB
├── uploads/.env/logs ngoài Git
└── backup + rollback package
```

Node chỉ dùng local/CI để build asset; production chạy PHP 8.3/MariaDB hiện có. Mã mới không phụ thuộc tiến trình Node thường trực.

Theme chỉ trình bày và đọc dữ liệu qua hợp đồng của plugin/WordPress. Validation, quyền, schema, migration, importer, journal và mọi ghi dữ liệu nằm trong plugin; không đặt logic ghi dữ liệu vào theme. WordPress/PHP/Node/dependency được pin bằng source profile và lockfile ở R5; fixture local không chứa dữ liệu production.

Đây là kiến trúc **modular monolith**, không phải microservices/headless SPA. Plugin được tách dần theo các lớp Domain (resource/guide/taxonomy/publication), Application (search/import/review/publish) và Infrastructure (WordPress repository/cache/admin/REST). Không tái cấu trúc toàn bộ plugin một lần; module mới được tách theo lát cắt đang xây.

## 4. Ranh giới code và dữ liệu

| GitHub | Plesk/kho riêng |
|---|---|
| Theme/plugin source, test, schema/migration | MariaDB production |
| Cấu hình mẫu không secret | `.env`, key, token, mật khẩu |
| Manifest, allowlist, hash, payload code | Uploads, ảnh, tài liệu dung lượng lớn |
| Fixture QA nhỏ và dữ liệu giả | Nội dung thật, logs, cache runtime |
| Tài liệu vận hành công khai đã loại bí mật | Backup DB/uploads/config và receipt riêng |

Dữ liệu thường xuyên được thêm/sửa qua WordPress Admin hoặc importer của ứng dụng. Không dùng raw SQL/phpMyAdmin cho vận hành thường ngày. File dữ liệu lớn đi qua uploader/importer hoặc private import inbox được duyệt; code không đi qua FTP/File Manager.

- Một bài viết hoặc CTA đã cấu hình: Draft → Preview → duyệt → Publish; không cần GitHub.
- Component/chức năng mới: local → GitHub/CI → payload → Plesk.
- Lô dữ liệu lớn: private import inbox → dry-run/diff → duyệt → importer có journal → readback.

## 5. Vòng lặp phát triển nhanh

1. Codex làm đúng một phạm vi đã duyệt trên nhánh `codex/<ten-cong-viec>`.
2. Chạy local preview/hot reload khi có thể.
3. Chạy kiểm thử theo ma trận dưới đây. `npm run test:fast` dùng khi thay CSS/template/logic/admin/schema và smoke WordPress có liên quan; tài liệu thuần không chạy application suite.
4. Với thay đổi thẩm mỹ, chủ dự án xem preview/ảnh trước khi đóng bước.
5. Chỉ khi chuẩn bị PR/release mới chạy CI rộng hơn và build payload.
6. Một bước chỉ có một báo cáo ngắn; dùng liên kết tới bằng chứng cũ, không sao chép lại cây evidence.

### Ma trận kiểm thử

| Thay đổi | Local bắt buộc | Chỉ tại release |
|---|---|---|
| Tài liệu/quy tắc | `git diff --check`, link/ref liên quan | Không có application suite |
| CSS/template | UI/module liên quan + smoke | URL/canonical/cache/rollback liên quan |
| Logic PHP/JS | Unit/integration module + smoke | Release CI và postflight |
| Admin/importer | Validation, quyền, idempotency, fixture | Backup và readback dữ liệu thật nếu được duyệt |
| Schema/migration | Migration/rollback local, dữ liệu biên | Backup mới, baseline, journal và production approval |

## 6. Đường phát hành production-only

### Giai đoạn đầu: bán tự động và có giám sát

1. Chốt source SHA và phạm vi release.
2. GitHub Actions kiểm thử/build đúng SHA và tạo Actions artifact cùng payload candidate bất biến trên ref chưa được Plesk production theo dõi. Actions artifact là bằng chứng CI, không phải nguồn Plesk triển khai.
3. Chủ dự án duyệt source SHA, CI run, payload candidate, phạm vi và thời điểm. Chỉ workflow/helper trusted trong phạm vi approval mới được fast-forward `release-production`; không force-push.
4. Chủ dự án đăng nhập Plesk; Codex xác nhận repository production vẫn Manual, không post-action và target là `/var/www/vhosts/vneconomics.com/deploy-inbox/production`, sau đó bấm **Pull now** rồi **Deploy now** vào private inbox.
5. Codex đối chiếu GitHub `release-production`, Plesk HEAD, source/payload SHA, manifest, allowlist và từng hash. Inbox chưa active và nằm ngoài document root.
6. Tạo backup theo cấp thay đổi; dùng ZIP/theme/plugin chỉ từ payload GitHub đã kiểm chứng.
7. Thực hiện đúng thao tác đã duyệt, rồi kiểm runtime, URL, dữ liệu và logs.
8. Lỗi hoặc trạng thái không rõ: dừng, inspect và giữ hiện trạng; không retry mù hoặc tự restore DB.
9. Ghi receipt ngắn và cleanup đúng fixture/cache của lượt chạy.

Không upload ZIP/code trực tiếp từ local. Plesk hiện giữ Manual và không bật post-deploy action.

### Mức tự động hóa thực tế

- Kết nối Automatic/webhook đã được chứng minh trên repository connection-check lịch sử, nhưng repository production hiện hành vẫn Manual. Không giả định production webhook đang hoạt động.
- Với giới hạn Shared Hosting hiện tại, promote/backup/migration/hậu kiểm production vẫn cần phiên browser ở giai đoạn đầu.
- Không tuyên bố “hoàn toàn không cần đăng nhập Plesk” khi chưa có receiver/post-action đã kiểm thử.
- R7 chỉ được tự động hóa đường **private inbox → verify → health/rollback gate → promote** đã nghiệm thu. Không cấu hình Plesk Git Automatic deploy thẳng vào webroot để bỏ qua private inbox hoặc approval.

## 7. Cấp thay đổi và backup

| Cấp | Ví dụ | Gate |
|---|---|---|
| A — code-only | CSS, template, JS/PHP được chứng minh không ghi persisted state | Targeted test, CI, manifest/hash, immutable previous code/rollback package, health/postflight |
| B — data/schema tương thích | Thêm field/index, importer/upsert có journal | Dry-run, backup DB/file bị tác động, idempotency, readback |
| C — phá hủy/khó đảo | Xóa/đổi kiểu cột, hard-delete, restore DB, đổi quyền/automation | Approval riêng, full backup/offsite, phương án mất dữ liệu và rollback rõ |

Code-only không mặc định tạo full database backup mới nếu static analysis/test xác nhận không ghi persisted state và immutable previous code/rollback package còn đủ hash. Cấp B cần backup DB/file đúng phạm vi, tạo trong cửa sổ release, complete và có hash/CRC/manifest; cấp C cần full backup cùng một bản ngoài hosting và kế hoạch restore được duyệt. Xóa backup là bước riêng, dùng exact ID; không Select All, wildcard hoặc xóa chỉ theo tuổi.

## 8. Các bước tái thiết

Mỗi hàng là một gate độc lập. PASS không tự mở bước tiếp theo.

| Gate | Phạm vi | Kiểm chứng/đầu ra |
|---|---|---|
| **R0 — Tối ưu quy trình** | Ma trận test nhanh, loại file chắc chắn hết dùng, giữ evidence/backup | Đã PASS tại `acceptance/O1-process-optimization.vi.md` |
| **R0A — Kế hoạch v3 và nguồn sự thật** | Kế hoạch, README, bản đồ tài liệu; tách development/candidate/production | Đã PASS tại `acceptance/R0A-rebuild-plan-v3.vi.md`; chỉ tài liệu |
| **R0B — Fast CI và release workflow v2** | Tách `pr-fast`, `release-candidate`, `promote-production`; bỏ chọn pipeline bằng phiên bản CSS và S14 khỏi PR mặc định; pin action/dependency/retention | PASS tại `acceptance/R0B-fast-ci.vi.md`; PR #3 fast check thật đạt, không deploy |
| **R1 — Product, nội dung và cấu trúc thông tin** | Inventory URL; giữ/đổi/301/loại; ba hành trình, sitemap, content model, dữ liệu/media, baseline SEO/hiệu năng và KPI | PASS tại `acceptance/R1-product-content.vi.md`; chủ dự án duyệt ngày 28/10/2026; chỉ read-only/local |
| **R2 — Architecture foundation và design system** | Theme v2; hợp đồng theme/plugin; release marker; tokens và component nền; test skeleton bốn tầng | PASS tại `acceptance/R2-rebuild.vi.md`; 36 kiểm tra đạt và chủ dự án duyệt preview ngày 28/10/2026 |
| **R3.1 — Khám phá** | Homepage → catalog → resource detail | PASS tại `acceptance/R31-rebuild.vi.md`; 46 kiểm tra đạt và chủ dự án duyệt preview ngày 28/10/2026 |
| **R3.2 — Tìm kiếm** | Search → filter → result → detail | PASS tại `acceptance/R32-rebuild.vi.md`; 41 kiểm tra đạt và chủ dự án duyệt preview ngày 28/10/2026 |
| **R3.3 — Hướng dẫn** | Guide list → detail → related resources | PASS 37 kiểm tra tại `acceptance/R33-rebuild.vi.md`; chủ dự án duyệt preview ngày 28/10/2026 |
| **R4 — Quản trị và dữ liệu mở rộng** | Chỉ bổ sung field/admin/importer R3 chứng minh là cần | PASS 10 kiểm tra tại `acceptance/R4-rebuild.vi.md`; sửa selector dependency; giữ schema3; chủ dự án duyệt ngày 28/10/2026 |
| **R5.1 — Hợp đồng promote/rollback** | Chốt cài đặt, allowlist, atomic switch hoặc maintenance window, rollback từng component, marker/health/lock/disk | PASS 29 kiểm tra tại `acceptance/R51-rebuild.vi.md`; chủ dự án duyệt ngày 28/10/2026; native ZIP/candidate thuộc R5.2 |
| **R5.2 — Release candidate production** | Exact SHA trên runner sạch; build theme/plugin/payload; manifest/allowlist/hash/rollback | PASS 13 native + 13 URL probes + 90 browser + 126 URL/privacy; CI và payload candidate đạt; xem `acceptance/R52-rebuild.vi.md`; chờ duyệt R6 |
| **R6 — Cutover production** | Backup theo cấp, Plesk private inbox, deploy production-only, hậu kiểm | URL/data/runtime/logs đạt; rollback sẵn; receipt/cleanup |
| **R7 — Tối ưu vận hành** | Đo bottleneck thật; cache/performance; cân nhắc Automatic cấp A | Chỉ bật automation sau approval và thử failure/rollback |

Không tạo gate staging. “Release chưa active” nếu có chỉ là thư mục chuẩn bị trong production, không phục vụ công khai và không thay approval production.

## 9. Việc loại khỏi phạm vi giai đoạn đầu

- Không viết lại toàn bộ backend hoặc chuyển framework chỉ vì muốn “không dùng WordPress”.
- Không chuyển Cloud Server/Vibe Host khi Git/Plesk hiện tại còn đáp ứng.
- Không tích hợp Plesk MCP/API/SSH key vì nhà cung cấp đã xác nhận không hỗ trợ gói hiện tại.
- Không chạy full regression cho mỗi chỉnh sửa nhỏ.
- Không tạo lại hồ sơ S00–S16 hoặc sao chép evidence lịch sử.
- Không bật scheduler, collector, AI trả phí, post-deploy action hoặc Automatic production từ quyền code local.
- Không xóa staging, backup hoặc dữ liệu lịch sử chỉ vì quy trình mới không dùng staging.

Migration cấp B mặc định dùng chuỗi **expand → code tương thích cũ/mới → migrate có journal → readback → contract ở release khác**. Không vừa thêm schema mới vừa xóa đường rollback trong cùng một release.

## 10. Tiêu chí hoàn tất giai đoạn tái thiết

- Thiết kế/chỉnh sửa local không cần upload hoặc đăng nhập Plesk.
- Các hành trình chính được chủ dự án duyệt trên desktop/mobile.
- URL, canonical, robots, sitemap và nội dung được chọn giữ đúng sau cutover.
- Source/payload/manifest SHA truy vết được; code production chỉ đến từ GitHub.
- Database/uploads không nằm trong Git và không bị thay đổi ngoài phạm vi duyệt.
- Code cấp A có rollback và hậu kiểm rõ; cấp B/C có backup/journal tương ứng.
- Vòng lặp local chỉ chạy test liên quan; full gate chỉ chạy khi phát hành.
- Cleanup đạt và không tạo thêm cây evidence trùng lặp.

## 11. Guard phát hành tối thiểu

- PR không tin cậy chỉ có `contents: read`, không nhận production secret và không được cập nhật nhánh payload. Action/dependency được pin hoặc lock theo profile R5.
- Dừng trước ghi nếu sai repo/branch/target, SHA/manifest/hash/allowlist, baseline, dung lượng, lock hoặc có writer khác. Toast thành công không thay đối chiếu.
- Approval thuộc chủ dự án và phải ghi source SHA, CI run, payload candidate/SHA, cấp A/B/C, đích, phạm vi, backup/rollback áp dụng và thời điểm.
- Receipt tối thiểu ghi source SHA, CI run, payload SHA, manifest SHA256, Plesk HEAD/target, baseline, backup hoặc rollback artifact, thao tác, postflight và cleanup.
- Nếu code cấp A ghi dữ liệu ngoài dự kiến hoặc migration B/C ở trạng thái chưa rõ, dừng/khóa ghi và inspect; không tự restore DB hoặc retry.
- R5 pin retention cụ thể cho Actions artifact, inbox candidate, release code cũ và backup. Không xóa artifact/backup đang là đường rollback duy nhất.

## 12. Điểm dừng hiện tại

R0B đã hoàn tất trên PR xếp tầng #3 với base `codex/github-stars-u2`; fast check thật đạt và không deploy. PR chưa merge; candidate/promote chưa dispatch.

R1 đã PASS với [hợp đồng sản phẩm/nội dung](rebuild/R1-product-content-contract.vi.md), [ledger URL](rebuild/R1-url-disposition.vi.md) và [báo cáo nghiệm thu](acceptance/R1-product-content.vi.md); chủ dự án duyệt ngày 28/10/2026.

R2 đã PASS với theme foundation local, design system, contract/test skeleton và 36 kiểm tra đạt; chủ dự án duyệt hai preview desktop/mobile ngày 28/10/2026. Xem [báo cáo R2](acceptance/R2-rebuild.vi.md).

R3.1 đã PASS với hành trình homepage → catalog/category → resource detail, canonical/metadata và 46 kiểm tra đạt; chủ dự án duyệt bốn preview ngày 28/10/2026. Xem [báo cáo R3.1](acceptance/R31-rebuild.vi.md).

R3.2 đã PASS với search/filter/result/detail, empty/error/pagination/mobile và 41 kiểm tra đạt; chủ dự án duyệt bốn preview ngày 28/10/2026. Xem [hợp đồng R3.2](rebuild/R32-search-contract.vi.md) và [báo cáo R3.2](acceptance/R32-rebuild.vi.md). Không có quyền mặc định tiếp tục R3.3, merge main hoặc production.

Bước có thể xin duyệt tiếp theo:

> **Xin duyệt R6 riêng theo hồ sơ R5.2.** Xem [nghiệm thu R5.2 và phạm vi R6](acceptance/R52-rebuild.vi.md). Source `50437bd16eae1912d8cffea093401449786faaea`, CI 40660368997, payload `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`, full gate/byte-match/cleanup PASS. Candidate không phải ref Plesk đang theo dõi; chưa deploy hoặc merge main.
