# S09 — Nhật ký kiểm thử và điều chỉnh

Ngày 21/10/2026.

- Lượt đầu: 20 truy vấn kỳ vọng và kiểm tra loại trừ raw/proposal/private đã qua;
  kiểm tra sort tên thất bại. Nguyên nhân: dùng cùng hàm alias tìm kiếm cho sort tên,
  khiến “Kỹ năng” bị so như “skill”. Đã tách fold Unicode/bỏ dấu khỏi alias; sort tên
  không thay từ bằng alias. Lượt thất bại không được tính PASS.
- Trong rà soát UI đã đổi toolbar lỗi/thư viện chưa sẵn sàng từ số0 sang thông báo
  chưa thể hiển thị kết quả; nhãn tìm kiếm cho screen reader phản ánh scope hiện tại.
- Một thao tác thay chuỗi PowerShell bị lỗi và ghi nhầm template từ biến cũ; phát hiện
  ngay ở kiểm tra nội dung file, đã khôi phục template đầy đủ trước lượt chạy lại.
  Không tác động fixture đang chạy hoặc database local. Các lệnh ghi tiếp theo dùng
  ErrorActionPreference=Stop để dừng ngay khi lỗi thao tác.
- Browser/server của lượt thất bại đóng trước khi run-clean dọn fixture/cache mới.
  Bằng chứng cuối nằm ở test-results.json và báo cáo nghiệm thu; không suy từ lượt cũ.

- Ca bổ sung trong hồi quy S07 thao tác form desktop khi viewport vẫn320px từ ca mobile cũ,
  nên checkbox đang được giấu đúng thiết kế. Đã đặt viewport1440 rõ ràng trước ca này;
  không dùng force-click/bỏ assertion. Lượt lỗi cleanup xong, chạy lại toàn bộ S07.

- Hồi quy S07 đã tới ca archive rỗng nhưng selector cũ chọn mọi link nên gặp2 đích hợp lệ
  (phục hồi về home và chuyển scope mới của S09). Đã chọn riêng link button phục hồi,
  giữ assertion href về home; chạy lại toàn bộ. Không loại đường chuyển scope khỏi UI.
- Rà soát code bổ sung guard404 taxonomy không có; kiểm tra bằng fixture mới cả URL có từ khóa.

- Assertion Back bổ sung phát hiện lỗi thật: URL/kết quả quay lại đúng nhưng dropdown giữ
  sort mới. Đã reset form sort và header theo default applied state khi pageshow, lặp
  ở task kế tiếp để theo sau browser khôi phục persisted controls. Giữ assertion này và
  bổ sung Back của từ khóa; chạy lại S09 và các hồi quy với hash JS mới.

- Bổ sung metadata hash có lỗi thay chuỗi lặp vào fixtureChecks; node --check bắt được
  trước khi chạy. Đã sửa và kiểm tra cú pháp từng runner, kiểm tra exit code rõ ràng.
- Kết quả cuối: S09 74/28, S07 46/23, S08 55/19 và S06 59 đều PASS trên cùng25 hash
  runtime theme. Postflight xác nhận bảo toàn dữ liệu, không lock/fixture/cổng test còn mở.
