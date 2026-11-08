import { CategoryInfo, NeedInfo } from '../types';

export const categories: CategoryInfo[] = [
  {
    id: 'tai-lieu-va-cong-viec-van-phong',
    name: 'Tài liệu và công việc văn phòng',
    description: 'Chuyển đổi PDF, Markdown, tự động hóa tài liệu và xử lý văn bản.',
    iconName: 'FileText'
  },
  {
    id: 'ghi-chu-va-tri-thuc-ca-nhan',
    name: 'Ghi chú và tri thức cá nhân',
    description: 'Quản lý kiến thức, kết nối ý tưởng và kho tài liệu cá nhân PKM.',
    iconName: 'BookOpen'
  },
  {
    id: 'workflow-va-ung-dung-truc-quan',
    name: 'Workflow và ứng dụng trực quan',
    description: 'Tự động hóa luồng làm việc, tích hợp API không cần viết mã.',
    iconName: 'GitFork'
  },
  {
    id: 'ai-tren-may-va-khong-gian-tro-chuyen',
    name: 'AI trên máy và không gian trò chuyện',
    description: 'Mô hình ngôn ngữ cục bộ, giao diện chat riêng tư bảo mật dữ liệu.',
    iconName: 'Cpu'
  },
  {
    id: 'coding-agent-va-cach-lam-du-an',
    name: 'Coding agent và cách làm dự án',
    description: 'Hỗ trợ lập trình viên tạo mã nguồn, sửa lỗi và kiến trúc phần mềm.',
    iconName: 'Terminal'
  },
  {
    id: 'skills-va-phuong-phap-lam-viec',
    name: 'Skills và phương pháp làm việc',
    description: 'Kỹ năng làm việc chuyên sâu, quy trình tối ưu hiệu suất công việc.',
    iconName: 'Zap'
  },
  {
    id: 'thiet-ke-va-hinh-anh',
    name: 'Thiết kế và hình ảnh',
    description: 'Xử lý hình ảnh, UI/UX, đồ họa vector và thiết kế thương hiệu.',
    iconName: 'Palette'
  },
  {
    id: 'am-thanh-va-video',
    name: 'Âm thanh và video',
    description: 'Biên tập đa phương tiện, chuyển giọng nói thành văn bản, tạo phụ đề.',
    iconName: 'Video'
  },
  {
    id: 'du-lieu-va-giao-dien-ung-dung',
    name: 'Dữ liệu và giao diện ứng dụng',
    description: 'Trực quan hóa dữ liệu, bảng dashboard và giao diện quản trị.',
    iconName: 'LayoutGrid'
  },
  {
    id: 'luu-tru-va-cong-cu-ca-nhan',
    name: 'Lưu trữ và công cụ cá nhân',
    description: 'Bảo mật mật khẩu, đồng bộ tệp tin, công cụ tiện ích hàng ngày.',
    iconName: 'FolderArchive'
  }
];

export const needs: NeedInfo[] = [
  { id: 'chuyen-doi-tai-lieu', name: 'Chuyển đổi tài liệu', description: 'Chuyển định dạng Word, PDF, Markdown' },
  { id: 'to-chuc-ghi-chu', name: 'Tổ chức ghi chú', description: 'Xây dựng Second Brain, liên kết ghi chú' },
  { id: 'tu-dong-hoa-cong-viec', name: 'Tự động hóa công việc', description: 'Nối các ứng dụng, loại bỏ thao tác lặp lại' },
  { id: 'chon-moi-truong-ai', name: 'Chọn môi trường AI', description: 'Chạy AI offline trên máy, bảo mật tài liệu' },
  { id: 'lam-viec-voi-coding-agent', name: 'Làm việc với coding agent', description: 'AI hỗ trợ viết mã, tự động kiểm thử' },
  { id: 'chon-skills-va-quy-trinh', name: 'Chọn skills và quy trình', description: 'Bộ quy chuẩn prompt và agent skills' },
  { id: 'thiet-ke-noi-dung-truc-quan', name: 'Thiết kế nội dung trực quan', description: 'Tạo hình ảnh minh họa, banner và giao diện' },
  { id: 'xu-ly-noi-dung-da-phuong-tien', name: 'Xử lý nội dung đa phương tiện', description: 'Cắt ghép video, lọc ồn, phụ đề tự động' },
  { id: 'trinh-bay-du-lieu', name: 'Trình bày dữ liệu', description: 'Biểu đồ, phân tích số liệu trực quan' },
  { id: 'quan-ly-tep-va-ung-dung', name: 'Quản lý tệp và ứng dụng', description: 'Lưu trữ đám mây, sao lưu an toàn' }
];
