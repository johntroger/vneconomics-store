# R7.20 — Gói importer → CI artifact → payload rehearsal

Ngày 29/10/2026. Phạm vi được tiếp tục: kiểm chính gói sáu file chứa importer R7.19 và phân phối vào một nhánh GitHub rehearsal riêng. Không merge, promote release-production, nhận inbox Plesk, provision key hoặc mở runtime production.

## Identity và gói

- Source CSS mẫu: `364e89f6b2a053c48937606ab6bba73200bfffcb`, vẫn chỉ rehearsal.
- Controller importer đã qua [PR #13/CI95 nhóm](https://github.com/johntroger/vneconomics-store/pull/13): `1f37575347a70a833b4920cf8fbbdf7a49312b50`.
- Parent production R6: `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`.
- Manifest SHA256: `35a1c8ca7bea39abe9858d6cb56d06900a8e546d3af7ad74b0ddbff25ff7326b`; receiver SHA256: `56686e78086a486b5b33de441f74c1c7c536f87802c4b50854e5abf6de965129`.
- Profile `vibelab-v2-r6-css-adapter-schema3`, đúng manifest/receiver và4 ZIP. Controller/manifest đổi so với R7.17; cả4 ZIP ứng dụng giữ nguyên byte. Capability vẫn `inspect-inbox`, `deployAuthorized: false`.

`r720-adapter-rehearsal.mjs` đóng băng source/controller, không nhận target/ref/key tùy ý. Kiểm chính sách, Git fixture và native test dùng cùng một gói; CI chỉ upload sau khi native đạt. Receipt ghi riêng source/controller/orchestrator/executor, yêu cầu CI checkout sạch, versioned và full tree khớp orchestrator. Artifact code chỉ6 file; public receipt riêng, không chứa private key/proof/journal/DB/config.

## Local

[Policy receipt](R720-importer-payload/local-policy.json) và [cleanup log](R720-importer-payload/local-policy.txt): PASS6 nhóm, gồm canonical bytes, controller/capability,4 ZIP không đổi, parent/allowlist Git và3 source/parent/profile sai bị từ chối. Local receipt ghi working/unversioned false, không coi là bằng chứng CI. Fixture/cache đã được dọn; artifact sản phẩm được giữ.

[Workflow contract](R720-importer-payload/workflow-test.txt): PASS;10 biến thể không an toàn bị chặn trên LF/CRLF. Workflow contents:read, không lưu credentials, không secret/hosting/push, parent R6 kiểm trước/sau, upload đúng6 file và receipt riêng. Native kiểm trên CI một lượt với chính package, không chạy lại native local234 giây đã PASS ở R7.19.

## Điểm dừng trước CI

Tại thời điểm commit hồ sơ này, CI/artifact/payload remote chưa hoàn tất. Kết quả thực tế sẽ bổ sung vào cùng báo cáo sau khi kiểm đúng orchestrator SHA, run/attempt, upload window, ZIP digest, canonical byte, native receipt và remote fetch/readback. Không suy commit SHA fixture từ local receipt thành payload đã publish.

R7.18 `77275aa` vẫn giữ để truy vết controller cũ. Dù rehearsal mới đạt, production vẫn R6; key/probe/import transport và quyền/runtime/flock/PHP/MariaDB thực tế của Plesk chưa được chứng nhận hoặc triển khai.
