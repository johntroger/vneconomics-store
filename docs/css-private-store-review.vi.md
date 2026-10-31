# Private filesystem core — phạm vi review

Source nối tiếp PR17. Tách private read/write/CAS/mutex/terminal cleanup thành factory dùng chung với production dispatcher; giữ package/context/key/application guards ở entry. Factory chỉ dùng control path cố định, owner/kind đóng, không tạo key hoặc truy cập database/application files.

Ghi/cleanup cần giữ mutex, JSON có giới hạn trước tạo file, exclusive-create không ghi đè file tồn tại. Native mode checks dùng07777 để chặn cả setuid/setgid; file/descriptor/owner/link/CAS và mutex inode được kiểm. Lỗi không tự sửa quyền hoặc ghi đè conflict; nhả mutex không unlink inode bền.

```sh
npm run test:css-private-store-workflow
npm run test:css-private-store
```

Native suite17 nhóm chạy PHP8.3 pin digest, Linux UID10044/GID1004, tmpfs với production-like paths trong container riêng. Kiểm flock giữa hai PHP process, atomic rename với reader cũ, CAS, owner/mode, symlink/hardlink, mutex replacement và terminal cleanup. Container không mạng, root/source read-only; chỉ hai source files được bind, cleanup theo token của lượt và giữ image dependency. Docker context chỉ nhận endpoint local.

CI riêng trên Ubuntu24.04/Node22, checkout exact source head/read-only, pinned actions và image digest. Runtime Windows20 nhóm vẫn thuộc gate riêng để phát hiện regression của dispatcher/controller. Không coi native filesystem core là full production-dispatcher certification: chưa WordPress/MySQL/context/inbox/HTTP/quota/maintenance bootstrap Plesk hoặc key transport/two-side production coordinator.

PR này không merge main, promote payload, tạo key thật, đổi hosting hoặc bật scheduler/Automatic. Database, media, backup, credential/config và raw hosting evidence không thuộc selection.
