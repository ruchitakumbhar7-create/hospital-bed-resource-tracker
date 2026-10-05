// In a real system, this hospital's id would come from the logged-in session.
// For this student project, we hardcode it to hospital id 1 (Krishna Hospital).
const DASHBOARD_HOSPITAL_ID = 1;
 
(async function init(){
  await loadHospitals();
  const hospital = hospitals.find(h => h.id === DASHBOARD_HOSPITAL_ID);
  if (hospital) fillCounters(hospital);
  startLiveClock('lastUpdated');
})();
 
function fillCounters(hospital){
  document.querySelector('[data-type="general"] .counter-value').textContent = hospital.general;
  document.querySelector('[data-type="icu"] .counter-value').textContent = hospital.icu;
  document.querySelector('[data-type="oxygen"] .counter-value').textContent = hospital.oxygen;
  document.querySelector('[data-type="ventilator"] .counter-value').textContent = hospital.ventilator;
}
 
document.querySelectorAll('.counter-btn').forEach(btn => {
  btn.addEventListener('click', function(){
    const valueEl = this.parentElement.querySelector('.counter-value');
    let value = parseInt(valueEl.textContent, 10);
    if (this.classList.contains('plus')) value += 1;
    if (this.classList.contains('minus')) value = Math.max(0, value - 1);
    valueEl.textContent = value;
  });
});
 
document.getElementById('saveBedsBtn').addEventListener('click', async function(){
  const updatedCounts = {
    general:    parseInt(document.querySelector('[data-type="general"] .counter-value').textContent, 10),
    icu:        parseInt(document.querySelector('[data-type="icu"] .counter-value').textContent, 10),
    oxygen:     parseInt(document.querySelector('[data-type="oxygen"] .counter-value').textContent, 10),
    ventilator: parseInt(document.querySelector('[data-type="ventilator"] .counter-value').textContent, 10)
  };
 
  try {
    const res = await fetch(`${API_BASE}/hospitals/${DASHBOARD_HOSPITAL_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCounts)
    });
    if (!res.ok) throw new Error('save failed');
 
    document.getElementById('saveMsg').classList.remove('d-none');
  } catch (err) {
    alert('Could not save changes. Is app.py running on port 5000?');
  }
});