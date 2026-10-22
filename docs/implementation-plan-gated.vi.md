# Kế hoạch triển khai từng bước có kiểm thử và phê duyệt

Ngày: 19/10/2026. Phiên bản thực thi: 1.0.
Tham chiếu: website-build-plan.vi.md 1.10 và yêu cầu mới của chủ dự án.
Trạng thái: S10 PASS kỹ thuật local ngày 22/10/2026; chờ chủ dự án xem giao diện và duyệt S11. S11 trở đi chưa được phép bắt đầu.
Dự án: VneconomicsStore, không sửa dự án Facebook đang dùng chung phiên làm việc.

## 1. Nguyên tắc bắt buộc

Mỗi bước theo chuỗi:
Chủ dự án cho phép bước cụ thể -> chốt phạm vi -> code trong phạm vi -> kiểm thử ->
sửa lỗi và kiểm thử lại -> lưu bằng chứng/dọn dữ liệu tạm -> báo cáo -> DỪNG.
Chỉ bắt đầu bước tiếp theo khi chủ dự án đồng ý rõ ràng cho bước đó. PASS tự động,
commit/push, thông báo không có lỗi hoặc sự im lặng không phải phê duyệt tiếp tục.
Các bước chuẩn bị không có code cũng cần duyệt trước khi chuyển sang bước kế tiếp.

- Lượt lập kế hoạch này chỉ sửa tài liệu/quy tắc, không chạy triển khai hoặc code tính năng.
- Trong một bước đã duyệt được tự sửa lỗi phát sinh đúng phạm vi và chạy lại kiểm thử;
  không xin phép lại từng sửa chữa thông thường, không mở rộng module ngoài bước.
- Nếu cần đổi schema/phạm vi lớn, bước trước không còn đúng hoặc thiếu quyền/tài khoản,
  báo phần ảnh hưởng và dừng việc phụ thuộc để xin quyết định; không tự bỏ qua gate.
- Kiểm thử thất bại thì sửa và thử lại; không chuyển bước. Test không chạy/skip vì
  thiếu môi trường được ghi CHƯA KIỂM THỬ, không quy thành PASS.
- Nếu phát hiện lỗi cũ chặn bước hiện tại, sửa trong phạm vi khi hợp lý hoặc đề xuất
  quay lại bước bị ảnh hưởng. Bằng chứng PASS cũ không thay kiểm thử sau thay đổi.
- Người dùng chỉ đồng ý bước kế tiếp sau báo cáo là cách vận hành mặc định; một câu
  duyệt cả kế hoạch không tự cấp quyền code toàn bộ các bước. Muốn đổi quy trình này
  phải có chỉ thị mới rõ ràng từ chính chủ dự án.
- Các chặng B/U là tùy chọn về thời điểm, không tự khởi động khi A hoàn tất.

## 2. Quy tắc kiểm thử và nghiệm thu

Trước code mỗi bước ghi: ID bước, phạm vi/file dự kiến, tiêu chí xong, kiểm thử cần
chạy và giả định. Sau code chạy các kiểm thử liên quan cộng smoke/regression của
phần đã làm có thể bị ảnh hưởng; không đòi full suite cho mọi sửa văn bản hoặc CSS nhỏ.
Không viết test chỉ lặp logic implementation; ưu tiên hành vi và lỗi thực tế.

Các lệnh đã có: npm test (scripts/smoke.mjs qua run-clean), npm run dev và
npm run local:init. Chưa tạo các lệnh test nghiệp vụ/UI trong lượt lập kế hoạch này.
Khi cần, bổ sung runner/npm script trong bước được duyệt, tất cả đi qua
scripts/run-clean.mjs. Script local mới chỉ chạy khi nằm trong phạm vi bước đã cho
phép; không chạy script kết nối/đăng/deploy ngoài phạm vi chỉ để test cleanup.

