# S13 — Nghiệm thu tích hợp local A

Cập nhật: 23/10/2026. Nhánh: `codex/s13-local-acceptance`; base S12: `4e80391d906e20f645ca02f819644045a274123c`.
Theme 0.7.0, plugin 0.4.2. **Chưa nghiệm thu toàn bộ S13**: lần đo lại native đạt, còn chờ chủ dự án trực tiếp thử; lịch sử lab thất bại vẫn được giữ. S14 chưa được phép; chưa triển khai hosting.

## Nội dung và thay đổi

Bản riêng gồm sáu tài nguyên từ mẫu nguồn đã duyệt và cụm năm nội dung quanh bài landing page dịch vụ chụp ảnh sản phẩm hư cấu Mộc Studio. Giữ ngày quan sát nguồn 19/10/2026 và dữ kiện chưa rõ; không coi đây là kiểm tra lại repository mới nhất.

Bài học giữ giới hạn S10: replay đầu ra trên Windows đã cài công cụ; chưa thử cài Windows sạch, đăng nhập Codex mới hoặc tạo mã bằng một lượt AI trả phí mới.

Bổ sung description/canonical theo trang, noindex trang tìm/lọc/báo lỗi/preview và sitemap chỉ gồm nội dung đã xuất bản có snapshot duyệt. Title danh mục và hỗ trợ đúng ngữ cảnh; HTML khai báo tiếng Việt. Không thêm giá, sao hay schema thương mại giả.

Sửa dịch chuyển bố cục do menu/bộ lọc khởi tạo muộn: chạy mã bundled ngay sau controls, trước nội dung bị reflow. Giữ đường đi không JavaScript và khi CSP chặn script. Bỏ script/style emoji WordPress không cần thiết; getter công khai tránh truy vấn raw taxonomy khi snapshot đã có dữ liệu tương ứng. Chính sách private/no-store và xử lý 503 của S12 được giữ.

## Lỗi khóa đồng thời

Bản 0.4.1 dùng add_option làm mutex. Sau kiểm tra tồn tại, WordPress có nhánh INSERT ... ON DUPLICATE KEY UPDATE; hai tiến trình có thể cùng nhận quyền sở hữu.

Phép tái hiện native dùng hai tiến trình, trì hoãn một giây trước INSERT và chưa nhả khóa trước khi cả hai trả kết quả. Trước vá: hai chủ ở cả họ khóa nội dung và báo lỗi. Bản 0.4.2 dùng INSERT IGNORE, chỉ công nhận đúng một hàng chèn mới; giữ nhả có điều kiện đúng token, không phá khóa theo TTL. Sau vá: đúng một chủ ở cả hai họ khóa.

Bằng chứng: [trước vá](S13/lock-race-before-fix.json), [sau vá](S13/lock-race-after-fix.json). Đây là SQLite local; MySQL hosting vẫn cần kiểm tra ở bước hosting.

## Kiểm thử chức năng trên bản cuối

| Bộ | Kết quả |
|---|---|
| Tích hợp, SEO, sitemap, mobile, bàn phím | 122 PASS |
| S06: trang chủ/menu/noJS/CSP | 59 PASS |
| S05: quyền, trạng thái, revision | 69 model; 265 state; 54 hàng ma trận; 50 revision cùng UI/race/restart PASS |
| S09: tìm kiếm/bộ lọc | 74 UI/HTTP; 28 fixture; 20 truy vấn PASS |
| S10: bài thực hành | 55 kiểm tra; hai replay PowerShell PASS |
| S11: hỗ trợ/báo lỗi | 61 UI/HTTP và 37 backend PASS trên plugin 0.4.2 |
| S12: cache/503/phục hồi | 225 PASS trên plugin 0.4.2 |
| Hậu kiểm hash/bảo toàn/cleanup | PASS; hash khớp, dữ liệu gốc/bằng chứng cũ nguyên vẹn, fixture/cache/lock/listener test đã dọn |

Kết quả ở thư mục [S13](S13/); JSON chứa hash mã được thử. Kết quả plugin 0.4.1 giữ riêng trong pre-lock-fix, không thay kết quả sau vá.

Ca sitemap ban đầu đọc navigation đã được XSL chuyển thành HTML. Runner sửa sang HTTP XML thô và giữ kiểm tra số lượng, URL, loại trừ draft/private/chưa duyệt; không sửa WordPress core để qua kiểm thử.

## Hiệu năng — lần đo lại native đạt, giữ lịch sử thất bại

Ngày 23/10/2026 chạy lại `npm run test:acceptance-native-performance` với cùng mã website và profile: 19 kiểm tra đạt, LCP 12/12 đạt, CLS 12/12 bằng 0. Home: 1820 / 1900 / 1584 ms; danh mục: 1324 / 1696 / 1200 ms; chi tiết: 1352 / 2288 / 1760 ms; bài học: 1608 / 2072 / 2308 ms. Kết quả mới tại [native-performance.json](S13/native-performance.json); kết quả thất bại trước đây tại [native-performance-initial-failure.json](S13/native-performance-initial-failure.json). Đây là đo lại đạt, không phải bằng chứng đã sửa nguyên nhân dao động của lượt chậm trước.

