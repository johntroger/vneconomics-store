# Đánh giá độc lập kế hoạch website VibeLab Việt 1.1

Ngày: 19/10/2026.
Tài liệu được xem xét: docs/website-build-plan.vi.md, bản 1.1 tại commit ef1cef5.
Phạm vi: sản phẩm, AI/vibe coding, kiến trúc, UI/UX, nội dung và tăng trưởng.
Đây là đánh giá thiết kế và đề xuất cải tiến, không phải kiểm toán phần mềm đã triển khai.
Kế hoạch gốc giữ nguyên. Các đề xuất dưới đây chưa tự động trở thành yêu cầu đã chốt.

## 1. Kết luận điều hành

**Nên tiếp tục với một bản mở thử hẹp. Chưa nên xây toàn bộ hệ tự động hóa hoặc coi
ước lượng hiện tại là lịch phát hành đã cam kết.**

Điểm mạnh của kế hoạch là nguyên tắc chất lượng: phân biệt dữ liệu GitHub với suy luận
AI, không bịa bằng chứng thử, có nguồn cấp trường, tách mã website khỏi nội dung và có
đường cắt mốc A/B. Các quyết định này nên giữ.

Điểm yếu lớn nhất là kế hoạch đã mô tả cách sản xuất nội dung kỹ hơn cách chứng minh
người đọc cần nội dung đó, tìm đến website và quay lại. “Repo hot hằng ngày” là cơ chế
phát hiện ứng viên; nó chưa phải lời hứa giá trị đủ cho người mới.

Ưu tiên sửa: chọn một nhóm người dùng và một kết quả đầu tiên; tách rõ mở thử A khỏi
pipeline Gemini B; đo công suất duyệt/bảo trì; thêm chiến lược phân phối; chuyển các
cam kết AI và vận hành thành tiêu chí thử cụ thể.

Không chấm điểm tổng kiểu 8/10 vì chưa có prototype, dữ liệu người dùng, benchmark
Gemini hoặc số liệu vận hành để tạo một điểm số khách quan. Đánh giá dưới đây dựa vào
mức độ đầy đủ của tài liệu, tính nhất quán và bằng chứng hiện có.

## 2. Bằng chứng và giới hạn

Đã có bằng chứng triển khai một file qua local -> GitHub -> Plesk, theo hồ sơ kết nối.
Chưa có bằng chứng thư viện website chạy được, tìm kiếm hữu ích, hướng dẫn giúp người
mới hoàn thành việc, hoặc Gemini tạo bản nháp đúng với chi phí chấp nhận được.

Đã đối chiếu một số tài liệu chính thức về structured output, nội dung hữu ích và URL
bộ lọc; quan sát skills.sh để nhận diện một phương án thay thế thực tế [R1–R5]. Không
thực hiện khảo sát toàn thị trường Việt Nam, keyword-volume research hoặc thử usability.
Những nhận xét về nhu cầu, khác biệt và tăng trưởng dưới đây là giả thuyết cần thử,
không phải kết quả nghiên cứu thị trường.

Ba lượt đọc độc lập đã xem xét: sản phẩm/content marketing, AI/kiến trúc và UX/tiến độ.
Các phát hiện được đối chiếu lại với nội dung đã có để không đề xuất lại điều kế hoạch
đã xử lý. Không coi ba lượt đọc AI là thay thế thử nghiệm với người dùng thật.

| Góc nhìn | Phần đã vững trong kế hoạch | Phần chưa đủ bằng chứng/quyết định |
|---|---|---|
| Sản phẩm | Lời hứa thực hành, tổ chức theo nhu cầu | Nhóm chính, công việc đầu tiên, lợi thế so với cách người dùng đang làm |
| AI | Phân vai Gemini/GitHub, baseline, provenance, giới hạn draft | Cổng kiểm tra ngữ nghĩa, bộ đánh giá, thuật toán chọn và chống nghẽn |
| Kiến trúc | WordPress + plugin + collector, quyền ghi, tách deploy | Lease job, chi phí đang chạy, retention bảo vệ bằng chứng |
| Vibe coding | Chú ý phiên bản, môi trường, kết quả và gỡ bỏ | Mẫu thực hành tái hiện, vòng sửa bằng agent, tiêu chí kết quả theo bài |
| UI/UX | Hướng theo nhu cầu, mobile, accessibility, không ép tài khoản | Luồng học xuyên suốt, thiết bị thực hành, thứ bậc lọc, protocol usability |
| Content marketing | Mẫu bài sâu, trạng thái thử và cập nhật | Thu hút, quay lại, SEO kỹ thuật, mục tiêu kinh tế và tải bảo trì |

## 3. Điểm mạnh cần giữ

