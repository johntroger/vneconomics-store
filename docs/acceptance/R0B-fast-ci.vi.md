# R0B — Fast CI và release workflow v2

Ngày: 27/10/2026
Trạng thái: **LOCAL PASS — CHƯA ĐÓNG GATE REMOTE**

## Phạm vi đã thực hiện

- Chuyển `.github/workflows/pipeline-check.yml` thành workflow candidate chạy thủ công từ exact source SHA và profile được allowlist.
- Thêm `pr-fast.yml` quyền `contents: read`, không secret, không publish/deploy.
- Thêm `promote-production.yml` chạy thủ công qua GitHub Environment `production`, kiểm candidate ref/payload/source/expected parent/manifest/hash trước normal fast-forward; không force-push và không gọi Plesk.
- Pin action chính thức bằng commit SHA đã đối chiếu tag chính thức: checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2; cả ba dùng runtime Node 24 trên GitHub-hosted runner.
- Retention candidate 21 ngày.
- Bỏ chọn builder bằng chuỗi phiên bản CSS và bỏ S14 lịch sử khỏi candidate mặc định.
- Thêm runner candidate/profile, validator payload commit, syntax fast check và workflow security contract.
- Giữ workflow S14 lịch sử ở manual-only và pin action; không đưa vào PR mặc định.

## Kết quả kiểm thử local

- `npm run test:workflow-contract`: PASS 4 workflow.
- `npm run test:ci-fast`: PASS cú pháp 104 file JavaScript.
- `npm run test:pipeline-ci -- --u2`: PASS 73 policy checks.
- `npm run test:pipeline-ci-cli -- --u2`: PASS 9 CLI cases; 9 payload file và 50 evidence R5 không đổi.
- `npm run test:candidate -- vne-073-043-stars1-schema3 7b7ae3454512576e676d43ebb10f274920ee2a34`: PASS; hai build khớp byte, 9 file.
- `npm run test:promote-validator`: PASS exact commit; từ chối source/parent/profile drift.
- 82 npm scripts, 0 target bị thiếu.
- Không còn official action tag nổi `@v*` trong `.github/workflows`.
- `git diff --check`: PASS; chỉ cảnh báo line-ending, không có whitespace error.
- Mọi runner cleanup thành công; `tmp/tests` không còn entry do lượt kiểm tạo.

Hai lần chạy policy đầu phát hiện fixture thời gian cũ không phù hợp retention 21 ngày. Fixture được sửa theo cửa sổ upload động và expiry 22 ngày; toàn bộ policy/CLI được chạy lại và PASS. Không bỏ qua lỗi.

## Guard đã xác nhận

- PR workflow không có quyền ghi, secret hoặc lệnh push.
- Candidate workflow chỉ `workflow_dispatch`, `contents: read`, exact SHA/profile và artifact 21 ngày.
- Promote yêu cầu GitHub Environment `production`, candidate ref cố định, expected parent, manifest allowlist/hash và push fast-forward bình thường.
- Không workflow mới nào gọi Plesk/webhook hoặc deploy website.

## Phần chưa hoàn tất

- Chưa push các workflow mới, chưa mở PR và chưa dispatch GitHub Actions thật.
- Nhánh hiện tại `codex/github-stars-u2` có 6 commit U2 chưa nằm trên `origin/main`. Mở PR R0B trực tiếp sẽ trộn U2 với thay đổi quy trình, nên đã dừng thay vì tự quyết định merge/base.
- GitHub Environment `production` và required reviewer chưa được kiểm chứng/cấu hình; workflow promote chưa được phép chạy.
- Candidate ref bất biến chỉ được tạo tại R5.2; R0B không tạo ref hoặc cập nhật `release-production`.
- Profile hiện allowlist đúng baseline đang làm `vne-073-043-stars1-schema3`; profile rebuild v3 phải được thêm ở R5.2 từ exact source đã duyệt.

## Những gì không xảy ra

- Không commit/push/PR/dispatch/merge.
- Không đổi `release-production` hoặc nhánh payload nào.
- Không đăng nhập Plesk, không tạo backup và không thay production.

## Điều kiện đóng R0B

Chủ dự án chọn base sạch hoặc cho phép tích hợp U2 trước. Sau đó mở PR chỉ chứa phạm vi đã duyệt, xác nhận `pr-fast` và candidate workflow thật PASS, không có ref/hosting mutation, rồi mới ghi R0B hoàn tất.