Các lần chạy trong sandbox dừng trước phép đo vì PHP `is_readable()` trả false dù `file_get_contents()` đọc được file; WordPress không nhận plugin và báo thiếu manifest icon. Đã bổ sung lưu PHP log khi lỗi và kiểm tra kết quả activation trước seed. Lần chạy ngoài sandbox qua cơ chế duyệt quyền đạt, không sửa core hoặc bỏ kiểm tra quyền đọc. Các failure JSON được giữ; fixture/cache của cả lần lỗi và lần đạt đều được wrapper dọn. `npm run test:acceptance-postflight` chạy lại PASS ngày 23/10/2026: hash website, hồi quy đã lưu, dữ liệu gốc và bằng chứng cũ khớp; S13 chờ chủ dự án thử.

Giữ ngưỡng từng lượt LCP ≤ 2500 ms và CLS ≤ 0.1; không lấy trung bình, bỏ lượt đầu hoặc nới ngưỡng. Ba lượt/trang, viewport 390×844, CPU 4×, RTT 40 ms, download 209715.2 B/s, upload 96000 B/s, browser cache lạnh; quan sát đến load + 1500 ms.

**Native PHP 8.3.36, plugin 0.4.2:** 18 kiểm tra môi trường/chức năng/log đạt; không lỗi JS/HTTP/PHP hoặc request ngoài trong luồng công khai. CLS 12/12 bằng 0. LCP 11/12 đạt; lượt home đầu 3016 ms vượt ngưỡng nên kết luận FAIL_NATIVE_LAB.

| Trang | LCP ba lượt (ms) |
|---|---|
| Home | 3016 / 2028 / 1804 |
| Danh mục | 1716 / 1364 / 1944 |
| Chi tiết | 1636 / 2008 / 1524 |
| Bài học | 1996 / 1724 / 1864 |

Bằng chứng lượt native thất bại ban đầu: [native-performance-initial-failure.json](S13/native-performance-initial-failure.json). PHP được giữ như dependency local, không đổi PATH/dịch vụ, không khởi động Docker; nguồn và SHA256 trong JSON/hợp đồng S13.

**WASM lịch sử trước vá khóa, plugin 0.4.1:** cùng theme cuối, cả 12 lượt vượt LCP; CLS đều trong ngưỡng. Home LCP 5468–6188 ms; danh mục 3768–6816; chi tiết 4352–6528; bài học 4272–5428. CLS danh mục lớn nhất 0.09894, các trang khác 0. Không gọi kết quả này là lab plugin 0.4.2; chỉ các file mutex/version plugin khác nhau. Giữ [test-results.json](S13/test-results.json) và các failure JSON, không thay bằng lượt native nhanh hơn.

TTFB WASM cao là quan sát, chưa đủ quy toàn bộ độ chậm cho WASM. Cả hai lab không chứng nhận hosting/MySQL/CDN, tải thực hoặc field INP. Kiểm tra accessibility ở đây chưa phải chứng nhận WCAG đầy đủ.

## Bản thử cho chủ dự án

Bản local dự kiến tại http://127.0.0.1:9430/, database riêng .local/s13-site; chạy bằng npm run dev:s13. Marker seed ngăn ghi đè nội dung đã sửa. Có banner bản nghiệm thu, noindex, báo lỗi lưu local và chặn gửi email. Không cần API key để đọc bài. Địa chỉ chỉ dùng trên máy này.

Theo quyết định của chủ dự án, không bắt buộc tuyển người mới; chủ dự án trực tiếp thử theo [kịch bản](../S13-owner-review.vi.md) và báo lỗi. Chưa có phản hồi không phải phê duyệt; kiểm thử tự động không được gọi là nghiên cứu usability người mới.

## Bảo toàn và giới hạn phát hành

Database/cấu hình gốc .local/site được đối chiếu SHA256, không seed hay kích hoạt theme/plugin mới trên bản gốc. Bằng chứng đến S12 được giữ nguyên. Fixture/cache mới của mỗi bộ được dọn sau khi browser/server đóng; bằng chứng nghiệm thu, dependency và database bản thử được giữ.

Hậu kiểm cuối đã đạt; bằng chứng tại S13/postflight.json. Ngày 23/10/2026 bản thử đã khởi động và smoke PASS: HTTP200, sáu thẻ tài nguyên, noindex/no-store và banner local; hash theme/plugin khớp source tại [preview-check.json](S13/preview-check.json). Runner chấp nhận đúng một HTTP302 tới `/` do Playground reset cookie sau PHP run; redirect khác hoặc lặp lại vẫn FAIL. Chạy trong sandbox bị EACCES loopback nên bản thử được chạy ngoài sandbox qua cơ chế duyệt quyền. Khi dev:s13 đang chạy, khóa/cache của chính tiến trình đang hoạt động được giữ tới lúc dừng, không coi là dữ liệu sót của kiểm thử đã kết thúc. Bản thử vẫn cần chủ dự án trực tiếp thao tác theo kịch bản.

Không thay main/release, không deploy, không bật automation, không gọi Gemini/BYOK/email. S13 vẫn mở để xử lý vấn đề và chủ dự án thử; chưa chuyển S14.
