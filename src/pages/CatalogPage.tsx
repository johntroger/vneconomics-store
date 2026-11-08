import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { ResourceDetailModal } from '../components/ResourceDetailModal';
import { resources } from '../data/resources';
import { categories, needs } from '../data/categories';
import { Resource } from '../types';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialNeed = searchParams.get('need') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedNeed, setSelectedNeed] = useState(initialNeed);
  const [sortBy, setSortBy] = useState<'stars' | 'id' | 'title'>('stars');

  useEffect(() => {
    if (searchParams.get('q') !== null) setSearchTerm(searchParams.get('q') || '');
    if (searchParams.get('category') !== null) setSelectedCategory(searchParams.get('category') || '');
    if (searchParams.get('need') !== null) setSelectedNeed(searchParams.get('need') || '');
  }, [searchParams]);

  // Filter & Sort logic
  const filteredResources = useMemo(() => {
    return resources
      .filter((item) => {
        const matchesSearch =
          !searchTerm.trim() ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.need.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          !selectedCategory || item.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesNeed =
          !selectedNeed || item.need.toLowerCase() === selectedNeed.toLowerCase();

        return matchesSearch && matchesCategory && matchesNeed;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') {
          return (b.stars || 0) - (a.stars || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return a.id - b.id;
      });
  }, [searchTerm, selectedCategory, selectedNeed, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedNeed('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(searchTerm || selectedCategory || selectedNeed);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header section */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
          Kho lưu trữ có thẩm định
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 mt-2">
          Thư viện tài nguyên & công cụ
        </h1>
        <p className="text-sm text-ink-500 mt-1 max-w-2xl">
          Toàn bộ 100 tài nguyên được tuyển chọn, phân loại theo mục đích cụ thể và đi kèm thông tin điều kiện, nguồn tác giả.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-8 space-y-4">
        
        {/* Search input + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên công cụ, việc cần làm, từ khóa..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs text-ink-400 font-medium hidden sm:inline">Sắp xếp:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-ink-700 hover:bg-white focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
              >
                <option value="stars">Nhiều sao GitHub nhất</option>
                <option value="id">Thứ tự mặc định</option>
                <option value="title">Tên A-Z</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-ink-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dropdown filters for Category and Need */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 text-ink-700 focus:bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Tất cả danh mục (10)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedNeed}
              onChange={(e) => setSelectedNeed(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 text-ink-700 focus:bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Tất cả nhu cầu công việc (10)</option>
              {needs.map((n) => (
                <option key={n.id} value={n.name}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}

        </div>

      </div>

      {/* Results header / count */}
      <div className="flex items-center justify-between mb-6 text-xs text-ink-500">
        <p>
          Tìm thấy <strong className="text-ink-900 font-bold">{filteredResources.length}</strong> / {resources.length} tài nguyên phù hợp
        </p>
      </div>

      {/* Grid of Resource Cards */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => (
            <ResourceCard
              key={item.id}
              resource={item}
              onSelect={setSelectedResource}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-ink-400 mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ink-900">Không tìm thấy tài nguyên phù hợp</h3>
          <p className="mt-1 text-xs text-ink-500 max-w-sm mx-auto">
            Hãy thử tìm bằng từ khóa tổng quát hơn hoặc xóa bớt bộ lọc danh mục và nhu cầu.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors"
          >
            Khôi phục tất cả tài nguyên
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />

    </div>
  );
};
