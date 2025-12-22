# Security & Privacy Rules

## Overview

All code must prioritize security and user privacy. We are GDPR compliant and follow industry best practices for data protection and cybersecurity.

## Core Principles

1. **Privacy Focused**: Only reveal what is necessary
2. **GDPR Compliant**: Follow all GDPR requirements
3. **High Security**: Protection from cyberattacks at all layers
4. **Encryption Always**: Data encrypted at rest and in transit
5. **Authentication Required**: User auth required for all protected resources

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **GDPR**: ALL PII must be encrypted, anonymizable, deletable (see [GDPR Compliance](#gdpr))
- **Encryption**: Data encrypted at rest (AES-256) and in transit (TLS 1.3+) (see [Encryption](#encryption))
- **Authentication**: JWT/OAuth2, NEVER passwords in plaintext (see [Authentication](#authentication))
- **Attack Prevention**: CSRF tokens, XSS protection, SQL injection prevention (see [Cyberattacks](#cyberattacks))
- **Secrets**: NEVER commit secrets, use environment variables (see [Secrets Management](#secrets))

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

**Key Sections:**
- [GDPR Compliance](#gdpr) - PII handling, right to deletion, data portability
- [Encryption](#encryption) - At-rest and in-transit encryption standards
- [Authentication](#authentication) - JWT, OAuth2, session management
- [Cyberattacks](#cyberattacks) - XSS, CSRF, SQL injection prevention

---

## GDPR Compliance {#gdpr}

### Personal Identifiable Information (PII)

**Rule**: Never log, save to insecure locations, or unnecessarily reveal PII.

**What is PII**:
- Names, email addresses, phone numbers
- Physical addresses, IP addresses
- Government IDs (SSN, passport numbers)
- Financial information (credit cards, bank accounts)
- Biometric data
- Health information
- Any data that can identify an individual

### PII Handling Requirements

#### DO

- Encrypt all PII at rest (database, file storage)
- Encrypt all PII in transit (HTTPS/TLS)
- Use hashing for passwords (bcrypt, argon2)
- Minimize PII collection - only collect what's absolutely necessary
- Implement data retention policies
- Provide user data export (GDPR right to access)
- Provide user data deletion (GDPR right to be forgotten)
- Get explicit consent before collecting PII
- Anonymize PII in analytics and logs

#### DON'T

- Log PII in application logs
- Store PII in plaintext
- Send PII over unencrypted connections
- Store PII in local storage or cookies (use secure, httpOnly cookies for tokens)
- Include PII in URLs or query parameters
- Share PII with third parties without consent
- Keep PII longer than necessary
- Use PII for purposes other than stated

### Example: Logging Without PII

```typescript
// BAD - Logs user email
console.log(`User login attempt: ${user.email}`);

// GOOD - Logs user ID only
console.log(`User login attempt: userId=${user.id}`);

// GOOD - Redacted PII
logger.info('User login attempt', {
  userId: user.id,
  email: '[REDACTED]'
});
```

### GDPR Rights Implementation

Ensure the following user rights are implemented:

- **Right to Access**: Users can export their data
- **Right to Rectification**: Users can update their data
- **Right to Erasure**: Users can delete their data
- **Right to Restrict Processing**: Users can pause data processing
- **Right to Data Portability**: Users can download data in standard format
- **Right to Object**: Users can opt-out of certain processing

---

## Encryption {#encryption}

### Encryption Requirements

- **In Transit**: All data must be transmitted over HTTPS/TLS 1.3+
- **At Rest**: All sensitive data must be encrypted in the database
- **Passwords**: Always hashed with bcrypt (cost factor ≥ 12) or argon2
- **API Keys/Secrets**: Stored in environment variables, encrypted at rest

### Implementation

#### Database Encryption

```typescript
// Example: Encrypting sensitive fields with Prisma
// Use field-level encryption for PII

import { encrypt, decrypt } from '@/lib/encryption';

// Before saving
const encryptedData = encrypt(sensitiveData);

// After retrieving
const decryptedData = decrypt(encryptedData);
```

#### Password Hashing

```typescript
import bcrypt from 'bcrypt';

// GOOD - Hash with appropriate cost factor
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// BAD - Never store plaintext passwords
const password = user.password; // Don't do this!
```

#### HTTPS Enforcement

```typescript
// Next.js middleware example
export function middleware(request: NextRequest) {
  // Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }
}
```

---

## Authentication & Authorization {#authentication}

### Authentication Requirements

- **All protected routes** require valid authentication
- Use secure, httpOnly cookies for tokens (or secure storage on mobile)
- Implement token expiration and refresh
- Support MFA/2FA where appropriate
- Rate limit authentication endpoints

### Authorization Requirements

- Implement **least privilege principle**
- Check permissions on every protected operation
- Validate user permissions server-side (never trust client)
- Use Role-Based Access Control (RBAC) or Attribute-Based Access Control (ABAC)

### Example: Protected API Route

```typescript
// BAD - No authentication check
export async function GET(request: Request) {
  const data = await db.sensitiveData.findMany();
  return Response.json(data);
}

// GOOD - Authentication and authorization
export async function GET(request: Request) {
  const session = await getServerSession(request);

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.user, 'read:sensitive_data')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await db.sensitiveData.findMany({
    where: { userId: session.user.id } // User can only see their own data
  });

  return Response.json(data);
}
```

---

## Protection from Cyberattacks {#cyberattacks}

### OWASP Top 10 Protections

#### 1. Injection Attacks (SQL, NoSQL, Command)

```typescript
// BAD - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD - Use parameterized queries (ORM handles this)
const user = await db.user.findUnique({
  where: { email }
});
```

#### 2. Broken Authentication

- Use established authentication libraries (NextAuth, Clerk, Auth0)
- Implement account lockout after failed attempts
- Require strong passwords
- Use secure session management

#### 3. Sensitive Data Exposure

- Follow encryption rules above
- Remove sensitive data from error messages
- Don't expose stack traces in production
- Sanitize API responses

#### 4. XML External Entities (XXE)

- Disable XML external entity processing
- Use JSON instead of XML where possible

#### 5. Broken Access Control

- Validate authorization on every request
- Use allowlist for access control
- Never trust client-side access control

#### 6. Security Misconfiguration

- Use security headers (CSP, HSTS, X-Frame-Options)
- Disable directory listing
- Remove default credentials
- Keep dependencies updated

#### 7. Cross-Site Scripting (XSS)

```typescript
// BAD - XSS vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// GOOD - React automatically escapes
<div>{userInput}</div>

// GOOD - Sanitize if HTML is needed
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

#### 8. Insecure Deserialization

- Validate all input before deserialization
- Use schema validation (Zod, Yup)
- Don't deserialize data from untrusted sources

#### 9. Using Components with Known Vulnerabilities

- Run `npm audit` regularly
- Use Dependabot or Renovate for automated updates
- Patch critical vulnerabilities immediately

#### 10. Insufficient Logging & Monitoring

- Log all authentication attempts
- Log authorization failures
- Monitor for suspicious patterns
- Set up alerts for security events
- **Never log sensitive data**

### Input Validation

**Rule**: Validate and sanitize ALL user input.

```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().positive().max(120),
  name: z.string().min(1).max(100)
});

// Validate input
export async function createUser(input: unknown) {
  const validatedInput = userSchema.parse(input); // Throws if invalid
  // Now safe to use validatedInput
}
```

### Rate Limiting

```typescript
// Protect against brute force and DDoS
import rateLimit from '@/lib/rate-limit';

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request); // IP or user ID

  const isAllowed = await rateLimit(identifier, {
    limit: 5,        // 5 requests
    window: 60000    // per minute
  });

  if (!isAllowed) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Process request
}
```

---

## Security Headers

### Required Headers

Set these headers on all responses:

```typescript
// Next.js next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Secrets Management {#secrets}

### Rules

- **Never commit secrets** to version control
- Use environment variables for all secrets
- Use `.env.local` for local development (add to `.gitignore`)
- Use secure secret management in production (Railway secrets, Vercel env vars)
- Rotate secrets regularly
- Use different secrets for each environment

### Example: .env.example

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
JWT_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# External APIs
STRIPE_SECRET_KEY="sk_test_..."
SENDGRID_API_KEY="SG...."

# Never commit the actual .env.local file!
```

---

## Third-Party Integrations

### Security Checklist

Before integrating any third-party service:

- [ ] Review their security practices
- [ ] Check GDPR compliance
- [ ] Understand what data they collect
- [ ] Use API keys (not OAuth) where possible
- [ ] Limit permissions to minimum required
- [ ] Monitor for security advisories
- [ ] Have a backup plan if service is compromised

---

## Security Checklist

Before deploying ANY code:

- [ ] No PII in logs
- [ ] All PII encrypted at rest and in transit
- [ ] Authentication on all protected routes
- [ ] Authorization checks on all operations
- [ ] Input validation on all user input
- [ ] Rate limiting on public endpoints
- [ ] Security headers configured
- [ ] No secrets in code
- [ ] Dependencies updated (no critical vulnerabilities)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Error messages don't expose sensitive info

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. **Do NOT** commit a fix without review
3. **DO** contact: [SECURITY_CONTACT_EMAIL]
4. **DO** provide details privately
5. Wait for security team response before proceeding

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Official Site](https://gdpr.eu/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Related Documentation

**Essential Rules (Read Together)**:
- [API Design](./api-design.md) - Authentication, authorization in APIs
- [Testing](./testing.md) - Security testing and penetration testing
- [Accessibility](./accessibility.md) - Secure, accessible auth flows

**Implementation Guides**:
- [SaaS Architecture](../09-saas-specific/saas-architecture.md) - Multi-tenant data isolation
- [User Management & RBAC](../09-saas-specific/user-management-rbac.md) - Permission systems
- [Subscription Billing](../09-saas-specific/subscription-billing.md) - PCI compliance, Stripe security
- [Internationalization](../09-saas-specific/internationalization.md) - GDPR regional requirements

**Operations**:
- [Security Testing](../06-operations/security-testing.md) - Automated security scans
- [Penetration Testing](../06-operations/penetration-testing.md) - Manual security audits
- [Compliance](../06-operations/compliance.md) - GDPR, SOC 2, ISO 27001
- [Incident Response](../06-operations/incident-response.md) - Security breach procedures

**Practical Resources**:
- [API Endpoint Template](../templates/api-endpoint-template.ts) - Secure API boilerplate
- [Database Migration Template](../templates/database-migration-template.sql) - RLS policies

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
