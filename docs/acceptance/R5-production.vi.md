# R5 — tiếp nhận baseline production qua GitHub/Plesk

Trạng thái: **đang thực hiện theo “duyệt R5” ngày26/10/2026**. Chưa mở R6.

## Phạm vi và điểm dừng

Giữ theme0.7.2/38file, plugin0.4.2/10file/schema3 và toàn bộ nội dung hiện hữu. Chỉ cấu hình Git/Plesk Manual tới inbox private và thêm biên nhận `adopt` nếu baseline khớp; không cài lại ứng dụng, nhập lại100bài/hướng dẫn, chép/restoreDB hoặc merge main. Kết nối `release`/`codex-deploy-check` cũ giữ nguyên.

Các đường production đã đọc `realpath` thực tế: `/var/www/vhosts/vneconomics.com/git/vneconomics-store-production.git` và `/var/www/vhosts/vneconomics.com/deploy-inbox/production`; parent/inbox0700. Nhánh phẳng `release-production` tránh xung đột với `release` lịch sử. Default key đọc sẵn có; Manual, không post deployment actions. Git branch chỉ xuất10file manifest/payload, không đặt mã nguồn/DB/config bí mật vào document root.

Ứng viên chỉ thay `environments.json` so với payload R4; tám file ứng dụng/receiver/nội dung/bằng chứng giữ nguyên. Source phải qua CI; artifact CI/local phải khớp byte. Thử fresh adoption trên staging trước, rồi production trỏ **đúng cùng commit payload** đã thử, không build lại. `publish-r5-payload.mjs` kiểm CI/ref/blob và yêu cầu biên nhận staging bất biến cùng backup production CRC đạt trước khi push nhánh production.

Backup mới trước thay đổi: `store.vneconomics.com__2026-10-26T14_33_18+0700.zip`,81.538.427byte,SHA256 `4b24994b5b1296c30cbc8749b8d2a7a97b17d3da661c32631ce2c38355d9f6a2`,14.413file/CRC0lỗi. Giữ trên hosting, không đưa DB vào Git. Baseline production130hàng có fingerprint `85d0113fb4db5d18264d9967a61d020603e30f24ce2c955546d1f96099cd1a62`;106tài nguyên/6hướng dẫn/1thực hành,103mục gói đã có,38/10hashkhớp,3bằngchứngcó.10journal C100 vẫn `verified`, G03 vẫn `published`.

Không dự kiến gián đoạn vì không thay file/DB nội dung hoặc bật maintenance. Lệnh adoption có giới hạn120giây; nếu timeout/trạng thái không rõ, chỉ inspect journal/baseline trước khi quyết định, không retry mù hoặc phá lock. Nếu baseline đổi/xung đột, dừng và giữ chỉnh sửa. Quay lui cấu hình bằng ngừng kết nối Manual mới, giữ website/backup/biên nhận để điều tra; không tự restoreDB hoặc hạ theme. Gói quay lui ứng dụng lịch sử giữ nguyên nhưng không cần cài trong ca chỉ thêm receipt.

## Bằng chứng và giới hạn

Baseline/backup: [metadata](R5-production/production-baseline-backup.json), [inspect chỉ đọc](R5-production/production-inspect-before.json). Một lần lệnh đọc bổ sung lỗi quoting PHP trước thực thi; đã sửa sang prepared SQL, kiểm lại thành công, không ghi dữ liệu website.

Chưa ghi PASS cho CI/Plesk/adoption/hậu kiểm/cleanup cho đến khi có biên nhận thực tế. Kết quả R4 cho mã ứng dụng không đổi được dùng lại; R5 kiểm thực tế cấu hình, fresh receipt staging và production, retry, URL/canonical/indexing và bảo toàn dữ liệu. Không chạy AI/API có phí, gửi mail, tạo bài QA công khai hoặc bật automation.
