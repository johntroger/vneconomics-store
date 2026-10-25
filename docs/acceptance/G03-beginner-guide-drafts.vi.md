# G03 — hai bản thảo mới và thử chức năng bộ ba

Ngày 25/10/2026. Chủ yêu cầu ba bài thực hành chính: Codex đã có, Claude Code và Antigravity. Chủ cho phép thử cả hai công cụ bằng hạn mức sẵn có, không mua gói/nạp tiền/API tính phí riêng, rồi hỗ trợ thao tác tạo/sửa trong ứng dụng.

**Hoàn thành bước nội dung local và thử đầu ra/sửa/khôi phục có chủ hỗ trợ. Chưa tích hợp/phát hành hai bài mới lên WordPress.**

## Sản phẩm và bằng chứng

- Hai bản thảo riêng cùng bài tập Mộc Studio, đủ chuẩn bị, phương án, tạo trang, mở/kiểm CTA và mobile, giữ mốc, sửa h1, khôi phục, sửa lỗi, checklist và nguồn/phạm vi kiểm chứng.
- Bản preview có đúng ba lựa chọn chính; tài liệu chuẩn bị/sửa lỗi/HTML-CSS được giữ làm bổ trợ. Bài Codex gốc và URL không đổi.
- Antigravity: đầu ra sau sửa anchor đạt 88/88; sau đổi h1 88/88; khôi phục 15 điểm; hậu kiểm 88/88. Giữ cả lỗi đầu tiên 80/88 và source gốc. Metadata exe 2.26.0.0, chưa ghi model/review mode.
- Claude: đầu ra ban đầu 40/40; sau đổi h1 40/40; khôi phục 15 điểm; hậu kiểm 40/40. Chưa ghi phiên bản/model/review mode. Số trường hợp khác nhau do hai trang có số liên kết anchor khác nhau.
- Cả hai chỉ đổi đúng chuỗi h1 trong lượt sửa tiêu đề; CSS và bản mốc giữ nguyên. Sau khôi phục, file hiện tại khớp byte checkpoint-v1. Bản đã sửa được giữ riêng trước khôi phục.
- Sau cập nhật nội dung theo bằng chứng thực tế, runner preview/PowerShell fixture đạt lại 43 điểm; desktop/mobile 1280/390/320px không tràn ngang hoặc request ngoài. DB/config local thật và nguồn Codex gốc không đổi. Fixture/cache đã dọn; backup thật và bằng chứng giữ.

[Bản xem trước](../content-guides/2026-10-25/preview.html), [mục lục/phạm vi](../content-guides/2026-10-25/README.vi.md), [Antigravity](../content-guides/2026-10-25/antigravity-functional-trial.vi.md), [Claude](../content-guides/2026-10-25/claude-functional-trial.vi.md).

## Giới hạn và bước chờ duyệt

Đây là thử đầu ra có chủ hỗ trợ, không phải chứng nhận cài mới/đăng nhập mới hoặc mọi thao tác UI của công cụ. Các bản thảo ghi rõ ai làm phần nào và phần chưa kiểm chứng. Không ghi validation vào CMS, không bỏ cổng commands_allowed, không đổi theme/plugin hay đăng bài production trong bước này.

Bước local tiếp theo đề xuất: tích hợp bộ ba vào WordPress riêng, hiển thị đúng ba bài chính và tách tài liệu bổ trợ, kiểm mục lục/copy/checklist/cổng chứng cứ, hồi quy URL cũ và đóng gói để duyệt phát hành. Dừng chờ chủ cho phép bước đó theo AGENTS.md; quyền xuất bản đợt 100 bài đã hoàn thành không được dùng làm quyền phát hành ứng dụng mới.
