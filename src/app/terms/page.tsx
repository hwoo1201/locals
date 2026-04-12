import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-900 mb-2">이용약관</h1>
      <p className="text-sm text-gray-400 mb-8">시행일: 2026년 1월 1일</p>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제1조 (목적)</h2>
          <p>
            이 약관은 LOCALS(로컬스, 이하 "서비스")가 제공하는 소상공인 × 대학생 마케팅 매칭 플랫폼 서비스의 이용 조건 및 절차, 권리·의무 등 기본적인 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제2조 (정의)</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>서비스</strong>: LOCALS가 운영하는 매칭 플랫폼 및 관련 제반 서비스</li>
            <li><strong>회원</strong>: 서비스에 가입하여 이용 계약을 체결한 자</li>
            <li><strong>소상공인</strong>: 마케팅 협업을 의뢰하는 매장 운영자</li>
            <li><strong>대학생 마케터</strong>: 마케팅 서비스를 제공하는 대학(원)생</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제3조 (약관의 효력 및 변경)</h2>
          <p>
            이 약관은 서비스 화면에 게시하거나 이메일로 회원에게 공지함으로써 효력이 발생합니다. 운영자는 합리적인 사유가 있는 경우 약관을 변경할 수 있으며, 변경 시 7일 전 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제4조 (회원가입 및 계정)</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>만 14세 이상인 자만 가입할 수 있습니다.</li>
            <li>회원은 실명과 정확한 정보로 가입해야 하며, 타인의 정보를 도용할 수 없습니다.</li>
            <li>계정 정보 관리 책임은 회원 본인에게 있습니다.</li>
            <li>타인에게 계정을 양도하거나 공유할 수 없습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제5조 (서비스 이용)</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>서비스는 소상공인과 대학생 간의 매칭을 중개하며, 실제 계약 당사자는 이용자 본인입니다.</li>
            <li>서비스는 매칭 중개만 제공하며, 매칭 이후 발생하는 분쟁에 대해 직접적인 책임을 지지 않습니다.</li>
            <li>허위 정보 작성, 타인 비방, 불법 콘텐츠 게시 등은 금지됩니다.</li>
            <li>서비스 운영자는 규정 위반 시 계정을 제한하거나 삭제할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제6조 (서비스 중단)</h2>
          <p>
            운영자는 시스템 점검, 장애, 불가항력적 사유 등으로 서비스 제공을 일시 중단할 수 있습니다. 이로 인해 발생하는 손해에 대해 운영자의 고의 또는 중과실이 없는 한 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제7조 (회원 탈퇴)</h2>
          <p>
            회원은 언제든지 서비스 내 탈퇴 기능 또는 이메일(hello@locals.kr) 요청을 통해 탈퇴할 수 있습니다. 탈퇴 후 개인정보는 개인정보처리방침에 따라 처리됩니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제8조 (책임의 한계)</h2>
          <p>
            LOCALS는 회원 간 매칭 결과, 마케팅 성과, 분쟁 등에 대해 보증하지 않습니다. 서비스는 플랫폼 제공자로서 중개 역할만 수행합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">제9조 (준거법 및 관할)</h2>
          <p>
            이 약관은 대한민국 법률에 따라 해석되며, 서비스 이용으로 발생한 분쟁은 대한민국 법원을 관할 법원으로 합니다.
          </p>
        </section>

        <section className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-500">
            운영자: [운영자명]<br />
            문의: hello@locals.kr
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
        <Link href="/privacy" className="text-sm text-blue-600 hover:underline">
          개인정보처리방침 →
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:underline">
          홈으로
        </Link>
      </div>
    </div>
  );
}
