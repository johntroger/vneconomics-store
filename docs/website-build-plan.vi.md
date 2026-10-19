# Kế hoạch xây dựng thư viện Vibe Coding và AI Agent cho người Việt

Ngày: 19/10/2026. Phiên bản: 1.1 — bổ sung Gemini API và tuyển chọn repo hằng ngày.
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
headless, vector database, chatbot, tài khoản thành viên hay thanh toán ở bản đầu.

Kế hoạch này chưa triển khai mã, chưa bật lịch thu thập và chưa phát sinh gọi AI có phí.

## 2. Hiện trạng và giả định

Đã kiểm chứng ngày 17/10/2026: local -> GitHub -> webhook -> Plesk -> file công khai.
Repository riêng: johntroger/vneconomics-store. Plesk theo dõi release và tự triển khai
vào /store.vneconomics.com/codex-deploy-check. File connection-v2 đã trả HTTP 200.
Đây là bằng chứng đường truyền triển khai; chưa phải tích hợp xuất bản nội dung WordPress.

Local đang có WordPress 7.1.3, PHP 8.3 qua Playground, database SQLite. Chưa khảo sát
đầy đủ plugin, dữ liệu, PHP extension, MySQL/MariaDB và giới hạn tài nguyên hosting.
Trước phát hành phải kiểm tra môi trường thật và tạo staging; không coi Playground
là bằng chứng tương thích đầy đủ với hosting.

Giả định lập kế hoạch:
- Độc giả chính: người Việt ít kinh nghiệm lập trình, biết dùng máy tính và AI cơ bản.
- Nhóm phụ: người làm nội dung, giảng viên, marketer và developer muốn tìm công cụ nhanh.
- Nội dung nền tảng miễn phí; chưa coi đây là cửa hàng dù đang dùng subdomain store.
- Chủ website chịu trách nhiệm biên tập cuối; AI hỗ trợ nghiên cứu, bản nháp và kiểm tra.
- Người dùng xác nhận có Gemini API trả phí; chọn Gemini làm nhà cung cấp AI ban đầu. Chưa cấu hình key hoặc chọn model.
- MVP ưu tiên đọc, tìm kiếm và thực hành; chưa cung cấp môi trường chạy repo cho khách.
Các giả định này có thể đổi mà không cần thiết kế lại toàn hệ thống.

## 3. Trải nghiệm cần giải quyết

| Người đọc | Nhu cầu | Website giúp bằng cách nào |
|---|---|---|
| Người mới hoàn toàn | Không hiểu repo, skill, agent là gì | Trang Bắt đầu, từ điển và ví dụ nhỏ |
| Người có việc cụ thể | Muốn làm landing page, slide hoặc tự động hóa | Tìm theo kết quả công việc, xem yêu cầu trước khi cài |
| Người đang dùng agent | Cần skill phù hợp với công cụ của mình | Bộ lọc công cụ, hệ điều hành và trạng thái kiểm chứng |
| Người đã cài thử | Không biết kết quả đúng hoặc sửa lỗi thế nào | Kết quả mong đợi, lỗi thường gặp và cách gỡ bỏ |
| Biên tập viên | Bài có thể lỗi thời sau mỗi lần upstream đổi | Hàng đợi thay đổi, bản so sánh và cảnh báo cần thử lại |

Luồng ưu tiên: chọn việc muốn làm -> xem 2–3 lựa chọn có lý do -> đọc yêu cầu -> thực
hành -> đối chiếu kết quả -> gửi phản hồi nếu vướng. Không buộc tạo tài khoản để đọc.

## 4. Cấu trúc nội dung và điều hướng

Menu chính: Bắt đầu / Khám phá / Skills / Hướng dẫn / Bộ thực hành.
Ô tìm kiếm luôn dễ thấy; trang giới thiệu, tiêu chí tuyển chọn và liên hệ ở footer.

