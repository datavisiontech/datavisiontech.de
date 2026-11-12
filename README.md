# datavisiontech.de

Website of Data Vision Consulting & Services (DVCS). Static HTML, English and German, no dependencies.

## Build

    node build.mjs            # writes dist/ (the site to host)
    node build.mjs --preview  # writes preview/ (opens directly from disk)

- Text for all pages is in `build.mjs`.
- Styles, logo and scripts are in `src/assets/`.
- Original logo files are in `brand/`.

## Hosting

GitHub Pages. Build command: `node build.mjs`, output folder: `dist`.

## Before go-live

1. Fill in the marked fields in Impressum and Datenschutz, and have both checked.
2. Set `NOINDEX = false` in `build.mjs` (removes the trial banner and lets search engines index the site).
3. Point the domain to the new host and redirect old WordPress URLs.
