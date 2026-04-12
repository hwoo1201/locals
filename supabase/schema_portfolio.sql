-- 대학생 프로필 작업물 이미지 컬럼 추가
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS portfolio_images jsonb DEFAULT '[]'::jsonb;

-- portfolio-images 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 스토리지 RLS: 인증된 사용자만 업로드
CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Portfolio images are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Users can delete own portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);
