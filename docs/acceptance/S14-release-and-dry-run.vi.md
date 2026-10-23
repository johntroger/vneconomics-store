# S14 — Gói phát hành và dry-run local

Ngày 23/10/2026. **PASS phạm vi S14 local**; không chứng nhận hosting hoặc cho phép deploy. Chủ dự án mở riêng S14 bằng yêu cầu “làm s14”. Phản hồi trải nghiệm S13 vẫn chờ, không tự ghi nhận đã duyệt giao diện.

## Ref và sản phẩm giữ lại

Nhánh `codex/s14-release-dry-run`. Checkpoint S13 `71d3f21`; implementation S14 `b628c10`; ref nguồn cuối đã build/test: **`594ccd9a7de812a49f2c0d8260d20cbfced71752`**. Không push hoặc thay main/release/deploy ref, Plesk target hay hosting.

Gói được lưu trong [artifacts/releases/594ccd9…](../../artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752/):

| Gói | File | Byte | SHA256 |
|---|---:|---:|---|
| `vne-library-core-0.4.2.zip` | 10 | 108507 | `2648f76f915c456ff4221a45862d60ecaf9cc5cdd468781ea8b302f6d63ee4c5` |
| `vibelab-0.7.0.zip` | 36 | 158966 | `f6124d7693e8c8af7e8dcd7668012b8c0ed986d338c2a9e864e0f77afa3f0778` |

[Manifest](../../artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752/manifest.json) nằm ngoài ZIP, ghi cùng source SHA, tree, hash/size từng file và gói, schema 3, cặp ứng viên plugin 0.4.2/theme 0.7.0, cặp trung gian plugin 0.4.2/theme 0.6.0 từ ref S12. Mỗi ZIP chứa đúng một thư mục thành phần. Không có DB/uploads/wp-config/key/tooling/README trong payload.

Đây là ứng viên từ commit nhánh phát triển, chưa phải payload production trên main. Trước phát hành thật cần duyệt riêng ref và cơ chế hosting theo [checklist](../S14-release-checklist.vi.md).

## Thay đổi

- Allowlist tường minh cho từng thành phần, kiểm tra toàn bộ cây source; README chỉ được phép tồn tại trong source và bị loại khỏi ZIP. Từ chối symlink/submodule/executable/file lạ/file thiếu.
- ZIP STORE có thứ tự ổn định, mốc thời gian cố định và CRC32, đọc nội dung từ Git blob thay vì working tree. Không đưa đường dẫn máy hoặc thời gian build vào gói. Build từ chối ghi đè artifact đã tồn tại.
- Verifier dựng lại bytes từ ref để đối chiếu cả hai ZIP và manifest, từ chối file ngoài bộ ba đầu ra.
- Dry-run cổng xác nhận chỉ nhận dữ liệu fixture; không có bộ deploy thật. Plugin chưa đạt/chậm/lỗi/mất xác nhận đều chặn theme; theme lỗi sau plugin đạt chọn phục hồi theme và giữ plugin thuộc cặp tương thích; vẫn chờ xác nhận cache khi cả hai thành phần đạt.
- Thêm runner packaging/runtime/postflight, npm scripts và workflow kiểm tra gói thủ công, quyền Git read-only. Không bật workflow phát hành hoặc gọi GitHub Actions.

## Kiểm thử trên ref cuối

Môi trường local Windows, Node v24.19.0; PHP native 8.3.36 riêng của S13, WordPress 7.1.3 và SQLite fixture. Không thay PATH/dịch vụ. Chạy các runner tuần tự qua run-clean.

