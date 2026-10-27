import { TOURIST_SPOTS } from '../data/tourism';
import type { Lang } from '../i18n';

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const randomDigits = (n: number) => Array.from({ length: n }, () => randInt(0, 9)).join('');

/** iso: ISO 3166 alpha-2, shown instead of the name on the English selector */
export type Country = { code: string; iso: string; name: Record<Lang, string> };

/** Sorted by dialing code. (The Figma list's "+27 남수단" is corrected: +27 is South Africa.) */
export const COUNTRIES: Country[] = [
  { code: '1', iso: 'US', name: { ko: '미국', en: 'United States' } },
  { code: '27', iso: 'ZA', name: { ko: '남아프리카공화국', en: 'South Africa' } },
  { code: '34', iso: 'ES', name: { ko: '스페인', en: 'Spain' } },
  { code: '44', iso: 'GB', name: { ko: '영국', en: 'United Kingdom' } },
  { code: '63', iso: 'PH', name: { ko: '필리핀', en: 'Philippines' } },
  { code: '66', iso: 'TH', name: { ko: '태국', en: 'Thailand' } },
  { code: '81', iso: 'JP', name: { ko: '일본', en: 'Japan' } },
  { code: '82', iso: 'KR', name: { ko: '한국', en: 'South Korea' } },
  { code: '84', iso: 'VN', name: { ko: '베트남', en: 'Vietnam' } },
  { code: '86', iso: 'CN', name: { ko: '중국', en: 'China' } },
];
export const DEFAULT_COUNTRY = '82';

export const randomVerificationCode = () => randomDigits(6);

export const PHONE_MAX_DIGITS = 11;
export const PHONE_MIN_DIGITS = 10;
export const CODE_DIGITS = 6;

/** 010-1234-5678 / 010-123-4567; the middle group is masked once the number is complete. */
/**
 * Fixed 3-4-4 grouping applied as the digits are typed, so deleting only ever shortens
 * the end and the masked middle group never reflows into view.
 */
export function formatPhone(digits: string, mask: boolean) {
  const middle = digits.slice(3, 7);
  return [digits.slice(0, 3), mask ? '*'.repeat(middle.length) : middle, digits.slice(7)].filter(Boolean).join('-');
}

/** position: [lat, lng] */
export type Place = { id: string; name: Record<Lang, string>; position: [number, number] };

/**
 * Real places around 오송 (Osong, Cheongju) a DRT rider might head to. Positions are from
 * OpenStreetMap; "≈" marks places without their own OSM entry, placed at their complex.
 */
export const PLACES: Place[] = [
  // ≈ next to the lake (OSM has no park outline)
  { id: 'lake-park', name: { ko: '오송호수공원', en: 'Osong Lake Park' }, position: [36.63271, 127.32687] },
  { id: 'life-science', name: { ko: '오송생명과학단지', en: 'Osong Life Science Complex' }, position: [36.63176, 127.3266] },
  { id: 'mfds', name: { ko: '식품의약품안전처', en: 'Ministry of Food and Drug Safety' }, position: [36.63869, 127.33123] },
  { id: 'kdca', name: { ko: '질병관리청', en: 'Korea Disease Control and Prevention Agency' }, position: [36.63968, 127.32925] },
  { id: 'knih', name: { ko: '국립보건연구원', en: 'Korea National Institute of Health' }, position: [36.63993, 127.32686] },
  // ≈ same campus as 식약처 / 질병관리청 (오송생명2로 187)
  { id: 'khidi', name: { ko: '한국보건산업진흥원', en: 'Korea Health Industry Development Institute' }, position: [36.6385, 127.3295] },
  // ≈ 오송첨단의료복합단지
  { id: 'kbio', name: { ko: '오송첨단의료산업진흥재단', en: 'Osong Medical Innovation Foundation' }, position: [36.63438, 127.32517] },
  { id: 'eup-office', name: { ko: '오송읍행정복지센터', en: 'Osong-eup Community Center' }, position: [36.60918, 127.32455] },
  { id: 'high', name: { ko: '오송고등학교', en: 'Osong High School' }, position: [36.62936, 127.32631] },
  { id: 'middle', name: { ko: '오송중학교', en: 'Osong Middle School' }, position: [36.62656, 127.33019] },
  { id: 'elementary', name: { ko: '오송초등학교', en: 'Osong Elementary School' }, position: [36.61275, 127.32552] },
  // 관광 명소 (dummy Osong positions), so 관광 정보 → DRT 예약하기 can pre-fill the destination
  ...TOURIST_SPOTS.map(({ id, name, position }) => ({ id, name, position })),
];
export const placeById = (id: string) => PLACES.find((p) => p.id === id);

/** Pre-filled search term: matches most places in either language */
export const PLACE_QUERY: Record<Lang, string> = { ko: '오송', en: 'Osong' };

const normalize = (s: string) => s.replace(/\s/g, '').toLowerCase();
/** Matches Korean or English names, ignoring spaces and case. */
export const searchPlaces = (query: string) => {
  const q = normalize(query);
  return q ? PLACES.filter((p) => Object.values(p.name).some((n) => normalize(n).includes(q))) : [];
};
