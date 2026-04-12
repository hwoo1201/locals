"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Shop, Profile, ShopCategory, BudgetRange } from "@/types";

const CATEGORIES: ShopCategory[] = ["카페", "음식점", "소매", "뷰티", "기타"];
const BUDGET_RANGES: BudgetRange[] = [
  "10만 원 미만", "10~20만 원", "20~30만 원", "30만 원 이상",
];
const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "강원", "충남", "충북", "전북", "전남", "경북", "경남", "제주"];


interface ShopCard {
  shop: Shop;
  owner: Profile;
}

export default function ExploreShopsPage() {
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [payStatsMap, setPayStatsMap] = useState<Record<string, number>>({});

  const [filterRegion, setFilterRegion] = useState("");
  const [filterCategory, setFilterCategory] = useState<ShopCategory | "">("");
  const [filterBudget, setFilterBudget] = useState<BudgetRange | "">("");

  useEffect(() => {
    const load = async () => {
      const [{ data: shopsData }, { data: profiles }, { data: payStats }] = await Promise.all([
        supabase.from("shops").select("*"),
        supabase.from("profiles").select("*").eq("user_type", "owner"),
        supabase.from("pay_stats").select("category, avg_pay"),
      ]);

      if (!shopsData || !profiles) { setLoading(false); return; }

      const profileMap = new Map(profiles.map((p: Profile) => [p.user_id, p]));
      const cards: ShopCard[] = shopsData
        .map((shop: Shop) => {
          const owner = profileMap.get(shop.owner_id);
          if (!owner) return null;
          return { shop, owner };
        })
        .filter(Boolean) as ShopCard[];

      setShops(cards);

      // pay_stats: 업종별 평균 급여 맵
      if (payStats) {
        const map: Record<string, number> = {};
        (payStats as { category: string; avg_pay: number }[]).forEach(({ category, avg_pay }) => {
          map[category] = avg_pay;
        });
        setPayStatsMap(map);
      }

      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return shops.filter(({ shop, owner }) => {
      if (filterRegion && !shop.address?.includes(filterRegion) && !owner.region?.includes(filterRegion)) return false;
      if (filterCategory && shop.category !== filterCategory) return false;
      if (filterBudget && shop.budget_range !== filterBudget) return false;
      return true;
    });
  }, [shops, filterRegion, filterCategory, filterBudget]);

  const resetFilters = () => {
    setFilterRegion("");
    setFilterCategory("");
    setFilterBudget("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">매장 탐색</h1>
        <p className="text-gray-500 mt-1">마케팅 협업할 매장을 찾아보세요</p>
      </div>

      {/* 필터 */}
      <div className="card mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">필터</h2>
          <button onClick={resetFilters} className="text-sm text-blue-600 hover:underline">
            초기화
          </button>
        </div>

        {/* 지역 */}
        <div>
          <p className="label">지역</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setFilterRegion(filterRegion === r ? "" : r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  filterRegion === r
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 업종 */}
        <div>
          <p className="label">업종</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? "" : cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  filterCategory === cat
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 예산 */}
        <div>
          <p className="label">월 예산</p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_RANGES.map((b) => (
              <button
                key={b}
                onClick={() => setFilterBudget(filterBudget === b ? "" : b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  filterBudget === b
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 업종별 평균 급여 배너 */}
      {filterCategory && payStatsMap[filterCategory] != null && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-sm font-bold">₩</span>
          </div>
          <div>
            <p className="text-xs text-blue-500 font-medium">{filterCategory} 업종</p>
            <p className="text-sm font-bold text-blue-900">
              대학생 평균 급여: {payStatsMap[filterCategory]}만원/월
            </p>
          </div>
        </div>
      )}

      {/* 결과 수 */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          {loading ? "로딩 중..." : `${filtered.length}개의 매장`}
        </p>
      </div>

      {/* 카드 그리드 */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-36 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">조건에 맞는 매장이 없습니다</p>
          <button onClick={resetFilters} className="mt-3 text-sm text-blue-600 hover:underline">
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(({ shop, owner }) => (
            <Link
              key={shop.id}
              href={`/profile/${shop.owner_id}`}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden"
            >
              {/* 사진 */}
              {shop.photos?.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.photos[0]}
                  alt={shop.name}
                  className="w-full h-40 object-cover rounded-xl mb-4 -mx-0"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-400">{shop.category}</span>
                </div>
              )}

              {/* 업종 배지 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {shop.category}
                </span>
              </div>

              {/* 매장명 */}
              <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {shop.name}
              </h3>

              {/* 주소 */}
              <p className="text-sm text-gray-500 mt-1 truncate">{shop.address}</p>

              {/* 급여 범위 */}
              {shop.budget_range && (
                <p className="text-sm font-semibold text-orange-600 mt-1.5">
                  급여 범위: {shop.budget_range}
                </p>
              )}

              {/* 요청사항 요약 */}
              {shop.marketing_needs && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed bg-gray-50 rounded-lg p-2">
                  {shop.marketing_needs}
                </p>
              )}

              {/* 목표 */}
              {shop.goals && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-1">
                  {shop.goals}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">사장님: {owner.name}</span>
                <span className="text-xs text-blue-600 font-medium group-hover:underline">
                  상세보기 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
