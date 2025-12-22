# Caching Strategy

## Overview

Caching dramatically improves application performance and reduces database load by storing frequently accessed data in fast memory. This document defines caching standards using **Redis** as our primary caching layer.

**Recommended Tools**:
- **Upstash Redis** - Serverless Redis with pay-per-request pricing (~$10-30/month)
- **Railway Redis** - Managed Redis add-on for Railway users (~$5-20/month)

---

## Why Cache?

**Performance Benefits**:
- Reduce database queries by 70-90%
- API response time: 500ms → 50ms (10x faster)
- Handle 10x more traffic with same infrastructure

**Cost Benefits**:
- Reduce database load and costs
- Serve more users without scaling database
- Lower compute costs (less CPU for repeated queries)

**User Experience**:
- Instant page loads
- Real-time data updates
- Better mobile experience

---

## Redis Options

### Option A: Upstash Redis (Recommended for Serverless)

**Use when**: Deploying to Vercel, Cloudflare Workers, or serverless environments

**Pricing**:
- Free tier: 10K commands/day
- Pay-as-you-go: $0.2 per 100K requests + $0.25/GB storage
- Fixed plans: $10/month (250MB) to $280/month (500GB)

**Pros**:
- Serverless (auto-scales)
- REST API (works in edge functions)
- Global replication
- Pay only for what you use
- No infrastructure management

**Setup**:
1. Sign up at https://upstash.com/
2. Create Redis database
3. Get REST URL and token
4. Install SDK

```bash
npm install @upstash/redis
```

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Option B: Railway Redis (Recommended for Railway Users)

**Use when**: Deploying to Railway

**Pricing**: Usage-based, typically $5-20/month for small-medium apps

**Pros**:
- Integrated with Railway
- One-click setup
- Predictable pricing
- Standard Redis (TCP)

**Setup**:
1. In Railway dashboard, click "New" → "Database" → "Add Redis"
2. Railway provides `REDIS_URL` environment variable
3. Install client

```bash
npm install ioredis
```

```typescript
// lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!);
```

---

## Caching Patterns

### 1. Cache-Aside (Lazy Loading)

**Pattern**: Check cache first, fetch from DB if miss, then cache result

**Use for**: Read-heavy data that doesn't change often (user profiles, settings, product catalogs)

```typescript
async function getUser(userId: string): Promise<User> {
  // 1. Check cache
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss - fetch from database
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  // 3. Store in cache (TTL: 1 hour)
  await redis.set(`user:${userId}`, JSON.stringify(user), {
    ex: 3600, // expires in 1 hour
  });

  return user;
}
```

**TTL Guidelines**:
- User profiles: 1 hour (`ex: 3600`)
- Product catalog: 5 minutes (`ex: 300`)
- Static content: 24 hours (`ex: 86400`)
- Session data: Match session timeout

### 2. Write-Through Cache

**Pattern**: Write to cache and database simultaneously

**Use for**: Data that must always be in cache (session data, user preferences)

```typescript
async function updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
  // 1. Update database
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // 2. Update cache
  await redis.set(`user:${userId}`, JSON.stringify(user), { ex: 3600 });

  return user;
}
```

### 3. Read-Through Cache

**Pattern**: Cache handles DB fetch automatically

**Use for**: Simplifying cache logic (with ORM integration)

```typescript
// Prisma middleware for automatic caching
prisma.$use(async (params, next) => {
  // Only cache findUnique queries
  if (params.action === 'findUnique' && params.model === 'User') {
    const cacheKey = `user:${params.args.where.id}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from DB
    const result = await next(params);

    // Cache result
    if (result) {
      await redis.set(cacheKey, JSON.stringify(result), { ex: 3600 });
    }

    return result;
  }

  return next(params);
});
```

### 4. Cache Invalidation

**Pattern**: Remove or update cache when data changes

**Strategies**:

**A) Time-based (TTL)**: Cache expires after time
```typescript
await redis.set('key', 'value', { ex: 300 }); // 5 minutes
```

**B) Event-based**: Invalidate on update
```typescript
async function deleteUser(userId: string) {
  // 1. Delete from database
  await prisma.user.delete({ where: { id: userId } });

  // 2. Invalidate cache
  await redis.del(`user:${userId}`);
}
```

**C) Pattern-based**: Invalidate multiple keys
```typescript
// Invalidate all keys matching pattern
async function invalidateUserData(userId: string) {
  const keys = await redis.keys(`user:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

---

## Common Use Cases

### 1. API Response Caching

Cache expensive API responses:

```typescript
// Next.js API route with caching
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cacheKey = `api:${url.pathname}:${url.searchParams.toString()}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return Response.json(JSON.parse(cached), {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  // Fetch data
  const data = await fetchExpensiveData();

  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(data), { ex: 300 });

  return Response.json(data, {
    headers: { 'X-Cache': 'MISS' },
  });
}
```

### 2. Database Query Caching

Cache database queries:

```typescript
async function getTopProducts(limit: number = 10): Promise<Product[]> {
  const cacheKey = `products:top:${limit}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const products = await prisma.product.findMany({
    take: limit,
    orderBy: { sales: 'desc' },
  });

  await redis.set(cacheKey, JSON.stringify(products), { ex: 300 }); // 5 min

  return products;
}
```

### 3. Session Storage

Store user sessions:

```typescript
// Create session
async function createSession(userId: string, sessionData: any): Promise<string> {
  const sessionId = generateId();
  const key = `session:${sessionId}`;

  await redis.set(key, JSON.stringify({ userId, ...sessionData }), {
    ex: 86400, // 24 hours
  });

  return sessionId;
}

// Get session
async function getSession(sessionId: string): Promise<Session | null> {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

// Extend session
async function touchSession(sessionId: string) {
  await redis.expire(`session:${sessionId}`, 86400); // Reset to 24 hours
}

// Delete session (logout)
async function destroySession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}
```

### 4. Rate Limiting

Implement rate limiting:

```typescript
async function checkRateLimit(
  userId: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${userId}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;

  const current = await redis.incr(key);

  if (current === 1) {
    // First request in this window, set expiry
    await redis.expire(key, windowSeconds);
  }

  return {
    allowed: current <= maxRequests,
    remaining: Math.max(0, maxRequests - current),
  };
}

// Usage in API route
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')!;

  const { allowed, remaining } = await checkRateLimit(userId);

  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() },
      }
    );
  }

  // Process request...
}
```

### 5. Leaderboards / Rankings

Use Redis sorted sets:

```typescript
// Add score
async function updateUserScore(userId: string, score: number) {
  await redis.zadd('leaderboard', { score, member: userId });
}

