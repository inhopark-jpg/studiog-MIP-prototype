import { useEffect, useState } from 'react';
import {
  CODE_DIGITS,
  COUNTRIES,
  DEFAULT_COUNTRY,
  formatPhone,
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
  VERIFICATION_CODE,
} from '../../booking/data';
import type { BookingState } from '../../booking/state';
import { useNow } from '../../hooks/useNow';
import { useLanguage } from '../../i18n';
import { Asset } from '../Asset';
import { ModalCard, ModalOverlay } from '../ModalCard';
import { OptionList } from '../OptionList';
import { BookingLayout, Gap } from './BookingLayout';
import { NumericKeypad } from './NumericKeypad';
import './PhoneScreen.css';

/** How long a sent code stays valid; 연장 restarts it */
const CODE_VALID_MS = 60_000;

/** "01:00" */
const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

type Props = {
  booking: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
  onNext: () => void;
};

/** Figma 1:18761 (휴대폰인증) + 1:20678 (번호선택 popup). */
export function PhoneScreen({ booking, update, onBack, onNext }: Props) {
  const { lang, t } = useLanguage();
  const [target, setTarget] = useState<'phone' | 'code'>(booking.codeRequested ? 'code' : 'phone');
  const [countryModal, setCountryModal] = useState<string | null>(null); // pending selection while open

  const now = useNow(250).getTime();
  const secondsLeft = booking.codeExpiresAt === null ? null : Math.max(0, Math.ceil((booking.codeExpiresAt - now) / 1000));
  const expired = secondsLeft === 0;

  // An expired code can't be used: clear it so 다음 disables until 인증요청 is pressed again
  useEffect(() => {
    if (expired && booking.code) {
      update({ code: '' });
    }
  }, [expired, booking.code, update]);

  const country = COUNTRIES.find((c) => c.code === booking.country);

  const editPhone = (phone: string) => {
    // A new number invalidates any code already sent
    update({ phone, code: '', codeRequested: false, codeExpiresAt: null });
    setTarget('phone');
  };

  const requestCode = () => {
    update({ code: '', codeRequested: true, codeExpiresAt: Date.now() + CODE_VALID_MS });
    setTarget('code');
  };

  const keypad = {
    onDigit: (d: string) => {
      if (target === 'phone' && booking.phone.length < PHONE_MAX_DIGITS) editPhone(booking.phone + d);
      if (target === 'code' && !expired && booking.code.length < CODE_DIGITS) update({ code: booking.code + d });
    },
    onDelete: () => (target === 'phone' ? editPhone(booking.phone.slice(0, -1)) : update({ code: booking.code.slice(0, -1) })),
    onClear: () => (target === 'phone' ? editPhone('') : update({ code: '' })),
  };

  const caret = <span className="field__caret" aria-hidden />;

  return (
    <BookingLayout
      title={t.phoneTitle}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!booking.codeRequested || expired || booking.code !== VERIFICATION_CODE}
      overlay={
        countryModal !== null && (
          <ModalOverlay>
            <ModalCard
              title={t.countryModalTitle}
              onCancel={() => setCountryModal(null)}
              onConfirm={() => {
                update({ country: countryModal });
                setCountryModal(null);
              }}
            >
              <OptionList
                options={COUNTRIES.map((c) => ({ id: c.code, label: `+${c.code} ${c.name[lang]}` }))}
                selected={countryModal}
                onSelect={setCountryModal}
              />
            </ModalCard>
          </ModalOverlay>
        )
      }
    >
      <Gap size={91} />
      <div className="phone-form">
        <div className="phone-form__row">
          <button className="country-select" onClick={() => setCountryModal(booking.country ?? DEFAULT_COUNTRY)}>
            {/* English names are too long for the selector, so it shows the ISO code (+82 KR) */}
            {country ? `+${country.code} ${lang === 'en' ? country.iso : country.name.ko}` : t.countryPlaceholder}
            <span className="country-select__chevron">
              <Asset name="booking/chevron-down" width={34.6154} height={18.4615} />
            </span>
          </button>
          <div className="field phone-form__phone" onClick={() => setTarget('phone')}>
            <span className="field__text">
              {formatPhone(booking.phone, true)}
              {target === 'phone' && caret}
            </span>
            <button
              className="field-btn"
              disabled={booking.phone.length < PHONE_MIN_DIGITS}
              onClick={(e) => {
                e.stopPropagation();
                requestCode();
              }}
            >
              {t.requestCode}
            </button>
          </div>
        </div>
        <div className="field" onClick={() => booking.codeRequested && setTarget('code')}>
          <span className={`field__text ${booking.code ? '' : 'is-placeholder'}`}>
            {booking.code || (target === 'code' ? '' : t.codePlaceholder)}
            {target === 'code' && caret}
          </span>
          {secondsLeft !== null && <span className="phone-form__timer">{mmss(secondsLeft)}</span>}
          <button
            className="field-btn phone-form__extend"
            disabled={secondsLeft === null || expired}
            onClick={(e) => {
              e.stopPropagation();
              update({ codeExpiresAt: Date.now() + CODE_VALID_MS });
            }}
          >
            {t.extend}
          </button>
        </div>
      </div>
      <Gap size={40} min={16} />
      <p className="phone-form__note">{t.smsNote}</p>
      <Gap size={85} />
      <NumericKeypad {...keypad} />
      <div className="booking-gap" style={{ flex: '1 1 110px', minHeight: 24 }} aria-hidden />
    </BookingLayout>
  );
}
