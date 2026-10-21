# S04 — Hợp đồng trạng thái v1

Phạm vi được cho phép: resolver, validation thủ công và dependency. Không làm S05,
theme, collector, AI hoặc triển khai hosting.

WordPress post_status là nguồn duy nhất của tính công khai: chỉ publish được đọc
qua catalog/API. Hidden dùng private; draft/pending/future/private/trash đều ẩn.

Metadata trạng thái riêng gồm source_access và maintenance: mỗi trục có status,
source_url, observed_at, note. available/unavailable và active/archived cần nguồn,
ngày, ghi chú. unknown không có nghĩa unavailable hoặc not_tested. Nguồn đã đối
chiếu ở S03 không tự tạo quan sát available. Bài S03 đọc bằng mặc định unknown,
normal, chưa thử; không chạy migration phá dữ liệu.

Recommendation normal/suspended có reason; suspended bắt buộc lý do. Mỗi lần thay
đổi có actor/time do server ghi. Archived + normal phải có lý do duy trì.
Review có needed/reason/reviewed_at/review_due_at; quá hạn tạo cảnh báo khi đọc,
không cần cron. Không cập nhật ngày thử từ lượt truy cập URL.

Validation là lịch sử append-only qua service riêng: revision hash hiện tại,
outcome pass/fail, tested_at, OS/tool/version, input/output, checklist và evidence_url
HTTPS. Người nhập có quyền vne_validate_library; không nhận validation_status hay
actor/ID do client cấp. Pass chỉ hiện hành khi hash khớp, chưa quá hạn, không cờ
review hoặc cảnh báo dependency. Fail mới nhất không bị một pass cũ che khuất.
Đây là ghi nhận thủ công của biên tập, không phải plugin tự chạy repo.

Resource revision hash gồm source URL/path/revision và claim chi phí, quyền,
giấy phép, yêu cầu, tương thích. Đổi title/excerpt/ghi chú nội bộ không đổi hash.
Guide/practice hash gồm nội dung, nguồn tài liệu và dependency snapshot. Quan hệ
gồm resource_id, resource_revision hash, step, tool, version. Chỉ gắn resource đang
publish; server kiểm tra hash trước khi lưu. Editor chủ động gắn lại phiên bản rồi
thử lại guide; resolver không tự thay snapshot.

Dependency đổi revision, bị ẩn/xóa, suspended, nguồn unavailable, archived hoặc
cần review/quá hạn tạo cảnh báo ở step và làm guide cần rà soát. Không sửa nội dung,
không xóa lịch sử validation. Khi resource bị ẩn, public chỉ nhận cảnh báo chung ở
step, không nhận ID/title/URL/nội dung của resource đó. Edit context được xem ID.

Ưu tiên badge/CTA: hidden > suspended > unavailable > review_needed > archived >
access_unknown > tested > not_tested. Cảnh báo phụ giữ đủ. Suspended/unavailable
không có source CTA; review có thể mở URL đã đối chiếu nhưng không khuyến nghị
lệnh. Unknown access có thể giữ URL đã đối chiếu, kèm giải thích và không đề xuất.
Đủ điều kiện đề xuất khi tested hiện hành, normal, available; archived cần quyết
định duy trì có lý do. Không coi đã thử là an toàn tuyệt đối.

API/schema v1 trả derived state chung cho theme/API: is_public, primary_badge,
warnings, validation_status, source_access_status, maintenance_status,
recommendation_status, cta (kind/label/href), recommendation_eligible,
commands_allowed, current_revision và latest_validation. Resolver đọc trực tiếp
dữ liệu mới; cache đa tầng theo S12 chưa được triển khai ở S04.

POST /items/{id}/state nhận full state input (không actor/time).
POST /items/{id}/validations thêm bằng chứng, không sửa/xóa lịch sử.
POST /items/{id}/dependencies thay danh sách snapshot (guide/practice).
Các route dùng quyền WordPress; nonce cho form và xác thực REST của core.
Public API không trả raw internal state/dependency/actor; edit context có dữ liệu
nhập tay. Tất cả thao tác trên cùng item cần quyền sửa item.

Chi tiết v1: primary_label và warning.message được plugin dịch sang tiếng Việt;
observations giữ nguồn/ngày/ghi chú cho cả access và maintenance; API cũng trả
reviewed_at, review_due_at và recommendation_reason. Actor/counter nội bộ không
nằm trong latest_validation công khai. Ghi chú nội bộ vẫn chỉ ở edit context.

Hash bỏ qua ngày quan sát và ghi chú nguồn/claim; chỉ đổi giá trị, mức xác nhận,
nguồn claim hoặc revision/path nguồn mới ảnh hưởng kết quả thử. Sửa lịch tới hạn
hoặc xóa cờ rà soát không làm mới bằng chứng: review epoch nội bộ ngăn khôi phục
pass cũ. Bằng chứng mới được thêm bằng từng meta row để không thay lịch sử trước.

Quyền/giấy phép/yêu cầu chưa rõ chặn commands_allowed cho cả tài nguyên và bước
hướng dẫn phụ thuộc. Pass không tự chuyển claim upstream_claimed thành confirmed.
Schema meta v2 nâng cộng thêm capability từ v1; không viết lại post/source/history.
Revision tại S04 là fingerprint; proposed/base_revision và duyệt bản sửa thuộc S05.
