/**
 * Dynamic High-Quality SVG Cover Generator
 * Generates content-matching 16:9 (800x450) SVG covers for each software resource and guide.
 */

interface CoverOptions {
  title: string;
  category: string;
  need?: string;
  stars?: number | null;
  slug?: string;
}

const categoryPalettes: Record<string, { from: string; to: string; accent: string }> = {
  'Tài liệu và công việc văn phòng': { from: '#141d2c', to: '#2456b8', accent: '#60a5fa' },
  'Ghi chú và tri thức cá nhân': { from: '#2e1065', to: '#6366f1', accent: '#a855f7' },
  'Workflow và ứng dụng trực quan': { from: '#064e3b', to: '#059669', accent: '#34d399' },
  'AI trên máy và không gian trò chuyện': { from: '#083344', to: '#0891b2', accent: '#22d3ee' },
  'Coding agent và cách làm dự án': { from: '#18181b', to: '#3f3f46', accent: '#f59e0b' },
  'Skills và phương pháp làm việc': { from: '#701a75', to: '#c026d3', accent: '#f472b6' },
  'Thiết kế và hình ảnh': { from: '#4c0519', to: '#e11d48', accent: '#fb7185' },
  'Âm thanh và video': { from: '#7c2d12', to: '#ea580c', accent: '#fb923c' },
  'Dữ liệu và giao diện ứng dụng': { from: '#134e4a', to: '#0d9488', accent: '#2dd4bf' },
  'Lưu trữ và công cụ cá nhân': { from: '#1e293b', to: '#475569', accent: '#94a3b8' },
};

export function getProductCover({ title, category, need, stars }: CoverOptions): string {
  const palette = categoryPalettes[category] || { from: '#141d2c', to: '#2456b8', accent: '#60a5fa' };
  
  // Format stars
  const starsLabel = stars ? (stars >= 1000 ? `${(stars / 1000).toFixed(1)}k★` : `${stars}★`) : 'Verified';

  // Sanitize text for SVG
  const cleanTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cleanCategory = category.replace(/&/g, '&amp;');
  const cleanNeed = (need || 'Công cụ số').replace(/&/g, '&amp;');

  // Truncate title if long
  const displayTitle = cleanTitle.length > 50 ? cleanTitle.slice(0, 48) + '...' : cleanTitle;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.from}"/>
        <stop offset="100%" stop-color="${palette.to}"/>
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.08"/>
      </pattern>
    </defs>

    <!-- Background -->
    <rect width="800" height="450" fill="url(#bg)"/>
    <rect width="800" height="450" fill="url(#glow)"/>
    <rect width="800" height="450" fill="url(#grid)"/>

    <!-- Decorative Top Circle -->
    <circle cx="700" cy="80" r="140" fill="${palette.accent}" opacity="0.15" filter="blur(30px)"/>
    <circle cx="100" cy="380" r="160" fill="#ffffff" opacity="0.05" filter="blur(40px)"/>

    <!-- Top Badge Row -->
    <g transform="translate(50, 50)">
      <!-- Category Pill -->
      <rect x="0" y="0" width="240" height="34" rx="17" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="1" stroke-opacity="0.25"/>
      <text x="18" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#ffffff" letter-spacing="0.5">
        ${cleanCategory}
      </text>

      <!-- Star Badge -->
      <rect x="250" y="0" width="100" height="34" rx="17" fill="#f59e0b" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1" stroke-opacity="0.6"/>
      <text x="268" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#fef3c7">
        ${starsLabel}
      </text>
    </g>

    <!-- Center Product Title Box -->
    <g transform="translate(50, 160)">
      <text x="0" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="-0.5">
        ${displayTitle}
      </text>
      
      <rect x="0" y="70" width="80" height="4" rx="2" fill="${palette.accent}"/>

      <text x="0" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#e2e8f0" opacity="0.9">
        Mục đích: ${cleanNeed}
      </text>
    </g>

    <!-- Bottom Footer Bar inside Cover -->
    <g transform="translate(50, 370)">
      <line x1="0" y1="0" x2="700" y2="0" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1"/>
      <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#ffffff" opacity="0.8">
        VIBELAB VIỆT • THƯ VIỆN CÔNG CỤ SỐ CÓ BIÊN TẬP
      </text>
      <text x="700" y="32" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="${palette.accent}">
        STORE.VNECONOMICS.COM
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
