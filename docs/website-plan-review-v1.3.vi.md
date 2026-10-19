# Phản biện kế hoạch website 1.3 — ưu tiên người mới hoàn toàn

Ngày: 19/10/2026.
Bản kế hoạch được đọc: docs/website-build-plan.vi.md, commit 74829ee.
Bản phản biện trước: docs/website-plan-review.vi.md (đánh giá 1.1, giữ làm lịch sử).
Tài liệu này không thay đổi kế hoạch gốc hoặc phân khúc người dùng đã chốt.

## 1. Kết luận

**Có thể bắt đầu bài mẫu và prototype nhập môn. Chưa nên khóa schema toàn hệ thống,
lập lịch phát hành hoặc xây đầy đủ collector trước khi kiểm chứng hành trình đầu.**

Bản 1.3 tiến bộ đáng kể so với 1.1: đã chốt người mới hoàn toàn, có đường mở thử A độc
lập, bốn màn hình, hai lớp nội dung, evidence gate cho Gemini, quản lý backlog/budget
và cơ chế phục hồi job. Các khoảng trống cũ này không nên tiếp tục được nêu như chưa có.

Vấn đề còn lại là quyết định phân khúc mới chưa được chuyển hết vào wireframe, mô hình
hướng dẫn, nguồn dữ liệu, chuyển trang đăng ký và phép đo. Website cần tổ chức quanh
việc giúp người chưa biết bắt đầu đạt một kết quả; kho repo là công cụ khám phá về sau.
Không chuyển sản phẩm thành một hệ đào tạo lớn hoặc bỏ ý tưởng tuyển chọn repo ban đầu.

Kết luận dựa trên tài liệu, không phải bằng chứng UX đã tốt hoặc người dùng sẽ quay lại.
Chưa có prototype, thử người dùng thật, chi phí hỗ trợ hoặc benchmark Gemini để cho điểm
hiệu quả định lượng. Không chấm một điểm tổng có vẻ chính xác nhưng thiếu phép đo.

## 2. Đánh giá theo năm góc nhìn

| Góc nhìn | Đã phù hợp | Còn phải chốt/kiểm chứng |
|---|---|---|
| AI | Gemini làm biên tập nền, không tự xác nhận đã thử; có source/version và lỗi chặn | Bài cài ứng dụng cần nguồn chính thức ngoài GitHub và ca đánh giá hướng dẫn UI |
| Vibe coding | Có kết quả, checklist, vòng sửa và phạm vi môi trường | Giới hạn số kỹ năng mới trong tác vụ đầu, không gộp cài–Git–deploy thành một buổi |
| Kiến trúc | WordPress/theme/plugin/collector phù hợp, job và quyền đã được đề cập kỹ | Hướng dẫn/validation độc lập với repo; bước có ID và revision, nguồn chung có dependency |
| UI/UX | Có nhập môn, ảnh, lỗi, mobile và bốn màn hình | Wireframe chưa đổi ưu tiên; nhánh Tôi chưa biết, rời website và quay lại chưa đủ cụ thể |
| Content marketing | Có nội dung nền tảng, lựa chọn, cập nhật và một kênh thử | Lời hứa đầu vào phải khớp hành trình; đo người qua cài đặt, công hỗ trợ và lần quay lại |

## 3. Các quyết định nên giữ, không tiếp tục mở lại

- Nhóm chính là người mới hoàn toàn, chưa biết cài công cụ. Không hỏi lại để chọn nhóm khác.
- Giữ WordPress; không chuyển sang headless, LMS, chatbot, vector database hoặc nhiều agent tự điều hành.
- Giữ mốc A độc lập với Gemini, collector và pilot 7 ngày. Giữ B sau khi có bằng chứng.
- Giữ Gemini API trả phí cho biên tập nền; tài khoản/quota người học là vấn đề riêng.
- Giữ Khám phá có nguồn và Thực hành có kiểm chứng, cùng nguyên tắc không bịa validation.
- Giữ các cơ chế quyền, schema, idempotency, lease, budget và retention đã có trong 1.3.
- Giữ thử trên staging thật và tách code/content/database trước thay đổi production.

## 4. Phát hiện trọng yếu và cải tiến

### P1. Wireframe chưa phản ánh ưu tiên đã chốt

