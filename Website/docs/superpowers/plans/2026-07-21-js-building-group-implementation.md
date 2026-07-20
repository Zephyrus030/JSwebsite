# JS Building Group Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved responsive JS Building Group website with eight designed pages, one About placeholder route, dynamic image grids, accessible navigation, restrained motion, news filtering, and appointment validation.

**Architecture:** `Website/` is a standalone Vite + React application. Named page folders export route components, `Shared/` owns reusable editorial components and tokens, and `src/` owns app bootstrapping. Page data and image-ratio metadata drive reusable layouts so card counts can change without markup changes.

**Tech Stack:** Vite, React, React Router, CSS Modules, Vitest, Testing Library, Playwright, Sharp.

## Global Constraints

- Every application file and generated asset must remain under `Website/`.
- Use Manrope with `"Helvetica Neue"`, Arial, sans-serif fallbacks.
- Use `#F7F6F2`, `#FFFFFF`, `#181817`, `#55534F`, `#85817A`, and `#D8D4CC` design tokens.
- Cards and buttons use square corners, fine borders, and no decorative shadows.
- Dynamic grids must support 2, 3, 5, and 8 items without fixed child-position rules.
- Navigation and controls must support keyboard use and visible focus.
- Respect `prefers-reduced-motion`.
- Validate at 375px, 768px, 1024px, and 1440px.
- Preserve `DesignDrawing/*.png`; generated crops go to `Website/public/assets/`.
- Do not initialize Git or create commits unless the user separately requests it.

## File Structure

```text
Website/
├── index.html                         # Vite entry document and font preload
├── package.json                       # scripts and dependencies
├── vite.config.js                     # React and Vitest configuration
├── playwright.config.js               # browser verification configuration
├── src/
│   ├── main.jsx                       # React root
│   ├── App.jsx                        # router and route focus behavior
│   └── test/setup.js                  # DOM matchers and cleanup
├── Shared/
│   ├── styles/tokens.css              # color, type, spacing, motion tokens
│   ├── styles/global.css              # reset and global primitives
│   ├── components/SiteHeader.jsx      # desktop/mobile navigation
│   ├── components/SiteHeader.module.css
│   ├── components/SiteFooter.jsx      # shared footer
│   ├── components/SiteFooter.module.css
│   ├── components/Hero.jsx            # configurable hero
│   ├── components/Hero.module.css
│   ├── components/MediaGrid.jsx       # ratio-aware dynamic grid
│   ├── components/MediaGrid.module.css
│   ├── components/Editorial.jsx       # SectionIntro, SplitFeature, CTA
│   ├── components/Editorial.module.css
│   ├── components/Reveal.jsx          # reduced-motion-aware reveal
│   ├── data/navigation.js             # routes and brand menu
│   └── test/                          # shared component tests
├── Homepage/                          # homepage component, data, styles, test
├── About/                             # placeholder route
├── Brands/
│   ├── S_Project/                     # S Project component/data/styles
│   ├── INTERICH/                      # INTERICH component/data/styles
│   ├── IOAK/                          # IOAK component/data/styles
│   └── FLUX/                          # FLUX component/data/styles
├── Experience/                        # 578 Experience page
├── News/                              # filterable projects page
├── Contact/                           # locations and appointment form
├── NotFound/                          # unknown-route page
├── scripts/
│   ├── crop-assets.mjs                # Sharp crop runner
│   └── crop-manifest.js               # source and crop metadata
├── public/assets/                     # generated WebP files
└── tests/e2e/site.spec.js             # responsive navigation smoke tests
```

---

### Task 1: Create the application shell and test harness

**Files:**
- Create: `Website/package.json`
- Create: `Website/index.html`
- Create: `Website/vite.config.js`
- Create: `Website/playwright.config.js`
- Create: `Website/src/main.jsx`
- Create: `Website/src/App.jsx`
- Create: `Website/src/test/setup.js`
- Create: `Website/src/App.test.jsx`

**Interfaces:**
- Produces: `App(): JSX.Element`
- Consumes later page components as React Router route elements.

- [ ] **Step 1: Install runtime and test dependencies**

Run from `Website/`:

```powershell
npm init -y
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright sharp
```

Expected: dependencies install successfully and `node_modules/` exists.

- [ ] **Step 2: Define scripts and Vite configuration**

