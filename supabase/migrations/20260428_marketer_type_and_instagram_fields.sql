-- MATCHR 리팩토링: 마케터 유형 확장 + 인스타 정보계정 필드 추가
-- 실행 전 Supabase Dashboard > SQL Editor에서 실행하거나 supabase db push 사용

-- 1. student_profiles에 marketer_type 컬럼 추가
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS marketer_type TEXT
    CHECK (marketer_type IN ('student', 'instagram_content_creator', 'freelancer_junior', 'sidejob', 'other'))
    DEFAULT 'student';

-- 2. 인스타 정보계정 전용 필드 추가
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS instagram_handle  TEXT,        -- @핸들
  ADD COLUMN IF NOT EXISTS page_topic        TEXT,        -- 페이지 주제
  ADD COLUMN IF NOT EXISTS follower_range    TEXT         -- 팔로워 수 범위
    CHECK (follower_range IN ('under_1k', '1k_to_5k', '5k_to_10k', '10k_to_50k', '50k_to_100k', 'over_100k')),
  ADD COLUMN IF NOT EXISTS content_format    JSONB;       -- 주력 콘텐츠 형태 (복수선택)

-- 3. shops.budget_range CHECK 제약 업데이트
--    기존 제약이 있으면 먼저 제거 후 재설정
ALTER TABLE shops DROP CONSTRAINT IF EXISTS shops_budget_range_check;

ALTER TABLE shops
  ADD CONSTRAINT shops_budget_range_check
    CHECK (budget_range IN (
      'free_or_negotiable',
      'under_100k',
      '100k_to_300k',
      '300k_to_500k',
      '500k_to_1m',
      'over_1m'
    ));

-- 4. 기존 budget_range 데이터 마이그레이션 (기존값 → 신규값)
UPDATE shops SET budget_range = 'under_100k'    WHERE budget_range = '10만 원 미만';
UPDATE shops SET budget_range = '100k_to_300k'  WHERE budget_range = '10~20만 원';
UPDATE shops SET budget_range = '300k_to_500k'  WHERE budget_range = '20~30만 원';
UPDATE shops SET budget_range = 'over_1m'       WHERE budget_range = '30만 원 이상';
