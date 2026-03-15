-- ============================================================
-- Migration: 00002_create_profiles
-- Description: User profiles with role-based access control
-- ============================================================

-- Role enum
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff', 'viewer');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_brand_id ON profiles (brand_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles (is_active);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE profiles IS '사용자 프로필 (역할 기반 접근 제어)';
COMMENT ON COLUMN profiles.role IS '역할: owner(대표), manager(관리자), staff(직원), viewer(뷰어)';
COMMENT ON COLUMN profiles.is_active IS '활성 상태';
