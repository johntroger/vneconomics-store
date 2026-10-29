# Nghiệm thu R3.2 — Search → filter → result → detail

Ngày: 28/10/2026

Trạng thái: **PASS_R32_OWNER_APPROVED**

Chủ dự án duyệt bắt đầu R3.2 và sau đó duyệt preview bằng phản hồi “ok” ngày 28/10/2026. Approval này đóng R3.2, không cấp quyền bắt đầu R3.3, merge, build candidate hoặc production.

## Phạm vi đã thực hiện

- Thực hiện [hợp đồng R3.2](../rebuild/R32-search-contract.vi.md) trong theme v2 độc lập.
- Search resource theo từ khóa, category, nhu cầu, công cụ và tình trạng dẫn xuất.
- Query state chia sẻ được, chip gỡ từng tiêu chí, clear-all, sort và pagination 9 mục/trang.
- Empty/error recovery, `noindex,follow`, không canonical cho tổ hợp query.
- Filter panel native trên mobile, không cần JavaScript.
- Bump theme `2.0.0-alpha.3`, marker `r32-search-local`.

## Kết quả kiểm thử

Lệnh: `npm run test:rebuild-search`

Kết quả cuối: **PASS_R32_SEARCH_LOCAL — 41 kiểm tra**.

- Static: file/version/marker có thật; theme không chứa write API hoặc external call.
- Journey bằng click: header search → một result Astro → resource detail.
- Query: keyword, category, need + tool, derived status và sort state hoạt động.
- Guard: invalid filter hiển thị lỗi và không mở rộng kết quả.
- Empty: có hướng dẫn phục hồi, clear-all và catalog fallback.
- Pagination: 11 fixture → trang 1 có 9, trang 2 có 2, range `10–11 trong 11`; query URL đúng.
- SEO: search không canonical và có `noindex,follow`.
- Mobile: filter đóng mặc định, mở/đóng bằng keyboard, giữ query state.
- Responsive: search/empty không tràn ngang, tap target tối thiểu 44 px tại 1440/390/320.
- Browser: không console error hoặc external browser request.
- Safety: database/config local không đổi; fixture/cache đã cleanup.

Bằng chứng máy: [test-results.json](R32-rebuild/test-results.json).

Preview đã được chủ dự án duyệt:

- [Search desktop](R32-rebuild/search-desktop.png)
- [Search mobile — filter mở](R32-rebuild/search-mobile.png)
- [Empty state desktop](R32-rebuild/empty-desktop.png)
- [Empty state mobile](R32-rebuild/empty-mobile.png)

## Lỗi đã bắt và sửa trong gate

- Fixture taxonomy ban đầu không cập nhật approved snapshot: sửa setup qua service plugin.
- Pagination escape URL hai lần làm `&` thành fragment `#038;`: bỏ escape trung gian và kiểm lại click trang 2.
- Mobile 390 px cắt placeholder, empty action xuống dòng xấu: xếp form/action theo cột.
- Test tap target ban đầu đo ô checkbox 18 px thay vì nhãn 44 px: sửa assertion đo vùng label thực tế.

Mọi lượt thất bại đều kết thúc với cleanup PASS; không giữ fixture/cache của lần chạy.

## Giới hạn

- WordPress 7.1.3/PHP 8.3/SQLite local và Edge headless, không phải Plesk/MariaDB.
- Fixture 11 resource gồm 5 mục tổng hợp để kiểm pagination; không phải dữ liệu production.
- Search guide/practice thuộc R3.3.
- Firefox/WebKit, full URL/data suite, sitemap và production performance thuộc release gate.
- Không merge, build candidate, đăng nhập Plesk hoặc thay production.

## Điểm dừng

R3.2 đã hoàn tất. Chưa bắt đầu R3.3; cần phê duyệt riêng theo cổng dự án.