| Trang | Nội dung chính | Hành động ưu tiên |
|---|---|---|
| Trang chủ | Chọn nhu cầu, lộ trình người mới, đề xuất có biên tập, cập nhật đáng chú ý | Tìm công cụ hoặc bắt đầu một bài |
| Bắt đầu | Repo là gì, công cụ AI là gì, Git cơ bản, dự án đầu tiên | Tiếp tục bước kế tiếp |
| Khám phá | Repo, ứng dụng và bộ mẫu dự án; danh sách có lọc | Mở hướng dẫn phù hợp |
| Skills | Skill cụ thể, công dụng, công cụ đã thử và quyền cần cấp | Xem cách cài và ví dụ |
| Chi tiết tài nguyên | Lợi ích, điều kiện, nguồn, tình trạng, hướng dẫn và giới hạn | Đọc hướng dẫn / mở repo gốc |
| Hướng dẫn | Các bước thực hiện, kết quả, lỗi, gỡ bỏ | Hoàn thành một việc |
| Bộ thực hành | Chuỗi bài dẫn tới một sản phẩm nhỏ | Bắt đầu bài đầu tiên |
| Có gì mới | Thay đổi ảnh hưởng tới cách dùng, có giải thích | Xem bài đã cập nhật |

URL dự kiến: /bat-dau/, /kham-pha/, /tai-nguyen/{slug}/, /huong-dan/{slug}/,
/bo-thuc-hanh/{slug}/. /skills/ là bộ lọc theo loại tài nguyên; một skill chỉ có một
trang chi tiết chuẩn để không trùng nội dung.

Bộ lọc MVP: nhu cầu, loại tài nguyên, công cụ AI, độ khó, hệ điều hành, yêu cầu chi phí
và tình trạng thử nghiệm. Chi phí công cụ/API/hosting phải tách khỏi giấy phép repo:
repo mã nguồn mở không đồng nghĩa chạy hoàn toàn miễn phí.

## 5. Phạm vi bản đầu

Mục tiêu nội dung bản MVP đầy đủ: 20 tài nguyên tuyển chọn, 6 hướng dẫn nền tảng, 3 bộ thực
hành ngắn. Đây là chỉ tiêu kế hoạch, chưa phải các mục đã được kiểm chứng.
Tuyển chọn tập trung, tránh đăng hàng trăm mục chỉ có bản dịch README.

Chia thành hai mốc để có đường cắt rõ khi quá tải:
- Mốc A — mở thử: theme/plugin nội dung, tìm/lọc, trạng thái nguồn, nhập tay; 10 tài nguyên,
  3 hướng dẫn và 1 bộ thực hành. Ưu tiên kiểm chứng ít công cụ/OS, không gắn nhãn rộng.
- Mốc B — MVP có tự động hóa: collector, AI, quản trị job/ngân sách; mở rộng tới mục tiêu
  20/6/3 sau khi đo được công suất biên tập. Mốc A không phụ thuộc phải có API AI.
Nếu vượt nguồn lực, hoãn mốc B hoặc giảm lượng bài; không cắt provenance, kiểm chứng và
khả năng khôi phục. Không dùng số lượng bài để ép xuất bản nội dung chưa được kiểm tra.

Có trong MVP:
- Trang chủ, danh sách, lọc và tìm kiếm tiếng Việt; liên kết nguồn gốc rõ ràng.
- Trang chi tiết thống nhất, trạng thái thử nghiệm và lịch sử cập nhật.
- Hệ quản trị nguồn, tài nguyên, bản nháp, công việc đồng bộ và lỗi.
- Theo dõi các nguồn đã chọn; tự cập nhật dữ liệu quan sát và tạo bản nháp có thay đổi.
- Phản hồi bài lỗi/lỗi thời có chống spam; không cho tải lên file hay chạy lệnh từ form.
- Lưu mục yêu thích trên thiết bị bằng localStorage; không cần tài khoản.

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

    Logo       Bắt đầu   Khám phá   Skills   Hướng dẫn       Tìm kiếm
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
Jobs và snapshot dùng bảng riêng có index/unique key, tránh nhồi log lớn vào postmeta.
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

