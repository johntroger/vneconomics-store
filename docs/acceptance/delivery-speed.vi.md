# Tối ưu thời gian phát hành — 01/11/2026

Đo từ lượt khôi phục màu nút PR26/27, không dùng ước lượng cho số liệu cũ:

| Chặng | Thời gian job |
|---|---:|
| Fast CI ứng dụng41312496955 | 57giây |
| Package/native ứng dụng41312496963, chạy song song fast | 66giây |
| Promote41312750383 | 25giây |
| Closeout fast/native/package41312893561/41312893618/41312893525 | 63/62/78giây, chạy song song |

Closeout chỉ đổi pin baseline/quy tắc nhưng vẫn cài npm và dựng WordPress kiểm native lại. Tổng thời gian ba job203giây, critical job78giây. Ngoài ra, khoảng từ package CI hoàn tất13:42:54UTC đến promote bắt đầu13:45:04UTC là130giây, gồm xác minh/publish candidate và điều phối agent; không được quy toàn bộ khoảng này cho hosting. Đây là dữ liệu GitHub của lượt đã chạy, chưa phải cam kết tốc độ cho mọi release.

## Thay đổi đã triển khai

PR28 thêm phân loại metadata cho ba workflow. Nếu chỉ thay baseline, AGENTS hoặc Markdown: xác minh remote production ref, manifest SHA256, closed allowlist năm file và hash từng blob, mã theme/plugin ở source không lệch ứng dụng đã phát hành. Sau đó không cài npm/chạy lại application/native suite hoặc tạo artifact ứng dụng. Thay code ứng dụng, công cụ, workflow, dependencies, diff hỗn hợp hoặc workflow_dispatch vẫn đi full checks. Ref/hash/tree/blob/source sai làm job FAIL, không tự chuyển thành PASS.

Thay đổi này không sửa website, bộ cài, quyền token, post-action hoặc webhook. Unit guard và workflow contract local PASS, cleanup PASS; PR28 phải full CI vì có thay công cụ/workflow. Không tạo ứng dụng giả/canary hoặc release mới để đo.

## Vận hành tiếp theo

CI ứng dụng chạy một lần cho exact source; sau PASS, xác minh candidate → merge → promote nối tiếp, không đọc lại bộ hồ sơ lịch sử giữa các lệnh. Dùng một watch kết quả thay cho hỏi trạng thái nhiều lần. Hậu kiểm HTTP homepage/CSS và smoke phù hợp; chủ dự án tự xem phần nhìn. Không browser/chụp ảnh hoặc đăng nhập Plesk thường kỳ. Chỉ closeout baseline sau hậu kiểm đạt, dùng nhánh metadata nhẹ; không đánh đồng job PASS với private journal/DB production nếu chưa đọc chúng.

## Kết quả đo đường nhẹ

PR28 đã merge sau full fast/native/package CI41314327588/41314327611/41314327659 SUCCESS. PR29 là báo cáo tài liệu thật, không phải ứng dụng canary: [metadata CI41314594084](https://github.com/johntroger/vneconomics-store/actions/runs/41314594084) SUCCESS trong **24giây**, so với fast closeout cũ63giây, giảm khoảng**62%**. Job xác minh metadata đạt rồi skip npm install và các application/policy suite không bị tác động. Đây là đo fast job cho PR tài liệu; chưa đo critical path của cả ba job baseline-only hoặc toàn chuỗi release sau tối ưu, không tuyên bố mọi lần phát hành chỉ còn24giây.
