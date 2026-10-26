# S08 — Trang tài nguyên chi tiết

Ngày 21/10/2026 (Asia/Saigon). **PASS kỹ thuật local; dừng trước S09.**
Quyền thực hiện: “duyệt S08”. Nhánh codex/s08-resource-detail từ S07 6bd4494.
Theme 0.3.0; plugin 0.3.0/schema 3 giữ nguyên. Chưa deploy hay đổi main/release.

## Kết quả

- Trang tài nguyên theo bố cục e-commerce: ảnh trái/thông tin quyết định phải trên
  desktop, một cột mobile. Có loại, tên, tóm tắt, chủ repo, nhãn kiểm chứng và nút
  mở trực tiếp đúng repo/path; không giỏ hàng, giá tự suy diễn hoặc thanh toán.
- Điều hướng mục thật bằng HTML: Giới thiệu, Điều kiện sử dụng, Tình trạng,
  Bắt đầu tìm hiểu, Nguồn/mốc đối chiếu và Cùng danh mục khi có dữ liệu.
  Không ép gallery/FAQ/rating hoặc lịch sử chưa có tư liệu.
- Điều kiện yêu cầu/quyền/tương thích/giấy phép/chi phí phân biệt Chưa xác định,
  Theo nguồn/chưa xác nhận độc lập và Mâu thuẫn có nguồn đối chiếu.
- Badge/CTA lấy từ resolver. Suspended/unavailable có lý do và cảnh báo phụ,
  không còn link tới nguồn/claim/intro của item đó; URL vẫn đọc được dạng văn bản.
- Bằng chứng có môi trường, công cụ/phiên bản, đầu vào/đầu ra, checklist và ngày
  đã ghi. Bản ghi cũ không xác nhận phiên bản hiện tại. Không công khai actor/audit
  hoặc dùng ngày sửa WordPress để giả làm lịch sử đã kiểm chứng.
- Nội dung chỉ lấy approved snapshot; dữ liệu raw/pending/private không lọt ra
  body hoặc head. Frontend không hiển thị private dù người xem đã đăng nhập.
  Preview S05 vẫn ở route admin riêng, có quyền/no-store/noindex.
- Lọc HTML phần giới thiệu: bỏ media/form/h1/style, không chạy shortcode;
  prefix ID và sửa anchor nội dung. Fragment không có đích trở thành văn bản.
  Khi chưa đủ điều kiện, khối pre được thay bằng giải thích; không sinh/chạy lệnh.
- Tài nguyên cùng danh mục và bài đọc cùng chủ đề dùng category approved thật,
  tối đa3 mỗi nhóm, không tự nhận đã dùng/thử cùng repo; bỏ mục rỗng, candidate
  suspended/unavailable. Thu hồi nội dung được phản ánh ở request kế tiếp.
- Ảnh có nhãn minh họa, không là demo. Thiếu bìa và bìa chung dùng placeholder.

[Hợp đồng S08](../S08-detail-contract.vi.md) · [Theme README](../../themes/vibelab/README.md).

## Kiểm thử cuối

Chạy tuần tự qua scripts/run-clean.mjs, fixture độc lập:

- npm run test:detail — **54 điểm UI/HTTP + 19 kiểm tra fixture PASS**.
- npm run test:detail-catalog-regression — **44 điểm S07 + 23 kiểm tra fixture PASS**.
- npm run test:detail-home-regression — **59 điểm S06 PASS**.

WordPress 7.1.3 / PHP 8.3 / SQLite; Microsoft Edge headless, Playwright Node 1.62.1.

| Nhóm | Kết quả đã kiểm tra |
|---|---|
| Snapshot | Canonical title/body/head khác raw/pending; ghi chú nội bộ không công khai |
| Quyết định | Đúng URL skill/path/revision; đủ5 điều kiện, unknown/theo nguồn/mâu thuẫn đúng mức |
| Bằng chứng | Chưa có / pass đúng revision / revision đổi làm cũ; cổng pre theo resolver |
| Trạng thái | Unavailable + archived giữ cảnh báo phụ; suspended có lý do, không repo CTA |
| Quan hệ | Max3 public cùng category, không self/private/blocked; không giả quan hệ thực hành |
| Không dữ liệu | Intro thiếu có giải thích, không related/guide thì không tab/mục ảo |
| Quyền | Anonymous draft/private404, proposal API403; admin preview có quyền, frontend private404 |
| Media và HTML | Nội dung ngoài bị loại, ID không trùng, anchor được sửa; thiếu ảnh có placeholder |
| Responsive | 1440/820/390/320px không tràn ngang; title219 byte và văn bản liền chữ đọc được |
| Điều hướng | Anchor thực, Enter chuyển focus; khi tắt JS vẫn mở các mục được |
| Hồi quy | Danh mục/thẻ/phân trang/taxonomy và trang chủ/menu/fallback/empty/plugin tắt |
| Runtime | Lượt cuối không lỗi PHP/JS/HTTP nội bộ bất ngờ; DB/config local giữ nguyên |

