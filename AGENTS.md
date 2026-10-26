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

# Đường phát hành bắt buộc — R6 ngày 26/10/2026

- Cập nhật theo chỉ đạo trực tiếp của chủ dự án ngày 26/10/2026: từ nay bỏ bước staging, dùng local → GitHub/CI → payload GitHub → private inbox Plesk production → hậu kiểm production. Quy tắc này thay yêu cầu phải thử staging trước production trong các kế hoạch/runbook cũ. Giữ staging, backup và bằng chứng lịch sử; không tự xóa hay đổi cấu hình staging. Mỗi lượt production vẫn theo phạm vi/ref/gate đã được duyệt, kiểm local/CI, backup và rollback tương thích; việc bỏ staging không tự bật scheduler hoặc cho phép upload trực tiếp từ local.

- Tuân thủ `docs/deployment-runbook.vi.md` và `docs/release-checklist.vi.md`: local kiểm thử → source SHA trên GitHub/CI đạt → payload commit SHA trên GitHub → Plesk nhận vào inbox private → đối chiếu ref/manifest/hash/baseline → thao tác đúng phạm vi đã duyệt → hậu kiểm/cleanup/biên nhận.
- Không upload ZIP hoặc mã ứng dụng/nội dung trực tiếp từ local lên Plesk/WordPress. Trình cài native chỉ dùng ZIP đã được Plesk nhận từ payload GitHub và kiểm chứng; `payload.zip` local không phải đường triển khai.
- Nhánh payload hiện hành là `release-staging` và `release-production`, không dùng `release/*` vì xung đột nhánh `release` lịch sử. Giữ Manual và inbox ngoài document root; không tự đổi ref/đích, post-deploy action, key, quyền hoặc bật automation.
- Source hồ sơ/PR mới hơn không tự thay source đang phát hành. Luôn ghi riêng source SHA, CI run, payload SHA, manifest SHA256, đích và baseline SHA256. Push/CI/build hoặc merge không tự cho phép deploy; R6 không cấp quyền merge main.
- Chủ dự án duyệt phạm vi/gate phát hành. Agent được rà soát chất lượng nội dung theo quyền đã cấp, nhưng không coi đó là quyền mở lô, đổi ứng dụng, dùng API có phí hoặc phát hành bước chưa duyệt. Không xin lại đúng quyền đã cấp rõ cho bước đang làm.
- Nếu baseline/file/nội dung hoặc journal xung đột, dừng và giữ chỉnh sửa; không ghi đè, relabel journal cũ, phá lock hoặc restore DB production để vượt guard. Chỉ retry cùng approval sau khi đã xác định trạng thái; trạng thái không rõ phải inspect.
- Profile/tool R2–R5 chỉ hỗ trợ baseline đã pin. Lô mới, phiên bản mới hoặc migration cần bước local/profile/kiểm thử và duyệt staging/production riêng; không dùng helper R5 như bộ phát hành tùy ý.
- Các đoạn S14–S16 về ZIP local là lịch sử, không phải runbook hiện hành. Giữ bằng chứng/backup/gói quay lui thật và lịch sử đường triển khai trung thực.