Căn cứ: mục 3.1 nói ưu tiên Tôi bắt đầu từ đâu, nhưng wireframe mục 7 mở bằng bốn lựa
chọn, có Tìm skill và ô tìm; lộ trình người mới xuất hiện sau đó. Bảng trang chủ mục 4
vẫn cho Tìm công cụ hoặc bắt đầu một bài hai vai trò gần ngang nhau.

Đây là độ lệch giữa brief và bản mô tả giao diện, chưa phải kết luận người dùng thực
sự bị rối. Cần sửa trước prototype, thay vì xây xong mới tranh luận màu sắc.

Đề xuất thứ bậc thử:

    Một kết quả mẫu thực tế, ghi rõ minh họa nếu chưa thử
    Từ chưa cài công cụ tới việc đầu tiên cùng AI
    [Bắt đầu từ bước đầu tiên]                 hành động chính
    Bạn cần chuẩn bị gì / có thể xem mẫu trước
    Đã biết bắt đầu? [Khám phá công cụ]        đường phụ
    Bài thực hành và phát hiện mới có tuyển chọn

Không chốt copy hoặc lời hứa thời gian/phí khi bài mẫu chưa được thử. Các điều kiện
quan trọng phải dễ thấy, không giấu sau phần nâng cao. Người đã dùng công cụ vẫn có
đường bỏ qua nhập môn, không buộc tất cả đi qua một bài.

Nghiệm thu: quan sát người mới có nhận ra bước đầu và kỳ vọng đúng trước khi click;
không dùng việc họ nói thích màu sắc làm bằng chứng hành trình dễ dùng.

### P2. Chưa biết cài cũng có thể chưa biết cách kiểm tra điều kiện

Căn cứ: mục 3, 3.1 và 7 đã yêu cầu kiểm tra thiết bị/tài khoản/ngân sách, nhưng chưa
có cách cho người không biết OS, quyền cài hoặc tên gói tài khoản tự trả lời.

Sửa tối thiểu: với một tool/OS được chọn, mỗi điều kiện có ba đường: Tôi biết / Tôi
chưa biết / Tôi không đáp ứng. Tôi chưa biết dẫn đến cách xem thông tin bằng thao tác
và ảnh tương ứng; không tự suy đoán OS hoặc tài khoản chỉ từ browser. Phân biệt bắt
buộc ngay với chỉ cần ở bước sau để không dồn mọi việc vào đầu.

Nếu máy cơ quan không cho cài hoặc chưa có gói phù hợp, cho xem ví dụ và quay lại sau,
hoặc dẫn sang phương án đã được thử tương đương nếu có. Không hứa luôn có thay thế
miễn phí và không tự tăng số công cụ chỉ để phủ mọi trường hợp ở mốc A.

Nghiệm thu: người mới xác định được điều kiện qua hướng dẫn; kết quả Không thể bắt đầu
được ghi như rào cản thực tế, không bị bỏ khỏi báo cáo vì chưa cài xong.

### P3. Cần quy tắc rời website rồi quay lại, đặc biệt tại tài khoản và trả phí

Căn cứ: plan đã phân biệt tài khoản website và dịch vụ ngoài, nhưng chưa mô tả đủ bàn
giao sang trang đăng ký, xác minh, cài đặt hoặc nâng gói.

Mỗi lần rời website cần: tên miền chính thức, mục đích, điều cần chuẩn bị, dấu hiệu
hoàn tất, cách quay lại đúng bước và nhánh không làm được. Không thu mật khẩu, key,
mã xác thực hoặc thông tin thanh toán của người học để hỗ trợ.

Ví dụ nhánh cần thử: chưa nhận email, mở nhầm tài khoản, gặp paywall, chưa có quota,
hủy thao tác hoặc không muốn cấp quyền. Dừng trước phát sinh phí nếu điều kiện chưa
được giải thích; không tự coi đăng ký thành công là đã có quyền dùng tính năng cần học.
Không khuyến nghị bỏ qua cảnh báo chứng chỉ hoặc cấp quyền rộng để kịp hoàn thành bài.

Đây là thiết kế luồng và nội dung trợ giúp, không phải yêu cầu xây proxy đăng nhập,
hệ thanh toán hoặc dịch vụ quản lý tài khoản học viên.

### P4. Cần giới hạn tác vụ đầu thay vì chỉ chọn tên sản phẩm cuối

