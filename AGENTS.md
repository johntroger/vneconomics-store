# Quy tắc dọn dữ liệu sau mỗi lần chạy

- Theo yêu cầu của chủ dự án, sau mỗi lần chạy phải tự dọn file tạm, cache của lần chạy và dữ liệu kiểm thử có thể tái tạo, kể cả khi kiểm thử thất bại. Không cần hỏi lại để dọn những dữ liệu này.
- Chạy kiểm thử qua các lệnh npm đã tích hợp `scripts/run-clean.mjs`. Khi cần chạy một script local khác, có thể dùng `node scripts/run-clean.mjs script scripts/<ten-script>.mjs`; chỉ dùng cho script đã được cho phép chạy trong phiên làm việc.
- Cơ chế dọn chỉ xóa tài nguyên tạm mới tạo trong lần chạy, trong danh sách đường dẫn được phép. Không chạy nhiều tác vụ tạo fixture cùng lúc. Không xóa toàn bộ `tmp/` hoặc dựa vào tuổi file để quyết định dữ liệu có quan trọng không.
- Giữ mã nguồn, Git, thư viện cần chạy, nội dung/ảnh/tài liệu gốc, database local đang dùng, bản sao lưu thật, gói phục hồi, cấu hình/tài khoản và bằng chứng nghiệm thu. Kết quả người dùng yêu cầu tạo ra là sản phẩm cần giữ.
- Với thao tác ngoài bộ chạy tự dọn, xác định rõ file tạm thuộc lần chạy và dọn sau khi các tiến trình/database đã đóng. Nếu chưa rõ vai trò của file, giữ lại và báo thay vì xóa.
- Không tự đăng bài, gọi dịch vụ ngoài, triển khai hoặc gửi tin nhắn chỉ để kiểm tra việc dọn file.

# Cổng kiểm thử và phê duyệt từng bước — yêu cầu chủ dự án ngày 19/10/2026

- Tuân thủ docs/implementation-plan-gated.vi.md khi triển khai website.
- Chỉ thực hiện bước cụ thể đã được chủ dự án đồng ý. Trong bước đó được tự sửa lỗi đúng phạm vi và kiểm thử lại.
- Code xong phải kiểm thử; còn lỗi chặn, kiểm thử bắt buộc chưa chạy hoặc cleanup lỗi thì chưa hoàn tất, không chuyển bước.
- Sau mỗi bước báo cáo thay đổi, kiểm thử, bằng chứng và hạn chế, rồi dừng chờ chủ dự án đồng ý rõ ràng mới code bước tiếp theo. PASS hoặc duyệt toàn bộ kế hoạch không tự cho phép thực hiện mọi bước.
- Không tự deploy staging/production, chạy API có phí, bật automation hoặc xuất bản từ sự đồng ý dành cho bước local. Các bước tương ứng cần được cho phép cụ thể; không xin lại quyền đã được cấp rõ cho chính bước đó.
