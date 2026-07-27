# Task 6 — Experience, About, and Not Found report

## TDD record

- **RED:** Added the Experience and unknown-route tests before replacing their title-only route placeholders. The route suite failed because the introduction, showroom zones, material section, address, external CTA, and Home action were absent.
- **RED:** Added expected 578 Experience WebP outputs and source bounds to the crop-manifest test. It failed because those semantic crops did not exist.
- **GREEN:** Implemented the data-backed page composition, branded About/Not Found shells, independent WebP crops, and generated assets. The focused route-and-asset run passes 18/18.

## Delivered

- `Experience/experienceData.js`, `Experience/ExperiencePage.jsx`, and `Experience/ExperiencePage.module.css`
  - Centred showroom hero, introduction split, data-driven three-zone showroom grid, material library, Richmond location/map panel, external 578 CTA, and shared footer.
  - The three-current-item grid uses `MediaGrid` reference columns only at the current count. Other counts retain its `auto-fit/minmax` fallback; no item index or `:nth-child` controls placement.
- `About/AboutPage.jsx` and `About/AboutPage.module.css`
  - Minimal About / Coming soon route, global header/footer, and Home action.
- `NotFound/NotFoundPage.jsx` and `NotFound/NotFoundPage.module.css`
  - Branded unknown-route page with the requested Home action.
- `src/App.jsx`
  - Switched the catch-all route to the Task 6 Not Found module.
- `scripts/crop-manifest.js`, `scripts/crop-assets.test.js`, and `public/assets/`
  - Added independent hero, introduction, three showroom-zone, material, map, and visit crops from `578Experience.png`; no whole screenshot is used as a page background.

## Visual and responsive evidence

- At 1440px: the showroom grid is `390.406px 390.406px 390.406px`; the three cards begin at x=120/525/930 and are 390px wide. No horizontal overflow.
- At 390px: the grid reflows to one 342px column, with all three cards preserved; no horizontal overflow.
- The 578 hero source included baked overlay copy. The crop pipeline removes it with repeatable glyph-scoped retouching, while the actual hero copy is accessible DOM text.

## Verification

- `npm run assets` — passed.
- `npm test -- Experience/ExperiencePage.test.jsx NotFound/NotFoundPage.test.jsx scripts/crop-assets.test.js` — 3 files, 18 tests passed.
- `npm test` — 9 files, 92 tests passed.
- `npm run build` — passed; 63 modules transformed.
- Diagnostics for all Task 6 files — clean.

## Important review remediation — hero retouch

- **RED:** Added a manifest regression requiring more than 30 glyph-scoped patches, a maximum patch width of 32px, and coverage for the two residual subtitle/opening glyph positions. The old three-strip manifest failed because it used 160–440px horizontal fills.
- **RED:** Added an output-level continuity test measuring high-contrast glass/architectural edges and baked-copy brightness. The former strip output retained only 27.5% of the source-region horizontal edge signal and failed the continuity threshold.
- **GREEN:** Added validated `vertical-fill` processing to `crop-assets.mjs`. The Experience hero now uses 39 letter/small-cluster patches, each interpolated vertically from pixels above and below the glyph. No whole title, subtitle, or opening-label strip is copied.
- Regenerated `experience-hero.webp`. Direct asset inspection confirms no baked overlay copy or horizontal blur bands; vertical mullions and the storefront frame remain continuous.
- 1440px browser inspection: hero is 1440×576px below the header, has no horizontal overflow, and the accessible DOM title aligns over a clean, band-free glass area.
- Fresh focused verification: 3 files, 20/20 tests passed.
- Fresh full verification: 9 files, 94/94 tests passed.
- Fresh production build: passed with 63 modules transformed.
- Crop pipeline diagnostics: clean.
