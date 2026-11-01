# Bộ cài theme PHP trên hosting

Đây là công cụ CLI private, không phải plugin hoặc endpoint web. Không phụ thuộc `/usr/local/bin/wp` của WP Toolkit, Composer, SSH, key/HMAC hoặc API hosting. Publisher PR20 tiếp tục tạo đúng manifest/bốn ZIP hiện hành; không đổi theme/plugin/schema vì phát hành bộ công cụ này.

## Đầu vào và đường nhận

Workflow `theme-host-installer.yml` checkout exact source và kiểm native bằng PHP8.3/WordPress fixture, tạo artifact chứa controller, manifest công cụ, kết quả kiểm và mẫu lệnh có pin SHA256 controller. Manifest công cụ có profile `vibelab-theme-host-installer-v1`, chỉ cho phép file `theme-host-installer.php`; các file test/lệnh là tài liệu review, không phải payload ứng dụng.

`npm run review:theme-host-installer -- <CI_RUN_ID>` tải archive GitHub thật, kiểm workflow/repo/source/run-attempt/job/digest/expiry và closed file allowlist; so controller với exact Git blob, kiểm manifest/proof rồi giữ receipt trong `artifacts/theme-host-installer-ci/<run>-<attempt>`. Lệnh chỉ đọc GitHub, không tạo ref hoặc chạy PHP tải về.

Artifact hiện là sản phẩm review. Trước gate hosting phải kiểm repo/workflow/source/run/artifact digest và bytes Git; tạo payload công cụ riêng trên GitHub rồi Plesk nhận vào private tools inbox `/deploy-tools/theme-host`. Không đưa code/ZIP local thẳng lên hosting; không đổi production app branch để chở gói công cụ thay cho manifest ứng dụng. Việc tạo repository/ref/đích tools, control directory và cấu hình nhận công cụ cần nằm trong gate production cụ thể, chưa được thực hiện ở bước local này.

CLI production pin root `/var/www/vhosts/vneconomics.com/store.vneconomics.com`, home `https://store.vneconomics.com`, DB `vne35060_wp_kmqnf`, application inbox `/deploy-inbox/production`, clone `/git/vneconomics-store-production.git`, control `/deploy-control/theme-release` dưới cùng subscription home. Không có cờ đổi target; thư mục control phải tồn tại, canonical,0700, cùng owner với root. Không tự tạo đường, đổi quyền hoặc provision key. Bootstrap trong artifact kiểm hash controller trước `require`; không chạy controller bằng đường chưa đối chiếu GitHub.

## Cách chạy và journal

Mỗi lệnh nhận mode, exact payload SHA và manifest SHA256 **đã được duyệt**. Đây là điều kiện caller phải cấp; source/CI PASS không tự thành approval. Manifest `approval.deployAuthorized:false` của candidate không được relabel; quyền phát hành được ghi ở gate/promote và lệnh exact pins, không nằm trong boolean tự khai của gói.

- `inspect`: kiểm manifest/ZIP/ref Plesk và đọc journal, không boot WordPress hoặc ghi. Đây không phải chứng nhận baseline ứng dụng/DB.
- `install`: kiểm đúng root/home/DB/theme/plugin/schema, toàn bộ file theme baseline và plugin, archive member hash/allowlist, ref/manifest. Đặt journal `INSTALLING` trước khi dùng `WP_Upgrader`; sau kiểm file/data chuyển `PENDING_HEALTH`.
- `finish`: chỉ tiếp tục journal cùng pins, pending còn trong300giây. Kiểm HTTP200, marker/version và CSS hash với TLS verification, không redirect. PASS chuyển `COMPLETE`; lỗi health khi file/ref/data vẫn khớp thì cài previous-theme và ghi `ROLLED_BACK`.
- `apply`: ghép install và finish, dùng cho post-deploy sau gate tương ứng. Chạy lại COMPLETE cùng pins chỉ kiểm bytes rồi trả `ALREADY_COMPLETE`.
- `rollback`: chỉ nhận pending rõ trạng thái, cùng pins, không timeout/drift; không phục hồi database. Không có mode phá lock/reset/relabel hoặc tự chữa lượt INSTALLING/ROLLING_BACK bị gián đoạn.

Flock chống hai tiến trình cùng lúc; lock file được giữ, không unlink để tránh race inode. Sau khi tiến trình kết thúc kernel lock được nhả, journal chưa hoàn tất vẫn chặn lượt mới. PHP exception/timeout giữa upgrade giữ phase chưa hoàn tất để inspect; không tự đoán phần ghi dở. COMPLETE cũ được giữ thành receipt immutable khi mở successor đúng production parent. ROLLED_BACK vẫn chặn tự cài lại. Không xóa journal/receipt hoặc restore DB để vượt guard.

Bộ cài đọc/hash năm bảng posts/postmeta/terms/term_taxonomy/term_relationships; không chủ động ghi dữ liệu nghiệp vụ. WordPress bootstrap/upgrader có thể cập nhật cache/options/transient; đây không phải lời đảm bảo toàn bộ database không có một byte ghi. Plugin code phải giữ byte-identical. CấpB/template vẫn cần backup phù hợp theo runbook; previous-theme là rollback code, không thay backup DB.

## Kiểm thử và giới hạn

`npm run test:theme-host-installer` dùng run-clean, Git fixture và WordPress native riêng, không liên hệ Plesk. Kiểm cài/HTTP/rollback, duplicate/pending/crash/timeout/conflict và các guard pin/hash/baseline/path. HTTP trang/CSS được fetch thật từ localhost; do WASM chặn external networking, transport filter WordPress đưa chính các response đã đo đó vào hàm hậu kiểm. Không coi đây là chứng nhận HTTPS/networking hoặc flock contention đa tiến trình trên hosting.

Bước này không bật Automatic, webhook, scheduler, post-action, không tạo control/tools path, không merge main/deploy. Chưa có một thay đổi theme thật đi qua bộ cài trên production. Chỉ khép tự động hóa sau gate hosting có exact công cụ/payload/source/CI/backup/lệnh và hậu kiểm, không chỉ vì artifact PASS. Mẫu lệnh chứa placeholder pins nên không dán/chạy nguyên mẫu.
