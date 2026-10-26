# S11 — Nhật ký kiểm thử và sửa lỗi

Ngày 22/10/2026. Không tính lần chạy chưa đủ/không đạt là nghiệm thu cuối.

1. Fixture backend35 đạt; UI kiểm nội dung FAQ bằng innerText khi details đang
   đóng nên không tính phần trả lời. Sửa phép đo textContent; giữ kiểm tra
   details mở bằng bàn phím. Cleanup lần thất bại đạt.
2. UI yêu cầu ?post_type=vne_report trả404 chưa đạt: WordPress có thể lọc bỏ
   post_type không publicly_queryable trước pre_get_posts, làm request rơi về
   trang thường. Chặn cả kiểu đã parse và kiểu chuỗi/array từ URL gốc; giữ
   kiểm tra không lộ mô tả/email cho URL trực tiếp/feed/API. Cleanup đạt.
3. Vòng tiếp theo đạt59 UI/HTTP +35 backend, bao gồm hai request cùng ticket
   đồng thời chỉ tạo1 row. Chưa lấy làm kết quả cuối vì rà soát phát hiện
   form POST lỗi đang cấp ticket mới khi render lại, không phù hợp retry an toàn
   cho lỗi sau insert.
4. Thêm reusable-ticket đã xác minh; quota giữ chỗ trước insert; capability
   riêng ở loại báo cáo. Bổ sung kiểm tra trước/sau insert và retry cùng
   signature, vai trò thường bị từ chối. Đang chạy lại trên mã runtime cố định.

Mọi test qua run-clean; chỉ fixture độc lập và dữ liệu QA. Không gửi thư thật,
không API trả phí, không hosting/deploy, không sửa database/config local thật.


5. Vòng mã cuối đạt61 UI/HTTP +37 backend, bao gồm lỗi sau insert/retry không trùng.
   Hồi quy S05 (69 dữ liệu/265 trạng thái/54 tổ hợp/50 phiên bản và UI/race/restart),
   S08 55/19, S10 55 +hai shell, S06 59 đều đạt. Postflight35 file theme/9 file PHP
   plugin khớp source, hash dữ liệu gốc giữ nguyên, không fixture/cache/lock/cổng test
   còn lại. Bằng chứng lịch sử và module thư viện cũ không đổi.
