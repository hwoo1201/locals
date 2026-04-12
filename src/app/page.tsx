import Link from "next/link";

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
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <span>지역 소상공인 × 마케팅 대학생 연결 플랫폼</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            로컬 비즈니스를<br />
            <span className="text-orange-400">대학생 마케터</span>와 함께
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            소상공인은 검증된 대학생 마케터와 무료로 매칭되고,<br />
            대학생은 실전 포트폴리오와 급여를 얻습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=owner"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg"
            >
              소상공인으로 시작하기
            </Link>
            <Link
              href="/auth/signup?type=student"
              className="bg-white hover:bg-gray-100 text-blue-700 font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg"
            >
              대학생으로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 수치 섹션 */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { num: "무료", label: "소상공인 이용료" },
              { num: "검증된", label: "대학생 매칭" },
              { num: "투명한", label: "급여 구조" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-3xl md:text-4xl font-black text-blue-600 mb-1">{item.num}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              왜 LOCALS인가요?
            </h2>
            <p className="text-gray-500 text-lg">양쪽 모두에게 이득이 되는 구조</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 두 타입 혜택 섹션 */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-12">
            누구를 위한 서비스인가요?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 소상공인 */}
            <div className="bg-blue-600 text-white rounded-2xl p-8">
              <h3 className="text-2xl font-black mb-4">소상공인</h3>
              <ul className="space-y-3">
                {[
                  "무료로 대학생 마케터 매칭",
                  "플랫폼 수수료 0원, 대학생에게 급여만 직접 지급",
                  "열정 넘치는 대학생 마케터와 협업",
                  "카페, 음식점, 소매, 뷰티 등 모든 업종",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-300 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* 대학생 */}
            <div className="bg-orange-500 text-white rounded-2xl p-8">
              <h3 className="text-2xl font-black mb-4">대학생</h3>
              <ul className="space-y-3">
                {[
                  "실전 마케팅 프로젝트 경험",
                  "포트폴리오 구축 기회",
                  "매칭 성사 시 첫 달 급여의 20%만 1회 수수료",
                  "이후 추가 비용 없이 자유롭게 활동",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-200 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 진행 단계 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-12">
            어떻게 진행되나요?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-lg mx-auto mb-3">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-100" />
                )}
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">지금 바로 시작하세요</h2>
          <p className="text-blue-100 mb-8">
            소상공인은 무료, 대학생은 매칭 성사 시에만 수수료. 지금 시작하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=owner"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              소상공인으로 시작
            </Link>
            <Link
              href="/auth/signup?type=student"
              className="bg-white hover:bg-gray-100 text-blue-700 font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              대학생으로 시작
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
