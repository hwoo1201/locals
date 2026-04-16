import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-900 mb-2">개인정보처리방침</h1>
      <p className="text-sm text-gray-400 mb-8">시행일: 2026년 1월 1일</p>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">1. 수집하는 개인정보 항목</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-gray-800">필수 항목</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>이메일 주소 (로그인 및 알림 발송)</li>
                <li>이름</li>
                <li>전화번호</li>
                <li>회원 유형 (소상공인 / 대학생)</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-gray-800">선택 항목</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>매장 정보 (매장명, 주소, 업종, 사진, SNS 계정)</li>
                <li>대학생 프로필 (관심 분야, 경험, 포트폴리오, 작업물 이미지)</li>
                <li>지역 정보</li>
                <li>연락 방식 (카카오톡 ID 등)</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-gray-800">자동 수집 항목</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>서비스 이용 기록 (로그인 이력, 매칭 기록)</li>
                <li>접속 IP, 브라우저 정보</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">2. 개인정보 수집 및 이용 목적</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>회원 가입 및 본인 확인</li>
            <li>소상공인 ↔ 대학생 매칭 서비스 제공</li>
            <li>매칭 요청·수락·거절 알림 이메일 발송</li>
            <li>프로젝트 관리 및 효과 분석 서비스 제공</li>
            <li>서비스 이용 관련 문의 응대</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">3. 개인정보 보관 기간</h2>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">회원 탈퇴 시</span>
              <span className="font-semibold text-blue-700">탈퇴 후 30일 이내 삭제</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">관련 법령에 의한 보존</span>
              <span className="font-semibold text-blue-700">법령이 정한 기간</span>
            </div>
          </div>
          <p className="mt-3 text-gray-500 text-xs">
            단, 전자상거래 등에서의 소비자 보호에 관한 법률 등 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">4. 개인정보 제3자 제공</h2>
          <p>
            서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 다음의 경우 예외로 합니다.
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
          <div className="mt-3 bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800 mb-2">매칭 수락 시 연락처 공개</p>
            <p className="text-gray-600">
              매칭이 수락된 경우, 양 당사자의 선호 연락 방식(카카오톡 ID 등)이 상대방에게 공개됩니다. 해당 정보는 협업 진행을 위한 목적으로만 활용되어야 합니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">5. 개인정보 처리 위탁</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">수탁업체</th>
                  <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-gray-200">Supabase Inc.</td>
                  <td className="p-3 border border-gray-200">데이터베이스 및 인증 서비스</td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-200">Resend Inc.</td>
                  <td className="p-3 border border-gray-200">이메일 발송 서비스</td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-200">Vercel Inc.</td>
                  <td className="p-3 border border-gray-200">웹 서비스 호스팅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>개인정보 열람 요청</li>
            <li>개인정보 수정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>회원 탈퇴 (서비스 내 기능 또는 이메일 요청)</li>
          </ul>
          <p className="mt-3 text-gray-500">
            권리 행사는 hello@somsi.kr로 요청하시면 지체 없이 처리합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">7. 쿠키 및 자동 수집</h2>
          <p>
            서비스는 로그인 상태 유지를 위해 브라우저 로컬 스토리지 및 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">8. 개인정보 보호책임자</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <p><span className="text-gray-500">책임자:</span> [운영자명]</p>
            <p><span className="text-gray-500">이메일:</span> hello@somsi.kr</p>
            <p className="text-xs text-gray-400 mt-2">
              개인정보 침해 신고는 개인정보보호위원회(privacy.go.kr) 또는 한국인터넷진흥원(118)에 문의하실 수 있습니다.
            </p>
          </div>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
        <Link href="/terms" className="text-sm text-blue-600 hover:underline">
          이용약관 →
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:underline">
          홈으로
        </Link>
      </div>
    </div>
  );
}
