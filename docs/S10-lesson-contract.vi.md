# S10 — Hướng dẫn thực hành, hợp đồng bản 1

Phạm vi được chủ dự án duyệt ngày 22/10/2026: S10. Không làm S11, BYOK, API trả phí,
collector, automation, cache hosting hoặc triển khai. Theme 0.5.0, plugin giữ 0.3.0.

## Dữ liệu và xuất bản

- Hai CPT vne_guide/vne_practice dùng một template. Chỉ đọc vne_library_item công khai;
  raw WordPress, proposal, ghi chú biên tập và dependency nội bộ không được render.
- Không thêm schema/meta: bài học là HTML trong content của snapshot đã duyệt;
  source/date/note trong document_source. Version/review/validation theo S04/S05.
- Mỗi h2 tạo mục lục. Giữ fragment đã được helper S08 đổi tên; không đè ID bằng ID gốc
  để tránh xung đột trang. Các liên kết mục lục dùng anchor native, không cần JS.
- ul.lesson-checklist với li trở thành checkbox tự kiểm tra. Nội dung li giới hạn
  text/code/strong/em. Không chứa task runner hay trình thực thi lệnh cho người đọc.
- pre.language-powershell là lệnh Windows PowerShell; các pre khác là nội dung/prompt
  để gửi vào chat. Nút copy chỉ có khi JS hoạt động. Biên tập phải giải thích nơi dán,
  thư mục chạy, tác động, dấu hiệu đạt, lỗi và khôi phục.
- Bài mẫu gốc: docs/content-samples/S10-moc-studio-lesson.html, MOC-WIN-1.
  Đầu ra Codex tạo trong phiên S10: examples/s10-moc-studio, không phải repo ngoài.
  Các tài nguyên cùng danh mục là bài đọc liên quan, không tự coi là dependency.

## Trạng thái và lệnh

- Dùng derived.commands_allowed từ plugin; không tự suy từ latest_validation.pass.
  Chưa thử, stale/review, unavailable/suspended, dependency rủi ro đều không hiện khối pre
  hoặc byte lệnh/prompt trong HTML public. Nội dung giải thích vẫn đọc được.
- Cảnh báo chung và step được escape và hiện trước nội dung; dependency ẩn chỉ hiện
  cảnh báo chung theo step, không lộ ID/title/URL.
- Validation hiện hành/historical phân biệt rõ. Hiện OS/tool/version/input/output/
  checklist/date/evidence đã ghi, không giả lập bằng chứng khi người dùng copy/tích chọn.
- Helper S08 chỉ nhận diện khối pre; prose/inline không phải bộ phân loại lệnh.
  Biên tập không đưa lệnh cài đặt vào prose để né cổng.
- URL nguồn còn được mở hay không theo CTA resolver; suspended/unavailable chuyển
  reference thành text. Không có external media/font, API hoặc request theo dõi.

## Tiến độ và sao chép

- Checkbox là ghi chú của người học; không chứng nhận đã chạy, không khóa bước tiếp.
  6/6 vẫn hiện “chưa xác nhận hoàn thành”. Copy không đánh dấu bất kỳ mục nào.
- Lưu localStorage theo item ID + revision fingerprint, chỉ revision và ID mục chọn.
  Không gửi dữ liệu lên server. Đổi content/dependency snapshot thì không áp dụng dấu cũ.
  Nút bỏ dấu riêng; không xóa dữ liệu localStorage ngoài key bài này.
- Không có JS/script bị chặn: nội dung, mục lục, details, code được phép và checkbox
  native vẫn đọc/dùng được; nút copy/reset ẩn, không hứa đã lưu.
- Storage lỗi: nói rõ chỉ giữ trong trang đang mở. Clipboard lỗi: chọn text, focus
  khối pre và hướng dẫn Ctrl+C. Không thông báo đã copy khi Promise thất bại.
- Không có form đăng nhập website, chatbot, nút mua hàng hoặc chứng chỉ hoàn thành.

## Bài mẫu và kiểm chứng

Một nhánh Windows native/PowerShell; không trộn WSL/Bash/macOS. Chuỗi:
kiểm tra quyền/tài khoản -> thư mục mới -> duyệt brief -> tạo hai file -> mở file local
-> thử CTA/mobile -> checkpoint -> sửa h1 -> kiểm tra -> khôi phục -> checklist.

Nguồn chính thức đã mở/đọc ngày 22/10/2026:
- https://learn.chatgpt.com/docs/windows/windows-app
- https://learn.chatgpt.com/docs/quickstart
- https://learn.chatgpt.com/docs/windows/windows-sandbox

Ứng dụng/nhãn nút có thể đổi. Không cố định giá/quota, không suy API Gemini dùng được
để đăng nhập Codex. Cài/đăng nhập, quyền máy tổ chức và tài khoản thật là điều kiện
người học tự hoàn tất. Không cài lại ứng dụng hoặc tạo tài khoản để kiểm thử fixture.

Test S10 replay lệnh đúng nguyên văn từ HTML trong thư mục mới, với đầu ra Codex tạo
ở phiên này, mở file thật, sửa/khôi phục và đối chiếu browser/hash. Đây không phải một
phiên model mới có phí, không phải clean Windows VM hay thử người mới. Phải ghi ranh giới
này trong bằng chứng; không gắn nhãn đã thử cài mới/đăng nhập Codex hoặc repo bên ngoài.

Fixture WordPress dùng validation để thử cổng ở đúng content revision; output mô tả
đúng phần replay. QA dependency/evidence giả lập ghi QA riêng. Không seed vào DB local
đang dùng, không xuất bản nội dung lên hosting. Thử người mới thực tế thuộc S13.
