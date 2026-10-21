# S06 — Theme nền và trang chủ

Ngày 21/10/2026 (Asia/Saigon). **PASS kỹ thuật local; chờ chủ dự án duyệt giao diện và cho phép S07.**
Quyền thực hiện: “cho phép S06”. Nhánh codex/s06-theme-home, dựa trên S05 decc41e.
Chưa thay main/release; chưa cài theme/plugin vào database local đang dùng hoặc hosting.

## Kết quả

Theme vibelab 0.1.0: token màu, typography, header/footer, menu mobile và trang chủ
theo thiết kế cửa hàng S02. Khối tài nguyên có ảnh/tên mở chi tiết, CTA mở đúng
repo/thư mục; bài hướng dẫn và danh mục lấy từ dữ liệu công khai, không viết cứng số lượng.

- Query lấy ID publish; vne_library_item() lấy nội dung đã duyệt và derived state.
  Danh mục trang chủ lấy primary_category từ snapshot; tiêu đề tab/trang cũng dùng
  bản đã duyệt. Bản nháp, private, proposal và ghi chú nội bộ không hiện trên home.
- Hiển thị riêng tình trạng nguồn và “Chưa thử”. Không tự suy diễn đã thử, giá,
  license, lượt sao, xếp hạng hoặc mức phổ biến.
- Nguồn unavailable/suspended dẫn đến giải thích tại trang đọc, không mở repo.
  Nguồn chưa xác minh giữ đúng cảnh báo của resolver, không tự kết luận bị xóa.
- Không JS hoặc script menu tải lỗi vẫn có liên kết điều hướng và nội dung.
  Có Enter/Tab/Escape, skip link, focus về nút Menu và focus đích liên kết nội trang.
- Thiếu nội dung hoặc plugin: trạng thái trống rõ ràng, không thẻ giả hoặc link bài
  học chưa có. SVG dự phòng cho nguồn chưa có bìa; không gọi font/ảnh từ dịch vụ ngoài.
- Hình Mộc Studio là minh họa CSS cho dịch vụ hư cấu; bìa SVG do dự án biên soạn.
- Theme không seed hoặc ghi dữ liệu khi kích hoạt. Tất cả dữ liệu QA nằm trong
  fixture và đã được dọn, không là nội dung mới được xuất bản trên website.

[Hợp đồng theme](../S06-theme-contract.vi.md) · [Mã và cách dùng](../../themes/vibelab/README.md).

## Kiểm thử cuối

Lệnh: npm run test:theme — scripts/run-clean.mjs. **59 điểm kiểm tra ghi nhận PASS**,
kèm các assertion HTTP/DOM/ảnh. WordPress 7.1.3 / PHP 8.3 / SQLite,
Playwright Node 1.62.1 và Microsoft Edge headless.

| Nhóm | Kết quả |
|---|---|
| Responsive | 1440×1000, 820×1180, 390×844, 320×800; không tràn ngang |
| Nội dung | 6 resource QA dựa trên nguồn đã lưu S02; đúng title/ảnh/đích/CTA/nhãn |
| Điều hướng | Tất cả liên kết home nội bộ trả 200 và có anchor; 404 có đường về home |
| Bàn phím | Menu Enter/Tab/Escape, focus đích anchor, đổi breakpoint, skip link |
| Không JS / JS lỗi | Menu và tài nguyên vẫn đọc, dùng được |
| Menu quản trị | Menu WordPress hai cấp hiển thị và không tràn mobile |
| Tìm kiếm | WordPress core tìm được resource đã duyệt; chưa phải search/filter S09 |
| Snapshot | Thử dữ liệu thô khác snapshot; home, danh mục và head trang đọc giữ bản đã duyệt |
| State | unknown, unavailable, suspended, review_needed, not_tested; archived từ mẫu Pico |
| Ảnh / tên dài | Bìa mặc định tải thật; tên dài có chuỗi không dấu cách vẫn không tràn 320px |
| Thiếu dữ liệu | Không bịa resource/guide; tắt plugin không lỗi PHP |
| Lỗi runtime | Không pageerror JS hoặc HTTP lỗi nội bộ trên các luồng browser hợp lệ |
| Dữ liệu local | Hash database/config trước/sau không đổi |
| Cleanup | Browser/server đã đóng; cổng 19406 không listen; tmp/tests rỗng, không còn lock |

[Bằng chứng máy đọc](S06/test-results.json) giữ danh sách từng điểm kiểm tra và hash.
Không sửa plugin/schema S03–S05; không chạy lại toàn bộ test:revisions trong S06.
Bộ S06 kiểm tra các đường tích hợp công khai/snapshot/state liên quan đến theme.

## Ảnh nghiệm thu

Đã rà trực quan desktop, mobile đầu trang, mobile 320px, tên dài/ảnh dự phòng,
trạng thái rỗng và thiếu plugin. Bộ chụp cuộn qua từng ảnh, đợi ảnh tải và decode
xong trước khi chụp toàn trang để tránh bằng chứng trống do lazy loading.

- [Trang chủ desktop](S06/home-desktop.png)
- [Mobile đầu trang](S06/home-mobile-first-screen.png)
- [Mobile toàn trang](S06/home-mobile.png), [320px](S06/home-small-mobile.png),
  [tablet](S06/home-tablet.png), [không JavaScript](S06/home-no-js.png)
- [Tên dài và bìa dự phòng](S06/long-title-fallback.png)
- [Thư viện rỗng](S06/empty-library.png), [plugin tắt](S06/plugin-unavailable.png)

## Giới hạn và cảnh báo công cụ

- index.php là bản đọc/danh sách cơ bản để liên kết có đích. Chưa làm giao diện
  taxonomy/grid đầy đủ S07, chi tiết S08, tìm kiếm nâng cao S09 hoặc bài học tương tác S10.
- Font S06 dùng Segoe UI/system-ui như prototype, không tải font ngoài. Be Vietnam Pro
  từng là dự kiến; chưa đóng gói asset/license. Lựa chọn system font ghi rõ trong hợp đồng.
- Quan sát repo dùng dữ liệu lưu ngày 19/10 từ S02, không xác minh lại hoặc chạy repo.
  Trạng thái truy cập còn unknown được giữ nguyên. Các chuyển state khác là dữ liệu
  QA ghi rõ giả lập, không phải chứng cứ nguồn thật.
- Chưa kiểm thử hosting MySQL/cache/plugin bên thứ ba, Safari/Firefox hoặc nghiệm thu
  với người mới; không dùng PASS local thay cho các cổng staging và usability sau.
- Lượt thử đầu bị plugin từ chối vì fixture tiêu đề vượt giới hạn 240 byte. Đã sửa
  fixture trong giới hạn, giữ ca tên dài/chuỗi không ngắt và chạy lại đầy đủ.
- Ảnh chụp dài ban đầu chưa tải ảnh nằm xa viewport do native lazy loading. Đã bổ sung
  cuộn thật/đợi decode/xác nhận naturalWidth rồi chạy lại; ảnh cuối thay bằng bản đầy đủ.
- Python Playwright không có sẵn: dùng Playwright Node trong runtime theo cách S02–S05.
  Git có cảnh báo chuẩn hóa LF/CRLF theo cấu hình và .gitattributes; diff --check không có lỗi khoảng trắng.

## Điểm dừng

S06 đạt kỹ thuật local, còn chờ chủ dự án xem và duyệt giao diện. S07 chưa bắt đầu.
Không deploy, gọi AI có phí, bật automation hoặc đổi main/release.
