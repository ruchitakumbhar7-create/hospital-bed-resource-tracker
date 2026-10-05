// ---------- API connection ----------
const API_BASE = "http://127.0.0.1:5000/api";

let hospitals = [];

async function loadHospitals() {
  const res = await fetch(`${API_BASE}/hospitals`);
  if (!res.ok) throw new Error("Failed to load hospitals from server");
  hospitals = await res.json();
}

function pillClass(count){
  if (count === 0) return 'out';
  if (count <= 5)  return 'low';
  return 'ok';
}

function pill(count){
  return `<span class="count-pill ${pillClass(count)}">${count}</span>`;
}

function totalFor(h, type){
  if (type === 'general') return h.general;
  if (type === 'icu') return h.icu;
  if (type === 'oxygen') return h.oxygen;
  if (type === 'ventilator') return h.ventilator;
  return h.general + h.icu + h.oxygen + h.ventilator;
}

function renderBoard(list, bodyId, noResultsId){
  const boardBody = document.getElementById(bodyId);
  const noResults = document.getElementById(noResultsId);
  boardBody.innerHTML = '';

  if (list.length === 0){
    if (noResults) noResults.classList.remove('d-none');
    return;
  }
  if (noResults) noResults.classList.add('d-none');

  list.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Hospital">
        <div class="hosp-name">${h.name}</div>
        <div class="hosp-city">${h.city}</div>
      </td>
      <td data-label="General">${pill(h.general)}</td>
      <td data-label="ICU">${pill(h.icu)}</td>
      <td data-label="Oxygen">${pill(h.oxygen)}</td>
      <td data-label="Ventilator">${pill(h.ventilator)}</td>
      <td data-label="Contact"><a class="call-link" href="tel:${h.phone.replace(/[^0-9]/g,'')}">Call ${h.phone}</a></td>
      <td data-label="Details"><a class="call-link" href="hospital-details.html?id=${h.id}">View details</a></td>
    `;
    boardBody.appendChild(tr);
  });
}

function startLiveClock(elementId){
  let secondsAgo = 0;
  setInterval(() => {
    secondsAgo += 1;
    const el = document.getElementById(elementId);
    if (!el) return;
    if (secondsAgo < 60){
      el.textContent = secondsAgo <= 1 ? 'just now' : secondsAgo + ' seconds ago';
    } else {
      el.textContent = Math.floor(secondsAgo / 60) + ' min ago';
    }
  }, 1000);
}
