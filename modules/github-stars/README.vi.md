# U1 — snapshot sao GitHub, local

**Cập nhật U2:** implementation hiện nằm trong `plugins/vne-library-core/stars.php`, được plugin0.4.3 tải; file collector trong thư mục này là entry tương thích cho phát triển. Theme0.7.3 chỉ đọc snapshot đã lưu. Các mô tả “chưa tích hợp” bên dưới ghi phạm vi U1 lúc nghiệm thu; không có HTTP adapter thật hoặc lịch chạy nào được bật trong U2.

Thư viện phát triển, chưa được plugin tải. Không có hook, route, UI, cron hoặc HTTP client thật. Dùng lại 100 repo ID từ C100; không nhập lại bài. U1 được chủ dự án duyệt theo yêu cầu “làm tiếp đi, đơn giản thôi”.

## Thiết kế gọn

- Mỗi repo ID có một option `vne_stars_repo_<id>`, không autoload, chỉ giữ snapshot gần nhất. Không tạo bảng, không đổi schema biên tập và chưa lưu lịch sử tăng trưởng.
- `vne_stars_sync_batch($repos, $transport, $enabled = false, $now = null)` yêu cầu bật rõ ràng, capability `vne_manage_library` và transport callable được truyền vào. Mặc định tắt; không có đường gọi mạng ngầm.
- Input chỉ gồm `id` và `full_name` (owner/repo). Tối đa 5 repo khác nhau/lượt, 20 request/giờ UTC dùng chung bộ đếm lưu bền. Request tính trước khi gọi transport, kể cả request lỗi/304. Không hoàn quota khi worker bị ngắt.
- Dùng lock atomic hiện có của core. Chỉ chủ token được ghi kết quả/xóa lock; không tự chiếm lock cũ. Worker chết cứng có thể để lại lock, cần đối chiếu rồi gỡ có kiểm soát ở bước vận hành sau.
- GET metadata HTTPS GitHub, tuần tự, không redirect, giới hạn body 64 KiB/timeout 10 giây. API version/Accept/auth context được gắn vào cache key. Chưa có token hoặc adapter HTTP thật; adapter sau này phải thực thi các giới hạn này.
- 200 cần đúng ID/tên và stars nguyên không âm. 304 chỉ dùng với ETag/cached representation khớp; cập nhật lần xác nhận, giữ ngày nhận giá trị 200. Sao giảm hoặc bằng 0 thật được chấp nhận.
- Lỗi giữ snapshot tốt cuối; không lưu body/thông báo lỗi/credential. 403/429 và quota cạn tạo pause chung theo Retry-After dạng giây/reset, tối thiểu 60 giây, mặc định 1 giờ. Retry lỗi bắt đầu 5 phút và tăng dần; thành công/404 chờ 24 giờ. Chưa hỗ trợ Retry-After dạng HTTP-date.
- `vne_stars_snapshot()` trả projection an toàn; `stale` khi lỗi hoặc lần xác nhận cuối quá 48 giờ. Không có snapshot hợp lệ thì trả `null`, không tạo số 0 giả. `status` chỉ mô tả lần lấy thống kê, không phải chứng nhận repo/công cụ còn hoạt động.

Không viết posts, postmeta, taxonomy, approved revision, validation hoặc nhật ký nhập nội dung. Các số sao trong HTML cũ vẫn là snapshot biên soạn. Rename/redirect chưa theo; lỗi identity giữ số cũ, cần bước rà soát sau. Sáu tài nguyên seed ngoài C100 chưa tự gán repo ID.

## Kiểm thử

`npm run test:github-stars` chạy qua run-clean, tạo WordPress/SQLite riêng và transport giả. Chặn HTTP/email thật, giữ hash database/config local gốc. Fixture bị dọn cả khi thất bại; kết quả nghiệm thu nằm trong `docs/acceptance/U1-github-stars/`.

U2 mới tích hợp plugin/UI/profile; adapter live, queue lịch chạy, GitHub/CI và Plesk cần các cổng được duyệt tương ứng. U1 không thay phiên bản hay payload đang phát hành.