1. Giữ WordPress để quản trị và tránh đưa headless/chatbot/vector DB vào bản đầu.
2. Đặt cấu trúc nội dung trong plugin; theme chịu trách nhiệm trình bày.
3. Dùng API GitHub cho dữ kiện và Gemini cho phân tích, diễn giải, bản nháp.
4. Phân biệt tổng sao với tăng sao; repo mới phát hiện chưa có lịch sử không được bịa đà tăng.
5. Có nguồn/version/validation và nhãn Chưa thử; không tự gắn tương thích đa agent.
6. Không cho collector publish, thực thi script nguồn hoặc sửa nội dung đã duyệt tùy ý.
7. Phân biệt cập nhật field quan sát với cập nhật bài; có idempotency và checkpoint.
8. Có budget, pilot 7 ngày, thu gọn A/B và đo thời gian biên tập trước khi mở rộng.
9. Không deploy main vào web root; nghĩ tới cặp phiên bản plugin/theme và restore.

Các khoảng trống tiếp theo không phủ nhận những phần này. Chúng là các quyết định nhỏ
nhưng quan trọng để biến nguyên tắc thành hệ thống có thể kiểm thử và vận hành.

## 4. Bảng ưu tiên cải tiến

A = cần chốt trước khi xây nhiều; B = trước mở thử/bật pipeline liên quan; C = sau mở thử,
trước mở rộng. Đây là ưu tiên dự án, không phải phân loại lỗ hổng phần mềm production.

| ID | Vấn đề | Ưu tiên | Kết quả cần có |
|---|---|---|---|
| 01 | Nhóm người dùng và khác biệt chưa đủ hẹp | A | Một brief gồm người dùng, việc muốn làm và lý do chọn website |
| 02 | Luồng học chưa hoàn chỉnh; prototype thiếu trang hướng dẫn | A | Một hành trình xuyên suốt có kết quả kiểm tra được |
| 03 | Điểm phát hành A trong lộ trình chưa rõ, dễ làm quá nhiều | A | Hai mốc phát hành độc lập, danh sách phụ thuộc rõ |
| 04 | Tải biên tập và bảo trì chưa thành giới hạn vận hành | A/B | Công suất đo thực tế, ưu tiên sửa cũ, điều kiện ngừng nhận draft |
| 05 | Thiếu chiến lược phân phối, quay lại và mục tiêu kinh tế | A/B | Một kênh thử, một vòng quay lại và trần nguồn lực |
| 06 | Tiêu chí AI chưa đủ để kết luận pipeline dùng được | B trước mốc B | Bộ ca mẫu, rubric, lỗi chặn và đối chiếu nguồn |
| 07 | Chưa nối tìm ứng viên với chọn 10/3 một cách tái hiện được | B trước mốc B | Quy tắc trước/sau AI, quota nguồn, lý do chọn |
| 08 | Job/budget/retention còn thiếu một số tình huống phục hồi | B trước mốc B | Lease và checkpoint, dự phòng chi phí, bằng chứng không bị dọn |
| 09 | Bảy bộ lọc và mobile chưa tương xứng với bản nhỏ | B | Lọc ưu tiên, bộ truy vấn, chuyển tiếp đọc điện thoại/làm máy tính |
| 10 | Thiếu chính sách SEO cho nội dung và URL bộ lọc | B trước launch | URL chuẩn, trang được index, sitemap và liên kết nội bộ |
| 11 | Kiểm chứng dễ phình thành ma trận quá lớn, thiếu lịch rà soát | B/C | Phạm vi thử rõ, hạn kiểm tra lại và quy trình chủ biên vắng |
| 12 | Pilot chưa định nghĩa đủ kết quả và quyết định go/no-go | A/B | Hai pilot khác nhau, mẫu số đúng, ngưỡng và hành động tương ứng |

## 5. Phân tích và đề xuất chi tiết

### 01. Thu hẹp định vị: “người mới” chưa phải một phân khúc đủ dùng

Liên quan: mục 1–4 và 16 của kế hoạch. Người chưa biết terminal, người đã cài agent
nhưng chưa làm dự án, và developer muốn thêm skill có khó khăn khác nhau. Một trang
chủ cố nói với cả ba dễ khiến nội dung vừa quá khó vừa quá sơ lược.

Khuyến nghị: nhóm khởi đầu là **người đã dùng ít nhất một AI coding agent nhưng chưa
tự hoàn thành một sản phẩm nhỏ**. Đây là đề xuất phạm vi, cần xác minh; không loại bỏ
người chưa cài công cụ, mà dẫn họ vào một trang chuẩn bị riêng. Chọn một công cụ và
một hệ điều hành để chứng minh bài đầu; các công cụ khác vẫn có trang giới thiệu và
trạng thái chưa kiểm chứng khi cần.

Công việc mẫu để thử: tạo trang giới thiệu có thể xem và sửa trên local, kèm một lần
sửa lỗi bằng agent. Nếu phỏng vấn cho thấy nhu cầu tài liệu/giảng dạy mạnh hơn, đổi bài
mở đầu trước khi thiết kế toàn bộ danh mục.

Khác biệt cần phát biểu có thể kiểm tra: “Người mới có thể chọn đúng bài cho môi trường
của mình và làm ra kết quả có thể đối chiếu bằng hướng dẫn tiếng Việt đã thử.” Danh mục
và bảng hot đã tồn tại ở skills.sh [R1]; việc có danh sách và bản dịch chưa chứng minh
được lý do lựa chọn website này. Không có dữ liệu để kết luận chưa có đối thủ Việt Nam.