| Lệnh | Kết quả |
|---|---|
| `npm run test:release -- 594ccd9a7de812a49f2c0d8260d20cbfced71752` | **76 PASS**: hai build giống byte; giải ZIP bằng PowerShell độc lập, hash/count; gói hỏng, manifest giả, file lạ/traversal, Git mode không hợp lệ; các cổng lỗi/timeout/mất xác nhận |
| `npm run build:release -- 594ccd9a7de812a49f2c0d8260d20cbfced71752` | **BUILT_AND_VERIFIED**; giữ hai ZIP và manifest |
| `npm run test:release-runtime -- artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752 594ccd9a7de812a49f2c0d8260d20cbfced71752` | **153 PASS**, gồm hash bản cài từ ZIP, PHP lint và **12 lượt HTTP** qua ba trạng thái × bốn trang |
| `npm run test:release-postflight -- artifacts/releases/594ccd9a7de812a49f2c0d8260d20cbfced71752` | **PASS**: artifact/source/runners, hash database/config gốc, bằng chứng S13, refs và cleanup |
| `git diff --check` | Không lỗi whitespace; Git có cảnh báo chuẩn hóa CRLF thành LF ở tài liệu. Gói lấy từ Git blob nên không phụ thuộc newline working tree |

Runtime giải đúng ZIP vào fixture mới; không dùng bản plugin/theme copy từ working tree để thay kiểm thử gói. Kiểm tra version/schema đang chạy, HTTP200, heading/nội dung, sáu thẻ, source CTA và no-store trên trang chủ/danh mục/chi tiết/bài học. Ba trạng thái: plugin mới/theme cũ → cặp ứng viên → theme phục hồi/plugin giữ nguyên.

Đã cố ý ghi theme transfer dở và tạo file thừa trong fixture, sau đó thay toàn bộ cây theme bằng bản trước; so hash từng file, xác nhận file thừa và `seo.php` mới bị loại, rồi mở lại cả bốn trang. Không rollback database; schema vẫn 3 và nội dung còn truy cập được. Không lỗi PHP warning/notice/deprecated/fatal qua các luồng này.

Lượt packaging đầu thất bại do regex ZIP chưa cho dấu `_` trong template WordPress; đã sửa và chạy lại trên ref cuối, không đổi allowlist để bỏ file bắt buộc. [Failure ban đầu](S14/package-failure-1792722560521.json) được giữ. Không dùng kết quả trước sửa thay kết quả cuối.

Bằng chứng: [package-results.json](S14/package-results.json), [runtime-results.json](S14/runtime-results.json), [postflight.json](S14/postflight.json).

## Cleanup và bảo toàn

Mỗi runner đóng tiến trình/server/database trước khi wrapper dọn fixture/cache, kể cả lượt lỗi. Hậu kiểm xác nhận `tmp/tests` trống, chỉ cache của chính postflight đang hoạt động ở thời điểm ghi báo cáo; wrapper đã dọn khi exit. Preview S13 được tạm dừng để không chạy fixture song song. Cache chính xác của preview đã đóng được dọn sau khi kiểm tra PID chủ 11168/12056 không còn; không xóa toàn bộ tmp hoặc theo tuổi file.

Giữ ZIP/manifest, nguồn, thư viện/PHP dependency, `.local/site`, `.local/s13-site`, tài khoản local và toàn bộ bằng chứng. Không tạo/gửi email, API trả phí, automation hoặc deploy. Preview mở lại sau kiểm thử giữ cache của tiến trình đang hoạt động tới lúc dừng.

## Hạn chế và bước kế tiếp chờ duyệt

- CI remote **CHƯA CHẠY**; chỉ chuẩn bị workflow thủ công Windows/Node22 và chạy cùng lệnh kiểm tra gói ở local Node24. Không gọi local PASS là GitHub Actions PASS.
- Chưa kiểm tra MySQL/Plesk/CDN/cache thật, backup/restore môi trường đích, tính nguyên tử hoặc timeout hosting. Restore fixture không thay diễn tập staging. Cặp theme thực tế khác cặp đã thử cần kiểm tra bổ sung.
- Không hạ về plugin 0.4.0 S12 làm fallback mặc định vì thiếu vá mutex S13. Khôi phục DB/migration cần quy trình riêng đã thử, không suy từ rollback file.
- S13 còn chờ phản hồi trải nghiệm. S14 PASS local không đóng thay phần này.

Đề nghị S15 để xác minh PHP/MySQL thật, backup/restore và cổng từng thành phần trên staging riêng. **Xin chủ dự án cho phép riêng S15 và xác nhận staging trước thao tác đó.** Theo AGENTS.md và kế hoạch gated, dừng tại đây; không tự triển khai S15/S16.
