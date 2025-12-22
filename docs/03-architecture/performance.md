# Performance Optimization and Monitoring

## Overview

This document defines performance standards and monitoring strategies for web applications. Fast applications lead to better user experience, higher conversion rates, and improved SEO rankings.

**Tools**:
- **Lighthouse CI** - Automated performance testing (free, open source)
- **Google PageSpeed Insights** - Real user data + lab tests (free)
- **Better Stack RUM** - Real user monitoring (included with Better Stack)

**Cost**: $0 (all free tools)

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Core Web Vitals**: LCP < 2.5s, INP < 200ms, CLS < 0.1 (see [Performance Targets](#performance-targets))
- **Lighthouse CI**: Automated testing on every PR, must score 90+ (see [Lighthouse CI Setup](#lighthouse-ci))
- **Image Optimization**: WebP/AVIF, lazy loading, proper sizing (see [Optimization Strategies](#optimization-strategies))
- **Code Splitting**: Dynamic imports, route-based splitting (see [Optimization Strategies](#optimization-strategies))
- **Real User Monitoring**: Track actual user experience with Better Stack (see [Monitoring Performance](#monitoring))

**Quick Example:**
```typescript
// GOOD - Optimized image with lazy loading
<Image
  src="/hero.webp"
  width={1200}
  height={630}
  loading="lazy"
  alt="Hero image"
/>

// BAD - Unoptimized large image
<img src="/hero.jpg" /> // Slows LCP, no lazy loading
```

**Key Sections:**
- [Performance Targets](#performance-targets) - Core Web Vitals thresholds
- [Lighthouse CI Setup](#lighthouse-ci) - Automated performance testing
- [Optimization Strategies](#optimization-strategies) - Images, code splitting, caching
- [Monitoring Performance](#monitoring) - Real user metrics

---

## Performance Targets {#performance-targets}

### Core Web Vitals (Google's Official Metrics)

**Every page MUST meet these targets**:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

**Why these matter**:
- **LCP**: How fast main content loads (user perceives "page is loaded")
- **INP**: How fast page responds to user interactions (clicks, taps)
- **CLS**: Visual stability (no unexpected layout shifts)

### Additional Performance Metrics

| Metric | Target |
|--------|--------|
| **FCP** (First Contentful Paint) | < 1.8s |
| **TTFB** (Time to First Byte) | < 600ms |
| **Speed Index** | < 3.4s |
| **Total Blocking Time** | < 200ms |

### Performance Budget

Set limits to prevent performance regression:

```javascript
// lighthouse-budget.json
{
  "path": "/*",
  "timings": [
    { "metric": "interactive", "budget": 3000 },
    { "metric": "first-contentful-paint", "budget": 1800 },
    { "metric": "largest-contentful-paint", "budget": 2500 }
  ],
  "resourceSizes": [
    { "resourceType": "script", "budget": 300 },
    { "resourceType": "image", "budget": 500 },
    { "resourceType": "stylesheet", "budget": 50 },
    { "resourceType": "total", "budget": 1000 }
  ],
  "resourceCounts": [
    { "resourceType": "third-party", "budget": 10 }
  ]
}
```

---

## Lighthouse CI Setup {#lighthouse-ci}

### 1. Install Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

### 2. Configure Lighthouse CI

Create `lighthouserc.json` in project root:

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run build && npm run start",
      "startServerReadyPattern": "ready on",
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/pricing",
        "http://localhost:3000/about"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],

        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 200}],

        "uses-optimized-images": "error",
        "uses-text-compression": "error",
        "uses-responsive-images": "error"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 3. Add NPM Scripts

```json
{
  "scripts": {
    "lhci:mobile": "lhci autorun --config=lighthouserc.json",
    "lhci:desktop": "lhci autorun --config=lighthouserc-desktop.json",
    "perf:check": "npm run lhci:mobile && npm run lhci:desktop"
  }
}
```

### 4. GitHub Actions Integration

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run Lighthouse CI
        run: npm run lhci:mobile
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-results
          path: .lighthouseci
```

### 5. Fail Builds on Performance Regressions

Lighthouse CI will **fail the build** if:
- Performance score < 90
- LCP > 2.5s
- CLS > 0.1
- Images not optimized

This prevents shipping slow code.

---

## Performance Optimization Strategies {#optimization-strategies}

### 1. Image Optimization

**Problem**: Images are usually the biggest performance bottleneck

**Solution**: Use Next.js Image component

```tsx
// BAD 
<img src="/hero.jpg" alt="Hero" />

// GOOD 
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // For LCP images
  quality={85}
/>
```

**Benefits**:
- Automatic WebP/AVIF conversion
- Responsive images (multiple sizes)
- Lazy loading (below the fold)
- Blur placeholder while loading

**For LCP images** (hero images, above-fold content):
```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // ← Preload this image
  quality={90}
/>
```

### 2. Font Optimization

**Problem**: Custom fonts block rendering

**Solution**: Use Next.js Font optimization

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Show fallback font immediately
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

**Benefits**:
- Self-hosted (no Google Fonts CDN)
- Automatic subsetting (smaller files)
- Preloaded in `<head>`
- No layout shift

### 3. Code Splitting

**Problem**: Large JavaScript bundles slow down page loads

**Solution**: Dynamic imports for heavy components

```tsx
// BAD - Always loads Chart.js (large library)
import Chart from './Chart';

export default function Dashboard() {
  return <Chart data={data} />;
}

// GOOD - Loads Chart.js only when needed
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,  // Don't render on server (client-only)
});

export default function Dashboard() {
  return <Chart data={data} />;
}
```

**For route-based splitting**:
```tsx
// Next.js automatically code-splits by route
// Each page only loads its own JavaScript

// app/dashboard/page.tsx - Only loaded when visiting /dashboard
export default function Dashboard() {
  // Heavy dashboard code here
}
```

### 4. Reduce JavaScript Bundle Size

**Analyze bundle**:
```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your config
});
```

**Run analysis**:
```bash
ANALYZE=true npm run build
```

**Common optimizations**:
- Remove unused dependencies
- Use lighter alternatives (date-fns instead of moment.js)
- Tree-shake libraries (import specific functions, not entire library)

```tsx
// BAD 
import _ from 'lodash';  // Imports entire 70KB library

// GOOD 
import debounce from 'lodash/debounce';  // Imports only 5KB
```

### 5. Server-Side Rendering (SSR) vs Static Generation

**Static Generation** (fastest):
```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}
```

**Server-Side Rendering** (dynamic data):
```tsx
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';  // Always SSR

export default async function Dashboard() {
  const user = await getCurrentUser();
  return <DashboardView user={user} />;
}
```

**Client-Side Rendering** (interactive):
```tsx
'use client';

export default function InteractiveChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  return <Chart data={data} />;
}
```

**Choose wisely**:
- **Static**: Marketing pages, blog posts, docs (fastest)
- **SSR**: User dashboards, personalized content
- **CSR**: Interactive widgets, real-time data

### 6. Caching

**API Response Caching**:
```typescript
// app/api/products/route.ts
export async function GET() {
  const data = await fetchProducts();

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

**See `docs/03-architecture/caching-strategy.md` for complete caching guide**

### 7. Lazy Load Below-the-Fold Content

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function BlogPost({ content }) {
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    // Load comments only when user scrolls near them
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShowComments(true);
      }
    });

    const commentsAnchor = document.getElementById('comments');
    if (commentsAnchor) observer.observe(commentsAnchor);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Article content={content} />
      <div id="comments">
        {showComments ? <Comments /> : <div>Loading comments...</div>}
      </div>
    </>
  );
}
```

### 8. Minimize Layout Shift (CLS)

**Reserve space for images**:
```tsx
// BAD - Causes layout shift when image loads
<img src="/hero.jpg" alt="Hero" />

// GOOD - Reserves space (no shift)
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
/>
```

**Reserve space for dynamic content**:
```tsx
// Loading skeleton to prevent shift
export default function UserProfile() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-32 bg-gray-200 animate-pulse rounded" />
    );
  }

  return <div className="h-32 rounded">{user.name}</div>;
}
```

**Avoid inserting content above existing content**:
```tsx
// BAD - Banner pushes content down
{showBanner && <Banner />}
<MainContent />

