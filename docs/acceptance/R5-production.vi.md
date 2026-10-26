# R5 — tiếp nhận baseline production qua GitHub/Plesk

> Bổ sung khi chủ dự án duyệt R6: hồ sơ cuối R5 được lưu GitHub trong đợt chốt R6; receipt/CI/ref phát hành bên dưới giữ nguyên. Các câu R6 chưa mở là trạng thái tại lúc kết thúc R5. Xem [R6](R6-closeout.vi.md).

Trạng thái: **PASS theo “duyệt R5” ngày26/10/2026**. Production đã được tiếp nhận bằng receipt mới; chưa mở R6. [Biên nhận tổng hợp](R5-production/completion.json).

## Phạm vi và điểm dừng

Giữ theme0.7.2/38file, plugin0.4.2/10file/schema3 và toàn bộ nội dung hiện hữu. Chỉ cấu hình Git/Plesk Manual tới inbox private và thêm biên nhận `adopt` nếu baseline khớp; không cài lại ứng dụng, nhập lại100bài/hướng dẫn, chép/restoreDB hoặc merge main. Kết nối `release`/`codex-deploy-check` cũ giữ nguyên.

Các đường production đã đọc `realpath` thực tế: `/var/www/vhosts/vneconomics.com/git/vneconomics-store-production.git` và `/var/www/vhosts/vneconomics.com/deploy-inbox/production`; parent/inbox0700. Nhánh phẳng `release-production` tránh xung đột với `release` lịch sử. Default key đọc sẵn có; Manual, không post deployment actions. Git branch chỉ xuất10file manifest/payload, không đặt mã nguồn/DB/config bí mật vào document root.

Trong9file payload, ứng viên chỉ thay `environments.json` so với R4; tám file ứng dụng/receiver/nội dung/bằng chứng giữ nguyên. Manifest đổi theo source/cấu hình mới. Source đã qua CI; artifact CI/local khớp byte. Fresh adoption staging đạt trước khi production trỏ **đúng cùng commit payload** đã thử, không build lại. `publish-r5-payload.mjs` kiểm CI/ref/blob và yêu cầu biên nhận staging bất biến cùng backup production CRC đạt trước khi push nhánh production.

Backup mới trước thay đổi: `store.vneconomics.com__2026-10-26T14_33_18+0700.zip`,81.538.427byte,SHA256 `4b24994b5b1296c30cbc8749b8d2a7a97b17d3da661c32631ce2c38355d9f6a2`,14.413file/CRC0lỗi. Giữ trên hosting, không đưa DB vào Git. Baseline production130hàng có fingerprint `85d0113fb4db5d18264d9967a61d020603e30f24ce2c955546d1f96099cd1a62`;106tài nguyên/6hướng dẫn/1thực hành,103mục gói đã có,38/10hashkhớp,3bằngchứngcó.10journal C100 vẫn `verified`, G03 vẫn `published`.

Không dự kiến gián đoạn vì không thay file/DB nội dung hoặc bật maintenance. Lệnh adoption có giới hạn120giây; nếu timeout/trạng thái không rõ, chỉ inspect journal/baseline trước khi quyết định, không retry mù hoặc phá lock. Nếu baseline đổi/xung đột, dừng và giữ chỉnh sửa. Quay lui cấu hình bằng ngừng kết nối Manual mới, giữ website/backup/biên nhận để điều tra; không tự restoreDB hoặc hạ theme. Gói quay lui ứng dụng lịch sử giữ nguyên nhưng không cần cài trong ca chỉ thêm receipt.

## Bằng chứng và giới hạn

Baseline/backup: [metadata](R5-production/production-baseline-backup.json), [inspect chỉ đọc](R5-production/production-inspect-before.json). Một lần lệnh đọc bổ sung lỗi quoting PHP trước thực thi; đã sửa sang prepared SQL, kiểm lại thành công, không ghi dữ liệu website.

