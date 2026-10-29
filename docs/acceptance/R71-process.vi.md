# R7.1 — Rà soát tốc độ và tối ưu hướng dẫn vận hành

Ngày 29/10/2026. Chủ dự án duyệt bằng “ok” sau đề xuất R7.1: đo điểm chậm và tối ưu quy trình local → GitHub → Plesk trước khi cân nhắc tự động hóa. Kết quả: **PASS_R71_LOCAL_PROCESS_OWNER_APPROVED**; chủ dự án nghiệm thu bằng “ok” sau báo cáo R7.1 cùng ngày. Chỉ cập nhật tài liệu, chưa thay runtime, CI hoặc hosting. R7.2 chưa được mở thực hiện.

## Kết quả kiểm tra

| Điểm | Bằng chứng và tác động |
|---|---|
| Menu local lỗi thời | README trước R7.1 liệt kê 12 lệnh test S06–S10 và production 0.7.2/0.4.2; dễ chọn nhầm test và baseline. Đã thay bằng ma trận module v2 và receipt R6. |
| Smoke có chi phí khởi động | `scripts/smoke.mjs` khởi động WordPress hai lần, sáu HTTP probe và kiểm persistence. `test:fast` là alias của bộ này; chưa đo thời gian vì không cần tạo fixture cho sửa tài liệu. |
| Kiểm cú pháp toàn cây | Đo một lượt `node scripts/run-clean.mjs script scripts/test-ci-fast.mjs`: **119 file, 21,197 giây**, exit0, cleanup PASS, lock không còn. Script tạo một Node process tuần tự cho mỗi file. Đây là số đo một lượt trên máy hiện tại, không phải p95 hoặc thời gian CI. |
| Test UI còn gắn với gate cũ | Các runner R2–R4 tạo fixture và viết evidence vào thư mục nghiệm thu của gate tương ứng. Chúng dùng được để kiểm module nhưng chưa phải vòng preview/smoke nhẹ. Không chạy lại chỉ để đo, tránh ghi đè bằng chứng cũ. |
| Build candidate tự chạy trên nhánh R52 | `.github/workflows/rebuild-candidate.yml` có trigger push nhánh `codex/rebuild-r52-candidate`, gồm `scripts/**`, theme, plugin, package và vài snapshot. Push đổi script vào nhánh này có thể chạy build/native release ngoài nhu cầu chỉnh nhỏ. Chưa thay trigger hoặc push. |
| Helper candidate cũ khác profile v2 | `scripts/release-candidate.mjs` và workflow `pipeline-check.yml` chỉ khai báo profile Stars 0.7.3/0.4.3; không dùng làm builder v2 tùy ý. Candidate v2 R52 dùng `scripts/rebuild-release.mjs`. |
| Thời gian phát hành khác thời gian downtime | [Activation R6](R6-rebuild/activation.json) ghi maintenance **78 giây**. [Completion](R6-rebuild/completion.json) đóng ngày hôm sau sau gián đoạn/đăng nhập lại; không lấy cả khoảng đó làm thời gian thực thi cài đặt hoặc tốc độ PHP. Chưa có số đo toàn pipeline từng stage. |

## Cải tiến áp dụng ngay

- README đưa production đúng receipt, giữ riêng local header và phiên bản plugin được builder đóng gói; bỏ menu test lịch sử khỏi hướng dẫn hiện hành, giữ file/alias phục vụ tái tạo bằng chứng.
- Chọn test đúng module, dùng smoke hành trình trong module; chỉ thêm smoke hai boot khi thay bootstrap/persistence hoặc smoke module không đủ phạm vi.
- Tài liệu chỉ kiểm diff/link; không dựng WordPress, build ZIP, backup hoặc hậu kiểm 126 URL.
- Cài dependency khi thiếu hoặc lockfile thay đổi. Phân biệt `npm run dev` mở baseline local với preview v2; chưa quảng bá nó là preview v2 sẵn dùng.
- Mỗi gate giữ một báo cáo ngắn và liên kết evidence cũ. Giữ Plesk Manual/private inbox; chưa mở browser, gọi production hoặc chạy CI remote trong R7.1.

Không xóa file trong lượt này: chưa xác định file nào đủ bằng chứng không còn caller/vai trò. Database, backup, rollback và evidence thật được giữ; phép đo đã đi qua run-clean và không để lại fixture/cache mới.

## Kiểm chứng và giới hạn

`git diff --check` và liên kết local trong các tài liệu bị tác động đạt. Phép đo kiểm cú pháp 119 file đạt, cleanup PASS. Không đổi mã ứng dụng nên không chạy application suite. Chưa chứng minh mức giảm thời gian end-to-end, chưa đo hiệu năng website/live mobile và chưa bật auto deploy.

## Bước đề xuất tiếp theo, chưa thực hiện

**R7.2 local:** preview v2 giữ database riêng, cập nhật file khi sửa mà không seed đè nội dung; runner smoke chọn module, evidence mới theo lượt chạy và ghi thời gian từng stage. Giữ các gate release đầy đủ. Kiểm chứng bằng thay đổi CSS mẫu có thể hoàn tác, smoke lỗi/đạt và cleanup. Không tự chuyển plugin local 0.4.3 thành payload 0.4.4 hoặc phát hành từ dirty tree.

**Gate CI/production riêng sau đó:** thiết kế thay trigger candidate theo nhánh/phạm vi release đã duyệt; profile v2 phải hỗ trợ baseline R6 và kiểm failure/rollback trước khi cân nhắc tự động hóa. Không sửa cấu hình Plesk hoặc merge main từ quyền R7.1.
