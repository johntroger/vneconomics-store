# S15 — Cổng xác nhận thủ công và diễn tập file riêng

Ngày24/10/2026. Chỉ áp dụng staging đã được duyệt, không cấp quyền triển khai production.

## Đích và cặp phiên bản

- Plesk domain319, `https://staging-store.vneconomics.com`.
- Root `/var/www/vhosts/vneconomics.com/staging-store.vneconomics.com/`, DB `vne35060_wp_udx1z`.
- Source `594ccd9a7de812a49f2c0d8260d20cbfced71752`, plugin0.4.2/schema3, VibeLab0.7.0.
- Không tự hạ schema hoặc phục hồi database chỉ vì lỗi file theme. Giữ bản backup24/10 lúc09:59:46 đã diễn tập và hai backup23/10.

## Cách xác nhận và hạn chờ

Giữ cổng thủ công vì đang dùng cài ZIP qua WordPress/Plesk, chưa có bộ điều phối triển khai tự động. Với mỗi thao tác cài/cập nhật plugin hoặc theme, ghi thời điểm bắt đầu và đặt hạn **300giây** để nhận xác nhận. Đây là hạn vận hành được chọn, không phải cam kết thời gian của nhà cung cấp hoặc phép đo timeout thực tế.

1. Trước thao tác: xác minh đúng root/DB/noindex, SHA256 ZIP/manifest và bản backup. Ghi plugin/schema/theme cùng trạng thái tác vụ UI.
2. Cài plugin trước. UI phải báo hoàn tất; đọc lại runtimeversion/schema và hash file, chạy smoke cần thiết. Toast thành công hoặc ZIP đã upload không đủ mở cổng theme.
3. Nếu lỗi, UI vẫn chạy sau hạn, mất kết nối hoặc mất xác nhận: **dừng thao tác theme**. Giữ nguyên theme, không bấm cài lại liên tiếp; đọc lại UI và audit để phân biệt chưa cài, đã cài nhưng mất xác nhận, và file chưa đầy đủ. Không suy “client timeout” thành “server đã hủy”.
4. Chỉ khi plugin được xác nhận mới cài theme. Theme lỗi thì phục hồi toàn cây file từ backup đã kiểm chứng, loại file chỉ có ở ứng viên lỗi, giữ plugin thuộc cặp đã kiểm chứng. Đọc lại hash/version và kiểm tra HTTP/cache/UI sau phục hồi.
5. Lưu thời điểm, trạng thái và bằng chứng. Chưa xác nhận thì cổng còn đóng; không chuyển production/S16.

Không thay max_execution_time, proc_open/proc_close, SSL hoặc quyền tài khoản để làm kiểm thử đi qua. Backup/restore có thể cần thời gian riêng; không áp hạn300giây của cài thành phần để tự hủy tác vụ phục hồi đang chạy.

## Tooling và phạm vi diễn tập đã thực hiện

`scripts/fixtures/s15-file-rollback.php` là helper CLI-only. Khi chạy hosting, nó kiểm tra root/DB/home/noindex/cặp phiên bản, pin hash backup và manifest, lấy đúng46fileplugin/theme từ backup đã diễn tập. Mọi file hỏng và file thừa chỉ nằm trong một thư mục UUID mới dưới Home `/s15-release`, ngoài webroot. Không bật/tắt plugin thật, đổi theme đang dùng hoặc ghi database trong helper.

Các ca gồm: plugin bị cắt dở gây PHP ParseError, filehash không khớp, xác nhận thất bại/thiếu, xác nhận thực sự chậm khoảng120ms vượt ngân sách diễn tập50ms, theme bị cắt dở, file thừa, và phục hồi toàn cây file. Kết quả15kiểm tra trên hosting đạt;46file đang chạy và hash nội dung/meta/journal giữ nguyên. Toàn bộ thư mục UUID đã dọn, không xóa backup hoặc tooling thật.

`npm run test:staging-rollback-tools` kiểm tra helper trên local, dùng gói S14 thật, guard path/ownership và bảo toàn DB/config thật;77kiểm tra đạt, runner tự dọn. Helper đã upload vào Home `/s15-file-rollback.php`, SHA256 `d1e3fef8dd47fc283f72274d0cf0acff39b011104f4094549a5892e5840db40f`; giữ như công cụ phục hồi, không đưa vào payload phát hành.

Đây là diễn tập filesystem/PHP parser trên hosting với quan sát cổng được tiêm. **Không phải** gây lỗi plugin/theme đang phục vụ người đọc, kill request/PHP worker hoặc chứng nhận watchdog Plesk300giây. Ca active activation failure, mất xác nhận HTTP thực và rollback theme đang active vẫn chưa chạy. Không đổi nhãn các mục đó sang PASS từ kết quả này. Nếu chọn thử làm gián đoạn staging, cần chuẩn bị cửa sổ, chặn thư phục hồi và phương án khôi phục rồi trình quyết định quan trọng theo yêu cầu chủ dự án.

Bằng chứng: [local](acceptance/S15/file-rollback-local-tests.json), [hosting](acceptance/S15/file-rollback-hosting-results.json), [hậu kiểm](acceptance/S15/file-rollback-postflight.json), [cleanup](acceptance/S15/file-rollback-cleanup.json).

