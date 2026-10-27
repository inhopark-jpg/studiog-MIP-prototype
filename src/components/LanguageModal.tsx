import { useState } from 'react';
import { useLanguage, type Lang } from '../i18n';
import { ModalCard, ModalOverlay } from './ModalCard';
import { OptionList, type Option } from './OptionList';

// Labels are always shown in their own language. The design's 日本語/中文 are left out.
const OPTIONS: Option<Lang>[] = [
  { id: 'ko', label: '한국어' },
  { id: 'en', label: 'English' },
];

/** Figma 1:21231. Rendered inside the home content area, so the scrim covers map → action bar. */
export function LanguageModal({ onClose }: { onClose: () => void }) {
  const { lang, setLang, t } = useLanguage();
  const [selected, setSelected] = useState<Lang>(lang);

  return (
    <ModalOverlay>
      <ModalCard
        title={t.langModalTitle}
        onCancel={onClose}
        onConfirm={() => {
          setLang(selected);
          onClose();
        }}
      >
        <OptionList options={OPTIONS} selected={selected} onSelect={setSelected} />
      </ModalCard>
    </ModalOverlay>
  );
}
