# S14 — Checklist ứng viên, phát hành và khôi phục

Đây là checklist để duyệt, không phải quyền triển khai. Chỉ hoàn tất mục local trong S14. Chủ dự án phải cho phép riêng S15; production còn cần S16 với ref/payload/đích/thời điểm cụ thể.

## Đã chuẩn bị cho local

- Chọn SHA commit bất biến trên nhánh phát triển; lưu SHA trong báo cáo. Đây chưa phải commit production trên main.
- `npm run test:release -- <sha>`: tái tạo byte ZIP/manifest, giải ZIP độc lập và kiểm tra negative cases.
- `npm run build:release -- <sha>`: giữ hai ZIP và manifest ở `artifacts/releases/<sha>/`; không ghi đè gói đã có.
- `npm run test:release-runtime -- artifacts/releases/<sha> <sha>`: chạy đúng ZIP đã build, PHP lint và luồng public với theme mới/cũ, plugin mới, theme restore.
- Manifest gắn hai ZIP với cùng SHA nguồn, phiên bản plugin 0.4.2, theme 0.7.0 và schema 3. Cặp trung gian đã kiểm tra local là plugin 0.4.2 + theme 0.6.0 từ S12. Không dùng plugin 0.4.0 S12 làm fallback mặc định: nó chưa có bản vá mutex S13.
- ZIP theme có một thư mục `vibelab/`; ZIP plugin có một thư mục `vne-library-core/`. Manifest nằm bên ngoài. Plesk Git payload nếu được chọn ở S15 phải chứa nội dung bên trong từng thư mục thành phần, không lồng thêm `wp-content` hoặc giải cả hai ZIP vào web root.
- Workflow `release-package-check.yml` chỉ kiểm tra thủ công, không phát hành. Cần push/review và chạy CI remote khi được phép; local PASS không được ghi là GitHub Actions PASS.

## Chờ S15: quyền, backup và cơ chế triển khai staging

1. Xác nhận staging tách production, PHP/MySQL thực tế và quyền backup/restore. Ghi đích tuyệt đối của từng thành phần và ref được duyệt. Không thay `release`/`release/codex-deploy-check` hoặc đích kiểm tra Plesk trước khi chốt.
2. Đọc và lưu phiên bản/schema đang chạy. Giữ backup thật của database, plugin, theme, uploads/config cần thiết ở vùng riêng; xác nhận phục hồi được trước cập nhật. Gói ứng viên không chứa DB/uploads/wp-config/key và không thay backup của môi trường đích.
3. Chọn cách triển khai từng thành phần được hosting hỗ trợ; nếu Plesk chép từng file, dùng cửa sổ bảo trì/cơ chế đã diễn tập. Xác định cách xóa file cũ, lấy trạng thái hoàn tất, người xác nhận và timeout bằng số cụ thể. Chưa có xác nhận thì dừng; không tự suy push/webhook thành công là đã deploy.
4. Kiểm tra SHA256 gói/manifest theo ref đã duyệt. Chốt cặp tương thích với phiên bản thực tế; nếu theme đích khác 0.6.0/0.7.0, phải thử cặp đó, không suy từ fixture hiện tại.

## Cổng theo 13.1, chỉ chạy sau quyền S15/S16 tương ứng

1. Triển khai plugin trước. Chờ hoàn tất rồi xác nhận plugin **đang chạy** 0.4.2, schema 3, activation/migration và health/REST/quyền/khóa/report đạt trên MySQL. Nếu lỗi/chậm/timeout/mất xác nhận: dừng, giữ theme hiện tại và xử lý plugin; không cập nhật theme.
2. Chỉ sau cổng plugin đạt mới triển khai theme 0.7.0. Xác nhận phiên bản đang chạy và HTTP/UI trang chủ, danh mục, chi tiết, hướng dẫn, tìm/lọc/báo lỗi, CTA, preview/private và cache. Không đưa seed/database local lên staging/production như payload.
3. Xác nhận purge/bypass/cache thật theo S12 và mục 9.5 của kế hoạch. Lưu trạng thái từng cổng, SHA, version/schema, log đã loại bí mật và người duyệt. Chưa xác nhận cache thì chưa kết luận phát hành thành công.

## Nếu theme lỗi sau khi plugin đạt

- Dừng cập nhật; phục hồi **toàn bộ cây file theme** từ backup đã kiểm chứng, loại bỏ file chỉ có trong gói lỗi. Không chép đè rồi mặc định file cũ đã biến mất.
- Có thể giữ plugin 0.4.2 khi phiên bản theme khôi phục thuộc cặp đã kiểm chứng trên môi trường đích. Fixture S14 đã thử theme 0.6.0 và kiểm tra lại bốn trang sau phục hồi.
- Nếu cặp thực tế khác cặp đã thử, dừng để chọn cặp khôi phục được duyệt. Chỉ khôi phục plugin/schema/database theo quy trình đã diễn tập; không hạ schema hoặc hoàn nguyên DB chỉ vì rollback file.
- Kiểm tra version/health, dữ liệu còn nguyên, nguồn/CTA, quyền và cache sau khôi phục. Giữ backup, gói hỏng và log để điều tra; không thử production thay staging.

## Hạn chế cần ghi khi duyệt

S14 chỉ xác nhận gói và hành vi local PHP built-in server/SQLite. Chưa kiểm tra MySQL, Plesk, CDN, restore backup thật, giới hạn hosting hoặc deploy nguyên tử. S13 vẫn chờ phản hồi trải nghiệm của chủ dự án. Chưa có quyền cho S15/S16.
