# Checklist phát hành hiện hành

Dùng với [runbook](deployment-runbook.vi.md), không tự cấp quyền triển khai.

- [ ] Chủ dự án đã duyệt đúng bước/đích/phạm vi/thời điểm; người reviewer và quyền hiện hữu được kiểm.
- [ ] Baseline root/DB/home/indexing/version/schema/nội dung/journal đọc mới; backup/hash/CRC và rollback tương thích có thật.
- [ ] Source commit đã có trên GitHub; CI đúng workflow/SHA/lượt chạy, job/bước bắt buộc đạt và artifact đúng run/source còn hạn; các kiểm native/UI/migration cần thiết đã đạt, cleanup không lỗi.
- [ ] Artifact CI/local khớp byte; profile/allowlist và nội dung/bằng chứng đúng; không có secret/DB/backup/QA giả.
- [ ] Payload commit10file trên GitHub; ghi riêng source SHA/CI/payload SHA/manifest SHA256; production dùng đúng commit đã thử staging.
- [ ] Plesk đúng repo/branch, Manual, không post-actions; inbox realpath private ngoài document root, permissions đã kiểm.
- [ ] GitHub ref/Plesk HEAD/manifest/từng hash khớp; không chuyển ZIP local trực tiếp.
- [ ] Approval có payloadSha/sourceSha/manifestSha256/baselineSha256; mode adopt/apply/cài thành phần nằm đúng phạm vi; không reinstall/import lại khi MATCH.
- [ ] Baseline conflict dừng/giữ sửa tay; timeout xác minh trạng thái trước retry; không phá lock/restoreDB để vượt guard.
- [ ] Hậu kiểm runtime/hash/ID/count/meta/terms/validation/journal, retry/no duplicates, URL/SEO/noindex/private routes và UI phù hợp đạt.
- [ ] Dọn fixture/cache mới, hoàn trả UI; giữ nguồn/DB/config/ảnh/evidence/backup/gói quay lui và báo file chưa rõ vai trò.
- [ ] Biên nhận ghi kết quả/giới hạn và nguồn thực tế; không relabel lịch sử. Dừng chờ gate kế tiếp; merge main, batch mới, automation/API có phí cần đúng quyền riêng.
