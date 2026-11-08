import React from 'react';
import { X, Star, ExternalLink, ArrowRight, ShieldAlert, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Resource } from '../types';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({ resource, onClose }) => {
  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky modal header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {resource.category}
            </span>
            <span className="text-xs text-ink-400">•</span>
            <span className="text-xs font-medium text-ink-600">{resource.need}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-ink-400 hover:text-ink-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header Title & Stars */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {resource.stars && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {resource.stars.toLocaleString()} sao GitHub
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-ink-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                Dữ liệu quan sát: {resource.observed_at}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 leading-tight">
              {resource.title}
            </h2>
            <p className="mt-3 text-sm text-ink-600 leading-relaxed font-medium">
              {resource.excerpt}
            </p>
          </div>

          {/* Requirements & Conditions Box */}
          {resource.requirements && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Điều kiện & Giới hạn trước khi dùng:</span>
              </div>
              <p className="pl-6 text-amber-800/90 leading-relaxed">
                {resource.requirements}
              </p>
            </div>
          )}

          {/* Article HTML Content */}
          <div 
            className="article-prose pt-4 border-t border-slate-100 text-sm"
            dangerouslySetInnerHTML={{ __html: resource.content }}
          />

        </div>

        {/* Sticky footer actions */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/tai-nguyen/${resource.slug}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-800"
          >
            <span>Mở trang chi tiết riêng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-3">
            {resource.source_url && (
              <a
                href={resource.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink-900 hover:bg-black text-white text-xs sm:text-sm font-medium shadow-sm transition-all"
              >
                <span>Xem trên GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-ink-700 text-xs sm:text-sm font-medium transition-all"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
