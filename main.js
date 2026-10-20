'use strict';
/* Site controls for a static recruiter portfolio. No network calls, cookies or tracking. */
(function () {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const opening = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(opening));
      menu.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', opening);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-label','Open navigation');
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded','false');
        menu.setAttribute('aria-label','Open navigation');
      }
    });
  }
  const buttons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.project-card[data-category]'));
  buttons.forEach(btn => btn.addEventListener('click', () => {
    const type = btn.dataset.filter;
    buttons.forEach(b => {
      const selected = b === btn;
      b.classList.toggle('active', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    cards.forEach(card => { card.hidden = type !== 'all' && card.dataset.category !== type; });
  }));
  const copy = document.querySelector('[data-copy]');
  const copyStatus = document.getElementById('copy-status');
  if (copy && copyStatus) {
    copy.addEventListener('click', async () => {
      const email = copy.dataset.copy;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          copyStatus.textContent = 'Email copied.';
        } else {
          // The mailto link immediately above remains a functional no-permissions fallback.
          copyStatus.textContent = 'Select and copy the email shown below.';
        }
      } catch (_) {
        copyStatus.textContent = 'Select and copy the email shown below.';
      }
    });
  }
  if (!window.CapacityDemo) return;
  const { analyseRows, fixture, runChecks } = window.CapacityDemo;
  const scenarios = document.querySelectorAll('[data-scenario]');
  const input = document.getElementById('scheduled');
  const tbody = document.getElementById('demo-rows');
  const error = document.getElementById('input-error');
  const output = document.getElementById('demo-output');
  if (!input || !tbody || !output || !error) return;
  let active = 'missing';
  const money = n => Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  const hour = n => money(n) + ' h';
  function cell(tr, content, className = '') {
    const td = document.createElement('td');
    td.textContent = content;
    if (className) td.className = className;
    tr.appendChild(td);
  }
  function render() {
    const n = Number(input.value);
    const valid = input.value.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 80 && Number.isInteger(n * 2);
    if (!valid) {
      error.hidden = false;
      error.textContent = 'Enter a number from 0 to 80 in half-hour increments.';
      output.hidden = true;
      return;
    }
    error.hidden = true; error.textContent = ''; output.hidden = false;
    let result;
    try { result = analyseRows(fixture(active, n)); }
    catch (e) { error.textContent = 'Unable to calculate the example: ' + e.message; error.hidden = false; output.hidden = true; return; }
    tbody.replaceChildren();
    result.rows.forEach(row => {
      const tr = document.createElement('tr');
      cell(tr,row.label);
      cell(tr,row.available === null ? 'Not recorded' : hour(row.available));
      cell(tr,hour(row.scheduled));
      cell(tr,row.balance === null ? 'Unknown' : (row.balance >= 0 ? '+' : '') + hour(row.balance), row.balance === null ? 'table-warning' : row.balance < 0 ? 'table-negative' : '');
      tbody.appendChild(tr);
    });
    document.getElementById('coverage').textContent = result.known + ' / ' + result.total;
    document.getElementById('known-net').textContent = (result.knownBalance >= 0 ? '+' : '') + hour(result.knownBalance);
    document.getElementById('total-net').textContent = result.totalBalance === null ? 'Not established' : (result.totalBalance >= 0 ? '+' : '') + hour(result.totalBalance);
    document.getElementById('net-note').textContent = result.unknown ? 'An organisation-wide figure would imply evidence we do not have.' : 'All three records have a known availability value.';
    const warning = ' Analyst B is 5 h over the demonstrated availability even if the aggregate looks positive.';
    document.getElementById('conclusion').textContent = result.unknown
      ? 'Analyst C has '+hour(n)+' scheduled and unknown availability; do not invent a zero or full total.' + warning
      : active === 'zero' ? 'Analyst C has a confirmed 0 h available with '+hour(n)+' scheduled.'+ warning
      : 'A full aggregate is established from known values. Individual overloads still require review.';
  }
  scenarios.forEach(btn => btn.addEventListener('click', () => {
    active = btn.dataset.scenario;
    scenarios.forEach(b => { const isCurrent = b === btn; b.classList.toggle('selected',isCurrent); b.setAttribute('aria-pressed',String(isCurrent)); });
    render();
  }));
  input.addEventListener('input',render);
  const run = document.getElementById('run-tests');
  if (run) run.addEventListener('click',() => {
    const rows = runChecks(), passed = rows.filter(x => x.passed).length;
    const text = document.getElementById('test-result');
    const details = document.getElementById('test-details');
    const list = document.getElementById('test-list');
    text.textContent = passed + ' / ' + rows.length + ' example checks passed' + (passed === rows.length ? '.' : ' — review failures.');
    list.replaceChildren();
    rows.forEach(x => { const li = document.createElement('li'); li.textContent = (x.passed?'PASS — ':'FAIL — ') + x.name + (x.error?' · '+x.error:''); list.appendChild(li); });
    details.hidden = false;
  });
  render();
})();
