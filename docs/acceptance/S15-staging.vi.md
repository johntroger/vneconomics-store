# S15 — Chuẩn bị và quyền truy cập staging

Ngày cập nhật 24/10/2026. **Staging đang chạy plugin 0.4.2/schema 3 + VibeLab 0.7.0, có DNS/SSL/noindex và 11 mục mẫu được chủ dự án duyệt. Tổng 692 điểm HTTP/127 request của runner đạt, gồm hồi quy lặp. Đã bổ sung lỗi tại activation hook của plugin thật trong transaction MariaDB và phục hồi toàn cây theme active sau lỗi theo request; cleanup/hậu kiểm đạt. Responsive đạt 12 bố cục; 12 báo cáo Lighthouse mobile có metric đạt LCP/CLS. Restore file/DB thật đạt, giữ 3 backup. Chủ dự án xác nhận “đã thử, ổn” ngày24/10/2026: S15 được nghiệm thu trong phạm vi và giới hạn đã ghi; S16 chưa được phép.** Giới hạn các phép thử được ghi tại mục cuối. Chủ dự án đã cho phép bằng yêu cầu “bắt đầu S15”; không chờ duyệt lại bước này. Phạm vi tại [hợp đồng S15](../S15-staging-contract.vi.md).

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

## HTTP, quyền, revision, khóa và báo lỗi trên hosting

Đã dùng phiên WordPress staging từ Plesk. `scripts/test-s15-public-http.mjs` chỉ gửi tới hostname staging cố định, anonymous, xác minh TLS mặc định; POST probe là payload rỗng vào các route phải từ chối. Chạy qua run-clean, tuần tự; không lưu cookie/nonce/credentials vào runner.

| Lượt | Điểm kiểm tra | Request | Bằng chứng |
|---|---:|---:|---|
| Public nền Astra: HTTPS redirect, robots/noindex, API, quyền, conditional request/bypass | 57 | 13 | [JSON](S15/public-http-results.json) |
| Nháp thật: API/list/native URL không lộ nội dung | 12 | 3 | [JSON](S15/public-draft-http-results.json) |
| Trước duyệt: public giữ bản gốc, preview/proposal chỉ riêng | 18 | 4 | [JSON](S15/public-fixture-before.json) |
| Sau duyệt: public item/list chuyển đúng title mới | 18 | 4 | [JSON](S15/public-fixture-after.json) |
| Báo lỗi private: URL/type/API/admin chặn anonymous | 9 | 5 | [JSON](S15/public-fixture-report.json) |
| Sau xóa fixture: 404 và vắng khỏi danh sách public | 10 | 2 | [JSON](S15/public-fixture-cleanup.json) |
| Theme mới: home/archive/search/support/privacy, noindex/bypass/feed | 56 | 8 | [JSON](S15/theme-http-results.json) |

Tổng **180 điểm kiểm tra HTTP đạt, 39 request**. Không suy các header này thành chứng nhận mọi tầng CDN hoặc purge upstream.

- UI draft #101: lưu/sửa thành công, biểu mẫu cũ báo xung đột revision, đọc lại vẫn giữ title mới. Lưu suspended không nâng validation khỏi not_tested. Đề xuất thiếu danh mục/nguồn bị chặn, không ghi đè. [Kết quả](S15/ui-draft-results.json), [ảnh xung đột](S15/ui-stale-revision.jpg), [trạng thái](S15/ui-state-saved.jpg).
- Cleanup draft lần đầu dừng trước xóa vì CLI actor 0 đọc private item trả WP_Error; sửa quyền actor trong riêng tiến trình rồi chạy lại. Kết quả post/revision/meta/lock đều 0, Astra giữ nguyên. Giữ cả lỗi và kết quả sửa trong [log](S15/ui-cleanup-cli-log.txt).
- Khóa MariaDB: hai kết nối mysqli độc lập gửi INSERT IGNORE bất đồng bộ vào cùng option UUID; affected rows `[0,1]`, đúng một chủ thắng, chủ không bị thay, cleanup true. Đây là cạnh tranh SQL thực, không phải hai request WordPress sửa cùng bài. [Log](S15/ui-and-sql-cli-log.txt).
- Chủ dự án cho phép bài tạm công khai trên staging. Tạo guide #103, danh mục #19 và đề xuất #104; so sánh/preview riêng đúng title. UI duyệt #104 thành approved; API/list anonymous trước/sau đạt. [Preview](S15/ui-proposal-preview.jpg), [duyệt](S15/ui-proposal-approved.jpg).
- Service báo lỗi dưới anonymous actor: **9 kiểm tra đạt** gồm nonce/honeypot/revision sai, một report private #106, idempotency, pin approved revision và type không public. Chặn mail/HTTP ngoài trong tiến trình. Đây là service invocation, chưa phải gửi form qua browser. [Hàng đợi quản trị](S15/private-report-admin.jpg).
- Xóa đúng guide/proposal/report/category/transient/registry thuộc lượt thử. Post/children/meta/lock đều 0; danh mục và rate transient đã mất; hash 14 bài/trang gốc khớp trước/sau. [Kết quả CLI](S15/plugin-extended-results.json), [log](S15/plugin-extended-cli-log.txt), [ảnh cleanup](S15/public-fixture-cleanup.jpg). Mọi lượt runner đóng và dọn cache local; backup thật giữ nguyên.