Use these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "assets": "node scripts/crop-assets.mjs"
  }
}
```

Configure `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
```

- [ ] **Step 3: Write the failing route test**

```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

it('renders the homepage at the root route', () => {
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /building better living/i })).toBeInTheDocument();
});
```

Run: `npm test -- src/App.test.jsx`

Expected: FAIL because `App` and the Homepage do not exist.

- [ ] **Step 4: Add the router skeleton**

Create `App.jsx` with explicit imports for `/`, `/about`, four brand routes, `/experience`, `/news`, `/contact`, and `*`. Until their tasks are complete, each route may import its actual page module containing the minimal route heading used by its test. Do not use anonymous inline placeholders.

```jsx
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/brands/s-project" element={<SProjectPage />} />
      <Route path="/brands/interich" element={<InterichPage />} />
      <Route path="/brands/ioak" element={<IoakPage />} />
      <Route path="/brands/flux" element={<FluxPage />} />
      <Route path="/experience" element={<ExperiencePage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Verify the harness**

Run: `npm test -- src/App.test.jsx`

Expected: PASS after the Homepage heading module exists.

---

### Task 2: Build the repeatable image crop pipeline

**Files:**
- Create: `Website/scripts/crop-manifest.js`
- Create: `Website/scripts/crop-assets.mjs`
- Create: `Website/scripts/crop-assets.test.js`
- Create: `Website/public/assets/.gitkeep`

**Interfaces:**
- Produces: `cropManifest: Array<{ source, output, left, top, width, height }>`
- Produces: `runCrops(manifest, options): Promise<string[]>`

- [ ] **Step 1: Write manifest validation tests**

```js
import { describe, expect, it } from 'vitest';
import { cropManifest } from './crop-manifest.js';

describe('crop manifest', () => {
  it('keeps every crop inside its source image', () => {
    const dimensions = {
      'Homepage.png': [1024, 1536],
      '578Experience.png': [864, 1821],
      'Contact.png': [759, 2071],
      'FLUX.png': [864, 1821],
      'INTERICH.png': [864, 1821],
      'IOAK.png': [864, 1821],
      'News.png': [864, 1821],
      'S_Project.png': [864, 1821],
    };
    for (const crop of cropManifest) {
      const [sourceWidth, sourceHeight] = dimensions[crop.source];
      expect(crop.left + crop.width).toBeLessThanOrEqual(sourceWidth);
      expect(crop.top + crop.height).toBeLessThanOrEqual(sourceHeight);
    }
  });
});
```

Run: `npm test -- scripts/crop-assets.test.js`

Expected: FAIL before the manifest exists.

- [ ] **Step 2: Define real crop entries**

Start with hero and major card regions from each screenshot. Each entry must use measured pixel coordinates and a semantic output filename:

```js
export const cropManifest = [
  { source: 'Homepage.png', output: 'home-hero.webp', left: 0, top: 64, width: 1024, height: 420 },
  { source: 'Homepage.png', output: 'home-about.webp', left: 430, top: 510, width: 594, height: 214 },
  { source: '578Experience.png', output: 'experience-hero.webp', left: 0, top: 58, width: 864, height: 331 },
  { source: 'Contact.png', output: 'contact-showroom.webp', left: 40, top: 306, width: 314, height: 244 },
  { source: 'S_Project.png', output: 's-project-hero.webp', left: 0, top: 65, width: 864, height: 435 },
  { source: 'INTERICH.png', output: 'interich-hero.webp', left: 0, top: 65, width: 864, height: 445 },
  { source: 'IOAK.png', output: 'ioak-hero.webp', left: 0, top: 65, width: 864, height: 364 },
  { source: 'FLUX.png', output: 'flux-hero.webp', left: 0, top: 65, width: 864, height: 350 },
  { source: 'News.png', output: 'news-brighton.webp', left: 8, top: 398, width: 210, height: 470 },
];
```

Add the remaining visible content photographs while implementing their page task, using the same schema and source-bound test.

- [ ] **Step 3: Implement the Sharp runner**

```js
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { cropManifest } from './crop-manifest.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(here, '../../DesignDrawing');
const outputDir = path.resolve(here, '../public/assets');

export async function runCrops(manifest = cropManifest) {
  return Promise.all(manifest.map(async (crop) => {
    const target = path.join(outputDir, crop.output);
    await sharp(path.join(sourceDir, crop.source))
      .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
      .webp({ quality: 88 })
      .toFile(target);
    return target;
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await runCrops();
```

- [ ] **Step 4: Generate and verify assets**

Run:

```powershell
npm run assets
npm test -- scripts/crop-assets.test.js
```

Expected: WebP assets are created and the manifest test passes.

---

### Task 3: Implement the design system, dynamic grid, and global navigation

**Files:**
- Create: `Website/Shared/styles/tokens.css`
- Create: `Website/Shared/styles/global.css`
- Create: `Website/Shared/data/navigation.js`
- Create: `Website/Shared/components/SiteHeader.jsx`
- Create: `Website/Shared/components/SiteHeader.module.css`
- Create: `Website/Shared/components/SiteFooter.jsx`
- Create: `Website/Shared/components/SiteFooter.module.css`
- Create: `Website/Shared/components/MediaGrid.jsx`
- Create: `Website/Shared/components/MediaGrid.module.css`
- Create: `Website/Shared/components/Reveal.jsx`
- Test: `Website/Shared/test/SiteHeader.test.jsx`
- Test: `Website/Shared/test/MediaGrid.test.jsx`

**Interfaces:**
- `MediaGrid({ items, minCardWidth = '18rem', className = '' })`
- Item shape: `{ src, alt, title, text, href?, ratio: 'portrait'|'square'|'landscape'|'wide' }`
- `SiteHeader()` consumes `primaryNavigation` and `brandNavigation`.

- [ ] **Step 1: Write failing behavior tests**

Test that OUR BRANDS opens on click, Escape closes it, all four brand links exist, and the mobile trigger has an accessible name. Test that `MediaGrid` renders every supplied item and adds the declared ratio class.

Run: `npm test -- Shared/test`

Expected: FAIL because shared components do not exist.

- [ ] **Step 2: Add tokens and global primitives**

```css
:root {
  --canvas: #f7f6f2;
  --surface: #fff;
  --ink: #181817;
  --body: #55534f;
  --muted: #85817a;
  --border: #d8d4cc;
  --font-sans: Manrope, "Helvetica Neue", Arial, sans-serif;
  --page-gutter: clamp(1.5rem, 5vw, 4.5rem);
  --section-space: clamp(4.5rem, 10vw, 9rem);
  --ease: 220ms cubic-bezier(.2, .7, .2, 1);
}
```

Global CSS must set `box-sizing`, body colors, font smoothing, responsive images, visible `:focus-visible`, and reduced-motion overrides.

- [ ] **Step 3: Implement the ratio-aware grid**

```jsx
export function MediaGrid({ items, minCardWidth = '18rem', className = '' }) {
  return (
    <div className={`${styles.grid} ${className}`} style={{ '--card-min': minCardWidth }}>
      {items.map((item) => (
        <article className={styles.card} key={item.src}>
          <div className={`${styles.media} ${styles[item.ratio]}`}>
            <img src={item.src} alt={item.alt} loading="lazy" />
          </div>
          {item.title && <h3>{item.title}</h3>}
          {item.text && <p>{item.text}</p>}
        </article>
      ))}
    </div>
  );
}
```

```css
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--card-min)),1fr)); gap:clamp(1rem,2vw,1.75rem); }
.media { overflow:hidden; background:#ece9e3; }
.portrait { aspect-ratio:3/4; }
.square { aspect-ratio:1; }
.landscape { aspect-ratio:4/3; }
.wide { aspect-ratio:16/9; }
.media img { width:100%; height:100%; object-fit:cover; transition:transform var(--ease); }
.card:hover img { transform:scale(1.02); }
```

- [ ] **Step 4: Implement accessible navigation**

Use a button for OUR BRANDS with `aria-expanded` and `aria-controls`. Close on Escape, route selection, outside pointer down, and lost focus. Restore focus to the trigger after Escape. Use a separate labeled mobile menu button and lock body scroll only while the mobile panel is open.

- [ ] **Step 5: Verify shared components**

Run: `npm test -- Shared/test`

Expected: all shared behavior tests pass.

---

### Task 4: Implement editorial primitives and Homepage

**Files:**
- Create: `Website/Shared/components/Hero.jsx`
- Create: `Website/Shared/components/Hero.module.css`
- Create: `Website/Shared/components/Editorial.jsx`
- Create: `Website/Shared/components/Editorial.module.css`
- Create: `Website/Homepage/homepageData.js`
- Create: `Website/Homepage/Homepage.jsx`
- Create: `Website/Homepage/Homepage.module.css`
- Test: `Website/Homepage/Homepage.test.jsx`

**Interfaces:**
- `Hero({ image, eyebrow, title, text, align = 'left', overlay = false })`
- `SectionIntro({ eyebrow, title, children, action })`
- `SplitFeature({ image, imageAlt, reverse = false, children })`

- [ ] **Step 1: Write the Homepage content test**

Assert that the page contains “Building Better Living.”, all four brand names, “578 Experience”, and the News section.

Run: `npm test -- Homepage/Homepage.test.jsx`

Expected: FAIL before the page composition exists.

- [ ] **Step 2: Implement editorial primitives**

Use semantic `section`, heading levels, links, and `figure` elements. `Hero` must reserve media space, support text over image or beside image, and expose a single page `h1`.

- [ ] **Step 3: Define homepage data**

```js
export const brands = [
  { title: 'S Project', subtitle: 'Residential Building', href: '/brands/s-project', ratio: 'landscape' },
  { title: 'INTERICH', subtitle: 'Custom Cabinetry', href: '/brands/interich', ratio: 'landscape' },
  { title: 'IOAK', subtitle: 'Timber Flooring', href: '/brands/ioak', ratio: 'landscape' },
  { title: 'FLUX', subtitle: 'Tapware', href: '/brands/flux', ratio: 'landscape' },
];
```

Complete each item with cropped `src`, meaningful `alt`, and concise reference-aligned copy.

- [ ] **Step 4: Compose Homepage**

Order: SiteHeader, hero, About split feature, four-brand grid, Experience split feature, compact News grid, SiteFooter. Use shared spacing tokens and page-specific composition CSS only where the screenshot requires it.

- [ ] **Step 5: Verify Homepage**

Run: `npm test -- Homepage/Homepage.test.jsx`

Expected: PASS.

---

### Task 5: Implement the four configurable brand pages

**Files:**
- Create: `Website/Shared/components/BrandPage.jsx`
- Create: `Website/Shared/components/BrandPage.module.css`
- Create per brand: `brandData.js`, page JSX, and CSS Module under `Website/Brands/S_Project`, `INTERICH`, `IOAK`, and `FLUX`
- Test: `Website/Brands/BrandPages.test.jsx`

**Interfaces:**
- `BrandPage({ brand }): JSX.Element`
- Brand shape: `{ name, category, hero, statement, intro, collections, featureSections, cta }`

- [ ] **Step 1: Write parameterized failing route tests**

```jsx
it.each([
  ['/brands/s-project', 'S Project'],
  ['/brands/interich', 'INTERICH'],
  ['/brands/ioak', 'IOAK'],
  ['/brands/flux', 'FLUX'],
])('renders %s with heading %s', (route, heading) => {
  render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
});
```

- [ ] **Step 2: Implement the shared brand renderer**

Render configurable Hero, statement/intro split, `MediaGrid` collections, optional material swatches, manufacturing feature, external-site CTA, and footer. Never branch on child index to set layout; consume each section’s declared `variant` and each media item’s `ratio`.

- [ ] **Step 3: Add brand-specific data and compositions**

Use these collection labels:

- S Project: Custom Homes, Design & Build, Melbourne Projects
- INTERICH: Kitchens, Wardrobes, Whole-home Cabinetry
- IOAK: Natural Oak, Engineered Timber, Signature Finishes
- FLUX: Basin, Bath & Shower, Kitchen, plus four finish swatches

Add all needed crops to `crop-manifest.js`, run `npm run assets`, and verify each output visually before wiring its path.

- [ ] **Step 4: Verify all brand pages**

Run: `npm test -- Brands/BrandPages.test.jsx scripts/crop-assets.test.js`

Expected: PASS.

---

### Task 6: Implement 578 Experience and About/Not Found routes

**Files:**
- Create: `Website/Experience/experienceData.js`
- Create: `Website/Experience/ExperiencePage.jsx`
- Create: `Website/Experience/ExperiencePage.module.css`
- Create: `Website/About/AboutPage.jsx`
- Create: `Website/NotFound/NotFoundPage.jsx`
- Test: `Website/Experience/ExperiencePage.test.jsx`
- Test: `Website/NotFound/NotFoundPage.test.jsx`

**Interfaces:**
- Experience consumes shared Hero, SplitFeature, MediaGrid, CTA, header, and footer.

- [ ] **Step 1: Write route content tests**

Experience must contain “578 Experience”, INTERICH, FLUX, IOAK, “Curated materials”, and the Richmond address. The unknown route must contain “Page not found” and a Home link.

- [ ] **Step 2: Compose the Experience page**

Order: showroom hero, introduction split, three-zone dynamic grid, material library strip, visit/map panel, external website CTA, footer.

- [ ] **Step 3: Implement intentional empty states**

About uses the global shell, “About” as `h1`, “Coming soon” copy, and a Home link. Not Found uses the same shell and a Home action.

- [ ] **Step 4: Verify routes**

Run: `npm test -- Experience NotFound`

Expected: PASS.

---

### Task 7: Implement News filtering and Contact validation

**Files:**
- Create: `Website/News/newsData.js`
- Create: `Website/News/NewsPage.jsx`
- Create: `Website/News/NewsPage.module.css`
- Create: `Website/News/NewsPage.test.jsx`
- Create: `Website/Contact/contactData.js`
- Create: `Website/Contact/AppointmentForm.jsx`
- Create: `Website/Contact/ContactPage.jsx`
- Create: `Website/Contact/ContactPage.module.css`
- Create: `Website/Contact/ContactPage.test.jsx`

**Interfaces:**
- `filterProjects(projects, category): Project[]`
- `AppointmentForm({ onSubmit = async () => undefined })`

- [ ] **Step 1: Write News interaction tests**

Assert that selecting FLUX hides non-FLUX projects, selecting ALL restores the full initial set, and Load More increases visible cards without changing their grid API.

- [ ] **Step 2: Implement News**

Keep categories in data, use buttons with `aria-pressed`, derive visible projects from category and display limit, and render through `MediaGrid`.

```js
export function filterProjects(projects, category) {
  return category === 'ALL' ? projects : projects.filter((project) => project.brand === category);
}
```

- [ ] **Step 3: Write Contact validation tests**

Submit an empty form and assert inline messages for name, email, location, date, and time. Enter an invalid email and assert the email-specific message. Enter valid data and assert the success status.

- [ ] **Step 4: Implement appointment validation**

Use visible labels and native inputs. Validation returns a keyed object:

```js
export function validateAppointment(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.location) errors.location = 'Choose a visit location.';
  if (!values.date) errors.date = 'Choose a preferred date.';
  if (!values.time) errors.time = 'Choose a preferred time.';
  return errors;
}
```

On success, show `role="status"` and clear only after the simulated promise resolves.

- [ ] **Step 5: Verify News and Contact**

Run: `npm test -- News Contact`

Expected: PASS.

---

### Task 8: Add route focus, responsive browser checks, and final verification

**Files:**
- Modify: `Website/src/App.jsx`
- Modify: `Website/Shared/styles/global.css`
- Create: `Website/tests/e2e/site.spec.js`

**Interfaces:**
- `RouteFocus(): null` focuses `[data-page-heading]` after pathname changes.

- [ ] **Step 1: Add failing route-focus test**

Navigate from Homepage to Contact and assert that the Contact `h1` receives focus.

- [ ] **Step 2: Implement route focus**

Use `useLocation()` and `useEffect()` to focus the page heading with `tabIndex="-1"` after pathname changes. Do not move focus on filter changes within a page.

- [ ] **Step 3: Add browser smoke tests**

```js
import { expect, test } from '@playwright/test';

for (const width of [375, 768, 1024, 1440]) {
  test(`homepage has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
}
```

Add smoke navigation for every route, desktop OUR BRANDS keyboard behavior, mobile menu behavior, News filters, Contact errors, and reduced-motion emulation.

- [ ] **Step 4: Run the full verification suite**

Run:

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Expected: unit tests pass, Vite production build succeeds, and Playwright tests pass at all required widths.

- [ ] **Step 5: Perform visual reference review**

Compare each route side-by-side with its corresponding screenshot at the closest source aspect ratio. Correct only observable differences in hierarchy, spacing, crop, font scale, border weight, and responsive flow. Confirm:

- No whole-page screenshot is used as a background.
- Dynamic grids remain stable with 2, 3, 5, and 8 test items.
- Keyboard focus is always visible.
- No page scrolls horizontally.
- Header menus never obscure the focused control.
- The final visual language remains warm, neutral, square-cornered, shadow-free, and spacious.
