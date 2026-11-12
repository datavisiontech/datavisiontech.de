# datavisiontech.de

Website of Data Vision Consulting & Services (DVCS). Static HTML, English and German, no dependencies.

## Build

    node build.mjs            # writes dist/ (the site to host)
    node build.mjs --preview  # writes preview/ (opens directly from disk)

- Text for all pages is in `build.mjs`.
- Styles, logo and scripts are in `src/assets/`.
- Original logo files are in `brand/`.

## Hosting

GitHub Pages. The workflow `.github/workflows/pages.yml` builds the site and publishes `dist/` on every push to `main`.

One-time setup on GitHub: Settings → Pages → Source: **GitHub Actions**. Then set the custom domain `datavisiontech.de` and tick **Enforce HTTPS**.

## Before go-live

1. Have Impressum and Datenschutz checked.
2. Set `NOINDEX = false` in `build.mjs`. This removes the trial banner and draft notes and lets search engines index the site.
3. Merge `trial-site` into `main`.
4. At your domain provider, point `datavisiontech.de` to GitHub Pages (A records 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; `www` as CNAME to `datavisiontech.github.io`).
5. Old WordPress addresses (`/about-us/`, `/contacts/`, `/product/dvlca4plm/`) forward to the new pages.
