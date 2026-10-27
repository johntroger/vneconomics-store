# Kế hoạch tổng thể làm lại Vneconomics Store

> **Đã được thay thế ngày 27/10/2026.** Kế hoạch hiện hành là [website-rebuild-plan-current.vi.md](website-rebuild-plan-current.vi.md). Nội dung bên dưới được giữ làm lịch sử quyết định và không dùng làm checklist thực thi.

Ngày lập: 27/10/2026

Trạng thái: đã chốt production-only, chưa cấp quyền triển khai production

Mục tiêu chính: rút ngắn vòng lặp sửa website từ quy trình nhiều thao tác thủ công thành **Codex sửa local → kiểm thử → GitHub Actions → Plesk tự nhận và phát hành có guard**, trong khi dữ liệu vận hành tiếp tục nằm ngoài Git.

Quyết định vận hành: **không dùng staging**. Mọi release đi theo local → GitHub/CI → payload `release-production` → private inbox production → gate production → hậu kiểm. Việc chuẩn bị release chưa active trong production không tạo thành một môi trường staging và không cho phép bỏ backup/verify/rollback.

Kênh truy cập hiện hành là browser-assisted; API/MCP không khả dụng trên gói hiện tại. Chi tiết tại [kế hoạch truy cập Plesk](plesk-two-access-paths-plan-2026-10-27.vi.md).

## 1. Kết quả cần đạt

1. Sửa giao diện và xem kết quả ngay ở local, không cần đăng nhập hoặc upload lên Plesk để thử thiết kế.
2. Source code, migration và cấu hình mẫu nằm trên GitHub public; không đưa secret, database, uploads, backup hoặc dữ liệu riêng lên Git.
3. GitHub Actions kiểm thử và build từ đúng commit SHA. Chỉ payload đạt kiểm tra mới được đưa vào nhánh `release-production`.
4. Plesk nhận payload tự động qua deploy key đọc và webhook, kiểm manifest/hash rồi phát hành theo thư mục release bất biến.
5. Deploy code thông thường không cần thao tác File Manager, FTP, ZIP local hoặc đăng nhập Plesk.
6. MariaDB, uploads, `.env`, logs và backup nằm ở Plesk hoặc kho backup riêng.
7. Có health check và rollback nhanh về release trước. Migration database có backup và guard riêng.
8. Giữ URL, nội dung, metadata SEO và dữ liệu hợp lệ của website hiện tại khi thay WordPress.

### Chỉ số nghiệm thu mục tiêu

- Local: sau khi dev server đã chạy, thay đổi giao diện không cần thao tác Plesk.
- CI: một source SHA tạo ra một payload xác định, tái dựng được và có manifest/hash.
- Phát hành code-only: không upload thủ công và không cần mở Plesk; Plesk chỉ nhận payload từ GitHub.
- Production: chỉ một release được active; release trước còn nguyên để rollback.
- Dữ liệu: số lượng, natural key, slug, URL, nội dung và metadata đã chọn đều được đối chiếu trước/sau chuyển đổi.
- Cleanup: fixture/cache của lượt kiểm được dọn; database, uploads, backup thật và bằng chứng cần giữ không bị xóa.

## 2. Kiến trúc đích đề xuất

### 2.1 Lựa chọn mặc định

Ứng dụng PHP server-rendered theo mô hình monolith, frontend build bằng Vite, database MariaDB trên Plesk. A0 chốt họ kiến trúc/framework sau khi kiểm khả năng Composer/PHP thực tế; A1 mới pin phiên bản chính xác và lockfile. Mặc định đánh giá Laravel trước vì có migration, validation, queue, cache, authentication và test tooling thống nhất.

Node chỉ dùng ở local/GitHub Actions để build CSS/JavaScript; production không cần tiến trình Node chạy thường trực. Phương án này phù hợp hạ tầng PHP 8.3/MariaDB đã được chứng minh và đơn giản hơn vận hành frontend/API tách thành hai ứng dụng.

Nếu A0 xác nhận website chủ yếu là nội dung tĩnh, không cần quản trị và không có chức năng động đáng kể, có thể chọn Astro + PHP API. Không đổi kiến trúc sau A1 nếu chưa có quyết định mới và đánh giá lại ảnh hưởng.

```text
GitHub public
├── app source
├── tests
├── database migrations
├── package/composer lockfiles
├── CI workflow
└── generated release payload (không secret/data)
             │
             ▼ webhook sau CI PASS
Plesk private inbox
├── verify source SHA / payload SHA / manifest / hashes
├── releases/<payload-sha>/
├── current -> releases/<payload-sha>/
└── shared/
    ├── .env
    ├── uploads/
    ├── logs/
    └── runtime cache/
             │
             ▼
MariaDB + backup riêng
```

