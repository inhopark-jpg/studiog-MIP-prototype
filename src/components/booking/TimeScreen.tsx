import { useState } from 'react';
import { pickupSlots, type BookingState } from '../../booking/state';
import { useLanguage } from '../../i18n';
import { Asset } from '../Asset';
import { ModalCard, ModalOverlay } from '../ModalCard';
import { BookingLayout } from './BookingLayout';
import { InfoList, passengerSummary, RouteBox, slotRange, timeOf } from './ReservationParts';
import './TimeScreen.css';

const PAGE_SIZE = 6;
const PAGES = 2;

type Props = {
  booking: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
  /** 확인 in the 예약 정보 확인 popup */
  onConfirm: () => void;
};

/** Figma 1:19625 (승차시간선택) + 1:20299 (예약 정보 확인 popup). */
export function TimeScreen({ booking, update, onBack, onConfirm }: Props) {
  const { t } = useLanguage();
  // Fixed while the screen is open so the list doesn't shift under the user's finger
  const [slots] = useState(() => pickupSlots(Date.now(), PAGE_SIZE * PAGES));
  const selected = booking.slot !== null && slots.includes(booking.slot) ? booking.slot : null;
  const [page, setPage] = useState(() => (selected === null ? 0 : Math.floor(slots.indexOf(selected) / PAGE_SIZE)));
  const [confirmAt, setConfirmAt] = useState<number | null>(null); // popup open since (예약 시간)

  return (
    <BookingLayout
      title={t.timeTitle}
      backLabel={t.changeCount}
      onBack={onBack}
      onNext={() => setConfirmAt(Date.now())}
      nextDisabled={selected === null}
      overlay={
        confirmAt !== null &&
        selected !== null && (
          <ModalOverlay coverBottomBar>
            <ModalCard
              className="confirm-modal"
              title={t.confirmTitle}
              onCancel={() => setConfirmAt(null)}
              onConfirm={onConfirm}
            >
              <div className="confirm-modal__body">
                <RouteBox dropoff={booking.dropoff!} variant="popup" />
                <InfoList
                  variant="popup"
                  rows={[
                    [t.bookedAt, timeOf(confirmAt)],
                    [t.passengersRow, passengerSummary(t, booking.passengers)],
                  ]}
                />
                <p className="confirm-modal__notice">{t.confirmNotice()}</p>
              </div>
            </ModalCard>
          </ModalOverlay>
        )
      }
    >
      <div className="slot-list">
        {slots.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((slot) => {
          const isSelected = slot === selected;
          return (
            <button
              key={slot}
              className={`slot ${isSelected ? 'is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => update({ slot })}
            >
              <span className="slot__time">
                <Asset name="booking/clock" width={44} height={44} />
                {slotRange(slot).replace('~', ' ~ ')}
              </span>
              <span className="slot__note">{t.boardBetween}</span>
              <span className="slot__check">
                <Asset name={isSelected ? 'booking/check-on' : 'booking/check-off'} width={60} height={60} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="slot-pager">
        <button className="slot-pager__btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
          <Asset name="booking/page-arrow" width={38} height={38} />
          {t.prev}
        </button>
        <span className="slot-pager__count">
          {page + 1}/{PAGES}
        </span>
        <button className="slot-pager__btn" disabled={page === PAGES - 1} onClick={() => setPage(page + 1)}>
          {t.next}
          <Asset name="booking/page-arrow" width={38} height={38} className="slot-pager__next-icon" />
        </button>
      </div>
    </BookingLayout>
  );
}
