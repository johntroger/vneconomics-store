Nguồn các bước website gần đây chưa có trên GitHub, trong khi hosting đã được cập nhật bằng gói local. PR này đồng bộ nguồn hiện có và bổ sung đường đóng gói local → GitHub → Plesk có manifest, checksum và cổng phê duyệt.

Ứng dụng được giữ ở VibeLab0.7.2, plugin0.4.2/schema3. Payload dùng lại100 tài nguyên, bộ ba hướng dẫn và bằng chứng đã duyệt; receiver nhận diện nội dung đã có, tiếp tục nhập bị ngắt, từ chối xung đột và không tạo trùng. Hai đích hosting trong cấu hình vẫn disabled, private inbox chưa được gán. Lịch sử gói/biên nhận cũ được giữ để truy vết.

CI mới checkout đúng SHA đầu nhánh PR, chạy kiểm gói tái tạo và profile S14 lịch sử trên Windows2025/Node22, rồi lưu ứng viên1 ngày để đối chiếu local. Workflow chỉ đọc source, không có secret hosting hay bước deploy.

Kiểm local R2:217 kiểm gói,154 kiểm receiver,243 kiểm WordPress/UI gồm14 URL cũ,76 kiểm S14; cleanup và hash DB/config gốc đạt. Rà soát văn bản lịch sử và inventory10 ZIP đạt trong giới hạn ghi ở hồ sơ. Kết quả GitHub Actions thực tế được ghi riêng trong R3.

Giữ PR ở Draft để xem xét nguồn. R3 không merge main, không push nhánh payload/release và không thay Plesk; staging/production cần gate R4/R5 riêng.

R3 PASS trên source `71a914ea7e1746620a0f055dfec26ece3c231ea6`: [Actions40267580030](https://github.com/johntroger/vneconomics-store/actions/runs/40267580030),217 kiểm pipeline+75 S14, build/upload thành công trên Windows2025/Node22. Đã tải artifact và rebuild độc lập:11/11tệp khớp local;9 tệp payload giữ nguyên byte so với R2. Manifest SHA256 `42876608ef3ebfe3de131c9de4a8ef7136e925dfc89da5987bb58f8b4c3afaf3`. Nhánh release/Plesk connection-check vẫn giữ nguyên, không merge/deploy. Lỗi detached refs ở lượt đầu đã sửa và giữ biên nhận.