Thử rẻ: nói chuyện với 5 người thuộc phân khúc dự kiến, cho họ chọn một nhu cầu thật;
quan sát cách họ đang giải quyết và thử 1–2 bài mẫu. Ghi những việc họ không cần, không
chỉ hỏi họ có thích ý tưởng không. Cần đầu ra là vấn đề và điểm vướng lặp lại, không
phải tuyên bố đã chứng minh thị trường từ mẫu nhỏ.

### 02. Thiết kế một hành trình học, không dừng ở trang chi tiết tài nguyên

Liên quan: mục 3–4, 7, 16. Kế hoạch đã có Bắt đầu, Hướng dẫn và Bộ thực hành nhưng quan
hệ chưa rõ. Prototype ba màn hình không có trang hướng dẫn, dù đây là nơi lời hứa sản
phẩm được kiểm chứng.

Đề xuất menu ưu tiên: **Bắt đầu / Khám phá / Thực hành**. Skills là một bộ lọc hoặc trang
đích dưới Khám phá; bộ thực hành nằm trong Thực hành. Chỉ dùng phương án này sau khi
thử người dùng hiểu nhãn, không coi giảm menu là tự động tốt hơn.

Prototype cần thêm màn hình thứ tư: hướng dẫn thực hành với yêu cầu, các bước, kết quả
mong đợi, lỗi và bước tiếp. Luồng: nhu cầu -> bài phù hợp -> kiểm tra đủ điều kiện ->
chuẩn bị -> tạo kết quả -> kiểm tra -> sửa một thay đổi -> tiếp tục hoặc áp dụng riêng.
Nếu không đủ tài khoản/thiết bị/ngân sách, phải đưa ra đường đi khác hoặc giải thích
có thể xem mẫu trước; không để người đọc mắc ở bước cài.

Bài vibe coding nên có brief mẫu, dữ liệu không nhạy cảm, prompt khởi đầu, một mốc
lưu phiên bản và checklist đầu ra. Không hứa cùng một prompt tạo kết quả giống hệt;
agent có thể sinh mã khác. Tiêu chí là hành vi sản phẩm đạt yêu cầu và người học biết
kiểm tra, không phải ảnh đầu ra giống một demo.

Nghiệm thu: người thử tìm đúng bài, xác định đủ điều kiện, tạo kết quả và biết bước
kế tiếp với mức trợ giúp được ghi lại. Kết quả repo/ảnh hoặc kiểm tra có thể dùng làm
bằng chứng nếu người dùng đồng ý, không thu thập mã riêng của họ mặc định.

### 03. Sửa đường phát hành: mốc A phải thật sự không chờ Gemini

Liên quan: mục 5 và 14. Mục 5 nói mở thử nhập tay không cần AI, nhưng bảng 14 đặt launch
sau collector/Gemini và chưa đánh dấu điểm mở thử A. Đây là sự mơ hồ về phụ thuộc cần làm rõ, không phải bằng chứng A thực sự bị buộc chờ AI. Bổ sung điểm phát hành A để tránh người triển khai hiểu sai.

Lộ trình đề xuất:
1. Khảo sát, người dùng mẫu, một bài thực hành và schema nội dung tối thiểu.
2. Prototype bốn màn hình và thử hành trình.
3. Theme/plugin cần cho đọc, tìm và nhập tay; staging, backup, mở thử A.
4. Đo hành vi và công suất biên tập; sửa nội dung/UX theo kết quả.
5. Collector/Gemini, pilot 7 ngày nháp; bật B khi đạt cổng chất lượng.

Mốc A chưa cần dashboard AI đầy đủ, bộ nguồn cấp claim tổng quát, nhiều bảng log hoặc
workflow phát hành phức tạp vượt nhu cầu hiện tại. Chỉ hoãn cơ chế nguồn cấp claim tổng quát/tự động; bài nhập tay vẫn phải có đủ nguồn cho chi phí, quyền, giấy phép, lệnh cài và tương thích. Tuy vậy, phải giữ source/version,
trạng thái thử, schema nội dung, quyền và cách khôi phục. Cơ chế job bền vững chỉ cần
hoàn chỉnh trước mốc B. Không thay WordPress hoặc thêm hạ tầng lớn chỉ để xử lý lỗ hổng
trong thứ tự triển khai.

15–27 ngày công là ước lượng sơ bộ của cả hệ, không có bằng chứng về năng suất để xác
nhận đúng/sai. Cần chia ước lượng theo A/B, tách công nội dung và nêu kịch bản phụ thuộc
hosting. Chốt lịch sau thử bài mẫu và khảo sát; không cộng 7 ngày pilot vào công kỹ
thuật một cách máy móc hoặc coi nội dung đã sẵn sàng.

### 04. “3 nháp/ngày” phải theo công suất, không trở thành áp lực xuất bản

