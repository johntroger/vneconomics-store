# R0A — Kế hoạch tái thiết v3 và nguồn sự thật

Ngày: 27/10/2026
Phạm vi được duyệt: chỉ tài liệu; không sửa ứng dụng, không push GitHub, không Plesk/production.

## Thay đổi

- Nâng kế hoạch hiện hành lên v3: modular monolith, nguồn sự thật phiên bản, fast CI, ba lát cắt R3, hợp đồng promote/rollback và production-only R6.
- Cập nhật README để phản ánh repository public, Plesk Manual/private inbox và phân biệt development/candidate/production.
- Thêm `current-docs-index.vi.md` để tách tài liệu hiện hành khỏi lịch sử S00–S16.
- Giữ nguyên code ứng dụng, workflow, payload, nhánh phát hành và cấu hình hosting.

## Kiểm chứng bắt buộc

- `git diff --check`.
- Kiểm liên kết Markdown tương đối trong tài liệu bị tác động.
- Đối chiếu development với source; đối chiếu production với runbook hiện hành.
- Không chạy application suite vì đây là thay đổi tài liệu/quy tắc.

## Giới hạn

- R0A không sửa CI; việc đó thuộc R0B và chưa được cấp quyền.
- Không tạo candidate v3 hoặc đổi `release-production`.
- Không đăng nhập Plesk và không thay website live.

## Kết luận

**PASS trong phạm vi R0A.**

- `git diff --check`: đạt; chỉ có cảnh báo chuyển CRLF/LF cho README, không có whitespace error.
- Liên kết Markdown tương đối trong 5 tài liệu bị tác động: 0 liên kết hỏng.
- Đối chiếu source: theme 0.7.3, plugin 0.4.3, schema 3.
- Đối chiếu production với runbook: source `4266b71990702d87969a847e95d9c39933cb05a4`, payload `dc4af296692ddac2dd71dc9f1be4a69f1af29959`, theme 0.7.2, plugin 0.4.2, schema 3.
- Kiểm đọc độc lập theo câu hỏi “tài liệu nào hiện hành?”, “production là phiên bản nào?”, “bài viết đi đường nào?”, “code đi đường nào?” và “gate kế tiếp là gì?”: câu trả lời có vị trí rõ và không mâu thuẫn trong bộ tài liệu hiện hành.
- Không tạo file tạm/cache/test data trong lượt tài liệu này; không xóa mục `tmp/` có sẵn vì không thuộc lượt chạy và vai trò chưa được xác định.
- Không chạy application suite, đúng ma trận kiểm thử tài liệu.
