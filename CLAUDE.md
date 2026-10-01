# Photography Website: Project Guide for Claude Code

## 1. What we're building

A bilingual (English + Bulgarian) portfolio site for **Mihaylo Dimo (Михайло Димо)**, an event/documentary photographer based in Bulgaria.

Goals, in order of importance:
1. **Let the photos carry the design.** Modern, minimal, calm, confident.
2. **Convert visitors into clients.** The homepage should not only show work, it should guide a prospective client toward getting in touch (services, process, trust signals, clear inquiry form).
3. **Feel fast.** Sluggishness is a design failure on this project.
4. **Be cheap to run and easy to own.** Static output, content in files, deployed from GitHub.

Pages: Home, Moments (galleries and event stories merged, with lightbox), Services, About, Contact.

This is a collaboration. We design and build this together from scratch. Do not default to generic templates or stock "photographer website" patterns.

## 2. Tech stack (do not change without asking)

- **Framework:** Astro (static output), **plain JavaScript** (no TypeScript). Node 22+ (`.nvmrc`).
- **Styling:** Tailwind CSS with design tokens as CSS variables (colors, radii, spacing, type scale).
- **Themes:** a light theme and a dark ("night") theme. The site follows the visitor's system setting, with a manual toggle to override. See section 3.
- **DaisyUI 5 (lean):** two custom themes only (`light`, `night` in `src/styles/tokens.css`), and only the components listed in the `include:` line of `src/styles/global.css` (form fields, toggle). Hero, bento, cards, and menu are hand-built with Tailwind. Add a component to `include:` only when it's actually used.
- **Scroll and page animation:** GSAP + ScrollTrigger (free, lightweight) for scroll-linked hero and section transitions.
- **UI micro-interactions:** Motion (motion.dev) only where GSAP would be overkill (hover, menu open/close, lightbox transitions).
- **Smooth scroll:** Lenis, only if it demonstrably improves feel and doesn't hurt mobile performance. Ask before adding.
- **Lightbox:** PhotoSwipe v5 (touch gestures, zoom, keyboard, accessible). Core loads on Moment pages; the viewer is fetched on first open.
- **Carousels:** prefer a tiny dependency or native CSS scroll-snap. Ask before adding a library.
- **Moments (blog + galleries):** Astro Content Collections with MDX, one file per event per language in `src/content/moments/{en,bg}/`, sharing a `translationKey`. Each entry is a short story plus its gallery; filterable by category (Weddings / Photoshoots / Concerts & Sports).
- **i18n:** Astro's built-in i18n routing. Locales: `en` (default) and `bg`, routes `/en/...` and `/bg/...` (same slugs in both). All strings in `src/i18n/en.json` and `src/i18n/bg.json`, read via `t()` / `useT()` from `src/i18n/index.js`; the build fails if a key is missing or the two files differ. Shared numbers (prices, hours) live in `src/data/`. Include `hreflang` tags and a language switcher that keeps the user on the equivalent page.
- **Images:** `astro:assets` for automatic AVIF/WebP, responsive `srcset`, explicit dimensions to avoid layout shift. Lazy-load below the fold. Hero image is eager and preloaded.
- **Contact form:** Netlify Forms (static HTML form detected at build, submitted via fetch with inline success/error state, honeypot field for spam). Form labels and messages in both languages.
- **Workflow and hosting:** code lives on **GitHub**, auto-deployed by **Netlify**. The domain is registered at **SuperHosting.bg**; we point its DNS to Netlify (no need to host files on SuperHosting). Provide the exact DNS records and steps when we reach the deploy phase.

Do not add a dependency without stating what it is, why it's needed, and its size impact. Prefer fewer packages.

## 3. Design direction

### Overall feel
**Modern, minimal, Apple-like.** Soft, rounded, spacious, quietly premium. Large confident type, lots of breathing room, gentle motion. The photos are the stars; the interface stays out of the way.

### Look and feel rules
- **Rounded everything.** Images, cards, buttons, form fields, lightbox frame, and menu panels use generous, consistent corner radii. Define radius tokens (for example small / medium / large / pill) and reuse them. No sharp corners anywhere.
- **Light base palette.** The light theme is the primary design: a soft off-white page background with white or very slightly tinted cards, and near-black text (not pure black). Think Apple's neutral greys.
- **A tiny accent that follows the theme:** golden-hour **amber by day** (`#b06a2a`), blue-hour **violet by night** (`#9d8cff`), as `--color-accent`. Used only for focus rings, text selection, active indicators (filter dot, current-page dot), progress hairlines and step lines. Buttons, links and text stay neutral (near-black / soft light grey) so the photographs provide the colour.
- **Day/night toggle.** A small, elegant toggle in the header. Behavior:
  - **Follows the visitor's system setting** (`prefers-color-scheme`) on first visit. Light is the fallback when there is no preference.
  - A manual choice overrides the system setting and is saved in `localStorage`.
  - A tiny inline script in `<head>` applies the theme before paint so there is **no flash**.
  - Both themes follow the same rules: consistent negative space, no harsh contrasts, photos always look good on both.
