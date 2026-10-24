# S16 — Phát hành lần đầu, khôi phục và ứng viên sửa lỗi

Cập nhật 24/10/2026. **Đã phát hành VibeLab 0.7.1 trên production từ ref18a91ca, sau khi chủ dự án duyệt riêng payload sửa lỗi. Plugin0.4.2/schema3 và11 mục giữ nguyên;135 kiểm tra/20request VNE và14/14URL cũ đạt sau phát hành lại.46file ứng dụng và dữ liệu được đối chiếu, cleanup đạt. Còn cảnh báo hiệu năng Site Health: median phản hồi994ms và không phát hiện page cache; không ghi hiệu năng production PASS.** S16 hoàn tất phần phát hành và smoke trong phạm vi đã duyệt, giữ nguyên giới hạn và cảnh báo đã ghi; không tự mở công việc tiếp theo.

## Quyền và phạm vi đã thực hiện

Chủ dự án duyệt S16, duyệt “Đưa cả 11 mục lên production”, rồi xác nhận **“phát hành ngay”** cho [phương án ref 594ccd9](../S16-deployment-proposal.vi.md). Đích duy nhất là `https://store.vneconomics.com/`, root `/var/www/vhosts/vneconomics.com/store.vneconomics.com/`, DB `vne35060_wp_kmqnf`, Plesk domain291. [Xác nhận](S16/release-authorization.json).

Đã kiểm lại baseline ngay trước cài: 17 hàng post/page mọi trạng thái, metadata, active plugins, Astra và backup đúng hash; HPOS orders0. [Baseline](S16/baseline-before-install.json). Không chép database staging/local, đổi DNS/SSL, webhook/ref triển khai Git, cấu hình PHP, tài khoản, automation hoặc gọi API trả phí.

## Lần phát hành 0.7.0 và lỗi chặn

1. Cài và kích hoạt plugin từ ZIP S14 đã pin. UI thành công; runtime0.4.2/schema3, 10 file khớp, CPT/capability thực tế đúng, dữ liệu cũ không đổi. Smoke chỉ đọc trên Astra đạt **14 kiểm tra/4 request**. [Cổng plugin](S16/plugin-gate-results.json), [HTTP](S16/plugin-http-results.json).
2. Chỉ sau cổng plugin mới cài theme0.7.0. Đủ36 file khớp, lưu theme mods ngoài webroot trước khi kích hoạt. [Chuẩn bị](S16/theme-content-prepared.json), [UI](S16/theme-active.jpg).
3. Công cụ nhập được dẫn xuất từ importer S15 đã pin; payload11 mục giữ nguyên byte. Guard production/indexing/hash, baseline post/page, idempotency và ánh xạ liên kết được kiểm tra local với14 assertion. Dry-run đạt rồi apply qua API nội bộ plugin. Không nhập validation PASS, không gửi mail/HTTP ngoài/pingback. [Tool](S16/content-tool-local-tests.json), [dry-run](S16/content-dry-run.json), [kết quả](S16/content-import-results.json).
4. Đã nhập6 tài nguyên ID101–106,4 hướng dẫn ID107–110 và1 bộ thực hành ID111; taxonomy IDs19–21. Liên kết dùng production, comments/pings đóng, validation rỗng. Journal `vne_s16_content_import` là dữ liệu thật cần giữ, không phải fixture. Không nhập lại chỉ vì theme rollback.
5. Smoke VNE đạt **135 kiểm tra/20 request**: home/API/quyền anonymous/support/robots,11 detail, search/catalog/guide, CTA và no-store/bypass. [HTTP](S16/final-http-results.json). Kết quả này **không đủ kết luận phát hành thành công**: kiểm thêm14 URL cũ phát hiện13 URL trả200 nhưng hiển thị “Nội dung chưa có trong thư viện”. [Lỗi legacy](S16/legacy-http-vibelab-0.7.0-failure.json), [ảnh](S16/legacy-about-failure.jpg).

Nguyên nhân: `index.php` của VibeLab đưa mọi singular request vào `vne_library_item`, trong khi API này chỉ nhận post types VNE. Bài/trang thường bị từ chối; WordPress vẫn giữ dữ liệu nhưng không hiển thị nội dung. Không phải lỗi database, mất bài hay lỗi nhập11 mục. Đây là thiếu sót phạm vi nghiệm thu trước đó; không diễn giải dữ liệu còn nguyên thành tương thích giao diện legacy.

