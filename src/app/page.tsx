import Link from "next/link";
import LogoMark from "@/components/ui/LogoMark";

const features = [
  {
    title: "무료 매칭",
    desc: "소상공인은 비용 부담 없이 대학생 마케터와 매칭됩니다. 플랫폼 이용료는 없습니다.",
  },
  {
    title: "검증된 대학생",
    desc: "프로젝트 이력, 리뷰, 평균 급여를 확인하고 딱 맞는 대학생을 선택하세요.",
  },
  {
    title: "투명한 급여",
    desc: "업종별 평균 급여를 확인하고, 합리적인 조건으로 협업하세요.",
  },
];

const steps = [
  { step: "01", title: "회원가입", desc: "소상공인 또는 대학생으로 가입" },
  { step: "02", title: "프로필 등록", desc: "매장 정보 또는 포트폴리오 등록" },
  { step: "03", title: "매칭 요청", desc: "서로를 탐색하고 매칭 요청" },
  { step: "04", title: "프로젝트 시작", desc: "마케팅 프로젝트 진행 & 효과 측정" },
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
            <span>소상공인 × 마케팅 대학생 연결 플랫폼</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-[#1A1A14]">
            로컬 비즈니스를<br />
            <span className="text-[#4A7C59]">대학생 마케터</span>와 함께
          </h1>

          <p className="text-lg md:text-xl text-[#5A5A4E] mb-10 max-w-2xl mx-auto leading-relaxed">
            소상공인은 검증된 대학생 마케터와 무료로 매칭되고,<br />
            대학생은 실전 포트폴리오와 급여를 얻습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=owner"
              className="bg-[#2C3E50] hover:bg-[#3d5166] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-sm"
            >
              소상공인으로 시작하기
            </Link>
            <Link
              href="/auth/signup?type=student"
              className="bg-[#4A7C59] hover:bg-[#3a6347] text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-sm"
            >
              대학생으로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 수치 섹션 */}
      <section className="bg-[#E8EDE6] py-12 border-y border-[#D6A77A]/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { num: "무료", label: "소상공인 이용료" },
              { num: "검증된", label: "대학생 매칭" },
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

      {/* 특징 섹션 */}
      <section className="py-24 px-4 bg-[#F0E2B0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A14] mb-3">왜 솜씨인가요?</h2>
            <p className="text-[#8A8A7E] text-lg">양쪽 모두에게 이득이 되는 구조</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 bg-[#1A1A14] rounded-2xl flex items-center justify-center mb-4">
                  <LogoMark size={22} color="#E8EDE6" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A14] mb-2">{f.title}</h3>
                <p className="text-[#6A6A5E] text-sm leading-relaxed">{f.desc}</p>
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
            {/* 소상공인 */}
            <div className="bg-[#2C3E50] rounded-3xl p-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                <LogoMark size={24} color="#E8EDE6" />
              </div>
              <h3 className="text-2xl font-black text-white mb-1">소상공인</h3>
              <p className="text-[#D6A77A] text-sm font-medium mb-5">비용 걱정 없이 마케팅을</p>
              <ul className="space-y-3">
                {[
                  "무료로 대학생 마케터 매칭",
                  "플랫폼 수수료 0원, 대학생에게 급여만 직접 지급",
                  "열정 넘치는 대학생 마케터와 협업",
                  "카페, 음식점, 소매, 뷰티 등 모든 업종",
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
                소상공인으로 시작하기
              </Link>
            </div>

            {/* 대학생 */}
            <div className="bg-[#4A7C59] rounded-3xl p-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                <LogoMark size={24} color="#E8EDE6" />
              </div>
              <h3 className="text-2xl font-black text-white mb-1">대학생</h3>
              <p className="text-[#F0E2B0] text-sm font-medium mb-5">경험과 수익을 동시에</p>
              <ul className="space-y-3">
                {[
                  "실전 마케팅 프로젝트 경험",
                  "포트폴리오 구축 기회",
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
                대학생으로 시작하기
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
          <h2 className="text-3xl md:text-4xl font-black mb-4">지금 바로 시작하세요</h2>
          <p className="text-[#6B6B5E] mb-10 text-lg">
            소상공인은 무료, 대학생은 매칭 성사 시에만 수수료.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=owner"
              className="bg-[#2C3E50] hover:bg-[#3d5166] text-white font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              소상공인으로 시작
            </Link>
            <Link
              href="/auth/signup?type=student"
              className="bg-[#4A7C59] hover:bg-[#3a6347] text-white font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              대학생으로 시작
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
