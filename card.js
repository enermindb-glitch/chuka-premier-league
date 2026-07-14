// ==========================================================
// player.html — "Download my card" button.
// Populates a hidden template with photo/name/team/CPL number,
// draws a QR code linking to verify.html?cpl=..., then rasterizes
// it to a PNG with html2canvas. Everything happens client-side.
// ==========================================================

document.addEventListener('cpl:profileLoaded', (e) => {
  document.getElementById('downloadCardBtn').style.display = 'inline-block';
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('downloadCardBtn').addEventListener('click', handleDownloadCard);
});

async function handleDownloadCard() {
  const btn = document.getElementById('downloadCardBtn');
  btn.disabled = true;
  btn.textContent = 'Generating…';

  try {
    populateCardTemplate(currentProfile);
    await drawCardQr(currentProfile['CPL Number']);

    // Card template must be visible (off-screen, not display:none) for html2canvas to render it.
    const el = document.getElementById('playerCardTemplate');
    const canvas = await html2canvas(el, { backgroundColor: null, useCORS: true, scale: 2 });

    const link = document.createElement('a');
    link.download = `${currentProfile['CPL Number']}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert('Could not generate card: ' + err.message +
      '\nIf this keeps happening, the photo image may be blocking the download for cross-origin reasons.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Download my card';
  }
}

function populateCardTemplate(profile) {
  const hasPhoto = profile['Photo URL'] && profile['Photo URL'].trim() !== '';
  document.getElementById('cardPhotoWrap').innerHTML = hasPhoto
    ? `<img class="cardPhoto" crossorigin="anonymous" src="${escapeHtml(profile['Photo URL'])}" alt="">`
    : `<div class="avatar-fallback" style="width:84px;height:84px;">${escapeHtml((profile.Name||'?').split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase())}</div>`;

  document.getElementById('cardName').textContent = profile.Name;
  document.getElementById('cardTeam').textContent = `${profile.Team} · League ${profile.League}`;
  document.getElementById('cardCpl').textContent = profile['CPL Number'];
  document.getElementById('cardSeason').textContent = `${CPL.SEASON_YEAR} Season`;
}

async function drawCardQr(cplNumber) {
  const qrEl = document.getElementById('cardQr');
  qrEl.innerHTML = '';
  const verifyUrl = `${window.location.origin}${window.location.pathname.replace('player.html', 'verify.html')}?cpl=${encodeURIComponent(cplNumber)}`;
  // eslint-disable-next-line no-undef
  new QRCode(qrEl, {
    text: verifyUrl,
    width: 96,
    height: 96,
    colorDark: '#10243E',
    colorLight: '#E8EEF2',
  });
}