// Get top 10
async function getTopUsers(limit: number = 10): Promise<Array<{ userId: string; score: number }>> {
  const results = await redis.zrange('leaderboard', 0, limit - 1, {
    rev: true, // highest scores first
    withScores: true,
  });

  return results.map((r, i) => ({
    userId: i % 2 === 0 ? r : results[i - 1],
    score: i % 2 === 1 ? Number(r) : Number(results[i + 1]),
  }));
}

// Get user rank
async function getUserRank(userId: string): Promise<number | null> {
  const rank = await redis.zrevrank('leaderboard', userId);
  return rank !== null ? rank + 1 : null; // 1-indexed
}
```

### 6. Pub/Sub for Real-Time Updates

Use Redis pub/sub for real-time features:

```typescript
// Publisher (API server)
async function broadcastUpdate(channel: string, message: any) {
  await redis.publish(channel, JSON.stringify(message));
}

// Subscriber (WebSocket server)
async function subscribeToUpdates(channel: string, callback: (message: any) => void) {
  const subscriber = redis.duplicate();

  await subscriber.subscribe(channel, (message) => {
    callback(JSON.parse(message));
  });

  return () => subscriber.unsubscribe(channel);
}

// Example: Notify users when data changes
await broadcastUpdate('user-updates', {
  userId: '123',
  action: 'profile-updated',
});
```

---

## Cache Key Naming Conventions

Use consistent, hierarchical key names:

```typescript
// Pattern: {entity}:{id}:{attribute}
'user:123'                  // User object
'user:123:profile'          // User profile
'user:123:settings'         // User settings
'user:123:sessions'         // User sessions

// Pattern: {namespace}:{filter}:{value}
'products:category:electronics'  // Products in category
'posts:author:123'               // Posts by author
'api:endpoint:/users'            // API response

// Pattern: {type}:{id}:{timestamp}
'ratelimit:user123:1640000000'  // Rate limit bucket
'session:abc123'                 // Session data
```

**Best practices**:
- Use colons `:` as separators
- Start with entity type
- Include ID or filter
- Keep keys short but descriptive
- Avoid special characters

---

## Monitoring Cache Performance

### Key Metrics

Track these metrics in Better Stack:

```typescript
// Cache hit rate
const cacheHits = await redis.get('metrics:cache:hits') || 0;
const cacheMisses = await redis.get('metrics:cache:misses') || 0;
const hitRate = cacheHits / (cacheHits + cacheMisses);

// Log to Better Stack
logger.info('Cache performance', {
  hits: cacheHits,
  misses: cacheMisses,
  hitRate: hitRate.toFixed(2),
});
```

**Target metrics**:
- **Hit rate**: > 80% (good caching)
- **Miss rate**: < 20%
- **Latency**: < 10ms for cache hits

### Redis Performance Monitoring

Monitor Redis health:

```typescript
// Get Redis info
const info = await redis.info();
const memory = await redis.info('memory');
const stats = await redis.info('stats');

