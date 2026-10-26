# S10 — Ghi chú các vòng chạy

Ngày 22/10/2026. Ghi lại lỗi thực tế, không tính lần chạy thất bại là PASS.

1. Harness chặn mọi request, kể cả file:// của trang mẫu, nên browser không mở được
   index.html. Sửa: cho phép file local, vẫn chặn mọi request mạng của mẫu.
   Fixture đã đóng; cache run transient-run-ce5ccd99-5bd0-4307-a286-4d043aef68d6
   còn thư mục rỗng vì EPERM. Đã kiểm tra đúng đường dẫn nằm trong repo/tmp và
   Remove-Item -LiteralPath đúng thư mục đó sau khi tiến trình kết thúc.
2. Chuỗi mô tả version trong PHP fixture dùng dấu + thay vì text literal, gây
   TypeError. Sửa harness, không nới validator; cleanup sau lần thất bại đạt.
3. Assertion .lesson-warning.innerText giả định chỉ có một cảnh báo, trong khi
   UI đúng có cả thông báo chặn lệnh và cảnh báo theo step. Sửa đọc toàn bộ thông
   báo, vẫn bắt buộc có mã/ý nghĩa dependency và step. Cleanup đạt.
4. Trong quá trình này bổ sung demo bundle mở được từ bài, lưu hash HTML vào
   themeEvidence và ghi rõ giới hạn kiểm chứng ngay đầu trang. Các ảnh/lần chạy
   trước không dùng làm nghiệm thu cuối. Chạy lại toàn bộ S10 và hồi quy tuần tự.

Không nới cổng commands_allowed, không đổi schema/plugin, không sửa protected DB,
không gọi model trả phí, không thử hosting hoặc xuất bản để xử lý các lỗi trên.

5. Ca unclosed-pre dùng một item vừa được trial lại nên commands_allowed=true; đây
   là input không đúng ý nghĩa phép thử, không phải cổng bị vượt. Sửa để đọc item
   practice đang bị dependency ẩn chặn thật; assertion bổ sung bắt buộc trạng thái
   commands_allowed=false trước khi thử mã thiếu thẻ đóng. Giữ nguyên yêu cầu byte
   mã không được lộ; chạy lại toàn bộ, không bỏ ca này hoặc báo PASS vòng cũ.
6. Bổ sung hiển thị lý do rà soát khi một fixture đã được copy. Bộ đối chiếu runtime
   chủ động từ chối nghiệm thu vì lesson-template.php khác source. Không bỏ cổng
   hash/không sửa fixture đang chạy để làm xanh. Đã cố định mã runtime và chạy lại:
   S10 đạt 55 kiểm tra + hai luồng shell với toàn bộ 31 file runtime khớp source.