Mức kiểm chứng theo bước:
- Plugin/data: kiểm thử tích hợp WordPress cho quyền, lưu/đọc, nguồn, revision và
  trạng thái; dữ liệu fixture riêng, không thử ghi phá database local đang dùng.
- UI: thao tác trình duyệt thật, desktop/mobile, link/CTA, bàn phím, lỗi hiển thị,
  trạng thái rỗng; giữ ảnh nghiệm thu cần thiết. HTTP 200 không chứng minh UI đúng.
- Tích hợp: hành trình người dùng và regression các module liên quan; xác nhận
  template/state/URL đúng khi quay lại, không lẫn dữ liệu riêng.
- Hosting: chỉ trên staging được phép ở S15; PHP/MySQL thật, deploy/restore/cache.
  Playground SQLite không thay thế chứng nhận môi trường hosting.
- AI: mock/fixture trước; dịch vụ thật chỉ khi bước được duyệt có provider/key,
  budget và phạm vi gọi rõ. Không tự dùng Gemini trả phí của chủ để test BYOK.

Điều kiện một bước đạt: các ca bắt buộc đều chạy và PASS; không lỗi chặn tác vụ,
không lỗi quyền/dữ liệu/khóa; tiêu chí chưa kiểm chứng phải được báo và xử lý trước
khi coi bước xong. Không tự bỏ qua lỗi chức năng dù nhỏ hoặc dời sang bước khác để đạt PASS. Cảnh báo công cụ không phải lỗi chức năng được liệt kê với ảnh hưởng và cần chủ dự án chấp nhận khi duyệt bước; không gọi là
không vấn đề gì bằng cách giấu warning. Với UI, chủ dự án còn duyệt hình thức/hành
vi qua preview/ảnh, không chỉ dựa kết quả test máy.

Dọn fixture/cache mới theo AGENTS.md sau khi tiến trình/database đóng, cả khi lỗi;
không chạy fixture song song. Giữ mã, thư viện, database local, nguồn, backup thật,
gói phục hồi và bằng chứng nghiệm thu. Cleanup không đạt thì bước chưa hoàn tất.

## 3. Báo cáo bắt buộc và lưu tiến độ

Mỗi bước có báo cáo docs/acceptance/Sxx-<ten-buoc>.vi.md khi được thực hiện:
- Phạm vi đã được cho phép, phần thay đổi và file liên quan.
- Commit/ref hoặc dấu mốc phiên bản để truy vết; môi trường/phiên bản chạy test.
- Từng nhóm kiểm thử: lệnh, kết quả, số ca nếu có; lỗi đã sửa và phần chưa chạy.
- Preview/ảnh/log đã loại bí mật; hạn chế, cảnh báo và kết quả cleanup.
- Kết luận PASS / FAIL / BLOCKED, phạm vi được nghiệm thu và việc còn lại.
- Bước kế tiếp đề nghị, lý do và câu xin đồng ý; dừng chờ phản hồi.

Báo cáo trong chat tóm tắt kết quả và link bằng chứng. Không tạo sẵn file acceptance
với trạng thái PASS. Bảng theo dõi cập nhật sau mỗi bước nhưng không tự mở bước mới.
Nếu người dùng đổi yêu cầu giữa bước, cập nhật phạm vi/bằng chứng tương ứng.

Git lưu mã và tài liệu ở nhánh phát triển phù hợp, mặc định codex/ khi tạo nhánh.
Main không phải payload live. Nếu push GitHub để review thì báo rõ; không push các
nhánh release/deploy hoặc thay Plesk target trước bước phát hành đã duyệt. Giữ nguyên
release/codex-deploy-check hiện có cho bằng chứng kết nối.

## 4. Các bước của bản A

Tiến độ thực tế được ghi tại mục 7. Mỗi hàng dưới đây là một gate độc lập, không phải một lệnh
cho phép thực hiện liên tiếp. Bước lớn phát hiện không thể nghiệm thu rõ phải chia
nhỏ và xin duyệt phạm vi mới trước khi làm thêm.

