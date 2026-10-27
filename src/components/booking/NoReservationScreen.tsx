import { useCountdown } from '../../hooks/useCountdown';
import { useLanguage } from '../../i18n';
import { Asset } from '../Asset';
import { BookingLayout, Gap } from './BookingLayout';
import { AUTO_HOME_SECONDS } from './ReservationScreen';
import './ReservationScreen.css';

type Props = {
  onHome: () => void;
  /** DRT 예약하기 */
  onBook: () => void;
};

/** Figma 1:20092 (예약정보없음): 예약조회 with a number that has no booking. */
export function NoReservationScreen({ onHome, onBook }: Props) {
  const { t } = useLanguage();
  const secondsLeft = useCountdown(AUTO_HOME_SECONDS, onHome);

  return (
    <BookingLayout
      title={t.reservationTitle}
      backLabel={t.backToStart(secondsLeft)}
      nextLabel={t.bookDrt}
      onBack={onHome}
      onNext={onBook}
    >
      <Gap size={86} />
      <div className="no-reservation">
        <Asset name="booking/warning" width={120} height={120} />
        <p className="no-reservation__message">{t.noReservation()}</p>
        <p className="no-reservation__hint">{t.noReservationHint}</p>
      </div>
      <Gap size={87} />
    </BookingLayout>
  );
}
