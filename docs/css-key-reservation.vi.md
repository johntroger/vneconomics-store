# Reservation key — metadata bền qua PHP process restart

Profile `vibelab-v2-r6-css-production-key-reservation-schema3` có package sáu file, application ZIP giữ nguyên, deployAuthorized false. Kế thừa observation chỉ đọc và thêm capability `key-reservation`; không có css-runtime, ghi key hoặc activation. [Builder package](../scripts/release-r6-css-adapter.mjs) cung cấp `prepareProductionKeyReservationAdapter`; [operator](../scripts/r6-css-key-reservation.mjs) tạo command đã pin, không tự thực thi.

Intent có đúng sáu trường công khai: protocol `r6-css-key-reservation-intent-v1`, target cố định, operationId32hex, kind initial/rotation, expectedActiveFingerprint và candidateFingerprint64hex. Không có key, path, challenge hoặc expiresAt. Initial yêu cầu active fingerprint null và server chưa có active key; rotation yêu cầu fingerprint active khớp và khác candidate. Intent được canonical hóa để thứ tự JSON không tạo xung đột giả. ID/fingerprint có newline bị từ chối trước tạo command.

Approval gồm schema inspection-context đã pin và `reservationWriteApproved`: true cho reserve/release, false cho inspect. Bootstrap kiểm canonical path/controller/manifest trước include; dispatcher kiểm toàn package/ref/profile/context/capability/control metadata và active-key baseline trước, dưới mutex và trước ghi. Control phải tồn tại với owner/mode đúng; không tự tạo control hoặc key.

| Mode | Hành vi |
|---|---|
| reserve | Lấy mutex bền, không nhận lock/journal cũ khác identity. Ghi receiver.lock rồi journal thuộc operation; retry cùng intent trả ALREADY_HELD, không viết lại |
| inspect | Không tạo mutex khi chưa có. Đọc và xác minh cặp metadata; chỉ trả ABSENT khi file thật sự không tồn tại. JSON null/scalar, thiếu một file hoặc identity khác đều dừng |
| release | Chỉ cho cùng intent/binding và active baseline; activation.json tồn tại thì giữ reservation để inspect. Ghi journal RELEASED trước, sau đó dọn đúng logical lock; retry terminal idempotent, không tái dùng operationId |

Reservation không tự hết hạn hoặc bị xóa theo tuổi file. Nó tồn tại đến release rõ ràng; nếu operator mất phiên/receipt phải inspect, không phá lock. Challenge possession là request khác, có TTL tối đa60 giây và chỉ tạo sau upload. Việc giữ reservation không tự cho phép transport/provision/activation. Kết quả reservation giữ `candidateVerified:false`, `activationAuthorized:false`, `keyWriteRequested:false`; observation vẫn không chứng nhận server origin/reservation chỉ nhờ HMAC.

Journal và logical receiver.lock dùng cùng namespace operation với runtime website; `runtime-mutex.lock` là mutex inode bền dùng chung, không unlink. [Shared private store](../release-tools/r6-css-adapter.php) được tách thành core không phụ thuộc active key để hỗ trợ initial metadata. Wrapper `vne_adapter_css_private_store` vẫn yêu cầu active key/storage như trước; runtime ứng dụng không được bỏ guard này. Metadata writes dùng create exclusive/CAS/atomic rename và chỉ diễn ra dưới mutex. Reservation giữ logical lock chặn deployment ứng dụng; application đang giữ lock chặn reservation. Không khóa mọi writer nội dung WordPress.

Test qua `npm run test:css-dispatcher-native`, sau đó `npm run test:css-private-store` và regression inspector/operator khi sửa shared core/profile. Harness có ba package/ref synthetic trên cùng WordPress/MariaDB; seed/stash/corrupt/restore metadata chỉ là helper fixture, không phải recovery production. Hai ca SIGKILL reservation xảy ra sau khi ghi metadata xong nhưng trước receipt; incomplete/null pairs được fault-inject riêng và phải giữ nguyên khi bị từ chối. Không chứng nhận crash giữa từng lần ghi, mất container/DB/power loss hoặc fsync durability.

Chỉ CI đúng source SHA với đủ25 nhóm tích hợp và18 nhóm core chứng nhận phần reservation này; kết quả17 nhóm của source cũ không bao gồm reservation. Chưa key upload thật, key writer/activation/coordinator hai phía hoặc hosting; mọi command ghi hosting vẫn cần gate riêng theo exact source/CI/payload/baseline. Release chỉ dọn logical lock của đúng lượt; journal, candidate, backup và bằng chứng thật được giữ.
