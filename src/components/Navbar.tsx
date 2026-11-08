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
  ShieldCheck,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();
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
    { label: 'Mã Nguồn Mở', q: 'mã nguồn mở' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-xs">
      
      {/* Top Utility Bar */}
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

      {/* Main Search & Logo Bar */}
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
                <span className="bg-brand-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide">
                  MALL
                </span>
              </div>
              <p className="text-[10px] text-ink-500 font-medium tracking-wide mt-1">
                bởi Vneconomics Store • Chuẩn EEAT 2026
              </p>
            </div>
          </Link>

          {/* Shopee-style Search Box */}
          <div className="flex-1 max-w-2xl hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white border-2 border-brand-600 rounded-xl overflow-hidden shadow-2xs focus-within:border-brand-700 transition-colors">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm công cụ mã nguồn mở, chuyển đổi PDF, AI Agent, tài liệu..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors shrink-0"
                >
                  <Search className="w-4 h-4 mr-1.5" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </form>

            {/* Trending Suggestions Ribbon */}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ink-500 overflow-hidden whitespace-nowrap">
              <span className="text-ink-400 font-medium shrink-0">Tìm kiếm phổ biến:</span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {trendingTags.map((t) => (
                  <Link
                    key={t.q}
                    to={`/tai-nguyen?q=${encodeURIComponent(t.q)}`}
                    className="hover:text-brand-600 transition-colors"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Actions: Auth + Inventory Pill + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Authentication Button / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'Avatar'} 
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-semibold text-ink-800 max-w-[120px] truncate">
                    {user.displayName || user.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-ink-900 truncate">{user.displayName || 'Tài khoản Google'}</p>
                      <p className="text-[11px] text-ink-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-ink-800 font-semibold text-xs shadow-2xs transition-colors"
                title="Đăng nhập với Google"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-600" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}

            {/* Inventory Bag Button */}
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

      {/* Category Navigation Ribbon */}
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
          {!user ? (
            <button
              onClick={() => {
                signInWithGoogle();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-50 border border-brand-200 text-brand-700 font-bold rounded-xl"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập với Google</span>
            </button>
          ) : (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-ink-900 text-xs truncate max-w-[200px]">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-600 font-bold"
              >
                Đăng xuất
              </button>
            </div>
          )}

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
