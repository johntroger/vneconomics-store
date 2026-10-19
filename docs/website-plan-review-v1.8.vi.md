# Đánh giá kế hoạch website phiên bản 1.8

Ngày: 19/10/2026. Đối tượng: docs/website-build-plan.vi.md phiên bản 1.8.
Đánh giá theo AI, vibe coding, kiến trúc, UX e-commerce và content marketing.

Đây là nhận xét trên tài liệu và đề xuất cần tích hợp, không phải kết quả kiểm thử
sản phẩm, nghiên cứu thị trường hay xác nhận lại hạ tầng. Giữ nguyên các quyết định:
website miễn phí; người mới hoàn toàn; cấu trúc e-commerce có danh mục/chi tiết;
CTA truy cập repo; AI khách dùng BYOK với hai tác vụ đã chốt. Chưa đổi plan gốc,
chưa triển khai, gọi AI có phí, chạy lịch hoặc đăng nội dung ra ngoài.

## 1. Kết luận đánh giá

Định hướng có cơ sở, kiến trúc tổng thể phù hợp cho một MVP WordPress có biên tập.
Kế hoạch đủ để bắt đầu làm nội dung mẫu và prototype; chưa đủ để chốt chi phí/lịch
phát hành hoặc triển khai mọi yêu cầu như một backlog đã đóng phạm vi.

Điểm yếu lớn nhất là phạm vi rộng hơn năng lực đã được xác nhận: chưa chọn một việc
đầu tiên, công cụ/OS ưu tiên, số giờ biên tập và kênh thử. Rủi ro chính là phát triển
một directory đẹp, nhiều tài nguyên, nhưng chưa chứng minh người mới chọn được mục
phù hợp và hoàn thành việc thực tế. Không thể suy ra nhu cầu hoặc khả năng duy trì
từ số trang trong plan, số stars hay việc webhook hoạt động.

Không chấm điểm số tổng hợp vì chưa có dữ liệu người dùng, benchmark AI hoặc số giờ
vận hành. Phân loại dưới đây là đánh giá chuyên môn, không phải phép đo định lượng.

## 2. Đánh giá theo năm góc nhìn

| Góc nhìn | Điểm mạnh đã có | Hạn chế còn lại | Điều kiện kiểm chứng tiếp |
|---|---|---|---|
| AI | Tách GitHub facts/Gemini drafts; nguồn, benchmark, duyệt người; key chủ và khách riêng | Chưa chứng minh AI giảm công sửa hoặc giúp học hơn nội dung tĩnh | So công nhập tay với AI có duyệt; thử U1/U2 trên cùng loại nhiệm vụ |
| Vibe coding | Luồng cài -> kiểm tra -> làm -> sửa -> checklist; không hứa prompt cho đầu ra giống hệt | Chưa chọn tác vụ; chưa có chuẩn ghim revision và tái thử bài khi dependency đổi | Một bài mẫu chạy từ môi trường mới tới đầu ra, sửa một thay đổi và khôi phục được |
| Kiến trúc | Theme/plugin/collector tách; A/B/U độc lập; giữ state, provenance, backup | A còn thiếu hợp đồng dữ liệu tối thiểu; quan hệ guide/resource và ưu tiên trạng thái chưa rõ | Schema A + ví dụ payload + preview + quy tắc vô hiệu hóa bài liên quan |
| UX e-commerce | Danh mục, thẻ, chi tiết, lọc, nguồn, mobile và ngoại lệ có đặc tả | Nhiều nhãn kỹ thuật; chưa kiểm chứng người mới hiểu CTA/loại/nhu cầu; chi tiết dễ quá dài | Prototype dùng nội dung thật; thử tìm/chọn tài nguyên và bước kế tiếp |
| Content marketing | Không dịch hàng loạt; có bản địa hóa, bằng chứng, kênh thử và vòng quay lại | Chưa có gói nội dung/thu hút/đo phản hồi cụ thể; nguồn lực duy trì chưa biết | Một cụm nội dung, một kênh có quyền dùng, ghi công và phản hồi thực tế |

## 3. Các vấn đề và đề xuất ưu tiên

### P1. Loại bỏ mục trái quyết định miễn phí

Vị trí: mục 5 ghi khóa học trả phí trong danh sách để sau MVP, trong khi mục 2 và
15.1 đã chốt website hoàn toàn miễn phí. Đây là mâu thuẫn văn bản thực tế cần sửa,
không phải một lựa chọn còn mở. Bỏ khóa học trả phí khỏi roadmap; không diễn giải
miễn phí chỉ áp dụng cho A. Phí công cụ/API bên ngoài vẫn được giải thích riêng.
### P1. Chốt một kết quả ban đầu, vẫn giữ cấu trúc e-commerce

