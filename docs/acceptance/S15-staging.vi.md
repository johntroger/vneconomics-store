# S15 — Chuẩn bị và quyền truy cập staging

Ngày 23/10/2026. **Plugin 0.4.2/schema 3 đã cài và kích hoạt trên staging; 22 kiểm tra backend MariaDB đạt, cleanup đạt. DNS/HTTPS, HTTP/cache và cổng theme còn chờ — chưa nghiệm thu S15.** Chủ dự án đã cho phép bằng yêu cầu “bắt đầu S15”; không chờ duyệt lại bước này. Phạm vi tại [hợp đồng S15](../S15-staging-contract.vi.md).

Các mục bên dưới ghi tiến trình theo thời điểm; trạng thái hiện tại và bằng chứng mới nhất ở mục cuối báo cáo.

## Đã kiểm tra

- Hồ sơ Plesk/setup hiện chỉ xác nhận triển khai file `connection-v2` vào `store.vneconomics.com/codex-deploy-check` trên nhánh release ngày 17/10; chưa có URL/document root/database staging được ghi nhận.
- Inventory trình duyệt hiện chỉ trả tab `http://127.0.0.1:9430/` và không có phiên Plesk để sử dụng. Không suy rằng người dùng không có Plesk ở nơi khác.
- Đã tìm kết nối Plesk/hosting/SSH/SFTP qua Plugin Management; kết quả chưa có kết nối phù hợp cho hosting hiện tại. Không cài hoặc chuyển sang nhà cung cấp khác.
- CLI hiện tại chưa lấy được metadata webhook GitHub đã lưu để xác định origin Plesk. Không in URL webhook/token, không thay webhook/ref. Không suy lỗi đọc này thành trạng thái hoặc quyền Plesk.
- Đọc lại hash hai ZIP S14 bằng SHA256: khớp manifest/ref `594ccd9a7de812a49f2c0d8260d20cbfced71752`; plugin 0.4.2 và theme 0.7.0 vẫn sẵn sàng. Đây là kiểm tra artifact local, không phải kiểm thử staging.

## Chưa chạy

Khảo sát extensions/quota/cache thật và hành vi plugin trên MariaDB; hậu kiểm nội dung/file/website sau restore; deploy/kích hoạt/migration plugin/theme; smoke/tích hợp/quyền/khóa/trạng thái/cache trên hosting; lỗi/timeout/restore từng gói S14. Các phần này **CHƯA KIỂM THỬ**, không ghi PASS từ bằng chứng local hoặc chỉ từ thông báo restore thành công.

## Đầu vào đang chờ

Chủ dự án đã cung cấp URL `https://s88d13.cloudnetwork.vn:8443/smb/web/view`. Đã mở bằng trình duyệt trong ứng dụng; Plesk chuyển tới trang đăng nhập, chưa có phiên xác thực. Tab được giữ để chủ dự án tự đăng nhập; không yêu cầu mật khẩu/API key qua chat. Sau khi đăng nhập, tiếp tục chính S15 đã được phép để xác định staging, sự tách biệt production và backup trước thay đổi. Chưa xác định URL/document root/database staging.

### Cập nhật sau khi chủ dự án tạo clone

Chủ dự án dùng đăng nhập tự động từ nhà cung cấp trong Microsoft Edge; inventory và thử kết nối không cho agent truy cập phiên Edge. Đang hỗ trợ bằng ảnh và thao tác của chủ dự án, không yêu cầu chuyển cookie/token.

Ảnh Clone hiển thị source `store.vneconomics.com`, đích tạo subdomain mới và database tên tự sinh. Đã hướng dẫn chọn `staging-store.vneconomics.com`, để clone path trống; chủ dự án báo “đã xong”. Đây là xác nhận thao tác từ chủ dự án, chưa phải kiểm chứng file/database đích hoặc backup/restore.

Kiểm tra truy cập công khai: trình duyệt trả `ERR_NAME_NOT_RESOLVED`. DNS NS của `vneconomics.com` là `ns1.matbao.com`/`ns2.matbao.com`; truy vấn A cho `staging-store.vneconomics.com` qua resolver máy và trực tiếp `ns1.matbao.com` đều trả tên không tồn tại. `store.vneconomics.com` hiện có A `103.138.88.13`. Cần thêm bản ghi DNS cho staging ở nơi quản lý DNS Mắt Bão và xác minh lại. Chủ dự án báo chưa sửa được DNS; chưa cài gói S14 hoặc đổi production.

### Bằng chứng staging, backup và restore do chủ dự án thao tác

