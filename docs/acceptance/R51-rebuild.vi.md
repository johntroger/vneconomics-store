# R5.1 — Nghiệm thu hợp đồng cài đặt/quay lui

Ngày: 28/10/2026

Trạng thái: **PASS_R51_OWNER_APPROVED**

Chủ dự án duyệt thực hiện và sau đó duyệt kết quả R5.1 bằng phản hồi “ok” ngày 28/10/2026. Đã chốt [hợp đồng cutover](../rebuild/R51-cutover-contract.vi.md): cấp B do activation ghi option, maintenance window 300 giây, theme cài riêng và giữ theme cũ, plugin trước/theme sau, kiểm baseline/hash/allowlist/disk/lock/backup, health và receipt, phục hồi theo trạng thái đã xác định.

## Kiểm thử

- `npm run test:rebuild-cutover-policy`: **21 kiểm tra PASS**. Chặn thiếu approval/CI/hash/allowlist/private inbox/backup/rollback/exclusive writer, sai baseline/schema/ref/manifest, lock hoặc thiếu disk. Các nhánh quyết định failure/timeout/rollback đạt. [Kết quả policy](R51-rebuild/test-results.json).
- `npm run test:rebuild-cutover-runtime`: **8 kiểm tra PASS**. WordPress fixture giữ theme cũ khi candidate inactive bị làm sai hash; sửa/kiểm hash trước activation; v2 render marker đúng; health mismatch giả lập không được coi complete; reactivation theme cũ giữ nguyên posts/schema; DB/config local đang sử dụng không đổi. [Kết quả runtime](R51-rebuild/runtime-results.json).
- Cleanup cả hai lệnh PASS; `git diff --check` đạt.

Tổng **29 kiểm tra**, có phân biệt policy model và runtime thật. Runtime dùng WordPress 7.1.3/PHP8.3/SQLite trên fixture mới, code copy từ working tree. Test không gọi Plesk, GitHub hoặc production.

## Giới hạn và điểm dừng

Đây là contract/rehearsal local, chưa phải release candidate. Cài ZIP native, maintenance, build từ exact SHA, manifest/allowlist cụ thể, full gate và rollback package phải được kiểm trong R5.2. Plesk/MariaDB, lock/disk thật thuộc preflight R6. Không chứng nhận filesystem atomic hoặc tự động rollback hosting từ các test local này.

R5.1 đã hoàn tất và được chủ dự án duyệt. Chưa mở R5.2, merge, push/promote `release-production`, cài live hoặc bật automation.