Source phát hành **`4266b71990702d87969a847e95d9c39933cb05a4`**, [CI40288437763](https://github.com/johntroger/vneconomics-store/actions/runs/40288437763) PASS218pipeline+75S14 trên Windows2025/Node22. Local218pipeline/76S14 đạt;218local kiểm source5931b31 chứa cấu hình R5, CI kiểm source4266b71 cuối. Đã tải artifact:11/11file khớp local,8file payload giữ nguyên so với R2/R4. Native/UI R2 và rollback R4 được dùng lại vì byte ứng dụng/receiver không đổi; không coi CI là kiểm thử MariaDB/UI.

Hai nhánh **`release-staging` và `release-production` cùng `dc4af296692ddac2dd71dc9f1be4a69f1af29959`**; tree `293f8365afdc57337b60ac4df47306f6fcbdbb0e`, manifest SHA256 **`02953f231825577da95d1a71887a44ba07e425015412b5448581588af042bf34`**. Plesk hai môi trường nhận10file/10hashkhớp, đúng symbolic HEAD và realpath inbox0700. [GitHub refs](R5-production/github-final-refs.json), [staging nhận](R5-production/staging-plesk-received.json), [production nhận](R5-production/production-plesk-received.json). `release` lịch sử vẫn `4fe952ac7eec550d3125be9885fa6271aece2718`; connection-check cũ giữ nguyên. PR1 còn Draft, main chưa merge.

Fresh receipt **`vne_pipeline_02953f231825577da95d1a71`** trên từng DB đạt **ADOPTED_EXISTING_BASELINE**. Trong cùng tiến trình PHP thực: toàn bộ option_name/value/autoload trừ duy nhất receipt mới giống trước/sau; mọi option VNE cũ giữ nguyên,130hàng nội dung/meta/terms/runtime có fingerprint không đổi. Staging vẫn `22e86a5a80e471fef39fa0bb267059a4a708c358260c59587d02f4eb92ff562d`, production vẫn `85d0113fb4db5d18264d9967a61d020603e30f24ce2c955546d1f96099cd1a62`. Hai retry đều **ALREADY_ADOPTED**; không nhập lại nội dung, không tạo post/revision/bằng chứng mới. [Staging adopt](R5-production/staging-adoption.json), [production adopt](R5-production/production-adoption.json), [retry](R5-production/production-retry.json).

Production giữ106tài nguyên/6hướng dẫn/1thực hành,103natural-key/ID có sẵn,3guide chính107/213/215;10journal C100 vẫn verified và G03 vẫn published/hashkhớp baseline. Indexing production1 và staging0. Hậu kiểm thực tế **783kiểm tra/151HTTPS GET** đạt:106chi tiết tài nguyên,12trang catalog,3hướng dẫn/3hashbằngchứng,search,14URL cũ,canonical production,robots/sitemap106+6+1,API public và từ chối private-user/private-inbox/private-Git. [HTTP](R5-production/http-after.json).

Copy thật/clipboard và checklist lưu qua reload của3guide đạt; checklist được trả về đúng6trạng thái ban đầu từng bài, clipboard cũ được phục hồi mà không lưu nội dung vào bằng chứng.6case home/hub/catalog ở390/320px không tràn ngang; viewport reset. [UI](R5-production/production-ui-checks.json), [responsive/cleanup UI](R5-production/responsive-and-ui-cleanup.json), [ảnh production](R5-production/production-guide-hub-final.jpg), [Git/Plesk](R5-production/plesk-production-final.jpg).

Chốt chặn thực thi đã từ chối gói production chưa cấu hình trước network/ref-write; gói CI hợp lệ nhưng chưa có staging receipt cũng bị từ chối trước push. GitHub xác nhận chưa có release-production ở thời điểm thử chặn. Các lỗi dự kiến được giữ tại [unconfigured](R5-production/negative-unconfigured-production.json) và [missing receipt](R5-production/negative-missing-staging-receipt.json).

Cleanup đạt: mọi lần chạy script qua run-clean đã dọn fixture/cache mới; hai môi trường pipeline lock0, upgrade/upgrade-temp-backup rỗng. Backup mới còn nguyên hash, **5backup production+4staging** được giữ, cùng Git/inbox/receipt/gói thật. Không tạo bài QA công khai, gọi AI/API tính phí, gửi mail, bật automation hoặc đổi gói/hạn mức. [Postflight production](R5-production/production-postflight.json), [staging](R5-production/staging-postflight.json).

Giới hạn: đây là **tiếp nhận baseline**, không phải cài lại production; không viết lại lịch sử các lần25/10 nhận ZIP trực tiếp. Không diễn tập restoreDB hoặc đo/tối ưu hiệu năng production. Source/helper R5 đã có trên GitHub; biên nhận runtime cuối giữ local/hosting và tóm tắt trên PR để không đổi sourceSHA ứng viên bằng một vòng commit metadata. R6 chốt runbook/hồ sơ chưa được thực hiện. Dừng chờ chủ dự án duyệt riêng R6 theo AGENTS.md.
