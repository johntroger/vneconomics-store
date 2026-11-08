import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { resources } from '../data/resources';
import { categories } from '../data/categories';
import { guides } from '../data/guides';
import { useSEO } from '../utils/useSEO';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronRight, 
  Sparkles, 
  Bot, 
  FileCode, 
  Star,
  Layers,
  Clock,
  CheckCircle2,
  TrendingUp,
  Bookmark
} from 'lucide-react';

export const HomePage: React.FC = () => {
  // Products subsets
  const spotlightProducts = resources.slice(0, 6);
  const highlyRatedProducts = resources.filter(r => (r.stars || 0) >= 50000).slice(0, 6);
  const [discoverLimit, setDiscoverLimit] = useState(18);
  const discoverProducts = resources.slice(0, discoverLimit);

  // SEO & Schema for HomePage
  useSEO({
    title: 'VibeLab Việt — Sàn Thư Viện Công Cụ Số Có Biên Tập Chuẩn EEAT',
    description: 'Sàn thư viện công cụ số, AI tools, phần mềm mã nguồn mở tuyển chọn dành cho người Việt. Đã thẩm định EEAT, chuẩn SEO, AEO và GEO.',
    canonicalUrl: 'https://store.vneconomics.com/',
    ogImage: 'https://store.vneconomics.com/favicon.svg',
    keywords: ['VibeLab Việt', 'sàn công cụ số', 'vneconomics store', 'công cụ AI', 'mã nguồn mở', 'chuẩn EEAT'],
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
        'logo': 'https://store.vneconomics.com/favicon.svg'
      }
    ]
  });

  // Quick shortcuts for developers & researchers
  const quickShortcuts = [
    { label: 'Công Cụ Mới Nhất', icon: <TrendingUp className="w-5 h-5 text-brand-600" />, link: '/tai-nguyen' },
    { label: 'Kho Mã Nguồn Mở', icon: <ShieldCheck className="w-5 h-5 text-slate-700" />, link: '/tai-nguyen?stars=50000' },
    { label: 'Tài Liệu Hướng Dẫn', icon: <Bookmark className="w-5 h-5 text-indigo-600" />, link: '/huong-dan' },
    { label: 'Toàn Bộ Thư Viện', icon: <Layers className="w-5 h-5 text-teal-700" />, link: '/tai-nguyen' },
    { label: 'AI Agents & LLM', icon: <Bot className="w-5 h-5 text-blue-600" />, link: '/danh-muc/coding-agent' },
    { label: 'Markdown & PDF', icon: <FileCode className="w-5 h-5 text-slate-700" />, link: '/danh-muc/chuyen-doi-tai-lieu' },
    { label: 'Thẩm Định EEAT', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, link: '/tieu-chi' },
    { label: 'Top GitHub Stars', icon: <Star className="w-5 h-5 text-amber-500" />, link: '/tai-nguyen?stars=100000' },
  ];

  return (
    <div className="bg-surface-100 min-h-screen pb-16 text-ink-900">
      
      {/* 1. Top Banners Section (Calm, Eye-Friendly Palette) */}
      <section className="bg-white pb-6 shadow-xs border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Big Main Banner (2 cols) - Deep elegant slate/graphite, comfortable to read */}
            <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-gradient-to-br from-[#182334] via-[#141d2c] to-[#0f1724] text-white p-7 sm:p-10 flex flex-col justify-between min-h-[250px] border border-slate-800 shadow-soft">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sàn Thư Viện Công Cụ Số Có Biên Tập</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug tracking-tight text-white">
                  Tìm Đúng Công Cụ. <br />
                  <span className="text-slate-300">Hiểu Trước Khi Dùng.</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/90 max-w-lg leading-relaxed">
                  100+ công cụ phần mềm tuyển chọn dành cho người Việt, thẩm định nghiêm ngặt theo tiêu chuẩn EEAT, dẫn trực tiếp về kho GitHub chính thức.
                </p>
              </div>

              <div className="pt-6 flex items-center gap-3">
                <Link
                  to="/tai-nguyen"
                  className="px-5 py-2.5 rounded-lg bg-white text-ink-900 text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-slate-100 transition-colors"
                >
                  Khám Phá Toàn Bộ Sàn
                </Link>
                <Link
                  to="/tieu-chi"
                  className="px-4 py-2.5 rounded-lg bg-slate-800/90 text-slate-300 text-xs font-medium border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  Tiêu Chuẩn Thẩm Định
                </Link>
              </div>
            </div>

            {/* 2 Mini Side Banners (1 col) - Clean, soft off-white cards */}
            <div className="grid grid-rows-2 gap-3">
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 text-ink-900 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    MÃ NGUỒN MỞ 100%
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-ink-900 mt-2">Minh Bạch & An Toàn</h3>
                  <p className="text-xs text-ink-500 mt-0.5">Không mã độc, không chèn link độc hại.</p>
                </div>
                <Link to="/tai-nguyen" className="text-xs font-semibold flex items-center gap-1 text-brand-600 hover:underline pt-2">
                  <span>Khám phá ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 text-ink-900 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">
                    TRUY CẬP TRỰC TIẾP
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-ink-900 mt-2">Dẫn Về Nguồn Gốc</h3>
                  <p className="text-xs text-ink-500 mt-0.5">Dẫn trực tiếp về kho lưu trữ và tài liệu gốc.</p>
                </div>
                <Link to="/tai-nguyen" className="text-xs font-semibold flex items-center gap-1 text-brand-600 hover:underline pt-2">
                  <span>Về kho phần mềm</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Quick 8-Shortcuts Row */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-6 text-center">
            {quickShortcuts.map((sc, idx) => (
              <Link
                key={idx}
                to={sc.link}
                className="flex flex-col items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:border-slate-300 transition-all shadow-2xs">
                  {sc.icon}
                </div>
                <span className="text-xs font-medium text-ink-700 mt-2 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                  {sc.label}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        
        {/* 2. "DANH MỤC" Category Grid */}
        <section className="bg-white rounded-xl shadow-soft border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-ink-800">
              DANH MỤC CÔNG CỤ
            </h2>
            <Link to="/tai-nguyen" className="text-xs text-brand-600 font-bold hover:underline flex items-center">
              <span>Xem Tất Cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/danh-muc/${c.slug}`}
                className="p-3.5 rounded-lg border border-slate-200/80 hover:border-brand-500 hover:shadow-card transition-all flex flex-col justify-between group bg-slate-50/40 hover:bg-white"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 mb-2 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-[11px] text-ink-500 line-clamp-2 mt-1 leading-snug">
                    {c.description}
                  </p>
                </div>
                <span className="text-[10px] text-ink-400 mt-3 font-medium block">
                  Đã thẩm định EEAT
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. "CÔNG CỤ NỔI BẬT" Section (Replaces promotional flash sale) */}
        <section className="bg-white rounded-xl shadow-soft border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded">
                TIÊU ĐIỂM
              </span>
              <h2 className="text-sm sm:text-base font-bold text-ink-900 tracking-tight">
                Công cụ nổi bật & được đánh giá cao
              </h2>
            </div>

            <Link to="/tai-nguyen" className="text-xs text-brand-600 font-semibold hover:underline flex items-center">
              <span>Xem Tất Cả &gt;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {spotlightProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 4. Top Repos / Thư Viện Chính Hãng */}
        <section className="bg-white rounded-xl shadow-soft border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
                <span className="bg-slate-100 text-ink-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">VIBELAB</span>
                <span>CHÍNH HÃNG</span>
              </span>
              <div className="hidden sm:flex items-center gap-4 text-xs text-ink-500">
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-brand-600" /> Mã Nguồn Mở 100%
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Thẩm Định Độc Lập
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-brand-600" /> Tiếp Cận Tức Thì
                </span>
              </div>
            </div>

            <Link to="/tai-nguyen?stars=100000" className="text-xs text-brand-600 font-semibold hover:underline">
              Xem Tất Cả &gt;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {highlyRatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 5. "GỢI Ý CÔNG CỤ HÔM NAY" Feed */}
        <section className="space-y-4">
          <div className="sticky top-14 z-10 bg-surface-100 pt-2 pb-2">
            <div className="bg-white border-b-2 border-brand-600 py-2.5 text-center shadow-xs rounded-t-lg">
              <h2 className="text-xs sm:text-sm font-bold uppercase text-brand-700 tracking-wider">
                GỢI Ý CÔNG CỤ HÔM NAY
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {discoverProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {discoverLimit < resources.length && (
            <div className="text-center pt-6">
              <button
                onClick={() => setDiscoverLimit((prev) => Math.min(prev + 18, resources.length))}
                className="px-10 py-2.5 bg-white border border-slate-300 text-ink-700 text-xs font-semibold rounded-lg shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition-colors uppercase tracking-wider"
              >
                Xem Thêm Công Cụ
              </button>
            </div>
          )}
        </section>

        {/* 6. Hướng dẫn & Tiêu Chuẩn Thẩm Định EEAT */}
        <section className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                HƯỚNG DẪN THỰC CHIẾN
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink-900 mt-1">
                Kinh nghiệm & Hướng dẫn sử dụng công cụ số
              </h2>
            </div>
            <Link to="/huong-dan" className="text-xs text-brand-600 font-semibold hover:underline flex items-center">
              <span>Xem Tất Cả Hướng Dẫn</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((g) => (
              <Link
                key={g.id}
                to={`/huong-dan/${g.slug}`}
                className="group border border-slate-200 rounded-lg overflow-hidden hover:border-brand-500 transition-all bg-slate-50/40 hover:bg-white"
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-ink-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{g.readTime} đọc</span>
                    <span>•</span>
                    <span className="text-brand-600 font-medium">{g.steps.length} bước</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {g.title}
                  </h3>
                  <p className="text-xs text-ink-500 line-clamp-3 leading-relaxed">
                    {g.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
