# VibeLab Việt v2

Theme cho kế hoạch tái thiết. Phiên bản `2.0.0` được chuẩn bị làm candidate R5.2, chưa được triển khai production.

## Ranh giới

- Theme chỉ đọc `vne_library_types()`, `vne_library_taxonomies()` và `vne_library_item()` từ VNE Library Core.
- Theme không ghi database, chạy migration, tạo nội dung, scheduler hoặc gọi dịch vụ ngoài.
- Khi plugin/schema chưa sẵn sàng, theme hiển thị trạng thái rỗng và vẫn không fatal.
- Release marker: `r52-v2-20261028`; contract version: `1`.

Homepage, catalog/category và resource detail thuộc R3.1. Search/filter/result/detail thuộc R3.2. Guide list/search/detail, practice detail và tài nguyên phụ thuộc thuộc R3.3. Theme này chưa được phép đóng gói hoặc phát hành production.