| Bước | Công việc được thực hiện sau khi được duyệt | Kiểm thử/kiểm chứng bắt buộc | Đầu ra để duyệt |
|---|---|---|---|
| S00. Brief và kiểm tra điều kiện | Chọn nhiệm vụ thực hành đầu, công cụ/OS, nguồn lực; khảo sát hosting theo quyền hiện có; khóa scope A dự kiến | Đối chiếu nguồn/yêu cầu, xác định thiếu quyền và sự khác biệt local/hosting; chưa chạy thử có phí | Brief một trang, danh sách giả thuyết/quyết định còn mở; không chọn thay bằng im lặng |
| S01. Baseline local và runner | Kiểm tra môi trường/dependency; chạy smoke hiện có; chỉ sửa nền/runner cần thiết cho kiểm thử | WordPress boot hai lần, home/login/REST, dữ liệu fixture tồn tại sau restart, cleanup thành công; giữ DB local | Baseline hiện tại và runner sẵn sàng; kết quả lịch sử không thay lần kiểm tra mới |
| S02. Nội dung mẫu và prototype | Một sản phẩm/bài hướng dẫn thật theo brief; prototype chủ/danh mục/chi tiết/hướng dẫn, chưa code backend nghiệp vụ | Kiểm tra nguồn/quyền/version; duyệt hai hành trình tìm/chọn và bước thực hành; desktop/mobile, CTA ảnh/tên vs repo | Preview/prototype, nội dung mẫu, công đo được, scope A sau phản hồi; mẫu ít người để tìm lỗi, không suy rộng thống kê |
| S03. Plugin dữ liệu và nhập tay | Khung vne-library-core, CPT/taxonomy/meta nguồn tối thiểu, quyền và form nhập; preview dữ liệu | Activate/restart; lưu/đọc dữ liệu, unknown/conflicted, thiếu field bắt buộc, vai trò không được sửa; public chỉ dữ liệu đã duyệt | Plugin quản lý một tài nguyên/bài mẫu; không collector/AI |
| S04. Trạng thái và quan hệ kiểm chứng | Resolver plugin, mapping post_status, access/archived độc lập, validation, guide dependency thủ công | Ma trận trạng thái/CTA, archived+unavailable, quyền/hidden, cảnh báo bài phụ thuộc, không tự nâng Đã thử | Hợp đồng trạng thái dùng được cho view/API; dữ liệu fixture có bằng chứng |
| S05. Bản sửa và preview | Bản duyệt/bản đề xuất, base_revision, duyệt/bỏ theo quyền; giữ URL | Draft không đổi public; sửa tay/two approvals không bị ghi đè, preview không công khai; áp dụng không tự xóa cảnh báo mới | Quy trình nhập/sửa/duyệt tối thiểu trước tự động hóa |
| S06. Theme nền và trang chủ | Khung theme, token, font, header/footer/menu mobile, trang chủ dùng dữ liệu plugin | Trang không lỗi PHP/JS; menu/bàn phím/mobile; khối thiếu dữ liệu không giả nội dung; nội dung đọc được khi JS lỗi | Trang chủ local và bộ khung được chủ dự án duyệt |
| S07. Danh mục và thẻ | Template danh mục, breadcrumb, grid/card, số lượng và phân trang cơ bản | URL taxonomy, số kết quả, ảnh dự phòng, tên dài; ảnh/tên mở chi tiết, CTA tới đúng repo/path; không nút chết | Trang danh mục và card thật; đích chi tiết có thể dùng template mặc định tạm, ghi rõ |
| S08. Sản phẩm chi tiết | Template chi tiết e-commerce, ảnh/thông tin/CTA, mục nội dung, nguồn/bài liên quan có dữ liệu | Nguồn/điều kiện/unknown đúng, trạng thái từ resolver, repo còn hợp lệ mở trực tiếp; preview/bản duyệt không lẫn; mobile/anchor | Trang sản phẩm hoàn chỉnh theo mẫu đã duyệt, không ép gallery/FAQ không có tư liệu |
| S09. Tìm kiếm và bộ lọc | Scope tài nguyên/hướng dẫn, nhu cầu/công cụ, sort, URL/chip/filter mobile | 15–20 truy vấn kỳ vọng; có/không dấu, AND/OR, tổ hợp rỗng, Back/share/page-reset; chuyển scope giữ từ khóa | Tìm/lọc có bằng chứng chức năng, không thêm semantic search |
| S10. Hướng dẫn thực hành | Template bước/checklist, OS/version, copy lệnh, điều kiện, lỗi/khôi phục và bài liên quan | Bài mẫu từ môi trường mới; lệnh đúng OS/revision, dấu hiệu thành công; cảnh báo dependency; không trộn nhiều OS | Một luồng thực hành đạt checklist; không khẳng định tác vụ đã xong chỉ từ click/copy |
| S11. Báo lỗi và trang hỗ trợ | Form theo resource, chống spam tối thiểu, trạng thái gửi, chính sách/giới thiệu/tiêu chí/FAQ có nội dung thật | Input không hợp lệ, giới hạn/spam, output escape, không yêu cầu bí mật; form thành công/thất bại bằng lưu cục bộ/mock | Luồng nhận báo lỗi được chọn rõ; không tự gửi email/dịch vụ ngoài chỉ để thử |
| S12. Cache và tính nhất quán | Cơ chế làm mới view/plugin ở local; checklist purge cho tầng hosting được xác định; bảo vệ preview/BYOK | Làm nóng cache rồi đổi/thu hồi/cảnh báo, thử lỗi purge và phục hồi; thẻ/detail/API/guide thống nhất | Cơ chế local đạt; phần cache hosting ghi chờ S15, không báo đã kiểm tra server thật |
| S13. Nghiệm thu tích hợp local A | Seed nội dung đã duyệt trong scope; kiểm tra end-to-end, hiệu năng, accessibility/SEO tối thiểu | Hai nhánh vào chi tiết/mở repo, search/filter/guide/report; quyền/revision/state/cache regression; mobile/bàn phím; lab LCP/CLS theo plan | Báo cáo local A, thử người mới trên bản đã xây và bằng chứng sửa lỗi; còn chờ hosting S15 |
| S14. Gói phát hành và dry-run | Build theme/plugin từ commit, manifest/cặp phiên bản, kiểm tra CI phù hợp và allowlist file | Gói tái tạo từ ref; không DB/uploads/config/key/tooling; diễn tập lỗi một gói bằng fixture/dry-run, chưa push nhánh deploy live | Artifact và checklist phát hành/rollback để duyệt, không đổi Plesk target |
| S15. Staging PHP/MySQL thật | Khi có quyền và bạn duyệt riêng bước này: backup staging, deploy plugin rồi xác nhận, sau đó theme; activation/migration | Version/health từng gói, smoke và ca tích hợp quan trọng; cache thật; plugin chậm/lỗi/theme lỗi; backup/restore có bằng chứng | Nghiệm thu staging, bằng chứng tương thích và gói khôi phục; không đổi production |
| S16. Phát hành production | Chỉ khi bạn duyệt cụ thể ref, payload, đích và thời điểm: backup production, phát hành theo cổng 13.1 | Backup/khôi phục sẵn sàng, plugin version/health đạt mới theme; đọc/CTA/form/cache smoke không phá dữ liệu; lỗi thì dừng/rollback theo kế hoạch | Kết quả live, ref/manifest và bằng chứng; dừng chờ duyệt mọi công việc tiếp theo |

