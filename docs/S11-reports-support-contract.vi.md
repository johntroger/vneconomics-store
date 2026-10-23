# S11 — Báo lỗi và nội dung hỗ trợ

Chủ dự án duyệt S11 ngày 22/10/2026. Theme 0.6.0, plugin 0.4.0;
schema thư viện giữ 3. Chỉ local; không S12, gửi thư/API, tự publish hay deploy.

## Quyết định vận hành

Báo lỗi nhận vào hàng đợi riêng trong WordPress, menu Thư viện > Báo lỗi riêng.
Người có vne_manage_library (biên tập thư viện/quản trị trong fixture) xem và xóa.
Không email tự động, webhook, cron mới, tự chạy repo hoặc tự sửa nội dung.
Không giả địa chỉ email, hotline, nhân sự, lịch biên tập hoặc SLA.
Email người báo là tùy chọn để người biên tập có thể liên hệ thủ công nếu cần;
phiên S11 không gửi thư cho bất kỳ ai.

Các trang query route vne_support: ho-tro, gioi-thieu, tieu-chi,
quyen-rieng-tu, dieu-kien, cau-hoi, bao-loi. Dùng URL WordPress sinh từ home_url;
không cần thay rewrite/flush trên website đang chạy hoặc seed Page vào DB thật.
Footer có các liên kết thật; tài nguyên và bài học có Báo lỗi nội dung này.

## Form và lưu

- Chỉ nhận một nội dung thư viện đang publish; không form gợi ý repo hoặc đính kèm.
- Server tự gắn ID, tiêu đề đã duyệt, permalink và approved_revision. Không tin
  title/URL do khách gửi; sửa target, signature hoặc version sẽ bị từ chối.
- Người dùng chọn loại vấn đề, mô tả 20–2.000 ký tự, email tùy chọn và đồng ý lưu.
  Dữ liệu text được làm sạch và escape khi hiển thị. Không nhận array/field lạ.
- Cảnh báo không gửi API key/mật khẩu/dữ liệu khách hàng. Một số mẫu khóa/mật khẩu
  được từ chối và xóa khỏi phần phản chiếu; đây không phải bộ phát hiện mọi bí mật.
- Lưu bằng một wp_insert_post với post_status private, post_author 0 và JSON trong
  post_content; post_type vne_report không public/queryable/REST/export, không comments.
- Record chỉ gồm resource_id/resource_title/resource_url/approved_revision/kind/
  description/email/submitted_at/ticket_hash; không lưu nonce/IP thô/user agent.
- Chỉ sinh xác nhận sau khi insert thành công. POST thành công redirect303 sang receipt.
  Xác nhận ký HMAC, tồn tại 15 phút, chỉ chứa mã/ngày/hmac, không chứa email/mô tả.
  Receipt hết hạn không có nghĩa báo cáo bị xóa hay lần lưu trước thất bại.
- Lỗi nhập liệu/phiên/phiên bản/rate/storage có HTTP400/403/409/429/503 và thông báo thật.
  Dữ liệu an toàn giữ để sửa; bí mật nhận diện được không phản chiếu. Không có success giả.
- Refresh receipt không POST lại. Cùng ticket đã nhận trả cùng mã, không tạo bản mới.
  Không có API công khai để liệt kê/tra cứu nội dung báo cáo.

## Chống spam tối thiểu và riêng tư

Nonce WordPress không được xem là xác thực quyền. Form có ticket HMAC chứa ID,
approved_revision, thời gian và random; hết hạn 2 giờ. Honeypot không nằm trong
tab order. IP trực tiếp từ REMOTE_ADDR được băm HMAC cùng bucket thời gian, không
tin X-Forwarded-For. Trong mỗi bucket15 phút: tối đa3 bản lưu, tối đa10 lần thử lưu
hợp lệ. Đây là giới hạn theo kết nối; proxy/NAT có thể gộp người dùng.

Cập nhật S13: khóa ticket/rate dùng INSERT IGNORE nguyên tử qua vne_library_lock_insert; add_option có nhánh upsert nên không dùng làm mutex. Mỗi chủ sở hữu có UUID,
finally giải phóng bằng SQL điều kiện đúng name/value. Không giành khóa theo TTL
khi một tiến trình có thể còn hoạt động. Nếu tiến trình chết, yêu cầu liên quan
có thể bị chặn; mở form mới/thử bucket sau hoặc quản trị rà khóa. Cần kiểm tra
recovery của hạ tầng ở S15. Không chứng nhận chống bot phân tán hoặc WAF/load.

