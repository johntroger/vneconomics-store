# R2 — Pipeline local → GitHub → Plesk

Ngày26/10/2026. **PASS local trong phạm vi R2.** Quyền thực hiện: chủ dự án “duyệt R2”. Dừng trước R3.

## Thay đổi

- Nhánh `codex/deployment-pipeline`. Dùng lại theme0.7.2/38file, plugin0.4.2/10file/schema3,100 tài nguyên C100, bộ ba hướng dẫn và bằng chứng thử thật. Byte mã ứng dụng giữ nguyên; không tăng phiên bản vì đổi quy trình.
- Build từ Git blob, manifest/SHA256/allowlist, ZIP tái tạo; profile lịch sử0.6.0/0.7.0/0.7.1 giữ nguyên. ZIP quay lui0.7.1/36file. Gói nguồn ứng viên đã thử: `21b26c9adf41343c9dfa2fe1cec442ba3fbc1e0c`; sản phẩm local `artifacts/pipeline/<SHA>/` được giữ ngoài Git nhánh nguồn.
- Receiver private mặc định inspect chỉ đọc; pin root/DB/home/indexing, quyền reviewer hiện có, manifest/source/payload SHA và private Git HEAD. Kiểm cả archive/member hash, tránh symlink/path thoát vùng nhận. Hai đích vẫn disabled/null; chưa cấu hình hosting.
- Nhập thiếu qua API thư viện: draft có slug/marker nguyên tử, journal/resume, natural key và ID riêng môi trường, retry không tạo trùng. Chỉnh sửa/cờ rà soát không bị tự ghi đè. `adopt` nhận baseline có sẵn bằng receipt mới, giữ journal C100/G03 và lịch sử validation.
- Giữ nguyên gói G03/manifest/biên nhận phát hành cũ để truy vết; không đổi nhãn lần upload trực tiếp thành GitHub deployment. Marketing/banner ngoài phạm vi vẫn để riêng.
- Chuẩn bị workflow package không cần WordPress local/DB/PHP desktop. [Runbook](../../deploy/README.vi.md) mô tả vận hành, phân biệt source/payload SHA và các gate hosting còn lại.

## Kiểm thử đã chạy

| Nhóm | Kết quả và bằng chứng |
|---|---|
| Build/ZIP/profile |217 kiểm tra PASS; build2 lần giống byte, giải ZIP độc lập38/10/36file, hash/file thừa/gói hỏng, dữ liệu trung lập môi trường, profile cũ/ZIP S14 đúng hash. [package-results.json](R2-pipeline/package-results.json) |
| Receiver native |154 kiểm tra PASS; sai root/DB/home/index/ref/source/manifest/baseline, quyền thiếu, draft lạ; ngắt sau tạo thứ1 và thứ2 trước journal rồi tiếp tục; đủ106/6/1,103 natural key, không trùng validation; giữ raw edit/review flag; adoption mới chỉ thêm receipt option. [native-results.json](R2-pipeline/native-results.json) |
| WordPress/UI từ ZIP thật |243 kiểm tra PASS; theme38file/pluginZIP thật, bộ ba hướng dẫn, copy/checklist/revision/approved snapshot, search, riêng tư/password, mobile320/390 và desktop1280,14 URL cũ; không JS/PHP error hoặc browser request ngoài. [results.json](R2-pipeline/wordpress-ui/results.json) |
| Profile S14 đóng băng |76 kiểm tra PASS trên `594ccd9a7de812a49f2c0d8260d20cbfced71752`; xuất bằng chứng mới vào thư mục R2, không ghi đè hồ sơ S14 cũ. [package-results.json](R2-pipeline/historical-S14/package-results.json) |
| Runtime |WP7.1.3, PHP8.3.36, SQLite integration/Playground3.1.58 theo lockfile, Playwright/Edge hiện có. Phiên bản/hash local: [runtime-inventory.json](R2-pipeline/runtime-inventory.json). Không tải/cài dependency mới. |
| Rà soát nguồn |Lịch sử từ mốc remote S12 đến commit ghi trong [source-audit.json](R2-pipeline/source-audit.json): không phát hiện mẫu private key/GitHub/provider token/webhook URL có token hoặc đường dẫn DB/config bị cấm. Đây là kiểm mẫu văn bản; binary được kiểm kê riêng, không tuyên bố dò được mọi bí mật qua hình ảnh. |
| ZIP trong lịch sử nguồn |10 archive khớp hash Git, kiểm tên entry đệ quy trong bộ nhớ kể cả ZIP lồng nhau, không có đường dẫn runtime config/DB/traversal. [archive-audit.json](R2-pipeline/archive-audit.json). |

Manifest ứng viên đã thử SHA256 `7518b4ef0de664975f7bba9d72fcd0b773bbaaba81e1c8f220c6ef4c942e8ad8`; receiver SHA256 `6be74e3b87547e2321f5f80b8b2d787d875b03619490e8b9a7cc89389866e9cd`. ThemeZIP `3ac78ea97c8959d3955a74efc7d5998fdb58ffb27635eb22a3a38c4c7a8d0aab`; pluginZIP `2648f76f915c456ff4221a45862d60ecaf9cc5cdd468781ea8b302f6d63ee4c5`. Các commit gom hồ sơ sau ref21b26c9 không đổi9 tệp payload; commit biên nhận không tự là một lần phát hành. R3 build lại từ chính source SHA được push để CI/local đối chiếu manifest của ref đó.

Các lần thất bại ban đầu được giữ làm bằng chứng: chọn nhầm header style của ví dụ Mộc Studio, DB_PATH SQLite trỏ directory, URL evidence localhost có port không hợp lệ và trạng thái adoption sau apply. Đã sửa và chạy lại đạt. Các fixture validation là QA trong DB riêng đã xóa; gói chỉ chứa3 bằng chứng thật đã duyệt, với giới hạn thử có chủ hỗ trợ giữ nguyên.

Mỗi lượt chạy qua `run-clean.mjs`, hoàn tất cleanup. Hash DB/config local và nội dung Codex gốc trước/sau giữ nguyên; có trong native/UI reports. Không xóa dữ liệu có trước, backup thật, sản phẩm hoặc bằng chứng nghiệm thu. Không gửi mail, gọi API tính phí, bật automation, push hay đổi hosting.

## Giới hạn và cổng tiếp theo

Native dùng SQLite fixture; chưa chứng minh MariaDB/Plesk. Git HEAD trong native là fixture filesystem rõ ràng, không phải lượt giao nhận GitHub thật. Receiver yêu cầu người vận hành đối chiếu GitHub với Plesk; nó không tự truy vấn remote. Các path private thật và quyền Plesk cần kiểm chứng ở R4.

Workflow mới chỉ được kiểm bằng lệnh local (Node24); cấu hình Actions Windows2025/Node22 chưa chạy. Không gọi CI remote PASS. Việc chuyển native/UI lên runner sạch nếu cần còn phải bootstrap có nguồn/version/checksum, không mang `.local`/DB lên GitHub.

R3 chỉ được mở sau đồng ý riêng: kiểm lại webhook/đích lịch sử an toàn với nhánh nguồn, push commit đã duyệt lên `codex/deployment-pipeline` và chạy CI package. Không đổi nhánh payload/Plesk hoặc production ở R3. R4 staging và R5 production vẫn cần phê duyệt riêng.
