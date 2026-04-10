-- LOCALS MVP Week 3 Schema
-- schema.sql → schema_week2.sql → 이 파일 순서로 실행

-- =============================================
-- metrics 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  measured_at TEXT NOT NULL CHECK (measured_at IN ('before', 'after')),
  followers INTEGER,
  visitors INTEGER,
  revenue INTEGER,
  posts_count INTEGER,
  likes INTEGER,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(project_id, measured_at)
);

ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metrics: 관련자 조회" ON public.metrics;
CREATE POLICY "metrics: 관련자 조회"
  ON public.metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.shops s ON s.id = p.shop_id
      WHERE p.id = project_id
        AND (p.student_id = auth.uid() OR s.owner_id = auth.uid())
    )
  );

CREATE TRIGGER metrics_updated_at
  BEFORE UPDATE ON public.metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_metrics_project_id ON public.metrics(project_id);

-- =============================================
-- reviews 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(project_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews: 전체 조회" ON public.reviews;
CREATE POLICY "reviews: 전체 조회"
  ON public.reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON public.reviews(project_id);

-- =============================================
-- projects: status 업데이트 권한 (관련자만)
-- =============================================
DROP POLICY IF EXISTS "projects: 관련자 수정" ON public.projects;
CREATE POLICY "projects: 관련자 수정"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
  );
