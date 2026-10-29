# R3.1 — Hợp đồng hành trình khám phá

Ngày tạo: 28/10/2026

Trạng thái: **ĐÃ ĐƯỢC CHỦ DỰ ÁN DUYỆT NGÀY 28/10/2026**

## Hành trình

```text
Homepage
  → /tai-nguyen/
  → /danh-muc/<slug>/
  → /tai-nguyen/<slug>/
```

Người đọc phải thực hiện được ba việc mà không cần search nâng cao:

1. mở catalog từ homepage;
2. thu hẹp theo category hoặc chọn trực tiếp tài nguyên;
3. đọc công dụng, điều kiện, tình trạng, nguồn và revision trước khi sang nguồn ngoài.

## Catalog/category

- Giữ URL `/tai-nguyen/` và `/danh-muc/<slug>/`.
- Hiển thị resource publish theo tên, 12 mục/trang.
- Category là navigation cơ bản, không phải filter drawer R3.2.
- Mỗi dòng có số thứ tự theo danh sách, title, excerpt, type/category, derived state và link chi tiết.
- Empty state không tạo nội dung giả.

## Resource detail

Detail là “hồ sơ quyết định” gồm:

- title, excerpt, type, category và derived state;
- CTA nguồn chỉ xuất hiện khi plugin cho phép; nếu bị chặn, CTA dẫn tới giải thích tình trạng;
- năm claim: yêu cầu, quyền, tương thích, giấy phép và chi phí;
- cảnh báo có nhãn field cụ thể;
- content đã duyệt, source path, revision và ngày quan sát;
- tài nguyên cùng category, không tuyên bố thay thế lẫn nhau.

Theme chỉ đọc approved snapshot qua `vne_library_item()`. Draft/private/proposal/editorial note không được xuất hiện công khai.

## SEO contract R3.1

- Homepage, resource archive, category và public detail có đúng một canonical tự tham chiếu.
- Archive/category/detail có description theo context hoặc approved excerpt.
- 404, preview và WordPress search mặc định là noindex.
- Title detail dùng approved title.
- Search/filter URL riêng thuộc R3.2; sitemap full thuộc release gate.

## Phiên bản

- Theme: `2.0.0-alpha.2`.
- Contract: `1`, schema tối thiểu `3`.
- Release marker: `r31-discovery-local`.
- Chưa phải candidate hoặc production.
