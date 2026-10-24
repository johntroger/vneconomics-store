# S15 — Phương án diễn tập phục hồi cần duyệt

Ngày 24/10/2026. Phương án đã được chủ dự án duyệt cụ thể bằng “Đồng ý phục hồi staging hiện tại” và đã thực hiện. Phần dưới giữ kế hoạch trước duyệt và quyết định/kết quả ở cuối; không cấp quyền cho lần ghi đè khác.

## Đích và phạm vi

- Chỉ `https://staging-store.vneconomics.com`, Plesk domain319.
- Document root `/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/`.
- Database `vne35060_wp_udx1z`; không đổi nguồn `store.vneconomics.com` hoặc production.
- Plugin0.4.2/schema3, themeVibeLab0.7.0; giữ 14 bài/trang cũ và11 mục mẫu đã duyệt.

Hợp đồng S15 ban đầu ưu tiên vùng phục hồi tách biệt. Cổng nhà cung cấp hiện hiển thị đã dùng5/5 website; chưa tạo site hoặc database mới. Phục hồi trực tiếp staging hiện tại là một lựa chọn thay đổi phạm vi diễn tập, cần chủ dự án đồng ý cụ thể trước khi ghi đè. Không coi việc thiếu quota website là bằng chứng mọi cách phục hồi tách biệt đều bất khả thi.

## Chuẩn bị đã thực hiện

Backup ứng viên23/10 lúc14:49:28 khớp SHA256 đã pin. Đọc14.408 file,235.416.873 byte sau giải nén:0 lỗiCRC/kích thước,0 đường dẫn bất thường, có dumpSQL/plugin/theme. Kiểm tra chỉ đọc, không giải nén hoặc importDB. Kết quả này chưa chứng minh phục hồi thành công.

Đã yêu cầu WP Toolkit tạo thêm backup hiện trạng24/10; chưa dùng bản đó cho đến khi UI xác nhận hoàn tất và đối chiếu hash/index/CRC. Giữ mọi backup thật, không xóa bản cũ.

## Lượt diễn tập đề xuất, chỉ sau khi có backup mới đạt và được duyệt

1. Ghi lại tên/hash chính xác của backup hiện trạng đã hoàn tất; đọc lại target/noindex,version/schema,6/4/1 nội dung và dấu vân tay nội dung gốc. Dừng nếu target sai hoặc có thay đổi chưa rõ.
2. Sau khi backup xong, tạo đúng một marker option và một marker file có UUID thuộc lượt thử. Không tạo user, không gửi mail/API, không sửa bài thật. Marker chỉ để chứng minh phục hồiDB và toàn câyfile, không chỉ thay giao diện.
3. Restore đúng backup hiện trạng vừa xác minh vào cùng staging qua WP Toolkit. Tùy chọn xóa dữ liệu hiện có trước khi phục hồi sẽ thay thế file/database staging bằng snapshot; site có thể tạm ngừng và phiên admin có thể mất. Mọi chỉnh sửa sau thời điểm backup sẽ không nằm trong snapshot. Không thayDNS/SSL hoặc production.
4. Đọc lại root/database/home/noindex,version/schema/hashplugin/theme,14 bài/trang gốc và11 mục mẫu; xác nhận markeroption/file không còn. Chạy lại anonymous HTTPcontent/theme/reportprivacy/cacheheaders và kiểm traUI. Không tuyên bố restorePASS chỉ từ toast của Plesk.
5. Nếu lỗi hoặc chưa xác nhận, dừng cổng, giữ backup/log; dùng bản backup đã xác minh để phục hồi lại theo đúng đích. Không hạschema hoặc đổi database nguồn. Dọn riêng marker còn sót sau khi các tiến trình đã đóng, giữ bằng chứng và backup thật.

Chưa được duyệt phương án ghi đè; chưa tạo marker hoặc bấm Restore. Các ca fault/chậm/timeout/theme rollback và LCP/CLS vẫn là mục riêng, không được tự coi hoàn tất bởi lượt này.

## Quyết định và backup chính xác

Chủ dự án đã xác nhận “Đồng ý phục hồi staging hiện tại” trong chat ngày24/10/2026. Quyền này áp dụng riêng lượt diễn tập trên đích nêu trên, cho phép marker tạm và phục hồifile/DB bằng snapshot24/10 lúc09:59:46; không mở production hoặc bướcS16. Đây là ngoại lệ cụ thể cho vùng phục hồi của lượt này, không sửa mặc định an toàn cho các lần sau.

Backup được chọn: `staging-store.vneconomics.com__2026-10-24T09_59_46+0700.zip`,81.541.424byte,SHA256 `f25d308309091275deb1d9036b40507af91a1443640b8a5fa0c7b28accdbfce7`. Đã đọc14.408file/235.477.909byte sau giải nén,0 lỗiCRC/kích thước,0 đường dẫn bất thường; códumpSQL/plugin/theme. Hai backup23/10 được giữ. [Kết quả](acceptance/S15/pre-restore-backup-results.json), [màn hình trước duyệt](acceptance/S15/restore-confirmation-prepared.jpg).

Đã ghi dấu vân tay toàn bộ28 hàng nội dung và80 meta, cùng journal nhập. Có17 hàngpost/page mọi trạng thái (14public); hash gốc vẫn khớp baseline trước nhập. Chưa có nội dung chủ dự án chỉnh sửa được phát hiện. [Snapshot](acceptance/S15/restore-content-snapshot.json).

## Kết quả thực hiện

Đã phục hồi thành công đúng backup24/10 lúc09:59:46 qua WP Toolkit sau phê duyệt. Markerfile/option biến mất;28hàngnộidung,80meta và journal hash khớp;14.406fileWordPress không thiếu,46fileplugin/theme khớpmanifest. Chỉwp-config.php khác tokenWPToolkit được tạo lại; sau bỏ riêng token này, mãPHP chuẩn hóa giống nhau.178điểmHTTP/25request hậu phục hồi đạt;cleanupđạt,3backup được giữ. Chi tiết/bằng chứng tại [báo cáoS15](acceptance/S15-staging.vi.md). Chưa PASS toànS15.