### 2.2 Ranh giới dữ liệu

| GitHub | Plesk/kho riêng |
|---|---|
| Source, test, migration, schema, seed QA nhỏ | MariaDB production |
| Cấu hình mẫu và tài liệu công khai | `.env`, key, token, mật khẩu |
| Manifest và hash payload | Uploads/ảnh/tài liệu người dùng |
| Lockfile dependency | Logs, cache runtime, queue state |
| Payload code có thể tái tạo | Backup DB/uploads/config |

GitHub không phải nơi backup database. Plesk cũng không nên là bản backup duy nhất: tối thiểu một bản DB/uploads định kỳ phải nằm ngoài cùng máy chủ và ngoài document root.

### 2.3 Cấp phát hành

| Cấp | Ví dụ | Quy tắc |
|---|---|---|
| A — code-only | CSS, template, JS, logic không đổi schema | Có thể tự động hoàn toàn sau CI, verify và health check |
| B — migration tương thích ngược | Thêm bảng/cột nullable/index an toàn | Tự động khi backup mới hợp lệ, migration idempotent và rollback code tương thích |
| C — thay đổi phá vỡ dữ liệu | Xóa/đổi kiểu cột, import/xóa hàng loạt, quyền, thanh toán | Bắt buộc duyệt riêng, backup/restore rehearsal và cửa sổ phát hành |

A4 chỉ chứng minh kỹ thuật auto-deploy ở chế độ giữ payload trong inbox/release chưa active. Production chỉ thực sự được phép tự cập nhật tại A7, sau khi A6 cutover đã đạt và A7 được duyệt riêng. Trước thời điểm đó, cơ chế hiện hành Manual và cổng R6 vẫn có hiệu lực.

## 3. Luồng làm việc sau khi hoàn tất

### 3.1 Vòng lặp thiết kế

1. Codex sửa trên nhánh `codex/<ten-cong-viec>`.
2. Chạy dev server local với hot reload.
3. Chạy test liên quan qua `scripts/run-clean.mjs`; không tạo fixture song song.
4. Chủ dự án xem local khi thay đổi có tính thẩm mỹ hoặc hành trình người dùng.
5. Commit source; không commit `.env`, database, uploads, backup hoặc output tạm.

### 3.2 Vòng lặp GitHub/production

1. Push nhánh nguồn và mở PR hoặc chuẩn bị commit release theo gate đã duyệt.
2. GitHub Actions checkout đúng SHA, cài dependency từ lockfile, chạy test và build một lần.
3. CI tạo SBOM tối thiểu, manifest, hash từng file và payload bất biến; artifact giữ ngắn hạn.
4. Chỉ job trusted sau CI PASS mới fast-forward/cập nhật `release-production`.
5. Webhook làm Plesk pull payload vào private inbox ngoài document root.
6. Receiver từ chối sai branch/SHA/manifest/hash, file ngoài allowlist, symlink lạ hoặc baseline xung đột.
7. Payload được giải nén vào `releases/<payload-sha>`; shared data được liên kết, không chép đè.
8. Nếu có migration, chạy theo cấp phát hành và journal; lỗi thì không đổi `current`.
9. Đổi `current` atomically, reload PHP/cache nếu cần, chạy health check và smoke URL.
10. Health check thất bại thì đưa `current` về release trước; không tự restore DB nếu chưa có policy tương thích.
11. Ghi receipt và cleanup đúng tài nguyên tạm của lượt chạy.

## 4. Các giai đoạn triển khai có cổng duyệt

Mỗi giai đoạn tuân thủ: **duyệt phạm vi → thực hiện → kiểm thử → cleanup → báo cáo → dừng**. PASS một giai đoạn không tự cho phép giai đoạn kế tiếp.

### A0 — Chốt phạm vi và kiểm kê, chỉ đọc

**Mục tiêu:** biết chính xác phải giữ gì và điều kiện hạ tầng trước khi chọn framework.

**Công việc:**

- Lập ma trận chức năng hiện tại: trang chủ, thư viện, chi tiết, tìm/lọc, hướng dẫn, thực hành, báo cáo, cache, GitHub stars, quyền và trang legacy.
- Chụp inventory URL/canonical/sitemap/status, loại nội dung, taxonomy, meta và natural key.
- Đọc khả năng PHP/Composer, document root, symlink, cron/queue, Git webhook và dung lượng Plesk; không thay cấu hình.
- Kiểm kê backup theo loại/kích thước/release; chưa xóa.
- Rà soát repository public và lịch sử Git. Từ thời điểm này không commit thêm DB name, server path, receipt nội bộ hoặc dữ liệu vận hành chi tiết. Nếu phát hiện secret thật, dừng và rotate; việc rewrite lịch sử là bước riêng.
- Chốt danh sách chức năng bắt buộc cho bản đầu và chức năng hoãn sau cutover.