Liên quan: mục 11.1–11.2, 14–15. Kế hoạch đã ghi tối đa và có thể giảm; đây là điểm đúng.
Khoảng trống là ai có bao nhiêu giờ mỗi tuần, bao nhiêu dành cho duy trì và khi nào
collector dừng nhận việc mới.

Ví dụ tính nhạy cảm, không phải số liệu thực tế: nếu mỗi bài mất 60 phút kiểm chứng và
biên tập, 3 bài/ngày trong 7 ngày là 21 giờ/tuần, chưa tính sửa bài cũ. AI nhanh hơn ở
khâu viết không tự giải phóng thời gian thử công cụ.

Công suất bài mới/tuần = phần nguyên của:
(giờ biên tập có thật - giờ bảo trì dự phòng - giờ hỗ trợ độc giả) / giờ trung vị mỗi bài.
Dùng cả bài tốn công nhất để dự phòng, không dùng trung bình đẹp để chốt quota.

Ưu tiên hàng đợi: cảnh báo quan trọng -> bài cũ sắp/quá hạn -> bài nền tảng theo nhu cầu
-> tin mới. Tách trần ứng viên thu thập với trần draft mới; có thể vẫn lấy metadata
nhẹ khi tạm ngừng gọi Gemini. Nếu chủ biên vắng, giữ cảnh báo và giảm đề xuất, không
tự bỏ qua bước duyệt. Đặt giới hạn tuổi/số lượng hàng đợi sau đo công suất, không chọn
một SLA mạnh khi chưa có người phụ trách.

Nghiệm thu: đưa một yêu cầu sửa cũ vào pilot, xem có làm nghẽn duyệt mới không; thử một
tuần không có biên tập viên bằng fixture/đồng hồ giả hoặc thao tác điều khiển, không cần thêm một tuần lịch. Hệ thống phải giảm nhận draft và không tự publish.

### 05. Content marketing còn thiếu phân phối và lý do quay lại

Liên quan: mục 4–5, 11, 15. Nguồn ứng viên và tìm kiếm nội bộ không tạo ra người truy cập.
Hoãn newsletter là hợp lý, nhưng vẫn cần thử một kênh tiếp cận sẵn có và thông điệp
nhất quán. Không cần xây đa kênh hoặc tự gửi tin nhắn để có một chiến lược phân phối.

Đề xuất ba loại nội dung:
- Bài nền tảng: giải quyết việc đầu tiên, có tuổi thọ và cập nhật định kỳ.
- Bài lựa chọn: giúp chọn công cụ theo điều kiện cụ thể, có giới hạn so sánh.
- Bản tin tuyển chọn: vì sao một thay đổi đáng quan tâm và dẫn về bài thực hành liên quan.

Tìm repo mỗi ngày nhưng không nhất thiết đăng mỗi ngày. Gộp phát hiện đáng chú ý thành
bản tin theo nhịp đủ chất lượng và công suất. Mỗi mục mới phải đóng góp ít nhất một
trong các giá trị: kết quả thử, ví dụ Việt Nam, lý do lựa chọn hoặc cách vượt lỗi cụ thể;
chỉ dịch mô tả repo chưa đủ để ưu tiên xuất bản.

Lần thử đầu có thể dùng kênh chủ website đã sở hữu và tự quyết định đăng: một bài/ảnh
đầu ra ngắn dẫn vào đúng hướng dẫn. Soạn nội dung trước, không tự đăng sang cộng đồng
hoặc gửi email nếu chưa được yêu cầu. Ghi mã chiến dịch/link nguồn ở mức phù hợp để
biết kênh nào đưa người thực sự làm bài, không chỉ tạo lượt xem.

Vòng quay lại ban đầu: bài đầu -> một biến thể dùng cho việc riêng -> bài tiếp theo có
lý do -> cập nhật khi công cụ người đó quan tâm thay đổi. Bookmark là tiện ích; không
mặc định là động lực quay lại. Chưa cần tài khoản hay hệ đề xuất cá nhân.

Mục tiêu kinh tế cần chọn: tài nguyên cộng đồng, xây uy tín chuyên môn hay hỗ trợ dịch
vụ tương lai. Chưa cần bán gì, nhưng cần trần thời gian/chi phí và lợi ích mong đợi để
quyết định duy trì. Không dự báo doanh thu/traffic khi chưa có dữ liệu.

### 06. Đúng JSON và có link chưa đồng nghĩa nội dung AI đúng

Liên quan: mục 9–11. Đã có schema, nguồn cấp claim và benchmark 10 đầu vào, nhưng “đạt
rubric” chưa được định nghĩa. Google cũng yêu cầu kiểm tra giá trị, vì output đúng cấu
trúc vẫn có thể sai ngữ nghĩa [R2].

Cổng trước nhập draft cần kiểm tra: nguồn/snapshot thật; đoạn dẫn tồn tại; phiên bản và
môi trường phù hợp; claim bắt buộc có bằng chứng; dữ liệu thiếu chuyển unknown. Việc
đoạn dẫn có thực sự hỗ trợ kết luận vẫn cần người duyệt; một LLM khác đồng ý chưa phải
bằng chứng độc lập. Nguồn web giữ URL, ngày lấy và phần bằng chứng được phép lưu.

