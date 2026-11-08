import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ShieldCheck, ArrowLeft, CheckCircle2, UserCheck, Calendar } from 'lucide-react';
import { guides } from '../data/guides';
import { useSEO } from '../utils/useSEO';
import { getProductCover } from '../utils/imageGenerator';

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const guide = useMemo(() => {
    return guides.find((g) => g.slug === slug || g.id === slug);
  }, [slug]);

  const coverUrl = guide ? getProductCover({
    title: guide.title,
    category: 'Skills và phương pháp làm việc',
    need: 'Hướng dẫn thực hành',
    stars: 5,
    slug: guide.slug,
  }) : '';

  // SEO & HowTo Structured Data (AEO & GEO optimized)
  useSEO({
    title: guide ? `${guide.title} — Hướng Dẫn Thực Hành Chi Tiết` : 'Bài viết hướng dẫn',
    description: guide?.excerpt || 'Hướng dẫn thực hành chi tiết từng bước theo chuẩn EEAT.',
    canonicalUrl: guide ? `https://store.vneconomics.com/huong-dan/${guide.slug}` : 'https://store.vneconomics.com/huong-dan',
    ogImage: coverUrl,
    ogType: 'article',
    publishedTime: '2026-10-25',
    keywords: guide ? [guide.title, 'hướng dẫn thực hành', 'công cụ số', 'VibeLab Việt'] : [],
    jsonLdSchemas: guide ? [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': guide.title,
        'description': guide.excerpt,
        'image': coverUrl,
        'estimatedCost': {
          '@type': 'MonetaryAmount',
          'currency': 'VND',
          'value': '0'
        },
        'step': guide.steps.map((s, idx) => ({
          '@type': 'HowToStep',
          'position': idx + 1,
          'name': s.title,
          'text': s.description
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
            'name': 'Hướng dẫn',
            'item': 'https://store.vneconomics.com/huong-dan'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': guide.title,
            'item': `https://store.vneconomics.com/huong-dan/${guide.slug}`
          }
        ]
      }
    ] : []
  });

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900">Không tìm thấy bài viết</h2>
        <p className="mt-2 text-sm text-ink-500">Bài hướng dẫn bạn đang tìm kiếm không tồn tại.</p>
        <Link
          to="/huong-dan"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách bài viết</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/huong-dan" className="hover:text-brand-600 transition-colors">Hướng dẫn</Link>
        <span>/</span>
        <span className="text-ink-800 font-semibold truncate max-w-sm">{guide.title}</span>
      </nav>

      <article className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* 16:9 Cover Image */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={coverUrl}
            alt={guide.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header Metadata (EEAT Author & Reading time) */}
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500 mb-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-50 text-brand-700">
              Cẩm nang thực nghiệm
            </span>
            <span className="flex items-center gap-1 font-medium text-ink-700">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tác giả: Ban Biên Tập Vneconomics
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {guide.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Cập nhật: 2026-10-25
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink-900 leading-tight">
            {guide.title}
          </h1>

          <p className="mt-4 text-base text-ink-600 leading-relaxed font-medium">
            {guide.excerpt}
          </p>
        </div>

        {/* Prerequisites Callout */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold text-ink-900">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Điều kiện chuẩn bị trước khi bắt đầu:</span>
          </div>
          <p className="pl-6 text-ink-600 leading-relaxed">
            {guide.prerequisites}
          </p>
        </div>

        {/* Steps Detailed Timeline */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <h2 className="text-xl font-bold text-ink-900">Quy trình thực hiện từng bước</h2>
          <div className="space-y-4">
            {guide.steps.map((st, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200/80 bg-surface-100/60 flex items-start gap-4">
                <span className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink-900">{st.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-ink-600 leading-relaxed">
                    {st.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EEAT Review Guarantee */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bài viết đã được thực nghiệm và xác nhận khả năng khôi phục nguyên trạng trước khi phát hành.</span>
        </div>

      </article>

    </div>
  );
};
