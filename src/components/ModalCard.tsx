import type { ReactNode } from 'react';
import { useLanguage } from '../i18n';
import './ModalCard.css';

type Props = {
  title: string;
  /** Optional boxed line under the title (search modals) */
  subtitle?: ReactNode;
  children: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  /** Search modals use taller footer buttons (py 32 vs 24) */
  tallButtons?: boolean;
  className?: string;
};

/** Figma "modal_setting": white card, title, body, 취소/확인 footer. Position it with an overlay. */
export function ModalCard({ title, subtitle, children, onCancel, onConfirm, tallButtons, className = '' }: Props) {
  const { t } = useLanguage();

  return (
    <div className={`modal-card ${className}`} role="dialog" aria-modal aria-label={title}>
      <div className={`modal-card__header ${subtitle ? 'has-subtitle' : ''}`}>
        <h2 className="modal-card__title">{title}</h2>
        {subtitle && <div className="modal-card__subtitle">{subtitle}</div>}
      </div>
      {children}
      <div className={`modal-card__footer ${tallButtons ? 'is-tall' : ''}`}>
        <button className="modal-card__btn modal-card__btn--cancel" onClick={onCancel}>
          {t.cancel}
        </button>
        <button className="modal-card__btn modal-card__btn--confirm" onClick={onConfirm}>
          {t.confirm}
        </button>
      </div>
    </div>
  );
}

/** Dark overlay that centers a modal within its positioned parent. */
export function ModalOverlay({ children, coverBottomBar }: { children: ReactNode; coverBottomBar?: boolean }) {
  return <div className={`modal-overlay ${coverBottomBar ? 'covers-bottom-bar' : ''}`}>{children}</div>;
}
