# S16 — Phương án phát hành production để chốt

Phương án lịch sử ngày24/10/2026. Chủ dự án yêu cầu “S16 — phát hành production” sau khi nghiệm thu S15 và duyệt đưa cả11mục nội dung lên production. Tài liệu giữ lại cả đề xuất ban đầu và đề xuất sửa lỗi để đối chiếu quyền; [báo cáo thực hiện](acceptance/S16-production.vi.md) là trạng thái hiện tại.

**Cập nhật sau thực hiện:** phương án0.7.0 bên dưới đã được chủ dự án xác nhận “phát hành ngay”. Plugin/11mục đã đưa lên production; theme0.7.0 gặp lỗi hiển thị bài/trang cũ và đã quay về Astra. S16 chưa hoàn tất. [Báo cáo thực hiện](acceptance/S16-production.vi.md). Phương án mới0.7.1 chờ duyệt ở cuối tài liệu; không coi phần đề xuất lịch sử là trạng thái hiện tại.

## Ref, payload, đích và thời điểm đề xuất

- Source bất biến: `594ccd9a7de812a49f2c0d8260d20cbfced71752`, đúng gói S14 đã thử và được nghiệm thu trên S15. Các commit tooling/báo cáo sau đó không thuộc payload ứng dụng.
- Plugin `vne-library-core`0.4.2/schema3:10file, ZIP SHA256 `2648f76f915c456ff4221a45862d60ecaf9cc5cdd468781ea8b302f6d63ee4c5`.
- Theme `vibelab`0.7.0:36file, ZIP SHA256 `f6124d7693e8c8af7e8dcd7668012b8c0ed986d338c2a9e864e0f77afa3f0778`.
- Manifest SHA256 `985b5286324e301925abc0369ef0bc47ff8a2ea3c8252c6f569508da74b08a0c`. Ba hash đã đọc lại local và khớp; không sửa manifest lịch sử S14 để thay nhãn hosting validation cũ. Bằng chứng S15 bổ sung nằm ngoài manifest.
- Website: **https://store.vneconomics.com/**; Pleskdomain291; root `/var/www/vhosts/vneconomics.com/store.vneconomics.com/`; DB `vne35060_wp_kmqnf`. Đích plugin/theme là hai thư mục riêng dưới `wp-content/plugins/vne-library-core/` và `wp-content/themes/vibelab/` của root này.
-11mục đã được duyệt:6tài nguyên,4hướng dẫn,1bài thực hành giống nội dung S15. Nhập từng mục qua API nội bộ của plugin, tạo liên kết theo URL production; không sao chép database staging/local hoặc journal/ID staging. Giữ trạng thái validation thật, không gán PASS mới. Chặn mail/HTTP ngoài/pingback trong tiến trình nhập như S15. Giữ17hàng post/page cũ mọi trạng thái (14mục public), Astra và dữ liệu WooCommerce.
- Thời điểm đề xuất: **thực hiện ngay trong phiên làm việc sau xác nhận phương án này**, kiểm tra lại baseline và snapshot mới nếu có thay đổi trước cài. Cài tuần tự bằng ZIP qua giao diện đã dùng ở S15, không đổi ref webhook/Plesk Git `release`/`codex-deploy-check`, không push Git để phát hành.

## Khảo sát trước phát hành

Production đang dùng WordPress7.1.3/PHP8.3.36/MariaDB10.6.22-MariaDB-cll-lve, Astra4.12.0. Chưa có VNE/schema; activeplugins Anthropicprovider1.0.3, Visa2.1.0, WooCommerce10.5.1 được giữ. Indexing1; không mang noindex của staging sang production, không đổi DNS/SSL.17hàng post/page có hash baseline `d6b5b93b7f7a4a235659ebfa9aa73d4e42f580636bfc0ffef69800531163a651`; product/legacyorder/HPOSorder đều0 tại thời điểm quan sát, không coi đó là quyền xóa dữ liệu. Không in DBcredential hoặc dữ liệu khách hàng.

[Preflight](acceptance/S16/production-preflight.json), [giao diện trước](acceptance/S16/production-before.jpg). Astra4.12.0+plugin0.4.2/schema3 đã được kiểm tra backend/HTTP/UI trên S15; xem mục cổng plugin của [báo cáo S15](acceptance/S15-staging.vi.md).

## Backup và khôi phục

Đã tạo backup production **24/10/2026 16:43:31 +07:00** qua WPToolkit trên domain291:

`/var/www/vhosts/vneconomics.com/wordpress-backups/store.vneconomics.com__2026-10-24T16_43_31+0700.zip`

81.419.753byte,16.669entry; SHA256 **f6fc2810a6c175bfdc56306856e74e7c4d4efa330303ec070966d749c98a0666**. Streamđọc14.362file/235.031.988byte không nén:0CRCerror,0đường dẫn không an toàn. SQLdump,wp-config.php vàfunctions/style Astra có mặt/không rỗng. [Audit](acceptance/S16/production-backup-audit.json), [ảnh](acceptance/S16/production-backup-created.jpg). Giữ backup thật này và3backup staging, không đưa vào Git.

CRC/structure không chứng minh restore production. Quy trình restore WPToolkit đã diễn tập thành công trên staging ở S15; **không phục hồi đè production để kiểm thử**. Nếu phát hành thất bại, dừng cổng sau; ưu tiên phục hồi file/theme Astra/cặp tương thích đã kiểm chứng. Không tự hạ schema hoặc hoàn nguyên toàn DB khi đã có dữ liệu mới. Nếu cần fullrestore DBproduction, đánh giá các ghi mới và chốt riêng trước thao tác gây mất dữ liệu. Backup này là snapshot trước phát hành, không phải cơ chế đồng bộ dữ liệu mới.

