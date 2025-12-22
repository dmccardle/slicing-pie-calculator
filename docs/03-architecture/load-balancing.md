# Load Balancing

## Overview

Load balancing distributes traffic across multiple servers to handle more users and prevent downtime. This document defines when to use load balancing and how to implement it.

**Rule**: You don't need load balancing until you need it. Start simple.

---

## When You DON'T Need Load Balancing

**If you're a startup with < 10,000 users, you probably don't need load balancing.**

**One server can handle**:
- 1,000-10,000 concurrent users (typical SaaS)
- 100-500 requests/second (most web apps)
- Millions of page views per month

**Railway (our deployment platform) already provides**:
- Auto-scaling (adds replicas under load)
- Health checks (restarts crashed servers)
- Zero-downtime deploys
- Built-in load balancing (when you have > 1 replica)

**Don't over-engineer early. Ship first, scale later.**

---

## When You DO Need Load Balancing

### Add load balancing when:

1. **One server can't handle traffic**
   - CPU usage > 80% consistently
   - Response times > 1 second
   - Server crashes under peak load

2. **You need zero-downtime deploys**
   - Can't afford 30 seconds of downtime
   - Need rolling deploys (update servers one by one)

3. **You need high availability**
   - Can't afford single point of failure
   - Need 99.9%+ uptime SLA

4. **You have regional users**
   - Users in EU + US + Asia
   - Need servers closer to users (reduce latency)

**Typical thresholds**:
- 10,000+ concurrent users
- 500+ requests/second
- $10K+ MRR (can afford infrastructure costs)

---

## Load Balancing on Railway (Built-In)

**Railway automatically load balances when you scale horizontally.**

### Step 1: Enable Auto-Scaling

```bash
# Railway dashboard → Service → Settings → Scaling

Min replicas: 1
Max replicas: 5
Target CPU: 70%
Target Memory: 80%
```

**How it works**:
- Traffic spike → CPU > 70% → Railway adds replica
- Load decreases → CPU < 70% → Railway removes replica
- Railway load balancer distributes traffic across all replicas

### Step 2: Verify Load Balancing

```typescript
// Add this endpoint to see which server handled request
// app/api/v1/health/route.ts

export async function GET() {
  return Response.json({
    status: 'ok',
    server: process.env.RAILWAY_REPLICA_ID || 'local',
    timestamp: new Date().toISOString(),
  });
}
```

**Test**:
```bash
# Make 10 requests
for i in {1..10}; do
  curl https://api.yourapp.com/api/v1/health
done

# You should see different server IDs if load balanced
{"server":"replica-1",...}
{"server":"replica-2",...}
{"server":"replica-1",...}
```

---

## Load Balancing Strategies

### 1. Round Robin (Default)

**How it works**: Send requests in rotation
- Request 1 → Server A
- Request 2 → Server B
- Request 3 → Server C
- Request 4 → Server A (repeat)

**Pros**: Simple, evenly distributes load
**Cons**: Doesn't account for server capacity

**Use when**: All servers are identical

### 2. Least Connections

**How it works**: Send request to server with fewest active connections

**Pros**: Better for long-lived connections (WebSockets)
**Cons**: More complex

**Use when**: Handling real-time features (chat, live updates)

### 3. Weighted Round Robin

**How it works**: Send more traffic to powerful servers
- Server A (8GB RAM): 60% of traffic
- Server B (4GB RAM): 30% of traffic
- Server C (2GB RAM): 10% of traffic

**Use when**: Servers have different specs

### 4. Geographic (Geo-Based)

**How it works**: Route users to nearest server
- EU users → EU server
- US users → US server
- Asia users → Asia server

**Pros**: Lower latency (faster response times)
**Cons**: More expensive (need servers in multiple regions)

**Use when**: Global user base, need < 100ms latency

---

## Implementing Geo-Based Load Balancing

**Railway doesn't support multi-region deployments (yet).**

**Options**:

### Option A: Cloudflare (Recommended)

**Cost**: $0-20/month

**How it works**:
1. Deploy Railway apps in multiple regions (US, EU, Asia)
2. Use Cloudflare Load Balancer to route by location
3. Cloudflare CDN caches static assets globally

**Setup**:

```bash
# 1. Deploy to multiple regions (Railway doesn't support this yet)
# Workaround: Use multiple Railway projects
# - Project 1: US East (primary)
# - Project 2: EU West (secondary, if needed)

# 2. Add custom domains
# Railway dashboard → Service → Domains
# us.api.yourapp.com → US Railway project
# eu.api.yourapp.com → EU Railway project

# 3. Set up Cloudflare Load Balancer
# Cloudflare dashboard → Traffic → Load Balancing

Pool 1: US Servers
  - us.api.yourapp.com (weight: 100)

Pool 2: EU Servers
  - eu.api.yourapp.com (weight: 100)

Geo Steering:
  - North America → Pool 1 (US)
  - Europe → Pool 2 (EU)
  - Rest of world → Pool 1 (US, default)
```

**Cost**:
- Cloudflare Load Balancer: $5/month (first 2 origins)
- Railway (2 projects): $10-40/month (depending on usage)

### Option B: Vercel (Automatic, Expensive)

**Cost**: $20-200/month

Vercel automatically deploys to 20+ regions worldwide and routes users to nearest server.

