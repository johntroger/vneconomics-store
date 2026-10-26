# Đợt nội dung 100 bài — phạm vi đã được chủ cho phép

Ngày 25/10/2026. Chủ yêu cầu nghiên cứu khoảng 100 bài, chia lô tạo/kiểm thử, đạt rồi làm lô tiếp tới hết. Sau câu hỏi về đích, chủ chọn **“Xuất bản production theo từng lô đạt kiểm tra”**. Chủ đã giao AI tự duyệt nội dung và chỉ hỏi ngoại lệ quan trọng. Đây là phê duyệt cho vòng lặp các lô của đợt này; không xin lại cùng quyền sau mỗi lô.

Mục tiêu: 100 bài giới thiệu repo GitHub nổi bật bằng tiếng Việt, có ví dụ công việc và lối bắt đầu cho người mới. 10 lô × 10 bài. Tận dụng loại `vne_resource`; collection skills giới thiệu ở cấp repo dùng loại tool/learn, không giả nguồn thư mục skill. Bài giải thích/cách tìm hiểu không được mang nhãn đã chạy thử. Không thêm lệnh cài chưa kiểm chứng hoặc gọi AI trả phí.

Đích: https://store.vneconomics.com/; theme VibeLab0.7.1, plugin0.4.2/schema3 giữ nguyên. Thời điểm: trong phiên/lượt thực hiện sau mỗi lô đạt cổng. Không phát hành code theme/plugin, không bật scheduler đồng bộ sao, không xóa/chuyển hướng nội dung cũ. Giữ bài/trang và 11 mục thư viện đã có.

File dự kiến: catalog và snapshot nghiên cứu; 100 bản nội dung; manifest/hash; importer riêng có guard host/root/DB/version/hash/journal; kiểm thử dry-run, dữ liệu, HTML/links, trùng repo/title/slug, chống lặp, khả năng đọc và hồi quy website. Chỉ nhập bài mới, không chép DB. Sao hiển thị dạng snapshot có ngày; không gọi là tăng nhanh khi chưa có lịch sử.

Trước ghi production: kiểm tra phiên, tạo backup mới và kiểm tra gói; chụp baseline nội dung; importer default dry-run; tác vụ tạo bài chặn mail/ping/network; journal ghi từng ID để tránh nhập trùng. Giữ gói phục hồi thật. Nếu lô lỗi, dừng lô sau, sửa trong phạm vi hoặc gỡ công khai đúng bài vừa tạo bằng trạng thái có thể phục hồi, không đụng dữ liệu cũ.

Trong mỗi lô: nghiên cứu nguồn → viết nội dung riêng → tự duyệt biên tập → kiểm cấu trúc/schema/nguồn → nhập lô → kiểm URL/heading/metadata/trạng thái/CTA và danh mục/tìm kiếm/pagination → xác nhận dữ liệu cũ không đổi → ghi bằng chứng/cleanup → lô kế. Kết thúc báo số thực sự xuất bản và những mục còn giữ, không báo 100 nếu chưa đủ.

Phê duyệt này không bao gồm mua dịch vụ, chạy repo không tin cậy, API AI trả phí, mở quyền mới, automation dài hạn hoặc thay đổi cấu trúc ứng dụng. Những lỗi nền phát sinh ảnh hưởng nhiều hơn phạm vi nhập nội dung sẽ được báo riêng.
