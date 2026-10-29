# R5.2 — Candidate đã kiểm chứng và được duyệt cho R6

Ngày: 28/10/2026. Trạng thái: **PASS_R52_OWNER_APPROVED**.

Cập nhật 29/10/2026: chủ dự án đã duyệt R6 theo hồ sơ này; cutover/hậu kiểm/cleanup hoàn tất tại [báo cáo R6](R6-rebuild.vi.md). Các câu “chưa deploy/xin duyệt” bên dưới ghi trạng thái của hồ sơ candidate trước khi R6 được thực hiện, không thay receipt production mới nhất.

## Kết quả chốt R5.2

Đã tạo candidate GitHub riêng; **chưa deploy**, không đổi `release-production`, staging, Plesk hoặc database thật. [Biên nhận máy](R52-rebuild/publication-candidate.json).

| Mục | Giá trị đã pin |
|---|---|
| Source ứng dụng | `50437bd16eae1912d8cffea093401449786faaea` |
| CI ứng dụng | [40660368997 — PASS](https://github.com/johntroger/vneconomics-store/actions/runs/40660368997) |
| Candidate ref | `candidate-production/50437bd16eae1912d8cffea093401449786faaea` |
| Payload | `fa4c67821008e0fcc4307fedf202bcdf95b85bb6` |
| Manifest SHA256 | `1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2` |
| Production parent phải còn khớp | `80729d511b2f2f168a96a495a4e5cadc93377759` |
| Runtime candidate | theme 2.0.0 / marker `r52-v2-20261028`, plugin 0.4.4, schema 3 |
| Rollback | Cặp U4 theme 0.7.3/plugin 0.4.3; giữ Stars, không restore DB mặc định |

Kiểm thử cùng source: [native](R52-rebuild/native-results.json) **13 PASS**, [URL probes](R52-rebuild/url-probes.json) **13 PASS**, [Chromium/Firefox/WebKit](R52-rebuild/browser-results.json) **90 PASS**, [URL/privacy/sitemap](R52-rebuild/private-url-results.json) **126 đường dẫn PASS** và các endpoint riêng tư đạt. Native ZIP install/hash readback, maintenance 503 → kích hoạt/soft-flush/health 200 → quay lui cặp U4 đạt. Hai build byte giống nhau; cả năm file CI khớp local; payload validator xác nhận parent/tree/allowlist/hash. Fixture và cache của lượt chạy đã dọn, cleanup PASS. Ảnh home/trợ giúp mobile đã tự rà.

Workflow promote đã sửa để checkout source chứa validator thay vì cây payload ZIP. Workflow candidate lọc đường dẫn để bỏ qua thay đổi chỉ ở báo cáo. Commit công cụ `c2be9e091065edd51f92b7120a0195d837e835bb`, [CI 40662022291 — PASS](https://github.com/johntroger/vneconomics-store/actions/runs/40662022291), không thay source/payload ứng dụng đã pin trên. Chưa dispatch promote; cấu hình job promote được rà và validator kiểm trực tiếp, chưa chứng nhận job ghi production đã chạy.

Giới hạn: native fixture dùng PHP 8.3/SQLite trên Playground một worker, không chứng nhận MariaDB/Plesk hoặc thời gian cutover thực tế. 126 path được seed tổng hợp theo snapshot sitemap thật, không phải bản sao nội dung production. R6 phải đối chiếu baseline live/code/data/options, dung lượng/lock/writer và tạo backup mới trước ghi.

**Phạm vi xin duyệt R6 riêng:** production `https://store.vneconomics.com`, cấp B; promote đúng payload/source/CI/hash/parent trên → Plesk nhận GitHub vào private inbox → kiểm baseline/backup/rollback/disk/lock → maintenance có giám sát, hạn 300 giây → cài plugin 0.4.4 và theme v2 native, giữ theme cũ → activate/soft-flush → hậu kiểm URL/data/schema/logs → cleanup/receipt. Không import lại nội dung, đổi schema, bật scheduler/Automatic, gọi API có phí hoặc merge main. Baseline thay đổi hay trạng thái chưa rõ thì dừng inspect; không ghi đè hoặc restore DB để vượt guard. Chi tiết theo [hợp đồng R5.1](../rebuild/R51-cutover-contract.vi.md).

Các phần dưới là lịch sử trong lúc xử lý R5.2; trạng thái/source cũ không thay kết quả chốt trên.

## Lịch sử sửa baseline trước khi chốt candidate

Đối chiếu receipt U4 cho thấy production đã ở theme 0.7.3/plugin 0.4.3, source `7b7ae3454512576e676d43ebb10f274920ee2a34`, payload `80729d511b2f2f168a96a495a4e5cadc93377759`. Nhận định trước đây rằng Stars chỉ ở development là sai. Mọi candidate bên dưới ghép từ 0.4.2 đều không đủ điều kiện phát hành; giữ nguyên làm lịch sử, không relabel. Builder hiện sửa để giữ toàn bộ plugin U4 (gồm Stars), thêm đúng R4 và stamp 0.4.4; rollback là cặp U4 0.7.3/0.4.3. Chưa kiểm lại gate trên source mới, chưa tạo candidate ref mới.

Artifact CI 40658363336 đã tải và cả năm file khớp byte với local exact SHA; kết quả đó thuộc baseline cũ. Snapshot sitemap production đối chiếu R1 đạt 106 resource/6 guide/1 practice/13 category; [snapshot](R52-rebuild/production-url-snapshot.json), URL-list SHA256 `6e586f6017f22c57ed50a64258a6663ddc77ab1489e28f9e91a108f1fed45346`. Bộ URL local dùng fixture tổng hợp, chỉ chứng minh route/template/canonical và privacy; không thay thế đối chiếu database/nội dung thật tại R6.

## Cập nhật source/CI

### Lượt ba trình duyệt

CI source mới nhất `d0f1fffbfccb0bc8d9568ce848ff1aaedb85de73`: [run 40658363336](https://github.com/johntroger/vneconomics-store/actions/runs/40658363336) đã **PASS** build/native/permalink/URL và upload artifact. Chưa tải artifact lượt này để đối chiếu byte local; không dùng artifact source cũ thay thế.

Source ứng dụng đã kiểm: `e591701f15b128df26caa17fb16dccd976d7f3ca`, bổ sung lại link báo lỗi cho resource/guide. [Browser results](R52-rebuild/browser-results.json): **90 kiểm tra PASS** trên Chromium/Firefox/WebKit, ba hành trình, report GET/noindex, FAQ keyboard, không rò marker nội dung nháp/riêng tư/note nội bộ trong các trang đã thăm, không pageerror hoặc request ngoài, 320/390/768/1024/1440. Không submit report hoặc gọi dịch vụ ngoài. Ảnh mobile mới nằm trong cùng evidence directory; đã tự rà home/trợ giúp.

Lượt này bắt được archive404 sau kích hoạt: `check_theme_switched()` flush rule trong context nâng cấp chưa nạp CPT. Đã bổ sung soft-flush với plugin/CPT đăng ký đầy đủ trước health; kiểm browser và native sau sửa đạt. Native **13 kiểm tra** và URL **13 probes** đạt, cleanup PASS. Các sửa harness được pin vào source mới `d0f1fffbfccb0bc8d9568ce848ff1aaedb85de73`; [CI 40658363336](https://github.com/johntroger/vneconomics-store/actions/runs/40658363336) đang chạy. ZIP app e591701 và d0f1fff có cùng app source, nhưng manifest/source SHA khác; không gộp hai SHA thành một.

Chưa có snapshot/hash đối chiếu toàn bộ 126 URL production, sitemap candidate đầy đủ, private endpoint suite hoặc payload candidate commit. Kết quả fixture browser không thay thế các kiểm tra còn lại và chưa đóng R5.2.

Source hiện hành: `644a01b8a6262f2f0e14b3a4715be48876ccfcca`, [CI 40656051823](https://github.com/johntroger/vneconomics-store/actions/runs/40656051823) **PASS**: 12 kiểm tra native và 13 URL probes. Artifact tải về `R52-rebuild/ci-40656051823/`, cả 5 file ZIP/manifest khớp byte với build local exact SHA. Source này bổ sung route hỗ trợ sạch, giữ support/report template từ theme cũ, redirect/410 theo R1 và giới hạn sitemap. [URL evidence CI](R52-rebuild/ci-40656051823/docs/acceptance/R52-rebuild/url-probes.json).

Rà release bắt được 13 URL không đạt trên candidate f6a638c; đã sửa trên 0e08bdf và kiểm lại tất cả đều đúng status/nội dung mẫu. Đây là sửa lỗi tương thích R1, không migration hoặc xóa bản ghi CMS. Còn cần full browser/URL/SEO/private-route suite, snapshot sitemap, đối chiếu artifact CI mới và payload candidate trước khi đóng R5.2. Hai trường hợp template query takeover trên singular và sitemap rộng cũng được thu hẹp trong code; không coi đó là bằng chứng full browser đã chạy.

Các đoạn bên dưới ghi lịch sử candidate trước sửa URL, không phải source hiện hành.

Source mới nhất: `f6a638c0eda2c6baad9f2cb055ccc073ff6f1aab`. [CI 40654531106](https://github.com/johntroger/vneconomics-store/actions/runs/40654531106) **PASS**, thay lượt 40654415737 thất bại vì thư mục fixture chưa tồn tại trên runner sạch. Build local exact SHA mới nhất đạt; artifact nằm tại `artifacts/rebuild/f6a638c0eda2c6baad9f2cb055ccc073ff6f1aab/`. Artifact CI đã tải vào `R52-rebuild/ci-40654531106/`; cả 5 file package/manifest khớp SHA256 với bản local. Kết quả native CI: [native-results.json](R52-rebuild/ci-40654531106/docs/acceptance/R52-rebuild/native-results.json).

Native harness đã commit và push cùng workflow read-only `rebuild-candidate.yml`. Kết quả local và CI đều **12 kiểm tra PASS**, CI dùng gói source mới nhất từ checkout sạch. Chỉ các lệnh quản trị trong lúc bảo trì dùng context nâng cấp; kiểm phiên bản và HTTP health giữ bootstrap thông thường. Việc giảm còn một worker dành riêng cho test native tuần tự, không thay mặc định của các test khác. Cleanup PASS.

Chủ dự án duyệt R5.2 bằng phản hồi “ok”. Source package snapshot đầu: `a8650f54626b8cae443c8da0c23e6e8ebc7c33db`; source cập nhật harness/CI: `92c4ac79cfcee00cddfbc6143df625e53c554de2`, nhánh `codex/rebuild-r52-candidate` đã push. [CI candidate 40654415737](https://github.com/johntroger/vneconomics-store/actions/runs/40654415737) đang chạy. Chưa tạo payload commit, chưa thay release-production/Plesk/live.

Profile mới `scripts/rebuild-release.mjs` dựng từ Git blob exact SHA; theme v2 allowlist 21 file, plugin production baseline `4266b71990702d87969a847e95d9c39933cb05a4` cộng đúng state-admin R4 và version stamp 0.4.4. Không phát hành module GitHub Stars từ development. Output bất biến tại `artifacts/rebuild/a8650f54626b8cae443c8da0c23e6e8ebc7c33db/`: theme.zip, plugin.zip, previous-theme.zip, previous-plugin.zip, manifest.json. Đây là candidate local chưa được duyệt, marker vẫn `r33-guides-local`.

Build/verify byte theo exact source đã thành công. Native harness `scripts/test-rebuild-r52-native.mjs` còn chưa commit và chưa PASS. Nó đã đi qua cài ZIP, readback hash, plugin mới/theme cũ/schema3, maintenance 503, activation và health v2; lỗi tại bootstrap sau maintenance khi chuẩn bị rollback: WordPress require `/wordpress/.maintenance` nhưng file đã không còn. Thử `clearstatcache()` chưa khắc phục. Chưa xác định dứt điểm đây là lifecycle/cache/filesystem của Playground hay lỗi quy trình; không suy kết luận hosting từ fixture này.

Các lượt test đều cleanup PASS. Sau khi cô lập harness về một worker và dùng context nâng cấp cho thao tác quản trị, native test đạt **12 kiểm tra PASS** trên package source đầu. Xem [native-results.json](R52-rebuild/native-results.json). Đã xác nhận deterministic bytes, cài native ZIP và readback hash, plugin0.4.4/theme cũ/schema3, maintenance503 → v2 HTTP200/marker, quay lui cặp theme/plugin0.4.2/schema3. Không suy ra Plesk/MariaDB đã được kiểm chứng. Sáu worker còn gây lỗi lifecycle ở test này; các module test khác vẫn giữ mặc định sáu worker.

Việc còn lại trong quyền R5.2: sửa harness/native lifecycle và chạy lại, full gate trên gói candidate (gồm browser/URL/SEO và source profile), workflow hỗ trợ profile mới và CI exact SHA, đối chiếu artifact/local, tạo payload candidate trên ref Plesk không theo dõi, ghi manifest/source/CI/payload hashes. Các test R2/R31/R32 hiện pin marker lịch sử; phải giữ evidence cũ và tạo release gate mới, không ghi đè evidence gate đã duyệt. R5.2 chưa hoàn tất và chưa xin duyệt R6.
