import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { GuidesPage } from './pages/GuidesPage';
import { CriteriaPage } from './pages/CriteriaPage';
import { Search, X, Star } from 'lucide-react';
import { resources } from './data/resources';

// Scroll to top component on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Global Quick Search Dialog
function QuickSearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? resources
        .filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.need.toLowerCase().includes(query.toLowerCase()) ||
            r.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-600 shrink-0 ml-2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhanh tài nguyên, công cụ, nhu cầu..."
            className="w-full text-sm py-1.5 focus:outline-none placeholder:text-ink-400"
          />
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-ink-400 hover:text-ink-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {results.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  onClose();
                  navigate(`/tai-nguyen/${r.slug}`);
                }}
                className="p-3 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between text-left group"
              >
                <div>
                  <h4 className="text-sm font-semibold text-ink-900 group-hover:text-brand-600 line-clamp-1">
                    {r.title}
                  </h4>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {r.category} • {r.need}
                  </p>
                </div>
                {r.stars && (
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 shrink-0 ml-2">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {r.stars.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="p-8 text-center text-xs text-ink-500">
            Không tìm thấy kết quả nào cho "{query}"
          </div>
        ) : (
          <div className="p-4 bg-slate-50 text-[11px] text-ink-400 flex items-center justify-between">
            <span>Gõ từ khóa để tìm trong hơn 100 tài nguyên</span>
            <span className="font-mono">ESC để đóng</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tai-nguyen" element={<CatalogPage />} />
            <Route path="/tai-nguyen/:slug" element={<ResourceDetailPage />} />
            <Route path="/huong-dan" element={<GuidesPage />} />
            <Route path="/tieu-chi" element={<CriteriaPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
        <QuickSearchDialog 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
