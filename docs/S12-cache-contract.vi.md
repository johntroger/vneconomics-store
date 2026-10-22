# S12 — Cache và tính nhất quán (local)

A không thêm page cache/transient cho projection. Getter đọc snapshot duyệt và tính lại trạng thái/dependency mỗi request.

HTML do WordPress render bằng theme VibeLab, kể cả 404/search/support dùng private, no-store, no-cache, must-revalidate, max-age=0 và DONOTCACHEPAGE. Admin/preview và toàn namespace REST vne-library cũng bypass, kể cả lỗi và context=edit.

Bypass chỉ có hiệu lực khi WordPress chạy; không thể sửa response đã cache ở CDN/server trước PHP. Không chứng nhận hosting.

Thay đổi post/meta/taxonomy/delete đánh dấu dirty. Shutdown sau transaction làm sạch native object cache toàn thư viện và ID đã xóa, bao gồm guide phụ thuộc. Không flush toàn server. Không cache derived state nên hạn rà soát tính lại không chờ cron.

Filter vne_library_cache_purge_result mặc định chỉ xác nhận native local cache. false/exception ghi incident không chứa nội dung riêng tư; admin thấy cảnh báo. Lần ghi thành công sau đó không tự xóa incident. Retry yêu cầu vne_manage_library và đúng incident ID; chỉ xóa chính incident được xác nhận. Không public endpoint purge; không TTL tự phục hồi khuyến nghị.

A bypass thường trực. Khi có incident purge chưa phục hồi, HTML công khai và API đọc công khai trả 503 thay vì có thể phát lại nội dung cũ. Safety switch đọc trực tiếp DB, bỏ qua object cache. Admin/preview riêng vẫn dùng được; nút phục hồi yêu cầu POST/quyền/nonce/đúng incident. Incident mới không bị lần phục hồi cũ xóa. Không tự bật cache hoặc công bố cảnh báo đã hiệu lực trên hosting. BYOK chưa tồn tại (U01–U04): S12 chỉ kiểm tra namespace dự phòng trả lỗi và không public-cache, không chứng nhận xử lý key/proxy chưa xây.

## Checklist hosting — chờ S15

1. Xác nhận tầng thật: plugin page cache, advanced-cache.php/object-cache.php, reverse proxy, CDN, browser/service worker và OPcache khi đổi mã PHP; không suy đoán từ Plesk.
2. Ghi tên/cấu hình/TTL, key theo URL/query/cookie/auth và người được purge. Chốt độ trễ chấp nhận trước bật cache. A mặc định bypass, không hứa realtime.
3. Xác minh HTML/API/preview/edit/report/receipt và BYOK tương lai bypass cả anonymous/authenticated, lỗi/redirect/query; không cache POST/credentials.
4. Làm nóng staging qua mọi tầng rồi sửa revision, đổi nguồn/cảnh báo, suspend, thu hồi và đổi dependency.
5. Đối chiếu home/danh mục/search-filter/detail/API list-detail/guide; ghi giờ mutation/response, header Age/Via/cache-status thực và revision.
6. Nếu có cache ngoài PHP, adapter chỉ trả true sau xác nhận mọi tầng. Diễn tập lỗi purge, cảnh báo, bypass tại chính tầng đó hoặc tạm chặn vùng ảnh hưởng; xác minh anonymous từ ngoài trước công bố hiệu lực.
7. Thử retry/rollback/nhiều worker/transaction trên DB hosting; SQLite local không thay nghiệm thu MySQL/CDN.
8. Lưu bằng chứng không cookie/key. Ghi rõ tầng chưa kiểm tra; không phát hành khi cảnh báo an toàn còn stale.

Không gọi purge hosting/API ngoài, không thay database gốc trong S12.

Trang được browser phục hồi bằng BFCache sẽ reload khi pageshow.persisted và JavaScript chạy. Không hứa cập nhật đẩy tới tab đang mở/offline; no-JS và cache hosting cần kiểm tra thêm ở S13/S15. Tài nguyên tĩnh CSS/ảnh/demo không chứa trạng thái thư viện vẫn dùng cơ chế riêng. Fallback 503 đánh đổi khả dụng lấy việc không phát trạng thái có thể cũ; các thao tác quản trị xử lý sự cố vẫn cho phép.
Cả UI và hàm phục hồi đọc incident trực tiếp từ DB, không chỉ safety switch. Native RSS chưa là projection được hỗ trợ của thư viện: trả 404/no-store/noindex ngay parse_request, trước cơ chế 304 của WordPress. Không tuyên bố đã xây RSS. Hosting S15 cần xác minh cả đường này.