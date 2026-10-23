# Đề xuất đưa nội dung mẫu S13 lên staging

Chưa thực hiện. Đích duy nhất: `https://staging-store.vneconomics.com/`, DB `vne35060_wp_udx1z`, đang noindex. Đây là nội dung giữ lại để chủ dự án thử website, khác các fixture vừa được xóa.

## Nội dung cụ thể

- 6 tài nguyên: Web Dev for Beginners; MDN Learning Area; Web Design Guidelines; Astro Basics; React Best Practices; Pico CSS.
- 4 hướng dẫn: Làm landing page Mộc Studio với Codex trên Windows; Trước bài đầu: chuẩn bị công cụ và quyền truy cập; Sửa lỗi bài đầu: ghi lại điều đang xảy ra; Sau bài đầu: hiểu HTML và CSS vừa tạo.
- 1 bộ thực hành: Bộ thực hành landing page cho dịch vụ chụp ảnh.
- 3 danh mục: Nền tảng web; Mẫu dự án; Skills cho AI agent. Chỉ tạo mới hoặc dùng đúng danh mục đã xác minh, không đổi phân loại của bài cũ.

Nguồn chuẩn bị: `scripts/fixtures/s13-integrated-seed.php`, `docs/content-samples/S10-moc-studio-lesson.html` và quan sát nguồn S02 ngày 19/10/2026. Giữ ngày quan sát và nhãn chưa xác định; không coi đây là việc chạy lại các repo hoặc xác minh nguồn hiện tại.

## Cách nhập dự kiến

Tạo bộ nhập riêng có guard staging, manifest/hash và kiểm tra trùng; không chạy nguyên script seed local, không chép database/config/tài khoản từ local. Giữ nguyên 14 bài/trang clone, Astra và dữ liệu WooCommerce. Không gọi AI, thanh toán hoặc email. Không tự ghi bằng chứng PASS mới; bằng chứng lịch sử S10 chỉ nhập sau đối chiếu phạm vi/revision phù hợp, nếu chưa xác nhận thì giữ not_tested.

Sau nhập, kiểm tra card/detail, hai CTA, tìm/lọc, bài Mộc Studio, biểu mẫu báo lỗi, cache và cleanup dữ liệu thử. Các mục nội dung được duyệt nhập là sản phẩm cần giữ. Giữ noindex, backup/khôi phục và không đổi production. Nhập nội dung không tự hoàn tất S15 hoặc cho phép S16.
