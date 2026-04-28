export type UserType = "owner" | "student";

export type MarketerType =
  | "student"
  | "instagram_content_creator"
  | "freelancer_junior"
  | "sidejob"
  | "other";

export type FollowerRange =
  | "under_1k"
  | "1k_to_5k"
  | "5k_to_10k"
  | "10k_to_50k"
  | "50k_to_100k"
  | "over_100k";

export type ContentFormat =
  | "card_news"
  | "reels"
  | "info_post"
  | "curation"
  | "other";

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
  | "free_or_negotiable"
  | "under_100k"
  | "100k_to_300k"
  | "300k_to_500k"
  | "500k_to_1m"
  | "over_1m";

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

export interface PortfolioImage {
  url: string;
  caption: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  marketer_type: MarketerType;
  interests: StudentInterest[];
  available_channels: AvailableChannels;
  experience?: string;
  portfolio_url?: string;
  portfolio_images: PortfolioImage[];
  preferred_categories: ShopCategory[];
  available_regions: string[];
  desired_pay?: number | null;
  completed_projects_count: number;
  avg_pay?: number | null;
  // 인스타 정보계정 전용 필드 (marketer_type === 'instagram_content_creator' 일 때 사용)
  instagram_handle?: string | null;
  page_topic?: string | null;
  follower_range?: FollowerRange | null;
  content_format?: ContentFormat[] | null;
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
  proposed_pay?: number | null;   // 요청 시 제안 월 급여 (만원)
  created_at: string;
}

export type CommissionStatus = "pending" | "paid" | "waived";

export interface Project {
  id: string;
  shop_id: string;
  student_id: string;
  match_id: string;
  status: "active" | "completed";
  start_date: string;
  end_date?: string;
  duration_weeks?: number;
  agreed_pay?: number | null;            // 합의된 월 급여 (만원)
  commission_rate: number;               // 수수료율 (%, 기본 20)
  commission_amount?: number | null;     // 수수료 금액 (만원)
  commission_status: CommissionStatus;   // 수수료 납부 상태
  created_at: string;
}

export interface PayStat {
  id: string;
  category: ShopCategory;
  region: string;
  avg_pay: number;
  min_pay: number;
  max_pay: number;
  sample_count: number;
  updated_at: string;
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
