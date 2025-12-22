# API Design Standards

## Overview

This document defines the standards and best practices for designing and implementing APIs in all projects.

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **ALL APIs MUST be versioned**: `/api/v1/resource` format (see [API Versioning](#api-versioning))
- **Standard response format**: `{ success, data/error, message }` (see [Response Format](#response-format))
- **RESTful design**: GET/POST/PUT/DELETE with proper status codes (see [RESTful Design](#restful-design))
- **Authentication required**: All non-public endpoints must authenticate (see [Authentication](#authentication))
- **Error handling**: Consistent error responses with error codes (see [Error Handling](#error-handling))

**Quick Example:**
```typescript
// GOOD
GET /api/v1/users → { success: true, data: [...] }

// BAD
GET /users → No version, inconsistent response
```

---

## Core Principles

1. **Always Version APIs** - Every API must be versioned from day one
2. **RESTful Design** - Follow REST principles unless there's a specific reason not to
3. **Consistent Responses** - Use standard response formats across all endpoints
4. **Clear Documentation** - Every endpoint must be documented
5. **Security First** - Authentication and authorization on all non-public endpoints

---

## API Versioning (CRITICAL) {#api-versioning}

### Rule: All API Endpoints MUST Be Versioned

**Format**: `/api/v1/resource`

**Why This Rule Exists**:
- Allows updates and improvements without breaking existing clients
- Enables gradual migration to new API versions
- Protects production applications from breaking changes
- Industry best practice and professional standard
- Makes API evolution manageable

### Implementation

#### NestJS (Recommended for Backend)

```typescript
// GOOD - Versioned endpoint
@Controller('api/v1/users')
export class UsersController {
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

// BAD - No version
@Controller('users')
export class UsersController {
  // This will break when you need to make changes!
}
```

#### Next.js API Routes

```typescript
// GOOD - app/api/v1/users/route.ts
export async function GET(request: Request) {
  const users = await db.user.findMany();
  return Response.json({ success: true, data: users });
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return Response.json({ success: true, data: user });
}

// GOOD - app/api/v1/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  return Response.json({ success: true, data: user });
}

// BAD - app/api/users/route.ts
// No version in path!
```

### Versioning Strategy

**When to Create a New Version**:
- Breaking changes to request/response format
- Required field additions or changes
- Authentication method changes
- Major business logic changes
- Endpoint URL restructuring

**When NOT to Create a New Version** (backward compatible):
- Adding optional fields to responses
- Adding new endpoints
- Performance improvements
- Bug fixes that don't change contracts
- Adding new optional query parameters

**Version Lifecycle**:
1. **v1**: Initial release
2. **v2**: Created when breaking changes needed
3. **v1 deprecation**: Announce 3-6 months before removal
4. **v1 removal**: Remove after deprecation period (6-12 months)

### Version in Headers

Include version in response headers:

```typescript
// NestJS
@Get()
@Header('API-Version', 'v1')
async findAll() {
  return this.usersService.findAll();
}

// Next.js
export async function GET(request: Request) {
  return Response.json(
    { success: true, data: users },
    { headers: { 'API-Version': 'v1' } }
  );
}
```

### Multiple Versions (When Migrating)

Support old version during transition:

```typescript
// v1 controller (old, deprecated)
@Controller('api/v1/users')
export class UsersV1Controller {
  // Old implementation
}

// v2 controller (new)
@Controller('api/v2/users')
export class UsersV2Controller {
  // New implementation with breaking changes
}
```

---

## RESTful Design Principles {#restful-design}

### HTTP Methods

Use standard HTTP methods correctly:

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Retrieve resource(s) | `GET /api/v1/users` |
| **POST** | Create new resource | `POST /api/v1/users` |
| **PUT** | Replace entire resource | `PUT /api/v1/users/:id` |
| **PATCH** | Partial update | `PATCH /api/v1/users/:id` |
| **DELETE** | Remove resource | `DELETE /api/v1/users/:id` |

### URL Naming Conventions

```bash
# GOOD - Use plural nouns
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

# GOOD - Nested resources
GET    /api/v1/users/:id/posts
POST   /api/v1/users/:id/posts
GET    /api/v1/posts/:id/comments

# GOOD - Actions (when needed)
POST   /api/v1/users/:id/activate
POST   /api/v1/orders/:id/cancel
POST   /api/v1/posts/:id/publish

# BAD - Verbs in URLs (use HTTP methods instead)
POST   /api/v1/createUser
GET    /api/v1/getUsers
POST   /api/v1/deleteUser/:id

# BAD - Inconsistent naming
GET    /api/v1/user        # Should be plural
GET    /api/v1/Users       # Don't capitalize
GET    /api/v1/user-list   # Don't use actions
```

---

## Response Format Standards {#response-format}

### Standard Response Envelope

All API responses MUST use this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

### Success Response

```typescript
// Single resource
{
  "success": true,
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// List of resources
{
  "success": true,
  "data": [
    { "id": "123", "name": "User 1" },
    { "id": "124", "name": "User 2" }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

### Error Response

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "Must be a valid email address"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Codes

Use standard HTTP status codes:

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Successful GET, PUT, PATCH, DELETE |
| **201** | Created | Successful POST (resource created) |
| **204** | No Content | Successful DELETE (no response body) |
| **400** | Bad Request | Invalid request data |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Authenticated but not authorized |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource already exists or conflict |
| **422** | Unprocessable Entity | Validation failed |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |
| **503** | Service Unavailable | Temporary unavailability |

---

## Authentication & Authorization {#authentication}

### Authentication

All non-public endpoints MUST require authentication:

```typescript
// NestJS with Guards
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)  // Require authentication
export class UsersController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

// Next.js with Auth0
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  const session = await getSession(req, res);
  const user = session.user;
  // ...
});
```

### Authorization

Check permissions for protected resources:

```typescript
// NestJS with custom guard
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  // Only admins can access
}

// Check resource ownership
@Delete(':id')
async delete(@Param('id') id: string, @Request() req) {
  const resource = await this.service.findOne(id);

  if (resource.userId !== req.user.id) {
    throw new ForbiddenException('You can only delete your own resources');
  }

  return this.service.delete(id);
}
```

---

## Query Parameters

### Filtering

```bash
# Filter by field
GET /api/v1/users?status=active
GET /api/v1/users?role=admin&status=active

# Date ranges
GET /api/v1/posts?createdAfter=2024-01-01&createdBefore=2024-12-31
```

### Sorting

```bash
# Sort by field (ascending)
GET /api/v1/users?sortBy=createdAt

# Sort descending
GET /api/v1/users?sortBy=createdAt&order=desc

# Multiple sort fields
GET /api/v1/users?sortBy=lastName,firstName
```

### Pagination

```bash
# Page-based pagination
GET /api/v1/users?page=1&limit=20

# Cursor-based pagination (for large datasets)
GET /api/v1/users?cursor=abc123&limit=20
```

### Field Selection

```bash
# Return only specific fields
GET /api/v1/users?fields=id,name,email

# Exclude fields
GET /api/v1/users?exclude=passwordHash,resetToken
```

---

## Error Handling {#error-handling}

### Standard Error Codes

```typescript
// Define standard error codes
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
```

### Error Response Examples

```typescript
// Validation error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}

// Not found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}

// Unauthorized
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Please log in to access this resource"
  }
}
```

---

## API Documentation

### Use OpenAPI/Swagger

All APIs MUST be documented with OpenAPI/Swagger:

```typescript
// NestJS with Swagger
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.usersService.findAll();
  }
}
```

Access Swagger UI at: `http://localhost:3000/api/docs`

---

## Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// NestJS with throttler
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/v1/users')
@UseGuards(ThrottlerGuard)
export class UsersController {
  // Limited to configured rate (e.g., 10 requests per minute)
}
```

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1609459200
```

---

## Multi-Tenancy Considerations

For SaaS applications (see `docs/project-rules/saas-architecture.md`):

```typescript
// Include tenant context in all queries
@Controller('api/v1/users')
export class UsersController {
  @Get()
  async findAll(@Request() req) {
    const tenantId = req.tenantId; // From middleware
    return this.usersService.findAll({ tenantId });
  }
}
```

---

## Best Practices

### DO:
- Version all APIs from day one (`/api/v1/`)
- Use standard HTTP methods correctly
- Return consistent response formats
- Include proper error messages and codes
- Document all endpoints with Swagger
- Require authentication on protected endpoints
- Validate all input data
- Use plural nouns for resources
- Implement rate limiting
- Include pagination for list endpoints

### DON'T:
- Create unversioned endpoints
- Use verbs in URL paths
- Return inconsistent response formats
- Expose internal error details to clients
- Skip input validation
- Return sensitive data (passwords, tokens)
- Use GET for state-changing operations
- Return 200 for errors
- Skip documentation
- Allow unlimited requests (rate limiting)

---

## Testing API Endpoints

### Unit Tests

```typescript
describe('UsersController', () => {
  it('should return all users', async () => {
    const result = await controller.findAll();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('POST /api/v1/users', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
  });
});
```

---

## Migration from Unversioned APIs

If you have existing unversioned APIs:

1. **Create v1 with current implementation**:
   ```typescript
   // Move existing endpoints to v1
   @Controller('api/v1/users')
   ```

2. **Keep old endpoints temporarily**:
   ```typescript
   // Deprecated - redirect to v1
   @Controller('users')
   @Get()
   async legacyFindAll(@Res() res) {
     res.redirect(301, '/api/v1/users');
   }
   ```

3. **Add deprecation warnings**:
   ```typescript
   @Get()
   @Header('Deprecation', 'true')
   @Header('Sunset', '2024-12-31')
   ```

4. **Remove old endpoints** after grace period

---

## Resources

- [REST API Best Practices](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [NestJS API Documentation](https://docs.nestjs.com/openapi/introduction)
- [HTTP Status Codes](https://httpstatuses.com/)
- See `docs/rules/security-privacy.md` for security requirements
- See `docs/09-saas-specific/saas-architecture.md` for multi-tenancy patterns

---

## Related Documentation

**Essential Rules (Read Together)**:
- [Security & Privacy](./security-privacy.md) - Authentication, encryption, PII protection
- [Testing](./testing.md) - API endpoint testing strategies
- [Code Standards](./code-standards.md) - Linting and formatting

**Implementation Guides**:
- [SaaS Architecture](../09-saas-specific/saas-architecture.md) - Multi-tenant API patterns
- [Subscription Billing](../09-saas-specific/subscription-billing.md) - Payment API endpoints
- [User Management & RBAC](../09-saas-specific/user-management-rbac.md) - Permission checks in APIs

**Practical Resources**:
- [API Endpoint Template](../templates/api-endpoint-template.ts) - Ready-to-use boilerplate
- [Test Template](../templates/test-template.test.ts) - API testing examples

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
