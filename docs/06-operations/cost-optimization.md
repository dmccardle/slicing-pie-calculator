# Cost Optimization and Monitoring

## Overview

This document defines cost optimization strategies to keep infrastructure costs low while maintaining performance and reliability. For startups, every dollar matters.

**Tools**:
- **Railway Dashboard** - Built-in cost monitoring (free)
- **Better Stack** - Infrastructure monitoring (helps identify waste)
- **Cost optimization best practices** - No tool needed

**Cost**: $0 (monitoring is free)

---

## Cost Optimization Philosophy

**Rule 1**: **Ship first, optimize later**
- Don't over-optimize before you have users
- Focus on revenue generation, not cost reduction
- $100/month infrastructure cost is fine if you're making $10K/month

**Rule 2**: **Monitor costs weekly**
- Check Railway dashboard every Monday
- Set up budget alerts
- Track cost trends

**Rule 3**: **Optimize when costs hurt**
- < $50/month: Don't worry about it
- $50-200/month: Review and optimize obvious waste
- > $200/month: Dedicated cost optimization sprint

---

## Railway Cost Monitoring

### 1. Railway Dashboard (Built-in)

**Access**:
1. Go to Railway Dashboard
2. Click "Usage" tab
3. See current month costs

**What it shows**:
- Current month spend (updates hourly)
- Breakdown by service (database, API, workers)
- Resource usage (CPU, memory, network)
- Projected end-of-month cost

**Example**:
```
Current Month: $42.50 (as of Jan 15)
Projected: $85 (end of month)

Breakdown:
- PostgreSQL Database: $25
- API Service: $15
- Redis Cache: $2.50
- Network/Egress: $0
```

### 2. Set Budget Alerts

**In Railway Dashboard**:
1. Go to Settings → Billing
2. Set budget limit (e.g., $100/month)
3. Add email for alerts
4. Get notified at 50%, 75%, 90%, 100% of budget

**Example alert**:
```
Railway Budget Alert
Your project has reached 75% of your $100 monthly budget.
Current spend: $75
Projected: $120
```

### 3. Enable Cost Anomaly Detection

**In Better Stack** (if using):

```typescript
// Log daily costs
import { logger } from './logger';

async function logDailyCosts() {
  const costs = await fetchRailwayCosts();  // Custom function

  logger.info('Daily infrastructure costs', {
    total: costs.total,
    database: costs.database,
    api: costs.api,
    cache: costs.cache,
  });

  // Alert if cost spike
  if (costs.total > costs.averageLast7Days * 1.5) {
    logger.warn('Cost spike detected', {
      today: costs.total,
      average: costs.averageLast7Days,
      increase: ((costs.total / costs.averageLast7Days - 1) * 100).toFixed(1) + '%',
    });
  }
}

// Run daily
setInterval(logDailyCosts, 24 * 60 * 60 * 1000);
```

---

## Cost Optimization Strategies

### 1. Database Optimization (Biggest Cost Driver)

**PostgreSQL costs based on**:
- Storage (GB)
- Compute (memory)
- I/O operations

**Optimize**:

**A) Reduce storage**:
```sql
-- Find largest tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Delete old data (if safe)
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum to reclaim space
VACUUM FULL logs;
```

**B) Archive old data**:
```typescript
// Move old data to cheaper storage (S3)
async function archiveOldOrders() {
  const oldOrders = await prisma.order.findMany({
    where: {
      createdAt: { lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },  // > 1 year old
    },
  });

  // Upload to S3
  await uploadToS3('orders-archive.json', JSON.stringify(oldOrders));

  // Delete from database
  await prisma.order.deleteMany({
    where: {
      createdAt: { lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    },
  });

  logger.info('Archived old orders', {
    count: oldOrders.length,
    savedStorageGB: (oldOrders.length * 1024) / (1024 * 1024 * 1024),  // Rough estimate
  });
}

// Run monthly
```

**C) Use appropriate database size**:
- Start small (Railway smallest instance: ~$10/month)
- Scale up only when needed
- Monitor database CPU/memory usage
- If CPU < 50% and memory < 60%, you're over-provisioned