// GOOD - Banner is fixed (no shift)
{showBanner && <Banner className="fixed top-0" />}
<MainContent className="mt-16" />
```

---

## Monitoring Performance {#monitoring}

### 1. Google PageSpeed Insights

**Check production URLs**:
1. Go to https://pagespeed.web.dev/
2. Enter your URL (e.g., `https://yourapp.com`)
3. See both Lab Data (simulated) and Field Data (real users)

**Run monthly** to track performance trends.

### 2. Chrome User Experience Report (CrUX)

**Real user data from Chrome users**:
- Available in Google Search Console
- Shows 28-day rolling average
- Broken down by device type (mobile, desktop, tablet)

### 3. Better Stack Real User Monitoring

**Track actual user performance**:

```typescript
// Track Core Web Vitals
import { onCLS, onINP, onLCP } from 'web-vitals';

onLCP((metric) => {
  logger.info('LCP', {
    value: metric.value,
    rating: metric.rating,  // 'good', 'needs-improvement', 'poor'
  });
});

onINP((metric) => {
  logger.info('INP', {
    value: metric.value,
    rating: metric.rating,
  });
});

onCLS((metric) => {
  logger.info('CLS', {
    value: metric.value,
    rating: metric.rating,
  });
});
```

### 4. Continuous Monitoring in CI/CD

