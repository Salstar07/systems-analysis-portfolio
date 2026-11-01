# Portfolio refresh — review notes

## Repository audit

Reviewed `index.html`, the complete shared stylesheet and scripts, all four `work/` pages, `.nojekyll`, robots directives and the existing social artwork before implementation.

The original site's strengths were its teal/sage palette, editorial typography, relative static-site paths, clearly scoped case-study statuses and independent capacity demonstration. Working features included a mobile disclosure menu, four project filters, copy-email feedback, three availability scenarios, half-hour validation and 14 embedded rule checks. The demo loads `capacity-rules.js` before `main.js`; neither script depends on a framework or network service.

Recruiter-facing gaps were a professional identity spread across sections, no dedicated experience or certification section, compressed case narratives, and limited mobile case navigation. Small secondary labels had contrast problems; copy-email fallback did not select the address; mobile navigation was unavailable without JavaScript. Existing social image URLs were relative SVG paths, which some social crawlers do not support.

The site repeated generic headings and evidence caveats across the four cases. The refresh replaces generic narrative with project-specific objectives, requirements, technical approaches and trade-offs while retaining the actual limits on outcomes. Original source materials and employer test reports were not independently supplied or reviewed in this task. Existing repository accounts and the owner's statements are the content basis, not independent verification of internal project results.

## Additional CivilSE applications and automation

The portfolio now covers seven projects. The original four remain featured, followed by **More Systems & Automation Projects** with Employee Check-In, Teams Content Archiving & PowerShell Automation, and Vehicle Booking cards. The experience and skills sections include the owner-confirmed Canvas application and PowerShell work.

All seven case studies use Business Problem → My Contribution → Requirements → Solution Design → Implementation → Testing → Evidence → Outcomes → Limitations. Claim-specific Verified, Documented, Illustrative and Pending verification badges include their supporting basis. Existing internal-result accounts remain described as documented reports, not independently reviewed test records.

The three new pages include dedicated evidence checklists. [The consolidated checklist](CIVILSE_EVIDENCE_CHECKLISTS.md) identifies approved requirements, sanitised technical artifacts, execution evidence, validation and acceptance records needed for stronger claims. In particular:

- Check-in: owner confirmation supports successful SharePoint logging and Teams notifications after connection-reference corrections within reported tests. Submission, flow execution and delivery remain separate outcomes. Offline/location/weather/navigation and broad reliability claims are unverified.
- Teams archiving: PowerShell work is owner-confirmed. Actual scope, APIs/modules, original scripts, logs, archive structure, completeness and compliance are not supplied or inferred.
- Vehicle booking: Canvas design/development and business purpose are owner-confirmed. Sources/connectors, booking rules, approval/conflict/notification features and deployment remain pending. The vehicle/reservation illustration is synthetic.

## Changes for review

- Retained the visual identity, four case-study routes, static hosting structure and original capacity-rule implementation.
- Clarified the role, CivilSE context and target cities; added dedicated CivilSE and Curtin Connect experience, grouped skills, education, Microsoft certification cards and separate applied professional development.
- Expanded each case to cover the business problem, objectives, personal contribution, requirements, technical approach, trade-offs, testing, outcomes, limitations and demonstrated skills. Added conceptual flows, evidence tables and desktop/mobile section navigation.
- Improved focus handling, live filter announcements, input errors, keyboard-scrollable tables, copy-email selection fallback and no-JavaScript access to navigation and contact information.
- Corrected small-text contrast, replaced potentially missing icon glyphs with inline SVG, and preserved reduced-motion support.
- Added project-path canonical, Open Graph and Twitter metadata, a 1200×630 PNG social image, and homepage Person structured data without invented profile URLs.
- Added repeatable static and browser checks and documented local development without adding site dependencies.

## Credential and evidence boundaries

