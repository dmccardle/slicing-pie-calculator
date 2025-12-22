-- ============================================================================
-- Database Migration Template
-- ============================================================================
--
-- This template follows all rules from docs/rules/api-design.md and
-- docs/09-saas-specific/saas-architecture.md:
-- - ✅ Multi-tenant row-level security
-- - ✅ Proper indexes for performance
-- - ✅ Constraints and validation
-- - ✅ Soft deletes (deletedAt)
-- - ✅ Audit fields (createdAt, updatedAt, createdById)
-- - ✅ Idempotent migrations (IF NOT EXISTS)
--
-- Usage:
-- 1. Copy this file to prisma/migrations/[timestamp]_[description]/migration.sql
-- 2. Replace [table_name] with your table name (plural, snake_case)
-- 3. Add your custom columns
-- 4. Update indexes and constraints
-- 5. Run: npx prisma migrate dev --name [description]
--
-- ============================================================================

-- ============================================================================
-- CREATE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS [table_name] (
  -- Primary Key (UUID recommended for distributed systems)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-Tenant Isolation (REQUIRED for all tables)
  tenant_id UUID NOT NULL,

  -- Business Fields (Replace with your fields)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',

  -- Audit Fields (REQUIRED)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  created_by_id UUID, -- User who created this record

  -- Constraints
  CONSTRAINT [table_name]_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT [table_name]_status_valid CHECK (status IN ('active', 'inactive', 'archived'))
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- CRITICAL: Index on tenant_id for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_[table_name]_tenant_id
  ON [table_name](tenant_id)
  WHERE deleted_at IS NULL;

-- Index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_[table_name]_deleted_at
  ON [table_name](deleted_at);

-- Composite index for common queries (tenant + status)
CREATE INDEX IF NOT EXISTS idx_[table_name]_tenant_status
  ON [table_name](tenant_id, status)
  WHERE deleted_at IS NULL;

-- Index for created_at (for sorting by newest)
CREATE INDEX IF NOT EXISTS idx_[table_name]_created_at
  ON [table_name](created_at DESC);

-- Add custom indexes here based on your query patterns
-- CREATE INDEX IF NOT EXISTS idx_[table_name]_custom
--   ON [table_name](custom_field);

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

-- Link to tenants table
ALTER TABLE [table_name]
  ADD CONSTRAINT fk_[table_name]_tenant
  FOREIGN KEY (tenant_id)
  REFERENCES tenants(id)
  ON DELETE CASCADE;

-- Link to users table (creator)
ALTER TABLE [table_name]
  ADD CONSTRAINT fk_[table_name]_created_by
  FOREIGN KEY (created_by_id)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Add custom foreign keys here
-- ALTER TABLE [table_name]
--   ADD CONSTRAINT fk_[table_name]_custom
--   FOREIGN KEY (custom_id)
--   REFERENCES custom_table(id)
--   ON DELETE CASCADE;

-- ============================================================================
-- ROW-LEVEL SECURITY (PostgreSQL RLS)
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see records from their tenant
CREATE POLICY [table_name]_tenant_isolation ON [table_name]
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy: Users can only insert records for their tenant
CREATE POLICY [table_name]_tenant_insert ON [table_name]
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy: Users can only update records from their tenant
CREATE POLICY [table_name]_tenant_update ON [table_name]
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy: Users can only delete records from their tenant
CREATE POLICY [table_name]_tenant_delete ON [table_name]
  FOR DELETE
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_[table_name]_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_[table_name]_updated_at();

-- ============================================================================
-- UNIQUE CONSTRAINTS (Optional)
-- ============================================================================

-- Example: Unique name per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_[table_name]_tenant_name_unique
  ON [table_name](tenant_id, LOWER(name))
  WHERE deleted_at IS NULL;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE [table_name] IS 'Stores [business entity description]';
COMMENT ON COLUMN [table_name].id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN [table_name].tenant_id IS 'Multi-tenant isolation (REQUIRED)';
COMMENT ON COLUMN [table_name].name IS 'Display name for the [entity]';
COMMENT ON COLUMN [table_name].description IS 'Optional description';
COMMENT ON COLUMN [table_name].status IS 'Current status (active, inactive, archived)';
COMMENT ON COLUMN [table_name].metadata IS 'Flexible JSON storage for custom fields';
COMMENT ON COLUMN [table_name].created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN [table_name].updated_at IS 'Timestamp when record was last updated';
COMMENT ON COLUMN [table_name].deleted_at IS 'Soft delete timestamp (NULL = active)';
COMMENT ON COLUMN [table_name].created_by_id IS 'User who created this record';

-- ============================================================================
-- ROLLBACK (for testing)
-- ============================================================================

/*
-- To rollback this migration:
DROP TRIGGER IF EXISTS trigger_[table_name]_updated_at ON [table_name];
DROP FUNCTION IF EXISTS update_[table_name]_updated_at();
DROP POLICY IF EXISTS [table_name]_tenant_delete ON [table_name];
DROP POLICY IF EXISTS [table_name]_tenant_update ON [table_name];
DROP POLICY IF EXISTS [table_name]_tenant_insert ON [table_name];
DROP POLICY IF EXISTS [table_name]_tenant_isolation ON [table_name];
DROP TABLE IF EXISTS [table_name] CASCADE;
*/

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

/*
-- Set tenant context (required for RLS)
SET app.current_tenant_id = 'your-tenant-uuid';

-- Insert a record
INSERT INTO [table_name] (tenant_id, name, description, created_by_id)
VALUES (
  'your-tenant-uuid',
  'Example Name',
  'Example Description',
  'user-uuid'
);

-- Query records (automatically filtered by tenant via RLS)
SELECT * FROM [table_name]
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- Update a record
UPDATE [table_name]
SET name = 'New Name'
WHERE id = 'record-uuid';

-- Soft delete a record
UPDATE [table_name]
SET deleted_at = NOW()
WHERE id = 'record-uuid';

-- Count active records per tenant
SELECT tenant_id, COUNT(*) as total
FROM [table_name]
WHERE deleted_at IS NULL
GROUP BY tenant_id;
*/
