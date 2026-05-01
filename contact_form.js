/* ══════════════════════════════════════════════════════════
   CONTACT FORM — Flask version
   Replace the existing form listener in script.js with this.
   Everything else in script.js stays exactly the same.
══════════════════════════════════════════════════════════ */

const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const subject = form.subject?.value.trim() ?? '';
  const message = form.message.value.trim();

  // Basic client-side check (server validates too)
  if (!name || !email || !message) {
    [
      !name    && form.name,
      !email   && form.email,
      !message && form.message,
    ]
      .filter(Boolean)
      .forEach(field => {
        field.style.borderColor = '#e05565';
        setTimeout(() => (field.style.borderColor = ''), 1200);
      });
    return;
  }

  // Show loading state
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled    = true;

  try {
    const res  = await fetch('/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, subject, message }),
    });
    const data = await res.json();

    if (data.ok) {
      form.reset();
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    } else {
      // Show first server error under the button
      const errMsg = data.errors?.[0] ?? 'Something went wrong.';
      alert(errMsg); // swap for a nicer inline error if you like
    }
  } catch {
    alert('Network error — please try again.');
  } finally {
    btn.innerHTML = 'Send Message <i class="bx bx-send"></i>';
    btn.disabled  = false;
  }
});
