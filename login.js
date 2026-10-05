const loginForm  = document.getElementById('loginForm');
const loginAlert = document.getElementById('loginAlert');

loginForm.addEventListener('submit', async function(e){
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password || password.length < 6){
    loginAlert.textContent = 'Please enter a valid email and a password of at least 6 characters.';
    loginAlert.classList.remove('d-none');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      loginAlert.textContent = data.error || 'Login failed.';
      loginAlert.classList.remove('d-none');
      return;
    }

    sessionStorage.setItem('wardboard_user', JSON.stringify(data.user));
    loginAlert.classList.add('d-none');
    window.location.href = 'profile.html';
  } catch (err) {
    loginAlert.textContent = 'Could not reach the server. Is app.py running on port 5000?';
    loginAlert.classList.remove('d-none');
  }
});