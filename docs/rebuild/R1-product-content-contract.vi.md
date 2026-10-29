# R1 — Hợp đồng sản phẩm, nội dung và cấu trúc thông tin

Ngày chốt bản nháp: 28/10/2026

Trạng thái: **ĐÃ ĐƯỢC CHỦ DỰ ÁN DUYỆT NGÀY 28/10/2026**

Phạm vi: tài liệu/read-only; không sửa theme/plugin, database, Plesk hoặc production

## 1. Mục tiêu sản phẩm

`store.vneconomics.com` là thư viện tiếng Việt giúp người mới:

1. tìm đúng công cụ hoặc tài nguyên cho một việc cụ thể;
2. hiểu điều kiện, nguồn và mức độ kiểm chứng trước khi dùng;
3. hoàn thành một bài thực hành nhỏ theo hướng dẫn từng bước.

Tên trình bày của sản phẩm là **VibeLab Việt**; domain `store.vneconomics.com` được giữ. Website không phải cửa hàng, không nhận thanh toán và không yêu cầu người đọc tạo tài khoản.

Ba hành trình bắt buộc:

| Hành trình | Điểm vào | Kết quả thành công |
|---|---|---|
| Khám phá | Trang chủ → nhu cầu/danh mục → danh sách → chi tiết | Người đọc mở được một tài nguyên phù hợp và hiểu nguồn, yêu cầu, tình trạng |
| Tìm kiếm | Ô tìm kiếm → kết quả/bộ lọc → chi tiết | Có kết quả phù hợp hoặc trạng thái rỗng chỉ ra cách phục hồi |
| Hướng dẫn | Danh sách hướng dẫn → bài → tài nguyên liên quan | Người đọc biết chuẩn bị gì, làm theo từng bước và xác định bước tiếp theo |

Ngoài phạm vi phiên bản đầu: thương mại điện tử, tài khoản người đọc, cộng đồng, chấm điểm công khai, AI tìm kiếm trả phí và viết lại backend WordPress.

## 2. Kiến trúc thông tin v2

```text
Trang chủ
├── Tìm kiếm toàn site
├── Khám phá tài nguyên
│   ├── Danh mục
│   ├── Nhu cầu
│   └── Chi tiết tài nguyên
├── Hướng dẫn & thực hành
│   ├── Danh sách hướng dẫn
│   ├── Chi tiết hướng dẫn
│   └── Chi tiết bộ thực hành
└── Thông tin tin cậy
    ├── Giới thiệu
    ├── Tiêu chí tuyển chọn
    ├── Câu hỏi thường gặp
    ├── Trợ giúp
    ├── Quyền riêng tư
    └── Điều kiện sử dụng
```

Điều hướng chính chỉ có **Trang chủ · Tài nguyên · Hướng dẫn · Tiêu chí**. Tìm kiếm luôn hiện ở header trên desktop; trên mobile vẫn truy cập được trong một thao tác. Không đưa Shop/Cart/Checkout/My account vào điều hướng.

## 3. Wireframe cấu trúc

### 3.1 Trang chủ

```text
[Header: brand | tìm kiếm | điều hướng]
[Hero: một lời hứa rõ + ô tìm kiếm + CTA Khám phá]
[Chọn theo việc cần làm: các nhu cầu chính]
[Tài nguyên nổi bật: thẻ có loại, trạng thái, mô tả]
[Bắt đầu cho người mới: 3 bước]
[Hướng dẫn mới/được chọn]
[Cách tuyển chọn + tín hiệu tin cậy]
[Footer: hỗ trợ, chính sách, nguồn]
```

Không dùng carousel. CTA chính chỉ một mục tiêu; CTA phụ không cạnh tranh màu hoặc vị trí. Số liệu chỉ hiển thị nếu lấy từ dữ liệu thật, có nhãn thời điểm.

### 3.2 Danh sách tài nguyên/tìm kiếm

```text
[Breadcrumb]
[H1 + mô tả ngắn]
[Tìm kiếm]
[Bộ lọc: danh mục | nhu cầu | công cụ | trạng thái]
[Tóm tắt truy vấn + Xóa bộ lọc]
[Danh sách thẻ kết quả]
[Phân trang]
[Trạng thái rỗng có gợi ý phục hồi]
```

URL danh sách không đổi là `/tai-nguyen/`. Search/filter là trạng thái truy vấn, `noindex,follow`, không tự tạo canonical giả. Filter trên mobile mở thành panel có nhãn, đóng được bằng keyboard và không làm mất truy vấn.

### 3.3 Chi tiết tài nguyên

```text
[Breadcrumb]
[Loại + trạng thái]
[H1 + công dụng ngắn]
[CTA mở nguồn chính]
[Thông tin nhanh: chi phí/giấy phép/yêu cầu/quyền/tương thích]
[Nội dung: dùng khi nào, cách bắt đầu, giới hạn]
[Nguồn + revision + ngày quan sát]
[Tài nguyên liên quan]
[Báo lỗi nội dung]
```

