import { Resource } from '../types';

/**
 * Remove Vietnamese accents and normalize for flexible search
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Check if a resource matches a search query with accent-insensitive and word-by-word matching
 */
export function matchResource(item: Resource, query: string): boolean {
  if (!query || !query.trim()) return true;

  const rawQuery = query.toLowerCase().trim();
  const normQuery = normalizeVietnamese(query);

  const rawTitle = (item.title || '').toLowerCase();
  const rawExcerpt = (item.excerpt || '').toLowerCase();
  const rawCategory = (item.category || '').toLowerCase();
  const rawNeed = (item.need || '').toLowerCase();
  const rawRequirements = (item.requirements || '').toLowerCase();
  const rawRepo = (item.repo_id || '').toLowerCase();
  const rawSlug = (item.slug || '').toLowerCase();

  // Direct raw match
  if (
    rawTitle.includes(rawQuery) ||
    rawExcerpt.includes(rawQuery) ||
    rawCategory.includes(rawQuery) ||
    rawNeed.includes(rawQuery) ||
    rawRequirements.includes(rawQuery) ||
    rawRepo.includes(rawQuery) ||
    rawSlug.includes(rawQuery)
  ) {
    return true;
  }

  // Normalized Vietnamese match
  const normTitle = normalizeVietnamese(item.title);
  const normExcerpt = normalizeVietnamese(item.excerpt);
  const normCategory = normalizeVietnamese(item.category);
  const normNeed = normalizeVietnamese(item.need);
  const normRequirements = normalizeVietnamese(item.requirements);
  const normRepo = normalizeVietnamese(item.repo_id);
  const normSlug = normalizeVietnamese(item.slug);

  const fullNormalizedContent = `${normTitle} ${normExcerpt} ${normCategory} ${normNeed} ${normRequirements} ${normRepo} ${normSlug}`;

  if (fullNormalizedContent.includes(normQuery)) {
    return true;
  }

  // Multi-word split match (all words must appear in content)
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => fullNormalizedContent.includes(token));
  }

  return false;
}

/**
 * Score and rank matching resources for quick search dropdown / autocomplete
 */
export function searchResources(items: Resource[], query: string, limit = 8): Resource[] {
  if (!query || !query.trim()) return [];

  const normQuery = normalizeVietnamese(query);
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);

  const scored: { item: Resource; score: number }[] = [];

  for (const item of items) {
    const normTitle = normalizeVietnamese(item.title);
    const normExcerpt = normalizeVietnamese(item.excerpt);
    const normCategory = normalizeVietnamese(item.category);
    const normNeed = normalizeVietnamese(item.need);
    const normRepo = normalizeVietnamese(item.repo_id);
    const fullNormalizedContent = `${normTitle} ${normExcerpt} ${normCategory} ${normNeed} ${normRepo} ${item.slug}`;

    let score = 0;

    // Exact title match
    if (normTitle === normQuery) {
      score += 100;
    } else if (normTitle.startsWith(normQuery)) {
      score += 60;
    } else if (normTitle.includes(normQuery)) {
      score += 40;
    }

    // Repo / Slug match
    if (normRepo.includes(normQuery) || item.slug.includes(normQuery)) {
      score += 30;
    }

    // Category / Need match
    if (normCategory.includes(normQuery) || normNeed.includes(normQuery)) {
      score += 25;
    }

    // Excerpt match
    if (normExcerpt.includes(normQuery)) {
      score += 15;
    }

    // Multi-token match check
    if (score === 0 && queryTokens.length > 1) {
      const allTokensMatch = queryTokens.every((token) => fullNormalizedContent.includes(token));
      if (allTokensMatch) {
        score += 20;
      }
    }

    if (score > 0) {
      // Add a slight boost from stars for relevance sorting
      const stars = item.stars || 0;
      const starBonus = Math.min(20, Math.log10(stars + 1) * 3);
      scored.push({ item, score: score + starBonus });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
