# Chạy thử hai bài bằng tài khoản hiện có

Chủ tài khoản đã đồng ý dùng hạn mức sẵn có cho Claude Code và Antigravity ngày 25/10/2026. Không mua gói, nạp tiền hoặc gọi API tính phí riêng. Chủ đề nghị hỗ trợ thao tác trực tiếp.

Hai thư mục dưới đây được chuẩn bị trống cho đầu ra AI gốc cần giữ làm bằng chứng. Không mở thư mục toàn bộ website và không cho hai công cụ sửa cùng một thư mục.

## Claude Code

Mở tab Code trong Claude desktop, chọn Local rồi mở:

```text
C:\Users\trant\CodexProjects\VneconomicsStore\examples\moc-studio-claude
```

## Antigravity IDE

Mở cửa sổ/project riêng, chọn thư mục sau; giữ nguyên dự án đang làm khác:

```text
C:\Users\trant\CodexProjects\VneconomicsStore\examples\moc-studio-antigravity
```

## Prompt dùng lần lượt trong mỗi công cụ

Dán vào chat agent, không dán vào terminal. Nội dung này cùng brief với bản thảo, tên thư mục do người dùng chọn ở bước trên.

```text
Tôi mới học, dùng Windows và đang mở thư mục bài tập trống này.
Hãy đề xuất ngắn gọn phương án landing page cho dịch vụ chụp ảnh sản phẩm HƯ CẤU Mộc Studio; chờ tôi đồng ý trước khi viết mã.
Mã trang chỉ gồm index.html và style.css, UTF-8, lang=vi, mở trực tiếp bằng trình duyệt.
Có hero, lợi ích, 3 dịch vụ, quy trình 3 bước và vùng liên hệ minh họa.
H1: "Ảnh đẹp để sản phẩm lên tiếng". CTA "Xem cách liên hệ" dẫn tới #lien-he.
Ghi rõ thông tin minh họa, chưa nhận đặt lịch. Không bịa khách hàng, giá, đánh giá hoặc cam kết.
Không JavaScript, form, ảnh/font ngoài, thư viện, API, analytics, package hoặc triển khai.
Chỉ đọc/ghi thư mục bài tập đang mở. Sau khi tôi duyệt, tạo hai file rồi giải thích cách mở và tự kiểm tra.
Không nói đã chạy thử nếu chưa chạy. Không tạo file README hoặc CLAUDE.md trong bài này.
```

Đọc phương án; nếu đúng brief, gửi:

```text
Đồng ý, hãy tạo hai file theo phương án vừa duyệt.
```

Khi đã tạo xong ở cả hai công cụ, nhắn Codex **“hai công cụ đã tạo xong”**. Chưa yêu cầu sửa tiêu đề để giữ được bản đầu làm mốc. Codex sẽ đọc file, kiểm CTA, màn hình nhỏ, giữ bằng chứng và chuẩn bị bước sửa/khôi phục. Nếu một công cụ lỗi, gửi đúng thông báo và tên công cụ; không gửi mật khẩu, API key hoặc OTP.

Nếu tiện, ghi lại phiên bản ứng dụng đang dùng. Chỉ riêng hai file HTML/CSS không chứng minh đã cài mới hoặc đăng nhập mới; báo cáo sẽ phân biệt phần chủ thao tác với phần Codex kiểm tra.
