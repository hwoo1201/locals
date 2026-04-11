-- Week 4: contact_method 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_method text;

-- contact_method 수정 정책은 기존 "Users can update own profile" 정책으로 커버됨
-- (contact_method 노출은 애플리케이션 레이어에서 accepted 상태일 때만 표시)
