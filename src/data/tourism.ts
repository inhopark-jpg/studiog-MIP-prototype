import type { Lang } from '../i18n';

/**
 * 관광 명소 around 청주. Only spots with `drt` can be booked: they're also destinations in
 * PLACES (src/booking/data.ts) under the same id, so DRT 예약하기 can pre-fill them.
 * Positions are from OpenStreetMap.
 */
export type TouristSpot = {
  id: string;
  /** src/assets/<image> */
  image: string;
  name: Record<Lang, string>;
  category: Record<Lang, string>;
  address: Record<Lang, string>;
  description: Record<Lang, string>;
  /** [lat, lng] */
  position: [number, number];
  /** Reachable by DRT: shows DRT 호출 가능 and enables DRT 예약하기 */
  drt: boolean;
};

export const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'osco',
    image: 'tourist-spots/osco',
    name: { ko: '오스코', en: 'OSCO' },
    category: { ko: '전시·컨벤션', en: 'Exhibition & convention' },
    address: { ko: '청주시 흥덕구 오송읍 오송생명로 250', en: '250 Osongsaengmyeong-ro, Osong-eup, Cheongju' },
    description: {
      ko: 'KTX 오송역 인근에 위치한 충북 최초의 대형 전시·컨벤션센터로, 다양한 전시회와 박람회, 국제회의가 열리는 복합문화공간입니다.',
      en: "Chungbuk's first large exhibition and convention center, near KTX Osong Station. It hosts a wide range of exhibitions, trade fairs and international conferences.",
    },
    position: [36.62644, 127.33546],
    drt: true,
  },
  {
    id: 'chojeong',
    image: 'tourist-spots/chojeong_haenggung',
    name: { ko: '초정행궁', en: 'Chojeong Haenggung' },
    category: { ko: '역사·체험', en: 'History & experience' },
    address: { ko: '청주시 청원구 내수읍 초정약수로 851', en: '851 Chojeongyaksu-ro, Naesu-eup, Cheongju' },
    description: {
      ko: '세종대왕이 초정약수로 눈병을 치료하며 머물렀던 역사를 재현한 공간으로, 조선시대 궁중문화와 전통체험을 즐길 수 있는 관광지입니다.',
      en: 'A recreation of the temporary palace where King Sejong stayed while treating his eye disease with Chojeong mineral water, offering Joseon court culture and traditional experiences.',
    },
    position: [36.72123, 127.60159],
    drt: false,
  },
  {
    id: 'munui',
    image: 'tourist-spots/munui_cultural_heritage_complex',
    name: { ko: '문의문화유산단지', en: 'Munui Cultural Heritage Complex' },
    category: { ko: '역사·문화', en: 'History & culture' },
    address: { ko: '청주시 상당구 문의면 대청호반로 721', en: '721 Daecheonghoban-ro, Munui-myeon, Cheongju' },
    description: {
      ko: '대청호의 아름다운 풍경을 배경으로 전통 가옥과 문화유산을 관람하며 옛 생활문화를 체험할 수 있는 역사문화 관광지입니다.',
      en: 'A heritage site set against the scenery of Daecheong Lake, where visitors can tour traditional houses and cultural relics and experience the way of life of the past.',
    },
    position: [36.50854, 127.49374],
    drt: false,
  },
  {
    id: 'cheongnamdae',
    image: 'tourist-spots/cheongnamdae',
    name: { ko: '청남대', en: 'Cheongnamdae' },
    category: { ko: '역사·자연', en: 'History & nature' },
    address: { ko: '청주시 상당구 문의면 청남대길 646', en: '646 Cheongnamdae-gil, Munui-myeon, Cheongju' },
    description: {
      ko: '과거 대통령 전용 별장으로 사용되던 곳으로, 대청호의 수려한 자연경관과 대통령의 발자취를 함께 살펴볼 수 있는 관광명소입니다.',
      en: "A former presidential retreat where visitors can enjoy Daecheong Lake's scenery and follow in the footsteps of past presidents.",
    },
    position: [36.46223, 127.49038],
    drt: false,
  },
];
