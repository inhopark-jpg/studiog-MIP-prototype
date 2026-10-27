import { useState } from 'react';
import { TOURIST_SPOTS, type TouristSpot } from '../data/tourism';
import { useLanguage } from '../i18n';
import { Asset } from './Asset';
import './TourPanel.css';

/** 2 columns × 4 rows (Figma 1:22710 shows a full page) */
const PAGE_SIZE = 8;

type Props = {
  /** DRT 예약하기 in a spot's popup */
  onBook: (spot: TouristSpot) => void;
};

/** 관광 정보 tab (Figma 1:22564) and the spot popup (1:22710). The design's QR banner is left out. */
export function TourPanel({ onBook }: Props) {
  const { lang, t } = useLanguage();
  const [page, setPage] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pageCount = Math.max(1, Math.ceil(TOURIST_SPOTS.length / PAGE_SIZE));
  const visible = TOURIST_SPOTS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const open = openIndex === null ? null : TOURIST_SPOTS[openIndex];

  return (
    <div className="tour">
      <section className="tour-card">
        <h2 className="tour-card__title">{t.tourTitle}</h2>
        <ul className="tour-card__grid">
          {visible.map((spot) => (
            <li key={spot.id}>
              <button className="spot-item" onClick={() => setOpenIndex(TOURIST_SPOTS.indexOf(spot))}>
                <span className="spot-item__img">
                  <Asset name={spot.image} width={180} height={117} fit="cover" />
                </span>
                <span className="spot-item__text">
                  <span className="spot-item__name">{spot.name[lang]}</span>
                  <span className="spot-item__meta">{spot.category[lang]}</span>
                  <span className="spot-item__meta">{t.drtAvailable}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="tour-pager">
          <button className="tour-pager__btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <Asset name="booking/page-arrow" width={38} height={38} />
            {t.prev}
          </button>
          <span className="tour-pager__count">
            {page + 1}/{pageCount}
          </span>
          <button className="tour-pager__btn" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>
            {t.next}
            <Asset name="booking/page-arrow" width={38} height={38} className="tour-pager__next-icon" />
          </button>
        </div>
      </section>

      {open && openIndex !== null && (
        <div className="tour-overlay">
          <div className="spot-popup" role="dialog" aria-modal aria-label={open.name[lang]}>
            <div className="spot-popup__img">
              <Asset name={open.image} width={700} height={452} fit="cover" />
            </div>
            <div className="spot-popup__text">
              <h2 className="spot-popup__name">{open.name[lang]}</h2>
              <p className="spot-popup__meta">
                <span>{open.address[lang]}</span>
                <span className="spot-popup__divider" aria-hidden />
                <span>{open.category[lang]}</span>
              </p>
              <p className="spot-popup__desc">{open.description[lang]}</p>
            </div>
            <div className="spot-popup__actions">
              <button className="spot-popup__btn spot-popup__btn--close" onClick={() => setOpenIndex(null)}>
                {t.close}
              </button>
              <button className="spot-popup__btn spot-popup__btn--book" onClick={() => onBook(open)}>
                <Asset name="icons/calendar" width={38} height={38} />
                {t.bookDrt}
              </button>
            </div>
          </div>
          <button
            className="spot-popup__nav spot-popup__nav--prev"
            aria-label={t.prevSpot}
            disabled={openIndex === 0}
            onClick={() => setOpenIndex(openIndex - 1)}
          >
            <Asset name="tour/popup-arrow" width={54} height={54} />
          </button>
          <button
            className="spot-popup__nav spot-popup__nav--next"
            aria-label={t.nextSpot}
            disabled={openIndex === TOURIST_SPOTS.length - 1}
            onClick={() => setOpenIndex(openIndex + 1)}
          >
            <Asset name="tour/popup-arrow" width={54} height={54} />
          </button>
        </div>
      )}
    </div>
  );
}
