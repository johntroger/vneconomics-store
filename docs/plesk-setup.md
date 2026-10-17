# Kết nối Plesk (chưa thực hiện)

Domain: store.vneconomics.com
Private repository: https://github.com/johntroger/vneconomics-store
SSH repository URL: git@github.com:johntroger/vneconomics-store.git

## Bước tiếp theo cần quyền Plesk

1. Trong Create repository, chọn Remote repository.
2. Nhập SSH repository URL ở trên. Dùng SSH để Plesk sinh public key truy cập GitHub.
   Đây là kết nối Plesk đi ra GitHub, khác với SSH từ máy local vào hosting.
3. Chọn Deployment mode = Disabled trong lúc thiết lập.
4. Lấy SSH public key Plesk hiển thị; thêm vào GitHub repository > Settings > Deploy keys,
   chỉ quyền đọc (không bật Allow write access). Không lấy hoặc chia sẻ private key.
5. Sau khi thêm key mới tạo repository trong Plesk. Chưa triển khai mã nguồn.
6. Khi đã có mã tùy chỉnh, xác định cấu trúc payload và thư mục đích tương ứng.
   Không triển khai root repository này vào thư mục gốc website, vì có mã công cụ local.
7. Chọn nhánh phát hành có bản đã qua kiểm thử, cấu hình webhook push của GitHub bằng
   URL ở Repository Settings của Plesk, rồi bật Automatic deployment.

Chỉ thêm webhook push cho nhánh phát hành sau khi kiểm tra cách Plesk xử lý nhánh.
Không đưa URL webhook chứa token vào Git hoặc tài liệu công khai.
Cần kiểm tra thực tế quyền truy cập private repository, nhận webhook và bản phát hành
trên staging; có menu Git không đồng nghĩa kết nối đã hoạt động.

## Khôi phục

Giữ backup file và database trước lần đưa lên đầu tiên. Khôi phục mã bằng commit
revert được kiểm thử rồi phát hành lại; khôi phục database là thao tác riêng.
Đổi theme/kích hoạt plugin lần đầu cần bước thiết lập WordPress riêng.

## Tài liệu chính thức

https://docs.plesk.com/en-US/obsidian/customer-guide/git-support/using-remote-git-hosting.75848/
https://developer.wordpress.org/playground/developers/local-development/wp-playground-cli/
