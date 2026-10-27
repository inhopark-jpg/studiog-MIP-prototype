import { useContrast } from '../contrast';
import { useLanguage } from '../i18n';
import { Asset } from './Asset';
import { useUnsupported } from './Toast';
import './BottomBar.css';

type Props = {
  isHome: boolean;
  volume: number;
  onHome: () => void;
  onVolumeChange: (volume: number) => void;
};

export const MAX_VOLUME = 10;

export function BottomBar({ isHome, volume, onHome, onVolumeChange }: Props) {
  const { t } = useLanguage();
  const unsupported = useUnsupported();
  const { contrast, setContrast } = useContrast();

  return (
    <footer className="bottom-bar">
      {isHome ? (
        <button className="bottom-bar__btn is-muted" disabled>
          <Asset name="icons/home" width={40} height={40} />
          {t.home}
        </button>
      ) : (
        <button className="bottom-bar__btn bottom-bar__btn--home" onClick={onHome}>
          <Asset name="icons/home-active" width={40} height={40} />
          {t.home}
        </button>
      )}
      <button className="bottom-bar__btn" onClick={unsupported}>
        <Asset name="icons/magnify" width={40} height={40} />
        {t.magnify}
      </button>
      <button
        className={`bottom-bar__btn ${contrast ? 'is-on' : ''}`}
        aria-pressed={contrast}
        onClick={() => setContrast(!contrast)}
      >
        <span className="bottom-bar__icon-box">
          <Asset name="icons/contrast" width={38} height={38} />
        </span>
        {t.contrast}
      </button>
      <button className="bottom-bar__btn bottom-bar__btn--grow bottom-bar__btn--low" onClick={unsupported}>
        <Asset name="icons/low-screen" width={40} height={40} />
        {t.lowScreen}
      </button>
      <div className="bottom-bar__volume">
        <button
          className="volume-btn"
          aria-label={t.volumeDown}
          disabled={volume <= 0}
          onClick={() => onVolumeChange(volume - 1)}
        >
          <span className="volume-btn__bar" />
        </button>
        <div className="bottom-bar__volume-value">
          <Asset name="icons/volume" width={32} height={32} />
          <span>{volume}</span>
        </div>
        <button
          className="volume-btn"
          aria-label={t.volumeUp}
          disabled={volume >= MAX_VOLUME}
          onClick={() => onVolumeChange(volume + 1)}
        >
          <span className="volume-btn__bar" />
          <span className="volume-btn__bar volume-btn__bar--vertical" />
        </button>
      </div>
    </footer>
  );
}