Không biến số sao GitHub thành lời khuyên. Trạng thái `unknown`, `conflicted`, `archived` phải hiển thị bằng chữ, không chỉ bằng màu.

### 3.4 Hướng dẫn và bộ thực hành

```text
[Danh sách /huong-dan/: tìm kiếm + nhóm theo mục tiêu]
  → [Chi tiết: breadcrumb, H1, yêu cầu, mục lục]
  → [Các bước có kết quả mong đợi và cách khôi phục]
  → [Nguồn/ngày kiểm tra + tài nguyên liên quan]
  → [Bước tiếp theo]
```

`/bo-thuc-hanh/` không là archive thứ hai trùng nội dung; archive này chuyển về `/huong-dan/`. URL chi tiết `/bo-thuc-hanh/<slug>/` vẫn giữ.

### 3.5 Mobile 320/390 px

- Một cột; không có cuộn ngang ở zoom 100% và 200%.
- Header ưu tiên brand, tìm kiếm và menu; không thu nhỏ chữ để nhét điều hướng.
- Vùng chạm tối thiểu 44 × 44 CSS px cho nút/icon tương tác.
- Filter và mục lục giữ focus hợp lý khi mở/đóng; nút đóng có tên truy cập.
- Bảng nội dung dài có phương án cuộn trong vùng hoặc chuyển thành danh sách, không ép toàn trang tràn ngang.

## 4. Hợp đồng nội dung

Giữ ba loại nội dung hiện có:

| Loại | URL | Vai trò |
|---|---|---|
| `vne_resource` | `/tai-nguyen/<slug>/` | Công cụ, tài liệu học, skill hoặc starter |
| `vne_guide` | `/huong-dan/<slug>/` | Bài hướng dẫn theo mục tiêu |
| `vne_practice` | `/bo-thuc-hanh/<slug>/` | Bài thực hành có đầu ra cụ thể |

Giữ taxonomy `vne_category`, `vne_need`, `vne_tool`. `vne_category` là điều hướng chính và có landing page indexable. `vne_need`/`vne_tool` trước mắt dùng làm filter; chỉ tạo landing page indexable khi có đủ nội dung riêng, không sinh trang mỏng hàng loạt.

Trường bắt buộc khi xuất bản:

- chung: tiêu đề, slug, mô tả ngắn, nội dung, danh mục chính, trạng thái xuất bản;
- tài nguyên: loại, URL nguồn, revision/path nếu có, ngày quan sát, xác nhận nguồn;
- claim: chi phí, giấy phép, yêu cầu, quyền và tương thích với trạng thái/nguồn/ngày;
- hướng dẫn/thực hành: nguồn tài liệu, ngày quan sát, yêu cầu, các bước, kết quả mong đợi và đường phục hồi;
- vận hành: approved revision, validation, trạng thái bảo trì/khuyến nghị, lịch rà soát, dependencies và journal.

Không thêm field production ở R1. R4 chỉ bổ sung field khi R2/R3 chứng minh thiếu. Ảnh đại diện chỉ trở thành field bắt buộc nếu thiết kế card v2 không đạt khi không có ảnh.

### Vòng đời nội dung

```text
Draft → kiểm nguồn/claim → review → approve → publish
      → cần rà soát → cập nhật hoặc archived
```

- Bài/tài nguyên mới là **dữ liệu CMS**: nhập và lưu trong MariaDB/WordPress trên Plesk; không cần commit code.
- Button, layout, component, validation hoặc schema mới là **code**: local → GitHub/CI → payload → Plesk theo gate release.
- Nội dung publish phải có nguồn/ngày theo validator hiện hành. `not_tested` không được trình bày như đã kiểm chứng.

## 5. Ranh giới dữ liệu và media

| Nơi lưu | Dữ liệu |
|---|---|
| GitHub | Theme/plugin, migration, test, cấu hình mẫu, icon/asset nhỏ thuộc giao diện |
| MariaDB Plesk | Bài, taxonomy, metadata, revision, trạng thái duyệt, báo lỗi riêng |
| Uploads Plesk | Ảnh, PDF và media thật; không commit vào Git |
| Kho backup độc lập | DB, uploads, cấu hình và gói rollback cần giữ |

Media phải có alt text có nghĩa khi ảnh truyền đạt thông tin; ảnh trang trí dùng alt rỗng. Giữ bản gốc cần thiết, nhưng phục vụ biến thể kích thước phù hợp; không tải ảnh/PDF lớn chỉ để trang trí. Không xóa media mồ côi ở R1 vì chưa có đối chiếu quan hệ DB–uploads và backup.

## 6. Hợp đồng SEO

