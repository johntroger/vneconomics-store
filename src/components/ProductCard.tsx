import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Heart, GitBranch, ArrowUpRight } from 'lucide-react';
import { Resource } from '../types';
import { getProductCover } from '../utils/imageGenerator';

interface ProductCardProps {
  product: Resource;
  onSelect?: (product: Resource) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const formatStars = (stars: number | null) => {
    if (!stars) return 'Mới';
    if (stars >= 1000) return `${(stars / 1000).toFixed(1)}k★`;
    return `${stars.toLocaleString()}★`;
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

  // Extract author or vendor from title/URL
  const vendorName = product.source_url?.includes('github.com/')
    ? product.source_url.split('github.com/')[1]?.split('/')[0]
    : 'Cộng đồng';

  return (
    <article className="group relative bg-white border border-slate-200/90 hover:border-brand-500 rounded-lg shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between overflow-hidden">
      
      {/* Product Image + Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <Link to={`/san-pham/${product.slug}`} onClick={handleCardClick} className="block w-full h-full">
          <img
            src={coverUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
          />
        </Link>

        {/* Top-Left: Tuyển Chọn Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs backdrop-blur-2xs flex items-center gap-1">
            <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
            <span>Tuyển chọn</span>
          </span>
        </div>

        {/* Bottom Tag: EEAT Verified */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-emerald-700/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs uppercase tracking-wider flex items-center gap-1 backdrop-blur-2xs">
            <ShieldCheck className="w-3 h-3" />
            <span>EEAT VERIFIED</span>
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Need / Category badge */}
          <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1">
            <span className="font-medium text-brand-700 truncate max-w-[140px]">
              {product.need}
            </span>
            <span className="text-slate-400 text-[10px] truncate max-w-[80px]" title={vendorName}>
              {vendorName}
            </span>
          </div>

          {/* Title: 2 lines clamp */}
          <Link
            to={`/san-pham/${product.slug}`}
            onClick={handleCardClick}
            className="block text-xs sm:text-sm font-bold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Excerpt */}
          <p className="mt-1 text-[11px] text-ink-500 line-clamp-2 leading-relaxed">
            {product.excerpt}
          </p>
        </div>

        {/* Footer Meta Row: Stars, License & Details */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{formatStars(product.stars)}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-ink-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            <GitBranch className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[90px]">{product.license ? product.license.split(' ')[0] : 'Open Source'}</span>
          </div>
        </div>

      </div>

      {/* Hover action bar */}
      <div className="bg-slate-900 text-white text-center text-xs font-semibold py-1.5 hidden group-hover:flex items-center justify-center gap-1 transition-all">
        <span>Xem thông số & tài liệu</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </div>

    </article>
  );
};
