# Kiểm thử dispatcher với WordPress và MariaDB thật

Chạy `npm run test:css-dispatcher-native` trên Docker local. Script chỉ chấp nhận Docker Desktop Linux trên Windows hoặc socket Docker local trên Linux; không nhận host/path/key override. Image WordPress và MariaDB pin digest trong script và workflow `.github/workflows/css-dispatcher-native-check.yml`.

Mỗi lần chạy tạo Git fixture, package CSS synthetic từ baseline R6, credential/key random, hai container và network internal riêng. Không publish port; source/root read-only, dữ liệu trên tmpfs. WordPress chặn external HTTP/mail/cron. Setup chạy root trong container mới; dispatcher chạy PHP CLI UID10044/GID1004 với mysqli/wpdb và database thật. Cleanup chỉ xóa tài nguyên mang token của đúng lần chạy; bộ run-clean dọn fixture/cache sau khi container đóng. Image được giữ làm dependency.

Chín nhóm kiểm: binding native; inspect không tạo mutex; sai pin/baseline/key/capability bị chặn trước ghi; native install/retry giữ data; chữ ký sai bị chặn; proof/finish và cleanup lock; native rollback khi proof báo HTTP503; proof baseline mới xác nhận rollback; protected data drift giữ chỉnh sửa/journal/lock. Không restore database để vượt guard.

CI dùng Ubuntu24.04, Node22, checkout đúng source head với lịch sử Git để lấy baseline R6; action pin SHA, permissions contents read, không credentials/secrets/deploy. Kết quả JSON và cleanup được ghi trong job log. Không tạo artifact ZIP phát hành hoặc key thật.

Giới hạn: HTTP observations được mô phỏng; marker/CSS lấy từ filesystem thực. Ba plugin bên thứ ba chỉ là metadata stub, plugin VNE/theme dùng ZIP từ profile. Maintenance filter là fixture CLI, chưa kiểm wrapper WP Toolkit/Plesk hoặc hard-stop native database. PASS không chứng nhận hosting, producer HTTP, key transport hay coordinator production.
