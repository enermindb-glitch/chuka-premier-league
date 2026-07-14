/* ==========================================================
   auth.js — Google Sign-In (Google Identity Services)
   Loaded on any page that needs to know who's logged in
   (player.html for edit rights; login.html for the button).
   Exposes window.cplAuth with the current ID token / email,
   and window.cplAuth.onReady(cb) to run code once GIS has
   initialized and auto sign-in has been attempted.
   ========================================================== */

window.cplAuth = {
  idToken: null,
  email: null,
  _readyCallbacks: [],
  onReady(cb) {
    if (this._initialized) cb(this);
    else this._readyCallbacks.push(cb);
  }
};

function initGoogleSignIn(buttonElId) {
  if (!window.google || !google.accounts) {
    console.warn('Google Identity Services script not loaded yet.');
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: true
  });

  if (buttonElId) {
    const el = document.getElementById(buttonElId);
    if (el) {
      google.accounts.id.renderButton(el, {
        theme: 'filled_black',
        text: 'signin_with',
        shape: 'rectangular'
      });
    }
  }

  // Attempt silent sign-in if the user has signed in before
  google.accounts.id.prompt();

  window.cplAuth._initialized = true;
  window.cplAuth._readyCallbacks.forEach(cb => cb(window.cplAuth));
  window.cplAuth._readyCallbacks = [];
}

function handleGoogleCredential(response) {
  window.cplAuth.idToken = response.credential;
  window.cplAuth.email = decodeJwtEmail_(response.credential);
  document.dispatchEvent(new CustomEvent('cpl-signed-in', { detail: { email: window.cplAuth.email } }));
}

function signOutOfGoogle() {
  window.cplAuth.idToken = null;
  window.cplAuth.email = null;
  if (window.google && google.accounts) google.accounts.id.disableAutoSelect();
  document.dispatchEvent(new CustomEvent('cpl-signed-out'));
}

/** Decodes just the email out of a JWT without verifying it — verification
 *  happens server-side in code.gs. This is only used to update the UI. */
function decodeJwtEmail_(jwt) {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.email || null;
  } catch (e) {
    return null;
  }
}

// Auto-init once the GIS script has loaded (it's included via a
// <script src="https://accounts.google.com/gsi/client" onload="initGoogleSignIn('gsiButton')">
// tag on each page that needs it — see login.html / player.html).
