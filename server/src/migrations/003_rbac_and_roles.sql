-- Add role column to users table for RBAC
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer';

-- Set all existing users to admin role
UPDATE users SET role = 'admin' WHERE role IS NULL OR role = 'viewer';