Every pull request runs Lighthouse:
- Fails if performance score < 90
- Fails if LCP > 2.5s
- Fails if CLS > 0.1

**Prevents shipping slow code.**

---

## Performance Checklist

Before production:

### Images
- [ ] All images use Next.js Image component
- [ ] LCP images use `priority` prop
- [ ] Images have explicit width/height (prevent CLS)
- [ ] Images use WebP or AVIF format
- [ ] Large images compressed (< 200KB per image)

### JavaScript
- [ ] Bundle size analyzed (< 300KB for main bundle)
- [ ] Heavy components dynamically imported
- [ ] Unused dependencies removed
- [ ] Tree-shaking enabled (Next.js default)

### Fonts
- [ ] Fonts use Next.js Font optimization
- [ ] Font display set to 'swap'
- [ ] Only necessary font weights included

### Rendering
- [ ] Marketing pages use Static Generation
- [ ] Dynamic pages use appropriate strategy (SSR/CSR)
- [ ] API responses cached where possible

### Layout Stability
- [ ] Images have width/height (no CLS)
- [ ] Loading states have same height as content
- [ ] No content inserted above fold after load

### Monitoring
- [ ] Lighthouse CI configured in GitHub Actions
- [ ] Performance budgets set
- [ ] Core Web Vitals tracked in Better Stack
- [ ] Monthly PageSpeed Insights check scheduled

---

## Performance Budget Enforcement

**Lighthouse CI will fail builds if**:

```json
{
  "assertions": {
    "categories:performance": ["error", {"minScore": 0.9}],
    "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
    "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
    "total-blocking-time": ["error", {"maxNumericValue": 200}],
    "resourceSizes:script": ["error", {"maxNumericValue": 300000}],
    "resourceSizes:image": ["error", {"maxNumericValue": 500000}]
  }
}
```

This **prevents performance regressions** - you can't ship slow code.

---

## Common Performance Issues

### Issue 1: Slow LCP (> 2.5s)

**Causes**:
- Large images without `priority`
- Blocking JavaScript/CSS
- Slow server response (TTFB > 600ms)

**Solutions**:
```tsx
// Add priority to LCP image
<Image src="/hero.jpg" priority width={1200} height={600} />

// Preload critical CSS
<link rel="preload" href="/styles/critical.css" as="style" />

// Optimize database queries (see database-optimization.md)
```