- Thẻ Plesk xác nhận domain `staging-store.vneconomics.com`, WordPress 7.1.3/PHP 8.3.36; Search engine indexing ở trạng thái tắt trước backup. Giao diện ghi No certificate. Đây là thông tin từ ảnh, chưa chứng minh HTTPS/noindex qua HTTP hoặc MySQL thực tế.
- Đã tạo backup tên `staging-store.vneconomics.com__2026-10-23T11_02_11+0700.zip` lúc 11:02:11 ngày 23/10/2026; WP Toolkit hiển thị 77 MB, File Manager hiển thị 77.5 MB. Chưa có hash archive hoặc xác nhận tải bản sao xuống máy.
- Hộp thoại restore hiển thị bản 11:02:11 và tùy chọn Delete existing data before restoring. Đã giải thích tác động thay dữ liệu staging; chủ dự án thực hiện.
- [Ảnh kết quả](S15/plesk-staging-restore-completed.png), do chủ dự án cung cấp lúc 11:13:30, có thông báo xanh: site đã được restored về trạng thái 2026-10-23 11:02:11. Tên hiển thị WordPress vẫn là `store.vneconomics` do clone giữ tên; domain staging đã được xác định ở thẻ trước đó, tên archive cũng là staging.
- Kết luận giới hạn: **Plesk báo thao tác restore hoàn tất**. Chưa kiểm tra nội dung/database/file sau phục hồi; không coi đây là backup/restore được nghiệm thu đầy đủ hoặc S15 PASS.

### Hậu kiểm read-only qua WP-CLI của staging

Ảnh chủ dự án cung cấp sau restore xác nhận:

- `option get home`: `https://staging-store.vneconomics.com`, exit code 0.
- `option get blog_public`: `0`, exit code 0; xác nhận cấu hình backend tắt lập chỉ mục, chưa thay kiểm tra robots/noindex trên HTTP.
- `db query "SELECT VERSION() AS db_version;"`: exit code 1 do hosting vô hiệu hóa `proc_open`/`proc_close`. Không thay cấu hình hoặc yêu cầu bật các hàm này.
- Dùng kết nối WordPress hiện có: `eval 'global $wpdb; echo $wpdb->get_var("SELECT VERSION() AS db_version"), PHP_EOL;'`: kết quả `10.6.22-MariaDB-cll-lve`, exit code 0. Xác nhận đọc được MariaDB thật sau restore; không chứng minh truy vấn nghiệp vụ, mutex, transaction hoặc migration của plugin S14 đã đạt.

Bằng chứng: [URL/noindex và giới hạn subprocess](S15/plesk-staging-cli-options.png), [MariaDB VERSION qua wpdb](S15/plesk-staging-cli-mariadb.png). Chưa có đối chiếu nội dung/file với archive backup; không nâng kết quả thành nghiệm thu toàn bộ restore/S15.

### Nội dung và cặp phiên bản nền sau restore

Chủ dự án dán đầu ra ba lệnh read-only trên WP-CLI staging, cả ba exit code 0:

- `post list --post_type=post,page --post_status=publish --fields=ID,post_type,post_title --format=table`: 14 mục công khai gồm 3 bài (95, 92, 1) và 11 trang (87, 84, 81, 78, 71, 67, 7, 8, 9, 10, 2). Bài tin tài chính/crypto, trang About/Home/Shop/Cart/Checkout/My account và các trang tiếng Việt là dữ liệu clone. Đã đọc được nội dung từ DB sau restore; chưa so với archive và chưa có seed nội dung S13/S14.
- `plugin list --fields=name,status,version --format=table`: active `ai-provider-for-anthropic` 1.0.3, `visa-acceptance-solutions` 2.1.0, `woocommerce` 10.5.1; inactive `akismet` 5.6 và `hello` 1.7.2; must-use `wp-toolkit` 6.11.6-10889; dropin `maintenance.php` không có version. Chưa có `vne-library-core`. Không yêu cầu thử dịch vụ AI/thanh toán hoặc bật hàm subprocess để khảo sát.
- `theme list --fields=name,status,version --format=table`: active `astra` 4.12.0; inactive `coba-theme` 1.0, `twentytwentyfive` 1.4, `twentytwentyfour` 1.4, `twentytwentythree` 1.6. Chưa có `vibelab`.

Cặp trung gian thực tế cần kiểm chứng là plugin VNE 0.4.2 + Astra 4.12.0, khác cặp theme VibeLab 0.6.0 đã thử ở S14 local. Không tự coi cặp này đã tương thích. DNS authoritative `ns1.matbao.com` được đọc lại sau danh sách theme vẫn trả tên staging không tồn tại; tiếp tục chuẩn bị read-only qua Plesk, chưa deploy gói hoặc mở cổng theme.