- **DaisyUI (optional):** may be used as the theme/token layer with exactly two themes (a custom light and a custom dark, based on the closest built-in themes and tuned to our palette). Do not ship unused themes or lean on DaisyUI components that fight the Apple-like look. If it adds noticeable weight or class clutter, use plain CSS variables instead. Ask before installing.
- **One tonal world per theme.** Negative space should be the same type and feel across sections. **No hard black/white section flipping.** Separate sections with subtle tonal steps, spacing, and rounded containers.
- **Bento and card layouts.** Use rounded bento grids for selected work, services, and process blocks, in the spirit of Apple product pages. Vary tile sizes deliberately but keep gutters uniform.
- **No overlapping clutter.** Elements have room. Prefer fewer, larger images per view over dense collages.
- **Restraint with density.** If a section feels busy, remove things instead of shrinking them.
- **Shadows and effects:** very soft or none. A subtle translucent blurred header is fine if it stays smooth on mobile; drop it if it costs performance.

### Typography
- **System font stack only. No web fonts, no font loading, no flash of unstyled text.**
- Use something like: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (and the equivalent `system-ui` fallbacks). These cover Cyrillic on all major platforms.
- Create hierarchy with size, weight, and tracking, not with novelty fonts: very large, tight-tracked headlines; comfortable body size and line height; medium-weight small labels.
- Verify Bulgarian text renders well (long words, wrapping, headline line breaks) in both languages.
- Keep the Bulgarian-style Cyrillic letterforms ("т" like *m*, "д" like *g*) that Apple's system font applies under `lang="bg"`; the user likes them. Don't override `locl`.

### Hero and motion
- **Hero carousel:** a full-bleed, rounded hero carousel with one short powerful message that stays fixed over/beside the images, followed by a deliberate scroll transition into the next section (in the spirit of adovasio.it).
  - **Auto-rotates slowly from the moment the page loads** (soft crossfade or gentle slide, roughly 5 to 7 seconds per slide, tunable in one place).
  - **Visitor control:** swipe on touch, arrow buttons, dots or a thin progress indicator, and keyboard arrows. Manual interaction pauses autoplay briefly, then it resumes. Also pause on hover/focus and when the tab is hidden.
  - **Performance:** the first slide is eager and preloaded (it is the LCP image); remaining slides load lazily. Use 4 to 6 slides maximum.
  - **Accessibility:** if `prefers-reduced-motion` is set, do not autoplay. Provide a visible pause/play control and proper `aria` labels/live-region behavior.
  - Choose the slides from `/images` and let the user swap them.
- **Scroll animation:** image and text move in coordination (parallax, reveal, pin, crossfade). Purposeful, not decorative. Animate `transform` and `opacity` only. Motion should feel smooth and soft, like Apple's own pages.
- **Menu:** minimal and unobtrusive. Simple top bar on desktop, a clean rounded slide-in or full-screen panel on mobile. Language switcher (EN | BG) and theme toggle always reachable. Not a copy of the adovasio menu.

### What to take from the reference sites
| Reference | Take | Avoid |
|---|---|---|
| adovasio.it | Scroll animations where images and text move together; strong hero image + message and how it transitions afterwards; typography feel | The menu style |
| recruit.pearl-idea.co.jp | Polish and animation quality; how motion guides attention | Information density (we are not building this much on one page) |
| avagyanphoto.com | Bold, simple, luxurious restraint; letting the work speak | Relying on credentials alone: we need to explain services and build trust |
| kaylafisherphotography.com | Typography sense | Heavy pages, images everywhere, overlapping elements |
| bellephoto.com.au | Section positioning and typography | Hard black/white section flipping |
| orastudio.ca | Simplicity | Big contrasting white and black voids, sluggish feel |

### "Courting the client" (homepage narrative)
Suggested flow (to be refined together): hero, short personal positioning statement, selected work (bento), services overview, how it works (process), recent Moments (there are no testimonials or client logos, so trust comes from the work itself, clear services and prices, and a warm personal tone), clear call to action to the inquiry form. Every page ends with a low-pressure route to contact.

## 4. Performance and quality budget

- Lighthouse target: 95+ on Performance, Accessibility, Best Practices, SEO (mobile).
- Ship minimal JavaScript. Astro islands only where interactivity is required. Load GSAP/PhotoSwipe only on pages that use them.
- No layout shift: all images have dimensions or aspect ratios. No font loading at all thanks to system fonts.
- Respect `prefers-reduced-motion`: disable or simplify scroll animations.
- Fully responsive, touch-friendly lightbox, keyboard navigable, visible focus states, meaningful `alt` text in both languages, sufficient contrast in both themes.
- Test on a throttled mobile profile before calling anything done.

