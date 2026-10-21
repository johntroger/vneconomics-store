# vne-library-core — S05

Plugin dữ liệu WordPress, phiên bản 0.3.0. Mã PHP yêu cầu 8.1+; đã chọn kiểm thử
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

S05 có bản sửa/preview/duyệt riêng; chưa có theme, collector hoặc AI. Các bước tiếp theo cần phê duyệt riêng. Không sao chép toàn
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

## Bản sửa và preview S05

Plugin 0.3.0 / meta schema 3; derived state schema 1 giữ tương thích.
GET edit item trả approved_revision và approval_history. Lưu trực tiếp existing
item qua POST /items/{id} cần base_revision trong body cùng payload đầy đủ và
capability vne_approve_library. Form cũ bị xung đột không tự lấy token mới.

- GET/POST /items/{id}/proposals: danh sách riêng/tạo proposal {base_revision,payload}.
- GET /proposals/{pid}: bản ghi riêng với base/current comparison metadata.
- GET /proposals/{pid}/preview: dữ liệu preview riêng, trạng thái vận hành hiện tại.
- POST /proposals/{pid}/approve hoặc /reject: body {reason}, cần quyền approve.

Các route proposal đều no-store/private/noindex, kể cả response từ chối.
Metadata bản sửa nằm ở protected postmeta của CPT private; không qua HTML filter
của post_content. Public item chỉ dùng approved snapshot; ID/slug được giữ.
Trên form nội dung có Tạo bản sửa chờ duyệt; link xem riêng mở thẻ/chi tiết và
đối chiếu ba bản base/current/candidate trước Duyệt/Bỏ.

Kiểm thử: npm run test:revisions (bao gồm hồi quy S03/S04).
Hợp đồng đầy đủ: [S05](../../docs/S05-revision-contract.vi.md).
Khóa không tự bị phá khi hết thời gian; request lỗi thường tự rollback/nhả khóa.
Worker bị giết cần vận hành đối chiếu trước phục hồi. MySQL/InnoDB/cache hosting
chưa được chứng nhận bởi bộ test SQLite local này.
