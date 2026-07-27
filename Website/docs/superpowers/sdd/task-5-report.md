# Task 5 — Brand pages report

## TDD record

- **RED:** Added `Brands/BrandPages.test.jsx` before the renderer. `npm test -- Brands/BrandPages.test.jsx` failed 6/6 because the four routes were title-only placeholders and did not expose collections, manufacturing/material features, a footer, CTA, or FLUX finishes.
- **RED:** Extended `scripts/crop-assets.test.js` with the semantic brand outputs. The crop-manifest test failed because those outputs were absent.
- **GREEN:** Implemented the shared renderer, brand data, page modules, crop manifest entries, and generated WebP files. `npm test -- Brands/BrandPages.test.jsx scripts/crop-assets.test.js` passed 17/17.

## Files

- Shared renderer and layout: `Shared/components/BrandPage.jsx`, `Shared/components/BrandPage.module.css`
- Page data and route wrappers: `Brands/S_Project/`, `Brands/INTERICH/`, `Brands/IOAK/`, `Brands/FLUX/`
- Route/content tests: `Brands/BrandPages.test.jsx`
- Repeatable crop definition and test: `scripts/crop-manifest.js`, `scripts/crop-assets.test.js`
- Generated assets: `public/assets/*.webp`

## Page composition

| Page | Sections in rendered order |
| --- | --- |
| S Project | Residential hero; collaboration statement; Custom Homes / Design & Build / Melbourne Projects; selected residential-work feature; external CTA |
| INTERICH | Cabinetry hero; centred statement; designed-for-living feature; Kitchens / Wardrobes / Whole-home Cabinetry; Melbourne manufacturing feature; external CTA |
| IOAK | Flooring hero; material statement; Natural Oak / Engineered Timber / Signature Finishes; material-detail feature; Melbourne factory feature; external CTA |
| FLUX | Tapware hero; product statement; Basin / Bath & Shower / Kitchen; four finish swatches; ritual feature; external CTA |

All section order comes from each brand data module. Feature placement uses its `variant`, and image sizing comes from declared `ratio`; no layout depends on an item or child index.

## Crop manifest additions

| Source | WebP outputs |
| --- | --- |
| `S_Project.png` | `s-project-custom-homes`, `s-project-design-build`, `s-project-melbourne-projects`, `s-project-residential-work` |
| `INTERICH.png` | `interich-kitchens`, `interich-wardrobes`, `interich-whole-home`, `interich-manufacturing` |
| `IOAK.png` | `ioak-natural-oak`, `ioak-engineered-timber`, `ioak-signature-finishes`, `ioak-material-detail`, `ioak-factory` |
| `FLUX.png` | `flux-basin`, `flux-bath-shower`, `flux-kitchen`, `flux-ritual` |

All outputs are generated as WebP through `npm run assets`. The IOAK and INTERICH bounds were tightened after visual inspection to remove caption/CTA regions; crop content is photographic or material detail only.

## Verification

- `npm run assets` — passed
- `npm test` — passed: 7 files, 56 tests
- `npm run build` — passed: Vite production build
- Brand-page and crop-manifest linter diagnostics — clean

## Follow-up considerations

- Source screenshots constrain crop resolution; later original photography can replace assets without changing data contracts.
- The INTERICH manufacturing crop now uses the widest clean 16:9 factory region available; original photography would still improve resolution on large displays.
- Experience, News, and Contact were intentionally not changed.

## Review remediation

### RED / GREEN

- **RED:** Added composition, DOM-order, and ARIA regression cases. The focused brand run failed 9/15: feature sections had no explicit `data-variant`, INTERICH/IOAK/FLUX used the wrong composition, media-first order was absent, and every section `aria-labelledby` referenced a missing ID.
- **RED:** Added reviewed crop-bound and ratio checks. The asset run failed because Task 5 crop dimensions did not match their declared ratios and several bounds still included white space or multiple screenshot cells.
- **GREEN:** Added explicit `text-left-media-right`, `media-left-text-right`, and `full-width-media` variants. `BrandPage` now renders media-first DOM order only when declared, assigns every section heading a real ID, and exposes the selected variant for regression coverage.
- **GREEN:** Updated brand data ratios and regenerated every Task 5 WebP. Final focused Task 5 and asset tests passed 32/32.

