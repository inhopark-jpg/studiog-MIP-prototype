import { useNow } from '../hooks/useNow';
import { useLanguage } from '../i18n';
import { Asset } from './Asset';
import './StationHeader.css';

type Props = { temperatureC: number; onLanguageClick: () => void };

export function StationHeader({ temperatureC, onLanguageClick }: Props) {
  const now = useNow(10_000);
  const { t } = useLanguage();

  return (
    <header className="station-header">
      <h1 className="station-header__name">{t.stationName}</h1>
      <div className="station-header__meta">
        <span>{t.date(now)}</span>
        <span className="station-header__divider" />
        <span>{temperatureC} ºC</span>
      </div>
      <button className="station-header__lang" onClick={onLanguageClick}>
        <Asset name="icons/globe" width={36} height={36} />
        {t.langLabel}
      </button>
    </header>
  );
}
