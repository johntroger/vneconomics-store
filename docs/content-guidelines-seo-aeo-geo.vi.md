# QUY CHUẨN BIÊN TẬP NỘI DUNG VIBELAB VIỆT (SEO - AEO - GEO - EEAT)
*Bộ nguyên tắc bất biến áp dụng cho toàn bộ bài viết / công cụ trên website `store.vneconomics.com`.*

---

## 1. Mục tiêu cốt lõi của nội dung
Nội dung trên **VibeLab Việt** (Vneconomics Store) không phục vụ mục đích pháp chế hay bài viết học thuật khô khan. Nội dung sinh ra nhằm phục vụ 2 nhóm độc giả:
1. **Con người (Đặc biệt là người mới - Beginners):** Đọc 10 giây phải hiểu: *Cái này là gì? Giúp giải quyết rắc rối gì? Tại sao nên dùng? Lấy ở đâu?*
2. **Cỗ máy tìm kiếm & Cỗ máy AI (SEO, AEO, GEO):** Cấu trúc bài viết phải rõ ràng, phân lớp ngữ nghĩa (Semantic HTML), có câu trả lời trực diện để Google Search, ChatGPT Search, Perplexity, Claude dễ dàng trích dẫn thành "Featured Snippet" và "Knowledge Source".

---

## 2. Bộ tiêu chuẩn "Triple-Optimization": SEO + AEO + GEO + EEAT

### 📌 SEO (Search Engine Optimization - Tối ưu tìm kiếm truyền thống)
- **Tiêu đề (Title / H1):** Chứa Tên công cụ + Từ khóa công dụng thực tế (Ví dụ: `MarkItDown: Chuyển đổi tài liệu Word, PDF sang Markdown cho AI`). Độ dài 55 - 65 ký tự.
- **Mô tả ngắn (Excerpt / Meta Description):** 140 - 160 ký tự, tóm tắt chính xác giá trị cốt lõi, kích thích click.
- **Thẻ tiêu đề (H2, H3):** Bố cục chặt chẽ theo cấu trúc phân cấp, chứa từ khóa ngữ nghĩa liên quan (LSI keywords).
- **Internal Links (Liên kết nội bộ):** Dẫn link tự nhiên tới các danh mục liên quan (`/danh-muc/:slug`) và các công cụ tương đương.

### 🤖 AEO (Answer Engine Optimization - Tối ưu công cụ trả lời AI)
*AEO là nghệ thuật viết để ChatGPT, Perplexity, Google AI Overviews bốc ngay nội dung của bạn làm câu trả lời.*
- **Nguyên tắc "Answer-First" (Trả lời trực diện):** Ngay dưới tiêu đề H2, 1-2 câu đầu tiên phải trả lời thẳng thừng câu hỏi (Không vòng vo tam quốc).
- **Định dạng danh sách & Bảng biểu:** AI cực kỳ thích trích xuất dạng gạch đầu dòng (bullet points) và bảng so sánh (table).
- **Cấu trúc Hỏi - Đáp (FAQ):** Tích hợp phần Hỏi & Đáp tự nhiên ở cuối mỗi bài để đáp ứng đúng truy vấn tìm kiếm dạng câu hỏi của người dùng.

### 🌐 GEO (Generative Engine Optimization - Tối ưu hóa động cơ tạo sinh)
*GEO giúp mô hình ngôn ngữ lớn (LLMs) hiểu được bản chất thực thể (Entity) của công cụ.*
- **Rõ ràng về Thực thể (Entities):** Nêu rõ tên tác giả/tổ chức phát triển (Microsoft, Google, Meta, Tác giả độc lập), năm phát hành, ngôn ngữ lập trình, số sao GitHub.
- **Số liệu chứng thực (Verifiable Facts):** Dẫn chứng số sao GitHub, loại giấy phép nguồn mở (MIT, Apache 2.0, GPL), dung lượng, nền tảng hỗ trợ (Windows, macOS, Linux, Docker).
- **JSON-LD Schema Markup:** Mỗi bài viết phải có Schema chuẩn:
  - `SoftwareApplication` (Tên, hệ điều hành, giấy phép, tác giả, link repo).
  - `FAQPage` (Các câu hỏi thường gặp).
  - `BreadcrumbList` (Đường dẫn điều hướng).

### 🛡️ EEAT (Experience - Expertise - Authoritativeness - Trustworthiness)
- **Tính khách quan:** Nêu rõ công cụ làm được gì VÀ giới hạn không làm được gì (nhưng diễn đạt theo ngôn ngữ thân thiện, tránh từ ngữ phòng thủ pháp chế quá đà).
- **Nguồn chính thống:** Luôn có link trực tiếp trỏ về GitHub Repository gốc hoặc trang chủ chính thức của dự án.

---

## 3. Khung sườn bài viết mẫu chuẩn (Standard Article Template)