## Bổ sung HTTP thật, chỉ áp dụng từng request kiểm thử

Sau phần diễn tập file, đã thử thêm lỗi tại giai đoạn nạp plugin và mất xác nhận phía client qua HTTPS thật. Đây là cập nhật cho giới hạn “mất xác nhận HTTP chưa chạy” ở đoạn trên; ca activation failure của gói thật và rollback theme đang active vẫn chưa chạy.

Template `scripts/fixtures/s15-http-fault-template.php` được kiểm tra local với 12 trường hợp guard/hook/shutdown. Phiên bản đã upload vào Home ngoài webroot có SHA256 `dc63ca30f6870c546df67482e1c85baa6b3d97592e94877c69b5ccaae567fd7b`. Trình cài qua WP-CLI xác minh hash, target/cặp phiên bản, từ chối registry có sẵn, tạo MU fixture UUID bằng file exclusive và registry có ownership. Dấu request ngẫu nhiên và thời hạn 10 phút được tạo trên server; không lưu dấu request vào Git. Chỉ GET đúng `/wp-json/vne-library/v1/items` với header đúng mới bị tác động. CLI, sai URL/method/token, indexable hoặc sai root/DB đều bỏ qua fixture. Chặn mail và HTTP ngoài trong riêng request thử.

Kết quả `test:staging-http-fault`: 12 kiểm tra / 6 request đạt. Request thường và token sai vẫn 200; bỏ VNE khỏi danh sách plugin của riêng request cho 404; exception tiêm vào `plugins_loaded` cho 500; delay 2 giây gây client timeout khoảng 772ms với deadline 750ms. Không thay danh sách active plugin trong DB hoặc file ứng viên. Không có thao tác theme trong runner; kết quả này không chứng nhận một bộ điều phối Plesk tự động ngăn triển khai.

Client timeout không có nghĩa server bị hủy. Trước khi xóa fixture, log shutdown riêng xác nhận đủ `missing`, `error`, `slow` đã kết thúc; VNE không nạp ở ca missing và đã nạp ở error/slow. Chỉ sau đó mới xác minh hash/ownership và xóa đúng MU file, JSONL log cùng registry. Config phiên local được xóa sau runner. Hậu kiểm: 46 file phát hành khớp, nội dung/meta/journal và active plugins/theme/schema không đổi; không còn option chứa UUID, recovery key, MU fixture hoặc log tạm. Home/API/hỗ trợ sau cleanup trả 200/no-store/bypass trong 12 kiểm tra / 3 request.

Bằng chứng: [tool local](acceptance/S15/http-fault-tool-local-tests.json), [HTTP](acceptance/S15/http-fault-results.json), [shutdown](acceptance/S15/http-fault-observation.json), [cleanup](acceptance/S15/http-fault-cleanup.json), [hậu kiểm](acceptance/S15/http-fault-postflight.json), [residue](acceptance/S15/http-fault-residue.json), [HTTP sau cleanup](acceptance/S15/after-fault-http-results.json).

Không gửi email hoặc dùng API có phí; không bật automation, sửa ref triển khai hoặc production. Còn ca rollback theme đang active và lỗi activation của chính gói phát hành; không thay bằng kết quả filesystem hoặc lỗi hook tiêm.

## Bổ sung activation và theme active

Đã chạy `s15-live-rehearsal.php` (SHA256 `8b839ea72eff2fa5add37e29507b9d2e2b2d0d849a32c7d8bac8574cc3dcda07`), sau19kiểm tra native local và đối chiếu upload. Activation dùng core WordPress trên plugin thật trong transaction InnoDB, tiêm exception tại hook đích trước migration. Observer MariaDB độc lập thấy active_plugins cũ xuyên suốt; rollback khôi phục plugin, không triển khai theme/hạ schema. Đây vẫn là lỗi hook được tiêm; không báo ZIP thật bị lỗi hoặc watchdog tự động đạt.

Theme đang active có lỗi chỉ ở GET homepage với header ngẫu nhiên, hạn10phút; ordinary và header sai200, đúngheader500. Cây phục hồi36file lấy từ backup pin hash trước đó. Sau probe, chuyển cả thư mục lỗi ra ngoài webroot, đưa cây khỏe về vị trí active, đối chiếu từngfile và loại file thừa. Hai rename liên tiếp có khoảng giữa, không tuyên bố directory swap nguyên tử. Cây lỗi được archive/kiểm hash rồi dọn; giữ ZIP/receipt thật. Plugin/schema/theme mods và nội dung giữ nguyên, registry/fixture/config tạm không còn. Dấu cũ sau restore200. Không gây outage chủ động toàn site hoặc thử kill worker.

14điểm/8request lỗi/phục hồi và122điểm/17request hồi quy chỉ đọc đạt. [Báo cáo chi tiết và giới hạn](acceptance/S15-staging.vi.md#activation-hook-thật-và-phục-hồi-theme-active-24102026), [activation](acceptance/S15/live-activation-results.json), [restore](acceptance/S15/live-theme-restore-results.json), [hậu kiểm](acceptance/S15/live-rehearsal-postflight.json). Cổng vẫn thủ công, không mở production từ PASS kỹ thuật hoặc thiếu phản hồi trải nghiệm chủ dự án.
