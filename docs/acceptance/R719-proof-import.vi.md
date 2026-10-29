# R7.19 — Import health proof có kiểm chứng, local-only

Ngày 29/10/2026. PASS local 95 nhóm, cleanup đạt. Phạm vi: bổ sung bridge dữ liệu proof trong adapter/operator local sau R7.18. Tại gate local chưa commit/push/CI mới; chưa mở runtime production hoặc thay payload đã pin.

## Thay đổi

- Operator thêm `import-health`, chỉ nhận approval local-runtime và một envelope đóng gồm `body`/`signature`, có giới hạn kích thước. Proof đi qua JSON/base64 trong bootstrap cố định; không nhận đường file, PHP fragment hoặc key. Production và inspect-inbox vẫn chặn mọi mode ghi.
- Receiver kiểm chữ ký HMAC, đúng 13 trường observation, owner/source/controller/payload/manifest, challenge/phase, thời điểm và URL trước khi ghi. Health HTTP503 hợp lệ vẫn được lưu với `healthPassed: false`, để finalize thực hiện rollback theo giao thức cũ.
- Import dùng cùng mutex với finish/confirm/renew, đối chiếu journal/lock/baseline/file/data. Đích proof cố định theo owner ngoài webroot/inbox; từ chối symlink và owner không hợp lệ. Ghi file tạm exclusive rồi rename, dọn temp khi lỗi. Retry cùng proof trả `HEALTH_PROOF_ALREADY_IMPORTED`, không đổi journal/phase/challenge.
- Proof mới có thể thay proof đã ký của challenge trước sau renewal/rollback, nhưng không cho lùi thời điểm quan sát hoặc ghi đè proof có chữ ký/identity sai. Trường hợp dữ liệu cũ không hợp lệ dừng để inspect. Consumer vẫn kiểm lại proof khi finalize; import thành công không tự hoàn tất lượt triển khai.
- Luồng native thông thường chuyển từ `file_put_contents` của harness sang bootstrap importer. Ghi proof trực tiếp chỉ còn trong các ca cố ý giả mạo/conflict của fixture.

## Kiểm thử

Lệnh: `node scripts/run-clean.mjs script scripts/test-r6-css-adapter.mjs --native`.

Kết quả máy được giữ tại [native/module result](R719-proof-import/local-result.json), [log đầy đủ](R719-proof-import/local-test.txt) và [working-file hashes/cleanup](R719-proof-import/local-verification.json). PASS95 nhóm: 50 module/operator và45 runtime. Bao gồm chữ ký sai, challenge cũ, sai owner, stale time, trường thừa, mutex đang bận, atomic roundtrip/retry, update/renewal/rollback và consumer từ chối proof giả mạo. Runtime mất234 giây trên máy local; mốc preflight109 giây, hoàn tất update/health174 giây, rollback207 giây. Đây không phải SLA hosting.

Lượt đầu dừng vì Windows native mount không cho tạo symlink (`Operation not permitted`); cleanup sau lỗi đạt. Ca symlink/owner traversal đã chuyển sang PHP virtual filesystem và chạy đúng hàm path guard; mutex/atomic rename vẫn kiểm trên native filesystem. Không suy kết quả symlink ảo thành chứng nhận quyền Windows/Linux/Plesk.

Syntax các module JS thay đổi và `git diff --check` đạt. Không chạy full URL suite hoặc test lịch sử; không sửa themes/plugins/deploy hoặc DB/config thật. Native diagnostic unlock Windows nếu có được giữ nguyên trong log, không lọc.

## Giới hạn và bước tiếp theo

Bridge mới chỉ chạy trong fixture thuộc lượt kiểm thử. Chưa có key production, private control directory trên hosting, kênh probe/import production hoặc chứng nhận PHP/MariaDB/flock/quota thực tế. Không đưa fixture key lên Plesk hoặc vào Git.

Payload rehearsal [R7.18](https://github.com/johntroger/vneconomics-store/commit/77275aa58a282e80c0d94ebff7d9857041361f35) vẫn chứa controller `f7f0604`; thay đổi local này chưa nằm trong payload đó. Cần exact-source review/CI cho controller mới trước khi build gói mới. Không relabel biên nhận/artifact cũ hoặc dùng payload mẫu để triển khai production. Bước kế tiếp sau gate local là đóng gói source và kiểm CI đúng commit của importer; không phải promote/deploy.
