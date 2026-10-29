# U2 — giao diện sao GitHub và profile local

**PASS U2 local**, ngày 26/10/2026, sau khi chủ dự án trả lời “ok” cho bước U2. Nhánh `codex/github-stars-u2`. Gói ứng dụng đã kiểm từ source **eeb5e9331f58a8cfc0d3235dd5dea82c579c3558**, nằm tại `artifacts/pipeline/eeb5e9331f58a8cfc0d3235dd5dea82c579c3558/`; chưa push, dispatch CI hoặc triển khai. Các sửa harness/hồ sơ sau source này không đổi ứng dụng/verifier của gói. [Biên nhận chốt hash/cleanup](U2-github-stars/closeout.json).

## Kết quả

Theme **0.7.3** / plugin **0.4.3**, schema biên tập **3**, định dạng stats **1**. Card và chi tiết đọc số sao đã lưu, hiện ngày xác nhận GMT+7, nhãn cũ/chưa có dữ liệu. Có kiểm nguồn theo ID và owner/name; không coi sao là bằng chứng chạy thử. Không đổi nội dung hoặc cách sắp xếp. [Contract gói/quay lui](../github-stars/2026-10-26/U2-release-contract.vi.md).

Collector U1 được đóng gói vào plugin; mặc định tắt, chưa có transport HTTP thật/route/cron/scheduler. Không gọi GitHub khi khách xem trang. Profile **vne-073-043-stars1-schema3** là code-only, 38 file theme/11 file plugin; có archive quay về đúng cặp production0.7.2/0.4.2 nguồn4266b71. Profile và importer/publisher R2–R5 cũ không được nới để nhận U2.

## Kiểm thử

| Lệnh qua run-clean | Kết quả | Bằng chứng |
|---|---:|---|
| `test:github-stars-ui -- --release artifacts/pipeline/eeb5e9331f58a8cfc0d3235dd5dea82c579c3558` | 315 đạt | [Native UI](U2-github-stars/ui/results.json) |
| Collector tích hợp trong cùng fixture | 373 đạt | [Collector](U2-github-stars/ui/collector.json) |
| `test:github-stars-packages -- eeb5e9331f58a8cfc0d3235dd5dea82c579c3558` | 123 đạt | [ZIP/profile](U2-github-stars/packages/results.json) |
| `test:pipeline-ci -- --u2` | 73 đạt | [Provenance](U2-github-stars/ci-policy/policy-tests.json) |
| `test:pipeline-ci-cli -- --u2` | 9 đạt | [CLI thật, GitHub giả](U2-github-stars/ci-cli/cli-tests.json) |
| `test:release -- 594ccd9a7de812a49f2c0d8260d20cbfced71752 docs/acceptance/U2-github-stars/historical-S14` | 76 đạt | [S14 đóng băng](U2-github-stars/historical-S14/) |

Native WordPress/SQLite + Edge headless: 100 tài nguyên C100 tái dùng, tổng106resources/6guides/1practice; 14 URL legacy và shortcode, guide/copy/checklist/validation, tìm kiếm, canonical/noindex, private/password/REST bị chặn, no-store và plugin thiếu. Không có lỗi JS, request browser ngoài fixture hoặc PHP warning/fatal. Có ảnh ở1280/390/320px, không tràn ngang. [Card390px](U2-github-stars/ui/stars-result-390.png), [khối chi tiết390px](U2-github-stars/ui/stars-block-390.png): **12.345 sao là số giả kiểm giao diện**, không phải đo GitHub.

Quay lui file được thực hiện trong fixture rồi khôi phục cặp mới. Kiểm exact byte/version qua verifier; new theme/old plugin hiển thị chưa có số; old theme/new plugin và cặp cũ vẫn phục vụ tài nguyên. Posts/meta/terms, stats, validation và option cấu hình được giữ: [cặp trước](U2-github-stars/ui/rollback-previous.json), [cặp hiện tại](U2-github-stars/ui/rollback-current.json).

**Ngoại lệ cache đã đối chiếu:** WordPress `WP_Theme::get_pattern_cache()/set_pattern_cache()` xác thực cache block-pattern theo Version, nên tạo lại các `_site_transient_[timeout_]wp_theme_files_patterns-<hash>` khi đổi theme. Harness chỉ cho phép đúng key đã tồn tại trước rehearsal, payload patterns rỗng và version0.7.2/0.7.3; không bỏ qua tất cả transient/option. Hash mọi dữ liệu được bảo vệ trước/sau bằng nhau. Biên nhận vẫn liệt kê cache thực sự thay đổi.

Lượt đầu phát hiện builder chọn nhầm style.css của ví dụ Mộc Studio; đã sửa chọn đúng header gốc rồi kiểm lại theo Git SHA. Các lượt bổ sung quay lui phát hiện cache WordPress nêu trên; lượt chẩn đoán đầy đủ còn gặp giới hạn stdout, đã chuyển sang hash từng dòng để tránh dump nội dung. Giữ các biên nhận `failure*.json` trong thư mục UI. Đây là lỗi/điều chỉnh harness đã giải quyết, không ghi chúng thành PASS lịch sử. CLI R5 trong U2 pin fixture58aa, kiểm riêng việc R5 từ chối U2 và bảo toàn9file payload/50bằng chứng R5; không gọi đó là payload U2 không đổi.

Mọi lượt test, kể cả lỗi, đã qua run-clean và dọn fixture/cache sau khi đóng process/database. Lượt cuối exit0; kiểm sau chạy không còn fixture của lượt chạy, lock runner hoặc cache run mới. Hash database/config local đang dùng và nội dung S10 gốc giữ nguyên.

## Giới hạn và dừng

Không có API GitHub thật, lịch chạy, số sao mới trên production hoặc chứng nhận MariaDB/hosting. Kiểm14legacy là render/shortcode, không phải giao dịch WooCommerce. Không dùng fixture validation/số sao giả để xuất bản. Gói và bằng chứng local được giữ; chưa có CI GitHub U2.

**Dừng U2.** U3 cần quyền riêng cho source GitHub/CI và staging, chốt publisher/installer code-only mới, ref/manifest/baseline/target; không lấy công cụ R4/R5 cũ để vượt guard. Vẫn đi local → GitHub/CI → payload GitHub → Plesk. Bật lịch vận hành là cổng sau nữa.
