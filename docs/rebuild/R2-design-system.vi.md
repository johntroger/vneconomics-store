# R2 — Architecture foundation và design system

Ngày tạo: 28/10/2026

Trạng thái: **ĐÃ ĐƯỢC CHỦ DỰ ÁN DUYỆT NGÀY 28/10/2026**

## Hướng thiết kế

VibeLab v2 mang hình ảnh một **thư viện chỉ mục có biên tập**, không phải cửa hàng hay SaaS dashboard. Dấu hiệu nhận diện là đường chỉ mục xanh chạy dọc, danh sách dạng hồ sơ và khoảng trắng rộng. Màu cyan chỉ đánh dấu cấu trúc; màu xanh lam dành cho hành động.

| Token | Giá trị | Vai trò |
|---|---|---|
| Paper | `#F7F9FC` | Nền đọc lạnh, tránh cream template |
| Surface | `#FFFFFF` | Vùng nội dung |
| Ink | `#10243E` | Chữ và cấu trúc chính |
| Blue | `#165DFF` | Hành động/liên kết |
| Cyan | `#00A7C4` | Đường chỉ mục, không dùng cho chữ nhỏ |
| Mist | `#E8EEF7` | Phân lớp nhẹ |
| Good | `#137B63` | Trạng thái có chữ đi kèm |

Typography dùng font hệ thống Aptos/Segoe UI có hỗ trợ tiếng Việt, không tải font ngoài. Headline lớn và ngắn; nội dung tối đa 72 ký tự tương đối mỗi dòng. Không dùng gradient trang trí, carousel, card bo tròn đồng loạt hoặc animation tự chạy.

## Ranh giới kiến trúc

Theme mới nằm ở `themes/vibelab-v2`, tách khỏi `themes/vibelab` production. Theme đọc ba hàm công khai của plugin:

- `vne_library_types()`;
- `vne_library_taxonomies()`;
- `vne_library_item()`.

Contract version `1`, schema tối thiểu `3`. Adapter nằm tại `inc/contract.php`; template không đọc meta thô. Theme không gọi hàm ghi, migration, REST mutation, cron hoặc dịch vụ ngoài. Plugin vắng mặt/schema cũ phải trả empty state, không fatal và không tạo dữ liệu giả.

Release marker local là `r2-foundation-local`, xuất hiện trong meta và `body`. Marker này ngăn preview R2 bị hiểu nhầm là candidate production.

## Thành phần nền

- header desktop/mobile dùng HTML native; mobile menu là `details/summary`, không phụ thuộc JavaScript;
- search form server-rendered;
- hero + index rail;
- path selector;
- resource row có số thứ tự thật, type/category/status và link chi tiết;
- three-step sequence;
- principle list, button, empty/contract states và footer;
- fallback index/404.

## Bốn tầng test skeleton

| Tầng | R2 thực hiện | Mở rộng ở R3/R5 |
|---|---|---|
| Static contract | file, marker, cấm write API trong theme | allowlist/release manifest |
| PHP/WordPress integration | theme chạy khi plugin thiếu và khi schema3 sẵn sàng | archive/detail/search integration |
| Browser component | heading, resource rows, keyboard, 320/390/1024/1440, contrast | trạng thái filter/detail/guide |
| Smoke | homepage/404/legacy index, không fatal, không external request | full journey và release postflight |

## Giới hạn R2

Đây là foundation và homepage preview để duyệt ngôn ngữ thiết kế. Archive, search, resource detail và guide detail hoàn chỉnh thuộc R3.1–R3.3. Không build candidate, merge hoặc production trong R2.