Căn cứ: công việc đầu chưa chốt; mục 6 yêu cầu vòng sửa bằng agent, mục 16 có chuỗi tạo
sản phẩm–sửa lỗi–áp dụng biến thể. Các phần này hợp lý nhưng có thể cộng nhiều kỹ năng
mới ngay sau phần cài đặt.

Đề xuất tách hai chặng có thể nghỉ giữa: Sẵn sàng sử dụng -> Thành công đầu tiên. Cho
xem kết quả mẫu trước yêu cầu cài; plan đã cho xem mẫu khi thiếu điều kiện, nên mở rộng
thành lựa chọn sớm chứ không chỉ đường thoát khi bị chặn.

Giới hạn chọn bài đầu:
- Một đầu ra nhỏ, nhìn thấy và có checklist hành vi đơn giản.
- Một tool/OS đã kiểm chứng; tài khoản, quyền và chi phí rõ trước bắt đầu.
- Không đưa Git, repo, skill, API key, dependency hoặc deploy vào chỉ vì chúng phổ biến.
- Nếu buộc cần một phụ thuộc, giải thích tại bước đó; nếu quá nhiều, chọn bài khác.
- Bước đầu chỉ cần một thay đổi nhỏ và kiểm tra; biến thể/mở rộng là bước tiếp sau.

Phương án để so sánh khi chốt: trang giới thiệu local tối giản; tài liệu/đầu ra công
việc nhỏ; hoặc tác vụ khác phù hợp độc giả. Không mặc định làm slide là vibe coding:
nếu chỉ yêu cầu AI viết nội dung, phải gọi đúng là làm việc với AI. Nếu chọn mạch vibe
coding, cần có thao tác tạo/sửa sản phẩm và tự kiểm tra, không chỉ xem demo.

Không xếp hạng công cụ hoặc hứa thời gian hoàn thành khi chưa khảo sát khả năng truy
cập của nhóm thật. Việc người dùng có thể thích đầu ra nào vẫn là giả thuyết cần thử.

### P5. Mẫu tài nguyên chưa đủ để biểu diễn bài nhập môn không có repository

Căn cứ: Resource ở mục 9 có repo ID + đường dẫn, Validation gắn resource + agent/OS/
version. Trong khi tạo tài khoản, cài ứng dụng và kiểm tra sẵn sàng có thể không có repo.
Không được tạo repo giả hoặc ép mọi bài nhập môn thành một tài nguyên GitHub.

Sửa tối thiểu mô hình:
- Hướng dẫn có guide_id, revision, environment_profile, prerequisites và step IDs.
- Validation có subject_type + subject_id + revision; đối tượng là hướng dẫn/tài nguyên,
  liên kết repo chỉ khi phù hợp. Ghi phạm vi kiểm tra: cài, đăng nhập, tạo kết quả hay sửa.
- Nguồn có source_type/url/version/observed_at; repository ID tùy loại nguồn, không bắt buộc.
- Tối thiểu có step ID ổn định, link trực tiếp và revision bài. Chỉ thêm lưu tiến độ cục bộ nếu thử người dùng cho thấy cần; khi có, gắn guide revision và step ID, sau khi bài đổi phải chỉ rõ chỗ thay đổi,
  không tự khẳng định bước cũ vẫn đủ. Chưa cần cloud sync, tài khoản hay cấp chứng chỉ.

Biên tập mốc A có thể dùng block editor cùng mẫu thống nhất; chỉ viết block riêng khi
bài mẫu chứng minh cần ràng buộc schema. WordPress có cơ chế đăng ký block metadata
[R3]; điều này không tự cung cấp course engine hoặc validation cho website.

Nghiệm thu: nhập và xem thử được một hướng dẫn cài ứng dụng không gắn repo, có nguồn,
validation và link tới bước; đổi theme không mất dữ liệu. Nếu có lưu tiến độ, đổi revision không được âm thầm xác nhận bước cũ còn đủ.

### P6. Cổng chất lượng cần thêm kiểm chứng nội dung hướng dẫn từng bước

Căn cứ: mục 10.1 đã có benchmark, nguồn, lỗi chặn, bộ giữ lại và đánh giá ngữ nghĩa.
Không cần lặp lại yêu cầu chung “phải có benchmark”. Điểm thiếu do phân khúc mới là
các ca liên quan thao tác cài đặt và trạng thái tài khoản cụ thể.

