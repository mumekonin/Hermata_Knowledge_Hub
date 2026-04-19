document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const loader = document.getElementById('loader');
  const btnText = document.getElementById('btnText');
  const generalError = document.getElementById('generalError');

  const LOGIN_API = 'http://localhost:3000/users/login';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Initial Reset & UI feedback
    clearErrors();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Trim to prevent whitespace errors
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    let isValid = true;

    if (!validateEmail(email)) {
      showError('email', 'Please enter a valid email address.');
      isValid = false;
    }

    if (password.length === 0) {
      showError('password', 'Password cannot be empty.');
      isValid = false;
    }

    if (!isValid) return;

    // Prevent Double Submissions & show loading
    setLoadingState(true);

    try {
      const response = await fetch(LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();

      if (response.ok) {
        //store token for authenticated requests
        if (result.token) {
          localStorage.setItem('token', result.token);
        }

        //Role-Based Redirection
        const role = result.user?.role || 'user';

        if (role === 'admin') {
          window.location.replace('admin.html');
        } else {
          window.location.replace('dashboard.html');
        }

      } else {
        handleBackendError(result.message || 'Login failed. Please check your credentials.');
      }

    } catch (err) {
      //Network/Server Error
      generalError.textContent = "Unable to connect to the server. Please check your internet.";
      generalError.style.display = 'block';
    } finally {
      setLoadingState(false);
    }
  });

  // Helper Functions

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, message) {
    const input = document.getElementById(field);
    const errorSpan = document.getElementById(`${field}Error`);
    input.classList.add('invalid');
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
  }

  function clearErrors() {
    document.querySelectorAll('input').forEach(i => i.classList.remove('invalid'));
    document.querySelectorAll('.error-msg').forEach(s => s.textContent = '');
    generalError.textContent = '';
    generalError.style.display = 'none';
  }

  function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      loader.style.display = 'block';
      btnText.textContent = 'Authenticating...';
    } else {
      loader.style.display = 'none';
      btnText.textContent = 'Login';
    }
  }

  function handleBackendError(msg) {
    const lowerMsg = msg.toLowerCase();
    //error message parsing to detrimine  if it's related to email,password or general error
    if (lowerMsg.includes('email')) {
      showError('email', msg);
    } else if (lowerMsg.includes('password')) {
      showError('password', msg);
    } else {
      generalError.textContent = msg;
      generalError.style.display = 'block';
    }
  }
});