// ==========================================================
// team.html logic — reads ?team=NAME and renders that team's
// header, current standing, squad, fixtures, and top scorer.
// ==========================================================

async function findTeamAcrossLeagues(teamName) {
  for (const league of ['A', 'B']) {
    const teams = await fetchSheet(`Teams_${league}`);
    const match = teams.find(t => t.Name === teamName);
    if (match) return { league, team: match };
  }
  return null;
}

async function renderTeamHeader(league, team) {
  const el = document.getElementById('teamHeader');
  el.innerHTML = `
    <img class="thumb" style="width:72px;height:72px;" src="${escapeHtml(team['Logo URL'])}" alt="${escapeHtml(team.Name)} logo" onerror="this.style.display='none'">
    <div>
      <span class="eyebrow">League ${league}</span>
      <h1>${escapeHtml(team.Name)}</h1>
      <p>${escapeHtml(team.Ground)} &middot; Coach: ${escapeHtml(team.Coach)}</p>
      ${team.Bio ? `<p>${escapeHtml(team.Bio)}</p>` : ''}
    </div>
  `;
  document.title = `${team.Name} — Chuka Premier League`;
}

async function renderTeamStanding(league, teamName) {
  const el = document.getElementById('teamStanding');
  const standings = await fetchSheet(`Standings_${league}`);
  const row = standings.find(s => s.Team === teamName);
  if (!row) { el.innerHTML = '<p class="empty">No standing yet.</p>'; return; }
  el.innerHTML = `
    <table class="data">
      <thead><tr><th class="num">P</th><th class="num">W</th><th class="num">D</th><th class="num">L</th><th class="num">GF</th><th class="num">GA</th><th class="num">GD</th><th class="num">Pts</th></tr></thead>
      <tbody><tr>
        <td class="num">${escapeHtml(row.Played)}</td><td class="num">${escapeHtml(row.W)}</td>
        <td class="num">${escapeHtml(row.D)}</td><td class="num">${escapeHtml(row.L)}</td>
        <td class="num">${escapeHtml(row.GF)}</td><td class="num">${escapeHtml(row.GA)}</td>
        <td class="num">${escapeHtml(row.GD)}</td><td class="num">${escapeHtml(row.Points)}</td>
      </tr></tbody>
    </table>
  `;
}

async function renderSquad(league, teamName) {
  const el = document.getElementById('squadList');
  const profiles = await fetchSheet('Player_Profiles');
  const squad = profiles.filter(p => p.Team === teamName);
  if (squad.length === 0) { el.innerHTML = '<p class="empty">No players listed yet.</p>'; return; }
  el.innerHTML = `
    <div class="card-grid">
      ${squad.map(p => `
        <a class="card" href="player.html?id=${encodeURIComponent(p['CPL Number'])}">
          <h3>${escapeHtml(p.Name)}</h3>
          <p>${escapeHtml(p.Position || 'Position TBC')}</p>
        </a>
      `).join('')}
    </div>
  `;
}

async function renderTeamFixtures(league, teamName) {
  const el = document.getElementById('teamFixtures');
  const [fixtures, results] = await Promise.all([
    fetchSheet(`Fixtures_${league}`),
    fetchSheet(`Results_${league}`),
  ]);
  const rows = fixtures.filter(f => f.Home === teamName || f.Away === teamName);
  if (rows.length === 0) { el.innerHTML = '<p class="empty">No fixtures yet.</p>'; return; }

  const scoreFor = (home, away, matchday) => {
    const r = results.find(x => x.Home === home && x.Away === away && x.Matchday === matchday);
    return r ? `${r['Home Goals']} - ${r['Away Goals']}` : null;
  };

  el.innerHTML = `
    <table class="data">
      <thead><tr><th>MD</th><th>Date</th><th>Home</th><th class="num">Score</th><th>Away</th><th>Status</th></tr></thead>
      <tbody>
        ${rows.map(f => `
          <tr>
            <td>${escapeHtml(f.Matchday)}</td>
            <td>${escapeHtml(f.Date)}</td>
            <td>${escapeHtml(f.Home)}</td>
            <td class="num">${scoreFor(f.Home, f.Away, f.Matchday) || '—'}</td>
            <td>${escapeHtml(f.Away)}</td>
            <td><span class="pill neutral">${escapeHtml(f.Status)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function renderTeamTopScorer(league, teamName) {
  const el = document.getElementById('teamTopScorer');
  const stats = await fetchSheet(`PlayerStats_${league}`);
  const squadStats = stats.filter(s => s.Team === teamName);
  if (squadStats.length === 0) { el.innerHTML = '<p class="empty">No stats recorded yet.</p>'; return; }
  const top = squadStats.sort((a, b) => Number(b.Goals) - Number(a.Goals))[0];
  el.innerHTML = `<p><strong>${escapeHtml(top.Player)}</strong> — ${escapeHtml(top.Goals)} goals, ${escapeHtml(top.Assists)} assists</p>`;
}

async function initTeamPage() {
  const teamName = getParam('team');
  if (!teamName) {
    document.getElementById('teamHeader').innerHTML = '<p class="empty">No team specified.</p>';
    return;
  }
  const found = await findTeamAcrossLeagues(teamName);
  if (!found) {
    document.getElementById('teamHeader').innerHTML = `<p class="empty">Team "${escapeHtml(teamName)}" not found.</p>`;
    return;
  }
  const { league, team } = found;
  renderTeamHeader(league, team);
  renderTeamStanding(league, teamName);
  renderSquad(league, teamName);
  renderTeamFixtures(league, teamName);
  renderTeamTopScorer(league, teamName);
}
document.addEventListener('DOMContentLoaded', initTeamPage);
