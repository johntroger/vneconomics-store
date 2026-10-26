# Đồng bộ sao GitHub — phương án triển khai có cổng

Ngày26/10/2026, sau khi PR1 đã merge. Bản khảo sát ban đầu cho yêu cầu tự cập nhật sao. Sau đó chủ dự án duyệt U1 với yêu cầu “làm tiếp đi, đơn giản thôi”: triển khai local theo phương án gọn bên dưới, không gọi API thật, deploy hoặc bật lịch. [Inventory nguồn](source-inventory.json):100bài C100/100repo ID riêng/0ID thiếu,100URL repo khác nhau; các số sao/ngày trong inventory là snapshot25/10, không phải đo lại ngày26/10.

## Điều chỉnh U1 theo yêu cầu làm đơn giản

**U2 local đã nghiệm thu sau phê duyệt “ok”:** theme0.7.3/plugin0.4.3/schema3, profile code-only riêng và quay lui cặp0.7.2/0.4.2. Xem [nghiệm thu U2](../../acceptance/U2-github-stars.vi.md). Chưa push GitHub, deploy, gọi API thật hoặc bật lịch; U3 chưa được mở từ PASS U2.

U1 dùng **option riêng không autoload, một snapshot gần nhất cho mỗi repo**, thay cho hai bảng/lịch sử đo được đề xuất ban đầu. Không migrate DB, không đổi schema/version biên tập. Module đặt ngoài plugin đang chạy, chỉ nhận transport giả trong kiểm thử; chưa có tích hợp, UI, queue tự động, HTTP adapter thật hoặc lịch chạy. Không triển khai phần tăng trưởng7/30ngày. Xem [contract U1](../../../modules/github-stars/README.vi.md) và [nghiệm thu](../../acceptance/U1-github-stars.vi.md). Các đoạn “thiết kế đề xuất” dưới đây là lộ trình tham khảo, không phải phạm vi đã code hoặc phê duyệt thêm.

## Điều đã xác minh và tài nguyên dùng lại

- Dùng100bài đã xuất bản/10lô và100repo ID có sẵn, không nghiên cứu/nhập lại nội dung. Sáu tài nguyên seed ngoài C100 cần bước đối chiếu ID riêng sau; không suy rằng100ID này đã phủ toàn bộ106tài nguyên.
- `model.php` hiện không có trường sao trong resource schema; sao được ghi vào HTML bài và editorial_note bởi build-content-100-batch.mjs. Approved revision hash toàn bộ editorial snapshot trong revisions.php. Vì vậy không cập nhật sao bằng cách ghi lại payload/content hoặc seal bài mỗi ngày.
- Các mẫu/runtime kiểm bảo toàn snapshot, quyền, lock/idempotence/no-store, pipeline GitHub/Plesk và run-clean được dùng lại. Scope/schema/profile baseline R5 pin0.7.2/0.4.2/103mục không dùng nguyên xi để cài chức năng mới.
- Source main sau merge578ce30, source production4266b71/payload hai đíchdc4af29. Giữ các ref và receipt này đến khi có gate phát hành mới.

## Thiết kế đề xuất

**Dữ liệu vận hành riêng.** Một module thống kê có namespace/schema riêng, không thêm sao vào approved payload. Dự kiến hai bảng riêng theo prefix WordPress: repository hiện tại và mẫu đo theo ngày; queue/cursor/lock cấu hình riêng, không autoload dữ liệu lớn. Chốt schema cụ thể ở U1, additive install có lệnh/thao tác được duyệt, không tự migrate trên lượt khách. Tăng version plugin/theme và release profile theo mã thực tế khi triển khai; giữ schema biên tập3 nếu không đổi contract của nó. Bảng thống kê có version riêng và kiểm nâng cấp/khôi phục riêng.

Repository keyed bằng ID ổn định: canonical owner/name/API URL, stars nguyên không âm, thời điểm nhận200, lần xác nhận thành công cuối, lần thử cuối, ETag/representation key, status/backoff/quota và lỗi đã redaction. Sample lưu repo ID/thời điểm UTC/count/provenance; unique theo chu kỳ/ngày để retry không tạo trùng. Không tự xóa lịch sử đo; retention cần quyết định ở gate vận hành. Không dùng số repo/readme mới làm bằng chứng đã thử công cụ.

