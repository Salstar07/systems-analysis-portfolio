'use strict';
// Test-only tooling. Install Playwright and axe-core outside the static site.
// Serve /workspace on port 8000, then run:
// NODE_PATH=/path/to/test/node_modules node tests/browser-checks.cjs
// Optional: PORTFOLIO_BASE_URL, CHROMIUM_PATH, AXE_CORE_PATH, QA_OUTPUT_DIR.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:8000/systems-analysis-portfolio/';
const output = process.env.QA_OUTPUT_DIR || '/tmp/portfolio-qa/results';
const routes = ['', 'work/resource-planning.html', 'work/azure-key-vault.html', 'work/credential-governance.html', 'work/student-risk.html'];
let axePath = process.env.AXE_CORE_PATH;
if (!axePath) { try { axePath = require.resolve('axe-core/axe.min.js'); } catch {} }
const results = { base, browser: 'Chromium', passed: [], accessibility: [], errors: [] };
const passed = name => { results.passed.push(name); console.log('PASS ' + name); };
const text = async (page, selector) => (await page.locator(selector).innerText()).trim();
async function assertText(page, selector, expected) {
  assert.equal(await text(page, selector), expected, selector);
}
async function checkA11y(page, name) {
  if (!axePath) return;
  await page.addScriptTag({ path: axePath });
  const report = await page.evaluate(async () => {
    const { violations, incomplete } = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }
    });
    const clean = v => ({ id: v.id, impact: v.impact, description: v.description,
      nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) });
    return { violations: violations.map(clean), incomplete: incomplete.map(clean) };
  });
  results.accessibility.push({ name, ...report });
  if (report.violations.length) console.log('ACCESSIBILITY ' + name + ': ' + JSON.stringify(report.violations));
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => results.errors.push(String(error)));
    page.on('console', msg => { if (msg.type() === 'error') results.errors.push(msg.text()); });
    const response = await page.goto(base);
    assert.equal(response.status(), 200);
    const checks = await page.evaluate(() => window.CapacityDemo.runChecks());
    assert.equal(checks.length, 14);
    assert.ok(checks.every(c => c.passed), JSON.stringify(checks));
    passed('14 existing capacity rules execute and pass in the browser');

    // Verify both DOM updates and accessible pressed state for each fixture.
    for (const [scenario, coverage, net, balance] of [
      ['missing', '2 / 3', 'Not established', 'Unknown'],
      ['complete', '3 / 3', '+27 h', '+16 h'],
      ['zero', '3 / 3', '+3 h', '-8 h']
    ]) {
      await page.locator(`[data-scenario="${scenario}"]`).click();
      await assertText(page, '#coverage', coverage);
      await assertText(page, '#total-net', net);
      assert.equal(await page.locator('#demo-rows tr').nth(2).locator('td').last().textContent(), balance);
      assert.equal(await page.locator(`[data-scenario="${scenario}"]`).getAttribute('aria-pressed'), 'true');
    }
    passed('all three scenarios preserve unknown versus confirmed zero and reconcile balances');
    const scheduled = page.locator('#scheduled');
    await page.locator('[data-scenario="complete"]').click();
    for (const [value, net] of [['0', '+35 h'], ['0.5', '+34.5 h'], ['80', '-45 h']]) {
      await scheduled.fill(value);
      await assertText(page, '#total-net', net);
      assert.equal(await scheduled.getAttribute('aria-invalid'), 'false');
      assert.ok(await page.locator('#demo-output').isVisible());
    }
    for (const value of ['', '-1', '80.5', '1.25']) {
      await scheduled.fill(value);
      assert.equal(await scheduled.getAttribute('aria-invalid'), 'true');
      assert.ok(await page.locator('#input-error').isVisible());
      assert.ok(await page.locator('#demo-output').isHidden());
    }
    await scheduled.fill('8');
    assert.equal(await scheduled.getAttribute('aria-invalid'), 'false');
    assert.ok(await page.locator('#input-error').isHidden());
    await page.locator('[data-scenario="missing"]').focus();
    await page.keyboard.press('Enter');
    await assertText(page, '#total-net', 'Not established');
    await page.locator('[data-scenario="zero"]').focus();
    await page.keyboard.press('Space');
    await assertText(page, '#total-net', '+3 h');
    passed('valid boundaries and half-hours, invalid input recovery, Enter and Space scenario controls');
    await page.locator('#run-tests').click();
    await assertText(page, '#test-result', '14 / 14 example checks passed.');
    await page.locator('#test-details summary').click();
    assert.equal(await page.locator('#test-list li').count(), 14);
    assert.ok((await page.locator('#test-list li').allTextContents()).every(t => t.startsWith('PASS')));
    passed('the public Run 14 checks control displays each executed result');

    for (const [category, count] of [['systems', 1], ['security', 2], ['data', 1], ['all', 4]]) {
      const filter = page.locator(`[data-filter="${category}"]`);
      await filter.focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.project-card:visible').count(), count);
      assert.equal(await filter.getAttribute('aria-pressed'), 'true');
      assert.match(await text(page, '#filter-status'), new RegExp('^' + count + ' case'));
    }
    passed('all four project filters work by keyboard and announce results');

    // Stub the browser permission boundary to cover success and rejection deterministically.
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async value => { window.__copiedEmail = value; }
      }});
    });
    await page.locator('[data-copy]').click();
    await assertText(page, '#copy-status', 'Email copied.');
    assert.equal(await page.evaluate(() => window.__copiedEmail), '0719saalima@gmail.com');
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); }; });
    await page.locator('[data-copy]').click();
    const selected = await page.locator('#contact-email').evaluate(input => ({ value: input.value,
      selected: input.value.slice(input.selectionStart, input.selectionEnd), focused: document.activeElement === input }));
    assert.equal(selected.selected, '0719saalima@gmail.com');
    assert.ok(selected.focused);
    assert.match(await text(page, '#copy-status'), /Email selected/);
    await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }); });
    await page.locator('[data-copy]').click();
    assert.match(await text(page, '#copy-status'), /Email selected/);
    assert.match(await page.locator('a[href^="mailto:"]').first().getAttribute('href'), /^mailto:0719saalima@gmail\.com\?subject=/);
    passed('clipboard success, permission denial, unsupported clipboard and selectable email fallback');

    await page.setViewportSize({ width: 375, height: 812 });
    const menu = page.locator('.menu-toggle');
    const nav = page.locator('#site-nav');
    await menu.focus();
    await page.keyboard.press('Enter');
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    assert.ok(await nav.isVisible());
    await page.keyboard.press('Tab');
    assert.ok(await nav.locator('a').first().evaluate(a => document.activeElement === a));
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    assert.ok(await menu.evaluate(button => document.activeElement === button));
    await menu.click();
    await nav.locator('a').first().click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    await menu.click();
    await page.mouse.click(5, 780);
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    await menu.click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false');
    await page.setViewportSize({ width: 375, height: 812 });
    assert.ok(await nav.isHidden());
    passed('mobile disclosure menu: Enter, Tab, Escape focus return, link/outside dismissal and resize reset');

    const checkedLinks = new Set();
    for (const route of routes) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const routeResponse = await page.goto(new URL(route, base).href);
      assert.equal(routeResponse.status(), 200, route);
      assert.equal(await page.locator('h1').count(), 1, route);
      assert.ok(await page.locator('h1').isVisible());
      const references = await page.locator('a[href], link[href], script[src], img[src]').evaluateAll(els => els.map(el => ({
        url: new URL(el.getAttribute('href') || el.getAttribute('src'), location.href).href,
        tag: el.tagName
      })));
      for (const { url } of references) {
        const target = new URL(url);
        if (target.origin !== new URL(base).origin || checkedLinks.has(url)) continue;
        assert.ok(target.pathname.startsWith(new URL(base).pathname), 'Reference escapes project base: ' + url);
        const res = await context.request.get(url);
        assert.equal(res.status(), 200, url);
        if (target.hash) {
          const html = await res.text();
          const fragment = decodeURIComponent(target.hash.slice(1));
          assert.ok(await page.evaluate(({ html, fragment }) => {
            return !!new DOMParser().parseFromString(html, 'text/html').getElementById(fragment);
          }, { html, fragment }), 'Missing fragment: ' + url);
        }
        checkedLinks.add(url);
      }
      await checkA11y(page, (route || 'home') + ' desktop');
      const stem = route ? path.basename(route, '.html') : 'home';
      await page.screenshot({ path: path.join(output, stem + '-desktop.png'), fullPage: true });
      if (!route) await page.screenshot({ path: path.join(output, 'home-desktop-viewport.png') });
      for (const width of [320, 375, 540, 768, 800, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        const dimensions = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
        assert.ok(dimensions.document <= dimensions.viewport + 1, route + ' overflows at ' + width + ': ' + JSON.stringify(dimensions));
      }
      await page.setViewportSize({ width: 375, height: 812 });
      await checkA11y(page, (route || 'home') + ' mobile');
      await page.screenshot({ path: path.join(output, stem + '-mobile.png'), fullPage: true });
      if (!route) {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(output, 'home-mobile-viewport.png') });
      } else {
        const contents = page.locator('.case-mobile-toc summary');
        await contents.focus();
        await page.keyboard.press('Enter');
        assert.ok(await page.locator('.case-mobile-toc nav').isVisible(), route + ' mobile contents');
        await page.keyboard.press('Tab');
        assert.ok(await page.locator('.case-mobile-toc nav a').first().evaluate(a => document.activeElement === a));
      }
    }
    passed('all five pages load at the GitHub Pages base path; ' + checkedLinks.size + ' local links/assets/fragments verified');
    passed('all five pages have no document overflow at nine widths from 320 to 1920 pixels; desktop/mobile screenshots saved');
    if (axePath) {
      assert.ok(results.accessibility.every(r => r.violations.length === 0), 'Accessibility violations remain; inspect results.json');
      passed('axe WCAG 2 A/AA, 2.1 A/AA and 2.2 AA: zero automated violations across five pages at desktop and mobile');
    }
    else console.log('SKIP axe-core unavailable; set AXE_CORE_PATH or install it in test tooling');
    assert.deepEqual(results.errors, [], 'Browser errors: ' + results.errors.join('\n'));
    passed('no browser console errors or uncaught exceptions');
    await context.close();
    const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const noJs = await noJsContext.newPage();
    await noJs.goto(base);
    assert.ok(await noJs.locator('#site-nav').isVisible());
    assert.ok(await noJs.locator('.menu-toggle').isHidden());
    for (const link of await noJs.locator('#site-nav a').all()) assert.ok(await link.isVisible());
    await noJs.locator('#site-nav a').first().click();
    assert.match(noJs.url(), /#work$/);
    assert.ok(await noJs.locator('.no-script-note').isVisible());
    await noJs.screenshot({ path: path.join(output, 'home-no-javascript-mobile.png'), fullPage: true });
    passed('navigation remains functional on mobile without JavaScript; demo explains its requirement');
    await noJsContext.close();
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
