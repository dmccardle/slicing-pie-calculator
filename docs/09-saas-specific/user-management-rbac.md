# User Management & RBAC (Role-Based Access Control)

## Overview

This document defines role-based access control (RBAC) patterns for multi-tenant SaaS applications. We implement a hierarchical role system where users within a tenant have specific permissions based on their role.

**CRITICAL:** All feature access MUST be gated by role permissions. Never trust client-side role checks alone - always verify on backend.

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Hierarchical Roles**: Super Admin → Tenant Admin → Manager → Member → Viewer (see [Role Definitions](#role-definitions))
- **Permission Matrix**: Define granular permissions per role (see [Permission Matrix](#permission-matrix))
- **Server-Side Checks**: NEVER trust client-side role checks, always verify on backend (see [Implementation Patterns](#implementation-patterns))
- **Invitation Flow**: Secure email-based invitations with expiry (see [User Invitation Flow](#user-invitation))
- **Offboarding**: Remove access immediately, transfer ownership before deletion (see [User Removal](#user-removal))

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

**Key Sections:**
- [Permission Matrix](#permission-matrix) - Complete role-to-permission mapping
- [Implementation Patterns](#implementation-patterns) - Guards, decorators, middleware
- [User Invitation Flow](#user-invitation) - Secure team member onboarding
- [ABAC](#abac) - Resource ownership and attribute-based access

---

## Role Definitions {#role-definitions}

### Role Hierarchy

```
Super Admin (Platform Owner)
    ↓
Tenant Admin (Organization Owner)
    ↓
Manager (Team Lead)
    ↓
Member (Standard User)
    ↓
Viewer (Read-Only)
```

### Role Descriptions

| Role | Description | Typical Use Case |
|------|-------------|------------------|
| **Super Admin** | Platform administrator with global access | Platform maintenance, support |
| **Tenant Admin** | Organization owner, full control within tenant | Company CEO, IT Director |
| **Manager** | Team lead with management permissions | Department Manager, Team Lead |
| **Member** | Standard user with create/edit permissions | Developer, Designer, Analyst |
| **Viewer** | Read-only access to resources | Contractor, Auditor, Stakeholder |

---

## Permission Matrix {#permission-matrix}

### Core Permissions

| Feature | Super Admin | Tenant Admin | Manager | Member | Viewer |
|---------|-------------|--------------|---------|--------|--------|
| **Tenant Management** |
| View tenant | All | Own | | | |
| Update tenant | All | Own | | | |
| Delete tenant | All | Own | | | |
| **User Management** |
| View users | All | Tenant | Tenant | Tenant | Tenant |
| Invite users | All | Tenant | Tenant | | |
| Update user roles | All | Tenant | Lower roles | | |
| Remove users | All | Tenant | Lower roles | | |
| **Billing** |
| View billing | All | Own | | | |
| Update billing | All | Own | | | |
| **Projects** |
| View projects | All | Tenant | Tenant | Own | Own |
| Create projects | All | Tenant | Tenant | Tenant | |
| Update projects | All | Tenant | Tenant | Own | |
| Delete projects | All | Tenant | Tenant | Own | |
| **API Keys** |
| View API keys | All | Tenant | Tenant | Own | |
| Create API keys | All | Tenant | Tenant | Tenant | |
| Delete API keys | All | Tenant | Tenant | Own | |

**Legend:**
- = Full access
- = Conditional access (see notes)
- = No access

---

## Database Schema {#database-schema}

```typescript
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String

  // Multi-tenant membership
  memberships TenantMembership[]

  // Super admin flag (global, not tenant-specific)
  isSuperAdmin Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TenantMembership {
  id       String @id @default(cuid())

  userId   String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  role     Role   @default(MEMBER)

  // Invitation tracking
  invitedBy  String?
  invitedAt  DateTime?
  acceptedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, tenantId])
  @@index([tenantId])
  @@index([userId])
}

enum Role {
  TENANT_ADMIN
  MANAGER
  MEMBER
  VIEWER
}

// Note: Super Admin is a User field, not a role within tenant
```

---

## Implementation Patterns {#implementation-patterns}

### Backend: Role Guards (NestJS)

```typescript
// src/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler()
    );

    if (!requiredRoles) {
      return true; // No role restriction
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'];

    if (!user || !tenantId) {
      return false;
    }

    // Super admins bypass all checks
    if (user.isSuperAdmin) {
      return true;
    }

    // Check user's role within this tenant
    const membership = await prisma.tenantMembership.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId,
        },
      },
    });

    if (!membership) {
      return false; // User not member of tenant
    }

    return requiredRoles.includes(membership.role);
  }
}

// Decorator to specify required roles
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

### Using Role Guard

```typescript
// src/controllers/tenant.controller.ts
import { Controller, Get, Put, Delete, UseGuards } from '@nestjs/common';
import { RolesGuard } from '@/guards/roles.guard';
import { Roles } from '@/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantController {
  // Only tenant admins can update tenant
  @Put(':id')
  @Roles(Role.TENANT_ADMIN)
  async updateTenant(@Param('id') id: string, @Body() data: any) {
    // Update tenant...
  }

  // Only tenant admins can delete tenant
  @Delete(':id')
  @Roles(Role.TENANT_ADMIN)
  async deleteTenant(@Param('id') id: string) {
    // Delete tenant...
  }

  // Managers and admins can invite users
  @Post(':id/invite')
  @Roles(Role.MANAGER, Role.TENANT_ADMIN)
  async inviteUser(@Param('id') id: string, @Body() data: any) {
    // Invite user...
  }
}
```

### Backend: Ownership Verification

**CRITICAL:** Always verify resource ownership, even if role allows action.

```typescript
// src/services/project.service.ts
export async function updateProject(
  userId: string,
  tenantId: string,
  projectId: string,
  data: any
) {
  const membership = await prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: { userId, tenantId },
    },
  });

  if (!membership) {
    throw new Error('User not member of tenant');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Verify project belongs to tenant
  if (project.tenantId !== tenantId) {
    throw new Error('Project does not belong to tenant');
  }

  // Check permissions
  const canUpdate =
    membership.role === Role.TENANT_ADMIN ||
    membership.role === Role.MANAGER ||
    (membership.role === Role.MEMBER && project.ownerId === userId);

  if (!canUpdate) {
    throw new Error('Insufficient permissions to update project');
  }

  // Update project...
  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}
```

### Backend: Permission Helper

```typescript
// src/utils/permissions.ts
import { Role } from '@prisma/client';

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<Role, number> = {
  VIEWER: 1,
  MEMBER: 2,
  MANAGER: 3,
  TENANT_ADMIN: 4,
};

export function hasPermission(
  userRole: Role,
  requiredRole: Role
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canManageUser(
  managerRole: Role,
  targetRole: Role
): boolean {
  // Can only manage users with lower roles
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Usage
if (!hasPermission(membership.role, Role.MANAGER)) {
  throw new Error('Requires Manager role or higher');
}

// Manager can update Member or Viewer, but not another Manager or Admin
if (!canManageUser(membership.role, targetMembership.role)) {
  throw new Error('Cannot manage users with equal or higher role');
}
```

### Frontend: Permission Hook (React)

```typescript
// src/hooks/usePermissions.ts
import { useQuery } from '@tanstack/react-query';
import { Role } from '@prisma/client';

interface Membership {
  role: Role;
  tenantId: string;
}

export function usePermissions(tenantId: string) {
  const { data: membership } = useQuery<Membership>({
    queryKey: ['membership', tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}/membership`);
      if (!res.ok) throw new Error('Failed to fetch membership');
      return res.json();
    },
  });

  const hasRole = (requiredRole: Role): boolean => {
    if (!membership) return false;

    const hierarchy: Record<Role, number> = {
      VIEWER: 1,
      MEMBER: 2,
      MANAGER: 3,
      TENANT_ADMIN: 4,
    };

    return hierarchy[membership.role] >= hierarchy[requiredRole];
  };

  const can = {
    viewTenant: hasRole(Role.VIEWER),
    updateTenant: hasRole(Role.TENANT_ADMIN),
    deleteTenant: hasRole(Role.TENANT_ADMIN),

    viewUsers: hasRole(Role.VIEWER),
    inviteUsers: hasRole(Role.MANAGER),
    updateUserRoles: hasRole(Role.MANAGER),
    removeUsers: hasRole(Role.MANAGER),

    viewBilling: hasRole(Role.TENANT_ADMIN),
    updateBilling: hasRole(Role.TENANT_ADMIN),

    viewProjects: hasRole(Role.VIEWER),
    createProjects: hasRole(Role.MEMBER),
    updateProjects: hasRole(Role.MEMBER),
    deleteProjects: hasRole(Role.MEMBER),
  };

  return {
    membership,
    role: membership?.role,
    hasRole,
    can,
  };
}
```

### Frontend: Permission-Based UI

```typescript
// src/components/ProjectActions.tsx
import { usePermissions } from '@/hooks/usePermissions';

export function ProjectActions({ project, tenantId }) {
  const { can, membership } = usePermissions(tenantId);

  const isOwner = project.ownerId === membership?.userId;
  const canUpdate = can.updateProjects && (can.hasRole(Role.MANAGER) || isOwner);
  const canDelete = can.deleteProjects && (can.hasRole(Role.MANAGER) || isOwner);

  return (
    <div>
      {canUpdate && (
        <Button onClick={() => editProject(project.id)}>
          Edit
        </Button>
      )}

      {canDelete && (
        <Button variant="destructive" onClick={() => deleteProject(project.id)}>
          Delete
        </Button>
      )}

      {!canUpdate && !canDelete && (
        <Badge>View Only</Badge>
      )}
    </div>
  );
}
```

### Frontend: Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
import { usePermissions } from '@/hooks/usePermissions';
import { Role } from '@prisma/client';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  tenantId: string;
  requiredRole: Role;
}

export function ProtectedRoute({ children, tenantId, requiredRole }: Props) {
  const { hasRole, membership } = usePermissions(tenantId);

  if (!membership) {
    return <div>Loading...</div>;
  }

  if (!hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Usage in routes
<Route
  path="/billing"
  element={
    <ProtectedRoute tenantId={tenantId} requiredRole={Role.TENANT_ADMIN}>
      <BillingPage />
    </ProtectedRoute>
  }
/>
```

---

## User Invitation Flow {#user-invitation}

### 1. Invite User (Backend)

```typescript
// src/services/invitation.service.ts
import { Role } from '@prisma/client';
import { sendEmail } from '@/lib/email';

export async function inviteUser(
  tenantId: string,
  invitedBy: string,
  email: string,
  role: Role
) {
  // Verify inviter has permission
  const inviterMembership = await prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: { userId: invitedBy, tenantId },
    },
  });

  if (!inviterMembership || !hasPermission(inviterMembership.role, Role.MANAGER)) {
    throw new Error('Insufficient permissions to invite users');
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Create placeholder user
    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // Temporary name
      },
    });
  }

  // Check if already member
  const existing = await prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: { userId: user.id, tenantId },
    },
  });

  if (existing) {
    throw new Error('User is already a member of this organization');
  }

  // Create membership (pending acceptance)
  const membership = await prisma.tenantMembership.create({
    data: {
      userId: user.id,
      tenantId,
      role,
      invitedBy,
      invitedAt: new Date(),
      // acceptedAt is null until user accepts
    },
  });

  // Generate invitation token
  const token = generateInvitationToken(membership.id);

  // Send invitation email
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  await sendEmail({
    to: email,
    subject: `You've been invited to join ${tenant?.name}`,
    template: 'invitation',
    data: {
      tenantName: tenant?.name,
      role,
      acceptUrl: `${process.env.NEXT_PUBLIC_URL}/invite/${token}`,
    },
  });

  return membership;
}
```

### 2. Accept Invitation (Backend)

```typescript
// src/services/invitation.service.ts
export async function acceptInvitation(token: string, userId: string) {
  const membershipId = verifyInvitationToken(token);

  const membership = await prisma.tenantMembership.findUnique({
    where: { id: membershipId },
  });

  if (!membership) {
    throw new Error('Invalid invitation');
  }

  if (membership.acceptedAt) {
    throw new Error('Invitation already accepted');
  }

  if (membership.userId !== userId) {
    throw new Error('Invitation is for a different user');
  }

  // Mark as accepted
  await prisma.tenantMembership.update({
    where: { id: membershipId },
    data: {
      acceptedAt: new Date(),
    },
  });

  return membership;
}
```

### 3. Invitation UI

```typescript
// src/app/invite/[token]/page.tsx
export default function InvitationPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/invitations/${params.token}`)
      .then((res) => res.json())
      .then(setInvitation)
      .finally(() => setLoading(false));
  }, [params.token]);

  const acceptInvitation = async () => {
    await fetch(`/api/invitations/${params.token}/accept`, {
      method: 'POST',
    });

    router.push('/dashboard');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>You've been invited to join {invitation.tenant.name}</h1>
      <p>Role: {invitation.role}</p>
      <Button onClick={acceptInvitation}>Accept Invitation</Button>
    </div>
  );
}
```

---

## User Removal & Offboarding {#user-removal}

### Remove User from Tenant

```typescript
// src/services/user.service.ts
export async function removeUserFromTenant(
  tenantId: string,
  removedBy: string,
  targetUserId: string
) {
  // Verify remover has permission
  const removerMembership = await prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: { userId: removedBy, tenantId },
    },
  });

  if (!removerMembership) {
    throw new Error('You are not a member of this organization');
  }

  const targetMembership = await prisma.tenantMembership.findUnique({
    where: {
      userId_tenantId: { userId: targetUserId, tenantId },
    },
  });

  if (!targetMembership) {
    throw new Error('Target user is not a member');
  }

  // Check if remover can manage target user
  if (!canManageUser(removerMembership.role, targetMembership.role)) {
    throw new Error('Cannot remove users with equal or higher role');
  }

  // Reassign owned resources to tenant admin
  const tenantAdmin = await prisma.tenantMembership.findFirst({
    where: {
      tenantId,
      role: Role.TENANT_ADMIN,
      userId: { not: targetUserId },
    },
  });

  if (tenantAdmin) {
    await prisma.project.updateMany({
      where: {
        tenantId,
        ownerId: targetUserId,
      },
      data: {
        ownerId: tenantAdmin.userId,
      },
    });
  }

  // Remove membership
  await prisma.tenantMembership.delete({
    where: {
      userId_tenantId: { userId: targetUserId, tenantId },
    },
  });

  // Log for audit trail
  await prisma.auditLog.create({
    data: {
      action: 'USER_REMOVED',
      tenantId,
      userId: removedBy,
      metadata: {
        removedUserId: targetUserId,
        removedUserRole: targetMembership.role,
      },
    },
  });
}
```

---

## Attribute-Based Access Control (ABAC) {#abac}

For complex permission rules beyond simple roles:

```typescript
// src/services/abac.service.ts
interface AccessContext {
  user: {
    id: string;
    role: Role;
    tenantId: string;
  };
  resource: {
    type: 'project' | 'document' | 'api_key';
    id: string;
    ownerId: string;
    tenantId: string;
    sensitivity?: 'public' | 'internal' | 'confidential';
  };
  action: 'view' | 'create' | 'update' | 'delete';
}

export function checkAccess(context: AccessContext): boolean {
  const { user, resource, action } = context;

  // Super rule: resource must belong to user's tenant
  if (resource.tenantId !== user.tenantId) {
    return false;
  }

  // Tenant admins can do anything within tenant
  if (user.role === Role.TENANT_ADMIN) {
    return true;
  }

  // Resource owner can do anything with their resources
  if (resource.ownerId === user.id) {
    return true;
  }

  // Managers can view all, edit non-confidential
  if (user.role === Role.MANAGER) {
    if (action === 'view') return true;
    if (resource.sensitivity === 'confidential') return false;
    return ['create', 'update', 'delete'].includes(action);
  }

  // Members can view and create
  if (user.role === Role.MEMBER) {
    return ['view', 'create'].includes(action);
  }

  // Viewers can only view
  if (user.role === Role.VIEWER) {
    return action === 'view';
  }

  return false;
}
```

---

## Testing RBAC

### Unit Tests

```typescript
// tests/permissions.test.ts
import { hasPermission, canManageUser } from '@/utils/permissions';
import { Role } from '@prisma/client';

describe('Permission Utilities', () => {
  describe('hasPermission', () => {
    it('should allow tenant admin to access manager-level features', () => {
      expect(hasPermission(Role.TENANT_ADMIN, Role.MANAGER)).toBe(true);
    });

    it('should not allow member to access manager-level features', () => {
      expect(hasPermission(Role.MEMBER, Role.MANAGER)).toBe(false);
    });
  });

  describe('canManageUser', () => {
    it('should allow manager to manage members', () => {
      expect(canManageUser(Role.MANAGER, Role.MEMBER)).toBe(true);
    });

    it('should not allow manager to manage other managers', () => {
      expect(canManageUser(Role.MANAGER, Role.MANAGER)).toBe(false);
    });
  });
});
```

### Integration Tests

```typescript
// tests/api/users.test.ts
describe('User Management API', () => {
  it('should allow tenant admin to invite users', async () => {
    const response = await request(app)
      .post(`/api/tenants/${tenantId}/invite`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'newuser@example.com',
        role: Role.MEMBER,
      });

    expect(response.status).toBe(201);
  });

  it('should not allow member to invite users', async () => {
    const response = await request(app)
      .post(`/api/tenants/${tenantId}/invite`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        email: 'newuser@example.com',
        role: Role.MEMBER,
      });

    expect(response.status).toBe(403);
  });
});
```

### E2E Tests

```typescript
// tests/e2e/rbac.spec.ts
import { test, expect } from '@playwright/test';

test('member cannot access billing page', async ({ page }) => {
  await page.goto('/login');
  await loginAs(page, 'member@example.com');

  await page.goto('/billing');

  await expect(page).toHaveURL('/unauthorized');
  await expect(page.getByText('Insufficient Permissions')).toBeVisible();
});

test('tenant admin can access billing page', async ({ page }) => {
  await page.goto('/login');
  await loginAs(page, 'admin@example.com');

  await page.goto('/billing');

  await expect(page).toHaveURL('/billing');
  await expect(page.getByText('Billing')).toBeVisible();
});
```

---

## Checklist

Before implementing RBAC:

- [ ] Database schema includes User, TenantMembership, and Role enum
- [ ] Role hierarchy defined (Viewer < Member < Manager < Tenant Admin)
- [ ] Permission matrix documented for all features
- [ ] Backend role guards implemented
- [ ] Ownership verification added to all resource endpoints
- [ ] Frontend permission hooks created
- [ ] Protected routes configured
- [ ] Invitation flow implemented (invite, accept, reminder emails)
- [ ] User removal flow implemented (resource reassignment)
- [ ] Audit logging enabled for role changes and user management
- [ ] Unit tests for permission utilities
- [ ] Integration tests for API endpoints
- [ ] E2E tests for role-based UI access
- [ ] Documentation updated with custom roles (if applicable)

---

## Related Documentation

**Prerequisites:**
- `docs/09-saas-specific/saas-architecture.md` - Multi-tenancy foundation
- `docs/rules/security-privacy.md` - Authentication, PII handling

**Related Topics:**
- `docs/09-saas-specific/subscription-billing.md` - Plan-based permissions
- `docs/08-analytics/analytics.md` - Tracking permission events
- `docs/rules/api-design.md` - Authorization in API endpoints

**Next Steps:**
- Implement audit logging for all permission changes
- Add role-based feature flags
- Build team management UI

---

**Last Updated:** 2025-12-22
**Estimated Read Time:** 25 minutes
**Complexity:** Advanced