### Đường dẫn và môi trường PHP qua CLI

Chủ dự án gửi kết quả `eval` chỉ đọc, exit code 0:

- ABSPATH: `/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/`.
- Database: `vne35060_wp_udx1z`. Chưa có đối chiếu DB_NAME của source để chứng nhận độc lập database chỉ từ tên này.
- PHP CLI 8.3.36; `mysqli`, `curl`, `ZipArchive`: true.
- `WP_CACHE`: false; `wp_using_ext_object_cache()`: null. Đây là kết quả CLI, chưa đủ loại trừ cache proxy/CDN/OPcache hoặc drop-in ở luồng HTTP.

[Ảnh File Manager lúc 11:58:58](S15/plesk-staging-wp-content.png) xác nhận breadcrumb `Home directory > staging-store.vneconomics.com > wp-content`, có `plugins`, `themes`, `mu-plugins`, `uploads`, `maintenance.php` và các thư mục WordPress khác. Đích thành phần đã xác định:

- Plugin: `/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/wp-content/plugins/vne-library-core/`.
- Theme: `/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/wp-content/themes/vibelab/`.

Đọc lại DNS authoritative sau ảnh 11:58:58 vẫn trả tên staging không tồn tại. Hai ZIP S14 còn nguyên tại thư mục artifact; chưa upload/giải nén/kích hoạt. Không yêu cầu thêm ảnh thư mục con chỉ để lặp việc xác định đích. Triển khai và smoke HTTP/HTTPS vẫn chờ DNS/chứng chỉ, rồi mở cổng plugin trước theme theo S15.

## Bảo toàn và cleanup

Agent chỉ đọc hồ sơ/inventory/hash và lưu tài liệu/ảnh bằng chứng; các thao tác clone/backup/restore staging được chủ dự án thực hiện trong Edge. Chưa tạo fixture/cache kiểm thử mới, chưa upload gói S14 hoặc gọi API có phí. Giữ nguyên backup thật trên hosting, ảnh gốc, ZIP/manifest, database local, nguồn và bằng chứng S13/S14. Preview S13 đang chạy được giữ; cache của tiến trình đang hoạt động sẽ dọn khi dừng. Chưa có deploy gói S14 hoặc thay production.

Không chuyển S16. Kết quả S15 vẫn chờ quyền thực tế/đích staging theo kế hoạch gated; không coi phần chuẩn bị là hoàn thành S15.

## Chuẩn bị kiểm tra backend chủ động khi chờ DNS

Chủ dự án cho phép chủ động tiếp tục S15 và chỉ hỏi việc quan trọng; đồng thời đã cung cấp cổng Mắt Bão. Đã mở đúng trang dịch vụ trong trình duyệt ứng dụng, chuyển tới trang đăng nhập Mắt Bão chính thức. Phiên Edge chưa truy cập được; đang chờ chủ dự án tự đăng nhập trong tab ứng dụng. Không yêu cầu mật khẩu/OTP/token trong chat, không sao chép cookie.

Đã tạo bộ audit read-only và plugin ZIP S14 thành một gói tooling ngoài web root để giảm chép lệnh tay. Tham chiếu phần công cụ của [hợp đồng S15](../S15-staging-contract.vi.md). Không thêm gói theme hoặc thay mã plugin/theme.

- `npm run test:staging-tools`: **24 PASS local**; target root/database/home/siteurl/noindex, manifest/ZIP bị sửa, file plugin thiếu/thừa/thay đổi, path traversal, chặn chạy trực tiếp không có WP-CLI; hai build giống byte và giải ZIP bằng PowerShell độc lập; lint/guard fixture backend; hash database/config local giữ nguyên. [Bằng chứng](S15/audit-tool-local-tests.json).
- `npm run build:staging-tools`: giữ gói `artifacts/staging/594ccd9a7de812a49f2c0d8260d20cbfced71752/s15-plugin-preflight.zip`, SHA256 `e70b9c4fba2faf3957a5d38995affc42ac82e754df7de9d1d5b9fe0c85092cd0`. Plugin bên trong vẫn SHA256 S14 `2648f76f915c456ff4221a45862d60ecaf9cc5cdd468781ea8b302f6d63ee4c5`.
- Cả hai lệnh qua run-clean; fixture/cache mới đã dọn sau exit. Đây là kiểm thử guard/hash của công cụ, **không phải** WordPress/MariaDB integration hoặc S15 hosting PASS.
- Tại thời điểm chuẩn bị công cụ chưa upload/chạy trên hosting; kết quả thực hiện sau đăng nhập ở mục sau.

