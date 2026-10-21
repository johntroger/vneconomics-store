# S07 — Danh mục và thẻ tài nguyên
Ngày 21/10/2026 (Asia/Saigon). **PASS kỹ thuật local; chờ chủ dự án duyệt S08.**
Quyền thực hiện: “cho phép S07”. Nhánh codex/s07-catalog-cards, dựa trên S06 69be5e5.
Theme 0.2.0; plugin 0.3.0/schema 3 giữ nguyên. Chưa deploy hoặc đổi main/release.

## Kết quả
- Archive tài nguyên và taxonomy danh mục/nhu cầu/công cụ có trang thật, breadcrumb,
  mô tả, lưới 3/2/1 cột, danh mục có số lượng và phân trang 9 mục/trang.
- Tập resource chỉ gồm publish và approved snapshot. Membership, thứ tự tên, counts
  và main query dùng cùng tập ID; không tính guide/private/draft/proposal hoặc dùng
  WP term.count. Category cha gồm con, item ở nhiều nhánh chỉ tính một lần mỗi nhóm.
- Sidebar bỏ nhóm rỗng, trừ nhóm rỗng đang xem và tổ tiên. Có danh mục nhưng chưa có
  resource trả 200; trang ngoài phạm vi hoặc taxonomy không có trả 404 có đường phục hồi.
- Thẻ dùng chung home/catalog có minh họa, loại, danh mục chính, chủ repo, công dụng,
  yêu cầu với mức xác minh và badge/CTA của resolver. Chủ repo là namespace trong URL
  GitHub, không tự coi là tác giả cá nhân đã xác minh qua hồ sơ.
- Ảnh/tên/Xem chi tiết mở cùng permalink. Nguồn hợp lệ mở trực tiếp đúng repo/path,
  có chỉ dấu tab mới; suspended/unavailable mở phần giải thích, không có nút nguồn.
- URL chưa có bìa hoặc thiếu file dùng bìa chung; thiếu cả bìa chung dùng nhãn có kích
  thước ổn định. Kiểm tra file thường và làm mới stat trước khi chọn, không trả ảnh lỗi.
- Thư viện rỗng đưa về trang chủ; không dẫn vòng lại trang rỗng. Không tạo filter,
  sort dropdown, giá, rating, sao GitHub hoặc nút AI chưa có chức năng.

[Hợp đồng S07](../S07-catalog-contract.vi.md) · [Theme README](../../themes/vibelab/README.md).

## Kiểm thử cuối

Chạy tuần tự, qua scripts/run-clean.mjs:
- npm run test:catalog — **44 điểm kiểm tra UI/HTTP và 23 kiểm tra fixture PASS**.
- npm run test:catalog-regression — **59 điểm hồi quy S06 PASS** trên theme mới.

WordPress 7.1.3 / PHP 8.3 / SQLite; Microsoft Edge headless, Playwright Node 1.62.1.

| Nhóm | Bằng chứng |
|---|---|
| Tập dữ liệu QA | 20 resource: 6 ví dụ nguồn lưu S02 + 14 giả lập có ghi chú QA; không phải 20 repo thật mới được tuyển chọn |
| Counts độc lập | Tổng20; cha13; con12; mẫu5; skills3; nhu cầu3; công cụ2; hai nhóm rỗng0 |
| Phân trang | 9/9/2 mục, đủ20 ID đúng thứ tự một lần; trang cuối không nút tiếp; Enter dùng được |
| Membership | Kể cả khi raw taxonomy khác snapshot; cha/con và đa danh mục không trùng; guide/private/pending không vào grid |
| Taxonomy | URL thật cho category/need/tool, mô tả và breadcrumb có ancestor; query-string page2 hoạt động |
| Empty/404 | Term có thật nhưng rỗng200; term lạ và page4 của tập20 trả404; recovery không vòng lại empty archive |
| Thẻ | Mọi thẻ qua3 trang đúng tên/ảnh/đích nguồn/path/nhãn; ảnh/tên click thật vào cùng bản đọc |
| Trạng thái | Unavailable/suspended không mở nguồn; requirements ghi Theo nguồn hoặc Chưa xác định/mâu thuẫn |
| Media | Gỡ file bìa và bìa chung trong fixture; fallback/placeholder vẫn hoạt động, không image404 |
| Responsive | 1440, 820, 390, 320px không tràn ngang; tên có chuỗi dài không ngắt vẫn đọc được |
| Không JS | Sidebar và phân trang taxonomy hoạt động bằng liên kết HTML |
| Thu hồi | Chuyển resource thành draft: request kế tiếp còn19; thu hồi toàn bộ: archive0, không trang ảo |
| Hồi quy S06 | Home, dữ liệu đã duyệt/head, menu/keyboard/JS lỗi, nguồn, empty/plugin tắt và bìa dự phòng |
| Lỗi runtime | Không pageerror JS hoặc HTTP lỗi nội bộ bất ngờ trong lượt cuối |

