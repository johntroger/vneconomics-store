import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ShieldCheck, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Resource } from '../types';

interface HeroProps {
  resources: Resource[];
  onSelectResource?: (resource: Resource) => void;
}

export const Hero: React.FC<HeroProps> = ({ resources, onSelectResource }) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const filteredResults = query.trim()
    ? resources
        .filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            r.need.toLowerCase().includes(query.toLowerCase()) ||
            r.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tai-nguyen?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/tai-nguyen');
    }
  };

  const quickChips = [
    { label: 'Chuyển đổi tài liệu', q: 'chuyển đổi tài liệu' },
    { label: 'AI trên máy', q: 'AI trên máy' },
    { label: 'Ghi chú tri thức', q: 'ghi chú' },
    { label: 'Coding agent', q: 'coding agent' },
    { label: 'Tự động hóa', q: 'tự động hóa' },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-surface-100">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Kicker badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Thư viện công cụ số có biên tập dành cho người Việt</span>
        </div>

        {/* H1 Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 leading-[1.12]">
          Tìm đúng công cụ. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500">
            Hiểu trước khi dùng.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
          Giải thích bằng tiếng Việt, dẫn về nguồn gốc và nói rõ điều kiện. Bắt đầu từ việc bạn muốn hoàn thành, không phải từ danh sách công nghệ.
        </p>

        {/* Search bar & autocomplete */}
        <div className="mt-8 max-w-2xl mx-auto relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-400">
              <Search className="w-5 h-5 text-brand-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Nhập việc bạn cần làm (Ví dụ: đọc PDF, markdown, ghi chú, làm landing page...)"
              className="w-full pl-11 pr-36 py-3.5 sm:py-4 rounded-2xl border border-slate-300 bg-white shadow-soft text-ink-900 text-sm sm:text-base placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Tìm kiếm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Real-time search preview popup */}
          {showResults && filteredResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200/90 text-left overflow-hidden z-30">
              <div className="p-2 space-y-1">
                {filteredResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setShowResults(false);
                      if (onSelectResource) {
                        onSelectResource(r);
                      } else {
                        navigate(`/tai-nguyen/${r.slug}`);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-left group"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-ink-900 group-hover:text-brand-600">
                        {r.title}
                      </h4>
                      <p className="text-xs text-ink-500 truncate max-w-md mt-0.5">
                        {r.excerpt}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded shrink-0 ml-2">
                      {r.need}
                    </span>
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-ink-500">
                <span>Nhấn Enter để xem toàn bộ kết quả</span>
                <span className="font-semibold text-brand-600 cursor-pointer" onClick={handleSearchSubmit}>
                  Xem tất cả →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick search chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-ink-400 font-medium">Gợi ý nhanh:</span>
          {quickChips.map((chip) => (
            <button
              key={chip.q}
              onClick={() => {
                setQuery(chip.q);
                navigate(`/tai-nguyen?q=${encodeURIComponent(chip.q)}`);
              }}
              className="text-xs font-medium text-ink-600 hover:text-brand-700 bg-white border border-slate-200 hover:border-brand-300 px-2.5 py-1 rounded-full transition-all shadow-2xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 3 Value Pillars */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center sm:flex-col sm:text-center gap-3 p-3 rounded-xl bg-white/60 border border-slate-200/50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900">Nguồn tác giả</h4>
              <p className="text-xs text-ink-500 mt-0.5">Dẫn đến đúng kho mã nguồn và tài liệu gốc của tác giả.</p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:text-center gap-3 p-3 rounded-xl bg-white/60 border border-slate-200/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900">Điều kiện rõ ràng</h4>
              <p className="text-xs text-ink-500 mt-0.5">Biết trước yêu cầu Python/Node, chi phí và môi trường trước khi chạy.</p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:text-center gap-3 p-3 rounded-xl bg-white/60 border border-slate-200/50">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900">Phạm vi xác minh</h4>
              <p className="text-xs text-ink-500 mt-0.5">Minh bạch giữa phần đã đọc tài liệu và phần đã chạy thử trên máy.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
