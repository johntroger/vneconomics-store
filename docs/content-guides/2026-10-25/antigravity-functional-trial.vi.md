# Antigravity — thử đầu ra, sửa và khôi phục

Ngày 25/10/2026. Chủ cho phép dùng hạn mức sẵn có, sau đó tự thao tác Antigravity và báo đã tạo trang, sửa khoảng cuộn, đổi tiêu đề. Codex kiểm tra file thực trên máy; không phát sinh lượt AI/API từ runner.

## Kết quả

- Đầu ra lần đầu: 80/88 điểm đạt; tám lần tái hiện cùng một lỗi sticky header che heading trên mobile. Giữ mã gốc, ảnh và kết quả trong antigravity-first-check/.
- Chủ nhờ Antigravity sửa CSS: 88/88 điểm đạt ở 1280/390/320px; HTML giữ nguyên. Hồ sơ antigravity-recheck/.
- Giữ checkpoint-v1 sau bản sửa CSS; hash hai file hiện tại/bản mốc khớp.
- Chủ nhờ Antigravity đổi h1: 88/88 điểm đạt. Đối chiếu byte cho thấy chỉ chuỗi tiêu đề được đổi; CSS và checkpoint giữ nguyên. Bản sửa được sao chép vào antigravity-title-edit/edited-source/ trước khôi phục.
- Codex chạy nguyên khối PowerShell khôi phục của bản thảo trong đúng thư mục bài tập: 15 điểm guard/readback đạt; hai file khôi phục đúng byte bản mốc, checkpoint không đổi.
- Hậu kiểm sau khôi phục: 88/88 điểm đạt, tiêu đề cũ hiển thị đúng, liên kết và layout giữ nguyên. Hồ sơ antigravity-restored/.

Không tràn ngang, không request ngoài hoặc lỗi JavaScript trong các lượt kiểm browser. Cache/fixture mỗi lượt được dọn qua run-clean; mã đầu ra, bản mốc thật và bằng chứng được giữ.

## Môi trường và giới hạn

Antigravity.exe có ProductVersion 2.26.0.0/FileVersion 2.26.0 tại thời điểm đọc metadata. Kiểm tra trang bằng Edge headless trên Windows; khôi phục thực bằng Windows PowerShell. Môi trường thử nội dung không phải production.

Các thao tác tạo/sửa bằng AI do chủ thực hiện và xác nhận; Codex kiểm đầu ra và thực hiện khôi phục. Chưa ghi model, review mode, cài mới hoặc đăng nhập mới; không suy rằng các phần đó đã được kiểm chứng. Kết quả là phạm vi thử chức năng có hỗ trợ của chủ, không chứng nhận mọi máy/tài khoản hoặc toàn bộ giao diện sản phẩm.

Hiện examples/moc-studio-antigravity/ đã trở về tiêu đề “Ảnh đẹp để sản phẩm lên tiếng”, giữ CSS đã sửa khoảng cuộn và checkpoint-v1. Chưa nhập bài hoặc ghi validation lên WordPress; cần hoàn thiện bài Claude Code và nghiệm thu bộ ba trước phát hành.
