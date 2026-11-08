import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ResourceDetailModal } from '../components/ResourceDetailModal';
import { resources } from '../data/resources';
import { categories } from '../data/categories';
import { guides } from '../data/guides';
import { Resource } from '../types';
import { useSEO } from '../utils/useSEO';
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
  Clock,
  ShoppingBag
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Resource | null>(null);

  // Top featured products (picked from first batch & popular)
  const featuredProducts = resources.slice(0, 6);

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

  // SEO & Schema for HomePage
  useSEO({
    title: 'VibeLab Việt — Sàn Thư Viện Công Cụ Số Có Biên Tập',
    description: 'Sàn thư viện công cụ số, giải pháp công nghệ và phần mềm chọn lọc dành cho người Việt. Chuẩn thẩm định EEAT, SEO, AEO và GEO.',
    canonicalUrl: 'https://store.vneconomics.com/',
    ogImage: 'https://store.vneconomics.com/favicon.svg',
    keywords: ['sàn công cụ số', 'VibeLab Việt', 'vneconomics store', 'công cụ AI', 'phần mềm miễn phí', 'mã nguồn mở'],
    jsonLdSchemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'VibeLab Việt',
        'url': 'https://store.vneconomics.com/',
        'description': 'Sàn thư viện công cụ số có biên tập dành cho người Việt',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://store.vneconomics.com/tai-nguyen?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Vneconomics',
        'url': 'https://store.vneconomics.com/',
        'logo': 'https://store.vneconomics.com/favicon.svg',
        'sameAs': [
          'https://github.com/johntroger/vneconomics-store'
        ]
      }
    ]
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero resources={resources} onSelectResource={setSelectedProduct} />

      {/* Sàn Danh mục Sản phẩm (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Chuyên mục Sàn giao dịch
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mt-2">
              Khám phá theo danh mục sản phẩm
            </h2>
            <p className="text-sm text-ink-500 mt-1 max-w-xl">
              Mỗi danh mục có đường dẫn URL chuyên biệt, tối ưu chuẩn SEO và kiểm định chất lượng nghiêm ngặt.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/danh-muc/${cat.slug}`}
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
                <span className="font-semibold">Vào danh mục</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase (E-Commerce Style) */}
      <section className="bg-slate-50/70 border-y border-slate-200/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Sản phẩm nổi bật
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mt-2">
                Top công cụ được cộng đồng đánh giá cao
              </h2>
              <p className="text-sm text-ink-500 mt-1 max-w-xl">
                Hình ảnh đại diện phù hợp nội dung, dẫn về nguồn tác giả chính thức và kiểm duyệt theo chuẩn EEAT.
              </p>
            </div>
            <Link
              to="/tai-nguyen"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Xem toàn bộ 100 sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps: Lộ trình cho người dùng */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Quy trình chuẩn
          </span>
          <h2 className="text-3xl font-extrabold text-ink-900 mt-3">
            Quy trình 3 bước tiếp cận công cụ an toàn
          </h2>
          <p className="text-sm text-ink-500 mt-2">
            Đảm bảo bạn nắm chắc điều kiện và cách dùng trước khi đưa vào sản phẩm thật.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative">
            <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-brand-700 font-mono text-xs font-bold mb-4">
              Bước 1
            </span>
            <h3 className="text-lg font-bold text-ink-900">Xác định việc cần làm</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              Tìm theo kết quả mong muốn trong danh mục sản phẩm tương ứng, tránh việc cài đặt quá nhiều công cụ trùng lặp.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative">
            <span className="inline-block px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-mono text-xs font-bold mb-4">
              Bước 2
            </span>
            <h3 className="text-lg font-bold text-ink-900">Kiểm tra thông số kỹ thuật</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              Đọc kỹ bảng Tech Specs và báo cáo thẩm định EEAT để biết trước yêu cầu cấu hình RAM, GPU, Python và chi phí.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative">
            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono text-xs font-bold mb-4">
              Bước 3
            </span>
            <h3 className="text-lg font-bold text-ink-900">Thực hành trên môi trường thử</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              Làm theo các bài hướng dẫn mẫu, tạo đầu ra kiểm chứng được và giữ nguyên trạng bản sao lưu an toàn.
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
                Cẩm nang thực hành
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mt-2">
                Bài viết hướng dẫn & Thử nghiệm
              </h2>
              <p className="text-sm text-ink-500 mt-1 max-w-xl">
                Từng bài viết có URL riêng, tối ưu chuẩn SEO và hướng dẫn chi tiết từng thao tác.
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
              <article key={g.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
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
                    <span>Xem bài viết chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EEAT Principles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-tr from-brand-900 to-ink-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Cam kết chất lượng sàn
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
              Đảm bảo Chuẩn SEO, AEO, GEO & Thẩm định EEAT
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Mọi sản phẩm trên sàn đều được chuẩn hóa cấu trúc dữ liệu JSON-LD (SoftwareApplication, BreadcrumbList, FAQPage) giúp các công cụ tìm kiếm và AI Answers trích xuất câu trả lời chính xác nhất.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  URL riêng biệt
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Mỗi category, mỗi bài viết đều có canonical URL riêng biệt không trùng lặp.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Ảnh đại diện 16:9
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Đầy đủ ảnh bìa chất lượng cao, tối ưu thẻ OpenGraph chia sẻ mạng xã hội.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  AEO & GEO Ready
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Định dạng hỏi - đáp trực tiếp phục vụ các mô hình ngôn ngữ lớn và Perplexity.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/tieu-chi"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-900 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>Đọc quy chuẩn thẩm định</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Quick View */}
      <ResourceDetailModal
        resource={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
