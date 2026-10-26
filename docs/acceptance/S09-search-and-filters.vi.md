# S09 — Tìm kiếm và bộ lọc

Ngày 21/10/2026 (Asia/Saigon). **PASS kỹ thuật local; dừng trước S10.**
Quyền: “duyệt S09”. Nhánh codex/s09-search-filters từ S08 cdaab49.
Theme 0.4.0; plugin 0.3.0/schema3 giữ nguyên. Không deploy hoặc đổi main/release.

## Kết quả

- Header mặc định tìm tài nguyên. Scope Hướng dẫn và sửa lỗi gồm guide + practice,
  giữ từ khóa khi chuyển; không trộn bài đọc vào grid sản phẩm.
- Search/archive/taxonomy dùng chung engine và template. Index chỉ lấy tên/tóm tắt/
  giới thiệu/taxonomy từ approved public snapshot; raw/proposal/private/note không vào.
  Query native dùng post__in approved, bỏ SQL search/taxonomy thô để membership đồng nhất.
- Chuẩn hóa Unicode NFC, có/không dấu Việt, hoa/thường; alias hữu hạn
  vibe coding/vibecode, kỹ năng/skill/skills. Không fuzzy, semantic search hay AI.
- Từ khóa AND danh mục AND nhóm nhu cầu AND nhóm công cụ; nhiều lựa chọn trong nhóm OR.
  Cha tính con. Facet theo nội dung public của scope; counts danh mục trước bộ lọc
  được ghi rõ, counts kết quả sau lọc. Danh mục rỗng đang chọn giữ qua GET/share.
- Sort tên A–Z/Z–A, độ khớp từ khóa, ngày đối chiếu nguồn; tie ổn định theo tên/ID.
  Index xếp ưu tiên tên/nhu cầu. Sort tên tách khỏi alias; không giả stars, thứ tự
  đề xuất, ngày mới thêm hoặc ngày chạy thử khi chưa có field tương ứng.
- URL GET lưu từ khóa/scope/category/need[]/tool[]/sort/paged. Chip, scope, lọc/sort
  reset trang1; phân trang/Back/share khôi phục kết quả. Bỏ từng chip hoặc xóa tất cả.
- Mobile dialog có draft, focus trap/restore và aria trạng thái. Áp dụng mới đổi URL;
  Đóng/Escape/chạm nền/Back hủy draft, mở lại đúng applied state. Xóa trong panel chỉ
  xóa draft; Apply thay entry panel để Back về kết quả trước, không panel “ma”.
- Không JS/script lỗi vẫn có form GET và link thật. Có trạng thái đang áp dụng;
  input sai/thư viện chưa sẵn sàng có alert riêng, không giả thành0 kết quả.
  Tổ hợp hợp lệ rỗng có đường bỏ lọc/đổi scope; trang quá phạm vi404.
- Giữ ảnh/thẻ, CTA nguồn và trang chi tiết S08; công cụ là nhãn, không tự nhận đã thử
  hoặc tương thích. Guide/practice dùng danh sách bài đọc, phần thực hành S10 chưa làm.

[Hợp đồng S09](../S09-search-contract.vi.md) · [Theme README](../../themes/vibelab/README.md).

## Kiểm thử cuối

Chạy tuần tự qua scripts/run-clean.mjs, fixture riêng, không đổi database local:

| Lệnh | Kết quả |
|---|---|
| npm run test:search | 74 kiểm tra + 28 kiểm tra fixture; 20 truy vấn kỳ vọng PASS |
| npm run test:search-catalog-regression | 46 kiểm tra + 23 fixture PASS; gồm 44 ca S07 và 2 ca S09 reset trang/giữ nhu cầu từ taxonomy |
| npm run test:search-detail-regression | 55 kiểm tra + 19 fixture PASS; gồm 54 ca S08 và ca taxonomy404 có/tắt từ khóa |
| npm run test:search-home-regression | 59 kiểm tra S06 PASS |

WordPress 7.1.3 / PHP 8.3 / SQLite; Microsoft Edge headless / Playwright Node 1.62.1.