**See `docs/03-architecture/database-optimization.md` for full guide**

### 2. Caching (Reduce Database Queries)

**Problem**: Database queries cost money (I/O operations)

**Solution**: Cache frequently accessed data

```typescript
// Before (expensive - 1000 DB queries/min):
export async function GET(request: Request) {
  const products = await prisma.product.findMany();  // Runs every request
  return Response.json(products);
}

// After (cheap - 1 DB query/5min):
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
  const cached = await redis.get('products:all');
  if (cached) {
    return Response.json(JSON.parse(cached));  // From cache (fast, cheap)
  }

  const products = await prisma.product.findMany();  // DB query (slow, expensive)
  await redis.set('products:all', JSON.stringify(products), { ex: 300 });  // Cache 5 min

  return Response.json(products);
}
```

**Impact**:
- 1000 req/min without cache = 1000 DB queries/min
- 1000 req/min with cache (5 min TTL) = 0.2 DB queries/min
- **Cost reduction: 99.98%** for this endpoint

**See `docs/03-architecture/caching-strategy.md` for full guide**

### 3. CDN for Static Assets

**Problem**: Serving images/assets from your server costs bandwidth

**Solution**: Use a CDN (Railway has built-in CDN)

**Next.js** (automatic):
```tsx
// Next.js automatically optimizes and caches images
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
/>
// Served from Railway CDN after first request (cached, cheap)
```

**Cloudflare CDN** (free tier):
1. Point DNS to Cloudflare
2. Enable "Cache Everything" page rule
3. Set cache TTL (e.g., 1 hour for static pages, 1 week for images)

**Impact**:
- Without CDN: Every image request hits your server (bandwidth cost)
- With CDN: Images cached at edge (99% of requests free)

### 4. Optimize Images

**Problem**: Large images cost storage and bandwidth

**Solution**: Compress and convert to modern formats

```bash
# Install sharp (image optimizer)
npm install sharp
```

```typescript
// Build-time image optimization
import sharp from 'sharp';

async function optimizeImages() {
  const images = await glob('public/images/*.{jpg,png}');

  for (const image of images) {
    await sharp(image)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })  // Convert to WebP (smaller)
      .toFile(image.replace(/\.(jpg|png)$/, '.webp'));
  }
}
```

**Impact**:
- JPEG 2MB → WebP 200KB (10x reduction)
- 10,000 page views/month: 20GB → 2GB bandwidth saved
- Bandwidth cost: ~$0.10/GB = $1.80/month saved per image

### 5. Right-Size Your Services

**Check resource usage in Railway**:
1. Dashboard → Service → Metrics
2. Look at CPU and Memory usage

**If CPU < 30% and Memory < 50%**: You're over-provisioned
**If CPU > 80% or Memory > 85%**: You need more resources

**Example**:
```
Current: 2GB RAM, 2 vCPU ($50/month)
Actual usage: 40% CPU, 50% RAM (1GB)
Downgrade to: 1GB RAM, 1 vCPU ($25/month)
Savings: $25/month (50%)
```

**When to scale down**:
- After initial launch (traffic usually lower than expected)
- During low seasons (scale up before peak)
- When optimizations reduce resource needs

### 6. Use Serverless for Sporadic Workloads

**Problem**: Background workers running 24/7 cost money even if idle

**Solution**: Use serverless functions for sporadic tasks

**Example - Email sender**:

**Before** (expensive):
```typescript
// Dedicated worker running 24/7
// Cost: $20/month even if only processing 100 emails/day
while (true) {
  const job = await queue.pop();
  if (job) await sendEmail(job);
  await sleep(1000);
}
```

**After** (cheap):
```typescript
// Serverless function (Railway Cron or Vercel Functions)
// Cost: $0-2/month for 100 emails/day

// Trigger via API
export async function POST(request: Request) {
  const { email, subject, body } = await request.json();
  await sendEmail(email, subject, body);
  return Response.json({ success: true });
}

// Or use Railway Cron
// Runs every hour, only pays for execution time
```

