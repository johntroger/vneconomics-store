# R7.2 — Preview v2 giữ dữ liệu và smoke theo module

Ngày 29/10/2026. Chủ dự án đã duyệt riêng R7.2 bằng “ok” sau câu hỏi về preview v2/database riêng/smoke local. Trạng thái: **PASS_R72_LOCAL_PREVIEW_OWNER_APPROVED**; chủ dự án nghiệm thu bằng “ok” sau báo cáo hoàn tất cùng ngày. Không thay mã sản phẩm, CI, Plesk, nhánh phát hành hoặc cấu hình production.

## Kết quả sử dụng

```powershell
npm run dev:v2
# Mở http://127.0.0.1:9472; lưu code nguồn, đợi đồng bộ rồi refresh.
# Dừng Ctrl+C trước khi chạy tác vụ có run-clean khác.
npm run test:v2-smoke -- home
npm run test:v2-smoke -- discovery
npm run test:v2-smoke -- search
npm run test:v2-smoke -- guides
```

Chọn module phù hợp, không chạy cả bảng cho mỗi lần sửa. `npm run test:v2-preview` dành cho thay đổi runtime preview/đồng bộ; không phải kiểm tra mặc định mỗi lần sửa CSS.

- Preview dùng `.local/rebuild-v2`, giữ database qua các lần chạy. Core được sao chép từ `.local/site` nhưng không lấy DB/config/uploads. Nội dung mẫu chỉ seed khi chưa có marker và thư viện còn trống; seed dở dang hoặc trạng thái không rõ sẽ dừng để inspect. Các site local cũ được giữ.
- Sync kiểm nguồn theme v2/plugin theo chu kỳ 750ms; chỉ cập nhật mã thuộc manifest của preview, không đồng bộ DB/nội dung/media. Xóa file code đã được manifest ghi nhận chỉ khi file đích còn đúng hash. Gặp symlink, đường dẫn ngoài phạm vi, mã đích không được ghi nhận hoặc bị sửa trực tiếp thì dừng đồng bộ và giữ chỉnh sửa.
- Lưu CSS/template rồi refresh trong phiên đang mở không cần cài lại WordPress. Chưa tự reload trang. Không chỉnh code bằng editor WordPress trong preview.
- Preview có banner mẫu local, noindex/nofollow, tắt mail/HTTP ngoài/cron. Browser smoke chặn request ngoài origin local. Nội dung mẫu tổng hợp không phải dữ liệu production hoặc bằng chứng đã xác minh công cụ.
- Smoke kiểm homepage và một hành trình chọn trước, desktop1280/mobile390, marker lấy từ source hiện tại, noindex, h1, private canary, lỗi trình duyệt và tràn ngang. Search kiểm từ khóa thật và loại kết quả không liên quan; guides kiểm mục lục. Không thay unit/integration, test quyền/import/migration hoặc gate release đầy đủ.
- Evidence có thư mục riêng từng lượt, không ghi đè hồ sơ R2–R6. Dùng Playwright Node/Edge có sẵn; Python trong môi trường hiện tại thiếu Playwright nên không cài thêm dependency. Thêm ba npm alias, giữ các sửa đổi package.json có sẵn. Runtime cũ chỉ thêm export đường dẫn home gốc trước khi USERPROFILE bị đổi để tìm đúng thư viện.

## Kiểm chứng

1. [Workflow fixture](R72-preview/2026-10-29T02-32-46-443Z-b00887fa/result.json): **9 kiểm tra đạt**, gồm từ chối site không thuộc preview, bảo vệ baseline, CSS đổi trong nguồn xuất hiện ở browser không restart, sai marker FAIL, server/worker đóng sau lỗi, restart giữ nội dung tự thêm/options/ID seed không trùng, discovery/search/guides và giữ mã xung đột. Fixture/cache sau lượt chạy được run-clean dọn.
2. [Discovery browser](R72-preview/2026-10-29T02-32-46-443Z-b00887fa/discovery/browser/result.json), [guide browser](R72-preview/2026-10-29T02-32-46-443Z-b00887fa/guides/browser/result.json) và [lỗi cố ý](R72-preview/2026-10-29T02-32-46-443Z-b00887fa/expected-failure/browser/result.json) được giữ riêng. Đã xem ảnh mobile chi tiết, không tràn ngang.
3. Rà lại assertion phát hiện query tìm kiếm ban đầu chỉ kiểm trang kết quả, chưa truyền từ khóa qua `s`. Đã sửa và thêm assertion loại Pico CSS. [Lượt CLI thật sau sửa](R72-preview/2026-10-29T02-38-09-385Z-c70b5103/browser/result.json) **PASS** homepage và `/?vne_find=1&scope=resources&s=Astro` trên desktop/mobile, không lỗi browser. Lượt này tạo preview `.local/rebuild-v2` cần giữ; server đã đóng sau smoke, không để tiến trình nền.
4. Lượt đầu bị sandbox chặn loopback bằng EACCES; hai lượt tiếp phát hiện cách tìm home/Python và Python thiếu Playwright. Đã sửa, giữ kết quả lỗi theo run ID, chạy lại với quyền loopback cần thiết. Các lượt lỗi đều cleanup và xác nhận baseline không đổi; không bỏ assertion để vượt lỗi.
5. Node syntax cho các file mới/runtime, PHP lint fixture, diff/link/ref và [readback cleanup/baseline](R72-preview/2026-10-29T02-38-09-385Z-c70b5103/validation.json) đạt. Không chạy full regression, tạo backup, build payload, push hoặc mở hosting.

## Số đo và giới hạn

| Giai đoạn | Số đo một lượt |
|---|---|
| Dựng fixture lần đầu | 62,491 giây ready, gồm prepare10,746/boot40,522/init11,222 |
| Mở lại fixture giữ DB | 36,673 giây ready, prepare0,770/boot24,592/init11,311 |
| CSS sửa trong nguồn thấy qua HTTP | 0,800 giây; browser sau đó xác nhận computed style đúng |
| Browser discovery / guides | 40,209 / 30,921 giây |
| CLI search sau sửa assertion | Ready62,260 giây lần đầu trên preview thật; browser12,907 giây, tổng smoke child13,078 giây |

Đây là số đo local WASM/PHP8.3/WordPress7.1.3/SQLite, không phải p95, hiệu năng Plesk/MariaDB hoặc mức tăng tốc end-to-end đã chứng minh. Bản production R6 quan sát WordPress7.1.4. Runtime dùng hai worker; CLI khuyến nghị sáu để giảm nguy cơ chờ file lock, chưa benchmark hoặc kiểm độ ổn định phiên dài. Lợi ích đã kiểm chứng là sửa CSS trong phiên đang mở không cần dựng site lại; khởi động và smoke vẫn mất hàng chục giây.

R7.2 đã được nghiệm thu ngày 29/10/2026; bước tiếp theo chưa được mở. Giữ nguyên GitHub → private inbox → Manual Plesk và gate production; R7.2 không cấp quyền bật automation, đổi workflow hoặc phát hành.
