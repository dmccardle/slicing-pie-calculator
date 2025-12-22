# System Architecture

## High-Level Architecture

[Provide a text-based diagram or description of the overall system architecture]

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │─────▶│   API/BFF   │─────▶│  Database   │
│  (Web/App)  │◀─────│   Server    │◀─────│             │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  External   │
                     │  Services   │
                     └─────────────┘
```

### Architecture Pattern

**Pattern**: [PATTERN_NAME] (e.g., Monolithic, Microservices, Serverless, Monorepo)

**Rationale**: [Why this pattern was chosen]

## System Components

### 1. Frontend Application

**Technology**: [TECH] (e.g., Next.js, Expo)

**Responsibilities**:
- User interface rendering
- Client-side state management
- API communication
- User authentication flow
- Input validation

**Key Directories**:
```
/app or /src
├── components/      # Reusable UI components
├── pages/ or app/   # Route pages
├── hooks/           # Custom React hooks
├── lib/            # Utilities and helpers
├── styles/         # Global styles and theme
└── types/          # TypeScript types
```

### 2. Backend/API Layer

**Technology**: [TECH] (e.g., Next.js API Routes, Express, tRPC)

**Responsibilities**:
- Business logic
- Data validation
- Database operations
- External API integration
- Authentication and authorization

**Key Directories**:
```
/api or /src/api
├── routes/         # API endpoints
├── controllers/    # Business logic
├── services/       # Service layer
├── middleware/     # Auth, logging, etc.
└── validators/     # Request validation
```

### 3. Database Layer

**Technology**: [DATABASE] (e.g., PostgreSQL with Prisma)

**Responsibilities**:
- Data persistence
- Data relationships
- Query optimization
- Migrations

**Schema Organization**:
```
/prisma or /db
├── schema.prisma   # Database schema
├── migrations/     # Migration files
└── seeds/          # Seed data
```

### 4. External Services

List of external services and their purpose:

- **[SERVICE_1]**: [PURPOSE] (e.g., Stripe for payments)
- **[SERVICE_2]**: [PURPOSE] (e.g., SendGrid for emails)
- **[SERVICE_3]**: [PURPOSE] (e.g., AWS S3 for file storage)

## Data Flow

### Read Operation

```
1. User requests data
   ↓
2. Client sends API request
   ↓
3. API validates request & auth token
   ↓
4. API queries database
   ↓
5. Database returns data
   ↓
6. API transforms/formats data
   ↓
7. Client receives and displays data
```

### Write Operation

```
1. User submits data
   ↓
2. Client validates input
   ↓
3. Client sends API request
   ↓
4. API validates request, auth, & data
   ↓
5. API processes business logic
   ↓
6. API writes to database
   ↓
7. Database confirms write
   ↓
8. API returns success/error
   ↓
9. Client updates UI
```

## Design Patterns

### Frontend Patterns

- **Component Composition**: [How components are structured]
- **State Management**: [Pattern used] (e.g., Server State with React Query, Client State with Zustand)
- **Routing**: [File-based or declarative]
- **Error Boundaries**: [Error handling strategy]

### Backend Patterns

- **API Design**: [REST/GraphQL/tRPC principles]
- **Service Layer**: [Separation of concerns]
- **Repository Pattern**: [If used for data access]
- **Dependency Injection**: [If used]

### Database Patterns

- **Migration Strategy**: [How migrations are handled]
- **Indexing Strategy**: [What's indexed and why]
- **Relationships**: [How data is related]
- **Soft Deletes**: [Used or hard deletes?]

## Authentication & Authorization

### Authentication Flow

```
1. User enters credentials
   ↓
2. Client sends to auth endpoint
   ↓
3. Server validates credentials
   ↓
4. Server generates JWT/session token
   ↓
5. Client stores token (httpOnly cookie / secure storage)
   ↓
6. Client includes token in subsequent requests
```

### Authorization Model

**Model**: [RBAC / ABAC / Custom]

**Roles**:
- `[ROLE_1]`: [Permissions]
- `[ROLE_2]`: [Permissions]
- `[ROLE_3]`: [Permissions]

**Implementation**:
- Middleware: `[MIDDLEWARE_FILE]`
- Route protection: `[HOW_ROUTES_ARE_PROTECTED]`

## Caching Strategy

### What We Cache

- **[CACHE_TARGET_1]**: [Where and for how long]
- **[CACHE_TARGET_2]**: [Where and for how long]
- **[CACHE_TARGET_3]**: [Where and for how long]

### Cache Layers

1. **Client-side**: [Strategy] (e.g., React Query with 5min stale time)
2. **CDN**: [Strategy] (e.g., Vercel Edge Caching)
3. **Server-side**: [Strategy] (e.g., Redis with TTL)
4. **Database**: [Strategy] (e.g., Query result caching)

### Cache Invalidation

[How and when caches are invalidated]

## Error Handling

### Error Categories

1. **Validation Errors**: User input issues
2. **Authentication Errors**: Auth failures
3. **Authorization Errors**: Permission issues
4. **Business Logic Errors**: Domain-specific failures
5. **External Service Errors**: Third-party API failures
6. **System Errors**: Unexpected failures

### Error Handling Strategy

- **Client-side**: Error boundaries, toast notifications, fallback UI
- **Server-side**: Structured error responses, logging, monitoring
- **Database**: Transaction rollbacks, constraint violations

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": {...},
    "timestamp": "ISO-8601"
  }
}
```

