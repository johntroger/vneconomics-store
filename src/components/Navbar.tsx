import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Bell, 
  HelpCircle, 
  Globe, 
  Github, 
  Menu, 
  X,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tai-nguyen?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/tai-nguyen');
    }
  };

  const trendingTags = [
    { label: 'MarkItDown', q: 'markitdown' },
    { label: 'Chuyển PDF', q: 'pdf' },
    { label: 'Obsidian Ghi Chú', q: 'obsidian' },
    { label: 'AI Offline Trên Máy', q: 'ai' },
    { label: 'Coding Agent', q: 'agent' },
    { label: 'Làm Landing Page', q: 'landing page' },
    { label: 'Mã Nguồn Mở 0đ', q: 'mã nguồn mở' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-xs">
      
      {/* Top Utility Bar (Soothing Slate Background, Easy on the eyes) */}
      <div className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-medium hidden md:block text-ink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <span className="hover:text-ink-800 transition-colors cursor-pointer">Kênh Tác Giả & Nhà Phát Triển</span>
            <span className="text-slate-300">|</span>
            <span className="hover:text-ink-800 transition-colors cursor-pointer">Vneconomics Store</span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>Mã nguồn:</span>
              <a 
                href="https://github.com/johntroger/vneconomics-store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-600 transition-colors flex items-center gap-1 text-ink-700 font-semibold"
              >
                <Github className="w-3.5 h-3.5 inline" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/huong-dan" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Hướng Dẫn Thực Hành</span>
            </Link>
            <Link to="/tieu-chi" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Tiêu Chuẩn Thẩm Định EEAT</span>
            </Link>
            <div className="flex items-center gap-1 cursor-pointer hover:text-ink-800 transition-colors">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Tiếng Việt</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Search & Logo Bar (White Background, Clear Visual Hierarchy) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600 shadow-2xs group-hover:scale-105 group-hover:border-brand-300 transition-all">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-ink-900 group-hover:text-brand-700 transition-colors">
                  VibeLab Việt
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-ink-700 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                  Store
                </span>
              </div>
              <p className="text-[11px] text-ink-500 font-medium tracking-wide mt-1">Sàn Thư Viện Công Cụ Số Có Biên Tập</p>
            </div>
          </Link>

          {/* E-Commerce Search Bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus-within:border-brand-600 focus-within:bg-white rounded-lg p-0.5 shadow-2xs flex items-center transition-all">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm hơn 100 công cụ số, AI, Markdown, PDF, Coding Agent..."
                  className="w-full pl-3.5 pr-2 py-2 text-xs sm:text-sm text-ink-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-md flex items-center justify-center transition-colors shrink-0 font-semibold text-xs shadow-2xs gap-1.5"
                  aria-label="Tìm kiếm công cụ"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Tìm</span>
                </button>
              </div>
            </form>

            {/* Trending tags */}
            <div className="hidden sm:flex items-center gap-3 mt-1.5 text-[11px] text-ink-500 overflow-hidden whitespace-nowrap">
              <span className="text-slate-400">Gợi ý:</span>
              {trendingTags.map((tag) => (
                <button
                  key={tag.q}
                  onClick={() => navigate(`/tai-nguyen?q=${encodeURIComponent(tag.q)}`)}
                  className="hover:text-brand-600 hover:underline transition-colors"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cart / Tool Inventory Icon */}
          <div className="flex items-center gap-3 shrink-0">
            <Link 
              to="/tai-nguyen" 
              className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 bg-white"
              title="Kho công cụ đã thẩm định"
            >
              <ShoppingCart className="w-5 h-5 text-ink-700" />
              <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                100
              </span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-ink-700 border border-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-ink-700" />}
            </button>
          </div>

        </div>
      </div>

      {/* Category Navigation Ribbon (Calm Slate Background) */}
      <div className="bg-slate-50/70 border-t border-slate-200/80 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between overflow-x-auto whitespace-nowrap text-ink-600">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-ink-900 hover:text-brand-600 transition-colors">TRANG CHỦ</Link>
            <Link to="/tai-nguyen" className="font-bold text-brand-600 hover:underline">SÀN CÔNG CỤ (100+)</Link>
            <Link to="/danh-muc/chuyen-doi-tai-lieu" className="hover:text-brand-600 transition-colors">Chuyển đổi tài liệu</Link>
            <Link to="/danh-muc/ghi-chu-tri-thuc" className="hover:text-brand-600 transition-colors">Ghi chú tri thức</Link>
            <Link to="/danh-muc/ai-tren-may" className="hover:text-brand-600 transition-colors">AI trên máy</Link>
            <Link to="/danh-muc/coding-agent" className="hover:text-brand-600 transition-colors">Coding Agent</Link>
            <Link to="/huong-dan" className="hover:text-brand-600 transition-colors">Hướng dẫn thực hành</Link>
            <Link to="/tieu-chi" className="hover:text-brand-600 transition-colors flex items-center gap-1 text-ink-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiêu chí EEAT</span>
            </Link>
          </div>
          <div className="text-[11px] text-ink-400">
            <span>Phiên bản kiểm định độc lập 2026</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-900 font-medium hover:text-brand-600"
          >
            Trang chủ
          </Link>
          <Link
            to="/tai-nguyen"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-brand-600 font-bold"
          >
            Sàn công cụ (Tất cả 100+)
          </Link>
          <Link
            to="/danh-muc/chuyen-doi-tai-lieu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-600 hover:text-ink-900"
          >
            Chuyển đổi tài liệu
          </Link>
          <Link
            to="/danh-muc/coding-agent"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-600 hover:text-ink-900"
          >
            Coding Agent
          </Link>
          <Link
            to="/huong-dan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-600 hover:text-ink-900"
          >
            Hướng dẫn thực hành
          </Link>
          <Link
            to="/tieu-chi"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-ink-600 hover:text-ink-900"
          >
            Tiêu chí thẩm định EEAT
          </Link>
        </div>
      )}

    </header>
  );
};
