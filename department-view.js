const deptLabels = {
  general: 'General beds',
  icu: 'ICU beds',
  oxygen: 'Oxygen beds',
  ventilator: 'Ventilator beds'
};

const deptBody       = document.getElementById('deptBody');
const deptNoResults  = document.getElementById('deptNoResults');
const deptHeading    = document.getElementById('deptHeading');
const deptColHeading = document.getElementById('deptColHeading');
const deptTotalNum   = document.getElementById('deptTotalNum');

function renderDepartment(type){
  deptHeading.textContent = deptLabels[type];
  deptColHeading.textContent = deptLabels[type];

  const sorted = [...hospitals].sort((a, b) => b[type] - a[type]);
  const total = hospitals.reduce((sum, h) => sum + h[type], 0);
  deptTotalNum.textContent = total;

  deptBody.innerHTML = '';

  if (sorted.length === 0){
    deptNoResults.classList.remove('d-none');
    return;
  }
  deptNoResults.classList.add('d-none');

  sorted.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Hospital"><div class="hosp-name">${h.name}</div></td>
      <td data-label="City"><div class="hosp-city">${h.city}</div></td>
      <td data-label="${deptLabels[type]}">${pill(h[type])}</td>
      <td data-label="Contact"><a class="call-link" href="tel:${h.phone.replace(/[^0-9]/g,'')}">Call ${h.phone}</a></td>
      <td data-label="Details"><a class="call-link" href="hospital-details.html?id=${h.id}">View details</a></td>
    `;
    deptBody.appendChild(tr);
  });
}

document.querySelectorAll('.dept-tab').forEach(tab => {
  tab.addEventListener('click', function(){
    document.querySelectorAll('.dept-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    renderDepartment(this.dataset.type);
  });
});

(async function init(){
  try {
    await loadHospitals();
    renderDepartment('general');
  } catch (err) {
    deptBody.innerHTML = '<tr><td colspan="5">Could not reach the server. Is app.py running on port 5000?</td></tr>';
  }
  startLiveClock('lastUpdated');
})();