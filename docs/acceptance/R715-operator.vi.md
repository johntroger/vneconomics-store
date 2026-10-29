# R7.15 — Bootstrap và probe operator local

Tiếp nối [R7.14](R714-runtime.vi.md), thêm bộ sinh bootstrap và probe dùng chung thay cho đoạn lệnh/probe chỉ nằm trong harness. Không chạy lệnh lên Plesk, đổi release ref, publish payload hoặc mở runtime production.

## Hợp đồng

- `scripts/r6-css-operator.mjs` kiểm mode/environment, exact SHA/hash, parent R6 và tập field approval đóng. Runtime chỉ cho local-runtime với ownership token, productionApproved false, owner/baseline/disk reserve hợp lệ. Hash và định dạng hợp lệ không tự chứng minh CI đã đạt hoặc chủ dự án đã duyệt; hồ sơ GitHub/approval vẫn phải đối chiếu độc lập.
- Bootstrap dùng đường cố định của profile, kiểm realpath/symlink và **hai pin ngoài gói** của controller/manifest trước khi include. Không có đoạn PHP/path tùy ý từ request; không tải code, ghi file, đưa HMAC key vào command hoặc tự chọn/nâng quyền WordPress.
- `inspect-inbox` sinh `eval ... --skip-wordpress --skip-packages`, từ chối nếu WordPress/DB đã được nạp. [Tài liệu WP-CLI](https://developer.wordpress.org/cli/commands/eval/) xác nhận cờ skip-wordpress; chưa kiểm parser/cờ thực tế của Plesk. PHP bootstrap được thực thi trong test, shell wrapper được kiểm quoting; chưa gọi WP-CLI/Plesk thật.
- Các mode runtime chỉ sinh cho fixture đã sở hữu và yêu cầu context WordPress sẵn có. Command user1 chỉ thuộc fixture; production install/finish/rollback không được sinh. Entry runtime và helper ghi của controller giữ guard R7.14.
- `collectLocalHealthProof` chỉ GET hai URL loopback cố định, không đi theo redirect, giới hạn HTML1MiB/CSS256KiB và timeout30 giây mỗi request. Đối chiếu journal/pins/phase/challenge trước khi gọi mạng; kiểm lại expiry sau khi đọc response. HTTP503 được ghi nguyên trạng, không biến thành PASS.
- Proof ký HMAC gắn đúng owner/source/controller/payload/manifest/phase/challenge/thời gian. Key không có trong command hoặc kết quả. Không nhận object health tùy ý để ký. Fault header HTTP503 chỉ thuộc fixture; các proof cố tình sửa trong harness vẫn tách khỏi đường operator bình thường.

## Kiểm chứng

[Module local](R715-operator/module-test-1.json): PASS44 nhóm, gồm32 profile/inspect và12 operator. Bao phủ bootstrap thật trong PHP, WordPress context đã nạp, hash/manifest/symlink trước include, controller giả không được thực thi, field/path/code injection, các mode production bị chặn, HTTP thực, HMAC, expiry/identity, redirect và body quá lớn. Cleanup PASS.

[Native local](R715-operator/native-test-1.json): PASS72 nhóm gồm44 module/inspect/operator và28 runtime; đoạn runtime351 giây. DB/config local thật giữ nguyên, cleanup PASS. Native harness dùng bootstrap mới cho entry bình thường và collector mới cho HTTP; entry/raw proof riêng chỉ giữ để fault-injection. Bản CI cuối sẽ dùng trực tiếp proof module trả về cho các ca bình thường.

[Workflow contract](R715-operator/workflow-test.json): PASS; thêm dependency operator vào workflow adapter. CI exact-head còn chờ kết quả, chưa đóng gate nếu còn check chặn.

## Giới hạn vận hành

Inbox production R6 hiện hành vẫn chỉ có năm file và không có receiver.php. Lệnh inspect mới đòi profile sáu file nên **chưa thể dùng trực tiếp cho inbox hiện tại**; cần gate phân phối controller/payload phù hợp trước khi sử dụng trên hosting. Không tự thay nhánh/đích hoặc đưa controller từ local lên Plesk để vượt điều kiện này.

Chưa có phân phối key/proof production, CLI tự chạy, HTTP endpoint, scheduler hoặc adapter runtime production đã bật. Bộ sinh hiện tại và probe đã được giới hạn local/read-only; cần pin source/CI của tool bootstrap cùng source/controller/payload và duyệt đúng phạm vi trước gate hosting. Các bằng chứng này không chứng nhận quyền PHP/ZipArchive/quota/MariaDB hoặc HTTP trên Plesk.

Challenge hết hạn hiện dừng để inspect; chưa có lệnh gia hạn/đổi challenge trong giao thức R7.14. Không sửa journal, phá lock hoặc retry install để vượt expiry. Cần hoàn thiện đường phục hồi này trước khi mở runtime production cho luồng browser có thể bị ngắt phiên.
