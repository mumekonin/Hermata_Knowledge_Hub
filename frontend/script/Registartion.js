async function register() {

  // 1. Get values
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password= document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // 2. Clear old errors
  document.getElementById('nameError').textContent    = '';
  document.getElementById('emailError').textContent   = '';
  document.getElementById('passwordError').textContent = '';
  document.getElementById('confirmError').textContent  = '';
  document.getElementById('successMsg').style.display  = 'none';

  // 3. Validate
  let hasError = false;
  if (!name) {
    document.getElementById('nameError').textContent = 'Name is required.';
    document.getElementById('name').classList.add('error-input');
    hasError = true;
  }

  if (!email) {
    document.getElementById('emailError').textContent = 'Email is required.';
    document.getElementById('email').classList.add('error-input');
    hasError = true;
  } else if (!email.includes('@') || !email.includes('.')) {
    document.getElementById('emailError').textContent = 'Enter a valid email.';
    document.getElementById('email').classList.add('error-input');
    hasError = true;
  }

  if (!password) {
    document.getElementById('passwordError').textContent = 'Password is required.';
    document.getElementById('password').classList.add('error-input');
    hasError = true;
  } else if (password.length < 8) {
    document.getElementById('passwordError').textContent = 'Password must be at least 8 characters.';
    document.getElementById('password').classList.add('error-input');
    hasError = true;
  }

  if (password !== confirmPassword) {
    document.getElementById('confirmError').textContent = 'Passwords do not match.';
    document.getElementById('confirmPassword').classList.add('error-input');
    hasError = true;
  }

  if (hasError) return;

  // 4. Send to backend
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Creating...';

  try {
    const response = await fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend returned an error (e.g. email already exists)
      document.getElementById('emailError').textContent = data.message || 'Something went wrong.';
      document.getElementById('email').classList.add('error-input');
    } else {
      // Success
      const successMsg = document.getElementById('successMsg');
      successMsg.textContent = 'Account created! Welcome, ' + data.name + ' 🎉';
      successMsg.style.display = 'block';

      // Clear the form
      document.getElementById('name').value            = '';
      document.getElementById('email').value           = '';
      document.getElementById('password').value        = '';
      document.getElementById('confirmPassword').value = '';
    }

  } catch (error) {
    document.getElementById('serverErrorMsg').textContent = 'Could not connect to server. Is it running?';
  }

  btn.disabled = false;
  btn.textContent = 'Create Account';
}