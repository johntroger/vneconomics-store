# R1 — Ledger quyết định URL

Ngày quan sát: 28/10/2026

Trạng thái: **ĐÃ ĐƯỢC CHỦ DỰ ÁN DUYỆT NGÀY 28/10/2026**

Nguồn: sitemap production công khai, baseline 14 URL legacy, inventory 25/10 và kiểm tra HTTP chỉ đọc

## 1. Phạm vi và quy ước

Ledger bao phủ 100% URL trong sitemap hiện hành và mọi entrypoint công khai đã biết trong baseline dự án. Query tìm kiếm là họ URL vô hạn nên được quyết định theo rule, không liệt kê từng tổ hợp.

| Quyết định | Ý nghĩa |
|---|---|
| KEEP | Giữ path, dữ liệu và vai trò; có thể thay presentation ở R2/R3 |
| REUSE | Giữ path nhưng thay nội dung/trách nhiệm bằng trang v2 tương đương |
| 301 | Chuyển vĩnh viễn sang đích tương đương |
| 410 | Ngừng public vì không có đích tương đương; giữ backup/record theo retention |
| NOINDEX | Route chức năng vẫn dùng nhưng không vào chỉ mục/sitemap |

Không thao tác URL nào trong R1.

## 2. 126 URL trong sitemap production

| Nguồn sitemap | Số URL | Quyết định | Hợp đồng v2 |
|---|---:|---|---|
| `wp-sitemap-posts-vne_resource-1.xml` | 106 | KEEP | Giữ toàn bộ `/tai-nguyen/<slug>/`; editorial review không đổi URL nếu chỉ sửa nội dung |
| `wp-sitemap-posts-vne_guide-1.xml` | 6 | KEEP | Giữ toàn bộ `/huong-dan/<slug>/` |
| `wp-sitemap-posts-vne_practice-1.xml` | 1 | KEEP | Giữ `/bo-thuc-hanh/bo-thuc-hanh-landing-page-cho-dich-vu-chup-anh/` |
| `wp-sitemap-taxonomies-vne_category-1.xml` | 13 | KEEP | Giữ toàn bộ `/danh-muc/<slug>/`; chỉ xuất hiện khi có nội dung public |
| **Tổng** | **126** | **KEEP** | 100% URL sitemap có quyết định |

Danh sách URL cụ thể do bốn sitemap trên quản lý. R5/R6 phải pin snapshot hoặc hash sitemap candidate; nếu số URL khác 126, thay đổi đó cần diff và quyết định bổ sung, không tự kế thừa KEEP.

## 3. Trang gốc, archive và route chức năng

| URL/rule hiện tại | Quyết định v2 | Canonical/robots kỳ vọng | Lý do |
|---|---|---|---|
| `/` | KEEP | self/index | Điểm vào chính |
| `/tai-nguyen/` | KEEP | self/index | Catalog tài nguyên |
| `/huong-dan/` | KEEP | self/index | Hub hướng dẫn và thực hành |
| `/bo-thuc-hanh/` | 301 → `/huong-dan/` | đích self/index | Hiện trả nội dung trùng và canonical sang hướng dẫn |
| `/?vne_find=1&scope=resources&s=*` | NOINDEX | no canonical/noindex,follow | Kết quả tìm kiếm động |
| `/?vne_find=1&scope=guides&s=*` | NOINDEX | no canonical/noindex,follow | Kết quả tìm kiếm động |
| query filter/sort/page hợp lệ | NOINDEX | noindex,follow | Tránh index tổ hợp mỏng; giữ trạng thái chia sẻ được |
| `/wp-sitemap.xml` và bốn child sitemap | KEEP | XML | Chỉ chứa URL canonical/indexable/public |
| `/robots.txt` | KEEP/UPDATE | text | Bỏ rule WooCommerce chỉ sau khi commerce được gỡ an toàn; vẫn chặn admin/runtime cần thiết |

## 4. Sáu trang hỗ trợ query → URL sạch

| URL hiện tại | URL v2 | Quyết định |
|---|---|---|
| `/?vne_support=gioi-thieu` | `/gioi-thieu/` | 301 sau khi URL sạch hoạt động; REUSE page legacy cùng path |
| `/?vne_support=cau-hoi` | `/cau-hoi-thuong-gap/` | 301 |
| `/?vne_support=ho-tro` | `/tro-giup/` | 301 |
| `/?vne_support=tieu-chi` | `/tieu-chi-tuyen-chon/` | 301 |
| `/?vne_support=quyen-rieng-tu` | `/quyen-rieng-tu/` | 301 |
| `/?vne_support=dieu-kien` | `/dieu-kien-su-dung/` | 301 |