## Cổng plugin và triển khai theme S14

Cổng chức năng plugin đạt trên cặp Astra 4.12.0 + VNE 0.4.2/schema 3 bằng bằng chứng backend/HTTP/UI/report/SQL nêu trên. Vẫn giữ giới hạn về contention toàn request, upstream cache và hiệu năng hosting trong nghiệm thu S15. Helper audit chỉ quan sát và không tự quyết định mở cổng.

Đọc lại SHA256 theme ZIP S14 khớp `f6124d7693e8c8af7e8dcd7668012b8c0ed986d338c2a9e864e0f77afa3f0778`. WordPress báo cài thành công; trước kích hoạt, đối chiếu **36/36 file** với manifest pin hash: không thiếu, thừa hoặc thay đổi. Sau đó kích hoạt VibeLab 0.7.0, UI báo New theme activated. Không cập nhật các theme/plugin khác.

WordPress tự chuyển menu primary #16 từ theme clone sang VibeLab. Đã lưu cấu hình ban đầu tại Home `/s15-release/vibelab-initial-theme-mods.json` ngoài webroot, bỏ riêng binding menu trong theme VibeLab để dùng bốn link fallback đúng thiết kế. Không xóa menu hoặc bài cũ, không đổi theme mods Astra.

Hậu kiểm plugin vẫn 0.4.2/schema 3, 10 file hash khớp; theme runtime vibelab 0.7.0. [Log theme](S15/theme-cli-log.txt), [JSON runtime](S15/theme-runtime-results.json), [ảnh trang chủ](S15/vibelab-home.jpg). HTTP theme đạt 56 điểm; trang chủ hiện empty state đúng vì chưa nhập nội dung VNE thật.

## Giới hạn hiện tại và bước cần quyết định

- Site Health: REST, loopback, HTTPS và modules đạt; cảnh báo page cache không phát hiện và trung vị phản hồi 2222ms, cùng 5 khuyến nghị. [Chi tiết](S15/site-health.txt), [ảnh](S15/site-health.jpg). Plesk PHP riêng domain hiển thị opcache.enable on (Default) nhưng vô hiệu hóa opcache_get_status, nên chưa kết luận OPcache thật tắt chỉ từ Site Health. Không bật page cache để che cảnh báo vì thiết kế đang yêu cầu bypass/no-store.
- Chưa có bộ nội dung VNE trên staging để kiểm thử card/detail/guide/CTA và form hoàn chỉnh; chỉ có các fixture đã xóa. Đã chuẩn bị [đề xuất nhập 6 tài nguyên, 4 hướng dẫn, 1 bộ thực hành](../S15-content-import-proposal.vi.md), chờ chủ dự án chọn trước khi giữ nội dung công khai lâu dài.
- Chưa kiểm chứng UI mobile trên hosting (công cụ trình duyệt hiện không có chỉnh viewport), LCP/CLS hosting, tình huống cache fail/503/recover thật, lỗi/chậm/timeout/theme rollback và hậu kiểm restore đầy đủ. Không ghi PASS từ local để thay các mục này.
- S15 **đang thực hiện, chưa nghiệm thu**. Không đổi production, không chuyển S16; lưu nhánh staging và bằng chứng để tiếp tục.

## Nhập nội dung mẫu được duyệt và kiểm thử website có dữ liệu

Chủ dự án xác nhận “Đồng ý nhập bộ mẫu lên staging”. Bộ nhập riêng gồm `scripts/build-s15-content.mjs`, `scripts/fixtures/s15-content-import.php`; không chạy trực tiếp seed S13. Trích payload bằng PHP offline với stub, loại bootstrap/config writes/ẩn bài mặc định và toàn bộ ghi validation. Giữ ngày/nguồn quan sát lịch sử; không nhận đã chạy lại repo/công cụ. Bộ build kiểm tra determinism, counts, PHP lint/direct-entry guard và 13 assertion target/hash/link; các lượt qua run-clean đã dọn fixture/cache.

Một lượt compile local đầu dừng vì stub trùng hàm save_state; đã sửa capture và chạy đạt. Build cũ chưa upload được dọn theo đúng bốn file/hash của lượt tạo; artifact triển khai giữ tại `artifacts/staging/594ccd9a7de812a49f2c0d8260d20cbfced71752/content-import/edb20972c8e8/`. Payload SHA256 `d96ee1409998e06c6aae822adb0e60b609fc0cac927b1bd7ac1a68cb6ec5a934`; importer `edb20972c8e86cd4643540c281daac55a0ef335542d00b4f1ef5c92de71ad0c3`; ZIP `aad1499e7b1485a4c7c21f3e53e5d0d7b819bd15b6f8818c4d69a93543236d18`.