S02 là bản trình bày để thử, không phải đã nghiệm thu plugin/theme. Nội dung chưa có
bằng chứng vẫn giữ nhãn; không phát minh demo hay test-run cho kịp kế hoạch. Nếu phải
cài công cụ/gọi API trả phí để làm bài mẫu, phạm vi/chi phí cần được cho phép riêng
trước thao tác đó. Thương hiệu dài hạn không bắt buộc chốt để làm prototype có nhãn.

S13 còn yêu cầu người mới hoàn toàn thử trên bản đã xây (không chỉ prototype S02):
tìm/chọn tài nguyên và chuẩn bị/thực hành tới checklist, ghi trợ giúp và sửa/thử lại
lỗi phát hiện. Nếu chưa có người thử, phần này CHƯA KIỂM CHỨNG và chưa nghiệm thu đủ
S13 để sang phát hành. Tuyển/mời người thử do chủ dự án điều phối hoặc cho phép riêng;
không tự nhắn tin cho người khác. Kết quả máy tự động không thay thế việc này.

S15/S16 là thao tác ngoài local, cần quyền thực tế và sự đồng ý cho đúng bước.
Nếu chưa có staging hoặc không khảo sát được hosting, các bước đó BLOCKED; không
thay bằng thử production. Duyệt kế hoạch/S14 không tự cho phép deploy S15 hoặc S16.