Vị trí: mục 3, 5, 14, 16. Kế hoạch đã thừa nhận điểm này chưa chốt; đây là phụ thuộc
quan trọng chưa giải quyết, không phải thiếu sót bị bỏ quên.

Đề xuất chọn một việc nhỏ có đầu ra quan sát được và ít dependency. Ví dụ một trang
giới thiệu là ứng viên để so sánh, chưa mặc định chọn. Dùng brief: ai -> cần làm gì
-> thiết bị/OS -> tài khoản/ngân sách -> đầu ra -> cách kiểm tra -> bước tiếp.
Chọn công cụ/OS sau nhiệm vụ. Khảo sát hosting song song. Không buộc chủ website
chốt thương hiệu, mọi model và tất cả danh mục cùng lúc.

Giữ trang danh mục và sản phẩm như yêu cầu; nhóm bắt đầu chỉ định hướng cho người
chưa biết cài, không chặn nhấn repo. Danh mục ban đầu nhỏ, có chủ đích và không tạo
nhiều nhóm rỗng để giống một sàn lớn.

### P1. Đánh giá khả năng bắt đầu tách khỏi độ phổ biến

Vị trí: mục 6, 7.3, 11.1. Điểm dễ bắt đầu đã có trọng số nhưng chưa có rubric đủ để
hai người biên tập đánh giá giống nhau. Repo hot không mặc định phù hợp người mới.

Bổ sung rubric: có ví dụ đầu ra; hướng dẫn từ máy chưa cài; số tài khoản/dependency;
cần API/terminal/quyền gì; khó quay lại/gỡ bỏ không; tài liệu khớp revision không;
khả năng hoàn thành một tác vụ nhỏ. Ghi Chưa rõ khi thiếu nguồn, không suy từ tổng sao.

Tách trong dữ liệu: popular/trending là tín hiệu quan sát; novice readiness là đánh
giá theo điều kiện; validation là bằng chứng đã thử. Nhãn công khai diễn đạt cụ thể
như Cần cài công cụ, Cần API riêng, Có bài bắt đầu, thay vì một badge Dễ dùng chung.
Không suy ra an toàn từ readiness hoặc từ việc chạy được.

### P1. Khóa phạm vi A bằng hợp đồng dữ liệu và backlog thực thi

Vị trí: mục 5, 7.4, 7.7, 9, 14. Nhiều trường/khối đều hợp lý nhưng không nên biến
mọi trường thành việc bắt buộc phải nghiên cứu sâu cho mỗi sản phẩm ở A.

A cần: trang chủ, trang danh mục, sản phẩm, bài thực hành; tìm/lọc tối thiểu; nguồn;
trạng thái; chi phí/quyền/tương thích được xác minh hoặc nêu chưa rõ; báo lỗi;
preview và backup/deploy đã thử. Dùng một ảnh hợp lệ nếu không có gallery thật.
FAQ, demo, tài nguyên liên quan chỉ hiển thị khi có nội dung và căn cứ; không ép đủ
module cho cả 10 tài nguyên. Bookmark/so sánh vẫn sau A như plan.

Tạo bảng field A: kiểu, bắt buộc/điều kiện, null/unknown, nguồn/ngày kiểm tra, quyền
sửa, chỗ hiển thị. Nguồn cho field quan trọng có thể lưu thành meta cấu trúc ở A,
không cần xây claim engine/bảng job hoàn chỉnh trước B. Ví dụ chi phí có value,
source_url, observed_at, verification_status, note; unknown phải nói phần chưa rõ.
Khi B tới, migration phải giữ nguyên nguồn của các bài nhập tay.

Chuyển yêu cầu thành đầu việc có owner, phụ thuộc và tiêu chí xong. Ước lượng lại sau
một sản phẩm + bài hướng dẫn mẫu; không tái dùng số ngày cũ để hứa thời hạn bản 1.8.

### P1. Gắn bài thực hành với phiên bản và dependency có thể kiểm tra lại

Vị trí: mục 6, 9, 10.3, 11.2. Plan đã lưu commit và validation, nhưng chưa đặc tả
cách các dữ liệu đó quyết định phiên bản người đọc thực sự cài, hay bài nào cần xem
lại khi một resource/công cụ thay đổi.

Bổ sung GuideRevision/GuideValidation: guide ID + revision, bước, OS, công cụ/version,
nguồn/revision liên quan, ngày thử, đầu vào/đầu ra/checklist. Validation cho bước tạo
tài khoản hoặc cài công cụ không bắt buộc có GitHub repo. ResourceValidation và
GuideValidation có thể chung nền schema nhưng không ép cùng một khóa agent/repo.

