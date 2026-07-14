// ==========================================================
// verify.html logic — QR scan destination.
// Deliberately shows only: photo, name, team, status.
// Nothing else from the player's profile or registration record.
// ==========================================================

async function initVerifyPage() {
  const el = document.getElementById('verifyResult');
  const cplNumber = getParam('cpl');
  if (!cplNumber) {
    el.innerHTML = '<p class="empty">No CPL number provided.</p>';
    return;
  }

  try {
    const [profiles, registrations] = await Promise.all([
      fetchSheet('Player_Profiles'),
      fetchSheet('Player_Registrations'),
    ]);

    const profile = profiles.find(p => p['CPL Number'] === cplNumber);
    const registration = registrations.find(r => r.CPL_Number === cplNumber);

    if (!profile) {
      el.innerHTML = `<p class="empty">No player found for ${escapeHtml(cplNumber)}.</p>`;
      return;
    }

    const status = registration && registration.Status === 'Paid' ? 'Active' : 'Not Cleared';
    const statusClass = status === 'Active' ? 'ok' : 'warn';
    const hasPhoto = profile['Photo URL'] && profile['Photo URL'].trim() !== '';

    el.innerHTML = `
      ${hasPhoto
        ? `<img class="photo" src="${escapeHtml(profile['Photo URL'])}" alt="${escapeHtml(profile.Name)}">`
        : `<div class="avatar-fallback">${escapeHtml((profile.Name||'?').split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase())}</div>`
      }
      <div class="meta">
        <h1>${escapeHtml(profile.Name)}</h1>
        <p>${escapeHtml(profile.Team)}</p>
        <p><span class="pill ${statusClass}">${status}</span></p>
      </div>
    `;
  } catch (err) {
    el.innerHTML = '<p class="empty">Could not verify right now — try again shortly.</p>';
  }
}
document.addEventListener('DOMContentLoaded', initVerifyPage);
