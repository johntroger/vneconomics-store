# S13 — Chủ dự án trực tiếp thử website

Trạng thái: chờ chủ dự án thử bản đã xây và phản hồi. Chưa ghi nhận kết quả thực hành.
Ngày 22/10/2026, chủ dự án quyết định không cần tuyển người mới; chính chủ dự án sẽ thử website và báo điểm chưa ổn để sửa. Quyết định này thay điều kiện bắt buộc người mới trong kế hoạch S13. Không suy kết quả của chủ dự án thành nghiên cứu usability với người mới hoàn toàn.

## Cách mở

Chạy `npm run dev:s13` trong dự án, mở http://127.0.0.1:9430/.
Bản thử local giữ database riêng tại .local/s13-site; không sửa database gốc .local/site.
Địa chỉ này chỉ truy cập được trên máy đang chạy, chưa phải website hosting công khai. Không mở cổng Internet trong S13.
Báo lỗi chỉ lưu local, không gửi email. Đọc bài không cần tài khoản website hoặc API key.
Công cụ bên ngoài có thể cần tài khoản/quyền truy cập riêng; không có API trả phí nào được gọi tự động.

## Những việc nên thử

1. Từ trang đầu, mở “Tôi mới bắt đầu”, đọc điều kiện của bài Mộc Studio.
2. Vào danh mục tài nguyên; tìm có dấu/không dấu, dùng bộ lọc, xóa lọc, thử từ khóa không có kết quả và nút Back.
3. Mở chi tiết tài nguyên, đọc phạm vi kiểm chứng và cảnh báo; thử nút truy cập repo, phân biệt với trang chi tiết.
4. Làm bài landing page trong thư mục mới: tạo mã, mở trang, kiểm tra liên kết và màn hình hẹp. Ghi bước nào đã chạy thật, bước nào mới đọc.
5. Giữ bản mốc, đổi tiêu đề, kiểm tra và khôi phục. Không coi việc tích checkbox/sao chép lệnh là chứng nhận đã làm xong.
6. Thử checklist, tải lại trang, bỏ dấu; dùng bàn phím Tab/Enter và menu mobile.
7. Gửi một báo lỗi thử không chứa bí mật. Chỉ coi đã nhận khi thấy mã xác nhận; không có email tự động.

## Phản hồi để sửa

Ghi URL hoặc tên trang, bước đã làm, điều mong đợi, điều thực tế và ảnh nếu hữu ích.
Không đưa API key, mật khẩu hoặc dữ liệu khách hàng vào ảnh/log/Git.
Lỗi chặn tác vụ phải được sửa và kiểm thử lại trong S13. Chủ dự án thử lại phần đã sửa.
Chưa có phản hồi không được coi là đã duyệt giao diện/hành vi hoặc cho phép S14.
Chỉ bắt đầu S14 khi chủ dự án cho phép rõ ràng.

## Ghi nhận kết quả (để trống tới khi thử)

Ngày/commit:
Windows/công cụ/phiên bản:
Luồng đã thực hiện:
Bước chỉ đọc, chưa chạy và lý do:
Lỗi/ảnh → sửa ở commit nào → kiểm thử lại → chủ dự án thử lại:
Ý kiến chấp thuận của chủ dự án:
