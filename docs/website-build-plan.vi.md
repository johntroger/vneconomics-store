# Kế hoạch xây dựng thư viện Vibe Coding và AI Agent cho người Việt

Ngày: 19/10/2026. Phiên bản: 1.4 — website miễn phí, tính năng AI cho khách dùng API riêng (BYOK).
Tên làm việc: VibeLab Việt; chưa kiểm tra tên thương hiệu hoặc domain.
Website hiện tại: https://store.vneconomics.com/.

## 1. Tóm tắt quyết định

Xây một thư viện tuyển chọn kết hợp hướng dẫn thực hành tiếng Việt. Lời hứa sản phẩm:
**Tìm công cụ phù hợp, hiểu cách dùng và hoàn thành việc đầu tiên.**

Giá trị cốt lõi gồm tuyển chọn có lý do, ví dụ dùng thực tế, hướng dẫn có phiên bản,
và cập nhật minh bạch. Người đọc phải biết mục nào đã được thử, thử bằng công cụ nào,
trên hệ điều hành nào và khi nào cần kiểm tra lại.

Đề xuất giữ WordPress làm hệ quản trị nội dung và website, viết theme riêng cùng plugin
nghiệp vụ; dùng bộ xử lý Node.js tách biệt cho GitHub và nội dung AI. Chưa cần frontend
headless, vector database, chatbot tổng quát, tài khoản thành viên hay thanh toán ở bản đầu. Tính năng AI theo yêu cầu dùng API riêng là luồng tách biệt, phạm vi cụ thể chưa chốt.

Kế hoạch này chưa triển khai mã, chưa bật lịch thu thập và chưa phát sinh gọi AI có phí.

Bản 1.2 tích hợp đề xuất từ docs/website-plan-review.vi.md. Những lựa chọn còn mở về
bài mở đầu, thương hiệu và nguồn lực ghi là giả thuyết, không phải quyết định người dùng đã chốt.

## 2. Hiện trạng và giả định

Đã kiểm chứng ngày 17/10/2026: local -> GitHub -> webhook -> Plesk -> file công khai.
Repository riêng: johntroger/vneconomics-store. Plesk theo dõi release và tự triển khai
vào /store.vneconomics.com/codex-deploy-check. File connection-v2 đã trả HTTP 200.
Đây là bằng chứng đường truyền triển khai; chưa phải tích hợp xuất bản nội dung WordPress.

Local đang có WordPress 7.1.3, PHP 8.3 qua Playground, database SQLite. Chưa khảo sát
đầy đủ plugin, dữ liệu, PHP extension, MySQL/MariaDB và giới hạn tài nguyên hosting.
Trước phát hành phải kiểm tra môi trường thật và tạo staging; không coi Playground
là bằng chứng tương thích đầy đủ với hosting.

Quyết định và giả định lập kế hoạch:
- Đã chốt với chủ website: người mới hoàn toàn, chưa biết cài công cụ, là độc giả ưu tiên của bản đầu. Không giả định đã biết Git, terminal, API key hoặc đã có agent.
- Người đã dùng agent và người biết code tìm skill là nhóm mở rộng; vẫn có trang Khám phá, nhưng hành trình nhập môn được ưu tiên.
- Bài mở đầu bắt buộc có chọn công cụ, yêu cầu, tài khoản, cài và kiểm tra lần đầu. Kết quả thực hành đầu tiên, công cụ và OS chưa chốt; trang giới thiệu local chỉ là một phương án. Không mặc định cả ba agent đều được kiểm chứng.
- Nhóm phụ: người làm nội dung, giảng viên, marketer và developer muốn tìm công cụ nhanh.
- Đã chốt: website hoàn toàn miễn phí cho người dùng; không paywall, gói thành viên trả phí hoặc bán lượt AI. Dịch vụ API/công cụ bên ngoài có điều kiện và chi phí riêng.
- Đã chốt: người muốn dùng tính năng AI của website tự kết nối API riêng (BYOK). Đọc nội dung, tìm tài nguyên và học theo hướng dẫn không bắt buộc nhập key.
- Chủ website chịu trách nhiệm biên tập cuối; AI hỗ trợ nghiên cứu, bản nháp và kiểm tra.
- Người dùng xác nhận có Gemini API trả phí; chọn Gemini làm nhà cung cấp AI ban đầu. Chưa cấu hình key hoặc chọn model.
- MVP ưu tiên đọc, tìm kiếm và thực hành; chưa cung cấp môi trường chạy repo cho khách.
Các giả định này có thể đổi mà không cần thiết kế lại toàn hệ thống.

## 3. Trải nghiệm cần giải quyết

| Người đọc | Nhu cầu | Website giúp bằng cách nào |
|---|---|---|
| Người mới hoàn toàn — nhóm chính | Chưa biết chọn/cài công cụ hoặc bắt đầu từ đâu | Lộ trình chuẩn bị, cài đặt có kiểm tra, tác vụ đầu tiên; giải thích thuật ngữ đúng lúc |
| Người có việc cụ thể | Muốn làm landing page, slide hoặc tự động hóa | Tìm theo kết quả công việc, xem yêu cầu trước khi cài |
| Người đang dùng agent | Cần skill phù hợp với công cụ của mình | Bộ lọc công cụ, hệ điều hành và trạng thái kiểm chứng |
| Người đã cài thử | Không biết kết quả đúng hoặc sửa lỗi thế nào | Kết quả mong đợi, lỗi thường gặp và cách gỡ bỏ |
| Biên tập viên | Bài có thể lỗi thời sau mỗi lần upstream đổi | Hàng đợi thay đổi, bản so sánh và cảnh báo cần thử lại |

Giả thuyết khác biệt: giúp người đọc vượt bước chọn công cụ và thiết lập bằng bài tiếng Việt có bằng chứng, so với phương án họ đang dùng (AI, video, tìm kiếm hoặc directory). Cần thử với 5 người đầu tiên; không coi danh sách repo hoặc bản dịch là lợi thế đã được chứng minh.

Luồng ưu tiên: chọn việc muốn làm -> kiểm tra thiết bị/tài khoản/ngân sách -> chọn một
công cụ có lý do -> cài/khởi tạo theo OS -> kiểm tra công cụ chạy được -> tác vụ nhỏ
đầu tiên -> đối chiếu kết quả -> giới thiệu repo/skill khi thực sự cần. Người đọc có
thể bỏ qua bước đã biết; không buộc tạo tài khoản website để đọc. Tài khoản công cụ
bên ngoài là yêu cầu khác, phải giải thích trước và có đường xem thử/chuẩn bị nếu thiếu.

### 3.1. Thiết kế nhập môn cho người chưa cài công cụ

Trang chủ ưu tiên Tôi bắt đầu từ đâu và kết quả có thể làm; không mở đầu bằng GitHub,
stars, CLI hoặc bảng so sánh nhiều agent. Repo mới vẫn có mục khám phá, nhưng không
buộc đọc danh mục trước khi bắt đầu học.

Hướng dẫn dùng ảnh chụp phiên bản đã kiểm tra, dấu hiệu thành công sau từng bước và
đường sửa lỗi tương ứng. Chưa đưa lệnh cài dài trước khi xác định OS và nơi chạy lệnh.
Giải thích terminal, thư mục và repo tại lúc cần, tránh dạy mọi thuật ngữ trước tác vụ.
Không tự cài hàng loạt skill hoặc đưa key vào prompt để rút ngắn bài.

Nêu rõ máy tính cần có, tài khoản/chi phí công cụ và quyền trước cài. Gemini API trả
phí của chủ website dùng cho bộ biên tập nền; không có nghĩa học viên phải mua Gemini
API để đọc/học. Khách chỉ kết nối API riêng khi chủ động dùng tính năng AI của website; website không cấp quota của chủ để chạy thay họ. Chưa hứa mọi công cụ ngoài miễn phí khi chưa
chọn và kiểm tra công cụ. Có thể xem kết quả mẫu trước nếu chưa đủ điều kiện thực hành.

Nghiệm thu nhập môn gồm hai kết quả tách biệt: (1) công cụ đã sẵn sàng, (2) tác vụ đầu
tiên đạt checklist. Thử với người chưa từng cài công cụ; ghi trợ giúp, lỗi OS, điều
kiện thiếu và lỗi hướng dẫn. Chưa dùng phản hồi của developer thay cho nhóm chính.

## 4. Cấu trúc nội dung và điều hướng

Menu đề xuất để thử: Bắt đầu / Khám phá / Thực hành.
Skills là trang đích/bộ lọc dưới Khám phá; Hướng dẫn và Bộ thực hành thuộc Thực hành. Các loại nội dung vẫn tách trong dữ liệu; kiểm tra người dùng hiểu nhãn trước khi khóa thiết kế.
Ô tìm kiếm luôn dễ thấy; trang giới thiệu, tiêu chí tuyển chọn và liên hệ ở footer.

| Trang | Nội dung chính | Hành động ưu tiên |
|---|---|---|
| Trang chủ | Chọn nhu cầu, lộ trình người mới, đề xuất có biên tập, cập nhật đáng chú ý | Tìm công cụ hoặc bắt đầu một bài |
| Bắt đầu | Chọn công cụ theo điều kiện, chuẩn bị/cài/kiểm tra, tác vụ đầu; thuật ngữ giải thích đúng lúc | Hoàn thành bước hiện tại và biết bước kế tiếp |
| Khám phá | Repo, ứng dụng và bộ mẫu dự án; danh sách có lọc | Mở hướng dẫn phù hợp |
| Skills | Skill cụ thể, công dụng, công cụ đã thử và quyền cần cấp | Xem cách cài và ví dụ |
| Chi tiết tài nguyên | Lợi ích, điều kiện, nguồn, tình trạng, hướng dẫn và giới hạn | Đọc hướng dẫn / mở repo gốc |
| Hướng dẫn | Các bước thực hiện, kết quả, lỗi, gỡ bỏ | Hoàn thành một việc |
| Bộ thực hành | Chuỗi bài dẫn tới một sản phẩm nhỏ | Bắt đầu bài đầu tiên |
| Có gì mới | Thay đổi ảnh hưởng tới cách dùng, có giải thích | Xem bài đã cập nhật |

URL dự kiến: /bat-dau/, /kham-pha/, /tai-nguyen/{slug}/, /huong-dan/{slug}/,
/bo-thuc-hanh/{slug}/. /skills/ là bộ lọc theo loại tài nguyên; một skill chỉ có một
trang chi tiết chuẩn để không trùng nội dung.

Mốc A ưu tiên bộ lọc nhu cầu và công cụ AI; các bộ lọc khác chỉ mở rộng khi dữ liệu đủ hữu ích. Bộ lọc toàn MVP: loại tài nguyên, độ khó, hệ điều hành, yêu cầu chi phí
và tình trạng thử nghiệm. Chi phí công cụ/API/hosting phải tách khỏi giấy phép repo:
repo mã nguồn mở không đồng nghĩa chạy hoàn toàn miễn phí.

### 4.1. Hai lớp nội dung với cam kết khác nhau

| Lớp | Cam kết với người đọc | Điều kiện |
|---|---|---|
| Khám phá có nguồn | Biết công cụ mới làm được gì, vì sao đáng chú ý | Nguồn/version rõ; chưa thử thì ghi Chưa thử |
| Thực hành có kiểm chứng | Làm ra kết quả theo checklist trong môi trường đã nêu | Có validation, input mẫu, kết quả và cách sửa lỗi |

Một phát hiện có thể chỉ ở hàng đợi nội bộ; không mặc định sinh một bài SEO. Trang
khám phá có thể dẫn sang bài thực hành khi đã thử. Thu thập hằng ngày nhưng xuất bản
theo chất lượng/công suất. Không buộc mỗi repo có bài thực hành riêng.

## 5. Phạm vi bản đầu

Mục tiêu nội dung bản MVP đầy đủ: 20 tài nguyên tuyển chọn, 6 hướng dẫn nền tảng, 3 bộ thực
hành ngắn. Đây là chỉ tiêu kế hoạch, chưa phải các mục đã được kiểm chứng.
Tuyển chọn tập trung, tránh đăng hàng trăm mục chỉ có bản dịch README.

Chia thành hai mốc để có đường cắt rõ khi quá tải:
- Mốc A — mở thử: theme/plugin nội dung, tìm/lọc, trạng thái nguồn, nhập tay; 10 tài nguyên,
  3 hướng dẫn và 1 bộ thực hành; bao phủ chuẩn bị/cài/kiểm tra cho người mới hoàn toàn. Ưu tiên một công cụ/OS được chọn, không gắn nhãn rộng.
- Mốc B — MVP có tự động hóa: collector, AI, quản trị job/ngân sách; mở rộng tới mục tiêu
  20/6/3 sau khi đo được công suất biên tập. Mốc A không phụ thuộc phải có API AI.
Nếu vượt nguồn lực, hoãn mốc B hoặc giảm lượng bài; không cắt provenance, kiểm chứng và
khả năng khôi phục. Không dùng số lượng bài để ép xuất bản nội dung chưa được kiểm tra.

Có trong MVP:
- Trang chủ, danh sách, lọc và tìm kiếm tiếng Việt; liên kết nguồn gốc rõ ràng.
- Trang chi tiết thống nhất, trạng thái thử nghiệm và lịch sử cập nhật.
- Mốc A: quản trị tài nguyên/bài/nguồn nhập tay, trạng thái thử và field bằng chứng bắt buộc.
- Mốc B: quản trị nguồn theo dõi, job đồng bộ, bản nháp AI, lỗi và ngân sách; không chặn mở thử A.
- Mốc B: theo dõi các nguồn đã chọn; tự cập nhật field quan sát và tạo bản nháp có thay đổi.
- Phản hồi bài lỗi/lỗi thời có chống spam; không cho tải lên file hay chạy lệnh từ form.
- Lưu mục yêu thích trên thiết bị bằng localStorage nếu pilot cần; có thể hoãn để ưu tiên luồng thực hành, không cần tài khoản.

Để sau MVP: cộng đồng, đánh giá sao công khai, đồng bộ bookmark đa thiết bị, chatbot,
gói skill cài một lần, sandbox công khai, khóa học trả phí, marketplace và newsletter.
Không thêm WooCommerce khi chưa có nhu cầu giao dịch thực tế.

## 6. Tuyển chọn và cấu trúc một mục giới thiệu

Danh sách ứng viên bắt đầu từ nguồn chính thức và nguồn cộng đồng có thể xác minh.
Ví dụ nguồn khảo sát: anthropics/skills, vercel-labs/agent-skills, vercel-labs/skills.
Đây là nguồn ứng viên, không phải tuyên bố mọi nội dung trong đó đều phù hợp hoặc đã thử.
Mỗi skill trong repo nhiều skill phải được đánh giá riêng.

Thang biên tập nội bộ 100 điểm: hữu ích 30; dễ bắt đầu 25; tài liệu và khả năng tái hiện
20; duy trì và chất lượng nguồn 15; khả năng Việt hóa phù hợp 10. Tạm dùng 70 điểm để
vào danh sách xem xét; hiệu chỉnh sau 20 ứng viên. Stars là tín hiệu phụ, không phải
chứng chỉ an toàn. Điểm xếp hạng không thay thế kiểm tra quyền và giấy phép.

Điều kiện chặn: nguồn không xác minh được; không giải thích được quyền truy cập;
điều kiện sử dụng không rõ cho hình thức phân phối dự kiến; hoặc thử nghiệm thất bại
chưa có cách khắc phục. Có thể giới thiệu phân tích và dẫn nguồn trong phạm vi phù hợp,
nhưng không mặc định sao chép hoặc phát hành lại tài liệu/mã chưa rõ quyền.

Mẫu bài:
1. Làm được việc gì, phù hợp ai, khi nào không nên dùng.
2. Ảnh hoặc kết quả thật khi đã thử; ghi rõ minh họa nếu chưa có bằng chứng chạy.
3. Cần chuẩn bị: tài khoản, OS, phiên bản, quyền, dịch vụ ngoài và chi phí.
4. Cách bắt đầu theo công cụ cụ thể; không gắn nhãn tương thích chỉ vì cùng dùng SKILL.md.
5. Ví dụ tiếng Việt, đầu vào mẫu, đầu ra mong đợi và cách tự kiểm tra.
6. Lỗi thường gặp, cách dừng, gỡ bỏ hoặc khôi phục.
7. Nguồn, tác giả, giấy phép tương ứng, commit/release, ngày thử và thay đổi mới.

Mỗi bài thực hành có manifest: nguồn/commit, agent/OS/version, quyền/dịch vụ ngoài,
input mẫu, brief và prompt khởi đầu, checkpoint phiên bản, checklist kết quả, ngày thử
và phạm vi đã kiểm tra. Cùng prompt có thể tạo mã khác; tiêu chí là đầu ra/hành vi đạt
checklist, không hứa kết quả giống demo. Có một bước sửa/kiểm tra bằng agent để dạy
vòng làm việc, không chỉ sao chép lệnh cài.

Giới hạn ma trận kiểm chứng theo công suất: một công cụ/OS ưu tiên ở bản mở thử, tổ hợp
khác chỉ khẳng định ở mức có nguồn hoặc chưa thử. Không suy ra đã kiểm tra mọi tính
năng từ một lượt lệnh chạy được.

Trạng thái công khai: Chưa thử / Đã thử với môi trường cụ thể / Cần kiểm tra lại /
Tạm ngừng khuyến nghị. Thông tin hoạt động GitHub có ngày lấy dữ liệu riêng với ngày
kiểm thử. Một repo mới commit không tự trở thành bài vừa được kiểm chứng lại.

## 7. Thiết kế UI/UX

Hướng mỹ thuật: một bàn làm việc học công cụ có hướng dẫn. Dùng bố cục sáng, dễ đọc,
nhiều khoảng thở; điểm nhận diện là ô chọn nhu cầu và ví dụ đầu ra, thay vì banner AI
với hiệu ứng nền hoặc danh sách vô tận các thẻ giống nhau.

Bảng màu đề xuất:
- Nền #F6F8FC; bề mặt #FFFFFF; chữ #16243A.
- Hành động chính #2456B8; hỗ trợ #126A61; đường viền #D7DFEA.
Màu là token ban đầu, phải đo tương phản theo từng cặp trước nghiệm thu. Nhãn trạng
thái luôn có chữ/biểu tượng, không chỉ dùng màu. Không tự nhận đạt accessibility khi
mới chọn bảng màu.

Chữ: Be Vietnam Pro cho giao diện và nội dung, font monospace chỉ dành cho mã/lệnh.
Cỡ thân bài 17–18px, chiều rộng nội dung khoảng 65–75 ký tự, giãn dòng 1.6–1.75.
Kiểm tra giấy phép font, tự lưu font trên hosting nếu phù hợp và dùng font dự phòng.
Tiêu đề, nút và thuật ngữ dùng tiếng Việt nhất quán; giữ nguyên tên sản phẩm/lệnh.

Wireframe trang chủ:

    Logo       Bắt đầu   Khám phá   Thực hành       Tìm kiếm
    Bạn muốn làm gì cùng AI?
    [Tạo website] [Làm tài liệu] [Tự động hóa] [Tìm skill]
    Ô tìm: Ví dụ “tạo trang giới thiệu bằng tiếng Việt”
    Lần đầu bắt đầu? [Lộ trình ngắn có hướng dẫn]
    3 lựa chọn được biên tập: lý do chọn + điều kiện sử dụng
    Bài thực hành nổi bật        Những hướng dẫn vừa thay đổi
    Tiêu chí tuyển chọn / Nguồn / Giới thiệu / Góp ý

Wireframe trang tài nguyên trên desktop:

    Tên + mô tả kết quả                      Nguồn và thông tin nhanh
    Trạng thái thử + ngày + phiên bản        [Xem hướng dẫn]
    Ví dụ đầu ra                            [Mở GitHub gốc]
    Dùng khi nào / Yêu cầu / Cách bắt đầu / Lỗi / Lịch sử

Màn hình nhỏ: nội dung một cột, bộ lọc mở theo yêu cầu, giữ lựa chọn trong URL; nút
hướng dẫn dễ thấy, không dùng sidebar hẹp. Không ép người dùng copy lệnh quá sớm.
Lệnh phải có tên môi trường, nút sao chép và phản hồi rõ ràng; bước nhập khóa không
được hướng dẫn gửi khóa vào chat hoặc ô công khai.

Trải nghiệm tìm kiếm: nhận từ có/không dấu, alias “vibecode”, “vibe coding”, “kỹ năng”,
“skill”; ưu tiên tên và nhu cầu trước độ phổ biến. Kết quả rỗng gợi ý bỏ bộ lọc hoặc
xem hướng dẫn nền tảng. Không ngầm hứa tìm kiếm ngữ nghĩa trong MVP.

Prototype bắt buộc có bốn màn hình: trang chủ, danh sách, tài nguyên, hướng dẫn thực
hành. Kiểm tra toàn hành trình tới kết quả và bước tiếp theo, không chỉ điều hướng.
Trang hướng dẫn có: điều kiện đầu vào -> bước hiện tại -> kết quả -> lỗi -> bước tiếp.
Nếu thiếu tài khoản/ngân sách/quyền cài, giải thích sớm và dẫn tới bài phù hợp hoặc mẫu
để xem trước; không để người đọc mắc sau khi đã làm nhiều bước.

Mobile: ghi rõ bài cần máy tính trước CTA; link tới từng bước để tự chuyển thiết bị.
Lưu lựa chọn OS cục bộ nếu phù hợp, không trộn lệnh các OS vào một luồng mặc định;
chưa cần đồng bộ tài khoản. Prototype thử cả đóng/mở lại bài và tiếp tục thực hành.

Tìm/lọc: xây 15–20 truy vấn từ lời người dùng với đáp án kỳ vọng, thử có/không dấu,
alias, giữ bộ lọc trong URL, bỏ từng bộ lọc và tổ hợp rỗng. Chỉ mở bộ lọc nâng cao khi
có giá trị phân biệt. Không coi search mặc định của WordPress là đã đạt các tiêu chí.

## 8. Kiến trúc phần mềm

    GitHub API + tài liệu nguồn được phép đọc
                     |
    Bộ xử lý Node.js: thu thập -> chuẩn hóa -> phát hiện thay đổi
                     |
    Bản chụp nguồn + hàng đợi bền vững + AI tạo bản nháp
                     |
    REST API có xác thực, giới hạn quyền ghi
                     |
    WordPress: plugin nghiệp vụ + database + biên tập
                     |
    Theme riêng: trang công khai + tìm kiếm + bộ lọc

Ba thành phần:
- Theme vne-agent-library: trình bày, template, accessibility, CSS và JavaScript nhẹ.
- Plugin vne-library-core: loại nội dung, taxonomy, field, quyền, API nhập, lịch sử nguồn.
- Collector Node.js: adapter GitHub, giới hạn tần suất, đối chiếu nguồn, công việc AI.

Dữ liệu nghiệp vụ ở plugin để đổi theme không mất cấu trúc nội dung, phù hợp hướng dẫn
WordPress [S1]. Ưu tiên render phía server, CSS và JavaScript tối thiểu; dùng block
editor cho bài hướng dẫn. Không dùng page builder nặng làm phụ thuộc cốt lõi.

Collector chạy độc lập với request của khách. Giai đoạn đầu có thể chạy thủ công trên
local; khi vận hành chuyển sang GitHub Actions theo lịch với giới hạn công việc.
Không dựa vào filesystem tạm của runner để giữ hàng đợi. Trạng thái bền vững đặt ở
WordPress; bản chụp nguồn có giới hạn dung lượng và retention, không lưu không hạn.
GitHub schedule có thể chậm/mất lần chạy [S4], nên có checkpoint, nút chạy lại và nhãn
lần đồng bộ thành công cuối; không hứa đúng phút hoặc realtime.

Tích hợp nội dung dùng tài khoản WordPress chuyên dụng và Application Password qua
HTTPS nếu hosting hỗ trợ [S2]. Quyền collector chỉ tạo/sửa ứng viên, bản nháp và field
quan sát; không được tự publish, đổi quyền người dùng, cài plugin hoặc ghi bài đã xuất
bản tùy ý. Chỉ người biên tập có quyền publish. Endpoint riêng kiểm tra schema, khả năng
truy cập từng field, kích thước request và không nhận URL đích tùy ý để fetch.

## 9. Mô hình dữ liệu và khả năng kiểm toán

| Thực thể | Khóa ổn định | Dữ liệu cần giữ |
|---|---|---|
| Source | GitHub repository ID | owner/name hiện tại, URL, trạng thái archived, nguồn tin cậy, ETag |
| Resource | repo ID + đường dẫn skill/tài nguyên chuẩn hóa | loại, nhu cầu, trình độ, field công khai, liên kết hướng dẫn |
| Source snapshot | resource + commit SHA + hash nội dung | đường dẫn, thời điểm lấy, giấy phép liên quan, phần nguồn được phép giữ |
| Editorial version | resource + phiên bản bài | nguồn đã dùng, bản nháp, bản đã duyệt, người duyệt, ngày kiểm tra |
| Validation | resource + agent/OS/version | thao tác thử, kết quả, bằng chứng đã loại bí mật, thời điểm |
| Job | resource + source hash + loại thao tác | trạng thái, retry, chi phí, lỗi, khóa chống chạy trùng |

WordPress Custom Post Types: tài nguyên, hướng dẫn và bộ thực hành. Taxonomy cho nhu
cầu, loại tài nguyên và công cụ; các field version/nguồn dùng metadata có schema.
Mốc B: Jobs và snapshot dùng bảng riêng có index/unique key, tránh nhồi log lớn vào postmeta. Mốc A vẫn lưu đủ nguồn cho field bắt buộc, nhưng có thể hoãn cơ chế claim tổng quát/tự động tới B.
Đổi tên repo vẫn theo repository ID; đổi đường dẫn skill phải được đối chiếu trước khi
gộp. Nội dung bị xóa upstream được đánh dấu, không tự xóa bài hoặc redirect sai mục.

Nguồn cấp trường: mỗi claim có claim_type, value, source_snapshot_id, source_path hoặc
source_url, evidence_excerpt ngắn, agent/OS/version nếu liên quan, observed_at và mức
xác nhận. Bắt buộc cho chi phí, quyền truy cập, giấy phép, lệnh cài và tương thích.
Ví dụ compatibility = confirmed cần validation_id đúng agent/OS/version; nếu chỉ thấy
nhà phát triển nói hỗ trợ thì lưu upstream_claimed, chưa gắn nhãn đã thử.
Chi phí cần chỉ rõ loại phí và nguồn/ngày tra cứu; không xác định được thì unknown,
không chuyển thành miễn phí. Thông tin mâu thuẫn giữ cả hai nguồn, đánh dấu conflicted
và đưa vào hàng đợi; không để AI tự chọn một nguồn rồi che mâu thuẫn.

Field độ mới: owner, reviewed_at, review_due_at, lý do/tác động kiểm tra lại và hạn ưu
tiên. Hàng đợi có cả bài tới hạn dù repo không đổi, vì giao diện công cụ, giá và điều
kiện tài khoản có thể đổi độc lập. Chọn chu kỳ theo rủi ro từng claim từ pilot; không
cập nhật ngày Đã thử chỉ vì link trả HTTP 200. Bài quá hạn được cảnh báo/giảm đề xuất.

Hướng dẫn do người sửa và dữ liệu GitHub tự cập nhật được lưu ở field khác nhau. Mỗi
lần nhập có khóa idempotency, chạy lại không tạo bài trùng và không mất chỉnh sửa tay.
Schema database có version và migration tương thích ngược; backup trước migration.

## 10. AI và Việt hóa

Dùng một pipeline có các bước chuyên biệt và đầu ra JSON kiểm tra được; chưa cần hệ
nhiều agent tự quyết định hoặc trao quyền chạy lệnh cho nội dung thu thập.

AI hỗ trợ: phân loại nhu cầu, giải thích cho người mới, soạn ví dụ, tóm tắt thay đổi,
phát hiện nội dung cần kiểm tra lại. AI không tự xác nhận đã chạy thử, không suy đoán
chi phí hoặc tính tương thích từ tên repo. Thiếu bằng chứng thì ghi chưa rõ.

Mỗi trường thực tế quan trọng phải gắn nguồn: đường dẫn file, commit hoặc tài liệu chính
thức. Tách dữ kiện trích từ nguồn với nhận xét biên tập. Ghi model ID, phiên bản prompt,
ngôn ngữ và chi phí thực tế vào log nội bộ, không đưa prompt hoặc token lên trang công khai.

Việt hóa theo hai lớp:
- Mặc định: bài giải thích và hướng dẫn riêng bằng tiếng Việt, dẫn link gốc.
- Tùy điều kiện: bản dịch README hoặc SKILL.md nếu quyền sử dụng cho phép; giữ attribution,
  thông báo giấy phép và bản gốc theo yêu cầu tương ứng, ghi rõ đây là bản dịch không chính thức.

Không dịch tên file, mã, cờ CLI, khóa YAML hoặc định danh API. Bản dịch skill có thể đổi
hành vi agent; cần thử lại trước khi cung cấp như gói dùng được. Giấy phép được xem tại
file cụ thể và revision tương ứng; một repo có thể chứa nhiều điều kiện [S5, S6].

Nhà cung cấp AI ban đầu: Gemini API trả phí do chủ website đã có. Model cụ thể chưa
chọn: benchmark trên 10 đầu vào đại diện về độ đúng nguồn, tiếng Việt, đầu ra JSON và
chi phí, rồi ghim model ID vào cấu hình. Chưa dùng API key hoặc gọi dịch vụ có phí trong
bước lập kế hoạch. Key lưu trong secret của môi trường chạy, không ở frontend hoặc Git.

Phân vai rõ: GitHub API xác minh repository, số sao, thời điểm hoạt động và release;
Gemini đọc tài liệu, phân loại, giải thích, tóm tắt và viết bản nháp. Có thể bật Grounding
with Google Search ở model hỗ trợ để tìm bài giới thiệu hoặc thông báo ngoài GitHub,
giữ thông tin trích dẫn trả về và đáp ứng yêu cầu hiển thị/điều khoản của dịch vụ [S7].
Không coi kết quả tìm kiếm hoặc câu trả lời AI là bằng chứng repo đã được chạy thử.

Grounding là công cụ có cơ chế tính phí riêng theo model [S9]; có Gemini API trả phí
không đồng nghĩa tìm kiếm không giới hạn hoặc miễn phí. Giới hạn token, số mục và số
lượt công cụ; một lượt gọi model có thể phát sinh nhiều truy vấn tìm kiếm. Ghi usage
thực tế nếu API cung cấp, dự trù trước mỗi job và dừng nhận job mới khi gần ngưỡng.
Ngưỡng trong ứng dụng không được quảng bá là trần hóa đơn tuyệt đối của nhà cung cấp.

### 10.1. Cổng chất lượng Gemini trước khi mở rộng

Kiểm tra trước nhập draft: snapshot/path tồn tại, excerpt khớp phần nguồn lưu được,
phiên bản/môi trường phù hợp, claim bắt buộc có evidence. Thiếu hoặc mâu thuẫn chuyển
unknown/conflicted. Việc đoạn dẫn có thực sự hỗ trợ kết luận vẫn cần người duyệt;
JSON đúng schema hoặc hai model đồng ý không chứng minh nội dung đúng [S11].

Bộ benchmark ban đầu 10 ca đại diện: đủ/thiếu/mâu thuẫn nguồn, repo nhiều skill, quyền
phức tạp, README cũ hơn release, đổi lệnh cài, link hỏng và prompt injection. Tách ca
phát triển và một phần ca giữ lại; đổi model/prompt/schema đáng kể phải chạy lại.
Mười ca là test hồi quy ban đầu, không phải đo độ tin cậy mọi repo.

Lỗi chặn: bịa đã thử, sai/lệch nguồn về lệnh/chi phí/quyền/tương thích, dịch hỏng định
danh, thực thi chỉ dẫn từ nguồn. Không cho điểm tổng bù lỗi chặn. Chủ biên chốt rubric
và ngưỡng trước benchmark; điểm mềm gồm tiếng Việt, độ hữu ích, công sửa và chi phí.
Báo từng ca, lỗi lọt/lỗi chặn nhầm, thời gian biên tập và chi phí mỗi bài được duyệt.

### 10.2. AI cho người dùng: Bring Your Own Key (BYOK)

Quyết định sản phẩm: website không thu phí sử dụng. Người dùng tự kết nối API của mình
khi muốn chạy tính năng AI. Token/quota và phí dịch vụ phát sinh thuộc tài khoản API
của họ theo điều kiện nhà cung cấp; website không thu tiền hộ, bán credit hoặc mặc định
bảo đảm AI miễn phí. Không cần API key để đọc nội dung, tìm kiếm thông thường hoặc học.

Hai luồng phải được cô lập:

| Luồng | Key sử dụng | Ai khởi chạy | Phạm vi |
|---|---|---|---|
| Biên tập nền | Gemini API của chủ website, trong secret hệ thống | Job đã cấu hình theo ngân sách biên tập | Tìm nguồn, tạo draft, cập nhật nội dung |
| AI theo yêu cầu của khách | API key do khách cung cấp | Khách chủ động bấm tác vụ được mô tả | Kết quả riêng của yêu cầu, không tự xuất bản |

Không dùng key khách cho cron, cải thiện kho bài, khách khác hoặc làm fallback khi key
chủ hết quota. Không dùng key chủ bù lỗi/quota của khách. Nội dung AI riêng không được
nhập công khai hoặc gộp vào pipeline biên tập mà không có hành động chia sẻ riêng.

Phạm vi AI cho khách cần chốt: ví dụ giải thích/Việt hóa repo theo nhu cầu hoặc hỗ trợ
hiểu bước học. Đây là ứng viên tính năng, chưa phải quyết định xây chatbot/tất cả tác vụ.
Đề xuất adapter Gemini trước cho pilot; các nhà cung cấp/model được hỗ trợ và thời
điểm phát hành còn mở. Không coi key từ bất kỳ dịch vụ nào đều tương thích Gemini.
Mốc A đọc/học vẫn độc lập; tính năng BYOK chỉ phát hành sau cổng an toàn, không tự gộp
vào collector B hoặc buộc người mới có key ngay trong bài đầu.

Thiết kế mặc định đề xuất: key chỉ dùng cho yêu cầu đang chạy, không lưu lâu dài.
Khách nhập trong giao diện có che ký tự; bản đầu không ghi key vào localStorage,
cookie/session server, database, job queue, URL, Git, analytics hoặc log. Trình duyệt
cần giữ giá trị trong bộ nhớ khi gửi; có nút Ngắt kết nối/xóa giá trị khỏi giao diện.
Không quảng bá là không qua server: nếu dùng backend proxy, key và input đi qua
backend qua HTTPS để gọi đúng nhà cung cấp [S15]. Cần nói rõ luồng này trước khi gửi.

Backend dùng key theo từng request/đối tượng client, không đổi biến môi trường dùng
chung hoặc singleton toàn hệ. Xử lý xong không giữ key cho việc sau; không hứa xóa
bộ nhớ vật lý tuyệt đối. Phải kiểm tra reverse proxy, error tracking, cache và log PHP
không lưu request body/header có bí mật; response riêng không được public-cache.
Nếu hạ tầng không bảo đảm các điều này, chưa bật BYOK công khai. Lưu key lâu dài chỉ
là lựa chọn tương lai cần thiết kế kho mã hóa, quyền, thời hạn và thu hồi riêng.

Giao diện cho biết provider/model, dữ liệu sẽ gửi, hạn mức đầu vào/đầu ra và phí có thể
phát sinh trước khi khách bấm tác vụ. Mọi phép kiểm tra key có thể gọi API phải giải
thích rõ, không ngầm gọi model có phí khi chỉ nhập key hoặc tải trang. Không tự chuyển
model đắt hơn, bật tìm kiếm Grounding hoặc retry nhiều lần vượt lựa chọn của khách.
Usage/cost không xác định thì báo chưa xác định, không báo bằng 0; không hứa trần hóa
đơn tuyệt đối. Khách có thể thu hồi key ở nhà cung cấp.

Giới hạn tải máy chủ riêng với quota API: rate limit, concurrency, token/input, timeout
và chống gửi tác vụ lặp. Mốc đầu không nhận base URL API tùy ý, endpoint provider theo
danh sách cho phép để tránh biến proxy thành dịch vụ chuyển tiếp tùy ý. Kết quả HTML
phải được sanitize/escape; source/prompt vẫn là dữ liệu không tin cậy.

Nghiệm thu BYOK trước khi công khai:
- Hai khách dùng hai key đồng thời không lẫn key, input hoặc output; không fallback key chủ.
- Key không xuất hiện ở log/error/cache/database/URL/queue; truy vết bằng mã sự kiện an toàn.
- Thiếu key, sai key, hết quota, timeout, response mất và ngắt kết nối có thông báo đúng,
  không tự retry gây phí mà người dùng không được biết hoặc chuyển sang provider khác.
- Đọc/học vẫn hoạt động khi chưa kết nối, provider lỗi hoặc BYOK tạm tắt.
- Có kiểm tra quyền truy cập/origin/chống lạm dụng phù hợp mô hình phiên; không coi
  WordPress nonce công khai đơn lẻ là đủ để cấp quyền proxy không giới hạn.
- Dùng key thử riêng/quota giới hạn khi kiểm thử được cho phép; không yêu cầu gửi key
  trong chat. Chưa có key khách hay API có phí nào được dùng trong bước lập kế hoạch.

## 11. Cập nhật tự động và vận hành

Lịch đề xuất ban đầu: một lượt tìm ứng viên và cập nhật metadata mỗi ngày theo múi giờ
Asia/Saigon; kiểm tra sâu khi có thay đổi tài liệu/release; biên tập theo đợt. Thời điểm
chạy sẽ chọn khi triển khai. Đây là lịch thiết kế, chưa có automation được tạo hoặc bật.

### 11.1. Biên tập viên AI tìm repo hằng ngày

Luồng: GitHub Search + danh sách nguồn theo dõi -> loại trùng/lọc chất lượng -> lưu số
liệu -> xếp ứng viên -> Gemini đọc nguồn -> tạo bản nháp WordPress -> người biên tập duyệt.

Bộ tìm kiếm dùng nhóm từ khóa/topic cho vibe coding, agent skills, công cụ AI hỗ trợ
lập trình, starter và tự động hóa. Dùng các bộ lọc ngày tạo/hoạt động, chủ đề và số sao
được GitHub hỗ trợ [S8]. Có nhánh phát hiện repo mới để không bỏ qua dự án ít sao nhưng
hữu ích. Không tuyên bố thu thập hết GitHub hoặc tái tạo chính xác GitHub Trending.

Ba nhóm đề xuất công khai:
- Đang tăng nhanh: có số liệu thực về mức tăng trong khoảng quan sát.
- Mới đáng chú ý: dự án mới, công dụng và tài liệu rõ; chưa cần lịch sử dài.
- Hữu ích lâu dài: phù hợp nhu cầu người mới và còn được duy trì, dù không gây sốt.

Dữ liệu sức hút lưu theo repository ID: stargazers_count, forks_count, observed_at,
ngày tạo, pushed_at và thông tin release. Tính chênh lệch sao ròng giữa các snapshot,
ghi đúng khoảng thời gian; nếu lệch mốc 24 giờ thì không gắn nhãn chính xác 24 giờ.
Snapshot đầu chỉ là baseline. Repo mới phát hiện chưa có lịch sử thì hiển thị chưa đủ
dữ liệu; không suy ra tăng trưởng từ tổng sao, ngày cập nhật hoặc lời Gemini nói.
Mức tăng sao chỉ là tín hiệu xếp hạng, không thay thế tiêu chí hữu ích và chất lượng.

Hạn mức pilot mỗi ngày (có thể giảm khi quota/chi phí không phù hợp):
- Tối đa 50 ứng viên duy nhất sau lọc và loại trùng; đây không phải số request API.
- Tối đa 10 ứng viên được Gemini phân tích sâu, ưu tiên mục mới hoặc nguồn thay đổi.
- Tối đa 3 bài nháp tiếng Việt; không đủ chất lượng thì tạo ít hơn hoặc không tạo.
- Grounding là bổ sung có hạn mức riêng, không gọi cho tất cả ứng viên mặc định.
- Job có khóa resource/source-hash, lưu checkpoint bền vững; chạy lại không trùng bài.

Bản nháp phải có: vì sao đáng chú ý hôm nay và số liệu quan sát hỗ trợ, công dụng,
đối tượng phù hợp, yêu cầu, chi phí còn chưa rõ, link nguồn và ngày lấy dữ liệu. Các
lệnh/cách dùng chỉ ghi theo nguồn; nếu chưa thử thực hành phải giữ nhãn Chưa thử.
Không biến tăng sao thành lời xác nhận an toàn, tương thích hoặc chất lượng mã.

Tách chọn trước AI và sau AI: trước AI dựa trên dữ kiện quan sát và mức liên quan; sau
AI/biên tập mới đánh giá hữu ích/dễ bắt đầu. Ghi query_version, cửa sổ thời gian,
trang/cursor/checkpoint, rule_version và lý do chọn. Dữ liệu thiếu không tự được điểm
cao. Chia suất giữa nguồn theo dõi, repo mới và nguồn tăng nhanh; tỷ lệ sẽ thử trong
pilot. Giới hạn tác giả/repo nhiều skill chiếm hết suất, có ngoại lệ biên tập có lý do.
Đạt 50 suất phải báo phần chưa quét, không tuyên bố bao phủ toàn GitHub. Fixture có
hơn 50 mục, trùng nhiều truy vấn và mất lượt chạy phải tiếp tục được, không bịa tăng sao.

### 11.2. Chạy thử 7 ngày trước khi mở rộng

Sau khi đã cấu hình credential, quyền và ngân sách, chạy pilot 7 ngày ở chế độ bản
nháp; chưa tự xuất bản. Mục tiêu là kiểm chứng cả tuyển chọn, chi phí và tải biên tập,
không phải cam kết luôn có 3 bài mỗi ngày. Không chạy mã từ repo được phát hiện.

Ghi mỗi ngày: số ứng viên mới/trùng, số mục đủ nguồn, chi phí token/grounding, số bản
nháp được duyệt, thời gian sửa và lỗi thực tế. Ngày đầu ghi baseline; đến cuối pilot
chỉ có thể đánh giá tăng trưởng trong khoảng đã quan sát, chưa mặc định có lịch sử
7 ngày cho mọi repo. Chạy kiểm thử nguồn không đổi, rate-limit, lỗi Gemini, thiếu quota,
JSON sai schema, nguồn bị xóa và nội dung chỉ dẫn độc hại trước khi bật lịch thật.

Điều kiện hoàn thành pilot: không xuất bản ngoài quyền; không tạo trùng khi chạy lại;
không gắn nhãn Đã thử do AI tự sinh; bản nháp có nguồn hoặc đánh dấu thiếu; thống kê
usage/chi phí và checkpoint đầy đủ, không lộ key. Chỉ mở rộng khi chất lượng và công
suất duyệt đáp ứng; nếu bài tồn tăng thì giảm lượng ứng viên/bản nháp thay vì tự duyệt.

| Thay đổi | Xử lý |
|---|---|
| Sao, ngày hoạt động, link | Tự cập nhật field quan sát với ngày đồng bộ |
| Nội dung nguồn không đổi | Không gọi AI lại |
| Cách cài, lệnh, dependency, license, quyền | Tạo bản sửa và đánh dấu cần rà soát; giữ hướng dẫn đã duyệt |
| Repo archived/xóa/chuyển chỗ | Đánh dấu tình trạng, cập nhật link đã kiểm tra; không tự xóa bài |
| Dịch vụ AI hoặc GitHub lỗi | Retry có backoff, giới hạn lượt; giữ nội dung cũ |
| Hướng dẫn cũ có nguy cơ rõ ràng | Cho biên tập viên ẩn khối cài đặt hoặc tạm ngừng khuyến nghị |

Quy tắc xử lý nội dung có dấu hiệu rủi ro: thay đổi license, quyền hoặc lệnh cài tự gắn
cờ công khai Cần kiểm tra lại (field quan sát), mở job ưu tiên và ghi rõ lý do. Nguồn
thông báo sự cố hoặc link cài đổi sang đích chưa xác minh có thể tự tạm ẩn khối sao chép
lệnh bằng cờ vận hành, không sửa nội dung biên tập hoặc kết luận repo độc hại. Chủ biên
là người xử lý, mục tiêu phản hồi trong một ngày làm việc; nếu chưa xử lý thì cảnh báo
vẫn hiển thị và mục không vào đề xuất cho người mới. Đo tỷ lệ cảnh báo nhầm ở pilot.

Chỉ cập nhật ngày biên tập khi bài thực sự được sửa. Kiểm tra ETag/conditional requests,
header rate-limit, Retry-After và giới hạn concurrency theo khuyến nghị GitHub [S3].
Có timeout cho từng nguồn, giới hạn nội dung, phát hiện redirect ra ngoài miền cho phép.
Một nguồn lỗi không dừng toàn bộ danh mục; không ghi log khóa bí mật.

Màn hình quản trị: nguồn đang theo dõi; ứng viên; bản nháp; bài cần kiểm tra lại;
job lỗi; lần chạy thành công cuối; ngân sách AI đã dùng. Có tắt riêng collector/AI/
xuất bản, chạy lại job và ghi chú lý do duyệt. MVP vẫn cần duyệt nội dung mới/thay đổi
cách dùng; tương lai chỉ nới tự động xuất bản khi có bằng chứng chất lượng và quy tắc rõ.

### 11.3. Phục hồi job, ngân sách và bằng chứng

Job tối thiểu: queued -> running có lease -> source_ready -> ai_ready -> imported;
thêm failed/retry/deferred. Nhận job nguyên tử, lease có hạn, thu hồi job treo. Lưu
kết quả AI trước nhập draft để retry nhập không gọi AI lại. Nếu Gemini xử lý nhưng
response mất, có thể tính phí lần nữa; ghi chi phí chưa rõ, không hứa exactly-once
đối với API ngoài. Khóa thế hệ AI gồm source hash + model/prompt/schema version; khóa
nhập tài nguyên ổn định để đổi prompt không tạo bài trùng hoặc mất chỉnh sửa tay.

Ngân sách: estimated/reserved/actual/unknown; tính cả job đang chạy và retry trước cấp
job mới. Thiếu usage thì giữ dự phòng để đối soát. Giới hạn ngày theo Asia/Saigon và
tháng, token và công cụ; dừng nhận việc khi gần ngưỡng. Ngưỡng ứng dụng vẫn không phải
trần hóa đơn tuyệt đối. Thử hai runner cùng nhận job và gần hết ngân sách, response
mất usage, runner chết giữa các checkpoint.

Retention: giữ bằng chứng tối thiểu đang được bài công khai/validation tham chiếu trong
phạm vi được phép lưu; không dọn theo tuổi đơn thuần. Chỉ dọn snapshot trung gian hết
hạn/không còn tham chiếu. Backup và restore phải giữ cả liên kết bài–nguồn–validation.
Không cần hệ thống hàng đợi ngoài cho pilot nếu WordPress đáp ứng các hợp đồng này.

### 11.4. Công suất biên tập và giới hạn danh mục đang duy trì

Chốt người phụ trách, giờ thực có mỗi tuần, phần dự phòng bảo trì/hỗ trợ trước khi bật
pipeline. Công suất bài mới = phần nguyên của (giờ thực có - bảo trì - hỗ trợ) / giờ
trung vị mỗi bài; xem cả bài khó nhất để dự phòng. Mức 3 nháp/ngày là trần thử, không
phải chỉ tiêu publish. Khóa việc mới khi backlog/tuổi hàng đợi vượt ngưỡng đã chốt từ
phép đo; có thể giữ lấy metadata nhẹ nhưng tạm ngừng gọi Gemini.

Ưu tiên: cảnh báo quan trọng -> bài cũ tới/quá hạn -> bài nền tảng -> tin mới. Khi chủ
biên vắng không tự publish/bỏ duyệt; giữ cảnh báo, giảm đề xuất và giảm nhận draft.
Mục tiêu xử lý một ngày làm việc ở trên chỉ áp dụng khi có người trực phù hợp; chốt
lịch trực thực tế trước vận hành. Mô phỏng vắng một tuần bằng fixture/đồng hồ giả,
không bắt buộc thêm một tuần lịch kiểm thử. Giới hạn danh mục theo khả năng duy trì.

## 12. An toàn và chất lượng nội dung

Repo, README và SKILL.md là dữ liệu không tin cậy. Lệnh nhúng trong nguồn không có
quyền điều khiển collector. Không cho bản nháp tự thực thi script, truy cập secret hoặc
đẩy mã vào nhánh triển khai. Thử repo ở môi trường cách ly, tài khoản và dữ liệu mẫu;
chỉ sau khi xem mã cài đặt, quyền và dịch vụ ngoài. Không dùng tài khoản production.

Tệp phát hành chỉ chứa theme/plugin của website; nguồn GitHub thu thập được không đi
thẳng vào gói triển khai. Nội dung Markdown/HTML được sanitize, output escape; field
lệnh là văn bản không thực thi. Khi nguồn kèm hướng dẫn nguy hiểm, bài phải giải thích
hoặc loại bỏ thao tác đó sau đánh giá, không đơn giản dịch lại.

Nhãn Đã thử phải có bằng chứng. Chứng thực cho Claude Code không tự áp sang Codex hay
Antigravity; lưu riêng từng môi trường. Tài trợ/affiliate được công khai và tách khỏi
điểm tuyển chọn. Không đặt nút cài một lần trước khi có cơ chế kiểm tra gói và phiên bản.

## 13. Triển khai và khôi phục

Cấu trúc mã dự kiến:

    theme/vne-agent-library/
    plugins/vne-library-core/
    collector/
    content-seeds/
    scripts/
    docs/
    .local/                    # không commit

Không deploy toàn bộ nhánh main vào web root. Giữ nhánh release hiện tại cho bằng
chứng kết nối; thêm hai payload/nhánh riêng deploy-theme và deploy-plugin. Mỗi payload
chỉ chứa file của thành phần tương ứng; Plesk trỏ lần lượt vào thư mục theme và plugin
đúng bên trong wp-content. Dùng kết nối Git Plesk riêng cho mỗi payload nếu gói cho phép;
nếu không, chốt cơ chế phát hành được kiểm thử trước khi đổi target hiện tại.

Payload được tạo lặp lại từ một commit/tag trên main bằng script build kiểm tra danh
sách file cho phép; không sửa tay hai nhánh deploy. Manifest ghi source_sha, phiên bản
theme/plugin, schema và cặp phiên bản tương thích. CI kiểm tra hai gói trước khi cập nhật
các nhánh phát hành; việc đổi ref phải có log và không được coi là deploy nguyên tử.
Phải thử trường hợp chỉ một gói thành công: plugin mới tương thích theme cũ, triển khai
plugin trước rồi theme; lỗi theme thì giữ plugin tương thích hoặc khôi phục cặp đã xác
nhận. Migration phá tương thích không được ghép vào một lượt cập nhật file thông thường.
Chốt và thử quy trình này ở staging trước khi đổi đích khỏi thư mục kiểm tra hiện tại.

