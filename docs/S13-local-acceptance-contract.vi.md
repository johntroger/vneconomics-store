# S13 — Hợp đồng nghiệm thu local A

Phạm vi đã duyệt: tích hợp các module S03–S12, nội dung mẫu, SEO/accessibility tối thiểu, hiệu năng lab và bản website local cho chủ dự án thử. Không phát triển BYOK, discovery Gemini, tài khoản người đọc hay deploy hosting.

## Bản nghiệm thu

- Sáu tài nguyên lấy từ mẫu nguồn S02; không làm mới repo, không biến thông tin chưa biết thành “miễn phí”, “tương thích” hoặc “đã chạy”.
- Một cụm năm nội dung: bài Mộc Studio MOC-WIN-1, chuẩn bị, ghi nhận lỗi, đọc HTML/CSS sau bài, bộ thực hành.
- Validation của bài chính dẫn bằng chứng replay S10 đã có, ghi rõ máy đã cài công cụ; không suy thành cài Windows sạch hoặc một phiên AI mới.
- Seed chạy một lần trên database riêng. Có marker thì trả manifest, không ghi đè bài người thử đã sửa. Có thư viện không rõ nguồn gốc thì từ chối seed; lỗi giữa chừng phải giữ dữ liệu để kiểm tra, không tự xóa.
- `npm run dev:s13`: loopback 9430, database .local/s13-site được giữ làm bản thử hiện tại, blog_public=0/noindex, không gửi email. .local/site và cấu hình gốc được bảo vệ bằng hash.
- .local/s13-admin.json là tài khoản ngẫu nhiên chỉ dùng local, nằm ngoài Git. Không đưa file này vào bằng chứng hoặc chia sẻ.

## SEO

Theme dùng tiếng Việt, title riêng cho chi tiết/danh mục/trợ giúp, một canonical ở trang chính tắc, excerpt làm description.
Tìm kiếm/bộ lọc và taxonomy nhu cầu/công cụ noindex, không gán canonical về một trang có nội dung khác. Báo lỗi/preview/lỗi giữ noindex.
Sitemap chỉ ba loại nội dung thư viện đã publish và có snapshot được duyệt, cùng danh mục liên quan. Không đưa tài khoản, trang cài mặc định, draft/private hoặc mục chưa có snapshot duyệt vào sitemap.
Sitemap được kiểm tra trên fixture loopback bật index tạm thời; preview của chủ dự án vẫn noindex.
Không thêm Product/Offer/Review/Rating schema, giá, sao hoặc số liệu cộng đồng giả.

## Hiệu năng và tính nhất quán

Ngân sách lab: LCP ≤2500ms, CLS ≤0.1. Ghi riêng từng lượt trong ba lượt/trang; không che lượt chậm bằng trung bình. Profile: Edge headless mobile390x844, CPU4x, RTT40ms, tải1.6Mbps, upload750Kbps, cold browser cache. Đây là mô phỏng trên PHP/WASM/SQLite local, không phải dữ liệu người dùng thật hoặc cam kết hosting.
Getter công khai lấy taxonomy IDs từ snapshot duyệt khi trường đã có, tránh ba truy vấn raw sẽ bị ghi đè. Nhánh edit/legacy vẫn đọc raw khi cần. Không thêm cache projection qua request, không bỏ quyền, revision hay resolver trạng thái.
Menu và bộ lọc khởi tạo bằng mã bundled inline ngay sau controls, trước nội dung bị reflow, tránh đợi script footer rồi mới thu nav/form gây CLS. Khi JS hoặc CSP chặn script, navigation/form native vẫn hiện. Hồi quy CSP chặn toàn bộ script thay vì chỉ chặn đường dẫn file JS đã chuyển inline.
Theme dùng emoji hệ điều hành, bỏ script/styles emoji WordPress không cần thiết. Không bỏ chính sách no-store để đạt số đẹp.

## Kiểm thử và bằng chứng

`npm run test:acceptance`: bản tích hợp, hai CTA, mobile360/390, keyboard/noJS/checklist, heading/label/alt cơ bản, canonical/noindex/sitemap, hiệu năng.
Hồi quy riêng qua sáu lệnh test:acceptance-*-regression cho home/menu/fallback (S06), quyền/revision/state (S05), tìm kiếm/bộ lọc20truy vấn (S09), bài thực hành/hai PowerShell (S10), báo lỗi/hàng đợi riêng (S11), cache/503/phục hồi (S12).
Các lệnh tạo fixture chạy tuần tự qua run-clean, luôn đóng browser/database rồi dọn cả khi thất bại.
Mỗi bộ giữ hash runtime được copy vào fixture để đối chiếu source cuối. Không dùng kết quả cũ thay kết quả sau chỉnh mã.
Accessibility ở đây là kiểm tra tự động cơ bản và quan sát giao diện; không chứng nhận WCAG. Hosting/MySQL/CDN, field INP, tải thực và Windows cài mới chưa kiểm chứng.

## Chủ dự án thử và điều kiện dừng

Theo quyết định 22/10/2026, không bắt buộc tuyển người mới; chủ dự án trực tiếp thử theo [kịch bản](S13-owner-review.vi.md) và báo chỗ cần sửa.
Lỗi chặn tác vụ, budget lab không đạt hoặc hồi quy fail không được ghi PASS toàn bộ S13.
Chưa có phản hồi không phải phê duyệt giao diện/hành vi. Không tự chuyển S14 hoặc sửa nhánh main/release.

## Đối chiếu PHP native

Bổ sung trong S13 sau khi WASM không đạt LCP: chạy `npm run test:acceptance-native-performance` trên PHP8.3.36 NTSx64 riêng trong .local/php-8.3.36-nts-x64.
Nguồn [manifest PHP.net](https://downloads.php.net/~windows/releases/releases.json), archive php-8.3.36-nts-Win32-vs16-x64.zip, SHA256 `3c9242622c7402b47c38d2ec2ed779cef3a290fd6f2bde6c35f9c482699e7900`.
Không thay PATH/dịch vụ, không khởi động Docker. Binary/ZIP/source.json là dependency local được giữ, không commit hoặc deploy.

Runner copy chỉ core từ .local/site, loại database/wp-config gốc; tạo SQLite mới, chặn mail/HTTP ngoài, dùng đúng plugin/theme/content, rồi đóng server native trước cleanup.
Giữ LCP≤2500ms và CLS≤0.1, CPU4x, viewport390x844, RTT40ms, cold browser cache, ba lượt/trang, cửa sổ load+1500ms.
CDP dùng download209715.2B/s và upload96000B/s (các nhãn profile1.6/750 trong lượt WASM là đơn vị nhị phân của phép tính1024).
Không dùng trung bình, bỏ lượt đầu hay đổi no-store để đạt budget.

Lưu native-performance.json riêng và giữ WASM FAIL. Kết luận chỉ có giá trị trong runtime thực sự đạt; không suy native PASS thành WASM/hosting/MySQL/CDN PASS. Chủ dự án vẫn phải thử website và cho phép rõ ràng trước S14.
