# R3.3 — Hướng dẫn và thực hành local

Ngày: 28/10/2026

Trạng thái: **PASS_R33_OWNER_APPROVED**

Chủ dự án duyệt bốn preview bằng phản hồi “ok” ngày 28/10/2026. Approval này đóng R3.3; R4, merge, build candidate và production cần quyền riêng theo kế hoạch.

Đã triển khai archive hướng dẫn/thực hành, tìm kiếm trong hướng dẫn, nhóm theo danh mục chính, trang chi tiết, mục lục, nguồn và trạng thái kiểm chứng, liên kết tài nguyên phụ thuộc, và redirect archive `/bo-thuc-hanh/` về `/huong-dan/`. Theme không ghi dữ liệu. Lệnh chưa đủ điều kiện kiểm chứng được ẩn.

`npm run test:rebuild-guides`: **37 kiểm tra PASS**, cleanup PASS. Bằng chứng máy: [test-results.json](R33-rebuild/test-results.json). Fixture chạy trên WordPress 7.1.3/PHP 8.3/SQLite và Edge headless; không phải môi trường production.

Preview: [danh sách desktop](R33-rebuild/guides-desktop.png), [danh sách mobile](R33-rebuild/guides-mobile.png), [chi tiết desktop](R33-rebuild/guide-desktop.png), [chi tiết mobile](R33-rebuild/guide-mobile.png).

Đã kiểm thử bổ sung: bài thực hành riêng giữ URL chi tiết, validation đúng phiên bản hiển thị đúng nhãn và cho phép mã, validation cần rà soát được ghi lịch sử và ẩn mã; anchor heading cũ được giữ và mục lục trỏ đúng; ba template không tràn ngang tại 320/768/1024 ngoài preview 390/1440. Search có kết quả/rỗng/lỗi, query noindex và không canonical; archive bộ thực hành redirect 301 đúng đích.

Đã tự rà preview desktop/mobile. Nhóm dùng danh mục chính đã có làm nhãn chủ đề; không thêm field mục tiêu hoặc sửa nội dung thật. Nội dung bước làm/yêu cầu/kết quả/phục hồi do CMS cung cấp, template không sinh chỉ dẫn giả. Fixture validation chỉ chứng minh hành vi UI, không chứng minh bài thật đã chạy thành công.

Giới hạn release: đối chiếu dữ liệu thật, Firefox/WebKit, full URL/data suite và Plesk/MariaDB thuộc gate release. Các kết quả local không xác nhận production. R3.3 đã hoàn tất; chưa có quyền R4, merge, candidate hoặc production.
