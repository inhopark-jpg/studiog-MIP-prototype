import { useState } from 'react';
import { PLACE_QUERY, placeById, searchPlaces } from '../../booking/data';
import { backspace, typeKey } from '../../booking/hangul';
import type { BookingState } from '../../booking/state';
import { STATION, type MapVehicle } from '../../data/mock';
import { useLanguage } from '../../i18n';
import { Asset } from '../Asset';
import { ModalCard, ModalOverlay } from '../ModalCard';
import { OptionList } from '../OptionList';
import { TransitMap } from '../TransitMap';
import { BookingLayout, Gap } from './BookingLayout';
import { Keyboard } from './Keyboard';
import './PlaceScreen.css';

/** The destination map shows only the stop and the destination, no vans */
const NO_VEHICLES: MapVehicle[] = [];

type Search = { query: string; results: string[]; selected: string | null };

type Props = {
  booking: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onBack: () => void;
  onNext: () => void;
};

/** Figma 1:19091 (목적지찾기), 1:19191 (keyboard), 1:19344 (results), 1:24423 (no results). */
export function PlaceScreen({ booking, update, onBack, onNext }: Props) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState<string | null>(null); // non-null while the keyboard is open
  const [search, setSearch] = useState<Search | null>(null);
  const typing = query !== null;
  const dropoff = booking.dropoff ? placeById(booking.dropoff) : undefined;
  const dropoffName = dropoff?.name[lang] ?? null;

  // Tapping the field opens the keyboard. Prototype: a search term with results is pre-typed.
  const openKeyboard = () => {
    if (!typing) setQuery(dropoffName ?? PLACE_QUERY[lang]);
  };

  // Changing the text un-chooses the destination until a new result is picked
  const edit = (next: string) => {
    setQuery(next);
    if (booking.dropoff) update({ dropoff: null });
  };

  // 찾기 searches what's in the field; it's disabled while the field is empty
  const searchText = (query ?? dropoffName ?? '').trim();
  const runSearch = () => {
    const text = searchText;
    if (!text) return;
    const results = searchPlaces(text).map((p) => p.id);
    setSearch({ query: text, results, selected: results[0] ?? null });
  };

  const choose = () => {
    if (search?.selected) {
      update({ dropoff: search.selected });
      setQuery(null);
    }
    setSearch(null);
  };

  const dropoffText = typing ? query : dropoffName;

  return (
    <BookingLayout
      title={t.placeTitle}
      onBack={typing ? () => setQuery(null) : onBack}
      onNext={onNext}
      nextDisabled={!booking.dropoff}
      overlay={
        search && (
          <ModalOverlay coverBottomBar>
            <ModalCard
              title={search.results.length ? t.resultsTitle : t.noResultsTitle}
              subtitle={t.resultsFor(search.query)}
              onCancel={() => setSearch(null)}
              onConfirm={choose}
              tallButtons
            >
              {search.results.length ? (
                <OptionList
                  options={search.results.map((id) => ({ id, label: placeById(id)!.name[lang] }))}
                  selected={search.selected}
                  onSelect={(selected) => setSearch({ ...search, selected })}
                />
              ) : (
                <div className="no-results">
                  <Asset name="booking/warning" width={120} height={120} />
                  <p className="no-results__message">{t.noResults(search.query)}</p>
                  <p className="no-results__hint">{t.noResultsHint}</p>
                </div>
              )}
            </ModalCard>
          </ModalOverlay>
        )
      }
    >
      <Gap size={91} />
      <div className="place-fields">
        <div className="field place-field">
          <span className="place-field__icon">
            <Asset name="booking/pin-pickup" width={33.6} height={38.4} />
          </span>
          <span className="field__text">{t.pickupName}</span>
        </div>
        <div className="field place-field" onClick={openKeyboard}>
          <span className="place-field__icon">
            <Asset name="booking/pin-dropoff" width={22.4127} height={28.95} />
          </span>
          <span className={`field__text ${dropoffText ? '' : 'is-placeholder'}`}>
            {dropoffText || (typing ? '' : t.dropoffPlaceholder)}
            {typing && <span className="field__caret" aria-hidden />}
          </span>
          <button
            className="field-btn place-field__find"
            disabled={!searchText}
            onClick={(e) => {
              e.stopPropagation();
              runSearch();
            }}
          >
            {t.find}
          </button>
        </div>
      </div>
      <Gap size={91} />
      <div className="place-map">
        <TransitMap
          center={STATION.position}
          resetKey={0}
          controlsInset={{ top: 15, right: 40 }}
          vehicles={NO_VEHICLES}
          destination={dropoff?.position}
        />
      </div>
      {typing && <Keyboard onKey={(key) => edit(typeKey(query, key))} onDelete={() => edit(backspace(query))} />}
    </BookingLayout>
  );
}