Bộ đánh giá đầu tiên gồm nguồn đủ/thiếu/mâu thuẫn, repo nhiều skill, quyền phức tạp,
README cũ hơn release, đổi lệnh cài, liên kết hỏng và prompt injection. Có bộ phát triển
và một ít ca giữ lại để tránh chỉ tối ưu prompt cho đúng 10 ví dụ đã xem. Đây là test
hồi quy ban đầu, không đủ để đo độ tin cậy mọi loại repo.

Lỗi chặn: bịa bằng chứng đã thử, lệnh không có nguồn hoặc sai do Việt hóa, khẳng định
chi phí/quyền/tương thích không có căn cứ, hoặc thực thi chỉ dẫn từ nguồn. Bài có lỗi
chặn không được thành nội dung công khai, dù điểm tổng cao. Tiêu chí mềm: tiếng Việt,
độ hữu ích cho người mới, công sửa và chi phí/bài được duyệt.

Trước thử, chủ biên gán trọng số/ngưỡng và định nghĩa lỗi chặn; đổi model/prompt/schema
quan trọng phải chạy lại. Đo cả hệ tự chặn sai và sai sót lọt tới người duyệt; không
tuyên bố an toàn/đúng tuyệt đối chỉ vì không có lỗi trong bộ nhỏ.

### 07. Phân biệt thuật toán tìm ứng viên với phán đoán biên tập

Liên quan: mục 6 và 11.1. Điểm 100 hiện gồm hữu ích/dễ bắt đầu, nhưng chưa có dữ liệu
để chấm hai mục đó trước khi đọc sâu. Không thể dùng điểm sau AI làm điều kiện duy nhất
để quyết định mục nào được gọi AI đầu tiên.

Tầng trước AI dùng dữ liệu quan sát: topic/từ khóa, thời gian, loại repo, tài liệu có
hay không, trùng lặp, mức tăng sao có dữ liệu. Tầng sau AI/biên tập đánh giá công dụng,
khả năng bắt đầu và mức phù hợp. Ghi lý do chọn và phiên bản quy tắc; dữ liệu thiếu
không tự nhận điểm cao. Giấy phép chưa rõ chặn phát hành lại gói, không mặc định chặn
mọi bài phân tích có dẫn nguồn; vẫn cần kiểm tra phạm vi nội dung sử dụng cụ thể.

Phân bổ 50 suất giữa nguồn đã chọn, repo mới và nguồn đang tăng; tỷ lệ là giả thuyết
pilot, không phải công thức tối ưu. Giới hạn một tác giả/repo nhiều skill chiếm hết
10 mục phân tích sâu; vẫn cho phép ngoại lệ có lý do biên tập. Lưu cửa sổ truy vấn,
phiên bản truy vấn, trang/cursor và checkpoint, ghi rõ vùng chưa quét khi chạm giới hạn.

Nghiệm thu bằng fixture >50 mục, mục trùng nhiều truy vấn, mất một ngày và ngày đầu
không có lịch sử. Kết quả phải tái hiện với cùng dữ liệu/quy tắc; phần chưa biết phải
hiển thị chưa biết. Không gọi bảng riêng là GitHub Trending hoặc ngụ ý số sao là số
người dùng thật. Ngày nhiều sao nhưng không có mục phù hợp có thể không tạo bài.

### 08. Bổ sung ba hợp đồng vận hành nhỏ, không thêm hạ tầng lớn

Liên quan: mục 8–11 và 15. Kế hoạch đã chọn trạng thái bền vững và idempotency; cần
định nghĩa thêm các ranh giới thất bại:

**Job:** queued -> running với lease -> source_ready -> ai_ready -> imported, cùng trạng
thái failed/retry/deferred. Nhận job nguyên tử trong database, lease có hạn, phục hồi
job treo. Sau khi có kết quả AI thì lưu trước khi nhập draft; retry nhập không gọi AI
lại. Nếu request tới Gemini thành công nhưng response mất, vẫn có thể phát sinh phí
lần nữa; ghi cost_unknown thay vì hứa exactly-once đối với dịch vụ ngoài.

**Budget:** kế hoạch đã yêu cầu dự trù trước job, giới hạn token/lượt công cụ và không hứa trần hóa đơn. Cần cụ thể hóa phần còn thiếu: tính cả job đang chạy và retry. Dùng
estimated/reserved/actual/unknown, giới hạn token và công cụ hỗ trợ; đối soát usage.
Ngân sách áp dụng ngày theo timezone đã chọn và có trần tháng. Không coi dừng job trong
app là bảo đảm trần hóa đơn nhà cung cấp. Thử hai job đồng thời lúc gần hết ngân sách.

**Retention:** không dọn snapshot/đoạn bằng chứng còn được bài công khai hoặc validation
tham chiếu. Chỉ dọn dữ liệu trung gian theo chính sách và quyền sử dụng; backup phải
gồm các bảng/liên kết cần khôi phục. Kiểm thử dọn và restore có giữ được nguồn của bài.

