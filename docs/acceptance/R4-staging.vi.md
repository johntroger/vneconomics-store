# R4 — GitHub → Plesk staging

Ngày26/10/2026. Quyền: chủ dự án duyệt riêng R4, sau đó yêu cầu tiếp tục. Chỉ staging domain319; không thay production hoặc kết nối release lịch sử. Gate đang hoàn thiện lượt tiếp nhận baseline bằng receipt riêng; chưa chuyển R5.

## Đường nhận gói đã kiểm chứng

- Source đầu `ebc6deb69f86364c4064de4c6eac2192f16906c8`, [CI40270538594](https://github.com/johntroger/vneconomics-store/actions/runs/40270538594) PASS218 kiểm pipeline+75 S14. Gói Actions/local khớp11/11tệp; chỉ environments.json khác R2, mã ứng dụng/receiver/nội dung giữ byte.
- Payload đầu `f9860e94cf6129f17fe4786d64621f71f7ecec9c`, nhánh `release-staging`, manifestSHA256 `d7340aa43fa28f0a60a6fecea37b2e817e442b16e320eb19e16d19ebce688437`. Git không cho tạo release/staging vì release hiện hữu; đã đổi sang tên phẳng, kiểm local/CI lại, không xóa/đổi release. Lượt lỗi namespace xảy ra trước push và được giữ biên nhận.
- Repository Plesk staging `vneconomics-store-staging.git`, private Git `/var/www/vhosts/vneconomics.com/git/vneconomics-store-staging.git`; Manual, không post-deploy actions; dùng lại Default key đọc sẵn có, không thêm quyền GitHub/webhook.
- Private inbox `/var/www/vhosts/vneconomics.com/deploy-inbox/staging`, realpath đã xác thực, quyền0700, nằm ngoài document root. Plesk pull/chọn release-staging/Deploy now chỉ xuất10 tệp vào inbox. [Biên nhận](R4-staging/plesk-private-received.json): commit/source/manifest đúng,0 hash lệch, không file thừa. Không upload ZIP hoặc helper local lên hosting.
- Trước đó tự động duyệt browser bị từ chối vì hạn mức. Không dùng UI/shell khác để né chặn. Sau khi trạng thái usage báo ordinaryUsageAllowed:true, khôi phục cùng IAB/Plesk SSO và thao tác lại thành công. Không mua hạn mức/reset credit.

## Bằng chứng ứng dụng và dữ liệu

Backup staging trước thay đổi `staging-store.vneconomics.com__2026-10-26T11_21_11+0700.zip`:81.378.232byte, SHA256 `4b6725f57f383ece92b1c7003cbdb09d494fc9f17e2b61fee3b76c1f5d531066`, ZipArchive CHECKCONS đạt,14.409file CRC không lỗi; backup thật và bản cũ giữ nguyên. Không phục hồi DB.

Inspect ban đầu xác nhận theme0.7.1/36file PREVIOUS_MATCH, plugin0.4.2/10file MATCH. Native WP-CLI cài theme.zip0.7.2 từ inbox GitHub, kiểm38/10file MATCH; quay lui bằng rollback.zip0.7.1 đã pin hash,36file và fingerprint baseline trở lại chính xác. HTTP sau rollback57 kiểm/21request đạt, gồm14URL cũ. Sau đó cài lại0.7.2; không cài lại plugin/schema.

Hai guard thật trên staging từ chối sai môi trường production và sai payloadSHA trước ghi; fingerprint trước/sau giữ nguyên. Tài khoản reviewer ID1 có sẵn được dùng qua --user, không tự nâng quyền.

Receiver từ GitHub nhập102 mục thiếu và kiểm bài Codex hiện hữu:100 tài nguyên,2 hướng dẫn, CodexID114. Journal mới complete,103 natural key; số lượng106 tài nguyên/6 hướng dẫn/1 thực hành,130typedrows. ClaudeID221, AntigravityID222; cả3guide commandsAllowed:true, mỗi guide1 validation trong readback thực tế. Không nhập validation QA hay chạy AI mới. Retry giữ đúng103ID và fingerprint toàn bộ post/meta/runtime `22e86a5a80e471fef39fa0bb267059a4a708c358260c59587d02f4eb92ff562d`.

Giữ28 hàng gốc và metadata, chỉ cho phép nối validation Codex114 theo journal. SHA post gốc `301c10b5d1a4b7fe9a6ffe7db2cc2bdb4cd7de45a6b40246b016039faf699456`; meta trừ đúng validation Codex `59a9c2ad64b93984ac03e8d27b52fe4a2a0aa602718e6cda6913af25a7a3ec4f`. Snapshot/inspect/guards/journal đầy đủ trong thư mục R4-staging.

## Kiểm giao diện và HTTP

- Trước thay đổi57 kiểm/21GET; sau nhập650 kiểm/145GET đạt:106 trang tài nguyên,12 trang catalog,3 hướng dẫn và3 report bằng chứng đúng hash, search, noindex, API công khai/guard private-user,14URL cũ và private inbox không lộ qua URL site. Chỉ HTTPS GET cùng origin, không gửi báo lỗi/giao dịch/email. Lượt test đầu gom nhầm link feed vào số tài nguyên; đã giới hạn selector vào resource card, giữ bằng chứng lỗi và chạy lại đạt; không sửa website để né test.
- Cả3guide kiểm copy thật sau sentinel, clipboard khớp nội dung, checklist giữ qua reload và hoàn nguyên dấu ban đầu. Lượt đọc clipboard quá sớm được khắc phục bằng chờ trạng thái UI; không thay code sản phẩm, không thực thi nội dung vừa copy.
- Homepage/hub/catalog ở390 và320px:6case không tràn ngang,3 thẻ công cụ ở homepage/hub. Viewport đã reset. Lưu ảnh thực tế và browser-ui/responsive-ui.json.

## Lượt tiếp nhận baseline tiếp theo

Tạo candidate chỉ đổi source/manifest do commit hồ sơ và bộ kiểm; app/receiver/config/nội dung giữ byte. Đưa candidate đó qua CI → GitHub payload → Plesk private inbox rồi adopt vào **receipt mới** trên MariaDB. Giữ journal nhập đầu dưới nhãn APPLIED_MISSING_CONTENT; không sửa nhãn nó để giả thành tiếp nhận baseline. Kiểm toàn bộ posts/meta/runtime, validation, option ngoài receipt và retry; hoàn tất mới kết luận R4 PASS.

Các báo cáo và gói ứng viên là sản phẩm cần giữ. Mọi runner local qua run-clean; không xóa DB/config, nguồn, backup thật hoặc marketing ngoài phạm vi. Không bật automation, gửi email, gọi API AI tính phí hoặc thay production.

R5 cần duyệt riêng với source/payload/config production cụ thể. Production trong payload hiện vẫn disabled/null; tên release/production cũng xung đột tiền tố release nên dự kiến dùng release-production ở R5. Không coi gói staging hiện tại đã được cho phép ghi production. Nếu config production thay manifest thì phải đối chiếu ứng viên mới và kiểm tiếp nhận trên staging trước khi ghi production.
