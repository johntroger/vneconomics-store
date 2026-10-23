# S15 — Staging PHP/MySQL thật

Ngày 23/10/2026. Chủ dự án đã cho phép S15 bằng yêu cầu “bắt đầu S15”. Không cần xin lại quyền cho chính bước staging này. S16/production chưa được phép. S13 còn chờ phản hồi trải nghiệm.

## Phạm vi và tiêu chí

Sau khi xác định được đích staging và quyền thực tế: khảo sát PHP/MySQL/extensions/cache; backup và kiểm tra phục hồi trên vùng tách biệt; triển khai plugin, xác nhận version/schema/health, rồi mới theme; activation/migration; smoke/tích hợp trọng yếu, quyền/revision/trạng thái/cache và lỗi từng thành phần; giữ backup/gói khôi phục/bằng chứng. Không thay production hoặc dùng production thay staging.

Không tạo tài khoản/dịch vụ trả phí hoặc mở rộng quyền truy cập khi chưa có chỉ thị tương ứng. Không thay đích Plesk đang dùng cho `release`/`codex-deploy-check` để thử theme/plugin. Chọn cơ chế triển khai staging sau khi khảo sát được hạ tầng; không coi cấu hình local là cấu hình hosting.

## Ứng viên đã sẵn sàng

- Source SHA: `594ccd9a7de812a49f2c0d8260d20cbfced71752`.
- Plugin 0.4.2, schema 3; ZIP SHA256 `2648f76f915c456ff4221a45862d60ecaf9cc5cdd468781ea8b302f6d63ee4c5`.
- Theme 0.7.0; ZIP SHA256 `f6124d7693e8c8af7e8dcd7668012b8c0ed986d338c2a9e864e0f77afa3f0778`.
- Manifest và ZIP: `artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752/`.
- Cặp trung gian chỉ mới chứng minh local: plugin 0.4.2 + theme 0.6.0. Phiên bản đang chạy trên staging phải được đọc thực tế trước khi áp dụng.

## Thông tin cần xác định trước thao tác ngoài local

1. URL quản trị Plesk và phiên đăng nhập/đường truy cập được agent sử dụng. Không ghi mật khẩu/token vào chat, Git hoặc bằng chứng.
2. Staging đã có hay cần tạo; URL, document root, database và sự tách biệt với production. Chưa có giá trị nào được tự điền hoặc suy từ `store.vneconomics.com`.
3. Quyền file/database/backup/restore, dung lượng và hạn mức; phiên bản PHP/MySQL thực tế.
4. Các lớp cache/OPcache, quyền purge, cách xác nhận triển khai hoàn tất và timeout cụ thể.
5. Backup trước cập nhật và vùng phục hồi thử không ảnh hưởng site đang dùng; cấu hình chặn mail/AI/collector và noindex ở staging.

Thiếu các thông tin này thì dừng thao tác phụ thuộc, không thay bằng SQLite/PHP local hoặc một subdomain tự đoán. Việc chủ dự án đã cho phép S15 không tự cung cấp phiên đăng nhập hoặc xác định đích staging.

## Kiểm thử sẽ thực hiện khi có đích

- Xác nhận backup thực sự phục hồi được, version/schema và dữ liệu sau restore.
- Triển khai plugin trước; chỉ mở cổng theme sau khi plugin đang chạy đúng version/schema và health đạt. Lỗi/chậm/timeout/mất xác nhận phải chặn bước sau.
- Kiểm tra cả hai CTA, home/catalog/detail/guide, search/filter/report, quyền và preview/revision; không gửi email/API có phí để thử.
- Ma trận trạng thái, thay đổi/thu hồi/cảnh báo/dependency, cache nóng và purge/bypass/503/phục hồi ở tầng hosting thật theo S12.
- Theme lỗi sau plugin đạt: phục hồi toàn cây file theme và kiểm tra cặp tương thích; không tự rollback database/schema.
- Dọn fixture/cache mới sau khi tiến trình/database đóng, giữ backup thật, gói phục hồi và bằng chứng. Không xóa toàn bộ tmp hoặc dựa vào tuổi file.

Tham chiếu [checklist S14](S14-release-checklist.vi.md), [cache S12](S12-cache-contract.vi.md) và mục 13.1 của kế hoạch website. Báo cáo phải phân biệt đã chạy/PASS/FAIL/CHƯA KIỂM THỬ và dừng chờ duyệt bước kế tiếp sau S15.

## Thực hiện chủ động và công cụ không phụ thuộc DNS

Chủ dự án yêu cầu “làm đi, cái gì quan trọng hãy hỏi ý kiến”. Trong S15 đã duyệt, tiếp tục các thao tác chuẩn bị/kiểm tra và sửa lỗi thông thường mà không xin lại từng thao tác. Quyền này không mở S16, production, chi phí hoặc mở rộng quyền truy cập bảo mật. Hỏi khi thực sự thiếu dữ kiện/quyền hoặc có quyết định quan trọng ảnh hưởng ngoài phạm vi.

DNS chưa hoạt động chỉ chặn kiểm tra qua tên miền/HTTPS; có thể chuẩn bị và kiểm tra backend qua WP-CLI, vẫn giữ cổng plugin trước theme và không suy kiểm tra CLI thành HTTP/cache PASS.

Đã bổ sung tooling riêng: `scripts/fixtures/s15-audit.php`, `scripts/s15-bundle.mjs`, `scripts/build-s15-bundle.mjs`, `scripts/test-s15-bundle.mjs`. Gói nằm ở `artifacts/staging/<source_sha>/s15-plugin-preflight.zip`, chứa `s15-release/audit.php`, manifest S14 và `plugin.zip`. Gói này phải giải nén tại Home directory ngoài mọi web root, không ghép vào payload theme/plugin hoặc production. Chỉ có plugin ZIP, chưa có theme để tránh vượt cổng.

Audit chạy bằng `eval-file /var/www/vhosts/vneconomics.com/s15-release/audit.php` trong WP-CLI staging: chặn sai root/database/home/siteurl hoặc indexing bật; xác minh SHA256 manifest/ZIP được pin; đối chiếu từng file plugin nếu đã cài; đọc version/schema/theme và metadata môi trường. Không tự cài, kích hoạt, ghi nội dung, purge, đổi quyền, chạy subprocess, mail hoặc gọi mạng. Kết quả `ACTIVE_PLUGIN_OBSERVED` chỉ là quan sát version/schema/hash, không mở cổng theme hoặc chứng nhận tương thích Astra.

`npm run test:staging-tools` và `npm run build:staging-tools` qua run-clean, tuần tự. Kiểm thử helper là standalone PHP/ZIP trên local, không thay kiểm thử MariaDB/WordPress hosting. Bằng chứng local và artifact được giữ; fixture/cache mới được dọn sau exit.

Fixture backend `scripts/fixtures/s15-backend-probe.php` chạy qua `eval-file` sau khi xác minh hash trên đúng staging và plugin/schema. Guard root/database/home/noindex; chỉ tạo một draft có marker UUID, dùng admin hiện có trong tiến trình, chặn HTTP/mail và khôi phục actor/filter khi thoát. Finally chỉ dọn draft do lượt chạy tạo, revision/meta/khóa tương ứng; đối chiếu bài/trang và theme trước/sau. Không seed, publish hoặc tạo user; không thay kiểm thử HTTP, cache thật, chạy đồng thời hay nghiệm thu theme.
