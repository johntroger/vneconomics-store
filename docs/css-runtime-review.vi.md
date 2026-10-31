# CSS runtime — phạm vi review

Source nối tiếp PR16. Bổ sung production runtime profile/backend/bootstrap trong mã, transaction engine và native updater có maintenance ownership. Chỉ hỗ trợ CSS-only baseline R6, theme2.0.0 →2.0.1, plugin0.4.4/schema3 giữ nguyên. Các profile fixture/inspection/proof-only cũ vẫn giữ guard riêng.

Runtime kiểm source/controller/payload/manifest/receiver/baseline/key pins và approval đóng, private storage, lock/journal và data/file baseline trước/sau mutation. Intent ghi trước native updater; data drift sau intent chặn mutation. Proof hợp lệ và health tốt mới COMPLETE; health lỗi xác thực dẫn tới native rollback và proof baseline mới. Lỗi không rõ/conflict giữ lock/journal và chỉnh sửa để inspect, không restore DB hoặc relabel journal.

```sh
npm run test:css-production-runtime-workflow
npm run test:css-production-runtime
```

Suite full20 nhóm dùng owned WordPress/SQLite fixture, native WP_Upgrader, synthetic key/proof và child Node/PHP process riêng. Hai ca hard-stop sau native install/rollback khôi phục từ disk với PID mới, giữ journal/config/maintenance. Fixture CLI được cấu hình trước crash để boot WordPress khi maintenance đang bật; không coi đây là bằng chứng Plesk/WP Toolkit có cùng hành vi. `--restart-only` chỉ chạy6 nhóm mục tiêu, không thay full suite.

CI runtime riêng trên Windows2025/Node22, source head chính xác, contents:read, pinned actions, không secrets/deploy. CSS source mẫu được tạo trong Git fixture từ baseline R6, không phụ thuộc commit mẫu ngoài lịch sử runner. Không chạy suite nặng cho vòng CSS/nội dung không tác động runtime.

Chưa positive-write certification của production IO/UID/MySQL/quota/HTTP, key transport/provision/activation hoặc two-side key coordinator qua process restart. Không cài controller, tạo key thật, mở scheduler/Automatic hoặc phát hành ứng dụng từ PR này. CI PASS không cấp quyền merge main, promote payload hay thao tác hosting. Database, media, backup, config/key và raw hosting evidence nằm ngoài selection.
