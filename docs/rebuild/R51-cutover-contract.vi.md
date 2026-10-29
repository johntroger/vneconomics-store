# R5.1 — Hợp đồng cài đặt và quay lui theme v2

Ngày: 28/10/2026. Phạm vi local; chủ dự án đã duyệt kết quả R5.1 ngày 28/10/2026.

## Phương án

Dùng cửa sổ bảo trì có người giám sát, hạn vận hành 300 giây tính từ khi bật maintenance đến khi health đạt hoặc bắt đầu phục hồi. Không giả định Plesk hỗ trợ symlink/atomic rename. Timeout client không chứng minh server đã dừng; phải inspect trạng thái trước mọi writer tiếp theo.

Cutover là **cấp B** vì kích hoạt theme ghi option WordPress (stylesheet/template và có thể theme mods). Không thay schema3 hoặc nhập lại nội dung. Giữ nguyên `themes/vibelab` để reactivation; cài `vibelab-v2` ở thư mục riêng. Plugin chỉ được cập nhật nếu diff/manifest của R5.2 xác nhận đúng phạm vi R4 và mọi thay đổi development được chọn riêng; không phát hành toàn bộ dirty tree.

## Gói và kiểm trước ghi

- R5.2 pin source SHA, CI run, payload SHA, manifest SHA256 và baseline SHA256 riêng; chọn version/marker production sau khi chốt source. Marker `r33-guides-local` hiện chỉ dùng rehearsal, không tự trở thành marker production.
- Allowlist candidate chứa cây theme v2, plugin được duyệt và công cụ kiểm chứng cụ thể; loại DB/uploads/config/secret/cache/fixture. Mỗi entry có path/size/hash. R5.2 phải tạo danh sách file chính xác, kiểm ZIP traversal/symlink và build lặp byte giống nhau.
- Chỉ nhận gói từ GitHub vào private inbox production, repository Manual, không post-action; đối chiếu mọi hash trước cài native. Không upload code/ZIP từ local.
- Có một writer, không lock tồn tại, baseline còn khớp, backup DB scoped complete và có hash/CRC/manifest, previous plugin/theme/config đủ hash. Backup ngoài hosting theo chính sách release; giữ đường rollback duy nhất.
- Dung lượng yêu cầu tính từ kích thước thật: ZIP inbox + cây bung mới + bản code rollback + backup DB/file + dung lượng tạm native installer; cộng dự phòng ít nhất 20% hoặc 256 MiB (lấy mức lớn hơn). Dung lượng trống phải được kiểm trực tiếp trước cài, không suy từ local.

## Thứ tự thao tác R6

1. Xác nhận approval source/CI/payload/hash/baseline/đích, backup và rollback; đọc phiên bản/schema/root/home/DB.
2. Bật maintenance bằng cơ chế native đã thử ở R5.2; ghi thời điểm và chủ writer.
3. Nếu cần, cài plugin đúng ZIP GitHub; kiểm version/hash/schema3 và dữ liệu trước khi tiếp tục.
4. Cài theme v2 chưa active; kiểm allowlist/từng hash. Theme cũ vẫn được giữ.
5. Kích hoạt theme v2 theo quyền R6; nạp plugin đầy đủ, xác nhận custom post type đã đăng ký rồi soft-flush permalink. Kiểm theme selection, marker release, archive/detail HTTP và logs. Bổ sung từ rehearsal R5.2: context nâng cấp bỏ qua nạp plugin có thể làm flush sau đổi theme mất rule custom post type; không chỉ dùng health homepage để kết luận activation đạt.
6. Health: homepage/catalog/category/resource/search/guide/practice, canonical/noindex/redirect, endpoint riêng tư; đối chiếu count/revision/dependency/journal và schema. R5.2 pin URL và expected values cụ thể.
7. Chỉ ghi complete receipt khi mọi health đạt; bỏ maintenance và hậu kiểm public. Ghi cleanup/giới hạn. Nếu health sau bỏ maintenance lỗi, chuyển quy trình phục hồi.

## Thất bại và phục hồi

| Trạng thái đã xác định | Hành động |
|---|---|
| Sai baseline/hash/allowlist/backup/disk/lock trước ghi | Dừng, giữ hiện trạng và chỉnh sửa |
| Cài theme chưa active lỗi | Giữ theme cũ active; inspect native installer trước retry |
| Plugin cập nhật lỗi | Theo approval rollback plugin tương thích đã pin; kiểm schema3/data |
| Sau kích hoạt theme, health không đạt | Reactivate theme cũ và phục hồi plugin nếu cần theo approval rollback; kiểm hash/URL/data |
| Timeout/trạng thái tác vụ chưa rõ | STOP_INSPECT; không phá lock hoặc chạy writer khác |

Không restore DB mặc định: reactivation chỉ đảo lựa chọn theme, không bảo đảm đảo mọi hook/option do theme/plugin tạo. Nếu state khác ngoài dự kiến, dừng và xin duyệt khôi phục scoped snapshot, ghi rõ dữ liệu có thể mất. Không restore toàn DB để vượt guard.

## Ranh giới bằng chứng

R5.1 thử chính sách và vòng kích hoạt/quay lui WordPress fixture local, gồm failure giả lập trên candidate chưa active. Chưa chứng minh native ZIP installer, maintenance của hosting, MariaDB, dung lượng/lock Plesk hoặc atomic switch. R5.2 bắt buộc rehearsal cài native/gỡ maintenance/failure với candidate bất biến trước khi xin R6. Không dùng receiver/profile R5 lịch sử cho v2.

Retention đề xuất cho R5.2 pin: Actions artifact 14 ngày; inbox candidate 14 ngày sau receipt; previous code/rollback ít nhất 2 release thành công và 30 ngày; DB backup cutover ít nhất 30 ngày. Không tự xóa bản đang cần phục hồi; chính sách hiện có dài hơn được giữ và việc xóa cần gate riêng.
