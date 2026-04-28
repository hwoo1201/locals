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
