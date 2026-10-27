# O1 — Tối ưu quy trình trước khi làm website mới

Ngày: 27/10/2026. Phạm vi được chủ dự án cho phép: tối ưu vòng lặp phát triển, bỏ phần không cần thiết và xóa file không còn dùng; không code website mới, không push, không chạy CI remote và không thay Plesk/production.

## Thay đổi

- Thêm ma trận kiểm thử nhanh vào `AGENTS.md`: local chỉ test phần bị tác động; full regression, backup, payload và evidence chỉ ở gate production.
- Đánh dấu S00–S16 là lịch sử, không bắt website mới chạy lại toàn bộ quy trình cũ.
- Chốt production-only: `release-production` là nhánh payload hiện hành; `release-staging` chỉ giữ lịch sử.
- Thêm lệnh `npm run test:fast` trỏ tới smoke có cleanup sẵn.
- Giữ các alias build/test staging vì tài liệu lịch sử còn tham chiếu; ma trận mới quy định chúng không chạy mặc định. Alias không tự chạy nên xóa chúng không làm vòng lặp nhanh hơn.
- Xóa bốn script không có caller/tham chiếu và đã hết vai trò: `cli-help.mjs`, `diagnose-r4-catalog.mjs`, `setup-github.mjs`, `verify-connection-release.mjs`. Đặc biệt `setup-github.mjs` còn yêu cầu repository private nên không còn đúng với trạng thái public hiện tại.

## Phần cố ý giữ

- `docs/acceptance`, backup, release artifact, `.local`, `artifacts/pipeline`, nội dung/ảnh gốc và 46 thay đổi đang mở trước O1.
- Các script audit/content và S02–S16 có khả năng tái tạo bằng chứng lịch sử dù không thuộc menu vận hành mới.
- Không xóa theo tuổi file hoặc chỉ vì dung lượng lớn.

## Kiểm chứng

- `package.json` parse đạt; 77 npm script có 0 target script bị thiếu.
- Rà soát lần hai phát hiện 10 alias staging còn được tài liệu S15 lịch sử tham chiếu; đã khôi phục để không phá khả năng tái tạo bằng chứng.
- Tìm tham chiếu vận hành tới bốn file đã xóa trong toàn bộ workspace, gồm file untracked: 0; chỉ báo cáo O1 này còn ghi tên để lưu lịch sử cleanup.
- `node --check` toàn bộ 98 file JavaScript/MJS còn lại: 0 lỗi cú pháp.
- `npm run test:pipeline-ci -- --u2`: PASS 73 kiểm tra policy CI.
- `npm run test:pipeline-ci-cli -- --u2`: PASS 9 ca; 9 file payload và 50 bằng chứng R5 không đổi; cleanup đạt.
- `npm run test:fast`: lượt đầu dừng do sandbox không phân giải được `api.wordpress.org`; runner vẫn cleanup đạt. Chạy lại cùng lệnh với quyền mạng: PASS hai lần boot, homepage, login, REST API và database persistence.
- Sau kiểm thử: `tmpFiles=0`; fixture/cache của cả lượt lỗi và lượt đạt đã được dọn, dữ liệu/deliverable có sẵn được giữ.
- `git diff --check`: PASS.

## Kết luận

**PASS O1 trong phạm vi tối ưu quy trình local.** Không chạy full regression vì không đổi mã sản phẩm; không chứng nhận website mới, CI remote hoặc production. Không xóa các file chưa rõ vai trò, bằng chứng nghiệm thu, backup, database local hoặc artifact phát hành.
