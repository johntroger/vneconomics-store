# Backlog nội dung GitHub — 30 mục mới để nghiên cứu và tự duyệt

Ngày 25/10/2026. Chủ website chốt giới thiệu repo nhiều sao, mô tả và hướng dẫn người mới Việt Nam. Đây là đề bài, chưa phải nội dung đã duyệt/xuất bản. Sao là snapshot từ `github-candidates.json`; chưa có tốc độ tăng 7/30 ngày. Không gọi mọi repo là mã nguồn mở/miễn phí chỉ từ metadata.

Lô C1: R01–R10, G01–G03, B01 (14 mục). C2: R11–R20, G04–G08, B02 (16 mục). Mục không đạt chuyển chờ xử lý; không xuất bản cho đủ số. Nâng cấp 11 mục đang có được theo dõi riêng trong inventory, không tính là bài mới.

## 20 trang giới thiệu repo

| ID | Repo / sao đã quan sát | Đề bài tiếng Việt và đầu ra người đọc | Điều cần nghiên cứu trước duyệt |
|---|---|---|---|
| R01 | [microsoft/markitdown](https://github.com/microsoft/markitdown) · 191.987 | MarkItDown là gì? Đổi một tài liệu mẫu thành Markdown để làm việc với AI | Định dạng hỗ trợ, giới hạn chuyển đổi, Python/phụ thuộc, nội dung nào ra ngoài máy; không hứa giữ nguyên bố cục |
| R02 | [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) · 134.500 | Excalidraw: phác sơ đồ ý tưởng trước khi nhờ AI làm sản phẩm | Phân biệt app web với repo/self-host; lưu/xuất file và quyền riêng tư; sơ đồ ví dụ tiếng Việt |
| R03 | [anthropics/skills](https://github.com/anthropics/skills) · 183.533 | Kho Anthropic Skills có gì? Cách người mới đọc và chọn một skill | Phạm vi collection, license từng phần, công cụ/phiên bản và quyền; không gán sao collection cho skill con |
| R04 | [obra/superpowers](https://github.com/obra/superpowers) · 304.663 | Superpowers: hiểu quy trình làm việc với coding agent trước khi cài | Cách tích hợp theo công cụ, thao tác tự chạy, quyền và khả năng gỡ bỏ; không hứa agent luôn tạo mã đúng |
| R05 | [n8n-io/n8n](https://github.com/n8n-io/n8n) · 208.506 | n8n: workflow trực quan giúp làm gì cho người chưa biết code? | Cloud/self-host, điều khoản sử dụng, phí/API, credential; ví dụ dữ liệu giả không gửi email thật |
| R06 | [langgenius/dify](https://github.com/langgenius/dify) · 159.442 | Dify: phân biệt app AI, workflow và kho tài liệu | Provider key, phí, dữ liệu tài liệu, cloud/self-host; không cấu hình API trả phí của chủ để thử |
| R07 | [ollama/ollama](https://github.com/ollama/ollama) · 184.666 | Ollama: khi nào nên cân nhắc chạy model trên máy? | RAM/GPU/dung lượng cho model cụ thể, OS, bản quyền model, tải xuống; không hứa mọi máy chạy nhanh |
| R08 | [open-webui/open-webui](https://github.com/open-webui/open-webui) · 156.661 | Open WebUI khác model AI ở điểm nào? | Backend cần có, kết nối Ollama/API, quyền tài khoản, license/trademark và dữ liệu; không mở server public mặc định |
| R09 | [openai/codex](https://github.com/openai/codex) · 130.819 | Repo Codex: CLI dùng làm gì và khác hướng dẫn desktop hiện có thế nào? | Phân biệt CLI/desktop, đăng nhập/quota/OS, quyền đọc ghi; đối chiếu nguồn chính thức đúng sản phẩm |
| R10 | [f/prompts.chat](https://github.com/f/prompts.chat) · 174.415 | prompts.chat: tìm mẫu rồi sửa theo nhiệm vụ của bạn | Prompt ví dụ cụ thể, nguồn/quyền tái dùng, giới hạn; không coi prompt cộng đồng là bảo đảm kết quả |
| R11 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) · 108.098 | Gemini CLI: terminal agent cho ai và cần chuẩn bị gì? | OS, đăng nhập/chi phí, quyền file/network và cách dừng; không gọi API có phí trong bước nghiên cứu |
| R12 | [anthropics/claude-code](https://github.com/anthropics/claude-code) · 153.295 | Claude Code: đọc, sửa dự án bằng agent có những điều kiện gì? | Tài khoản/giấy phép, OS, quyền và kiểm tra thay đổi; không suy public repo = dùng công cụ không mất phí |
| R13 | [github/spec-kit](https://github.com/github/spec-kit) · 142.743 | Spec Kit: viết yêu cầu trước khi nhờ agent viết mã | Công cụ tương thích, yêu cầu thiết lập, độ khó; một ví dụ brief nhỏ, tránh bài trùng Superpowers |
| R14 | [FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) · 55.527 | Flowise: đọc một sơ đồ agent/workflow từ góc nhìn người mới | Phân biệt với Dify bằng ví dụ có nguồn, setup, tài khoản và API; không tạo bài so sánh suy diễn |
| R15 | [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) · 142.649 | ComfyUI: node/workflow tạo ảnh là gì, ai nên thử sau? | Phần cứng/model/license, nguồn custom node, dung lượng; gắn nâng cao, không đưa vào đường đầu tiên |
| R16 | [browser-use/browser-use](https://github.com/browser-use/browser-use) · 119.063 | Browser Use: hiểu tác vụ trình duyệt trước khi cho agent thao tác | Local/cloud, model/API, phiên đăng nhập và quyền tác vụ; demo chỉ trang giả, không submit/mua hàng thật |
| R17 | [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) · 70.204 | AI For Beginners: người mới nên đọc phần nào trước? | Mức nền cần có, lộ trình học, ngôn ngữ; phân biệt học thuật AI với sử dụng công cụ văn phòng |
| R18 | [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) · 91.762 | OpenHands: môi trường coding agent và giới hạn cho người mới | Docker/môi trường/API, quyền repo/network, chi phí; để nhóm đã có nền, không hứa “tự xây mọi app” |
| R19 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) · 110.232 | Agent Skills của Addy Osmani: chọn theo việc thay vì cài cả kho | Đọc từng skill, license, tương thích và quyền; phân biệt với collection Anthropic/Vercel; chọn một ví dụ khác hai skill đang có |
| R20 | [tt-a1i/archify](https://github.com/tt-a1i/archify) · 88.775 | Archify: từ mô tả hệ thống đến sơ đồ, cần hiểu gì trước? | Kiểm tra nguồn/cách chạy/đầu ra hiện hành, dữ liệu code đi đâu, công cụ hỗ trợ; không biến mô tả repo thành kết quả đã thử |

Các lựa chọn này ưu tiên phạm vi công việc và nguồn đang hiện hữu, chưa có điểm xếp hạng chất lượng. Sau đọc sâu có thể loại/thay ứng viên. Không lấy thứ tự bảng làm bảng xếp hạng GitHub.

## 8 hướng dẫn mới

| ID | Đề bài | Người học làm được gì | Nguồn / phụ thuộc và nghiệm thu |
|---|---|---|---|
| G01 | Đọc trang GitHub lần đầu: sao, README, release, license và repo archived | Tự quyết định có nên đọc/cài tiếp, phân biệt source public với miễn phí | GitHub Docs hiện hành + ví dụ repo có quyền; không cần đăng nhập, không cài tool; hiểu đúng sao collection |
| G02 | Vẽ brief sơ đồ tiếng Việt với Excalidraw | Tạo sơ đồ 5 nút, sửa nhãn, lưu và xuất một file | R02; thử đúng giao diện/phương thức lưu; ảnh đầu ra thật, chỉ dữ liệu hư cấu |
| G03 | Chuyển tài liệu mẫu thành Markdown bằng MarkItDown | Chuyển một file được hỗ trợ, đọc kết quả, nhận ra phần bị mất định dạng | R01 + G01; kiểm tra cài đặt trong môi trường được phép; không dùng tài liệu riêng; không hứa chuyển hoàn hảo |
| G04 | Từ prompt mẫu tới yêu cầu có thể tự kiểm tra | Biến một prompt chung thành đề bài cụ thể, đầu vào giả và checklist | R10; ghi rõ công cụ/điều kiện nếu thử AI; không bịa so sánh kết quả hoặc gọi API có phí chưa duyệt |
| G05 | Chọn và dùng một skill theo quyền cần cấp | Đọc SKILL.md, biết nó thay đổi gì, thêm/gỡ đúng cách | R03 hoặc R19 sau chọn skill cụ thể; môi trường thử được phép; không suy agent nào cũng tương thích |
| G06 | Workflow n8n đầu tiên với dữ liệu giả | Chạy một chuỗi biến đổi nhỏ, xem từng bước và kết quả | R05; chốt cách truy cập trước, không nối email/CRM thật, không tự đăng ký dịch vụ trả phí |
| G07 | Kiểm tra máy trước khi chọn model chạy với Ollama | Đối chiếu RAM/dung lượng/model, chạy thử nếu đủ điều kiện | R07; không tải model lớn tự động; license, size và quyền tải cần rõ; chưa đủ máy thì bài ở chờ thử |
| G08 | Giao việc nhỏ cho coding agent rồi đọc thay đổi | Yêu cầu một sửa đổi nhỏ, xem diff, kiểm tra và quay lại mốc | R09; tránh lặp toàn bài Mộc; phân biệt CLI/desktop, đúng OS, không dùng repo production |

## 2 bộ thực hành mới

| ID | Đề bài | Chuỗi bài | Điều kiện để được gọi hoàn chỉnh |
|---|---|---|---|
| B01 | Từ trang GitHub đến tài liệu Markdown đầu tiên | G01 → R01 → G03 → đối chiếu kết quả | Một file mẫu có quyền, guide thực sự làm được, giải thích thất thoát định dạng và bước tiếp |
| B02 | Từ ý tưởng tiếng Việt đến bản thử nhỏ | G02 → G04 → G08, liên kết bài Mộc hiện có khi phù hợp | Có sơ đồ/brief/kết quả/checkpoint; không bắt cài tất cả agent; dùng lại bài chuẩn thay nhân bản |

## Cách đưa ứng viên qua cổng tự duyệt

Mỗi đề bài có record: ID, repo_id/path, canonical URL, title/slug, nhu cầu, công cụ/OS, audience, source observations, claim evidence, revision, người/AI duyệt, trạng thái validation, review_due_at, phụ thuộc và lô xuất bản. Những trường chưa xác minh được giữ nguyên trạng thái chờ hoặc diễn đạt rõ ở lớp khám phá.

Nguồn mới được đọc lại ngay trước duyệt; snapshot sao hiện tại chỉ phục vụ kế hoạch. Hướng dẫn chưa chạy thử không được ghi Đã thử. Không tự đăng lô này lên production từ quyền được cấp cho việc rà soát.
