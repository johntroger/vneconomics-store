# Kiểm tra đầu ra Antigravity lần đầu

Ngày 25/10/2026, chủ báo Antigravity đã tạo xong và yêu cầu kiểm tra. Đọc trực tiếp examples/moc-studio-antigravity/index.html và style.css; không sửa mã.

**Kết quả: cần sửa một lỗi giao diện trước khi nghiệm thu đầu ra.** 80/88 điểm đạt. Tám điểm chưa đạt là các lần tái hiện cùng nguyên nhân: sticky header che một phần tiêu đề khi bấm liên kết tới section trên màn hình nhỏ.

| Chiều rộng | Kết quả chính |
|---|---|
| 1280px | Các điểm kiểm tra đạt |
| 390px | Tiêu đề Lợi ích, Dịch vụ, Quy trình nằm cao hơn đáy header khoảng 11–13px, nên bị che một phần |
| 320px | Ba tiêu đề trên bị che khoảng 36–37px; tiêu đề vùng liên hệ cũng bị che khoảng 4px |

Đã đạt: đúng hai file, một h1 đúng brief, lang=vi, CSS local tải được, ba dịch vụ/ba bước, thông báo minh họa/chưa nhận đặt lịch, liên kết trỏ đúng ID, không tràn ngang tại ba chiều rộng, không script/form/iframe/event handler, không request ngoài hoặc lỗi JavaScript. Nội dung đọc thủ công không thấy giá, đánh giá hoặc khách hàng giả. Địa chỉ/email được ghi là mô phỏng/minh họa.

Hướng sửa: bù khoảng cuộn cho section có ID theo chiều cao sticky header (scroll-margin-top hoặc scroll-padding-top), kiểm lại cả ba chiều rộng. Có thể chỉ cần sửa CSS; không cần thêm JavaScript hoặc package.

Giữ original-source/ và initial-results.json làm mốc đầu vào. results.json, ảnh toàn trang và anchor-overlap-320.png/390.png là bằng chứng chạy kiểm tra. SHA trước/sau khớp; nguồn người dùng giữ nguyên. Cache của hai lượt đã dọn qua run-clean, kể cả lượt trả trạng thái chưa đạt.

Phạm vi mới là đầu ra ban đầu do chủ báo tạo bằng Antigravity. Chưa ghi nhận phiên bản/model ứng dụng, chưa thử sửa tiêu đề/khôi phục trong Antigravity và chưa nghiệm thu cả bài học hoặc đăng production.
