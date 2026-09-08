# Rafayet's Den

A personal portfolio site for Rafayet Murtaza, built as an interactive Three.js Tesla-coil experience and deployed with GitHub Pages.

Live site: <https://rafayetm0rtaza.github.io/Rafayets_den/>

## Stack

- HTML, CSS, and JavaScript modules
- [Three.js](https://threejs.org/) for the interactive 3D scene
- Google Fonts (Space Grotesk)
- GitHub Pages with GitHub Actions for deployment

## Highlights

- Procedural Tesla coil, lightning, and particle effects
- Scroll-driven desktop camera and section transitions
- Interactive project and contact links
- Responsive mobile layout with HTML content

## Project structure

```text
.
├── index.html          # Page structure and mobile content
├── style.css           # Site styles
├── main.js             # Scene setup and render loop
├── scene/              # Coil, lightning, particles, and camera
├── sections/           # 3D portfolio sections
├── utils/              # Shared text, scroll, and responsive helpers
└── .github/workflows/  # GitHub Pages deployment
```

## Run locally

Because the site uses ES modules, serve the repository with a local HTTP server rather than opening `index.html` directly. For example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## License

MIT. See [LICENSE](LICENSE).
