# Sửa chốt CI trước merge PR1

Chủ dự án trả lời “ok” cho đề xuất sửa chốt CI và kiểm thử lại, sau đó chốt merge riêng ngày26/10/2026. Phạm vi: helper/kiểm thử/CI và hồ sơ; không đổi app/content/hosting, publish payload hoặc merge main.

Đã thêm validator chung `scripts/pipeline-ci-policy.mjs` cho publisher R5, publisher R4 lịch sử và verifier artifact. Kiểm workflow lookup/path/ID/repo/source/event, completed/success, đúng run_attempt/payload job, bốn bước bắt buộc đầy đủ/đúng thứ tự/thành công; đọc jobs theo attempt, phân trang jobs/artifact có giới hạn và từ chối dữ liệu thiếu/trùng. Artifact phải đúng tên/run/SHA/repo, có digest/dung lượng, chưa hết hạn và được tạo trong upload của lượt thành công. Đọc lại run để phát hiện rerun; publisher kiểm lại ngay trước update-ref/push. Receipt mới ghi provenance workflow/attempt/job/artifact; không relabel receipt cũ.

Local đã đạt73ca policy và9ca CLI thật: valid preview R4/R5 và verifier tới đúng biên download; workflow sai/skipped test/artifact cũ/missing upload bị chặn trước mutation/download. Metadata GitHub và approved-origin được mock trong CLI test (URL checkout CI có thể thiếu .git); Git mutation/network bị chặn. Tất cả9file payload và50evidence R5 giữ byte/hash, ref không đổi. [Policy tests](PR1-ci-gate-fix/policy-tests.json), [CLI tests](PR1-ci-gate-fix/cli-tests.json). Chạy qua run-clean, fixture/cache mới đã dọn.

Tái hiện lỗi cũ được giữ ở [review6964a4c](PR1-premerge-2026-10-26/review.vi.md). Script replay nay lấy chính publisher tại ref6964a4c từ Git, chỉ thay đường import sang thư viện local và mock API; không kỳ vọng mã mới còn lỗi. Lượt replay vẫn thấy workflow S14/không liên quan được bản cũ chấp nhận, đúng nguyên nhân đã báo; không gọi mạng/ref-write.

CI workflow bổ sung cả73ca policy và9ca CLI trước kiểm gói/S14/build/upload. Tên bốn bước core hiện hành được pin trong policy; test kiểm drift tên trong YAML. Các bước gate-test mới là kiểm hồi quy bổ sung; không sửa kết luận của các CI lịch sử đã thực sự kiểm đúng bốn bước core.

Trước kết luận sẵn sàng merge cần push source sửa, chờ CI đúng head đạt rồi dùng chính validator mới đọc metadata GitHub thật của run đó; lưu `PR1-ci-gate-fix/verified-ci-run-<runId>.json` và biên nhận readiness cuối local/PR. Kết quả phải gồm73+9 mới,218pipeline và75S14; artifact mới không được deploy. Source ứng dụng đang phát hành vẫn4266b71/payloaddc4af29. Main và ref payload phải giữ nguyên; merge commit trên head đã kiểm cần chủ dự án chốt riêng.

Giới hạn: đây là xác minh snapshot metadata CI và đọc lại trạng thái, không phải giao dịch nguyên tử giữa GitHub run/artifact và Git push. CI rerun/expiry/network error/metadata không rõ thì fail closed, inspect trước retry. Native/hosting UI không chạy lại vì byte app/receiver không đổi. Không bật scheduler/key/rules hoặc gọi AI/API tính phí. Giữ sản phẩm test/evidence và các thay đổi marketing ngoài phạm vi.