## Kết quả thực hiện trực tiếp trên hosting sau đăng nhập

Chủ dự án đã đăng nhập Mắt Bão trong trình duyệt ứng dụng; phiên tự đăng nhập Plesk dùng được. Xác minh domain staging ID 319, root `/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/`, DB `vne35060_wp_udx1z`; danh sách Plesk ánh xạ source store tới DB riêng `vne35060_wp_kmqnf`. Không đổi source/production.

- Upload và giải nén tooling vào Home `/s15-release`, ngoài các document root; không ghi đè file có sẵn. Audit xác minh manifest và ZIP pin đúng SHA256 trước cài đặt.
- Cài plugin từ ZIP S14, audit `INSTALLED_NOT_ACTIVE` kiểm đủ 10 file; kích hoạt thành công. Audit tiếp theo `ACTIVE_PLUGIN_OBSERVED`: version 0.4.2, schema 3, không thiếu/thừa/thay file. Astra 4.12.0 giữ nguyên. Chưa upload/kích hoạt VibeLab.
- REST dispatch nội bộ PHP: anonymous đọc danh mục 200, context edit 403, ghi 401. Header qua `rest_post_dispatch` có `private, no-store, no-cache, must-revalidate, max-age=0` và `VNE-Cache-Policy: bypass`. Đây không phải lượt HTTP thật hoặc chứng nhận cache proxy/CDN.
- Probe SQL với option có UUID: 6 kết quả true gồm insert đầu, từ chối insert thứ hai, bảo toàn chủ khóa, rollback, commit, cleanup. Hai insert chạy tuần tự, chưa chứng minh cạnh tranh từ hai tiến trình.
- Fixture `scripts/fixtures/s15-backend-probe.php`, SHA256 `b80b44cad063b7faf29350784a6257b79970381008649d2865ca28c5553abae3`, chạy trên MariaDB thật: **22 kiểm tra PASS**, failure null. Gồm InnoDB posts/postmeta/options; quyền admin/anonymous; tạo và sửa một draft; revision thay đổi; stale base 409 giữ dữ liệu; payload sai không đổi revision; trạng thái suspended không nâng validation; theme và bài/trang cũ giữ nguyên; xóa fixture/meta/khóa. Chặn HTTP và mail trong riêng tiến trình kiểm thử; không gọi AI/thanh toán, không seed hoặc xuất bản.
- Hậu kiểm độc lập: `fixturePostsAndRevisionsRemaining = 0`, `probeOptionsRemaining = 0`, theme `astra`, schema 3; exit code 0. Các lệnh kiểm thử đóng xong, fixture đã dọn. Giữ backup thật và tooling phục vụ S15.

Bằng chứng: [nhật ký WP-CLI](S15/hosting-cli-plugin-log.txt), [JSON trích từ nhật ký](S15/hosting-backend-results.json), [ảnh hậu kiểm](S15/hosting-backend-cleanup.jpg). Tooling local đã kiểm thử qua run-clean; fixture/cache của các lượt đó được dọn. Preview local đã dừng và cache đúng lượt preview đã dọn, database local giữ nguyên.

## Phần còn mở và quyết định DNS

Form Mắt Bão đã chuẩn bị **một** bản ghi A `staging-store` → `103.138.88.13`, TTL mặc định; 10 bản ghi hiện có được giữ nguyên. [Ảnh đề xuất](S15/dns-staging-proposal.jpg). Chưa bấm Thêm bản ghi: câu trả lời “tôi chưa sửa được DNS” chưa phải đồng ý rõ ràng cho thay đổi này, đã hỏi xác nhận cụ thể để agent thao tác giúp.

S15 còn thiếu DNS/chứng chỉ và kiểm thử HTTP/HTTPS; khảo sát quota/cache và purge thật; cạnh tranh đồng thời; health/cặp Astra đầy đủ trước mở cổng theme; triển khai VibeLab và smoke UI; các ca lỗi/chậm/timeout/khôi phục từng gói và hậu kiểm restore đầy đủ. Không suy kết quả backend thành S15 PASS. Không bắt đầu S16.

### DNS đã lưu sau xác nhận rõ ràng

