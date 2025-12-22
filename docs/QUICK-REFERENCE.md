# Quick Reference - Claude Code Documentation

> **Fast lookup for critical requirements, patterns, and standards**
>
> **When to use this:** Check here FIRST before reading full documentation files. 90% of quick questions answered here.
>
> **When to use full docs:** Need detailed implementation examples, edge cases, or comprehensive guides.

---

## Quick Navigation

[Subscription & Billing](#subscription--billing) | [SaaS Architecture](#saas-architecture) | [User Management & RBAC](#user-management--rbac) | [Testing](#testing) | [Security & Privacy](#security--privacy) | [PR Approval](#pr-approval) | [Performance](#performance) | [Technology Stack](#technology-stack) | [Analytics](#analytics) | [User Onboarding](#user-onboarding)

---

## Subscription & Billing

**Critical Requirements:**
- **Stripe Integration**: Use Stripe SDK with webhook verification
- **Subscription Plans**: Define plans in code with feature limits
- **Webhook Handling**: MUST verify webhook signatures and handle all event types
- **Feature Gating**: Enforce plan limits server-side
- **Edge Cases**: Handle payment failures, cancellations, downgrades gracefully

**Quick Example:**
```typescript
// GOOD - Feature gating with subscription check
if (user.subscription.plan !== 'ENTERPRISE' && projectCount >= planLimits.projects) {
  throw new Error('Upgrade to create more projects');
}

// BAD - No subscription check
await createProject(); // Allows unlimited projects
```

**Key Topics:**
- Stripe customer & subscription creation
- Webhook event handling (payment_succeeded, subscription_updated, etc.)
- Plan upgrades/downgrades with prorations
- Usage-based billing for API calls, storage
- Customer portal for self-service billing

**Full Documentation**: [subscription-billing.md](./09-saas-specific/subscription-billing.md#tldr)

---

## SaaS Architecture

**Critical Requirements:**
- **Multi-Tenancy**: Use single database with row-level security (RLS)
- **Feature Flags**: ALL new features behind flags for gradual rollout
- **Tenant Isolation**: MUST enforce tenant boundaries in all queries
- **Cost Optimization**: Shared infrastructure with proper isolation
- **Sales Automation**: Auto-provision on signup, auto-deactivate on cancellation

**Quick Example:**
```typescript
// GOOD - Row-level security with tenant isolation
const projects = await db.project.findMany({
  where: { tenantId: req.tenantId }
});

// BAD - No tenant isolation
const projects = await db.project.findMany();
```

**Key Topics:**
- Multi-tenant database design with RLS
- Feature flags (LaunchDarkly/Flagsmith integration)
- Custom domains for white-label
- Sales automation workflows
- Per-tenant metrics and monitoring

**Full Documentation**: [saas-architecture.md](./09-saas-specific/saas-architecture.md#tldr)

---

## User Management & RBAC

**Critical Requirements:**
- **Hierarchical Roles**: Super Admin → Tenant Admin → Manager → Member → Viewer
- **Permission Matrix**: Define granular permissions per role
- **Server-Side Checks**: NEVER trust client-side role checks, always verify on backend
- **Invitation Flow**: Secure email-based invitations with expiry
- **Offboarding**: Remove access immediately, transfer ownership before deletion

**Quick Example:**
```typescript
// GOOD - Backend permission check
@RequirePermission('projects:delete')
async deleteProject(projectId: string, userId: string) {
  await checkPermission(userId, 'projects:delete');
  return db.project.delete({ where: { id: projectId } });
}

// BAD - Only client-side check
if (user.role === 'admin') {  // Easily bypassed
  await deleteProject();
}
```

**Key Topics:**
- Role hierarchy and permission matrix
- Server-side guards, decorators, middleware
- User invitation with token expiry
- Resource ownership (ABAC patterns)
- Role change workflows

**Full Documentation**: [user-management-rbac.md](./09-saas-specific/user-management-rbac.md#tldr)

---

## Testing

**Critical Requirements:**
- **Test Coverage**: 80%+ unit test coverage minimum
- **Before Merge**: ALL unit tests MUST pass before merging to dev
- **Integration Tests**: Required for SIT promotion
- **UAT**: Manual acceptance testing before production
- **CI/CD**: Automated testing in all pipelines

**Quick Example:**
```typescript
// GOOD - Comprehensive test with mocks
describe('UserService', () => {
  it('should create user and send welcome email', async () => {
    const mockEmailService = { send: jest.fn() };
    const user = await createUser(data, mockEmailService);
    expect(user).toBeDefined();
    expect(mockEmailService.send).toHaveBeenCalledWith(...);
  });
});

// BAD - No test coverage
// (Just ship it and hope it works)
```

**Key Topics:**
- Unit testing with Jest, React Testing Library
- Integration testing for API endpoints, database
- UAT checklist and manual testing
- Test data factories and fixtures
- CI/CD pipeline configuration

**Full Documentation**: [testing.md](./rules/testing.md#tldr)

---

## Security & Privacy

**Critical Requirements:**
- **GDPR**: ALL PII must be encrypted, anonymizable, deletable
- **Encryption**: Data encrypted at rest (AES-256) and in transit (TLS 1.3+)
- **Authentication**: JWT/OAuth2, NEVER passwords in plaintext
- **Attack Prevention**: CSRF tokens, XSS protection, SQL injection prevention
- **Secrets**: NEVER commit secrets, use environment variables

**Quick Example:**
```typescript
// GOOD - Encrypted PII, secure authentication
const hashedPassword = await bcrypt.hash(password, 12);
await db.user.create({
  email: encrypt(email), // PII encrypted
  password: hashedPassword
});

// BAD - Plaintext PII, insecure
await db.user.create({
  email, // PII not encrypted!
  password // Password not hashed!
});
```

**Key Topics:**
- GDPR compliance (PII handling, right to deletion, data portability)
- Encryption standards (at-rest, in-transit)
- Authentication patterns (JWT, OAuth2, session management)
- OWASP Top 10 protection (XSS, CSRF, SQL injection)
- Secrets management with environment variables

**Full Documentation**: [security-privacy.md](./rules/security-privacy.md#tldr)

---

## PR Approval

**Critical Requirements:**
- **NEVER merge without approval**: Claude MUST wait for explicit human approval ("merge it", "yes", "go ahead")
- **ALL checks must pass FIRST**: NEVER ask for approval if ANY check is failing or pending
- **API usage optimization**: Wait 90s after PR creation, then poll every 45s (see [API Optimization](./rules/pr-approval.md#api-optimization))
- **No exceptions**: Even if user seems impatient, NEVER skip the approval step
- **Report status clearly**: Tell user what checks passed/failed before asking

**Quick Example:**
```bash
# BAD - Merges without asking
gh pr merge 5 --squash  # FORBIDDEN!

# GOOD - Waits for approval
# 1. Create PR and wait for CI to start
gh pr create ...
sleep 90  # Give CI time to start

# 2. Check all tests pass (poll every 45s if needed)
gh pr checks 5

# 3. Report to user: "All checks passed. Ready to merge?"
# 4. Wait for explicit "yes"/"merge it"
# 5. Only then: gh pr merge 5 --squash
```

**Key Rules:**
1. Wait for ALL checks to pass
2. Report status to user
3. Ask: "Would you like me to merge PR #X?"
4. Wait for explicit approval
5. Only then execute merge

**No Exceptions. No Shortcuts. No Auto-Merge.**

**Full Documentation**: [pr-approval.md](./rules/pr-approval.md#tldr)

---

## Performance

**Critical Requirements:**
- **Core Web Vitals**: LCP < 2.5s, INP < 200ms, CLS < 0.1
- **Lighthouse CI**: Automated testing on every PR, must score 90+
- **Image Optimization**: WebP/AVIF, lazy loading, proper sizing
- **Code Splitting**: Dynamic imports, route-based splitting
- **Real User Monitoring**: Track actual user experience with Better Stack

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

**Core Web Vitals Targets:**
| Metric | Good | Poor |
|--------|------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | > 0.25 |

**Key Topics:**
- Lighthouse CI setup and enforcement
- Image optimization strategies (WebP, AVIF, lazy loading)
- Code splitting and dynamic imports
- Caching strategies (CDN, service workers)
- Real user monitoring with Better Stack

**Full Documentation**: [performance.md](./03-architecture/performance.md#tldr)

---

## Technology Stack

**Critical Requirements:**
- **Always use latest stable versions** at project start
- **Official docs first**: NEVER search web before checking official documentation
- **Proven technologies only**: Stick to established, well-maintained libraries
- **TypeScript everywhere**: 100% TypeScript for type safety
- **Update dependencies quarterly**: Keep dependencies current

**Quick Stack Reference:**
- **Web**: Next.js 15.x (React, TypeScript)
- **Mobile**: Expo (React Native, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth0 / Clerk
- **Payments**: Stripe
- **Hosting**: Railway / Vercel

**Version Policy:**
```bash
# GOOD - Use latest stable at project start
npx create-next-app@latest my-project

# BAD - Use outdated version
npx create-next-app@13.0.0 my-project
```

**Key Topics:**
- Approved technology stack for web, mobile, backend
- Version policy and upgrade strategy
- Technology decision process
- Documentation-first approach
- Quarterly dependency updates

**Full Documentation**: [technology-stack.md](./rules/technology-stack.md#tldr)

---

## Analytics

**Critical Requirements:**
- **Two tools, two purposes**: Plausible for marketing site, PostHog for SaaS app
- **Privacy-first**: GDPR compliant, cookieless analytics
- **Track SaaS events**: User actions, feature usage, conversion funnels
- **Session replay**: Record user sessions for debugging and UX improvement
- **Feature flags**: A/B testing and gradual rollouts

**Quick Example:**
```typescript
// GOOD - Track SaaS product events with PostHog
posthog.capture('project_created', {
  plan: user.subscription.plan,
  project_count: user.projects.length,
  team_size: user.team.members.length
});

// GOOD - Marketing site with Plausible (auto-tracks page views)
<Script src="https://plausible.io/js/script.js" data-domain="yourapp.com" />
```

**Tool Comparison:**
| Feature | Plausible | PostHog |
|---------|-----------|---------|
| **Use Case** | Marketing site | SaaS product |
| **Page views** | | |
| **Custom events** | Limited | Unlimited |
| **Session replay** | | |
| **Feature flags** | | |
| **A/B testing** | | |
| **Cost** | $9-19/mo | Free tier → $450/mo |

**Key Topics:**
- Plausible setup for marketing sites
- PostHog setup for SaaS product analytics
- Custom event tracking and taxonomy
- Session replay for debugging
- A/B testing and feature flags

**Full Documentation**: [analytics.md](./08-analytics/analytics.md#tldr)

---

## User Onboarding

**Critical Requirements:**
- **Welcome wizard**: Multi-step onboarding for complex setup
- **Progress tracking**: Show completion percentage, save progress
- **Sample data**: Pre-populate with examples to show product value
- **Interactive tutorials**: Tooltips, walkthroughs, product tours
- **Completion checklist**: Track onboarding tasks, encourage completion

**Quick Example:**
```typescript
// GOOD - Multi-step wizard with progress tracking
const wizard = {
  steps: ['welcome', 'profile', 'team', 'integration', 'first_project'],
  current: 2,
  completed: ['welcome', 'profile'],
  progress: 40, // 2/5 steps
  canSkip: ['team', 'integration'] // Optional steps
};

// Generate sample data to show value immediately
await createSampleProject(user);
```

**Key Patterns:**
| Pattern | Use When | Completion Goal |
|---------|----------|-----------------|
| Welcome Wizard | Complex setup | 60%+ |
| Interactive Tutorial | Feature-rich UI | 70%+ |
| Checklist | Ongoing tasks | 80%+ |
| Email Sequence | Multi-day activation | 40%+ open rate |

**Key Topics:**
- Multi-step wizard implementation
- Progress tracking and state persistence
- Sample data generation strategies
- Interactive tooltips and product tours
- Email sequences for activation
- Checklist patterns for task completion
- Analytics for optimization

**Full Documentation**: [user-onboarding.md](./09-saas-specific/user-onboarding.md#tldr)

---

## Other Important Rules

### API Design
- **ALL APIs MUST be versioned**: `/api/v1/resource` format
- **Standard response**: `{ success, data/error, meta }`
- **RESTful design**: GET/POST/PUT/DELETE with proper status codes
- **OpenAPI/Swagger**: Document all endpoints
[api-design.md](./rules/api-design.md#api-versioning)

### UI Standards
- **ALL UIs MUST be responsive**: Mobile < 640px, Tablet 640-1024px, Desktop > 1024px
- **Touch targets**: Minimum 44x44px on mobile
- **Accessibility**: WCAG 2.2 Level AA compliance
[ui-standards.md](./rules/ui-standards.md#responsive-design)

### Git Workflow
- **Feature branches**: Format `<issue-number>-<description>` from `dev`
- **Protected branches**: `main`, `prod`, `sit`, `dev` - never push directly
- **Merge strategy**: Squash and merge for clean history
- **Conventional commits**: `feat:`, `fix:`, `docs:` format
[git-workflow.md](./rules/git-workflow.md#tldr)

### Code Standards
- **Linting**: 0 lint errors, 0 warnings
- **Formatting**: Prettier with 2-space indentation
- **Pre-commit hooks**: Husky for automated checks
- **TypeScript strict mode**: Enabled
[code-standards.md](./rules/code-standards.md)

### Accessibility
- **WCAG 2.2 Level AA**: All visual changes must comply
- **Keyboard navigation**: All interactive elements accessible
- **Screen readers**: Proper ARIA labels and semantic HTML
- **Color contrast**: 4.5:1 minimum for text
[accessibility.md](./rules/accessibility.md)

---

## Complete Documentation Index

For comprehensive guides, edge cases, and detailed implementation examples:

**Getting Started:**
- [Project Overview](./01-getting-started/overview.md)
- [Architecture](./01-getting-started/architecture.md)
- [Setup Guide](./01-getting-started/setup.md)

**Rules (CRITICAL):**
- [API Design](./rules/api-design.md#tldr) ⭐
- [UI Standards](./rules/ui-standards.md#tldr) ⭐
- [Security & Privacy](./rules/security-privacy.md#tldr) ⭐
- [Testing](./rules/testing.md#tldr) ⭐
- [PR Approval](./rules/pr-approval.md#tldr) ⭐
- [Git Workflow](./rules/git-workflow.md#tldr)
- [Code Standards](./rules/code-standards.md)
- [Accessibility](./rules/accessibility.md)

**SaaS-Specific:**
- [SaaS Architecture](./09-saas-specific/saas-architecture.md#tldr) ⭐
- [Subscription & Billing](./09-saas-specific/subscription-billing.md#tldr) ⭐
- [User Management & RBAC](./09-saas-specific/user-management-rbac.md#tldr) ⭐
- [User Onboarding](./09-saas-specific/user-onboarding.md#tldr) ⭐
- [Internationalization](./09-saas-specific/internationalization.md)

**Architecture:**
- [Performance](./03-architecture/performance.md#tldr) ⭐
- [Caching Strategy](./03-architecture/caching-strategy.md)
- [Database Optimization](./03-architecture/database-optimization.md)

**Analytics:**
- [Analytics & Product Insights](./08-analytics/analytics.md#tldr) ⭐

**Operations:**
- [Monitoring](./06-operations/monitoring.md)
- [Incident Management](./06-operations/incident-management.md)
- [Security Testing](./06-operations/security-testing.md)

= Has TL;DR section for quick reference

---

## How to Use This Quick Reference

**For Humans:**
1. **Quick lookup**: Ctrl+F to find keywords
2. **Scan critical requirements**: Each section lists must-follow rules
3. **Copy code examples**: GOOD vs BAD patterns
4. **Deep dive when needed**: Click links to full documentation

**For AI (Claude Code):**
1. **Read this file FIRST** before accessing other documentation
2. **90% of queries answered** from this quick reference (500 lines vs 8,000+ lines)
3. **Token savings**: ~94% fewer tokens for common questions
4. **Use anchor links**: When detail needed, jump to specific sections in full docs

**Token Efficiency Example:**
- **Before**: Read 10 files × 800 lines avg = 8,000 lines
- **After**: Read QUICK-REFERENCE.md = 500 lines
- **Savings**: 7,500 lines (94%)

---

## Maintenance

**When to update:**
- Add new critical requirement to any documented file → Update corresponding section here
- Create new major documentation file → Add new section to this quick reference
- Change core pattern or standard → Update relevant section

**Keep it concise:**
- Max 2-3 critical requirements per topic
- Max 1 code example per topic
- Link to full docs for comprehensive coverage

---

**Last Updated**: 2025-12-22
**Maintained by**: Engineering Team
**Questions?**: See full documentation links above or ask in #engineering
