# Nhóm "Tự động hóa công việc và workflow" — bản nháp cloud ngày 03/11/2026

Đợt mới nối tiếp đợt 100 bài ngày 25/10/2026; không trùng repo/slug/tiêu đề với 100 bài cũ (đã đối chiếu với `content.json` của batch-01..10). **Chỉ là bản nháp, chưa import, chưa xuất bản.** Dải batch 11–20 dành cho nhóm này; 10 bài này nằm chung `batch: 11`, key 101–110.

| Key | Bài | Repo | License (GitHub) | Sao (2026-11-03) | Commit gần nhất |
|---|---|---|---|---:|---|
| 101 | Kestra: tìm hiểu cách mô tả workflow bằng YAML và theo dõi từng lần chạy | [kestra-io/kestra](https://github.com/kestra-io/kestra) | Apache-2.0 | 30127 | 2026-11-02 |
| 102 | Node-RED: khám phá cách nối các sự kiện bằng sơ đồ luồng kéo thả | [node-red/node-red](https://github.com/node-red/node-red) | Apache-2.0 | 23806 | 2026-10-26 |
| 103 | Huginn: tìm hiểu các agent theo dõi web và gửi thông báo do bạn tự quản lý | [huginn/huginn](https://github.com/huginn/huginn) | MIT | 50272 | 2026-11-02 |
| 104 | Prefect: tìm hiểu cách biến script Python thành workflow có lịch và theo dõi | [PrefectHQ/prefect](https://github.com/PrefectHQ/prefect) | Apache-2.0 | 24106 | 2026-11-02 |
| 105 | Apache Airflow: hiểu workflow khai báo bằng mã, có lịch chạy và giao diện theo dõi | [apache/airflow](https://github.com/apache/airflow) | Apache-2.0 | 47350 | 2026-11-03 |
| 106 | Trigger.dev: khám phá tác vụ nền bền bỉ viết bằng TypeScript cho ứng dụng và agent | [triggerdotdev/trigger.dev](https://github.com/triggerdotdev/trigger.dev) | Apache-2.0 | 16700 | 2026-10-31 |
| 107 | Dagster: tìm hiểu cách khai báo dữ liệu cần tạo thay vì chỉ liệt kê các bước chạy | [dagster-io/dagster](https://github.com/dagster-io/dagster) | Apache-2.0 | 16361 | 2026-11-02 |
| 108 | Temporal: hiểu ý tưởng thực thi bền bỉ để workflow không mất trạng thái khi lỗi | [temporalio/temporal](https://github.com/temporalio/temporal) | MIT | 24143 | 2026-11-03 |
| 109 | changedetection.io: tìm hiểu việc theo dõi thay đổi của trang web và nhận thông báo | [dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io) | Apache-2.0 | 35467 | 2026-11-02 |
| 110 | Apache NiFi: tìm hiểu cách thiết kế luồng chuyển và xử lý dữ liệu trên giao diện trình duyệt | [apache/nifi](https://github.com/apache/nifi) | Apache-2.0 | 6289 | 2026-11-02 |

## Cách lấy dữ liệu
README đọc qua raw.githubusercontent.com; số sao, license, ngày commit lấy từ GitHub Search API (trang github.com và API repo bị proxy phiên cloud chặn). Mỗi `research/<key>.json` ghi URL, sao + ngày, license, README SHA256 và các mục README đã đọc.

## Điểm chưa chắc chắn
- Không cài hay chạy repo nào; mọi ví dụ là gợi ý biên tập, đã ghi rõ chưa chạy thử. Không có lệnh cài trong bài.
- License lấy từ metadata GitHub, chưa đối chiếu file LICENSE hay giấy phép phụ thuộc.
- Chi phí cloud/dịch vụ (Prefect Cloud, Trigger.dev cloud, bản trả phí changedetection.io) chưa kiểm tra.
- Yêu cầu môi trường của Apache NiFi, Airflow (bảng phiên bản đổi theo bản phát hành) chưa đọc kỹ.
- Dagster: README gốc chỉ là file trỏ; bài dùng `python_modules/dagster/README.md`.
- Không có `contentHash`; importer cần tự tính. `review.needed = true` cho mọi bài.
- Chưa có lịch sử sao nên bài không nhận xét tốc độ tăng.