Upload/giải nén Home `/s15-content`, ngoài webroot. Hosting xác minh cả ba SHA; dry-run đúng staging/root/DB/noindex/plugin/theme, 11 tiêu đề và 3 danh mục. Importer dùng journal atomically bằng INSERT IGNORE; từ chối nội dung trùng hoặc target sai; rollback chỉ các ID do lần nhập tạo nếu lỗi. Apply thành công, chạy apply lần hai trả ALREADY_IMPORTED không tạo bản trùng. Không đổi blogname/language/permalink theo seed local, không chép DB/config/user; chặn mail/network và tắt pingback/comment mặc định trong riêng tiến trình nhập.

Sản phẩm giữ lại: resource IDs 108–113, guide IDs 114–117, practice 118; categories 20–22. [Journal/URL](S15/content-import-results.json), [log](S15/content-import-cli-log.txt), [hậu kiểm](S15/content-postflight.json). Đủ 6/4/1, không còn URL placeholder, tất cả not_tested, comments/pings closed, không có pending pingback; hash 14 bài/trang cũ khớp trước/sau. Registry `vne_s15_content_import` là cấu hình truy vết sản phẩm cần giữ, không phải fixture cần xóa.

`test:staging-content`: **122 điểm/17 request PASS** với API counts/quyền riêng, 11 trang, hai CTA thẻ, liên kết vào bài Mộc Studio, môi trường/revision và mục lục bài, search, noindex và bypass. [Kết quả](S15/content-http-results.json), [trang chủ](S15/vibelab-home-content.jpg). Lượt đầu dừng ở assertion tên class mục lục không khớp HTML hiện có, không phải lỗi website; sửa kiểm tra theo aria-label thực tế và chạy lại. Giữ [lượt đầu](S15/content-http-initial-results.json).

Form báo lỗi anonymous thực qua HTTP: **25 điểm/6 request PASS**; GET form, từ chối mô tả ngắn, POST thành công 303, receipt xác nhận đã lưu, không lộ mô tả, gửi lặp cùng code, danh sách private 404. [Kết quả](S15/http-report-results.json). Lượt đầu bộ gửi lấy nhầm input ẩn của form tìm kiếm nên server trả 400, chưa lưu report; đã cô lập đúng report form và chạy lại, giữ [lượt đầu](S15/http-report-initial-results.json). Không gửi email. Report #119 đã xóa; chỉ một report cho hai POST hợp lệ; meta/locks 0; rate-limit mới và registry đã dọn, resource revision không đổi. [Cleanup](S15/http-report-cleanup.json), [log](S15/content-and-report-cli-log.txt).

## Fail-closed cache và phục hồi trên HTTPS thật

Guard chỉ staging + VibeLab, dừng nếu có incident thật đang mở. Lưu metadata cache trước test trong registry riêng; filter purge_result=false chỉ trong tiến trình CLI tạo incident thử. Home, API items và trang hỗ trợ đều trả **503/no-store/bypass**, không trả conditional 304: **15 điểm/3 request PASS**. [Kết quả](S15/cache-failed-http-results.json). Lượt đầu parser không giải mã Unicode JSON nên assertion thông báo dừng dù HTTP đã đúng503; sửa parser và chạy lại, giữ [lượt đầu](S15/cache-failed-initial-results.json).

Khôi phục bằng nút quản trị “Thử làm mới và xác nhận phục hồi” có capability/nonce, không xóa incident tùy tiện. Cảnh báo admin biến mất; ba endpoint trả200/no-store/bypass kể cả conditional headers: **12 điểm/3 request PASS**. [Kết quả](S15/cache-recovered-http-results.json), [admin trước](S15/cache-incident-admin.jpg), [admin sau](S15/cache-recovered-admin.jpg). Xác minh retry purge thành công, incident hết; khôi phục metadata last_attempt trước test và xóa registry thử. [Cleanup](S15/cache-recovery-cleanup.json), [log](S15/cache-and-content-cli-log.txt). Đây là WP cache safety switch/bypass thật trên hosting; không có adapter purge CDN được chứng nhận hoặc kết luận mọi upstream cache đều không tồn tại.

Tổng các lượt HTTP thành công hiện **354 điểm/68 request** (180 +122 +25 +15 +12). Các lượt harness thất bại được giữ riêng, không tính vào tổng PASS, không xóa để che lỗi.

## Sức khỏe và backup sau nhập

Site Health chạy lại không còn heading critical issue; 6 khuyến nghị, page cache chưa phát hiện nhưng response time OK: trung vị **421ms**, dưới ngưỡng600ms mà chính WordPress hiển thị. [Chi tiết mới](S15/site-health-after-content.txt), [ảnh](S15/site-health-after-content.jpg). Giữ báo cáo2222ms cũ để truy vết; không suy phép đo này thành LCP/CLS hoặc cam kết hiệu năng tải thật trên điện thoại.

