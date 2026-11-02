# Phát hành CSS bằng một lệnh

Sau khi sửa CSS, chạy kiểm tra liên quan, commit/push và tạo PR nguồn, chạy:

```powershell
npm run release:auto -- <so-PR> <thoi-diem-nhan-yeu-cau-ISO>
```

Thời điểm là tùy chọn; nếu bỏ qua, đo từ lúc lệnh bắt đầu. Lệnh dùng quyền tự động đã cấp trong AGENTS.md. Chỉ áp dụng thay đổi CSS cấp A của theme hiện hành; không tự mở rộng sang template, database hoặc nội dung. Kiểm tra local liên quan vẫn phải hoàn tất trước khi tạo PR.

Lệnh đợi fast và package đúng source CSS (package có kiểm native update/rollback), xác minh/publish candidate bằng publisher hiện có, merge đúng head và đối chiếu cây Git, dispatch promote đúng pin, đợi kết quả, kiểm HTTP/marker/version/hash CSS, tạo và merge PR baseline sau khi cả ba metadata CI đạt. Workflow host-installer riêng không trigger cho CSS; không đợi một run không được tạo. Giữ previous-theme rollback; không tải code trực tiếp lên hosting, đăng nhập Plesk hay kiểm giao diện bằng browser.

Biên nhận và thời gian từng bước lưu tại `artifacts/release-auto/<so-PR>/receipt.json`; gói CI bất biến giữ ở `artifacts/theme-ci/`. Dùng lại cùng lệnh để tiếp tục các bước đọc bị gián đoạn. Mỗi thao tác ghi lưu intent trước khi gọi dịch vụ: nếu bị gián đoạn mà kết quả chưa được ghi, lệnh dừng và yêu cầu inspect đúng ref/PR/run. Không tự xóa intent, tạo lại candidate, dispatch lại hay vượt journal. Run-clean dọn cache/file tạm, giữ biên nhận và artifact.

Sau khi lệnh báo PASS, attach PR baseline từ `closeoutUrl` vào chat và báo ngắn cho chủ dự án kiểm tra website. Đây là điều phối local, không bật lịch hay automation mới trên hosting. Phần chuẩn bị PR nguồn vẫn do Codex thực hiện để chỉ stage đúng phạm vi.

Mục tiêu cho chỉnh sửa CSS nhỏ: khoảng 3 phút thay vì 6 phút 30. Đây là mục tiêu, chưa phải số đo thực tế của lệnh mới. Xác nhận bằng lượt thay đổi thật tiếp theo; không đổi màu hay deploy thử chỉ để benchmark tooling.
