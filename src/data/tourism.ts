import type { Lang } from '../i18n';

/**
 * Dummy 관광 명소. The names, categories and descriptions are the real (Seoul) places; for
 * the prototype they pretend to be in 청주 오송, with made-up Osong addresses and positions.
 * Each one is also a destination in PLACES (src/booking/data.ts) under the same id, so
 * DRT 예약하기 can pre-fill it.
 */
export type TouristSpot = {
  id: string;
  /** src/assets/<image> */
  image: string;
  name: Record<Lang, string>;
  category: Record<Lang, string>;
  address: Record<Lang, string>;
  description: Record<Lang, string>;
  /** Dummy [lat, lng] around 오송 */
  position: [number, number];
};

export const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'gwanghwamun',
    image: 'tourist-spots/gwanhwamun',
    // "Gwanghwamun Gate" is one word too wide for the list item
    name: { ko: '광화문', en: 'Gwanghwamun' },
    category: { ko: '역사 유적', en: 'Historic site' },
    address: { ko: '청주시 흥덕구 오송읍 오송가락로 161', en: '161 Osonggarak-ro, Osong-eup, Cheongju' },
    description: {
      ko: '경복궁의 정문으로 1395년에 처음 세워졌다. 세 개의 홍예문이 있는 석축 위에 2층 누각을 올렸으며, 2010년 원래의 자리와 모습으로 복원되었다.',
      en: 'The main gate of Gyeongbokgung Palace, first built in 1395. A two-story pavilion sits on a stone base with three arched gateways; it was restored to its original site and form in 2010.',
    },
    position: [36.6155, 127.3165],
  },
  {
    id: 'bukchon',
    image: 'tourist-spots/bukchon_hanok_village',
    name: { ko: '북촌한옥마을', en: 'Bukchon Hanok Village' },
    category: { ko: '전통 마을', en: 'Traditional village' },
    address: { ko: '청주시 흥덕구 오송읍 만수2길 37', en: '37 Mansu 2-gil, Osong-eup, Cheongju' },
    description: {
      ko: '경복궁과 창덕궁 사이에 자리한 전통 주거 지역으로, 조선 시대 양반들이 모여 살던 동네의 한옥과 골목길이 잘 보존되어 있다.',
      en: 'A traditional neighborhood between Gyeongbokgung and Changdeokgung palaces, where the hanok houses and alleys of Joseon-era noble families are well preserved.',
    },
    position: [36.6245, 127.3375],
  },
  {
    id: 'seoul-forest',
    image: 'tourist-spots/seoul_forest',
    name: { ko: '서울숲', en: 'Seoul Forest' },
    category: { ko: '공원', en: 'Park' },
    address: { ko: '청주시 흥덕구 오송읍 가로수로 273', en: '273 Garosu-ro, Osong-eup, Cheongju' },
    description: {
      ko: '2005년 뚝섬 일대에 문을 연 대규모 도시 숲으로, 문화예술공원과 생태숲, 습지생태원 등 여러 테마 공간으로 이루어져 있다.',
      en: 'A large urban forest that opened on the Ttukseom riverside in 2005, made up of themed areas such as a culture and arts park, an eco forest and a wetland garden.',
    },
    position: [36.608, 127.336],
  },
  {
    id: 'coex',
    image: 'tourist-spots/coex',
    name: { ko: '코엑스', en: 'COEX' },
    category: { ko: '쇼핑·문화', en: 'Shopping & culture' },
    address: { ko: '청주시 흥덕구 오송읍 오송생명1로 513', en: '513 Osongsaengmyeong 1-ro, Osong-eup, Cheongju' },
    description: {
      ko: '국제 전시·컨벤션 센터와 대형 지하 쇼핑몰이 함께 있는 복합 문화 공간으로, 별마당 도서관과 코엑스 아쿠아리움으로 유명하다.',
      en: 'A complex combining an international exhibition and convention center with a large underground mall, known for the Starfield Library and COEX Aquarium.',
    },
    position: [36.629, 127.315],
  },
];
