# Nghiệm thu R1 — Product, nội dung và cấu trúc thông tin

Ngày: 28/10/2026

Trạng thái: **PASS_R1_OWNER_APPROVED**

Chủ dự án duyệt bằng phản hồi “ok” ngày 28/10/2026, sau khi được yêu cầu xác nhận R1. Approval này chỉ đóng R1; không cấp quyền bắt đầu R2, merge, build candidate hoặc production.

## Phạm vi đã thực hiện

- Đối chiếu read-only production: homepage, archives, WooCommerce entrypoints, sitemap, robots, support query, search, category và mẫu detail.
- Chốt bản nháp mục tiêu sản phẩm, ba hành trình, sitemap, content model, ranh giới code/data/media, wireframe và tiêu chí chất lượng tại [R1-product-content-contract.vi.md](../rebuild/R1-product-content-contract.vi.md).
- Lập quyết định cho 126/126 URL sitemap, 14/14 URL legacy, root/archive, support và route chức năng tại [R1-url-disposition.vi.md](../rebuild/R1-url-disposition.vi.md).

## Quan sát production ngày 28/10/2026

- 4 child sitemap: 106 resource, 6 guide, 1 practice, 13 category; tổng 126 URL.
- Homepage, `/tai-nguyen/`, `/huong-dan/`, mẫu category/resource/guide trả 200 và canonical tự tham chiếu.
- `/bo-thuc-hanh/` trả 200 nhưng nội dung trùng `/huong-dan/` và canonical về `/huong-dan/`.
- Search trả 200, `noindex,follow`, không canonical.
- Sáu support query trả 200, canonical tự tham chiếu và đang indexable.
- Shop trả 200/indexable; Cart và My account noindex; Checkout kết thúc tại Cart.
- `robots.txt` công khai có sitemap, chặn wp-admin và các vùng WooCommerce uploads/add-to-cart.

Kiểm tra này chỉ GET công khai, không đăng nhập, submit, chạy paid API hoặc ghi production. Công cụ web chuẩn không truy cập được subdomain; kiểm tra được thực hiện bằng HTTPS request local chỉ đọc.

## Kiểm thử tài liệu

Đã đạt:

- `git diff --check`: PASS cho file tracked; kiểm trailing whitespace riêng bao phủ cả tài liệu mới.
- Link/ref tương đối: PASS, 5 file bị tác động, 0 link hỏng.
- Coverage ledger: PASS, 126/126 sitemap, 14/14 legacy, tổng 158 URL cụ thể và 6 họ route.
- Phạm vi code: PASS, không có thay đổi trong `themes/` hoặc `plugins/`.
- Cleanup: không tạo fixture/cache/file tạm trong các kiểm tra tài liệu.

Không chạy application suite theo phân tầng test tài liệu. Chủ dự án đã duyệt các quyết định trong mục 9 của hợp đồng ngày 28/10/2026.

## Giới hạn

- Inventory 25/10 chỉ có 11 mục thư viện; sitemap 28/10 đã có 113 detail thư viện. Bản R1 dùng sitemap mới hơn làm nguồn coverage.
- Chưa đo Core Web Vitals field, thiết bị thật hoặc analytics; median 994 ms là cảnh báo Site Health lịch sử, không phải field p75.
- Chưa kiểm tra chất lượng biên tập riêng từng tài nguyên trong 106 URL; KEEP nghĩa là giữ URL/dữ liệu, không phải chứng nhận nội dung.
- Chưa đổi URL, database, theme/plugin, GitHub PR, Plesk hoặc production.

## Điểm dừng

R1 đã hoàn tất. Chưa bắt đầu R2; cần phê duyệt riêng cho R2 theo cổng dự án.
