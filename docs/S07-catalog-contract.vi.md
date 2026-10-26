# S07 — Danh mục và thẻ tài nguyên
Ngày 21/10/2026. Chủ dự án cho phép S07. Chưa cho phép S08/deploy.

Phạm vi: archive tài nguyên và taxonomy vne_category, vne_need, vne_tool; breadcrumb,
sidebar danh mục có số lượng, lưới 3/2/1 cột, thẻ và phân trang 9 mục/trang.
Taxonomy ở S07 là đường dẫn duyệt trực tiếp, chưa có bộ lọc kết hợp/sắp xếp S09.
Trang guide/practice giữ fallback S06; đích chi tiết resource giữ bản đọc S06 tới S08.

Thiết kế giữ token/font S06, tiêu đề trái, sidebar gọn và thẻ ảnh lớn như cửa hàng.
Không thêm sort/filter giả, tổng số viết cứng, giá hoặc ratings. Mobile đưa danh mục
lên trên lưới, cho xuống dòng thay vì tràn ngang. Breadcrumb chỉ liên kết đích có thật.

Nguồn dữ liệu: lấy ID vne_resource publish rồi vne_library_item() lấy snapshot công khai.
Membership category/need/tool, tên và thứ tự đều từ approved snapshot. Category cha
bao gồm con; tài nguyên thuộc nhiều nhánh chỉ đếm một lần trong mỗi nhóm. Không lấy
WP term.count vì có cả guide/private/raw taxonomy không phản ánh snapshot.
Main query dùng post__in từ tập này, bỏ ràng buộc taxonomy thô để phân trang native
có tổng đúng, giữ queried_object cho URL/breadcrumb/404. Trang ngoài phạm vi trả 404;
danh mục có thật nhưng rỗng trả 200 kèm đường về tất cả tài nguyên.

Danh mục điều hướng chỉ hiện nhóm có resource công khai (tính cả con), hoặc nhóm
rỗng đang xem và tổ tiên của nó. Nhóm chỉ có draft/private/guide không tô số lượng giả.
Cây có thụt cấp và counts không cộng trùng con. Taxonomy nhu cầu/công cụ chỉ lọc resource,
không trộn guide vào grid.

Thẻ hiển thị loại, danh mục chính, chủ repo theo namespace URL GitHub (không tự coi là
tác giả cá nhân đã xác minh), công dụng ngắn, yêu cầu theo claim hoặc Chưa xác định,
badge/CTA từ derived state. Không suy diễn tương thích agent. Ảnh/tên/Xem chi tiết
mở URL canonical của item; CTA source mở chính xác repo/path trong tab mới, có chỉ dấu.
Suspended/unavailable dùng link giải thích tại #tinh-trang thay cho link nguồn.

Ảnh: giữ SVG biên soạn S02, URL chưa có minh họa hoặc file bìa thiếu dùng bìa chung.
Nếu cả bìa chung không có, hiển thị nhãn Chưa có ảnh minh họa có kích thước ổn định,
vẫn mở chi tiết được. Không fetch thumbnail/nguồn ngoài, không tự cài skill.

MVP mục tiêu 20 resource. S07 nạp snapshot resource công khai trong từng request để
đếm/sắp chính xác; không lưu cache DB/transient. Chi phí tăng theo tài nguyên và danh mục; có sắp toàn tập và quét membership khi thư viện
lớn; chưa chứng nhận hàng nghìn mục. S09/S12/S13 sẽ đo và quyết định index/cache khi cần,
phải giữ chuẩn approved snapshot. Không thay schema/plugin trong S07.

Kiểm thử: taxonomy thật/cha-con/đa danh mục/nhu cầu/công cụ, counts/page1-2-3 không
trùng/thiếu, trang ngoài phạm vi/empty/unknown, snapshot khác raw, draft/private/pending,
thu hồi giữa các request, CTA và ảnh/tên, tên dài/ảnh dự phòng/thiếu file, desktop/tablet/
mobile, keyboard/no-JS, HTTP/JS/PHP, hồi quy S06 khi đổi thẻ dùng chung. Tất cả qua
run-clean trên fixture tuần tự, giữ DB/config local, đóng browser/server trước cleanup.
