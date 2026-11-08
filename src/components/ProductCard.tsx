import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Heart } from 'lucide-react';
import { Resource } from '../types';
import { getProductCover } from '../utils/imageGenerator';

interface ProductCardProps {
  product: Resource;
  onSelect?: (product: Resource) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const formatSoldCount = (stars: number | null) => {
    if (!stars) return '1.2k';
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

  // Extract author or vendor from title/URL
  const vendorName = product.source_url?.includes('github.com/')
    ? product.source_url.split('github.com/')[1]?.split('/')[0]
    : 'Toàn cầu';

  return (
    <article className="group relative bg-white border border-slate-200 hover:border-brand-500 rounded-sm shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between overflow-hidden">
      
      {/* Product Image + Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Link to={`/san-pham/${product.slug}`} onClick={handleCardClick} className="block w-full h-full">
          <img
            src={coverUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          />
        </Link>

        {/* Top-Left: Tuyển Chọn Badge */}
        <div className="absolute top-2 left-0 z-10">
          <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-r-xs shadow-xs flex items-center gap-1">
            <Heart className="w-2.5 h-2.5 fill-white" />
            <span>Tuyển Chọn+</span>
          </span>
        </div>

        {/* Top-Right: 100% Miễn Phí Ribbon */}
        <div className="absolute top-0 right-0 z-10 bg-amber-400/95 text-amber-950 text-[10px] font-black px-1.5 py-1 text-center leading-tight shadow-xs">
          <span className="block font-black">-100%</span>
          <span className="text-white text-[9px] uppercase font-bold block bg-amber-700 px-0.5 rounded-2xs mt-0.5">0 ĐỒNG</span>
        </div>

        {/* Bottom Tag: EEAT Verified */}
        <div className="absolute bottom-1.5 left-1.5">
          <span className="bg-emerald-700/95 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-2xs uppercase tracking-wider shadow-2xs flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>EEAT VERIFIED</span>
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Title: 2 lines clamp */}
          <Link
            to={`/san-pham/${product.slug}`}
            onClick={handleCardClick}
            className="block text-xs font-semibold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-relaxed"
            title={product.title}
          >
            <span className="bg-brand-50 text-brand-700 border border-brand-200 text-[9px] font-bold px-1 py-0.2 rounded-2xs mr-1 align-baseline">
              Chính hãng
            </span>
            {product.title}
          </Link>

          {/* Tags */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
            <span className="border border-brand-300 text-brand-700 bg-brand-50/50 px-1 rounded-2xs font-medium">
              Mã nguồn mở 0đ
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded-2xs font-semibold">
              Đã thẩm định
            </span>
          </div>
        </div>

        <div>
          {/* Price Row: 0đ */}
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-[11px] text-ink-400 line-through">
              ₫990.000
            </span>
            <span className="text-sm sm:text-base font-extrabold text-brand-600 leading-none">
              ₫0
            </span>
          </div>

          {/* Rating, Sold count & Vendor */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-ink-500 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-[10px] text-ink-800 font-bold">5.0</span>
              <span className="text-[10px] text-ink-400">
                • Đã dùng {formatSoldCount(product.stars)}
              </span>
            </div>

            <span className="text-[10px] text-ink-400 truncate max-w-[80px]" title={vendorName}>
              {vendorName}
            </span>
          </div>
        </div>

      </div>

      {/* Hover action bar */}
      <div className="bg-brand-600 text-white text-center text-xs font-bold py-1.5 hidden group-hover:block transition-all">
        Xem chi tiết công cụ
      </div>

    </article>
  );
};