- Backup gốc 11:02:11 vẫn có: 81,243,339 byte, SHA256 `51c9f67ffd01ade61d22ba9b32fdb53b5750804639dead984c109098966917f3`, 16,669 entry, có sqldump.sql; không có đường dẫn tương đối không an toàn trong index. [Quan sát archive](S15/backup-archive-observation.json). Chưa CRC toàn bộ data/khôi phục lại trong lượt này.
- Đã tạo **backup ứng viên mới lúc14:49:28 ngày23/10/2026** qua WP Toolkit của đúng staging; giữ cả bản gốc. Tên `staging-store.vneconomics.com__2026-10-23T14_49_28+0700.zip`, 81,537,595 byte, SHA256 `50f5044df962a7c72412a8169bc9423d00aac9954a486712fc59054e351fafdd`, 16,719 entry. Có dumpDB, plugin và theme hiện tại; runtime/import journal đúng ứng viên. [Ảnh hai backup](S15/candidate-backup-created.jpg), [kết quả](S15/candidate-backup-results.json). Chưa diễn tập restore ứng viên; không coi việc tạo/index ZIP là restore PASS.

Nội dung đã duyệt, registry nhập, tooling ngoài webroot, gói S14 và hai backup thật được giữ. Mọi fixture/report/rate/incident thử đã dọn; các runner đã thoát và dọn cache local. Còn kiểm thử mobile/LCP/CLS hosting, lỗi/chậm/timeout/rollback theme/plugin và restore ứng viên có hậu kiểm đầy đủ. Chủ dự án có thể xem staging có nội dung; việc xem/thử của chủ dự án không thay bằng kết quả máy. **Chưa nghiệm thu toàn S15, không chuyển production/S16.**

## Responsive staging ngày 24/10/2026

Đã có capability viewport của trình duyệt CUA, nên kiểm tra được phần từng bị giới hạn ở lượt trước. Truy cập anonymous HTTPS thật, bốn trang home/catalog/Astro detail/Mộc Studio lesson ở viewport 320, 390 và 768px: **12/12 bố cục đạt**, không tràn ngang trang hoặc control trong main, mỗi trang đúng một h1. Menu mở/đóng đúng aria-expanded; tìm Astro hiển thị một tài nguyên; dialog bộ lọc mở và đóng được. Console error thu được: 0. [Kết quả](S15/mobile-results.json), [home](S15/mobile-home-390.jpg), [bài hướng dẫn](S15/mobile-lesson-390.jpg), [bộ lọc](S15/mobile-filter-390.jpg).

Assertion lượt đầu nhầm clientWidth với viewport, bỏ qua 15px thanh cuộn dọc; lưu [kết quả đầu](S15/mobile-initial-results.json), sửa phép đo bằng innerWidth cho viewport và scrollWidth/clientWidth cho tràn ngang, rồi chạy lại đạt. Đây là lỗi bộ kiểm tra, không sửa mã website. Không tính 12 bố cục vào tổng 354 điểm HTTP của runner trước.

Đã reset override viewport về mặc định; không tạo report, fixture hoặc thay dữ liệu staging. Ảnh/JSON là bằng chứng nghiệm thu cần giữ. Không giả lập CPU/network hoặc điện thoại vật lý; chưa đo LCP/CLS hosting.

Phiên Mắt Bão và Plesk đều hết hạn khi tiếp tục ngày24/10. Đã mở lại đúng cổng dịch vụ và yêu cầu chủ dự án đăng nhập trực tiếp, không xin mật khẩu/OTP. Vì chưa có phiên mới nên chưa kiểm tra CRC/diễn tập restore ứng viên hoặc fault/rollback trong lượt này. Hai backup thật và toàn bộ nội dung đã duyệt được giữ. S15 chưa PASS, không sang S16.

## Diễn tập phục hồi thực tế ngày24/10/2026 — đạt trong phạm vi đã duyệt

Chủ dự án đã đăng nhập lại Mắt Bão; dùng đúng nút Bảng điều khiển để vào Plesk. Không tạo/đổi mật khẩu hoặc cấp thêm quyền. Đọc lại root/domain319/DB staging,home,noindex,plugin0.4.2/schema3/theme0.7.0 và6/4/1 mục mẫu: đúng đích. [Preflight](S15/restore-preflight.json).

Backup23/10 lúc14:49:28 khớp hash đã pin; kiểm tra ZipArchive CHECKCONS và đọc14.408file/235.416.873byte sau giải nén:0 lỗiCRC/kích thước,0 đường dẫn bất thường. [Kết quả](S15/backup-crc-results.json). Lệnh đầu bị WP Toolkit xử lý escape dấu gạch chéo làm PHP parse error trước khi chạy; đổi kiểm tra ký tự sang chr(92) rồi chạy đạt, giữ [log lỗi đầu](S15/backup-crc-initial-cli-log.txt) và [log chạy lại](S15/backup-crc-cli-log.txt). Không sửa cấu hình PHP để vượt hạn chế hosting.

Tạo thêm backup hiện trạng bằng WP Toolkit, Plesk xác nhận lúc **24/10/2026 09:59:46**. Tệp `staging-store.vneconomics.com__2026-10-24T09_59_46+0700.zip`,81.541.424byte,SHA256 `f25d308309091275deb1d9036b40507af91a1443640b8a5fa0c7b28accdbfce7`;16.719entry,14.408file/235.477.909byte sau giải nén.0 lỗiCRC/kích thước,0 đường dẫn bất thường,cóSQL/plugin/theme. [Kết quả](S15/pre-restore-backup-results.json), [ảnh3backup](S15/pre-restore-backup-created.jpg). Không hủy tác vụ khi UI còn0%; chờ xác nhận hoàn tất rồi mới chọn snapshot.

