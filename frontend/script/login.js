"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const loginForm    = document.getElementById("loginForm");
  const submitBtn    = document.getElementById("submitBtn");
  const loader       = document.getElementById("loader");
  const btnText      = document.getElementById("btnText");
  const generalError = document.getElementById("generalError");

  const LOGIN_API = "http://localhost:3000/users/login";

  /**
   * EXTRACTION HELPER: Decodes the JWT payload without a library
   */
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Token decoding failed", e);
      return null;
    }
  }

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const email    = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    let valid = true;
    if (!validateEmail(email)) {
      showFieldError("email", "Please enter a valid email address.");
      valid = false;
    }
    if (!password) {
      showFieldError("password", "Password cannot be empty.");
      valid = false;
    }
    if (!valid) return;

    setLoading(true);

    try {
      const res = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // 1. Save the token
        localStorage.setItem("access_token", data.token);

        // 2. EXTRACT the role from the JWT payload
        const decoded = parseJwt(data.token);
        const role = decoded?.role || "user"; // Fallback to user if not found

        // 3. Redirect based on extracted role
        if (role === "admin") {
          window.location.replace("admin.html");
        } else {
          window.location.replace("dashboard.html");
        }

      } else {
        handleServerError(data.message || "Login failed.");
      }

    } catch (err) {
      if (generalError) {
        generalError.textContent = "Unable to connect to the server.";
        generalError.style.display = "block";
      }
    } finally {
      setLoading(false);
    }
  });

  // ── Helpers ──────────────────────────────────

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const span  = document.getElementById(`${fieldId}Error`);
    if (input) input.classList.add("invalid");
    if (span) { span.textContent = message; span.style.display = "block"; }
  }

  function clearErrors() {
    document.querySelectorAll("input").forEach(i => i.classList.remove("invalid"));
    document.querySelectorAll(".error-msg").forEach(s => { s.textContent = ""; s.style.display = "none"; });
    if (generalError) generalError.style.display = "none";
  }

  function setLoading(isLoading) {
    if (submitBtn) submitBtn.disabled = isLoading;
    if (loader) loader.style.display = isLoading ? "block" : "none";
    if (btnText) btnText.textContent = isLoading ? "Authenticating…" : "Login";
  }

  function handleServerError(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes("email")) showFieldError("email", msg);
    else if (lower.includes("password")) showFieldError("password", msg);
    else if (generalError) {
      generalError.textContent = msg;
      generalError.style.display = "block";
    }
  }
});