# MATCHR - 소규모 사업자 × 마케터 매칭 플랫폼

## 프로젝트 개요
MATCHR는 월매출 200만원 이하의 소규모 사업/스타트업/1인창업과,
부담 가능한 비용으로 일할 수 있는 마케터를 연결하는 매칭 플랫폼.

- 클라이언트(client): 월매출 200만원 이하의 소규모 사업, 초기 스타트업, 1인 창업자.
  대형 에이전시나 크몽 고가 패키지가 부담스러운 사람들.
- 마케터(marketer): 대학생, 인스타 정보전달 페이지 운영자, 주니어 프리랜서 등.
  실전 경험, 추가 수익, 또는 자기 페이지 외 협업 기회를 찾는 사람들.

플랫폼 역할: 매칭 + 마케팅 전후 효과분석 대시보드.

## 브랜딩 원칙
- "로컬", "지역", "동네" 등 지역성 강조 워딩 사용 금지
- "소규모", "작은 시작", "1인 창업", "초기 단계" 워딩 적극 사용
- 톤앤매너: 부담 없이, 가볍게, 시작하기 쉽게
- 브랜드명은 src/lib/brand.ts 단일 파일에서 상수로 관리 (하드코딩 금지)

## 기술 스택
- Frontend: Next.js 14 (App Router) + Tailwind CSS 3
- Backend/DB: Supabase (PostgreSQL + Auth + RLS + Storage)
- Hosting: Vercel
- Email: Resend
- Chart: Recharts
- State: Zustand
- 한국어 UI, 모바일 퍼스트

## 유저 타입
1. 클라이언트(client / user_type: "owner"): 사업 등록, 마케터 탐색, 매칭 요청, 데이터 입력, 효과분석 확인
2. 마케터(marketer / user_type: "student"): 프로필 등록, 사업 탐색, 매칭 요청, 프로젝트 진행, 효과분석 확인

## 마케터 유형 (marketer_type)
- student: 대학생 마케터
- instagram_content_creator: 인스타 정보전달 페이지 운영자 (카드뉴스, 정보성 콘텐츠, 큐레이션)
- freelancer_junior: 주니어 프리랜서
- sidejob: 사이드잡 마케터
- other: 기타

## 핵심 플로우
회원가입(타입선택) → 프로필/사업 등록 → 탐색 → 매칭요청 → 수락 → 프로젝트생성 → 기초데이터입력 → (마케팅진행) → 종료데이터입력 → 효과분석대시보드 → 양쪽리뷰

## DB 테이블
- profiles: id, user_id, user_type(owner/student), name, phone, region, bio, avatar_url
- shops: id, owner_id, name, category, address, photos, sns_accounts(json), marketing_needs, budget_range, goals
- student_profiles: id, user_id, marketer_type, interests, available_channels(json), experience, portfolio_url,
  instagram_handle, page_topic, follower_range, content_format(jsonb), preferred_categories, available_regions
- match_requests: id, requester_id, target_id, shop_id, status(pending/accepted/rejected), message, created_at
- projects: id, shop_id, student_id, match_id, status(active/completed), start_date, end_date, duration_weeks
- metrics: id, project_id, measured_at(before/after), followers, visitors, revenue, posts_count, likes, custom_fields(json)
- reviews: id, project_id, reviewer_id, rating, content, created_at

## budget_range 옵션
- 무료/협의 (free_or_negotiable)
- 10만원 이하 (under_100k)
- 10~30만원 (100k_to_300k)
- 30~50만원 (300k_to_500k)
- 50~100만원 (500k_to_1m)
- 100만원 이상 (over_1m)

## 코드 컨벤션
- 한국어 UI, 변수/코드는 영어
- 브랜드명은 반드시 src/lib/brand.ts에서 import해서 사용
- 컴포넌트: src/components/, 페이지: src/app/
- Supabase 클라이언트: src/lib/supabase.ts
- 타입: src/types/index.ts
