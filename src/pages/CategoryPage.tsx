import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categories, needs } from '../data/categories';
import { resources } from '../data/resources';
import { ProductCard } from '../components/ProductCard';
import { useSEO } from '../utils/useSEO';
import { 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Star, 
  Check, 
  ShieldCheck, 
  ShoppingBag, 
  FileCheck2, 
  Award
} from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeed, setSelectedNeed] = useState('');
  const [minStars, setMinStars] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'top_sales' | 'latest' | 'popular'>('top_sales');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Find category by slug or id
  const category = useMemo(() => {
    return categories.find((c) => c.slug === slug || c.id === slug);
  }, [slug]);

  // Filter products belonging to this category
  const categoryProducts = useMemo(() => {
    if (!category) return [];
    return resources.filter((r) => r.category.toLowerCase() === category.name.toLowerCase());
  }, [category]);

  // Apply search, need filter & sort
  const filteredProducts = useMemo(() => {
    return categoryProducts
      .filter((p) => {
        const matchesSearch =
          !searchTerm.trim() ||
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.need.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesNeed = !selectedNeed || p.need.toLowerCase() === selectedNeed.toLowerCase();
        const matchesStars = !minStars || (p.stars !== null && p.stars >= minStars);

        return matchesSearch && matchesNeed && matchesStars;
      })
      .sort((a, b) => {
        if (sortBy === 'top_sales') return (b.stars || 0) - (a.stars || 0);
        if (sortBy === 'latest') return b.id - a.id;
        return (b.stars || 0) - (a.stars || 0);
      });
  }, [categoryProducts, searchTerm, selectedNeed, minStars, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedNeed('');
    setMinStars(0);
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm || selectedNeed || minStars > 0);

  // SEO & Schema for Category
  useSEO({
    title: category ? `${category.name} — Tuyển Chọn Công Cụ Số Chuẩn EEAT | VibeLab Việt` : 'Danh mục công cụ',
    description: category?.description || 'Khám phá các công cụ và phần mềm chọn lọc theo danh mục tại VibeLab Việt.',
    canonicalUrl: category ? `https://store.vneconomics.com/danh-muc/${category.slug}` : 'https://store.vneconomics.com/tai-nguyen',
    keywords: category ? [category.name, 'công cụ số', 'phần mềm 0đ', 'mã nguồn mở', 'VibeLab Việt'] : [],
    jsonLdSchemas: category ? [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': category.name,
        'description': category.description,
        'url': `https://store.vneconomics.com/danh-muc/${category.slug}`,
        'hasPart': filteredProducts.map((p) => ({
          '@type': 'SoftwareApplication',
          'name': p.title,
          'url': `https://store.vneconomics.com/san-pham/${p.slug}`,
          'applicationCategory': category.name,
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'VND'
          }
        }))
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Trang chủ',
            'item': 'https://store.vneconomics.com/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Sàn công cụ',
            'item': 'https://store.vneconomics.com/tai-nguyen'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': category.name,
            'item': `https://store.vneconomics.com/danh-muc/${category.slug}`
          }
        ]
      }
    ] : []
  });

  if (!category) {
    return (
      <div className="bg-surface-100 min-h-[70vh] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white p-12 rounded-xl shadow-soft border border-slate-200">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-ink-900">Không tìm thấy danh mục yêu cầu</h2>
            <p className="mt-2 text-sm text-ink-500">Danh mục bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật.</p>
            <Link
              to="/tai-nguyen"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors shadow-xs"
            >
              <span>Về Sàn Công Cụ VibeLab</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Left Sidebar Filter
  const FilterSidebar = (
    <div className="space-y-5 text-ink-800">
      {/* Header: BỘ LỌC TÌM KIẾM */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 font-extrabold text-xs uppercase tracking-wider text-ink-900">
        <Filter className="w-4 h-4 text-brand-600" />
        <span>BỘ LỌC TÌM KIẾM</span>
      </div>

      {/* 1. Theo Danh Mục */}
      <div>
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Danh Mục Khác</h4>
        <div className="space-y-1 text-xs">
          <Link
            to="/tai-nguyen"
            className="w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-colors text-ink-600 hover:text-brand-600 hover:bg-slate-50"
          >
            <span>Tất Cả Danh Mục</span>
          </Link>
          {categories.map((c) => {
            const isCurrent = c.slug === category.slug;
            return (
              <Link
                key={c.id}
                to={`/danh-muc/${c.slug}`}
                className={`w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-colors ${
                  isCurrent ? 'text-brand-600 font-bold bg-brand-50' : 'text-ink-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate pr-1">• {c.name}</span>
                {isCurrent && <ChevronRight className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Dịch Vụ & Tiêu Chuẩn */}
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Dịch Vụ & Tiêu Chuẩn</h4>
        <div className="space-y-1.5 text-xs text-ink-600">
          <label className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
            <input type="checkbox" defaultChecked className="accent-brand-600 rounded" />
            <span>Miễn phí 0đ (Kỹ thuật số)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
            <input type="checkbox" defaultChecked className="accent-brand-600 rounded" />
            <span>Thẩm định EEAT Verified</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
            <input type="checkbox" defaultChecked className="accent-brand-600 rounded" />
            <span>Mã Nguồn Mở 100%</span>
          </label>
        </div>
      </div>

      {/* 3. Nhu Cầu Sử Dụng */}
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Việc Cần Làm Trong Ngành</h4>
        <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
          {needs.map((n) => (
            <label
              key={n.id}
              onClick={() => { setSelectedNeed(selectedNeed === n.name ? '' : n.name); setCurrentPage(1); }}
              className={`flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer transition-colors ${
                selectedNeed === n.name ? 'text-brand-600 font-bold bg-brand-50' : 'text-ink-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center shrink-0 ${
                selectedNeed === n.name ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
              }`}>
                {selectedNeed === n.name && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <span className="truncate">{n.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Đánh Giá */}
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Đánh Giá</h4>
        <div className="space-y-1.5 text-xs text-ink-600">
          {[
            { label: '5 sao (Từ 100k sao)', val: 100000 },
            { label: '4 sao trở lên (Từ 50k sao)', val: 50000 },
            { label: '3 sao trở lên (Từ 10k sao)', val: 10000 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => { setMinStars(minStars === item.val ? 0 : item.val); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 w-full text-left py-1 px-1.5 rounded transition-colors ${
                minStars === item.val ? 'bg-brand-50 text-brand-600 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[11px] truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Khoảng Giá */}
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Khoảng Giá</h4>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            readOnly
            value="₫ 0"
            className="w-full bg-slate-100 border border-slate-300 rounded py-1 px-2 text-center text-ink-700 font-bold text-[11px]"
          />
          <span>-</span>
          <input
            type="text"
            readOnly
            value="₫ 0"
            className="w-full bg-slate-100 border border-slate-300 rounded py-1 px-2 text-center text-ink-700 font-bold text-[11px]"
          />
        </div>
        <button
          disabled
          className="w-full mt-2 py-1.5 bg-brand-600 text-white text-xs font-bold rounded uppercase tracking-wider opacity-90 cursor-default"
        >
          ÁP DỤNG (MIỄN PHÍ)
        </button>
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-slate-200">
          <button
            onClick={handleClearFilters}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 text-white text-xs font-bold rounded shadow-xs hover:bg-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>XÓA TẤT CẢ</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-surface-100 min-h-screen pb-16 text-ink-900">
      
      {/* Category Top Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white py-8 border-b border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-white/80 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>›</span>
            <Link to="/tai-nguyen" className="hover:text-white transition-colors">Sàn công cụ</Link>
            <span>›</span>
            <span className="text-white font-bold">{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-brand-950">
                  CHUYÊN MỤC TUYỂN CHỌN
                </span>
                <span className="text-xs font-medium text-white/90 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  Đã thẩm định EEAT
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xs p-3 rounded-lg border border-white/20 self-start md:self-auto">
              <div className="text-center px-2">
                <div className="text-lg font-black text-white">{categoryProducts.length}</div>
                <div className="text-[10px] uppercase text-white/80 font-bold">Công cụ 0đ</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center px-2">
                <div className="text-lg font-black text-amber-300">5.0 ★</div>
                <div className="text-[10px] uppercase text-white/80 font-bold">Thẩm định</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Marketplace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* CỘT TRÁI: Bộ lọc (1 cột / 5) */}
          <aside className="lg:col-span-1 hidden lg:block bg-white p-4 rounded-xl shadow-soft border border-slate-200 h-fit">
            {FilterSidebar}
          </aside>

          {/* CỘT PHẢI: Nội dung sàn & Danh sách sản phẩm (4 cột / 5) */}
          <main className="lg:col-span-4 space-y-4">
            
            {/* Sort & Filter Bar */}
            <div className="bg-slate-200/70 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-ink-600 font-medium">Sắp xếp theo:</span>
                
                <button
                  onClick={() => setSortBy('top_sales')}
                  className={`px-4 py-1.5 rounded font-semibold transition-all ${
                    sortBy === 'top_sales'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white text-ink-800 hover:bg-slate-50'
                  }`}
                >
                  Bán chạy nhất
                </button>

                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-4 py-1.5 rounded font-semibold transition-all ${
                    sortBy === 'popular'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white text-ink-800 hover:bg-slate-50'
                  }`}
                >
                  Phổ biến
                </button>

                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-4 py-1.5 rounded font-semibold transition-all ${
                    sortBy === 'latest'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white text-ink-800 hover:bg-slate-50'
                  }`}
                >
                  Mới nhất
                </button>
              </div>

              {/* Mini Pagination */}
              <div className="flex items-center gap-3">
                <span className="text-ink-700">
                  <span className="text-brand-600 font-bold">{currentPage}</span>/{totalPages}
                </span>
                <div className="flex items-center">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className={`w-8 h-8 bg-white border border-slate-300 rounded-l flex items-center justify-center ${
                      currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 text-ink-600" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className={`w-8 h-8 bg-white border border-l-0 border-slate-300 rounded-r flex items-center justify-center ${
                      currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 text-ink-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-ink-500 font-medium">Đang lọc theo:</span>
                {selectedNeed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 border border-brand-200 text-brand-700 font-medium">
                    Nhu cầu: {selectedNeed}
                  </span>
                )}
                {minStars > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 border border-brand-200 text-brand-700 font-medium">
                    Đánh giá: ≥ {minStars / 1000}k sao
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-ink-500 hover:text-brand-600 underline text-[11px] ml-auto font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Product Grid (4-column layout) */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-soft">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-ink-800">Không tìm thấy công cụ phù hợp</h3>
                <p className="text-xs text-ink-500 mt-1">Hãy thử xóa bộ lọc hoặc chọn tiêu chí khác.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded uppercase tracking-wider hover:bg-brand-700 transition-colors"
                >
                  XÓA BỘ LỌC
                </button>
              </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={`w-10 h-8 rounded border text-xs font-bold flex items-center justify-center transition-colors ${
                    currentPage <= 1 ? 'border-slate-200 text-slate-300' : 'border-slate-300 bg-white text-ink-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-8 rounded text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-ink-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className={`w-10 h-8 rounded border text-xs font-bold flex items-center justify-center transition-colors ${
                    currentPage >= totalPages ? 'border-slate-200 text-slate-300' : 'border-slate-300 bg-white text-ink-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* EEAT & SEO Comprehensive Category Guide */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 mt-8 space-y-6 text-ink-800 shadow-soft">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                  TIÊU CHUẨN EEAT & ĐÁNH GIÁ CHUYÊN MÔN
                </span>
                <h2 className="text-lg font-bold text-ink-900 mt-2">
                  Tổng quan thẩm định & Hướng dẫn sử dụng ngành {category.name}
                </h2>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Tất cả công cụ thuộc danh mục <strong>{category.name}</strong> trên sàn VibeLab Việt đều tuân thủ nguyên tắc kiểm định nghiêm ngặt: minh bạch mã nguồn, xác thực đường dẫn tác giả trên GitHub, phân tích điều kiện môi trường chạy và không chứa mã độc.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-ink-900 mb-1">
                    <FileCheck2 className="w-4 h-4 text-brand-600" />
                    <span>Minh Bạch Giấy Phép</span>
                  </div>
                  <p className="text-ink-600 leading-normal">
                    Chỉ tuyển chọn các công cụ phát hành theo giấy phép mở (MIT, Apache 2.0, GPL), cho phép sử dụng miễn phí cho mục đích cá nhân lẫn doanh nghiệp.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-ink-900 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cảnh Báo Phần Cứng</span>
                  </div>
                  <p className="text-ink-600 leading-normal">
                    Ghi rõ yêu cầu RAM, GPU VRAM, phiên bản Python hoặc Node.js để người dùng đánh giá trước khi cài đặt, tránh lãng phí tài nguyên.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-ink-900 mb-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Chuẩn SEO, AEO & GEO</span>
                  </div>
                  <p className="text-ink-600 leading-normal">
                    Dữ liệu có cấu trúc CollectionPage, SoftwareApplication và BreadcrumbList hỗ trợ các công cụ tìm kiếm và mô hình ngôn ngữ lớn (LLMs).
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-ink-400 flex items-center justify-between">
                <span>Danh mục cập nhật lần cuối: 2026-11-08</span>
                <span className="font-semibold text-ink-700">Ban Biên Tập VibeLab Việt</span>
              </div>
            </div>

          </main>
        </div>
      </div>

    </div>
  );
};
