// ==========================================================
// news.html logic
// ==========================================================

async function initNewsPage() {
  const el = document.getElementById('newsList');
  try {
    const news = await fetchSheet('News');
    const sorted = news.filter(n => n.Title).sort((a, b) => new Date(b.Date) - new Date(a.Date));
    if (sorted.length === 0) {
      el.innerHTML = '<p class="empty">No news yet — check back soon.</p>';
      return;
    }
    el.innerHTML = sorted.map(n => `
      <div class="panel">
        <span class="eyebrow">${escapeHtml(n.Date)} ${n['League Tag'] ? '&middot; League ' + escapeHtml(n['League Tag']) : ''}</span>
        <h2>${escapeHtml(n.Title)}</h2>
        ${n['Image URL'] ? `<img src="${escapeHtml(n['Image URL'])}" alt="" style="margin-bottom:12px;max-height:280px;object-fit:cover;">` : ''}
        <p>${escapeHtml(n.Body)}</p>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = '<p class="empty">Couldn\'t load news right now.</p>';
  }
}
document.addEventListener('DOMContentLoaded', initNewsPage);