## Khôi phục production

Theo phương án đã duyệt, kích hoạt lại **Astra 4.12.0**, giữ plugin0.4.2/schema3 cùng11 mục thật. Không phục hồi đè DB, hạ schema hoặc xóa nội dung. Sau khôi phục, **14/14 URL cũ qua kiểm tra GET**, có redirect cùng origin ở trang WooCommerce cần thiết; không gửi giỏ hàng/đơn/thanh toán. [HTTP](S16/legacy-http-results.json), [ảnh](S16/rollback-astra-about.jpg), [UI](S16/rollback-ui-results.json).

Hậu kiểm sau lần rollback: hash17 hàng gốc vẫn `d6b5b93b7f7a4a235659ebfa9aa73d4e42f580636bfc0ffef69800531163a651`; hash metadata vẫn `b2c41ff0b1d420969c212540ed6f0cb21f6c6b8561804b84ec6c79a17a5eb9b2`;11 mục/journal giữ nguyên, indexing1, HPOS orders0. [Trạng thái sau rollback](S16/rollback-production-current-state.json).

Menu #16 còn10 mục. WordPress tự lưu trạng thái sidebar đang dùng vào theme mods Astra khi đổi theme; vì vậy hash toàn option thay đổi. Đã đối chiếu riêng với `sidebars_widgets` trong **SQL backup production được pin**, chỉ parse giá trị/hashes, không thực thi SQL hoặc xuất dữ liệu nhạy cảm: dữ liệu sidebar được lưu đúng bằng trạng thái global trước phát hành, các trường Astra khác khớp. Giữ bookkeeping hợp lệ này thay vì chép đè bằng snapshot sidebar cũ hơn trong theme mods. [Phân loại](S16/astra-sidebar-classification.json). Lời cập nhật ban đầu gọi đây là trường được “thêm” chưa chính xác; audit đầy đủ xác nhận trường đã tồn tại và được WordPress cập nhật.

Giữ cả hai backup production và ba backup staging:

| Production snapshot | Kích thước | SHA256 |
|---|---:|---|
| 24/10 16:43:31, trước phát hành | 81.419.753 byte | `f6fc2810a6c175bfdc56306856e74e7c4d4efa330303ec070966d749c98a0666` |
| 24/10 18:28:20, Astra + plugin/schema +11 mục sau khôi phục | 81.539.044 byte | `541a8e7eaba271c979ab38cd05780dacdf123d2f746d12f24974de2aa7087325` |

Backup mới `/var/www/vhosts/vneconomics.com/wordpress-backups/store.vneconomics.com__2026-10-24T18_28_20+0700.zip` có16.719 entry; stream14.408 file/235.444.451 byte không nén,0 CRC error/unsafe path. SQL/config/Astra/plugin có mặt. [Audit](S16/production-rollback-backup-audit.json), [ảnh](S16/production-rollback-backup-created.jpg). CRC/structure không thay kiểm chứng restore production; không phục hồi đè production để thử.

## Bản sửa 0.7.1 đã chuẩn bị

Source **`18a91ca0d5445479acd110e7886067e8fe5ab083`**. Chỉ đổi `vibelab/index.php` để post/page thường dùng WordPress loop, `the_content` và `wp_link_pages`; nhánh VNE giữ nguyên. `style.css` chỉ tăng version0.7.1. Không đổi plugin/schema, template thư viện khác hoặc dữ liệu.

Native WordPress/PHP8.3.36/SQLite fixture đạt **25 kiểm tra/10 request**: tái hiện lỗi với đúng ZIP0.7.0, sau đó xác nhận post/page body, shortcode filter, escaping title, password form/không lộ secret, private page404, home/catalog/detail/lesson và6 thẻ VNE. DB/config local thật giữ nguyên; server đóng rồi runner dọn fixture/cache. [Kết quả](S16/legacy-fix-local-runtime.json).

Gói được tạo từ Git ref bất biến với allowlist36 file theme/10 file plugin. Chỉ hai file theme khác; plugin ZIP giữ nguyên hash S14. [Package](S16/legacy-fix-package.json). Builder riêng S16 giữ nguyên hợp đồng/build lịch sử S14 dành cho0.7.0.

