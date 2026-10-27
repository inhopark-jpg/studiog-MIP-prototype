import { useLanguage } from '../i18n';
import { Asset } from './Asset';
import './MainTabs.css';

export type MainTab = 'transit' | 'tour';

/** 교통 정보 (Figma 1:21714) / 관광 정보 (1:22564). The active tab carries the corner mark. */
export function MainTabs({ tab, onChange }: { tab: MainTab; onChange: (tab: MainTab) => void }) {
  const { t } = useLanguage();
  const tabs: [MainTab, string][] = [
    ['transit', t.tabTransit],
    ['tour', t.tabTour],
  ];

  return (
    <nav className="main-tabs" role="tablist">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          role="tab"
          aria-selected={tab === id}
          className={`main-tabs__tab ${tab === id ? 'is-active' : ''}`}
          onClick={() => onChange(id)}
        >
          {label}
          {tab === id && (
            <Asset name="icons/tab-select" width={20.5878} height={20.5878} className="main-tabs__select" />
          )}
        </button>
      ))}
    </nav>
  );
}
