# R7.6 — Chuẩn bị PR đồng bộ main với source hiện hành

Ngày 29/10/2026. Chủ dự án duyệt bằng “ok” sau đề xuất rà soát R52/main, chuẩn bị PR hợp nhất và chạy CI phù hợp; chưa gồm merge hoặc deploy. Trạng thái: **PASS_R76_MAIN_PR_OWNER_APPROVED**; chủ dự án nghiệm thu bằng “ok” sau báo cáo hoàn tất cùng ngày.

## Kết quả

- [Draft PR #5](https://github.com/johntroger/vneconomics-store/pull/5): base `main` tại `578ce3073158a7bacfbfedef0b4feeef125a2570`, head `codex/main-source-reconciliation` tại **`8c28858ed1d128f2b32ca2b5a311edfb0a22217f`**. OPEN, draft, MERGEABLE/CLEAN, chưa merge. [Readback PR](R76-main/pull-request.json).
- Nhánh mới bắt đầu từ R52 `dc90361d9ddceb7e5d38855a5149f7e4b8743a19`, thêm một commit **chỉ tài liệu**. So với main: 242 file, 13.763 dòng thêm/151 dòng xóa, phần lớn là lịch sử đã có trên R52. Main là ancestor; toàn bộ commit của PR #2 và #3 đã nằm trong source được đề xuất. Hai PR cũ vẫn OPEN, không đóng hoặc merge riêng.
- `themes/`, `plugins/`, `deploy/` của head **giống byte Git** source R6 `50437bd16eae1912d8cffea093401449786faaea`; không viết lại ứng dụng hoặc tạo phiên bản production mới. Source header plugin và phiên bản được builder đóng gói/runtime được phân biệt theo manifest/receipt R6.
- Rà soát thấy tài liệu R1–R5.1 và một số evidence chỉ có local dù được tài liệu hiện hành tham chiếu. Bổ sung closure đúng 46 file có tham chiếu, khoảng1,83MB, gồm hợp đồng/receipt/JSON/ảnh preview gốc; giữ nguyên kết quả lịch sử. Hai Markdown được bỏ dòng trắng thừa cuối file. Không copy evidence sang thư mục mới; không thêm raw audit U4, DB, backup hoặc payload. Runbook đánh dấu hồ sơ audit U4 là local, giữ receipt R6 làm nguồn công khai hiện hành.
- Kiểm **200 relative links** của Markdown thay đổi theo Git index đều tồn tại; không dựa vào file untracked để báo PASS. Các thay đổi package.json/PR1 ngoài phạm vi vẫn giữ local và không vào commit.

## CI và bằng chứng

[Run40831450053](https://github.com/johntroger/vneconomics-store/actions/runs/40831450053) **SUCCESS** đúng head `8c28858`, event pull_request, job fast **59 giây**: 13:48:31–13:49:30 ngày29/10/2026 Asia/Saigon. [Job/step readback](R76-main/ci-run.json).

- Cú pháp **112 file JS** trên checkout sạch đạt.
- Hợp đồng R0B đạt; **15 biến thể cấu hình không an toàn bị từ chối**, **7 ca PowerShell thực tế đạt**.
- **73 evidence-policy checks đạt**, ba runner báo cleanup PASS.
- Gate ứng dụng được tái sử dụng theo source identity: [CI R52 exact source](https://github.com/johntroger/vneconomics-store/actions/runs/40660368997), 13 native/13 URL probes/90 browser và126 URL/privacy; [receipt R6](R6-rebuild.vi.md). Không chạy lại full application suite/build/backup chỉ vì bổ sung hồ sơ vào tree có cùng mã ứng dụng. Đây không phải lượt chứng nhận hosting hoặc runtime mới.

[Validation](R76-main/validation.json) ghi head/base, source identity, coverage link, diff và cleanup. Chỉ quan sát một run fast trên nhánh mới; không dispatch build/promote. `main` vẫn `578ce3073158a7bacfbfedef0b4feeef125a2570`, `release-production` vẫn `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`, R52 vẫn `dc90361d9ddceb7e5d38855a5149f7e4b8743a19`.

## Điểm dừng

PR #5 đã attach vào chat; body và readback được giữ làm sản phẩm. Biên nhận đóng R7.6 lưu local sau CI, chưa push thêm chỉ để chạy lại CI vì hồ sơ. Không tạo fixture/cache local trong bước này; giữ database/config, nội dung/ảnh gốc, backup/rollback và sửa đổi ngoài phạm vi.

R7.6 đã được chủ dự án nghiệm thu ngày 29/10/2026. PR còn draft; chưa cấp quyền chuyển ready/merge main, xử lý PR #2/#3, bật automation hoặc deploy. Builder R52 vẫn đóng băng baseline trước R6; một release mới cần profile/baseline và approval riêng. Bước tiếp theo chưa được mở thực hiện.