### Corrected compositions

- INTERICH “Crafted for modern living.”: text left, media right.
- IOAK “The beauty is in the detail.”: text left, single material image right.
- FLUX ritual feature: text left, single square product image right.
- S Project selected residence: explanation followed by full-width panoramic residential image.
- INTERICH manufacturing and IOAK factory: media-left/text-right with media-first DOM order.

### Reviewed crop coordinates

Coordinates use `[left, top, width, height]` pixels from the unchanged source screenshots.

| Output | Coordinates | Ratio |
| --- | --- | --- |
| `s-project-custom-homes.webp` | `[70, 845, 224, 168]` | landscape 4:3 |
| `s-project-design-build.webp` | `[320, 845, 228, 171]` | landscape 4:3 |
| `s-project-melbourne-projects.webp` | `[575, 845, 212, 159]` | landscape 4:3 |
| `s-project-residential-work.webp` | `[70, 1275, 720, 260]` | panorama 36:13 |
| `interich-kitchens.webp` | `[55, 1058, 220, 165]` | landscape 4:3 |
| `interich-wardrobes.webp` | `[320, 1058, 220, 165]` | landscape 4:3 |
| `interich-whole-home.webp` | `[575, 1058, 220, 165]` | landscape 4:3 |
| `interich-manufacturing.webp` | `[350, 1350, 480, 270]` | wide 16:9 |
| `ioak-natural-oak.webp` | `[65, 780, 224, 126]` | wide 16:9 |
| `ioak-engineered-timber.webp` | `[320, 780, 224, 126]` | wide 16:9 |
| `ioak-signature-finishes.webp` | `[575, 780, 224, 126]` | wide 16:9 |
| `ioak-material-detail.webp` | `[535, 1080, 244, 183]` | landscape 4:3 |
| `ioak-factory.webp` | `[380, 1340, 384, 216]` | wide 16:9 |
| `flux-basin.webp` | `[62, 690, 186, 248]` | portrait 3:4 |
| `flux-bath-shower.webp` | `[320, 690, 186, 248]` | portrait 3:4 |
| `flux-kitchen.webp` | `[575, 690, 186, 248]` | portrait 3:4 |
| `flux-ritual.webp` | `[250, 1320, 290, 290]` | square 1:1 |

All 17 corrected assets were visually inspected after regeneration. They contain photography/material only, without screenshot captions, page whitespace, or gutters between source grid cells. The broader INTERICH manufacturing crop now uses the full available 16:9 factory scene without the former left white strip.

### Final verification

- `npm run assets` — passed.
- `npm test -- Brands/BrandPages.test.jsx scripts/crop-assets.test.js` — 2 files, 32 tests passed.
- `npm test` — 7 files, 56 tests passed.
- `npm run build` — passed with 59 modules transformed.
- Edited-file diagnostics — no lint errors.

## Binding reference-layout update

### Scope and external links

- The Website project continues to implement only the four supplied brand reference pages at `/brands/s-project`, `/brands/interich`, `/brands/ioak`, and `/brands/flux`.
- Each page keeps exactly one absolute HTTPS `Visit … website` link with `target="_blank"` and `rel="noreferrer"`.
- No internal route, component, folder, or simulated page was added for `sproject.com.au`, `interich.com.au`, `ioak.com.au`, or `flux.com.au`. A source/route scan found no matching target-site route.
- Existing Experience, News, Contact, About, and Homepage files were not expanded as part of this update.

### TDD record

- **RED:** Added wordmark, reference-grid, compact-footer, key DOM-order, and dynamic fallback tests. The focused run failed 11/38 because brand heroes shared the ordinary heading treatment, collections used only auto-fit, FLUX swatches had no four-column reference mode, INTERICH manufacturing used the opposite reference order, and `MediaGrid` had no count-aware layout contract.
- **GREEN:** Added data-driven hero wordmarks and layout metadata, count-aware `MediaGrid`, equal reference swatches, per-feature proportions, and light compact brand footers. The focused brand/layout run passed 42/42.
- External CTA regression cases passed without production changes, confirming that the original links were already external-only.

### Per-page reference parameters

