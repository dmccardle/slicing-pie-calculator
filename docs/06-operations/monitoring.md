# Monitoring and Observability

## Overview

This document defines monitoring, logging, and observability standards using **Better Stack** as our unified platform. Better Stack combines error tracking, logs, uptime monitoring, and incident management in one tool, providing complete visibility into system health.

**Tool**: [Better Stack](https://betterstack.com/)
**Cost**: Starter $9/user/month, Advanced $39/user/month
**Why**: Modern, unified platform with excellent DX, GDPR compliant, fair pricing

---

## Core Principles

1. **Monitor everything that matters** - Instrument comprehensively
2. **Alert on symptoms, not causes** - Alert when users are affected
3. **Make data actionable** - Every metric should enable a decision
4. **Assume systems will fail** - Design for detection and recovery
5. **Unified visibility** - One platform for logs, errors, uptime, incidents

---

## Better Stack Setup

### 1. Account Setup

1. **Sign up**: https://betterstack.com/
2. **Choose plan**:
   - **Starter** ($9/user/month): 30-second uptime checks, 10GB logs/month
   - **Advanced** ($39/user/month): Unlimited everything, phone alerts, SLA guarantees
3. **Create team**: Add 2-3 developers
4. **Connect services**: Link to your infrastructure

### 2. Install Better Stack SDKs

#### Next.js (Web Frontend)

```bash
npm install @logtail/next
```

```typescript
// lib/logger.ts
import { Logtail } from '@logtail/next';

export const logger = new Logtail(process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN!);

// app/api/example/route.ts
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    logger.info('API request received', {
      path: request.url,
      method: request.method
    });

    const data = await fetchData();

    logger.info('API request successful', {
      path: request.url,
      recordCount: data.length
    });

    return Response.json(data);

  } catch (error) {
    logger.error('API request failed', {
      path: request.url,
      error: error.message,
      stack: error.stack
    });

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### NestJS (Backend API)

```bash
npm install @logtail/node
```

```typescript
// src/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import { Logtail } from '@logtail/node';

@Injectable()
export class BetterStackLogger implements LoggerService {
  private logtail: Logtail;

  constructor() {
    this.logtail = new Logtail(process.env.BETTER_STACK_SOURCE_TOKEN);
  }

  log(message: string, context?: any) {
    this.logtail.info(message, context);
  }

  error(message: string, trace?: string, context?: any) {
    this.logtail.error(message, { ...context, trace });
  }

  warn(message: string, context?: any) {
    this.logtail.warn(message, context);
  }

  debug(message: string, context?: any) {
    this.logtail.debug(message, context);
  }
}

// src/app.module.ts
import { Module } from '@nestjs/common';
import { BetterStackLogger } from './logger/logger.service';

@Module({
  providers: [BetterStackLogger],
  exports: [BetterStackLogger],
})
export class AppModule {}
```

#### React Native/Expo (Mobile)

```bash
npm install @logtail/js
```

```typescript
// lib/logger.ts
import { Logtail } from '@logtail/js';

export const logger = new Logtail(process.env.EXPO_PUBLIC_BETTER_STACK_SOURCE_TOKEN!);

// Example usage in a component
import { logger } from '@/lib/logger';

export function UserProfile() {
  const handleExport = async () => {
    try {
      logger.info('User initiated export', {
        userId: user.id,
        exportType: 'pdf'
      });

      await exportData();

      logger.info('Export completed successfully', {
        userId: user.id
      });

    } catch (error) {
      logger.error('Export failed', {
        userId: user.id,
        error: error.message
      });
    }
  };
}
```

### 3. Configure Uptime Monitoring

1. Go to Better Stack → Uptime
2. Click "Add Monitor"
3. Configure:
   - **URL**: Your production URL (e.g., https://api.yourapp.com/health)
   - **Check interval**: 30 seconds (Starter) or 10 seconds (Advanced)
   - **Locations**: Select 3-5 regions (US East, US West, EU, Asia)
   - **Expected status code**: 200
   - **Timeout**: 10 seconds

4. Add monitors for:
   - Main API (`/health`)
   - Web app homepage
   - Critical API endpoints (`/api/v1/users`, `/api/v1/auth`)
   - Database connection (`/health/db`)
   - External dependencies (`/health/external`)

### 4. Set Up Incident Management

1. Go to Better Stack → On-Call
2. Create escalation policy:
   - **Level 1**: Primary on-call (respond in 5 min)
   - **Level 2**: Secondary on-call (if no response in 15 min)
   - **Level 3**: Engineering lead (if no response in 30 min)

3. Configure notification channels:
   - Slack integration
   - Email alerts
   - SMS alerts (Advanced plan)
   - Phone calls (Advanced plan)

4. Set up weekly on-call rotation

---

## The Four Golden Signals

Every system MUST monitor these metrics in Better Stack:

### 1. Latency

**What**: Time taken to service requests

**Targets**:
- API endpoints: p50 < 200ms, p95 < 500ms, p99 < 1s
- Database queries: p50 < 50ms, p95 < 200ms
- Page loads: p50 < 1s, p95 < 2s

**Implementation**:
```typescript
// NestJS middleware
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('user-agent'),
      });

      // Warn on slow requests
      if (duration > 1000) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration,
        });
      }
    });

    next();
  }
}
```

### 2. Traffic

**What**: Request volume

**Targets**:
- Establish baseline (e.g., 1000 req/min)
- Alert on 3x spike or 0.1x drop

**Better Stack**: Automatically tracked via logs

### 3. Errors

**What**: Failed requests

**Targets**:
- Error rate < 0.1%
- 5xx errors < 0.01%

**Implementation**:
```typescript
// Global error handler (NestJS)
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { logger } from './logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    logger.error('Unhandled exception', {
      path: request.url,
      method: request.method,
      statusCode: status,
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      userId: request.user?.id,
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 4. Saturation

