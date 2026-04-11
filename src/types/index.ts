export type UserType = "owner" | "student";

export interface Profile {
  id: string;
  user_id: string;
  user_type: UserType;
  name: string;
  phone?: string;
  region?: string;
  bio?: string;
  avatar_url?: string;
  contact_method?: string;
  created_at: string;
  updated_at: string;
}

export type ShopCategory = "카페" | "음식점" | "소매" | "뷰티" | "기타";
export type BudgetRange =
  | "10만원 미만"
  | "10~30만원"
  | "30~50만원"
  | "50~100만원"
  | "100만원 이상";

export interface SnsAccounts {
  instagram?: string;
  naver_blog?: string;
  youtube?: string;
  tiktok?: string;
  kakao?: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  category: ShopCategory;
  address: string;
  photos: string[];
  sns_accounts: SnsAccounts;
  marketing_needs?: string;
  budget_range?: BudgetRange;
  goals?: string;
  created_at: string;
  updated_at: string;
}

export type StudentInterest =
  | "SNS마케팅"
  | "영상제작"
  | "사진촬영"
  | "디자인"
  | "브랜딩"
  | "기타";

export interface AvailableChannels {
  instagram?: boolean;
  youtube?: boolean;
  tiktok?: boolean;
  naver_blog?: boolean;
  twitter?: boolean;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  interests: StudentInterest[];
  available_channels: AvailableChannels;
  experience?: string;
  portfolio_url?: string;
  preferred_categories: ShopCategory[];
  available_regions: string[];
  created_at: string;
  updated_at: string;
}

export interface MatchRequest {
  id: string;
  requester_id: string;
  target_id: string;
  shop_id: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  created_at: string;
}

export interface Project {
  id: string;
  shop_id: string;
  student_id: string;
  match_id: string;
  status: "active" | "completed";
  start_date: string;
  end_date?: string;
  duration_weeks?: number;
  created_at: string;
}

export interface CustomField {
  key: string;
  value: number;
}

export interface Metric {
  id: string;
  project_id: string;
  measured_at: "before" | "after";
  followers?: number | null;
  visitors?: number | null;
  revenue?: number | null;
  posts_count?: number | null;
  likes?: number | null;
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  content?: string;
  created_at: string;
}

// 조인 데이터 포함 확장 타입
export interface MatchRequestWithDetails extends MatchRequest {
  requester_profile?: Profile;
  target_profile?: Profile;
  shop?: Shop;
}

export interface StudentWithProfile {
  profile: Profile;
  studentProfile: StudentProfile;
}

export interface ShopWithOwner extends Shop {
  owner?: Profile;
}
