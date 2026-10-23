# S15 — Chuẩn bị và quyền truy cập staging

Ngày 23/10/2026. **CHỜ THÔNG TIN/TRUY CẬP — chưa nghiệm thu S15.** Chủ dự án đã cho phép bằng yêu cầu “bắt đầu S15”; không chờ duyệt lại bước này. Phạm vi tại [hợp đồng S15](../S15-staging-contract.vi.md).

## Đã kiểm tra

- Hồ sơ Plesk/setup hiện chỉ xác nhận triển khai file `connection-v2` vào `store.vneconomics.com/codex-deploy-check` trên nhánh release ngày 17/10; chưa có URL/document root/database staging được ghi nhận.
- Inventory trình duyệt hiện chỉ trả tab `http://127.0.0.1:9430/` và không có phiên Plesk để sử dụng. Không suy rằng người dùng không có Plesk ở nơi khác.
- Đã tìm kết nối Plesk/hosting/SSH/SFTP qua Plugin Management; kết quả chưa có kết nối phù hợp cho hosting hiện tại. Không cài hoặc chuyển sang nhà cung cấp khác.
- CLI hiện tại chưa lấy được metadata webhook GitHub đã lưu để xác định origin Plesk. Không in URL webhook/token, không thay webhook/ref. Không suy lỗi đọc này thành trạng thái hoặc quyền Plesk.
- Đọc lại hash hai ZIP S14 bằng SHA256: khớp manifest/ref `594ccd9a7de812a49f2c0d8260d20cbfced71752`; plugin 0.4.2 và theme 0.7.0 vẫn sẵn sàng. Đây là kiểm tra artifact local, không phải kiểm thử staging.

## Chưa chạy

Khảo sát PHP/MySQL/extensions/quota/cache thật; backup/restore; tạo hoặc xác minh staging; deploy/kích hoạt/migration plugin/theme; smoke/tích hợp/quyền/khóa/trạng thái/cache trên hosting; lỗi/timeout/restore từng gói. Tất cả **CHƯA KIỂM THỬ**, không ghi PASS từ bằng chứng local.

## Đầu vào đang chờ

Đã hỏi chủ dự án URL quản trị Plesk và URL staging nếu có; nếu chưa có, xác nhận “chưa tạo”. Không yêu cầu mật khẩu/API key qua chat. Sau khi có đích và cách truy cập, tiếp tục chính S15 đã được phép, xác định tách biệt production và backup trước thay đổi.

## Bảo toàn và cleanup

Lượt chuẩn bị chỉ đọc hồ sơ/inventory/hash và viết tài liệu này, chưa tạo fixture/cache kiểm thử, chưa sửa file/database hosting, chưa upload hoặc gọi API có phí. Giữ nguyên ZIP/manifest, database local, nguồn và bằng chứng S13/S14. Preview S13 đang chạy được giữ; cache của tiến trình đang hoạt động sẽ dọn khi dừng. Không có deploy hoặc thay production.

Không chuyển S16. Kết quả S15 vẫn chờ quyền thực tế/đích staging theo kế hoạch gated; không coi phần chuẩn bị là hoàn thành S15.
