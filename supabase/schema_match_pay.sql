-- =====================================================
-- 매칭 플로우 개선: 요청 시 제안 급여 추가
-- =====================================================

-- match_requests: 요청 시 제안 급여 컬럼 추가
ALTER TABLE match_requests
  ADD COLUMN IF NOT EXISTS proposed_pay integer;

COMMENT ON COLUMN match_requests.proposed_pay IS '매칭 요청 시 제안하는 월 급여 (만원 단위)';
