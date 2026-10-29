# R7.4 — Đưa tối ưu local/CI lên GitHub bằng PR

Ngày 29/10/2026. Chủ dự án duyệt riêng bằng “ok” sau đề xuất rà soát R7.1–R7.3, tạo PR và chạy fast CI, chưa merge/build release/deploy. Trạng thái: **PASS_R74_GITHUB_CI_OWNER_APPROVED**; chủ dự án nghiệm thu bằng “tiếp tục” sau báo cáo hoàn tất cùng ngày. Quyền merge chưa được cấp.

## Kết quả

- [PR #4](https://github.com/johntroger/vneconomics-store/pull/4), OPEN/chưa merge. Head `codex/r7-local-preview-ci` tại `f10bec4df41a2fae3eb97dbf4357fcab02fe43b6`; base `codex/rebuild-r52-candidate` tại `9e5268ad8c1907ad94e523bfd7569a08b88dd9a3`. Dùng base hiện hành để diff chỉ gồm R7, không gom lịch sử ứng dụng chưa merge vào PR mới tới main. [Readback PR](R74-github/pull-request.json).
- Commit gồm **43 file**, 958 dòng thêm/68 dòng xóa: preview/smoke, hai workflow, kiểm chính sách, README và hồ sơ JSON đã duyệt. Không đổi theme/plugin/schema, không đẩy ảnh screenshot, database, backup hoặc payload. Thêm hướng dẫn clone mới cần `local:init` trước preview vì runtime tái dùng core `.local/site`.
- `package.json` chỉ đưa ba alias preview vào commit; bảy alias test lịch sử đang sửa từ trước và thay đổi PR1 vẫn ở local. Không stage toàn workspace. Kiểm scope, pattern credential và năm relative import của source mới đạt trước commit. Các dependency/lockfile không đổi.
- [CI 40809965586](https://github.com/johntroger/vneconomics-store/actions/runs/40809965586) **SUCCESS** đúng head SHA, event `pull_request`; job `fast` chạy **54 giây**, 29/10/2026 10:03:40–10:04:34 Asia/Saigon. [Run/job/step readback](R74-github/ci-run.json).
- CI checkout sạch: **112 file JS đạt cú pháp**, hợp đồng R0B vẫn đạt, **15 biến thể cấu hình không an toàn bị từ chối + 7 ca PowerShell đạt**, **73 evidence-policy checks đạt**; ba runner báo cleanup PASS. Số file CI ít hơn local123 do không chứa 11 script local chưa thuộc commit; không đưa chúng vào PR chỉ để khớp số đếm.
- Chỉ có một run fast trên nhánh mới trong lượt này. Không dispatch build candidate, promote hoặc thao tác Plesk. Main vẫn `578ce3073158a7bacfbfedef0b4feeef125a2570`; `release-production` vẫn `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`.

## Kiểm tra cuối bước và giới hạn

[Biên nhận](R74-github/validation.json) ghi đúng head/base, check SUCCESS, diff/link đạt và không còn cleanup lock. Body PR và JSON readback được giữ làm sản phẩm; không tạo fixture/cache local mới trong bước GitHub này. Mật khẩu/tài khoản, database local, backup thật, evidence/ảnh cũ và các sửa đổi ngoài phạm vi được giữ.

PR đã được attach vào chat. Hồ sơ đóng R7.4 này được lưu local sau khi CI đạt, chưa tạo thêm commit/push để chạy lại fast CI chỉ vì cập nhật biên nhận; source đã kiểm trên GitHub vẫn là `f10bec4df41a2fae3eb97dbf4357fcab02fe43b6`.

Fast CI không chứng nhận lại UI/Plesk hoặc biến builder R52 thành profile sau R6. Quyền R7.4 không cho merge vào base/main, phát hành payload, bật automation hoặc deploy. R7.4 đã được nghiệm thu; bước hợp nhất cần duyệt riêng. Rà soát sau nghiệm thu: PR vẫn OPEN/MERGEABLE/CLEAN, head/base đúng pin, CI SUCCESS; các nhánh main và release-production không đổi. Xem [readiness](R74-github/merge-readiness.json).