Chủ dự án xác nhận “Đồng ý thêm DNS”. Agent bấm Thêm bản ghi đúng một lần tại Mắt Bão: A `staging-store` → `103.138.88.13`, TTL mặc định được lưu là 3600 giây. Giao diện chuyển từ 10 lên 11 bản ghi và hiển thị dòng staging mới; không sửa/xóa các dòng hiện có. [Ảnh kết quả](S15/dns-staging-added.jpg), [nội dung giao diện](S15/dns-staging-added.txt).

Truy vấn riêng cả `ns1.matbao.com` và `ns2.matbao.com` đều trả A `staging-store.vneconomics.com = 103.138.88.13`, TTL 3600. [Kết quả authoritative](S15/dns-authoritative-results.json). Truy vấn trong sandbox ban đầu không ra được máy chủ DNS; kiểm tra lại ngoài sandbox thành công. Chưa chứng nhận mọi resolver đã hết negative cache. DNS authoritative đã đạt; chứng chỉ và HTTP/HTTPS vẫn chờ kiểm tra, không nâng thành S15 PASS.

### Cấp SSL: đã duyệt điều khoản, đang thiếu email liên hệ

Chủ dự án đồng ý tiếp tục SSL trong S15. Phiên Plesk cũ hết hạn; đã làm mới bằng nút Bảng điều khiển tại Mắt Bão và điều hướng bằng liên kết trong phiên mới. SSL/TLS của đúng domain 319 hiển thị No Certificate Installed và lựa chọn Let's Encrypt miễn phí.

Form chỉ chọn `staging-store.vneconomics.com`, không wildcard/www, xác minh HTTP-01; thông báo chứng chỉ tự gia hạn trước hạn 30 ngày. Chủ dự án xác nhận rõ “Đồng ý điều khoản và cấp SSL staging”; sau đó agent bấm Get it free một lần.

Kết quả **FAIL cấp chứng chỉ**, nguyên nhân cụ thể: `The domain's owner does not have an email address. Please specify a valid email address and request the SSL/TLS certificate again.` [Chi tiết lỗi](S15/ssl-issue-missing-email.txt), [ảnh lỗi](S15/ssl-issue-missing-email.jpg), [form điều khoản](S15/ssl-terms-pending.jpg). Chưa có SSL mới; không bỏ qua cảnh báo chứng chỉ hoặc đổi production. Đã hỏi địa chỉ email chủ dự án muốn dùng cho liên hệ Plesk/đăng ký Let's Encrypt; chưa tự điền email hoặc sửa hồ sơ tài khoản. Không tạo fixture/cache mới trong lượt này; giữ ảnh/log làm bằng chứng. HTTPS/noindex qua HTTP và các ca S15 còn mở.

### SSL cấp thành công sau bổ sung email được duyệt

Chủ dự án cung cấp địa chỉ email để dùng cho liên hệ Plesk và đăng ký Let's Encrypt. Chỉ điền External email address trong My Profile, giữ trống các trường mật khẩu; Apply trả `Profile was updated.` Không ghi địa chỉ email vào hồ sơ Git này.

Thử lại cùng yêu cầu đã duyệt: riêng staging, HTTP-01, không wildcard/www. Plesk cấp và gán `Lets Encrypt staging-store.vneconomics.com`, hạn 21/01/2027, `Will be automatically renewed`; domain chính `Secured`. Redirect HTTP → HTTPS hiển thị bật; HSTS giữ tắt. Không chạy SSL Labs hoặc mua dịch vụ. [Ảnh SSL](S15/ssl-installed.jpg), [trạng thái Plesk](S15/ssl-installed.txt).

Lượt mở HTTPS khi đang cấp còn báo `ERR_CERT_COMMON_NAME_INVALID`; không bỏ qua cảnh báo. Sau khi Plesk báo thành công, mở tab mới `https://staging-store.vneconomics.com/` thành công với kiểm tra chứng chỉ bình thường, hiển thị website Astra của clone. DOM trang thật có robots `noindex, nofollow`. [Metadata HTTPS](S15/https-meta.json), [ảnh website](S15/https-astra.jpg). Chưa kiểm chứng redirect bằng chuỗi response HTTP hoặc chính sách noindex mọi route.

Kết luận phần SSL/noindex trang chủ: **PASS** trong phạm vi quan sát trên. Không tạo dữ liệu kiểm thử trên site; giữ chứng chỉ thật và bằng chứng. Plugin vẫn 0.4.2/schema 3, Astra giữ nguyên; chưa triển khai VibeLab. S15 còn các ca HTTP/plugin/quyền/revision/cache, đồng thời, theme và phục hồi; chưa PASS toàn bước, không chuyển S16.
