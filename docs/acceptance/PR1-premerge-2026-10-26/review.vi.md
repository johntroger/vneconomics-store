# Rà soát PR1 trước merge

> Snapshot review tại6964a4c. Chủ dự án đã duyệt sửa chốt CI sau bản review; kết quả bước sửa theo dõi riêng ở [hồ sơ sửa](../PR1-ci-gate-fix.vi.md), không xóa phát hiện/bằng chứng trước sửa.

Phạm vi người dùng chọn: rà soát PR1, chuẩn bị merge main; chưa cho phép merge hoặc thay chốt phát hành. Head được rà soát `6964a4c345112f5088af1d9eae79f5a2c067d47f`, base main bắt đầu `6cd895f`. GitHub báo MERGEABLE/CLEAN, PR Draft, CI40316989403 SUCCESS. Diff1608file:1388docs,102scripts,39theme,11plugin,7deploy và các artifact/prototype/config khác; không coi CI xanh là đã review mọi dòng/evidence.

## Kết luận: đề nghị sửa một lỗi trước merge

**[P2] Publisher không xác định workflow CI bắt buộc.** `scripts/publish-r5-payload.mjs:15` chỉ kiểm head_sha và conclusion success của runId do người vận hành truyền vào. Repo có workflow hợp lệ khác `release-package-check.yml`, chỉ kiểm ref S14 lịch sử594ccd9; run workflow đó trên source hiện tại vẫn có head_sha hiện tại nhưng không kiểm ứng viên hiện tại. Run này được publisher chấp nhận là CI đạt. Cùng mẫu nằm trong helper lịch sử R4 `publish-staging-payload.mjs:16`. Cần pin đúng workflow pipeline và kiểm các job/step/artifact bắt buộc, thay vì chấp nhận mọi workflow có kết luận success. Verifier artifact cũng nên dùng cùng quy tắc CI để tránh hai định nghĩa “CI đạt”.

Đã tái hiện bằng **CLI publisher thật và candidate tái dựng từ Git blob của head**, mock duy nhất phản hồi gh API. Control workflow pipeline success được nhận; pipeline failure bị từ chối; workflow S14 lịch sử success và workflow không liên quan success đều được nhận, trả PREVIEW_ONLY_NO_REFS_CHANGED. Đường --publish dùng chính chốt này trước mutation; không có kiểm workflow bổ sung. Không chạy --publish trong ca tái hiện, không dispatch Actions, không gọi mạng/hosting/DB/AI/mail; preload chặn Git mutation/network. Ref trước/sau giống nhau. [Kết quả](ci-gate-reproduction.json), mã tái hiện `scripts/review-pr1-ci-gate.mjs`, chạy qua run-clean; fixture/cache của lượt đã dọn.

Đây là thiếu sót của guard cho các lượt phát hành tiếp, không làm đổi sự thật R5/R6 đã dùng đúng workflow pipeline và CI thực sự đạt. Không có cơ sở rollback production chỉ từ phát hiện này.

## Chuẩn bị merge sau sửa

1. Duyệt bước sửa chốt CI, bổ sung test correct/wrong workflow, failure/cancelled/skipped, thiếu job/step/artifact, SHA lệch; dùng chung validator cho các helper có cùng nhiệm vụ. Không đổi app/content/hosting hoặc ref payload.
2. Kiểm local/cleanup, push đúng source mới và chờ CI của đúng workflow đạt; đối chiếu lại diff/head/base/mergeability. Hồ sơ R5 và9byte payload phải tiếp tục giữ nguyên.
3. Chốt riêng quyền merge trên head đã sửa và CI đạt. Đề xuất **merge commit**, không squash/rebase, để giữ lịch sử53commit chứa ref S14/rollback/source đã ghi trong receipt. GitHub cho phép cả3phương thức, auto-delete branch hiện false; main hiện là ancestor của head nên tree merge hiện tại khớp head.
4. Merge chỉ đồng bộ source, không publish payload/cài hosting. Giữ release-staging/release-production ở dc4af29 và release lịch sử4fe952a; chưa bật auto-deploy, đổi key/rules hoặc automation. Không xóa branch/ref lịch sử trong bước chuẩn bị này.

## Giới hạn rà soát

Đã phân loại toàn diff và kiểm có trọng tâm workflow CI, publisher/receiver/guard private target, component allowlist/hash, journal/idempotency, quyền REST/approved snapshot, transaction/lock/cache và các tuyến render/search/report. Đối chiếu hồ sơ R5/R6 và CI, không chạy lại native/hosting cho app byte không đổi; không nghiên cứu lại upstream100bài hoặc kiểm trực quan toàn bộ ảnh/binary1388tài liệu. Scan chữ ký token/private-key chỉ trả tên file, không thấy chữ ký khớp trong phạm vi đã quét; đây không phải chứng nhận không có bí mật/PII mọi định dạng. Những thay đổi marketing ngoài phạm vi giữ nguyên. Chưa sửa mã phát hành, đổi PR khỏi Draft, commit/push bài review hoặc merge main.