Mọi bài viết khi thêm mới hoặc viết lại đều tuân thủ cấu trúc 5 khối sau:

### Khối 1: Header & Thẻ tóm tắt nhanh (Elevator Pitch)
```markdown
# [Tên công cụ]: [Hành động/Lợi ích lớn nhất bằng ngôn ngữ đời thường]
> **Tóm tắt nhanh:** [Tên công cụ] là một phần mềm [loại phần mềm] mã nguồn mở do [Tác giả/Tổ chức] phát triển, giúp bạn [giải quyết việc gì] một cách [nhanh chóng/tự động/bảo mật], không tốn chi phí và không cần tải dữ liệu lên web lạ.
```

### Khối 2: Rắc rối thực tế & Giải pháp (Pain Point vs Solution)
```markdown
## [Tên công cụ] giải quyết vấn đề gì cho bạn?
- **Nỗi đau thường gặp:** [Mô tả 1 tình huống thực tế gây phiền toái, tốn thời gian hoặc tốn tiền].
- **Cách công cụ giải quyết:** [Công cụ xử lý việc đó như thế nào, đem lại sự nhẹ nhõm gì].
```

### Khối 3: Ưu điểm nổi bật (Key Highlights)
```markdown
## Những điểm đáng giá nhất
- ⚡ **[Tính năng chính]:** [Mô tả ngắn gọn công dụng].
- 🔒 **Chạy offline, bảo mật 100%:** Dữ liệu nằm hoàn toàn trên máy tính của bạn, không lo rò rỉ thông tin cá nhân hay tài liệu công ty.
- 💸 **Hoàn toàn miễn phí & Mã nguồn mở:** [Loại license, ví dụ: Giấy phép MIT], thoải mái sử dụng cho cá nhân và thương mại mà không lo bản quyền hay phí ẩn.
- 💻 **Đa nền tảng:** Hoạt động tốt trên Windows, macOS, Linux hoặc Docker.
```

### Khối 4: Ai nên sử dụng công cụ này?
```markdown
## Đối tượng phù hợp
- **[Nhóm đối tượng 1]:** Cần công cụ để [mục đích 1].
- **[Nhóm đối tượng 2]:** Cần công cụ để [mục đích 2].
```

### Khối 5: Hướng dẫn bắt đầu & Nguồn chính thức (Call To Action)
```markdown
## Bắt đầu sử dụng như thế nào?
Để cài đặt và xem hướng dẫn chi tiết từ chính tác giả, bạn hãy truy cập trực tiếp vào kho lưu trữ GitHub chính thức:
👉 **[Nút bấm / Link]: Xem GitHub Repository chính thức**
*(Bạn chỉ cần làm theo hướng dẫn tại file README.md trong repo để tải bản cài đặt hoặc chạy lệnh)*.
```

---

## 4. Bảng từ ngữ cấm kỵ (Blacklist) vs. Từ ngữ khuyến khích

| ❌ KHÔNG DÙNG (Cũ, rào đón, khó hiểu) | ✅ NÊN DÙNG (Mới, rõ ràng, thân thiện) |
| :--- | :--- |
| "Một tài liệu giới thiệu sản phẩm hư cấu... Đây là tình huống biên tập đề xuất, chưa phải kết quả đã chạy thử." | "Ví dụ thực tế: Bạn có một file PDF hợp đồng cần lấy bảng biểu ra..." |
| "Số sao là tín hiệu được quan tâm, không phải điểm đánh giá chất lượng hoặc bằng chứng đã dùng thử." | "Được cộng đồng tin tưởng với hơn [X] sao trên GitHub." |
| "GitHub nhận diện giấy phép MIT tại lần đọc metadata... không phải kết luận mọi cách sử dụng đều được phép." | "Sử dụng giấy phép mã nguồn mở MIT thân thiện, bạn tự do sử dụng miễn phí." |
| "Bài giới thiệu do AI nghiên cứu và duyệt biên tập; chưa cài/chạy repo..." | *(Bỏ hoàn toàn câu này, thay bằng đánh giá khách quan về ưu nhược điểm thực tế)*. |

---

## 5. Quy trình duyệt bài viết mới (Checklist)
Trước khi xuất bản bất kỳ công cụ hoặc bài viết mới nào vào `src/data/resources.ts`:
- [ ] Tiêu đề có chứa Tên công cụ + Lợi ích rõ ràng?
- [ ] Đoạn đầu tiên trả lời trực tiếp: "Cái này là gì"?
- [ ] Có nêu đúng "Nỗi đau" mà người dùng đang tìm cách giải quyết?
- [ ] Đã kiểm tra link GitHub Repo chính xác, còn sống (Status 200)?
- [ ] Không chứa các câu rào đón pháp chế gây hoang mang cho người mới?
- [ ] Dữ liệu Schema JSON-LD đã được nạp tự động qua component SEO?
