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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white shadow-md">
      
      {/* Top Utility Bar */}
      <div className="border-b border-white/15 text-[11px] font-medium hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <span className="hover:text-white/80 cursor-pointer">Kênh Tác Giả & Nhà Phát Triển</span>
            <span className="text-white/40">|</span>
            <span className="hover:text-white/80 cursor-pointer">Vneconomics Store</span>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-1.5">
              <span>Mã nguồn:</span>
              <a 
                href="https://github.com/johntroger/vneconomics-store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white/80 flex items-center gap-1"
              >
                <Github className="w-3.5 h-3.5 inline" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/huong-dan" className="flex items-center gap-1 hover:text-white/80">
              <Bell className="w-3.5 h-3.5" />
              <span>Hướng Dẫn Thực Hành</span>
            </Link>
            <Link to="/tieu-chi" className="flex items-center gap-1 hover:text-white/80">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tiêu Chuẩn Thẩm Định EEAT</span>
            </Link>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white/80">
              <Globe className="w-3.5 h-3.5" />
              <span>Tiếng Việt</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Search & Logo Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-600 shadow-md group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="leading-none">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs flex items-center gap-1.5">
                VibeLab Việt
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-400 text-brand-950 px-1.5 py-0.5 rounded shadow-2xs">Store</span>
              </span>
              <p className="text-[11px] text-white/85 font-medium tracking-wide mt-1">Sàn Thư Viện Công Cụ Số Có Biên Tập</p>
            </div>
          </Link>

          {/* E-Commerce Search Bar */}
          <div className="flex-1 max-w-3xl">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="w-full bg-white p-1 rounded-sm shadow-sm flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm hơn 100 công cụ số, AI, Markdown, PDF, Coding Agent chuẩn EEAT..."
                  className="w-full pl-3 pr-3 py-1.5 text-xs sm:text-sm text-ink-900 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-xs flex items-center justify-center transition-colors shrink-0 font-bold"
                  aria-label="Tìm kiếm công cụ"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Trending tags */}
            <div className="hidden sm:flex items-center gap-3 mt-1.5 text-[11px] text-white/90 overflow-hidden whitespace-nowrap">
              {trendingTags.map((tag) => (
                <button
                  key={tag.q}
                  onClick={() => navigate(`/tai-nguyen?q=${encodeURIComponent(tag.q)}`)}
                  className="hover:text-cyan-200 hover:underline transition-colors"
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
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Kho công cụ đã thẩm định"
            >
              <ShoppingCart className="w-7 h-7 text-white" />
              <span className="absolute top-0 right-0 bg-cyan-400 text-brand-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-700 shadow-sm">
                100
              </span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Category Navigation Ribbon */}
      <div className="bg-brand-800/80 border-t border-white/10 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between overflow-x-auto whitespace-nowrap text-white/90">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold hover:text-cyan-300 transition-colors">TRANG CHỦ</Link>
            <Link to="/tai-nguyen" className="font-bold text-cyan-300 hover:underline">SÀN CÔNG CỤ (100+)</Link>
            <Link to="/danh-muc/chuyen-doi-tai-lieu" className="hover:text-cyan-200 transition-colors">Chuyển đổi tài liệu</Link>
            <Link to="/danh-muc/ghi-chu-tri-thuc" className="hover:text-cyan-200 transition-colors">Ghi chú tri thức</Link>
            <Link to="/danh-muc/ai-tren-may" className="hover:text-cyan-200 transition-colors">AI trên máy</Link>
            <Link to="/danh-muc/coding-agent" className="hover:text-cyan-200 transition-colors">Coding Agent</Link>
            <Link to="/huong-dan" className="hover:text-cyan-200 transition-colors">Hướng dẫn thực hành</Link>
            <Link to="/tieu-chi" className="hover:text-cyan-200 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tiêu chí EEAT</span>
            </Link>
          </div>
          <div className="text-[11px] text-white/70">
            <span>Phiên bản kiểm định độc lập 2026</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-900 border-t border-brand-700 px-4 py-4 space-y-3 text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-white font-medium hover:text-cyan-300"
          >
            Trang chủ
          </Link>
          <Link
            to="/tai-nguyen"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-cyan-300 font-bold"
          >
            Sàn công cụ (Tất cả 100+)
          </Link>
          <Link
            to="/danh-muc/chuyen-doi-tai-lieu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-white/80 hover:text-white"
          >
            Chuyển đổi tài liệu
          </Link>
          <Link
            to="/danh-muc/coding-agent"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-white/80 hover:text-white"
          >
            Coding Agent
          </Link>
          <Link
            to="/huong-dan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-white/80 hover:text-white"
          >
            Hướng dẫn thực hành
          </Link>
          <Link
            to="/tieu-chi"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-white/80 hover:text-white"
          >
            Tiêu chí thẩm định EEAT
          </Link>
        </div>
      )}

    </header>
  );
};
