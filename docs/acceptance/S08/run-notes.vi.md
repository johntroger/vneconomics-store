# S08 — Nhật ký điều chỉnh bộ kiểm thử

Ngày 21/10/2026. Các lượt dưới đây **không được tính PASS**.

1. Lượt đầu dừng ở selector liên kết “Nguồn giới thiệu”: ký hiệu tab mới từ CSS
   tham gia tên truy cập, nên tìm tên exact không khớp. Chuyển sang selector trong
   vùng giới thiệu và vẫn kiểm tra target/rel.
2. Lượt kế tiếp đã chạy tới preview S05 có quyền, nhưng chụp ảnh cố decode avatar
   bên ngoài bị route kiểm thử chặn, gây EncodingError. Hàm chụp cho phép bỏ qua ảnh
   ngoài chỉ ở preview admin; các trang công khai vẫn buộc ảnh nội bộ decode thành công.
   Không mở truy cập Gravatar hoặc dịch vụ ngoài.
3. Bổ sung ca tiêu đề/nội dung không có khoảng trắng làm lộ phép nối chuỗi PHP
   viết nhầm bằng dấu cộng trong mã sinh dữ liệu QA. Đã đổi sang dấu chấm của PHP.
   Đây là mã fixture, không là logic theme hay nội dung site đang dùng.

4. Lượt bổ sung tiếp theo bị validator từ chối title QA dài 243 byte (giới hạn 240).
   Đã giảm còn 219 byte, vẫn là chuỗi dài không khoảng trắng. Không nới validator.

Mỗi lượt đã đóng browser/WordPress qua finally và run-clean xác nhận dọn fixture/cache
mới tạo. Hash database/config local được kiểm tra kể cả khi test thất bại.
Các ảnh có thể được cập nhật bởi lượt chạy lại; chỉ test-results.json của lượt cuối
và báo cáo nghiệm thu cuối là căn cứ PASS. Chưa chứng nhận repo thật hoặc hosting.