Thứ tự: staging có PHP/MySQL thực tế -> kiểm thử plugin -> theme -> dữ liệu mẫu ->
nghiệm thu -> backup production -> phát hành từng thành phần có tương thích ngược.
Deploy file không thay thế bước kích hoạt theme/plugin hoặc migration database.
Nội dung nhập qua API vào database; không ghi đè database production từ local.

Plesk có thể chép file lần lượt, không mặc định là triển khai nguyên tử. Với thay đổi
có ảnh hưởng, dùng khung bảo trì hoặc cơ chế release có chuyển đổi đã được kiểm thử.
Không bật post-deploy shell để chữa tạm lỗi chưa hiểu. Kiểm tra file bị xóa khỏi bản
phát hành có được Plesk dọn đúng không, trước khi đưa thành phần thật lên.

Khôi phục mã bằng bản phát hành trước; rollback database chỉ theo backup/migration
đã thử. Collector có công tắc ngừng riêng; lỗi collector không làm trang đọc bị ngừng.
Thử quy trình backup/restore trên staging trước lần launch đầu. Dọn fixture/cache đúng
bộ chạy run-clean; giữ database local, nguồn, bằng chứng và gói phát hành.

## 14. Lộ trình và tiêu chí nghiệm thu

Tách rõ mở thử A khỏi tự động hóa B. Ước lượng cũ 15–27 ngày công kỹ thuật chỉ là mốc
tham chiếu của 1.1, chưa phải dự toán đã kiểm chứng cho 1.4. BYOK là phạm vi mới cần ước lượng riêng sau khi chốt tác vụ. Tách lại công kỹ thuật,
công nội dung và thời gian lịch sau khảo sát, một bài thực hành mẫu và prototype.
Không chốt lịch launch khi chưa biết công suất duyệt, hosting và số vòng sửa.

| Chặng | Công việc | Cổng nghiệm thu / phụ thuộc |
|---|---|---|
| A0. Xác định phạm vi | Brief người dùng, mục tiêu dự án, công cụ/OS, hosting, nguồn lực | Một nhu cầu rõ và bài mẫu đầu tiên có nguồn; giả thuyết ghi minh bạch |
| A1. Thiết kế | Prototype 4 màn hình và luồng điều kiện đầu vào tới kết quả | Thử với nhóm đầu, sửa lỗi chặn; chưa cần credential Gemini |
| A2. Xây bản đọc/nhập tay | Theme/plugin, field nguồn, tìm/lọc tối thiểu, bài thực hành | Bài có checklist/validation; truy vấn và quyền nhập tay hoạt động |
| A3. Mở thử A | Staging thật, backup/restore, nội dung, một kênh tiếp cận | Có thể mở thử độc lập với collector, Gemini và pilot 7 ngày |
| A4. Học từ mở thử | Quan sát hoàn thành, lỗi, công duyệt/bảo trì và nhu cầu tiếp theo | Quyết định giữ/thu hẹp/đổi phạm vi trước đầu tư B |
| B1. Collector | Truy vấn, snapshot, thứ tự chọn, job/lease, quyền nhập nháp | Không trùng, không mất sửa tay, phục hồi lỗi và giữ bằng chứng |
| B2. Gemini | Benchmark, evidence gate, ngân sách, draft và Grounding có hạn mức | Đạt rubric đã chốt, không lỗi chặn, usage/chi phí được đối soát |
| B3. Pilot 7 ngày | Chỉ tạo bản nháp, kiểm tra vận hành và công suất | Chất lượng/công suất đạt mới bật B; không chứng minh thị trường bằng pilot này |
| U. AI cho khách (thời điểm chưa chốt) | Một tác vụ BYOK, proxy theo provider, không lưu key mặc định | Vượt cổng an toàn/riêng tư, tách key chủ và khách; không chặn A/B |
| C. Mở rộng | Chủ đề, công cụ/OS, lượng nguồn và tính năng theo nhu cầu | Có bằng chứng người dùng và đủ khả năng bảo trì |

Mục tiêu số bài ở mục 5 là phạm vi dự kiến; có thể giảm để đạt chất lượng. Bộ 5 bài mẫu
phục vụ một kết quả chung, gồm trang lựa chọn/chuẩn bị, hướng dẫn và bài trong bộ thực
hành; không phải 5 dự án độc lập hoặc quota bắt buộc xuất bản trước thử bài đầu.

Đo giờ nghiên cứu, thử, viết, sửa và bảo trì. Không coi thời gian agent chạy là thay thế
công kiểm chứng. Pilot B cần 7 ngày lịch khi pipeline nháp sẵn sàng; không đồng nghĩa
7 ngày công bổ sung hoặc điều kiện để mở thử A.

Nghiệm thu A:
- Mỗi mục công khai có nguồn/version, thông tin quyền phù hợp, trạng thái thử và yêu cầu.
- Luồng đọc -> đủ điều kiện -> cài/khởi tạo -> kiểm tra sẵn sàng -> thực hành -> checklist -> bước tiếp hoạt động; ghi trợ giúp. Người thử nhập môn chưa từng cài công cụ.
- Không gắn nhãn đã thử tương thích ngoài validation đúng công cụ/OS/version/phạm vi.
- 15–20 truy vấn có đáp án kỳ vọng, có/không dấu, lọc ưu tiên, URL và trạng thái rỗng.
- Mobile 360px trở lên không tràn ngang ngoài vùng mã; biết bài cần máy tính trước cài.
- Bàn phím, focus, label và heading hợp lý; hướng tới WCAG 2.2 AA, phải thử thực tế.
- Mục tiêu lab LCP <=2.5s, CLS <=0.1; không lỗi console chặn tác vụ. INP/field data đo
  sau khi có traffic; không hứa điểm PageSpeed cố định.
- Chính sách index/sitemap/URL rõ, nguồn truy cập thử được ghi phù hợp, không fingerprint.
- Staging PHP/MySQL thật, backup/restore và deploy thành phần được diễn tập; không ghi
  đè database production từ local, không lộ credential trong Git/log/bằng chứng.

Nghiệm thu B bổ sung:
- Import cùng nguồn không trùng; đổi prompt/model có thể tạo bản sửa mà không mất sửa tay.
- Collector không publish hoặc sửa field biên tập công khai ngoài quyền cho phép.
- Benchmark có ca đúng/sai/mâu thuẫn/thiếu nguồn, lỗi chặn và công sửa theo từng ca.
- Mô phỏng rate-limit, nguồn bị xóa, AI lỗi, hai runner, mất response và thiếu usage.
- Job phục hồi, budget tính cả việc đang chạy, nguồn của bài không bị dọn mất.
- Pilot không tự publish, backlog trong khả năng xử lý; mô phỏng vắng người vẫn an toàn.

## 15. Chi phí, đo lường và rủi ro

Không chốt số tiền khi chưa benchmark và xem hạn mức tài khoản. Bảng chi phí cần theo
riêng: hosting/staging/backup; phút runner; lượt gọi GitHub; AI biên tập nền; hạ tầng xử lý BYOK cho khách; dung lượng snapshot;
thời gian biên tập/thử nghiệm. Đặt ngân sách tạm ngày/tháng trước khi gọi API; sau 7 ngày pilot điều chỉnh bằng dữ liệu thực tế. Tách chi phí token Gemini khỏi Google Search grounding, không mặc định được bao gồm trong gói hiện có.
AI chỉ xử lý nguồn thay đổi, không dịch toàn bộ repo và không re-run mọi bài mỗi ngày.
Khi vượt trần thì hoãn job, không tự mua quota hoặc nâng gói.

Chỉ số giai đoạn đầu: tìm kiếm ra kết quả phù hợp; tỷ lệ mở hướng dẫn; kết quả khảo sát
hoàn thành bài; tỷ lệ mục có bằng chứng thử; số phản hồi lỗi; tuổi hàng đợi biên tập;
chi phí mỗi bài được duyệt. Không suy ra đã hoàn thành chỉ từ thao tác copy lệnh.
Tách ba phép thử: benchmark AI theo ca; pilot kỹ thuật Gemini 7 ngày; thử sản phẩm với
5–8 người thuộc phân khúc dự kiến. Mẫu nhỏ dùng tìm lỗi/hypothesis, không suy rộng tỷ lệ
ra toàn thị trường. Chốt nhiệm vụ, điều kiện thiết bị/tài khoản, trợ giúp được phép và
checklist trước thử. Báo người hoàn thành / tổng người làm từng nhiệm vụ, thời gian,
trợ giúp, lỗi bài/môi trường/thiếu điều kiện; không dùng mẫu số 5 nếu tuyển số khác.

