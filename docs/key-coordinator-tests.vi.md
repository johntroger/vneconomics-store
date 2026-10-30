# Kiểm thử điều phối key local

Khi sửa harness/coordinator/checkpoint/state pin, chạy:

```sh
npm run test:key-coordinator
```

Lệnh chạy một parent `scripts/run-clean.mjs`, lần lượt kiểm single-flight6, checkpoint16 và state-pin10 nhóm. Chạy tuần tự để tránh fixture chồng; khi child lỗi, suite dừng và parent vẫn dọn cache/fixture của lượt. Không dùng suite này cho mỗi lần sửa CSS/nội dung homepage; tiếp tục chọn test module đúng thay đổi.

Ba script con dùng `--summary-only`, không ghi đè nghiệm thu cũ hoặc tạo thư mục báo cáo mới. Runner in một JSON tổng hợp gồm thời gian, kết quả từng case, diagnostic count và source hashes. Stderr của child được giữ cả khi PASS. Mặc định không lưu report trên disk; nếu cần evidence ở gate đã duyệt, capture output một lần vào thư mục nghiệm thu của gate đó. Không chạy lồng nhiều cleanup wrapper.

Checkpoint test tạo hardlink tổng hợp trong `tmp/tests`; sandbox Windows có thể chặn quyền này. Agent có thể cần chạy lại đúng lệnh local ngoài sandbox theo cơ chế xét duyệt, không thay đặc quyền OS hoặc dùng key thật. Không bỏ qua case khi hardlink bị chặn.

Đây là kiểm thử fixture, không gọi Plesk, không xác thực hosting và không cấp quyền production hoặc bật scheduler. Các script test mang mã R7.x vẫn giữ làm caller/bằng chứng; entry vận hành hiện hành là tên module `test:key-coordinator`.

Workflow manual `key-coordinator-check.yml` được chuẩn bị trong source. Khi sửa cấu hình đó, chạy `npm run test:key-coordinator-workflow`; contract chạy guard PowerShell tại chỗ và không cài dependency, checkout hoặc gọi GitHub. Chỉ gate GitHub riêng mới đối chiếu actual source/controller/CI run; local contract không thay kết quả runner thật.

Nhánh review coordinator nối contract/suite vào adapter PR job hiện có, chỉ theo paths module. Đây là kiểm thử CI, không phải workflow deploy hoặc quyền mở automation hosting. Workflow coordinator riêng vẫn manual. Xem [phạm vi review](key-coordinator-review.vi.md).

## Private-key client local

Khi đổi private-file loader hoặc candidate staging client, chạy `npm run test:key-client`. Suite riêng chạy tuần tự16 nhóm loader và12 nhóm staging qua một parent run-clean; hai test con dùng summary-only, giữ receipt R7.26/R7.29 nguyên hash/mtime.

Lượt Windows hiện tại đo50.772 giây (loader12.700, staging38.068),0 diagnostic. Đây là thời gian kiểm filesystem/quyền native trong fixture; không phải thời gian sửa giao diện hoặc response website. Không ghép vào mọi lần chỉnh CSS/nội dung, không thêm vào suite coordinator32 nhóm. Chỉ chạy cả hai suite khi thay đổi thật sự tác động cả hai module hoặc tại gate tương ứng.

Windows dùng PowerShell7 để kiểm/protect DACL của resource tổng hợp, cùng hardlink/junction guards. Không đổi owner/SACL/đặc quyền OS hoặc quyền file có sẵn ngoài fixture. Producer dùng HTTP mock. Kho production thực không được tạo/đọc, không có server provision/activation. Client không thuộc source PR15; kết quả Windows/Linux CI phải gắn với source của nhánh client riêng, không suy kết quả POSIX từ Windows.

`key-client-check.yml` kiểm source head chính xác trên Windows2025/Ubuntu24.04, quyền read-only, không secrets/deploy. Khi sửa workflow này, dùng `npm run test:key-client-workflow`. Paths client tách khỏi coordinator; CI vẫn có thể chạy cả hai khi dependency/package hoặc workflow dùng chung thay đổi.
