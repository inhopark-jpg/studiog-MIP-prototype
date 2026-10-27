# MIP 모빌리티 키오스크 — Web Prototype

Portrait kiosk prototype (design canvas 1080 × 1920) built from the Figma frame
`메인화면_교통수단 3개 A` (node `1:21714`). No backend. `src/data/mock.ts` generates a new random snapshot on every page load:
1 sample DRT ride (plus any bookings made on the kiosk) and 3–5 buses (routes, ETAs,
boarding numbers, low-floor, crowding). Both columns are always sized for a full page of
three rows. Every
row in the tables is also a vehicle on the map, so the two always match. `src/components/placeVehicles.ts` puts each vehicle on a real road
from the visible OSM data (buses on main roads, DRT also on minor streets). Sooner
arrivals sit closer to the stop, each van faces along its road toward the stop, and no
label overlaps the 현위치 pin, the map controls or another vehicle. The volume and
language settings are cached in `sessionStorage` only. Bookings (below) are kept in memory
only, so a refresh clears them. No real ride is requested. Any action whose screen hasn't been designed yet
(확대, 낮은화면, 기호) shows "지원되지 않습니다".

## Languages

The language button opens the language modal (Figma `1:21231`). It lists Korean and
English only; the design's 日本語/中文 are left out. Option lists that fit without scrolling
shrink to their rows and drop the scroll bar. All UI copy,
lives in `src/i18n.tsx`. The English landing page follows Figma `10:666`. That frame's
text is used as given, except the language button, which shows the current language
("English") instead of the frame's "KOR". A few English-only sizes are in
`src/styles/global.css` (`:root:lang(en)`). On the banner, the English text covers the
Korean text baked into the image. Other screens have no English designs, so their English
is our own.
Map place names switch to OSM `name:en`. 90 seconds of inactivity resets the language to Korean.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## DRT booking flow (예약하기)

1. **Phone verification** (Figma `1:18761`, country popup `1:20678`). The number starts empty
   and is shown as 010-****-1234 while typing (fixed 3-4-4 grouping, so deleting never
   reveals the masked digits). 인증요청 "sends" an SMS, and a random 6-digit code fills in after 0.7s.
   A 1-minute countdown appears beside 연장, which restarts it. When the timer reaches 00:00,
   the code is cleared and 인증요청 must be pressed again. 다음 stays disabled until a valid
   code is filled. Editing the number clears the code.
2. **Destination** (`1:19091`). The pickup is always this stop. Tapping the destination field
   opens the keyboard (`1:19191`) with "오송" (English UI: "Osong") already typed in.
   영어/한글 switches between the Hangul layout and a QWERTY layout built from the same keys.
   The keyboard starts in the UI language. 찾기 searches the Korean and English names in
   `PLACES` (`src/booking/data.ts`) and shows results (`1:19344`) or no results (`1:24423`),
   with names in the UI language. Choosing a result fills the field and enables 다음. It
   also pops the 도착 marker (from `1:20371`) onto the map, above 현위치, and the map zooms to
   show both stops. This map shows only the stop and the destination, no vehicles. 오송역 isn't
   offered as a destination because it's next to this stop. Editing the text again clears the choice, so 다음 is disabled until a result is
   picked. Place positions come from OpenStreetMap. 오송호수공원, 한국보건산업진흥원 and
   오송첨단의료산업진흥재단 have no OSM entry of their own and sit at their complex.
3. **Passengers** (`1:19513`). Adult, youth and child counts start at 0, with up to 9 in total.
   다음 stays disabled while the total is 0.
4. **Pickup time** (`1:19625`). Twelve 30-minute windows over two pages, starting at the next
   half hour that is at least 10 minutes away. 다음 stays disabled until one is selected, then
   opens the 예약 정보 확인 popup (`1:20299`). 예약 시간 is the time the popup opened.
5. **Reservation** (`1:19996`). 확인 creates the booking with a random 3-digit boarding number
   and keeps it in memory until the page is refreshed. The page returns to the first
   screen after 20 seconds, counting down on the button. 예약 취소 opens the popup
   (`1:20157`), which pauses the countdown. Confirming there deletes the booking and returns
   to the first screen.

Each upcoming booking also appears on 첫화면 as a DRT row with its own route, its boarding
number, and an ETA counted to the start of its pickup window. It also gets a van on the map,
placed clear of the vans already there (`src/data/arrivals.ts`). It disappears once the
window ends or the booking is cancelled. After booking, 첫화면 opens on the page holding the
new row. After a short pause, the row slides open and is briefly highlighted, and its van
pops onto the map at the same time.

## Reservation lookup (예약조회)

