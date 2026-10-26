# R1 — Đối chiếu local, GitHub và Plesk

Ngày26/10/2026. **PASS khảo sát chỉ đọc**, đủ dữ kiện chuẩn bị R2 local. Không phải nghiệm thu pipeline triển khai mới.

## Quyền và phạm vi

Chủ dự án trả lời “ok” sau kế hoạch khôi phục local → GitHub → Plesk, bước đầu được nêu rõ là R1 chỉ đọc. Đã đọc Git local, GitHub refs/API, cấu hình Git trên Plesk, file/nội dung/journal/backup production và trạng thái staging. Chủ dự án đăng nhập trực tiếp Mắt Bão khi phiên cũ hết hạn.

Không push/đổi ref, chạy CI, Pull now/Deploy now, đổi webhook/key/quyền/đích/mode, cài theme/plugin, nhập bài, tạo backup hoặc cập nhật journal. Settings/bộ chọn thư mục đều thoát bằng Cancel. Các truy vấn WP-CLI có guard root/DB và chỉ đọc; mã truy vấn được giữ trong thư mục bằng chứng, không tạo file helper trên hosting.

## Bảng đối chiếu

| Phần | Quan sát hiện hành | Kết luận |
|---|---|---|
| Git local | HEAD `0499402e4708336deb9c58802b2981bbd44103f8`, nhánh `codex/s16-production`;23 commit sau mốc remote S12 | Có thể dùng lại lịch sử, cần rà soát và đưa nhánh nguồn lên GitHub ở R3 |
| GitHub nguồn | Chưa có nhánh `codex/s16-production`; main `6cd895f`, nhánh bước hiện có tới S12 | Chưa lưu toàn bộ trạng thái đã làm qua nhánh nguồn trên remote |
| GitHub payload | `release` = `4fe952ac7eec550d3125be9885fa6271aece2718` | Vẫn chỉ là payload kiểm tra kết nối |
| Plesk clone | HEAD `refs/heads/release`, commit đúng `4fe952a` | Khớp GitHub release, khác nguồn ứng dụng live |
| Plesk Git production | Automatic tới `/store.vneconomics.com/codex-deploy-check`; deploy actions tắt | Giữ nguyên bằng chứng kết nối, không dùng làm đích theme/plugin |
| Webhook |1hook active, push, HTTPS/SSL verification; hash endpoint trùng Plesk | Cấu hình hai đầu khớp; API trả0 delivery gần đây, không chứng nhận lượt webhook mới |
| Deploy key | Key166728434, `Plesk store.vneconomics.com`, read_only=true | Có tài nguyên đọc repository hiện hữu; không thêm quyền |
| GitHub workflow | API trả total_count=0 trên nhánh mặc định main; workflow kiểm gói chỉ thấy ở local | R2 cần hoàn thiện workflow/bootstrap, R3 mới push và chạy CI |
| Theme production |0.7.2, đủ38file,0file lệch/thiếu/thừa/symlink | Khớp manifest ZIP và blob Git nguồn |
| Plugin production |0.4.2/schema3, đủ10file,0file lệch/thiếu/thừa/symlink | Giữ nguyên, không cần cài lại để đổi quy trình |
| Nội dung production |106resource,6guide,1practice;130hàng thuộc5loại nội dung đã thống kê | Giữ toàn bộ baseline hiện tại |
| Nội dung gốc |128hàng khớp hash cũ; metadata khớp khi loại riêng validation Codex đã ghi nhận | Không phát hiện chênh lệch với baseline đã duyệt |
| C100 |10journal verified, mỗi lô10bài;100bài khớp title/source/body journal;10payload hash khớp gói local | Không nhập lại100bài trên production |
| Bộ ba hướng dẫn | Codex107, Claude213, Antigravity215; mỗi bài1validation, commandsAllowed=true | Giữ ID/bài/bằng chứng hiện có; public hub có đủ3liên kết |
| G03 journal | `published`, verifiedAt=null; manifestHash khớp | Giữ trạng thái lịch sử, không tự chuyển verified trong R1 |
| Backup |7ZIP vẫn có; backup25/10 20:37:35 khớp SHA đã kiểm CRC; previous-theme.zip khớp pin | Tận dụng phục hồi; không diễn tập restore đè production |
| Staging | WordPress7.1.3/PHP8.3.36, theme0.7.1/36hash khớp, plugin0.4.2/10hash khớp/schema3, indexing0 | Có nền staging dùng lại để kiểm đường mới |
| Nội dung staging |6resource,4guide,1practice;28hàng; chưa có C100/G03 journal và hai bài mới | Staging khác production, không sao chép ID/journal/database giữa hai môi trường |
| Git staging | UI “Add a repository to start deploying files” | Chưa có repository riêng, cần cấu hình ở R4 sau duyệt |

## Kiểm tra nguồn và tài nguyên đã giữ

