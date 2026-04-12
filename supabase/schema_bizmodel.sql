-- =====================================================
-- 비즈니스 모델 변경: 첫 급여 수수료 구조
-- 김과외 벤치마킹: 매칭까지만 개입, 첫 급여에서만 수수료 수취
-- =====================================================

-- 1. student_profiles: 희망 급여 + 통계 컬럼 추가
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS desired_pay integer,
  ADD COLUMN IF NOT EXISTS completed_projects_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_pay integer;

COMMENT ON COLUMN student_profiles.desired_pay IS '희망 월 급여 (만원 단위)';
COMMENT ON COLUMN student_profiles.completed_projects_count IS '완료된 프로젝트 수';
COMMENT ON COLUMN student_profiles.avg_pay IS '완료 프로젝트 기반 평균 급여 (만원 단위, 자동 계산)';

-- 2. projects: 급여 합의 + 수수료 구조 컬럼 추가
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS agreed_pay integer,
  ADD COLUMN IF NOT EXISTS commission_rate integer DEFAULT 20,
  ADD COLUMN IF NOT EXISTS commission_amount integer,
  ADD COLUMN IF NOT EXISTS commission_status text DEFAULT 'pending'
    CHECK (commission_status IN ('pending', 'paid', 'waived'));

COMMENT ON COLUMN projects.agreed_pay IS '소상공인이 대학생에게 지급할 합의된 월 급여 (만원 단위)';
COMMENT ON COLUMN projects.commission_rate IS '플랫폼 수수료율 (%, 기본 20%)';
COMMENT ON COLUMN projects.commission_amount IS '수수료 금액 = agreed_pay * commission_rate / 100 (만원)';
COMMENT ON COLUMN projects.commission_status IS '수수료 납부 상태: pending | paid | waived';

-- 3. pay_stats: 업종·지역별 급여 통계 테이블
CREATE TABLE IF NOT EXISTS pay_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  region text NOT NULL,
  avg_pay integer NOT NULL,
  min_pay integer NOT NULL,
  max_pay integer NOT NULL,
  sample_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE pay_stats IS '업종·지역별 급여 통계. 프로젝트 완료 시 수동 또는 트리거로 업데이트.';

-- 4. RLS 정책
-- CREATE POLICY는 IF NOT EXISTS를 지원하지 않으므로 DO 블록으로 중복 방지

-- projects.commission_status: service_role(관리자)만 변경 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'commission_status는 관리자만 변경'
  ) THEN
    CREATE POLICY "commission_status는 관리자만 변경"
      ON projects FOR UPDATE
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- projects.agreed_pay: 프로젝트 참여자(소상공인 + 대학생)만 조회
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = '참여자만 프로젝트 조회 가능'
  ) THEN
    CREATE POLICY "참여자만 프로젝트 조회 가능"
      ON projects FOR SELECT
      USING (
        student_id = auth.uid()
        OR shop_id IN (
          SELECT id FROM shops WHERE owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- pay_stats RLS 활성화
ALTER TABLE pay_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pay_stats' AND policyname = 'pay_stats 읽기: 인증 유저'
  ) THEN
    CREATE POLICY "pay_stats 읽기: 인증 유저"
      ON pay_stats FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pay_stats' AND policyname = 'pay_stats 쓰기: service_role만'
  ) THEN
    CREATE POLICY "pay_stats 쓰기: service_role만"
      ON pay_stats FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
