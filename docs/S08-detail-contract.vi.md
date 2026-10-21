# S08 — Trang tài nguyên chi tiết
Ngày 21/10/2026. Chủ dự án cho phép S08. Nhánh từ S07 6bd4494.
Chỉ local; S09, AI, automation và deploy chưa được phép.

Thiết kế tiếp tục token/font S06–S07: ảnh trái, quyết định phải trên desktop;
một cột mobile, tiêu đề trái, không ép gallery/FAQ/reviews khi không có tư liệu.
Ảnh bìa là SVG minh họa có nhãn, không là demo đã chạy. Một ảnh là đủ.
Nút chính giữ đúng URL repo/path từ derived.cta, không ép qua đăng nhập/AI.

Template single-vne_resource.php chỉ đọc vne_library_item() public. Title, content,
nguồn/revision/path, claims, taxonomy từ snapshot; state/observations/validation
từ derived hiện hành. Không đọc raw protected meta/history để công khai.
Draft/private/trash không là sản phẩm; chặn cả frontend đã đăng nhập khi item không public.
Preview S05 vẫn là route admin riêng; native preview không được lẫn payload đề xuất.

Điều hướng mục bằng anchor HTML, không cần JS: Giới thiệu, Điều kiện sử dụng,
Tình trạng, Bắt đầu tìm hiểu, Nguồn và mốc đối chiếu; thêm Cùng danh mục khi có dữ liệu.
Không dựng tab Tính năng độc lập vì schema chưa tách trường này; tính năng có sẵn
trong nội dung biên tập được giữ trong Giới thiệu.

Claims cost/license/requirements/permissions/compatibility:
unknown giữ Chưa xác định + ghi chú; upstream_claimed ghi Theo nguồn/chưa xác nhận
độc lập + nguồn/ngày; conflicted ghi mâu thuẫn + các nguồn, không nâng thành sự thật.
Ngày quan sát nguồn không là ngày chạy thử; không lấy post_modified/raw audit làm
lịch sử cập nhật được xác minh. Chỉ hiện các mốc source/review công khai hiện có.
Không hiển thị actor, review_epoch, approved_revision hay fingerprint kỹ thuật nội bộ.

Badge và quyền CTA theo resolver. Suspended/unavailable: nút đầu trang tới
#tinh-trang; URL nguồn/claim/quan sát thể hiện dạng văn bản thay vì link ngoài.
Giữ cảnh báo phụ, cả archived+unavailable. Bằng chứng gần nhất có thể cũ:
chỉ derived.validation_status=tested mới ghi kết quả hiện hành; còn lại ghi rõ
không dùng xác nhận hiện tại. Thể hiện OS/tool/version/input/output/checklist/date
của bằng chứng, không tự nhận an toàn hoặc mọi công cụ đều tương thích.

Không sinh/chạy/copy lệnh cài đặt ở S08. Khi commands_allowed=false, khối pre trong
nội dung biên tập được thay bằng nhãn giải thích; đây không là bộ phân loại ngữ nghĩa
lệnh trong văn xuôi/inline code. Biên tập vẫn phải tách mô tả và hướng dẫn cài.
Khi đủ điều kiện, chỉ giữ mã đã duyệt sẵn, không tự suy ra lệnh từ repo.
HTML mô tả không tự tải media/embeds/forms từ nguồn ngoài, không chạy shortcode;
bỏ h1/style, prefix ID nội dung và sửa anchor tương ứng để không xung đột với template. Fragment không có đích chỉ hiện như văn bản, không dựng link chết.

Tài nguyên cùng danh mục: giao category ID approved, loại chính item, không lặp,
tối đa 3, bỏ candidate suspended/unavailable. Không gọi là đã thử/đề xuất tốt nhất.
Bài đọc cùng chủ đề: guide public có category chung, badge hiện hành, tối đa 3;
không khẳng định là bài đã sử dụng repo hoặc có dependency. Không giả quan hệ chưa có.
Không có kết quả thì không dựng mục/CTA rỗng. Chưa làm nội dung bước/checklist S10.

Kiểm thử: template thật, source/path/claims đủ thiếu mâu thuẫn, bằng chứng khớp/cũ,
archived/unavailable/suspended, snapshot khác raw/pending, hidden/private/preview,
related public/thu hồi/không dữ liệu, ảnh thiếu, URL dài, desktop/tablet/mobile,
anchors/keyboard/no-JS, PHP/JS/HTTP, hồi quy S07 + S06. Fixtures chạy tuần tự qua
run-clean, giữ DB/config local và hồ sơ nghiệm thu gốc; chưa chứng nhận hosting.
