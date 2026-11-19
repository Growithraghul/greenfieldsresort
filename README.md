# Greenfields Resort website

Static site: no build step.

- Pages: `index.html`, `rooms.html`, `experiences.html`, `dining.html`, `gallery.html`, `contact.html`, `booking.html`
- Shared styles: `assets/style.css`
- Shared scripts: `assets/main.js` (menu, scroll effects, gallery, forms)

## Publish on GitHub Pages
1. Put these files in the repo root (keep the `assets` folder).
2. Settings > Pages > Deploy from a branch > `main` / root.

## Before launch
- Replace the placeholder tiles with real resort photos (store them in `assets/img/`, optimise them, add real alt text).
- Confirm rates, timings, menus and room types with the resort.
- Connect the forms to a backend (see the TODO in `assets/main.js`). Until then they only prepare an email.