Hợp đồng ban đầu yêu cầu vùng phục hồi tách biệt. Cổng nhà cung cấp hiển thị5/5website đang dùng; không kết luận mọi phương án cô lập đều bất khả thi. Đã trình cụ thể phương án dùng staging hiện tại và rủi ro ghi đè/gián đoạn. Chủ dự án trả lời **“Đồng ý phục hồi staging hiện tại”** trước thao tác. [Phương án và quyền cụ thể](../S15-restore-rehearsal-proposal.vi.md), [màn hình xác nhận](S15/restore-confirmation-prepared.jpg). Không suy thành quyền production hoặc cho lần restore khác.

Sau backup, tạo đúng1option và1file có UUID `eae3cbeb-9ada-4648-9791-913b38ca52ff`, xác minh cả hai hiện hữu; guard hashbackup/target/noindex. [Bằng chứng trước](S15/restore-probes-created.json). Sau đó chọn đúng backup09:59:46, giữ tùy chọn xóa dữ liệu hiện có trước phục hồi và bấm Restore theo phê duyệt. Plesk báo restored đúng thời điểm; không dùng toast này làm tiêu chí duy nhất. [Ảnh hoàn tất](S15/restore-completed.jpg).

Hậu kiểm độc lập:

- **Hai markeroption/file đều không còn**, chứng minh cảDB và câyfile đã được khôi phục; không cần xóa marker thủ công. Không còn fixture mới của lượt diễn tập.
- Đối chiếu14.406file thuộc câyWordPress trong archive:0thiếu; chỉ1filekhác làwp-config.php.46/46filephát hành (10plugin,36theme) khớp SHA256 manifestS14. Plugin0.4.2/schema3,VibeLab0.7.0,noindex vẫn đúng; không có cacheincident. [Audit](S15/restore-audit.json).
- wp-config.php chỉ khác `WP_TOOLKIT_API_TOKEN`; sau khi loại riêng token này, toàn bộ tokenPHP chuẩn hóa còn lại giống nhau. Database runtime vẫn đúngstaging. Không in giá trị token/credential hoặc ghi chúng vào bằng chứng; không chép cấu hình cũ đè token mới của Toolkit. [Phân loại](S15/restore-config-difference.json).
- Hash toàn bộ28hàng nội dung,80meta và journalnhập giống trước/sau.17hàngpost/page mọi trạng thái gồm14mụcpublic gốc; hashgốc `2a66c50e9447f5850e62a513f1069698e4ed302a387ab961c61dbd89d1123d00` vẫn khớp.11mụcVNE được duyệt giữ nguyên. [So sánh](S15/restore-content-comparison.json).
- `npm run test:staging-content`: **122điểm/17request đạt**. `npm run test:staging-public -- --theme-only`: **56điểm/8request đạt**. Tổng **178điểm/25request hậu phục hồi**, qua run-clean tuần tự,exit0,cleanupcache/testdata đạt. Giữ kết quả cũ tại đường dẫn cũ; lưu riêng [content sau restore](S15/restore-content-http-results.json), [theme sau restore](S15/restore-theme-http-results.json). Không gửi report mới hoặc mail/APIcóphí trong lượt hồi quy này.
- Reload giao diện anonymous:trang chủ đúngVibeLab,6thẻ,consoleerror0. [UI](S15/restore-ui-results.json), [ảnhtrangchủ](S15/restored-home.jpg). Bộ kiểm tra UI đầu dùng optionlevel chưa hỗ trợ khiến selector không duy nhất; sửa sang h1 DOM, không sửa website.

Tổng cộng các lượt HTTP thành công được giữ hiện **532điểm/93request**, gồm các lượt trước và178điểm hồi quy lặp saurestore; không phải532ca khác nhau.3backup thật,tooling ngoàiwebroot,artifact,nội dung/journal được giữ. Không đổi production/DNS/SSL/quyền truy cập. Diễn tập phục hồi ứng viên24/10 đạt trong môi trườngstaging đã duyệt; chưa khẳng định tương thích mọi tình huống lỗi/chậm/timeout/rollbacktừngthànhphần hoặc LCP/CLS. S15 vẫn đang thực hiện, chưa chuyểnS16; phản hồi trải nghiệm chủ dự án còn chờ.

## Hiệu năng Lighthouse trên staging thật, ngày 24/10/2026

Đo qua giao diện PageSpeed Insights, không dùng API trả phí hoặc tài khoản mới. Google Lighthouse 13.5.0, Moto G Power giả lập, Slow 4G, initial page load, HeadlessChromium 153.0.8010.36. Đây là profile riêng được báo cáo công khai trong từng kết quả; không tuyên bố cùng cấu hình Edge/390x844/RTT40ms của S13 local. Không có field data/INP hoặc kiểm chứng điện thoại vật lý.

