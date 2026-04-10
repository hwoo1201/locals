-- LOCALS MVP Week 1 Schema
-- Supabase SQL Editor에서 실행하세요

-- =============================================
-- 1. profiles 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('owner', 'student')),
  name TEXT NOT NULL,
  phone TEXT,
  region TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 전체 조회 가능
CREATE POLICY "profiles: 전체 조회 가능"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

-- 본인만 삽입 가능
CREATE POLICY "profiles: 본인만 삽입"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인만 수정 가능
CREATE POLICY "profiles: 본인만 수정"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 2. shops 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('카페', '음식점', '소매', '뷰티', '기타')),
  address TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  sns_accounts JSONB DEFAULT '{}',
  marketing_needs TEXT,
  budget_range TEXT CHECK (budget_range IN ('10만원 미만', '10~30만원', '30~50만원', '50~100만원', '100만원 이상')),
  goals TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- 전체 조회 가능
CREATE POLICY "shops: 전체 조회 가능"
  ON public.shops FOR SELECT
  TO authenticated, anon
  USING (true);

-- 본인만 삽입
CREATE POLICY "shops: 본인만 삽입"
  ON public.shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- 본인만 수정
CREATE POLICY "shops: 본인만 수정"
  ON public.shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 본인만 삭제
CREATE POLICY "shops: 본인만 삭제"
  ON public.shops FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE TRIGGER shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 3. student_profiles 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  interests TEXT[] DEFAULT '{}',
  available_channels JSONB DEFAULT '{}',
  experience TEXT,
  portfolio_url TEXT,
  preferred_categories TEXT[] DEFAULT '{}',
  available_regions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- 전체 조회 가능
CREATE POLICY "student_profiles: 전체 조회 가능"
  ON public.student_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

-- 본인만 삽입
CREATE POLICY "student_profiles: 본인만 삽입"
  ON public.student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인만 수정
CREATE POLICY "student_profiles: 본인만 수정"
  ON public.student_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 4. match_requests 테이블
-- =============================================
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

-- 관련자만 조회
CREATE POLICY "match_requests: 관련자 조회"
  ON public.match_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- 본인만 삽입
CREATE POLICY "match_requests: 본인만 삽입"
  ON public.match_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- 대상자만 상태 변경
CREATE POLICY "match_requests: 대상자만 수정"
  ON public.match_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = target_id);

-- =============================================
-- 5. projects 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.match_requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  start_date DATE,
  end_date DATE,
  duration_weeks INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects: 관련자 조회"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
  );

-- =============================================
-- 6. Storage 버킷 (Supabase 대시보드에서도 설정 가능)
-- =============================================
-- shop-photos 버킷 생성 (공개)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-photos', 'shop-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 인증 사용자만 업로드
CREATE POLICY "shop-photos: 인증 사용자 업로드"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shop-photos');

-- 전체 공개 조회
CREATE POLICY "shop-photos: 전체 공개 조회"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'shop-photos');

-- 본인 파일만 삭제
CREATE POLICY "shop-photos: 본인 파일 삭제"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'shop-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
