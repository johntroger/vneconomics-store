# Đánh giá kế hoạch website phiên bản 1.9

Ngày: 19/10/2026. Đánh giá docs/website-build-plan.vi.md bản 1.9, theo năm góc nhìn
AI, vibe coding, kiến trúc, UX e-commerce và content marketing. Có đọc phản biện độc
lập; chưa kiểm thử website, chưa nghiên cứu thị trường hoặc xác nhận lại hosting.
Báo cáo này không sửa plan gốc và không tự triển khai các khuyến nghị.

## 1. Kết luận và mức sẵn sàng

Bản 1.9 đã giải quyết phần lớn thiếu sót của bản 1.8. Đủ để bắt đầu A0/A1: nội dung
mẫu và prototype có giả thuyết rõ. Chưa đủ để hứa lịch/chi phí phát hành hoặc tuyên bố
người mới sẽ thành công; các bằng chứng này phải thu trong bước thực hiện.

Không đề xuất thêm module lớn hoặc vòng mở rộng kế hoạch. Điểm nghẽn chính đã chuyển
từ thiếu ý tưởng sang quyết định và kiểm chứng: nhiệm vụ đầu tiên, công cụ/OS, nguồn
lực, nội dung thật, hosting và người dùng thử. Việc đã có mục mô tả trong plan không
đồng nghĩa tính năng đã được xây hoặc kiểm thử.

Giữ các quyết định miễn phí, beginner, e-commerce có danh mục/sản phẩm, CTA trực tiếp
repo, BYOK tùy chọn, A/B/U tách biệt. Không lấy số sao, số trang hoặc tốc độ tạo draft
làm bằng chứng hiệu quả. Không chấm điểm tổng quan kiểu 8/10 khi thiếu dữ liệu thực.

## 2. Đánh giá theo chuyên môn

| Góc nhìn | Điểm đã tốt ở 1.9 | Rủi ro/giới hạn hiện tại | Hành động phù hợp |
|---|---|---|---|
| AI | Hai tác vụ có ngữ cảnh; evidence, benchmark, duyệt người; key tách; đo công sửa | Chưa có benchmark thực, model/budget và lợi ích bổ sung chưa kiểm chứng | Một tập nguồn đại diện, pipeline thủ công làm mốc so; U thử độc lập với A/B |
| Vibe coding | Ghim phiên bản, môi trường, checklist, sửa đổi/khôi phục, dependency của bài | Nhiệm vụ/tool/OS vẫn mở; không thể biết bài phù hợp trước khi thử từ máy mới | Một nhiệm vụ ít dependency, bài thật và đầu ra quan sát được; không thêm nhiều agent/OS |
| Kiến trúc | Plugin sở hữu nghiệp vụ, theme hiển thị, collector ngoài request; A nhập tay | Một lỗi mô hình trạng thái và các hợp đồng publish/cache/deploy cần làm rõ | Chốt vài hợp đồng nhỏ và ca nghiệm thu, giữ stack hiện tại |
| UX e-commerce | Luồng thẻ/chi tiết/nguồn rõ; lọc/URL/mobile; nhãn điều kiện; search tách phạm vi | Chưa có prototype để biết người mới hiểu taxonomy/CTA hay bị quá nhiều nhãn | Thử chọn tài nguyên và bước tiếp bằng nội dung thật; giữ quyền mở repo trực tiếp |
| Content marketing | Có cụm nội dung, một kênh, nguồn, lịch sử kiểm chứng và đo theo hành trình | Kênh/công suất chưa chốt; chưa có dữ liệu lợi thế so với nguồn gốc/video/AI | Thử một cụm có kết quả, đóng vòng phản hồi rồi mới tăng lượng bài |

## 3. Phần đã được xử lý, không nên tiếp tục ghi là thiếu

- Mốc A không đợi collector hoặc BYOK; module gallery/FAQ/demo có điều kiện, không
  ép sản xuất nội dung giả; không còn khóa học trả phí trong roadmap.
- Độ phổ biến, khả năng bắt đầu và validation là ba khái niệm riêng.
- GuideRevision/GuideValidation không bắt buộc phải gắn repo/agent; có quan hệ phụ thuộc.
- Có search tài nguyên và search hướng dẫn/sửa lỗi với phạm vi rõ.
- Có hợp đồng field A, bảng ưu tiên trạng thái và backlog theo vai trò.
- Có đo AI với mốc thủ công/nội dung tĩnh, xử lý bí mật/input/trùng request/cancel.
- Có cụm marketing, quyền kênh và chế độ giảm tải vận hành.