PL-900 is shown as completed based on the owner's supplied status. During this task Saalima also confirmed completion of AB-400. Its card prominently records **Exam completed**, names the supplied Power Platform Developer Associate certification pathway and exam, and explicitly says that the official certification credential is pending verification. No Microsoft Learn personal credential URL was supplied. Official current exam naming could not be independently checked because access to `learn.microsoft.com` was blocked by the environment policy.

AB-410 is omitted because no examination result was confirmed. No specific LinkedIn Learning, Udemy or other course certificates were supplied, so none are invented. The professional-development section instead describes applied learning evident in the project work. SQL proficiency was not added without supporting context. No résumé download or LinkedIn profile link is fabricated.

No employment dates, numeric service improvements, predictive accuracy, retention improvements, financial savings or organisation-wide security guarantees were added. CivilSE planner work remains development/UAT; Key Vault remains a sandbox assessment with an adoption-direction decision, not a production deployment claim; Bitwarden remains a bounded pilot with recovery/revocation exclusions; the Curtin project remains academic.

## Confirmation items

These are future content additions or stronger claims, not prerequisites for using the refreshed site:

- Official PL-900 and AB-400 Microsoft Learn credential URLs, award details and permission to link them; confirmed AB-410 result if it should be included.
- A valid LinkedIn profile URL, actual current résumé file, and exact course-completion titles/issuers/credential links.
- Employment dates if desired, and documentary evidence before publishing the previously reported 20%/10% service improvements.
- Current planner deployment/UAT status and acceptance results before changing its status.
- Any newly approved employer artifacts, screenshots or test excerpts before sharing them publicly. This change uses independent illustrations and synthetic data only.
- Original academic model method/evaluation evidence before making stronger predictive-analytics claims.

## Technical validation

Validation completed on 1 November 2026 with Python 3.12.14, Node.js 24.19.0, Playwright 1.62.1, system Chromium and axe-core 4.10.3:

- All 14 existing capacity-rule checks passed in Node and Chromium; all three scenarios, valid boundary/half-hour input, invalid input recovery and the public test button passed.
- Keyboard project filtering, mobile menu focus/dismissal/resize behaviour, clipboard success/denied/unavailable paths and no-JavaScript mobile navigation passed.
- All eight pages loaded under `/systems-analysis-portfolio/`. Static checks validated 292 local references; browser checks validated 103 unique link/asset/fragment URLs.
- No document overflow across all eight pages at widths 320, 375, 540, 768, 800, 1024, 1280, 1440 and 1920px. Desktop/mobile screenshots were captured and visually inspected.
- Sixteen axe scans (eight pages × desktop/mobile) reported zero automated WCAG A/AA violations. Manual contrast checks covered representative text in gradient panels and tables; axe retains incomplete contrast items for some decorative and scrolled content.
- A focused vehicle-illustration recheck at 320, 375, 768 and 1440px confirmed all three columns fit without horizontal scrolling after the mobile table refinement; four additional axe scans passed.
- All three additional homepage cards work by keyboard, remain visible during featured filtering, and link to dedicated checklists. All seven mobile case-study contents menus were exercised by keyboard.
- No browser console errors or uncaught exceptions. JavaScript syntax and `git diff --check` passed.

`python3 tests/static-checks.py` checks all eight pages and their local references, GitHub Pages metadata, JavaScript syntax and the original 14 rules. `tests/browser-checks.cjs` checks the interactive flows and responsive behaviour with Chromium, and runs axe-core when available.

Automated accessibility scans and visual inspection do not establish full WCAG conformance. Human screen-reader review, real device/browser testing, delivery through a configured email client and third-party social-cache rendering remain outside automated coverage. The site uses `mailto:` plus a selectable/copyable address, not a contact-form backend.

## GitHub delivery

Use the feature branch and a pull request targeting `main`. This task does not authorise merging or deploying the site. The environment currently blocks GitHub API access required for PR creation; `api.github.com` and `learn.microsoft.com` were added to the environment configuration draft without removing other configured destinations. Saving that draft does not by itself establish runtime access or publish the website.
