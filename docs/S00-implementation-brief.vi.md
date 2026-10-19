# S00 — Brief thực thi bản đầu

Ngày: 19/10/2026. Cơ sở: website-build-plan.vi.md 1.10, implementation-plan-gated.vi.md
và chủ dự án cho phép Bắt đầu S00. Trạng thái: đã lập brief, chờ chủ dự án nghiệm thu.

## 1. Quyết định đã được chủ dự án xác nhận trong S00

- Bài thực hành đầu: tạo landing page cho sản phẩm/dịch vụ.
- Công cụ và môi trường ưu tiên của bài: Codex trên Windows.
- Người học: mới hoàn toàn, chưa biết cài công cụ; không giả định đã biết terminal/Git/API.
- Giờ duyệt/thử/bảo trì mỗi tuần: chưa xác định; không gán mặc định một mức công suất.
- Website trung tâm vẫn là WordPress với danh mục/sản phẩm kiểu e-commerce, miễn phí,
  nút truy cập repo, nội dung hướng dẫn và AI BYOK tùy chọn theo các bước riêng.

## 2. Phạm vi mẫu để duyệt trước S02

Đề xuất mẫu tối thiểu: một landing page tĩnh HTML/CSS, JavaScript chỉ khi cần,
chạy local. Khối nội dung: đầu trang/điều hướng, lợi ích chính, mô tả sản phẩm/dịch vụ,
lời kêu gọi hành động và thông tin liên hệ mẫu. Dữ liệu/ảnh ví dụ ghi rõ là mẫu và
có quyền sử dụng; không bịa khách hàng, đánh giá, doanh số hoặc kết quả cam kết.

Sản phẩm/dịch vụ cụ thể và nội dung thương hiệu chưa chọn. Có thể dùng bộ dữ liệu
minh họa ở S02 sau khi thống nhất phạm vi mẫu; không lấy website cá nhân làm đề bài
mặc định. Landing page là sản phẩm của bài học; không thay thế kiến trúc WordPress
của website thư viện, không deploy thay trang chủ store.vneconomics.com.

Đầu vào: máy Windows có quyền cài/chạy công cụ; quyền truy cập Codex phù hợp;
brief nội dung sản phẩm/dịch vụ và tài nguyên hợp lệ. Cài đặt/quyền/tài khoản và chi
phí công cụ cần đối chiếu tài liệu tại S02, không suy ra mọi học viên đã có gói trả
phí hoặc bắt buộc phải có Gemini API để làm bài. S00 chưa kiểm tra đăng nhập/quota
Codex của người học hoặc gọi model.

Checklist đầu ra đề xuất để hoàn thiện ở S02/S10:
1. Mở được landing page bằng quy trình local được hướng dẫn, không lỗi chặn.
2. Có thông điệp, lợi ích và CTA rõ; điều hướng/CTA tới đúng mục hoặc đích mẫu hợp lệ.
3. Desktop/mobile đọc được, không tràn ngang; không dùng link/nút giả như đã hoạt động.
4. Người học đổi được một nội dung hoặc phần trình bày và kiểm tra kết quả.
5. Có checkpoint/bản khôi phục; phân biệt lỗi nội dung, code và môi trường.
6. Không có khóa bí mật trong mã; không có form gửi dữ liệu/dịch vụ ngoài chưa cấu hình.

Không có trong bài đầu: đăng nhập, database, giỏ hàng/thanh toán, form backend,
analytics gửi dữ liệu, tự publish, domain hoặc triển khai production. Nếu nội dung
mẫu cần mở rộng các phần này phải được duyệt riêng. Mã do AI sinh không cần giống
hệt demo, nhưng đầu ra phải vượt checklist đã chốt.

## 3. Điều kiện local đã kiểm tra chỉ đọc trong S00

- Node v24.19.0; npm 11.17.0; Git 2.54.0.windows.1.
- package.json/package-lock.json và dependency @wp-playground/cli 3.1.58 tồn tại.
- File WordPress local ghi wp_version 7.1.3; có wp-load.php và database SQLite đang giữ.
- Cấu hình local-runtime.mjs khai báo PHP 8.3; chưa chạy PHP/WordPress để xác nhận
  hoạt động trong S00. Lần chạy hiện tại thuộc gate S01.
- npm test/dev/local:init đã đi qua run-clean. Không chạy chúng trong S00.
- Baseline nguồn trước thay đổi tài liệu: 97c42af8edb6a6825e0be0c548b5e1e5221357e6.

## 4. Hosting: đã biết và còn thiếu

| Hạng mục | Bằng chứng | Kết luận/việc còn lại |
|---|---|---|
| Trang công khai | HTTP GET trang chủ 19/10 trả 200, text/html, header Server LiteSpeed | Có phản hồi; không chứng minh cấu hình PHP/MySQL hoặc toàn bộ chức năng |
| Đường GitHub -> Plesk | setup-status.md ghi kiểm chứng 17/10 với connection-v2 ở thư mục riêng | Bằng chứng lịch sử; S00 không push release/kích hoạt deploy lại |
| Theme/plugin sản phẩm | Chưa có source riêng trong dự án | Chưa xây/chưa phát hành |
| PHP/extensions và MySQL/MariaDB hosting | Chưa đọc cấu hình Plesk/DB thực tế trong S00 | Cần khảo sát với quyền phù hợp; Playground SQLite không thay chứng nhận hosting |
| Cache server/plugin/CDN | Header LiteSpeed không đủ xác định cấu hình cache | Cần inventory tầng cache, purge/TTL và quyền khi tới thiết kế/phát hành |
| Staging/backup/restore/quota | Chưa xác minh từ giao diện quản trị | Cần môi trường và quyền trước S15; không thử thay bằng production |
| Kết nối từ Codex tới quản trị hosting | Chưa có phiên Plesk được xác minh cho agent | Không giả định có quyền thao tác; có thể cần chủ dự án hỗ trợ khi khảo sát |

Web tool không truy cập được URL; kiểm tra chỉ đọc bằng PowerShell Invoke-WebRequest
thành công. Không suy từ lỗi công cụ web rằng website ngừng hoạt động. Không quét
endpoint quản trị, không đọc cấu hình mật, không đổi file/database trên hosting.

## 5. Phạm vi A dự kiến và điều kiện chưa chốt

Giữ S01–S16 như kế hoạch thực thi: nhập tay trước, bốn template lõi, tìm/lọc đơn giản,
nguồn/trạng thái/preview, hướng dẫn và báo lỗi, kiểm thử/đóng gói/staging trước live.
Scope đóng cuối sau mẫu/prototype S02; S00 không mở collector, Gemini, BYOK hoặc module mới.
Số tài nguyên là mục tiêu linh hoạt, không ép đủ quota trước có công suất biên tập.

Chưa chốt: giờ/tuần, ngân sách vận hành/AI, sản phẩm/dịch vụ minh họa, thương hiệu,
kênh thử, người mới tham gia thử và cấu hình hosting/staging. Chúng không chặn S01
kiểm tra local sau khi được duyệt. Cần nội dung mẫu/công cụ đủ điều kiện trước S02;
ngân sách/provider/người trực trước B/U; quyền staging/restore trước S15 và duyệt
ref/đích/thời điểm riêng trước S16. Không hứa lịch launch hoặc công suất ngày/tuần.

Bước đề nghị tiếp theo: S01 — kiểm tra baseline local bằng smoke hiện có, sửa runner
nếu cần trong phạm vi S01. Chưa được phép bắt đầu cho tới khi chủ dự án đồng ý.