- URL giữ phải có một canonical tự tham chiếu, title/description riêng và status 200.
- Search/filter, preview, báo lỗi, account/admin và trạng thái riêng tư phải `noindex`.
- Sitemap chỉ chứa URL 200, canonical, indexable và nội dung đã publish.
- Redirect chỉ dùng khi đích tương đương; chuyển thẳng một lần, cùng HTTPS origin, không chain/loop.
- Nội dung mẫu, trang commerce và tin lệch định hướng không redirect hàng loạt về homepage; dùng 410 khi không có đích tương đương.
- Structured data chỉ thêm khi nội dung trên trang thực sự đáp ứng loại schema; không tạo rating/review giả.

Baseline công khai ngày 28/10/2026:

- sitemap: 126 URL = 106 tài nguyên + 6 hướng dẫn + 1 bộ thực hành + 13 danh mục;
- homepage, archive tài nguyên/hướng dẫn và mẫu chi tiết trả 200, canonical tự tham chiếu;
- `/bo-thuc-hanh/` trả 200 nhưng trùng nội dung và canonical `/huong-dan/`;
- search query trả 200, không canonical, `noindex,follow`;
- sáu trang hỗ trợ đang là query URL indexable;
- Shop còn indexable; Cart/My account noindex; Checkout kết thúc ở Cart.

Quyết định từng nhóm URL nằm tại [R1-url-disposition.vi.md](R1-url-disposition.vi.md).

## 7. Tiêu chí UX, accessibility và browser

R2/R3 phải chứng minh:

- semantic landmarks, một H1 chính, heading không nhảy cấp vô lý;
- dùng toàn bộ luồng chính bằng keyboard; skip link tới main; focus nhìn thấy và không bị che;
- form có label, lỗi gắn với field và thông báo không phụ thuộc màu;
- contrast theo WCAG 2.2 AA: 4.5:1 cho chữ thường, 3:1 cho chữ lớn và thành phần giao diện;
- nội dung còn dùng được ở zoom 200%; không mất thông tin khi giảm chuyển động;
- Chromium desktop/mobile là cổng mỗi gate; Firefox và WebKit chạy ở release gate cho ba hành trình chính;
- viewport bắt buộc: 320, 390, 768, 1024 và 1440 CSS px.

Mục tiêu là WCAG 2.2 AA cho hành trình mới; đây không phải tuyên bố toàn bộ WordPress/admin/extension bên thứ ba đã được chứng nhận.

## 8. Hiệu năng và KPI

Baseline hiện có chỉ đủ làm cảnh báo kỹ thuật: Site Health production từng ghi median phản hồi server 994 ms so với ngưỡng khuyến nghị 600 ms. Đây không phải Core Web Vitals field data. HTML quan sát 28/10 có khoảng 44 KB ở homepage và 58 KB ở archive tài nguyên; chưa đo đầy đủ CSS, ảnh, cache hoặc thiết bị thật.

### Ngân sách kỹ thuật

- Không tăng JavaScript nếu tính năng làm được bằng HTML/CSS/server render.
- Không tải media ngoài viewport khi chưa cần; khai báo kích thước ảnh để tránh layout shift.
- Gate local đo chênh lệch so với baseline cùng môi trường, không dùng số local để tuyên bố production nhanh.
- Mục tiêu production khi đủ field data: p75 LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; server response median hướng tới ≤ 600 ms. Nếu Shared Hosting không đạt, R7 điều tra trước khi bật cache hoặc đổi hạ tầng.

### Tín hiệu sản phẩm

| Tín hiệu | Cách đo không xâm phạm riêng tư | Mục tiêu ban đầu |
|---|---|---|
| Tìm được nội dung | test kịch bản và search zero-result rate tổng hợp | 3 hành trình đạt; zero-result có phục hồi |
| Đường đi ngắn | số bước trong test tác vụ | homepage → detail không quá 3 tương tác chính |
| Chất lượng nguồn | validator/readback | 100% nội dung publish mới có nguồn và ngày |
| URL sạch | crawl release | 100% URL trong ledger đúng status/canonical/robots |
| Accessibility | automated scan + keyboard walk | không có lỗi blocker/critical trên template mới |
| Ổn định | postflight/log | không PHP fatal, không mất dữ liệu, rollback sẵn |

Không bật analytics/collector mới trong R1. Nếu sau này đo người dùng thật, phải chốt công cụ, dữ liệu, retention và quyền riêng tư ở gate riêng.

## 9. Quyết định đã được chủ dự án duyệt

Chủ dự án đã duyệt R1 ngày 28/10/2026, gồm:

1. định vị “thư viện miễn phí, không thương mại điện tử”;
2. sitemap/hành trình/wireframe ở trên;
3. xử lý URL legacy và query support trong ledger;
4. ranh giới dữ liệu: nội dung/media ở Plesk, code ở GitHub;
5. tiêu chí responsive/accessibility/browser và KPI.

R1 hoàn tất. Bước có thể xin duyệt tiếp theo là **R2 — architecture foundation và design system local**. Việc duyệt R1 không cấp quyền sửa code, merge PR, build candidate hoặc deploy.
