# Coordinator tooling — phạm vi review

Source này mở rộng controller/tooling từ nhánh importer package rehearsal. Không đổi theme/plugin hoặc dữ liệu website. Không có quyền merge main, promote payload hay triển khai từ việc push/CI.

## Có trong source

- Production binding/inspection guards và profile sáu file; proof-import backend chỉ đề nghị ghi private proof JSON, không ghi ứng dụng/database. Chưa có positive-write certification trên Plesk.
- Protocol candidate-key possession, reconciliation policy, fixture reservation/staging/activation/rollback và hai PHP VFS độc lập. Các fixture không đọc kho key thật hoặc gọi hosting.
- Checkpoint public metadata trong owned tmp fixture, missing receipt reconciliation và compare-before-execute state/action/side pins. Không có endpoint persistence qua process restart, authenticated production collector/transport hoặc production key executor.

## Kiểm tra

```sh
npm run test:key-coordinator-workflow
npm run test:key-coordinator
```

Suite coordinator kiểm32 nhóm, chạy tuần tự trong một cleanup wrapper và không sửa receipt lịch sử. PR adapter check hiện có chạy native adapter rồi contract/suite mới khi các file module liên quan thay đổi. Workflow coordinator riêng vẫn chỉ manual, source SHA/read-only, không có deploy; chưa dùng nó như bằng chứng remote CI trước khi actual run được xác minh.

Các module local private-key loader/staging và các evidence/backup/artifact lịch sử vẫn giữ riêng tại workspace nếu không được chọn vào commit. Tài liệu nghiệm thu local mô tả giới hạn của từng lượt; không suy kết quả runner sạch từ hash của worktree.

## Đường production

Hosting vẫn theo R6: source `50437bd16eae1912d8cffea093401449786faaea`, payload `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`, private inbox/Manual. Mọi phát hành sau này vẫn cần exact source/CI/payload/manifest/baseline và gate hosting riêng. Không upload code/ZIP trực tiếp từ local hoặc đưa credential, database, backup hay media vào source review.
