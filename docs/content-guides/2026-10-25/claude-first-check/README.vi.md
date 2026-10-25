# Đầu ra trong thư mục Claude Code — lượt đầu

Ngày 25/10/2026, trong lúc hoàn tất kiểm tra Antigravity, đã thấy index.html và style.css ở examples/moc-studio-claude/ mà chủ được hướng dẫn chọn cho Claude Code. Kiểm tra trong quyền thử cả hai công cụ đã cấp trước đó; chưa tự thao tác gửi yêu cầu AI trong lượt này.

**40/40 điểm đạt** trên Edge local tại chiều rộng 1280/390/320px: h1 đúng đề, tiếng Việt, CSS local tải được, đủ ba dịch vụ/ba bước, thông tin liên hệ minh họa/chưa nhận đặt lịch, CTA tới đúng vùng, không tràn ngang, không request ngoài, script/form/iframe/event handler hoặc lỗi JavaScript. Header của bản này không sticky; không áp kỳ vọng sticky của bản Antigravity. Đã xem ảnh 390px.

File giữ nguyên trong kiểm tra. Sau đó đã đối chiếu hash hiện tại với kết quả đạt và tạo checkpoint-v1 cùng bản sao original-source/ để giữ bằng chứng; không sửa mã. HTML SHA-256 `9a1b6fa9f47d052ba7ee39fb135c89ad66863a04bccc7db0faece0c4232b62ee`; CSS `359e49a176a2105c6a0d93fdb39934841e4fcd4e27e9a45ee56f8fa1cb265b0c`.

Cần chủ dùng Claude Code đổi h1 sang “Hình ảnh chỉn chu cho sản phẩm của bạn”, giữ nguyên CSS và checkpoint. Sau đó kiểm tra thay đổi và chạy khôi phục bằng khối PowerShell của bài. Chưa ghi model/phiên bản ứng dụng hoặc xác nhận cài/đăng nhập mới; không dùng sự có mặt của file để tự khẳng định đã quan sát phiên AI tạo mã. Chưa ghi validation hoặc xuất bản production. Cache/fixture đã dọn qua run-clean; giữ bản mốc và bằng chứng thật.
