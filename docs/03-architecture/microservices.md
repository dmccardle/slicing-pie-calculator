# Microservices Architecture

## Overview

Microservices split your application into independent services. This document defines when (and when NOT) to use microservices.

**Rule**: Start with a monolith. Microservices are for scaling teams, not traffic.

---

## What Are Microservices?

**Monolith** (one codebase, one deployment):
```
┌─────────────────────────────┐
│      One Application        │
│                             │
│  ┌─────┐  ┌─────┐  ┌─────┐ │
│  │Users│  │Posts│  │ Pay │ │
│  └─────┘  └─────┘  └─────┘ │
│                             │
│     One Database            │
└─────────────────────────────┘
```

**Microservices** (multiple codebases, multiple deployments):
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Users   │  │  Posts   │  │ Payments │
│ Service  │  │ Service  │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
┌────▼─────┐  ┌───▼──────┐  ┌───▼──────┐
│ Users DB │  │ Posts DB │  │  Pay DB  │
└──────────┘  └──────────┘  └──────────┘
```

---

## When NOT to Use Microservices

### Don't use microservices if:

1. **You're a startup with < 10 engineers**
   - Microservices add 10x complexity
   - Your team is too small to manage multiple services
   - You'll spend more time on infrastructure than product

2. **You haven't found product-market fit**
   - Your product will change rapidly
   - Microservices make changes harder (coordinate across services)
   - Monolith = faster iteration

3. **You have < 100,000 users**
   - A monolith can handle millions of users
   - Premature optimization wastes time
   - Scale when you need to, not before

4. **You're just trying to sound cool**
   - "We use microservices" ≠ successful company
   - Simple > complex
   - Boring technology wins

**Real talk**: Amazon, Netflix, Uber started as monoliths. They switched to microservices AFTER growing to thousands of engineers. You don't have that problem yet.

---

## When to Use Microservices

### Use microservices when:

1. **You have 20+ engineers**
   - Too many devs stepping on each other in one codebase
   - Multiple teams want to work independently
   - Microservices = team autonomy

2. **Different parts have different scaling needs**
   - Image processing: CPU-intensive, needs beefy servers
   - API: I/O-intensive, needs many small servers
   - Better to scale independently

3. **You need polyglot (multiple languages)**
   - Image processing in Python (great ML libraries)
   - API in Node.js (great async performance)
   - Background jobs in Go (great concurrency)

4. **You have clear domain boundaries**
   - Users, Products, Orders, Payments are distinct domains
   - Each can change independently
   - Minimal cross-service calls

**Typical thresholds**:
- 20+ engineers
- $10M+ ARR
- 1M+ users
- Multiple teams working on product

**If you don't meet these, stay monolith.**

---

## Monolith First Approach

**Recommended for 90% of startups:**

### Phase 1: Monolith (Year 1-2)

**One Next.js app, one database**:

```
/app
  /api
    /v1
      /users
      /posts
      /payments
  /dashboard
  /marketing
```

**Benefits**:
- Fast development (one codebase, one deploy)
- Easy debugging (all code in one place)
- Simple infrastructure (one server, one database)

**Drawbacks**:
- All code in one repo (can get messy)
- Can't scale parts independently

### Phase 2: Modular Monolith (Year 2-3)

**One codebase, multiple modules**:

```
/app
  /modules
    /users
      /api
      /lib
      /types
    /posts
      /api
      /lib
      /types
    /payments
      /api
      /lib
      /types
```

**Benefits**:
- Clear boundaries (easier to extract later)
- Still simple to deploy
- Can assign teams to modules

### Phase 3: Microservices (Year 3+)

**Only when you have 20+ engineers and clear need.**

Extract one module at a time:
1. Payments (requires PCI compliance, isolate risk)
2. Image processing (CPU-intensive, different scaling)
3. Background jobs (different infrastructure needs)

**Don't extract everything. Keep core monolith.**

---

## Microservices Trade-offs

### Pros

1. **Team autonomy**
   - Each service has own codebase, deploy schedule
   - Teams don't block each other

2. **Independent scaling**
   - Scale image processing service separately from API
   - Different infrastructure per service

3. **Fault isolation**
   - Payments service crashes → Users service still works
   - Monolith crash → everything down

4. **Technology flexibility**
   - Use Python for ML, Go for high-performance, Node for API
   - Choose best tool per service

### Cons

1. **Operational complexity (10x harder)**
   - 1 monolith → Easy to deploy, monitor, debug
   - 10 microservices → 10 repos, 10 deploys, 10 databases, 10 monitoring dashboards

2. **Distributed system problems**
   - Network failures (service A can't reach service B)
   - Data consistency (how to update 3 databases atomically?)
   - Debugging (trace request across 5 services)

3. **Performance overhead**
   - Monolith: function call (< 1ms)
   - Microservices: HTTP request (10-100ms)
   - More network calls = slower

4. **Higher costs**
   - 1 monolith: $50/month (Railway)
   - 10 microservices: $500/month (10 Railway projects)

**Only adopt microservices when benefits > costs.**

---

## Implementing Microservices (If You Must)

### Architecture Pattern

**API Gateway + Microservices**:

```
                  ┌──────────────┐
