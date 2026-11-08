import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categories, needs } from '../data/categories';
import { resources } from '../data/resources';
import { ProductCard } from '../components/ProductCard';
import { useSEO } from '../utils/useSEO';
import { 
  Search, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  Cpu, 
  FileText, 
  Terminal, 
  Zap, 
  Palette, 
  Video, 
  LayoutGrid, 
  FolderArchive,
  ArrowLeft
} from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNeed, setSelectedNeed] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'name'>('stars');

  // Find category by slug
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
          p.need.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesNeed = !selectedNeed || p.need.toLowerCase() === selectedNeed.toLowerCase();

        return matchesSearch && matchesNeed;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') {
          return (b.stars || 0) - (a.stars || 0);
        }
        return a.title.localeCompare(b.title);
      });
  }, [categoryProducts, searchTerm, selectedNeed, sortBy]);

  // SEO & Schema for Category
  useSEO({
    title: category ? `${category.name} — Bảng Xếp Hạng & Công Cụ Tuyển Chọn` : 'Danh mục công cụ',
    description: category?.description || 'Khám phá các công cụ và phần mềm chọn lọc theo danh mục tại VibeLab Việt.',
    canonicalUrl: category ? `https://store.vneconomics.com/danh-muc/${category.slug}` : 'https://store.vneconomics.com/tai-nguyen',
    keywords: category ? [category.name, 'công cụ số', 'phần mềm', 'mã nguồn mở', 'VibeLab Việt'] : [],
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
            'name': 'Danh mục',
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

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6 text-blue-600" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-indigo-600" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-cyan-600" />;
      case 'Terminal': return <Terminal className="w-6 h-6 text-emerald-600" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-600" />;
      case 'Palette': return <Palette className="w-6 h-6 text-purple-600" />;
      case 'Video': return <Video className="w-6 h-6 text-red-600" />;
      case 'LayoutGrid': return <LayoutGrid className="w-6 h-6 text-teal-600" />;
      case 'FolderArchive': return <FolderArchive className="w-6 h-6 text-orange-600" />;
      default: return <Layers className="w-6 h-6 text-brand-600" />;
    }
  };

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900">Không tìm thấy danh mục</h2>
        <p className="mt-2 text-sm text-ink-500">Danh mục bạn tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn.</p>
        <Link
          to="/tai-nguyen"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về kho tài nguyên</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/tai-nguyen" className="hover:text-brand-600 transition-colors">Sàn công cụ</Link>
        <span>/</span>
        <span className="text-ink-800 font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="bg-gradient-to-tr from-brand-900 via-ink-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 mb-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
            {getCategoryIcon(category.iconName)}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Chuyên mục tuyển chọn
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            {category.name}
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            {category.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            <span>• Tổng số: <strong>{categoryProducts.length}</strong> công cụ đã thẩm định</span>
            <span>• Chuẩn biên tập: <strong>EEAT Verified</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search inside category */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Tìm trong danh mục ${category.name}...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filter by Need */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedNeed}
            onChange={(e) => setSelectedNeed(e.target.value)}
            className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-ink-700 focus:bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="">Tất cả việc cần làm</option>
            {needs.map((n) => (
              <option key={n.id} value={n.name}>{n.name}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
          <span className="text-xs text-ink-400 hidden sm:inline">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-ink-700 font-semibold focus:bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="stars">Sao GitHub cao nhất</option>
            <option value="name">Tên A-Z</option>
          </select>
        </div>

      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
          <h3 className="text-base font-bold text-ink-900">Không tìm thấy công cụ phù hợp</h3>
          <p className="mt-1 text-xs text-ink-500">Hãy thử tìm bằng từ khóa khác hoặc xóa bộ lọc.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedNeed(''); }}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100"
          >
            Khôi phục danh mục
          </button>
        </div>
      )}

      {/* EEAT Category Guide Section (For SEO & Generative AI Crawlers) */}
      <div className="mt-16 bg-white border border-slate-200/90 rounded-3xl p-8 space-y-4">
        <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Tiêu chuẩn thẩm định & Đánh giá chuyên mục {category.name}
        </h3>
        <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
          Tất cả các giải pháp và phần mềm thuộc chuyên mục <strong>{category.name}</strong> tại VibeLab Việt đều được đội ngũ chuyên gia công nghệ rà soát dựa trên 4 trụ cột E-E-A-T: Đối chiếu trực tiếp mã nguồn hoặc README chính thức từ tác giả, làm rõ điều kiện môi trường phần cứng, xác minh tính an toàn và tuyệt đối không cấp quyền quá mức cho phần mềm chưa được cộng đồng chứng thực.
        </p>
      </div>

    </div>
  );
};