| Trang | LCP từng lượt thành công (ms) | CLS | Performance từng lượt |
|---|---|---|---|
| Home | 1442; 1398; 1410 | 0; 0; 0 | 100; 93; 100 |
| Catalog | 1384; 1385; 1399 | 0; 0; 0 | 99; 99; 97 |
| Astro detail | 1401; 1404; 1377 | 0; 0; 0 | 99; 99; 94 |
| Mộc Studio lesson | 1400; 1393; 1444 | 0; 0; 0 | 99; 99; 94 |

**12 báo cáo khác nhau có metric đều đạt LCP <=2500ms và CLS <=0.1.** Giữ từng lượt, không dùng trung bình che kết quả. [JSON tổng hợp và liên kết báo cáo](S15/pagespeed-results.json), [ảnh metric lượt home cuối](S15/pagespeed-home-final-metrics.jpg). Ảnh/text từng lượt giữ trong S15 với tên pagespeed-{page}-{run}.

Home lượt 2 PageSpeed báo unable-to-resolve; lượt thử lại 3 vẫn ở lỗi, không có metric mới. Giữ [lỗi lượt2](S15/pagespeed-home-2-failed.txt), [ảnh](S15/pagespeed-home-2-failed.jpg) và [lượt3](S15/pagespeed-home-3-failed.txt), không tính thành phép đo đạt. Tab mới sau đó có kết quả home lượt4 và5. Không kết luận hai lỗi này là outage của staging hoặc đã chẩn đoán DNS toàn hệ thống; các trang cùng origin vẫn có báo cáo và HTTP runner hoạt động. Tổng có 12 báo cáo metric hợp lệ sau các lần thử, không gọi là 12 lần thử liên tiếp đều thành công.

Speed Index thay đổi **1996–6679ms**, điểm performance93–100; giữ cả các lượt hoàn thiện hình ảnh chậm. Không suy LCP/CLS đạt thành mọi yếu tố tải trang đều nhanh. Accessibility/Best Practices của Lighthouse đạt100 trong 12 báo cáo, chỉ là kiểm tra tự động; không thay nghiệm thu thủ công. SEO66–69 có audit blocked from indexing đúng noindex của staging; không gỡ noindex để nâng điểm. Một lần đọc tab lesson timeout đã đọc lại được cùng báo cáo, không tạo hoặc tính thêm phép đo.

## Diễn tập file và lỗi/timeout HTTP theo request

Đã bổ sung [cổng triển khai thủ công](../S15-deployment-gate.vi.md): xác nhận bằng UI + runtime/schema/hash + smoke; hạn chờ cài từng thành phần được chọn300giây, thiếu/lỗi/quá hạn thì dừng bước sau. Đây chưa phải watchdog Plesk được chứng nhận hoặc tự động hóa triển khai.

Helper `s15-file-rollback.php` qua77kiểm tra local với gói S14 thật, guard path/ownership, bảo toàn DB/config, cleanup đạt. Hash helper `d1e3fef8dd47fc283f72274d0cf0acff39b011104f4094549a5892e5840db40f` được đối chiếu trước khi chạy hosting. Lấy46file từ backup thật đã diễn tập; mọi file hỏng/thừa nằm trong thư mục UUID mới ngoàiwebroot. Hosting đạt15kiểm tra parser/hash/gate/khôi phục toàn cây; có delay thực120.204ms vượt ngân sách diễn tập50ms. File thừa biến mất sau restore,46file live và hash nội dung/meta/journal không đổi; thư mục thử còn0. [Local](S15/file-rollback-local-tests.json), [hosting](S15/file-rollback-hosting-results.json), [hậu kiểm](S15/file-rollback-postflight.json), [cleanup](S15/file-rollback-cleanup.json). Không dùng kết quả này thay lỗi theme active hoặc timeoutHTTP.

Đã bổ sung fixture HTTP có phạm vi hẹp, chỉ request mang dấu ngẫu nhiên đúng đường dẫn GET API mới bị tác động. Template đã qua12kiểm tra local và pin SHA256 `dc63ca30f6870c546df67482e1c85baa6b3d97592e94877c69b5ccaae567fd7b`; root/DB/noindex/CLI/method/path/token/expiry đều có guard. Lượt local đầu harness nối thừa PHP open tag, thất bại trước logic fixture; sửa thành include file riêng để return có đúng phạm vi, chạy lại đạt/cleanup đạt. [Tool local](S15/http-fault-tool-local-tests.json).

Fixture UUID `8a859a46-8d93-45f7-bb2e-c565d0a107d3` có thời hạn10phút, cài qua WP-CLI với ownership/exclusive files, không đổi active_plugins trongDB. Trong riêng request thử, chặn mail/HTTP ngoài; token không lưu trong Git hoặc báo cáo. Ba chế độ: bỏ VNE khỏi active_plugins của riêng request; exception tại plugins_loaded; và delay2giây. **12 kiểm tra/6 request thật đạt**: ordinary200, token sai200, thiếuplugin404, lỗi500, client timeout772ms với deadline750ms; sau đó ordinary200/no-store/bypass. Không thực hiện cập nhật theme khi nhận lỗi/mất xác nhận; runner không phải một hệ deploy có quyền cập nhậttheme nên không chứng nhận cổng tự động. [HTTP](S15/http-fault-results.json).