Sáu URL sạch trả 200, canonical tự tham chiếu. Giới thiệu, tiêu chí, quyền riêng tư và điều kiện có thể index; trợ giúp/FAQ index khi nội dung đủ độc lập. Form báo lỗi và receipt luôn noindex.

## 5. 14 URL legacy trong production baseline

| URL | Quyết định | Đích/ghi chú |
|---|---|---|
| `/hello-world/` | 410 | Nội dung mẫu WordPress, không có đích tương đương |
| `/sample-page/` | 410 | Nội dung mẫu WordPress |
| `/shop/` | 301 | `/tai-nguyen/`; archive tài nguyên thay vai trò catalog cũ |
| `/cart/` | 410 | Không còn giao dịch |
| `/checkout/` | 410 | Không còn giao dịch; không redirect vòng qua Cart |
| `/my-account/` | 410 | Không có tài khoản người đọc |
| `/home/` | 301 | `/` |
| `/about/` | 301 | `/gioi-thieu/` |
| `/gioi-thieu/` | REUSE | Trang giới thiệu v2, không redirect |
| `/san-pham/` | 301 | `/tai-nguyen/` |
| `/tin-tuc/` | 410 | Trang trống, ngoài IA v2 |
| `/lien-he/` | 301 | `/tro-giup/` |
| `/cap-nhat-thi-truong-tai-san-so-ngay-14-6-2026-sac-xanh-tro-lai-bitcoin-lay-lai-moc-64-000-usd/` | 410 | Tin cũ lệch định hướng; không redirect sai ngữ nghĩa |
| `/diem-tin-kinh-te-tai-chinh-viet-nam-24h-qua-15-6-2026-vang-but-pha-ty-gia-leo-thang-chung-khoan-dieu-chinh/` | 410 | Tin cũ lệch định hướng; không redirect sai ngữ nghĩa |

410 là quyết định HTTP/publication, không phải lệnh xóa DB ngay. Bản ghi/backup được giữ tới khi có bước dữ liệu và retention riêng được duyệt.

## 6. Entry point phụ đã biết

| URL | Quyết định | Ghi chú |
|---|---|---|
| `/my-account/lost-password/` | 410 | Gỡ cùng account flow; không submit/test email |
| `/wp-content/themes/vibelab/assets/moc-studio/index.html` | KEEP tạm thời | Demo đang được hướng dẫn tham chiếu; R3 quyết định đóng gói lại nhưng không làm gãy link |
| `/?vne_support=bao-loi&resource=<id>` | NOINDEX/KEEP | Form chức năng, CSRF/rate limit/validation giữ nguyên |
| receipt/report route có chữ ký | NOINDEX/KEEP | Private/no-store; không vào sitemap |
| WordPress admin/login/API nội bộ | NOINDEX/KEEP | Không thuộc public IA; quyền hiện hành giữ nguyên |

## 7. Guard cho bước triển khai sau này

- Trước R6, crawl candidate và production baseline; mọi URL mới hoặc mất phải có diff.
- 301 phải kết thúc sau một hop tại URL 200 canonical; không redirect chain/loop/cross-origin.
- 410 không được thay bằng soft-404 200.
- KEEP phải giữ dữ liệu/canonical; đổi template không được làm mất approved content.
- Search/support private states không lọt vào sitemap.
- Không deactivate WooCommerce hoặc đổi record legacy trong cùng bước code trình bày nếu chưa có backup, dependency check và approval dữ liệu phù hợp.

## 8. Coverage

| Nhóm | URL cụ thể | Coverage |
|---|---:|---:|
| Sitemap production | 126 | 126/126 |
| Root/archive ngoài sitemap | 4 | 4/4 |
| Sitemap XML và robots | 6 | 6/6 |
| Support query hiện hành | 6 | 6/6 |
| Legacy baseline | 14 | 14/14 |
| Entry point phụ cụ thể | 2 | 2/2 |
| Route chức năng theo rule | 6 họ route | 6/6 |

Tổng cộng **158 URL cụ thể** và **6 họ route động** có quyết định. Hai URL phụ là lost-password và static demo; search/filter, form/report/receipt và admin được quản lý theo rule vì có tham số hoặc path nội bộ.
