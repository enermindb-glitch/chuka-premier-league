/* ==========================================================
   config.js — shared constants, loaded before every other script
   ========================================================== */

// TODO: replace with your Google Sheet's ID (the long string in its URL:
// https://docs.google.com/spreadsheets/d/{THIS_PART}/edit)
// Sheet must be shared as "Anyone with the link — Viewer" for the
// gviz CSV endpoint used in data.js to work.
const SHEET_ID = '1MFylgUGATs3amgqBmjcbF_m6mz1qtJZURH9FFigo_B8';

// Deployed Apps Script web app (from code.gs) — handles enquiries,
// profile edits, and CPL verify lookups.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHAhDZrEw6ZOCf6htRsFzL8dj1XAI7557VLDfd7z9T4kL8QCAdnovzZT_72tb3Ifg9Bg/exec';

// TODO: replace with your Google OAuth Client ID (from Google Cloud
// Console > Credentials) — used by Google Sign-In on login.html / player.html.
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com';

const LEAGUE_LABELS = { A: 'League A', B: 'League B' };
