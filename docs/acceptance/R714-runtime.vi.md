# R7.14 — Adapter runtime trong fixture local

Phạm vi: nối profile sáu file của [R7.13](R713-adapter.vi.md) với WordPress runtime, native theme update, probe HTTP mới và journal/rollback. Không chạy Plesk, publish payload, merge main hoặc bật automation. Đây là local integration, chưa phải receiver production.

## Thay đổi

- Entry `vne_adapter_dispatch` giữ inspect-inbox không ghi. Entry runtime riêng yêu cầu environment local-runtime, productionApproved false, CLI, đúng ABSPATH/token/sentinel của fixture, quyền update_themes, URL/indexing, database fixture và theme/plugin/schema đúng baseline. Cả helper ghi journal/native update/maintenance cũng có guard fixture; không mở đường gọi trực tiếp trên hosting.
- Preflight kiểm lại sáu file/ref/hash và từng ZIP entry, pin ZIP rollback/plugin R6, so sánh PHP/template chỉ được stamp identity và CSS đúng profile. Kiểm disk reserve trước khi tạo writer; kiểm baseline dữ liệu, maintenance và lock/journal đã có.
- Lock exclusive gắn owner/source/controller/payload/manifest/controller-hash/baseline. Journal baseline phải khớp lock và hash approval. inspect-state sau trạng thái chưa rõ chỉ báo phase/data/lock, không tự retry hoặc relabel journal; nó có bootstrap WordPress nên tách khỏi inspect-inbox không ghi.
- INSTALLING → AWAIT_HEALTH → COMPLETE khi hash/data và health mới đạt. HTTP lỗi đã được xác thực → ROLLING_BACK → ROLLBACK_AWAIT_HEALTH → ROLLED_BACK. Lỗi native giữ STOPPED_INSPECT; xung đột file/data giữ CONFLICT_INSPECT và lock, không ghi đè edit hoặc restore DB.
- Probe ngoài WordPress thực hiện GET loopback thật, chỉ đi theo redirect cùng origin. Proof HMAC gắn owner/source/controller/payload/manifest, phase, challenge mới và thời gian tối đa120 giây. Runtime đọc proof từ vùng private thay vì nhận một object health tùy ý. Key chỉ thuộc fixture, không có trong Git/payload. Sai chữ ký, sai binding, proof cũ hoặc challenge trước rollback đều không finalize.

## Kiểm thử và giới hạn

Lệnh: `node scripts/run-clean.mjs script scripts/test-r6-css-adapter.mjs --native`. Bộ mặc định không có --native vẫn chỉ kiểm profile/inspect. CI adapter gọi native và chỉ kích hoạt khi module hoặc dependency được liệt kê đổi; không áp dụng cho mỗi lần sửa CSS/nội dung.

Bộ native dùng WordPress7.1.3/PHP8.3/SQLite và synthetic content. Kiểm thành công, HTTP503 thật/rollback, chữ ký/binding/expiry, journal corruption, PHP ZIP giả được repin, disk/quyền/baseline/maintenance/foreign lock, updater error và xung đột dữ liệu/file. Đối chiếu năm bảng nội dung/options; giữ hash DB/config local thật trước/sau.

Các fault và reset chỉ thuộc fixture tự tạo: gỡ lock của ca lỗi giả lập để tiếp tục ca độc lập, giữ journal lỗi; ca conflict cuối giữ nguyên edit/lock tới khi dispose toàn fixture. Không phải quy trình phá lock/khôi phục production. Timeout được mô phỏng bằng đọc trạng thái AWAIT_HEALTH, chưa chứng nhận khôi phục sau hard-kill tiến trình hosting.

Các URL giả tương ứng file private trong fixture có thể được WordPress canonical/router đưa tới HTML công khai với HTTP200, kể cả đuôi .php. Kiểm lại realpath ngoài webroot, không có bản public, response HTML không chứa source/key và không trùng hash controller; ghi status thực thay vì tuyên bố404. Không sửa router hoặc cài rule chặn giả để làm test đạt. Không dùng kết quả này để chứng nhận cấu hình HTTP Plesk.

Production runtime bị chặn; capabilities công khai trong manifest vẫn chỉ inspect-inbox. Key/probe dùng harness tin cậy, chưa có phân phối key hoặc bootstrap/probe operator Plesk. Git object parent được validator Node kiểm, không suy từ ref PHP. Còn gate review controller, health/transport production, kiểm MariaDB/WordPress live, backup theo cấp, approval và recovery hosting trước khi mở runtime production.

## Kết quả local

- [Native local](R714-runtime/local-test-6.json): PASS60 nhóm gồm32 profile/inspect và28 runtime; đoạn runtime257 giây. Cleanup PASS, DB/config local thật giữ nguyên.
- [Workflow contract](R714-runtime/workflow-test.json): PASS, gồm tám biến thể LF/CRLF của policy adapter bị từ chối; cleanup PASS. Diff check đạt.
- Các lượt thử đầu đã sửa newline trong Git ref giả lập và file maintenance giả lập chưa đúng cú pháp WordPress. Sau đó điều chỉnh tiêu chí probe private theo HTTP fallback thực tế; không giảm guard package/owner/baseline/health hoặc cài rule chặn giả. Log lỗi giữ local, chỉ đưa bằng chứng đạt vào PR.

CI trên exact source commit còn chờ kết quả. PASS local chưa mở gate hosting hoặc runtime production.
