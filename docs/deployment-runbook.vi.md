# Runbook local → GitHub → Plesk

Chốt theo R6 được chủ dự án duyệt ngày26/10/2026. Đây là quy trình vận hành; mỗi lần phát hành vẫn cần đúng gate và phạm vi đã duyệt. [Checklist](release-checklist.vi.md), [R5](acceptance/R5-production.vi.md), [R6](acceptance/R6-closeout.vi.md).

## Baseline và các đích

Source ứng dụng/payload đã tiếp nhận: `4266b71990702d87969a847e95d9c39933cb05a4`; [CI40288437763](https://github.com/johntroger/vneconomics-store/actions/runs/40288437763)218pipeline+75S14 đạt. Hai nhánh `release-staging`/`release-production` cùng payload `dc4af296692ddac2dd71dc9f1be4a69f1af29959`, manifest SHA256 `02953f231825577da95d1a71887a44ba07e425015412b5448581588af042bf34`. R6 chỉ chốt hồ sơ, không đổi các ref đang phát hành. Source commit chứa hồ sơ R6 có thể mới hơn; không thay số source trong receipt R5.

| Mục | Staging | Production |
|---|---|---|
| Home | https://staging-store.vneconomics.com | https://store.vneconomics.com |
| Root dưới `/var/www/vhosts/vneconomics.com/` | `staging-store.vneconomics.com/` | `store.vneconomics.com/` |
| Database | `vne35060_wp_udx1z` | `vne35060_wp_kmqnf` |
| Git repository cùng prefix home | `git/vneconomics-store-staging.git` | `git/vneconomics-store-production.git` |
| Inbox cùng prefix home | `deploy-inbox/staging` | `deploy-inbox/production` |
| Nhánh payload | `release-staging` | `release-production` |
| Indexing | `0` (noindex) | `1` |

Plesk domain319/291, subscription58; Manual, không post deployment actions, Default read key có sẵn. Inbox/parent0700 và nằm ngoài document root. Không tạo `release/*`: nhánh `release` lịch sử đã tồn tại. Kết nối cũ `release` → `/store.vneconomics.com/codex-deploy-check` được giữ, không dùng để phát hành website. Ref cũ vẫn `4fe952ac7eec550d3125be9885fa6271aece2718`.

Baseline có VibeLab0.7.2/38file, plugin0.4.2/10file/schema3;106tài nguyên/6hướng dẫn/1thực hành. Gói quản lý103natural-key:100tài nguyên,2hướng dẫn và đối chiếu Codex. Không nhập lại mục đã có. Các ID guide production107/213/215 là biên nhận thực tế, không pin vào importer cho môi trường khác.

## Người duyệt và hồ sơ mở một lượt

Chủ dự án duyệt gate, đích, phạm vi mã/nội dung, ref/payload, thời điểm, backup, timeout và phương án phục hồi. Agent chuẩn bị/kiểm chất lượng theo quyền đã cấp; PASS local/CI không tự mở staging/production. Dùng tài khoản reviewer WordPress đang có quyền; R5 dùng user1, không tự tạo hoặc nâng quyền. Yêu cầu đăng nhập trực tiếp khi phiên hết hạn, không nhận password/OTP/token trong chat hoặc Git.

Mỗi lượt ghi source SHA40hex, CI run URL/conclusion, payload SHA40hex, manifest SHA256, root/DB/home/indexing, baseline SHA256, profile/allowlist, danh sách mục, backup/hash/CRC, mode, approval và kết quả hậu kiểm/cleanup. Không dùng một SHA cho cả source, payload và commit hồ sơ.

## Chuẩn bị local và GitHub

1. Đọc AGENTS/gate và working tree; giữ thay đổi ngoài phạm vi. Sửa và kiểm thử trong đúng bước; chạy npm script có run-clean, mỗi lần một tác vụ tạo fixture. Giữ DB/config local, nội dung/ảnh gốc, gói phục hồi và evidence; không xóa toàn tmp hoặc theo tuổi file.
2. Chọn source commit bất biến, kiểm tra không có secret/config/DB/backup hoặc bằng chứng QA giả. Chỉ stage file đúng phạm vi. Push nhánh nguồn được duyệt, hiện là `codex/deployment-pipeline`; không tự merge main.
3. CI phải checkout đúng SHA, chạy các kiểm tra bắt buộc và tạo artifact. Workflow hiện không deploy, không có hosting secret, chỉ contents:read. Dùng CI Windows2025/Node22 và tái dựng từ Git blob, không đóng gói working tree chưa commit.
4. `npm run build:pipeline -- <source-SHA>` tạo thư mục bất biến `artifacts/pipeline/<source-SHA>/`. Kiểm gói bằng `npm run test:pipeline-packages -- <source-SHA> <evidence-dir>` và S14 lịch sử; nếu đổi app/receiver/schema phải chạy native/UI/migration phù hợp trước gate hosting.
5. Tải artifact CI và đối chiếu byte với bản tái dựng local. Trong gói có9file payload + manifest =10file Git. `payload.zip` là vỏ local thứ11, không push vào nhánh payload hoặc upload lên hosting. Giữ bản artifact đã tải vì GitHub chỉ lưu1ngày.
6. Chỉ sau duyệt gate tương ứng mới tạo/push nhánh payload. Kiểm allowlist10file, mọi hash, CI đúng source và normal fast-forward; không force, không đổi working tree để đóng gói. Với một ứng viên, production nhận đúng commit đã thử staging, không rebuild rồi gọi là cùng gói.

## Plesk nhận và thao tác

1. Đọc lại baseline và tạo backup mới trước thay đổi; kiểm hash/CRC và giữ bản quay lui thật. Từ chối lệch root/DB/home/indexing, symlink hoặc inbox dưới webroot. Plesk Pull đúng repository/branch, xác nhận Manual/đích rồi Deploy **chỉ vào private inbox**.
2. So sánh GitHub ref với symbolic HEAD/loose hoặc packed ref trên clone Plesk, source/manifest và toàn bộ10hash. Toast không đủ xác nhận. Receiver tự kiểm clone local, không gọi GitHub; người vận hành phải giữ cả bằng chứng GitHub và Plesk.
3. Lệnh chỉ đọc: `wp --path=<root> --user=<reviewer> eval-file <inbox>/receiver.php inspect <environment>`. Trong ô Plesk đã có `wp`, bỏ tiền tố đó. Dùng đường thật đã kiểm; không chạy placeholder. Component MATCH cần đủ48hash; inspect không cài ứng dụng hoặc đổi schema.
4. Approval JSON có đúng thứ tự `payloadSha`, `sourceSha`, `manifestSha256`, `baselineSha256`. `wp ... eval-file <inbox>/receiver.php <mode> <environment> '<approval-json>'`. Không tự tái tính baseline để vượt xung đột sau khi đã duyệt; giữ nguyên JSON khi retry vì receiver so sánh journal nghiêm ngặt.
5. **adopt** chỉ dùng khi thành phần,103mục đã publish/validation và3bằng chứng đều có/khớp. Nó chỉ thêm receipt; không dùng để sửa bài hoặc đổi tên outcome journal nhập cũ. R5 đã thử fresh receipt trên MariaDB ở cả hai đích, so sánh toàn bộ option cũ và130hàng trước/sau; retry ALREADY_ADOPTED.
6. **apply-content** chỉ trong gate nhập đã duyệt cho profile tương ứng: tạo draft còn thiếu với marker/slug, journal/chuẩn bị đủ rồi publish. Ánh xạ natural-key theo DB, không chép DB/local ID. Nếu có mục sửa tay hoặc conflict thì dừng; không xóa bài hoặc import lại để vượt guard.
7. Nếu phiên bản app thực sự khác, chỉ cài thành phần được duyệt bằng native WP/Plesk từ ZIP đã nhận qua GitHub, plugin trước/theme sau và kiểm giữa hai bước. Không upload từ local. Receiver không tự cài app/migrate/schema; byte đã MATCH thì giữ nguyên.

## Giới hạn công cụ hiện có và lô/phiên bản mới

`publish-r5-payload.mjs` là helper R5 có kiểm receipt/backup và exact staged commit; `r5-adoption-command.mjs` pin reviewer1/130hàng/103mục và yêu cầu fresh receipt. `r3-verify-ci-candidate.mjs --r5` pin cấu hình R5 và so với R2. `publish-staging-payload.mjs` cũ chỉ dùng R4 với production disabled. Không chạy các helper này như uploader tổng quát cho batch hoặc version mới.

Profile `vne-072-042-schema3` và generator hiện pin baseline103mục, rollback0.7.1/36file; không tự nhận mọi phiên bản/100bài tương lai. Lô mới phải có danh sách nguồn/GitHub/date quan sát, nội dung tiếng Việt cho người mới, kiểm liên kết/claim/quyền sử dụng/phạm vi đã thử, natural-key và chính sách retry/conflict phù hợp. Kiểm chất lượng tự động không thay quyền mở gate. Không sao chép README hoặc coi nhiều sao là bằng chứng đã thử.

Đổi phiên bản/schema cần profile/allowlist/manifest/rollback tương thích và kiểm migration/khôi phục local riêng. Nếu đổi config/receiver/importer/app, thử cùng ứng viên trên staging trước production. Không hạ plugin/schema tùy tiện; gói theme0.7.1 không phải phương án đảo migration schema tương lai. Kế hoạch cho lô/version mới cần được duyệt riêng, rồi thực hiện từng gate.

## Timeout, lỗi, retry và rollback

R5 adoption chỉ thêm receipt dùng120giây, không bật maintenance/thay file; không coi đó là SLA. Với cài app, chốt deadline cụ thể trước thao tác; S15 đã dùng300giây làm hạn vận hành lịch sử. Client timeout không chứng minh server đã dừng. Ngừng bước tiếp, đọc journal/lock/phiên bản/hash và trạng thái tác vụ; không retry mù, tự expire/phá lock hay chạy hai writer.

Retry cùng source/payload/approval chỉ sau khi trạng thái đã rõ. Receipt complete phải còn khớp nội dung/validation; trạng thái đã bị sửa cần review. ADOPTED/ALREADY_ADOPTED khác APPLIED_MISSING_CONTENT; giữ journal C100 verified/G03 published thực tế, không relabel để hợp thức hóa đường triển khai cũ.

Nếu lỗi nhận gói/private transport: dừng Manual connection mới, giữ website và gói/receipt để điều tra; không tự tác động connection-check cũ. Nếu chỉ adopt, không cài theme rollback hoặc restoreDB vì không thay app/content. Nếu đã đổi app, dùng đúng gói/cây backup đã pin được duyệt, chỉ đảo thành phần tương thích rồi kiểm đủ hash/URL/dữ liệu. Quyền restoreDB production không đi kèm quyền deploy; phải có duyệt riêng về snapshot và mất chỉnh sửa sau snapshot. Các ca rollback/restore/fault S15/R4 là evidence theo phạm vi đã ghi, không phải watchdog tự động hoặc chứng nhận mọi outage.

## Hậu kiểm và kết thúc

Kiểm runtime/version/schema/48hash hoặc allowlist profile mới, ID/count/nội dung/meta/terms/validation/journal cũ, không trùng, retry; homepage/catalog/3guide/search/copy/checklist/14URL cũ, canonical/robots/sitemap đúng môi trường, endpoint riêng tư. Giữ noindex staging, production index1. Chỉ thử gửi mail/report/AI/cost khi có quyền riêng; R5 dùng GET và UI không submit.

Dọn đúng fixture/cache mới của lượt sau khi process/DB đã đóng, kể cả test thất bại; giữ backup/gói/receipt/evidence. Hoàn trả checkbox/clipboard/viewport, chỉ đóng tab do agent tạo. Không xóa file chưa rõ vai trò. Báo thay đổi, kiểm thử, bằng chứng và giới hạn; còn lỗi chặn/check thiếu/cleanup lỗi thì không PASS. Dừng ở gate tiếp; không tự bật lịch, webhook hay phát hành batch kế tiếp.

R5 kết thúc có783kiểm/151GET,3guide UI và6case responsive đạt;5backup production+4staging, lock0/native upgrade folders rỗng. Đây là baseline đã tiếp nhận; các lần25/10 nhận ZIP trực tiếp vẫn giữ dưới nhãn lịch sử.