User ────────────►│ API Gateway  │
                  │  (Next.js)   │
                  └───────┬──────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
    │  Users   │    │  Posts   │    │ Payments │
    │ Service  │    │ Service  │    │ Service  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
    ┌────▼─────┐    ┌───▼──────┐    ┌───▼──────┐
    │ Users DB │    │ Posts DB │    │  Pay DB  │
    └──────────┘    └──────────┘    └──────────┘
```

### Step 1: API Gateway (Next.js)

**Handles**:
- Authentication
- Routing to services
- Response aggregation
- Rate limiting

```typescript
// app/api/v1/posts/[id]/route.ts
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Authenticate
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch from Posts Service
  const postResponse = await fetch(
    `${process.env.POSTS_SERVICE_URL}/posts/${params.id}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );
  const post = await postResponse.json();

  // 3. Fetch author from Users Service
  const userResponse = await fetch(
    `${process.env.USERS_SERVICE_URL}/users/${post.authorId}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );
  const author = await userResponse.json();

  // 4. Aggregate response
  return Response.json({
    ...post,
    author,
  });
}
```

### Step 2: Individual Microservices

**Each service is a standalone Next.js/NestJS app**:

```bash
# Users Service
railway-users/
  /app
    /api
      /v1
        /users
  /lib
  /prisma
    schema.prisma  # Only User model

# Posts Service
railway-posts/
  /app
    /api
      /v1
        /posts
  /lib
  /prisma
    schema.prisma  # Only Post model
```

**Each service has own database**:

```prisma
// railway-users/prisma/schema.prisma
model User {
  id    String @id
  name  String
  email String @unique
}

// railway-posts/prisma/schema.prisma
model Post {
  id       String @id
  title    String
  authorId String  // References Users Service (no foreign key!)
}
```

**No foreign keys across services. Eventual consistency only.**

### Step 3: Service-to-Service Authentication

**Services need to authenticate each other**:

```typescript
// lib/service-auth.ts
import jwt from 'jsonwebtoken';

const SERVICE_SECRET = process.env.SERVICE_SECRET!;

export function createServiceToken(serviceName: string) {
  return jwt.sign(
    {
      service: serviceName,
      iat: Date.now(),
    },
    SERVICE_SECRET,
    { expiresIn: '5m' }
  );
}

export function verifyServiceToken(token: string) {
  try {
    return jwt.verify(token, SERVICE_SECRET);
  } catch {
    return null;
  }
}

// Usage in Posts Service
export async function GET(request: Request) {
  const token = request.headers.get('X-Service-Token');
  const payload = verifyServiceToken(token);

  if (!payload) {
    return Response.json({ error: 'Unauthorized service' }, { status: 401 });
  }

  // Handle request
}
```

---

## Inter-Service Communication

### Option 1: Synchronous (HTTP/REST)

**API Gateway calls services via HTTP**:

```typescript
// Synchronous call
const user = await fetch(`${USERS_SERVICE_URL}/users/${userId}`).then(r => r.json());
const posts = await fetch(`${POSTS_SERVICE_URL}/posts?authorId=${userId}`).then(r => r.json());
```

**Pros**: Simple, immediate response
**Cons**: If Users Service is down, entire request fails

### Option 2: Asynchronous (Message Queue)

**Services communicate via events**:

```typescript
// Users Service publishes event
await publishEvent('user.created', {
  userId: user.id,
  email: user.email,
});

// Email Service subscribes to event
subscribeToEvent('user.created', async (event) => {
  await sendWelcomeEmail(event.email);
});
```

**Tools**:
- **BullMQ** (Redis-based, simple)
- **RabbitMQ** (complex, powerful)
- **AWS SQS** (managed, expensive)

**Pros**: Resilient (retries on failure), decoupled
**Cons**: Complex, eventual consistency

**Recommendation**: Start with HTTP (Option 1), add queues when needed.

---

## Data Consistency Across Services

**Problem**: How to update Users + Posts databases atomically?

### Anti-Pattern: Distributed Transactions

```typescript
// DON'T DO THIS (doesn't work across services)
await prisma.$transaction([
  usersDB.user.update({ where: { id }, data: { name } }),
  postsDB.post.updateMany({ where: { authorId: id }, data: { authorName: name } }),
]);
```

**Distributed transactions are hard. Don't do them.**

### Pattern 1: Eventual Consistency (Recommended)

**Accept that data will be temporarily inconsistent**:

```typescript
// 1. User changes name in Users Service
await usersDB.user.update({
  where: { id },
  data: { name: 'New Name' },
});

