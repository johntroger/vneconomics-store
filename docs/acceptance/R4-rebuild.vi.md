# R4 — Quản trị và dữ liệu mở rộng local

Ngày: 28/10/2026

Trạng thái: **PASS_R4_OWNER_APPROVED**

Chủ dự án duyệt thực hiện và sau đó duyệt kết quả R4 bằng phản hồi “ok” ngày 28/10/2026. Approval này đóng R4; không mở R5.1, migration hoặc import production.

## Đối chiếu nhu cầu

| Nhu cầu R3 | Khả năng hiện có | Quyết định R4 |
|---|---|---|
| Title/excerpt/content/category/need/tool | Model, validator và form admin hiện có | Giữ field/schema |
| Các bước, yêu cầu, kết quả, phục hồi | Nội dung HTML có heading trong CMS | Không tạo field trùng nội dung |
| Nguồn/ngày/validation/review | document_source, state, validation và form admin | Giữ service/phân quyền hiện có |
| Tài nguyên liên quan tới bước | dependency có revision, step, tool, version | Sửa danh sách chọn đang cắt ở 50 resource |
| Import dữ liệu mới | R3 chưa tạo yêu cầu payload/schema mới | Không mở importer tổng quát |

Importer chiến dịch `scripts/content-100-import.php` được pin runtime/theme cũ, chỉ phục vụ profile đã duyệt. Không coi importer đó là importer tùy ý cho v2; lô mới phải có profile/test/approval riêng theo AGENTS.md.

## Thay đổi

`plugins/vne-library-core/state-admin.php`: danh sách tài nguyên phụ thuộc lấy toàn bộ resource publish, sắp tên A–Z. Với quy mô hiện tại hơn 100 resource, select vẫn phù hợp; nếu tăng lớn hơn cần đánh giá tìm kiếm có phân trang ở gate riêng.

Không thay schema 3, API, quyền, validator, importer hoặc dữ liệu thật. Không cần migration/rollback dữ liệu cho thay đổi chỉ đọc này; rollback code là khôi phục file phiên bản trước tại gate release.

## Kiểm thử

Lệnh `npm run test:rebuild-admin`: **PASS_R4_ADMIN_LOCAL — 10 kiểm tra**, cleanup PASS.

- Form admin chứa đủ 57 resource publish, gồm resource cũ nằm ngoài giới hạn 50 trước đây.
- Gắn dependency qua handler admin thành công; lặp cùng resource/bước không tạo trùng.
- Draft dependency và anonymous write bị từ chối, liên kết cũ được giữ.
- Stale revision bị từ chối, nội dung cũ được giữ.
- Schema vẫn là 3; guide hub smoke HTTP 200.
- Database/config local đang sử dụng không đổi.

Bằng chứng: [test-results.json](R4-rebuild/test-results.json). Runtime WordPress 7.1.3/PHP 8.3/SQLite fixture cô lập. Lượt đầu thiếu bootstrap admin; lượt hai bị chặn loopback; đã sửa bootstrap và chạy lại với quyền loopback, mọi lượt đều cleanup.

## Điểm dừng

R4 đã hoàn tất và được chủ dự án duyệt. Chưa mở R5.1. Chưa merge, build candidate, migration/import hoặc thao tác production. Plesk/MariaDB, full regression và đóng gói bất biến thuộc gate release.
