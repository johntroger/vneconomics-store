# Antigravity — kiểm lại bản sửa khoảng cuộn

Ngày 25/10/2026, chủ báo Antigravity đã sửa xong lỗi sticky header che tiêu đề.

**Đạt 88/88 điểm kiểm tra đầu ra** qua Edge local tại chiều rộng 1280, 390 và 320px. Tiêu đề của các vùng Lợi ích, Dịch vụ, Quy trình và Liên hệ không còn bị header che khi bấm các liên kết. Không tràn ngang, không phát sinh request ngoài, lỗi JavaScript hoặc thành phần ngoài brief.

Đối chiếu với original-source/ của lần đầu: index.html giữ nguyên byte, SHA-256 `8710f16f520a22d3daf7aebacb8c25042dc13588359b8c42d24f36f23c7709a6`. Chỉ style.css thay đổi: thêm biến --scroll-offset 76px, 125px ở breakpoint 860px và 150px ở breakpoint 360px; áp scroll-margin-top cho section có ID. Codex chỉ đọc/kiểm tra, không sửa hai file đầu ra.

Phiên bản ProductVersion từ metadata Antigravity.exe hiện có trên máy: 2.26.0.0 (FileVersion 2.26.0). Chưa ghi nhận model/tùy chọn trong phiên người dùng tạo mã; không suy từ metadata file rằng đã thử cài mới.

results.json chứa SHA trước/sau của lượt kiểm lại, 88 điểm và kết quả layout; anchor-check-320.png/390.png/1280.png thể hiện liên kết neo đã bù khoảng cuộn. Hồ sơ lỗi đầu tiên, initial-results.json và mã gốc được giữ riêng trong antigravity-first-check/. Cache lượt kiểm lại đã dọn qua run-clean.

Phạm vi đạt là **đầu ra ban đầu và bản sửa lỗi anchor**, chưa phải nghiệm thu toàn bộ bài thực hành. Vẫn cần lưu bản mốc, yêu cầu chính Antigravity sửa h1, kiểm CSS không đổi và khôi phục; cần phần thử Claude Code. Chưa ghi validation vào WordPress hoặc thay đổi production.

Sau lượt kiểm tra đã tạo checkpoint-v1 trong thư mục bài tập, không sửa file trang hiện tại. Bốn hash của file hiện tại/bản mốc khớp từng cặp: HTML `8710f16f520a22d3daf7aebacb8c25042dc13588359b8c42d24f36f23c7709a6`, CSS `79afec6c9077ca953782462a78fc22f0a8c8c73c6e9e2b414f74fe21179d6c27`. Đây là bản mốc thật để khôi phục bước học, cần giữ; không phải fixture/cache để dọn. Chờ người dùng nhờ Antigravity đổi h1, giữ CSS và bản mốc.
