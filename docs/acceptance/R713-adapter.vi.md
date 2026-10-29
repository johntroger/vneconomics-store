# R7.13 — Profile sáu file và inspect-inbox local/CI

Phạm vi hoàn tất tại local: profile `vibelab-v2-r6-css-adapter-schema3`, builder từ hai exact Git SHA và PHP controller chỉ đọc inbox. Đây là phần nền của adapter; chưa có installer/runtime/health adapter production. [Receiver fixture R7.11](../rebuild/R711-css-receiver.vi.md) giữ nguyên.

## Thay đổi

- `scripts/release-r6-css-adapter.mjs` tạo đúng manifest, receiver và bốn ZIP. Controller lấy từ Git object của SHA được người gọi chọn theo hồ sơ review, không lấy working tree hoặc tự coi SHA là bằng chứng đã review. Profile năm file và toàn bộ ZIP ứng dụng cũ giữ nguyên.
- Source ứng dụng/controller, hash controller và manifest được ghi riêng; payload SHA chỉ xác định sau khi tạo commit. CSS vẫn có applicationChangeClass A; toàn gói để changeClass null/controllerReviewRequired vì controller mới cần review và phân loại riêng.
- `release-tools/r6-css-adapter.php` chỉ có `inspect-inbox`: kiểm sáu-file allowlist, hash, baseline R6 và ref clone dạng loose/packed. Đường production được cố định theo runbook; fixture dùng vùng sở hữu riêng. Không bootstrap WordPress, DB, ghi file/lock/journal hoặc thực thi shell/network.
- `inspect-state`, `install`, `finish`, `confirm-rollback` đều từ chối. Output ghi rõ parent Git object, archive entries và runtime chưa được PHP xác minh; installAuthorized false. Parent/tree Git được Node validator kiểm trong harness, không suy ra từ loose/packed ref.
- Caller phải kiểm hash controller từ hồ sơ độc lập **trước khi include**; đây chưa phải công cụ bootstrap vận hành Plesk. Thử controller bị sửa chứng minh code đó không được thực thi.

## Kiểm thử

[Local test](R713-adapter/local-test-6.json): PASS 32 nhóm, gồm build lặp, Git controller regular-file, parent/profile, byte/hash, source/controller/manifest pins, tampering, symlink, loose/packed/ref sai, quyền sở hữu fixture và filesystem không đổi. Bảo toàn DB/config local thật; cleanup PASS. Harness PHP8.3 đặt CLI SAPI để kiểm đúng guard; không mở WordPress hoặc server HTTP.

[Workflow contract](R713-adapter/workflow-test.json): PASS, tám phép thử biến thể workflow adapter không an toàn trên cả LF/CRLF bị từ chối. CI riêng theo đường dẫn module, read-only, không secrets/push/deploy. Không chạy bộ native R7.11 hoặc URL suite cho thay đổi inspect độc lập.

Lượt đầu bị sandbox Windows chặn Git/MSYS; chạy lại fixture với quyền phù hợp. Harness cũng đã sửa khởi tạo process ID và SAPI của PHP-WASM; guard CLI của controller giữ nguyên. Log lỗi giữ local, không đóng gói vào PR.

CI exact-head sẽ được đối chiếu khi có kết quả. Chưa tạo/push payload, merge main, mở Plesk, thay application hoặc bật automation. Còn phải xây runtime/installer/health/recovery adapter và kiểm native trước gate hosting; không coi bước inspect này là adapter hoàn chỉnh.
