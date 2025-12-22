# Database Optimization (PostgreSQL)

## Overview

This document defines PostgreSQL optimization strategies to ensure fast queries, efficient resource usage, and scalability. PostgreSQL is our primary database for all SaaS applications.

**Tools**:
- PostgreSQL 16.x (database)
- Prisma ORM (query builder)
- PgBouncer (connection pooling)

**Cost**: $0 (configuration best practices, open-source tools)

---

## Core Principles

1. **Index strategically** - Not every column needs an index
2. **Query efficiently** - Use EXPLAIN to understand query plans
3. **Pool connections** - PostgreSQL processes are expensive
4. **Monitor performance** - Track slow queries
5. **Regular maintenance** - VACUUM and ANALYZE keep things fast

---

## Indexing Strategy

### Index Types and When to Use

**B-Tree** (default, most common):
```sql
-- Use for: Equality and range queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Queries that benefit:
SELECT * FROM users WHERE email = 'user@example.com';
SELECT * FROM orders WHERE created_at > '2025-01-01';
```

**Hash** (equality only):
```sql
-- Use for: Exact match lookups only
CREATE INDEX idx_sessions_token ON sessions USING HASH (token);

-- Queries that benefit:
SELECT * FROM sessions WHERE token = 'abc123';
```

**GIN** (arrays, JSONB, full-text search):
```sql
-- Use for: JSONB queries, array containment, full-text search
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

-- Queries that benefit:
SELECT * FROM products WHERE metadata @> '{"color": "red"}';
SELECT * FROM posts WHERE tags @> ARRAY['postgresql'];
```

**BRIN** (large tables with natural ordering):
```sql
-- Use for: Time-series data, append-only tables > 100GB
CREATE INDEX idx_events_timestamp ON events USING BRIN (timestamp);

-- Queries that benefit:
SELECT * FROM events WHERE timestamp > NOW() - INTERVAL '7 days';
```

**Partial** (filtered index):
```sql
-- Use for: Queries on subset of rows
CREATE INDEX idx_users_active ON users(email) WHERE active = true;
CREATE INDEX idx_orders_pending ON orders(id) WHERE status = 'pending';

-- Queries that benefit:
SELECT * FROM users WHERE email = 'user@example.com' AND active = true;
```

**Composite/Multi-column**:
```sql
-- Use for: Queries filtering on multiple columns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_posts_author_date ON posts(author_id, created_at);

-- Queries that benefit:
SELECT * FROM orders WHERE user_id = '123' AND status = 'pending';
SELECT * FROM posts WHERE author_id = '456' ORDER BY created_at DESC;
```

**Covering/INCLUDE** (index-only scans):
```sql
-- Use for: Include non-indexed columns in index
CREATE INDEX idx_users_email_covering ON users(email) INCLUDE (name, created_at);

-- Queries that benefit (no table lookup needed):
SELECT email, name, created_at FROM users WHERE email = 'user@example.com';
```

### When NOT to Index

Avoid indexing when:

1. **Small tables** (< 1000 rows)
   - Full table scan is faster than index lookup

2. **Low cardinality** columns
   ```sql
   -- BAD: Boolean, gender, status (few distinct values)
   CREATE INDEX idx_users_gender ON users(gender); -- Only 2-3 values

   -- GOOD: Use partial index if needed
   CREATE INDEX idx_users_male ON users(id) WHERE gender = 'male';
   ```

3. **Frequent writes**
   - Each index slows down INSERT/UPDATE/DELETE
   - Balance read performance vs write performance

4. **Overlapping indexes**
   ```sql
   -- BAD: Redundant indexes
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   CREATE INDEX idx_orders_user_status ON orders(user_id, status);
   -- Second index can handle queries on just user_id

   -- GOOD: Keep only the composite index
   CREATE INDEX idx_orders_user_status ON orders(user_id, status);
   ```

### Identifying Missing Indexes

Use `EXPLAIN ANALYZE` to find missing indexes:

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = '123' AND status = 'pending';
```

Look for:
- `Seq Scan` - Full table scan (bad for large tables)
- `Index Scan` - Good!
- High `cost` numbers
- High `actual time`

**Example output**:
```
Seq Scan on orders  (cost=0.00..10000.00 rows=1000 width=100) (actual time=0.123..45.678 rows=1000 loops=1)
  Filter: (user_id = '123' AND status = 'pending')
Planning Time: 0.123 ms
Execution Time: 45.789 ms
```

**After adding index**:
```
Index Scan using idx_orders_user_status on orders  (cost=0.43..8.45 rows=1 width=100) (actual time=0.012..0.034 rows=1 loops=1)
  Index Cond: ((user_id = '123') AND (status = 'pending'))
Planning Time: 0.056 ms
Execution Time: 0.089 ms
```

---

## Query Optimization

### 1. Enable Query Logging

Track slow queries in PostgreSQL:

```sql
-- postgresql.conf or environment variable
log_min_duration_statement = 1000  -- Log queries > 1 second
```

With Prisma:
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    logger.warn('Slow query detected', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

### 2. Use pg_stat_statements

Enable PostgreSQL extension to track query performance:

```sql
-- Enable extension (run once)
CREATE EXTENSION pg_stat_statements;

