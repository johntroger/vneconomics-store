# Bản đồ tài liệu hiện hành

Ngày cập nhật: 28/10/2026
Mục đích: xác định tài liệu nào có quyền điều hành, tài liệu nào chỉ là lịch sử hoặc bằng chứng.

## Tài liệu điều hành

Đọc theo thứ tự:

1. [AGENTS.md](../AGENTS.md) — quyền, cleanup, phê duyệt từng gate và đường phát hành bắt buộc.
2. [website-rebuild-plan-current.vi.md](website-rebuild-plan-current.vi.md) — kiến trúc và các gate của website làm lại.
3. [deployment-runbook.vi.md](deployment-runbook.vi.md) — thao tác local/GitHub/Plesk khi đến gate phát hành.
4. [release-checklist.vi.md](release-checklist.vi.md) — checklist mở và đóng một lượt production.
5. [plesk-two-access-paths-plan-2026-10-27.vi.md](plesk-two-access-paths-plan-2026-10-27.vi.md) — giới hạn Shared Hosting và cách browser-assisted hiện hành.
6. [R1-product-content-contract.vi.md](rebuild/R1-product-content-contract.vi.md) — quyết định sản phẩm/nội dung/wireframe đã duyệt.
7. [R1-url-disposition.vi.md](rebuild/R1-url-disposition.vi.md) — ledger giữ/301/410/noindex đã duyệt cho URL hiện hành.
8. [R2-design-system.vi.md](rebuild/R2-design-system.vi.md) — hướng thiết kế, hợp đồng theme/plugin và test skeleton v2 đã duyệt.
9. [R2-rebuild.vi.md](acceptance/R2-rebuild.vi.md) — nghiệm thu R2 đã PASS và được chủ dự án duyệt.
10. [R31-discovery-contract.vi.md](rebuild/R31-discovery-contract.vi.md) — hợp đồng URL, nội dung và SEO cho hành trình khám phá đã duyệt.
11. [R31-rebuild.vi.md](acceptance/R31-rebuild.vi.md) — nghiệm thu R3.1 đã PASS và được chủ dự án duyệt.
12. [R32-search-contract.vi.md](rebuild/R32-search-contract.vi.md) — hợp đồng query/filter/result/detail R3.2 đã duyệt.
13. [R32-rebuild.vi.md](acceptance/R32-rebuild.vi.md) — nghiệm thu R3.2 PASS 41 kiểm tra và được chủ dự án duyệt.
14. [R33-rebuild.vi.md](acceptance/R33-rebuild.vi.md) — R3.3 PASS 37 kiểm tra và được chủ dự án duyệt preview.
15. [R4-rebuild.vi.md](acceptance/R4-rebuild.vi.md) — R4 PASS 10 kiểm tra và được chủ dự án duyệt kết quả.
16. [R51-cutover-contract.vi.md](rebuild/R51-cutover-contract.vi.md) — hợp đồng cài đặt/quay lui v2 đã duyệt.
17. [R51-rebuild.vi.md](acceptance/R51-rebuild.vi.md) — R5.1 PASS 29 kiểm tra và được chủ dự án duyệt kết quả.
18. [R52-rebuild.vi.md](acceptance/R52-rebuild.vi.md) — full gate/CI/hash/payload candidate PASS; chờ chủ dự án duyệt R6.

Nếu các tài liệu khác nhau: `AGENTS.md` quyết định quyền; kế hoạch tái thiết quyết định gate; runbook/checklist quyết định thao tác; receipt production mới nhất quyết định production thực tế. Không suy production từ working tree, README, CI artifact hoặc source commit mới hơn.

## Trạng thái phiên bản

| Lớp | Nguồn kiểm chứng | Hiện trạng |
|---|---|---|
| Development | Working tree/nhánh hiện tại | Theme v2 2.0.0; cây làm việc có thể chứa thay đổi ngoài candidate, không phát hành toàn bộ dirty tree |
| Rebuild candidate | Manifest R5.2 + source/CI/payload SHA | Theme 2.0.0/plugin 0.4.4/schema 3; source `50437bd16eae1912d8cffea093401449786faaea`, payload `fa4c67821008e0fcc4307fedf202bcdf95b85bb6`; chờ duyệt R6 |
| Production | Receipt U4 ngày 27/10/2026 | Theme 0.7.3, plugin 0.4.3, schema 3; source `7b7ae3454512576e676d43ebb10f274920ee2a34`, payload `80729d511b2f2f168a96a495a4e5cadc93377759` |

## Tài liệu lịch sử

Các tài liệu sau được giữ để truy vết nhưng không phải checklist cho website làm lại:

- `implementation-plan-gated.vi.md` phần S00–S16.
- `website-rebuild-master-plan-2026-10-27.vi.md`.
- Hợp đồng/báo cáo S02–S16 và bằng chứng staging.
- `S14-release-*`, `S15-*`, `S16-*` và nhánh `release-staging`.
- Profile/helper R2–R5 cũ, trừ dependency được kế hoạch hiện hành duyệt rõ.

Không xóa lịch sử, staging, backup hoặc evidence thật chỉ vì chúng không còn nằm trên đường hiện hành.

## Tài liệu nghiệm thu

`docs/acceptance/` chứa bằng chứng/biên nhận. Một báo cáo PASS chỉ chứng minh đúng phạm vi gate đó; không tự cấp quyền gate kế tiếp, merge main hoặc production.

R0A hiện hành: [R0A-rebuild-plan-v3.vi.md](acceptance/R0A-rebuild-plan-v3.vi.md).

R0B hiện hành: [R0B-fast-ci.vi.md](acceptance/R0B-fast-ci.vi.md) — PASS; PR #3 fast check thật đạt, chưa merge.

## Quy tắc cập nhật

- Thay đổi kiến trúc/gate: cập nhật kế hoạch tái thiết và liên kết tại đây.
- Thay đổi thao tác production: cập nhật runbook/checklist trong cùng gate.
- Phát hành mới: cập nhật trạng thái production từ receipt đã nghiệm thu, không từ working tree.
- Không ghi secret, database, raw screenshot nhạy cảm hoặc backup vào tài liệu public.
