// ==========================================================
// player.html logic — reads ?id=CPL-NUMBER, renders the public
// profile + stats. Editing lives in editProfile.js, card
// generation lives in card.js.
// ==========================================================

let currentProfile = null; // populated on load, reused by editProfile.js / card.js

async function findPlayerStats(cplNumber, teamName) {
  for (const league of ['A', 'B']) {
    const stats = await fetchSheet(`PlayerStats_${league}`);
    const row = stats.find(s => s.Team === teamName);
    if (row) {
      const playerStats = stats.filter(s => s.Team === teamName)
        .find(s => s.Player === currentProfile.Name);
      if (playerStats) return playerStats;
    }
  }
  return null;
}

function renderPlayerHeader(profile) {
  const el = document.getElementById('playerHeader');
  const hasPhoto = profile['Photo URL'] && profile['Photo URL'].trim() !== '';
  el.innerHTML = `
    ${hasPhoto
      ? `<img class="photo" src="${escapeHtml(profile['Photo URL'])}" alt="${escapeHtml(profile.Name)}">`
      : `<div class="avatar-fallback">${escapeHtml((profile.Name || '?').split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase())}</div>`
    }
    <div class="meta">
      <span class="eyebrow">${escapeHtml(profile.Position || 'Position TBC')}</span>
      <h1>${escapeHtml(profile.Name)}</h1>
      <p><a href="team.html?team=${encodeURIComponent(profile.Team)}">${escapeHtml(profile.Team)}</a> &middot; League ${escapeHtml(profile.League)}</p>
      <p class="cpl-number">${escapeHtml(profile['CPL Number'])}</p>
    </div>
  `;
  document.title = `${profile.Name} — Chuka Premier League`;
}

function renderPlayerBio(profile) {
  const el = document.getElementById('playerBio');
  el.innerHTML = profile.Bio
    ? `<p>${escapeHtml(profile.Bio)}</p>`
    : `<p class="empty">No bio added yet.</p>`;
}

async function renderPlayerStats(profile) {
  const el = document.getElementById('playerStats');
  try {
    const stats = await fetchSheet(`PlayerStats_${profile.League}`);
    const row = stats.find(s => s.Player === profile.Name && s.Team === profile.Team);
    if (!row) { el.innerHTML = '<p class="empty">No stats recorded yet.</p>'; return; }
    el.innerHTML = `
      <table class="data">
        <thead><tr><th class="num">Goals</th><th class="num">Assists</th><th class="num">Yellow</th><th class="num">Red</th></tr></thead>
        <tbody><tr>
          <td class="num">${escapeHtml(row.Goals)}</td>
          <td class="num">${escapeHtml(row.Assists)}</td>
          <td class="num">${escapeHtml(row.Yellow)}</td>
          <td class="num">${escapeHtml(row.Red)}</td>
        </tr></tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = '<p class="empty">Couldn\'t load stats right now.</p>';
  }
}

async function initPlayerPage() {
  const cplNumber = getParam('id');
  const header = document.getElementById('playerHeader');
  if (!cplNumber) {
    header.innerHTML = '<p class="empty">No player specified.</p>';
    return;
  }

  const profiles = await fetchSheet('Player_Profiles');
  const profile = profiles.find(p => p['CPL Number'] === cplNumber);
  if (!profile) {
    header.innerHTML = `<p class="empty">Player "${escapeHtml(cplNumber)}" not found.</p>`;
    return;
  }

  currentProfile = profile;
  renderPlayerHeader(profile);
  renderPlayerBio(profile);
  renderPlayerStats(profile);

  // Let editProfile.js / card.js know the profile is ready.
  document.dispatchEvent(new CustomEvent('cpl:profileLoaded', { detail: profile }));
}
document.addEventListener('DOMContentLoaded', initPlayerPage);