-- Find slowest queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### 3. Optimize N+1 Queries

**BAD** (N+1 problem):
```typescript
// Fetches 1 query for users + N queries for posts
const users = await prisma.user.findMany();

for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
  // ...
}
```

**GOOD** (single query with join):
```typescript
const users = await prisma.user.findMany({
  include: {
    posts: true, // Joins in single query
  },
});
```

### 4. Select Only What You Need

**BAD** (fetches all columns):
```typescript
const users = await prisma.user.findMany();
// Returns id, email, password_hash, created_at, updated_at, etc.
```

**GOOD** (select specific columns):
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
// Only returns id, email, name
```

### 5. Use Pagination

**BAD** (fetches all rows):
```typescript
const orders = await prisma.order.findMany(); // Could be 1M rows!
```

**GOOD** (cursor-based pagination):
```typescript
const orders = await prisma.order.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

**BETTER** (cursor-based with index):
```typescript
const orders = await prisma.order.findMany({
  take: 20,
  cursor: lastOrderId ? { id: lastOrderId } : undefined,
  skip: lastOrderId ? 1 : 0,
  orderBy: { id: 'desc' },
});
```

### 6. Batch Operations

**BAD** (N queries):
```typescript
for (const userId of userIds) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });
}
```

**GOOD** (single query):
```typescript
await prisma.user.updateMany({
  where: { id: { in: userIds } },
  data: { lastLogin: new Date() },
});
```

---

## Connection Pooling

PostgreSQL creates a new process for each connection. Connection pooling reuses connections, reducing overhead.

### Option 1: Prisma Built-in Pooling

```typescript
// Prisma handles pooling automatically
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Configure pool size in connection string
// DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=20"
```

**Pool size guidelines**:
- **Development**: 5-10 connections
- **Production API**: 10-20 connections per instance
- **Background workers**: 2-5 connections

**Formula**: `(2 * CPU cores) + disk_spindles`
- For 2 CPU cores: 5-10 connections

### Option 2: PgBouncer (Recommended for Scale)

PgBouncer is a lightweight connection pooler:

```bash
# Install PgBouncer
# Railway: Built-in PgBouncer available
# Self-hosted: apt-get install pgbouncer
```

**Configuration** (`pgbouncer.ini`):
```ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# Pool settings
pool_mode = transaction      # Most efficient
max_client_conn = 1000       # Max clients
default_pool_size = 20       # Connections to PostgreSQL
reserve_pool_size = 5        # Reserve for emergencies
```

**Connection string with PgBouncer**:
```
DATABASE_URL="postgresql://user:pass@localhost:6432/mydb?pgbouncer=true"
```

**Pool modes**:
- **Session**: 1 connection per client (least efficient)
- **Transaction**: Connection returned after transaction (recommended)
- **Statement**: Connection returned after each statement (most efficient, not compatible with all ORMs)

---

## Database Maintenance

### 1. VACUUM (Remove Dead Tuples)

PostgreSQL uses MVCC (multi-version concurrency control), which creates "dead tuples" on UPDATE/DELETE. VACUUM reclaims space.

**Automatic VACUUM** (enabled by default):
```sql
-- Check autovacuum settings
SHOW autovacuum;

-- View last vacuum time
SELECT
  schemaname,
  relname,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables;
```

**Manual VACUUM**:
```sql
-- Vacuum specific table
VACUUM orders;

-- Vacuum all tables
VACUUM;

-- Aggressive vacuum (locks table, use carefully)
VACUUM FULL orders;  -- Rewrites entire table
```

**When to manual VACUUM**:
- After bulk DELETE/UPDATE
- After dropping columns
- Tables with high write volume

### 2. ANALYZE (Update Statistics)

ANALYZE updates query planner statistics, helping PostgreSQL choose optimal query plans.

```sql
-- Analyze specific table
ANALYZE orders;

-- Analyze all tables
ANALYZE;

-- Analyze after bulk changes
ANALYZE VERBOSE orders;
```

**When to ANALYZE**:
- After bulk INSERT/UPDATE
- After creating indexes
- After significant data changes

**Automate with Prisma**:
```typescript
// Run ANALYZE after migrations
async function postMigrate() {
  await prisma.$executeRaw`ANALYZE`;
  logger.info('Database statistics updated');
}
```

### 3. REINDEX (Rebuild Indexes)

Over time, indexes can become fragmented. REINDEX rebuilds them.

```sql
-- Reindex specific index
REINDEX INDEX idx_users_email;

-- Reindex table
REINDEX TABLE orders;

-- Reindex concurrently (doesn't lock, PostgreSQL 12+)
REINDEX INDEX CONCURRENTLY idx_users_email;
```

**When to REINDEX**:
- Index bloat (check with pg_stat_user_indexes)
- After major updates
- Quarterly maintenance