**What**: Resource utilization

**Targets**:
- CPU < 70%, Memory < 80%, Disk < 70%

**Better Stack**: Use infrastructure monitoring integration (Railway, AWS, GCP)

---

## Logging Standards

### Log Levels

```typescript
// ERROR - Requires immediate attention
logger.error('Payment processing failed', {
  userId: user.id,
  orderId: order.id,
  amount: order.total,
  error: error.message,
  stack: error.stack
});

// WARN - Unexpected but handled
logger.warn('External API slow', {
  api: 'stripe',
  latency: 3000,
  threshold: 1000
});

// INFO - Normal significant events
logger.info('User registered', {
  userId: user.id,
  email: user.email, // Mask in production
  plan: user.plan
});

// DEBUG - Development only (disabled in production)
logger.debug('Cache lookup', {
  key: cacheKey,
  hit: true
});
```

### Structured Logging

All logs in Better Stack are structured JSON. Always include:

```typescript
interface LogContext {
  // Required
  userId?: string;          // For authenticated requests
  tenantId?: string;        // For multi-tenant apps
  requestId?: string;       // Correlation ID

  // Recommended
  duration?: number;        // Operation duration (ms)
  statusCode?: number;      // HTTP status
  path?: string;            // Request path
  method?: string;          // HTTP method

  // Error-specific
  error?: string;           // Error message
  stack?: string;           // Stack trace
  errorCode?: string;       // Application error code
}
```

### PII Protection

**NEVER log**:
- Passwords or tokens
- Credit card numbers
- Full email addresses (hash or mask: `u***@example.com`)
- API keys
- Session tokens
- Social security numbers

**Safe to log**:
- User IDs (internal, not PII)
- Request IDs
- Tenant IDs
- Masked emails
- Last 4 digits of phone/card

---

## Alerting Strategy

### Critical Alerts (Page Immediately)

Configure in Better Stack → Alerts:

1. **Service Down**
   - Trigger: Uptime monitor fails 3x in 2 minutes
   - Notify: Slack + SMS + Phone call
   - Escalate: After 5 minutes

2. **High Error Rate**
   - Trigger: Error rate > 1% for 1 minute
   - Notify: Slack + SMS
   - Escalate: After 10 minutes

3. **Resource Saturation**
   - Trigger: CPU > 90% for 5 minutes OR Memory > 90%
   - Notify: Slack + Email
   - Escalate: After 15 minutes

### Warning Alerts (Slack/Email Only)

1. **Elevated Error Rate**
   - Trigger: Error rate > 0.1% for 5 minutes
   - Notify: Slack

2. **Slow Responses**
   - Trigger: p95 latency > 1s for 10 minutes
   - Notify: Slack

3. **Resource Warning**
   - Trigger: CPU > 70% OR Memory > 80% for 10 minutes
   - Notify: Slack

### Alert Configuration Example

```yaml
# In Better Stack dashboard:
Name: High API Error Rate
Condition: error_rate > 0.01
Duration: 1 minute
Severity: Critical
Channels:
  - Slack (#incidents)
  - SMS (on-call)
  - Phone call (on-call)
Escalation: After 10 minutes
```

---

## Dashboards

### Better Stack Dashboards

Create these dashboards:

#### 1. System Health Dashboard
- Request rate (last hour, 24h, 7d)
- Error rate by endpoint
- p50, p95, p99 latency
- Uptime status (all monitors)