**Đạt khi:** có baseline đọc mới, bản đồ dữ liệu/URL, ma trận giữ-bỏ-hoãn, kết luận hạ tầng và quyết định họ framework/kiến trúc; phiên bản dependency cụ thể được pin ở A1.

### A1 — Nền ứng dụng mới chạy local

**Mục tiêu:** tạo vòng lặp thiết kế nhanh không phụ thuộc WordPress/Plesk.

**Công việc:**

- Tạo ứng dụng mới trong phạm vi đã duyệt, pin PHP/Composer/Node và lockfiles.
- Thiết lập cấu hình theo environment, không có secret trong Git.
- Tạo dev server/hot reload, layout, design tokens, component nền và trang mẫu.
- Chuẩn hóa lệnh `dev`, `test`, `build`, `lint` qua `run-clean` khi runner tạo fixture/cache.
- Thiết lập local database riêng có migration; không dùng DB production để phát triển.

**Kiểm thử:** boot sạch, reload giao diện, responsive/bàn phím, build tái tạo, lỗi dependency/config, cleanup và không thay dữ liệu gốc.

**Đạt khi:** chủ dự án xem được trang mẫu local và xác nhận hướng giao diện; chưa push payload hoặc đổi Plesk.

### A2 — Mô hình dữ liệu và công cụ chuyển đổi

**Mục tiêu:** thay schema WordPress bằng schema ứng dụng rõ ràng, có thể mở rộng.

**Phạm vi dự kiến:** resources, guides, practices, categories/tags, sources/evidence, revisions, validation, users/roles cần giữ, GitHub metrics và journal migration.

**Công việc:**

- Thiết kế ERD, khóa tự nhiên, unique constraint, index, timestamps và trạng thái xuất bản.
- Viết migration forward-only có journal và kiểm version.
- Viết exporter chỉ đọc từ WordPress và importer idempotent vào DB local mới.
- Giữ slug/URL hoặc định nghĩa redirect 301 cụ thể; không dùng local ID làm khóa xuyên môi trường.
- Đối chiếu count/hash/content/meta/terms và phát hiện sửa tay/xung đột.

**Kiểm thử:** dữ liệu thiếu/trùng, Unicode tiếng Việt, slug collision, retry sau lỗi, transaction, dữ liệu sửa tay, volume gần production và rollback code.

**Đạt khi:** một bản sao dữ liệu được phép đã nhập local đầy đủ, chạy lại không trùng và có báo cáo chênh lệch.

### A3 — Hoàn thiện chức năng và parity

**Mục tiêu:** ứng dụng mới thay được hành trình công khai hiện tại trước khi tối ưu hoặc mở rộng.

**Thứ tự:**

1. Header/footer/home và design system.
2. Danh mục, thẻ tài nguyên và phân trang.
3. Chi tiết tài nguyên/hướng dẫn/thực hành.
4. Tìm kiếm, lọc, canonical, sitemap và robots.
5. Trạng thái GitHub stars/cache theo dữ liệu hiện có.
6. Trang quản trị tối thiểu hoặc công cụ biên tập được chốt ở A0.
7. Báo cáo/hỗ trợ và các trang legacy cần giữ.

**Kiểm thử:** unit/integration, MariaDB local, browser desktop/mobile, keyboard, SEO, 404/500, cache, quyền, upload an toàn và crawl toàn bộ URL baseline.

**Ngưỡng parity khởi điểm:** 100% URL bắt buộc do A0 chốt trả đúng `200/301`; không thiếu redirect đã duyệt; canonical/robots/sitemap đúng; protected content/meta/terms không có hash mismatch; không có lỗi console/server chưa xử lý trong hành trình bắt buộc. Mục tiêu lab trên profile được pin ở A0 là LCP không quá 2,5 giây và CLS không quá 0,1, hoặc không kém baseline nếu hạ tầng làm mục tiêu tuyệt đối không khả thi. A0/A3 phải ghi danh sách URL, viewport và phép đo cụ thể thay vì chỉ ghi “đạt”.

**Đạt khi:** ma trận chức năng bắt buộc đạt và chủ dự án nghiệm thu trải nghiệm local.