**Collector chỉ đọc GitHub.** Lấy metadata repository (`id`, `stargazers_count`, archived/disabled/canonical identity) qua [Get a repository](https://docs.github.com/en/rest/repos/repos#get-a-repository). Không liệt kê từng stargazer, đọc dữ liệu riêng hoặc gọi AI. API công khai có thể đọc không xác thực; token nếu bổ sung chỉ lưu server/quyền tối thiểu, không lấy token gh CLI dùng quản lý repo private đem sang hosting. Pin API version/Accept/User-Agent đã kiểm khi code; ETag phải gắn đúng URL/version/auth context.

HTTP200 chỉ ghi khi identity/schema/count hợp lệ; sao có thể tăng, giảm hoặc bằng0 thật. HTTP304 chỉ hợp lệ khi có cached representation cùng identity/key; giữ ngày nhận giá trị200 và cập nhật ngày xác nhận, không gọi đó là đọc lại README. Lỗi/timeout/404/403/429/5xx giữ giá trị hợp lệ cuối và ngày cũ, không đặt0 hoặc tự ẩn bài. Đổi tên chỉ theo redirect API GitHub đã allowlist rồi đối chiếu ID; không đổi URL/nội dung/giấy phép/badge kiểm chứng của bài. Archived/disabled/rename sinh đề nghị rà soát biên tập riêng.

**Giới hạn mạng.** Request tuần tự, host HTTPS api.github.com/path metadata allowlist; giới hạn redirect/body/timeout và không đưa token theo redirect ngoài host. Giữ Retry-After/rate reset/backoff theo [GitHub best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api). Conditional requests dùng ETag; GitHub chỉ nêu miễn primary quota cho304 đã xác thực, không áp miễn quota cho request chưa xác thực. Không gọi GitHub khi khách mở trang.

**Nhịp chạy đề xuất, chưa bật.** Mục tiêu refresh mỗi24giờ, queue chia nhỏ. MVP không token: đề xuất tối đa5repo/lượt15phút, tối đa20request/giờ cho tác vụ này;100repo cần khoảng5giờ nếu không bị giới hạn/lỗi. Đây là phép tính nhịp, không cam kết thời gian; quota IP hosting chia sẻ có thể đã bị dịch vụ khác dùng. Luôn đọc header và dừng/backoff, không retry cho đủ số. GitHub công bố mức thông thường60request/giờ theo IP chưa xác thực và5.000/giờ cho xác thực người dùng; còn secondary limits theo [tài liệu quota](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

Nhịp cuối, múi giờ Asia/Saigon, binary/path/OS user/quyền/PHP CLI và cách khóa phải được đọc thật trên hosting trước gate bật. Ưu tiên scheduler hosting chạy worker CLI/PHP private từ gói GitHub đã kiểm; không tạo URL công khai có token hoặc cron trong chat. Chưa giả định scheduler khách hàng được cấp hoặc đường WP-CLI đã sẵn; proc_open trên hosting trước đây bị tắt nên không dựa vào shell gọi MySQL/curl. Dùng HTTP client và wpdb trong cùng process khi phù hợp. [WP-Cron phụ thuộc page load](https://developer.wordpress.org/plugins/cron/) nên không coi nó là lịch đúng giờ.

**Giao diện.** Hiện số gần nhất + ngày xác nhận + liên kết nguồn + nhãn cũ/chưa đồng bộ trên card/chi tiết theo snapshot stats đã lưu. Những đoạn sao25/10 trong bài giữ như snapshot lúc biên soạn; phân biệt rõ với block thống kê mới, không sửa hàng loạt body. Chưa đủ lịch sử thì không hiện tăng7/30ngày, không gọi “đang tăng nhanh”. Không thay thứ tự mặc định hoặc thêm filter phổ biến trong MVP nếu chưa duyệt riêng. Đọc thống kê không làm đổi approved_revision/validation/commands_allowed. Giữ cache policy công khai/riêng tư hiện hành; chỉ cache metadata GitHub nội bộ.

## Các bước cần duyệt riêng

| Bước | Phạm vi | Điều kiện hoàn tất |
|---|---|---|
| U1 — nền dữ liệu/collector local | Thiết kế và code module lưu stats/queue/lock, client inject được HTTP giả;100ID từ nguồn hiện có. Tất cả mặc định tắt, không gọi API thật, không deploy | Test200/304/tăng/giảm/0, saiID/shape/redirect/timeout/quota/backoff, schema additive, retry/lock/race, token redaction và bảo toàn bài/revision/validation/DB local; cleanup đạt |
| U2 — UI/profile local | Card/detail hiển thị snapshot động và trạng thái cũ; version/profile/allowlist/manifest/receiver tương thích, đường rollback an toàn | Kiểm đủ hash, UI/SEO/search/14legacy/privacy/no-store, không gọi mạng trên page load, bảo toàn toàn bộ nội dung; test pipeline/CI guard đạt |
| U3 — staging | Source GitHub/CI → payload Plesk private; migration/additive install đã duyệt; thử thủ công với nhóm repo thật có giới hạn cụ thể, chưa bật lịch | Hash/ID/count/snapshot/journal/backup/noindex/rollback đạt; đo quota thực và xác minh scheduler/path/quyền, có đề xuất thao tác production cụ thể |
| U4 — production code, chạy thử thủ công | Cùng payload đã thử staging, backup mới và approval riêng; không bật lịch từ quyền deploy | App hash/runtime/113mục thư viện/14legacy/validation/option cũ giữ đúng; stats mới đúng nguồn, retry/cleanup đạt, rollback không drop lịch sử thống kê |
| U5 — kích hoạt vận hành | Duyệt riêng chính xác job/người chạy/path/nhịp/budget credential nếu có; không mở endpoint công khai | Chạy thử đúng job, tránh trùng, observe cycle hoàn tất và lỗi/backoff/stale; biên nhận/tắt lịch có kiểm soát; không tự thêm repo/bài hoặc phát hành tiếp |

Mỗi bước báo kết quả/giới hạn và dừng theo AGENTS. Phân biệt thay cấu hình lịch với cài code; U4 không tự cấp quyền U5. Không gọi API có phí/mua gói/cấp token mới từ bản kế hoạch.

## Kiểm thử bắt buộc trước mở lịch

1.100ID/URL từ nguồn hợp lệ, nhiều tài nguyên cùng repo chỉ một fetch; seed chưa có ID không tự ghép bằng title. GET mới phải khớp ID nguồn; rename không làm trôi danh tính.
2.200/304/cache thiếu/context đổi; rawcount tăng/giảm/0 và giá trị thiếu/âm/float/quá lớn. Không ghi khi JSON/Content-Type/trạng thái không hợp lệ.
3.Timeout/403/429/5xx/404/redirect ngoài GitHub/response quá lớn; không leak secret trong URL/HTTP error/log; thiếu quota thì queue chưa xong được giữ, không quay vòng retry nóng.
4.Khóa nguyên tử/owner token, không tự phá lock đang chạy, crash/retry/CAS/cursor không mất hoặc trùng mẫu; đồng hồ và ngày UTC/AsiaSaigon rõ. Không gọi mẫu sinh lại là lịch sử thật.
5.So posts/meta/terms/approved revision/history/validation/commands_allowed/oldC100G03 journals trước-sau sync. Stats đổi không chạy save_post/seal/editorial approval/cache-incident ngoài phạm vi.
6.Cài/upgrade additive trên SQLite local và MariaDB staging phù hợp, không đổi DB/config gốc; rollback code giữ dữ liệu đo, không tự drop table/restore production. Fixture và mock credential được dọn qua run-clean, evidence và backup thật giữ.

## Đề xuất mở trước tiên

**Chỉ duyệt U1 local**: module/collector với HTTP giả lập, không API thật hoặc scheduler. Kết quả U1 mới dùng để chốt version/schema/profile/UI ở U2. Đây là chức năng mới sau R6/merge; quyền “tiếp tục” được dùng để chuẩn bị phương án, không suy thành quyền bật cập nhật production.
