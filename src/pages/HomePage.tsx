import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { resources } from '../data/resources';
import { categories } from '../data/categories';
import { guides } from '../data/guides';
import { useSEO } from '../utils/useSEO';
import { 
  Zap, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Gift, 
  Bot, 
  FileCode, 
  Star,
  Layers,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Products subsets
  const flashSaleProducts = resources.slice(0, 6);
  const mallProducts = resources.filter(r => (r.stars || 0) >= 50000).slice(0, 6);
  const [discoverLimit, setDiscoverLimit] = useState(18);
  const discoverProducts = resources.slice(0, discoverLimit);

  // SEO & Schema for HomePage
  useSEO({
    title: 'VibeLab Việt — Sàn Thư Viện Công Cụ Số Có Biên Tập Chuẩn EEAT',
    description: 'Sàn thư viện công cụ số, AI tools, phần mềm mã nguồn mở với giá 0đ. Đã thẩm định EEAT, chuẩn SEO, AEO và GEO.',
    canonicalUrl: 'https://store.vneconomics.com/',
    ogImage: 'https://store.vneconomics.com/favicon.svg',
    keywords: ['VibeLab Việt', 'sàn công cụ số', 'vneconomics store', 'công cụ AI 0d', 'mã nguồn mở', 'chuẩn EEAT'],
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

  // Quick shortcuts
  const quickShortcuts = [
    { label: 'Khung Giờ Săn 0Đ', icon: <Flame className="w-6 h-6 text-brand-600" />, link: '/tai-nguyen' },
    { label: 'Thư Viện Chính Hãng', icon: <ShieldCheck className="w-6 h-6 text-brand-700" />, link: '/tai-nguyen?stars=100000' },
    { label: 'Mã Giảm 100%', icon: <Gift className="w-6 h-6 text-cyan-600" />, link: '/tai-nguyen' },
    { label: 'Phân Phối 0đ', icon: <Truck className="w-6 h-6 text-emerald-600" />, link: '/tai-nguyen' },
    { label: 'AI Agents & LLM', icon: <Bot className="w-6 h-6 text-blue-600" />, link: '/danh-muc/coding-agent' },
    { label: 'Markdown & PDF', icon: <FileCode className="w-6 h-6 text-indigo-600" />, link: '/danh-muc/chuyen-doi-tai-lieu' },
    { label: 'Thẩm Định EEAT', icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />, link: '/tieu-chi' },
    { label: 'Top GitHub Sao', icon: <Star className="w-6 h-6 text-amber-500" />, link: '/tai-nguyen?stars=50000' },
  ];

  return (
    <div className="bg-surface-100 min-h-screen pb-16 text-ink-900">
      
      {/* 1. Top Banners Section (Main Carousel + 2 Sub Banners) */}
      <section className="bg-white pb-6 shadow-soft border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            
            {/* Big Main Banner (2 cols) */}
            <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white p-8 sm:p-12 flex flex-col justify-between min-h-[260px] shadow-soft">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Sàn Thư Viện Công Cụ Số Có Biên Tập</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-xs">
                  Tìm Đúng Công Cụ. <br />
                  Hiểu Trước Khi Dùng.
                </h1>
                <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed">
                  100+ công cụ phần mềm tuyển chọn dành cho người Việt, thẩm định nghiêm ngặt theo tiêu chuẩn EEAT, dẫn trực tiếp về kho GitHub chính thức.
                </p>
              </div>

              <div className="pt-6 flex items-center gap-3">
                <Link
                  to="/tai-nguyen"
                  className="px-6 py-2.5 rounded-lg bg-white text-brand-700 text-xs font-black uppercase tracking-wider shadow hover:bg-slate-50 transition-colors"
                >
                  Khám Phá Toàn Bộ Sàn
                </Link>
                <Link
                  to="/tieu-chi"
                  className="px-5 py-2.5 rounded-lg bg-black/20 text-white text-xs font-bold hover:bg-black/30 transition-colors"
                >
                  Tiêu Chuẩn Thẩm Định
                </Link>
              </div>
            </div>

            {/* 2 Mini Side Banners (1 col) */}
            <div className="grid grid-rows-2 gap-3">
              <div className="bg-gradient-to-br from-brand-900 to-brand-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-soft">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-cyan-400 text-brand-950 px-2 py-0.5 rounded">
                    MÃ NGUỒN MỞ 100%
                  </span>
                  <h3 className="text-base font-bold mt-1.5">Minh Bạch & An Toàn</h3>
                  <p className="text-xs text-white/80 mt-0.5">Không mã độc, không chèn backlink quảng cáo.</p>
                </div>
                <Link to="/tai-nguyen" className="text-xs font-bold flex items-center gap-1 text-cyan-300 hover:underline">
                  <span>Khám phá ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-cyan-600 to-brand-700 rounded-xl p-5 text-white flex flex-col justify-between shadow-soft">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    PHÂN PHỐI 0Đ
                  </span>
                  <h3 className="text-base font-bold mt-1.5">Truy Cập Miễn Phí</h3>
                  <p className="text-xs text-white/80 mt-0.5">Giao tức thì đường dẫn và tài liệu chính thức.</p>
                </div>
                <Link to="/tai-nguyen" className="text-xs font-bold flex items-center gap-1 text-white hover:underline">
                  <span>Về kho phần mềm</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Quick 8-Shortcuts Row */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 pt-8 text-center">
            {quickShortcuts.map((sc, idx) => (
              <Link
                key={idx}
                to={sc.link}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-500 group-hover:shadow-card transition-all">
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-800">
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
                className="p-3.5 rounded-lg border border-slate-100 hover:border-brand-500 hover:shadow-card transition-all flex flex-col justify-between group bg-slate-50/50 hover:bg-white"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 mb-2 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-[11px] text-ink-500 line-clamp-2 mt-1 leading-snug">
                    {c.description}
                  </p>
                </div>
                <span className="text-[10px] text-ink-400 mt-3 font-semibold block">
                  Đã thẩm định EEAT
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. "FLASH SPOTLIGHT" Section */}
        <section className="bg-white rounded-xl shadow-soft border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-brand-600 font-black text-lg italic tracking-tighter">
                <Zap className="w-5 h-5 fill-brand-600" />
                <span>TIÊU ĐIỂM SÔI ĐỘNG</span>
              </div>

              {/* Countdown box */}
              <div className="flex items-center gap-1 text-xs font-bold text-white">
                <span className="bg-slate-900 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-ink-900">:</span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-ink-900">:</span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            <Link to="/tai-nguyen" className="text-xs text-brand-600 font-bold hover:underline flex items-center">
              <span>Xem Tất Cả &gt;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {flashSaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 4. Top Repos / Thư Viện Chính Hãng */}
        <section className="bg-white rounded-xl shadow-soft border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                <span className="bg-brand-600 text-white px-2 py-0.5 rounded text-[10px]">VIBELAB</span>
                <span>CHÍNH HÃNG</span>
              </span>
              <div className="hidden sm:flex items-center gap-4 text-xs text-ink-600">
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

            <Link to="/tai-nguyen?stars=100000" className="text-xs text-brand-600 font-bold hover:underline">
              Xem Tất Cả &gt;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {mallProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 5. "GỢI Ý CÔNG CỤ HÔM NAY" Feed */}
        <section className="space-y-4">
          <div className="sticky top-14 z-10 bg-surface-100 pt-2 pb-2">
            <div className="bg-white border-b-4 border-brand-600 py-3 text-center shadow-soft rounded-t-lg">
              <h2 className="text-sm sm:text-base font-black uppercase text-brand-700 tracking-wider">
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
                className="px-12 py-3 bg-white border border-slate-300 text-ink-700 text-xs font-bold rounded-lg shadow-soft hover:bg-slate-50 hover:border-brand-400 transition-colors uppercase tracking-wider"
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
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                HƯỚNG DẪN THỰC CHIẾN
              </span>
              <h2 className="text-lg font-bold text-ink-900 mt-1">
                Kinh nghiệm & Hướng dẫn sử dụng công cụ số
              </h2>
            </div>
            <Link to="/huong-dan" className="text-xs text-brand-600 font-bold hover:underline flex items-center">
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
                    <span className="text-brand-600 font-semibold">{g.steps.length} bước</span>
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
