import Link from "next/link";
import LogoMark from "@/components/ui/LogoMark";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A14] text-[#6B6B5E]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LogoMark size={24} color="#E8EDE6" />
              <h3 className="text-[#E8EDE6] font-black text-lg tracking-tight">{BRAND.NAME_KO}</h3>
            </div>
            <p className="text-sm leading-relaxed">{BRAND.TAGLINE}</p>
          </div>
          <div>
            <h4 className="text-[#9B9B8E] font-semibold mb-3 text-sm">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signup?type=owner" className="hover:text-[#E8EDE6] transition-colors">사업주로 시작하기</Link></li>
              <li><Link href="/auth/signup?type=student" className="hover:text-[#E8EDE6] transition-colors">마케터로 시작하기</Link></li>
              <li><Link href="/auth/login" className="hover:text-[#E8EDE6] transition-colors">로그인</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#9B9B8E] font-semibold mb-3 text-sm">문의</h4>
            <ul className="space-y-2 text-sm">
              <li>이메일: {BRAND.EMAIL}</li>
              <li>운영시간: 평일 10:00 - 18:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2C2C24] pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-[#4A4A3E]">
          <p>© 2026 {BRAND.NAME_KO}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#6B6B5E] transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-[#6B6B5E] transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