Ước lượng phục vụ lập kế hoạch, chưa phải cam kết tiến độ. Giả định một người triển khai
được AI hỗ trợ, một chủ biên phản hồi đều, chưa có tích hợp trả phí phức tạp. Thời gian
chờ hosting, credential, phản hồi và số lần sửa thiết kế có thể kéo dài lịch.

| Chặng | Công việc | Đầu ra nghiệm thu | Ước lượng ngày công |
|---|---|---|---|
| 0. Khảo sát | Hosting, dữ liệu cũ, quyền, chọn mẫu nguồn, brief thương hiệu | Quyết định môi trường và 5 bài mẫu có nguồn | 1–2 |
| 1. Thiết kế | Luồng người mới, schema, wireframe, UI desktop/mobile | Prototype và mẫu bài chi tiết được xem xét | 2–4 |
| 2. Website | Plugin nội dung, theme, tìm/lọc, phản hồi | Duyệt danh mục và hướng dẫn hoàn chỉnh trên local | 4–6 |
| 3. Thu thập | GitHub adapter, snapshot, diff, job, nhập draft | Chạy lại không trùng, giữ bài tay, xử lý lỗi | 3–5 |
| 4. Gemini và biên tập | Schema đầu ra, glossary, nguồn, ngân sách, luồng duyệt | Benchmark 10 đầu vào; pipeline đạt rubric; chuẩn bị pilot 7 ngày chỉ tạo bản nháp | 3–6 |
| 5. Staging và launch | E2E, môi trường thật, backup/restore, deploy | Bản phát hành và diễn tập khôi phục thành công | 2–4 |

Tổng dự kiến 15–27 ngày công kỹ thuật, chưa bao gồm toàn bộ công nghiên cứu, thử và duyệt nội dung. Có thể trải 4–7 tuần nếu nội dung và phản hồi sẵn sàng; đây chưa phải lịch launch.
Cập nhật ước lượng sau chặng 0–1; khối lượng thử 20 tài nguyên là rủi ro tiến độ lớn. Pilot Gemini cần ít nhất 7 ngày lịch quan sát riêng, không đồng nghĩa 7 ngày công bổ sung; chỉ chạy sau khi luồng nháp đã sẵn sàng.
Các chặng là gói công việc có điều kiện nghiệm thu, không phải tất cả có thể chạy tự động.
Sau 5 bài mẫu, ghi giờ nghiên cứu, cài/thử, viết, duyệt và cập nhật của từng bài. Dùng
trung vị lẫn bài khó nhất để dự báo lượng bài theo số giờ chủ biên thực có mỗi tuần;
không tính thời gian agent chạy là thay thế toàn bộ công kiểm chứng. Lịch mốc A được
chốt sau phép đo này; mốc B chỉ bật khi hàng đợi duyệt có thể được xử lý ổn định.

Nghiệm thu bắt buộc:
- Mỗi mục xuất bản có source/version, thông tin quyền tương ứng, trạng thái thử và yêu cầu.
- Không có nhãn tương thích đã kiểm chứng nếu không có Validation đúng công cụ/phiên bản.
- Tìm có/không dấu, bộ lọc kết hợp, link chia sẻ, trạng thái rỗng hoạt động.
- Import cùng nguồn hai lần không tạo trùng; sửa bài tay không bị đồng bộ ghi đè.
- API collector không thể publish hoặc sửa field biên tập công khai ngoài phạm vi.
- Mô phỏng timeout/rate-limit/AI lỗi/nguồn bị xóa/giấy phép đổi không làm mất bài.
- Mobile 360px trở lên không tràn ngang, ngoại trừ khối mã cuộn trong vùng riêng.
- Đi bằng bàn phím, focus rõ, nhãn form và thứ tự heading hợp lý; hướng tới WCAG 2.2 AA,
  cần kiểm thử thực tế, không coi công cụ tự động là chứng nhận.
