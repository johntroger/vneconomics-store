import React from 'react';
import { CheckCircle2, AlertTriangle, FileSearch } from 'lucide-react';

export const CriteriaPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Minh bạch thông tin
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 mt-3">
          Tiêu chí tuyển chọn & Biên tập
        </h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          VibeLab Việt được xây dựng với mục tiêu giúp người đọc có đủ thông tin tin cậy trước khi quyết định tải về hoặc đưa một công cụ vào công việc.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Core Principle 1 */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-brand-600">Tiêu chí 1</span>
              <h2 className="text-lg sm:text-xl font-bold text-ink-900">
                Dẫn về nguồn gốc cụ thể của tác giả
              </h2>
            </div>
          </div>
          <p className="text-sm text-ink-600 leading-relaxed">
            Mỗi tài nguyên trong thư viện bắt buộc phải có liên kết dẫn thẳng về repository GitHub, trang chủ chính thức hoặc tài liệu kỹ thuật của tác giả. Chúng tôi không lưu trữ lại các file cài đặt không rõ nguồn gốc và không che giấu danh tính nhà phát triển.
          </p>
        </section>

        {/* Core Principle 2 */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-600">Tiêu chí 2</span>
              <h2 className="text-lg sm:text-xl font-bold text-ink-900">
                Nói rõ điều kiện, môi trường & giới hạn
              </h2>
            </div>
          </div>
          <p className="text-sm text-ink-600 leading-relaxed">
            Chúng tôi phân biệt rõ ràng giữa hai trạng thái: <strong>Đã đọc tài liệu tác giả</strong> và <strong>Đã cài đặt chạy thử nghiệm</strong>. Nếu công cụ đòi hỏi phiên bản Python cụ thể, yêu cầu GPU hoặc phát sinh chi phí API bên thứ ba, các thông tin này luôn được đặt ở vị trí nổi bật nhất.
          </p>
        </section>

        {/* Core Principle 3 */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-600">Tiêu chí 3</span>
              <h2 className="text-lg sm:text-xl font-bold text-ink-900">
                Không tạo bằng chứng giả hay số liệu ảo
              </h2>
            </div>
          </div>
          <p className="text-sm text-ink-600 leading-relaxed">
            Số sao GitHub được ghi nhận là một tín hiệu khách quan tại thời điểm quan sát cụ thể (có gắn mác ngày tháng), hoàn toàn không phải lời khẳng định về chất lượng tuyệt đối của phần mềm. Thư viện không nhận tiền để đánh giá tốt hay ưu tiên hiển thị công cụ.
          </p>
        </section>

      </div>

    </div>
  );
};
