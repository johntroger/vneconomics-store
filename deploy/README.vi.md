# Pipeline local → GitHub → Plesk

R2 chỉ chuẩn bị và kiểm thử local. `environments.json` cố ý để cả hai môi trường `deploymentConfigured:false`, repository/inbox `null`. Không có hook tự triển khai, thông tin đăng nhập hoặc lệnh ghi hosting trong CI. Các đường dẫn private thật chỉ được chốt trong R4/R5 sau khi kiểm chứng Plesk.

## Nguồn và gói

- Nhánh nguồn: `codex/deployment-pipeline`. Build đọc Git blob của ref cụ thể, không đóng gói cây làm việc đang sửa.
- Profile ban đầu `vne-072-042-schema3`: theme0.7.2/38file, plugin0.4.2/10file/schema3; ZIP quay lui theme0.7.1/36file. Profile lịch sử0.6.0/0.7.0/0.7.1 được giữ.
- `npm run build:pipeline -- <source-SHA>` tạo sản phẩm bất biến tại `artifacts/pipeline/<source-SHA>/`. Thư mục này giữ local, không commit ngược vào nhánh nguồn.
- Manifest ghi source SHA, phiên bản, allowlist và SHA256/size. Có9 tệp payload:3ZIP, content.json, receiver.php, environments.json và3 HTML bằng chứng thật. Manifest là tệp thứ10. `payload.zip` chỉ là vỏ đóng gói tiện kiểm tra local; không phải đường upload trực tiếp tới Plesk.
- Nhánh payload GitHub dự kiến `release/staging`/`release/production` chỉ chứa10 tệp trên theo cấu trúc manifest; không chứa source/test/DB/backup. R3 chưa phát hành nhánh payload. Không tự ghi payload commit SHA vào manifest của chính commit đó.
- 103 mục được quản lý: Codex đối chiếu baseline,100 tài nguyên C100 và2 hướng dẫn Claude Code/Antigravity. Dùng lại nội dung và bằng chứng đã duyệt; không đưa validation QA vào gói. Profile này chưa phải trình nhập nội dung tùy ý cho các lô tương lai.

## Kiểm tra và áp dụng ở các gate hosting sau này

1. R3: duyệt/push nhánh nguồn, kiểm CI thực sự trên GitHub. R4: duyệt payload/ref và vùng nhận staging private ngoài document root; Plesk pull từ GitHub. Giữ nguyên kết nối `release` → `codex-deploy-check` lịch sử.
2. Đối chiếu payload commit trên GitHub với HEAD private clone Plesk; kiểm manifest và mọi hash. Receiver đọc loose/packed Git ref local; nó không gọi GitHub để tự chứng thực remote. Biên nhận người vận hành phải giữ cả URL/SHA GitHub và SHA Plesk.
3. Chạy `wp --path=<root> --user=<reviewer> eval-file <inbox>/receiver.php inspect <staging|production>`. Trong Plesk, bỏ tiền tố `wp` nếu ô lệnh đã có sẵn. `inspect` là mặc định, chỉ đọc; vẫn yêu cầu tài khoản WordPress có quyền duyệt/kiểm chứng thư viện. Không nâng quyền tự động.
4. Nếu thành phần khác, backup môi trường trước rồi dùng trình cài native WP/Plesk với ZIP đã nhận từ GitHub; đối chiếu đủ38/10file. Receiver không cài theme/plugin/schema. Không cài lại thành phần đã khớp. R4 phải kiểm chứng quyền/path thật; chưa có bằng chứng hosting trong R2.
5. Sau inspect, phê duyệt cụ thể bộ `payloadSha` (40hex), `sourceSha` (40hex), `manifestSha256` và `baselineSha256` (64hex). Truyền JSON đó làm đối số thứ3 của receiver sau mode và môi trường. Không dùng placeholder để chạy.
6. `apply-content` chỉ tạo mục còn thiếu; ánh xạ natural key theo từng DB. Tạo draft có slug/marker ngay trong lần insert, ghi journal, sau khi chuẩn bị đủ mới xuất bản. Retry tiếp nhận đúng draft do gói sở hữu, không tạo lại bài/validation. Nếu thư viện đã đầy đủ và đúng hash/bằng chứng, dùng `adopt`: chỉ thêm receipt mới, không cài lại/nhập lại hoặc sửa journal C100/G03 lịch sử.
7. File/ref/target sai, duplicate natural key, draft lạ, raw edit chưa duyệt, cờ cần rà soát hoặc baseline đổi đều dừng. Không tự ghi đè. Receipt mới `vne_pipeline_<manifest-hash-prefix>` lưu ID riêng môi trường và dữ liệu bảo vệ baseline.
8. Nếu bị ngắt, giữ journal/draft thuộc gói; inspect và retry đúng bộ phê duyệt sau khi xác minh nguyên nhân. Khóa đồng thời không tự cướp theo tuổi. Khóa tồn dư cần đối chiếu tiến trình/token và quyết định xử lý rõ ràng, không xóa bừa.
9. Rollback thành phần dùng ZIP đã pin và công cụ native, sau khi được duyệt đúng gate; không tự phục hồi DB để sửa lỗi nội dung. Giữ backup thật và receipt. Khi adoption baseline đã khớp thì không cần lượt cài giả để nhận công trạng triển khai.

## Ma trận kiểm chứng

| Nhóm | Dependency và phạm vi | Nơi chạy |
|---|---|---|
| `test:pipeline-packages -- <ref>` | Node built-ins, Git đầy đủ lịch sử, PowerShell Expand-Archive; build2 lần, giải ZIP độc lập, allowlist/hash/ref/QA | Local; workflow `pipeline-check.yml` Windows2025/Node22 chuẩn bị cho R3 |
| `test:release -- 594ccd9a7de812a49f2c0d8260d20cbfced71752 [evidence-dir]` | Profile S14 đóng băng, không cần WP/DB | Local; CI chuẩn bị cho R3 |
| `test:pipeline-native -- artifacts/pipeline/<ref>` | PHP8.3.36 NTS x64, core WP local, SQLite integration từ `@wp-playground/cli`3.1.58 trong lockfile; fixture riêng, chặn mail/mạng | Local; chưa chuyển nguyên runner desktop lên Actions |
| `test:beginner-guides -- --release artifacts/pipeline/<ref>` | Như trên và Playwright runtime desktop/Edge headless; kiểm ZIP thật, giao diện và14 URL cũ | Local; chưa là CI sạch |
| Pull/cài, MariaDB, HTTP thật, SSL/noindex, rollback hosting | Cấu hình và quyền Plesk thật | R4/R5, chưa thực hiện ở R2 |

CI package không cần `npm ci`, `.local`, database hoặc PHP desktop. Native/UI dùng runtime hiện có, checksum/phiên bản ghi trong hồ sơ R2; không tự tải mới trong lượt thử. Nếu chuyển native/UI lên Actions ở bước sau, cần bootstrap nguồn/version/checksum và kiểm lại trên runner sạch, không dùng PASS desktop thay cho bằng chứng đó. Node22/Windows2025 là cấu hình CI dự kiến; PASS local Node24 không tự chứng minh Actions PASS.

Mọi kiểm thử chạy tuần tự qua `run-clean.mjs`; giữ DB/config/đầu ra gốc và sản phẩm. Không dùng việc dọn dữ liệu làm lý do xuất bản, gửi mail hoặc triển khai.
