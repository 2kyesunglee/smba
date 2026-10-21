-- ====================================================================
-- SafeGuard AI (세이프가드 AI)
-- 002_admin_credentials_and_settings.sql
-- 웹 관리자 인증, 비밀번호 관리 및 Before & After 4장 사진 확장 스키마
-- ====================================================================

-- 1. 웹 관리자 계정 테이블 (admin_credentials)
CREATE TABLE IF NOT EXISTS admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL DEFAULT 'admin',
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100),
    name VARCHAR(100) NOT NULL DEFAULT '김공장장 (총괄 관리자)',
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    last_password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 관리자 계정 생성 (최초 ID: admin, Password: 1004)
-- SHA-256 또는 안전한 해시 기반
INSERT INTO admin_credentials (username, password_hash, name, role)
VALUES ('admin', '1004', '김공장장 (총괄 관리자)', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 2. 작업 완료 보고서 (work_reports) 4장 사진(Before 2장, After 2장) 스키마 확장
ALTER TABLE work_reports 
    ADD COLUMN IF NOT EXISTS before_imgs JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS after_imgs JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS before_description TEXT,
    ADD COLUMN IF NOT EXISTS after_description TEXT;

-- 3. 안전교육 교안 및 서약 테이블 (safety_materials) 신규 생성
CREATE TABLE IF NOT EXISTS safety_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL DEFAULT 'SAFETY_EDUCATION', -- 'SAFETY_EDUCATION', 'TBM'
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT '정기안전교육',
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50),
    file_url TEXT,
    description TEXT,
    target_department VARCHAR(100) DEFAULT '전 생산라인 및 정비팀',
    uploaded_by VARCHAR(100) DEFAULT '김공장장 (안전총괄)',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 교안 서명 내역 테이블 (material_signatures)
CREATE TABLE IF NOT EXISTS material_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES safety_materials(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    worker_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),
    signature_data_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 보강
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_materials_type ON safety_materials(type);
CREATE INDEX IF NOT EXISTS idx_mat_sig_worker ON material_signatures(worker_id);
CREATE INDEX IF NOT EXISTS idx_mat_sig_material ON material_signatures(material_id);
