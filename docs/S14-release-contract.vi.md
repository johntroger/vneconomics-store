# S14 — Gói phát hành và dry-run local

Chủ dự án cho phép riêng S14 ngày 23/10/2026 bằng yêu cầu “làm s14”. S13 còn chờ phản hồi trải nghiệm; không tự ghi nhận đã được nghiệm thu giao diện. S15/S16 chưa được phép.

Phạm vi: `scripts/release-policy.mjs`, `release-lib.mjs`, `build-s14-release.mjs`, hai runner kiểm thử S14 và `postflight-s14.mjs`, npm scripts, CI kiểm tra gói và hồ sơ này. Không sửa mã theme/plugin hoặc dữ liệu gốc.

Tiêu chí: build hai ZIP từ cùng SHA commit, tái tạo byte giống nhau; allowlist từng file, không symlink/submodule/executable; không DB/uploads/config/key/tooling/README trong payload. Manifest bên ngoài ZIP ghi SHA nguồn, tree, SHA256/size từng file và ZIP, phiên bản 0.7.0/0.4.2, schema 3, cặp trung gian plugin 0.4.2 + theme 0.6.0. ZIP có đúng một thư mục thành phần, không có `wp-content/` hay mã ngoài thành phần.

Mã đóng gói chỉ đọc Git bằng `rev-parse`, `ls-tree`, `show`; không push hoặc sửa ref. Artifact được giữ tại `artifacts/releases/<source_sha>/`, từ chối ghi đè. Dùng commit nhánh phát triển làm ứng viên local vì main chưa được duyệt phát hành; trước production phải chốt riêng commit/main hoặc ref được chủ dự án duyệt, không coi ứng viên này là payload live.

Kiểm thử: `npm run test:release -- <ref>` tái tạo hai lần, giải ZIP bằng PowerShell độc lập, so hash, thử gói hỏng/manifest giả/file lạ/path traversal và cổng xác nhận giả lập. `npm run test:release-runtime -- <artifact-dir> <ref>` giải chính ZIP vào WordPress/PHP8.3.36/SQLite mới: kiểm tra trang chủ/danh mục/chi tiết/bài học với cặp trung gian, cặp mới và cặp sau restore; cố ý tạo transfer theme dở rồi restore file, kiểm tra file thừa bị loại bỏ. Không tự rollback database.

Mỗi runner qua run-clean, tuần tự; server đóng trước cleanup. Giữ artifacts và bằng chứng; giữ database `.local/site` và `.local/s13-site`. Bản preview cần dừng trong lúc runner dùng khóa cleanup chung.

Kiểm tra gói CI chạy riêng trên Windows/Node22, không cần WordPress hoặc dependency bên ngoài. Workflow chỉ kiểm tra khi yêu cầu thủ công, quyền Git read-only, không secrets/deploy/upload/push. Trong phiên này không gọi GitHub Actions hoặc dịch vụ ngoài; chạy cùng lệnh ở local và báo rõ CI remote chưa chạy.

PHP native yêu cầu quyền đọc file bình thường: sandbox hiện tại làm `is_readable` trả false dù đọc file được. Runner runtime chạy qua cơ chế duyệt quyền như S13, không sửa WordPress core hoặc bỏ kiểm tra quyền.

S14 PASS cần packaging/runtime/diff check/cleanup đều đạt và có checklist triển khai, restore. Điều đó không chứng nhận MySQL/Plesk/CDN hoặc cho phép S15. Dừng báo cáo để chủ dự án duyệt bước kế tiếp.