[S08 kết quả](S08/test-results.json) · [Hồi quy S07](S08/S07-regression/test-results.json) ·
[Hồi quy S06](S08/S06-regression/test-results.json).

## Ảnh nghiệm thu

Đã xem trực quan desktop/mobile, trạng thái, nguồn/claim dài và ảnh dự phòng.
Bộ chụp cuộn/đợi decode ảnh nội bộ; có ảnh màn đầu dễ xem.
Preview admin có avatar ngoài bị chặn, không bật truy cập ngoài để chụp.

- [Desktop màn đầu](S08/detail-desktop-top.png), [toàn trang](S08/detail-desktop.png)
- [Mobile màn đầu](S08/detail-mobile-top.png), [toàn trang](S08/detail-mobile.png)
- [320px](S08/detail-small-mobile-top.png), [tablet](S08/detail-tablet.png)
- [Bằng chứng QA hiện hành](S08/detail-tested-fixture.png), [đã cũ](S08/detail-stale-evidence.png)
- [Nguồn không truy cập](S08/detail-unavailable.png), [ngừng đề xuất](S08/detail-suspended.png)
- [Thông tin mâu thuẫn](S08/detail-conflicted-claim.png)
- [Không quan hệ/thiếu giới thiệu](S08/detail-empty.png), [chuỗi dài](S08/detail-long-title.png)
- [Thiếu ảnh](S08/detail-image-placeholder.png), [không JS](S08/detail-no-js.png)
- [Preview riêng QA](S08/editorial-preview-fixture.png)

## Cleanup và bảo toàn

Browser/server đã đóng trước khi run-clean dọn fixture/cache mới, kể cả các lượt lỗi.
tmp/tests rỗng, không lock; cổng19408/19407/19406 không listen. Database và wp-config.php
của .local/site giữ nguyên hash gốc (JSON kết quả và postflight.json).
Không nạp QA/kích hoạt theme/plugin vào site local đang dùng. Không xóa runtime,
dependency, backup thật hoặc bằng chứng. Hồ sơ S06/S07 gốc được giữ nguyên;
kết quả hồi quy mới nằm riêng trong S08.

## Giới hạn và điều chỉnh

- Các repo nền lấy từ quan sát S02 đã lưu; không kiểm tra lại hiện trạng GitHub.
  Repo phụ, môi trường/claim và bằng chứng “đã thử” của S08 là dữ liệu **giả lập QA**,
  không phải đã cài/chạy repo thật hoặc đề xuất mới được tuyển chọn.
- Chỉ cổng pre được thực thi cho khối mã. Văn xuôi/inline code không được phân loại
  ngữ nghĩa tự động; biên tập vẫn chịu trách nhiệm tách hướng dẫn cài khỏi mô tả.
- Snapshot/related hiện nạp trong từng request, phù hợp phạm vi MVP; chưa chứng nhận
  thư viện lớn. Chưa làm tìm/lọc S09, bài học tương tác S10, hỗ trợ S11, AI hay automation.
- Chưa kiểm thử hosting PHP/MySQL/cache/plugin khác, Safari/Firefox hoặc usability
  với người mới. PASS local không thay nghiệm thu staging và thử người dùng.
- [Nhật ký sửa bộ kiểm thử](S08/run-notes.vi.md) ghi các lượt chưa đạt do selector,
  ảnh admin bị chặn và dữ liệu QA dài/nối chuỗi. Các lượt đó không tính PASS.
- Git cảnh báo chuẩn hóa LF/CRLF theo .gitattributes; diff --check sạch.
  Dùng Playwright Node có sẵn theo workflow S02, không cài Python package.

## Điểm dừng

S08 đạt kỹ thuật local. Chờ chủ dự án xem giao diện và cho phép S09.
Không triển khai hosting, cập nhật main/release, gọi API trả phí hoặc tự mở bước tiếp theo.
