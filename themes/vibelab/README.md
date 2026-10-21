# VibeLab Việt — theme 0.1.0

Khung theme và trang chủ S06, dùng cùng plugin vne-library-core 0.3.0.
Không có WooCommerce, giỏ hàng hoặc thanh toán. Website là thư viện miễn phí;
CTA nguồn mở đúng repo/path thay vì mua hàng.

## Dữ liệu
Không tự tạo bài, term hay option khi kích hoạt. Cài plugin và duyệt nội dung
trước khi trang chủ có thẻ thật. Trạng thái rỗng hoặc thiếu plugin vẫn đọc được.
Home hiển thị tối đa 6 tài nguyên publish theo tên, không gắn nhãn phổ biến/khuyến
nghị khi thiếu dữ liệu. Bài hướng dẫn lấy bài công khai đầu tiên theo tên.

Theme lấy approved snapshot qua vne_library_item(), dùng derived state cho badge
và CTA. Ảnh bìa minh họa dựa trên URL nguồn đã có ở S02, nguồn khác dùng SVG dự phòng.
Không tải ảnh hoặc font từ dịch vụ ngoài. Font Segoe UI / system-ui, hỗ trợ tiếng Việt.

Menu mặc định dùng liên kết thư viện; quản trị có thể gán menu primary hai cấp.
Không JS vẫn hiện menu, có JS mới bật đóng/mở trên mobile.

## Phạm vi
front-page.php là giao diện thật S06. index.php chỉ là fallback đọc/danh sách cho
liên kết và tìm kiếm cơ bản WordPress. Category/card đầy đủ, detail, search/filter
và bài học tương tác lần lượt thuộc S07–S10.

Kiểm thử từ thư mục gốc: npm run test:theme. Chỉ fixture, không sửa database local
hiện có. Bằng chứng nằm ở docs/acceptance/S06. Không đưa dữ liệu fixture lên hosting.

Ảnh SVG ở assets/ là bản minh họa do dự án tạo từ S02. Không là logo, ảnh chụp
sản phẩm thực hay kết quả chạy repo. Hình Mộc Studio là CSS, dịch vụ hư cấu.
