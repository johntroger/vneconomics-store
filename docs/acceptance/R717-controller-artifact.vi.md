# R7.17 — Artifact controller sáu file qua CI, chỉ rehearsal

Phạm vi: build và native test gói sáu file thực tế, xuất artifact GitHub và tải lại để đối chiếu. Không publish payload branch, đổi release-production, nhận vào Plesk, merge main hoặc phát hành CSS mẫu.

## Nguồn và định danh

- CSS mẫu R7.9: `364e89f6b2a053c48937606ab6bba73200bfffcb`; chỉ rehearsal, không phải CSS được duyệt production.
- Controller R7.16: `f7f060466cd57457ed7adc1c165b8c035ed11ff2`; lấy receiver.php từ Git blob, không từ working file.
- Baseline/parent vẫn R6 `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`; manifest gói sáu file SHA256 `ed926b0d17bde7cc87bd3ad207b359aa7592d094323627000c1a498c46e75789`.
- SHA công cụ orchestrator và SHA checkout executor được ghi riêng. CI yêu cầu checkout sạch và tree giống exact orchestrator source; local chưa commit được đánh dấu working/versioned false, không coi là bằng chứng CI.

## Đường gói

`r717-adapter-candidate.mjs` chỉ build source/controller đã đóng băng, không nhận ref/path/key tùy ý. Sáu file là manifest.json, receiver.php và bốn ZIP. Build lặp chỉ nhận gói đã có nếu byte còn khớp; receipt immutable theo executor/source, native proof có run UUID riêng.

Workflow rehearsal read-only chạy theo đường dẫn riêng, kiểm parent production trước/sau native. Artifact `r717-six-file-rehearsal` chỉ upload sáu file; artifact `r717-rehearsal-proofs` tách receipt/test. Không có credentials ghi Git, secrets hosting, post-action, scheduler hoặc quyền deploy. Native test dùng chính byte của gói này và Git payload fixture sáu file, không chỉ chạy lại controller trên một source khác.

`verify-r717-artifact.mjs` kiểm exact run/source/repository/workflow/attempt, job/bước bắt buộc, artifact IDs/digest/expiry/upload window. Tải ZIP để kiểm digest container, đối chiếu member với canonical Git build, kiểm receipt/native proof và executor merge tree, rồi đọc lại run/artifact chống đổi lượt. Mọi download ở tmp/tests qua run-clean; không thực thi code từ download và không gửi sang hosting.

## Ranh giới key/proof/journal

- Git/payload chỉ mang code sáu file và manifest công khai. Private key, signed health proof đang dùng, journal, DB, wp-config và backup không thuộc artifact.
- Runtime control phải bền vững ngoài webroot **và ngoài Git inbox**, để Pull/Deploy không xóa key/journal/proof. Đích/quyền/owner thực tế chưa pin hoặc tạo trên Plesk ở bước này.
- Không đưa key HMAC của fixture lên server. Kênh provision key/trust anchor production chưa triển khai; không truyền key qua chat, log hoặc artifact. Cần chốt riêng sau capability/approval hosting.
- Proof là operational JSON, không phải mã PHP hoặc bài viết. Trước một lần ghi proof private phải kiểm chữ ký/owner/pins/challenge đang chờ và dùng thay thế atomic; consumer kiểm lại trước finalize. Chưa có bridge/importer production thực hiện việc này, không dùng File Manager upload mã ứng dụng từ local để thay đường Git.

## Kết quả và điểm dừng

[Local package policy](R717-controller-artifact/local-policy.json): PASS6 nhóm, gồm exact6 byte/canonical, source/controller riêng, temporary Git tree/parent và từ chối3 pin/profile sai; cleanup PASS. [Workflow contract](R717-controller-artifact/workflow-test.json): PASS, gồm5 biến thể artifact workflow không an toàn bị từ chối. Local tạo gói để review, chưa coi là payload GitHub hoặc gói Plesk đã nhận.

Native/CI/artifact readback còn chờ; chưa đóng gate trước khi đủ bằng chứng source cuối. Inbox production hiện tại vẫn năm file R6. Artifact rehearsal chưa thay được bước tạo/duyệt payload Git, kiểm controller/key/proof transport, capability/flock/PHP/MariaDB hosting và quyền production riêng.
