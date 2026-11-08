import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  ExternalLink, 
  ShieldAlert, 
  Calendar
} from 'lucide-react';
import { resources } from '../data/resources';

export const ResourceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const resource = useMemo(() => {
    return resources.find((r) => r.slug === slug);
  }, [slug]);

  const relatedResources = useMemo(() => {
    if (!resource) return [];
    return resources
      .filter((r) => r.category === resource.category && r.id !== resource.id)
      .slice(0, 3);
  }, [resource]);

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900">Không tìm thấy tài nguyên</h2>
        <p className="mt-2 text-sm text-ink-500">Mục bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn.</p>
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
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-ink-500 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/tai-nguyen" className="hover:text-brand-600 transition-colors">Tài nguyên</Link>
        <span>/</span>
        <span className="text-ink-800 font-medium truncate max-w-xs">{resource.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                {resource.category}
              </span>
              <span className="text-xs font-medium text-ink-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Việc cần làm: {resource.need}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink-900 leading-tight">
              {resource.title}
            </h1>

            <p className="mt-4 text-base text-ink-600 leading-relaxed font-medium">
              {resource.excerpt}
            </p>

            {/* Requirements Alert Box */}
            {resource.requirements && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Điều kiện tiên quyết & Giới hạn:</span>
                </div>
                <p className="pl-6 text-amber-800/90 leading-relaxed">
                  {resource.requirements}
                </p>
              </div>
            )}

            {/* Full Article HTML */}
            <div
              className="article-prose mt-8 pt-8 border-t border-slate-100 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />

          </div>

        </div>

        {/* Sidebar Info (Right 1 col) */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">
              Thông số kỹ thuật
            </h3>

            {/* GitHub Stars */}
            {resource.stars && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-ink-500 font-medium">Sao GitHub</span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {resource.stars.toLocaleString()}
                </span>
              </div>
            )}

            {/* Observed Date */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-ink-500 font-medium">Ngày quan sát</span>
              <span className="font-semibold text-ink-800 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-ink-400" />
                {resource.observed_at}
              </span>
            </div>

            {/* License Note */}
            <div className="py-2 border-b border-slate-100 text-xs">
              <span className="text-ink-500 font-medium block mb-1">Giấy phép & Chi phí</span>
              <p className="text-ink-700 leading-normal">
                {resource.license || 'Xem trong tài liệu tác giả.'}
              </p>
            </div>

            {/* Source Repo Button */}
            {resource.source_url && (
              <div className="pt-2">
                <a
                  href={resource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <span>Mở Repository tác giả</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Related Resources */}
          {relatedResources.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400 mb-4">
                Cùng danh mục
              </h3>
              <div className="space-y-4">
                {relatedResources.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/tai-nguyen/${rel.slug}`}
                    className="block group"
                  >
                    <h4 className="text-xs font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-ink-400 mt-1 line-clamp-1">
                      {rel.need}
                    </p>
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