## 5. Tự động hóa B — chỉ lên lịch thực hiện khi A có bằng chứng và bạn đồng ý

Mỗi bước B vẫn code -> test -> sửa -> báo cáo -> chờ duyệt, không chạy cả chặng.

| Bước | Phạm vi | Cổng kiểm thử |
|---|---|---|
| B01. Thu thập metadata | GitHub adapter, snapshot, query/checkpoint, quan sát stars; fixture trước | Trùng/đổi tên/thiếu dữ liệu/rate limit/giới hạn search; không giả tăng 24h; API thật chỉ khi được phép |
| B02. Job và nhập nháp | Queue bền vững, lease/idempotency, quyền field, draft dựa revision | Hai runner, chết giữa chừng, chạy lại; không trùng/mất sửa tay; không tự publish |
| B03. Gemini biên tập | Adapter/schema/evidence gate, benchmark, budget với mock trước | Nguồn thiếu/mâu thuẫn/injection, model/prompt version, phí unknown/retry; kiểm thử có phí chỉ sau chốt budget/key/provider |
| B04. Pilot 7 ngày | Bật lịch draft-only sau duyệt riêng, quota/công suất/người trực đã chốt | Chạy hằng ngày không tự sang giai đoạn khác; báo lỗi vượt ngưỡng, chi phí và công duyệt; chỉ mở rộng sau bạn duyệt kết quả |

B04 là một bước có thời gian quan sát đã được cho phép khi bắt đầu; phép chờ/pilot
không cấp quyền tự phát triển module mới, xuất bản hoặc tăng quota trong bảy ngày.
Nếu cần automation để chạy sau lượt chat, phải cấu hình và được duyệt cụ thể khi tới
B04; tài liệu hiện tại không tạo automation.

## 6. AI BYOK U — thời điểm riêng, không là điều kiện mở A/B

| Bước | Phạm vi | Cổng kiểm thử |
|---|---|---|
| U01. Hợp đồng proxy và UI key | Provider allowlist, key trong phiên/request, giới hạn, redact/preview input; mock | Không log/lưu/cache/lẫn key; request trùng, timeout/cancel, lỗi quota; không fallback key chủ |
| U02. Hai tính năng theo ngữ cảnh | Giúp tôi ở bước này và Giải thích theo nhu cầu; mock/nguồn thư viện | Đúng revision/OS/state, thiếu dữ liệu biết hỏi, không fetch tùy ý/bịa repo, không sửa bài công khai |
| U03. Pilot provider thật trên staging | Sau bạn duyệt provider/model, key thử và trần chi phí; thử hữu ích với người dùng | Kiểm tra 10.2–10.4, chi phí, người dùng so với nội dung tĩnh; không gọi API khi chỉ mở trang/nhập key |
| U04. Phát hành U | Sau bạn duyệt ref/đích: bật tính năng đã kiểm chứng, có công tắc tắt | Smoke BYOK trong phạm vi test được cho phép, không key chủ/khách khác; đọc/học bình thường khi tắt/lỗi; dừng báo cáo |

