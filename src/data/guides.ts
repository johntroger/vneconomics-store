import { Guide } from '../types';

export const guides: Guide[] = [
  {
    id: 'antigravity-functional-trial',
    slug: 'antigravity-functional-trial',
    title: 'Antigravity: Thử đầu ra, sửa và khôi phục',
    excerpt: 'Hướng dẫn thực hành tạo một thay đổi nhỏ với Antigravity, kiểm tra kết quả ngay lập tức và giữ đường quay lại an toàn.',
    prerequisites: 'Cần môi trường Node.js và một repository Git sạch trên máy.',
    readTime: '7 phút đọc',
    steps: [
      {
        title: 'Bước 1: Xác định phạm vi thay đổi',
        description: 'Chỉ chọn một chi tiết giao diện hoặc component đơn lẻ. Không mở rộng sang logic nghiệp vụ hoặc database.'
      },
      {
        title: 'Bước 2: Chạy kiểm thử tự động',
        description: 'Chạy smoke test để xác nhận baseline ban đầu trước khi sửa đổi bất kỳ dòng mã nào.'
      },
      {
        title: 'Bước 3: Thực hiện thay đổi và nghiệm thu',
        description: 'Kiểm tra trực quan trên trình duyệt, đảm bảo responsive và xác nhận kết quả đạt chuẩn.'
      }
    ]
  },
  {
    id: 'claude-functional-trial',
    slug: 'claude-functional-trial',
    title: 'Claude Code: Thử sửa tiêu đề và khôi phục',
    excerpt: 'Trải nghiệm chỉnh sửa giao diện với Claude Code CLI: từ lúc đưa lệnh, duyệt diff đến lúc kiểm chứng.',
    prerequisites: 'Đã cài đặt Claude Code CLI và có API key hoạt động.',
    readTime: '5 phút đọc',
    steps: [
      {
        title: 'Bước 1: Khởi động phiên làm việc',
        description: 'Mở terminal tại thư mục dự án và gọi lệnh claude để bắt đầu tương tác với ngữ cảnh mã nguồn.'
      },
      {
        title: 'Bước 2: Yêu cầu sửa đổi có giới hạn',
        description: 'Mô tả rõ tệp cần chỉnh sửa, tránh lệnh chung chung khiến AI sửa nhiều file ngoài phạm vi.'
      },
      {
        title: 'Bước 3: Rà soát git diff',
        description: 'Sử dụng lệnh git diff để kiểm tra từng dòng thay đổi trước khi commit.'
      }
    ]
  },
  {
    id: 'huong-dan-chay-thu',
    slug: 'huong-dan-chay-thu',
    title: 'Quy trình chạy thử hai bài mẫu cho người mới',
    excerpt: 'Tổng hợp các bước an toàn nhất khi thử nghiệm công cụ mới: sandbox, biến môi trường mẫu và backup.',
    prerequisites: 'Kiến thức cơ bản về dòng lệnh terminal và quản lý tệp.',
    readTime: '10 phút đọc',
    steps: [
      {
        title: 'Bước 1: Sao lưu trước khi thử',
        description: 'Tạo bản sao lưu thư mục dự án hoặc tạo một nhánh git riêng biệt để thử nghiệm.'
      },
      {
        title: 'Bước 2: Sử dụng dữ liệu giả lập (Fixture)',
        description: 'Không dùng dữ liệu thật hoặc tài khoản quan trọng cho lần chạy đầu tiên.'
      },
      {
        title: 'Bước 3: Ghi chép và đánh giá',
        description: 'Đánh giá công cụ dựa trên độ dễ cài đặt, tài liệu và mức độ tiêu tốn tài nguyên máy.'
      }
    ]
  }
];
