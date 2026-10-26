# S12 — Cache và tính nhất quán

Ngày: 22/10/2026. Phạm vi: kỹ thuật local trên fixture; không deploy hoặc kích hoạt/seed database local gốc.

## Kết quả

PASS kỹ thuật local sau khi bộ S12 và hai hồi quy hoàn tất trên cùng mã nguồn. S13 chưa bắt đầu. Cache hosting/CDN, TTL và mức trễ thực tế chờ S15; BYOK chờ các bước U.

A dùng bypass thay vì thêm nền tảng page cache: HTML WordPress/VibeLab, admin/preview và namespace REST vne-library trả private/no-store/no-cache. Không cache projection/derived state giữa các request. Tài nguyên tĩnh có chính sách riêng.

Ghi post/meta/taxonomy/delete đánh dấu dirty; sau transaction làm sạch native object cache toàn thư viện, gồm các guide phụ thuộc. Các view dùng chung getter snapshot đã duyệt và trạng thái hiện tại. Việc đăng lại bài hoặc phục hồi cache không tự hủy quyết định tạm ngừng khuyến nghị hay tạo bằng chứng chạy thử.

Purge false/exception tạo incident bền trong DB. Phần công khai tạm trả 503 để tránh phát nội dung có thể cũ; admin/preview riêng vẫn dùng được để xử lý. Safety switch, notice và retry đều đọc incident trực tiếp từ DB, kể cả khi object cache trả mã cũ. Nút phục hồi yêu cầu POST, capability, nonce và đúng incident; lần phục hồi cũ không xóa incident mới. Lần ghi thành công khác không tự mở lại thư viện.

Native RSS chưa là projection được hỗ trợ của A: trả 404/no-store/noindex trước nhánh conditional 304 của WordPress. Đây không phải tính năng RSS mới.

## Kiểm thử bản cuối

| Lệnh | Kết quả |
|---|---|
| npm run test:cache | 225 kiểm tra PASS; 0 lỗi JavaScript ở trang được theo dõi |
| npm run test:cache-revisions-regression | 69 kiểm tra model/quyền; 265 kiểm tra trạng thái, ma trận 54 hàng; 50 kiểm tra revision PASS |
| Hồi quy trình duyệt S05 trong lệnh trên | Tạo/preview/duyệt bản sửa, no-store/noindex, nonce, stale form, hai người duyệt đồng thời và restart PASS |
| npm run test:cache-support-regression | 61 kiểm tra UI/HTTP và 37 backend PASS; private queue, idempotency, lỗi ghi trước/sau insert, nonce/quyền/xóa và plugin thiếu |
| Hậu kiểm | 35 file theme và 10 file PHP plugin khớp source đã kiểm thử; dữ liệu gốc/bằng chứng cũ/cleanup/cổng test đạt |

Trong hồi quy S11, đã sửa generator receipt giả mạo: ký tự cuối được lật chắc chắn khác bản gốc, thay vì luôn gán 0 có thể giữ nguyên chữ ký hợp lệ. Thêm assertion xác nhận URL đã đổi; không sửa verifier/runtime. Ca UI 429 cũng được nạp quota fixture ngay trước POST (bucket hiện tại và kế tiếp), tránh đi qua ranh giới 15 phút trong suite dài; backend vẫn kiểm tra ngưỡng ba lần gửi thật. Helper kiểm tra status phản hồi thực tế thay vì timeout chờ riêng status dự kiến. Các lượt thất bại đã cleanup, sau đó chạy lại bộ S11 đầy đủ.

Các số trên là số assertion/kiểm tra, không phải số luồng người dùng độc lập; không cộng ma trận thành một tổng kiểm thử mới.

S12 lặp request để làm nóng các đường đọc rồi sửa bản duyệt, suspend, thu hồi, đăng lại, đổi tên danh mục và phục hồi. Đối chiếu home, archive, danh mục, search, chi tiết, API list/detail và guide phụ thuộc; kiểm tra cả mã cảnh báo dependency cụ thể và cảnh báo thật trên giao diện. JSON ghi thời điểm mutation và các lượt quan sát; không suy thành SLA realtime.

Lỗi purge được mô phỏng bằng false, exception từ adapter và exception ở native clean_post_cache. Kiểm tra 503/no-store, incident còn sau lần purge thường thành công, retry từ chối người không có quyền/sai incident/sai nonce, phục hồi từ UI, incident mới xuất hiện khi retry và giá trị option cũ trong cache.

Kiểm tra handler pageshow.persisted bằng sự kiện mô phỏng; cache chia sẻ chỉ là mô phỏng tuân thủ Cache-Control và từ chối lưu API no-store. Không có Redis, page cache/CDN thật hoặc chứng nhận BFCache mọi trình duyệt trong lượt này.

Preview có quyền vẫn riêng tư/noindex; anonymous edit/proposal bị từ chối; report/receipt dùng no-store. Namespace BYOK dự phòng trả 404/no-store: chưa kiểm chứng xử lý API key/proxy vì tính năng đó chưa xây.

## Bằng chứng

- [Kết quả S12](S12/test-results.json), [hậu kiểm](S12/postflight.json), [ghi chú các lượt chạy](S12/run-notes.vi.md).
- [Hồi quy S05](S12/S05-regression/test-results.json), [hồi quy S11](S12/S11-regression/test-results.json).
- [Ảnh cảnh báo guide phụ thuộc](S12/dependent-guide-warning.png), [ảnh incident và nút phục hồi](S12/admin-cache-incident.png); đã kiểm tra trực quan.
- [Hợp đồng và checklist S15](../S12-cache-contract.vi.md).

Tất cả test qua run-clean, không chạy fixture đồng thời. Đóng browser/server rồi dọn dữ liệu có thể tái tạo của lần chạy; giữ evidence. Hash database/config gốc không đổi. Không sửa logic cũ của model/state/API/revision/report hoặc theme trong S12; thêm module cache và điểm require.

## Giới hạn và bước tiếp

Môi trường: WordPress 7.1.3, PHP 8.3, SQLite/Playground và Edge headless local. Source observations dùng lại fixture S02, không phải xác minh repo mới. Chưa chạy MySQL/InnoDB, persistent object cache, reverse proxy/CDN/OPcache hay cấu hình hosting thật.

Bypass đánh đổi hiệu năng cache trang lấy cách vận hành đơn giản cho A. Khi có incident, toàn phần công khai có thể tạm ngừng cho tới khi vận hành xác nhận; không tự hồi phục theo TTL. Header PHP không sửa được response đã bị tầng ngoài PHP phục vụ: S15 phải khảo sát, đặt bypass hoặc chặn ngay tại tầng thật, diễn tập và xác minh từ ngoài trước phát hành.

S12 không thay nghiệm thu tích hợp/người mới/performance/accessibility/SEO ở S13. Không chạy lại riêng mọi bộ S06–S10 trong bước này. Không gọi AI có phí, gửi email, bật automation, đẩy main/release hoặc thao tác deploy. Nhánh review: codex/s12-cache-consistency. Dừng chờ chủ dự án duyệt S13.
