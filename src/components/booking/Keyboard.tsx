import { useState } from 'react';
import { SHIFTED } from '../../booking/hangul';
import { useLanguage, type Lang } from '../../i18n';
import { useUnsupported } from '../Toast';
import './Keyboard.css';

const DIGITS = [...'1234567890'];
/** Letter rows per layout; both have 10/9/7 keys so the Figma key sizes fit either. */
const ROWS: Record<Lang, string[][]> = {
  ko: [[...'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ'], [...'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ'], [...'ㅋㅌㅊㅍㅠㅜㅡ']],
  en: [[...'qwertyuiop'], [...'asdfghjkl'], [...'zxcvbnm']],
};

type Props = {
  onKey: (key: string) => void;
  onDelete: () => void;
};

/**
 * Figma 1:19208: 2-set Hangul keyboard docked above the step nav. The English layout isn't
 * designed; it reuses the same keys with QWERTY letters. 기호 isn't designed.
 */
export function Keyboard({ onKey, onDelete }: Props) {
  const { lang, t } = useLanguage();
  const unsupported = useUnsupported();
  const [layout, setLayout] = useState<Lang>(lang);
  const [shift, setShift] = useState(false); // 쌍자음 / Shift: one-shot
  const [row2, row3, row4] = ROWS[layout];

  const shifted = (key: string) => (layout === 'ko' ? SHIFTED[key] ?? key : key.toUpperCase());

  const letter = (base: string) => {
    const key = shift ? shifted(base) : base;
    return (
      <button
        key={base}
        className="kb-key kb-key--letter"
        onClick={() => {
          onKey(key);
          setShift(false);
        }}
      >
        {key}
      </button>
    );
  };

  return (
    <div className="keyboard">
      <div className="keyboard__row">
        {DIGITS.map((d) => (
          <button key={d} className="kb-key kb-key--digit" onClick={() => onKey(d)}>
            {d}
          </button>
        ))}
        <button className="kb-key kb-key--fn kb-key--delete" onClick={onDelete}>
          {t.kbDelete}
        </button>
      </div>
      <div className="keyboard__row">
        {row2.map(letter)}
        <button className="kb-key kb-key--fn kb-key--dash" onClick={() => onKey('-')}>
          -
        </button>
      </div>
      <div className="keyboard__row">
        {row3.map(letter)}
        <button
          className={`kb-key kb-key--fn kb-key--shift ${shift ? 'is-active' : ''}`}
          aria-pressed={shift}
          onClick={() => setShift(!shift)}
        >
          {layout === 'ko' ? t.kbShift : t.kbCaps}
        </button>
      </div>
      <div className="keyboard__row">
        <button className="kb-key kb-key--fn kb-key--narrow" onClick={unsupported}>
          {t.kbSymbols}
        </button>
        {row4.map(letter)}
        <button
          className="kb-key kb-key--fn kb-key--narrow"
          onClick={() => {
            setLayout(layout === 'ko' ? 'en' : 'ko');
            setShift(false);
          }}
        >
          {layout === 'ko' ? t.kbEnglish : t.kbHangul}
        </button>
        <button className="kb-key kb-key--fn kb-key--space" onClick={() => onKey(' ')}>
          {t.kbSpace}
        </button>
      </div>
    </div>
  );
}
