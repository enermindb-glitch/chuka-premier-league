// ==========================================================
// player.html — "Edit my profile" flow.
// No accounts: a player unlocks editing by re-entering their
// CPL number + PIN each visit (checked server-side by backend.gs).
// ==========================================================

let unlockedPin = null; // held in memory only, never stored, cleared on page leave

document.addEventListener('cpl:profileLoaded', () => {
  document.getElementById('editSection').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('unlockBtn').addEventListener('click', showUnlockForm);
  document.getElementById('unlockForm').addEventListener('submit', handleUnlock);
  document.getElementById('editForm').addEventListener('submit', handleSaveProfile);
  document.getElementById('photoInput').addEventListener('change', handlePhotoPreview);
  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    unlockedPin = null;
    document.getElementById('editFormWrap').style.display = 'none';
    document.getElementById('unlockPrompt').style.display = 'block';
  });
});

function showUnlockForm() {
  document.getElementById('unlockPrompt').style.display = 'block';
  document.getElementById('unlockPinInput').focus();
}

function showEditMsg(text, ok) {
  const msg = document.getElementById('editMsg');
  msg.textContent = text;
  msg.className = 'msg show ' + (ok ? 'ok' : 'err');
}

async function handleUnlock(e) {
  e.preventDefault();
  const pin = document.getElementById('unlockPinInput').value.trim();
  const btn = document.getElementById('unlockSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Checking…';

  try {
    const res = await callApi('verifyPin', { cplNumber: currentProfile['CPL Number'], pin });
    if (res.success) {
      unlockedPin = pin;
      document.getElementById('unlockPrompt').style.display = 'none';
      document.getElementById('editFormWrap').style.display = 'block';
      document.getElementById('bioInput').value = res.profile.bio || '';
      document.getElementById('positionInput').value = res.profile.position || '';
      showEditMsg('', false); // clear
      document.getElementById('editMsg').className = 'msg';
    } else {
      showEditMsg(res.error || 'Incorrect CPL number or PIN.', false);
    }
  } catch (err) {
    showEditMsg('Network error: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Unlock';
  }
}

async function handleSaveProfile(e) {
  e.preventDefault();
  if (!unlockedPin) return;
  const btn = document.getElementById('saveProfileBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    const res = await callApi('updateProfile', {
      cplNumber: currentProfile['CPL Number'],
      pin: unlockedPin,
      bio: document.getElementById('bioInput').value.trim(),
      position: document.getElementById('positionInput').value.trim(),
    });
    if (res.success) {
      currentProfile.Bio = document.getElementById('bioInput').value.trim();
      currentProfile.Position = document.getElementById('positionInput').value.trim();
      renderPlayerBio(currentProfile);
      renderPlayerHeader(currentProfile);
      showEditMsg('Saved!', true);
    } else {
      showEditMsg(res.error || 'Could not save changes.', false);
    }
  } catch (err) {
    showEditMsg('Network error: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save changes';
  }
}

function handlePhotoPreview() {
  const file = document.getElementById('photoInput').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('photoPreview').src = reader.result;
    document.getElementById('photoPreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function handleUploadPhoto() {
  if (!unlockedPin) return;
  const file = document.getElementById('photoInput').files[0];
  if (!file) { showEditMsg('Choose a photo first.', false); return; }

  const btn = document.getElementById('uploadPhotoBtn');
  btn.disabled = true;
  btn.textContent = 'Uploading…';

  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await callApi('uploadPhoto', {
      cplNumber: currentProfile['CPL Number'],
      pin: unlockedPin,
      imageBase64: stripBase64Prefix(dataUrl),
      mimeType: file.type || 'image/jpeg',
    });

    if (res.success) {
      currentProfile['Photo URL'] = res.photoUrl;
      renderPlayerHeader(currentProfile);
      showEditMsg('Photo updated!', true);
    } else {
      showEditMsg(res.error || 'Could not upload photo.', false);
    }
  } catch (err) {
    showEditMsg('Network error: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Upload photo';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadPhotoBtn').addEventListener('click', handleUploadPhoto);
});
