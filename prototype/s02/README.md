# Prototype S02

Bốn template tĩnh: index.html, category.html, resource-*.html, guide.html.
sample.html là landing page hư cấu của bài học, không phải website production.

- npm run prototype:build — dựng HTML/cover qua run-clean.
- npm run test:prototype — browser test; giữ ảnh/báo cáo trong docs/acceptance/S02.
- npm run prototype:dev — preview http://127.0.0.1:9420; Ctrl+C để dừng.

Dừng preview trước khi chạy test khác vì runner có lock, không chạy fixture song song.
Test dùng Playwright/Edge có sẵn; trên máy khác đặt VNE_PLAYWRIGHT_MODULE tới
index.mjs của Playwright đã cài. Không tự tải browser hoặc cài dependency.

Nguồn biên soạn: scripts/build-s02-prototype.mjs và source-observations.json trong
docs/acceptance/S02. Hình minh họa tự viết, các repo chưa cài/chạy. Không deploy thư
mục này, không coi lọc tĩnh là backend đã xong. Chờ chủ dự án duyệt trước S03.
