# Kế hoạch hai phương án để Codex thao tác Plesk

Ngày lập: 27/10/2026

Trạng thái: đã chốt phương án Browser-assisted trên Shared Hosting; chưa cấp quyền triển khai production

Tài liệu này bổ trợ cho [kế hoạch làm lại website hiện hành](website-rebuild-plan-current.vi.md). Mắt Bão đã xác nhận gói hiện tại không hỗ trợ MCP/API/SSH key theo phạm vi yêu cầu. Vì vậy phương án vận hành hiện hành là Browser-assisted; phần API/MCP bên dưới chỉ được giữ làm phương án tương lai nếu đổi dịch vụ:

1. **Phương án 1 — API/MCP:** Codex thao tác bằng công cụ có scope, audit và xác thực máy–máy.
2. **Phương án 2 — Browser-assisted:** chủ dự án đăng nhập Plesk; Codex thao tác trong trình duyệt theo phiên và phạm vi được duyệt.

Đường phát hành đã chốt không dùng staging: **local → GitHub/CI → payload GitHub → Plesk private inbox production → production → hậu kiểm**. Release chưa active trong chính production chỉ là vùng chuẩn bị/kiểm chứng, không phải môi trường staging.

## 1. Nguyên tắc chung

- Source, migration và payload code đi qua GitHub; không upload code/ZIP ứng dụng trực tiếp từ local lên Plesk.
- Database, uploads, `.env`, logs và backup nằm ngoài Git.
- GitHub CI PASS không tự cấp quyền xóa dữ liệu, đổi cấu hình hoặc restore database.
- Tài khoản/mật khẩu/MFA/API key/SSH private key không gửi trong chat, commit, log, ảnh hoặc command line. Chủ dự án tự đăng nhập hoặc nhập secret vào kho bí mật được duyệt.
- Bắt đầu read-only; chỉ mở đúng write tool/thao tác đã kiểm thử.
- Thao tác ghi phải có preflight, target cụ thể, idempotency/journal, hậu kiểm và cleanup.
- Xóa dùng danh sách định danh chính xác, không dùng wildcard, không xóa toàn thư mục và không chỉ dựa vào tuổi file.
- Không thao tác hai writer đồng thời trên cùng Git repository, database migration, import hoặc backup cleanup.
- Mỗi bước vẫn theo cổng: duyệt phạm vi → thực hiện → kiểm thử → cleanup → báo cáo → dừng.

## 2. Phân biệt API quản trị Plesk và API dữ liệu website

Plesk API/MCP phù hợp để quản lý hạ tầng trong subscription:

- Đọc domain, cấu hình hosting, dung lượng và logs.
- Đọc/fetch/deploy Git repository.
- Tạo, liệt kê, theo dõi và dọn backup nếu quyền cho phép.
- Quản lý scheduled task hoặc thao tác extension nếu tool tương ứng được cấp.

Plesk API không nên được dùng như API nghiệp vụ để Codex chạy raw SQL thêm/xóa bài, người dùng hoặc dữ liệu ứng dụng. Dữ liệu website phải đi qua một trong hai giao diện có hiểu schema:

1. API quản trị của ứng dụng với scope hẹp, validation, idempotency, soft-delete và audit; hoặc
2. CLI/importer chạy trong Plesk, đọc manifest, kiểm schema/hash, dry-run, journal và rollback phù hợp.

Do đó “Codex chủ động thêm/xóa data” chỉ được mở sau khi API/importer của ứng dụng đạt kiểm thử. Xóa hàng loạt, đổi schema và restore DB luôn là thao tác cấp C cần duyệt riêng.

### Phân cấp thao tác dùng trong tài liệu