[S07 test-results](S07/test-results.json) · [S06 regression](S07/S06-regression/test-results.json).

## Ảnh nghiệm thu

Đã rà trực quan bố cục desktop/mobile, phân trang, tên dài, ảnh thiếu và trạng thái
rỗng. Bộ chụp cuộn và đợi decode ảnh trước khi ghi, tránh ảnh trống do lazy loading.

- [Archive desktop](S07/archive-desktop.png)
- [Danh mục desktop](S07/category-desktop.png), [tablet](S07/category-tablet.png)
- [Danh mục mobile](S07/category-mobile.png), [320px](S07/category-small-mobile.png)
- [Tên dài](S07/long-title-mobile.png), [không JS](S07/no-js-mobile.png)
- [Placeholder khi thiếu bìa](S07/missing-image-placeholder.png)
- [Danh mục rỗng](S07/empty-category.png), [archive rỗng](S07/empty-archive.png)
- [Hồi quy trang chủ](S07/S06-regression/home-desktop.png)

## Cleanup và bảo toàn
Browser/server đã đóng trước khi bộ chạy dọn fixture/cache mới. tmp/tests rỗng,
không lock, cổng 19407/19406 không listen. Hash của .local/site database và wp-config.php
giữ nguyên; ghi trong hai file JSON. Không nạp dữ liệu QA vào site local đang dùng.
Không xóa thư viện/runtime, dữ liệu hiện có hoặc bằng chứng nghiệm thu.

## Giới hạn và cảnh báo
- Chi tiết hiện dùng bản đọc S06 tới S08. Chưa làm bộ lọc kết hợp/sort S09, bài học
  tương tác S10 hoặc hỗ trợ S11. Taxonomy need/tool ở S07 chỉ là link duyệt trực tiếp.
- Nạp snapshot resource trong mỗi request để đếm chính xác cho MVP20; chưa chứng nhận
  hàng nghìn mục. Cần đo/index/cache phù hợp ở các bước sau, giữ chuẩn approved snapshot.
- Không gọi lại GitHub/Gemini/AI hoặc chạy repo. Dữ liệu truy cập/trạng thái ngoài bộ
  nguồn S02 được giả lập để kiểm thử, không là xác minh hiện trạng nguồn thực.
- Chưa kiểm thử hosting PHP/MySQL/cache/plugin khác, Safari/Firefox hoặc người mới.
  PASS local không thay staging/usability. Font vẫn Segoe UI/system-ui theo S06.
- Lượt đầu ca gỡ file bìa phát hiện vẫn trả đường dẫn cũ trên fixture Playground.
  Đã bổ sung is_file và clearstatcache cùng is_readable, rồi chạy lại toàn bộ S07.
- Git có cảnh báo chuẩn hóa LF/CRLF theo cấu hình và .gitattributes; diff --check sạch.
  Playwright Node dùng runtime có sẵn như S02–S06, không cài thêm Python package.
- Hồ sơ S06 gốc giữ nguyên. Kết quả chạy lại trên theme0.2.0 lưu riêng trong S07/S06-regression.

## Điểm dừng
S07 đạt kỹ thuật local; dừng chờ chủ dự án xem giao diện và cho phép S08.
Không tự triển khai, gọi AI có phí, bật automation hoặc thay nhánh phát hành.
