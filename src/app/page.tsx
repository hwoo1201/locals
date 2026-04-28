import Link from "next/link";
import LogoMark from "@/components/ui/LogoMark";
import { BRAND_NAME, BRAND_TAGLINE, BRAND_DESCRIPTION } from "@/lib/brand";

const marketerTypes = [
  {
    title: "인스타 정보계정",
    desc: "팔로워를 보유한 정보성 계정 운영자. 광고 의존 없이 직접 협업으로 수익화.",
    badge: "인스타그램",
  },
  {
    title: "마케팅 전공 대학생",
    desc: "관련 수업과 동아리 경험을 바탕으로 첫 실전 포트폴리오를 만드는 단계.",
    badge: "포트폴리오",
  },
  {
    title: "주니어 프리랜서",
    desc: "소규모 프리랜서 경험이 있고 안정적인 클라이언트를 찾는 마케터.",
    badge: "프리랜서",
  },
  {
    title: "N잡러 / 사이드잡",
    desc: "본업 외 마케팅을 부업으로 하며 유연한 협업을 원하는 분.",
    badge: "사이드잡",
  },
];

const steps = [
  { step: "01", title: "가입", desc: "사업주 또는 마케터로 가입" },
  { step: "02", title: "프로필 등록", desc: "매장 정보 또는 마케터 프로필 등록" },
  { step: "03", title: "매칭 요청", desc: "서로를 탐색하고 매칭 요청" },
  { step: "04", title: "프로젝트 시작", desc: "마케팅 진행 & 효과 측정" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 히어로 섹션 */}
      <section className="bg-[#F0E2B0] py-28 px-4 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[450px] h-[450px] rounded-full bg-[#D6A77A]/20 pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-[#4A7C59]/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#1A1A14] rounded-3xl flex items-center justify-center shadow-lg">
              <LogoMark size={48} color="#E8EDE6" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/60 border border-[#D6A77A]/50 text-[#2C3E50] text-sm font-medium px-4 py-2 rounded-full mb-7">
            <span>소규모 사업 × 마케터 연결 플랫폼</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-[#1A1A14]">
            {BRAND_TAGLINE}
          </h1>

          <p className="text-lg md:text-xl text-[#5A5A4E] mb-4 max-w-2xl mx-auto leading-relaxed">
            {BRAND_DESCRIPTION}
          </p>
          <p className="text-base text-[#8A8A7E] mb-10 max-w-xl mx-auto">
            인스타 정보계정 운영자, 마케팅 전공생, 주니어 프리랜서 — 다양한 마케터와 연결됩니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=owner"
              className="bg-[#2C3E50] hover:bg-[#3d5166] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-sm"
            >
              사업주로 시작하기
            </Link>
            <Link
              href="/auth/signup?type=student"
              className="bg-[#4A7C59] hover:bg-[#3a6347] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-sm"
            >
              마케터로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 수치 섹션 */}
      <section className="bg-[#E8EDE6] py-12 border-y border-[#D6A77A]/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { num: "무료", label: "사업주 이용료" },
              { num: "다양한", label: "마케터 유형" },
              { num: "투명한", label: "급여 구조" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-3xl md:text-4xl font-black text-[#2C3E50] mb-1">{item.num}</p>
                <p className="text-sm text-[#8A8A7E] font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 마케터 유형 섹션 */}
      <section className="py-24 px-4 bg-[#F0E2B0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A14] mb-3">어떤 마케터를 만날 수 있나요?</h2>
            <p className="text-[#8A8A7E] text-lg">인스타 정보계정부터 전공생까지, 다양한 마케터가 있습니다</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {marketerTypes.map((m) => (
              <div key={m.title} className="card hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#1A1A14] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <LogoMark size={22} color="#E8EDE6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#1A1A14]">{m.title}</h3>
                      <span className="text-xs bg-[#E8EDE6] text-[#4A7C59] px-2 py-0.5 rounded-full font-medium">{m.badge}</span>
                    </div>
                    <p className="text-[#6A6A5E] text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 두 타입 혜택 섹션 */}
      <section className="bg-[#E8EDE6] py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#1A1A14] mb-14">
            누구를 위한 서비스인가요?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 사업주 */}
            <div className="bg-[#2C3E50] rounded-3xl p-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                <LogoMark size={24} color="#E8EDE6" />
              </div>
              <h3 className="text-2xl font-black text-white mb-1">소규모 사업주</h3>
              <p className="text-[#D6A77A] text-sm font-medium mb-5">월매출 200만원 이하 사업자를 위한</p>
              <ul className="space-y-3">
                {[
                  "플랫폼 이용료 0원, 마케터에게 급여만 직접 지급",
                  "인스타 정보계정, 전공생 등 다양한 마케터 탐색",
                  "카페, 음식점, 소매, 뷰티 등 모든 업종",
                  "마케팅 효과 전/후 데이터 대시보드 제공",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#C8D0D8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6A77A] mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?type=owner"
                className="mt-6 block text-center bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-2xl transition-colors text-sm border border-white/20"
              >
                사업주로 시작하기
              </Link>
            </div>

            {/* 마케터 */}
            <div className="bg-[#4A7C59] rounded-3xl p-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                <LogoMark size={24} color="#E8EDE6" />
              </div>
              <h3 className="text-2xl font-black text-white mb-1">마케터</h3>
              <p className="text-[#F0E2B0] text-sm font-medium mb-5">경험과 수익을 동시에</p>
              <ul className="space-y-3">
                {[
                  "인스타 정보계정, 전공생, 프리랜서, N잡러 모두 가능",
                  "실전 마케팅 프로젝트로 포트폴리오 구축",
                  "매칭 성사 시 첫 달 급여의 20%만 1회 수수료",
                  "이후 추가 비용 없이 자유롭게 활동",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#C8DDD0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F0E2B0] mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?type=student"
                className="mt-6 block text-center bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-2xl transition-colors text-sm border border-white/20"
              >
                마케터로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 진행 단계 */}
      <section className="py-24 px-4 bg-[#F0E2B0]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-[#1A1A14] mb-14">
            어떻게 진행되나요?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center group">
                <div className="w-14 h-14 bg-white border border-[#D6A77A]/40 group-hover:bg-[#2C3E50] group-hover:border-[#2C3E50] text-[#2C3E50] group-hover:text-white rounded-2xl flex items-center justify-center font-black text-base mx-auto mb-4 transition-all">
                  {s.step}
                </div>
                <h3 className="font-bold text-[#1A1A14] mb-1 text-sm">{s.title}</h3>
                <p className="text-xs text-[#8A8A7E] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-[#1A1A14] text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2C3E50]/30 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#4A7C59]/20 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <LogoMark size={52} color="#E8EDE6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">{BRAND_NAME}로 시작하세요</h2>
          <p className="text-[#6B6B5E] mb-10 text-lg">
            사업주는 무료, 마케터는 매칭 성사 시에만 수수료.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=owner"
              className="bg-[#2C3E50] hover:bg-[#3d5166] text-white font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              사업주로 시작
            </Link>
            <Link
              href="/auth/signup?type=student"
              className="bg-[#4A7C59] hover:bg-[#3a6347] text-white font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              마케터로 시작
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
