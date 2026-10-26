Nguồn các bước website gần đây chưa có trên GitHub, trong khi hosting đã được cập nhật bằng gói local. PR này đồng bộ nguồn hiện có và bổ sung đường đóng gói local → GitHub → Plesk có manifest, checksum và cổng phê duyệt.

Ứng dụng được giữ ở VibeLab0.7.2, plugin0.4.2/schema3. Payload dùng lại100 tài nguyên, bộ ba hướng dẫn và bằng chứng đã duyệt; receiver nhận diện nội dung đã có, tiếp tục nhập bị ngắt, từ chối xung đột và không tạo trùng. Hai đích hosting trong cấu hình vẫn disabled, private inbox chưa được gán. Lịch sử gói/biên nhận cũ được giữ để truy vết.

CI mới checkout đúng SHA đầu nhánh PR, chạy kiểm gói tái tạo và profile S14 lịch sử trên Windows2025/Node22, rồi lưu ứng viên1 ngày để đối chiếu local. Workflow chỉ đọc source, không có secret hosting hay bước deploy.

Kiểm local R2:217 kiểm gói,154 kiểm receiver,243 kiểm WordPress/UI gồm14 URL cũ,76 kiểm S14; cleanup và hash DB/config gốc đạt. Rà soát văn bản lịch sử và inventory10 ZIP đạt trong giới hạn ghi ở hồ sơ. Kết quả GitHub Actions thực tế được ghi riêng trong R3.

Giữ PR ở Draft để xem xét nguồn. R3 không merge main, không push nhánh payload/release và không thay Plesk; staging/production cần gate R4/R5 riêng.

R3 PASS trên source `71a914ea7e1746620a0f055dfec26ece3c231ea6`: [Actions40267580030](https://github.com/johntroger/vneconomics-store/actions/runs/40267580030),217 kiểm pipeline+75 S14, build/upload thành công trên Windows2025/Node22. Đã tải artifact và rebuild độc lập:11/11tệp khớp local;9 tệp payload giữ nguyên byte so với R2. Manifest SHA256 `42876608ef3ebfe3de131c9de4a8ef7136e925dfc89da5987bb58f8b4c3afaf3`. Nhánh release/Plesk connection-check vẫn giữ nguyên, không merge/deploy. Lỗi detached refs ở lượt đầu đã sửa và giữ biên nhận.

R4 đã được chủ dự án duyệt riêng và đã PASS trên staging. Source cuối `f587eea20526f32294a8826949d7407337040ec6`, [CI40284129915](https://github.com/johntroger/vneconomics-store/actions/runs/40284129915)218+75 PASS. Nhánh payload thực tế `release-staging` (release/staging xung đột release lịch sử), payload đầu `f9860e94cf6129f17fe4786d64621f71f7ecec9c`, payload cuối `602d9f55793d53d29f0654ae01e5daf5841e9f9c`, manifest cuối SHA256 `374f88cb98f9b6315ddf14a112827bc42da89d24d88ad206e96ea13490c8af3c`.

Plesk Manual nhận đúng10tệp/0hash lệch vào private inbox0700 ngoài document root. Theme38/plugin10file MATCH; rollback theme36file và fingerprint baseline đạt; nhập/retry đạt106 tài nguyên/6 hướng dẫn/1 thực hành,130typedrows,103naturalkey. HTTP650 kiểm/145GET,14URL cũ,3guide copy/checklist,6case responsive390/320 đạt; staging noindex0. Lượt adopt thật trên MariaDB dùng receipt riêng: chỉ thêm option receipt, toàn bộ posts/meta/runtime và options cũ giữ nguyên, journal nhập đầu vẫn APPLIED_MISSING_CONTENT; retry ALREADY_ADOPTED. Fingerprint cuối `22e86a5a80e471fef39fa0bb267059a4a708c358260c59587d02f4eb92ff562d`. Backup trước R4 giữ nguyên,14.409file CRC0lỗi; upgrade/upgrade-temp-backup rỗng và pipeline lock0.

Mã/công cụ và bằng chứng lượt nhập đã được commit trong source trên; biên nhận run cuối sau CI được giữ local và tóm tắt ở mô tả này, tránh vòng commit metadata đổi sourceSHA. Production/kết nối release connection-check giữ nguyên, PR vẫn Draft và chưa merge. R5/R6 chưa được duyệt; production transport trong payload vẫn disabled/null.
