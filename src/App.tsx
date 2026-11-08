import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GuidesPage } from './pages/GuidesPage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { CriteriaPage } from './pages/CriteriaPage';
import { Search, X, Star } from 'lucide-react';
import { resources } from './data/resources';
import { searchResources } from './utils/search';

// Scroll to top on route change & track page view in Google Analytics
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Send virtual page view to GA4
    if (typeof (window as unknown as { gtag?: Function }).gtag === 'function') {
      (window as unknown as { gtag: Function }).gtag('event', 'page_view', {
        page_path: pathname + search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, search]);

  return null;
}

// Global Quick Search Dialog (Ctrl+K)
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
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim() ? searchResources(resources, query, 8) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-ink-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm công cụ, tài liệu, AI, tác giả..."
            className="w-full py-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-ink-400 hover:text-ink-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  navigate(`/san-pham/${r.slug}`);
                  onClose();
                }}
                className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-ink-900 line-clamp-1">{r.title}</h4>
                  <p className="text-[11px] text-ink-500 line-clamp-1 mt-0.5">{r.excerpt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {r.category}
                    </span>
                    <span className="text-[10px] text-ink-400">• {r.need}</span>
                  </div>
                </div>
                {r.stars && (
                  <div className="flex items-center text-amber-500 text-xs font-medium shrink-0 ml-3">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    <span>{r.stars.toLocaleString()}</span>
                  </div>
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
            <span>Gõ từ khóa để tìm trong hơn 100 sản phẩm</span>
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
      <AuthProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar onOpenSearch={() => setSearchOpen(true)} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tai-nguyen" element={<CatalogPage />} />
              
              {/* Mỗi category có URL riêng */}
              <Route path="/danh-muc/:slug" element={<CategoryPage />} />
              
              {/* Mỗi sản phẩm / bài viết có URL riêng */}
              <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
              <Route path="/tai-nguyen/:slug" element={<ProductDetailPage />} />
              
              {/* Mỗi cẩm nang có URL riêng */}
              <Route path="/huong-dan" element={<GuidesPage />} />
              <Route path="/huong-dan/:slug" element={<GuideDetailPage />} />
              
              {/* Tiêu chí tuyển chọn */}
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
