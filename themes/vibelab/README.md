# VibeLab Việt — theme 0.2.0

Theme nền/trang chủ S06 và danh mục/thẻ S07, dùng plugin vne-library-core 0.3.0.
Không có WooCommerce, giỏ hàng hoặc thanh toán. Website là thư viện miễn phí;
CTA mở đúng repo/path. Không bắt người đọc kết nối AI trước khi mở nguồn.

## Dữ liệu và điều hướng

Theme không tự tạo dữ liệu khi kích hoạt. Nội dung công khai lấy qua
vne_library_item(), từ approved snapshot và derived state. Home tối đa 6 resource;
guide đầu tiên theo tên. Thẻ ghi loại, chủ repo theo namespace URL, yêu cầu theo
claim hoặc chưa xác định; không tự nhận đã thử hay tương thích agent.

Archive tài nguyên và taxonomy category/need/tool có breadcrumb, danh mục có counts,
grid 3/2/1 cột, 9 mục/trang theo tên approved. Category cha tính cả con, đa danh mục
không đếm trùng. Sidebar bỏ nhóm rỗng trừ nhóm đang xem; guide/private/draft/proposal
không vào số resource. Không dùng WP term.count để đếm. Không có combined filters/sort S09.

Danh mục đã có nhưng rỗng trả 200 và liên kết phục hồi; URL không có hoặc trang ngoài
phạm vi trả 404. Main query dùng tập ID approved để membership/count/phân trang đồng nhất,
không dựa raw taxonomy. Snapshot nạp trong từng request, chưa cache/index cho thư viện lớn.
MVP dự kiến 20 resource; xem hợp đồng S07 trước khi tăng quy mô.

Ảnh SVG từ S02 là minh họa tự biên soạn. Nguồn chưa có bìa hoặc thiếu file dùng bìa chung;
thiếu cả file chung hiện nhãn Chưa có ảnh minh họa. Không tải font/ảnh từ dịch vụ ngoài.
Font Segoe UI/system-ui. Menu primary hỗ trợ hai cấp; không JS vẫn hiện liên kết.

## Phạm vi và kiểm thử

catalog-template.php và catalog.php: danh mục S07.
index.php: bản đọc/danh sách tạm cho các đích chưa có template riêng.
Chưa hoàn tất sản phẩm chi tiết S08, tìm/lọc S09, bài học tương tác S10 hoặc trang hỗ trợ S11.

Tại root, chạy tuần tự:
- npm run test:catalog
- npm run test:catalog-regression

Bộ thứ hai chạy lại 59 điểm S06 trên theme mới, lưu bằng chứng ở
docs/acceptance/S07/S06-regression để giữ nguyên hồ sơ S06 gốc.
Mọi thử nghiệm qua run-clean, không sửa database local đang dùng và không deploy.