// 2. Publish event
await publishEvent('user.updated', { userId: id, name: 'New Name' });

// 3. Posts Service subscribes and updates (eventually)
subscribeToEvent('user.updated', async (event) => {
  await postsDB.post.updateMany({
    where: { authorId: event.userId },
    data: { authorName: event.name },
  });
});
```

**For a few seconds, posts show old author name. That's OK.**

### Pattern 2: Saga Pattern (Advanced)

**Coordinate multi-step workflows with compensating transactions**:

```typescript
// Create order workflow
async function createOrder(userId: string, items: Item[]) {
  try {
    // Step 1: Reserve inventory
    const reservation = await inventoryService.reserve(items);

    try {
      // Step 2: Charge payment
      const payment = await paymentService.charge(userId, total);

      try {
        // Step 3: Create order
        const order = await orderService.create(userId, items, payment);
        return order;
      } catch {
        // Compensate: Refund payment
        await paymentService.refund(payment.id);
        throw error;
      }
    } catch {
      // Compensate: Release inventory
      await inventoryService.release(reservation.id);
      throw error;
    }
  } catch {
    throw new Error('Order creation failed');
  }
}
```

**Complex but ensures consistency.**

---

## Monitoring Microservices

**Distributed tracing = follow request across services**:

### Implement Trace IDs

```typescript
// API Gateway
export async function GET(request: Request) {
  const traceId = crypto.randomUUID();

  // Pass trace ID to all services
  const userResponse = await fetch(`${USERS_SERVICE_URL}/users/${id}`, {
    headers: { 'X-Trace-ID': traceId },
  });

  const postsResponse = await fetch(`${POSTS_SERVICE_URL}/posts?authorId=${id}`, {
    headers: { 'X-Trace-ID': traceId },
  });

  // Log with trace ID
  logtail.info('Fetched user profile', { traceId });
}

// Users Service
export async function GET(request: Request) {
  const traceId = request.headers.get('X-Trace-ID');

  logtail.info('Fetched user', {
    traceId,
    service: 'users',
    userId: id,
  });
}
```

**Now you can trace requests across services in Better Stack**:

```
Trace ID: abc-123
1. API Gateway: Received request (0ms)
2. Users Service: Fetched user (50ms)
3. Posts Service: Fetched posts (120ms)
4. API Gateway: Returned response (180ms)
```

**See `docs/06-operations/monitoring.md` for Better Stack setup**

---

## Microservices Checklist

Before splitting monolith:

### Business Case
- [ ] 20+ engineers (team autonomy needed)
- [ ] $10M+ ARR (can afford complexity)
- [ ] Clear domain boundaries (users, payments, etc.)
- [ ] Different scaling needs per service

### Technical Preparation
- [ ] Monolith has clear module boundaries
- [ ] Each module has own database tables
- [ ] Minimal cross-module dependencies
- [ ] Comprehensive test coverage (don't break during split)

### Infrastructure
- [ ] API Gateway set up
- [ ] Service-to-service auth implemented
- [ ] Distributed tracing (trace IDs)
- [ ] Monitoring per service (Better Stack)

### Team
- [ ] Dedicated team per service (3-5 engineers)
- [ ] On-call rotation per service
- [ ] Service ownership defined

---

## Summary

**Monolith vs Microservices**:

| Monolith | Microservices |
|----------|---------------|
| 1 codebase | Many codebases |
| 1 deploy | Many deploys |
| 1 database | Many databases |
| Simple | Complex (10x) |
| Fast to build | Slow to build |
| Good for < 20 engineers | Good for 20+ engineers |

**When NOT to use microservices**:
- < 10 engineers
- < 100K users
- Haven't found product-market fit
- Trying to sound cool

**When to use microservices**:
- 20+ engineers (team autonomy)
- Different scaling needs
- Clear domain boundaries
- Can afford 10x operational complexity

**Recommendation**:
1. Start with monolith (Year 1-2)
2. Evolve to modular monolith (Year 2-3)
3. Extract microservices when needed (Year 3+)
4. Keep core monolith (don't extract everything)

**See Also**:
- `docs/03-architecture/load-balancing.md` - Scale monolith first
- `docs/03-architecture/database-optimization.md` - Optimize before splitting
- `docs/06-operations/monitoring.md` - Monitor microservices
- `docs/rules/clean-code.md` - Modular monolith patterns

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

