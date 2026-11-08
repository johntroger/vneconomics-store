import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, ArrowRight } from 'lucide-react';
import { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
  onSelect?: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onSelect }) => {
  const formatStars = (stars: number | null) => {
    if (!stars) return null;
    if (stars >= 1000) {
      return `${(stars / 1000).toFixed(1)}k`;
    }
    return stars.toLocaleString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(resource);
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-brand-400/60 hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200/60 truncate max-w-[200px]">
            {resource.category}
          </span>

          {resource.stars && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {formatStars(resource.stars)}
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/tai-nguyen/${resource.slug}`}
          onClick={handleCardClick}
          className="block group-hover:text-brand-600 transition-colors"
        >
          <h3 className="text-base font-bold text-ink-900 leading-snug line-clamp-2">
            {resource.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="mt-2 text-xs text-ink-500 line-clamp-3 leading-relaxed">
          {resource.excerpt}
        </p>

        {/* Need / Specific purpose tag */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-ink-600">
          <span className="font-medium text-ink-400">Việc cần làm:</span>
          <span className="font-semibold text-brand-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
            {resource.need}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/tai-nguyen/${resource.slug}`}
          onClick={handleCardClick}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {resource.source_url && (
          <a
            href={resource.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-800 transition-colors p-1"
            title="Đến nguồn tác giả gốc"
          >
            <span>Nguồn gốc</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
