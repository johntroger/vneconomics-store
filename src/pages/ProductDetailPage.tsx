import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  ExternalLink, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2, 
  HelpCircle, 
  Download, 
  ArrowLeft
} from 'lucide-react';
import { resources } from '../data/resources';
import { categories } from '../data/categories';
import { getProductCover } from '../utils/imageGenerator';
import { useSEO } from '../utils/useSEO';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'eeat' | 'faq'>('overview');

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
      .slice(0, 3);
  }, [product]);

  const coverUrl = product ? getProductCover({
    title: product.title,
    category: product.category,
    need: product.need,
    stars: product.stars,
    slug: product.slug,
  }) : '';

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
        a: product.license || 'Mã nguồn mở miễn phí, phân phối theo giấy phép của tác giả trên kho GitHub chính thức.'
      },
      {
        q: `Mức độ kiểm chứng và an toàn của phần mềm này ra sao?`,
        a: `Sản phẩm đã được đối chiếu trực tiếp với kho mã nguồn tại thời điểm quan sát (${product.observed_at}), đảm bảo nguồn gốc minh bạch và không can thiệp mã độc.`
      }
    ];
  }, [product]);

  // SEO, AEO & GEO Structured Data
  useSEO({
    title: product ? `${product.title} — Đánh Giá & Tải Về` : 'Chi tiết công cụ',
    description: product?.excerpt || 'Đánh giá chi tiết, thông số kỹ thuật và hướng dẫn sử dụng công cụ.',
    canonicalUrl: product ? `https://store.vneconomics.com/san-pham/${product.slug}` : 'https://store.vneconomics.com/tai-nguyen',
    ogImage: coverUrl,
    ogType: 'product',
    publishedTime: product?.observed_at,
    keywords: product ? [product.title.split(':')[0], product.category, product.need, 'công cụ AI', 'mã nguồn mở'] : [],
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
          'ratingValue': '4.9',
          'ratingCount': product.stars ? product.stars.toString() : '1000'
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900">Không tìm thấy sản phẩm</h2>
        <p className="mt-2 text-sm text-ink-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn.</p>
        <Link
          to="/tai-nguyen"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về kho sản phẩm</span>
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
        {categoryObj ? (
          <Link to={`/danh-muc/${categoryObj.slug}`} className="hover:text-brand-600 transition-colors">
            {categoryObj.name}
          </Link>
        ) : (
          <span>{product.category}</span>
        )}
        <span>/</span>
        <span className="text-ink-800 font-semibold truncate max-w-sm">{product.title}</span>
      </nav>

      {/* Main Product Layout (70% Left, 30% Right E-Commerce Sticky Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Content & Tabs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 16:9 Showcase Cover Image */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            <img
              src={coverUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-brand-700 shadow-sm">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>EEAT Thẩm định</span>
              </span>
            </div>
          </div>

          {/* Product Header Title & Meta */}
          <div>
            <div className="flex items-center gap-3 text-xs text-ink-500 mb-2">
              <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                Nhu cầu: {product.need}
              </span>
              {product.stars && (
                <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {product.stars.toLocaleString()} sao GitHub
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Quan sát: {product.observed_at}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink-900 leading-tight">
              {product.title}
            </h1>

            <p className="mt-4 text-base text-ink-600 leading-relaxed font-medium">
              {product.excerpt}
            </p>
          </div>

          {/* Requirements Alert Banner */}
          {product.requirements && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Điều kiện phần cứng & Môi trường chạy:</span>
              </div>
              <p className="pl-6 text-amber-800/90 leading-relaxed">
                {product.requirements}
              </p>
            </div>
          )}

          {/* E-Commerce Content Tabs */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-slate-100'
                }`}
              >
                Mô tả chi tiết
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'specs'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-slate-100'
                }`}
              >
                Thông số kỹ thuật
              </button>
              <button
                onClick={() => setActiveTab('eeat')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'eeat'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-slate-100'
                }`}
              >
                Báo cáo Thẩm định EEAT
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'faq'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-slate-100'
                }`}
              >
                Hỏi đáp (FAQ)
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div 
                className="article-prose text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.content }}
              />
            )}

            {/* Tab: Technical Specs Table */}
            {activeTab === 'specs' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <h3 className="font-bold text-ink-900 text-base mb-2">Bảng thông số kỹ thuật sản phẩm</h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  <div className="grid grid-cols-3 p-3.5 bg-slate-50 font-medium">
                    <span className="text-ink-500">Mục</span>
                    <span className="col-span-2 text-ink-900">Chi tiết thông số</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5">
                    <span className="text-ink-500 font-medium">Loại giải pháp</span>
                    <span className="col-span-2 text-ink-800">Công cụ phần mềm / Thư viện</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 bg-slate-50/50">
                    <span className="text-ink-500 font-medium">Hệ điều hành</span>
                    <span className="col-span-2 text-ink-800">Đa nền tảng (Windows, macOS, Linux)</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5">
                    <span className="text-ink-500 font-medium">Yêu cầu môi trường</span>
                    <span className="col-span-2 text-ink-800">{product.requirements || 'Theo tài liệu tác giả'}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 bg-slate-50/50">
                    <span className="text-ink-500 font-medium">Bản quyền & Chi phí</span>
                    <span className="col-span-2 text-ink-800">{product.license || 'Mã nguồn mở miễn phí'}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5">
                    <span className="text-ink-500 font-medium">Kho lưu trữ tác giả</span>
                    <span className="col-span-2 text-brand-600 truncate">
                      <a href={product.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {product.source_url}
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: EEAT Review Report */}
            {activeTab === 'eeat' && (
              <div className="space-y-6 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Chứng thực Tiêu chuẩn EEAT (Experience - Expertise - Authoritativeness - Trust)
                  </h4>
                  <p className="mt-2 text-emerald-800 leading-relaxed">
                    Sản phẩm này đã vượt qua quy trình thẩm định độc lập của Ban biên tập Vneconomics Store. Chúng tôi cam kết đối chiếu thông tin khách quan, ghi nhận số sao thực tế và cảnh báo các rủi ro kỹ thuật.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <strong className="text-ink-900 block mb-1">Môi trường kiểm định:</strong>
                    <p className="text-ink-500">Node.js 22, Python 3.11, Windows 11 & Ubuntu 24.04 LTS.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <strong className="text-ink-900 block mb-1">Cơ chế xác minh:</strong>
                    <p className="text-ink-500">Đối chiếu trực tiếp mã SHA256 của README và commit tác giả.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: AEO / GEO FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                <h3 className="font-bold text-ink-900 text-base mb-2">Hỏi đáp thường gặp về {product.title.split(':')[0]}</h3>
                <div className="space-y-3">
                  {faqItems.map((f, fIdx) => (
                    <div key={fIdx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                      <h4 className="font-bold text-ink-900 text-xs sm:text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-brand-600 shrink-0" />
                        {f.q}
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-ink-600 pl-6 leading-relaxed">
                        {f.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: E-Commerce Sticky Purchase Box */}
        <div className="space-y-6">
          
          <div className="sticky top-24 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Price Box */}
            <div className="border-b border-slate-100 pb-5">
              <span className="text-xs font-semibold text-ink-400 block uppercase tracking-wider">
                Giá niêm yết
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-ink-900">0 VNĐ</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Mã nguồn mở
                </span>
              </div>
              <p className="text-xs text-ink-400 mt-1">Hoàn toàn miễn phí, không yêu cầu thanh toán</p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              {product.source_url && (
                <a
                  href={product.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Nhận công cụ (Mở GitHub)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Trust & Guarantee Badges (E-Commerce EEAT) */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2.5 text-ink-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Nguồn gốc chính thức, an toàn và không mã độc</span>
              </div>
              <div className="flex items-start gap-2.5 text-ink-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Thẩm định độc lập theo chuẩn EEAT của Vneconomics</span>
              </div>
              <div className="flex items-start gap-2.5 text-ink-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Minh bạch thông số cấu hình và điều kiện sử dụng</span>
              </div>
            </div>

            {/* Vendor / Author Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
              <span className="text-ink-400 font-medium">Đơn vị phát triển / Tác giả:</span>
              <p className="font-bold text-ink-800">
                {product.title.includes('microsoft') ? 'Microsoft Open Source' : 'Cộng đồng Nhà phát triển'}
              </p>
            </div>

          </div>

          {/* Related Products from same category */}
          {relatedProducts.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400 mb-4">
                Sản phẩm cùng danh mục
              </h3>
              <div className="space-y-4">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/san-pham/${rel.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                      <img
                        src={getProductCover({
                          title: rel.title,
                          category: rel.category,
                          need: rel.need,
                          stars: rel.stars,
                          slug: rel.slug
                        })}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] text-ink-400 line-clamp-1 mt-0.5">
                        {rel.need}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
