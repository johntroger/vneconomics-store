# S05 — Bản sửa riêng, preview và duyệt

Ngày: 21/10/2026. **PASS local; chờ chủ dự án cho phép S06.**
Quyền thực hiện: “cho phép S05”. Nhánh codex/s05-proposals-preview, dựa trên S04
254fda8. Chưa thay main/release, chưa cài plugin vào database local hiện có hoặc hosting.

## Kết quả

Plugin vne-library-core 0.3.0 / meta schema 3; derived schema 1 giữ tương thích.

- Bản đang duyệt có snapshot nội dung riêng. Proposal lưu bằng protected meta của
  CPT private vne_proposal; không tạo thêm sản phẩm hoặc URL public.
- Proposal có base_revision, proposed_revision, snapshot gốc, payload bất biến và
  changed_fields. Tạo/preview không sửa post đang công khai hoặc đổi nó về draft.
- Preview thẻ/chi tiết riêng hiển thị đề xuất cùng trạng thái vận hành mới nhất;
  candidate thay revision kiểm chứng không tự nhận Đã thử.
- Quyền sửa item để đề xuất/preview; vne_approve_library để duyệt/bỏ hoặc lưu tay
  trực tiếp. Tài khoản thiếu quyền này không phát hành item mới bằng đường create.
- Áp dụng kiểm lại base/quyền/status trong lock theo item và transaction. Hai duyệt
  cạnh tranh chỉ một thành công; stale trả 409, không auto merge/rebase.
- Lưu tay existing item qua form/API cần base_revision. Form lỗi giữ token cũ;
  bấm lại không được tự ghi đè dữ liệu mới. Có link tải bản hiện tại để đối chiếu.
- Bỏ proposal không đổi public. Lịch sử giữ trước/sau/actor/time; edit context được
  đọc history, public không nhận history hoặc ghi chú nội bộ.
- ID, slug, URL, tác giả và ngày đăng gốc được giữ khi cập nhật. Dùng wp_update_post
  cho item có sẵn; không reset các trường WordPress nằm ngoài payload chỉnh sửa.
- State/dependency/validation/review epoch không nằm trong proposal payload, nên
  duyệt không xóa cảnh báo mới. Guide dùng dependency hiện tại và giữ bằng chứng cũ.
- Phép so sánh bỏ qua thứ tự khóa JSON; taxonomy ID được chuẩn hóa. Bản không có
  thay đổi thực bị từ chối; title/content không làm báo nhầm data cũng đã đổi.
- Preview và route proposal có private/no-store/noindex, kể cả response bị từ chối.
  HTML preview không tự tải media/style nguồn; không có thao tác chạy repo/skill.

Hợp đồng: [S05-revision-contract.vi.md](../S05-revision-contract.vi.md).
API/cách dùng: [plugin README](../../plugins/vne-library-core/README.md).

## Kiểm thử cuối

Lệnh: npm run test:revisions — scripts/run-clean.mjs. Exit code 0.

| Nhóm | Kết quả |
|---|---|
| Hồi quy S03 | 69 assertion PASS |
| Hồi quy S04 | 265 assertion PASS; 54 tổ hợp trạng thái |
| Backend S05 | 50 assertion PASS |
| Public/preview | Pending không đổi public; preview đúng candidate, URL ổn định, không ghi tạm |
| Quyền | Anonymous/subscriber bị từ chối; biên tập thiếu approve chỉ đề xuất/preview, không duyệt hoặc publish trực tiếp |
| Stale/manual | Sibling approval, sửa tay sau draft, stale token đều không ghi đè; UI thử lại hai lần vẫn conflict |
| Rollback | Lỗi giả lập sau ghi phục hồi core fields/taxonomy/snapshot/history/decision; lock được nhả |
| Lock | Lock đang thuộc người khác trả 409, không bị lấy/xóa |
| Cờ/bằng chứng | Cờ suspend/review mới, dependency và lịch sử validation giữ nguyên khi duyệt |
| Legacy/guide | Seal bài chưa có snapshot không đổi public/token; guide preview/apply dùng đúng revision và dependency hiện tại |
| HTML/JSON | Nội dung có thuộc tính HTML, dấu nháy, backslash giữ đúng; đổi thứ tự khóa không tạo đề xuất giả |
| UI | Tạo đề xuất -> preview -> duyệt trên trình duyệt thật; desktop 1440 và mobile 390 không tràn ngang |
| Header/CSRF | Private preview no-store/noindex; denied REST 403 không lộ nội dung; POST thiếu nonce trả 403 |
| Hai tài khoản HTTP đồng thời | Một 200, một 409; đúng một approved và một pending; public là bản thắng |
| Restart/baseline | Nội dung/bản thắng/history/schema 3 giữ nguyên; home/login/REST 200, không lỗi PHP/database |
| Local/cleanup | DB/config hash không đổi; tmp/tests rỗng; không lock runner; port 19405 đóng |
| Diff | git diff --check PASS |

