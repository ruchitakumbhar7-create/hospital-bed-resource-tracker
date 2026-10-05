const params = new URLSearchParams(window.location.search);
const hospitalId = params.get('id');

(async function init(){
  try {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}`);
    if (!res.ok) throw new Error('not found');
    const hospital = await res.json();
    showHospital(hospital);
  } catch (err) {
    document.getElementById('hospNameHeading').textContent = 'Hospital not found';
    document.getElementById('notFound').classList.remove('d-none');
  }
})();

function showHospital(hospital){
  document.getElementById('hospNameHeading').textContent = hospital.name;
  document.getElementById('hospCityHeading').textContent = hospital.city;
  document.getElementById('infoName').textContent = hospital.name;
  document.getElementById('infoCity').textContent = hospital.city;
  document.getElementById('infoPhone').textContent = hospital.phone;
  const total = hospital.general + hospital.icu + hospital.oxygen + hospital.ventilator;
  document.getElementById('infoTotal').textContent = total + ' beds';

  const stats = [
    { label: 'General beds', value: hospital.general },
    { label: 'ICU beds', value: hospital.icu },
    { label: 'Oxygen beds', value: hospital.oxygen },
    { label: 'Ventilator beds', value: hospital.ventilator }
  ];

  const statCards = document.getElementById('statCards');
  stats.forEach(s => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3';
    col.innerHTML = `
      <div class="detail-stat">
        <div class="num ${pillClass(s.value)}">${s.value}</div>
        <div class="label">${s.label}</div>
      </div>`;
    statCards.appendChild(col);
  });

  const callBtn = document.getElementById('callBtn');
  callBtn.href = 'tel:' + hospital.phone.replace(/[^0-9]/g, '');
  callBtn.textContent = 'Call ' + hospital.phone;
}

document.getElementById('saveBtn').addEventListener('click', async function () {
  const userData = sessionStorage.getItem('wardboard_user');

  
  if (!userData) {
    alert('Please log in first to save hospitals.');
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userData);
  const msg = document.getElementById('saveMsg');

  try {
    const res = await fetch(`${API_BASE}/saved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, hospitalId: Number(hospitalId) })
    });

    if (!res.ok) {
      alert('Server error while saving. Status: ' + res.status);
      return;
    }

    msg.textContent = 'Saved to your profile.';
    msg.classList.remove('d-none');
  } catch (err) {
    alert('Could not reach the server. Is app.py running on port 5000?');
  }
});