import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-black text-blue-600 mb-4">404</p>
      <h1 className="text-2xl font-black text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="btn-primary">
          홈으로 가기
        </Link>
        <Link href="/dashboard/owner" className="btn-secondary">
          대시보드
        </Link>
      </div>
    </div>
  );
}
