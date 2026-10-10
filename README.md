# AD Flower Stall

Website for **AD Flower Stall** — fresh flowers, bouquets and garlands from Rythu Bazar, Guntur.
Static HTML / CSS / JS (no build step). Orders and enquiries are sent through WhatsApp.

## Run locally
```
npm run dev
```
Then open http://localhost:3030

## Structure
- `index.html` — current landing page (loader, hero, collections, shop, deal, occasions, gallery, good to know, contact, plan, footer)
- `policies.html` — privacy, terms, cookie policy, delivery & refunds
- `css/` — `luxe.css` (base) plus layered stylesheets; `js/home.js` (shop, cart, WhatsApp orders) and `js/chrome.js`
- `assets/img/` — logo (`logo.png`, `logo-light.png`) and flower photos
- `index-*.html` — earlier design versions kept for reference

## To update
WhatsApp number and prices live in `js/home.js` (`PHONE`, product list `P`). Contact details are in `index.html`.