Client timeout không hủy server. Log shutdown riêng đã ghi đủ ba request kết thúc; ca missing chưa nạp VNE, ca error/slow đã nạp. Chỉ sau khi có đủ event mới dọn đúng MU file/log/registry. Config phiên local cũng đã xóa; không còn option chứa UUID, recovery key, MU fixture hoặc log tạm. Active plugins/theme/schema,46file phát hành và hash nội dung/meta/journal giữ nguyên; không có cacheincident. [Shutdown](S15/http-fault-observation.json), [cleanup](S15/http-fault-cleanup.json), [hậu kiểm](S15/http-fault-postflight.json), [residue](S15/http-fault-residue.json).

Hồi quy sau gỡ fixture: home/API/hỗ trợ **12 kiểm tra/3 request đạt**, đều200/no-store/bypass kể cả conditionalheaders. [Kết quả riêng](S15/after-fault-http-results.json), [ảnh home](S15/after-fault-home.jpg). Các lượt chạy tuần tự qua run-clean,exit0,cleanup đạt. Source helper/template ngoàiwebroot được giữ như tooling, không phải fixture runtime; không đổi payload plugin/theme S14.

Tổng runnerHTTP thành công hiện **556 điểm/102 request**, gồm hồi quy lặp (532+12+12). Không tính traffic nội bộ Lighthouse vào số request này. Ba backup thật, dữ liệu đã duyệt, artifact và bằng chứng được giữ. Không sửa production/DNS/SSL/ref triển khai, không bật automation hoặc gọi API trả phí.

**S15 chưa nghiệm thu toàn bước:** đã có metric staging và ca plugin-load failure/client timeout thực trong phạm vi request; còn lỗi activation của chính gói phát hành và rollback theme đang active. Muốn cố ý gây gián đoạn staging cần chuẩn bị/công bố phạm vi và xin quyết định quan trọng theo yêu cầu chủ dự án; không tự làm từ một fixture fail. Đã gửi yêu cầu chủ dự án thử tìm tài nguyên/chi tiết/bài Mộc Studio; chưa có phản hồi không phải phê duyệt trải nghiệm. Không chuyểnS16.

## Activation hook thật và phục hồi theme active, 24/10/2026

Mục này cập nhật hai phần còn thiếu ở thời điểm mục trên. Không đổi payload S14, nhánh triển khai, production, DNS/SSL, quyền tài khoản hoặc cấu hình PHP.

Helper CLI-only `scripts/fixtures/s15-live-rehearsal.php` đã qua **19 kiểm tra local** trên WordPress/PHP8.3.36/SQLite mới, gồm core activation, observer độc lập, rollback transaction, HTTP500 từ theme active, ordinary/bad-token200, phục hồi toàn cây, xóa file thừa và bảo vệ đường dẫn cleanup. DB/config local thật giữ nguyên; runner dọn fixture/cache sau khi server đóng. Những lượt local lỗi trước đó được giữ tại `live-rehearsal-local-failure-*.json`: harness ban đầu khai báo ABSPATH trùng và thông báo lỗi chưa rõ; sau sửa, sandbox Windows vẫn làm PHP `is_readable` trả false dù đọc được header trực tiếp. Chẩn đoán ngoài sandbox nhận đúng plugin, rồi toàn bộ phép thử đạt với quyền đọc đầy đủ; không sửa core hoặc bỏ qua điều kiện plugin active để làm test đạt. [Kết quả local](S15/live-rehearsal-local-tests.json).

Upload helper tại Home ngoài webroot `/s15-live-rehearsal.php`; SHA256 **8b839ea72eff2fa5add37e29507b9d2e2b2d0d849a32c7d8bac8574cc3dcda07** khớp trước chạy. [Đối chiếu upload](S15/live-helper-upload.json). WP-CLI `--skip-themes` đã kiểm tra riêng để có đường phục hồi không nạp functions.php lỗi; [bằng chứng](S15/live-skip-theme-check.json).

**Activation trên MariaDB:** kiểm tra bảng options dùng InnoDB, site đơn, không recovery mode/object cache ngoài. Gói plugin0.4.2 thực tế đang cài được deactivate im lặng chỉ trong transaction chưa commit; gọi core `activate_plugin` với exception ở ưu tiên đầu của hook đích, trước migration. Kết nối MariaDB độc lập vẫn thấy danh sách active_plugins đã commit ban đầu cả trước/sau exception. Finally rollback; danh sách plugin khôi phục, theme không được triển khai/thay đổi, schema3 và36hash theme giữ nguyên. Filter chặn mail/HTTP ngoài chỉ trong tiến trình thử; không bật proc_open hoặc sửa credential. [Kết quả](S15/live-activation-results.json).

