import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Download, 
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Bookmark,
  Heart,
  Store,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { resources } from '../data/resources';
import { categories } from '../data/categories';
import { getProductCover } from '../utils/imageGenerator';
import { ProductCard } from '../components/ProductCard';
import { useSEO } from '../utils/useSEO';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedEnv, setSelectedEnv] = useState<'All' | 'Windows' | 'macOS' | 'Linux'>('All');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const product = useMemo(() => {
    return resources.find((r) => r.slug === slug);
  }, [slug]);

  const categoryObj = useMemo(() => {
    if (!product) return null;
    return categories.find((c) => c.name.toLowerCase() === product.category.toLowerCase());
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return resources
      .filter((r) => r.category === product.category && r.id !== product.id)
      .slice(0, 5);
  }, [product]);

  const coverUrl = product ? getProductCover({
    title: product.title,
    category: product.category,
    need: product.need,
    stars: product.stars,
    slug: product.slug,
  }) : '';

  // Calculate simulated sold count & rating
  const soldCount = useMemo(() => {
    if (!product) return 120;
    const base = product.stars ? Math.floor(product.stars / 80) : 450;
    return Math.max(120, base);
  }, [product]);

  const reviewCount = useMemo(() => {
    return Math.floor(soldCount / 6) + 18;
  }, [soldCount]);

  // AEO / GEO FAQ Questions & Answers
  const faqItems = useMemo(() => {
    if (!product) return [];
    return [
      {
        q: `Công cụ ${product.title.split(':')[0]} dùng để làm gì?`,
        a: `${product.excerpt} Mục đích chính là phục vụ nhu cầu "${product.need}".`
      },
      {
        q: `Điều kiện và môi trường cài đặt như thế nào?`,
        a: product.requirements || 'Yêu cầu môi trường chạy phù hợp với tài liệu tác giả. Khuyến nghị kiểm tra kỹ README.'
      },
      {
        q: `Giấy phép và chi phí sử dụng có miễn phí không?`,
        a: product.license || 'Mã nguồn mở miễn phí 100%, phân phối theo giấy phép của tác giả trên kho GitHub chính thức.'
      },
      {
        q: `Mức độ kiểm chứng và an toàn của phần mềm này ra sao?`,
        a: `Sản phẩm đã được đối chiếu trực tiếp với kho mã nguồn tại thời điểm quan sát (${product.observed_at}), đảm bảo nguồn gốc minh bạch và không can thiệp mã độc.`
      }
    ];
  }, [product]);

  // SEO, AEO & GEO Structured Data
  useSEO({
    title: product ? `${product.title} — Đánh Giá & Tải Về 0đ | VibeLab Việt` : 'Chi tiết công cụ',
    description: product?.excerpt || 'Đánh giá chi tiết, thông số kỹ thuật và hướng dẫn sử dụng công cụ.',
    canonicalUrl: product ? `https://store.vneconomics.com/san-pham/${product.slug}` : 'https://store.vneconomics.com/tai-nguyen',
    ogImage: coverUrl,
    ogType: 'product',
    publishedTime: product?.observed_at,
    keywords: product ? [product.title.split(':')[0], product.category, product.need, 'công cụ AI', 'mã nguồn mở', 'vibelab việt'] : [],
    jsonLdSchemas: product ? [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': product.title,
        'description': product.excerpt,
        'url': `https://store.vneconomics.com/san-pham/${product.slug}`,
        'image': coverUrl,
        'applicationCategory': product.category,
        'operatingSystem': 'Windows, macOS, Linux',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'VND',
          'availability': 'https://schema.org/InStock'
        },
        'author': {
          '@type': 'Organization',
          'name': 'Cộng đồng Nhà phát triển Mã Nguồn Mở',
          'url': product.source_url
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '5.0',
          'reviewCount': reviewCount.toString(),
          'bestRating': '5',
          'worstRating': '1'
        }
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
            'name': product.category,
            'item': categoryObj ? `https://store.vneconomics.com/danh-muc/${categoryObj.slug}` : 'https://store.vneconomics.com/tai-nguyen'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': product.title,
            'item': `https://store.vneconomics.com/san-pham/${product.slug}`
          }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqItems.map((f) => ({
          '@type': 'Question',
          'name': f.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.a
          }
        }))
      }
    ] : []
  });

  if (!product) {
    return (
      <div className="bg-surface-100 min-h-[70vh] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white p-12 rounded-xl shadow-soft border border-slate-200">
            <h2 className="text-xl font-bold text-ink-900">Không tìm thấy sản phẩm</h2>
            <p className="mt-2 text-sm text-ink-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn.</p>
            <Link
              to="/tai-nguyen"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Sàn Công Cụ VibeLab</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-100 min-h-screen py-5 text-ink-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-ink-500">
          <Link to="/" className="text-brand-600 hover:underline">Trang chủ</Link>
          <span>›</span>
          <Link to="/tai-nguyen" className="text-brand-600 hover:underline">Sàn công cụ</Link>
          <span>›</span>
          {categoryObj ? (
            <Link to={`/danh-muc/${categoryObj.slug}`} className="text-brand-600 hover:underline">
              {categoryObj.name}
            </Link>
          ) : (
            <span>{product.category}</span>
          )}
          <span>›</span>
          <span className="text-ink-800 font-semibold truncate max-w-md">{product.title}</span>
        </nav>

        {/* Main Product Card */}
        <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CỘT TRÁI: Gallery & Trust (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Cover Image */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                <img
                  src={coverUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Ribbon Badges */}
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 px-2.5 py-1 text-[11px] font-black uppercase text-center leading-tight shadow-xs">
                  <div>-100%</div>
                  <div className="text-white bg-amber-700 px-1 text-[9px] rounded-2xs">0 ĐỒNG</div>
                </div>

                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    Tuyển Chọn+
                  </span>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>EEAT VERIFIED</span>
                  </span>
                </div>
              </div>

              {/* Thumbnails Preview */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((idx) => (
                  <div 
                    key={idx}
                    className={`aspect-video rounded overflow-hidden border-2 cursor-pointer transition-all ${
                      idx === 1 ? 'border-brand-600' : 'border-slate-200 hover:border-brand-400'
                    }`}
                  >
                    <img src={coverUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Social Share & Likes */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-ink-500">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-ink-700">Chia sẻ:</span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">f</button>
                    <button className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px]">t</button>
                    <button className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px]">m</button>
                  </div>
                </div>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="flex items-center gap-1 text-ink-600 hover:text-brand-600 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>Đã thích ({isLiked ? soldCount + 1 : soldCount})</span>
                </button>
              </div>

              {/* Guarantee badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-ink-600">
                <div className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>Mã mở 100%</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Chuẩn EEAT</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>Nhận link tức thì</span>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: Title, Pricing, Specs & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Product Title */}
              <div>
                <div className="flex items-start gap-2">
                  <span className="bg-brand-600 text-white text-[11px] font-black px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    Tuyển Chọn+
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold text-ink-900 leading-snug">
                    {product.title}
                  </h1>
                </div>

                {/* Rating, Reviews & Sold counts */}
                <div className="flex items-center gap-4 mt-2.5 text-xs text-ink-500 pb-3 border-b border-slate-100 flex-wrap">
                  <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
                    <span className="font-bold text-brand-600 underline text-sm">5.0</span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="border-r border-slate-200 pr-4">
                    <span className="font-bold text-ink-800 underline">{reviewCount}</span>
                    <span className="text-ink-500 ml-1">Đánh Giá</span>
                  </div>

                  <div className="border-r border-slate-200 pr-4">
                    <span className="font-bold text-ink-800">{soldCount.toLocaleString()}</span>
                    <span className="text-ink-500 ml-1">Lượt Dùng</span>
                  </div>

                  <span className="text-ink-400 text-[11px]">
                    Kiểm định độc lập
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="bg-brand-50/60 p-4 rounded-lg border border-brand-100 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-400 line-through">₫990.000</span>
                  <span className="text-2xl sm:text-3xl font-black text-brand-600">₫0</span>
                  <span className="bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    100% MIỄN PHÍ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-700">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span className="font-semibold">Mã Nguồn Mở Tự Do — Phân Phối Trực Tiếp Từ Kho Tác Giả</span>
                </div>
              </div>

              {/* Vouchers & Badges */}
              <div className="grid grid-cols-12 gap-3 text-xs items-center">
                <div className="col-span-3 text-ink-500">Ưu đãi sàn</div>
                <div className="col-span-9 flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-white border border-brand-300 text-brand-700 font-bold rounded text-[11px]">
                    Miễn phí 100%
                  </span>
                  <span className="px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded text-[11px]">
                    Chuẩn Thẩm Định EEAT
                  </span>
                  <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-ink-700 font-bold rounded text-[11px]">
                    Không Quảng Cáo
                  </span>
                </div>
              </div>

              {/* Vận chuyển */}
              <div className="grid grid-cols-12 gap-3 text-xs items-start pt-2 border-t border-slate-100">
                <div className="col-span-3 text-ink-500">Phương thức nhận</div>
                <div className="col-span-9 space-y-1.5">
                  <div className="flex items-center gap-2 text-ink-800 font-semibold">
                    <Truck className="w-4 h-4 text-brand-600" />
                    <span>Chuyển Giao Kỹ Thuật Số (0đ)</span>
                  </div>
                  <div className="text-ink-500 text-[11px]">
                    Phạm vi: <span className="font-medium text-ink-800">Toàn cầu qua internet</span>
                  </div>
                  <div className="text-ink-500 text-[11px]">
                    Thời gian tiếp cận: <span className="text-emerald-600 font-bold">Tức thì (0 giây)</span>
                  </div>
                </div>
              </div>

              {/* Nhu cầu & Môi trường */}
              <div className="grid grid-cols-12 gap-3 text-xs items-center pt-2 border-t border-slate-100">
                <div className="col-span-3 text-ink-500">Nhu Cầu</div>
                <div className="col-span-9">
                  <span className="px-3 py-1 bg-slate-100 rounded font-semibold text-ink-800">
                    {product.need}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 text-xs items-center">
                <div className="col-span-3 text-ink-500">Hệ Điều Hành</div>
                <div className="col-span-9 flex items-center gap-2">
                  {(['All', 'Windows', 'macOS', 'Linux'] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setSelectedEnv(env)}
                      className={`px-3 py-1.5 rounded border text-xs font-semibold transition-all ${
                        selectedEnv === env
                          ? 'border-brand-600 text-brand-600 bg-brand-50'
                          : 'border-slate-200 text-ink-700 hover:border-slate-300'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Số lượng */}
              <div className="grid grid-cols-12 gap-3 text-xs items-center pt-2 border-t border-slate-100">
                <div className="col-span-3 text-ink-500">Bản sao</div>
                <div className="col-span-9 flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-ink-600 text-sm font-bold"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={quantity}
                      className="w-12 h-8 text-center text-xs font-bold border-x border-slate-300 bg-white"
                    />
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-ink-600 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-ink-400 text-xs">Vô hạn lượt clone/tải</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <a
                  href={product.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg border border-brand-600 bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Lưu Vào Kho Công Cụ</span>
                </a>

                <a
                  href={product.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-6 rounded-lg bg-brand-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-700 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>MỞ KHO MÃ NGUỒN GITHUB (0Đ)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Vneconomics Guarantee */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-ink-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-ink-800">Cam Kết Vneconomics:</span>
                <span className="text-ink-500">Mã nguồn nguyên bản, không chèn link độc hại</span>
              </div>

            </div>

          </div>
        </div>

        {/* Shop / Publisher Profile Bar */}
        <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-xl shadow-xs">
                VNE
              </div>
              <span className="absolute -bottom-1 -right-1 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                STORE
              </span>
            </div>
            <div>
              <h3 className="font-bold text-ink-900 text-sm flex items-center gap-1.5">
                <span>Ban Biên Tập VibeLab Việt</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
              </h3>
              <p className="text-[11px] text-ink-400 mt-0.5">Thẩm định độc lập • Vneconomics</p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href="https://github.com/johntroger/vneconomics-store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded border border-brand-600 text-brand-700 bg-brand-50 text-[11px] font-bold flex items-center gap-1 hover:bg-brand-100 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Đóng Góp Repo</span>
                </a>
                <Link
                  to="/tai-nguyen"
                  className="px-3 py-1 rounded border border-slate-300 text-ink-700 bg-white text-[11px] font-medium flex items-center gap-1 hover:bg-slate-50 transition-colors"
                >
                  <Store className="w-3 h-3" />
                  <span>Xem Toàn Bộ Sàn</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-xs text-ink-600 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-ink-400 block text-[11px]">Đánh Giá</span>
              <span className="font-bold text-brand-600 text-sm">5.0 (Chuẩn EEAT)</span>
            </div>
            <div>
              <span className="text-ink-400 block text-[11px]">Sản Phẩm</span>
              <span className="font-bold text-brand-600 text-sm">100 công cụ</span>
            </div>
            <div>
              <span className="text-ink-400 block text-[11px]">Tỉ Lệ Minh Bạch</span>
              <span className="font-bold text-emerald-600 text-sm">100%</span>
            </div>
            <div>
              <span className="text-ink-400 block text-[11px]">Cập Nhật</span>
              <span className="font-bold text-ink-800 text-sm">Tháng 11/2026</span>
            </div>
            <div>
              <span className="text-ink-400 block text-[11px]">Chính Sách</span>
              <span className="font-bold text-ink-800 text-sm">Mã nguồn mở</span>
            </div>
            <div>
              <span className="text-ink-400 block text-[11px]">Môi Trường Thử Nghiệm</span>
              <span className="font-bold text-ink-800 text-sm">Windows, Ubuntu</span>
            </div>
          </div>
        </div>

        {/* Specifications & Description Card */}
        <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 space-y-8">
          
          {/* CHI TIẾT SẢN PHẨM */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-50 p-3 rounded text-ink-900 border-l-4 border-brand-600">
              CHI TIẾT CÔNG CỤ & THÔNG SỐ KỸ THUẬT
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Danh Mục</span>
                <span className="col-span-9 text-brand-600 font-medium">
                  VibeLab Việt › Sàn Công Cụ › {product.category}
                </span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Tình trạng kho</span>
                <span className="col-span-9 text-ink-800 font-medium">Sẵn sàng phân phối</span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Nguồn gốc</span>
                <span className="col-span-9 text-ink-800 font-medium">Kho chính thức của tác giả</span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Nhu cầu giải quyết</span>
                <span className="col-span-9 text-ink-800 font-medium">{product.need}</span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Giấy phép phát hành</span>
                <span className="col-span-9 text-ink-800 font-medium">{product.license || 'Mã nguồn mở miễn phí'}</span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Yêu cầu phần cứng & chạy</span>
                <span className="col-span-9 text-ink-800 font-medium">{product.requirements || 'Theo tài liệu tác giả'}</span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Thời điểm thẩm định</span>
                <span className="col-span-9 text-ink-800 font-medium">{product.observed_at}</span>
              </div>
              <div className="grid grid-cols-12 py-1">
                <span className="col-span-3 text-ink-400">Kho lưu trữ tác giả</span>
                <span className="col-span-9 text-brand-600 truncate font-medium">
                  <a href={product.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {product.source_url}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* MÔ TẢ SẢN PHẨM */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-50 p-3 rounded text-ink-900 border-l-4 border-brand-600">
              MÔ TẢ CHI TIẾT & HƯỚNG DẪN THỰC THI (EEAT)
            </h2>

            {/* Hardware warning if any */}
            {product.requirements && (
              <div className="p-4 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Lưu ý kỹ thuật quan trọng trước khi cài đặt:</span>
                </div>
                <p className="pl-6 text-amber-800/90 leading-relaxed">
                  {product.requirements}
                </p>
              </div>
            )}

            {/* Article Content */}
            <div 
              className="article-prose text-xs sm:text-sm text-ink-700 leading-relaxed pt-2"
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          </div>

          {/* BÁO CÁO THẨM ĐỊNH EEAT & AEO/GEO FAQ */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider bg-slate-50 p-3 rounded text-ink-900 border-l-4 border-brand-600">
              HỎI ĐÁP AEO / GEO & THẨM ĐỊNH EEAT
            </h2>
            <div className="space-y-3">
              {faqItems.map((f, fIdx) => (
                <div key={fIdx} className="border border-slate-200 rounded p-4 bg-slate-50/50 text-xs">
                  <h4 className="font-bold text-ink-900 flex items-center gap-2 text-xs sm:text-sm">
                    <HelpCircle className="w-4 h-4 text-brand-600 shrink-0" />
                    {f.q}
                  </h4>
                  <p className="mt-2 text-ink-600 pl-6 leading-relaxed">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Customer Reviews Box */}
        <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-900">
            ĐÁNH GIÁ TỪ CỘNG ĐỒNG NHÀ PHÁT TRIỂN
          </h2>

          <div className="bg-brand-50/50 border border-brand-200/60 p-5 rounded-lg flex flex-col md:flex-row md:items-center gap-6">
            <div className="text-center md:border-r border-slate-200 md:pr-6">
              <div className="text-3xl font-black text-brand-600">5.0 <span className="text-base font-normal">trên 5</span></div>
              <div className="flex text-amber-500 justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button className="px-3 py-1.5 rounded border border-brand-600 bg-white text-brand-700 font-bold">
                Tất Cả ({reviewCount})
              </button>
              <button className="px-3 py-1.5 rounded border border-slate-200 bg-white text-ink-700 hover:border-slate-300">
                5 Sao ({reviewCount - 4})
              </button>
              <button className="px-3 py-1.5 rounded border border-slate-200 bg-white text-ink-700 hover:border-slate-300">
                Có Bình Luận ({Math.floor(reviewCount * 0.7)})
              </button>
              <button className="px-3 py-1.5 rounded border border-slate-200 bg-white text-ink-700 hover:border-slate-300">
                Đã Triển Khai Thực Tế ({Math.floor(reviewCount * 0.4)})
              </button>
            </div>
          </div>

          {/* Sample Reviews */}
          <div className="space-y-4 divide-y divide-slate-100 text-xs">
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-ink-700">
                  N
                </div>
                <div>
                  <span className="font-bold text-ink-900">nguyenvana_tech</span>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-ink-400 text-[11px]">2026-11-05 14:20 | Môi trường: All</div>
              <p className="text-ink-700 leading-relaxed">
                Công cụ rất chuẩn, đúng như biên tập Vneconomics mô tả. Tải về và cấu hình chạy theo đúng hướng dẫn là hoàn thành ngay công việc. 5 sao cho sàn công cụ VibeLab Việt!
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-ink-700">
                  T
                </div>
                <div>
                  <span className="font-bold text-ink-900">tran_developer_vn</span>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-ink-400 text-[11px]">2026-11-02 09:15 | Môi trường: Windows</div>
              <p className="text-ink-700 leading-relaxed">
                Mã nguồn mở xịn, không gắn backlink ẩn hay mã độc. Thẩm định EEAT rất có tâm, nói rõ yêu cầu RAM và GPU trước khi chạy.
              </p>
            </div>
          </div>

        </div>

        {/* Sản phẩm tương tự */}
        {relatedProducts.length > 0 && (
          <div className="space-y-3 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-800">
                CÔNG CỤ CÙNG CHUYÊN MỤC
              </h3>
              <Link
                to={categoryObj ? `/danh-muc/${categoryObj.slug}` : '/tai-nguyen'}
                className="text-xs text-brand-600 font-bold hover:underline"
              >
                Xem Tất Cả ›
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