**Pros**: Zero config, global CDN
**Cons**: Expensive, vendor lock-in

**Use when**: You have budget and want zero ops

---

## Session Persistence (Sticky Sessions)

**Problem**: User logs in → Session stored on Server A → Next request goes to Server B → User appears logged out

**Solution**: Ensure user's requests always go to same server

### Option 1: Sticky Sessions (Not Recommended)

**How it works**: Load balancer sends user to same server based on cookie

**Pros**: Simple
**Cons**:
- Breaks horizontal scaling
- If server crashes, user loses session
- Uneven load distribution

### Option 2: Shared Session Store (Recommended)

**How it works**: Store sessions in Redis (all servers share)

**Implementation**:

```typescript
// lib/session.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function saveSession(userId: string, sessionData: any) {
  await redis.set(
    `session:${userId}`,
    JSON.stringify(sessionData),
    { ex: 86400 } // 24 hour expiry
  );
}

export async function getSession(userId: string) {
  const data = await redis.get(`session:${userId}`);
  return data ? JSON.parse(data as string) : null;
}
```

**Now any server can access any user's session.**

**See `docs/03-architecture/caching-strategy.md` for Redis setup**

---

## Health Checks

**Load balancers need to know if servers are healthy.**

### Implement Health Check Endpoint

```typescript
// app/api/v1/health/route.ts

import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    database: false,
    cache: false,
    server: true,
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // Check Redis connection
  try {
    await redis.ping();
    checks.cache = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  // If any critical service is down, return 503
  const isHealthy = checks.database && checks.cache;

  return Response.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.RAILWAY_DEPLOYMENT_ID || 'local',
    },
    { status: isHealthy ? 200 : 503 }
  );
}
```

### Configure Railway Health Checks

```bash
# Railway dashboard → Service → Settings → Health Checks

Health Check Path: /api/v1/health
Health Check Interval: 30s
Health Check Timeout: 10s
Unhealthy Threshold: 3 (fails 3 times → restart)
```

**How it works**:
- Railway pings `/api/v1/health` every 30 seconds
- If 3 consecutive failures → Railway restarts server
- Load balancer stops sending traffic to unhealthy servers

---

## Zero-Downtime Deploys

**Problem**: Deploying new code restarts servers → downtime

**Solution**: Rolling deploys (update servers one by one)

### Railway Automatic Rolling Deploys

**Railway does this automatically when you have > 1 replica:**

1. Deploy new code
2. Railway starts new replica with new code
3. Health check passes on new replica
4. Railway sends traffic to new replica
5. Old replica finishes existing requests (grace period: 30s)
6. Old replica shuts down
7. Repeat for all replicas

**Result**: Zero downtime

### Graceful Shutdown

**Ensure server finishes requests before shutting down:**

```typescript
// server.ts (if using custom Node.js server)

const server = app.listen(PORT);

// Handle shutdown signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');

  server.close(() => {
    console.log('HTTP server closed');

    // Close database connections
    prisma.$disconnect();

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});
```

**Railway waits 30 seconds for graceful shutdown before force-killing.**

---

## Monitoring Load Balancing

### Metrics to Track

**Better Stack (see `docs/06-operations/monitoring.md`)**:

```typescript
// Track which server handled request
import { logtail } from '@logtail/node';

logtail.info('Request handled', {
  server: process.env.RAILWAY_REPLICA_ID,
  path: request.url,
  method: request.method,
  responseTime: duration,
});
```

**Dashboards to create**:
- Requests per server (should be evenly distributed)
- Response times per server (should be similar)
- Error rates per server (should be low)
- Active replicas over time (should scale with load)

---

## Load Balancing Checklist

Before enabling load balancing:

### Prerequisites
- [ ] One server can't handle traffic (CPU > 80%, response times > 1s)
- [ ] Sessions stored in Redis (not in-memory)
- [ ] Database uses connection pooling (Prisma + PgBouncer)
- [ ] Health check endpoint implemented
- [ ] Graceful shutdown implemented

### Railway Configuration
- [ ] Auto-scaling enabled (min 2, max 5 replicas)
- [ ] Health checks configured
- [ ] Environment variables set on all replicas

### Testing
- [ ] Verify traffic distributed across replicas
- [ ] Test deploy doesn't cause downtime
- [ ] Test server crash doesn't lose sessions
- [ ] Monitor response times under load

---

## Summary

**When NOT to load balance**:
- < 10,000 users
- < 500 requests/second
- One server handles load fine

**When to load balance**:
- 10,000+ users
- 500+ requests/second
- Need 99.9%+ uptime
- Global users (need geo-routing)

**Railway built-in load balancing**:
- Auto-scaling (adds replicas under load)
- Health checks (restarts unhealthy servers)
- Zero-downtime deploys (rolling deploys)
- Cost: $0 (included)

**Key requirements**:
- Sessions in Redis (not in-memory)
- Health check endpoint
- Graceful shutdown

**For global users**:
- Use Cloudflare Load Balancer ($5-20/month)
- Deploy to multiple regions
- Route by geography

**See Also**:
- `docs/03-architecture/caching-strategy.md` - Redis for sessions
- `docs/03-architecture/database-optimization.md` - Connection pooling
- `docs/06-operations/monitoring.md` - Monitor load balancing
- `docs/07-deployment/railway.md` - Railway deployment guide

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

