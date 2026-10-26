# Claude Code — thử sửa tiêu đề và khôi phục

Ngày 25/10/2026. Trong quyền thử cả hai công cụ bằng hạn mức sẵn có, đã kiểm tra hai file trong thư mục được chuẩn bị cho Claude Code. Chủ sau đó xác nhận trực tiếp “Claude đã đổi tiêu đề”. Không tự gọi AI/API từ runner.

- Đầu ra trong thư mục Claude ban đầu đạt 40/40 kiểm tra tại 1280/390/320px; mã gốc và kết quả giữ ở claude-first-check/.
- Đã tạo checkpoint-v1 sau đối chiếu hash, không sửa trang hiện tại.
- Sau chủ nhờ Claude Code đổi h1, đối chiếu byte cho thấy chỉ chuỗi tiêu đề thay đổi; CSS và checkpoint giữ nguyên. Đầu ra mới đạt 40/40 kiểm tra. Giữ bản sửa tại claude-title-edit/edited-source/.
- Codex chạy nguyên khối PowerShell khôi phục của bài trong đúng thư mục: 15 điểm guard/readback đạt, hai file hiện tại khớp byte bản mốc, checkpoint không đổi.
- Hậu kiểm trang sau khôi phục đạt 40/40 điểm; tiêu đề cũ hiển thị đúng, CTA và layout giữ nguyên. Hồ sơ claude-restored/.

Không request ngoài, lỗi JavaScript, tràn ngang hoặc thành phần ngoài đề bài trong các lượt browser. Fixture/cache đã dọn qua run-clean. Bản mốc thật, mã đầu ra và bằng chứng cần giữ.

HTML bản mốc SHA-256 `9a1b6fa9f47d052ba7ee39fb135c89ad66863a04bccc7db0faece0c4232b62ee`, CSS `359e49a176a2105c6a0d93fdb39934841e4fcd4e27e9a45ee56f8fa1cb265b0c`. Các hash bản đã sửa nằm trong restoration.json, không ghi đè bằng chứng bản đầu.

Phạm vi: chủ thao tác Claude Code đổi tiêu đề; Codex kiểm đầu ra, tạo bản mốc và thực hiện khôi phục. Chưa ghi phiên bản ứng dụng/model/review mode; chưa chứng nhận cài mới hoặc đăng nhập mới, không dùng sự có mặt của file làm bằng chứng đã quan sát phiên tạo mã. Chưa xuất bản bài hoặc ghi validation lên WordPress. Hiện trang mẫu đã trở về tiêu đề ban đầu.