Các hợp đồng này có thể triển khai trong WordPress + collector hiện đề xuất; không
cần Kafka, Kubernetes hoặc cơ sở dữ liệu khác cho quy mô pilot.

### 09. Giảm tải lựa chọn và giải quyết hành trình hai thiết bị

Liên quan: mục 4, 7, 14. Bảy nhóm bộ lọc cho 10 tài nguyên có nguy cơ tạo nhiều tổ hợp
rỗng. Đây là giả thuyết UX cần thử, không thể kết luận từ riêng số lượng.

Mốc A ưu tiên nhu cầu và công cụ; bộ lọc nâng cao chỉ hiện khi có dữ liệu phân biệt
hữu ích. Có đếm kết quả, bỏ từng bộ lọc, chia sẻ URL và trạng thái rỗng có hướng đi.
Lập 15–20 truy vấn từ lời người dùng thực, có đáp án kỳ vọng; kiểm tra có/không dấu,
alias và trường hợp không khớp. Không dùng WordPress search mặc định như bằng chứng
đã đáp ứng toàn bộ tìm kiếm tiếng Việt; chọn cách triển khai sau bộ test nhỏ.

Mobile dùng để khám phá/đọc, còn nhiều thao tác code cần máy tính. Ghi yêu cầu thiết bị
trước nút bắt đầu, có link tới đúng bước để tự chuyển sang máy tính; không cần đồng bộ
tài khoản. Nhớ lựa chọn OS, không trộn lệnh Windows/macOS trong cùng luồng mặc định.

Palette và typography trong kế hoạch là hướng thiết kế, chưa có prototype nên không
thể cho điểm đẹp/xấu hoặc đạt accessibility. Cần thử cả màn hình hướng dẫn dài, thao tác
bàn phím, lỗi sao chép, thiết bị thật và việc quay lại sau khi đóng trang.

### 10. Bổ sung SEO theo mục đích tìm kiếm, không theo sản lượng AI

Liên quan: mục 4, 7 và 15. Bài có nguồn và chất lượng chưa tự giải quyết URL, index và
liên kết nội bộ. Cần một quyết định nhỏ về phân phối qua tìm kiếm trước launch.

Tổ chức cụm nội dung quanh nhu cầu: bài nền tảng -> bài thực hành -> tài nguyên thực
sự được dùng -> sửa lỗi và lựa chọn thay thế. Phân biệt bài theo tên công cụ với bài
giải quyết công việc. Không tạo hàng loạt biến thể bài thay tên repo nhưng nội dung
không có đóng góp riêng. Google nhấn mạnh ích lợi/kinh nghiệm thực, và chính sách
scaled content nhắm nội dung sản xuất hàng loạt để thao túng xếp hạng, không chỉ vì có
AI [R3, R4]. Không hứa SEO tốt chỉ vì dùng AI hoặc mặc định AI bị phạt.

Mốc A cần: URL chuẩn cho tài nguyên, title/mô tả đúng, sitemap các trang đã duyệt, bài
liên quan, redirect nếu đổi slug/domain, và chính sách index cho trang lọc. Không mở
mọi tổ hợp tham số thành trang indexable. Canonical dùng cho trang tương đương, không
phải cách che mọi nội dung khác nhau. Noindex phải được crawler đọc; không áp dụng
máy móc cùng robots disallow rồi mong crawler đọc noindex. Nguồn Google mô tả nguy cơ
bùng nổ URL từ bộ lọc [R5].

Mọi nhãn “miễn phí”, “tốt nhất”, “dễ cài” cần phạm vi và căn cứ. Tác giả/biên tập, ngày
thử, sửa đổi và đóng góp riêng giúp người đọc đánh giá độ tin cậy. Ảnh kết quả nên có
alt mô tả giá trị, không nhồi từ khóa.

### 11. Giới hạn ma trận kiểm chứng và quản lý độ mới đúng cấp

Liên quan: mục 6, 9, 11, 14. Kế hoạch đúng khi không áp validation từ agent này sang
agent khác. Nhưng nếu thử 20 tài nguyên × 3 agent × 2 OS thì có tới 120 tổ hợp, chưa
kể phiên bản. Đây là phép tính phạm vi, không phải số ca đã có hoặc bắt buộc phải thử.

Mốc A chỉ cam kết các tổ hợp đã chọn; phần còn lại ghi chưa kiểm chứng hoặc yêu cầu
upstream. Dùng manifest bài thực hành ghi commit nguồn, agent/OS/version, input mẫu,
kết quả và ngày thử. Một bài thử lệnh chạy xong không mặc định đã kiểm tra mọi tính năng.

Thiếu trong kế hoạch là lịch rà soát ngay cả khi upstream im lặng. Giao diện agent,
chi phí API, điều kiện tài khoản hoặc dịch vụ ngoài có thể đổi mà repo không đổi.
Thêm owner, reviewed_at, review_due_at, lý do kiểm tra lại và mức tác động. Tần suất
theo rủi ro từng loại claim; chọn qua pilot, không gán mọi bài một hạn giống nhau.

