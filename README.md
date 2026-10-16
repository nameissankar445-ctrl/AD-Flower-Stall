# AD Flower Stall

Website for AD Flower Stall — fresh flowers, each sold separately, from Rythu Bazar, Guntur.
Orders and quote requests are sent through WhatsApp (+91 99491 79933). Open daily 5 AM – 9 PM.

## Code framework (what this site is built with)
| Layer | What is used |
|---|---|
| Markup | Plain **HTML5** pages (no template engine) |
| Styling | Plain **CSS3** in one file — custom properties (design tokens), CSS Grid, Flexbox, keyframe animations, `clip-path`, `backdrop-filter` |
| Behaviour | Plain **vanilla JavaScript** (no library, no React/Vue) |
| Build | **None** — no bundler, no install step, files are served as they are |
| Dev server | `npx serve` via `npm run dev` |
| Fonts / icons | Google Fonts (Playfair Display, Plus Jakarta Sans — 7 weights total); inline SVG icon sprite (no icon library) |
| Data | Flower list, prices and units live in `js/main.js` (`P`); cart is saved in the browser (`localStorage`) |
| Hosting | Any static host (e.g. `npx vercel --prod`) |

The reference site gcoman.com is built with React + Vite + Tailwind. This site follows its **layout, animation style and section order** but uses plain HTML/CSS/JS to stay simple for a small shop. If you later want React/Vite, the sections map one-to-one to components.

## Run locally
    npm run dev      # http://localhost:3030

## Files (the only files — there are no backup or duplicate copies)
- `index.html` — the home page (all sections)
- `privacy.html`, `terms.html` — policy pages (cookies = Privacy Policy section 4; delivery & refunds = Terms section 4)
- `credits.html` — photo credits (reads `assets/credits.json`)
- `css/main.css` — all styles for every page
- `js/main.js` — home page behaviour · `js/inner.js` — behaviour for the inner pages
- `assets/img/` — logo (`logo.png` for light backgrounds, `logo-light.png` for dark) (plus `favicon.png` + `apple-touch-icon.png` = browser-tab/app icon cut from the 3D emblem, and `emblem.png` = the full 3D emblem, used in the hero medallion and the loader)

## Home page sections (kept deliberately short — do not add sections back)
1. Loader — 3D stage: the emblem flips in, sways side to side with a floor shadow, two tilted rings with a rose bead and a green bead orbit it, thin progress bar + percentage; exits as a curtain lifting with a rose-pink edge
2. Header — utility row + main navigation (Home, Flowers, Weddings & Pujas, Visit), cart, Request a Quote
3. Hero — light cream banner: smaller, lighter headline (words rise in), two buttons, a one-line trust row; right side an arch-shaped photo slider with numbered progress tabs, two round photos and the 3D emblem medallion that tilt in real 3D depth with the mouse (desktop)
4. Choose Your Flowers — shop with category tabs, quantity and add-to-order
5. Flowers for Every Occasion — 5 photo panels + the wedding/puja quote form
6. Visit — address, hours, delivery note, map
7. Footer — links, contact, legal, cookie settings

## Animations
Word-by-word rising headlines · cross-fading hero photos with parallax · expanding occasion panels · 3D tilt on flower cards · scroll-progress bar · reveals · gradient-border cards · button light sweep · WhatsApp pulse. Reduced-motion visitors get a calm version.

## Design tokens (`css/main.css`, `:root`)
Festive palette: maroon `#5A0F12`, kumkum red `#C8161D`, turmeric `#F2B01E`, cream `#FFF8E6` (CSS variable names --g/--rose are legacy). Marigold garland and temple-border strips are pure CSS (.gar, .tmp).

## To change content
WhatsApp number, flowers, prices and units: top of `js/main.js`. Address, hours and FAQ answers: `index.html`. Keep the address, phone and hours in sync across the page, the footer, `privacy.html`/`terms.html` and the schema block in `index.html`.

## Performance
All images are pre-compressed (about 1.3 MB for every photo and logo together), scripts and styles are tiny (no libraries), the header is a single fixed bar, and the loader is a short (about 2 second) animation.

## Admin sign-in (Supabase)
- `admin/login.html` — email + password sign-in only (there is NO sign-up page). `admin/index.html` — protected dashboard placeholder. `admin/admin.css`, `js/admin.js` (logic), `js/supabase-config.js` (project URL + anon key — fill in), `supabase/admin_users.sql` (run once in Supabase).
- Access = the user exists in Supabase Auth AND has a row in `admin_users`. Anyone else is signed out with a message. Turn OFF "Allow new users to sign up" in Supabase and create admins by hand.
- URLs: /admin/login and /admin/. Pages are `noindex`; a small "Admin Login" link sits in the footer of every public page.