Các điểm chưa chốt ở mục 16 là quyết định còn mở đã được ghi nhận, không phải lỗi tài
liệu hoặc lý do phải dừng mọi khảo sát/prototype. Có thể dùng giả thuyết có nhãn để
thử; không biến sự im lặng thành chốt nhiệm vụ hoặc công cụ.

## 4. Các điểm còn cần cải tiến cụ thể

### 4.1. Nhỏ nhưng cần sửa: trạng thái nguồn gộp hai thuộc tính khác nhau

Vị trí: 9.3. source_status gồm available/unknown/unavailable/archived, trong khi một
repo archived vẫn có thể unavailable. Gộp vào một enum làm mất thông tin hoặc buộc
UI đoán. Đây là một khiếm khuyết mô hình nhỏ, không phải lý do đổi kiến trúc.

Đề xuất lưu source_access_status riêng với maintenance_status hoặc archived boolean
có ngày/nguồn. Hàm suy trạng thái nhận cả hai; nghiệm thu archived + inaccessible và
archived + review_needed. Cảnh báo truy cập, duy trì và kiểm chứng có thể cùng tồn tại.

### 4.2. Làm rõ nơi quyết định trạng thái và mapping WordPress

Vị trí: 9.3. Dùng chung hàm suy trạng thái giữa PHP/theme/Node/AI chưa nói rõ thẩm quyền.
Đề xuất plugin WordPress là nơi quyết định trạng thái hiển thị chuẩn; API trả badge,
cảnh báo và loại CTA đã suy ra. Collector gửi dữ kiện theo quyền, model không tự quyết
định nhãn. Fixture dùng cùng bảng tình huống cho template/API và ngữ cảnh U.

publication_status đang là tên đề xuất. Cần ánh xạ vào post_status thực tế của WordPress,
nhất là hidden; không lưu hai nguồn sự thật cập nhật độc lập. WordPress có trạng thái
publish, draft, pending, private... [R1]. Không coi published/hidden của plan là các
giá trị core sẵn có. Chọn mapping trong thiết kế dữ liệu A, không cần thêm workflow engine.

### 4.3. Quy trình bản sửa của sản phẩm đang công khai

Vị trí: 8–9, 11.2. Plan đã yêu cầu giữ bản duyệt và tạo bản sửa; thiếu quy tắc khi
hai bản cùng tồn tại và biên tập sửa tay trong lúc draft AI đang chờ.

Đề xuất xác định approved_revision và proposed_revision gắn resource ID; bản nháp
không sửa nội dung đang công khai hoặc đổi bài gốc thành draft. Bản sửa lưu revision
nền; nếu bài đã thay đổi sau đó thì yêu cầu đối chiếu trước áp dụng, không ghi đè.
Preview xem được thẻ/chi tiết theo bản sửa; public API chỉ trả bản duyệt cùng cảnh
báo vận hành. A có thể dùng quy trình thủ công ít bước; hợp đồng này phải rõ trước B.
Không nhân thành hai sản phẩm công khai hoặc URL SEO trùng nhau.

### 4.4. Cảnh báo đúng ở database nhưng cache có thể vẫn hiển thị bản cũ

Vị trí: 7.5, 9.2–9.3, 11.2. Plan kiểm soát cache cho BYOK nhưng chưa nêu hợp đồng cập
nhật cache công khai khi nguồn/khuyến nghị/guide thay đổi.

Trước triển khai xác định các tầng cache thực sự có trên hosting; không giả định có
CDN/plugin cache. Khi cảnh báo quan trọng đổi, làm mới/invalidate các view liên quan:
chi tiết, thẻ/trang chủ/danh mục, API và bài phụ thuộc. A có thể purge thủ công được
kiểm chứng; B tự động theo cùng rule. Có TTL/bypass hoặc cảnh báo vận hành khi purge
thất bại, theo cấu hình thực tế. Thử ở trạng thái đã cache để tránh nghiệm thu nhầm.
Không cần cache platform mới cho 10 tài nguyên; đây là tính nhất quán của hệ đang dùng.

### 4.5. Deploy plugin trước theme cần cổng xác nhận, không chỉ thứ tự push

Vị trí: 13. Plan đã nhận biết Plesk không nguyên tử và yêu cầu tương thích ngược.
Làm rõ: cập nhật payload plugin -> đợi Plesk hoàn tất -> xác nhận phiên bản/schema
và smoke check -> mới cập nhật payload theme -> đợi/xác nhận tiếp. Thứ tự cập nhật
hai Git ref không bảo đảm thứ tự hoàn tất deploy. Khi thất bại dừng bước sau và
khôi phục cặp tương thích đã xác nhận. Thử ca chậm/lỗi một gói trên staging.
Đây là bổ sung cổng nghiệm thu, không phải kết luận thiết kế hiện tại đã sai hoàn toàn.

