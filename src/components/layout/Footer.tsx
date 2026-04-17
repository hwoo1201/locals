import Link from "next/link";
import LogoMark from "@/components/ui/LogoMark";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-500">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LogoMark size={24} color="#888888" />
              <h3 className="text-white font-black text-lg tracking-tight">솜씨</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              로컬 소상공인과 마케팅 대학생을<br />연결하는 매칭 플랫폼
            </p>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-3 text-sm">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">소상공인 시작하기</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">대학생 시작하기</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">로그인</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-3 text-sm">문의</h4>
            <ul className="space-y-2 text-sm">
              <li>이메일: hello@somsi.kr</li>
              <li>운영시간: 평일 10:00 - 18:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© 2026 솜씨. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-400 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
