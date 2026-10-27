import { useLanguage } from '../i18n';
import { Asset } from './Asset';
import './DrtActionBar.css';

export function DrtActionBar({ onBook, onLookup }: { onBook: () => void; onLookup: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="drt-bar">
      <div className="drt-bar__title">
        <span className="drt-bar__logo">
          <Asset name="icons/drt-logo" width={72} height={43} fit="cover" />
        </span>
        {t.drtBooking}
      </div>
      <div className="drt-bar__actions">
        <button className="drt-bar__btn drt-bar__btn--primary" onClick={onBook}>
          <Asset name="icons/calendar" width={38} height={38} />
          {t.book}
        </button>
        <button className="drt-bar__btn drt-bar__btn--secondary" onClick={onLookup}>
          <Asset name="icons/search" width={38} height={38} />
          {t.lookup}
        </button>
      </div>
    </div>
  );
}
