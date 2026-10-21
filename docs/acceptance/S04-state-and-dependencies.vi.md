# S04 — Trạng thái và quan hệ kiểm chứng

Ngày: 21/10/2026. **PASS local; dừng chờ chủ dự án cho phép S05.**
Quyền triển khai: yêu cầu “cho phép S04”. Nhánh codex/s04-state-resolver,
dựa trên S03 c07d8b8. Không sửa main/release hoặc triển khai hosting.

## Đã xây

Plugin vne-library-core 0.2.0; schema meta 2, derived state schema 1.

- Resolver duy nhất cho API/view, có badge tiếng Việt, cảnh báo, nguồn/ngày quan
  sát, loại CTA, điều kiện đề xuất và điều kiện hiển thị lệnh.
- WordPress post_status là nguồn sự thật: chỉ publish công khai; hidden dùng
  private. Kiểm chứng cả draft/pending/future/private/trash.
- Truy cập nguồn và archived độc lập, giữ đủ cảnh báo kết hợp. Unknown không tự
  thành unavailable; việc mở URL không tạo “Đã thử”.
- Lịch sử validation append-only, mỗi bằng chứng là một meta row riêng. Cần quyền
  vne_validate_library và revision/môi trường/ngày/input/output/checklist/URL bằng
  chứng. Actor, UUID và thời điểm ghi do server tạo.
- Review/quá hạn/fail/revision lệch che nhãn xanh, giữ lịch sử cũ. Xóa cờ hoặc dời
  hạn không làm mới bằng chứng. Cần lần thử mới khớp revision.
- Quan hệ thủ công guide/practice -> resource + fingerprint + step/tool/version.
  Thay đổi quan trọng, ẩn nguồn, ngừng khuyến nghị, archived hoặc unavailable tạo
  cảnh báo theo bước. Không tự sửa nội dung hoặc xóa bằng chứng.
- Thiếu căn cứ về quyền/license/yêu cầu chặn lệnh cả trên tài nguyên và hướng dẫn
  phụ thuộc. Pass không tự nâng claim thành confirmed.
- Ghi chú/ngày quan sát và đổi tiêu đề đơn thuần không đổi fingerprint kỹ thuật.
- Form trạng thái, form gắn dependency và form ghi bằng chứng đều dùng capability
  và nonce. Đã sửa liên kết label/control bằng for/id.
- Upgrade v1 -> v2 chỉ thêm quyền/schema option; nguồn và lịch sử cũ giữ nguyên.
  Bài S03 mặc định unknown/not_tested, không tự tạo kết quả thử.

Hợp đồng: [S04-state-contract.vi.md](../S04-state-contract.vi.md).
Cách dùng/API: [plugin README](../../plugins/vne-library-core/README.md).

## Kiểm thử cuối

Lệnh: npm run test:state (scripts/run-clean.mjs). Exit code 0.

| Nhóm | Bằng chứng |
|---|---|
| Hồi quy S03 | 69 assertion PASS với plugin mới |
| S04 | 265 assertion PASS, gồm 54 tổ hợp validation/access/maintenance/recommendation |
| Publication/quyền | Năm trạng thái không công khai bị ẩn; subscriber không sửa; biên tập thiếu capability riêng không ghi validation |
| Validation | Thiếu bằng chứng/revision cũ/giả actor bị từ chối; giữ lịch sử, fail không bị pass cũ che; xóa cờ/dời hạn không làm mới nhãn |
| Dependency | Đổi quyền làm resource/guide cần review; đổi tên/ngày không làm mất hiệu lực; gắn lại chưa đủ để khôi phục; retest đúng mới khôi phục |
| Kết hợp | Archived + unavailable giữ cả hai cảnh báo; suspended chặn source CTA; unknown access giữ lịch sử thử |
| Dữ liệu private | Public không trả raw dependency/state/history/actor; resource bị ẩn chỉ tạo cảnh báo chung theo bước, không lộ ID/title của resource |
| UI thật | Edge/Playwright đăng nhập editor; lưu trạng thái; gắn dependency; ghi validation fail; thiếu nonce trả 403; không pageerror trong luồng |
| API HTTP | Badge/CTA khớp form, guide có cảnh báo bước; fail mới hiện trong latest validation |
| Restart | State suspended, guide review_needed và đủ 2/3 bằng chứng resource/guide giữ nguyên |
| Baseline | Home/login/REST đều 200, không lỗi PHP/database trong response |
| Bảo vệ local | SHA256 DB và wp-config.php không đổi |
| Cleanup | tmp/tests rỗng, lock đã nhả, port 19404 đóng, cache/fixture mới đã dọn |
| Diff | git diff --check PASS |

Chi tiết: [test-results.json](S04/test-results.json).
Ảnh: [form trạng thái](S04/state-manual-entry.png),
[form guide/dependency/bằng chứng](S04/guide-dependency-evidence.png).
Ảnh là một vùng form quản trị; ma trận và trạng thái đầy đủ nằm trong JSON.

Môi trường: Node 24.19.0; @wp-playground/cli 3.1.58; PHP 8.3.33;
WordPress 7.1.3; SQLite; Playwright Node 1.62.1 + Edge headless.
Tiếp tục dùng Playwright Node sẵn có theo cách kiểm thử S02/S03; không thêm package.

Các lượt đầu chưa đạt vì label bọc select/textarea làm tên trường chứa cả nội dung
hiện tại. Đã sửa HTML label/control và chạy lại bằng nhãn chính xác. Rà soát nhánh
guide phát hiện label picker cần đóng riêng; đã sửa và bổ sung UI bind/validation,
rồi chạy lại toàn bộ. Mỗi lượt đều dọn fixture/cache, không tính lượt lỗi là PASS.

SHA256 local được bảo vệ:
- DB: F2A35E44C395FB790E6EA5524B21F2525D49F75D19FF129E8E3894FA08721FD8
- wp-config.php: B2B3F3FE6DBF560B38DB952A868DF3120FFF14BB39BA96EA34E2F26B5C2892F8

## Giới hạn và cổng tiếp theo

Chỉ nghiệm thu local plugin/form/API. Fixture, repo URL example và evidence URL
example là dữ liệu giả lập để kiểm tra phần mềm; không chứng minh repo ngoài đã
chạy được hoặc một người mới đã hoàn thành bài học. Không fetch repo, không chạy
skill nguồn, không gọi AI trả phí hoặc triển khai hosting.

Revision S04 là fingerprint của dữ liệu quan trọng. Quy trình proposed/base revision,
duyệt bản sửa và cạnh tranh hai người duyệt thuộc S05, chưa làm. Mọi view/plugin
đọc cùng resolver mới; cache nhiều tầng/purge lỗi thuộc S12, chưa kiểm chứng.
CTA view_reason/view_status là loại hành động mở khối giải thích; href null ngăn
tạo source link hỏng. Theme sẽ ánh xạ hành động này khi triển khai S06–S08.

Plugin chưa cài vào database local hiện có. MySQL/Plesk, mobile admin, Dashboard
core và nghiệm thu người mới không được suy ra từ bộ test này. Staging/production
vẫn theo các cổng S15/S16 riêng.

Theo AGENTS.md và kế hoạch gated: chờ chủ dự án cho phép S05 trước khi code tiếp.