### A4 — CI/CD GitHub → Plesk tự động nhưng chưa mở production

**Mục tiêu:** chứng minh pipeline mới bằng fixture và private inbox, không đổi website live.

**Công việc:**

- Workflow public-repo dùng standard runner; `permissions` tối thiểu, action pin version/SHA phù hợp.
- Tách workflow PR kiểm thử với workflow trusted tạo payload; code PR không có quyền deploy.
- Payload chỉ từ source SHA đã checkout, không đóng gói working tree local.
- Cấu hình deploy key Plesk chỉ đọc, webhook và nhánh `release-production`.
- Receiver, release directories, shared paths, atomic switch, lock, timeout, journal và cleanup.
- Mock/fixture toàn bộ deploy; trên Plesk chỉ nhận vào inbox và inspect cho đến khi gate production được duyệt.

**Kiểm thử lỗi:** artifact giả/cũ, force-push, hash sai, file thiếu/thừa, concurrent deploy, timeout, hết dung lượng, migration lỗi, health check lỗi, rollback và webhook lặp.

**Đạt khi:** CI tạo đúng payload; Plesk tự nhận đúng SHA vào inbox; không file/data live nào thay đổi; rollback fixture đạt.

### A5 — Diễn tập chuyển đổi không công khai

**Mục tiêu:** chạy gần như production trên release directory chưa active, không dùng staging và không phục vụ công khai.

**Công việc:**

- Tạo backup production mới và kiểm hash/CRC.
- Export WordPress chỉ đọc; import vào database mới hoặc schema mới theo phương án A2.
- Chuẩn bị release trong thư mục bất biến ngoài `current`; không đổi document root/symlink active.
- Chạy CLI/integration/crawl qua endpoint private hoặc cơ chế local-to-release đã duyệt, không mở index công khai.
- So sánh URL, nội dung, dữ liệu, hiệu năng và rollback plan.

**Đạt khi:** dữ liệu/parity đạt, có bản quay lui thật, thời gian cutover và delta sync được đo; website hiện tại không thay đổi.

### A6 — Cutover production

**Mục tiêu:** chuyển website sang ứng dụng mới với thời gian gián đoạn tối thiểu và khả năng quay lại rõ ràng.

**Phê duyệt phải pin:** source SHA, CI run, payload SHA, manifest hash, đích, thời điểm, backup, migration mode, timeout và rollback.

**Trình tự:** khóa ghi nếu cần → backup/delta export → migration/import → verify → atomic switch `current`/document root → purge cache có phạm vi → health check → crawl URL/SEO/data → mở ghi → receipt/cleanup.

**Rollback:** code rollback bằng release trước; database chỉ restore khi đã duyệt điều kiện mất dữ liệu sau snapshot. Nếu trạng thái migration không rõ, dừng ghi và inspect journal, không retry mù.

**Đạt khi:** ứng dụng mới live, URL/data/SEO/smoke đạt, không còn lock/maintenance, backup và receipt được giữ.

### A7 — Bật tự động và vận hành thường xuyên

**Mục tiêu:** từ đây thay đổi code cấp A tự đi từ CI PASS đến production mà không đăng nhập Plesk.

**Công việc:**

- Cập nhật R6/runbook để quy định trigger, nhánh, quyền và cấp phát hành mới.
- Bật webhook/deployment automation đúng phạm vi đã thử.
- Bảo vệ `main`/`release-production`, cấm force-push và giới hạn workflow có quyền ghi release.
- Theo dõi deploy/health/rollback; thông báo chỉ khi thất bại hoặc cần người xử lý.
- Định kỳ kiểm backup, restore và dung lượng.

**Đạt khi:** ba lượt cấp A liên tiếp chạy hết pipeline tự động trên production dưới phạm vi A7 đã duyệt; có thêm một ca health-check failure được tiêm trong release chưa active để chứng minh không chuyển live. Retry không tạo release trùng, failure giữ/khôi phục bản khỏe và cả bốn lượt có receipt/cleanup đạt.

## 5. Chính sách backup và giải phóng dung lượng

### 5.1 Khi nào backup

- Code-only: không cần full DB backup mỗi lần; giữ release code trước và shared data bất biến.
- Migration/import/content hàng loạt: backup DB bắt buộc trước thao tác.
- Thay uploads: backup incremental phần bị tác động.
- Đổi Plesk/env/webhook: lưu cấu hình trước và phương án hoàn nguyên.

