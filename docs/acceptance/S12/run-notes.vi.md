# Ghi chú chạy S12 — 22/10/2026

- Lượt đầu: 208 kiểm tra PASS; fixture/cache dọn qua run-clean.
- Rà soát bổ sung taxonomy, khôi phục lịch sử trang và CAS incident: lượt hai 223 kiểm tra PASS.
- Các lượt trên chưa phải bằng chứng cuối vì tiếp tục bổ sung fallback 503 khi object cache/purge lỗi. Bộ cuối và hồi quy phải khớp source cuối mới nghiệm thu.
- Phạm vi A chọn bypass HTML/API thay vì thêm nền tảng page cache. Kiểm thử cache chia sẻ chỉ là mô phỏng tuân thủ Cache-Control; không cấu hình/gọi cache hosting.
- Safety switch đọc DB trực tiếp để không phụ thuộc object cache có thể lỗi. Khi có incident, chặn public; admin/preview riêng vẫn phục vụ xử lý. Không tự xóa incident vì lần ghi mới thành công.
- Không có lần gọi API AI, email, automation, deploy hay thay đổi main/release.

- Lượt ba: 222 kiểm tra S12 + hồi quy S05 (69/265/54/50, UI/concurrent/restart) + S11 (61/37) PASS, cleanup đạt.
- Rà soát tiếp phát hiện UI/retry còn dùng get_option trong khi safety switch đọc DB: đã đổi cả ba sang cùng getter DB. Thêm giả lập pre_option trả mã cũ để xác nhận notice và retry không tin cache.
- Native feed có nhánh conditional 304 trước template_redirect của WordPress. Vì RSS chưa là projection được hỗ trợ trong A, chặn 404/no-store/noindex tại parse_request; thử với If-Modified-Since tương lai.
- Bộ cuối chạy lại tuần tự S12, S05 regression và S11 regression trên mã đã đóng băng sau hai sửa trên. Kết quả cuối nằm trong test-results.json và postflight.json; không dùng số đếm các lượt trước làm nghiệm thu cho mã cuối.

- Hồi quy S11 trên mã cuối gặp assertion ở ca giả mạo receipt. Runner cũ thay ký tự cuối thành 0 nên có thể giữ nguyên chữ ký hợp lệ nếu nó đã kết thúc bằng 0. Đổi sang lật 0/1, assert URL phải khác bản gốc và ghi HTTP status vào assertion. Đây là sửa dữ liệu kiểm thử; không đổi verifier hoặc runtime. Cleanup của lượt thất bại vẫn PASS. Chạy lại riêng hồi quy S11; S12/S05 đã PASS trên cùng runtime cuối.

- Lượt S11 kế tiếp timeout khi đợi 429 ở UI. Các lần gửi trước kéo dài qua ranh giới bucket 15 phút (quota hợp lệ được reset), nên UI case không được phụ thuộc counter tích lũy suốt suite. Fixture MU gán IP tài liệu 203.0.113.211; ngay trước UI case nạp quota đầy cho bucket hiện tại và kế tiếp. Backend 37 kiểm tra vẫn tự diễn tập ngưỡng ba lần gửi thật. Không sửa thuật toán rate/clock runtime. submitFailure giờ bắt response navigation rồi assert status thực tế, thay vì timeout vì chờ riêng status dự kiến. Cleanup lượt thất bại PASS; chạy lại đủ S11.

- Lượt cuối: S12 225, S05 69/265/54/50 + UI/concurrent/restart, S11 61 UI/37 backend PASS. Hậu kiểm xác nhận runtime 35 theme/10 PHP khớp source, protected hashes/bằng chứng cũ/legacy runtime giữ nguyên; fixture/cache/lock/listener bằng 0. Chốt local S12, hosting/BYOK chưa xác minh, dừng trước S13.