## 5. Cải tiến cách thực thi, không thêm phạm vi sản phẩm

### 5.1. Khóa bản phạm vi A trước khi nhân nội dung

Dùng plan 1.9 làm tài liệu tham chiếu; tạo một trang brief thực thi chỉ ra phải làm,
chưa làm, phụ thuộc, người phụ trách và bằng chứng xong. Không chép thêm toàn bộ plan
sang nhiều tài liệu. Gán phiên bản phạm vi; yêu cầu mới chỉ vào A khi sửa lỗi chặn hoặc
có bằng chứng cần thiết, còn lại xếp sau. Đây là kỷ luật thực hiện, không bỏ cấu trúc
e-commerce hay các yêu cầu chất lượng đã chốt.

### 5.2. Đặt điều kiện đi tiếp và dừng trước thử

Plan đã yêu cầu ngưỡng trước thử; bước tiếp là điền các ngưỡng thực tế sau nội dung
mẫu, không thêm một hệ KPI nữa. Ghi rõ ai thử, nhiệm vụ, được trợ giúp thế nào, đầu ra
kỳ vọng, lỗi chặn, giới hạn công/tiền và quyết định khi không đạt. Tách tìm/chọn,
chuẩn bị/thực hành, chất lượng AI và hiệu quả phân phối; không gộp thành một tỷ lệ
conversion. Chưa có phép đo thì không hứa mức hoàn thành hoặc lượng traffic.

### 5.3. Nội dung và marketing xuất phát từ câu hỏi thật

Cụm 15.3 đã có; cần dùng quan sát người mới để chọn tiêu đề, thuật ngữ và bài lỗi,
không chỉ phân tích topic GitHub. Một bản tóm tắt sản phẩm trả lời việc làm được,
điều kiện và lý do chọn; kết quả thực hành là bằng chứng giới thiệu. Chọn một kênh
có quyền sử dụng và lịch hỏi phản hồi khi có người phụ trách, không tự đăng/gửi.
Định kỳ hỏi người dùng website đã bổ sung gì so với cách họ đang tìm tài nguyên;
chưa có dữ liệu thì không công bố lợi thế thị trường đã chứng minh.

### 5.4. Không cần thêm AI vào mọi thao tác

Tìm/lọc/sắp xếp/nhãn nên dựa dữ liệu biên tập. AI làm đúng hai tác vụ và pipeline
đã chọn; chưa cần agent tự thao tác máy, recommender cá nhân, semantic search hoặc
RAG lớn. Structured output hỗ trợ định dạng, không bảo đảm nội dung đúng [R2].
Giữ bước kiểm tra nguồn và benchmark thật; không dùng thêm model để thay bằng chứng.

## 6. Thứ tự đề xuất và điều kiện mở rộng

1. Chốt brief nhiệm vụ/tool/OS, khảo sát hosting và giờ/ngân sách; có thể nghiên cứu song song.
2. Một sản phẩm + bài thực hành mẫu; đo công, chạy từ môi trường mới và thử thay đổi.
3. Chốt schema/trạng thái/bản sửa/cache ở mức A; prototype bốn template bằng nội dung thật.
4. Thử người mới, sửa lỗi chặn; khóa scope A và ước lượng từ công đã đo.
5. Xây/staging/diễn tập backup/deploy; mở thử cùng một cụm nội dung/kênh đã được phép.
6. Chỉ mở B khi giảm công biên tập trong giới hạn công suất; U khi hữu ích và vượt
   cổng dữ liệu/key/chi phí. Chưa có bằng chứng thì tiếp tục A hoặc thu hẹp.

Khuyến nghị quan trọng nhất là chuyển sang kiểm chứng bằng mẫu thật sau vài chỉnh
sửa nhỏ nêu trên. Một vòng review văn bản nữa không thay thế bằng chứng từ người dùng.

## 7. Phương pháp, giới hạn và nguồn

Đọc plan 1.9 và phản biện độc lập; kiểm tra tài liệu WordPress/Gemini chính thức.
Không khảo sát đối thủ đầy đủ, không chạy test mã hoặc API có phí, không đổi production.
Các quyết định nguồn lực/nhiệm vụ/kênh chưa chốt vẫn phải do người dùng quyết định;
nhận xét về giá trị sản phẩm là giả thuyết chuyên môn cần kiểm chứng.

[R1] WordPress REST API — Posts, status:
https://developer.wordpress.org/rest-api/reference/posts/

[R2] Gemini — Structured outputs, kiểm tra giá trị:
https://ai.google.dev/gemini-api/docs/structured-output