Lưu quan hệ guide -> resource/source/tool/version và quy tắc đưa bài liên quan vào
hàng đợi rà soát khi lệnh, quyền, giấy phép hoặc dependency quan trọng đổi. Đây là
cập nhật độ tin cậy, không tự viết lại bài công khai. A quản lý thủ công các quan hệ
này được; B mới tự động phát hiện/invalidate.

Trong hướng dẫn, chỉ rõ nguồn đã thử và lệnh có ghim phiên bản khi upstream hỗ trợ.
Không dùng âm thầm latest/default branch rồi ghi đã thử theo SHA cũ. Nút Truy cập repo
vẫn tới nguồn trực tiếp; phần Nguồn đã thử có link revision riêng. Nếu không thể ghim,
giải thích giới hạn và thời điểm thử, không hứa tái hiện mã giống hệt.

### P1. Chuyển nhiều trạng thái thành quy tắc hiển thị nhất quán

Vị trí: mục 6, 7.5, 9, 11.2. Đã có xử lý ngoại lệ tốt nhưng chưa có bảng ưu tiên khi
một mục vừa đã thử, vừa quá hạn, vừa archived hoặc có sự cố nguồn.

Đề xuất tách publication_status, source_status, validation_status và recommendation_status.
Có bảng suy ra badge chính, cảnh báo, khả năng vào đề xuất và CTA cho mỗi tổ hợp quan
trọng. Ví dụ đã thử trước đây + cần rà soát không hiển thị một badge xanh đơn lẻ;
ngừng khuyến nghị ưu tiên hiển thị lý do và không tiếp tục CTA chính như bình thường.

Đồng bộ quy tắc trên thẻ/chi tiết/bộ lọc/AI. Lỗi upstream nhất thời không tự đổi thành
repo đã xóa. Người biên tập được override có ghi lý do; không xây ma trận mọi tổ hợp
không thể xảy ra. API public chỉ trả dữ liệu đã duyệt và trạng thái công khai.

### P2. AI cần chứng minh hiệu quả bổ sung và hợp đồng xử lý input

Vị trí: mục 10.1–10.3. Hai tác vụ đã chọn phù hợp; chưa cần chatbot đa năng/RAG lớn.
Giữ benchmark lỗi chặn; đo thêm tổng thời gian từ nguồn tới bài duyệt, số claim phải
sửa, tỷ lệ bản nháp bỏ và chi phí mỗi bài dùng được, so với quy trình thủ công.
JSON đúng không bảo đảm giá trị đúng; Google cũng yêu cầu kiểm tra giá trị [R1].

Với U1/U2: so khả năng vượt bước/chọn đúng tài nguyên khi chỉ đọc hướng dẫn với khi
có hỗ trợ AI. Quan sát vài ca đầu để tìm lỗi, không tuyên bố hiệu quả thống kê từ
mẫu nhỏ. Nếu câu trả lời chỉ nhắc lại trang, ưu tiên cải thiện nội dung tĩnh trước.

Thêm cảnh báo và cơ chế phát hiện/redact các mẫu bí mật trong lỗi người dùng dán,
cho xem lại dữ liệu sẽ gửi; bộ phát hiện không bảo đảm bắt mọi bí mật. Giới hạn ngữ
cảnh, quản lý request trùng, thông báo hủy phản hồi không bảo đảm hoàn lại phí. Không
lưu dữ liệu riêng để làm benchmark nếu chưa có cơ chế đồng ý và loại thông tin riêng.
BYOK thêm rào cản cho người mới; chỉ mở sau U, không lấy tỷ lệ nhập key làm mục tiêu
thành công của website miễn phí.

### P2. UX cần lớp đọc nhanh trước nội dung chuyên sâu

Vị trí: mục 7.3–7.4. Giữ bố cục e-commerce đã chốt. Phần đầu sản phẩm trả lời: làm
được gì, cần có gì, phù hợp với tôi không, bước tiếp là gì. Metadata kỹ thuật sâu
nằm phía dưới; công cụ/OS và chi phí ảnh hưởng quyết định phải thấy sớm.

Thử riêng khả năng phân biệt Danh mục và Khám phá; nếu người mới không phân biệt,
đổi nhãn/gộp lối điều hướng, không tạo hai kho độc lập. Tìm kiếm A có thể định phạm
vi rõ là Tìm tài nguyên; đường tìm hướng dẫn riêng. Nếu tìm cả hai, nhóm kết quả và
URL/label rõ. Thẻ repo/skill/ứng dụng dùng layout chung nhưng nhãn và điều kiện riêng.

Prototype dùng nội dung thật: tên dài, thiếu ảnh/sao/chi phí, cảnh báo quá hạn, link
ngoài và hướng dẫn cài. Thử từ điện thoại để chọn/xem; tác vụ cần máy tính phải nói
rõ, hỗ trợ chuyển link, không yêu cầu làm terminal trên mobile.

