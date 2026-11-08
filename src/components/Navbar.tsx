import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Search, BookOpen, ShieldCheck, Menu, X, Github } from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Trang chủ', icon: Layers },
    { to: '/tai-nguyen', label: 'Tài nguyên', icon: Search },
    { to: '/huong-dan', label: 'Hướng dẫn', icon: BookOpen },
    { to: '/tieu-chi', label: 'Tiêu chí tuyển chọn', icon: ShieldCheck },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-ink-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                VibeLab Việt
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-200">v2.0</span>
              </span>
              <p className="text-xs text-ink-500 hidden sm:block">store.vneconomics.com</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-ink-700 hover:text-ink-900 hover:bg-slate-100/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search Button & GitHub */}
          <div className="hidden sm:flex items-center gap-3">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-ink-500 hover:bg-white hover:border-brand-300 hover:text-brand-600 text-xs font-medium transition-all shadow-xs"
                title="Tìm kiếm nhanh (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tìm nhanh...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded text-slate-400 font-mono">⌘K</kbd>
              </button>
            )}

            <a
              href="https://github.com/johntroger/vneconomics-store"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-slate-100 transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-2 rounded-lg text-ink-700 hover:bg-slate-100"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-700 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
