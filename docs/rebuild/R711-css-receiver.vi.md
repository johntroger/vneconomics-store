# R7.11 — Receiver CSS trong fixture cô lập

Phạm vi: kiểm chứng giao thức nhận/cài/health/rollback CSS trên WordPress Playground local và CI. Đây là prototype; chưa phải receiver triển khai trên Plesk.

## Đường kiểm chứng

`node scripts/run-clean.mjs script scripts/test-r6-css-profile.mjs --receiver`

Harness tạo source/payload Git tạm, kiểm payload bằng validator hiện hành, đặt đúng năm file vào inbox private trong filesystem PHP-WASM ngoài document root. Guard yêu cầu CLI, `/wordpress/`, sentinel/token của fixture, quyền cập nhật theme và environment `local-fixture`; production bị từ chối. Không có HTTP endpoint, downloader hoặc scheduler.

Receiver pin baseline R6, manifest, thư viện controller, archive và từng file. Plugin giữ nguyên 0.4.4/schema3; PHP/template chỉ được đổi đúng version/marker đã định. Thư viện nằm ngoài `themes/`, `plugins/`, `deploy/` để không làm thay đổi ứng dụng của profile CSS.

## Giao thức trạng thái

- Khóa toàn receiver bằng exclusive create; owner/source/payload/manifest và baseline phải khớp journal. Khóa cũ/khác owner và journal hoàn tất được giữ để inspect.
- `INSTALLING → AWAIT_HEALTH → COMPLETE`: native update theme, đối chiếu file/data/options, bỏ maintenance, xác nhận HTTP thật rồi mới xóa khóa của lượt chạy.
- Health sai khi file/data còn đúng: `ROLLING_BACK → ROLLBACK_AWAIT_HEALTH → ROLLED_BACK`; chỉ quay lui theme bằng archive R6, xác nhận HTTP baseline rồi xóa khóa.
- Xung đột file/data: `CONFLICT_INSPECT`; lỗi chưa rõ: `STOPPED_INSPECT`. Giữ edit, journal và khóa để điều tra; không restore DB hoặc tự retry.

Bootstrap WordPress bình thường để plugin active được nạp; chỉ bật `wp_installing(true)` tạm trong updater và khôi phục cờ cũ sau đó. Bộ thử đối chiếu năm bảng nội dung, options được bảo vệ và toàn bộ options `vne_`; DB/config local đang dùng được kiểm hash trước/sau.

## Kiểm thử và giới hạn

28 nhóm gồm 10 policy CSS, 12 tình huống từ chối và 6 nhóm giao thức/dữ liệu/private HTTP. Workflow CI riêng chỉ chạy khi receiver hoặc dependency được liệt kê thay đổi; không đưa native rehearsal vào mọi lượt sửa CSS/nội dung.

Harness tin cậy thực hiện fetch HTTP và kiểm Git; PHP nhận các pin/proof đó từ harness, chưa tự chứng thực transport GitHub/Plesk. Môi trường thử là WordPress 7.1.3/PHP8.3/SQLite, không chứng nhận MariaDB/WordPress production 7.1.4. Chưa có adapter production, phân phối controller, gate phê duyệt hay recovery cho hosting. Candidate pipeline hiện hành chưa gọi receiver này. Không thay đổi `release-production`, cấu hình Plesk hoặc dữ liệu thật.

Bằng chứng local: [28 nhóm PASS](../acceptance/R711-receiver/test-run-4.json), [hợp đồng workflow](../acceptance/R711-receiver/workflow-test.json).
