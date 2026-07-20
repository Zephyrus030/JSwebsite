# JS Building Group Website Design Specification

## 1. Goal

Build a responsive Vite + React website with eight fully designed pages plus an About placeholder route, based on the supplied JS Building Group screenshots while applying the restrained luxury navigation, motion, and editorial pacing seen on the Richemont China website.

The implementation must reproduce the reference composition and visual hierarchy without using an entire screenshot as a page background. Individual architectural and interior images will be cropped from the supplied screenshots and used as independent assets.

## 2. Scope

### Routes

- `/` — Homepage
- `/about` — minimal “Coming soon” page
- `/brands/s-project` — S Project
- `/brands/interich` — INTERICH
- `/brands/ioak` — IOAK
- `/brands/flux` — FLUX
- `/experience` — 578 Experience
- `/news` — News
- `/contact` — Contact and appointment form

### Required project location

All website code and generated assets live under `Website/`. Page code is organized so that the requested page locations remain explicit:

```text
Website/
├── Homepage/
├── About/
├── Brands/
│   ├── S_Project/
│   ├── INTERICH/
│   ├── IOAK/
│   └── FLUX/
├── Experience/
├── News/
├── Contact/
├── Shared/
├── src/
├── public/
└── docs/
```

Each named page folder exports its page component. Shared routing and application bootstrapping remain in `Website/src/`.

## 3. Architecture

Use Vite, React, React Router, and CSS Modules. Page copy and media metadata are held in JavaScript data objects so repeated editorial sections remain reusable and image counts can change without rewriting markup.

### Shared components

- `SiteHeader`: transparent-over-hero and solid-on-scroll states
- `BrandsMenu`: accessible desktop dropdown for the four brands
- `MobileMenu`: full-screen layered navigation
- `SiteFooter`: brand, addresses, contact, and social links
- `Hero`: image, text alignment, overlay, and scroll cue variants
- `SectionIntro`: eyebrow, heading, body copy, and optional link
- `SplitFeature`: responsive text-and-image editorial block
- `MediaGrid`: data-driven media cards with variable ratios
- `BrandCard`: brand title, description, image, and CTA
- `CtaBanner`: bordered or image-backed destination CTA
- `NewsGrid`: filterable and incrementally revealed projects
- `AppointmentForm`: validated front-end appointment form
- `MapPanel`: decorative map image with labeled markers

### Dynamic image layout

`MediaGrid` uses CSS Grid with `repeat(auto-fit, minmax(...))`, container-aware minimum widths, and per-item ratio metadata. Items can declare `portrait`, `square`, `landscape`, or `wide`; the component maps these to reusable aspect-ratio tokens. The number of columns is never inferred from hard-coded child positions.

Expected behavior:

- Wide desktop: two to four columns depending on card minimum width
- Tablet: two columns when content width permits
- Mobile: one column
- Counts of 2, 3, 5, or 8 items reflow without empty fixed slots or horizontal scrolling

## 4. Page Composition

### Homepage

Large architectural hero, About split feature, four-brand overview, 578 Experience feature, compact news strip, and information-rich footer. This page establishes the overall editorial rhythm.

### Brand pages

Each brand uses a shared vocabulary but retains a distinct composition:

- S Project: residential architecture, large exterior imagery, custom homes and design/build services
- INTERICH: cabinetry, manufacturing process, kitchen and wardrobe categories
- IOAK: timber flooring, natural materials, engineered finishes, and local manufacturing
- FLUX: tapware, restrained product still life, finish swatches, and bathroom/kitchen categories

Section order, image ratio, copy alignment, and card count are configurable per brand.

### 578 Experience

Showroom hero, introductory split section, three-brand showroom exploration, materials feature, location/map panel, and external website CTA.

### News

Centered editorial heading, category filters, responsive project grid, load-more behavior, contact locations, map, and footer.

### Contact

Visit-planning heading, two location cards, appointment form, map, and footer. Submission is simulated locally in the first release; no backend is included.

### About

An intentional minimal “Coming soon” page using the same navigation and footer so the route is never a dead link.

## 5. Visual System

### Color tokens

- Canvas: `#F7F6F2`
- Surface: `#FFFFFF`
- Primary text: `#181817`
- Body text: `#55534F`
- Muted text: `#85817A`
- Border: `#D8D4CC`
- Inverse surface: `#181817`
- Inverse text: `#F7F6F2`

Warm timber, stone, brass, and green tones come primarily from photography. No saturated accent color or generic gold gradient is introduced.

