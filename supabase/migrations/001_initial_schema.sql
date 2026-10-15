-- ====================================================================
-- SafeGuard AI (세이프가드 AI)
-- 001_initial_schema.sql
-- 외국인 근로자 안전 보건 및 설비 관리 솔루션 데이터베이스 스키마
-- ====================================================================

-- 1. 근로자 인사기록카드 테이블 (workers)
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    korean_name VARCHAR(100),
    alien_reg_number VARCHAR(50), -- 외국인등록번호
    phone_number VARCHAR(30) UNIQUE NOT NULL, -- 스마트폰 번호 (계정 연동 키)
    nationality VARCHAR(50) NOT NULL, -- 16개국 (VN, PH, MN, TH, ID, UZ, PK, KH, CN, BD, NP, MM, LK, TL, LA, KZ 등)
    visa_type VARCHAR(20) NOT NULL, -- E-9, E-7, H-2, F-4 등
    gender VARCHAR(10) DEFAULT 'M',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, ACTIVE, INACTIVE, LEAVE
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    departure_date DATE,
    re_entry_allowed BOOLEAN DEFAULT FALSE,
    special_health_check_date DATE, -- 특수건강검진 예정일
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 사용자 계정 및 인증 테이블 (users)
-- JWT 기반 인증 및 역할(Role: admin, worker, senior_worker)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'worker', -- 'admin', 'worker', 'senior_worker'
    app_language VARCHAR(10) NOT NULL DEFAULT 'ko', -- 선호 언어
    device_token VARCHAR(255), -- 모바일 푸시 알림용 디바이스 토큰
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 안전수칙 / 교육 / LOTO / MSDS / 점검표 템플릿 (templates)
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'SAFETY_RULES', 'EDUCATION', 'LOTO', 'MSDS', 'CHECKLIST'
    description TEXT,
    content_json JSONB NOT NULL, -- 다국어 번역 키-값 구조, 체크리스트 항목 등
    is_required BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 기기 / 화학물질 QR 코드 매핑 (equipment_qr)
CREATE TABLE IF NOT EXISTS equipment_qr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_hash VARCHAR(100) UNIQUE NOT NULL, -- QR 해시 식별자
    name VARCHAR(150) NOT NULL, -- 기기명 or 화학물질명
    category VARCHAR(30) NOT NULL, -- 'EQUIPMENT', 'CHEMICAL'
    type VARCHAR(30) NOT NULL, -- 'LOTO', 'MSDS', 'SAFETY_RULES'
    location VARCHAR(100) NOT NULL, -- 설치 위치 (예: A동 렌더링 구역)
    image_url TEXT,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    caution_notes TEXT, -- 주의사항
    emergency_procedures TEXT, -- 응급조치 / LOTO 해제 절차
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 전자서명 증빙 테이블 (signatures)
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    reference_type VARCHAR(30) NOT NULL, -- 'TBM', 'SAFETY_EDUCATION', 'PTW'
    reference_id UUID, -- ptw_requests id 등과 연결
    worker_name VARCHAR(100) NOT NULL,
    signature_image_url TEXT NOT NULL, -- Base64 캔버스 서명 이미지
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 안전작업허가서 (ptw_requests)
CREATE TABLE IF NOT EXISTS ptw_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ptw_number VARCHAR(50) UNIQUE NOT NULL,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    work_date DATE NOT NULL,
    hazard_factors TEXT, -- 위험 요인
    safety_measures TEXT, -- 안전 대책
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED', -- 'REQUESTED', 'APPROVED', 'REJECTED'
    approved_by UUID REFERENCES users(id),
    worker_signed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 설비 점검 로그 (inspections)
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment_qr(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    data_json JSONB NOT NULL, -- { "temperature": 135, "pressure": 2.1, "noise": "정상" }
    is_abnormal BOOLEAN DEFAULT FALSE,
    abnormal_notes TEXT,
    inspected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Before & After 사진 작업 완료 보고 (work_reports)
CREATE TABLE IF NOT EXISTS work_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    before_img TEXT NOT NULL, -- 작업 전 사진 URL / Base64
    after_img TEXT NOT NULL, -- 작업 후 사진 URL / Base64
    description TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SOS 비상 호출 (sos_alerts)
CREATE TABLE IF NOT EXISTS sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    worker_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    location VARCHAR(100) NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'TRIGGERED', -- 'TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. 공용 및 출입국 연장 서류 게시판 (documents)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(30) NOT NULL, -- 'VISA', 'HEALTH', 'COMPLIANCE', 'MANUAL'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_workers_phone ON workers(phone_number);
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_contract_end ON workers(contract_end_date);
CREATE INDEX IF NOT EXISTS idx_signatures_worker ON signatures(worker_id);
CREATE INDEX IF NOT EXISTS idx_ptw_status ON ptw_requests(status);
CREATE INDEX IF NOT EXISTS idx_inspections_abnormal ON inspections(is_abnormal);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_alerts(status);