| Page | Hero | Typography | Statement | Collections | Features |
| --- | --- | --- | --- | --- | --- |
| S Project | split; `clamp(31rem, 54vw, 43rem)`; serif `S` plus tracked `PROJECT` | body `0.90rem`; heading `1.55–2rem`; lead `1.5–2.05rem` | max `66rem`; columns `1.08fr / 0.92fr` | reference count/columns `3/3`; landscape 4:3 | full-width `36:13` residence; max `74rem` |
| INTERICH | full-bleed centred inverse wordmark; `clamp(29rem, 52vw, 42rem)`; `0.34em` tracking | body `0.84rem`; heading `1.45–1.85rem`; lead `1.35–1.75rem` | centred; max `54rem` | reference count/columns `3/3`; landscape 4:3 | Crafted `0.60fr / 1.40fr`; manufacturing `0.68fr / 1.32fr`, both text-left/media-right |
| IOAK | full-bleed left wordmark; `clamp(29rem, 50vw, 40rem)`; `0.18em` tracking | body `0.82rem`; heading `1.4–1.75rem`; lead `1.4–1.85rem` | max `56rem`; columns `1.10fr / 0.90fr` | reference count/columns `3/3`; wide 16:9 | material `0.62fr / 1.38fr`; factory `0.65fr / 1.35fr`, text-left/media-right |
| FLUX | full-bleed left wordmark; `clamp(28rem, 49vw, 39rem)`; `0.24em` tracking | body `0.82rem`; heading `1.4–1.75rem`; lead `1.4–1.85rem` | max `60rem`; columns `1.08fr / 0.92fr` | reference count/columns `3/3`; portrait 3:4 | four equal finish columns; ritual `0.55fr / 1.45fr`, text-left/media-right |

At desktop widths, `items.length === referenceCount` activates the declared column count and optional item span. Any count mismatch switches the same renderer to `auto-fit/minmax` fallback. Mobile keeps natural single-column feature, collection, and swatch flow. No layout rule uses `:nth-child` or another child index.

### Final verification after binding update

- `npm run assets` — passed.
- `npm test -- Brands/BrandPages.test.jsx Shared/test/MediaGrid.test.jsx scripts/crop-assets.test.js` — 3 files, 55 tests passed.
- `npm test` — 7 files, 74 tests passed.
- `npm run build` — passed; 59 modules transformed.
- Edited-file diagnostics — no lint errors.

## Runtime review remediation

This section supersedes earlier ratio and hero notes where they differ.

### RED / GREEN

- **RED:** Added headline hierarchy, centred INTERICH intro, independent wordmark construction, reference card ratio, media mosaic, distinct hero asset, FLUX split hero, IOAK banner, and external-only CTA regressions. Brand tests failed 15/47 for the expected missing behavior.
- **RED:** Added four semantic outputs and revised pure-media bounds. Asset tests failed 3/13 because the manifest lacked the new crops and retained old landscape/wide card ratios.
- **GREEN:** Implemented all declared structures and ratios. A first visual crop pass found baked “Custom Cabinetry” in the INTERICH hero and a few white edge pixels on square cards; reviewed-bound tests were moved to tighter rectangles, observed failing, then regenerated clean.

### Corrected page details

- S Project: the hero phrase uses `clamp(2.125rem, 3.5vw, 3rem)`, weight 300, line-height 1.08; the three reference cards are portrait 3:4.
- INTERICH: the hero now uses `interich-hero-wide.webp`, a clean crop from the top reference scene rather than the Crafted asset. “Designed. Manufactured. Installed.” is a centred `h2` directly below the hero with its explanatory copy. Reference cards are square.
- IOAK: the hero phrase uses the same 34–48px responsive hierarchy; reference cards are square. The material feature declares `ioak-pair` with `sample` and `floor` areas. The factory is a `21:10` banner.
- FLUX: the hero uses `product-split`, preserving the left canvas and placing the tapware crop on the right. “Form in motion.” is a 34–48px responsive headline. The ritual feature declares `flux-triptych` with `primary`, `detail`, and `room` areas.
- INTERICH uses a condensed type construction; IOAK uses individually constructed geometric glyph spans with Century Gothic/Futura fallbacks; FLUX uses separately constructed expanded glyph spans with Trebuchet/rounded fallbacks. Each remains one accessible `h1`.

### New and revised crop coordinates

