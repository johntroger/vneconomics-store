# Rà soát đường phát hành ngày 26/10/2026

## Kết luận

Luồng chủ dự án yêu cầu là **local → GitHub → Plesk**. Lần phát hành G03 ngày 25/10 đã dùng **commit local → ZIP local → upload Plesk → WP-CLI cài theme/nhập nội dung**, bỏ qua GitHub. Có commit/hash để truy vết không đồng nghĩa đã đi qua GitHub. Đây là sai lệch quy trình; phê duyệt xuất bản không nên được diễn giải thành phê duyệt đổi đường phát hành.

## Bằng chứng đã đối chiếu

| Nguồn | Kết quả |
|---|---|
| `docs/setup-status.md`, `docs/website-build-plan.vi.md` | Luồng local → GitHub → webhook → Plesk đã kiểm chứng ngày 17/10, trong thư mục thử `codex-deploy-check`. |
| `git ls-remote --heads origin` đọc ngày 26/10 | Remote `release` ở `4fe952ac7eec550d3125be9885fa6271aece2718`; `main` ở `6cd895f32906c1c7907d6b34dd368a30ab3c5982`. Không có nhánh remote `codex/s16-production`. Các nhánh bước trên remote chỉ tới S12. |
| Git local | HEAD `0499402e4708336deb9c58802b2981bbd44103f8`, nhánh `codex/s16-production`. Có commit local cho S13–S16, 100 bài và bộ ba hướng dẫn; chưa có nhánh tương ứng trên GitHub. |
| `scripts/build-g03-production.mjs` | Đọc blob từ ref local `0499402`, tạo `theme.zip`/`bundle.zip` trong artifacts; không có bước phát hành qua GitHub. |
| `docs/acceptance/G03-production/unpack.json` | Gói local được tải vào vùng riêng của hosting, kiểm SHA và giải nén. |
| `docs/acceptance/G03-production/theme-install.txt` | Đã chạy `wp theme install /var/www/vhosts/vneconomics.com/g03-production/theme.zip --force`. |
| `docs/acceptance/G03-production/published.json` | Biên nhận phát hành theme0.7.2, bài Claude ID213, Antigravity ID215; 128 hàng nội dung cũ giữ hash. Chỉ metadata validation Codex nằm trong ngoại lệ có chủ đích. |
| `.github/workflows/release-package-check.yml` | Workflow thủ công chỉ kiểm gói, không triển khai; không có bằng chứng GitHub Actions PASS cho G03. |

`docs/S16-deployment-proposal.vi.md` đã ghi phương án cài ZIP trực tiếp, không push Git để phát hành. Điều này giải thích đường đã thực hiện, nhưng cũng cho thấy tài liệu sau đã lệch khỏi ý định ban đầu. Cần sửa và làm rõ hợp đồng phát hành, không dùng tài liệu này để phủ nhận yêu cầu của chủ dự án.

## Phạm vi trạng thái đã biết

- Biên nhận production gần nhất được lưu ngày25/10: theme0.7.2, plugin0.4.2/schema3; 106 tài nguyên, 6 hướng dẫn, 1 thực hành. Đây là quan sát đã lưu, không phải lần đọc hosting mới ngày26/10.
- ZIP ứng viên đã đạt243 kiểm tra WordPress/Edge; cổng triển khai33 kiểm tra; HTTP công khai89 kiểm tra, gồm14 URL cũ. Các kết quả này không chứng minh tuân thủ đường GitHub → Plesk.
- Việc gán slug cho hai draft đã cần sửa riêng; có biên nhận `slug-repair-1.json`, `slug-repair-2.json`. Gói private gốc được giữ nguyên.
- Chưa có biên nhận chạy mode `verify` cuối cùng hoặc kết luận hoàn tất toàn bộ G03 production. Journal được lưu gần nhất ở `published`, chưa phải `verified`.
- Không đọc lại cấu hình Git/webhook/đích triển khai Plesk trong lượt rà soát này. Cấu hình `release → codex-deploy-check` là bằng chứng lịch sử ngày17/10, không suy thành cấu hình hiện hành cho theme/plugin.
- Các script/gói/bằng chứng phát hành G03 còn chưa commit tại thời điểm rà soát. Tệp marketing/banner ngoài phạm vi được giữ nguyên.

## Quy trình cần thống nhất lại trước lần phát hành tiếp

1. Local: hoàn tất sửa và kiểm thử; commit đúng phạm vi, giữ bằng chứng và manifest.
2. GitHub: đẩy nhánh phát triển để review/CI; ghi rõ commit được duyệt và kiểm tra remote thực sự chứa ref đó.
3. Chuẩn bị payload phát hành chỉ gồm theme/plugin và gói nội dung có phiên bản. Gói nội dung được nhập bằng công cụ có guard/idempotency; database, tài khoản, cấu hình và backup thật không phải payload Git.
4. Đưa payload đã duyệt lên nhánh/release GitHub phù hợp. Chốt đích Plesk cho từng thành phần và cách cài/nhập tuần tự, không dùng đích connection-check như đích website.
5. Plesk nhận payload từ GitHub; xác nhận ref/hash đã nhận trước khi cài và xác nhận version/file hash sau cài.
6. Hậu kiểm website, nội dung cũ, cache và phương án quay lui; lưu biên nhận commit GitHub ↔ payload ↔ file live.

Các mục trên là phương án sửa quy trình, **chưa triển khai trong lượt rà soát**. Không tự push nhánh release, đổi webhook/đích Plesk hoặc phát hành lại chỉ để làm lịch sử trông đúng. Trước hết phải đối chiếu bản đang live với nguồn và quyết định cách đưa trạng thái đã phát hành vào đường quản lý GitHub có thể truy vết.