## 5. Content and translation rules

- Every user-facing string exists in both `en` and `bg`. Never hardcode text in components.
- Site name: **Mihaylo Dimo** (EN) / **Михайло Димо** (BG).
- Moments entries: `src/content/moments/en/*.mdx` and `src/content/moments/bg/*.mdx`, sharing a `translationKey` in frontmatter so the language switcher can link equivalents.
- Prices: EUR only (no BGN), formatted with `formatPrice()` (EN `€1,450`, BG `1450 €`).
- Bulgarian copy uses "овъртайм" ("Цена за овъртайм") by the user's choice.
- Bulgarian copy should read naturally, not as literal translation. Flag machine-translated text for the user to review.
- Format dates per locale.
- Gallery metadata (titles, captions, alt) live in data files, per language.

## 6. Source material

### Images
- The user provides an **`/images`** folder in the project root with photos for carousels, bento grids, and galleries.
- Treat `/images` as **read-only originals**. Never delete, rename, or overwrite them.
- For optimization with `astro:assets`, copy the chosen images into `src/assets/` (organized by gallery/section) and reference them from there. Tell the user which images you picked for which section and let them swap.
- Propose the 4 to 6 hero carousel images and let the user approve or swap them.
- **Logo:** `/images/logo.svg` is the site logo. Copy it into `src/assets/` and use it in the header, footer, and favicon. Inline it or use `currentColor` where possible so it adapts to the light and dark themes; if it is not single-color, tell the user and propose a light and dark variant. Do not redraw or alter it without asking.

### Framer export (content only)
- A previous Framer export lives in the folder **`some content from framer/`** in the project root (the name contains spaces, so quote the path in shell commands). Treat it as read-only.
- **Use it only to pull text/copy**: any copy on the site can come from here, including services descriptions, **basic prices and service details**, about text, and any contact info.
- **Do not** recreate its styling, layout, components, or class names. Do not copy its code.
- **Prices are shown publicly** on the Services page (and summarized on the homepage where it fits). Present them clearly, in a consistent currency format for each locale.
- Summarize what you found (services list, prices, copy) for the user to confirm before it goes into the site.

## 7. Project structure (target)

```
images/           # user's original photos and logo.svg (read-only)
some content from framer/   # read-only Framer export (copy, services, prices)
src/
  assets/         # optimized-image sources chosen from /images
  components/     # small, single-purpose components
  layouts/
  pages/          # en/ and bg/ via Astro i18n routing
  content/
    moments/en/ moments/bg/
  i18n/           # en.json, bg.json, index.js (t, formatPrice, paths)
  data/           # shared numbers: prices, durations
  styles/         # tokens.css (DaisyUI themes, radii, spacing, type scale), global.css
  scripts/        # GSAP / animation modules, one per pattern
public/           # static assets only
```

## 8. How to work with me

- **Plan first.** For any non-trivial task, propose a short plan and wait for approval before writing code.
- **Work in phases**, one at a time:
  1. Foundation: Astro setup, design tokens (colors, radii, spacing), light/dark theme + toggle, system font stack, layout, header/menu, i18n routing, language switcher
  2. Home page: hero carousel + scroll narrative + bento sections
  3. Moments galleries + PhotoSwipe lightbox + carousels
  4. Services (with prices from the Framer export), About, Contact form (Netlify Forms)
  5. Moments stories (MDX, both languages)
  6. Polish: performance, accessibility, SEO, OG images, sitemap
  7. Deploy: GitHub repo, Netlify, SuperHosting DNS records, form notifications
- **Ask about open design decisions** (accent color, hero image, copy tone) instead of guessing. Offer 2 or 3 concrete options with a recommendation.
- **Show, don't just tell.** After each phase, run the dev server and summarize what changed and what to look at.
- **Keep changes scoped.** Don't refactor or restyle working parts unless asked. Don't rename or delete user files/images.
- Run `npm run build` and fix errors/type issues after significant changes.
- Commit in small, clearly named steps (the user uses GitHub). Don't push or deploy without asking.
- Keep components small. Comment non-obvious animation logic (scroll triggers, timelines).
- Be economical with tokens: read only the files you need, don't re-print large files, prefer targeted edits.
- If a request conflicts with this file, say so and ask rather than silently overriding it.
- When we settle a new decision or rule, propose adding it to this file.

## 9. Decisions

