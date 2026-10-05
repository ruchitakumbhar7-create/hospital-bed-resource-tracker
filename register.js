// Front-end only demo validation. Replace with a real API call on your backend.
const registerForm  = document.getElementById('registerForm');
const registerAlert = document.getElementById('registerAlert');

registerForm.addEventListener('submit', function(e){
  e.preventDefault();

  const name     = document.getElementById('fullName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('confirmPassword').value;
  const agreed   = document.getElementById('agreeTerms').checked;

  let error = '';
  if (!name || !email || !phone || !password){
    error = 'Please fill in all fields.';
  } else if (!/^[0-9]{10}$/.test(phone)){
    error = 'Enter a valid 10-digit phone number.';
  } else if (password.length < 6){
    error = 'Password must be at least 6 characters.';
  } else if (password !== confirm){
    error = 'Passwords do not match.';
  } else if (!agreed){
    error = 'Please accept the Terms of Service to continue.';
  }

  if (error){
    registerAlert.textContent = error;
    registerAlert.classList.remove('d-none');
    return;
  }

  registerAlert.classList.add('d-none');
  // Demo only: pretend registration succeeded and go to login.
  window.location.href = 'login.html';
});