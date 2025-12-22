/**
 * API Endpoint Template
 *
 * This template follows all rules from docs/rules/api-design.md:
 * - ✅ Versioned endpoint (/api/v1/)
 * - ✅ Standard response format
 * - ✅ Proper error handling
 * - ✅ Input validation
 * - ✅ Authentication required
 * - ✅ Multi-tenant context
 * - ✅ TypeScript types
 *
 * Usage:
 * 1. Copy this file to src/app/api/v1/[resource]/route.ts
 * 2. Replace [RESOURCE] with your resource name
 * 3. Update schema validation
 * 4. Implement business logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';
import { checkPermission } from '@/utils/permissions';
import { trackEvent } from '@/lib/analytics';

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

// Input validation schema
const [RESOURCE]CreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  // Add your fields here
});

const [RESOURCE]UpdateSchema = [RESOURCE]CreateSchema.partial();

type [RESOURCE]CreateInput = z.infer<typeof [RESOURCE]CreateSchema>;
type [RESOURCE]UpdateInput = z.infer<typeof [RESOURCE]UpdateSchema>;

// Standard API response format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// ============================================================================
// GET /api/v1/[resource]
// List all [resource]s for current tenant
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const auth = await requireAuth(req);
    if (!auth.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // 2. Get tenant context
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'TENANT_REQUIRED',
            message: 'Tenant context required',
          },
        },
        { status: 400 }
      );
    }

    // 3. Check permissions
    const hasPermission = await checkPermission(auth.user.id, tenantId, 'view_[resource]s');
    if (!hasPermission) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
        { status: 403 }
      );
    }

    // 4. Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 5. Query database (with tenant isolation)
    const [[RESOURCE]s, total] = await Promise.all([
      prisma.[resource].findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.[resource].count({
        where: { tenantId },
      }),
    ]);

    // 6. Track analytics
    trackEvent('[RESOURCE]s Listed', {
      tenant_id: tenantId,
      count: [RESOURCE]s.length,
      page,
    });

    // 7. Return response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: [RESOURCE]s,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/v1/[resource] error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/v1/[resource]
// Create a new [resource]
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const auth = await requireAuth(req);
    if (!auth.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // 2. Get tenant context
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'TENANT_REQUIRED',
            message: 'Tenant context required',
          },
        },
        { status: 400 }
      );
    }

    // 3. Check permissions
    const hasPermission = await checkPermission(auth.user.id, tenantId, 'create_[resource]s');
    if (!hasPermission) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
        { status: 403 }
      );
    }

    // 4. Parse and validate request body
    const body = await req.json();
    const validation = [RESOURCE]CreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const data: [RESOURCE]CreateInput = validation.data;

    // 5. Check feature limits (plan-based)
    const { allowed, limit, current } = await checkFeatureLimit(tenantId, '[resource]s');
    if (!allowed) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'LIMIT_REACHED',
            message: `[RESOURCE] limit reached. You have ${current}/${limit} [resource]s. Upgrade your plan to create more.`,
          },
        },
        { status: 402 } // Payment Required
      );
    }

    // 6. Create [resource] in database
    const [resource] = await prisma.[resource].create({
      data: {
        ...data,
        tenantId,
        createdById: auth.user.id,
      },
    });

    // 7. Track analytics
    trackEvent('[RESOURCE] Created', {
      tenant_id: tenantId,
      [resource]_id: [resource].id,
      created_by: auth.user.id,
    });

    // 8. Return response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: [resource],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/v1/[resource] error:', error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'A [resource] with this name already exists',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/v1/[resource]/[id]
// Update an existing [resource]
// (Create this in /api/v1/[resource]/[id]/route.ts)
// ============================================================================

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication
    const auth = await requireAuth(req);
    if (!auth.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // 2. Get tenant context
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'TENANT_REQUIRED',
            message: 'Tenant context required',
          },
        },
        { status: 400 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validation = [RESOURCE]UpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const data: [RESOURCE]UpdateInput = validation.data;

    // 4. Verify [resource] exists and belongs to tenant
    const existing = await prisma.[resource].findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '[RESOURCE] not found',
          },
        },
        { status: 404 }
      );
    }

    if (existing.tenantId !== tenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '[RESOURCE] does not belong to this tenant',
          },
        },
        { status: 403 }
      );
    }

    // 5. Check permissions (ownership or role-based)
    const canUpdate =
      existing.createdById === auth.user.id ||
      (await checkPermission(auth.user.id, tenantId, 'update_any_[resource]'));

    if (!canUpdate) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to update this [resource]',
          },
        },
        { status: 403 }
      );
    }

    // 6. Update [resource]
    const updated = await prisma.[resource].update({
      where: { id: params.id },
      data,
    });

    // 7. Track analytics
    trackEvent('[RESOURCE] Updated', {
      tenant_id: tenantId,
      [resource]_id: params.id,
      updated_by: auth.user.id,
    });

    // 8. Return response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/v1/[resource]/[id] error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/v1/[resource]/[id]
// Delete a [resource]
// (Create this in /api/v1/[resource]/[id]/route.ts)
// ============================================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication
    const auth = await requireAuth(req);
    if (!auth.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // 2. Get tenant context
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'TENANT_REQUIRED',
            message: 'Tenant context required',
          },
        },
        { status: 400 }
      );
    }

    // 3. Verify [resource] exists and belongs to tenant
    const existing = await prisma.[resource].findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '[RESOURCE] not found',
          },
        },
        { status: 404 }
      );
    }

    if (existing.tenantId !== tenantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '[RESOURCE] does not belong to this tenant',
          },
        },
        { status: 403 }
      );
    }

    // 4. Check permissions (ownership or role-based)
    const canDelete =
      existing.createdById === auth.user.id ||
      (await checkPermission(auth.user.id, tenantId, 'delete_any_[resource]'));

    if (!canDelete) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to delete this [resource]',
          },
        },
        { status: 403 }
      );
    }

    // 5. Delete [resource]
    await prisma.[resource].delete({
      where: { id: params.id },
    });

    // 6. Track analytics
    trackEvent('[RESOURCE] Deleted', {
      tenant_id: tenantId,
      [resource]_id: params.id,
      deleted_by: auth.user.id,
    });

    // 7. Return response
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { deleted: true },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/v1/[resource]/[id] error:', error);

    return NextResponse.json<ApiResponse>(
      {
          success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
