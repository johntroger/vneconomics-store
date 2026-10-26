# R3 — Đồng bộ nguồn GitHub và kiểm chứng CI

Ngày26/10/2026; chủ dự án duyệt riêng “duyệt R3”. Gate này chỉ đưa nguồn lên GitHub, mở Draft PR và kiểm CI/gói. Không merge main, tạo nhánh payload hoặc đổi cấu hình/triển khai Plesk.

**PASS R3.** Source cuối trên GitHub `71a914ea7e1746620a0f055dfec26ece3c231ea6`, [CI cuối40267580030](https://github.com/johntroger/vneconomics-store/actions/runs/40267580030) đạt217+75 kiểm tra, build/upload đạt. Manifest SHA256 `42876608ef3ebfe3de131c9de4a8ef7136e925dfc89da5987bb58f8b4c3afaf3`; cả11 tệp tải về khớp local. GitHub giữ mã/công cụ và biên nhận lượt trước; biên nhận run cuối được cập nhật local sau CI, đồng thời ghi kết luận/link/hash trong mô tả PR để không tạo vòng commit biên nhận → SHA mới → build mới.

## Nguồn và CI

Nhánh `codex/deployment-pipeline`, [Draft PR1](https://github.com/johntroger/vneconomics-store/pull/1). Workflow checkout SHA đầu nhánh PR, không dùng merge SHA tạm; Node22/Windows2025, quyền contents:read, timeout10phút. Gói ứng viên lưu GitHub Artifact1 ngày để so byte với local. Không thêm scope/token/quyền hosting, không thay budget/gói hoặc runner tính phí riêng. API billing cũ không đọc được bằng scope hiện có, vì vậy hồ sơ không khẳng định chi phí bằng0.

Lần CI đầu trên `d0334df` thất bại: detached checkout không có nhánh local, `git show-ref --heads` trả1. Đã sửa thành `for-each-ref`, vẫn đối chiếu refs trước/sau; kiểm gói local217 ca đạt. Giữ [bằng chứng lỗi](R3-github-ci/initial-ci-failure.json). Đây là sửa runner kiểm thử,9 tệp payload không đổi.

[Run thành công đầu tiên40267049302](https://github.com/johntroger/vneconomics-store/actions/runs/40267049302) trên `8212eafa3f537e6db4f37d63695dbbf2ae0292d0`:217 kiểm pipeline và75 kiểm S14 đạt; build và upload ứng viên đạt. S14 local có76 vì thêm phép bảo vệ DB/config khi `.local` hiện diện; runner sạch không có dữ liệu đó. Không dùng kết quả SQLite/UI local để gọi MariaDB/Plesk PASS.

Run/commit cuối và bước CI: [ci-run.json](R3-github-ci/ci-run.json). Kết quả so sánh, manifest SHA và11 tệp ứng viên: [candidate-comparison.json](R3-github-ci/candidate-comparison.json). Từng tệp tải từ Actions khớp byte với build local cùng source SHA và được rebuild độc lập từ Git;9 tệp payload vẫn khớp R2, gồm38file theme và10file plugin. Manifest/wrapper thay theo source SHA đúng thiết kế. Bản tải local giữ ở `artifacts/pipeline/github-<run>/`, không upload thẳng tới hosting.

## Hosting, cleanup và giới hạn

Trước push đã đọc GitHub hook/hash và cấu hình Plesk thực: [preflight.json](R3-github-ci/preflight.json). Sau push, reload Git card vẫn là `release`/commit4fe952a, Automatic → `/store.vneconomics.com/codex-deploy-check`; post-deploy actions vẫn tắt. Không bấm Pull/Deploy/Apply. Remote `release` đầy đủ vẫn `4fe952ac7eec550d3125be9885fa6271aece2718`; không có release/staging hoặc release/production mới.

Ba webhook push trả204, không redelivery; đây chỉ là endpoint tiếp nhận sự kiện, không chứng minh cài ứng dụng. Reload Plesk sau push cuối vẫn giữ nguyên Git card. [Biên nhận webhook đã lọc](R3-github-ci/hook-deliveries.json).

Mọi lượt build/test/download-verify qua run-clean, cleanup đạt. Gói/checksum/biên nhận là sản phẩm cần giữ; DB/config local và nội dung Codex gốc được bảo vệ. Các file marketing/banner ngoài phạm vi không vào commit/push. Chỉ chạy package CI; không gọi API AI có phí, bật scheduler hoặc đăng bài.

R3 không chứng minh giao nhận/cài trên staging. Hai môi trường trong gói vẫn `deploymentConfigured:false`, repository/inbox:null. R4 cần phê duyệt riêng để pin đường private sau khi xác thực khả năng hosting, cập nhật cấu hình có phiên bản/CI rồi đưa payload lên `release/staging`, Plesk Manual và chỉ áp dụng vào `staging-store.vneconomics.com` (domain319). Đề xuất repository `vneconomics-store-staging.git`, inbox `/var/www/vhosts/vneconomics.com/deploy-inbox/staging`, ngoài document root. Không tự coi path đề xuất là đã tồn tại hoặc hoạt động. Nếu hosting không hỗ trợ private inbox, dừng trình phương án; không quay về local→Plesk.

Production, kết nối connection-check hiện có và nhánh release giữ nguyên. Phê duyệt R3 không mở R4/R5.
