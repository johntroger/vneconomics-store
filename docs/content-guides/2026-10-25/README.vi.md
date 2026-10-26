# Bộ ba bài thực hành cho người mới

Ngày 25/10/2026. Chủ website yêu cầu ba bài chính tương ứng Codex (đã có), Claude Code và Antigravity. Đã hoàn thành hai bản thảo mới và bản xem trước local; **chưa thay đổi production, chưa triển khai theme/plugin**.

Cập nhật sau khi chủ duyệt bước tích hợp: **WordPress local đạt 205 kiểm tra**, theme ứng viên 0.7.2 có ba bài chính và tài liệu bổ trợ riêng. [Nghiệm thu local](../../acceptance/G03-local-wordpress.vi.md). Dữ liệu validation trong fixture là QA để kiểm giao diện, không dùng làm bản ghi chứng nhận trên website thật.

| Bài chính | Nhánh hướng dẫn | Tình trạng |
|---|---|---|
| [Mộc Studio với Codex](https://store.vneconomics.com/huong-dan/lam-landing-page-moc-studio-voi-codex-tren-windows/) | Windows native, ứng dụng desktop | Bài hiện có, nguồn gốc và URL giữ nguyên |
| [Mộc Studio với Claude Code](claude-code.html) | Tab Code trong Claude desktop, Local Windows, Manual theo tài liệu | Đạt thử đầu ra/sửa/khôi phục có chủ hỗ trợ; chưa chứng nhận cài/đăng nhập mới hoặc review mode |
| [Mộc Studio với Antigravity IDE](antigravity.html) | IDE trên Windows, bảng Agent, Review-driven development theo tài liệu | Đạt thử đầu ra/sửa/khôi phục có chủ hỗ trợ; chưa chứng nhận cài/đăng nhập mới hoặc review mode |

[Mở bản xem trước đủ nội dung](preview.html). Trang này có đúng ba lựa chọn chính, hai bài mới nằm ngay bên dưới. Các bài chuẩn bị, sửa lỗi và HTML/CSS hiện có tiếp tục là tài liệu bổ trợ; không xóa hoặc đổi URL của chúng.

## Cách học thống nhất

Chọn một công cụ → kiểm tra quyền tài khoản → tạo thư mục bài tập riêng → duyệt brief → tạo index.html/style.css → mở trang → thử CTA/màn hình hẹp → giữ bản mốc → sửa h1 → khôi phục → tự ghi nhận checklist.

Cả ba dùng cùng dịch vụ chụp ảnh hư cấu Mộc Studio để người mới so sánh quy trình. Không yêu cầu framework/database hoặc website thật. Hai bài mới có hướng dẫn riêng cho đúng giao diện sản phẩm, giải thích nơi dán lệnh và nơi dán prompt, dấu hiệu đạt và cách sửa lỗi. Không hứa mọi công cụ/hạn mức miễn phí.

## Kết quả kiểm tra local

`local-checks.json`: **43 kiểm tra đạt**.

- Hai bản thảo riêng, trạng thái draft, nội dung có SHA-256; không ghi validation chạy công cụ.
- Chạy bốn khối lệnh của từng bài trên Windows PowerShell 5.1 và PowerShell 7 trong fixture riêng. Tạo thư mục, kiểm file, giữ mốc, sửa tiêu đề và khôi phục byte đúng. Thư mục hoặc bản mốc đã tồn tại bị từ chối; bản mốc không bị ghi đè.
- Kiểm bản xem trước bằng Edge headless tại chiều rộng 1280/390/320px: ba lựa chọn chính, điều hướng hai bài, không tràn ngang, không lỗi JavaScript, không request ngoài. Ảnh `preview-1280.png`, `preview-390.png`, `preview-320.png` giữ làm bằng chứng; đã xem ảnh 390px.
- Nguồn bài Codex, DB/config local thật giữ nguyên theo hash; fixture/cache các lượt đã được dọn qua run-clean.
- Hai lượt đầu dừng ở bước mở browser vì Chromium bundled chưa có trên máy. Đã dùng channel Edge có sẵn theo cách dự án đang kiểm thử; lượt cuối đạt toàn bộ 43 điểm, không cài thêm browser.

**Giới hạn của runner preview:** fixture thao tác file dùng đầu ra Codex đã lưu trong examples/s10-moc-studio; không tự gọi thêm AI. Các lượt thử đầu ra thực có chủ hỗ trợ được ghi riêng dưới đây. Bản xem trước standalone không thay nghiệm thu WordPress hoặc cổng hiển thị mã.

## Lượt thử chức năng có chủ hỗ trợ

- [Antigravity](antigravity-functional-trial.vi.md): đầu ra đầu tiên 80/88 điểm, phát hiện sticky header che tiêu đề; sau sửa CSS đạt 88/88. Sửa h1 đạt 88/88, khôi phục đúng byte qua 15 kiểm tra, hậu kiểm 88/88. Có mã gốc, bản sửa và ảnh; metadata Antigravity.exe 2.26.0.0, không suy ra model hoặc chế độ duyệt.
- [Claude Code](claude-functional-trial.vi.md): đầu ra ban đầu 40/40, sửa h1 40/40, khôi phục qua 15 kiểm tra, hậu kiểm 40/40. Chủ xác nhận thao tác đổi h1 bằng Claude Code; Codex kiểm file và khôi phục. Chưa ghi phiên bản/model/review mode.
- Cả hai thư mục examples hiện đã về tiêu đề gốc, có checkpoint-v1 thật; giữ bản đã đổi tiêu đề trong evidence. Không xóa các bản mốc như fixture có thể tái tạo.
- Hai bản thảo và preview được cập nhật phạm vi thử thực tế. Metadata functionalTrial tách khỏi wordpressValidationRecorded; không tự ghi chứng nhận vào CMS hoặc khẳng định đã thử mọi bước cài/đăng nhập.

## Nguồn đã đối chiếu

- [Claude Code desktop quickstart](https://code.claude.com/docs/en/desktop-quickstart): cài desktop, tab Code, quyền gói, Local/folder, không cần CLI/Node cho nhánh này.
- [Claude Code desktop reference](https://code.claude.com/docs/en/desktop): Manual, diff và phân biệt Local/WSL.
- [Claude Academy — Code](https://academy.claude.com/code): học thêm theo đúng giao diện. Catalog chính thức đã đọc, còn hiệu lực ngày 25/10; không áp bài terminal như thể là bài desktop.
- [Google Codelab Antigravity IDE](https://codelabs.developers.google.com/getting-started-agy-ide): cài IDE, đăng nhập Google, Review-driven development, Agent, plan/diff/walkthrough. Bản IDE được chọn rõ, không trộn đường dẫn CLI/SDK.
- [Google Antigravity Artifacts](https://antigravity.google/docs/artifacts/): vai trò tài liệu trao đổi giữa agent và người dùng.
- [Codex Windows](https://learn.chatgpt.com/docs/windows/windows-app), [quickstart](https://learn.chatgpt.com/docs/quickstart): rà nguồn bài hiện có; không sửa nội dung lịch sử S10/S13.

Phần thực hành Mộc Studio do website biên soạn, AI hỗ trợ; không sao chép nguyên hướng dẫn nhà cung cấp.

## Phần cần làm trước khi lên website

1. Thử đầu ra/sửa/khôi phục có chủ hỗ trợ đã hoàn tất trong phạm vi ghi ở trên. Nếu bổ sung lời khẳng định về cài/đăng nhập hoặc một model/review mode cụ thể, phải kiểm chứng thêm đúng phần đó; không mua gói/nạp tiền hoặc gọi API tính phí riêng ngoài quyền đã cấp.
2. Đã kiểm tra WordPress riêng: mục lục, checklist, copy đủ byte, trạng thái kiểm chứng và trường hợp không đủ điều kiện đạt. `drafts.json` vẫn chưa phải payload nhập production hoàn chỉnh: chưa gán category hosting và chưa có bản ghi validation thật trên CMS.
3. Đã tích hợp local mục Hướng dẫn với đúng ba bài chính, tài liệu bổ trợ riêng, giữ URL/tìm kiếm. 14 URL legacy, private/password và snapshot public đã kiểm hồi quy. Theme ứng viên chưa triển khai hosting.
4. Chốt payload/ref và đích trước khi phát hành theo AGENTS.md và implementation-plan-gated.vi.md. Quyền xuất bản 100 bài GitHub trước đó đã hoàn thành, không dùng nó làm quyền phát hành theme mới hoặc ghi chứng nhận thử công cụ mới.

Website đang dùng derived.commands_allowed để ẩn toàn bộ khối pre, gồm cả prompt, khi chưa đủ kiểm chứng. Giữ cổng đó; không đổi prompt thành prose/blockquote để né. Bài Codex đã có cũng cần kiểm lại trạng thái hiển thị khi nghiệm thu bộ ba, không suy từ bằng chứng lịch sử rằng production hiện đã mở khối mã.

## Tái tạo

Chạy nối tiếp, không chạy cùng tác vụ tạo fixture khác:

```text
node scripts/run-clean.mjs script scripts/prepare-beginner-guides.mjs
node scripts/run-clean.mjs script scripts/test-beginner-guides.mjs
npm run test:beginner-guides
```

Các file trong thư mục này là sản phẩm và bằng chứng cần giữ. Không đăng bài hoặc cài phần mềm chỉ để kiểm tra cleanup.