**Savings**: $20/month → $2/month (90% reduction)

### 7. Clean Up Unused Services

**Review Railway services monthly**:
```
Services:
api-prod (active)
database-prod (active)
api-staging (last deploy: 3 months ago) - DELETE
test-redis (created for testing) - DELETE
old-worker (replaced by new-worker) - DELETE
```

**Unused services cost money** - delete them.

### 8. Optimize Log Storage

**Problem**: Logs cost money to store

**Solution**: Set appropriate retention

**Better Stack**:
- Production logs: 30 days
- Staging logs: 7 days
- Error logs: 90 days
- Debug logs: Disable in production

```typescript
// Only log important events in production
const logger = new Logtail(process.env.BETTER_STACK_TOKEN, {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

// Don't log every successful request in production
if (statusCode === 200 && process.env.NODE_ENV === 'production') {
  return;  // Skip logging
}

logger.info('Request completed', { statusCode, duration });
```

**Savings**: Reduce log volume by 80-90% without losing important data

### 9. Monitor Third-Party API Costs

**Problem**: External API calls cost money (Stripe, Twilio, SendGrid)

**Solution**: Cache, batch, and optimize API calls

**Example - Stripe API**:
```typescript
// BAD: Fetch customer on every request
export async function GET(request: Request) {
  const customer = await stripe.customers.retrieve(customerId);  // Stripe API call
  return Response.json(customer);
}

// GOOD: Cache customer data
export async function GET(request: Request) {
  const cached = await redis.get(`customer:${customerId}`);
  if (cached) return Response.json(JSON.parse(cached));

  const customer = await stripe.customers.retrieve(customerId);
  await redis.set(`customer:${customerId}`, JSON.stringify(customer), { ex: 3600 });

  return Response.json(customer);
}
```

**Savings**: 1000 Stripe API calls/day → 24 calls/day (cache 1 hour)

### 10. Use Free Tiers

**Maximize free tiers** before paying:

| Service | Free Tier | When to Upgrade |
|---------|-----------|-----------------|
| **Railway** | $5 credit/month | When you exceed $5 |
| **Vercel** | 100GB bandwidth, Unlimited builds | When you exceed limits |
| **Better Stack** | 10GB logs/month | When you exceed 10GB |
| **PostHog** | 1M events/month | When you exceed 1M |
| **Plausible** | None (paid only) | From day 1 ($9/mo) |
| **Upstash Redis** | 10K commands/day | When you exceed 10K |

**Typical startup stack on free tiers**:
- Railway: $0-10/month (database + API)
- PostHog: $0/month (< 1M events)
- Better Stack: $0/month (< 10GB logs)
- Upstash: $0/month (< 10K commands/day)
- **Total**: $0-10/month for first few months

---

## Cost Monitoring Checklist

### Weekly Review (5 minutes)
- [ ] Check Railway dashboard (current month spend)
- [ ] Review cost breakdown (database, API, cache)
- [ ] Check for cost spikes (>20% increase from last week)
- [ ] Verify services are being used (delete unused)

### Monthly Review (30 minutes)
- [ ] Analyze cost trends (month-over-month)
- [ ] Review database size (delete old data if needed)
- [ ] Check third-party API costs (Stripe, Twilio, etc.)
- [ ] Optimize cache hit rates (aim for >80%)
- [ ] Review service sizes (right-sized or over-provisioned?)
- [ ] Clean up unused services/resources

### Quarterly Review (2 hours)
- [ ] Full cost audit (all services)
- [ ] Benchmark against competitors (am I overpaying?)
- [ ] Negotiate better rates (if applicable)
- [ ] Re-architect expensive components
- [ ] Update cost forecasts

---

## Cost Optimization Wins

### Real Examples

**Startup A** (SaaS with 1K users):
- **Before**: $450/month (database 70%, API 20%, logs 10%)
- **Optimizations**:
  1. Implemented caching (Redis): -40% database queries
  2. Archived old data (>1 year): -30% database storage
  3. Reduced log retention (90d → 30d): -60% log costs
  4. Optimized images (JPEG → WebP): -50% bandwidth
