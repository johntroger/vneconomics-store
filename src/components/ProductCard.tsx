import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, Bookmark, CheckCircle2 } from 'lucide-react';
import { Resource } from '../types';
import { getProductCover } from '../utils/imageGenerator';

interface ProductCardProps {
  product: Resource;
  onSelect?: (product: Resource) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [bookmarked, setBookmarked] = useState(false);

  const formatStars = (stars: number | null) => {
    if (!stars) return '4.8';
    if (stars >= 1000) return `${(stars / 1000).toFixed(1)}k`;
    return stars.toLocaleString();
  };

  const coverUrl = getProductCover({
    title: product.title,
    category: product.category,
    need: product.need,
    stars: product.stars,
    slug: product.slug,
  });

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <article className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-card-hover hover:border-brand-400/60 transition-all flex flex-col justify-between">
      
      {/* 16:9 Image Cover with Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <Link to={`/san-pham/${product.slug}`} onClick={handleCardClick} className="block w-full h-full">
          <img
            src={coverUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/95 text-brand-700 shadow-xs border border-white/40">
            {product.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600/95 text-white shadow-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã thẩm định</span>
          </span>
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setBookmarked(!bookmarked);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-xs transition-colors ${
            bookmarked ? 'bg-brand-600 text-white' : 'bg-white/90 text-ink-600 hover:bg-white'
          }`}
          title={bookmarked ? 'Đã lưu vào danh sách' : 'Lưu sản phẩm'}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Bottom image overlay: Price / License */}
        <div className="absolute bottom-2 left-2.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-ink-900/80 text-white backdrop-blur-xs">
            0đ • Miễn phí
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Need */}
          <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
            <span className="font-medium text-brand-700 bg-brand-50/80 px-2 py-0.5 rounded text-[11px]">
              {product.need}
            </span>
            {product.stars && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {formatStars(product.stars)}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/san-pham/${product.slug}`}
            onClick={handleCardClick}
            className="block text-sm sm:text-base font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
          >
            {product.title}
          </Link>

          {/* Excerpt */}
          <p className="mt-2 text-xs text-ink-500 line-clamp-2 leading-relaxed">
            {product.excerpt}
          </p>
        </div>

        {/* Action Bar (E-Commerce style) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            to={`/san-pham/${product.slug}`}
            onClick={handleCardClick}
            className="flex-1 py-1.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-semibold text-xs text-center transition-all"
          >
            Xem chi tiết
          </Link>

          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl border border-slate-200 hover:border-ink-800 text-ink-500 hover:text-ink-900 transition-colors"
              title="Đến nguồn tác giả"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

    </article>
  );
};
