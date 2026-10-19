# Nghiệm thu S01 — Baseline local và bộ chạy kiểm thử

Ngày: 19/10/2026 (Asia/Saigon). Chủ dự án yêu cầu bắt đầu S01.
Kết quả: PASS phạm vi baseline local, CHỜ CHỦ DỰ ÁN NGHIỆM THU; chưa bắt đầu S02.
Nhánh: codex/s01-local-baseline. Mốc nguồn đầu vào:
6cd895f (S00); xác nhận môi trường trước chạy theo working tree sạch.

## 1. Phạm vi và thay đổi

Chỉ kiểm tra local, sửa cấu hình nền/runner cần thiết; không thêm theme/plugin hoặc
nội dung sản phẩm, không triển khai hosting, không dùng API AI có phí.

- scripts/local-runtime.mjs: tăng workers từ 2 lên 6 theo cảnh báo khuyến nghị của
  CLI 3.1.58 về rủi ro kẹt khóa file khi dưới 6 workers.
- scripts/smoke.mjs: thêm START cho từng boot và deadline toàn smoke 300 giây;
  nếu vượt deadline child process kết thúc thất bại để wrapper dọn sau khi workers
  dừng. Không bỏ các kiểm tra HTTP/persistence sẵn có hoặc thay expected result.
- Không sửa package.json/lockfile/dependency hoặc chạy npm install.
- Chuẩn hóa LF file runtime; đây là định dạng, không thay logic sau lần smoke đạt.

## 2. Môi trường

Windows PowerShell; Node v24.19.0, npm 11.17.0, Git 2.54.0.windows.1.
@wp-playground/cli 3.1.58, WordPress 7.1.3, PHP 8.3 trong Playground, SQLite.
Kiểm thử bind localhost 127.0.0.1:19400. WordPress chạy với WP_HTTP_BLOCK_EXTERNAL
và DISABLE_WP_CRON. Fixture riêng dưới tmp/tests, không boot database .local/site.

## 3. Diễn biến và kết quả kiểm thử

Lệnh cả hai lần: npm test -> node scripts/run-clean.mjs script scripts/smoke.mjs.
Không chạy hai fixture song song.

### Lần 1 — không đạt nghiệm thu

Cấu hình cũ 2 workers phát cảnh báo dưới ngưỡng khuyến nghị 6. Lần chạy kéo dài;
agent dừng riêng PID child đã đối chiếu CommandLine scripts/smoke.mjs, không dừng
wrapper cha. Output thu hồi cuối cho thấy boot 1 PASS, boot 2 đã Ready nhưng chưa
có PASS. Exit code 1 do bị dừng, không coi là test thành công hoặc khẳng định chắc
chắn nguyên nhân là deadlock. Wrapper vẫn báo dọn xong; inventory trước lần 2 chỉ
còn tmp/tests như trước chạy, không có fixture/lock cũ.

### Lần 2 — PASS

Sau sửa 6 workers và bổ sung deadline, npm test kết thúc exit code 0. Các dòng kết quả:

    START: boot 1
    Ready! WordPress is running on http://127.0.0.1:19400 (6 workers)
    PASS: boot 1: homepage, login, REST API, persistent WordPress and database
    START: boot 2
    Ready! WordPress is running on http://127.0.0.1:19400 (6 workers)
    PASS: boot 2: homepage, login, REST API, persistent WordPress and database
    Temporary test data and run cache cleaned; existing data and deliverables kept.

Cảnh báo worker không xuất hiện trong lần 2. Deadline không bị chạm; nhánh tự timeout
300 giây không được kích hoạt trong lần đạt này. Việc dọn sau child bị dừng có bằng
chứng từ lần 1, không tuyên bố đã kiểm thử mọi kiểu crash/timeout có thể có.

| Kiểm tra bắt buộc | Kết quả |
|---|---|
| Boot 1: /, /wp-login.php, /wp-json/ | Cả 3 trả 200, body >100 ký tự, không có fatal/db connection error theo assert |
| Boot 2: cùng 3 endpoint | Cả 3 trả 200, cùng kiểm tra body/lỗi |
| File WordPress và database fixture | Tồn tại ở cả 2 boot |
| Option vne_local_persistence_probe | Ghi retained ở boot 1, đọc đúng retained sau boot 2 |
| Đóng app/server mỗi boot | asyncDispose thực hiện; postflight xác nhận không còn listener |
| Wrapper dọn fixture/cache | PASS sau lần bị dừng và lần smoke exit 0 |
| Database/config local thật | SHA256 trước/sau giống nhau |
| Lock/tiến trình/cổng | Không còn transient lock, smoke process hoặc listener 19400 |
| git diff --check / staged check | PASS trước commit |

## 4. Bằng chứng bảo toàn dữ liệu và cleanup

Database .local/site/wp-content/database/.ht.sqlite:
- Dung lượng trước: 417792 bytes.
- SHA256 trước/sau: F2A35E44C395FB790E6EA5524B21F2525D49F75D19FF129E8E3894FA08721FD8.

Config .local/site/wp-config.php:
- Dung lượng trước: 3339 bytes.
- SHA256 trước/sau: B2B3F3FE6DBF560B38DB952A868DF3120FFF14BB39BA96EA34E2F26B5C2892F8.
- Chỉ đọc hash, không in/ghi nội dung cấu hình hoặc bí mật vào báo cáo.

Inventory tmp trước/sau đều chỉ có thư mục tmp/tests rỗng đã tồn tại từ trước.
Hai fixture wordpress-viqZE4 và wordpress-8ago5D cùng run cache đã được wrapper dọn;
không xóa toàn bộ tmp hoặc dọn dữ liệu dựa tuổi file. Dependency/runtime ở .local/home,
database local và tài liệu/bằng chứng được giữ. Không tạo fixture hay backup thật mới
ngoài phạm vi runner để rồi xóa nhầm.

Postflight assertions PowerShell đạt: ProtectedDatabaseUnchanged=true,
ProtectedConfigUnchanged=true, LockRemoved=true, Port19400Closed=true,
SmokeProcessStopped=true. Không có tiến trình/database kiểm thử còn chạy.

## 5. Giới hạn và bước kế tiếp

PASS chỉ cho smoke baseline WordPress/PHP WASM/SQLite và cleanup; chưa chứng nhận
nghiệp vụ danh mục/UI, MySQL/extensions/cache hosting hoặc đăng nhập/quota Codex của
người học. Không khẳng định tăng workers loại mọi khả năng deadlock trong tương lai.
Không có cảnh báo runtime cần chấp nhận ở lần smoke đạt; cảnh báo 2 workers của cấu
hình cũ đã được xử lý bằng thay đổi cấu hình và kiểm thử lại.

Bước đề nghị S02: chuẩn bị nội dung mẫu landing page sản phẩm/dịch vụ dùng Codex
trên Windows và prototype bốn template theo brief S00. Chỉ bắt đầu sau khi chủ dự
án đồng ý rõ ràng. Không bắt đầu S02 hoặc phát hành từ kết quả PASS của S01.
