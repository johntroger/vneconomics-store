# vne-library-core — S04

Plugin dữ liệu WordPress, phiên bản 0.2.0. Mã PHP yêu cầu 8.1+; đã chọn kiểm thử
local PHP 8.3 / WordPress 7.1.3. Chưa có xác nhận tương thích MySQL/Plesk.

- Ba loại nội dung: tài nguyên, hướng dẫn, bộ thực hành.
- Phân loại: danh mục, nhu cầu, công cụ.
- Menu **Thư viện**: nhập tay, lưu nháp/xuất bản/riêng tư, xem JSON hiện tại.
- Administrator và role **Biên tập thư viện** được thao tác. Không tự đổi role người dùng.
- Không tự tạo dữ liệu khi kích hoạt; tắt plugin giữ bài/meta/phân loại.
- source_verified chỉ là đối chiếu đúng nguồn, không phải đã chạy thử.
- Claim chưa rõ giữ null và ghi chú. Không tự suy diễn chi phí hoặc giấy phép.

## API

Namespace /wp-json/vne-library/v1:

| Method | Path | Quyền |
|---|---|---|
| GET | /items?post_type=vne_resource | Public, tối đa 50 bài publish |
| GET | /items?context=edit&post_type=vne_guide | Biên tập thư viện |
| GET | /items/{id} | Chỉ publish; context=edit cần quyền sửa |
| POST | /items | Tạo bằng payload đầy đủ đã validate |
| POST | /items/{id} | Thay toàn bộ trường nhập theo payload, không partial patch |
| POST | /terms | Tạo taxonomy nằm trong allowlist |

Dùng cơ chế xác thực WordPress. Cookie REST cần nonce của WordPress; plugin không
phát hành API key riêng. Generic CPT REST tắt. Ghi chú nội bộ không nằm trong
serializer công khai. Không fetch/chạy URL nguồn.

Schema và điều kiện xuất bản: [hợp đồng S03](../../docs/S03-data-contract.vi.md).
Chạy kiểm thử từ gốc repo: npm run test:library (tự dọn fixture/cache).
Script kiểm thử dùng Edge và Playwright đi kèm Codex; không cần provider AI.

S04 chưa có theme riêng, collector, AI hoặc quy trình
bản sửa/duyệt. Các chức năng đó cần phê duyệt bước tương ứng. Không sao chép toàn
bộ repo vào thư mục WordPress để cài plugin.

## Trạng thái và kiểm chứng S04

Resolver dùng chung cho view/API, ba POST route thêm: /items/{id}/state,
/items/{id}/validations, /items/{id}/dependencies. Cần quyền sửa item; ghi bằng
chứng cần thêm vne_validate_library. Không nhận validation_status từ client.

Nguồn sự thật publication là post_status; hidden dùng private. Source access và
archived độc lập; lịch sử thử giữ nguyên khi cần review hoặc nguồn không mở được.
Bằng chứng pass cần revision/môi trường/ngày/input/output/checklist/URL bằng chứng.
Các form ở Thư viện cho phép ghi thủ công; plugin không tự chạy repo.

Xem [hợp đồng trạng thái](../../docs/S04-state-contract.vi.md).
Kiểm thử: npm run test:state; gồm hồi quy S03, 54 tổ hợp, quyền, dependency,
form quản trị, HTTP và restart trong fixture tự dọn. Schema meta 2 / derived schema 1.