| Cấp | Phạm vi | Gate |
|---|---|---|
| A | Code/template/CSS/JS và logic không đổi schema hoặc dữ liệu persisted | Có thể tự động sau CI, verify và health gate đã nghiệm thu |
| B | Migration tương thích ngược; upsert/import có manifest; thay file dữ liệu có thể khôi phục | Cần backup hợp lệ nếu có ghi dữ liệu, dry-run/journal và quyền rõ cho loại thao tác |
| C | Drop/rename/change type phá vỡ; hard-delete/xóa hàng loạt; đổi quyền/auth/payment; restore DB; đổi root/credential/automation | Luôn duyệt riêng source/target/thời điểm/backup/rollback; không chạy unattended |

Không tự hạ cấp thao tác vì số hàng nhỏ. Một thay đổi có nhiều phần dùng cấp cao nhất của các phần đó.

### Lock và nguồn sự thật

- Mỗi thao tác ghi có `requestId` bất biến và lock theo `environment + resource + operation`.
- Lock/journal nằm ở kho persistent phía Plesk/ứng dụng, không nằm trong browser local hoặc GitHub artifact.
- Journal là nguồn sự thật cho trạng thái `prepared/running/complete/failed/unknown`; receipt GitHub/browser chỉ tham chiếu nó.
- TTL không tự cho phép chiếm lock. Lock quá hạn hoặc trạng thái `unknown` phải inspect process/journal/data trước; chỉ người có quyền cấp tương ứng mới được kết thúc/retry.
- API, SSH và browser đều phải dùng cùng request ID/lock; kênh thứ hai từ chối khi đã có writer.

## 3. Phần việc có thể làm ngay, không phụ thuộc câu trả lời Mắt Bão

- Hoàn thành A0: inventory chức năng, URL, dữ liệu, backup và hạ tầng chỉ đọc.
- Thiết kế interface `HostingOperator` ở mức hợp đồng, chưa kết nối thật: inspect Git, receive release, backup status, health, receipt.
- Thiết kế interface `ContentOperator`: validate, preview, upsert, soft-delete, batch journal và conflict.
- Xây website/local DB, migration, importer và test fixture ở A1–A3.
- Chuẩn bị payload bất biến, manifest/hash, private inbox contract và atomic-release contract.
- Chuẩn bị checklist browser để dùng nếu API bị từ chối.

Không tạo credential giả, không lưu password Plesk vào `.env` mẫu và không gọi endpoint ghi khi chuẩn bị các phần này.

## 4. Cây quyết định khi Mắt Bão trả lời

```text
Gói WordPress Hosting v5 hiện tại
├── MCP/API quản trị theo scope yêu cầu: không hỗ trợ
├── SSH/SFTP bằng SSH key bên ngoài: không hỗ trợ
└── Plesk Git Manual + Browser-assisted: đường production hiện hành
```

Nếu sau này đổi dịch vụ và có MCP/API, phải mở lại gate capability chỉ đọc trước; không tự dùng credential hoặc quyền mới để thay đường hiện hành.

## 5. Phương án 1 — API/MCP, hiện không khả dụng

### P1.0 — Xác nhận capability và scope, chỉ đọc

**Cần nhận từ Mắt Bão:** phiên bản Plesk, MCP/REST/XML/SSH được hỗ trợ, loại tài khoản, service-plan permission, endpoint, auth flow, IP policy, tool list, rate limit, audit log và chi phí.

**Ưu tiên:** Plesk MCP qua WebPros Account, scope đúng subscription và không lưu Plesk password trong Codex. Nếu dùng API key, key phải ở secret store và có cơ chế revoke/rotate; không pin vào IP động nếu không có runner IP cố định.

**Kiểm thử:** Codex chỉ đọc danh sách domain/repository/backup/log metadata; đối chiếu với Plesk UI. Không đọc file secret, không fetch DB dump và không ghi cấu hình.

**Đạt khi:** biết chính xác tool/quyền thực tế; audit log ghi được lượt đọc; không có quyền ngoài subscription.

### P1.1 — Bật quyền ghi tối thiểu cho Git/private inbox

