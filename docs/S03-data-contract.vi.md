# S03 — Hợp đồng dữ liệu và phạm vi

Ngày: 21/10/2026. User cho phép S03; chỉ plugin nhập tay, chưa làm resolver S04,
proposed revisions S05, theme S06 hoặc collector/AI. Namespace vne_library_, plugin
vne-library-core; không đổi theme/database local thật trong kiểm thử.

CPT: vne_resource, vne_guide, vne_practice. Taxonomy: vne_category (có cấp), vne_need,
vne_tool. Role vne_library_editor và administrator có capability thư viện riêng;
subscriber/anonymous không ghi. Không tự cấp quyền WordPress Editor/Author sẵn có.
Admin có trang nhập riêng, CSRF nonce; ghi qua cùng service validate như REST.

Metadata _vne_resource (không public qua generic meta): resource_type (learn/skill/
starter/tool), source_url GitHub HTTPS đúng repo/path, repo_id nullable, source_path,
source_revision, source_verified, observed_at, claims. Các claim cost/license/
requirements/permissions/compatibility có value nullable, verification_status
unknown/upstream_claimed/conflicted, source_url, observed_at, note, conflict_sources.
Unknown giữ null + note; upstream_claimed cần value/nguồn/ngày; conflicted cần ít
nhất hai URL nguồn phân biệt + note. Chưa có confirmed/tested trước validation S04.
Note biên tập riêng _vne_editorial_note chỉ đọc ở edit context đã có quyền.

Field dictionary A cho S03: title/excerpt/content dùng core; taxonomy là ID thật;
resource_type và nguồn được validate. Draft được giữ dữ liệu chưa hoàn thiện;
publish đòi title, excerpt, loại, nguồn đã đối chiếu, revision, ngày, danh mục chính
và các claim đúng schema. Nội dung/nhãn không tự khẳng định repo an toàn/đã chạy.
Dữ liệu sai bị từ chối trước ghi, không ghi dở taxonomy hoặc postmeta.

GET public chỉ trả nội dung publish và trường allowlist; draft/private không đọc
được qua API public. POST/GET edit và taxonomy creation đòi capability. Không
fetch URL nguồn hoặc chạy mã, không tạo key/tài khoản ở website thật. CPT generic
REST tắt để không tạo đường ghi meta né service; publication guard bảo vệ field
bắt buộc khi code core tạo bài ngoài service. Service chỉ dành thao tác thủ công,
chưa là cấp quyền cho collector. Template preview nghiệp vụ ở S05/S06; S03 preview
dữ liệu escaped trong trang quản trị.

Kiểm thử trong WordPress fixture qua run-clean: activation/deactivation/reactivation,
CPT/taxonomy/role/meta, lưu/đọc/restart, unknown/conflicted, publish field thiếu,
trường lạ/URL nguy hiểm, anon/subscriber denied, public không lộ draft/note; giao
diện admin nonce/CSRF/escaped và một lần nhập lưu bằng trình duyệt. Không sửa DB .local/site.
