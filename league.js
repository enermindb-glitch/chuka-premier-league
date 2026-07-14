// ==========================================================
// Shared league-page logic. Each league-X.html page sets
// window.LEAGUE_ID = 'A' or 'B' before loading this file.
// ==========================================================

async function renderStandings() {
  const el = document.getElementById('standingsTable');
  try {
    const rows = await fetchSheet(`Standings_${LEAGUE_ID}`);
    const clean = rows.filter(r => r.Team && r.Team.trim() !== '');
    clean.sort((a, b) => (Number(b.Points) - Number(a.Points)) || (Number(b.GD) - Number(a.GD)));

    if (clean.length === 0) {
      el.innerHTML = '<p class="empty">Standings will appear once fixtures are played.</p>';
      return;
    }

    el.innerHTML = `
      <table class="data">
        <thead><tr>
          <th>#</th><th>Team</th><th class="num">P</th><th class="num">W</th>
          <th class="num">D</th><th class="num">L</th><th class="num">GF</th>
          <th class="num">GA</th><th class="num">GD</th><th class="num">Pts</th>
        </tr></thead>
        <tbody>
          ${clean.map((r, i) => `
            <tr class="${i < 3 ? 'top-row' : ''}">
              <td>${i + 1}</td>
              <td><a href="team.html?team=${encodeURIComponent(r.Team)}">${escapeHtml(r.Team)}</a></td>
              <td class="num">${escapeHtml(r.Played)}</td>
              <td class="num">${escapeHtml(r.W)}</td>
              <td class="num">${escapeHtml(r.D)}</td>
              <td class="num">${escapeHtml(r.L)}</td>
              <td class="num">${escapeHtml(r.GF)}</td>
              <td class="num">${escapeHtml(r.GA)}</td>
              <td class="num">${escapeHtml(r.GD)}</td>
              <td class="num">${escapeHtml(r.Points)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = `<p class="empty">Couldn't load standings right now.</p>`;
  }
}

async function renderFixtures() {
  const el = document.getElementById('fixturesList');
  try {
    const [fixtures, results] = await Promise.all([
      fetchSheet(`Fixtures_${LEAGUE_ID}`),
      fetchSheet(`Results_${LEAGUE_ID}`),
    ]);

    const scoreFor = (home, away, matchday) => {
      const r = results.find(x => x.Home === home && x.Away === away && x.Matchday === matchday);
      return r ? `${r['Home Goals']} - ${r['Away Goals']}` : null;
    };

    const rows = fixtures.filter(f => f.Home && f.Away);
    if (rows.length === 0) {
      el.innerHTML = '<p class="empty">No fixtures scheduled yet.</p>';
      return;
    }

    el.innerHTML = `
      <table class="data">
        <thead><tr>
          <th>MD</th><th>Date</th><th>Home</th><th class="num">Score</th><th>Away</th><th>Venue</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${rows.map(f => {
            const score = scoreFor(f.Home, f.Away, f.Matchday);
            const statusClass = f.Status === 'Played' ? 'ok' : (f.Status === 'Postponed' || f.Status === 'Cancelled' ? 'warn' : 'neutral');
            return `
              <tr>
                <td>${escapeHtml(f.Matchday)}</td>
                <td>${escapeHtml(f.Date)}</td>
                <td><a href="team.html?team=${encodeURIComponent(f.Home)}">${escapeHtml(f.Home)}</a></td>
                <td class="num">${score ? escapeHtml(score) : '—'}</td>
                <td><a href="team.html?team=${encodeURIComponent(f.Away)}">${escapeHtml(f.Away)}</a></td>
                <td>${escapeHtml(f.Venue)}</td>
                <td><span class="pill ${statusClass}">${escapeHtml(f.Status)}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = `<p class="empty">Couldn't load fixtures right now.</p>`;
  }
}

async function renderTopScorers() {
  const el = document.getElementById('topScorersList');
  try {
    const stats = await fetchSheet(`PlayerStats_${LEAGUE_ID}`);
    const ranked = stats
      .filter(s => s.Player)
      .sort((a, b) => Number(b.Goals) - Number(a.Goals))
      .slice(0, 10);

    if (ranked.length === 0) {
      el.innerHTML = '<p class="empty">No stats recorded yet.</p>';
      return;
    }

    el.innerHTML = `
      <table class="data">
        <thead><tr><th>#</th><th>Player</th><th>Team</th><th class="num">Goals</th><th class="num">Assists</th></tr></thead>
        <tbody>
          ${ranked.map((s, i) => `
            <tr class="${i < 3 ? 'top-row' : ''}">
              <td>${i + 1}</td>
              <td>${escapeHtml(s.Player)}</td>
              <td><a href="team.html?team=${encodeURIComponent(s.Team)}">${escapeHtml(s.Team)}</a></td>
              <td class="num">${escapeHtml(s.Goals)}</td>
              <td class="num">${escapeHtml(s.Assists)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = `<p class="empty">Couldn't load top scorers right now.</p>`;
  }
}

function initLeaguePage() {
  renderStandings();
  renderFixtures();
  renderTopScorers();
}
document.addEventListener('DOMContentLoaded', initLeaguePage);
