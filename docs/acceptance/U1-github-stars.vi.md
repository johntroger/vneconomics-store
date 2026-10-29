# U1 — nền snapshot sao GitHub local

Ngày 26/10/2026. **PASS trong phạm vi U1 local** sau yêu cầu chủ dự án “làm tiếp đi, đơn giản thôi”. Nhánh `codex/github-stars-u1`, nền `origin/main` đã merge PR1 tại `578ce3073158a7bacfbfedef0b4feeef125a2570`.

## Thay đổi

- Thêm [collector độc lập](../../modules/github-stars/collector.php) và [contract](../../modules/github-stars/README.vi.md). Dùng option không autoload, một snapshot gần nhất/repo, không thêm bảng/lịch sử. Đây là bản gọn thay đề xuất hai bảng trong khảo sát ban đầu.
- Tái dùng [100 ID nguồn C100](../github-stars/2026-10-26/source-inventory.json), core capability/atomic lock, WordPress và runner tự dọn hiện có. Không nhập lại nội dung.
- Mặc định tắt, bắt buộc capability và injected transport. Giới hạn 5 repo/lượt, 20 request/giờ UTC, ETag/304 theo representation, pause/backoff, giữ số tốt cuối khi lỗi. Không lưu credential/body/thông báo lỗi thô.
- Thêm `npm run test:github-stars`, native fixture WordPress/SQLite, chặn HTTP/email thật. Module chưa được plugin tải; plugin/theme/profile/schema đang phát hành không đổi.

## Kiểm thử và bằng chứng

Lệnh cuối: `npm run test:github-stars` — **373 kiểm tra đạt**, PHP lint đạt, không có PHP warning/fatal/notice/deprecation. [Kết quả có hash](U1-github-stars/native-results.json).

Phủ 200, 304/cached context, tăng/giảm/0, stale48giờ, sai ID/tên/JSON/type/count, thiếu/quá lớn/âm/float, redirect, timeout/exception/404/500, 403/429/quota cạn, retry/backoff, budget liên lượt, trùng repo, cạnh tranh/mất lock, lỗi lưu và redaction. 100 repo được mô phỏng bằng metadata giả qua nhiều batch/giờ; **không phải đo sao live**. Những sao/ngày trong inventory vẫn là bằng chứng nguồn C100 cũ.

So sánh trước/sau toàn bộ posts/postmeta/taxonomy và option cũ (chỉ loại namespace stats mới), approved revision và validation không đổi. Hash file config, database local gốc và nội dung nguồn S10 không đổi. Không có HTTP thật được collector thử gọi. Option thống kê không autoload; không để lại lock sau các batch bình thường/lỗi lưu; lock chủ khác được giữ khi mô phỏng mất quyền sở hữu.

Lượt đầu thất bại do bộ thử dùng sai thứ tự tham số filter `pre_update_option`; sửa harness rồi kiểm lại đạt. Giữ [biên nhận thất bại ban đầu](U1-github-stars/failure.json). Cả lượt lỗi và lượt cuối đều được run-clean dọn fixture/cache; lệnh cuối exit0 và báo cleanup thành công. Kiểm sau chạy: không còn fixture `stars-u1-*`, lock runner hoặc cache `transient-run-*` mới.

## Giới hạn và cổng tiếp

Chưa tích hợp UI/plugin, HTTP adapter thật, lịch/queue tự chạy hoặc lịch sử tăng trưởng. Chưa kiểm MariaDB/hosting, chưa push GitHub/CI hoặc đổi Plesk/production. U1 không có endpoint và không phát request khi khách mở trang.

Lock không tự cướp khi worker chết cứng; việc đối chiếu/gỡ cần quy trình vận hành sau. Retry-After mới hỗ trợ số giây, chưa HTTP-date. Rename/redirect chưa theo; sáu tài nguyên seed ngoài C100 chưa được tự gán ID. Không coi status lấy sao là kiểm chứng chất lượng công cụ.

**Dừng ở U1.** U2 là tích hợp giao diện và profile local, cần chủ dự án duyệt theo AGENTS. Phát hành tiếp tục đi theo local → GitHub/CI → payload GitHub → Plesk ở các cổng sau; không dùng quyền local để bật production.
