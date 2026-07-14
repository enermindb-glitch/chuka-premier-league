// ==========================================================
// enquiries.html logic — submits the contact form to the
// Apps Script backend (backend.gs -> handleSubmitEnquiry_).
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('enquiryForm').addEventListener('submit', handleSubmitEnquiry);
});

function showEnquiryMsg(text, ok) {
  const msg = document.getElementById('enquiryMsg');
  msg.textContent = text;
  msg.className = 'msg show ' + (ok ? 'ok' : 'err');
}

async function handleSubmitEnquiry(e) {
  e.preventDefault();
  const btn = document.getElementById('enquirySubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    const payload = {
      name: document.getElementById('enquiryName').value.trim(),
      role: document.getElementById('enquiryRole').value,
      team: document.getElementById('enquiryTeam').value.trim(),
      subject: document.getElementById('enquirySubject').value.trim(),
      message: document.getElementById('enquiryMessage').value.trim(),
    };
    const res = await callApi('submitEnquiry', payload);
    if (res.success) {
      document.getElementById('enquiryForm').reset();
      showEnquiryMsg('Thanks — your enquiry has been sent. We\'ll get back to you soon.', true);
    } else {
      showEnquiryMsg(res.error || 'Something went wrong.', false);
    }
  } catch (err) {
    showEnquiryMsg('Network error: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send enquiry';
  }
}
