-- ============================================================
-- Migration: 00007_create_staff
-- Description: Staff, schedules, and attendance management
-- ============================================================

-- Staff status enum
CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'on_leave');

-- Attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early_leave', 'holiday');

-- -------------------------------------------------------
-- staff: 직원 정보
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  hire_date DATE,
  hourly_wage NUMERIC(10, 2),
  status staff_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_brand_id ON staff (brand_id);
CREATE INDEX IF NOT EXISTS idx_staff_store_id ON staff (store_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff (status);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE staff IS '직원 정보';
COMMENT ON COLUMN staff.hourly_wage IS '시급';

-- -------------------------------------------------------
-- schedules: 근무 일정
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_staff_id ON schedules (staff_id);
CREATE INDEX IF NOT EXISTS idx_schedules_store_id ON schedules (store_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules (date);
CREATE INDEX IF NOT EXISTS idx_schedules_store_date ON schedules (store_id, date);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE schedules IS '근무 일정';
COMMENT ON COLUMN schedules.break_minutes IS '휴식 시간 (분)';

-- -------------------------------------------------------
-- attendance: 출퇴근 기록
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status attendance_status NOT NULL DEFAULT 'present',
  overtime_hours NUMERIC(4, 2) DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_staff_id ON attendance (staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_store_id ON attendance (store_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_staff_date ON attendance (staff_id, date);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE attendance IS '출퇴근 기록';
COMMENT ON COLUMN attendance.overtime_hours IS '초과근무 시간';