- Đọc trực tiếp48 Git blob của ref0499402;48/48SHA khớp manifest. Đọc38entry của theme ZIP trong bộ nhớ,38/38khớp. Bundle local và bundle giữ trên hosting cùng SHA `5e4b9d0f11d145bc9a1b5fa07273f4414182665c4f7de9c40a8a21b02a37104b`.
- Theme ZIP SHA `3ac78ea97c8959d3955a74efc7d5998fdb58ffb27635eb22a3a38c4c7a8d0aab` khớp local/hosting. Manifest và importer private hiện hữu vẫn khớp pin lịch sử.
-100bài được đối chiếu với journal và hash gói local, không nghiên cứu lại hoặc cập nhật số sao/ngày nguồn trong R1.
- Backup25/10 20:37:35 SHA `9bd3c5ad8b4a127328f6bab99f516b2780219734ae194f744bb30b62eb41380b` giữ nguyên. Tận dụng biên nhận CRC25/10 vì byte backup khớp; không nói đã chạy lại CRC/restore hôm nay.
- Gói theme quay lui SHA `02e640e2e5ac7471e8cff8e32eeec3be99e96972bc345146e5bea075ab4fab23` giữ nguyên.
- Trang public bộ ba hiện dùng CSS0.7.2, có đủ liên kết; file Git connection-check vẫn là connection-v2. Staging public dùng CSS0.7.1 và robots `noindex, nofollow`. Đây là quan sát public, không phải chạy lại toàn bộ89check cũ.

## Đường nhận gói khả thi và điều chưa kiểm

Bộ chọn directory trong Git hiển thị cả thư mục riêng ở home subscription (`g03-production`, `content-100-20261025`, `git`), cùng các webroot. Hosting user có quyền ghi home; vùng gói private hiện hữu có mode0700. Có cơ sở dùng vùng nhận gói riêng bên ngoài webroot cho phương án mới.

Đề xuất đường mới: `/release-inbox-staging` và `/release-inbox-production` dưới home subscription; các tên này là đề xuất, chưa tạo hoặc đặt làm deployment directory. Dùng nhánh payload riêng và mode Manual khi thực thi. Giữ nguyên nhánh release/đích connection-check đang có.

R1 chỉ quan sát cây và quyền hiện hữu. Chưa Apply đích mới, clone repository mới, thử SSH pull hoặc deploy vào inbox; các phép chứng minh đó thuộc R4/R5 sau duyệt. Cũng chưa xác nhận cơ chế tái sử dụng default key cho repository Plesk mới; nếu cần key mới phải trình thay đổi trước khi cấp quyền.

## Phạm vi R2 cụ thể đề nghị

1. Tạo nhánh local `codex/deployment-pipeline` từ lịch sử hiện tại; chỉ đưa đúng tệp dự án vào commit, giữ tệp marketing/banner ngoài phạm vi. Kiểm cả lịch sử chưa push và tệp mới để loại backup/config/secrets khỏi phần sẽ gửi GitHub.
2. Tạo profile phát hành0.7.2/0.4.2/schema3 từ allowlist và build hiện có; giữ nguyên hợp đồng/manifest S14 lịch sử. Phân biệt source SHA và payload SHA, bổ sung biên nhận nhận gói từ GitHub.
3. Sửa công cụ nhập/tiếp nhận: C100 hiện pin theme0.7.1 và ID ceiling của production; G03 có lỗi giả định slug draft; Codex staging ID114 khác production107. Cần guard từng môi trường, ánh xạ theo khóa ổn định, nhận diện bài/lô đã có và xử lý retry/xung đột, không mang ID/journal production sang staging.
4. Giữ pipeline application code và bộ bài hiện tại; không viết lại theme/plugin/nội dung hoặc tạo lại chứng nhận. Thử tiếp nhận production khớp hash mà không cài/nhập lại.
5. Hoàn thiện CI từ workflow local: dependency/bootstrap không dựa vào `.local` đang dùng; test source/hash, payload, partial import/resume, slug, idempotence và hồi quy liên quan. Chạy qua run-clean, ghi rõ local/remote và cleanup.

R2 **chỉ local**: chưa push GitHub, chạy GitHub Actions, sửa Plesk hoặc phát hành. R2 chỉ hoàn tất khi kiểm thử bắt buộc/cleanup đạt và có báo cáo để duyệt R3.

## Bằng chứng và cleanup

Thư mục [R1-pipeline-audit](R1-pipeline-audit/) giữ GitHub heads/hook metadata/key/workflow, cấu hình Plesk đã loại token, phép so hash Git blob/ZIP/C100, inventory production/staging/backup và các truy vấn read-only để tái kiểm tra.

Không lưu URL webhook có token, private key, mật khẩu, SQL hoặc nội dung backup. Các tab khảo sát đã đóng; không tạo fixture/cache test, helper trên hosting hoặc backup mới. Khóa cleanup không tồn tại, không có fixture mới cần xóa. Nguồn, database local, bằng chứng/gói thật và tệp ngoài phạm vi được giữ.

Giới hạn: không phát hành hoặc kiểm pipeline end-to-end trong R1; chưa chạy CI remote, full restore, giao dịch WooCommerce hoặc thử công cụ AI mới. Trạng thái `published` của G03 được giữ nguyên.

**Dừng chờ chủ dự án duyệt R2 với phạm vi local nêu trên.**
