# S05 — Bản sửa riêng, duyệt và preview

Được phép: S05, local. Không theme S06, collector/AI hay triển khai hosting.

- Core post giữ ID/slug/publication; nội dung public đọc snapshot đã duyệt. Proposal
  là CPT vne_proposal không public/search/rewrite/generic REST, luôn private.
- Snapshot gồm title/excerpt/content, taxonomy, source data và ghi chú nội bộ.
  Không mang state, dependency, validation hoặc review epoch vào đề xuất.
- approved_revision là token content + slug + generation; khác fingerprint kiểm
  chứng kỹ thuật S04. proposed_revision và base_revision bất biến trên mỗi proposal.
- Tạo đề xuất cần quyền sửa item và base_revision đúng lúc tạo. Payload đầy đủ
  được validate như nội dung chuẩn; không đổi post_type/ID/slug/publication gốc.
- Preview thẻ/chi tiết lấy nội dung đề xuất và trạng thái vận hành hiện tại, không
  ghi tạm lên post công khai. Candidate khác revision thử không tự nhận Đã thử.
- Preview/list/detail proposal cần quyền sửa item; no-store/private và noindex.
  Không có URL public cho proposal. UI preview là form quản trị, chưa là theme S06.
- Duyệt/bỏ cần capability vne_approve_library; mặc định administrator và biên tập
  thư viện hiện có. Có thể gỡ capability riêng để chỉ cho người đó tạo đề xuất.
- Khi duyệt: lock theo item, kiểm quyền/base/status ngay trong lock, transaction
  ghi post + snapshot + history + quyết định. Lỗi thì rollback; không xóa cờ state
  mới. Khóa cùng dùng cho lưu tay; hai duyệt hoặc lưu tay cạnh tranh không ghi đè.
- API/form lưu tay existing item phải gửi base_revision. Service nội bộ tương
  thích S03/S04 có thể gọi không token; vẫn kiểm quyền, khóa và ghi history.
  Tích hợp mới phải truyền token nếu dựa vào dữ liệu đọc trước.
- Proposal bị stale trả 409 kèm yêu cầu đối chiếu; không tự merge/rebase. Lấy bản
  mới, so sánh thay đổi và tạo đề xuất mới. Bỏ proposal không thay public.
- Lịch sử giữ snapshot trước/sau và actor/time. Payload proposal không sửa tại chỗ;
  tạo đề xuất mới khi cần chỉnh. Pending/approved/rejected là trạng thái nghiệp vụ
  của bản sửa; core post_status của bản sửa vẫn private.
- Lock fail closed, không tự hết hạn/xóa khóa của người khác. Request lỗi thông
  thường được finally nhả lock. Nếu worker bị giết giữa chừng, cần vận hành xác
  nhận worker đã dừng và đối chiếu DB trước phục hồi lock; không có tự phá khóa.
- Giao dịch được kiểm chứng trên SQLite local. InnoDB/MySQL và object/page/CDN cache
  cần S12/S15; không kết luận tương thích hosting từ test này.
- Mọi người ghi nội dung hỗ trợ đi qua service plugin. Ghi trực tiếp core/database
  từ plugin bên ngoài không thuộc giao thức khóa; token phát hiện thay đổi trước
  duyệt, nhưng không cam kết phối hợp writer ngoài hợp đồng.

Lưu tay khi bị xung đột giữ token cũ trong form; bấm lại vẫn bị từ chối. Người dùng
phải tải GET bản hiện tại và đối chiếu, không tự rebase dữ liệu cũ vào token mới.
Contributor không có quyền approve không thể phát hành item mới ở trạng thái publish.
Lịch sử duyệt chỉ trả trong edit context; không xuất hiện trong payload public.

Proposal payload lưu bằng protected postmeta, không qua bộ lọc HTML post_content.
Preview bỏ media/form/style nguồn để không tự tải tài nguyên ngoài; URL nguồn chỉ
hiện dạng text. Preview này trình bày dữ liệu thẻ/chi tiết trong quản trị; theme
hoàn chỉnh vẫn thuộc S06–S08. Bản stale có đối chiếu base/current/candidate và không
có nút duyệt; chỉ tạo đề xuất mới sau đối chiếu hoặc bỏ bản cũ.

Đối chiếu API: [WordPress rest_post_dispatch](https://developer.wordpress.org/reference/hooks/rest_post_dispatch/);
giao dịch: [SQLite transaction](https://www.sqlite.org/lang_transaction.html).
Header đã thử ở local không thay nghiệm thu cache/proxy hosting trong S12/S15.

Thứ tự khóa object JSON không phải thay đổi nội dung; taxonomy IDs được chuẩn hóa
trước so sánh. Lần cập nhật giữ author/date và slug của core post. Hồ sơ biên tập
thiếu quyền approve không phải một WordPress role mới; chỉ là cấu hình capability.

Cập nhật S13 (22/10/2026): primitive khóa đổi sang INSERT IGNORE nguyên tử, chỉ thành công khi thêm mới đúng một hàng. add_option có upsert nên không bảo đảm độc quyền khi hai tiến trình cùng qua kiểm tra tồn tại. Giữ xóa có điều kiện đúng token, fail closed và không tự phá khóa theo TTL. Bằng chứng tái hiện trước/sau nằm trong acceptance/S13/lock-race-*.json; MySQL hosting vẫn chờ S15.
