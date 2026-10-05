const loggedInUser = JSON.parse(sessionStorage.getItem('wardboard_user'));

if (!loggedInUser) {
  window.location.href = 'login.html';
} else {
  showUser();
  loadSavedHospitals();
}

function showUser() {
  document.getElementById('fullName').value = loggedInUser.fullName;
  document.getElementById('profileEmail').value = loggedInUser.email;
  document.getElementById('profilePhone').value = loggedInUser.phone;
}

document.getElementById('detailsForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();

  try {
    const res = await fetch(`${API_BASE}/users/${loggedInUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone })
    });
    if (!res.ok) throw new Error('save failed');

    loggedInUser.fullName = fullName;
    loggedInUser.phone = phone;
    sessionStorage.setItem('wardboard_user', JSON.stringify(loggedInUser));

    document.getElementById('detailsSaved').classList.remove('d-none');
  } catch (err) {
    alert('Could not save. Is app.py running on port 5000?');
  }
});

async function loadSavedHospitals() {
  const list = document.getElementById('savedList');
  const empty = document.getElementById('emptySaved');

  try {
    const res = await fetch(`${API_BASE}/saved/${loggedInUser.id}`);
    const saved = await res.json();

    list.innerHTML = '';

    if (saved.length === 0) {
      if (empty) empty.classList.remove('d-none');
      return;
    }
    if (empty) empty.classList.add('d-none');

    saved.forEach(h => {
      const row = document.createElement('div');
      row.className = 'saved-hosp-row';
      row.innerHTML = `
        <div>
          <a href="hospital-details.html?id=${h.id}" class="hosp-name" style="text-decoration:none;">${h.name}</a>
          <div class="hosp-city">${h.city}</div>
        </div>
        <a href="#" class="remove-link" data-id="${h.id}">Remove</a>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    list.innerHTML = '<p>Could not load saved hospitals. Is app.py running?</p>';
  }
}

document.getElementById('savedList').addEventListener('click', async function (e) {
  if (!e.target.classList.contains('remove-link')) return;
  e.preventDefault();

  const hospitalId = e.target.dataset.id;
  await fetch(`${API_BASE}/saved/${loggedInUser.id}/${hospitalId}`, { method: 'DELETE' });
  loadSavedHospitals();
});

document.getElementById('passwordForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const current = document.getElementById('currentPassword').value;
  const next = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmNewPassword').value;
  const alertEl = document.getElementById('passwordAlert');
  const okEl = document.getElementById('passwordSuccess');

  okEl.classList.add('d-none');
  alertEl.classList.add('d-none');

  if (!current || !next || next.length < 6) {
    alertEl.textContent = 'Please fill in all fields with a password of at least 6 characters.';
    alertEl.classList.remove('d-none');
    return;
  }
  if (next !== confirm) {
    alertEl.textContent = 'New passwords do not match.';
    alertEl.classList.remove('d-none');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: loggedInUser.id,
        currentPassword: current,
        newPassword: next
      })
    });
    const data = await res.json();

    if (!res.ok) {
      alertEl.textContent = data.error || 'Could not change password.';
      alertEl.classList.remove('d-none');
      return;
    }

    okEl.classList.remove('d-none');
    this.reset();
  } catch (err) {
    alertEl.textContent = 'Could not reach the server. Is app.py running?';
    alertEl.classList.remove('d-none');
  }
});