| Output | Coordinates | Ratio |
| --- | --- | --- |
| `s-project-custom-homes.webp` | `[92, 820, 180, 240]` | portrait 3:4 |
| `s-project-design-build.webp` | `[345, 820, 180, 240]` | portrait 3:4 |
| `s-project-melbourne-projects.webp` | `[592, 820, 180, 240]` | portrait 3:4 |
| `interich-hero-wide.webp` | `[183, 330, 499, 180]` | panorama 36:13 |
| `interich-kitchens.webp` | `[58, 1058, 214, 214]` | square |
| `interich-wardrobes.webp` | `[323, 1058, 214, 214]` | square |
| `interich-whole-home.webp` | `[578, 1058, 214, 214]` | square |
| `ioak-natural-oak.webp` | `[72, 700, 212, 212]` | square |
| `ioak-engineered-timber.webp` | `[326, 700, 212, 212]` | square |
| `ioak-signature-finishes.webp` | `[581, 700, 212, 212]` | square |
| `ioak-material-samples.webp` | `[320, 1080, 200, 200]` | square |
| `ioak-factory.webp` | `[320, 1340, 454, 216]` | banner 21:10 |
| `flux-ritual-detail.webp` | `[565, 1320, 208, 117]` | wide 16:9 |
| `flux-ritual-room.webp` | `[565, 1470, 224, 126]` | wide 16:9 |

All revised crops were visually inspected as generated WebP files and contain photography only, with no screenshot captions, baked page text, cell gutters, or page-white edges.

### 1440px computed geometry

The running Vite page was inspected headlessly with installed Microsoft Edge at a 1440×1000 viewport:

- Core S Project, IOAK, and FLUX hero headlines computed to `48px / 51.84px`.
- S Project cards computed to `413×551` (3:4); INTERICH and IOAK cards to `413×413`.
- All current collection grids computed as exactly three columns (`413.328 / 413.328 / 413.344px`).
- FLUX hero computed as a 36%/64% split (`374px` content measure and `922px` media area within the content width).
- IOAK factory computed to `730×348`, approximately 2.1:1.
- IOAK mosaic exposed `"sample floor"`; FLUX exposed `"primary detail" / "primary room"`.

### Final verification after runtime remediation

- `npm run assets` — passed.
- Focused brand/layout/asset tests — 3 files, 66 tests passed.
- Full `npm test` — 7 files, 85 tests passed.
- `npm run build` — passed; 59 modules transformed.
- Edited-file diagnostics — no lint errors.

## Final three-blocker remediation

This section supersedes the earlier INTERICH hero, IOAK material mosaic, and IOAK/FLUX wordmark notes.

### TDD RED / GREEN

- **RED (brand UI):** Added inline-path wordmark and equal-height mosaic contracts. The focused brand run failed 2/49 because IOAK/FLUX still rendered text glyph spans and the mosaic exposed neither reference/equal-height classes nor geometry metadata.
- **RED (asset pipeline):** Added full-scene crop, retouch configuration, output-size, and bright-pixel regressions. The asset run failed 3/15 because `interich-hero-wide.webp` was still the shallow `[183, 330, 499, 180]` strip with no repeatable retouch.
- **RED (mobile geometry):** A 390px runtime check found the higher-specificity IOAK reference rule still produced two `163px` columns. The new mobile stack regression then failed 1/49 before the responsive selector was corrected.
- **GREEN:** IOAK/FLUX now render separate inline SVG path sets; IOAK reference media uses a shared 4:3 cell ratio with `object-fit: cover`; a count mismatch uses the existing `auto-fit/minmax` fallback; and the mobile reference mosaic resolves to one column.

### INTERICH full hero and repeatable retouch

- Source crop: `INTERICH.png`, `[0, 65, 864, 445]`, ratio key `hero-wide` (`864:445`).
- Wordmark patch: source-relative `[240, 65, 385, 70]` composited at `[240, 135]`.
- Subtitle patch: source-relative `[325, 275, 215, 40]` composited at `[325, 225]`.
- `crop-assets.mjs` validates that all source and target patch rectangles remain within the crop before Sharp compositing.
- The regenerated WebP was inspected directly and in the 1440px page. It retains the full glazing, cabinetry, island, stools, and room depth; the screenshot's baked `INTERICH` and `Custom Cabinetry` bands are absent. The accessible brand wordmark remains a DOM overlay.
- Screenshot limitation: the text-obscured source pixels do not exist. The repeatable reconstruction uses nearby clean timber/stone texture, so it is a restoration rather than recovery of the original photograph. At 1440px no obvious repeated letter shapes, architectural displacement, or patch seams were observed.

