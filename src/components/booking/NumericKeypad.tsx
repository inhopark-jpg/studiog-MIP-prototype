import { useLanguage } from '../../i18n';
import { Asset } from '../Asset';
import './NumericKeypad.css';

type Props = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
};

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Figma 1:18799: 3×4 grid, 전체 지움 · 0 · 지우기 on the last row. */
export function NumericKeypad({ onDigit, onDelete, onClear }: Props) {
  const { t } = useLanguage();

  return (
    <div className="numpad">
      {DIGITS.map((d) => (
        <button key={d} className="numpad__key" onClick={() => onDigit(d)}>
          {d}
        </button>
      ))}
      <button className="numpad__key numpad__key--fn" onClick={onClear}>
        {t.clearAll}
      </button>
      <button className="numpad__key" onClick={() => onDigit('0')}>
        0
      </button>
      <button className="numpad__key numpad__key--fn" onClick={onDelete}>
        <Asset name="booking/backspace" width={33} height={29} />
        {t.deleteKey}
      </button>
    </div>
  );
}
