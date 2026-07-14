// ==========================================================
// CHUKA PREMIER LEAGUE — shared data helpers
// Loaded by every page after config.js.
// ==========================================================

const CPL = window.CPL_CONFIG;

/** Build the CSV export URL for a given Sheet tab name. */
function sheetCsvUrl(tabName) {
  return `https://docs.google.com/spreadsheets/d/${CPL.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

/** Minimal in-memory cache so a page doesn't re-fetch the same tab twice. */
const _sheetCache = {};

/** Fetch a Sheet tab and return an array of row objects keyed by header. */
async function fetchSheet(tabName, { forceRefresh = false } = {}) {
  if (!forceRefresh && _sheetCache[tabName]) return _sheetCache[tabName];
  const res = await fetch(sheetCsvUrl(tabName));
  if (!res.ok) throw new Error(`Could not load "${tabName}" (HTTP ${res.status})`);
  const text = await res.text();
  const rows = parseCSV(text);
  _sheetCache[tabName] = rows;
  return rows;
}

/** Simple, quote-aware CSV parser (handles commas/newlines inside quoted fields). */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c === '\r') {
      // skip, \n handles the line break
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  if (rows.length === 0) return [];
  const headers = rows.shift().map(h => h.trim());
  return rows
    .filter(r => r.some(cell => cell !== ''))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (r[i] ?? '').trim(); });
      return obj;
    });
}

/** Call the Apps Script backend (backend.gs doPost). */
async function callApi(action, payload = {}) {
  const res = await fetch(CPL.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on Apps Script
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

/** Read a query-string param, e.g. getParam('team') for team.html?team=Foo */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Strip the data-URL prefix ("data:image/jpeg;base64,") before sending to Apps Script. */
function stripBase64Prefix(dataUrl) {
  const comma = dataUrl.indexOf(',');
  return comma === -1 ? dataUrl : dataUrl.substring(comma + 1);
}

/** Escape text before inserting into innerHTML, to avoid Sheet content breaking layout / injecting HTML. */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