### 1440px and mobile runtime geometry

- At `1440×1000`, the two IOAK material figures both measured `248.671875px` high and both images computed `object-fit: cover`.
- At `390×844`, the same mosaic computed one `342px` column; the second figure begins below the first and both share left position `24px`.
- IOAK uses viewBox `0 0 190 50` with four geometric paths; FLUX uses viewBox `0 0 230 50` with four different paths.
- Each IOAK/FLUX page contains exactly one `h1`, its accessible name is the brand name, and the visual SVG is `aria-hidden="true"`. Wordmark construction no longer contains `scaleX`; the SVG paths, not `font-family`, define the visible glyphs.

### Final raw verification summary

- `npm run assets` — passed.
- `npm test -- Brands/BrandPages.test.jsx Shared/test/MediaGrid.test.jsx scripts/crop-assets.test.js` — 3 files passed, 70 tests passed.
- `npm test` — 7 files passed, 89 tests passed.
- `npm run build` — passed; 59 modules transformed.
- Edited-file diagnostics — no lint errors.
- Temporary `.review-*.png` files and the interrupted `.retouch-test-HspAPQ` output/directory were removed after visual inspection. The older unrelated `.crop-test-f8Ek5S` artifact was not changed.

## Final INTERICH retouch continuity remediation

This section supersedes the two broad retouch rectangles documented above.

### TDD and visual iteration

- **RED:** The structure regression measured a longest dark horizontal run of `357px` in the old retouched title zone, proving that a full pendant/horizontal member had been duplicated. The new manifest-contract test also failed because the pipeline still used two broad vertical-source patches.
- **GREEN:** Added same-row `horizontal-fill` retouching with validated bounds and per-patch edge feathering. The final manifest uses ten narrowly scoped fills: eight title glyph boxes, one divider line, and one subtitle box. No source rectangle is copied vertically.
- Intermediate threshold masks and broad horizontal bands passed pixel tests but were rejected during direct image inspection because they left glyph outlines or visible smooth rectangles. They were not retained.

### Final retouch coordinates

- `I`: `[244, 156, 10, 39]`
- `N`: `[271, 156, 41, 39]`
- `T`: `[327, 156, 39, 39]`
- `E`: `[380, 156, 39, 39]`
- `R`: `[439, 156, 39, 39]`
- second `I`: `[496, 156, 8, 39]`
- `C`: `[521, 156, 39, 39]`
- `H`: `[576, 156, 39, 39]`
- divider line: `[405, 216, 40, 9]`
- `Custom Cabinetry`: `[360, 241, 130, 18]`

Each fill samples clean pixels immediately to its left and right at the same y-coordinate (`sampleGap: 2`). Title/divider edges use a 2px feather; the smaller subtitle uses 3px. This preserves the original single pendant structure and the cabinet/backsplash horizontal alignment without inserting a large rectangular patch.

### Final visual and automated evidence

- The generated `interich-hero-wide.webp` was inspected directly: one original pendant structure remains; no baked wordmark, subtitle, divider, broad rectangular edge, or duplicated horizontal member remains.
- The running `/brands/interich` page was inspected at `1440×1000`: hero media measured `1440×741.65625`, uses the independent WebP, and retains one accessible `h1` named `INTERICH`.
- Bright-text reduction remains below 15% of the original text-band bright-pixel count.
- Structural continuity regression requires the longest dark horizontal run in the repaired title zone to remain below `90px`.
- `npm run assets` — passed.
- Focused Task 5 tests — 3 files passed, 70 tests passed.
- Full `npm test` — 7 files passed, 89 tests passed.
- `npm run build` — passed; 59 modules transformed.
- Edited-file diagnostics — no lint errors.

### Remaining source limitation

The screenshot does not contain the cabinet/stone pixels hidden by its baked lettering. The glyph-level same-row interpolation reconstructs only those small occluded areas; close pixel-level inspection can still reveal slight texture softening, but the 1440px composition no longer shows duplicate architecture, broad patch boundaries, or residual white text/lines.
