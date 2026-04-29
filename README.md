# 솜씨 (SOMSI)

월매출 200만원 이하 소규모 사업과 마케터를 연결합니다

- **도메인**: somsi.kr
- **발송 이메일**: hello@somsi.kr
- **스택**: Next.js 14 (App Router) · Supabase · Resend · Vercel

## 개발 환경 실행

```bash
cp .env.local.example .env.local
# .env.local에 실제 키 입력 후:
npm install
npm run dev
```

## 환경 변수

`.env.local.example` 참조. 필수 변수:

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (서버 전용) |
| `RESEND_API_KEY` | Resend 이메일 발송 API 키 |
| `NEXT_PUBLIC_SITE_URL` | 배포 URL (예: https://somsi.kr) |

## Supabase 대시보드 설정 체크리스트

배포 후 반드시 아래 항목을 직접 확인하세요.

### ✅ Resend 도메인 검증
- Resend 대시보드 → Domains → `somsi.kr` DNS 레코드가 **Verified** 상태인지 확인
- MX, DKIM, SPF 레코드 모두 통과해야 함

### ✅ Supabase Auth — Custom SMTP 설정
`Authentication → Settings → SMTP Settings` 에서 설정:

| 항목 | 값 |
|------|-----|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API Key |
| Sender email | `hello@somsi.kr` |
| Sender name | `솜씨` |

### ✅ Supabase Auth — Email Templates 한글화
`Authentication → Email Templates` 에서 4개 템플릿 수정:

**Confirm signup**
- Subject: `솜씨 이메일 인증을 완료해주세요`
- Body: 아래 버튼을 클릭해 인증을 완료해주세요. `{{ .ConfirmationURL }}`

**Magic Link**
- Subject: `솜씨 로그인 링크`

**Reset Password**
- Subject: `솜씨 비밀번호 재설정`

**Email Change**
- Subject: `솜씨 이메일 변경 확인`

### ✅ Supabase Auth — URL Configuration
`Authentication → URL Configuration → Redirect URLs` 에 추가:
- `https://somsi.kr/auth/confirm`
- `https://somsi.kr/auth/reset-password`
- `http://localhost:3000/auth/confirm` (개발용)
- `http://localhost:3000/auth/reset-password` (개발용)

### ✅ Vercel 환경 변수 등록
Vercel 대시보드 → Project → Settings → Environment Variables:
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` = `https://somsi.kr`

### ✅ 최종 발송 테스트
1. 본인 이메일로 회원가입
2. 받은편지함에서 **발신자가 `솜씨 <hello@somsi.kr>`** 인지 확인
3. 제목이 `솜씨 이메일 인증을 완료해주세요` 인지 확인
4. 인증 링크 클릭 후 로그인 가능한지 확인

## 인증 상태 시나리오 테스트 체크리스트

| # | 시나리오 | 기대 결과 |
|---|----------|-----------|
| 1 | 비로그인 상태에서 `/` 홈 방문 | 웰컴 배너 없음, 히어로 섹션의 "사업주로 시작 / 마케터로 시작" CTA 표시 |
| 2 | 로그인 후 홈 방문 (매장/프로필 미등록) | 웰컴 배너 표시, "매장 등록하기" 또는 "프로필 등록하기" CTA 표시 |
| 3 | 로그인 후 홈 방문 (매장/프로필 등록 완료) | 웰컴 배너 표시, "마케터 탐색하기" 또는 "사업 탐색하기" CTA 표시 |
| 4 | 웰컴 배너 닫기 버튼 클릭 | 배너 숨김, 새로고침 후에도 숨김 (sessionStorage), 새 탭 열면 다시 표시 |
| 5 | 로그인 상태에서 `/auth/login` 직접 접속 | `/`로 자동 리다이렉트 |
| 6 | 로그인 상태에서 `/auth/signup` 직접 접속 | `/`로 자동 리다이렉트 |
| 7 | GNB 로그아웃 버튼 클릭 | "로그아웃되었습니다" 토스트 표시 → 홈으로 이동 → GNB가 비로그인 상태로 전환 |

## 인증 콜백 + 미들웨어 가드 테스트 체크리스트

### 회원가입 / 인증 플로우
- [ ] 회원가입 → `/auth/verify-email` 안내 페이지 표시
- [ ] 인증 메일 클릭 → `/auth/callback` 처리 → 매장/프로필 미등록 시 `/shop/register` 또는 `/student-profile/register`로 이동
- [ ] Supabase Dashboard → `profiles` 테이블에 자동으로 레코드 생성됐는지 확인 (트리거 동작)
- [ ] 등록 페이지에서 프로필 작성 완료 → 적절한 다음 페이지로 이동
- [ ] 이미 매장/프로필 등록된 계정으로 인증 링크 클릭 → `/` (홈)으로 이동

### 미들웨어 가드
- [ ] 비로그인 상태로 `/mypage` 직접 접근 → `/auth/login?next=/mypage` 로 리다이렉트
- [ ] 로그인 후 `next` 경로(`/mypage`)로 자동 이동
- [ ] 로그인 상태로 `/auth/login` 접근 → `/` 로 리다이렉트
- [ ] 로그인 상태로 `/auth/signup` 접근 → `/` 로 리다이렉트
- [ ] 사업주 계정으로 `/student-profile/register` 직접 접근 → `/`로 리다이렉트 + "해당 페이지에 접근할 수 없는 계정 유형" 토스트
- [ ] 마케터 계정으로 `/shop/register` 직접 접근 → `/`로 리다이렉트 + 에러 토스트
- [ ] `/auth/callback`은 비로그인 상태에서도 정상 동작 (미들웨어가 막지 않음)

### 엣지 케이스
- [ ] 만료된 인증 링크 클릭 → `/auth/login?error=auth_callback_failed` 리다이렉트 + 에러 토스트 표시
- [ ] 이미 인증된 링크 다시 클릭 → 에러 없이 로그인 상태라면 홈으로, 아니면 에러 처리
- [ ] `/auth/callback`에 `code`도 `token_hash`도 없이 직접 접근 → `/auth/login`으로 리다이렉트

## Supabase Dashboard에서 직접 해야 할 설정

### 트리거 SQL 실행
`supabase/migrations/20260429_handle_new_user_trigger.sql` 내용을 아래 경로에서 실행:

**Supabase Dashboard → SQL Editor → 새 쿼리 → 파일 내용 붙여넣기 → Run**

실행 후 확인:
- Supabase Dashboard → Database → Functions에 `handle_new_user` 함수 등록됐는지 확인
- Database → Triggers에 `on_auth_user_created` 트리거 등록됐는지 확인

### URL Configuration 업데이트
`Authentication → URL Configuration → Redirect URLs` 에 추가:
- `https://somsi.kr/auth/callback`
- `http://localhost:3000/auth/callback`

(기존에 있던 `/auth/confirm` 항목은 유지해도 무방)
