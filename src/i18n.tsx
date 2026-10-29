import { createContext, useContext, useEffect, type ReactNode } from 'react';

export type Lang = 'ko' | 'en';

const WEEKDAYS_KO = '일월화수목금토';
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

const ko = {
  langLabel: '한국어',
  tabTransit: '교통 정보',
  tabTour: '관광 정보',
  stationName: '오송역 버스 환승센터 (오송역 8)',
  /** "12월 24일 (수) 17:49" */
  date: (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS_KO[d.getDay()]}) ${hhmm(d)}`,
  currentLocation: '현위치',
  zoomIn: '확대',
  zoomOut: '축소',
  drtTitle: 'DRT',
  busTitle: '버스',
  drtRoute: (no: string) => `오송 ${no}`,
  drtVehicle: (no: string) => `오송${no}`,
  // Figma (1:21043) uses "N분 전" for DRT rows too
  drtEta: (min: number) => (min === 0 ? '곧 도착' : `${min}분 전`),
  boardingNo: (no: string) => `탑승번호 : ${no}`,
  busEta: (min: number) => (min === 0 ? '도착' : `${min}분 전`),
  floor: (low: boolean): string => (low ? '저상' : '일반'),
  /** indexed by crowd level 0–2 */
  crowd: ['여유', '보통', '혼잡'],
  /** English bus rows show only this label + the dots (Figma 10:666); unused in Korean */
  congestion: '혼잡도',
  /** Text laid over the banner image, which has Korean baked in; null keeps the image as is */
  banner: null as { title: string; subtitle: string } | null,
  prev: '이전',
  next: '다음',
  drtBooking: 'DRT 예약',
  book: '예약하기',
  lookup: '예약조회',
  home: '첫화면',
  magnify: '확대',
  contrast: '고대비',
  lowScreen: '낮은화면',
  volumeDown: '볼륨 낮추기',
  volumeUp: '볼륨 높이기',
  unsupported: '지원되지 않습니다',
  langModalTitle: '언어를 선택하세요.',
  cancel: '취소',
  confirm: '확인',

  // Booking: shared
  stepBack: '이전',
  stepNext: '다음',
  // Booking: phone verification (Figma 1:18761, 1:20678)
  phoneTitle: '본인의 휴대전화를 입력해 주세요',
  countryPlaceholder: '+ 국가선택',
  requestCode: '인증요청',
  codePlaceholder: '인증번호를 입력해주세요.',
  extend: '연장',
  smsNote: '인증번호는 문자(SMS)로 발송됩니다',
  clearAll: '전체 지움',
  deleteKey: '지우기',
  countryModalTitle: '국가번호를 선택해 주세요.',
  // Booking: destination (Figma 1:19091, 1:19191, 1:19344, 1:24423)
  placeTitle: '도착지를 선택해주세요',
  pickupName: '오송역 버스 환승센터 (오송역8)',
  dropoffPlaceholder: '도착지를 입력해주세요.',
  find: '찾기',
  resultsTitle: '도착지를 선택하세요',
  noResultsTitle: '도착지를 선택해 주세요.',
  resultsFor: (q: string): ReactNode => (
    <>
      <em>“{q}”</em> 가 포함된 검색 내용
    </>
  ),
  noResults: (q: string): ReactNode => (
    <>
      검색어 “{q}”에 대한
      <br />
      도착지 검색 결과가 없습니다.
    </>
  ),
  noResultsHint: '도착지 검색어를 다시 입력해 주세요.',
  // Booking: passengers (Figma 1:19513)
  countTitle: '인원수를 선택해주세요',
  changeDestination: '도착지 변경',
  pickupLabel: '출발지',
  dropoffLabel: '도착지',
  passengerType: { adult: '성인', youth: '청소년', child: '어린이' },
  youthNote: '(청소년 : 만 9세~18세)',
  passengersLabel: '인원',
  passengerTotal: (n: number): ReactNode => (
    <>
      총 <em>{n}</em> 명
    </>
  ),
  decrease: '줄이기',
  increase: '늘리기',
  // Booking: pickup time (Figma 1:19625)
  timeTitle: '승차시간을 선택해주세요',
  changeCount: '인원수 변경',
  boardBetween: '사이에 승차',
  // Booking: confirm popup (Figma 1:20299)
  confirmTitle: '예약 정보 확인',
  bookedAt: '예약 시간',
  passengersRow: '예약인원',
  /** "성인 1명, 청소년 2명" */
  passengerSummary: (parts: [string, number][]) => parts.map(([type, n]) => `${type} ${n}명`).join(', '),
  confirmNotice: (): ReactNode => (
    <>
      예약 확정시 승하차 시간이 문자로 안내됩니다.
      <br />
      요금은 승차 시 결제해주세요.
    </>
  ),
  // Reservation (Figma 1:19996, cancel popup 1:20157)
  reservationTitle: '나의 예약 정보',
  reservationPickup: '오송역 버스 환승센터 (8번 게이트)',
  boardingWindow: '탑승 예상 시간',
  boardingNumber: '탑승번호',
  fareNotice: '요금은 승차 시 결제해주세요.',
  cancelReservation: '예약 취소',
  backToStart: (sec: number) => `처음 화면으로 (${sec}초)`,
  cancelQuestion: '예약을 취소하시겠습니까?',
  no: '아니요',
  // 예약조회 with a number that has no booking (Figma 1:20092)
  noReservation: (): ReactNode => (
    <>
      예약 정보가 존재하지 않습니다.
      <br />
      DRT 예약을 진행해주세요.
    </>
  ),
  noReservationHint: '예약 후 탑승 정보를 확인하실 수 있습니다.',
  bookDrt: 'DRT 예약하기',
  // 도착 marker on the map (Figma 1:20371)
  mapArrive: '도착',
  // 관광 정보 (Figma 1:22564, popup 1:22710)
  tourTitle: '관광 명소',
  drtAvailable: 'DRT 호출 가능',
  drtUnavailable: '해당 목적지로는 DRT 예약이 어렵습니다.',
  close: '닫기',
  prevSpot: '이전 명소',
  nextSpot: '다음 명소',
  // On-screen keyboard function keys
  kbDelete: '← 지우기',
  kbShift: '쌍자음',
  kbSymbols: '기호',
  kbEnglish: '영어',
  kbHangul: '한글',
  kbCaps: '대문자',
  kbSpace: '한칸 띄우기',
};

export type Strings = typeof ko;

const en: Strings = {
  // The language button shows the current language (Figma 10:666's "KOR" was a slip)
  langLabel: 'English',
  tabTransit: 'Transport',
  tabTour: 'Tourism',
  // Shown at 30px in English (StationHeader.css)
  stationName: 'Osong Station Bus Transfer Center',
  /** "December 24 (Wed) 17:49" */
  date: (d: Date) => `${MONTHS_EN[d.getMonth()]} ${d.getDate()} (${WEEKDAYS_EN[d.getDay()]}) ${hhmm(d)}`,
  currentLocation: 'You are here',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  drtTitle: 'DRT',
  busTitle: 'Bus',
  drtRoute: (no) => `Osong ${no}`,
  drtVehicle: (no) => `Osong${no}`,
  drtEta: (min) => (min === 0 ? 'Arriving Soon' : `${min} Min`),
  boardingNo: (no) => `Boarding No. : ${no}`,
  busEta: (min) => (min === 0 ? 'Arrived' : `${min} Min`),
  floor: (low) => (low ? 'Low-floor' : 'Standard'),
  // Short enough for "Low-floor | ___ ●●○" to fit the 286px bus info column
  crowd: ['Light', 'Mid', 'Busy'],
  congestion: 'Congestion',
  banner: { title: 'Move freely with VARO DRT', subtitle: 'Scan the QR code to download the app' },
  prev: 'Prev.',
  next: 'Next',
  drtBooking: 'DRT Ride Request',
  book: 'Book Ride',
  lookup: 'My Booking',
  home: 'Home',
  magnify: 'Zoom',
  contrast: 'Contrast',
  lowScreen: 'Low Screen',
  volumeDown: 'Volume down',
  volumeUp: 'Volume up',
  unsupported: 'Not supported',
  langModalTitle: 'Select a language.',
  cancel: 'Cancel',
  confirm: 'OK',

  stepBack: 'Back',
  stepNext: 'Next',
  phoneTitle: 'Enter your mobile number',
  countryPlaceholder: '+ Country',
  // Short enough to leave room for the masked number beside it
  requestCode: 'Get code',
  codePlaceholder: 'Enter the verification code.',
  extend: 'Extend',
  smsNote: 'The code will be sent by text message (SMS)',
  clearAll: 'Clear all',
  deleteKey: 'Delete',
  countryModalTitle: 'Select a country code.',
  placeTitle: 'Choose your destination',
  pickupName: 'Osong Stn. Bus Transfer Center (Osong Stn. 8)',
  dropoffPlaceholder: 'Enter your destination.',
  find: 'Search',
  resultsTitle: 'Select your destination',
  noResultsTitle: 'Select your destination',
  resultsFor: (q) => (
    <>
      Results for <em>“{q}”</em>
    </>
  ),
  noResults: (q) => (
    <>
      No destinations found
      <br />
      for “{q}”.
    </>
  ),
  noResultsHint: 'Please try a different search term.',
  countTitle: 'Select the number of passengers',
  changeDestination: 'Change destination',
  pickupLabel: 'From',
  dropoffLabel: 'To',
  passengerType: { adult: 'Adult', youth: 'Youth', child: 'Child' },
  youthNote: '(ages 9–18)',
  passengersLabel: 'Passengers',
  passengerTotal: (n) => (
    <>
      Total <em>{n}</em>
    </>
  ),
  decrease: 'Decrease',
  increase: 'Increase',
  timeTitle: 'Select a pickup time',
  changeCount: 'Change passengers',
  boardBetween: 'pickup',
  confirmTitle: 'Confirm your booking',
  bookedAt: 'Booked at',
  passengersRow: 'Passengers',
  passengerSummary: (parts) => parts.map(([type, n]) => `${type} ${n}`).join(', '),
  confirmNotice: () => (
    <>
      Pickup and drop-off times will be sent by SMS.
      <br />
      Please pay the fare when boarding.
    </>
  ),
  reservationTitle: 'My booking',
  reservationPickup: 'Osong Stn. Bus Transfer Center (Gate 8)',
  boardingWindow: 'Expected pickup',
  boardingNumber: 'Boarding No.',
  fareNotice: 'Please pay the fare when boarding.',
  cancelReservation: 'Cancel booking',
  backToStart: (sec) => `Back to start (${sec}s)`,
  cancelQuestion: 'Cancel this booking?',
  no: 'No',
  noReservation: () => (
    <>
      No booking found for this number.
      <br />
      Please make a DRT booking.
    </>
  ),
  noReservationHint: 'Your boarding details will appear here after booking.',
  bookDrt: 'Book DRT',
  mapArrive: 'Drop-off',
  tourTitle: 'Attractions',
  drtAvailable: 'DRT available',
  drtUnavailable: "DRT booking isn't available for this destination.",
  close: 'Close',
  prevSpot: 'Previous attraction',
  nextSpot: 'Next attraction',
  kbDelete: '← Delete',
  kbShift: 'Shift',
  kbSymbols: 'Symbols',
  kbEnglish: 'ABC',
  kbHangul: '한글',
  kbCaps: 'Shift',
  kbSpace: 'Space',
};

const STRINGS: Record<Lang, Strings> = { ko, en };

type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void; t: Strings };

const LanguageContext = createContext<LanguageContextValue>({ lang: 'ko', setLang: () => {}, t: ko });

export function LanguageProvider({ lang, setLang, children }: Omit<LanguageContextValue, 't'> & { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
