export const BRAND = {
  NAME: 'SOMSI',
  NAME_KO: '솜씨',
  DOMAIN: 'somsi.kr',
  URL: 'https://somsi.kr',
  EMAIL: 'hello@somsi.kr',
  EMAIL_SENDER_NAME: '솜씨',
  TAGLINE: '작은 시작에 어울리는 마케팅',
  DESCRIPTION: '월매출 200만원 이하 소규모 사업과 마케터를 연결합니다',
} as const;

// 하위 호환 named exports — 기존 import 구문이 깨지지 않도록 유지
export const BRAND_NAME = BRAND.NAME;
export const BRAND_NAME_KO = BRAND.NAME_KO;
export const BRAND_TAGLINE = BRAND.TAGLINE;
export const BRAND_DESCRIPTION = BRAND.DESCRIPTION;
export const BRAND_EMAIL = BRAND.EMAIL;
export const BRAND_DOMAIN = BRAND.DOMAIN;