- Chỉ bật fetch/pull/deploy cho repository và nhánh payload đã pin.
- Đích là private inbox/release directory ngoài document root, không deploy thẳng code chưa verify.
- Receiver kiểm source SHA, payload SHA, manifest, allowlist và từng hash.
- Một request id chỉ tạo một release; retry trả trạng thái cũ, không chạy lại mù.

**Kiểm thử:** payload noop, ref/hash sai, webhook lặp, concurrent request, timeout và hết dung lượng. Website live không đổi trong bước này.

Nếu dùng SSH adapter, allowlist ban đầu chỉ gồm script versioned trong payload để `inspect`, `verify`, `prepare-release`, `health` và `receipt`. Working directory phải là private inbox/release root đã resolve; từ chối đường dẫn ngoài subscription, symlink lạ và tham số shell tùy ý. Không cấp `sudo`, không đọc `.env`/database credential vào output và không cho adapter chạy command text tự do. Session/command/audit ID được ghi, nhưng stdout/stderr phải redact secret trước khi lưu.

### P1.2 — Backup API và retention

- Bật read/list/status trước; sau đó mới bật create.
- Xác minh backup task hoàn tất, manifest/hash/CRC và phạm vi DB/uploads/config.
- Delete backup là quyền riêng, mặc định tắt. Chỉ bật sau khi có inventory và policy 7 ngày/4 tuần/3 tháng, giữ pre-migration và ít nhất một bản ngoài Plesk.
- Cleanup nhận exact backup IDs từ danh sách đã duyệt, không xóa theo glob/tuổi file đơn thuần.

**Kiểm thử:** task thất bại/timeout, backup chưa complete, bản đang được retention bảo vệ, duplicate request và restore rehearsal gần nhất.

### P1.3 — API/importer dữ liệu ứng dụng

- Endpoint/service account riêng cho nội dung, không dùng Plesk administrator API.
- Scope tách: read, preview, upsert, soft-delete, hard-delete; hard-delete mặc định tắt.
- Mọi batch có manifest, actor, source, idempotency key, dry-run, diff preview và journal.
- Upload lớn đi vào private import inbox hoặc object storage; DB chỉ lưu metadata/path/hash.
- Conflict với chỉnh sửa tay phải dừng, không ghi đè.

**Kiểm thử:** quyền thiếu/thừa, schema sai, file độc hại/path traversal, dữ liệu trùng, retry giữa chừng, soft-delete/restore, batch một phần và audit log.

### P1.4 — Pilot production có giám sát

1. Một lượt inspect read-only.
2. Một payload noop vào release chưa active.
3. Một code-only release cấp A có chủ dự án duyệt.
4. Một import nhỏ có preview và journal.
5. Một ca health failure trong release chưa active để chứng minh không chuyển live.

Chỉ sau pilot đạt mới đề xuất automation thường xuyên. Database destructive change, backup deletion và restore vẫn không tự động.

Health gate mặc định phải kiểm tối thiểu: process/PHP trả lời, migration version đúng, homepage và tập URL bắt buộc trả status dự kiến, response có release SHA, không có lỗi fatal mới trong log và DB connection read-only đạt. Mỗi release pin URL, timeout và ngưỡng riêng; mặc định prepare/health timeout không quá 5 phút cho code-only cho đến khi A5 đo được số phù hợp hơn. Chỉ đổi `current` sau pre-switch health có thể chạy; post-switch health thất bại thì tự đưa `current` về release code trước. Nếu migration đã ghi hoặc trạng thái không rõ, dừng/khóa ghi và inspect; không tự restore DB hoặc retry.

### P1.5 — Vận hành thường xuyên

- Code-only cấp A: CI PASS → Plesk nhận → verify → atomic switch → health → receipt; có thể tự động.
- Migration cấp B: yêu cầu backup hợp lệ và migration tương thích ngược.
- Cấp C: phải có phê duyệt riêng.
- Alert khi failure, drift, backup không hoàn tất, dung lượng thấp hoặc cần người xử lý; không gửi trạng thái “mọi thứ bình thường” mỗi lượt.
- Revoke/rotate credential định kỳ và ngay khi scope thay đổi hoặc nghi ngờ lộ.

