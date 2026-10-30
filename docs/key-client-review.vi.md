# Private-key client — phạm vi review

Source nối tiếp PR15, bổ sung loader và candidate staging client trước đó còn ở local. Không có key hoặc dữ liệu kho private trong source.

Loader kiểm ignored/untracked fixed store, canonical/no-link path, regular file một hardlink, kích thước/schema/fingerprint và descriptor identity trước/sau đọc. Windows kiểm protected DACL/current owner bằng PowerShell7; POSIX kiểm current UID và mode0700/0600. Lỗi không trả raw key. Producer được kiểm bằng HTTP mock.

Candidate staging có API cố định cho local production store, chỉ chạy khi được gọi rõ với approval đóng; test chỉ dùng owned fixture. Initial không ghi đè active; rotation preparation kiểm expected-active và giữ active. Candidate tạo quyền riêng trước secret, retry kiểm schema/fingerprint và không rewrite; orphan/conflict giữ inspect. Chưa activation local thật, server provision hoặc two-side production transport.

```sh
npm run test:key-client-workflow
npm run test:key-client
```

Client suite28 nhóm chạy tuần tự/summary-only qua một cleanup wrapper. CI Windows/Linux chạy read-only với exact source head; không nhận secrets hoặc gọi Plesk. Checkpoint/coordinator source của PR15 vẫn giữ riêng gate của nó; không suy certification hosting từ native client tests.

Chưa có quyền merge main, promote payload, tạo key thật hoặc triển khai từ PR này. Các bản backup, database, media, config/key và evidence hosting vẫn ở ngoài commit.
