# Task 8 — Route focus, responsive browser checks, and final verification

## TDD record

- **RED:** Added a route-navigation regression to `src/App.test.jsx`. It first failed because navigation left focus on the document body instead of the Contact heading.
- **GREEN:** Added `RouteFocus`, keyed solely by React Router's `pathname`, and marked the one `h1` on every routed page with `data-page-heading` and `tabIndex="-1"`. The focused App test then passed. News filters and Load More state do not change `pathname`, so they cannot trigger the focus effect.

## Delivered

- `src/App.jsx`
  - `RouteFocus()` focuses the current `[data-page-heading]` after a pathname transition.
- Route headings
  - Homepage and all four brand routes (through `Hero`), About, Experience, News, Contact, and branded Not Found each expose exactly one focusable page heading.
- `tests/e2e/site.spec.js`, `playwright.config.js`, and `vite.config.js`
  - Playwright starts Vite on a dedicated local port; Vitest excludes the browser suite while retaining its default node-module exclusion.
  - Browser coverage checks all ten route outcomes at 375/768/1024/1440px, desktop keyboard brand navigation, mobile focus/Escape behavior, News filters, the complete current eight-card reference count, Contact error/success paths, reduced motion, focus visibility, and labelled Contact controls.
- `package.json` / lockfile
  - Added `@playwright/test`; Chromium was installed locally for Playwright.

## Runtime sanity evidence

At 1440px, every reference route had no horizontal overflow and a finite, light-weight page heading:

- Homepage and the four brand pages: `72px` headings, `70.56px` line height, weight 200–300.
- Experience: `72px` heading and line height, weight 300.
- News: `57.6px` / `59.904px`, weight 300.
- Contact: `56px` / `58.8px`, weight 300.

No reference composition, crop, grid count, or approved desktop layout was changed. News continues to render its full current eight-item reference grid, so its Load More control remains correctly absent until a larger data set is supplied; the existing component/unit behavior still covers the increment path.

## Visual reference review

Neutral-state full-page captures were generated at 1440px for the eight routes with supplied references and assembled side-by-side under the ignored local `.visual-review/` directory. The reference files are Homepage `1024×1536`, the four brand/Experience/News references `864×1821`, and Contact `759×2071`; comparisons therefore evaluated composition, hierarchy, crop, typography, ratios, and relative spacing rather than equal pixel height. The route-focused heading was blurred only for neutral screenshot comparison; RouteFocus and focus-visible behavior remained enabled and separately tested.

Responsive full-page captures at 375, 768, and 1024px were then reviewed as route contact sheets. All retained the reference section order and hierarchy without overlap or horizontal scrolling. Heading sizes progress consistently from mobile/tablet to desktop: shared hero headings `48px → 48px → 55.296px → 72px`, Experience `44px → 44px → 55.296px → 72px`, News `35.2px → 35.2px → 40.96px → 57.6px`, and Contact `37.6px → 37.6px → 40.96px → 56px`.

### Per-route results

- **Homepage — PASS with observation.** Hero, About split, four-brand sequence, 578 feature, News strip, and footer match the reference order and light geometric hierarchy. At 1440px the heading is `72px/70.56px`, weight `300`; the page is `3071px` tall with no overflow. At 375px the editorial splits and four brand cards stack in reading order. **Observation:** the approved implementation uses more vertical breathing room and the shared dark full footer instead of the reference's compact light footer; no Task 8 regression or isolated correction was identified.
- **S Project — PASS.** Split hero, statement, three portrait collection cards, full-width residential image, CTA, and footer retain the reference composition. At 1440px the collection grid is `1296px` wide with three `413.33px` columns; at 768/1024 it remains three columns (`219.72px`/`293.55px`), and at 375 it becomes one `327px` column. Heading is `72px/70.56px`, weight `300`.
- **INTERICH — PASS.** Full kitchen hero, centred introduction, text/media feature, three square collection cards, manufacturing split, and CTA follow the reference. At 1440px the grid is `1296px` with three `413.33px` columns; it is three `219.72px` columns at 768 and one `327px` column at 375. Wordmark heading is `72px/70.56px`, weight `200`.
- **IOAK — PASS.** Split hero, statement, three square collections, equal-height material pair, factory banner, and CTA preserve the approved composition. At 1440px the collection grid is three `413.33px` columns and the equal pair is two `331.56px` columns in a `691px` block. At 375 both structures stack to `327px`; heading is `72px/70.56px`, weight `300`.
- **FLUX — PASS.** Product-split hero, three portrait collection cards, four equal swatches, left-large/right-stacked triptych, and CTA match the reference sequence and proportions. At 1440px the collection columns are `413.33px`, swatches are four `303px` columns, and the triptych uses `446.83px/251.34px`; all become one `327px` column at 375. Heading is `72px/70.56px`, weight `300`.
- **578 Experience — PASS.** Storefront hero, introduction split, three showroom zones, materials strip, visit/map panel, external CTA, and footer retain the reference hierarchy. At 1440px the zone grid is `1200px` with three `390.41px` columns; at 768/1024 it remains three columns (`224.53px`/`300.38px`) and at 375 it stacks to `327px`. Heading is `72px/72px`, weight `300`.
- **News — PASS with observation.** Centred introduction, filter row, current eight-card two-row grid, locations/map, and footer correspond to the reference. At 1440px the grid is `1296px` with four `314.28px` columns; at 768/1024 it remains four columns (`167.41px`/`223.49px`) and at 375 becomes one `327px` column. Heading is `57.6px/59.904px`, weight `300`. **Observation:** the reference shows a Load More affordance beneath eight visible cards, while the supplied local data set contains exactly eight total items; preserving the complete approved current-count layout correctly leaves no additional items to reveal. The explicit four-to-eight interaction remains unit tested.
- **Contact — PASS.** Centred introduction, two equal location cards, appointment form, map, and footer preserve the reference order and proportions. At 1440px the location block is `1296px` with two `630px` cards; at 390/375 it is a single `342px`/`327px` column. Heading is `56px/58.8px`, weight `300`; the controls remain visibly labelled across all widths.
- **About / Not Found — PASS consistency check.** Both use the same shell, centred intentional empty-state treatment, Home action, and shared footer. They have identical responsive geometry, no overflow, `40px` headings at 375/768, `40.96px` at 1024, and `56px` at 1440.

### Visual remediation result

No clear regression was found that could be corrected without changing previously approved page composition. No visual production CSS or page-layout code was changed during this review.

## Verification

- `npm test -- src/App.test.jsx` — 2/2 passed after the RED/GREEN cycle.
- `npm test` — 11 files, 104 tests passed.
- `npm run build` — passed; 71 modules transformed.
- `npm run test:e2e` — 10/10 passed.
- Diagnostics for all Task 8 files — clean.
- Post-verification cleanup — `Website/test-results/` removed; `Website/.gitignore` now ignores `/test-results/`, `/playwright-report/`, and `/.visual-review/`.

## Follow-up considerations

- The generated comparison captures are intentionally local and ignored by Git. They can be regenerated with the temporary visual-review scripts if future content or styling changes require another manual comparison.
