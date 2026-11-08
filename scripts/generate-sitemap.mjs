import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://store.vneconomics.com';
const TODAY = new Date().toISOString().split('T')[0];

async function main() {
  console.log('Generating sitemap.xml and robots.txt...');

  // 1. Create robots.txt
  const robotsContent = `# Robots.txt for VibeLab Store (store.vneconomics.com)
User-agent: *
Allow: /

# Host
Host: ${BASE_URL}

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf8');
  console.log('Created public/robots.txt');

  // 2. Read resources, categories, guides to build sitemap
  // We can extract slugs directly or parse the TypeScript data files
  const resourcesContent = fs.readFileSync(path.resolve('src/data/resources.ts'), 'utf8');
  const categoriesContent = fs.readFileSync(path.resolve('src/data/categories.ts'), 'utf8');
  const guidesContent = fs.readFileSync(path.resolve('src/data/guides.ts'), 'utf8');

  // Extract slugs
  const resourceSlugs = [];
  const resourceMatches = resourcesContent.matchAll(/(?:"slug"|\bslug)\s*:\s*['"]([^'"]+)['"]/g);
  for (const match of resourceMatches) {
    if (!resourceSlugs.includes(match[1])) {
      resourceSlugs.push(match[1]);
    }
  }

  const categorySlugs = [];
  const categoryMatches = categoriesContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
  for (const match of categoryMatches) {
    if (!categorySlugs.includes(match[1])) {
      categorySlugs.push(match[1]);
    }
  }

  const guideSlugs = [];
  const guideMatches = guidesContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
  for (const match of guideMatches) {
    if (!guideSlugs.includes(match[1])) {
      guideSlugs.push(match[1]);
    }
  }

  console.log(`Found ${resourceSlugs.length} resources, ${categorySlugs.length} categories, ${guideSlugs.length} guides.`);

  const urls = [
    // Core pages
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE_URL}/tai-nguyen`, priority: '0.9', changefreq: 'daily' },
    { loc: `${BASE_URL}/huong-dan`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${BASE_URL}/tieu-chi`, priority: '0.8', changefreq: 'monthly' },
  ];

  // Category pages
  for (const slug of categorySlugs) {
    urls.push({
      loc: `${BASE_URL}/danh-muc/${slug}`,
      priority: '0.8',
      changefreq: 'weekly'
    });
  }

  // Guide detail pages
  for (const slug of guideSlugs) {
    urls.push({
      loc: `${BASE_URL}/huong-dan/${slug}`,
      priority: '0.7',
      changefreq: 'weekly'
    });
  }

  // Resource detail pages (100 tools)
  for (const slug of resourceSlugs) {
    urls.push({
      loc: `${BASE_URL}/san-pham/${slug}`,
      priority: '0.8',
      changefreq: 'weekly'
    });
  }

  // Build XML
  const xmlEntries = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`Created public/sitemap.xml with ${urls.length} URLs.`);
}

main().catch((err) => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