- Theme ZIP0.7.1 SHA256: `26d78709146cf94b75465a35c670981de386682fb1cd7ced2dcdcb52ff7b7215`.
- Manifest SHA256: `7592d1b3229df217fbe00b9b1857c17fdd8c7e3b80a7f2ea0c431fb80c568008`.
- Plugin ZIP SHA256 giữ nguyên: `2648f76f915c456ff4221a45862d60ecaf9cc5cdd468781ea8b302f6d63ee4c5`.

Đã thử chính ZIP0.7.1 trên **staging** sau khi xác minh baseline0.7.0 và backup được pin. WordPress xác nhận update thành công; runtime0.7.1/plugin0.4.2/schema3/noindex,36 file khớp aggregate từ manifest ứng viên. Hash28 hàng/80meta vẫn bằng baseline S15;0 recovery key. [Audit](S16/legacy-fix-staging-audit.json).

Staging đạt **134 kiểm tra/20 request VNE** và **14/14 URL legacy**. [VNE](S16/legacy-fix-staging-http-results.json), [legacy](S16/legacy-fix-staging-legacy-http-results.json), [ảnh bài cũ hiển thị được](S16/legacy-fix-staging-old-post.jpg). Console error0 ở trang quan sát. Gói upload tạm attachment120 đã được WordPress dọn; staging giữ noindex. [Cleanup](S16/legacy-fix-staging-cleanup.json). Không thêm bài kiểm thử công khai hoặc thử thanh toán/mail.

## Lỗi harness và giới hạn còn ghi nhận

- Smoke plugin đầu tiên áp điều kiện support/no-store của VibeLab khi còn Astra; giữ kết quả lỗi rồi sửa phạm vi phase. Không thay ứng dụng để làm test đạt.
- Audit đầu gọi representation dành cho editor dưới CLI actor0 nên dừng với ITEM_READ. Sửa sang public representation và đọc validation metadata trực tiếp; không mở quyền. Đây là lỗi audit CLI, không phải outage website.
- Lượt staging đầu đòi `Disallow: /` trong robots.txt. Mã WordPress `do_robots` và bằng chứng S15 cũ đều không có dòng đó; chỉ thị noindex nằm trong meta/backend. Đã giữ lỗi và sửa harness theo hành vi thực tế, không đổi robots/config của website.
- Site Health sau lần phát hành0.7.0 ghi median server response **1.054ms**, page cache không phát hiện. Trước cài, dashboard đã báo critical issue nhưng chưa có metric chẩn đoán tương ứng; không khẳng định nhân quả hoặc metric này đã tồn tại trước cài. No-store/bypass là chủ ý theo hợp đồng cache; không tự bật page cache để che cảnh báo. Chưa chứng nhận hiệu năng production0.7.1 hoặc field INP/điện thoại vật lý. [Site Health](S16/site-health-initial.jpg).
- HTTP tests chỉ đọc, không thay full authenticated/race tests S15, không xác nhận giao dịch WooCommerce. Không gọi paid API/mail, không fault injection production. Tất cả kết quả thất bại được giữ, không cộng chúng vào số lượt đạt.

## Cổng đã trình sau sửa lỗi

**Chưa đưa0.7.1 lên production.** Xác nhận trước đó gắn với ref594ccd9/theme0.7.0; theo AGENTS.md và cổng S16, cần chủ dự án duyệt ref/payload mới. Phương án tiếp là cập nhật **chỉ theme0.7.1 từ18a91ca**, giữ plugin/schema/11 mục, đích vẫn store.vneconomics.com, thực hiện ngay sau xác nhận; kiểm lại baseline/backup rồi smoke cả VNE và legacy/cache. Không nhập lại11 mục hoặc sao chép DB. [Phương án cập nhật](../S16-deployment-proposal.vi.md).

Đoạn trên ghi trạng thái trước khi nhận xác nhận mới; kết quả thực hiện tiếp bên dưới là trạng thái hiện tại.

## Phát hành lại 0.7.1 — đã hoàn tất