## 7. Mốc hiện tại và hành động chờ duyệt

- S00: đã có [brief](S00-implementation-brief.vi.md) và [báo cáo](acceptance/S00-brief-and-conditions.vi.md); chủ dự án đã cho phép tiếp S01.
- Đã chốt trong S00: landing page sản phẩm/dịch vụ; Codex trên Windows; giờ/tuần chưa xác định.
- S01: smoke hai boot và cleanup PASS; [báo cáo](acceptance/S01-local-baseline.vi.md); chủ dự án đã cho phép S02.
- S02: kỹ thuật prototype PASS; [báo cáo](acceptance/S02-prototype-and-content.vi.md); chủ dự án đã cho phép bắt đầu S03. Việc này không thay nghiệm thu người mới ở S13.
- S03: PASS local ngày 21/10/2026; [báo cáo nghiệm thu](acceptance/S03-library-data.vi.md), [hợp đồng dữ liệu](S03-data-contract.vi.md). Chủ dự án đã cho phép S04.
- S04: PASS local ngày 21/10/2026; [báo cáo nghiệm thu](acceptance/S04-state-and-dependencies.vi.md), [hợp đồng trạng thái](S04-state-contract.vi.md). Chủ dự án đã cho phép S05.
- S05: PASS local ngày 21/10/2026; [báo cáo nghiệm thu](acceptance/S05-revisions-and-preview.vi.md), [hợp đồng bản sửa](S05-revision-contract.vi.md). Chủ dự án đã cho phép S06.
- S06: PASS kỹ thuật local ngày 21/10/2026; 59 điểm kiểm tra; [báo cáo nghiệm thu](acceptance/S06-theme-and-home.vi.md), [hợp đồng theme](S06-theme-contract.vi.md). Chủ dự án đã cho phép S07.
- S07: PASS kỹ thuật local ngày 21/10/2026; 44 điểm UI/HTTP + 23 kiểm tra fixture, hồi quy S06 59 điểm; [báo cáo nghiệm thu](acceptance/S07-catalog-and-cards.vi.md), [hợp đồng danh mục](S07-catalog-contract.vi.md). Chủ dự án đã cho phép S08.
- S08: PASS kỹ thuật local ngày 21/10/2026; 54 điểm UI/HTTP + 19 kiểm tra fixture; hồi quy S07 44/23 và S06 59 PASS. [Báo cáo nghiệm thu](acceptance/S08-resource-detail.vi.md), [hợp đồng chi tiết](S08-detail-contract.vi.md). Chủ dự án đã cho phép S09.
- S09: PASS kỹ thuật local ngày 21/10/2026;74 kiểm tra +28 fixture,20 truy vấn; hồi quy S07 46/23, S08 55/19, S06 59 PASS. [Báo cáo](acceptance/S09-search-and-filters.vi.md), [hợp đồng](S09-search-contract.vi.md). Chủ dự án đã duyệt S10 ngày 22/10/2026.
- S10: PASS kỹ thuật local ngày 22/10/2026; 55 kiểm tra + hai luồng PowerShell; hồi quy S09 74/28, S08 55/19, S07 46/23, S06 59 PASS; 31 file runtime khớp source, dữ liệu gốc/cleanup/ports đạt. [Báo cáo](acceptance/S10-guided-practice.vi.md), [hợp đồng](S10-lesson-contract.vi.md). Chưa thử cài/đăng nhập Windows sạch hoặc phiên AI mới; chờ duyệt S11.
- S11–S16, B01–B04, U01–U04: CHƯA BẮT ĐẦU, chưa được phép triển khai.
- S02 chỉ thêm prototype tĩnh/runner UI/nội dung mẫu; chưa tạo backend theme/plugin, automation hoặc nhánh deploy.
- Đã hoàn tất kiểm thử kỹ thuật local S10; dừng chờ chủ dự án duyệt S11. Chưa deploy.
