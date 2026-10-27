# Bản đồ tài liệu hiện hành

Ngày cập nhật: 27/10/2026
Mục đích: xác định tài liệu nào có quyền điều hành, tài liệu nào chỉ là lịch sử hoặc bằng chứng.

## Tài liệu điều hành

Đọc theo thứ tự:

1. [AGENTS.md](../AGENTS.md) — quyền, cleanup, phê duyệt từng gate và đường phát hành bắt buộc.
2. [website-rebuild-plan-current.vi.md](website-rebuild-plan-current.vi.md) — kiến trúc và các gate của website làm lại.
3. [deployment-runbook.vi.md](deployment-runbook.vi.md) — thao tác local/GitHub/Plesk khi đến gate phát hành.
4. [release-checklist.vi.md](release-checklist.vi.md) — checklist mở và đóng một lượt production.
5. [plesk-two-access-paths-plan-2026-10-27.vi.md](plesk-two-access-paths-plan-2026-10-27.vi.md) — giới hạn Shared Hosting và cách browser-assisted hiện hành.

Nếu các tài liệu khác nhau: `AGENTS.md` quyết định quyền; kế hoạch tái thiết quyết định gate; runbook/checklist quyết định thao tác; receipt production mới nhất quyết định production thực tế. Không suy production từ working tree, README, CI artifact hoặc source commit mới hơn.

## Trạng thái phiên bản

| Lớp | Nguồn kiểm chứng | Hiện trạng |
|---|---|---|
| Development | Working tree/nhánh hiện tại | Theme 0.7.3, plugin 0.4.3, schema 3; có thể chứa thay đổi chưa commit |
| Rebuild candidate | Manifest R5 + source/CI/payload SHA | Chưa có candidate v3 |
| Production | Receipt/runbook production mới nhất | Theme 0.7.2, plugin 0.4.2, schema 3; source `4266b71990702d87969a847e95d9c39933cb05a4`, payload `dc4af296692ddac2dd71dc9f1be4a69f1af29959` |

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
