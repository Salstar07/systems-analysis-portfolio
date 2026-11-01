# Saalima Barakat — Systems Analysis Portfolio

A static, dependency-free portfolio for systems analysis, Microsoft Power Platform and business applications work. The site retains its original teal/sage visual identity and four case-study URLs.

## Run locally

No package installation or build step is required. With Python 3 installed, run from the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

For checks matching the GitHub Pages project path, serve the checkout's **parent** directory instead. For the cloud checkout at `/workspace/systems-analysis-portfolio`:

```sh
python3 -m http.server 8001 --bind 127.0.0.1 --directory /workspace
```

The test URL then has the path `/systems-analysis-portfolio/`. Check that an occupied port belongs to your own server before stopping it. No secrets or external application services are needed.

## Validate

Python 3 and Node.js are sufficient for the dependency-free checks:

```sh
python3 tests/static-checks.py
```

This checks local links and fragments, metadata, JavaScript syntax and all 14 existing capacity-demo checks.

Browser tests use test-only Playwright, Chromium and optional axe-core. These are not site dependencies. In the prepared cloud environment, Playwright and `/usr/bin/chromium` are already available. To add axe-core outside the checkout:

```sh
npm install --prefix /tmp/portfolio-qa --no-audit --no-fund axe-core@4.10.3
PORTFOLIO_BASE_URL=http://127.0.0.1:8001/systems-analysis-portfolio/ \
AXE_CORE_PATH=/tmp/portfolio-qa/node_modules/axe-core/axe.min.js \
node tests/browser-checks.cjs
```

Elsewhere, install `playwright@1.62.1` alongside axe-core in the external test directory and set `NODE_PATH=/tmp/portfolio-qa/node_modules`. Set `CHROMIUM_PATH` to your Chromium executable, or install Playwright's Chromium and adjust that variable. The suite reports when axe-core is skipped; a passing run without it does not establish accessibility scan coverage.

The browser suite exercises scenarios, validation, filters, keyboard navigation, copy-email success/fallback, no-JavaScript navigation, links, console errors and responsive overflow. It saves screenshots and a JSON report outside the repository under `/tmp/portfolio-qa/results` by default (`QA_OUTPUT_DIR` overrides this).

## Content and publishing

- Keep `.nojekyll` and relative CSS, JavaScript and case-study paths intact for GitHub Pages at `/systems-analysis-portfolio/`.
- Edit `index.html` for professional identity, experience, skills, education and certifications; edit `work/*.html` for case studies. Shared presentation and controls live in `assets/style.css` and `assets/main.js`.
- `assets/capacity-rules.js` is an independent synthetic demonstration, not employer code. Its 14 original checks are unchanged.
- Social metadata uses `assets/og-card.png`; `assets/og-card.svg` remains its editable source. Update both when changing the social artwork.
- Add official credential/profile URLs and a résumé only after the owner supplies them. AB-400 exam completion was confirmed by Saalima; official certification credential verification is pending.
- Keep outcomes within documented scope. Do not add private data, internal source code, unapproved screenshots or unverified metrics.

See [review notes](docs/PORTFOLIO_REVIEW.md) for the audit, content boundaries and confirmation items. Work is on `feature/portfolio-recruiter-refresh`; merging and live publication require the owner's review.
