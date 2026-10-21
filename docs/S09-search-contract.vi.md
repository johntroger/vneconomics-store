# S09 — Hợp đồng tìm kiếm và bộ lọc
Ngày 21/10/2026. Chủ dự án duyệt S09; nhánh codex/s09-search-filters từ S08 cdaab49.
Chỉ local, không mở S10, AI, collector hay triển khai hosting.

## Phạm vi và thiết kế
Giữ token/font, header/card và lưới S06–S08. Resource dùng thẻ e-commerce; scope
hướng dẫn/sửa lỗi gồm vne_guide + vne_practice, trình bày bài đọc riêng.
Trang search, archive resource, guide/practice và taxonomy dùng chung cơ chế approved.
Không lẫn draft/private/proposal/raw title/content/taxonomy vào index, count hay facet.

Query s (tối đa160 ký tự), scope=resources|guides, category=slug,
need[]=slug, tool[]=slug (mỗi nhóm tối đa12), sort, paged.
URL finder bắt đầu /?vne_find=1, hỗ trợ cả từ khóa rỗng. Archive/taxonomy cũ vẫn dùng được.
Scope mặc định resource; chuyển scope giữ từ khóa/sort và xóa lọc không cùng phạm vi.
Form/chip/scope/sort đặt lại trang1; phân trang giữ mọi tiêu chí. Back/share dùng GET
và lịch sử trình duyệt, không fetch hoặc tạo kết quả giả ở client.

## Logic
Chuẩn hóa Unicode NFC, bỏ dấu Việt (đ/Đ), chữ thường và dấu phân cách.
Alias hữu hạn: vibe coding/vibecode; kỹ năng/skill/skills. Không semantic/fuzzy/AI.
Các từ trong từ khóa kết hợp AND, khớp chuỗi con trong nội dung chuẩn hóa.
Từ khóa AND danh mục AND nhóm nhu cầu AND nhóm công cụ; trong need/tool dùng OR.
Danh mục cha tính con theo category approved. Facet chỉ lấy term thuộc nội dung
public trong scope (kể cả tổ tiên category), không WP term.count hoặc proposal.
Danh mục có URL hợp lệ nhưng rỗng được giữ riêng với số0 khi đang chọn, không tự quảng bá trong facet.
Counts danh mục là tổng theo scope trước bộ lọc; kết quả là tổng sau toàn bộ điều kiện.
Công cụ là nhãn biên tập, không tự nâng thành đã thử/tương thích.
Index: tên, tóm tắt, giới thiệu và tên taxonomy approved; loại skill có alias skill.
Không index ghi chú nội bộ, URL tham chiếu hay trường claim chưa xác minh.
Rank ưu tiên tên và nhu cầu hơn mô tả/nội dung; đồng hạng theo tên chuẩn hóa rồi ID.

Sort: phù hợp từ khóa (khi có từ khóa), tên A–Z/Z–A, đối chiếu nguồn gần nhất.
Ngày lấy source observed_at/document_source observed_at, thiếu xếp sau; không coi là
ngày chạy thử/mới thêm. Chưa có field đề xuất/stars nên không dựng lựa chọn đó.
Không thêm schema hoặc đọc audit riêng để tạo thứ tự mới.

Input sai kiểu/quá dài/term không thuộc scope: thông báo lỗi áp dụng có đường phục hồi,
không bỏ âm thầm để mở rộng kết quả hoặc giả thành không có kết quả.
Không có plugin: trạng thái thư viện chưa sẵn sàng. Tập rỗng hợp lệ: giải thích bỏ lọc/
đổi từ khóa hoặc chuyển scope giữ từ khóa. Trang vượt phạm vi trả404.
Public counts/query dùng post__in approved, xóa raw SQL s/tax constraints sau khi chọn ID.

## Mobile và progressive enhancement
Desktop lọc trong sidebar. Mobile có nút Bộ lọc và số đang chọn, dialog focus trap;
lựa chọn là nháp đến Áp dụng. Xóa tất cả trong panel chỉ xóa draft category/need/tool.
X/nhấn nền/Escape/Back đóng và hủy draft; mở lại lấy applied state.
Áp dụng thay entry panel bằng URL kết quả; Back về kết quả trước, không panel rỗng.
Chip/list Xóa tất cả có hiệu lực ngay. Không JS hoặc script lỗi: form GET hiện inline,
các scope/chip/pagination vẫn là link và nút submit thật. Không tự chạy AJAX.
Giữ focus/khôi phục cuộn theo trình duyệt, thao tác bằng bàn phím và safe new-tab CTA.

## File và cổng nghiệm thu
Theme discovery.php, discovery-template.php, search/archive guide/practice,
header, assets/discovery.js, style; plugin/schema giữ nguyên. Test fixture riêng và
runner qua run-clean; ghi evidence S09, không ghi đè S06/S07/S08.
20 truy vấn kỳ vọng độc lập, dấu/alias/AND/OR/scope/unknown/raw/proposal/thu hồi,
sort/tie/missing date, pagination/reset/Back/share, dialog draft/close/escape/backdrop/
Back/apply, no-JS/script lỗi, mobile320/390/820/1440, nguồn/chi tiết và regression.
Sau PASS + cleanup + bảo toàn DB/config + báo cáo + push nhánh review: dừng trước S10.