Chi tiết máy: [test-results.json](S05/test-results.json).
Ảnh đã xem: [desktop](S05/private-preview-desktop.png),
[mobile](S05/private-preview-mobile.png).

Lượt cuối: reviewer B thắng, statuses theo thứ tự request là [409, 200]. Không cố
định người thắng trong test. Fixture giữ transaction 400ms ở race để tạo cạnh tranh
thật giữa hai session; đúng một quyết định được commit. History UI gồm bốn event:
create, sửa tay từ request khác, khôi phục có đối chiếu, approve; hai lần stale
submit không thêm history. Sau restart vẫn đủ bốn event, author gốc vẫn là 1.

Môi trường: Node 24.19.0; @wp-playground/cli 3.1.58; PHP 8.3; WordPress 7.1.3;
SQLite; 6 workers; Playwright Node 1.62.1 + Edge headless. Không cài dependency mới.
Tất cả fixture/tài khoản/nonce/password/mu-plugin race đều được dọn sau đóng
browser và server; chỉ ảnh/JSON nghiệm thu được giữ.

## Phát hiện và sửa trong S05

- Lượt đầu hồi quy đạt, S05 fixture lỗi do giả định hàm/constant PHP tồn tại qua
  request. Đã tách setup đầy đủ cho từng request rồi chạy lại.
- Proposal chuyển từ JSON post_content sang protected postmeta để bộ lọc HTML
  WordPress không biến dạng thuộc tính HTML trong payload.
- Form sau conflict phải giữ token cũ, không tự lấy token mới rồi cho stale data
  ghi đè ở lần bấm sau. Đã kiểm tra hai lần retry liên tiếp bằng browser.
- Ghi item cũ chuyển sang wp_update_post và giữ slug để bảo toàn author/date/URL.
- Rà ảnh preview phát hiện thứ tự khóa object tạo changed_fields giả. Đã chuẩn hóa,
  test no-op object và xác nhận UI chỉ còn title/content là trường thay đổi.
- Các lượt chưa đạt không tính PASS; cleanup được thực hiện cả khi lỗi.

SHA256 local giữ nguyên:
- DB: F2A35E44C395FB790E6EA5524B21F2525D49F75D19FF129E8E3894FA08721FD8
- wp-config.php: B2B3F3FE6DBF560B38DB952A868DF3120FFF14BB39BA96EA34E2F26B5C2892F8

## Giới hạn để duyệt đúng phạm vi

Đây là preview dữ liệu quản trị, chưa là theme website S06–S08. Repo/evidence URL
example và kết quả thử fixture không chứng minh repo ngoài đã chạy thực tế.
Không fetch repo, chạy skill nguồn, gọi AI trả phí, automation hoặc deploy.

MySQL/InnoDB, object/page/CDN cache và phục hồi sau worker bị giết cần nghiệm thu
S12/S15. Lock fail closed, không tự hết hạn/phá khóa: sự cố worker cần vận hành
xác nhận đã dừng và đối chiếu trước phục hồi. Writer được hỗ trợ đi qua service
plugin; không cam kết phối hợp writer trực tiếp core/DB từ plugin ngoài hợp đồng.
Service PHP nội bộ giữ chữ ký tương thích cho fixture S03/S04; tích hợp mới dựa
vào dữ liệu đọc trước phải truyền base_revision như form/REST.

Cảnh báo công cụ để chủ dự án xem khi duyệt: Git báo chuẩn hóa LF/CRLF; diff check
đạt, không làm đổi logic PHP/JS. Test chặn mọi request browser ngoài loopback nên
avatar Gravatar mặc định WordPress có placeholder/lỗi ảnh trong ảnh nghiệm thu;
đây không phải media sản phẩm, chưa là nghiệm thu media/theme. Không ghi nhận
pageerror trong luồng S05. Không lấy kết quả này thay thử người mới S13.

S06 chưa được thực hiện. Theo AGENTS.md và kế hoạch gated, chỉ code S06 sau khi chủ
dự án đồng ý rõ ràng.
