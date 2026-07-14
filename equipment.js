// ==========================================================
// equipment.html logic — only shows items marked
// "Show on Site" = Y in the Equipment sheet.
// ==========================================================

async function initEquipmentPage() {
  const el = document.getElementById('equipmentList');
  try {
    const items = await fetchSheet('Equipment');
    const visible = items.filter(i => i.Item && String(i['Show on Site (Y/N)']).trim().toUpperCase() === 'Y');
    if (visible.length === 0) {
      el.innerHTML = '<p class="empty">Nothing to show here yet.</p>';
      return;
    }
    el.innerHTML = `
      <table class="data">
        <thead><tr><th>Item</th><th>Category</th><th class="num">Qty</th><th>Condition</th><th>Sponsor</th></tr></thead>
        <tbody>
          ${visible.map(i => `
            <tr>
              <td>${escapeHtml(i.Item)}</td>
              <td>${escapeHtml(i.Category)}</td>
              <td class="num">${escapeHtml(i.Quantity)}</td>
              <td><span class="pill neutral">${escapeHtml(i.Condition)}</span></td>
              <td>${escapeHtml(i.Sponsor)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = '<p class="empty">Couldn\'t load equipment right now.</p>';
  }
}
document.addEventListener('DOMContentLoaded', initEquipmentPage);
