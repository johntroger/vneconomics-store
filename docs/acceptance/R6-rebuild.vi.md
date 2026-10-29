# R6 — Cutover theme v2 production

Trạng thái: **PASS_R6_PRODUCTION_PENDING_OWNER_REVIEW**. Chủ dự án đã duyệt thực hiện R6 bằng “ok” sau hồ sơ R5.2, tiếp tục sau gián đoạn và đăng nhập lại Plesk. Cutover ngày 28/10/2026; hoàn tất hậu kiểm/biên nhận ngày 29/10/2026, 08:54:37 (Asia/Saigon).

Website: [store.vneconomics.com](https://store.vneconomics.com/). Runtime hiện tại: theme **2.0.0**, marker `r52-v2-20261028`, plugin **0.4.4**, schema **3**; WordPress **7.1.4** được quan sát khi đóng R6. Còn nguyên **106 tài nguyên, 6 hướng dẫn, 1 bộ thực hành**.

| Thành phần | Giá trị đã đối chiếu |
|---|---|
| Source ứng dụng | `50437bd16eae1912d8cffea093401449786faaea` |
| CI source | [40660368997 — PASS](https://github.com/johntroger/vneconomics-store/actions/runs/40660368997) |
| Payload GitHub/Plesk HEAD | `fa4c67821008e0fcc4307fedf202bcdf95b85bb6` |
| Manifest SHA256 | `1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2` |
| Parent trước promote | `80729d511b2f2f168a96a495a4e5cadc93377759` |
| Baseline trước ghi | `a095f2cf4637a655f6a025ddf03b372a422b8a50cc608f7ac4db3400649ccc28` |
| Native maintenance | **78 giây**, từ 16:39:15 đến 16:40:33 ngày 28/10, trong hạn 300 giây |
| Biên nhận đã đọc lại | [completion.json](R6-rebuild/completion.json), [completion-readback.json](R6-rebuild/completion-readback.json) |

Đường đi đã thực hiện: CI/artifact/hash R5.2 → fast-forward GitHub `release-production` → Plesk Pull/Deploy **Manual vào private inbox** → kiểm HEAD, năm file, bốn ZIP/từng entry và 49 file baseline → native plugin trước/theme sau → kiểm hash và dữ liệu → kích hoạt/soft-flush → bỏ maintenance → hậu kiểm → complete receipt và cleanup đúng lock do R6 tạo. Không upload ZIP ứng dụng từ local. Workflow promote chưa có trên default branch nên dispatch trả 404; normal fast-forward được dùng trong quyền R6, không force hoặc merge main. [Promotion](R6-rebuild/promotion.json).

Backup mới `store.vneconomics.com__2026-10-28T16_24_33+0700.zip`: **81.552.461 byte**, **16.727 entry**, có `sqldump.sql`, CRC toàn bộ đạt. SHA256 `cdf07d9ef214437ace842cf6119b7b416768e41f46e51d95cbf1ee26703c76d8`; bản độc lập trong Downloads trên máy có cùng hash và vẫn được giữ. [Kiểm backup](R6-rebuild/backup-verification.json). Theme cũ 0.7.3/38 file và ZIP plugin 0.4.3/theme 0.7.3 trong private inbox được giữ để quay lui; không restore DB hoặc xóa backup thật.

Hậu kiểm **PASS**:

- [152 lượt GET](R6-rebuild/http-postflight.json): toàn bộ 126 URL cũ HTTP200/canonical/marker; điều hướng chính; 13 URL hỗ trợ/legacy; search noindex/không canonical; API edit 403, report REST 404; bốn sitemap khớp đúng 126 URL. Parser ban đầu chỉ nhận nháy kép ở thẻ robots; đã sửa, giữ [lượt thất bại của bộ kiểm](R6-rebuild/http-postflight-failure.json), tái dùng 143 kiểm tra đã hoàn tất và chạy lại phần còn lại. Không thay ứng dụng để sửa lỗi bộ kiểm.
- [So sánh lúc cutover](R6-rebuild/data-comparison.json) và [kiểm lại ngày 29/10](R6-rebuild/data-comparison-current.json): năm bảng posts/postmeta/terms/term_taxonomy/term_relationships cùng hash, active plugins không đổi, schema3/count đúng. Đã kiểm hash 35 file app hiện hành và giữ nguyên 38 file theme cũ. Module Stars được giữ, collector không được lên lịch. Các thay đổi options lúc cutover nằm trong lựa chọn theme/theme mods, cache và cron; audit hash chi tiết được giữ local.
- [Hành trình UI desktop thật](R6-rebuild/browser-postflight.json): homepage → catalog → resource/report GET; search Codex; danh sách 6 guide + 1 practice → bài thật và mục lục. Không gửi báo lỗi hoặc gọi API trả phí.
- [Mẫu log](R6-rebuild/log-sample.json): 1.000 dòng đã tải, 28/10 16:44:00–29/10 08:42:59; không có 5xx/PHP fatal trong mẫu. Đây không phải audit toàn bộ lịch sử log.
- [Cú pháp/quoting/pin lệnh đóng lượt](R6-rebuild/closeout-command-checks.json) đạt. Hosting đã đọc lại journal **COMPLETE**, `lockPresent=false`, `maintenance=false`, upgrade rỗng. Local runner cleanup PASS; dữ liệu/evidence/backup thật được giữ.

Giới hạn: UI live kiểm ở 1280px; override 390px của browser không áp dụng nên không dùng ảnh desktop làm chứng cứ mobile. Gate R5.2 đã kiểm ba engine và các breakpoint trên candidate đúng byte. Private endpoint live không tạo canary trong production. Native CLI có cảnh báo không fatal từ WooCommerce `Undefined array key "action"`; giữ console local, không sửa plugin ngoài phạm vi. Core hiện được quan sát là 7.1.4, khác runtime fixture R5.2 7.1.3; lượt GET/runtime vừa kiểm trên production hiện tại đều đạt.

R6 dừng để chủ dự án nghiệm thu. Git/Plesk vẫn Manual/private inbox; R7 tối ưu vận hành hoặc bật tự động cần gate riêng. Không bật scheduler, Automatic, post-action hoặc mở lô nội dung mới.