### Typography

- Primary family: Manrope
- Fallbacks: `"Helvetica Neue"`, Arial, sans-serif
- Hero: `clamp(3rem, 5.4vw, 4.5rem)`, weight 300–400
- Page title: `clamp(2.5rem, 4vw, 3.5rem)`, weight 300–400
- Section heading: `clamp(1.75rem, 2.6vw, 2.25rem)`, weight 300–400
- Body: `clamp(0.9375rem, 1.2vw, 1.0625rem)`, weight 400, line-height 1.6
- Eyebrows and navigation: 0.6875–0.75rem, uppercase, letter-spacing 0.14–0.24em

Type remains light and geometric. Serif display type is intentionally excluded because it conflicts with the supplied screenshots.

### Spacing

- Content maximum: approximately 1440px
- Responsive page gutter: 24px mobile, 40px tablet, 56–72px desktop
- Major section spacing: 96–144px desktop, 64–88px tablet, 48–72px mobile
- Internal section spacing: 24–48px
- Grid gap: 16–28px depending on viewport

Whitespace is a primary design element. Sections should not be compressed merely to match screenshot height.

### Components

- Corners: square by default; no decorative pill shapes
- Shadows: none on cards; only subtle header separation when needed
- Borders: 1px neutral border
- Buttons: square bordered rectangle, uppercase tracking, directional arrow
- Button hover: dark fill with inverse text over 180–240ms
- Cards: image-led, no radius, no shadow, hierarchy created through spacing and type
- Images: `object-fit: cover`, responsive dimensions reserved to avoid layout shift

## 6. Navigation and Motion

The desktop header uses small uppercase links and generous horizontal spacing. Over appropriate heroes it may begin transparent, then transition to a warm solid surface with a fine bottom border after scrolling.

The OUR BRANDS item opens a wide, square-cornered dropdown listing S Project, INTERICH, IOAK, and FLUX. It supports pointer hover, click, keyboard focus, Escape-to-close, and focus restoration.

On mobile, a labeled menu button opens a full-screen navigation layer. The brand group expands within that layer.

Motion remains subtle:

- Initial hero fade
- Section reveal with 12–20px upward travel
- Image hover scale up to 1.02
- Durations between 200ms and 400ms
- No parallax or continuous decorative motion
- `prefers-reduced-motion` disables nonessential transitions

## 7. Content and State Flow

Page components consume local data modules containing headings, body copy, links, card arrays, and media metadata. Shared components render from this data and do not contain page-specific text.

News filters update visible project data on the client. Load More increases the visible item limit and allows the grid to reflow.

The appointment form manages local field state, required validation, inline errors, and a success confirmation. Invalid fields receive accessible descriptions. The initial release does not send data to a server.

## 8. Asset Processing

Create a repeatable crop manifest that records source screenshot, crop rectangle, output name, and intended ratio. A script produces individual WebP assets under `Website/public/assets/`.

Rules:

- Preserve the supplied screenshots unchanged as references
- Crop only image regions, never navigation or baked-in text
- Export an appropriate pixel size for the largest rendered slot
- Include meaningful alt text for content images
- Mark purely decorative images with empty alt text
- Lazy-load below-the-fold media

The screenshot resolution limits final crop sharpness; the asset structure must make later replacement with original photography straightforward.

## 9. Accessibility and Error Handling

- Text contrast meets WCAG AA
- All navigation and controls are keyboard accessible
- Focus rings remain visible
- Touch targets are at least 44px where practical
- Form labels remain visible and errors appear beside their fields
- Images have correct alternative text treatment
- Route changes move focus to the page heading
- Unknown routes render a branded not-found page with a Home action
- Image containers retain a neutral background if an image fails to load

## 10. Verification

### Automated

- Route rendering for all nine routes, including About
- Brands menu open, close, keyboard, and route behavior
- News category filtering and Load More
- Appointment form required fields, invalid states, and simulated success
- Production build succeeds

### Visual and responsive

Verify at 375px, 768px, 1024px, and 1440px:

- No horizontal overflow
- Hero and section hierarchy remain legible
- Dynamic grids work with 2, 3, 5, and 8 cards
- Header state and menus do not obscure content
- Text and controls remain comfortably spaced
- Page compositions visibly correspond to their supplied references

## 11. Non-goals

- Backend form delivery
- CMS integration
- User authentication
- E-commerce
- Exact reproduction of the Richemont website
- Fabricating high-resolution source photography that was not supplied
