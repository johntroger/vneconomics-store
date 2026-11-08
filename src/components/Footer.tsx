import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-ink-900">VibeLab Việt</span>
            </Link>
            <p className="text-sm text-ink-500 max-w-md leading-relaxed">
              Thư viện công cụ số có biên tập dành cho người Việt. Giải thích công dụng, dẫn về nguồn gốc tác giả và nói rõ điều kiện thực thi trước khi dùng. Không quảng cáo, không gắn nhãn ảo.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/johntroger/vneconomics-store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 hover:text-brand-600 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>Mã nguồn mở trên GitHub</span>
              </a>
              <span className="text-slate-300">•</span>
              <Link
                to="/tieu-chi"
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-700 hover:text-brand-600 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tiêu chí tuyển chọn</span>
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-4">Điều hướng</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-ink-600 hover:text-brand-600 transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link to="/tai-nguyen" className="text-ink-600 hover:text-brand-600 transition-colors">Tất cả tài nguyên (100+)</Link>
              </li>
              <li>
                <Link to="/huong-dan" className="text-ink-600 hover:text-brand-600 transition-colors">Hướng dẫn thực hành</Link>
              </li>
              <li>
                <Link to="/tieu-chi" className="text-ink-600 hover:text-brand-600 transition-colors">Tiêu chí biên tập</Link>
              </li>
            </ul>
          </div>

          {/* Core Values */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-4">Cam kết biên tập</h3>
            <ul className="space-y-2.5 text-xs text-ink-500 leading-normal">
              <li>• Dẫn về đúng repo hoặc tài liệu gốc tác giả</li>
              <li>• Minh bạch điều kiện môi trường & cấu hình</li>
              <li>• Phân biệt rõ giữa đã đọc và đã thử nghiệm</li>
              <li>• Không phỏng đoán, không thổi phồng tính năng</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-400">
          <p>© {new Date().getFullYear()} VibeLab Việt. Dự án cộng đồng phi lợi nhuận thuộc Vneconomics.</p>
          <p className="flex items-center gap-1">
            Được xây dựng với <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> bằng Vite, React & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
};