Nguồn GitHub vẫn phù hợp phát hiện repo, nhưng hướng dẫn cài/đăng nhập phải đối chiếu
nguồn chính thức của sản phẩm và ảnh phiên bản thực tế đã thử. Việc snapshot README
không đổi không xác nhận màn hình đăng ký hoặc yêu cầu tài khoản vẫn như cũ.

Thêm ca vào bộ hồi quy: nhầm tài khoản chat với API, hướng dẫn sai OS, tên nút khác ảnh,
ảnh thiếu bước, link tải sang miền khác, gói chưa đủ quyền, thông báo hoàn tất bị hiểu
sai, thao tác dừng bị bỏ qua. Không bắt pipeline Gemini xử lý ảnh nếu chưa cần; người
biên tập có thể đối chiếu thủ công trong pilot, có lưu bằng chứng phù hợp.

Cổng nhập môn hỏi: một người chưa biết công cụ có thể xác định nơi thao tác, làm theo,
nhìn thấy kết quả và sửa một lỗi phổ biến không? Nguồn đúng và văn phong dễ hiểu chưa
đủ để xác nhận câu trả lời này; vẫn cần thử thực tế. Không thêm chatbot hỗ trợ tự do
chỉ vì bài chưa đủ rõ; sửa các bước có lỗi lặp lại trước.

### P7. UI/UX cần mẫu bước chuẩn và trạng thái tối thiểu, không thêm nhiều trang

Căn cứ: plan đã có bốn màn hình, feedback, lỗi và mobile. Cần cụ thể hóa trong màn hình
hướng dẫn thay vì yêu cầu màn hình thứ năm/thứ sáu chỉ để tăng phạm vi.

Một bước gồm: vị trí đang thao tác -> một hành động chính -> kết quả mong đợi -> cách
nhận biết chưa đúng -> sửa/dừng -> tiếp. Chỉ dùng nút Sao chép khi lệnh hoặc input là
việc cần làm ở bước đó, ghi rõ dán vào đâu và khi nào nhấn Enter.

Cần trạng thái chưa biết điều kiện, đang làm, tự đánh dấu hoàn tất, gặp lỗi, rời dịch
vụ ngoài và quay lại. Đây là trạng thái giao diện/tự báo cáo, không giả vờ website có
thể quan sát máy hoặc xác nhận đã cài thành công. Hiển thị bước hiện tại và lựa chọn
môi trường đã chọn; giữ nhãn bắt buộc như chi phí/quyền luôn rõ.

Ảnh có vùng cần chú ý và văn bản thay thế, video ngắn tùy nhu cầu với lời hướng dẫn
bằng chữ tương đương. Người đọc không phải ghi nhớ nhiều cửa sổ cùng lúc. Các nguyên
tắc chia bước và định hướng có cơ sở ở hướng dẫn bổ sung W3C [R1, R2]; áp dụng chúng
không phải chứng nhận website đạt WCAG hoặc bảo đảm người dùng sẽ làm được.

Nghiệm thu: thử đóng/mở bài, quay lại sau đăng ký, lỗi và tiếp tục; người học biết mình
ở đâu mà không phải đọc lại toàn trang. Lưu tiến độ local là tùy chọn sau thử nghiệm, không phải điều kiện mặc định của mốc A. Nếu có, tính năng này có giới hạn khi đổi trình duyệt,
thiết bị hoặc xóa dữ liệu; hiển thị đúng, không hứa đồng bộ tự động.

### P8. Thử người mới phải giữ đầy đủ người bị chặn ở khâu chuẩn bị

Căn cứ: 1.3 đã tách kết quả công cụ sẵn sàng và tác vụ hoàn thành, ghi trợ giúp và tuyển
người chưa cài. Cần giữ nguyên trạng thái ban đầu khi phân tích; chuẩn bị máy hộ người
học sẽ che mất bài toán mà website cam kết giải quyết.

Ghi các mốc với mẫu số cụ thể:

    Bắt đầu -> hiểu điều kiện -> tài khoản đủ quyền -> công cụ sẵn sàng
            -> đầu ra đạt checklist -> tự thực hiện một thay đổi nhỏ

