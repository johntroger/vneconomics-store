# Nghiệm thu R2 — Architecture foundation và design system

Ngày: 28/10/2026

Trạng thái: **PASS_R2_OWNER_APPROVED**

Chủ dự án duyệt hai preview bằng phản hồi “ok” ngày 28/10/2026. Approval này chỉ đóng R2; không cấp quyền bắt đầu R3.1, merge, build candidate hoặc production.

## Phạm vi đã thực hiện

- Tạo theme mới `themes/vibelab-v2`, không sửa theme `themes/vibelab` đang là baseline production.
- Chốt design system, theme/plugin contract và test skeleton tại [R2-design-system.vi.md](../rebuild/R2-design-system.vi.md).
- Gắn version `2.0.0-alpha.1`, contract version `1` và release marker `r2-foundation-local` ở head/body.
- Xây các thành phần nền: header/search, native mobile menu, hero/index rail, path selector, resource row, sequence ba bước, principles, footer, empty state, legacy index và 404.
- Theme chỉ đọc API công khai của VNE Library Core; không ghi database, migration, cron hoặc gọi dịch vụ ngoài.

## Kết quả kiểm thử

Lệnh: `npm run test:rebuild-foundation`

Kết quả cuối: **PASS_R2_FOUNDATION_LOCAL — 36 kiểm tra**.

- Static contract: entry files, marker và read-only guard đạt.
- Contrast token: body, muted copy, link, status và focus đạt ngưỡng đã chốt.
- WordPress integration: plugin vắng mặt không fatal; plugin/schema3 sẵn sàng trả contract version1.
- Privacy: draft/private/proposal/editorial fields không lọt ra homepage.
- Browser: một H1, heading không nhảy cấp, không tràn ngang tại 1440/1024/390/320 px.
- Interaction: control nhìn thấy tối thiểu 44 px; skip link, focus main và native mobile menu dùng được bằng keyboard.
- Smoke: homepage, 404 và legacy index đạt; không browser error hoặc external request.
- Local safety: database/config local đang giữ nguyên; fixture/cache của lượt chạy đã được runner dọn.

Bằng chứng máy: [test-results.json](R2-rebuild/test-results.json).

Preview đã được chủ dự án duyệt:

- [Desktop 1440 px](R2-rebuild/preview-desktop.png)
- [Mobile 390 px](R2-rebuild/preview-mobile.png)

## Lượt lỗi và cleanup

Ba lượt đầu dừng trước kiểm tra sản phẩm:

1. Playwright bị resolve theo `USERPROFILE` fixture; đã sửa thứ tự nạp runtime.
2. Playground cố tải WordPress core; đã chuyển sang core local được pin, không sao chép DB/wp-config thật.
3. Sandbox chặn loopback; chạy lại cùng lệnh với quyền truy cập `127.0.0.1` local.

Cả ba lượt đều báo cleanup PASS; không giữ fixture/cache thất bại. Lượt cuối đạt và cleanup PASS.

## Giới hạn

- Đây là WordPress/PHP8.3/SQLite local và Edge headless, không phải Plesk/MariaDB.
- R2 chỉ chứng nhận foundation/homepage preview. Archive, search, resource detail và guide detail thuộc R3.1–R3.3.
- Firefox/WebKit và full journey dành cho release gate; chưa tuyên bố thiết bị thật hoặc Core Web Vitals production.
- Screenshot dùng dữ liệu fixture đã duyệt trong repo, không phải snapshot production mới.
- Không merge, build candidate, đăng nhập Plesk hoặc thay production.

## Điểm dừng

R2 đã hoàn tất. Chưa bắt đầu R3.1; cần phê duyệt riêng theo cổng dự án.
