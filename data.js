/* ==========================================================
   data.js — fetch + parse Google Sheet tabs as CSV
   Every other *.js file calls fetchTab(tabName) to get an array
   of plain objects, keyed by the tab's header row.
   ========================================================== */

/**
 * Fetches a single tab from the Sheet via the gviz CSV endpoint and
 * returns it as an array of objects: [{ Header1: val, Header2: val, ... }]
 */
async function fetchTab(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not load "${tabName}" — check SHEET_ID in config.js and that the sheet is shared as "Anyone with the link".`);
  }
  const csvText = await res.text();
  return parseCsv(csvText);
}

/**
 * Fetches several tabs in parallel. Returns an object keyed by tab name.
 * Usage: const { Teams_A, Fixtures_A } = await fetchTabs(['Teams_A','Fixtures_A']);
 */
async function fetchTabs(tabNames) {
  const results = await Promise.all(tabNames.map(fetchTab));
  const out = {};
  tabNames.forEach((name, i) => { out[name] = results[i]; });
  return out;
}

/**
 * Minimal CSV parser that handles quoted fields (incl. commas and
 * escaped "" quotes inside them), which the gviz export uses for any
 * text field containing a comma (e.g. Bio, Notes).
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && next === '\n') i++;
        row.push(field); field = '';
        if (row.some(v => v !== '')) rows.push(row);
        row = [];
      } else { field += c; }
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
    return obj;
  });
}

/** Small helper: renders a loading/empty state into a container. */
function setStatus(el, text, isEmpty) {
  el.innerHTML = `<div class="${isEmpty ? 'empty' : 'loading'}">${text}</div>`;
}

/** Small helper: escapes text before inserting into innerHTML. */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

/** Reads a query-string param, e.g. getParam('team') for ?team=Eagles */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** POSTs JSON to the Apps Script web app as text/plain (avoids CORS preflight). */
async function postToAppsScript(payload) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  return res.json();
}
