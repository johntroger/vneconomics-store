# R7.11 — Receiver CSS local/CI

Đã tạo prototype receiver fixture với kiểm package/hash/baseline, khóa độc quyền, journal, native theme update, HTTP health và rollback theme. Không đổi code ứng dụng hoặc production.

- [Kiểm thử local](R711-receiver/test-run-4.json): PASS 28 nhóm; bảo toàn dữ liệu/options, giữ edit/lock khi xung đột, private HTTP 404; cleanup PASS.
- [Workflow contract](R711-receiver/workflow-test.json): PASS, gồm bốn biến thể workflow receiver không an toàn bị từ chối; cleanup PASS.
- [Hợp đồng và giới hạn](../rebuild/R711-css-receiver.vi.md): fixture-only; transport và adapter Plesk chưa triển khai.

Các lượt thử đầu phát hiện bootstrap bật cờ installing quá sớm khiến plugin chưa được nạp. Đã sửa bootstrap, giữ nguyên guard và chạy lại đạt. Chỉ bằng chứng lượt đạt được đóng gói trong PR; log thử lỗi giữ tại local.

CI GitHub sẽ được ghi sau khi có kết quả trên exact source commit. PASS local không phải chứng nhận receiver production hoặc quyền bật automation.