Form/receipt, kể cả lỗi trên biểu mẫu, có no-store/no-cache, noindex; form/receipt no-referrer.
Báo cáo riêng bị chặn ở truy vấn frontend, tìm kiếm và feed; admin vẫn phải
kiểm capability trước đọc, nonce trước xóa. Xóa chỉ áp dụng post_type vne_report
đã kiểm tra, xóa vĩnh viễn trong DB hiện tại, không hứa xóa cả backup.
Không xóa nguồn/tài nguyên/fixture của người dùng qua chức năng này.

Chính sách công khai mô tả đúng giới hạn: cần xóa khi hết mục đích, rà báo cáo
quá30 ngày bằng thao tác người biên tập, chưa có xóa theo lịch. Log hosting/backup
là tầng riêng chưa xác minh S15, không hứa hosting không ghi IP.
Yêu cầu về dữ liệu dùng Vấn đề khác và mã báo cáo, cần biên tập đối chiếu;
nội dung gốc bị ẩn có thể mở form từ nội dung công khai khác.

## Giao diện và kiểm thử

Giữ hệ màu/font/layout S02–S10. Sidebar hỗ trợ chuyển thành liên kết nhóm trên mobile.
Form native GET/POST không cần JS; JS chỉ báo đang gửi/khóa nút và phục hồi khi Back.
FAQ dùng details/summary native. Trang thiếu plugin báo503, không dựng form giả.
Thiếu target hướng dẫn mở từ nội dung; private/không tồn tại cùng404, không lộ tên.

Test qua run-clean trong fixture: backend nhận/lỗi/duplicate/rate/nonce/version/private/
secret/Unicode/escape/lock; UI native submit/receipt/refresh/retry/no-JS/mobile/FAQ;
HTTP privacy/cache và xem/xóa hàng đợi theo quyền. Mock lỗi tại API insert WordPress,
không làm hỏng DB thật. Chặn email qua pre_wp_mail và kiểm số lần thử bằng0.
Mọi browser request ngoài loopback bị chặn; media admin Gravatar cũng bị chặn.

Hồi quy S05 (bao gồm S03/S04), S08, S10 và S06. Bằng chứng cũ giữ nguyên;
bằng chứng mới trong acceptance/S11. Đối chiếu plugin/theme thực sự chạy, hash DB/
config gốc, cổng và dữ liệu tạm sau cleanup. Không kiểm thử hosting/MySQL/cache,
dịch vụ email thật hoặc người mới ở bước này.

Nguồn kỹ thuật đã mở đọc ngày22/10/2026:
- https://developer.wordpress.org/reference/functions/wp_verify_nonce/
- https://developer.wordpress.org/reference/functions/wp_insert_post/

Đây là mô tả chức năng/dữ liệu hiện tại, không phải chứng nhận pháp lý. Trước mở
thật cần người nhận/nhịp rà hàng đợi, hosting/log/backup/recovery phù hợp; chưa
tự suy các điều kiện vận hành đó đã hoàn tất từ việc S11 local đạt.


### Bổ sung sau rà soát và kiểm thử retry

Loại vne_report gắn rõ toàn bộ capability đọc/sửa/xóa/tạo/xuất bản vào
vne_manage_library, không dùng mặc định quyền post thông thường. UI vẫn không
công khai/native REST. Kiểm tra thêm vai trò WordPress thường không có quyền.

Khi POST lỗi nhưng ticket còn đúng HMAC, chưa hết hạn và vẫn khớp nội dung/phiên
bản hiện tại, form giữ nguyên ticket đã gửi. Không tạo random mới cho một lần
thử lại có thể đã ghi. Phiên/target/version thực sự không còn hợp lệ mới cấp
ticket theo ngữ cảnh hiện tại và yêu cầu người đọc kiểm tra lại.

Giới hạn saved giữ chỗ trước insert. Nếu wp_insert_post trả lỗi xác định chưa
ghi, trả lại chỗ đó; nếu có exception chưa xác định kết quả, giữ chỗ để không
vượt giới hạn vì một bản ghi đã tồn tại. Do đó một số lỗi server có thể tính
vào giới hạn. Retry ticket đã nhận được kiểm tra trước rate và xác nhận mã cũ.

Fixture thử cả WP_Error trước insert và exception từ hook sau khi row đã ghi:
lần đầu không row, lần sau có đúng1 row nhưng HTTP503 nói chưa xác nhận; sau
phục hồi, cùng ticket nhận303/receipt mà không thêm row. Không mô phỏng bằng
thông báo thành công cứng hoặc gửi email/dịch vụ ngoài.