## Logging & Monitoring

### Logging Levels

- **ERROR**: Application errors and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging (dev only)

### What We Log

- API requests/responses
- Authentication attempts
- Database queries (in dev)
- External service calls
- Errors and exceptions
- **Never log**: Passwords, tokens, PII

### Monitoring

- **APM**: [TOOL] (e.g., Sentry, Datadog)
- **Uptime**: [TOOL] (e.g., UptimeRobot)
- **Metrics**: [TOOL] (e.g., PostHog, Mixpanel)

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: [How implemented]
2. **Lazy Loading**: [What's lazy loaded]
3. **Image Optimization**: [Strategy] (e.g., Next.js Image component)
4. **Bundle Size**: [Target size and monitoring]
5. **API Response Time**: [Target < Xms]
6. **Database Queries**: [N+1 prevention, indexing]

### Performance Budgets

- **Initial Load**: < [X]ms
- **Largest Contentful Paint**: < [X]ms
- **Time to Interactive**: < [X]ms
- **Bundle Size**: < [X]kb

## Scalability

### Current Scale

- **Users**: [NUMBER]
- **Requests/day**: [NUMBER]
- **Database Size**: [SIZE]

### Scaling Strategy

- **Horizontal Scaling**: [How to add more instances]
- **Database Scaling**: [Read replicas, sharding, etc.]
- **Caching**: [Strategy for reducing DB load]
- **CDN**: [Static asset distribution]

## Security Architecture

### Security Layers

1. **Transport Security**: HTTPS/TLS everywhere
2. **Input Validation**: All user input validated
3. **Authentication**: [METHOD] (e.g., JWT, OAuth)
4. **Authorization**: [METHOD] (e.g., RBAC)
5. **Data Encryption**: At rest and in transit
6. **API Security**: Rate limiting, CORS, CSP

### Security Best Practices

- All PII is encrypted
- Secrets in environment variables (never committed)
- Regular dependency updates
- Security headers configured
- OWASP Top 10 protections

See `docs/rules/security-privacy.md` for detailed security requirements.

## Deployment Architecture

### Environments

```
Development (dev) → Testing (sit) → UAT → Production (prod)
                      ↓               ↓           ↓
                   Unit Tests    Integration  End-to-End
                                    Tests       Tests
```

### Infrastructure

- **Hosting**: [PLATFORM] (e.g., Railway, Vercel)
- **Database Hosting**: [PLATFORM]
- **File Storage**: [PLATFORM]
- **CDN**: [PLATFORM]

### Environment Variables

Critical environment variables (see `.env.example`):
- `DATABASE_URL`
- `API_KEY`
- `JWT_SECRET`
- [Add others]

## Dependencies

### Critical Dependencies

- **[PACKAGE_1]**: [VERSION] - [PURPOSE]
- **[PACKAGE_2]**: [VERSION] - [PURPOSE]
- **[PACKAGE_3]**: [VERSION] - [PURPOSE]

### Dependency Management

- Lock files committed: Yes
- Automated updates: [TOOL] (e.g., Dependabot)
- Update frequency: [FREQUENCY]
- Security patches: Immediate

## Future Architecture Considerations

[Planned architectural changes or considerations for future scale]

- [CONSIDERATION_1]
- [CONSIDERATION_2]
- [CONSIDERATION_3]

## Architectural Decision Records (ADRs)

Document major architectural decisions:

### ADR-001: [DECISION_TITLE]

- **Date**: [DATE]
- **Status**: Accepted
- **Context**: [Why this decision was needed]
- **Decision**: [What was decided]
- **Consequences**: [Impact of the decision]

### ADR-002: [DECISION_TITLE]

[Continue as needed...]

## Diagrams

[Add ASCII diagrams or links to external diagrams (Mermaid, draw.io, etc.)]

## Additional Resources

- [LINK_TO_EXTERNAL_DOCS]
- [LINK_TO_DESIGN_DOCS]
- [LINK_TO_TECHNICAL_SPECS]

---

## Related Documentation

**Next Steps**:
- [Architecture](./architecture.md) - System design and patterns
- [Setup Guide](./setup.md) - Installation and configuration

**Core Rules**:
- [API Design](../rules/api-design.md) - API standards and versioning
- [UI Standards](../rules/ui-standards.md) - Responsive design requirements
- [Security & Privacy](../rules/security-privacy.md) - Security requirements

**SaaS Essentials**:
- [SaaS Architecture](../09-saas-specific/saas-architecture.md) - Multi-tenancy patterns
- [Subscription Billing](../09-saas-specific/subscription-billing.md) - Stripe integration
- [User Management & RBAC](../09-saas-specific/user-management-rbac.md) - Permissions

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