Nếu ai dừng vì không muốn trả phí hoặc không có quyền cài, ghi lý do và giữ trong luồng
đầu vào. Có thể báo thêm tỷ lệ trên nhóm đủ điều kiện, nhưng không dùng tỷ lệ đó để
ngầm nói cả nhóm người mới đều thành công. Người được chuẩn bị sẵn có nhóm riêng.

Đo thời gian thao tác chủ động, thời gian chờ bên ngoài, số lần cần trợ giúp và nơi bỏ
cuộc. Checklist hoặc quan sát có đồng ý mới là bằng chứng; click Hoàn tất chỉ là tự
báo cáo. Không xin credential và không thu màn hình có dữ liệu riêng mặc định.

Đây là thử hình thành với mẫu nhỏ, không có tỷ lệ thành công toàn thị trường. Cần sửa
lỗi chặn và thử lại trước khi tăng sản lượng bài hoặc quy mô quảng bá. Pilot Gemini
7 ngày tiếp tục là kiểm tra kỹ thuật, không thay thế các mốc người học.

### P9. Content marketing phải bán đúng kỳ vọng “từ chưa cài tới làm được”

Căn cứ: 1.3 đã có một kênh thử, ba nhóm nội dung và vòng quay lại. Không còn khoảng
trống hoàn toàn về phân phối như ở bản 1.1. Điều cần cụ thể là thông điệp và trang đích
cho nhóm chưa cài công cụ.

Mỗi đoạn giới thiệu nên nói kết quả gì, cần chuẩn bị gì, bước đầu ở đâu. Không dùng
ngôn ngữ “không cần biết gì”, “hoàn toàn miễn phí”, “vài phút là xong” khi chưa thử và
chưa rõ điều kiện. Minh họa kết quả trước/sau, một lỗi thường gặp và cách vượt qua có
thể được dùng làm nội dung dẫn vào bài phù hợp.

Ý định nội dung giai đoạn đầu: Tôi bắt đầu thế nào -> Tôi cài ra sao -> Tôi đang gặp lỗi
này -> Tôi làm được gì tiếp -> Tôi cần repo/skill nào để mở rộng. Repo hot bổ sung cơ
hội mới cho người đã tới bước phù hợp, không thay vai trò hướng dẫn đầu.

Giữ một kênh sở hữu/được phép dùng để thử; đo số người tới bài, qua chuẩn bị và làm
được việc, không chỉ click. Chưa cần newsletter/LMS/cộng đồng. Không tự đăng bài hay
gửi tin nhắn trong quá trình lập kế hoạch này.

### P10. Kinh tế vận hành cần tính hỗ trợ người mới và tái sử dụng hướng dẫn

Căn cứ: mục 11.4 đã dự phòng cả bảo trì và hỗ trợ trong công suất, lịch trực và trường hợp chủ biên vắng. Cần cụ thể hóa bằng việc đo và phân loại hỗ trợ nhập môn thực tế, vì bài hướng dẫn
cho người chưa cài có thể tạo hỗ trợ ngoài việc duyệt draft. Mức công này chưa đo nên
không thể dự báo mức cụ thể hoặc suy ra API Gemini rẻ là vận hành rẻ.

Thêm chỉ số: giờ hỗ trợ theo nguyên nhân, công sửa một bước, số bài phụ thuộc bước cài
chung và chi phí hỗ trợ cho một kết quả đầu tiên được xác nhận. Không coi mọi người
truy cập đều là người cần hỗ trợ hoặc tự nhân chi phí từ mẫu nhỏ.

Giảm lặp bằng một hướng dẫn cài chính thức đã biên tập cho mỗi tool/OS/phiên bản ưu
­tiên, các bài thực hành liên kết tới đúng revision. Có sơ đồ phụ thuộc tối thiểu hoặc
trường liên kết trong CMS; đổi bước cài chung cần biết bài nào phải kiểm tra lại.
Không nhân bản toàn bộ hướng dẫn cài vào từng bài rồi dùng Gemini cập nhật độc lập.

Người phụ trách và giới hạn hỗ trợ cần rõ; hỗ trợ qua FAQ/form lỗi có thể đủ ở A, không
hứa trợ giúp trực tiếp mọi lúc. Quota collector theo tải biên tập hiện có vẫn giữ,
không mở thêm nguồn nóng chỉ để làm website trông luôn có tin mới.

