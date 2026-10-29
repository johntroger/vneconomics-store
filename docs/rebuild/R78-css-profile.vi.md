# Profile candidate CSS-only trên baseline R6

Ngày 29/10/2026. Tiếp tục phần local/GitHub theo chỉ đạo “làm tiếp đi, hỏi ít thôi”; không thay production hoặc mở quyền triển khai.

## Hợp đồng

- Profile `vibelab-v2-r6-css-schema3` chỉ nhận exact source SHA chữ thường và đúng một thay đổi ứng dụng: `themes/vibelab-v2/style.css`. Không nhận thay đổi PHP/template, plugin, schema, deploy, file mới hoặc symlink/executable. Tài liệu/công cụ ngoài cây ứng dụng không được đưa vào ZIP.
- Baseline: source R6 `50437bd16eae1912d8cffea093401449786faaea`, payload `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`, manifest SHA256 `1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2`. Kiểm manifest pin, byte/hash ZIP theme/plugin và tái tạo theme ZIP baseline đúng byte.
- Candidate lấy CSS từ Git object; các file theme khác giữ nguyên R6. Builder chỉ stamp hai identity đã biết: theme Version2.0.1 trong CSS/functions và marker `r6-css-<12 ký tự source SHA>`. Input vẫn là header2.0.0; không sửa source ứng dụng để tạo phiên bản giả trên main.
- Plugin0.4.4, gồm Stars, lấy nguyên byte từ payload R6; không rebuild từ header local0.4.3 và không reinstall plugin. Rollback theme lấy đúng ZIP2.0.0 R6, không dùng theme0.7.3/U4. Rollback plugin ZIP bằng plugin hiện hành và chỉ để đối chiếu, không phải chỉ thị cài lại.
- CSS giới hạn256KiB, UTF-8; cấm escape/backslash, markup/control bytes, import/url/expression. Đây là profile hẹp cho CSS trình bày, không phải parser/chứng nhận mọi tác động hiển thị. Thay đổi ngoài phạm vi phải dùng profile khác.
- Năm file: manifest và bốn ZIP. Output bất biến, kiểm exact allowlist/regular file/hash; từ chối no-op source và output có sẵn. Không chứa dữ liệu, upload media, database, secret hoặc executor hosting.
- ClassA candidate chỉ nói phạm vi code; native installer có thể refresh cache WordPress. Gate production vẫn cần kiểm baseline/options, lock, rollback, phân loại backup và approval đúng lượt. Không có switch theme, migration, restore DB hoặc tác vụ collector.

## Lệnh local

```powershell
# Bộ kiểm policy nhanh, không khởi động WordPress:
node scripts/run-clean.mjs script scripts/test-r6-css-profile.mjs
# Chỉ khi sửa profile/native harness:
node scripts/run-clean.mjs script scripts/test-r6-css-profile.mjs --native
# Khi đã có source CSS thật, được review và commit:
node scripts/run-clean.mjs script scripts/release-r6-css.mjs build <source-SHA>
node scripts/run-clean.mjs script scripts/test-r6-css-candidate.mjs <source-SHA>
```

Builder ghi `artifacts/r6-css/<source-SHA>/`; chỉ là candidate local, không upload trực tiếp sang Plesk. Source hiện tại không đổi CSS sẽ bị từ chối, không tạo một release rỗng. Test sử dụng synthetic commit trong Git fixture được dọn, không push CSS mẫu lên GitHub/production.

## CI và ranh giới

Fast PR chạy policy thuần; không chạy native cho mỗi chỉnh sửa. Workflow `r6-css-candidate.yml` chỉ manual trên main: checkout controller SHA, kiểm HEAD/controller và ref production còn đúng R6, đọc source SHA qua Git objects, build, native theme-only update/rollback rồi lưu artifact21 ngày. Không checkout/thực thi script từ source candidate, không có secret/content-write/push/post-action/deploy.

Candidate native gate dùng baseline ZIP thật trên fixture WP7.1.3/PHP8.3/SQLite: fingerprint5bảng, hash từng file theme/plugin, HTTP version/marker/CSS hash và rollback nguyên version/marker/dữ liệu. Không chứng nhận Plesk/MariaDB hoặc live WP7.1.4, không thay visual review cho CSS thật.

Artifact CI không phải payload GitHub đã được Plesk nhận. Chưa nối profile này vào publisher/receiver tự động; vẫn cần source/CI/controller/payload/manifest pins, production approval và live verify/health/receipt. Profile hết hiệu lực khi `release-production` rời payload R6; không tự cập nhật baseline hoặc nới allowlist.
