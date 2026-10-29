# R3.2 — Hợp đồng hành trình tìm kiếm

Ngày tạo: 28/10/2026

Trạng thái: **ĐÃ ĐƯỢC CHỦ DỰ ÁN DUYỆT NGÀY 28/10/2026**

## Hành trình

```text
Ô tìm kiếm tại header/homepage
  → /?vne_find=1&scope=resources&s=<từ-khóa>
  → lọc/sắp xếp/phân trang
  → /tai-nguyen/<slug>/
```

Search/filter là query state chia sẻ được, `noindex,follow` và không có canonical. URL catalog sạch `/tai-nguyen/`, category sạch `/danh-muc/<slug>/` và resource detail của R3.1 không đổi.

## Hợp đồng truy vấn

| Tham số | Kiểu/giới hạn | Hành vi |
|---|---|---|
| `s` | text, tối đa 160 ký tự | khớp mọi từ; ưu tiên title → nhu cầu → excerpt → taxonomy/content |
| `category` | một slug hiện hữu | khớp danh mục |
| `need[]` | tối đa 12 slug | OR trong nhóm; AND với nhóm khác |
| `tool[]` | tối đa 12 slug | OR trong nhóm; AND với nhóm khác |
| `status` | `recommended`, `tested`, `review` | nhóm tình trạng dẫn xuất, không thay hồ sơ chi tiết |
| `sort` | `relevance`, `name`, `name_desc`, `observed` | relevance chỉ hiện khi có từ khóa |
| `paged` | số nguyên dương | 9 kết quả/trang; giữ nguyên query state |

Tham số sai không được làm rộng kết quả. Giao diện hiển thị lỗi cụ thể và nút đặt lại. Theme chỉ đọc contract/plugin hiện hành, không ghi schema, trạng thái hoặc taxonomy.

## Trạng thái giao diện

- **Kết quả:** tổng/range, chip tiêu chí, sắp xếp, resource row và link detail.
- **Rỗng:** chỉ dẫn dùng từ khóa ngắn hơn/bỏ bộ lọc; có xóa tất cả và mở catalog.
- **Lỗi:** danh sách lỗi tham số; không render kết quả ngầm.
- **Pagination:** URL giữ từ khóa, filter và sort; trang ngoài phạm vi không được tạo kết quả giả.
- **Mobile:** một cột; form tìm kiếm xếp dọc; filter dùng `details/summary`, mở/đóng bằng keyboard và không mất query.

## Nhãn tình trạng

- `recommended`: đủ điều kiện `recommendation_eligible` từ plugin;
- `tested`: validation đã thử nhưng chưa đủ điều kiện recommended;
- `review`: mọi trường hợp cần đọc tình trạng/giới hạn trước khi dùng.

Các nhãn này chỉ hỗ trợ thu hẹp danh sách. Trang detail vẫn là nguồn giải thích cuối cùng cho nguồn, validation, maintenance, quyền, giấy phép và chi phí.

## Ngoài phạm vi

- Search guide/practice và related guide thuộc R3.3.
- Không thêm field/schema/importer/admin.
- Không merge, build candidate, đăng nhập Plesk hoặc thay production.
