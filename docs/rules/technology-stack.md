# Technology Stack & Version Policy

## Overview

This document defines our preferred technologies and version management policies.

## Core Principles {#core-principles}

1. **Always use the latest stable version** at the start of a new project
2. **Prefer official documentation** - Always reference official docs first before searching the web
3. **Use proven technologies** - Stick to established, well-maintained libraries

---

## Documentation-First Approach {#docs-first}

**IMPORTANT**: When learning how to implement any technology below, **always reference the official documentation links first** before searching the web. Official docs are more accurate, up-to-date, and authoritative.

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Always use latest stable versions** at project start (see [Version Policy](#version-policy))
- **Official docs first**: NEVER search web before checking official documentation (see [Documentation-First](#docs-first))
- **Proven technologies only**: Stick to established, well-maintained libraries (see [Core Principles](#core-principles))
- **TypeScript everywhere**: 100% TypeScript for type safety (see [Language](#language))
- **Update dependencies quarterly**: Keep dependencies current (see [Upgrading Strategy](#upgrading))

**Quick Stack Reference:**
- **Web**: Next.js 15.x (React, TypeScript)
- **Mobile**: Expo (React Native, TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth0 / Clerk
- **Payments**: Stripe
- **Hosting**: Railway / Vercel

**Key Sections:**
- [Technology Stack](#tech-stack) - Complete approved technology list
- [Version Policy](#version-policy) - When and how to upgrade
- [Technology Decision Process](#decision-process) - How to evaluate new tech
- [Upgrading Strategy](#upgrading) - Safe upgrade procedures

---

## Technology Stack {#tech-stack}

### Web Applications

**Framework**: Next.js

**Official Docs**: https://nextjs.org/docs

**Why Next.js**:
- Full-stack React framework
- Excellent performance (Server Components, SSR, SSG)
- Built-in routing and API routes
- Great developer experience
- Strong ecosystem and community
- Vercel backing and support

**Current Version**: Use latest stable (currently 15.x)

```bash
npx create-next-app@latest my-project
```

**Key Documentation Sections**:
- [App Router](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### Mobile Applications

**Framework**: Expo

**Official Docs**: https://docs.expo.dev/

**Why Expo**:
- React Native with better DX
- Over-the-air updates
- Easy build and deployment
- Great tooling and debugging
- Cross-platform (iOS + Android)
- Large plugin ecosystem

**Current Version**: Use latest SDK (currently 52.x)

```bash
npx create-expo-app@latest my-mobile-app
```

**Key Documentation Sections**:
- [Getting Started](https://docs.expo.dev/get-started/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

**Build & Distribution**:
- **EAS (Expo Application Services)**: https://docs.expo.dev/eas/
- **Google Play Developer**: https://developer.android.com/distribute
- **Apple Developer**: https://developer.apple.com/documentation

**React Native Core**:
- **React Native Docs**: https://reactnative.dev/docs/getting-started

### UI & Styling

#### Component Library

**Library**: shadcn/ui

**Official Docs**: https://ui.shadcn.com/docs

**Why shadcn/ui**:
- Copy/paste components (full control)
- Built on Radix UI (accessible)
- Customizable with Tailwind
- No package bloat
- TypeScript support

**Key Documentation Sections**:
- [Installation](https://ui.shadcn.com/docs/installation)
- [Components](https://ui.shadcn.com/docs/components)
- [Theming](https://ui.shadcn.com/docs/theming)

#### Styling

**Framework**: Tailwind CSS

**Official Docs**: https://tailwindcss.com/docs

**Why Tailwind CSS**:
- Utility-first CSS
- Highly customizable
- Great performance (purges unused CSS)
- Excellent developer experience
- Works great with Next.js

**Key Documentation Sections**:
- [Installation](https://tailwindcss.com/docs/installation)
- [Customization](https://tailwindcss.com/docs/configuration)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)

#### Icons

**Web**: Lucide Icons

**Official Docs**: https://lucide.dev/icons/

**Why Lucide**:
- Beautiful, consistent icons
- Lightweight
- React component library
- Fully customizable

```bash
npm install lucide-react
```

**Mobile**: Expo Icons

**Official Docs**: https://icons.expo.fyi/Index

**Why Expo Icons**:
- Built-in with Expo
- Multiple icon sets (Ionicons, MaterialIcons, FontAwesome, etc.)
- No additional packages needed

### Deployment

**Platform**: Railway

**Official Docs**: https://docs.railway.com/

**Why Railway**:
- Simple configuration
- Supports multiple tech stacks
- Automatic HTTPS
- Easy environment management
- Good performance
- Reasonable pricing with subscription
- GitHub integration

**Key Documentation Sections**:
- [Getting Started](https://docs.railway.com/getting-started)
- [Deploy](https://docs.railway.com/deploy/deployments)
- [Environment Variables](https://docs.railway.com/develop/variables)

**Container Platform**: Docker

**Official Docs**: https://docs.docker.com/

**Use Cases**:
- Custom deployment configurations
- Local development environment consistency
- CI/CD pipelines

**Alternatives**:
- Vercel (for Next.js specifically)
- Heroku
- AWS/GCP/Azure (for complex needs)

---

## Language {#language}

**Primary**: TypeScript

**Why TypeScript**:
- Type safety catches bugs early
- Better IDE support and autocomplete
- Easier refactoring
- Self-documenting code
- Industry standard for modern web/mobile

**Version**: Latest stable (5.x+)

**Configuration**: Strict mode enabled (see `docs/rules/code-standards.md`)

---

## Backend

### Backend Framework

**Framework**: NestJS

**Official Docs**: https://docs.nestjs.com/

**Why NestJS**:
- Enterprise-grade Node.js framework
- TypeScript-first with decorators
- Modular architecture
- Excellent for building scalable APIs
- Built-in support for GraphQL, WebSockets, microservices
- Great dependency injection system

```bash
npm i -g @nestjs/cli
nest new project-name
```

**Key Documentation Sections**:
- [First Steps](https://docs.nestjs.com/first-steps)
- [Controllers](https://docs.nestjs.com/controllers)
- [Providers](https://docs.nestjs.com/providers)
- [Modules](https://docs.nestjs.com/modules)
- [Middleware](https://docs.nestjs.com/middleware)

### API Documentation

**Tool**: Swagger/OpenAPI

**Official Docs**: https://docs.nestjs.com/openapi/introduction

**Why Swagger**:
- Auto-generates API documentation
- Interactive API explorer
- Type-safe client generation
- Industry standard
- Built-in NestJS support

**Key Documentation Sections**:
- [OpenAPI (Swagger)](https://docs.nestjs.com/openapi/introduction)
- [CLI Plugin](https://docs.nestjs.com/openapi/cli-plugin)
- [Decorators](https://docs.nestjs.com/openapi/decorators)

## Database

### Database

**Database**: PostgreSQL 16.x

**Official Docs**: https://www.postgresql.org/docs/

**Why PostgreSQL**:
- Robust and battle-tested
- Excellent performance
- Rich feature set (JSON, full-text search, etc.)
- Strong consistency guarantees
- Open source
- ACID compliant

**Key Documentation Sections**:
- [Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [SQL Commands](https://www.postgresql.org/docs/current/sql-commands.html)
- [Data Types](https://www.postgresql.org/docs/current/datatype.html)

### ORM

**ORM**: Prisma

**Official Docs**: https://www.prisma.io/docs/getting-started

**Why Prisma**:
- Type-safe database queries
- Excellent TypeScript integration
- Auto-generated types from schema
- Great migration system
- Intuitive API
- Works perfectly with NestJS

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

**Key Documentation Sections**:
- [Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [CRUD Operations](https://www.prisma.io/docs/concepts/components/prisma-client/crud)
- [NestJS Integration](https://docs.nestjs.com/recipes/prisma)

### Alternatives (Project-Specific)

- **MongoDB**: For document-heavy applications
- **MySQL**: If team has existing expertise
- **SQLite**: For simple/local applications

---

## Frontend Libraries

### UI Framework

**Primary**: React 19.x

**State Management**:
- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand or React Context
- **Forms**: React Hook Form
- **URL State**: Next.js built-in routing

### Styling

**Recommended**:
- Tailwind CSS (utility-first)
- shadcn/ui (component library)

**Alternatives**:
- styled-components (CSS-in-JS)
- CSS Modules (scoped CSS)

```bash
# Tailwind CSS
npx shadcn-ui@latest init
```

### Component Libraries

**Recommended**: shadcn/ui

**Why**:
- Copy/paste components (full control)
- Built on Radix UI (accessible)
- Customizable with Tailwind
- No package bloat

**Alternatives**:
- Material-UI (comprehensive but heavy)
- Chakra UI (good DX)
- Ant Design (enterprise features)

---

## Backend

### API Style

**Recommended**: REST or tRPC

**REST** (traditional):
- Well understood
- Standard HTTP methods
- Easy to cache
- Works with any client

**tRPC** (type-safe):
- End-to-end type safety
- No code generation
- Excellent DX
- Perfect for Next.js full-stack apps

```typescript
// tRPC example
const { data } = trpc.user.getById.useQuery({ id: '123' });
// data is fully typed!
```

### Authentication

**Service**: Auth0

**Official Docs**: https://auth0.com/docs

**Why Auth0**:
- Enterprise-grade authentication
- Supports OAuth, social login, email, passwordless
- Secure by default with best practices
- Excellent user management dashboard
- MFA/2FA built-in
- Comprehensive security features
- Works with NestJS, Next.js, and Expo

**Key Documentation Sections**:
- [Getting Started](https://auth0.com/docs/get-started)
- [NestJS Integration](https://auth0.com/docs/quickstart/backend/nodejs)
- [Next.js Integration](https://auth0.com/docs/quickstart/webapp/nextjs)
- [React Native Integration](https://auth0.com/docs/quickstart/native/react-native)
- [Authentication API](https://auth0.com/docs/api/authentication)
- [Management API](https://auth0.com/docs/api/management/v2)

**Installation**:

```bash
# For NestJS backend
npm install @auth0/auth0-react

# For Next.js
npm install @auth0/nextjs-auth0

# For React Native/Expo
npm install react-native-auth0
```

**Alternatives**:
- NextAuth.js (simpler, self-hosted)
- Clerk (managed auth, great DX)
- Supabase Auth (if using Supabase)

---

## Testing

### Unit & Integration Testing

**Framework**: Jest

**Why**:
- Industry standard
- Great ecosystem
- Snapshot testing
- Good performance

**Component Testing**: React Testing Library

**Why**:
- Encourages accessibility
- Tests behavior, not implementation
- Widely adopted

### E2E Testing

**Web**: Playwright

**Why**:
- Fast and reliable
- Cross-browser support
- Great debugging tools
- Auto-waiting (no flaky tests)

**Mobile**: Detox or Maestro

- **Detox**: Mature, widely used
- **Maestro**: Simpler, better DX

---

## Code Quality

### Linting

**ESLint**: JavaScript/TypeScript linting

**Prettier**: Code formatting

**TypeScript**: Type checking

See `docs/rules/code-standards.md` for detailed configuration.

### Pre-commit Hooks

**Husky**: Git hooks
**lint-staged**: Run linters on staged files

---

## Build Tools

### Web

**Next.js built-in**:
- Webpack (or Turbopack in future)
- SWC for compilation
- Built-in optimizations

### Mobile

**Expo built-in**:
- Metro bundler
- Babel for compilation
- EAS Build for cloud builds

---

## Version Policy {#version-policy}

### Always Use Latest Stable

**Rule**: At project start, use the latest stable version of all major dependencies.

**Why**:
- Latest features
- Best performance
- Longest security support
- Latest bug fixes

```bash
# Good practice at project start
npm install react@latest next@latest

# Check for latest versions
npm outdated
```

### Upgrading Existing Projects

**Major versions**: Plan upgrades, review breaking changes

**Minor/Patch versions**: Upgrade regularly (weekly/monthly)

```bash
# Check for updates
npm outdated

# Update to latest within semver range
npm update

# Update to latest (including major)
npm install react@latest
```

### Version Pinning

**Rule**: Use exact versions for critical dependencies, ranges for others.

```json
{
  "dependencies": {
    "next": "15.0.3",           // Exact version for framework
    "react": "^19.0.0"          // Range for libraries
  }
}
```

---

## Monitoring & Analytics

### Error Tracking

**Recommended**: Sentry

**Why**:
- Excellent error tracking
- Source map support
- Release tracking
- Performance monitoring

### Analytics

**Recommended**: PostHog or Mixpanel

**PostHog**:
- Open source option available
- Product analytics
- Feature flags
- Session replay
- Self-hostable

**Mixpanel**:
- User behavior analytics
- Funnel analysis
- Cohort analysis

### Alternatives

- Google Analytics (free, basic)
- Amplitude (advanced analytics)
- Plausible (privacy-focused)

---

## External Services

### Email

**Recommended**: SendGrid or Resend

**SendGrid**: Mature, reliable
**Resend**: Modern API, great DX

### File Storage

**Recommended**: AWS S3 or Cloudflare R2

**S3**: Industry standard
**R2**: Cheaper, S3-compatible

### Payment Processing

**Recommended**: Stripe

**Why**:
- Best-in-class API
- Excellent documentation
- Handles compliance
- Great developer tools

---

## Development Tools

### Package Manager

**Recommended**: pnpm

**Why**:
- Fastest install times
- Disk space efficient
- Strict dependency resolution

**Alternatives**:
- npm (built-in, reliable)
- yarn (fast, popular)

### IDE

**Recommended**: VS Code

**Extensions**:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prisma

### API Testing

**Recommended**: Bruno or Postman

**Bruno**: Open source, Git-friendly
**Postman**: Feature-rich, popular

---

## Infrastructure as Code

### For Complex Projects

**Terraform**: Multi-cloud infrastructure
**Pulumi**: Infrastructure with TypeScript
**AWS CDK**: AWS-specific (TypeScript)

**For Most Projects**: Use Railway/Vercel UI (simpler)

---

## Tech Stack Templates

### Next.js Web App (Recommended Stack)

```
Frontend:
- Next.js 15.x (App Router) - https://nextjs.org/docs
- React 19.x
- TypeScript 5.x
- Tailwind CSS - https://tailwindcss.com/docs
- shadcn/ui - https://ui.shadcn.com/docs
- Lucide Icons - https://lucide.dev/icons/
- TanStack Query (server state)
- Zustand (client state, if needed)

Backend:
- NestJS - https://docs.nestjs.com/
- Prisma + PostgreSQL - https://www.prisma.io/docs
- Swagger/OpenAPI - https://docs.nestjs.com/openapi/introduction
- Auth0 - https://auth0.com/docs

Testing:
- Jest + React Testing Library
- Playwright

Deployment:
- Railway - https://docs.railway.com/
- Docker - https://docs.docker.com/

Monitoring:
- Sentry (errors)
- PostHog (analytics)

Documentation:
- Always reference official docs first
- See docs/rules/technology-stack.md for all links
```

### Expo Mobile App (Recommended Stack)

```
Framework:
- Expo SDK 52.x - https://docs.expo.dev/
- React Native - https://reactnative.dev/docs/getting-started
- TypeScript 5.x

UI:
- Expo Icons - https://icons.expo.fyi/Index
- Expo Router (navigation) - https://docs.expo.dev/router/introduction/

State:
- TanStack Query
- Zustand

Backend:
- NestJS REST API or GraphQL
- Auth0 - https://auth0.com/docs
- Same backend as web app

Testing:
- Jest + React Native Testing Library
- Detox or Maestro

Deployment:
- EAS Build - https://docs.expo.dev/eas/
- EAS Submit - https://docs.expo.dev/submit/introduction/
- OTA updates
- Google Play Developer - https://developer.android.com/distribute
- Apple Developer - https://developer.apple.com/documentation

Monitoring:
- Sentry
- PostHog

Documentation:
- Always reference official docs first
- See docs/rules/technology-stack.md for all links
```

---

## Technology Decision Process {#decision-process}

### When Choosing New Technology

Ask:
1. **Does it solve our problem?**
2. **Is it actively maintained?**
3. **Does it have good documentation?**
4. **Is the community healthy?**
5. **Does it integrate with our stack?**
6. **What's the learning curve?**
7. **What are the alternatives?**
8. **What's the long-term support?**

### Avoid

- Unmaintained packages
- Packages with security vulnerabilities
- Overly complex solutions for simple problems
- Bleeding edge (unstable) versions in production
- Technologies without clear documentation

### Document Decisions

For significant technology choices, document:
- Why we chose it
- Alternatives considered
- Trade-offs
- When to revisit the decision

---

## Upgrading Strategy {#upgrading}

### Regular Updates

```bash
# Weekly: Check for updates
npm outdated

# Monthly: Update patch and minor versions
npm update

# Quarterly: Review major version updates
# Plan upgrade, review breaking changes, test thoroughly
```

### Major Version Upgrades

**Process**:
1. Read CHANGELOG and migration guide
2. Create new branch for upgrade
3. Update dependencies
4. Fix breaking changes
5. Run all tests
6. Test manually
7. Deploy to dev → sit → uat → prod

### Security Updates

**Critical vulnerabilities**: Update immediately

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Review and fix manually
npm audit fix --force  # Use with caution
```

---

## Deprecated Technologies

### What We Don't Use (and Why)

**Create React App**: Deprecated, use Next.js or Vite

**Express.js** (for new projects): Next.js API routes or tRPC are simpler

**Redux**: Too complex for most needs, use Zustand or React Query

**Moment.js**: Deprecated, use date-fns or Luxon

**Webpack directly**: Next.js/Expo handle this

---

## Resources

### Official Documentation Links

**ALWAYS reference these official docs first before searching the web.**

#### Web
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)

#### Mobile
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Documentation](https://docs.expo.dev/eas/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Icons](https://icons.expo.fyi/Index)
- [Google Play Developer](https://developer.android.com/distribute)
- [Apple Developer](https://developer.apple.com/documentation)

#### Backend & Database
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/getting-started)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Swagger/OpenAPI (NestJS)](https://docs.nestjs.com/openapi/introduction)

#### Deployment
- [Railway Documentation](https://docs.railway.com/)
- [Docker Documentation](https://docs.docker.com/)

#### Authentication
- [Auth0 Documentation](https://auth0.com/docs)

#### Other
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query)

---

## Keeping This Updated

**Review**: Quarterly

**Update when**:
- Major new technology adopted
- Technology deprecated or replaced
- Version policy changes
- New best practices emerge

**Process**:
1. Discuss in team meeting
2. Update this document
3. Notify team of changes
4. Update project templates

---

## Related Documentation

**All Rules**:
- [API Design](./api-design.md) - API standards and versioning
- [UI Standards](./ui-standards.md) - Responsive design requirements
- [Security & Privacy](./security-privacy.md) - Security and GDPR compliance
- [Accessibility](./accessibility.md) - WCAG 2.2 Level AA
- [Testing](./testing.md) - Testing pyramid and coverage
- [Code Standards](./code-standards.md) - Linting and formatting
- [Clean Code](./clean-code.md) - Code quality principles
- [Git Workflow](./git-workflow.md) - Git-flow branching
- [Git Commits](./git-commits.md) - Conventional commits
- [Semantic Versioning](./semantic-versioning.md) - Version bumping
- [Technology Stack](./technology-stack.md) - Approved tools
- [Deployment](./deployment.md) - CI/CD pipelines
- [Environments](./environments.md) - Dev, staging, production

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)

