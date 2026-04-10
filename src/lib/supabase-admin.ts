import { createClient } from "@supabase/supabase-js";

// 서버 전용 Admin 클라이언트 (Service Role Key 사용)
// 절대 클라이언트 컴포넌트에서 import하지 말 것
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
