// ==========================================================
// CHUKA PREMIER LEAGUE — site config
// Edit the two values below, nothing else in this file.
// ==========================================================

window.CPL_CONFIG = {
  // Your Google Sheet's ID — the long string in its URL between
  // /d/ and /edit, e.g. https://docs.google.com/spreadsheets/d/**THIS_PART**/edit
  // The sheet must be shared as "Anyone with the link — Viewer" for the
  // gviz CSV endpoint below to work (no need to publish each tab individually).
  SHEET_ID: '1Ia_uEy0OHNEryW5eEDjBtDWiHohCoXiGNfzf7-MJKXw',

  // Your deployed Apps Script Web App URL (from backend.gs), used for
  // PIN verification, profile edits, photo uploads, and enquiries.
  API_URL: 'https://script.google.com/macros/s/AKfycbw2lAfwBPYVCTgprfCTvSbKlxqWMIjrIEImGARl7PNGZUbZwYtsGIQwuUNnKemR-D00CQ/exec',

  SEASON_YEAR: 2026,

  // Site name shown in the header/footer on every page.
  SITE_NAME: 'Chuka Premier League',
};