Đây là **fault injection tại activation hook của plugin thật**, không phải lỗi nội tại của ZIP ứng viên, lỗi migration thực hoặc outage plugin toàn site. Cổng triển khai là thao tác thủ công; không chứng nhận watchdog tự động từ kết quả này.

**Theme active:** lấy36file từ backup24/10 09:59:46 đã pin hash, chuẩn bị cây phục hồi ngoài webroot và đối chiếu từng SHA256 trước lỗi. Phiên `d650bf0cb1bec2ee09db4b5a10940f27`; [chuẩn bị](S15/live-theme-prepared.json). Thay functions.php active bằng thao tác rename với điều kiện chỉ GET `/`, header ngẫu nhiên đúng, thời hạn10phút; CLI/request thường/header sai không kích hoạt. Trong riêng request lỗi chặn mail/HTTP ngoài. Thêm một file UUID thừa để kiểm tra phục hồi toàn cây.

HTTP thật **7 kiểm tra/4 request đạt**: ordinary200/no-store/bypass, header sai200, header đúng500 không lộ exception/trace, ordinary sau đó200. Lần đầu sandbox chặn fetch trước khi có request; giữ [kết quả lỗi](S15/live-theme-http-fault-sandbox-failure.json), config tạm đã dọn, chạy lại với quyền mạng đạt. [Kết quả HTTP lỗi](S15/live-theme-http-fault.json). Không tính lượt không có request vào tổng đạt.

Phục hồi bằng rename cả thư mục theme lỗi ra ngoài webroot rồi đưa cây36file khỏe vào đúng vị trí active; không đổi stylesheet, menu/theme mods, plugin hoặc DB/schema. Đối chiếu SHA256 đạt, file thừa biến mất. Cây lỗi37file đã lưu và kiểm tra từng nội dung trong ZIP bằng chứng thật, sau đó dọn thư mục lỗi; giữ ZIP/receipt trong Home `/s15-release/s15-live-d650bf0cb1bec2ee09db4b5a10940f27/`. ZIP SHA256 **ddaf1bdabae6f71e996869100225bf6c0c3fe3de3046b72d178ca36208fe1fc1**. Xóa registry sau phục hồi. [Kết quả restore/cleanup](S15/live-theme-restore-results.json).

Hậu kiểm HTTP thêm **7 điểm/4 request đạt**, dấu cũ trả200; config phiên xóa sau mỗi runner. [HTTP sau restore](S15/live-theme-http-restored.json). Hậu kiểm backend:10fileplugin+36filetheme khớp, noindex, plugin0.4.2/schema3/theme0.7.0 đúng;28hàng/80meta/hash gốc/journal giống baseline;0option chứa UUID,0recoverykey, không còn cây ready/failed hoặc file thử trong theme. ZIP/receipt thật được giữ. [Đối chiếu](S15/live-rehearsal-postflight.json).

Hồi quy chỉ đọc sau đó **122 điểm/17 request đạt**, không gửi form/bài/email; giữ kết quả cũ và [kết quả mới riêng](S15/after-live-rollback-content-http-results.json). Reload UI đúng6thẻ, không có console error; [ảnh](S15/after-live-theme-rollback-home.jpg). Tổng runnerHTTP **692 điểm/127 request** =556+7+7+122 điểm;102+4+4+17request, gồm hồi quy lặp, không tính Lighthouse/local HTTP. Các lượt chạy tuần tự qua run-clean, cleanup đạt.

Giới hạn còn giữ: lỗi theme chỉ theo request, không diễn tập outage toàn site/kill worker; có khoảng giữa hai rename thư mục, không tuyên bố swap directory nguyên tử. Không chứng nhận watchdog Plesk300giây, rollback schema, profile điện thoại vật lý hay field INP. Các kịch bản kỹ thuật đã chọn ở S15 có bằng chứng; **còn chủ dự án thử và phản hồi trải nghiệm** trước nghiệm thu toàn bước. Không chuyển S16/production.

## Chốt nghiệm thu S15 — 24/10/2026

Chủ dự án trả lời trực tiếp **“đã thử, ổn”** sau yêu cầu thử staging: tìm tài nguyên, mở chi tiết và đọc bài Mộc Studio. Ghi nhận xác nhận trải nghiệm cho bản staging hiện tại. Kết hợp bằng chứng kỹ thuật/cleanup đã lưu, **S15 PASS trong phạm vi các kịch bản đã kiểm tra và các giới hạn đã công bố**. Không mở rộng xác nhận này thành thử mọi trang, điện thoại vật lý, field INP, lỗi migration thật, outage toàn site hoặc watchdog tự động.

Không có thay đổi mã nguồn, dữ liệu hoặc hosting trong lượt chốt; không chạy lại các phép thử đã đạt chỉ để cập nhật hồ sơ. Giữ692điểm HTTP/127request (gồm hồi quy lặp),46file phát hành khớp,3backup và gói phục hồi/bằng chứng. Hồ sơ xác nhận tại [owner-acceptance.json](S15/owner-acceptance.json). Dừng ở S15; **S16/production cần được chủ dự án duyệt cụ thể ref, payload, đích và thời điểm** theo cổng kế hoạch.
