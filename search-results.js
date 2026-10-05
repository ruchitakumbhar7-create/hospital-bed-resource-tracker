const cityInput = document.getElementById('cityInput');
const bedType   = document.getElementById('bedType');
const sortBy    = document.getElementById('sortBy');

function applyFilters(){
  const city = cityInput.value.trim().toLowerCase();
  const type = bedType.value;
  const sort = sortBy.value;

  let filtered = hospitals.filter(h => {
    const matchesCity = city === '' || h.city.toLowerCase().includes(city) || h.name.toLowerCase().includes(city);
    const matchesType = type === 'all' || totalFor(h, type) > 0;
    return matchesCity && matchesType;
  });

  if (sort === 'availability'){
    filtered.sort((a, b) => totalFor(b, type) - totalFor(a, type));
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderBoard(filtered, 'boardBody', 'noResults');
}

const params = new URLSearchParams(window.location.search);
if (params.get('city')) cityInput.value = params.get('city');
if (params.get('type')) bedType.value = params.get('type');

cityInput.addEventListener('input', applyFilters);
bedType.addEventListener('change', applyFilters);
sortBy.addEventListener('change', applyFilters);

(async function init(){
  try {
    await loadHospitals();
    applyFilters();
  } catch (err) {
    document.getElementById('boardBody').innerHTML =
      '<tr><td colspan="7">Could not reach the server. Is app.py running on port 5000?</td></tr>';
  }
  startLiveClock('lastUpdated');
})();