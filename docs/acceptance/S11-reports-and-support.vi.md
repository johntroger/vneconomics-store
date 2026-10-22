# S11 — Nghiệm thu báo lỗi và trang hỗ trợ

Ngày 22/10/2026. **PASS kỹ thuật local trong phạm vi dưới đây.**
Chủ dự án duyệt S11; S12 chưa được phép. Chưa deploy.

## Kết quả

Theme 0.6.0 có form báo lỗi từ tài nguyên/bài học, navigation và nội dung thật:
giới thiệu, tiêu chí tuyển chọn, FAQ, trợ giúp/liên hệ, quyền riêng tư và điều kiện
sử dụng. Giữ thiết kế/font đã có; form và FAQ dùng được không cần JavaScript.

Plugin 0.4.0 (schema thư viện vẫn3) lưu báo lỗi vào hàng đợi riêng WordPress,
menu Thư viện > Báo lỗi riêng. Loại vne_report không public/queryable/REST/export;
mọi capability native gắn vne_manage_library. Không thêm email tự động, webhook,
fetch URL tùy ý, tự sửa tài nguyên hoặc tự xuất bản.

Form tự gắn ID/permalink/tiêu đề/approved_revision đã duyệt. Có loại vấn đề,
mô tả20–2.000 ký tự, email tùy chọn và xác nhận đồng ý. Không đính kèm hoặc yêu cầu
khóa/mật khẩu; một số dạng bí mật được từ chối, không xem bộ lọc là nhận diện mọi bí mật.
Nguồn bị ẩn, sai phiên hoặc thay phiên bản không được âm thầm gán báo cáo sang nội dung khác.

Xác nhận chỉ có sau khi lưu, POST redirect303 sang receipt có chữ ký15 phút, không
chứa mô tả/email. Refresh và cùng ticket không tạo bản trùng. Nonce, HMAC2 giờ,
honeypot, quota bucket15 phút và khóa sở hữu là chống spam tối thiểu, không phải WAF.
Form/receipt có no-cache/noindex/no-referrer.

## Kiểm thử đã đạt

| Lệnh npm | Kết quả |
|---|---|
| test:support | 61 UI/HTTP +37 backend PASS |
| test:support-revisions-regression | 69 dữ liệu +265 trạng thái +54 tổ hợp +50 phiên bản; UI/concurrency/restart PASS |
| test:support-detail-regression | 55 kiểm tra +19 fixture PASS |
| test:support-lesson-regression | 55 kiểm tra +hai luồng PowerShell PASS |
| test:support-home-regression | 59 kiểm tra PASS |

Các bộ hồi quy giữ nguyên assertion của bước trước và lưu riêng dưới S11.
Không báo đã chạy toàn bộ các suite khác ngoài bảng. Riêng tìm kiếm/feed/API không
lộ báo cáo được thử trực tiếp trong suite S11. Mọi lệnh qua scripts/run-clean.mjs,
không tạo nhiều fixture cùng lúc; browser/server đóng trước cleanup.

- Backend: hợp lệ/invalid type/length/email/consent/honeypot/nonce/HMAC/hết hạn/
  target private/sai phiên bản/quota; Unicode/dấu ngoặc/backslash; thẻ bị làm sạch;
  khóa giữ và giải phóng; record tối thiểu không IP thô/user agent/nonce;
  quyền role thông thường và role được quản lý.
- UI: trang hỗ trợ có nội dung/đích thật; form từ resource và bài học, desktop1440,
  mobile390/320 không tràn ngang, FAQ bàn phím; gửi native không JS; script enhancement
  bị chặn vẫn có form; email tùy chọn; lỗi nhập liệu giữ dữ liệu an toàn.
- HTTP: hai POST cùng ticket đồng thời chỉ1 row; refresh/duplicate không tăng row;
  query/report ID/feed/REST không lộ mô tả/email; form cache/index/referrer headers;
  admin xem/xóa bằng nonce, nonce sai bị từ chối, editor thư viện được xem và
  subscriber bị từ chối; thiếu plugin trả503 không dựng form giả.
- Có hook chặn thư trong fixture và đếm số lần thử gửi bằng0. Browser chặn mọi request
  ngoài loopback; riêng media admin Gravatar cũng bị chặn, không dùng làm bằng chứng
  dịch vụ ngoài hoạt động.

### Phép thử lỗi trước và sau khi đã ghi

