# Rafayet Murtaza — Engineering Portfolio

A responsive portfolio focused on electrical engineering, embedded systems, and robotics.

**Live:** https://rafayetm0rtaza.github.io/Rafayets_den/

## Structure

- `index.html`: semantic, accessible portfolio content for every screen size
- `style.css`: responsive layout, print styles, and reduced-motion support
- `main.js`: optional mobile navigation and legacy-anchor compatibility
- `projects/`: static project notes and links to available source code
- `assets/`: optimized project photos, portrait, social preview, and downloadable résumé
- `lab/`: optional Three.js Tesla-coil experiment; graphics load only after the visitor starts it
- `scripts/check_site.py`: internal-link, metadata, and asset validation
- `.github/workflows/pages.yml`: validate, package, and deploy to GitHub Pages

## Local preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. There is no build step or package installation. The primary portfolio and project pages work without JavaScript or third-party requests. Only the optional lab uses Three.js from jsDelivr.

## Verify

```sh
python3 scripts/check_site.py
node --check main.js
node --check lab/lab.js
```

Before publishing, check navigation and project pages at phone, tablet, and desktop widths, keyboard navigation, résumé download, and the lab start/pause controls. Confirm that the main page remains readable with JavaScript disabled.

## Updating content

Edit the static HTML directly. Keep project summaries consistent between the homepage and corresponding project pages. Replace `assets/Rafayet_Murtaza_Resume.pdf` to update the résumé. Update `sitemap.xml` when adding pages. `assets/social-preview.png` is used for social links.

Project text is based on the supplied résumé and public project documentation. Photos were recovered from this repository's history or the public STM32 project repository. Conceptual diagrams are labeled as such; they are not presented as measured results or circuit schematics.

## License

See [LICENSE](LICENSE).

## ElectroPup attribution

The ElectroPup power-carrier project is an adaptation of [reubenstr/ElectroPup](https://github.com/reubenstr/ElectroPup/tree/main/pcbs/power_carrier). Rafayet’s documented change is a copper-to-copper clearance of 15 mil (0.381 mm); the fabrication photo was supplied by Rafayet. Original hardware authorship is credited on the homepage and project page.