logger.info('Redis health', {
  usedMemory: parseMemory(memory),
  connectedClients: parseClients(stats),
  opsPerSecond: parseOps(stats),
});
```

**Alert on**:
- Memory usage > 80%
- Connection errors
- Slow commands (> 100ms)

---

## Cache Warming

Pre-populate cache with frequently accessed data:

```typescript
// Warm cache on application startup
async function warmCache() {
  logger.info('Warming cache...');

  // Cache top products
  const topProducts = await prisma.product.findMany({
    take: 100,
    orderBy: { sales: 'desc' },
  });

  for (const product of topProducts) {
    await redis.set(`product:${product.id}`, JSON.stringify(product), { ex: 3600 });
  }

  // Cache popular categories
  const categories = await prisma.category.findMany();
  await redis.set('categories:all', JSON.stringify(categories), { ex: 3600 });

  logger.info('Cache warmed', { products: topProducts.length, categories: categories.length });
}

// Call on server startup
await warmCache();
```

---

## Security Considerations

### 1. Don't Cache Sensitive Data

**Never cache**:
- Passwords or password hashes
- Credit card numbers
- API keys or tokens
- Personal health information (PHI)

**Safe to cache** (with short TTL):
- User profile (non-sensitive fields)
- Product catalog
- Public content
- Session IDs (not session content with sensitive data)

### 2. Encrypt Sensitive Cache Data

If you must cache sensitive data:

```typescript
import { encrypt, decrypt } from './crypto';

async function cacheSecure(key: string, data: any, ttl: number) {
  const encrypted = encrypt(JSON.stringify(data));
  await redis.set(key, encrypted, { ex: ttl });
}

async function getCacheSecure(key: string): Promise<any | null> {
  const encrypted = await redis.get(key);
  if (!encrypted) return null;

  const decrypted = decrypt(encrypted);
  return JSON.parse(decrypted);
}
```

### 3. Prevent Cache Poisoning

Validate data before caching:

```typescript
async function cacheUserSafely(userId: string, user: User) {
  // Validate user object
  if (!user.id || !user.email) {
    throw new Error('Invalid user data');
  }

  // Sanitize before caching
  const safe = {
    id: user.id,
    email: user.email,
    name: user.name,
    // Exclude sensitive fields
  };

  await redis.set(`user:${userId}`, JSON.stringify(safe), { ex: 3600 });
}
```

---

## Cost Optimization

### Reduce Redis Costs

1. **Set appropriate TTLs**:
   - Don't cache forever (wastes memory)
   - Balance freshness vs hit rate

2. **Use compression for large values**:
```typescript
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

async function cacheCompressed(key: string, data: any, ttl: number) {
  const json = JSON.stringify(data);
  const compressed = await gzipAsync(json);
  await redis.set(key, compressed.toString('base64'), { ex: ttl });
}
```

3. **Monitor memory usage**:
   - Evict old keys (LRU policy)
   - Set `maxmemory-policy` to `allkeys-lru`

4. **Cache only what's needed**:
   - Don't cache rarely accessed data
   - Monitor cache hit rates
   - Remove unused cache keys

---

## Testing Caches

### Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { redis } from './redis';

describe('User Cache', () => {
  beforeEach(async () => {
    // Clear test cache before each test
    await redis.flushdb();
  });

  it('should cache user on first fetch', async () => {
    const user = await getUser('123');

    const cached = await redis.get('user:123');
    expect(cached).toBeTruthy();
    expect(JSON.parse(cached!)).toEqual(user);
  });

  it('should return cached user on second fetch', async () => {
    await getUser('123'); // First fetch (cache miss)

    const start = Date.now();
    await getUser('123'); // Second fetch (cache hit)
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50); // Should be much faster
  });

  it('should invalidate cache on update', async () => {
    await getUser('123');
    await updateUser('123', { name: 'New Name' });

    const cached = await redis.get('user:123');
    const user = JSON.parse(cached!);

    expect(user.name).toBe('New Name');
  });
});
```

---

## Cache Strategy Summary

| Data Type | Pattern | TTL | Invalidation |
|-----------|---------|-----|--------------|
| User profiles | Cache-aside | 1 hour | On update |
| Product catalog | Cache-aside | 5 minutes | Time-based |
| Session data | Write-through | 24 hours | On logout |
| API responses | Cache-aside | 5-15 min | Time-based |
| Leaderboards | Direct Redis | Real-time | On score update |
| Rate limits | Direct Redis | 1-60 min | Time-based |

---

## Checklist

Before production:

- [ ] Redis instance configured (Upstash or Railway)
- [ ] Redis client installed and configured
- [ ] Cache keys follow naming convention
- [ ] TTLs set appropriately for each data type
- [ ] Cache invalidation implemented for mutable data
- [ ] Sensitive data excluded from cache or encrypted
- [ ] Cache hit rate monitoring implemented
- [ ] Error handling for cache failures (fallback to DB)
- [ ] Tests written for cache logic

---

## Summary

**Recommended setup**:
- **Tool**: Upstash (serverless) or Railway Redis (Railway users)
- **Cost**: $10-30/month
- **Primary pattern**: Cache-aside (lazy loading)
- **Key metrics**: Hit rate > 80%, latency < 10ms

**See Also**:
- `docs/03-architecture/database-optimization.md` - Database performance
- `docs/03-architecture/performance.md` - Overall performance strategy
- `docs/06-operations/monitoring.md` - Monitoring cache metrics

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

