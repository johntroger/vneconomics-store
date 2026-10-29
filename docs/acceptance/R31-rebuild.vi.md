# Nghiệm thu R3.1 — Homepage → catalog → resource detail

Ngày: 28/10/2026

Trạng thái: **PASS_R31_OWNER_APPROVED**

Chủ dự án duyệt bốn preview bằng phản hồi “ok” ngày 28/10/2026. Approval này chỉ đóng R3.1; không cấp quyền bắt đầu R3.2, merge, build candidate hoặc production.

## Phạm vi đã thực hiện

- Mở rộng theme v2 từ foundation R2 sang hành trình discovery tại [R31-discovery-contract.vi.md](../rebuild/R31-discovery-contract.vi.md).
- Thêm resource archive, category landing, resource detail, breadcrumb, pagination và SEO context.
- Giữ plugin/schema hiện hành; không tạo field, migration hoặc dữ liệu production.
- Bump theme `2.0.0-alpha.2`, marker `r31-discovery-local`.
- Search/filter nâng cao và guide journey vẫn ngoài phạm vi.

## Kết quả kiểm thử

Lệnh: `npm run test:rebuild-discovery`

Kết quả cuối: **PASS_R31_DISCOVERY_LOCAL — 46 kiểm tra**.

- Static: template/marker tồn tại; theme không có write API hoặc external call.
- Journey thật bằng click: homepage → `/tai-nguyen/` → `/danh-muc/mau-du-an/` → Astro detail.
- Catalog: 6/6 approved fixture, 3 category + all-resources, category scoping đúng.
- Detail: approved title/excerpt/content, 5 claims, source CTA an toàn, breadcrumb và related items.
- Guard: trạng thái source unavailable đổi CTA thành `#tinh-trang`; draft trả 404 và không rò nội dung.
- SEO: homepage/archive/category/detail có canonical tự tham chiếu; description đúng context.
- Responsive: catalog/detail không tràn ngang, control tối thiểu 44 px tại 1440/390/320.
- Browser: không console error hoặc external browser request.
- Safety: database/config local không đổi; fixture/cache đã cleanup.

Bằng chứng máy: [test-results.json](R31-rebuild/test-results.json).

Preview đã được chủ dự án duyệt:

- [Catalog desktop](R31-rebuild/catalog-desktop.png)
- [Catalog mobile](R31-rebuild/catalog-mobile.png)
- [Resource detail desktop](R31-rebuild/detail-desktop.png)
- [Resource detail mobile](R31-rebuild/detail-mobile.png)

## Rà soát trực quan

Lượt đầu kỹ thuật đạt nhưng tự rà ảnh phát hiện mobile đặt metadata trước title và cảnh báo claim lặp câu không có nhãn. Đã sửa:

- mobile đặt title/summary/action trước index nguồn;
- warning ghi rõ Yêu cầu/Giấy phép/Chi phí…;
- chạy lại cùng targeted gate: 46 kiểm tra đạt, cleanup PASS.

## Giới hạn

- Fixture WordPress/PHP8.3/SQLite local và Edge headless, không phải Plesk/MariaDB.
- Dữ liệu là fixture 6 resources; chưa crawl 106 resource production trong gate local.
- Search/filter/query state thuộc R3.2; guide/practice thuộc R3.3.
- Firefox/WebKit, sitemap full, production URL suite và Core Web Vitals thuộc release gate.
- Không merge, build candidate, đăng nhập Plesk hoặc thay production.

## Điểm dừng

R3.1 đã hoàn tất. Chưa bắt đầu R3.2; cần phê duyệt riêng theo cổng dự án.
