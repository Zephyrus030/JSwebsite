# Task 7 — News and Contact report

## TDD record

- **RED:** Added News filter/load-more and Contact validation/content tests before replacing the two title-only route placeholders. News failed because it had no cards or controls; Contact initially failed to resolve the absent appointment form.
- **RED:** Extended the crop-manifest test with the seven missing News card crops, the remaining Contact card images, and the Contact map. It failed because those semantic media-only entries did not yet exist.
- **GREEN:** Added data-backed News and Contact compositions, local front-end appointment validation, the reusable location map panel, independent WebP crops, and generated assets. Focused verification passes 25/25.

## Delivered

- `News/newsData.js`, `News/NewsPage.jsx`, and `News/NewsPage.module.css`
  - Eight reference projects render in a strict current-count four-column desktop grid and two rows. The card images preserve the source 3:5 proportion.
  - Category filters use `aria-pressed`; `filterProjects` derives the selected data and Load More increases the display limit.
  - A changed item count falls back to `MediaGrid` auto-fit/minmax rather than index-based layout rules.
  - The page ends with contact/address/map content and the shared footer.
- `Contact/contactData.js`, `Contact/ContactPage.jsx`, `Contact/ContactPage.module.css`, `Contact/AppointmentForm.jsx`, and `Contact/AppointmentForm.module.css`
  - “Plan your visit” heading, two reference-aligned location cards, appointment form, map, and footer.
  - Visible labels cover location, full name, phone, email, preferred date/time, project type, notes, and contact consent.
  - Client-only required-field and email validation presents inline errors; valid requests resolve to a local `role="status"` confirmation with no backend or external booking target.
- `Shared/components/LocationMap.jsx` and `.module.css`
  - Reusable address/contact/map panel for News and compact map treatment for Contact.
- `Shared/components/MediaGrid.jsx` and `.module.css`
  - Adds optional metadata and stable test hooks without changing default rendering behavior.
- `scripts/crop-manifest.js`, `scripts/crop-assets.test.js`, and `public/assets/`
  - Added independent WebP crops for all eight News photographs, the second 578 showroom image, both INTERICH Factory images, and the map. The tested bounds exclude screenshot navigation, captions, page whitespace, and gutters.

## Responsive and interaction evidence

- At 1440px, News has four `314.28px` grid columns and eight cards; Contact has two location cards. Neither route overflows horizontally.
- At 390px, News reflows to one `342px` column while retaining all eight cards; Contact retains two cards in its single-column layout. Neither route overflows horizontally.
- Browser interaction check at both widths: empty Contact submit exposed five required inline errors; a valid request then rendered one success status.

## Verification

- `npm run assets` — passed.
- `npm test -- News/NewsPage.test.jsx Contact/ContactPage.test.jsx scripts/crop-assets.test.js` — 3 files, 25 tests passed.
- `npm test` — 11 files, 101 tests passed.
- `npm run build` — passed; 71 modules transformed.
- Diagnostics for all Task 7 files — clean.

## Follow-up considerations

- Source screenshots limit the native resolution of the News and Contact photography. Future source imagery can replace the WebPs through the existing data contracts.
- The mock location phone numbers intentionally match the supplied visual reference; no external booking or contact endpoint was introduced.

## Important review remediation

- **RED:** Added a Contact regression requiring the location grid to use the shared `--content-max` width inside the page gutters. The test failed against the former fixed `72rem` maximum.
- **RED:** Added an accessibility regression that submits the empty form and requires both location radios to reference the stable `location-error` element and expose `aria-invalid="true"`. Both radios initially lacked these attributes.
- **GREEN:** The desktop location grid now uses `min(100% - (var(--page-gutter) * 2), var(--content-max))`, preserving the existing two-equal-column breakpoint and mobile single-column flow.
- **GREEN:** Each location radio now conditionally receives `aria-describedby="location-error"` and `aria-invalid="true"` while the group is invalid. Selecting a location continues to clear that keyed error.
- Fresh focused verification: 3 files, 27/27 tests passed.
- Fresh full verification: 11 files, 103/103 tests passed.
- Fresh production build: passed with 71 modules transformed.
- Diagnostics for the remediation files: clean.
- Browser geometry at 1440px: location grid `1296px`, columns/cards `630px 630px`, no horizontal overflow.
- Browser geometry at 390px: location grid/cards `342px`, single column, no horizontal overflow.
- Browser accessibility check at both widths: both invalid radios report `aria-describedby="location-error"` and `aria-invalid="true"`.
