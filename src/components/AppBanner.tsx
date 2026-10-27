import { useLanguage } from '../i18n';
import { Asset } from './Asset';
import './AppBanner.css';

/**
 * Top app-download banner. The image has its Korean copy baked in, so other languages
 * cover that copy and set their own text on top (Figma 10:666).
 */
export function AppBanner() {
  const { t } = useLanguage();

  return (
    <div className="app-banner">
      <Asset name="banner/app-download" width={1080} height={238} fit="cover" />
      {t.banner && (
        <div className="app-banner__copy">
          <p className="app-banner__title">{t.banner.title}</p>
          <p className="app-banner__subtitle">{t.banner.subtitle}</p>
        </div>
      )}
    </div>
  );
}
