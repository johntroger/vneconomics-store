# Phát hành theme từ GitHub CI, không phụ thuộc hệ key

Publisher này nằm trên nhánh riêng từ main, hỗ trợ sửa CSS/PHP/template trong cây theme v2 hiện có. Plugin0.4.4/schema3, database, uploads và config được giữ nguyên; thay plugin/schema/thêm file theme cần scope mới. Các profile R52/R6 lịch sử không bị sửa hoặc dùng như bộ phát hành tùy ý.

`deploy/theme-release-baseline.json` pin payload/manifest đã phát hành. Builder đọc Git blob và ZIP thật của baseline; phiên bản patch kế tiếp tự tăng, rollback dùng đúng theme.zip của lần trước. Sau mỗi production đã nghiệm thu, cập nhật hai pins từ receipt vào config trong closeout; không sửa code publisher chỉ để đổi2.0.1→2.0.2. Source version/marker được stamp trong hai file identity của gói, có khai báo rõ trong manifest.

## Một lượt sửa website

1. Tạo nhánh từ main, sửa theme. Chạy test module/smoke phù hợp; unit publisher nhanh: `npm run test:theme-release -- --unit-only`. Full publisher/native: `npm run test:theme-release`. Mỗi lần dùng run-clean; không chạy hệ key hoặc test lịch sử không liên quan.
2. Push source/mở PR. Workflow `theme-release.yml` checkout exact SHA, đối chiếu production payload pin, chạy build/native install/HTTP/rollback và tạo artifact `theme-release-<source SHA>`. Artifact gồm manifest/bốn ZIP/proof/test/review khi có app change. Code-only không tạo gói phát hành giả: artifact review ghi NO_APPLICATION_CHANGE và proof fixtureOnly true.
3. `npm run release:theme -- review <CI run ID>` tải artifact, kiểm workflow/repo/source/jobs/expiry/attempt, SHA256 archive và file allowlist. Với thay đổi thật, kiểm native proof, đối chiếu artifact với Git blob, baseline live ref và controller đã merge main. Publisher/control changes phải review/merge trước, không nhập cả key tooling để sửa theme.
4. `npm run release:theme -- candidate <CI run ID>` chỉ tạo nhánh **candidate-production/<source SHA>** bằng GitHub create-ref, lỗi nếu đã tồn tại; không cập nhật/force nhánh cũ. Commit có đúng5 file và parent là payload production hiện hành. Dữ liệu commit lấy từ artifact đã xác minh, không thay bằng ZIP build lại hoặc ZIP working tree. Lệnh này không chạm release-production/Plesk.
5. Gate production mới duyệt exact source/CI/payload/manifest/baseline, visual review và backup/rollback theo cấp thay đổi. Dùng workflow promote đã có để fast-forward release-production theo expected_parent, rồi Plesk Pull/Deploy vào private inbox, native theme install, hậu kiểm và receipt. Không upload ZIP local trực tiếp. Các command/gate hosting phải được pin theo gói đã duyệt, không chạy command R6 cũ cho bản mới.

## Giới hạn và quyền

Publisher không bật Automatic/webhook/post-deploy action trên Plesk, không merge main, không tạo key hoặc gọi API trả phí. CI/native PASS chưa phải website đã cập nhật. Merge source và gate production vẫn cần quyền riêng; bước Plesk hiện theo đường Manual đã nghiệm thu. Chỉ gọi hoàn toàn tự động khi chặng Plesk đã được cấu hình/kiểm chứng trong gate tương ứng.

Test template giả chỉ nằm trong Git/WordPress fixture rồi được dọn; HTTP kiểm đúng text của template, marker/CSS hash, năm bảng dữ liệu, plugin bytes và rollback. Gói review code-only giữ rõ trạng thái không deploy, không đẩy payload hay canary lên production.
