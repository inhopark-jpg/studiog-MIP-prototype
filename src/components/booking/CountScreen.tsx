import { placeById } from '../../booking/data';
import { MAX_PASSENGERS, PASSENGER_TYPES, totalPassengers, type BookingState } from '../../booking/state';
import { useLanguage } from '../../i18n';
import { Asset } from '../Asset';
import { BookingLayout, Gap } from './BookingLayout';
import './CountScreen.css';

type Props = {
  booking: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
  onNext: () => void;
};

/** Figma 1:19513 (인원선택). */
export function CountScreen({ booking, update, onBack, onNext }: Props) {
  const { lang, t } = useLanguage();
  const { passengers } = booking;
  const total = totalPassengers(passengers);

  const change = (type: keyof typeof passengers, delta: number) =>
    update({ passengers: { ...passengers, [type]: passengers[type] + delta } });

  return (
    <BookingLayout
      title={t.countTitle}
      backLabel={t.changeDestination}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={total === 0}
    >
      <Gap size={62} />
      <div className="trip-card">
        <div className="trip-card__row">
          <span className="trip-card__icon">
            <Asset name="booking/summary-pin-pickup" width={33.6} height={38.4} />
          </span>
          <div className="trip-card__text">
            <span className="trip-card__label">{t.pickupLabel}</span>
            <span className="trip-card__value">{t.stationName}</span>
          </div>
        </div>
        <hr className="trip-card__line" />
        <div className="trip-card__row">
          <span className="trip-card__icon">
            <Asset name="booking/pin-dropoff" width={22.4127} height={28.95} />
          </span>
          <div className="trip-card__text">
            <span className="trip-card__label">{t.dropoffLabel}</span>
            <span className="trip-card__value">{booking.dropoff && placeById(booking.dropoff)?.name[lang]}</span>
          </div>
        </div>
      </div>
      <Gap size={86} />
      <ul className="passenger-list">
        {PASSENGER_TYPES.map((type) => (
          <li key={type} className="passenger-row">
            <span className="passenger-row__label">
              {t.passengerType[type]}
              {type === 'youth' && <small> {t.youthNote}</small>}
            </span>
            <div className="stepper">
              <button
                className="stepper__minus"
                aria-label={`${t.passengerType[type]} ${t.decrease}`}
                disabled={passengers[type] === 0}
                onClick={() => change(type, -1)}
              >
                <span />
              </button>
              <span className="stepper__value">{passengers[type]}</span>
              <button
                className="stepper__plus"
                aria-label={`${t.passengerType[type]} ${t.increase}`}
                disabled={total >= MAX_PASSENGERS}
                onClick={() => change(type, 1)}
              >
                <Asset name="booking/stepper-plus" width={64.8} height={64.8} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="passenger-total">
        <span className="passenger-total__label">{t.passengersLabel}</span>
        <span className="passenger-total__value">{t.passengerTotal(total)}</span>
      </div>
    </BookingLayout>
  );
}