예약조회 uses the same phone verification screen. It then shows the reservation page for the
latest upcoming booking made with that exact country code and number. Any number of
bookings can exist, each linked to its own number. They're kept in memory, so they
disappear when the page is refreshed or the tab is closed. A number with no booking shows the 예약 정보가
존재하지 않습니다 page (`1:20092`), which returns to 첫화면 after 20 seconds. Its DRT 예약하기
button continues to the destination step with the number that was just verified.

## 관광 정보 tab

The 관광 정보 tab (Figma `1:22564`) lists the tourist spots in `src/data/tourism.ts`, 8 per
page, with the images from `src/assets/tourist-spots/`. The design's 청주시 QR banner is left
out, and the title reads "관광 명소". Tapping a spot opens its popup (`1:22710`), where ‹ ›
step through the spots. DRT 예약하기 starts the booking flow with that spot already set as
the destination, and its 도착 marker on the destination map.

The four spots (광화문, 북촌한옥마을, 서울숲, 코엑스) keep their real names, categories and
descriptions, but pretend to be in 오송. Their addresses and map positions are made up,
around the stop. They're also searchable destinations.

## 고대비 (high-contrast) mode

The 고대비 button in the bottom bar switches the whole kiosk to the dark colors from Figma
section `1:16286`, and the button gets a white outline. Only colors change: every element
keeps exactly the same position, size and shape in both modes. The setting survives a
refresh (`sessionStorage`) and turns off after 90 seconds idle.

- Colors live in `src/styles/contrast.css`, keyed off `<html data-contrast="high">`. It
  contains color rules only: no margins, padding, border widths, radii or sizes.
- `<Asset>` uses `src/assets/contrast/<name>` instead of `<name>` when a dark export exists.
  Each dark export has the same dimensions as its light one. Two had to be adjusted to
  match: the booking-page end dot was re-cropped from 28×41 to 28×28, and the route line
  went from 6px to 4px. The 38px page arrows, the locate button and the tour popup arrow
  have no dark export, so they're the light exports inverted with CSS.
- The 관광 정보 tab and the 예약 취소 popup have no dark design, so they use the same palette.

## Layout / responsiveness

The mouse pointer is a translucent fingertip circle that shrinks while pressed, to preview
touch use. Pressing and dragging scrolls any scrollable list with the mouse and keeps
gliding after release, like a phone (`src/hooks/useDragScroll.ts`). A drag that starts on a
button doesn't press it. Touch screens scroll natively.

`KioskStage` renders a 1080px-wide canvas scaled to the viewport width. The canvas height
follows the screen's aspect ratio, and the map absorbs the difference, so taller or shorter
portrait screens keep the same proportions. Landscape screens are letterboxed.

## Map

MapLibre GL + [OpenFreeMap](https://openfreemap.org) `positron` style (OpenStreetMap data,
no API key). Labels are switched to Korean (`name:ko`) and enlarged for kiosk viewing.
Change `STYLE_URL` in `src/components/TransitMap.tsx` to try `liberty` or `bright`.

## Assets

Every image or icon is rendered through `<Asset name="…">`, which loads
`src/assets/<name>.<ext>` (`.svg`, `.png`, `.jpg`, `.webp`) automatically, or a striped
placeholder if the file doesn't exist yet. No code changes are needed to add one.

Exported from Figma as-is (no redrawing): `banner/app-download`, `icons/*` (tab-select,
globe, arrow-prev/next, dot-on/off, calendar, search, home, home-active, magnify, contrast,
low-screen, volume, drt-logo, check, scroll-up/down) and `map/*` control icons
(zoom-in-horizontal/vertical, zoom-out, locate). `icons/drt-logo` and `icons/home-active`
come from the language-modal frame (`1:21043`).

`booking/*` comes from the booking frames. Where two frames export slightly different
versions of the same icon, each one is kept: `summary-pin-pickup` (`1:19513`) vs
`pin-pickup` (`1:19091`), and `confirm-dot-*`/`confirm-line` (popup `1:20299`) vs
`route-dot-*`/`route-line` (page `1:19996`).

Map markers come from section `2003:776`: `map/current-location` (current-stop-marker,
`2003:687`), `map/drt-vehicle` (`2003:679`) and `map/bus-vehicle` (`2003:682`), plus
`map/bus-green-vehicle` (`2005:958`) for green routes. The 현위치
marker always stacks above vehicle markers and their labels. Each vehicle's label is a
separate marker, so every label stacks above every van.

Edits to exported files:
- `map/current-location.svg`: removed the Figma section's background and border that the
  export included. The marker paths are unchanged.
- `map/zoom-*.svg`: stroke thickened from 1px to 3px on request.