Bài quá hạn vẫn có thể đọc với nhãn phù hợp, nhưng giảm đề xuất và xem xét ẩn khối cài
khi cần. Khi chủ biên vắng, ưu tiên minh bạch và hạn chế nhận bài mới. Không tự cập
nhật ngày Đã kiểm chứng chỉ vì kiểm tra link trả 200.

### 12. Tách pilot kỹ thuật, usability và nhu cầu quay lại

Liên quan: mục 10–11.2 và 15. Pilot Gemini 7 ngày kiểm tra vận hành pipeline; nó không
chứng minh website có nhu cầu, nội dung tạo doanh thu hoặc độc giả quay lại. Benchmark
10 đầu vào cũng không đại diện mọi repo.

Ba phép thử khác nhau:
- Benchmark AI: ca nguồn cố định có đáp án/nguồn kiểm tra, rubric, chi phí và lỗi chặn.
- Pilot kỹ thuật 7 ngày: lịch, checkpoint, quota, draft trùng, lỗi, ngân sách và công duyệt.
- Thử sản phẩm: nhóm người dùng thực hiện nhiệm vụ với điều kiện xác định; sau đó quan
  sát họ có dùng bài cho việc riêng hoặc quay lại không. Có thể quan sát thêm vài tuần,
  nhưng chưa chốt một thời gian là đủ để suy rộng thị trường.

Kế hoạch ghi 5–8 người nhưng ngưỡng 4/5 chưa nhất quán. Báo số hoàn thành/tổng người
thực sự làm từng nhiệm vụ, mức trợ giúp, thời gian và nguyên nhân thất bại. Mẫu nhỏ dùng
để tìm vấn đề; không trình bày tỷ lệ như ước lượng cho toàn bộ người Việt.

Định nghĩa hoàn thành là có đầu ra vượt checklist bài, không phải xem hết trang hoặc
copy lệnh. Ghi riêng lỗi bài, lỗi môi trường, thiếu điều kiện và sự cố công cụ. Đặt
điều kiện tiếp tục: sửa lỗi chặn hành trình trước khi tăng nội dung; nếu không có nhu
cầu lặp lại thì xem lại phân khúc/công việc thay vì mua thêm traffic.

## 6. Mô hình sản phẩm đề xuất sau cải tiến

Hai lớp nội dung dùng chung dữ liệu nhưng có mức cam kết khác nhau:

| Lớp | Mục tiêu | Điều được hứa | Nhịp cập nhật |
|---|---|---|---|
| Khám phá có nguồn | Biết thứ mới có thể hữu ích | Thông tin có nguồn và trạng thái chưa thử rõ | Thu thập hằng ngày, xuất bản theo công suất |
| Thực hành có kiểm chứng | Làm xong một việc cụ thể | Bài đã thử trong môi trường được nêu | Phát hành chậm hơn; rà soát theo rủi ro |

Một repo có thể được phát hiện nhưng chưa đủ điều kiện xuất bản; một mục khám phá có
thể dẫn tới bài thực hành khi đã thử. Không để mọi phát hiện tự biến thành URL bài SEO.
Mỗi đầu ra cần có chủ sở hữu, trạng thái và lý do tồn tại cho người đọc.

Lợi thế tích lũy nên nhắm tới: bài mẫu tiếng Việt thực sự chạy được, lịch sử sửa lỗi,
dữ liệu tương thích có bằng chứng và phản hồi của người mới. Số repo thu thập và số
bài AI tạo là chỉ số hoạt động nội bộ, không tự tạo lợi thế cạnh tranh.

## 7. Kế hoạch thử nội dung và tăng trưởng gọn

Trong giai đoạn đầu, làm một bộ nội dung xoay quanh một kết quả:
- Một bài chọn công cụ với điều kiện đầu vào rõ.
- Một bài chuẩn bị môi trường.
- Một bài tạo sản phẩm nhỏ.
- Một bài sửa một thay đổi/lỗi bằng agent.
- Một bài áp dụng biến thể và tổng hợp lỗi đã gặp.

Đây là bộ 5 bài mẫu để đo, không phải 5 dự án kỹ thuật độc lập. Chọn 5–10 tài nguyên
liên quan làm danh mục đọc được, không bắt người mới nghiên cứu hết trước khi thực hành.

Mỗi bài sâu có thể sinh một đoạn giới thiệu ngắn, hình kết quả hoặc video nhỏ dẫn về
bài gốc; chỉ sản xuất định dạng phù hợp công suất. Thử một kênh sẵn có trước. Nội dung
phân phối phải nêu đúng lợi ích, điều kiện và trạng thái thử; không dùng nhãn “hot” để
hứa kết quả kinh doanh không có bằng chứng.

## 8. Đo lường và kinh tế vận hành