Một backup dùng cho release có ghi dữ liệu chỉ được coi là hợp lệ khi được tạo trong chính cửa sổ phát hành sau khi chốt phạm vi ghi, chứa đủ DB và phần file/config bị tác động, hash/CRC đạt, nằm ngoài document root và có manifest. Phương pháp restore tương ứng phải được diễn tập đạt trong 30 ngày gần nhất hoặc diễn tập lại ở gate đó. A0 chốt RPO/RTO vận hành; tại cutover A6, mục tiêu RPO là gần 0 bằng write-freeze/delta sync, còn RTO phải dùng số đo từ A5 thay vì ước lượng.

### 5.2 Retention khởi điểm

- 7 bản ngày gần nhất.
- 4 bản tuần.
- 3 bản tháng.
- Giữ bản pre-migration cho đến khi có backup mới và một lần restore kiểm chứng đạt.
- Giữ rollback package/receipt đang được baseline hiện hành tham chiếu.
- Giữ tối thiểu một bản ngoài server Plesk.

Cleanup dùng manifest và nhãn vai trò, không xóa chỉ vì file cũ hơn một số ngày. Chỉ xóa backup trùng/đã hết vai trò sau khi xác nhận bản thay thế có hash/CRC và khả năng restore. Không xóa toàn thư mục backup/tmp hoặc dùng wildcard không kiểm soát.

## 6. GitHub và bảo mật repository public

- Không dùng GitHub làm nơi lưu secret hoặc dữ liệu production.
- Bật secret scanning/push protection nếu tài khoản hỗ trợ; thêm kiểm secret trong pre-commit/CI.
- Workflow PR chỉ `contents: read`, không đọc production secrets và không deploy.
- Workflow release trusted mới được ghi nhánh payload; token tối thiểu và environment protection nếu có.
- Plesk deploy key chỉ đọc cho đúng repository; không dùng personal token rộng.
- Không ghi thêm DB name, filesystem path, Plesk IDs, backup receipt chi tiết hoặc response headers nội bộ vào public repo. Receipt vận hành đầy đủ lưu ở vị trí private; repo chỉ giữ kết luận đã loại nhạy cảm.
- Vì lịch sử cũ đã public, A0 phải kiểm lại secret thật. Nếu có, rotate trước; xóa file ở commit mới không làm secret biến mất khỏi lịch sử.

## 7. Những việc không làm trong kế hoạch này

- Không upload code/ZIP trực tiếp từ local lên Plesk.
- Không đưa database/uploads/backup vào Git hoặc Git LFS.
- Không dùng production DB trực tiếp cho dev/test.
- Không tự đổi DNS, document root, webhook, scheduler hoặc quyền Plesk trước gate tương ứng.
- Không bật API có phí, email thật, thanh toán hoặc automation nội dung từ quyền xây lại website.
- Không xóa WordPress/database/backup cũ ngay sau cutover; chỉ dọn sau thời gian ổn định và gate riêng.
- Không gọi CI PASS là quyền phát hành cấp C hoặc quyền restore database.

## 8. Rủi ro chính và cách chặn

| Rủi ro | Chặn |
|---|---|
| Mất dữ liệu khi bỏ WordPress | Export read-only, importer idempotent, hash/count, backup và delta sync |
| Mất SEO/URL | Inventory URL, giữ slug, redirect 301, crawl/canonical/sitemap trước-sau |
| Commit lỗi tự lên live | Hai workflow trust level, payload SHA, receiver hash, health check và atomic rollback |
| Migration làm code cũ không chạy | Migration tương thích ngược, expand/contract và cấp phát hành B/C |
| Public repo lộ thông tin | Secret scan, rotate, policy tài liệu public/private và quyền tối thiểu |
| Plesk hết dung lượng | Preflight dung lượng, retention có manifest và cleanup sau release |
| Backup không dùng được | Hash/CRC và diễn tập restore định kỳ |
| Pipeline lại trở nên chậm | Local-first, test theo ảnh hưởng, cache dependency, build một lần và tái dùng payload |

## 9. Thứ tự ưu tiên và điểm dừng hiện tại

Ưu tiên thực hiện: **A0 → A1 → A2 → A3 → A4 → A5 → A6 → A7**. Không nên bắt đầu bằng cấu hình auto-deploy trên website WordPress hiện tại, vì như vậy tự động hóa một quy trình sắp bị thay và tăng rủi ro trước khi có atomic release/health rollback.

Kế hoạch này chưa thay `docs/implementation-plan-gated.vi.md`, R6, workflow, nhánh, Plesk, WordPress hoặc production. Bước có thể xin duyệt đầu tiên là:

> **A0 — kiểm kê chỉ đọc và chốt kiến trúc.** Không sửa code website, không push release, không thay Plesk, không xóa backup.