### P2. Content marketing cần một cụm nội dung và phép thử phân phối cụ thể

Vị trí: mục 15.1. Plan đã nêu kênh và vòng quay lại, nhưng chưa có gói thực thi.
Đề xuất quanh cùng tác vụ: một bài lựa chọn/chuẩn bị, một hướng dẫn chính, các trang
repo/skill cần thiết, một bài lỗi hoặc ví dụ biến thể. Số bài theo kết quả thực tế,
không tạo thêm chỉ để đạt quota SEO. Mỗi bài có đầu vào, kết quả mẫu, nguồn và CTA
phù hợp giai đoạn. Nội dung tin nóng không chiếm hết công suất bảo trì bài nhập môn.

Trước mở thử: chọn một kênh được phép, chuẩn bị nội dung giới thiệu và ảnh kết quả,
link vào bài/danh mục phù hợp, cách tuyển người thử và lịch hỏi phản hồi. Chỉ xuất
bản/gửi khi có yêu cầu tương ứng; kế hoạch này không tạo lịch hay gửi tin.
Ghi nguồn giới thiệu và kết quả tìm/chọn/thực hành ở mức phù hợp quyền riêng tư.
Đo phân phối nội dung và thử usability là hai phép thử khác nhau.

Đối chiếu định kỳ vài tài nguyên cùng nhiệm vụ trên nguồn gốc/directory/video/AI
để biết website thêm giá trị gì; chưa có dữ liệu so sánh nên không khẳng định lợi
thế cạnh tranh. Google cảnh báo tạo nhiều trang AI thiếu giá trị bổ sung [R2].

### P2. Miễn phí cần chế độ vận hành trong giới hạn nguồn lực

Vị trí: mục 11.4, 15. Plan đã có budget và công suất; cần chuyển thành cấu hình thực
và quy trình khi thiếu người/tiền: giảm nhận ứng viên -> ngừng draft mới -> ưu tiên
sửa bài cũ -> giữ catalog đọc được -> hiển thị trạng thái bảo trì phù hợp. Giới hạn
danh mục đang duy trì theo giờ đo được, không theo số repo phát hiện được.
Không ép thêm mô hình doanh thu, tài trợ, paywall hoặc thu phí AI trái quyết định.
Chốt ai nhận báo lỗi, thời gian thực có, trần tiền và cách khôi phục dịch vụ trước B/U.

## 4. Thứ tự cải tiến đề xuất

1. Brief một nhiệm vụ đầu tiên; chốt công cụ/OS, khảo sát hosting và nguồn lực.
2. Làm một trang sản phẩm và một bài thực hành thật; đo công, kiểm tra revision.
3. Khóa scope A, schema nguồn tối thiểu và bảng trạng thái; lập backlog nhỏ có tiêu chí xong.
4. Prototype chủ/danh mục/chi tiết/hướng dẫn; thử hai việc: tìm mục phù hợp và thực hành.
5. Sửa lỗi chặn, staging/deploy/restore thật; mở thử A với một cụm nội dung/kênh.
6. Chỉ mở B khi nội dung có ích và người duyệt có công suất; U có cổng hữu ích và an toàn riêng.

Tự động hóa có thể nghiên cứu sớm nhưng không là phụ thuộc để thử giá trị website.
Không cần bỏ cấu trúc e-commerce, thêm headless, WooCommerce, vector database hoặc
hệ multi-agent để xử lý các khoảng trống đã tìm thấy.

## 5. Kiểm chứng và nguồn

Phương pháp: đọc plan 1.8, đối chiếu các phần A/B/U, kiểm tra reader độc lập và tài
liệu chính thức. Không chạy mã website hay API AI có phí; không phát sinh fixture.
Nhận xét ưu tiên và giải pháp là đề xuất của dự án, chưa phải quyết định người dùng.

[R1] Gemini — Structured outputs, validation giá trị:
https://ai.google.dev/gemini-api/docs/structured-output

[R2] Google Search — Generative AI content:
https://developers.google.com/search/docs/fundamentals/using-gen-ai-content

[R3] GitHub REST Search — giới hạn phạm vi tìm kiếm:
https://docs.github.com/en/rest/search/search

GitHub Search không phải nguồn bao phủ toàn bộ GitHub; tài liệu nêu tối đa 1.000 kết
quả mỗi truy vấn [R3]. Kế hoạch đã ghi nhận giới hạn, đề xuất bổ sung việc phân vùng
query/checkpoint khi dữ liệu thực vượt cửa sổ, không hứa tìm đủ mọi repo hot.