- **After**: $180/month
- **Savings**: $270/month (60% reduction)

**Startup B** (Early stage, < 100 users):
- **Before**: $120/month (over-provisioned)
- **Optimizations**:
  1. Downgraded database (2GB → 1GB): -$25/month
  2. Used free tier services: -$30/month
  3. Deleted staging environment (use PR previews): -$40/month
- **After**: $25/month
- **Savings**: $95/month (79% reduction)

---

## When NOT to Optimize Costs

**Don't optimize when**:
1. **You don't have users yet** - Focus on building product
2. **Costs are < $50/month** - Your time is more valuable
3. **Optimization hurts performance** - Speed > cost savings
4. **You're growing fast** - Optimize for growth, not cost

**Example**:
- $50/month infrastructure cost
- 10 hours to optimize and save $20/month
- Savings: $240/year
- Your time: 10 hours * $50/hour = $500
- **Not worth it** - focus on revenue generation instead

---

## Cost Forecasting

### Predict Future Costs

**Formula**:
```
Monthly Cost = (Users * Cost Per User) + Fixed Costs

Cost Per User = Database Storage + API Requests + Bandwidth
Fixed Costs = Base infrastructure (database, cache, monitoring)
```

**Example**:
```
Current:
- Users: 100
- Database: 1GB ($10/month)
- API: $15/month
- Total: $25/month
- Cost per user: $0.15/month

At 1,000 users:
- Database: ~5GB ($35/month) - scales with data
- API: ~$80/month - scales with requests
- Total: ~$115/month
- Cost per user: $0.115/month (cheaper with scale!)

At 10,000 users:
- Database: ~30GB ($150/month)
- API: ~$600/month
- Total: ~$750/month
- Cost per user: $0.075/month (even cheaper!)
```

**Use forecasts to**:
- Plan budgets
- Set pricing (must be > cost per user)
- Know when to optimize

---

## Summary

**Key strategies**:
1. **Monitor weekly** - Railway Dashboard + budget alerts
2. **Optimize database** - Cache, archive, right-size
3. **Use caching** - 99% cost reduction for repeated queries
4. **Optimize images** - WebP, compression, CDN
5. **Right-size services** - Don't over-provision
6. **Clean up waste** - Delete unused services
7. **Use free tiers** - Maximize before paying

**When to optimize**:
- Costs > $50/month and hurting budget
- Obvious waste (unused services)
- Easy wins (caching, image optimization)
- Costs < $50/month (focus on revenue)
- No users yet (premature optimization)

**Cost targets**:
- **Pre-revenue**: $0-50/month
- **Early traction** (< 1K users): $50-200/month
- **Growing** (1K-10K users): $200-1000/month
- **Scale** (10K+ users): $1000+/month

**Rule of thumb**: Infrastructure should be < 20% of revenue

**See Also**:
- `docs/03-architecture/database-optimization.md` - Optimize database costs
- `docs/03-architecture/caching-strategy.md` - Reduce database queries with caching
- `docs/03-architecture/performance.md` - Optimize bandwidth with performance
- `docs/06-operations/monitoring.md` - Monitor costs with Better Stack

---

## Related Documentation

**Operations Topics**:
- [Monitoring](./monitoring.md) - Application and infrastructure monitoring
- [Backups](./backups.md) - Backup and recovery strategies
- [Security Testing](./security-testing.md) - Automated security scans
- [Penetration Testing](./penetration-testing.md) - Manual security audits
- [Incident Response](./incident-response.md) - Handling security incidents
- [Incident Management](./incident-management.md) - General incident handling
- [Compliance](./compliance.md) - GDPR, SOC 2, ISO 27001
- [Disaster Recovery](./disaster-recovery.md) - Business continuity planning
- [Cost Optimization](./cost-optimization.md) - Reducing infrastructure costs

**Core Rules**:
- [Security & Privacy](../rules/security-privacy.md) - Security requirements
- [Testing](../rules/testing.md) - Testing strategies

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