### Issue 2: Poor INP (> 200ms)

**Causes**:
- Heavy JavaScript blocking main thread
- Long-running event handlers
- Too many re-renders

**Solutions**:
```tsx
// Debounce expensive operations
import { debounce } from 'lodash';

const handleSearch = debounce((query) => {
  fetchResults(query);
}, 300);

// Use React.memo to prevent unnecessary re-renders
const ExpensiveComponent = React.memo(({ data }) => {
  return <HeavyVisualization data={data} />;
});

// Move heavy work to Web Workers
const worker = new Worker('/workers/process-data.js');
worker.postMessage(data);
```

### Issue 3: High CLS (> 0.1)

**Causes**:
- Images without dimensions
- Fonts loading late (FOIT/FOUT)
- Ads/embeds without reserved space

**Solutions**:
```tsx
// Always set image dimensions
<Image src="/banner.jpg" width={1200} height={400} />

// Use Next.js Font (prevents FOIT)
import { Inter } from 'next/font/google';

// Reserve space for ads
<div className="h-[250px]">
  <AdBanner />
</div>
```

---

## Mobile Performance

**Mobile is slower** - optimize specifically for mobile:

### Mobile-Specific Optimizations

```tsx
// Serve smaller images on mobile
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Reduce JavaScript on mobile
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false,
  loading: () => <Skeleton />,
});

// Simplify mobile UI
export default function Dashboard() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isMobile ? <SimpleDashboard /> : <FullDashboard />}
    </div>
  );
}
```

---

## Testing Performance Locally

```bash
# 1. Build production version
npm run build

# 2. Start production server
npm start

# 3. Run Lighthouse (in Chrome DevTools)
# Open DevTools → Lighthouse tab → Generate report

# 4. Or use CLI
npx lighthouse http://localhost:3000 --view
```

**Test on throttled connection**:
- Chrome DevTools → Network tab → "Slow 3G"
- Simulates slow mobile connections
- Reveals hidden performance issues

---

## Cost of Performance

**All tools used are FREE**:
- Lighthouse CI - Open source, runs in GitHub Actions (free)
- Google PageSpeed Insights - Free
- Chrome DevTools - Free
- Better Stack RUM - Included with Better Stack ($78-117/month)

**Total added cost**: $0

**ROI of performance**:
- Amazon: 100ms faster = 1% revenue increase
- Google: 500ms slower = 20% traffic drop
- Walmart: 1s faster = 2% conversion increase

**Fast sites make more money.**

---

## Summary

**Performance targets**:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- Performance score > 90

**Key strategies**:
1. Optimize images (Next.js Image, WebP, priority)
2. Minimize JavaScript (code splitting, tree shaking)
3. Use appropriate rendering (Static > SSR > CSR)
4. Cache aggressively
5. Prevent layout shift (set dimensions, loading states)

**Enforcement**:
- Lighthouse CI fails builds if performance < 90
- Monitor real users with Better Stack
- Monthly PageSpeed Insights checks

**Cost**: $0 (all free tools)

**See Also**:
- `docs/03-architecture/caching-strategy.md` - Caching for performance
- `docs/03-architecture/database-optimization.md` - Fast queries
- `docs/06-operations/monitoring.md` - Performance monitoring
- `docs/04-frontend/ui-standards.md` - Responsive design for mobile

---

## Related Documentation

**Architecture Topics**:
- [Caching Strategy](./caching-strategy.md) - Multi-tenant caching patterns
- [Database Optimization](./database-optimization.md) - Query optimization, indexing
- [Load Balancing](./load-balancing.md) - Distributing traffic
- [Microservices](./microservices.md) - Service architecture patterns
- [Performance](./performance.md) - Performance optimization strategies

**SaaS Architecture**:
- [SaaS Architecture](../09-saas-specific/saas-architecture.md) - Multi-tenancy patterns
- [Analytics](../08-analytics/analytics.md) - Tracking and metrics

**Practical Resources**:
- [Database Migration Template](../templates/database-migration-template.sql) - Multi-tenant schema

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

