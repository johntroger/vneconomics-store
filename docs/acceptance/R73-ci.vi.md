# R7.3 — Tách fast CI khỏi build candidate

Ngày 29/10/2026. Chủ dự án duyệt riêng bằng “ok” sau đề xuất tối ưu workflow CI ở local, chưa push/merge/thay Plesk. Trạng thái: **PASS_R73_LOCAL_CI_OWNER_APPROVED**; chủ dự án nghiệm thu bằng “ok” sau báo cáo hoàn tất cùng ngày.

## Thay đổi

- `rebuild-candidate.yml`: bỏ trigger push nhánh R52/paths rộng `scripts/**`; thay bằng `workflow_dispatch` nhập source SHA. Giữ build, native install/maintenance/rollback, artifact bắt buộc và retention21 ngày. Checkout exact SHA, kiểm HEAD trước cài dependency; build/artifact dùng cùng SHA input thay vì SHA của workflow controller.
- Builder R52 còn pin baseline U4 trước R6, không phải builder phát hành tùy ý sau R6. Workflow được đặt tên lịch sử và chỉ nhận source đã nghiệm thu `50437bd16eae1912d8cffea093401449786faaea`; source khác bị từ chối. Muốn release mới cần profile/baseline mới và gate riêng. Không thay builder hoặc production receipt trong R7.3.
- `pr-fast.yml`: concurrency theo PR number, fallback ref khi chạy thủ công, prefix riêng `fast-pr-`; hủy lượt fast cũ cùng nhóm. Không áp dụng hủy này cho promote/build release. Giữ nguyên ba gate cú pháp/workflow contract/evidence policy; không bỏ cả workflow theo path tài liệu để tránh thiếu required check.
- Mở rộng `test:workflow-contract` để giữ hợp đồng cũ và kiểm workflow R52, SHA/input/checkout/evidence, trigger, quyền read-only và phân nhóm concurrency. Không thêm dependency hoặc secret; không tạo kết nối hosting.

Hành vi dự kiến sau khi thay đổi được đưa lên GitHub theo gate riêng: push code thường không tự build R52; PR chạy fast checks; build R52 chỉ theo yêu cầu thủ công đúng source; payload promotion và Plesk vẫn có gate độc lập. Đây chưa phải bằng chứng CI remote đã vận hành.

## Kiểm chứng local

- [Workflow contract](R73-ci/workflow-contract.json): hợp đồng R0B bốn workflow vẫn đạt; thêm **15 biến thể không an toàn bị từ chối**, **7 ca chạy guard PowerShell thực tế đạt**, khoảng5,281 giây một lượt. Ca SHA chữ hoa đã phát hiện `-notmatch/-ne` mặc định không phân biệt hoa/thường; sửa thành `-cnotmatch/-cne` và chạy lại đạt. Input chỉ truyền qua env, không chèn thẳng vào shell.
- `npm run test:pipeline-ci -- --u2`: **73 kiểm tra PASS**, cleanup PASS; gate evidence policy giữ nguyên.
- [Kiểm cú pháp JS](R73-ci/syntax.json) và [diff/link/cleanup](R73-ci/validation.json) đạt. Không chạy WordPress/application suite vì chỉ đổi workflow và kiểm thử chính sách, không đổi theme/plugin/schema.

## Giới hạn và phát hành

Chưa push, merge, dispatch, đổi branch protection hoặc bật automation trên dịch vụ. Chưa đo mức giảm phút Actions hoặc thời gian CI thật; local contract không thay GitHub validation/actionlint hay một lượt runner thật. Workflow R52 chỉ được phép tái tạo candidate lịch sử, không cho release sau R6.

Đối chiếu tài liệu chính thức: [workflow_dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch) mô tả yêu cầu file workflow trên default branch và cách dispatch; [concurrency](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#concurrency) mô tả hủy lượt cũ cùng nhóm. Snapshot `origin/main` local hiện không có `rebuild-candidate.yml`; chưa fetch/chứng nhận trạng thái remote nên chưa khẳng định nút Run workflow/API dispatch đang sẵn sàng. Việc đưa cấu hình lên GitHub, kiểm tra khả dụng và chạy CI thật cần gate riêng; không tự merge main để vượt điều kiện này.

R7.3 đã được nghiệm thu ngày 29/10/2026; bước tiếp theo chưa được mở. Giữ nguyên local → GitHub/CI → payload GitHub → private inbox Plesk → verify/Manual production theo approval; không bỏ gate release hoặc đổi baseline/lock/receipt.
