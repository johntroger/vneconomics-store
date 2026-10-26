# S10 — Nghiệm thu hướng dẫn thực hành

Ngày 22/10/2026. **PASS kỹ thuật local trong phạm vi dưới đây.**
Chủ dự án duyệt S10; S11 chưa được phép. Không deploy.

## Kết quả

Theme 0.5.0 có template chung cho hướng dẫn và bộ thực hành: mục lục theo bước,
điều kiện Windows/công cụ, nút sao chép, checklist tự kiểm tra, lỗi và khôi phục,
nguồn/bằng chứng hiện hành hoặc lịch sử, cảnh báo dependency theo step và bài liên quan.
Giữ plugin 0.3.0 và schema; chỉ đọc snapshot công khai đã duyệt.

Bài MOC-WIN-1 dẫn làm landing page cho dịch vụ chụp ảnh hư cấu Mộc Studio:
từ thư mục mới -> brief/duyệt -> hai file -> mở/kiểm tra -> checkpoint -> sửa h1
-> khôi phục -> tự đối chiếu. Có liên kết mở demo HTML/CSS đã đóng gói cùng theme.
Demo không có form, JavaScript, package, ảnh/font ngoài hoặc kết nối mạng.

Checklist chỉ là ghi chú local theo revision; 6/6 vẫn không xác nhận hoàn thành.
Copy không chạy lệnh, không gọi AI và không tự tích mục nào. JS/storage/clipboard
không hoạt động có đường đọc/chọn/sao chép thủ công và thông báo đúng tình trạng.

## Kiểm thử

| Lệnh npm | Kết quả |
|---|---|
| test:lesson | PASS — 55 kiểm tra + hai luồng thực hành PowerShell |
| test:lesson-search-regression | PASS — 74 kiểm tra + 28 fixture, 20 truy vấn |
| test:lesson-detail-regression | PASS — 55 kiểm tra + 19 fixture |
| test:lesson-catalog-regression | PASS — 46 kiểm tra + 23 fixture |
| test:lesson-home-regression | PASS — 59 kiểm tra |

Mọi lệnh npm trên đều dùng scripts/run-clean.mjs; từng suite đóng browser/server rồi
dọn fixture/cache mới trước khi suite sau chạy. Kết quả cuối dùng cùng 31
file runtime của theme (PHP/CSS/JS/SVG/HTML), đối chiếu hash source và bản thực sự chạy.
Không dùng kết quả của những vòng thất bại; xem [nhật ký](S10/run-notes.vi.md).

Phần thực hành chạy lại đúng bốn khối lệnh PowerShell từ nội dung bài, trong thư mục
mới trên Windows NT10.0.26300, cả Windows PowerShell5.1 và PowerShell7.6.5.
Đầu ra Codex tạo trong phiên S10 được replay từ examples/s10-moc-studio, mở bằng
file:// thật. Hai shell đều đạt các nhóm kiểm tra:

- Hai file tồn tại; mọi fragment/CTA tới đúng mục.
- 1440/390/320px không tràn ngang; không form/script/request mạng.
- Checkpoint đúng byte; sửa h1 được nhìn thấy khi tải lại; CSS và CTA giữ đúng.
- Khôi phục hai file đúng hash và thấy tiêu đề gốc trở lại.

UI WordPress kiểm tra: guide/practice chung template; copy đúng byte với mock
Clipboard và đường lỗi/Ctrl+C; bàn phím/mục lục; reload/resume/reset; đổi revision
bỏ dấu cũ; tự đánh dấu không thành chứng chỉ; 320/390/768px và phóng chữ;
không JS, script bị chặn, storage từ chối; snapshot raw/private; gate chưa thử/stale;
dependency đổi revision/ẩn; mã chưa đóng không vượt gate; không JS/HTTP lỗi bất ngờ.

Nguồn chính thức đã mở/đọc ngày 22/10/2026:
[hướng dẫn Windows](https://learn.chatgpt.com/docs/windows/windows-app),
[quickstart](https://learn.chatgpt.com/docs/quickstart),
[sandbox Windows](https://learn.chatgpt.com/docs/windows/windows-sandbox).
Không cố định giá/quota hoặc hứa nhãn giao diện giống mọi phiên bản ứng dụng.

## Bằng chứng xem được

- [Bài desktop](S10/lesson-desktop-top.png), [mobile](S10/lesson-mobile-top.png),
  [khối lệnh mobile](S10/lesson-code-mobile.png), [checklist mobile](S10/lesson-checklist-mobile.png).
- [Chưa thử](S10/lesson-untested-top.png), [bằng chứng cũ](S10/lesson-stale-top.png),
  [dependency đổi](S10/lesson-dependency-changed-top.png).
- [Mẫu desktop](S10/sample-powershell.exe-1440.png), [mẫu mobile](S10/sample-powershell.exe-390.png).
- [Kết quả máy đọc](S10/test-results.json), [postflight](S10/postflight.json).
- [Hợp đồng nội dung/UI](../S10-lesson-contract.vi.md),
  [bài gốc](../content-samples/S10-moc-studio-lesson.html).

Đã xem ảnh thực tế của bài desktop/mobile/320px, khối lệnh/checklist và trang mẫu.
Kiểm tra hình không thay cho thử người mới thực tế.

## Giới hạn

**Đã chạy từ thư mục mới trên máy có sẵn công cụ. Chưa thử cài/đăng nhập Codex trên
Windows sạch, chưa chạy một phiên AI mới theo prompt bằng tài khoản người học.**
Bản ứng dụng Codex chưa ghi nhận số version; bài ghi bản nội dung MOC-WIN-1, ngày
nguồn và phiên bản shell/trình kiểm thử. Không coi đó là chứng nhận mọi bản Codex.

Bằng chứng WordPress là fixture độc lập; trial mô tả đúng phần replay, ca dependency/
trial QA giả lập ghi QA riêng. Không chứng nhận repo bên ngoài hoặc biến việc đọc
tài liệu thành “đã cài thử”. Không có paid API, AI runtime, BYOK, hosting/MySQL/cache/
load/cross-browser/human novice certification. Thử người mới trên bản tích hợp còn
thuộc S13; kiểm tra môi trường staging/hosting thuộc bước sau.

Chỉ các khối pre được tự động chặn; nội dung prose/inline vẫn cần biên tập, không
đưa lệnh cài đặt vào prose để né cổng. Demo Mộc Studio là đầu ra minh họa cố định,
không phải cơ chế chạy repo tùy ý cho khách.

## Dữ liệu và bước tiếp

Postflight xác nhận DB SQLite/config local giữ nguyên hash gốc, tmp/tests trống,
không lock/cache run còn lại và các cổng test đã đóng. Plugin/bằng chứng lịch sử
S00–S09 không đổi. Chưa activate/seed vào DB local đang dùng, chưa deploy hosting,
chưa thay main/release hoặc bật automation.

Mã/bằng chứng ở nhánh review codex/s10-practice-guide. Dừng trước S11 theo quy tắc
kiểm thử và duyệt từng bước của chủ dự án.