Một form giữ nguyên ticket qua ba lượt:
1. Mock WP_Error trước insert ->503, không row, không thông báo thành công;
   dữ liệu an toàn và signature được giữ.
2. Mock exception sau khi row đã ghi ->503 nói chưa xác nhận; có đúng1 row,
   signature không đổi.
3. Gỡ lỗi và thử lại ->303/receipt xác nhận row đã có, không thêm row.

Quota giữ chỗ trước insert; trả lại nếu lỗi xác định chưa ghi, giữ khi kết quả
chưa xác định để không vượt số bản lưu. Retry ticket đã nhận được xử lý trước
quota. Đây là thử local/mock, không cố tình phá database hoặc thử bằng thư thật.

## Bằng chứng

- [Form desktop](S11/report-form-desktop-top.png), [mobile không JS](S11/report-no-js.png),
  [320px](S11/report-small-mobile.png), [trợ giúp](S11/support-help-desktop.png).
- [Đã lưu](S11/report-success.png), [lỗi nhập liệu](S11/report-validation-error.png),
  [lỗi trước insert](S11/report-storage-error.png), [lỗi sau insert](S11/report-ambiguous-error.png),
  [giới hạn gửi](S11/report-rate-limit.png), [dịch vụ thiếu](S11/report-service-unavailable.png).
- [Hàng đợi riêng](S11/admin-private-queue-top.png), [FAQ mobile](S11/faq-mobile.png).
- [Kết quả máy đọc](S11/test-results.json), [postflight](S11/postflight.json),
  [nhật ký các vòng](S11/run-notes.vi.md), [hợp đồng](../S11-reports-support-contract.vi.md).

Đã xem ảnh thực tế form desktop/mobile, lỗi lưu/không xác nhận, success, FAQ và hàng đợi.
Ảnh QA không chứa báo cáo người dùng thật, không phải chứng nhận sử dụng thực tế.

Postflight đối chiếu35 file runtime theme và9 file PHP plugin với fixture thực sự
chạy; S05 chỉ dùng plugin/default theme nên không gán hash VibeLab giả cho suite đó.
Các module thư viện cũ và bằng chứng S00–S10 giữ nguyên.

Nguồn kỹ thuật đã mở đọc:
[wp_verify_nonce](https://developer.wordpress.org/reference/functions/wp_verify_nonce/),
[wp_insert_post](https://developer.wordpress.org/reference/functions/wp_insert_post/).
Nonce không thay kiểm quyền admin; code kiểm capability riêng trước xem/xóa.

## Giới hạn và vận hành

Nhận bằng hàng đợi nội bộ, không kênh email thật/live chat, không SLA hay người trực
được bịa ra. Người biên tập xem, đối chiếu và xóa khi hết mục đích; cần rà báo cáo
quá30 ngày bằng thao tác người vận hành, không có cron xóa mới. Xóa chỉ ở DB hiện tại,
không hứa xóa backup. Yêu cầu dữ liệu cần mã báo cáo và biên tập đối chiếu.

Mã giới hạn dùng HMAC của REMOTE_ADDR + bucket; proxy/NAT có thể gộp người dùng.
Khóa không bị giành tự động theo tuổi khi chủ còn có thể chạy; nếu tiến trình chết,
cần mở form mới/thử bucket sau hoặc quản trị rà khóa. Chưa kiểm crash recovery/
hosting WAF, load hay distributed abuse; một số lỗi ghi chưa xác định có thể tính quota.

Chính sách mô tả tính năng hiện tại; cần đối chiếu người nhận, nhịp xem queue, log,
backup và hạ tầng trước mở thật. Chưa xác minh hosting/MySQL/cache/thư thật/
cross-browser/người mới thực tế. S10 chỉ replay đầu ra đã lưu trong thư mục mới;
không chạy model trả phí, cài lại hoặc đăng nhập Codex trên Windows sạch.

## Dữ liệu và bước tiếp

Postflight xác nhận DB/config local giữ hash gốc, tmp/tests và cache lần chạy trống,
không lock hoặc cổng test còn mở. Không activate/seed vào DB local đang dùng,
không triển khai hosting, không cập nhật main/release hoặc bật automation.

Mã và bằng chứng ở nhánh review codex/s11-reports-support.
Dừng trước S12 theo quy tắc duyệt từng bước của chủ dự án.