### Settled
- [x] Name: Mihaylo Dimo / Михайло Димо
- [x] Light base palette, with optional night/day toggle
- [x] Rounded edges on images and components; modern, minimal, Apple-like
- [x] System sans-serif typography, no font loading
- [x] Images: user's `/images` folder (carousels, bentos, galleries)
- [x] Services and basic prices: extract from the Framer export
- [x] Tooling: GitHub, Netlify, domain at SuperHosting.bg
- [x] Contact: inquiry form fill-out
- [x] Copy: pull any needed text from the `some content from framer/` folder
- [x] No testimonials or client logos
- [x] Logo: `/images/logo.svg`
- [x] Accent: theme-split, amber (day) / violet (night), in tiny doses only (replaces "fully neutral")
- [x] Theme on first visit: follows the visitor's system setting, light as fallback, manual toggle overrides
- [x] Hero: auto-rotating carousel (slow start on landing, visitor can control it)
- [x] Prices are shown publicly, EUR only
- [x] Plain JavaScript, no TypeScript
- [x] Tailwind + DaisyUI 5 (lean: two custom themes, form components only)
- [x] Blog and galleries merged into **Moments**
- [x] Nav: Moments · Services · About · Contact (plain links; logo links Home)
- [x] Base city Sofia; client galleries delivered via Pic-Time
- [x] Copy source: `homepage-copy.pdf` and `services-copy.pdf` (edited together, stored in `src/i18n/`); About/Moments/Contact text is lorem ipsum until provided
- [x] Home hero line: "The moments you'll want to live again."
- [x] Contact CTA block ("Planning something? Let's talk.") appears on About only, not on every page
- [x] Footer: copyright line only, no repeated logo
- [x] Hero: row of tall 4:5 rounded frames built for the vertical photos (3 + peek on desktop, 1 + peek on mobile), 6 s autoplay, native scroll-snap swipe. Images: `src/data/home.js`
- [x] Only images the site uses are committed (copied into `src/assets/`); `/images` stays git-ignored
- [x] GSAP + ScrollTrigger load lazily on the home page only, never under reduced motion
- [x] Stylesheets are inlined (`build.inlineStylesheets: 'always'`) for LCP; revisit if CSS grows past ~15 KB gzipped
- [x] Moments categories: Weddings · Christenings · Photoshoots · Concerts · Sports; a Moment can have several (`categories:` list in frontmatter, schema in `src/content.config.js`)
- [x] Moments photos are curated (~15–20 per event) in `scripts/moments.manifest.json` and imported with `node scripts/import-moments.mjs` (2048px, JPEG q82) into `src/assets/moments/<slug>/`. To swap photos: edit the manifest, re-run the script
- [x] Moment pages: masonry (CSS columns), PhotoSwipe lightbox themed to the page greys, "More moments" scroll-snap row
- [x] Page transitions: native cross-document View Transitions (`@view-transition` in global.css), no ClientRouter; a Moment's cover and title morph via `view-transition-name`. Names must stay unique per page
- [x] Inquiry form: `src/components/InquiryForm.astro` (Netlify Forms, form name `inquiry`, honeypot `bot-field`, hidden `language` field). Field names must stay identical in both locales. Local dev simulates a successful submit. `?service=<value>#inquiry` preselects the service
- [x] Public contact details live in `src/data/contact.js`
- [x] Home has a Services block (no prices) leading to the Services page; Services page has a "How it works" process built from existing copy
- [x] About: no portrait yet (intentionally blank until the user provides one)
- [x] SEO: per-page descriptions (`seo.*` in i18n), Open Graph/Twitter tags, JSON-LD (ProfessionalService) on home, sitemap.xml + robots.txt endpoints (no plugin), bilingual 404 (`/bg/*` → `/bg/404/` via `_redirects`), `_headers` for caching/security
- [x] Link-preview images: the page's own photo cropped to 1200×630 (`image`/`imagePosition` props on BaseLayout; Moments can set `previewCrop` in frontmatter when the default crop misses faces)
- [x] Domain: https://www.mdimophotography.bg is primary (Netlify's recommendation with external DNS); the bare domain redirects to it. Set as `site` in astro.config.mjs

- [x] Motion: every reveal replays each time it enters view (or is scroll-driven); site-wide engine `src/scripts/motion.js` + `src/styles/motion.css` (no dependency). Hooks: `data-reveal="image|rise"`, `data-reveal-group`, `data-lift` + `data-dim-group`, `data-view` (cursor pill); big headings (`h1`, `.text-headline`) split into rising words automatically. Gated by `html.motion` (unset under reduced motion)
- [x] Micro-interactions: theme toggle (sun pop / moon roll, colour bloom, circular theme reveal), sliding language and filter pills, pill-button press, arrow nudges, nav underline + accent dot, condensing header (hides on mobile scroll-down), send button spinner → check, copy-email, reading-progress hairline, photos fade in over their average colour (`scripts/image-colors.mjs` → `src/data/image-colors.json`)

### Still open
- [ ] Exact grey scales for light/dark palettes (propose options)
- [ ] Form notifications go to mihaylo.dimo@gmail.com (set in Netlify at deploy)