## Cổng thực thi và nghiệm thu

1. Xác nhận phê duyệt ref/payload/target/thời điểm; đọc lại đúngroot/DB/home và dữ liệu so baseline, hashZIP/manifest/backup. Nếu đổi đích hoặc payload thì dừng để chốt lại.
2. Cài/kích hoạt plugin trước. UI phải hoàn tất trong hạn vận hành300giây, rồi kiểm runtime0.4.2/schema3/10hash và health/HTTP/quyền/cache trên production. Lỗi/chậm/mất xác nhận: dừng trước theme, đọc lại trạng thái; timeoutclient không nghĩa server đã hủy. Không chạy fault injection hoặc tạo bài public chỉ để smoke production.
3. Chỉ khi plugin đạt mới cài/kích hoạt theme0.7.0; đối chiếu36hash và cặp runtime. Lưu menu/theme mods gốc trước thay đổi; dùng điều hướng4link như staging mà không xóa menu/bài cũ. Nếu lỗi, phục hồi toàn cây file từ bản pin và chọn Astra đã giữ; không mặc định chép đè đã loại file thừa.
4. Nhập11mục đã duyệt bằng tooling có guardproduction/hash/idempotency/ownership, dry-run trước apply; kiểm liên kết production, trạng thái, nguồn/CTA và dữ liệu cũ sau nhập. Mọi dữ liệu kiểm thử tái tạo phải dọn;11mục được duyệt là sản phẩm cần giữ.
5. Smoke chỉ đọc home/catalog/detail/guide/search/filter/CTA/cache, HTTPS/noindexphân biệtproduction, route hỗ trợ/báo lỗi ở dạng GET và quyền anonymous; không gửi report giả, thanh toán, mail hoặc APIcóphí. Cache no-store/bypass được xác nhận thực tế, không suy từ local hoặc toast. Kiểm trạng thái/dữ liệu/tệp/console sau cài; lưu bằng chứng/giới hạn.
6. Lỗi thì dừng/fix trong S16 và kiểm lại; kiểm thử/cleanup chưa đạt thì chưa nghiệm thu. Khi đạt, báo cáo kết quả live và dừng trước mọi bước mới. CIremote chưa chạy không được ghi GitHubActionsPASS; không bật automation/collector/BYOK từ phê duyệt phát hành này.

Phương án được chuẩn bị để chủ dự án quyết định cụ thể; không phải xác nhận đã phát hành.

## Phương án phát hành lại sau sửa lỗi legacy — chờ duyệt

- Ref mới: **`18a91ca0d5445479acd110e7886067e8fe5ab083`**.
- Payload thay đổi: **chỉ theme VibeLab0.7.1**,36file, cùng allowlist; chỉ `index.php` và số version trong `style.css` khác0.7.0. Bài/trang WordPress thường dùng loop/the_content/wp_link_pages; nhánh VNE không đổi.
- ZIP: `artifacts/production/18a91ca0d5445479acd110e7886067e8fe5ab083/release/vibelab-0.7.1.zip`, SHA256 **`26d78709146cf94b75465a35c670981de386682fb1cd7ced2dcdcb52ff7b7215`**. Manifest SHA256 **`7592d1b3229df217fbe00b9b1857c17fdd8c7e3b80a7f2ea0c431fb80c568008`**.
- Giữ plugin0.4.2/schema3 đã xác nhận và11 mục đã nhập; không cài lại plugin, nhập lại nội dung hoặc chép DB.
- Đích vẫn **https://store.vneconomics.com/**, root/DB như trên. Thời điểm đề xuất: **ngay trong phiên sau khi chủ dự án duyệt phương án0.7.1**, kiểm lại baseline trước thao tác.
- Backup mới của trạng thái Astra/plugin/11mục lúc **24/10 18:28:20**, SHA256 `541a8e7eaba271c979ab38cd05780dacdf123d2f746d12f24974de2aa7087325`;14.408file đã streamCRC,0lỗi/0unsafe. Giữ backup16:43:31 và3backup staging.
- Bằng chứng trước duyệt: local25kiểm tra/10request; staging đúng ZIP/36hash/runtime đạt,134kiểm tra/20request VNE và14/14URL cũ đạt; nội dung/metadata staging không đổi. Không giả định các kết quả này đã chứng nhận production0.7.1.
- Sau cập nhật theme: xác nhận UI/runtime0.7.1/36hash, dữ liệu cũ và11mục, smoke cả VNE lẫn14URL cũ, cache/indexing và UI. Lỗi thì dừng/khôi phục Astra, không hạ schema hoặc phục hồi đèDB. Giữ cảnh báo hiệu năng thực tế trong báo cáo, không tự bật pagecache/đổi PHP để nâng điểm.

Lý do cần duyệt lại payload: ref/theme đã thay đổi so với xác nhận phát hành0.7.0. Đây là cổng ref/payload/đích/thời điểm cụ thể của S16, không phải xin lại toàn bộ quyền S16.

**Kết quả cập nhật:** chủ dự án đã trả lời “Đồng ý phát hành 0.7.1 ngay”. Đã thực hiện đúng phương án mới: chỉ theme0.7.1/ref18a91ca được cập nhật, plugin/schema/11mục giữ nguyên;135kiểm tra VNE/20request và14/14URL cũ đạt, data/hash/cleanup đạt. Còn cảnh báo SiteHealth median994ms/pagecache; không ghi hiệu năng PASS. Không còn chờ quyền phát hành0.7.1; dừng chờ công việc tiếp theo.