## 5. Mức độ ưu tiên

| Trước khi | Việc cần hoàn thiện | Không cần làm thêm |
|---|---|---|
| Prototype | Chọn một kết quả nhỏ/tool/OS; sửa thứ bậc trang chủ; mẫu bước và trạng thái lỗi | Thiết kế nhiều dashboard hoặc so sánh mọi agent |
| Khóa schema A | Validation cho guide không có repo; step ID/revision; nguồn phù hợp loại bài | LMS, account, khóa học trả phí |
| Thử người học | Nhánh Tôi chưa biết; rời/quay lại dịch vụ ngoài; cách ghi mốc/điều kiện/trợ giúp | Chuẩn bị máy hộ rồi tính là tự hoàn thành |
| Mở thử A | Luồng cài và kết quả thật, lỗi lặp đã sửa; một kênh và giới hạn hỗ trợ | Collector/Gemini phải chạy xong mới được mở |
| Bật B | Thêm ca hướng dẫn UI vào benchmark; nguồn chính thức; công suất hỗ trợ đã đo | Đổi kiến trúc đã chốt hoặc bỏ kiểm chứng của người |

Đây là cải tiến tập trung vào đường đi hiện tại, không thêm một danh sách tính năng
độc lập vào MVP. Các thay đổi chưa được tự động đưa vào plan; chờ quyết định cập nhật.

## 6. Phương án triển khai gọn đề xuất

**Lượt 1 — một kết quả:** mô tả việc đầu tiên, chuẩn bị, cài/kiểm tra và đầu ra mẫu;
liệt kê toàn bộ phụ thuộc. Công cụ, OS và kết quả vẫn là lựa chọn còn mở, không hỏi lại
phân khúc đã chốt. Loại phương án phải học quá nhiều kiến thức mới cùng lúc.

**Lượt 2 — một hành trình:** prototype bốn màn hình nhưng trọng tâm là trang chủ và
hướng dẫn; có nhánh lỗi/quay lại. Quan sát vài người chưa cài, tìm lỗi lớn, sửa và thử
lại. Chưa gọi đây là chứng minh thị trường hoặc đạt UX.

**Lượt 3 — một website mở thử:** xây đủ WordPress/theme/plugin cho nội dung trên, kiểm
thử staging/backup/restore, rồi dùng kênh đã chọn đưa độc giả vào đúng bài.

**Lượt 4 — tự động hóa có điều kiện:** Gemini/collector làm giảm công việc đã đo, tạo
khám phá mới dẫn tới lộ trình phù hợp; không ép người nhập môn bắt đầu từ repo hot.

## 7. Các điều không thể kết luận từ bản kế hoạch

- Không thể khẳng định người mới thích bài làm website hơn bài tài liệu trước khi thử.
- Không thể khẳng định công cụ nào tốt nhất/rẻ nhất/dễ cài nhất cho toàn bộ nhóm.
- Không thể khẳng định thiết kế đẹp, dễ dùng hoặc đạt accessibility khi chưa có UI thật.
- Không thể chốt thời gian, tỷ lệ hoàn thành, doanh thu hoặc chi phí hỗ trợ chưa đo.
- Không thể coi bước kết nối Git/Plesk đã xong là toàn website/nội dung được xây xong.

Quyết định phân khúc người mới là của chủ website và được giữ; các phép thử nhằm tìm
cách phục vụ nhóm đó hiệu quả, không tự dùng phản biện để đổi nhóm người dùng.

## 8. Tài liệu tham chiếu

[R1] W3C — Use Clear Step-by-step Instructions:
https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p07-step-instructions/

[R2] W3C — Make Each Step Clear:
https://www.w3.org/WAI/WCAG2/supplemental/patterns/o1p04-clear-steps/

[R3] WordPress — Metadata in block.json:
https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/

Đây là nguồn cho nguyên tắc hướng dẫn và khả năng kỹ thuật cụ thể. Các quyết định
sản phẩm, thứ bậc đề xuất và phép thử là suy luận thiết kế áp dụng cho dự án, không
phải kết quả thực nghiệm của website. Tài liệu W3C ở đây là hướng dẫn bổ sung, không
phải thay thế yêu cầu WCAG hoặc chứng nhận tuân thủ.
