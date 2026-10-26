# U2 — giao diện và gói code local

Chủ dự án duyệt U2 bằng “ok” sau nghiệm thu U1. Không có quyền push/dispatch GitHub, cài staging/production hoặc bật lịch từ bước này.

## Thành phần

- Theme **0.7.3**, 38 file: card/trang tài nguyên đọc snapshot option qua core. Hiển thị số/ngày xác nhận GMT+7/nhãn dữ liệu cũ hoặc chưa có số; số 0 hợp lệ được giữ. Nguồn thống kê phải khớp repo ID và owner/name của tài nguyên. Không sửa body cũ, không dùng sao để đổi thứ tự hoặc nhãn đã chạy thử.
- Plugin **0.4.3**, 11 file: thêm `stars.php`, cùng implementation U1; module phát triển cũ trở thành shim tương thích. Schema biên tập vẫn **3**, định dạng option stats **1**. Không tự tạo snapshot, không đăng ký HTTP route/cron/job hay transport mạng thật.
- Profile mới **`vne-073-043-stars1-schema3`**, **code-only**, không kèm content importer hoặc bằng chứng mới. Builder `npm run build:github-stars -- <sourceSha>` chỉ đọc Git commit, không lấy working tree làm payload.
- Gói có theme/plugin hiện tại, cặp trước **0.7.2/0.4.2** từ source production **4266b71990702d87969a847e95d9c39933cb05a4**, hai verifier và cấu hình môi trường. Các archive có allowlist riêng; không nới profile R2–R5 cũ.

## Kiểm gói và CI

`npm run test:github-stars-packages -- <sourceSha>` kiểm deterministic ZIP, reader PowerShell độc lập, byte hash thành phần/rollback, profile S14 cũ và từ chối file/ZIP lạ.

`deploy/github-stars-receiver.php` là **verifier chỉ đọc**, không phải trình cài. Bắt buộc source SHA và manifest SHA256 pin rõ; kiểm profile/phiên bản/schema/allowlist archive/hash/verifier bytes. `vne_stars_release_runtime()` kiểm cả file thực tế đang chạy. Tái dùng helper kiểm ZIP/runtime của receiver cũ trong chế độ library-only; không gọi importer hoặc journal R2–R5.

Workflow pipeline giữ bốn bước provenance bắt buộc. Với theme0.7.3, bước kiểm/build chọn builder mới; version pair lạ vẫn bị từ chối. Artifact vẫn tên `pipeline-<sourceSha>` trong đường `artifacts/pipeline/<sourceSha>`. Các cổng CI provenance được kiểm local với HTTP giả, chưa có run GitHub U2. Kiểm CLI publisher R5 dùng source58aa đã duyệt của profile cũ và xác nhận R5 không nhận U2; không biến R5 thành publisher dùng tùy ý.

## Quay lui

Chỉ phục hồi file đúng cặp trước từ archive đã pin, giữ toàn bộ DB/option stats/validation/journal. File `stars.php` chỉ có ở plugin0.4.3 cần đối chiếu và loại khỏi cây plugin khi phục hồi đúng allowlist0.4.2; không xóa option stats hoặc restore DB. Không chạy thao tác này trên hosting từ quyền U2.

Kiểm local dùng fixture riêng: new theme/old plugin hiển thị chưa có số; old theme/new plugin vẫn giữ contract biên tập; cặp trước có thể phục vụ cùng URL. Sau rehearsal khôi phục đúng cặp hiện tại và kiểm lại hashes. Bằng chứng fixture không chứng nhận MariaDB/hosting hoặc WooCommerce giao dịch.

## Cổng tiếp

**Chỉ đạo mới sau nghiệm thu U2:** bỏ U3 staging; bước tiếp là U4 trực tiếp production qua GitHub/CI. Giữ baseline/backup/rollback và các gate theo runbook hiện hành; không xóa staging lịch sử.

U4 cần source trên GitHub/CI đạt, payload chính xác từ GitHub và phạm vi production đã duyệt. Trước khi cài, công cụ publish/installer phải được chốt đúng **profile code-only mới**, inbox/ref/manifest/baseline và target production; công cụ R4/R5 pin profile cũ không được dùng để vượt guard. U2 đã cung cấp builder/verifier/rollback kiểm local. Transport live/scheduler không nằm trong U2; thử API thật phải được giới hạn và duyệt riêng ở bước phù hợp.
