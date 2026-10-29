# R7.5 — Merge PR #4 vào nhánh R52

Ngày 29/10/2026. Chủ dự án duyệt bằng “ok” sau câu hỏi riêng về merge PR #4 vào `codex/rebuild-r52-candidate` và hậu kiểm; không gồm main/build release/deploy Plesk. Trạng thái: **PASS_R75_MERGE_OWNER_APPROVED**; chủ dự án nghiệm thu bằng “ok” sau thông báo kết quả merge và hậu kiểm cùng ngày.

## Kết quả

- [PR #4](https://github.com/johntroger/vneconomics-store/pull/4) đã MERGED lúc **13:36:18 ngày 29/10/2026 Asia/Saigon** (`2026-10-29T06:36:18Z`). [Readback](R75-merge/pull-request.json).
- Base trước merge `9e5268ad8c1907ad94e523bfd7569a08b88dd9a3`, head đã duyệt/CI PASS `f10bec4df41a2fae3eb97dbf4357fcab02fe43b6`; merge commit **`dc90361d9ddceb7e5d38855a5149f7e4b8743a19`** trên `codex/rebuild-r52-candidate`. Đã kiểm lại pin và check SUCCESS trước merge, dùng `--match-head-commit`, không force/admin bypass hoặc tự xóa nhánh. [Preflight](R75-merge/preflight.json).
- Fetch/readback nhánh R52 đúng merge SHA; hai parent lần lượt đúng base/head. Toàn bộ tree merge **giống hệt tree head đã kiểm CI**, không có thay đổi mới phát sinh khi hợp nhất. [Verification](R75-merge/verification.json).
- CI được tái sử dụng là [40809965586](https://github.com/johntroger/vneconomics-store/actions/runs/40809965586), đúng head `f10bec4`, fast PASS54 giây ở R7.4. Không gọi đó là CI mới trên merge SHA; không chạy lặp application suite/build/backup khi tree không đổi.
- `git diff` base→merge theo `themes/`, `plugins/`, `deploy/` rỗng. `main` vẫn `578ce3073158a7bacfbfedef0b4feeef125a2570`, `release-production` vẫn `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`, nhánh head R7 vẫn được giữ. Production vẫn theo receipt R6, không suy phiên bản production từ merge này.
- [Danh sách run quan sát tại hậu kiểm](R75-merge/observed-runs.json) trên merge SHA rỗng. Cấu hình candidate R52 trong tree đã merge chỉ có manual dispatch; không dispatch thêm CI/release, không truy cập Plesk, không bật automation hoặc thay quyền/config hosting.

## Hồ sơ và cleanup

[Kiểm tra hồ sơ](R75-merge/validation.json): diff/link/pin đạt, không còn cleanup lock. Chỉ tạo biên nhận cần giữ; không dựng fixture/cache hoặc tạo backup để hậu kiểm Git merge. `.local`, dữ liệu/ảnh gốc, backup, rollback, evidence lịch sử và các sửa đổi PR1/package.json ngoài phạm vi được giữ. Local vẫn ở nhánh R7 head cũ với tree tương đương merge; không reset/checkout hoặc ghi đè dirty tree.

Biên nhận R7.5 lưu local sau thao tác; chưa tạo thêm commit/push cho hồ sơ. R7.5 đã được nghiệm thu trong phạm vi hợp nhất vào nhánh R52. Merge vào main, profile release sau R6, phát hành payload, tự động hóa và deploy vẫn cần gate riêng.
