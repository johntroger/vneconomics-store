import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  SlidersHorizontal,
  X,
  Check
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ResourceDetailModal } from '../components/ResourceDetailModal';
import { resources } from '../data/resources';
import { categories, needs } from '../data/categories';
import { Resource } from '../types';
import { useSEO } from '../utils/useSEO';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Resource | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination state (E-Commerce style pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialNeed = searchParams.get('need') || '';
  const initialMinStars = searchParams.get('stars') ? parseInt(searchParams.get('stars')!, 10) : 0;

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedNeed, setSelectedNeed] = useState(initialNeed);
  const [minStars, setMinStars] = useState<number>(initialMinStars);
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'top_sales'>('top_sales');

  useEffect(() => {
    if (searchParams.get('q') !== null) setSearchTerm(searchParams.get('q') || '');
    if (searchParams.get('category') !== null) setSelectedCategory(searchParams.get('category') || '');
    if (searchParams.get('need') !== null) setSelectedNeed(searchParams.get('need') || '');
    if (searchParams.get('stars') !== null) setMinStars(parseInt(searchParams.get('stars') || '0', 10));
    setCurrentPage(1); // Reset page on filter change
  }, [searchParams]);

  // SEO
  useSEO({
    title: 'Sàn Công Cụ Số Có Biên Tập — VibeLab Việt',
    description: 'Khám phá và tra cứu hơn 100 công cụ số, AI tools, markdown converter tuyển chọn. Kiểm định chuẩn EEAT trên VibeLab Việt.',
    canonicalUrl: 'https://store.vneconomics.com/tai-nguyen',
    keywords: ['vibelab việt', 'sàn công cụ số', 'thư viện công cụ số', 'phần mềm miễn phí', 'mã nguồn mở', 'vneconomics'],
  });

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return resources
      .filter((item) => {
        const matchesSearch =
          !searchTerm.trim() ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.need.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          !selectedCategory || item.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesNeed =
          !selectedNeed || item.need.toLowerCase() === selectedNeed.toLowerCase();

        const matchesStars =
          !minStars || (item.stars !== null && item.stars >= minStars);

        return matchesSearch && matchesCategory && matchesNeed && matchesStars;
      })
      .sort((a, b) => {
        if (sortBy === 'top_sales') {
          return (b.stars || 0) - (a.stars || 0); // Bán chạy nhất / sao nhiều nhất
        }
        if (sortBy === 'latest') {
          return b.id - a.id; // Mới nhất
        }
        // Popular: Stars + ID
        return (b.stars || 0) - (a.stars || 0);
      });
  }, [searchTerm, selectedCategory, selectedNeed, minStars, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedNeed('');
    setMinStars(0);
    setSearchParams({});
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm || selectedCategory || selectedNeed || minStars > 0);

  // Left Sidebar Filter (E-Commerce 2-column pattern)
  const FilterSidebar = (
    <div className="space-y-5 text-ink-800">
      
      {/* Header: BỘ LỌC TÌM KIẾM */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200 font-extrabold text-xs uppercase tracking-wider text-ink-900">
        <Filter className="w-4 h-4 text-brand-600" />
        <span>BỘ LỌC TÌM KIẾM</span>
      </div>

      {/* 1. Theo Danh Mục */}
      <div>
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Theo Danh Mục</h4>
        <div className="space-y-1 text-xs">
          <button
            onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
            className={`w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-colors ${
              !selectedCategory ? 'text-brand-600 font-bold bg-brand-50' : 'text-ink-600 hover:text-brand-600 hover:bg-slate-50'
            }`}
          >
            <span>Tất Cả Danh Mục</span>
            {!selectedCategory && <ChevronRight className="w-3.5 h-3.5 text-brand-600" />}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedCategory(c.name); setCurrentPage(1); }}
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded text-left transition-colors ${
                selectedCategory.toLowerCase() === c.name.toLowerCase()
                  ? 'text-brand-600 font-bold bg-brand-50'
                  : 'text-ink-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate pr-1">• {c.name}</span>
              {selectedCategory.toLowerCase() === c.name.toLowerCase() && (
                <ChevronRight className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tiêu Chuẩn Thẩm Định */}
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Tiêu Chuẩn Biên Tập</h4>
        <div className="space-y-1.5 text-xs text-ink-600">
          <label className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
            <input type="checkbox" defaultChecked className="accent-brand-600 rounded" />
            <span>Thẩm định EEAT Verified</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
            <input type="checkbox" defaultChecked className="accent-brand-600 rounded" />
            <span>Mã Nguồn Mở 100%</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-brand-600">
            <input type="checkbox" defaultChecked className="accent-brand-600 rounded" />
            <span>Có hướng dẫn thực hành</span>
          </label>
        </div>
      </div>

      {/* 3. Nhu Cầu Sử Dụng */}
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase mb-2 text-ink-900">Việc Cần Làm</h4>
        <div className="space-y-1 text-xs max-h-44 overflow-y-auto pr-1">
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
        <div className="space-y-1 text-xs text-ink-600">
          {[
            { label: '5 sao (Từ 100k sao GitHub)', val: 100000 },
            { label: '4 sao trở lên (Từ 50k sao)', val: 50000 },
            { label: '3 sao trở lên (Từ 10k sao)', val: 10000 },
            { label: 'Tất cả đánh giá', val: 0 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => { setMinStars(item.val); setCurrentPage(1); }}
              className={`w-full flex items-center gap-1.5 py-1 px-1.5 rounded text-left transition-colors ${
                minStars === item.val ? 'text-brand-600 font-bold bg-brand-50' : 'hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center text-amber-500">
                <Star className={`w-3.5 h-3.5 ${item.val > 0 ? 'fill-current' : 'text-slate-300'}`} />
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Button: XÓA TẤT CẢ */}
      {hasActiveFilters && (
        <div className="pt-2">
          <button
            onClick={handleClearFilters}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>XÓA TẤT CẢ BỘ LỌC</span>
          </button>
        </div>
      )}

    </div>
  );

  return (
    <div className="bg-surface-100 min-h-screen py-5 text-ink-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="text-xs text-ink-500 mb-4 flex items-center gap-1.5">
          <Link to="/" className="text-brand-600 hover:underline">Trang chủ</Link>
          <ChevronRight className="w-3 h-3 text-ink-400" />
          <span className="text-ink-600">Sàn Công Cụ Số</span>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3 h-3 text-ink-400" />
              <span className="text-ink-900 font-semibold">{selectedCategory}</span>
            </>
          )}
        </div>

        {/* 2-COLUMN MARKETPLACE LAYOUT */}
        <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6">
          
          {/* LEFT COLUMN: FILTER SIDEBAR (Desktop) */}
          <aside className="hidden lg:block w-56 shrink-0 bg-white border border-slate-200/90 p-4 rounded-xl shadow-soft">
            {FilterSidebar}
          </aside>

          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden w-full flex items-center justify-between bg-white border border-slate-200/90 p-3 rounded-xl shadow-soft">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white font-bold text-xs rounded-lg"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>BỘ LỌC CÔNG CỤ {hasActiveFilters ? '(Đang lọc)' : ''}</span>
            </button>
            <span className="text-xs text-ink-500">
              {filteredProducts.length} sản phẩm
            </span>
          </div>

          {/* Mobile Slide Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
              <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <span className="font-bold text-sm text-brand-600">BỘ LỌC CÔNG CỤ</span>
                    <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  {FilterSidebar}
                </div>
                <div className="pt-3 border-t mt-4">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-2.5 bg-brand-600 text-white font-bold text-xs uppercase rounded-lg"
                  >
                    Xem {filteredProducts.length} công cụ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT COLUMN: CONTENT & PRODUCTS */}
          <section className="flex-1 min-w-0 w-full space-y-3">
            
            {/* Sort Bar */}
            <div className="bg-slate-200/70 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-ink-600 font-medium mr-1">Sắp xếp theo:</span>
                
                <button
                  onClick={() => setSortBy('top_sales')}
                  className={`px-4 py-2 rounded font-semibold shadow-xs transition-all ${
                    sortBy === 'top_sales'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-ink-800 hover:bg-white/80'
                  }`}
                >
                  Nhiều sao nhất
                </button>

                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-4 py-2 rounded font-semibold shadow-xs transition-all ${
                    sortBy === 'popular'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-ink-800 hover:bg-white/80'
                  }`}
                >
                  Phổ biến
                </button>

                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-4 py-2 rounded font-semibold shadow-xs transition-all ${
                    sortBy === 'latest'
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-ink-800 hover:bg-white/80'
                  }`}
                >
                  Mới nhất
                </button>
              </div>

              {/* Mini Pagination (1/5 < >) */}
              <div className="flex items-center gap-2">
                <span className="text-brand-600 font-bold">{currentPage}</span>
                <span className="text-ink-400">/{totalPages}</span>
                <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-200"></div>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-ink-500 font-medium">Đang lọc:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 border border-brand-200 text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    <span>{selectedCategory}</span>
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                  </span>
                )}
                {selectedNeed && (
                  <span className="inline-flex items-center gap-1 border border-brand-200 text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    <span>{selectedNeed}</span>
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedNeed('')} />
                  </span>
                )}
                {minStars > 0 && (
                  <span className="inline-flex items-center gap-1 border border-brand-200 text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    <span>Từ {minStars.toLocaleString()}★</span>
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setMinStars(0)} />
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 border border-slate-300 text-ink-800 bg-slate-50 px-2 py-0.5 rounded">
                    <span>"{searchTerm}"</span>
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </span>
                )}
              </div>
            )}

            {/* Product Grid (5-column on large screens) */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                {paginatedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20 bg-white border border-slate-200 rounded-xl p-8 shadow-soft">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-600 mb-4">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-sm font-bold text-ink-900">Không tìm thấy công cụ phù hợp</h3>
                <p className="mt-1 text-xs text-ink-500 max-w-sm mx-auto">
                  Hãy thử tìm bằng từ khóa chung hơn hoặc xóa bớt tiêu chí lọc bên trái.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold uppercase rounded-lg shadow-xs"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="py-8 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                  className="p-2 border border-slate-300 bg-white text-ink-600 rounded hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => { setCurrentPage(pNum); window.scrollTo(0, 0); }}
                      className={`w-9 h-9 text-xs font-bold rounded transition-all ${
                        currentPage === pNum
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-ink-700 hover:bg-slate-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                  className="p-2 border border-slate-300 bg-white text-ink-600 rounded hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </section>

        </div>

      </div>

      {/* Modal Quick View */}
      <ResourceDetailModal
        resource={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
};
