-- LOCALS MVP Week 2 Schema 추가분
-- Week 1 schema.sql을 먼저 실행한 후 이 파일을 실행하세요

-- =============================================
-- match_requests 테이블이 Week 1에서 이미 생성됨
-- projects 테이블이 Week 1에서 이미 생성됨
-- 아래는 누락된 경우를 위한 보완 스크립트
-- =============================================

-- match_requests 테이블 (Week 1에 없는 경우)
CREATE TABLE IF NOT EXISTS public.match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성 (중복 방지)
DROP POLICY IF EXISTS "match_requests: 관련자 조회" ON public.match_requests;
DROP POLICY IF EXISTS "match_requests: 본인만 삽입" ON public.match_requests;
DROP POLICY IF EXISTS "match_requests: 대상자만 수정" ON public.match_requests;

CREATE POLICY "match_requests: 관련자 조회"
  ON public.match_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "match_requests: 본인만 삽입"
  ON public.match_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- 대상자(target)가 상태 변경 가능 (수락/거절)
CREATE POLICY "match_requests: 대상자만 수정"
  ON public.match_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = target_id);

-- =============================================
-- projects 테이블 (Week 1에 없는 경우)
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.match_requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  start_date DATE,
  end_date DATE,
  duration_weeks INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects: 관련자 조회" ON public.projects;

CREATE POLICY "projects: 관련자 조회"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
  );

-- 서비스 롤(API)이 프로젝트를 생성할 수 있도록 (RLS bypass)
-- 실제 삽입은 API 라우트에서 service_role key를 통해 이루어짐
CREATE POLICY "projects: service role 삽입"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
  );

-- =============================================
-- profiles 테이블에 인덱스 추가 (성능)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_shops_category ON public.shops(category);
CREATE INDEX IF NOT EXISTS idx_shops_budget_range ON public.shops(budget_range);
CREATE INDEX IF NOT EXISTS idx_student_profiles_interests ON public.student_profiles USING gin(interests);
CREATE INDEX IF NOT EXISTS idx_match_requests_requester ON public.match_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_target ON public.match_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON public.match_requests(status);