- Mục tiêu lab: LCP <=2.5s, CLS <=0.1, không có lỗi console chặn tác vụ trên trang mẫu.
  INP và số liệu người dùng thật đánh giá sau khi có traffic; không hứa điểm PageSpeed cố định.
- Không có credential/dữ liệu riêng trong Git, payload, log hoặc bằng chứng công khai.
- Kiểm chứng deploy và restore trên staging; production không bị ghi đè dữ liệu từ local.

## 15. Chi phí, đo lường và rủi ro

Không chốt số tiền khi chưa benchmark và xem hạn mức tài khoản. Bảng chi phí cần theo
riêng: hosting/staging/backup; phút runner; lượt gọi GitHub; AI; dung lượng snapshot;
thời gian biên tập/thử nghiệm. Đặt ngân sách tạm ngày/tháng trước khi gọi API; sau 7 ngày pilot điều chỉnh bằng dữ liệu thực tế. Tách chi phí token Gemini khỏi Google Search grounding, không mặc định được bao gồm trong gói hiện có.
AI chỉ xử lý nguồn thay đổi, không dịch toàn bộ repo và không re-run mọi bài mỗi ngày.
Khi vượt trần thì hoãn job, không tự mua quota hoặc nâng gói.

Chỉ số giai đoạn đầu: tìm kiếm ra kết quả phù hợp; tỷ lệ mở hướng dẫn; kết quả khảo sát
hoàn thành bài; tỷ lệ mục có bằng chứng thử; số phản hồi lỗi; tuổi hàng đợi biên tập;
chi phí mỗi bài được duyệt. Không suy ra đã hoàn thành chỉ từ thao tác copy lệnh.
Pilot 5–8 người mới, yêu cầu họ tìm một công cụ và làm bài đầu tiên; mục tiêu ban đầu
ít nhất 4/5 người hoàn thành luồng mà không cần người hướng dẫn can thiệp trực tiếp,
điều chỉnh ngưỡng sau pilot. Giới hạn phân tích hành vi và có thông báo phù hợp trước
khi thêm công cụ theo dõi hoặc thu thập email.

Rủi ro chính: quá nhiều ứng viên làm nghẽn duyệt; bài lỗi thời; lời khẳng định AI thiếu
nguồn; khác biệt nền tảng; thay đổi quyền sử dụng; script độc hại; quota/chi phí; hosting
không đủ khả năng staging. Đáp án vận hành là giới hạn danh sách theo dõi, lưu version,
nguồn kiểm chứng, quyền tối thiểu, checkpoint, budget cap và mở rộng sau pilot.

## 16. Đề xuất thứ tự bắt đầu và điều cần chốt

Bắt đầu bằng 5 bài mẫu hoàn chỉnh và prototype ba màn hình: trang chủ, danh sách,
trang chi tiết. Điều này kiểm chứng cấu trúc nội dung trước khi viết collector lớn.
Sau đó xây plugin dữ liệu và theme, rồi tự động hóa phần việc đã làm tốt bằng tay.

Ba quyết định sản phẩm còn mở, tạm dùng giả định ở mục 2 để không chặn bản thiết kế:
1. Người mới hoàn toàn là nhóm chính hay người biết code cơ bản?
2. Tên VibeLab Việt và việc tiếp tục dùng store.vneconomics.com có phù hợp lâu dài?
3. Ai dành thời gian kiểm chứng và duyệt bài; ngân sách AI tối đa mỗi tháng là bao nhiêu?

Khóa API, quyền WordPress, staging và tài khoản thử sẽ chỉ cấu hình khi triển khai bước
liên quan; không yêu cầu gửi bí mật trong chat. Kế hoạch này chưa tạo lịch chạy, chưa
đăng bài, chưa chuyển thư mục triển khai hoặc kích hoạt theme/plugin trên website.

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

Nguồn tham chiếu dùng cho nguyên tắc kỹ thuật; thang điểm, lịch, chỉ tiêu, thiết kế và
ước lượng trong tài liệu là đề xuất riêng, cần kiểm chứng qua pilot của website này.