| Chỉ số | Định nghĩa tối thiểu | Quyết định hỗ trợ |
|---|---|---|
| Hoàn thành nhiệm vụ | Đầu ra qua checklist / người thực sự bắt đầu nhiệm vụ | Sửa bài hay mở rộng bài tiếp |
| Thời gian sửa draft | Phút thực biên tập + kiểm chứng từng bài | Có nên dùng Gemini cho loại nội dung này |
| Chi phí/bài được duyệt | AI + grounding + runner + phần chi phí thử có phân bổ / bài đạt | Giữ/đổi model hoặc giảm nguồn |
| Tải bảo trì | Giờ sửa bài cũ + bài quá hạn + cảnh báo chưa xử lý | Giảm tạo bài mới hay tăng nguồn lực |
| Hiệu quả kênh | Người vào đúng bài và thực hành theo từng nguồn | Tập trung kênh nào, không chỉ lượt xem |
| Quay lại có ích | Người tiếp tục/áp dụng bài vào việc thật với cách đo công khai | Đầu tư lộ trình hay xem lại nhu cầu |

Ghi cả chi phí trực tiếp và công người. Nếu dùng một đơn giá quy đổi giờ biên tập,
phải ghi đó là giả định của chủ website. Không tính API key đã có là chi phí biên bằng 0.
Chỉ số quay lại khi chưa có tài khoản có giới hạn nhận diện; có thể dùng phản hồi chủ
động và số liệu tổng hợp phù hợp, không lén tạo fingerprint.

Giới hạn số tài nguyên đang bảo trì là quan trọng như giới hạn token. Nếu danh mục
đạt 100 bài nhưng công duyệt chỉ đủ giữ 20 bài cập nhật, tăng số lượng làm giảm chất
lượng. Ví dụ này minh họa rủi ro công suất, không phải ngưỡng đã đo của dự án.

## 9. Backlog thay đổi đề nghị cho bản kế hoạch 1.2

Chưa áp dụng tự động vào kế hoạch gốc.

**Trước phát triển lớn:**
- Brief một trang: phân khúc, công việc đầu tiên, công cụ/OS ưu tiên và mục tiêu dự án.
- Lộ trình A/B đúng phụ thuộc; prototype bổ sung trang hướng dẫn.
- Người phụ trách duyệt, số giờ/tuần và hạn mức bảo trì.
- Tiêu chí khảo sát/pilot, định nghĩa hoàn thành và nguồn tuyển người.

**Trước mở thử A:**
- Một bộ bài thực hành được thử và có manifest môi trường.
- Hai bộ lọc ưu tiên, truy vấn nghiệm thu và luồng điều kiện không đáp ứng.
- Chính sách URL/index, một kênh phân phối thử và cách ghi nguồn.
- Staging thật, quyền, backup/restore và quy trình cập nhật đã diễn tập.

**Trước bật B:**
- Bộ benchmark Gemini và cổng claim/evidence, ngưỡng lỗi chặn.
- Quy tắc tìm/chọn hai tầng, query checkpoint và quota đa dạng.
- Job lease, dự phòng chi phí, retention bảo vệ bằng chứng.
- review_due_at, giới hạn backlog, quy trình vắng người và pilot 7 ngày.

**Sau có bằng chứng nhu cầu:**
- Mở rộng công cụ, OS, chủ đề và quy mô thu thập theo công suất.
- Xem xét newsletter/thành viên/dịch vụ, dựa trên mục tiêu đã chọn; chưa thêm mặc định.

## 10. Kết luận quyết định

Đồng ý đầu tư vào một bản mở thử có giới hạn. Giữ nền tảng kỹ thuật và nguyên tắc nguồn
đã đề xuất; sửa định vị, thứ tự phát hành, công suất và đo lường trước. Không cần viết
lại toàn bộ kiến trúc, mua thêm hệ thống hay chọn thêm nhiều model ngay lúc này.

Đầu ra tiếp theo có giá trị nhất là brief người dùng + một bài thực hành hoàn chỉnh
+ prototype bốn màn hình, cùng kế hoạch tìm người thử. Collector hằng ngày và Gemini
được phát triển để giảm công việc đã đo, không phải để lấy số lượng bài làm mục tiêu.

## 11. Nguồn tham chiếu bên ngoài

[R1] Skills directory — ví dụ phương án khám phá/bảng xếp hạng hiện có:
https://www.skills.sh/

[R2] Google Gemini — Structured outputs (đúng cấu trúc vẫn cần kiểm tra giá trị):
https://ai.google.dev/gemini-api/docs/structured-output

[R3] Google Search — Helpful, reliable, people-first content:
https://developers.google.com/search/docs/fundamentals/creating-helpful-content

[R4] Google Search — Spam policies, scaled content abuse:
https://developers.google.com/search/docs/essentials/spam-policies#scaled-content

[R5] Google — Crawling faceted navigation URLs:
https://developers.google.com/crawling/docs/faceted-navigation

Nguồn chỉ hỗ trợ các đặc điểm/khuyến cáo được dẫn. Các ưu tiên, phép thử, ví dụ công suất
và khuyến nghị sản phẩm trong bản đánh giá là nhận định áp dụng riêng cho dự án, chưa
phải dữ liệu thực nghiệm của website. Không có API trả phí hoặc lịch tự động nào được
bật, không có mã hosting được thay đổi trong quá trình phản biện.
