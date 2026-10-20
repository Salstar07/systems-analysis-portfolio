/* Independent portfolio demonstration, created with AI assistance.
 * These rules and fixtures are NOT CivilSE source code or production logic.
 * null availability means unknown; zero means confirmed no availability.
 * Hours are converted to integer minutes to avoid decimal drift.
 */
(function (root) {
  'use strict';
  function minutes(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new TypeError(label + ' must be a finite, non-negative number.');
    }
    const result = Math.round(value * 60);
    if (Math.abs(value * 60 - result) > 0.000001) {
      throw new RangeError(label + ' must resolve to whole minutes.');
    }
    if (!Number.isSafeInteger(result)) throw new RangeError(label + ' is too large.');
    return result;
  }
  function analyseRows(rows) {
    if (!Array.isArray(rows) || rows.length === 0) throw new TypeError('Supply at least one row.');
    const ids = new Set();
    let known = 0, unknown = 0, available = 0, scheduledKnown = 0, scheduledUnknown = 0;
    const analysed = rows.map(function (r) {
      if (!r || typeof r.id !== 'string' || !r.id.trim() || ids.has(r.id)) {
        throw new TypeError('Each row needs a unique, non-empty ID.');
      }
      ids.add(r.id);
      const s = minutes(r.scheduled, 'Scheduled hours');
      if (r.available === null) {
        unknown++; scheduledUnknown += s;
        return {...r, status: 'unknown', balance: null};
      }
      const a = minutes(r.available, 'Available hours');
      known++; available += a; scheduledKnown += s;
      const b = a - s;
      return {...r, balance: b / 60, status: b < 0 ? 'over' : b === 0 ? 'full' : 'within'};
    });
    return {rows: analysed, known, unknown, total: rows.length,
      available: available / 60,
      scheduledKnown: scheduledKnown / 60,
      scheduledUnknown: scheduledUnknown / 60,
      scheduledTotal: (scheduledKnown + scheduledUnknown) / 60,
      knownBalance: (available - scheduledKnown) / 60,
      totalBalance: unknown ? null : (available - scheduledKnown) / 60};
  }
  function fixture(scenario, scheduled) {
    const values = {missing: null, complete: 24, zero: 0};
    if (!Object.prototype.hasOwnProperty.call(values, scenario)) throw new TypeError('Unknown scenario.');
    return [
      {id: 'DEMO-01', label: 'Analyst A', available: 38, scheduled: 22},
      {id: 'DEMO-02', label: 'Analyst B', available: 30, scheduled: 35},
      {id: 'DEMO-03', label: 'Analyst C', available: values[scenario], scheduled: scheduled}
    ];
  }
  const checks = [
    ['Missing availability remains unknown', () => analyseRows(fixture('missing', 8)).rows[2].balance === null],
    ['Incomplete data prevents a total capacity claim', () => analyseRows(fixture('missing', 8)).totalBalance === null],
    ['Known-row balance is separately reconciled', () => analyseRows(fixture('missing', 8)).knownBalance === 11],
    ['Scheduled work on the unknown row stays visible', () => analyseRows(fixture('missing', 8)).scheduledUnknown === 8],
    ['Known overloaded row stays flagged', () => analyseRows(fixture('missing', 8)).rows[1].balance === -5],
    ['Complete scenario has a 27-hour net balance', () => analyseRows(fixture('complete', 8)).totalBalance === 27],
    ['Confirmed zero is not treated as missing', () => analyseRows(fixture('zero', 8)).rows[2].balance === -8],
    ['Zero scenario still counts all rows', () => analyseRows(fixture('zero', 8)).known === 3],
    ['Confirmed zero and no work is fully allocated', () => analyseRows([{id:'a',available:0,scheduled:0}]).rows[0].status === 'full'],
    ['Decimal hours reconcile through integer minutes', () => analyseRows([{id:'a',available:7.6,scheduled:0.1}]).totalBalance === 7.5],
    ['Negative hours are rejected', () => {try {analyseRows(fixture('missing',-1)); return false;} catch {return true;}}],
    ['Duplicate identifiers are rejected', () => {try {analyseRows([{id:'a',available:1,scheduled:0},{id:'a',available:1,scheduled:0}]); return false;} catch {return true;}}],
    ['Non-finite hours are rejected', () => {try {analyseRows(fixture('complete',NaN)); return false;} catch {return true;}}],
    ['An empty dataset is not a successful zero result', () => {try {analyseRows([]); return false;} catch {return true;}}]
  ];
  function runChecks() {return checks.map(([name, fn]) => {try {return {name, passed: fn() === true};} catch (error) {return {name, passed: false, error: error.message};}});}
  const api = {analyseRows, fixture, runChecks};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CapacityDemo = api;
})(typeof window !== 'undefined' ? window : globalThis);
