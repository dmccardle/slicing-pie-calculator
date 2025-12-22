# SaaS Architecture & Multi-Tenancy Rules

## Overview

This document defines architectural patterns and requirements specific to building multi-tenant SaaS products.

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Multi-Tenancy**: Use single database with row-level security (RLS) (see [Multi-Tenancy Architecture](#multi-tenancy))
- **Feature Flags**: ALL new features behind flags for gradual rollout (see [Feature Flags](#feature-flags))
- **Tenant Isolation**: MUST enforce tenant boundaries in all queries (see [Security Considerations](#security))
- **Cost Optimization**: Shared infrastructure with proper isolation (see [Cost Optimization](#cost-optimization))
- **Sales Automation**: Auto-provision on signup, auto-deactivate on cancellation (see [Sales Automation](#sales-automation))

**Quick Example:**
```typescript
// GOOD - Row-level security with tenant isolation
const projects = await db.project.findMany({
  where: { tenantId: req.tenantId }
});

// BAD - No tenant isolation
const projects = await db.project.findMany();
```

**Key Sections:**
- [Multi-Tenancy Architecture](#multi-tenancy) - Database design, RLS patterns
- [Feature Flags](#feature-flags) - LaunchDarkly/Flagsmith integration
- [Custom Domains](#custom-domains) - White-label domain support
- [Monitoring & Alerts](#monitoring) - Per-tenant metrics and alerts

---

## Core Principles {#core-principles}

### 1. Cost-Effective Scalability

**Rule**: Prioritize architectures that are cheap to scale, as long as they don't jeopardize security or performance.

**Guidelines**:
- Choose multi-tenancy over single-tenant where appropriate
- Use serverless/auto-scaling where it makes economic sense
- Optimize database queries and indexing
- Implement caching strategically
- Monitor costs and set up alerts

**Trade-offs**:
- **Acceptable**: Slight performance overhead for significant cost savings
- **Acceptable**: Shared infrastructure with proper isolation
- **Not acceptable**: Security compromises for cost savings
- **Not acceptable**: Poor user experience for cost savings

---

## Multi-Tenancy Architecture {#multi-tenancy}

### Database Strategy

**Recommended**: Multi-tenant database with row-level security (RLS)

**Why**:
- Most cost-effective for scaling
- Simpler to manage and backup
- Better resource utilization
- Easier to maintain

**Implementation with Prisma + PostgreSQL**:

```typescript
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  tenantId  String   // Every table has tenantId
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId]) // Index for performance
}

model Tenant {
  id        String   @id @default(cuid())
  subdomain String   @unique // company-name.product-name.ca
  plan      String   // starter, pro, enterprise
  features  Json     // Feature flags per tenant
  users     User[]
}
```

**Row-Level Security (PostgreSQL)**:

```sql
-- Enable RLS on all tenant tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see data from their tenant
CREATE POLICY tenant_isolation_policy ON "User"
  USING (tenant_id = current_setting('app.current_tenant')::text);
```

**Middleware to Set Tenant Context**:

```typescript
// NestJS Guard
@Injectable()
export class TenantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = this.extractTenantId(request); // From subdomain or header

    // Set tenant context for this request
    await this.prisma.$executeRaw`
      SET LOCAL app.current_tenant = ${tenantId}
    `;

    request.tenantId = tenantId;
    return true;
  }
}
```

### API Multi-Tenancy

**Pattern**: Tenant identified by subdomain

**Examples**:
- `company-name.product-name.ca` → tenantId: "company-name"
- `acme-corp.easygap.ca` → tenantId: "acme-corp"

**Tenant Resolution**:

```typescript
// Extract tenant from subdomain
function getTenantFromHost(host: string): string {
  // host: "acme-corp.easygap.ca"
  const subdomain = host.split('.')[0];

  // Validate subdomain
  if (!subdomain || subdomain === 'www' || subdomain === 'api') {
    throw new UnauthorizedException('Invalid tenant');
  }

  return subdomain;
}

// NestJS Interceptor
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const host = request.headers.host;

    request.tenantId = getTenantFromHost(host);

    return next.handle();
  }
}
```

### Alternatives Considered

**Single-tenant (separate DB per customer)**:
- More expensive to scale
- More complex deployments
- Better for enterprise customers with specific compliance needs
- **Use when**: Enterprise customers require data isolation

**Hybrid (multi-tenant with option for dedicated)**:
- Starter/Pro: Multi-tenant database
- Enterprise: Dedicated database
- **Use when**: Need to offer both options

---

## Feature Flags {#feature-flags}

### Purpose

Enable/disable features based on:
- **Tenant subscription tier** (Starter, Pro, Enterprise)
- **A/B testing**
- **Gradual rollouts**
- **Regional availability**

### Implementation

**Storage**: Feature flags stored per tenant in database

```typescript
// prisma/schema.prisma
model Tenant {
  id       String @id @default(cuid())
  plan     String // "starter" | "pro" | "enterprise"
  features Json   // Feature flags
}

// Example features JSON
{
  "advancedReporting": true,
  "apiAccess": true,
  "customDomain": false,
  "ssoLogin": false,
  "exportData": true,
  "maxUsers": 10
}
```

**Feature Flag Service**:

```typescript
// features/feature-flags.service.ts
@Injectable()
export class FeatureFlagsService {
  constructor(private prisma: PrismaService) {}

  async hasFeature(tenantId: string, featureName: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    // Check plan-based features
    const planFeatures = this.getPlanFeatures(tenant.plan);

    // Check custom features (overrides)
    const customFeatures = tenant.features as Record<string, boolean>;

    return customFeatures[featureName] ?? planFeatures[featureName] ?? false;
  }

  private getPlanFeatures(plan: string): Record<string, boolean> {
    const plans = {
      starter: {
        advancedReporting: false,
        apiAccess: false,
        customDomain: false,
        ssoLogin: false,
        exportData: true,
        maxUsers: 5
      },
      pro: {
        advancedReporting: true,
        apiAccess: true,
        customDomain: true,
        ssoLogin: false,
        exportData: true,
        maxUsers: 25
      },
      enterprise: {
        advancedReporting: true,
        apiAccess: true,
        customDomain: true,
        ssoLogin: true,
        exportData: true,
        maxUsers: -1 // unlimited
      }
    };

    return plans[plan] || plans.starter;
  }
}
```

**Guard to Enforce Feature Access**:

```typescript
// Create a decorator for feature requirements
export const RequiresFeature = (feature: string) =>
  SetMetadata('feature', feature);

// Guard
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlags: FeatureFlagsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>('feature', context.getHandler());
    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId;

    const hasAccess = await this.featureFlags.hasFeature(tenantId, feature);

    if (!hasAccess) {
      throw new ForbiddenException(`Feature '${feature}' not available in your plan`);
    }

    return true;
  }
}

// Usage in controller
@Get('advanced-reports')
@RequiresFeature('advancedReporting')
async getAdvancedReports() {
  // Only accessible if tenant has advancedReporting feature
}
```

**Frontend Feature Flags**:

```typescript
// Next.js - hooks/useFeature.ts
export function useFeature(featureName: string): boolean {
  const { data: tenant } = useTenant(); // Get current tenant

  if (!tenant) return false;

  const planFeatures = getPlanFeatures(tenant.plan);
  const customFeatures = tenant.features || {};

  return customFeatures[featureName] ?? planFeatures[featureName] ?? false;
}

// Usage in component
export function ReportsPage() {
  const hasAdvancedReporting = useFeature('advancedReporting');

  return (
    <div>
      <BasicReports />
      {hasAdvancedReporting && <AdvancedReports />}
      {!hasAdvancedReporting && (
        <UpgradePrompt feature="Advanced Reporting" />
      )}
    </div>
  );
}
```

---

## Sales & Delivery Automation {#sales-automation}

### Workflow

```
1. User visits marketing website
   ↓
2. User selects plan and pays (Stripe)
   ↓
3. Payment webhook triggers background job
   ↓
4. Background job provisions tenant:
   - Create tenant record in database
   - Generate subdomain
   - Set up Auth0 organization
   - Create first admin user
   - Initialize default data
   - Send welcome email
   ↓
5. User receives email with login link
   ↓
6. User logs in to company-name.product-name.ca
```

### Implementation

**Payment Webhook Handler**:

```typescript
// payments/stripe-webhook.controller.ts
@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    private readonly tenantProvisioningService: TenantProvisioningService
  ) {}

  @Post()
  async handleWebhook(@Body() event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Extract customer and plan info
      const customerId = session.customer;
      const planId = session.metadata.planId;
      const companyName = session.metadata.companyName;
      const email = session.customer_details.email;

      // Trigger async provisioning
      await this.tenantProvisioningService.provisionTenant({
        customerId,
        planId,
        companyName,
        adminEmail: email
      });
    }

    return { received: true };
  }
}
```

**Tenant Provisioning Service**:

```typescript
@Injectable()
export class TenantProvisioningService {
  constructor(
    private prisma: PrismaService,
    private auth0: Auth0Service,
    private emailService: EmailService,
    private queueService: QueueService
  ) {}

  async provisionTenant(data: ProvisioningData): Promise<void> {
    // Add to queue for async processing
    await this.queueService.add('tenant-provisioning', data);
  }

  @Process('tenant-provisioning')
  async processTenantProvisioning(job: Job<ProvisioningData>) {
    const { customerId, planId, companyName, adminEmail } = job.data;

    try {
      // 1. Create tenant record
      const subdomain = this.generateSubdomain(companyName);
      const tenant = await this.prisma.tenant.create({
        data: {
          subdomain,
          plan: planId,
          stripeCustomerId: customerId,
          status: 'provisioning'
        }
      });

      // 2. Set up Auth0 organization
      const auth0Org = await this.auth0.createOrganization({
        name: companyName,
        display_name: companyName,
        metadata: { tenantId: tenant.id }
      });

      // 3. Create first admin user
      const user = await this.auth0.createUser({
        email: adminEmail,
        email_verified: false,
        app_metadata: {
          tenantId: tenant.id,
          role: 'admin'
        }
      });

      // 4. Add user to organization
      await this.auth0.addUserToOrganization(auth0Org.id, user.user_id);

      // 5. Initialize default data
      await this.initializeDefaultData(tenant.id);

      // 6. Update tenant status
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          status: 'active',
          auth0OrganizationId: auth0Org.id
        }
      });

      // 7. Send welcome email
      await this.emailService.sendWelcomeEmail({
        to: adminEmail,
        companyName,
        loginUrl: `https://${subdomain}.product-name.ca`,
        tempPassword: user.password // If generated
      });

      console.log(`Tenant provisioned: ${tenant.id}`);
    } catch (error) {
      console.error('Provisioning failed:', error);
      // Handle rollback and notify admin
      throw error;
    }
  }

  private generateSubdomain(companyName: string): string {
    // company-name.product-name.ca
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async initializeDefaultData(tenantId: string): Promise<void> {
    // Create default settings, templates, etc.
    await this.prisma.setting.create({
      data: {
        tenantId,
        theme: 'light',
        timezone: 'America/Toronto'
      }
    });
  }
}
```

**Queue Setup (BullMQ)**:

```typescript
// queue/queue.module.ts
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
      }
    }),
    BullModule.registerQueue({
      name: 'tenant-provisioning'
    })
  ]
})
export class QueueModule {}
```

---

## Custom Domains {#custom-domains}

### Pattern

**Format**: `company-name.product-name.ca`

**Examples**:
- `mccardlebros.easygap.ca`
- `acme-corp.easygap.ca`
- `startup-inc.easygap.ca`

### DNS Configuration

**Wildcard DNS Record**:

```
*.product-name.ca  →  CNAME  →  your-app.railway.app
```

This allows any subdomain to resolve to your application.

### Implementation

**Next.js Middleware** (for tenant routing):

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Extract subdomain
  const subdomain = hostname.split('.')[0];

  // Skip for www, api, or main domain
  if (subdomain === 'www' || subdomain === 'api' || !subdomain.includes('.')) {
    return NextResponse.next();
  }

  // Add tenant to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', subdomain);

  return NextResponse.rewrite(request.url, {
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Accessing Tenant in Server Components**:

```typescript
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const headersList = headers();
  const tenantId = headersList.get('x-tenant-id');

  // Fetch tenant-specific data
  const tenant = await getTenant(tenantId);

  return <Dashboard tenant={tenant} />;
}
```

### SSL/HTTPS

**Railway**: Automatically provides SSL for wildcard subdomains
**Vercel**: Automatically provides SSL for wildcard subdomains

No additional configuration needed!

---

## Rollback & Cleanup

### Failed Provisioning

If provisioning fails:
1. Log error details
2. Rollback database changes (use transactions)
3. Clean up Auth0 resources
4. Notify admin team
5. Offer refund if payment was collected

```typescript
async processTenantProvisioning(job: Job<ProvisioningData>) {
  const transaction = await this.prisma.$begin();

  try {
    // ... provisioning steps
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    // Clean up external resources
    if (auth0Org) {
      await this.auth0.deleteOrganization(auth0Org.id);
    }

    // Notify admin
    await this.notifyProvisioningFailure(job.data, error);

    throw error;
  }
}
```

---

## Monitoring & Alerts {#monitoring}

### Key Metrics to Monitor

- Provisioning success rate
- Provisioning time (should be < 2 minutes)
- Failed provisioning attempts
- Tenant count by plan
- Resource usage per tenant

### Alerts

- Alert when provisioning fails
- Alert when provisioning takes > 5 minutes
- Alert when tenant approaches plan limits

---

## Cost Optimization Tips {#cost-optimization}

1. **Shared Database**: Use multi-tenancy instead of separate databases
2. **Connection Pooling**: Reuse database connections (PgBouncer)
3. **Caching**: Cache tenant settings, feature flags (Redis)
4. **Lazy Provisioning**: Only provision resources when first needed
5. **Resource Limits**: Set limits per plan (storage, API calls, users)
6. **Cleanup**: Delete abandoned/inactive tenants after grace period

---

## Security Considerations {#security}

### Tenant Isolation

**Must Have**:
- Row-level security (RLS) in database
- Tenant validation on every request
- Separate Auth0 organizations per tenant
- Feature flag enforcement

**Never**:
- Trust client-sent tenant ID without validation
- Mix tenant data in responses
- Allow cross-tenant resource access

### Data Protection

- All tenant data encrypted at rest
- All API communications over HTTPS
- Regular backups per tenant
- GDPR-compliant data deletion

---

## Resources

- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma Multi-Tenancy](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [Auth0 Organizations](https://auth0.com/docs/manage-users/organizations)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## Related Documentation

**Prerequisites (Read First)**:
- [Security & Privacy](../rules/security-privacy.md) - Data isolation, GDPR compliance
- [Database Optimization](../03-architecture/database-optimization.md) - Multi-tenant indexing

**SaaS Essentials (Read Together)**:
- [Subscription Billing](./subscription-billing.md) - Plan management, feature gating
- [User Management & RBAC](./user-management-rbac.md) - Roles, permissions matrix
- [User Onboarding](./user-onboarding.md) - Tenant setup wizards
- [Internationalization](./internationalization.md) - Multi-region deployment

**Implementation Guides**:
- [API Design](../rules/api-design.md) - Multi-tenant API patterns
- [Analytics](../08-analytics/analytics.md) - Tenant-level vs user-level tracking

**Architecture**:
- [Caching Strategy](../03-architecture/caching-strategy.md) - Tenant-aware caching
- [Load Balancing](../03-architecture/load-balancing.md) - Tenant routing
- [Microservices](../03-architecture/microservices.md) - Service isolation

**Practical Resources**:
- [API Endpoint Template](../templates/api-endpoint-template.ts) - Multi-tenant API boilerplate
- [Database Migration Template](../templates/database-migration-template.sql) - RLS setup

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All SaaS Docs](./)