20 đáp án kỳ vọng được xác định bằng ID fixture độc lập: dấu/không dấu/NFC/hoa-thường,
alias, nội dung approved khác raw, scope terminal/landing page, OR từng nhóm,
AND khác nhóm, cha/con, tổ hợp rỗng. Còn kiểm tra raw/proposal/private/note không tìm
được, guide có practice, sort/tie/ngày, date thiếu bằng comparator phòng vệ, ranking,
chia sẻ URL, chip, reset trang, Back từ chi tiết, khôi phục dropdown/từ khóa khi Back, dialog/keyboard, no-JS/script lỗi,
input sai, empty/service state,404 và thu hồi ở request kế tiếp.
Model hiện bắt buộc ngày khi publish; ca thiếu ngày là unit comparator, không là
fixture public hợp lệ hoặc dữ kiện repo thật.

[Kết quả S09](S09/test-results.json) · [S07](S09/S07-regression/test-results.json) ·
[S08](S09/S08-regression/test-results.json) · [S06](S09/S06-regression/test-results.json).

## Ảnh và rà trực quan

- [Search desktop màn đầu](S09/search-desktop-top.png), [toàn trang](S09/search-desktop.png)
- [Mobile](S09/search-mobile.png), [320px](S09/search-small-mobile.png), [tablet](S09/search-tablet.png)
- [Panel lọc nháp](S09/mobile-filter-draft.png)
- [Hướng dẫn/sửa lỗi](S09/guide-results.png)
- [Không JS](S09/no-js.png), [script lỗi](S09/script-blocked.png)
- [Input sai](S09/invalid-input.png), [tổ hợp rỗng](S09/empty-combination.png)
- [Thư viện chưa sẵn sàng](S09/library-unavailable.png)

Đã xem bố cục desktop/mobile, nhãn scope, chip, panel và các trạng thái.
Ảnh nội bộ được cuộn/đợi decode trước khi chụp. Hồi quy ghi riêng trong S09;
hồ sơ S06/S07/S08 gốc giữ nguyên.

## Cleanup, điều chỉnh và giới hạn

- Browser/server đóng trước khi run-clean dọn fixture/cache mới, kể cả lượt thất bại.
  tmp/tests rỗng, không lock, cổng 19406–19409 không listen; hash DB/config gốc giữ nguyên. Các kết quả ghi hash 25 file runtime theme và được đối chiếu source/fixture.
  [Postflight](S09/postflight.json). Không kích hoạt theme/plugin hoặc nạp QA vào site
  local đang dùng; bảo toàn source/runtime/library/backup và evidence.
- [Nhật ký](S09/run-notes.vi.md): đã sửa alias làm sai sort tên và lỗi Back giữ lựa chọn form mới; UI review sửa thứ tự
  cha/con và giữ danh mục rỗng qua GET. Lượt cuối chạy lại sau thay đổi, không lấy
  PASS cũ thay cho việc nghiệm thu mã mới.
- S09 dùng12 resource và4 guide/practice giả lập QA, không giới thiệu repo thật mới.
  Hồi quy dùng nguồn S02 đã lưu và fixture cũ; không kiểm tra lại hiện trạng GitHub,
  cài/chạy repo hoặc gọi Gemini/AI trả phí.
- Snapshot/index/facet nạp theo request, phù hợp phạm vi MVP; chưa đo load thư viện lớn.
  Chưa chứng nhận MySQL/cache/plugin hosting, Safari/Firefox hoặc usability người mới.
  Giữ cơ chế Back/scroll native; máy kiểm tra URL/kết quả/focus, không thay usability S13.
- Semantic search, stars/đề xuất, OS/chi phí/độ khó và provider AI chưa được thêm.
  Bộ thực hành vẫn dùng bản đọc nền; S10 cần được duyệt riêng.
- Git có cảnh báo LF/CRLF theo .gitattributes; diff --check sạch. Playwright Node
  có sẵn được dùng như các bước trước, không cài Python package mới.

## Điểm dừng

S09 đạt kỹ thuật local; chờ chủ dự án xem giao diện và duyệt S10.
Chưa deploy, cập nhật main/release, chạy automation hoặc tự mở bước tiếp theo.
