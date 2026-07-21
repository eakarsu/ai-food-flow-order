-- Add role column to users table for RBAC
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';

-- Existing accounts must not gain administrative access during a migration.
UPDATE users SET role = 'customer' WHERE role IS NULL OR role = 'viewer';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