#### 2. Business Metrics Dashboard
- User registrations
- Active users (DAU/MAU)
- Key feature usage
- Conversion events

#### 3. On-Call Dashboard
- Recent alerts (last 24h)
- Open incidents
- Error log stream (last 100)
- Uptime monitor status

---

## Health Checks

### Required Endpoints

Every service MUST expose:

```typescript
// Basic health check
@Get('/health')
async health(): Promise<HealthResponse> {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    uptime: process.uptime()
  };
}

// Detailed health check
@Get('/health/detailed')
async detailedHealth(): Promise<DetailedHealthResponse> {
  const dbHealthy = await this.checkDatabase();
  const cacheHealthy = await this.checkCache();

  const isHealthy = dbHealthy && cacheHealthy;

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: dbHealthy ? 'healthy' : 'unhealthy' },
      cache: { status: cacheHealthy ? 'healthy' : 'unhealthy' },
    }
  };
}

// Kubernetes readiness
@Get('/ready')
async readiness(): Promise<{ ready: boolean }> {
  const dbReady = await this.isDatabaseConnected();
  const cacheReady = await this.isCacheConnected();

  return { ready: dbReady && cacheReady };
}

// Kubernetes liveness
@Get('/alive')
async liveness(): Promise<{ alive: boolean }> {
  return { alive: true };
}
```

---

## Cost Optimization

### Better Stack Pricing

**Starter Plan** ($9/user/month):
- 10GB logs/month
- 30-second uptime checks
- Email + Slack alerts
- Basic dashboards

**Advanced Plan** ($39/user/month):
- Unlimited logs
- 10-second uptime checks
- SMS + Phone alerts
- Advanced dashboards
- SLA guarantees

**Recommendation**: Start with Starter ($18-27/month for 2-3 users), upgrade to Advanced if you need phone alerts or exceed log limits.

### Reducing Costs

1. **Sample high-volume logs**:
   ```typescript
   // Only log 10% of successful requests
   if (res.statusCode === 200 && Math.random() > 0.1) {
     return; // Skip logging
   }
   logger.info('Request completed', { ... });
   ```

2. **Use log levels appropriately**:
   - Production: INFO and above only
   - Staging: DEBUG enabled
   - Development: All levels

3. **Set retention**:
   - Production logs: 30 days
   - Staging logs: 7 days
   - Error logs: 90 days

---

## Monitoring Checklist

Before production deployment:

### Application Monitoring
- [ ] Better Stack SDK installed in all services
- [ ] All API endpoints log requests
- [ ] Error tracking configured
- [ ] Structured logging implemented
- [ ] PII excluded from logs
- [ ] Log levels set appropriately (INFO+ in production)

### Infrastructure Monitoring
- [ ] Health check endpoints implemented
- [ ] Uptime monitors configured (3-5 critical endpoints)
- [ ] Better Stack integrations set up (Railway/Vercel/AWS)

### Alerting
- [ ] Critical alerts defined
- [ ] Alert channels configured (Slack, email, SMS)
- [ ] On-call rotation set up
- [ ] Escalation policies defined
- [ ] Alert thresholds tested

### Dashboards
- [ ] System health dashboard created
- [ ] Business metrics dashboard created
- [ ] On-call dashboard created

---

## Common Patterns

### Request Logging Middleware

```typescript
// Express/Next.js
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || generateId();

  req.id = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    });
  });

  next();
}
```

### Database Query Logging

```typescript
// Prisma middleware
prisma.$use(async (params, next) => {
  const startTime = Date.now();

  const result = await next(params);

  const duration = Date.now() - startTime;

  if (duration > 1000) {
    logger.warn('Slow database query', {
      model: params.model,
      action: params.action,
      duration
    });
  }

  return result;
});
```

---

## Summary

Better Stack provides unified monitoring, logging, uptime, and incident management in one platform. Key points:

1. **Install SDK** in all services (Next.js, NestJS, Expo)
2. **Log everything important** with structured JSON
3. **Set up uptime monitors** for critical endpoints
4. **Configure alerts** for critical issues (page) and warnings (Slack)
5. **Create dashboards** for visibility
6. **Define on-call rotation** for incident response

**Cost**: $18-117/month for 2-3 users
**Setup time**: 2-4 hours
**Maintenance**: Minimal (SaaS platform)

**See Also**:
- `docs/06-operations/incident-management.md` - Responding to incidents
- `docs/06-operations/disaster-recovery.md` - Backup and recovery
- `docs/03-architecture/performance.md` - Performance optimization

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

