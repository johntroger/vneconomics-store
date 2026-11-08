import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ResourceCard } from '../components/ResourceCard';
import { ResourceDetailModal } from '../components/ResourceDetailModal';
import { resources } from '../data/resources';
import { categories } from '../data/categories';
import { guides } from '../data/guides';
import { Resource } from '../types';
import { 
  ArrowRight, 
  Layers, 
  FileText, 
  BookOpen, 
  Cpu, 
  Terminal, 
  Zap, 
  Palette, 
  Video, 
  LayoutGrid, 
  FolderArchive,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Top featured resources (picked from first batch & popular)
  const featuredResources = resources.slice(0, 6);

  // Category Icon mapper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-600" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-emerald-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'Palette': return <Palette className="w-5 h-5 text-purple-600" />;
      case 'Video': return <Video className="w-5 h-5 text-red-600" />;
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5 text-teal-600" />;
      case 'FolderArchive': return <FolderArchive className="w-5 h-5 text-orange-600" />;
      default: return <Layers className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero resources={resources} onSelectResource={setSelectedResource} />

      {/* Bento Grid: Khám phá theo nhu cầu & danh mục */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Cấu trúc theo mục đích
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mt-2">
              Khám phá theo việc bạn cần làm
            </h2>
            <p className="text-sm text-ink-500 mt-1 max-w-xl">
              Chọn nhóm nhu cầu thực tế để lọc ra các công cụ đã được đối chiếu điều kiện và tài liệu tác giả.
            </p>
          </div>
          <Link
            to="/tai-nguyen"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/tai-nguyen?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-400/60 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <h3 className="text-base font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-xs text-ink-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-ink-400 group-hover:text-brand-600">
                <span className="font-medium">Xem công cụ</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="bg-slate-50/70 border-y border-slate-200/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Chọn có lý do
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mt-2">
                Tài nguyên để bắt đầu
              </h2>
              <p className="text-sm text-ink-500 mt-1 max-w-xl">
                Mỗi mục cho biết công dụng, mức độ quan tâm từ cộng đồng và tình trạng xác minh. Mở chi tiết trước khi sang nguồn bên ngoài.
              </p>
            </div>
            <Link
              to="/tai-nguyen"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              <span>Xem toàn bộ 100+ tài nguyên</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                onSelect={setSelectedResource}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps: Lộ trình từ câu hỏi đến việc làm được */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Một lộ trình ngắn
          </span>
          <h2 className="text-3xl font-extrabold text-ink-900 mt-3">
            Từ câu hỏi đến việc làm được
          </h2>
          <p className="text-sm text-ink-500 mt-2">
            Ba bước này là trình tự thật, giúp bạn tiếp cận công cụ số an toàn và không bị ngợp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative">
            <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-brand-700 font-mono text-xs font-bold mb-4">
              Bước 1
            </span>
            <h3 className="text-lg font-bold text-ink-900">Nói việc bạn cần làm</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              Bắt đầu từ kết quả mong muốn, chẳng hạn chuyển đổi tài liệu, ghi chú kiến thức hoặc dựng trang giới thiệu — thay vì đuổi theo công nghệ mới nhất.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative">
            <span className="inline-block px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-mono text-xs font-bold mb-4">
              Bước 2
            </span>
            <h3 className="text-lg font-bold text-ink-900">Đọc điều kiện và giới hạn</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              Kiểm tra kỹ giấy phép, yêu cầu phần cứng/RAM, phiên bản ngôn ngữ và chi phí mô hình AI trước khi tiến hành cài đặt vào máy.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative">
            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono text-xs font-bold mb-4">
              Bước 3
            </span>
            <h3 className="text-lg font-bold text-ink-900">Bắt đầu với đầu ra nhỏ</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              Làm theo các bài hướng dẫn mẫu, tạo một thay đổi có thể kiểm chứng được ngay và luôn chuẩn bị phương án sao lưu, khôi phục.
            </p>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="bg-slate-50/70 border-t border-slate-200/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Thực hành an toàn
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mt-2">
                Bài hướng dẫn & thử nghiệm
              </h2>
              <p className="text-sm text-ink-500 mt-1 max-w-xl">
                Các quy trình mẫu giúp bạn thử nghiệm công cụ trên môi trường an toàn.
              </p>
            </div>
            <Link
              to="/huong-dan"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              <span>Xem tất cả bài viết</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((g) => (
              <div key={g.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-ink-400 mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{g.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-ink-900 leading-snug">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-xs text-ink-500 line-clamp-3 leading-relaxed">
                    {g.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to={`/huong-dan/${g.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800"
                  >
                    <span>Xem hướng dẫn từng bước</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-tr from-brand-900 to-ink-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Tiêu chí tuyển chọn
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
              Ít phỏng đoán hơn. Nhiều dấu vết hơn.
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Thư viện ưu tiên nội dung giúp người mới quyết định có nên dùng một công cụ, thay vì biến độ phổ biến thành lời khuyên mù quáng.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Dẫn về nguồn cụ thể
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Repo, commit hoặc tài liệu của tác giả luôn được đối chiếu rõ ràng.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Minh bạch giới hạn
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Thông tin chưa biết hoặc chưa kiểm thử được nói thẳng với người đọc.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Không tạo số liệu ảo
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Số sao GitHub, nhãn kiểm thử đều dựa trên dữ liệu thật tại thời điểm quan sát.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/tieu-chi"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-900 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>Đọc toàn bộ tiêu chí biên tập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Quick View */}
      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  );
};