Hoàn thành = đầu ra vượt checklist, không phải xem hết bài/copy lệnh. Sửa và thử lại
lỗi chặn trước tăng nội dung. Theo dõi có tiếp tục hoặc áp dụng việc riêng ở lần trao
đổi sau; thử 7 ngày pipeline không chứng minh nhu cầu quay lại hoặc doanh thu. Đặt
ngưỡng quyết định trước mỗi phép thử, ghi giới hạn của mẫu và việc phải làm khi không đạt.
Giới hạn phân tích hành vi, công khai phù hợp; không fingerprint để nhận diện người.

Rủi ro chính: quá nhiều ứng viên làm nghẽn duyệt; bài lỗi thời; lời khẳng định AI thiếu
nguồn; khác biệt nền tảng; thay đổi quyền sử dụng; script độc hại; quota/chi phí; hosting
không đủ khả năng staging. Đáp án vận hành là giới hạn danh sách theo dõi, lưu version,
nguồn kiểm chứng, quyền tối thiểu, checkpoint, budget cap và mở rộng sau pilot.

Chi phí mỗi bài được duyệt cần tính cả AI, Grounding, runner, thử công cụ và công người
(nếu quy đổi giờ thì ghi đơn giá giả định). Ghi riêng giờ tạo bài, sửa và bảo trì.
Ngân sách tối đa, số giờ mỗi tuần và giới hạn danh mục đang duy trì phải được chốt
trước khi mở rộng, không mặc định API trả phí hiện có là chi phí biên bằng 0.

### 15.1. Content marketing và động lực quay lại

Mục tiêu cần chọn: tài nguyên cộng đồng, xây uy tín chuyên môn hoặc hỗ trợ dịch vụ
trong tương lai. Chưa chốt mục tiêu kinh tế; không mặc định phải bán hàng hoặc dự báo
doanh thu/traffic. Website miễn phí là quyết định đã chốt, không còn là giả định. Không xây paywall, bán lượt AI hoặc buộc mua gói của website để học; chi phí API bên ngoài phải được giải thích riêng.

Ba nhóm nội dung: nền tảng làm được việc; lựa chọn công cụ theo điều kiện; tuyển chọn
cập nhật giải thích ảnh hưởng và dẫn về bài thực hành. Mỗi mục mới phải có đóng góp
riêng như kết quả thử, ví dụ Việt Nam, lý do chọn hoặc cách vượt lỗi, không chỉ dịch
mô tả. Google khuyến nghị nội dung hữu ích và có quy định chống scaled content để thao
túng xếp hạng [S12, S14]; không mặc định AI bị phạt hoặc bảo đảm AI giúp SEO.

Mốc A thử một kênh chủ website đã sở hữu/được phép dùng; chọn khi thảo luận. Soạn đoạn
giới thiệu/ảnh đầu ra dẫn vào đúng bài, ghi nguồn chiến dịch ở mức phù hợp. Chưa tạo
lịch đăng, gửi tin nhắn hoặc email; xuất bản ra kênh khác là hành động riêng khi có yêu
cầu. Chưa cần xây newsletter hoặc nhiều kênh cùng lúc.

Vòng quay lại đề xuất: bài đầu -> biến thể áp dụng công việc riêng -> bài kế tiếp có
lý do -> cập nhật khi công cụ quan tâm đổi. Bookmark là tiện ích, không phải bằng chứng
retention. Đo người thực sự bắt đầu/hoàn thành theo nguồn và phản hồi nhu cầu tiếp;
không chỉ traffic, số draft hoặc lượt copy. Directory như skills.sh đã có chức năng
khám phá [S10]; lợi thế của website cần kiểm chứng bằng hướng dẫn/kết quả địa phương.

### 15.2. SEO kỹ thuật tối thiểu trước launch A

Một URL chuẩn cho tài nguyên; title/mô tả đúng; sitemap chỉ trang công khai đã duyệt;
liên kết bài nền tảng–thực hành–tài nguyên–sửa lỗi; redirect khi đổi slug/domain. Không
tạo URL indexable cho mọi phát hiện AI hoặc mọi tổ hợp lọc. Chọn rõ trang nào index,
chính sách crawl và trang tương đương nào dùng canonical. Tránh chặn crawl rồi mong
crawler đọc noindex; không coi canonical là cách che mọi nội dung khác nhau [S13].
Tác giả, ngày thử/sửa, nguồn và ảnh có alt hữu ích; không nhồi từ khóa hoặc tự gắn nhãn
miễn phí/tốt nhất/dễ cài nếu thiếu phạm vi và căn cứ.

## 16. Đề xuất thứ tự bắt đầu và điều cần chốt

Bắt đầu bằng brief một trang, một bài thực hành mẫu và prototype bốn màn hình: trang
chủ, danh sách, tài nguyên, hướng dẫn thực hành. Bộ 5 bài mẫu sau đó xoay quanh cùng
kết quả: chọn công cụ, chuẩn bị, tạo sản phẩm, sửa thay đổi/lỗi, áp dụng biến thể. Thử
một kênh tiếp cận và đo công trước khi xây collector lớn. Giữ nguồn cấp trường bắt
buộc ngay cả ở nội dung nhập tay.

Đã chốt: website miễn phí; AI cho khách dùng API riêng; nhóm chính là người mới hoàn toàn, chưa biết cài công cụ. Không hỏi lại lựa
chọn phân khúc này trừ khi chủ website muốn đổi.

Các giả thuyết/lựa chọn còn mở, chưa được coi là người dùng đã phê duyệt:
1. Kết quả đầu tiên người mới muốn làm: website nhỏ, tài liệu hoặc tác vụ khác; cần bàn tiếp.
2. Công cụ và OS ưu tiên chưa chốt. Trang giới thiệu local là một phương án, không phải quyết định cuối.
3. Tên VibeLab Việt và domain dài hạn; hiện giữ store.vneconomics.com để tiếp tục thử.
4. Mục tiêu cộng đồng/uy tín/dịch vụ, giờ duyệt–bảo trì mỗi tuần, người trực và trần AI.
5. Một kênh tiếp cận nhóm đầu và tiêu chí quyết định tiếp tục sau thử người dùng.
6. Tác vụ AI đầu tiên cho khách, provider/model hỗ trợ và thời điểm phát hành BYOK; lưu key lâu dài chưa được chọn, mặc định đề xuất không lưu.

Người dùng chính đã chốt; thảo luận tiếp theo thứ tự việc đầu -> công cụ/OS -> công suất/kênh -> thương
hiệu, tránh bắt chủ website quyết định tất cả cùng lúc. Các việc khảo sát/tài liệu và
prototype có thể tiến hành với nhãn giả thuyết; chưa chốt các quyết định đó bằng im lặng.

Khóa API, quyền WordPress, staging và tài khoản thử chỉ cấu hình khi tới bước liên quan;
không yêu cầu gửi bí mật trong chat. Plan 1.4 chưa tạo lịch chạy, gọi Gemini, đăng bài,
đổi thư mục triển khai hoặc kích hoạt theme/plugin trên website.

## 17. Nguồn tham chiếu

[S1] WordPress — Registering Custom Post Types:
https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/

[S2] WordPress — Application Passwords:
https://developer.wordpress.org/advanced-administration/security/application-passwords/

[S3] GitHub — Best practices for using the REST API:
https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api

[S4] GitHub — Events that trigger workflows (schedule):
https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows

[S5] GitHub — Licensing a repository:
https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository

[S6] Anthropic — Skills README (phân biệt giấy phép từng nhóm):
https://github.com/anthropics/skills

[S7] Google — Grounding with Google Search:
https://ai.google.dev/gemini-api/docs/google-search

[S8] GitHub — Searching for repositories:
https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories

[S9] Google — Gemini Developer API pricing (đối chiếu model và usage lúc cấu hình):
https://ai.google.dev/gemini-api/docs/pricing

[S10] Skills directory — phương án khám phá hiện có:
https://www.skills.sh/

[S11] Gemini — Structured outputs và kiểm tra giá trị:
https://ai.google.dev/gemini-api/docs/structured-output

[S12] Google — Helpful, reliable, people-first content:
https://developers.google.com/search/docs/fundamentals/creating-helpful-content

[S13] Google — Faceted navigation URLs:
https://developers.google.com/crawling/docs/faceted-navigation

[S14] Google — Spam policies, scaled content abuse:
https://developers.google.com/search/docs/essentials/spam-policies#scaled-content

[S15] Google — Using Gemini API keys (bí mật, proxy backend và quản lý key):
https://ai.google.dev/gemini-api/docs/api-key

Nguồn tham chiếu dùng cho nguyên tắc kỹ thuật; thang điểm, lịch, chỉ tiêu, thiết kế và
ước lượng trong tài liệu là đề xuất riêng, cần kiểm chứng qua pilot của website này.