Chủ dự án trả lời trực tiếp **“Đồng ý phát hành 0.7.1 ngay”** cho ref `18a91ca0d5445479acd110e7886067e8fe5ab083`, chỉ theme, đúng đích production và thời điểm ngay trong phiên. [Phê duyệt](S16/legacy-fix-production-authorization.json). Không xin lại quyền cho thao tác trong phạm vi này.

Trước cài lại: Astra/plugin/schema/11 mục đúng;17hàng gốc và backup18:28:20 khớp pin. Lưu theme mods ngoài webroot lần nữa. UI thay0.7.0 bằng ZIP0.7.1 thành công; xác minh36hash/aggregate trước kích hoạt trong hạn xác nhận300giây. Không cài lại plugin hoặc nhập lại nội dung. [Trước kích hoạt](S16/legacy-fix-production-before-activation.json).

Sau kích hoạt: VibeLab0.7.1/plugin0.4.2/schema3,36file theme khớp aggregate `b98707b50b78b4cfa7fea57f82d98da010466ee5dac63ada4965af7e20bcd5a5`;10file plugin vẫn khớp ZIP được duyệt.28 hàng nội dung có hash `d8507571df09e7c52b5636c78de7685525cb7ad90ccf52de51528995fb6e5d74`, metadata có hash `5aacbe74b52871a062ae589acfcd5a0f7d9ce903fa3544ecafa1df8654c373f6`, giống trước kích hoạt. Hash17hàng/metadata gốc cũng khớp baseline đầu;3plugin cũ vẫn active, menu16 còn10mục, chỉ binding VibeLab được bỏ để dùng4link đã nghiệm thu. [Navigation](S16/legacy-fix-production-navigation.json), [hậu kiểm](S16/legacy-fix-production-postflight.json), [trạng thái cuối](S16/production-current-state.json).

Smokes cuối chạy tuần tự qua run-clean:

- **135 kiểm tra/20 request** VNE trên production0.7.1 đạt: HTTP/TLS/quyền anonymous, home/API/support/robots,11 detail, search/catalog/guide, CTA, no-store/bypass/no validator. [Kết quả hiện tại](S16/final-http-results.json). Kết quả135điểm cũ của0.7.0 giữ riêng tại [bằng chứng lịch sử](S16/vibelab-0.7.0-library-http-results.json).
- **14/14 URL legacy** đạt sau0.7.1; không còn unsupported-library fallback, status/redirect cùngorigin hợp lệ, không PHPfatal. [Kết quả hiện tại](S16/legacy-http-results.json). Lượt khôi phục Astra trước đó giữ riêng tại [lịch sử](S16/rollback-astra-legacy-http-results.json).
- Reload UI live đúng VibeLab,6thẻ,4link; console error0 ở trang quan sát. [Ảnh live](S16/production-live-0.7.1-home.jpg). HTTPsmoke là anonymous; ảnh UI được chụp trong phiên admin còn đăng nhập.

Cleanup: không tạo post/report kiểm thử trên production; upload attachment112 đã được WordPress dọn.0recoverykey, noindex không mang sang production (indexing1), noindex staging giữ nguyên. Fixture/cache local và runlock không còn; giữ11 mục/journal,2backup production/3backup staging, các ZIP phát hành và tooling/configsnapshot thật. [Cleanup](S16/cleanup-results.json).

Site Health0.7.1 vẫn ghi **1 cảnh báo critical về hiệu năng**, median **994ms** so với khuyến nghị600ms, cùng4 khuyến nghị về inactiveplugins/themes,SQL vàOPcache. [Text](S16/site-health-final.txt), [ảnh](S16/site-health-final.jpg). Đây là cảnh báo còn tồn tại, không bị che hoặc ghi PASS; no-store/bypass vẫn đúng hợp đồng. Không tự bật pagecache, đổi PHP/DB, xóa theme/plugin dự phòng hoặc kết luận từ SiteHealth rằng OPcache thực tế tắt khi chưa chẩn đoán được. Không có tuyên bố fieldINP, điện thoại vật lý hoặc mọi giao dịch WooCommerce đã kiểm chứng.

Kết quả S16: **đã phát hành và xác minh chức năng/data/cache trong phạm vi đã duyệt, kèm cảnh báo hiệu năng chưa giải quyết**. Dừng ở đây, không bật collector/BYOK/automation hoặc mở việc mới từ kết quả phát hành.