### 4. Drop Unused Indexes

Find and remove unused indexes:

```sql
-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Drop unused index
DROP INDEX CONCURRENTLY idx_users_unused;  -- Doesn't lock table
```

---

## Server Configuration

### Key PostgreSQL Settings

```sql
-- postgresql.conf or environment variables

-- Memory settings
shared_buffers = 256MB              -- 25% of RAM
work_mem = 10MB                     -- Per-query memory for sorting/hashing
maintenance_work_mem = 256MB        -- For VACUUM, CREATE INDEX

-- Connection settings
max_connections = 100               -- Max concurrent connections

-- Query planning
effective_cache_size = 1GB          -- 50-75% of RAM
random_page_cost = 1.1              -- SSD optimization (default 4.0)

-- Logging
log_min_duration_statement = 1000   -- Log slow queries (> 1s)
log_line_prefix = '%t [%p]: '       -- Timestamp and PID
```

**Railway/Cloud**: These are usually pre-configured optimally.

---

## Partitioning (for Large Tables)

Partition tables > 100GB for better performance:

```sql
-- Range partitioning (by date)
CREATE TABLE events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE events_2025_01 PARTITION OF events
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE events_2025_02 PARTITION OF events
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Query uses only relevant partition
SELECT * FROM events WHERE created_at > '2025-01-15';  -- Only scans events_2025_01
```

**When to partition**:
- Tables > 100GB
- Time-series data (events, logs, metrics)
- High ingestion rate
- Performance degradation

---

## Multi-Tenancy Optimization

For SaaS apps with tenants:

### Strategy 1: Row-Level Security (RLS)

```sql
-- Enable RLS on table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Set tenant in Prisma query
await prisma.$executeRaw`SET app.current_tenant = ${tenantId}`;
const orders = await prisma.order.findMany();  -- Automatically filtered
```

### Strategy 2: Tenant-Specific Indexes

```sql
-- Index on tenant_id for multi-tenant queries
CREATE INDEX idx_orders_tenant_user ON orders(tenant_id, user_id);
CREATE INDEX idx_products_tenant ON products(tenant_id);
```

---

## Monitoring Database Performance

### Key Metrics to Track

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('mydb'));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Index sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 10;

-- Cache hit ratio (should be > 99%)
SELECT
  sum(blks_hit) / (sum(blks_hit) + sum(blks_read)) AS cache_hit_ratio
FROM pg_stat_database
WHERE datname = 'mydb';

-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Long-running queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - pg_stat_activity.query_start > interval '5 seconds'
ORDER BY duration DESC;
```

### Integrate with Better Stack

```typescript
// Monitor database performance
async function logDatabaseMetrics() {
  const stats = await prisma.$queryRaw`
    SELECT
      (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
      (SELECT pg_database_size(current_database())) as db_size,
      (SELECT sum(blks_hit) / (sum(blks_hit) + sum(blks_read))
       FROM pg_stat_database WHERE datname = current_database()) as cache_hit_ratio
  `;

  logger.info('Database metrics', stats[0]);
}

// Run every 5 minutes
setInterval(logDatabaseMetrics, 5 * 60 * 1000);
```

---

## Database Optimization Checklist

Before production:

### Indexing
- [ ] Indexes created for all foreign keys
- [ ] Indexes created for frequently queried columns
- [ ] Composite indexes for multi-column queries
- [ ] Partial indexes for filtered queries
- [ ] No redundant or unused indexes

### Queries
- [ ] No N+1 queries (use Prisma `include`)
- [ ] SELECT only needed columns
- [ ] Pagination implemented for large result sets
- [ ] Batch operations used instead of loops
- [ ] Slow query logging enabled

### Connection Pooling
- [ ] Connection pool configured (Prisma or PgBouncer)
- [ ] Pool size appropriate for workload
- [ ] Connection limit set in DATABASE_URL

### Maintenance
- [ ] Auto VACUUM enabled
- [ ] ANALYZE scheduled after bulk changes
- [ ] Unused indexes identified and dropped
- [ ] Database size monitored

### Monitoring
- [ ] Slow query logging enabled
- [ ] pg_stat_statements enabled
- [ ] Database metrics logged to Better Stack
- [ ] Alerts configured for slow queries
- [ ] Cache hit ratio monitored (target > 99%)

---

## Summary

**Key strategies**:
1. **Index strategically** - B-tree for most, GIN for JSONB, partial for filters
2. **Optimize queries** - Use EXPLAIN, avoid N+1, select only needed columns
3. **Pool connections** - Prisma built-in or PgBouncer for scale
4. **Maintain regularly** - VACUUM, ANALYZE, REINDEX
5. **Monitor performance** - Track slow queries, cache hit ratio, connection count

**Cost**: $0 (best practices + open-source tools)

**See Also**:
- `docs/03-architecture/caching-strategy.md` - Reduce database load with caching
- `docs/03-architecture/performance.md` - Overall performance optimization
- `docs/06-operations/monitoring.md` - Database monitoring with Better Stack

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

