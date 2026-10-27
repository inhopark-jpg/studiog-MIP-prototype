import { useState } from 'react';
import type { Reservation } from '../../booking/state';
import { useCountdown } from '../../hooks/useCountdown';
import { useLanguage } from '../../i18n';
import { ModalOverlay } from '../ModalCard';
import { BookingLayout, Gap } from './BookingLayout';
import { InfoList, passengerSummary, RouteBox, slotRange, timeOf } from './ReservationParts';
import './ReservationScreen.css';

export const AUTO_HOME_SECONDS = 20;

type Props = {
  reservation: Reservation;
  /** 예약 취소 confirmed in the popup */
  onCancelReservation: () => void;
  onHome: () => void;
};

/** Figma 1:19996 (나의 예약 정보) + 1:20157 (예약 취소 popup). Shown after booking and by 예약조회. */
export function ReservationScreen({ reservation, onCancelReservation, onHome }: Props) {
  const { t } = useLanguage();
  const [askCancel, setAskCancel] = useState(false);
  // Counts down to the first screen; paused while the cancel popup is open
  const secondsLeft = useCountdown(AUTO_HOME_SECONDS, onHome, askCancel);

  return (
    <BookingLayout
      className="reservation"
      title={t.reservationTitle}
      backLabel={t.cancelReservation}
      nextLabel={t.backToStart(secondsLeft)}
      onBack={() => setAskCancel(true)}
      onNext={onHome}
      overlay={
        askCancel && (
          <ModalOverlay>
            <div className="cancel-modal" role="dialog" aria-modal aria-label={t.cancelQuestion}>
              <h2 className="cancel-modal__title">{t.cancelQuestion}</h2>
              <div className="cancel-modal__actions">
                <button className="cancel-modal__btn cancel-modal__btn--no" onClick={() => setAskCancel(false)}>
                  {t.no}
                </button>
                <button className="cancel-modal__btn cancel-modal__btn--yes" onClick={onCancelReservation}>
                  {t.cancelReservation}
                </button>
              </div>
            </div>
          </ModalOverlay>
        )
      }
    >
      <Gap size={89} />
      <div className="reservation-card">
        <div className="reservation-card__content">
          <RouteBox dropoff={reservation.dropoff} variant="page" />
          <InfoList
            variant="page"
            rows={[
              [t.bookedAt, timeOf(reservation.bookedAt)],
              [t.boardingWindow, slotRange(reservation.slot)],
              [t.passengersRow, passengerSummary(t, reservation.passengers)],
              [t.boardingNumber, reservation.boardingNo],
            ]}
          />
        </div>
        <p className="reservation-card__notice">{t.fareNotice}</p>
      </div>
    </BookingLayout>
  );
}