### Ưu/nhược điểm phương án 1

**Ưu:** nhanh, lặp lại được, audit rõ, không phụ thuộc phiên browser, phù hợp automation và cleanup có kiểm soát.

**Nhược:** phụ thuộc Mắt Bão bật đúng phiên bản/quyền; cần thiết kế secret, scope và app-level data API; API Plesk có thể không bao phủ WP-CLI/file operation mong muốn.

## 6. Phương án 2 — Chủ dự án đăng nhập, Codex thao tác browser

### P2.0 — Quy tắc phiên đăng nhập

- Chủ dự án tự nhập username/password/MFA trong Plesk; không đọc hoặc gửi chúng cho Codex.
- Codex chỉ thao tác khi Plesk đang mở trong tab được người dùng chỉ định hoặc browser của phiên hiện tại.
- Nếu session hết hạn, Codex dừng để chủ dự án đăng nhập lại; không thử password, reset MFA hoặc tạo user mới.
- Chỉ đóng tab do Codex tạo; hoàn trả viewport, checkbox và trạng thái UI nếu đã đổi tạm.

### P2.1 — Khảo sát chỉ đọc qua UI

Codex đọc Git settings, deployment mode/target, SSH/Composer/PHP, Backup Manager, Scheduled Tasks, database name ở mức cần thiết, dung lượng và logs. Ảnh/bằng chứng phải che IP, system user, key, token, cookie và dữ liệu riêng trước khi đưa vào public repo.

Raw screenshot/network capture chỉ được giữ tạm trong thư mục phiên private đã xác định và dọn sau khi tạo bản redacted; không đưa raw capture vào Git/chat. Codex thực hiện redaction, rồi kiểm lại bằng OCR/tìm mẫu trước khi lưu bằng chứng công khai. Bản public chỉ giữ thông tin tối thiểu cần chứng minh; receipt private có retention được chốt ở gate tương ứng. Nếu không chắc một trường có nhạy cảm hay không, giữ private và báo thay vì công khai.

**Đạt khi:** có inventory UI mới và không thay checkbox/cấu hình.

### P2.2 — Git/Plesk browser runbook production-only

1. GitHub CI tạo payload candidate và ghi source/payload/manifest SHA trên ref chưa được Plesk production theo dõi.
2. Sau approval production và fast-forward `release-production`, chủ dự án đăng nhập; Codex mở Git trong Plesk, xác nhận repository/branch/target/Manual/no post-action.
3. Codex bấm Pull rồi Deploy chỉ vào private inbox.
4. Codex đọc commit hiển thị và chạy inspect qua Plesk Terminal nếu đã duyệt.
5. Chỉ sau verify mới chạy receiver/promote theo cấp phát hành.
6. Hậu kiểm URL/data/logs; lưu receipt đã loại thông tin nhạy cảm.

Browser không thay manifest/hash gate. Toast “thành công” không đủ; phải đối chiếu ref/file/runtime.

### P2.3 — Backup và cleanup qua UI

- Trước migration/import, tạo backup bằng Backup & Restore và chờ trạng thái complete.
- Kiểm phạm vi, thời điểm, kích thước và integrity evidence trước khi dùng làm rollback.
- Cleanup chỉ chọn exact backup đã phân loại “xóa”; không dùng Select All.
- Sau xóa, kiểm dung lượng và xác nhận các bản retention/protected vẫn còn.
- Restore production luôn cần phê duyệt riêng vì có thể làm mất thay đổi sau snapshot.

### P2.4 — Dữ liệu qua browser

Không nhập/xóa dữ liệu bằng phpMyAdmin/raw SQL cho công việc thường xuyên. Codex thao tác trang quản trị/importer của ứng dụng:

1. Chọn file/lô đã duyệt.
2. Upload vào private import inbox.
3. Kiểm preview/diff/hash/count.
4. Chủ dự án duyệt batch ghi hoặc quyền đã được cấp rõ cho batch.
5. Codex bấm import, theo dõi journal, hậu kiểm và cleanup file tạm.

