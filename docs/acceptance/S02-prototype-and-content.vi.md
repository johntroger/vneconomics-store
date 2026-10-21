# Nghiệm thu S02 — Nội dung mẫu và prototype

Hoàn tất báo cáo: 21/10/2026 (Asia/Saigon). Mã và browser test thực hiện ngày 19/10.
Quyền: chủ dự án yêu cầu bắt đầu S02, chọn dịch vụ chụp ảnh sản phẩm hư cấu; ngày
21/10 yêu cầu tiếp tục hoàn tất phần bị gián đoạn. Nhánh codex/s02-catalog-prototype,
base d786ebd (S01). Kết quả: kỹ thuật PASS, CHỜ CHỦ DỰ ÁN DUYỆT UI/NỘI DUNG.
Chưa bắt đầu S03; chưa deploy hoặc thử nghiệm với nhóm người mới.

## Đầu ra và phạm vi

- prototype/s02: 4 template chủ/danh mục/chi tiết/hướng dẫn; 6 trang chi tiết cùng
  template và một trang đầu ra bài học, tổng 10 trang HTML.
- Mộc Studio là dịch vụ chụp ảnh sản phẩm hư cấu, hình sản phẩm là minh họa CSS.
- Có 6 cover SVG tự viết, không dùng ảnh chạy thử/logo tác giả hoặc review/sao giả.
- Tương tác tĩnh: menu, tìm/lọc 6 mục, URL/Back/reset, copy brief và checklist.
- Script build/server/test và 3 npm script mới, đều đi qua run-clean; không cài thêm
  dependency. Không thay WordPress runtime/run-clean đã nghiệm thu ở S01.
- Nguồn thật, commit, archived/license quan sát 19/10 ở S02/source-observations.json.
  Không cài/thực thi repo; thông tin chưa rõ giữ nguyên, không gắn nhãn Đã thử.

Thiết kế/nội dung: ../content-samples/S02-design-and-content.vi.md và
../content-samples/S02-landing-page-brief.vi.md. Tên VibeLab Việt còn là tên làm việc.

## Kiểm thử và bằng chứng

npm run prototype:build ngày 19/10: PASS, wrapper cleanup thành công.
npm run test:prototype dùng Playwright Node 1.62.1 có sẵn và Microsoft Edge headless.
Module Python Playwright không có nên dùng thư viện Node hiện có, không cài thêm.

Lần đầu: desktop/tablet PASS, mobile dừng ở kiểm ảnh vì loading=lazy chưa tải ảnh
ngoài màn hình. Sửa harness để cuộn và decode ảnh trước kiểm tra; không bỏ assert.
Browser/server vẫn đóng trong finally, wrapper dọn run cache sau lần thất bại.

Lần hai ngày 19/10: exit 0, toàn bộ kiểm thử PASS. Kết quả lưu ở
S02/browser-results.json; ngày 21/10 đọc lại bằng chứng và không ghi thành lần test mới.
Không có thay đổi mã prototype kể từ lần chạy đạt; lượt tiếp tục hoàn thiện tài liệu,
Git và preview, không chạy lại test chỉ để đổi ngày báo cáo.

| Kiểm tra | Kết quả |
|---|---|
| 10 trang tại 1440/834/390/360px | 40 lượt kiểm layout: HTTP 200, 1 H1, không tràn ngang, ảnh hỏng hoặc ID trùng |
| Thẻ/chi tiết/nguồn | Ảnh/tên mở đúng chi tiết; CTA đúng repo/path, target/rel đúng |
| Hành trình | Home -> detail -> guide -> sample -> contact anchor -> guide |
| Lọc tĩnh | Loại, từ không dấu, rỗng, URL, Back và reset PASS |
| Nguồn | Pico có cảnh báo archived, skill có path riêng; license chưa rõ không giả MIT |
| Hướng dẫn | Copy clipboard và checklist 1/5 PASS, ghi rõ tự đánh dấu |
| Menu mobile | Mở/đóng, Escape và trả focus PASS |
| Link/anchor | 10 trang liên kết, các file và anchor nội bộ hợp lệ |
| Lỗi và mạng | 0 console/page error; 0 request ngoài từ prototype trong test |
| Static server | Không phục vụ package.json bên ngoài thư mục prototype |

10 PNG nghiệm thu được giữ: index/category/resource-web-basics/guide/sample ở
mobile và desktop. Đã xem trực quan home desktop/mobile và resource desktop.
Không tự xác nhận WCAG toàn diện hoặc mọi trình duyệt từ các kiểm tra cơ bản này.

## Cleanup, dữ liệu và preview

Sau test ngày 19/10 đã đối chiếu hash DB/config với S01, không đổi. tmp chỉ còn
thư mục tests rỗng vốn có; lock đã gỡ và tiến trình test đã kết thúc. Không tạo dữ
liệu nội dung trong WordPress, không xóa DB local/dependency/ảnh nghiệm thu.
Ngày 21/10 kiểm tra lại trước mở preview. Preview dev phục vụ người dùng là tiến
trình có chủ đích, không phải test treo; cần dừng trước test/fixture bước tiếp để
run-clean nhả lock và dọn cache phiên dev. HTML/ảnh/báo cáo là sản phẩm cần giữ.

Lần ghi báo cáo ngày 19/10 không được thực thi vì auto-review hết hạn mức, không
phải kết luận thao tác không an toàn. Ngày 21/10 tiếp tục bằng quy trình phê duyệt
bình thường; không dùng đường khác để bỏ qua hạn chế.

## Công đo được, giới hạn và bước tiếp

Mốc Git 19/10 14:01:26 +07:00 tới postflight 14:14:33: 13 phút 07 giây lịch, gồm
agent và chờ công cụ; không là công người biên tập hoặc toàn phiên nghiên cứu.
Không dùng thời gian này để hứa công suất bài hoặc lịch launch. Giờ/tuần còn mở.

Chưa kiểm chứng: tài khoản/cài Codex từ máy người mới, gọi prompt trả phí, nhóm
5–8 người, plugin/backend/search nghiệp vụ và hosting. Bài ghi rõ các giới hạn;
không lấy checkbox hoặc browser test thay kết quả người học.

Chờ chủ dự án xem và duyệt giao diện/nội dung; góp ý được xử lý trong S02. Chỉ khi
được đồng ý rõ ràng mới bắt đầu S03 — plugin dữ liệu và nhập tay. S03 chưa được phép.
