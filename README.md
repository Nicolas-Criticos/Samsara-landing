# Samsara Olive Oil — Landing Page

> "Rooted in the Karoo. Grown with Purpose."

Premium landing page for Samsara Olive Oil, hand-built with pure HTML, CSS, and JavaScript. No frameworks. No build tools. Opens directly in a browser.

---

## Quick Start

```bash
# Option 1: VS Code Live Server (recommended)
# Open folder in VS Code → click "Go Live" in the status bar

# Option 2: Python simple server
cd samsara-landing
python3 -m http.server 8080
# then open http://localhost:8080

# Option 3: Node http-server
npx http-server . -p 8080
```

> **Note:** The JS uses ES modules (`type="module"`), which require a server.  
> Direct `file://` opening will not load scripts correctly in most browsers.

---

## Project Structure

```
samsara-landing/
├── index.html              Main page — all sections
├── css/
│   ├── base.css            Reset, CSS custom properties, typography
│   ├── layout.css          Section layouts, grid, hero, footer
│   ├── components.css      Buttons, product cards, slider, ghost messages
│   └── animations.css      Breathing pulse, scroll reveals, shimmer
├── js/
│   ├── app.js              Entry point — boots all modules
│   ├── animations.js       Particle canvas, IntersectionObserver, parallax
│   ├── cart.js             Add-to-cart UI, ghost popups, variant selection
│   └── slider.js           Tree rehabilitation slider calculator
└── assets/
    └── images/
        ├── logo.png         Samsara tree-of-life logo
        ├── backdrop.jpg     Sunset through olive trees (Story section bg)
        ├── header.jpg       Farm aerial / landscape
        ├── story.jpg        Misty olive grove
        └── options.jpeg     5L tin + plastic bottle product shot
```

---

## Design System

### Colors (CSS Custom Properties)

| Variable | Value | Use |
|---|---|---|
| `--color-earth-dark` | `#1a1208` | Hero background, footer |
| `--color-copper` | `#8b4513` | Accents, prices |
| `--color-gold` | `#c9a040` | Highlights, slider, pulse rings |
| `--color-olive` | `#6b7c3a` | Tree counter, nature accents |
| `--color-cream` | `#f7f0e6` | Page background |

### Typography
- **Headings:** Cormorant Garamond (300/400/600 weights) — elegant, organic
- **Body:** Lato (300/400/700) — clean, readable

### The Breathing Pulse
The hero animation — three CSS rings pulse outward with a 4-second sine-cycle using `transform: scale()` and `box-shadow` glow. The logo itself breathes with `drop-shadow`. All on `transform/opacity` only for 60fps.

---

## Sections

1. **Hero** — Full-viewport, breathing logo, particle canvas, entrance animation
2. **Story** — Parallax backdrop image, scroll-triggered fade-in text
3. **Mission** — Tree rehabilitation slider (R0–R10,000 range, R450/tree)
4. **Products** — Responsive 3-column card grid with variant selectors
5. **Footer** — Instagram + WhatsApp links

---

## Products

| Product | Variants | Price |
|---|---|---|
| 5L Extra Virgin Olive Oil | Tin / Plastic | R 1,780 |
| 250ml Infused Olive Oil | Rosemary / Oregano | R 240 |
| Ritual Health Shot | Box of 14 | R 462 |

Tree impact per product (R450 = 1 tree):
- 5L EVOO → 3 trees
- 250ml Infused → 0 full trees (53% of one tree)
- Ritual Shot Box → 1 tree

---

## TODO: Celium Backend Integration

Search for `TODO: Celium` in the codebase for all integration points:

- `js/cart.js` — Replace `cartState` with Celium cart API calls
- `js/cart.js` — POST `/api/cart/add` on add-to-cart
- `js/cart.js` — GET `/api/cart` for cart badge sync
- `index.html` — "Learn More About The Project" button — link to About page

---

## Adding Product Photos

The 5L EVOO card uses `options.jpeg`. The other two cards show a "Photo coming soon" placeholder. To add photos:

1. Place images in `assets/images/`
2. In `index.html`, replace the `<div class="product-card__image-placeholder">` blocks with:

```html
<img
  src="assets/images/YOUR_PHOTO.jpg"
  alt="Descriptive alt text"
  class="product-card__image"
  loading="lazy"
/>
```

---

## Browser Support

Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+).  
No IE support. Uses: CSS custom properties, ES modules, IntersectionObserver, Canvas API.

---

## Git

```bash
# Initial commit already done at project creation
git log --oneline

# Stage and commit changes
git add -A && git commit -m "your message"
```

---

*Built with 🌿 for Samsara · VrischGewagt Boutique Olive Farm · Swartberg Karoo*
