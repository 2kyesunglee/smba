-- ====================================================================
-- SafeGuard AI (세이프가드 AI)
-- 003_worker_approval_and_persistence.sql
-- 근로자 모바일 가입 요청, 관리자 연동 승인 처리 및 마스터 DB 영속화 스키마
-- ====================================================================

-- 1. 근로자 테이블 인덱스 최적화 (승인 대기열 및 마스터 DB 검색 성능 고도화)
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_phone_number ON workers(phone_number);
CREATE INDEX IF NOT EXISTS idx_workers_nationality ON workers(nationality);

-- 2. 근로자 연동 승인 프로시저 (RPC 함수)
-- 관리자가 웹에서 승인 버튼 클릭 시 workers 상태를 ACTIVE로 변경하고 users 계정을 활성화
CREATE OR REPLACE FUNCTION approve_worker_app_link(
    p_worker_id UUID,
    p_admin_name VARCHAR(100) DEFAULT '김공장장 (총괄 관리자)',
    p_alien_reg_number VARCHAR(50) DEFAULT NULL,
    p_korean_name VARCHAR(100) DEFAULT NULL,
    p_visa_type VARCHAR(20) DEFAULT NULL,
    p_blood_type VARCHAR(10) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_worker RECORD;
    v_result JSONB;
BEGIN
    -- 1) 근로자 레코드 조회
    SELECT * INTO v_worker FROM workers WHERE id = p_worker_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', '해당 근로자 정보를 찾을 수 없습니다.'
        );
    END IF;

    -- 2) 근로자 상태 ACTIVE로 업데이트 및 보완 인사 정보 반영
    UPDATE workers
    SET
        status = 'ACTIVE',
        alien_reg_number = COALESCE(p_alien_reg_number, alien_reg_number, '미등록 (차후보완)'),
        korean_name = COALESCE(p_korean_name, korean_name),
        visa_type = COALESCE(p_visa_type, visa_type),
        updated_at = NOW()
    WHERE id = p_worker_id;

    -- 3) 연결된 스마트폰 users 계정 활성화 (is_active = TRUE)
    UPDATE users
    SET
        is_active = TRUE,
        updated_at = NOW()
    WHERE worker_id = p_worker_id OR phone_number = v_worker.phone_number;

    -- 4) 성공 결과 반환
    RETURN jsonb_build_object(
        'success', TRUE,
        'worker_id', p_worker_id,
        'status', 'ACTIVE',
        'message', '근로자 계정이 성공적으로 승인되어 전체 마스터 DB로 연동 활성화되었습니다.'
    );
END;
$$;

-- 3. 근로자 가입 및 승인 감사 로그 테이블 (worker_approval_logs)
CREATE TABLE IF NOT EXISTS worker_approval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    worker_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    action_type VARCHAR(30) NOT NULL, -- 'SIGNUP_REQUESTED', 'APPROVED', 'REJECTED', 'DELETED'
    approved_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_logs_worker_id ON worker_approval_logs(worker_id);
