# S02 — Bài thực hành mẫu: landing page Mộc Studio

Ngày biên soạn: 19/10/2026. Hoàn tất ghi nhận: 21/10/2026.
Chủ dự án chọn dịch vụ chụp ảnh sản phẩm hư cấu và Codex trên Windows. Mộc Studio
là tên minh họa do agent đặt, không phải thương hiệu đã được chủ dự án chốt.

Đầu vào: Windows, tài khoản đủ quyền dùng Codex, thư mục dự án mới và brief dịch vụ.
Đầu ra: một landing page HTML/CSS local, có hero, dịch vụ, quy trình và CTA tới vùng
liên hệ mẫu. Không form backend, API, checkout, thông tin khách hàng hoặc tự publish.

Bài học ở prototype/s02/guide.html gồm chuẩn bị, mở thư mục, duyệt brief trước code,
mở và tự kiểm tra, sửa tiêu đề, bản sao checkpoint, lỗi cơ bản và checklist 5 mục.
Checklist là tự đánh dấu, không phải nghiệm thu tự động. prototype/s02/sample.html
là đầu ra minh họa tự viết; không bảo đảm mọi lần agent sinh mã giống hệt mẫu.

Nguồn Codex đã đọc ngày 19/10:
- https://learn.chatgpt.com/docs/windows/windows-app
- https://learn.chatgpt.com/docs/quickstart?setup=app

Không hứa giá/quota hay điều kiện tài khoản. Chưa thử cài/đăng nhập bằng tài khoản
người mới hoặc chạy prompt AI có phí trong S02. Điều kiện tài khoản cần đối chiếu
khi thực hành; không cần Gemini API để đọc bài hoặc dùng trang mẫu.

Catalog có 6 nguồn thật; quan sát repo/commit/license ngày 19/10 được giữ ở
../acceptance/S02/source-observations.json. Không cài hoặc chạy các repo/skill.
Pico archived có cảnh báo; giấy phép chưa rõ ghi chưa xác định. Không lấy sao,
ảnh minh họa hoặc lời biên tập làm bằng chứng đã thử hay an toàn.

Scope A vẫn theo plan: bốn template lõi, dữ liệu/nguồn/trạng thái/preview, tìm/lọc,
hướng dẫn, báo lỗi và cache ở từng bước. S02 chỉ là prototype tĩnh; chưa có plugin
hoặc backend. Chủ dự án cần duyệt UI/nội dung trước S03; thử với người mới thực tế
vẫn là cổng riêng, không được thay bằng browser test.
