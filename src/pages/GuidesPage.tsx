import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { guides } from '../data/guides';

export const GuidesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
          Thực hành từng bước
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 mt-2">
          Hướng dẫn thực nghiệm an toàn
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Các bài hướng dẫn được thiết kế để bạn thực hành trên một đầu ra nhỏ, có kiểm chứng và luôn giữ đường quay lại mà không làm xáo trộn hệ thống.
        </p>
      </div>

      {/* Guides List */}
      <div className="space-y-8 max-w-4xl">
        {guides.map((guide, idx) => (
          <article
            key={guide.id}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                Bài {idx + 1}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-ink-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{guide.readTime}</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-ink-900 leading-snug">
              {guide.title}
            </h2>

            <p className="mt-2 text-sm text-ink-600 leading-relaxed font-medium">
              {guide.excerpt}
            </p>

            {/* Prerequisites */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-ink-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink-800">Điều kiện chuẩn bị:</strong> {guide.prerequisites}
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="mt-6 space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400">
                Quy trình thực hiện:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {guide.steps.map((st, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-surface-100 border border-slate-200/60">
                    <span className="text-xs font-bold text-brand-700 block mb-1">
                      {st.title}
                    </span>
                    <p className="text-xs text-ink-500 leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
};
