import type { ReactNode } from 'react';
import { useLanguage } from '../../i18n';
import './Booking.css';

type Props = {
  title: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  /** Defaults to 이전 / 다음 */
  backLabel?: string;
  nextLabel?: string;
  /** Extra class on the root, for per-screen tweaks */
  className?: string;
  /** Modals/keyboards positioned over the title → step-nav area */
  overlay?: ReactNode;
};

/** Booking screens: gray title bar, body, 이전/다음 bar (Figma "btn" 1:18776). */
export function BookingLayout(props: Props) {
  const { title, children, onBack, onNext, nextDisabled, backLabel, nextLabel, className = '', overlay } = props;
  const { t } = useLanguage();

  return (
    <div className={`booking ${className}`}>
      <h1 className="booking__title">{title}</h1>
      <div className="booking__body">{children}</div>
      <div className="step-nav">
        <button className="step-nav__btn step-nav__btn--back" onClick={onBack}>
          {backLabel ?? t.stepBack}
        </button>
        <button className="step-nav__btn step-nav__btn--next" onClick={onNext} disabled={nextDisabled}>
          {nextLabel ?? t.stepNext}
        </button>
      </div>
      {overlay}
    </div>
  );
}

/** Flexible vertical gap: the design's size on a 1920px-tall screen, shrinking on shorter ones. */
export const Gap = ({ size, min = 24 }: { size: number; min?: number }) => (
  <div className="booking-gap" style={{ flexBasis: size, minHeight: min }} aria-hidden />
);
