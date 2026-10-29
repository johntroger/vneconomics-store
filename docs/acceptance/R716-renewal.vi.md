# R7.16 — Gia hạn challenge có ràng buộc tại local

Tiếp nối [R7.15](R715-operator.vi.md), bổ sung `renew-health` cho adapter runtime **chỉ trong fixture local**. Không chạy lệnh trên Plesk, đổi payload/ref, merge main hoặc mở runtime production.

## Hợp đồng

- Request gia hạn giữ nguyên approval/pins và thêm `expectedChallenge` đúng64hex. Mode này chỉ được bộ sinh bootstrap chấp nhận cho local-runtime; public inspect entry và production vẫn từ chối. Không nhận đường dẫn, phase hoặc baseline mới từ người gọi.
- Chỉ gia hạn trong AWAIT_HEALTH hoặc ROLLBACK_AWAIT_HEALTH, sau khi đối chiếu owner/source/controller/payload/manifest/baseline với journal/lock và kiểm file/data hiện tại. Có maintenance, conflict, pin khác hoặc phase đã đóng thì không tự khắc phục, cài lại hoặc restore DB.
- Gia hạn thay nonce, giữ nguyên phase/baseline và ghi audit gồm sequence, phase, hash nonce cũ/mới và timestamps. TTL mỗi challenge vẫn120 giây; tối đa2 lần mỗi phase,4 lần toàn lượt, trong cửa sổ900 giây từ createdAt đã gắn với logical lock. Đây là policy fixture cần review/đo lại cho hosting, không phải SLA.
- Retry cùng challenge cũ chỉ trả ALREADY_RENEWED khi còn khớp lần gia hạn cuối và trạng thái vẫn hợp lệ; không đổi expiry hoặc thêm audit. Request cũ hơn/không liên quan bị từ chối. Proof trước gia hạn không thể đóng lượt; cần probe mới cho nonce mới.
- `finish`, `confirm-rollback`, `renew-health` dùng advisory flock trên lock hiện có để tuần tự hóa writer của controller. Không tạo hoặc tự expire mutex file khác. Vẫn giữ logical owner lock khi có lỗi; thao tác bận phải inspect trước retry.
- Journal mới có createdAt/healthLease version1 và renewalHistory. Clock của journal phải khớp logical lock. Không thêm field, relabel hoặc nâng cấp journal lịch sử để vượt guard; controller/source pin cũ và các biên nhận cũ được giữ.

## Kiểm chứng

[Module local cuối](R716-renewal/module-test-3.json): PASS47 nhóm, gồm public entry chặn renew-health, bootstrap yêu cầu expected challenge, mode production bị chặn và control storage trên filesystem thật kiểm mutex/atomic JSON roundtrip. Cleanup PASS; [lượt chẩn đoán storage](R716-renewal/module-test-2.json) và [lượt module đầu](R716-renewal/module-test-1.json) giữ nguyên.

Control của native fixture được mount riêng vào thư mục tmp/tests bên ngoài WordPress root; helper startSite mặc định vẫn không thêm mount. Ca bận đầu tiên trên memory filesystem cùng process chưa mô phỏng được contention; chuyển sang filesystem thật để kiểm descriptor. Trên Windows, đọc JSON qua descriptor khác khi giữ byte-range lock dẫn tới lỗi; controller đã dùng chính descriptor giữ lock và đối chiếu inode/device để kiểm owner, không bỏ guard JSON hoặc mutex. Còn phải kiểm môi trường flock thực tế ở Plesk trước runtime production.

[Native local](R716-renewal/native-test-3.json): PASS89 nhóm gồm47 module và42 runtime, đoạn runtime303 giây. Bao phủ expiry, đổi nonce/proof mới, retry, stale/owner/payload, budget/window, rollback health phase, mutex bận và data/file conflict. Test chỉ sửa timestamps của journal/lock trong fixture sở hữu để mô phỏng thời gian đã trôi; không chờ120 giây và không áp dụng cách đó lên dữ liệu thật. Các ca fault/reset giữ trong harness riêng; entry operator bình thường không có chức năng sửa clock/audit.

Lượt native có diagnostic unlock từ PHP-WASM/Windows dù các lần lấy mutex tiếp theo và cleanup đều đạt; log được giữ nguyên. Sau đó bỏ LOCK_EX dư thừa trên temp journal duy nhất, dùng exclusive-create/write/close/rename; module được kiểm lại. CI native sẽ kiểm source cuối; không bỏ mutex của logical owner hoặc lọc cảnh báo để tạo kết quả PASS giả. Cảnh báo thư viện nếu còn sẽ được ghi rõ cùng giới hạn hosting.

Chưa đóng gate cho tới khi native/CI/cleanup đạt trên exact commit. Chưa có key/proof transport production, controller sáu file nhận ở Plesk hoặc chứng nhận flock/quota/PHP/MariaDB trên hosting. Không dùng PASS local để tự mở các phần này.