Với file dữ liệu rất lớn, dùng upload/importer của ứng dụng hoặc File Manager/FTP vào private import inbox theo phạm vi đã duyệt; browser điều phối import. Không dùng SFTP vì gói hiện tại không hỗ trợ SSH key, và không đưa file nặng qua GitHub.

### P2.5 — Giảm thao tác browser

Production hiện dùng Manual. Webhook/Automatic chỉ là khả năng đã chứng minh trên connection-check lịch sử, chưa phải đường production hiện hành. Browser dùng cho:

- Đăng nhập/duyệt lần đầu hoặc khi session/quyền thay đổi.
- Migration/import cấp B/C.
- Backup/restore/cleanup cần quyết định.
- Điều tra lỗi và thao tác ngoại lệ.

Không dùng browser automation làm daemon hoặc coi session Plesk là credential dài hạn.

### Ưu/nhược điểm phương án 2

**Ưu:** dùng được với gói hosting hiện tại, không cần API key/admin, người dùng quan sát trực tiếp thao tác.

**Nhược:** không unattended, phụ thuộc session/MFA/UI, chậm hơn và dễ bị ảnh hưởng khi Plesk đổi giao diện; cần người dùng có mặt cho thao tác định kỳ hoặc ngoại lệ.

## 7. Ma trận lựa chọn

| Tiêu chí | API/MCP | Browser-assisted |
|---|---|---|
| Tự động code-only | Tốt | Chưa unattended; production Manual cần UI |
| Thao tác không cần người dùng có mặt | Có, theo scope | Không |
| Audit/retry/idempotency | Tốt nếu thiết kế đúng | Phải ghi receipt riêng |
| Secret | OAuth/key trong secret store | Người dùng tự đăng nhập/MFA |
| Dữ liệu nghiệp vụ | Qua app API/importer | Qua admin/importer UI |
| Backup/cleanup | Có thể tự động có guard | Chọn thủ công qua UI |
| Độ ổn định | Cao hơn | Phụ thuộc giao diện/session |
| Điều kiện từ Mắt Bão | MCP/API/SSH permission | Chỉ cần truy cập Plesk hiện có |

## 8. Phương án đã chốt

1. Giữ Shared Hosting hiện tại và dùng phương án 2; chưa chuyển Cloud Server/Vibe Host.
2. Không dùng staging. Mọi lượt phát hành đi thẳng tới private inbox production rồi qua gate production đã duyệt.
3. Browser-assisted xử lý Pull/Deploy vào private inbox, verify, backup, migration/import, promote, hậu kiểm và ngoại lệ.
4. Giữ repository production ở Manual. R7 chỉ tự động hóa sau gate riêng và vẫn bắt buộc private inbox, verify, health/rollback; không deploy thẳng webroot.
5. Data CRUD đi qua admin/API/importer của ứng dụng với manifest/journal; không dùng raw SQL cho vận hành thường xuyên.
6. API/MCP chỉ được xem xét lại nếu sau này đổi gói/dịch vụ và có quyền phù hợp.

## 9. Vị trí của T0 trong kế hoạch hiện hành

R1 trong `website-rebuild-plan-current.vi.md` là bước tiếp theo hiện tại. T0 dưới đây là gate chuẩn bị vận hành trước R5/R6, không phải bước cần làm trước R1–R4:

> **T0 — thiết kế hợp đồng `HostingOperator` và `ContentOperator` cùng checklist browser, hoàn toàn local; không kết nối Plesk, không tạo key, không đổi workflow và không deploy.**

Chỉ thực hiện T0/P2.1 khi R5/R6 cần làm mới inventory Plesk hoặc hợp đồng operator. Không tự chuyển sang bước ghi hoặc production từ kết quả read-only; mỗi gate production vẫn cần phê duyệt đúng phạm vi.
