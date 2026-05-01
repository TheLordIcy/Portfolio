/* ═══════════════════════════════════════════════════════════════
   ICY PORTFOLIO — script.js
   Features:
     · Custom cursor
     · Sticky navbar + active link highlighting
     · Mobile hamburger toggle
     · Typing effect (hero role)
     · Scroll-triggered animations (IntersectionObserver)
     · Skill bar animations
     · Contact form (mock submit)
════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   1. CUSTOM CURSOR
────────────────────────────────────────────── */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

// Only run on non-touch devices
if (window.matchMedia('(pointer: fine)').matches) {
  let ringX = 0, ringY = 0;
  let dotX  = 0, dotY  = 0;
  let mx    = 0, my    = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // Dot follows instantly
    dotX = mx; dotY = my;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top  = dotY + 'px';
  });

  // Ring follows with a lag (lerp in rAF)
  function animateRing() {
    ringX += (mx - ringX) * 0.14;
    ringY += (my - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover expand on interactive elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .skill-chip, .project-card, .service-card, input, textarea'
  );
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
  });
}


/* ──────────────────────────────────────────────
   2. STICKY NAVBAR + ACTIVE SECTION HIGHLIGHT
────────────────────────────────────────────── */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Sticky glass effect
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active link highlighting
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});


/* ──────────────────────────────────────────────
   3. MOBILE HAMBURGER
────────────────────────────────────────────── */
const hamburger     = document.getElementById('hamburger');
const navLinksMenu  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksMenu.classList.toggle('open');
});

// Close menu on nav link click
navLinksMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksMenu.classList.remove('open');
  });
});


/* ──────────────────────────────────────────────
   4. TYPING EFFECT
────────────────────────────────────────────── */
const typedEl = document.getElementById('typedText');
const phrases = [
  'beautiful UIs.',
  'fast web apps.',
  'bold experiences.',
  'pixel-perfect code.',
  'the future.'
];

let phraseIdx   = 0;
let charIdx     = 0;
let isDeleting  = false;
let typingSpeed = 90;

function type() {
  const currentPhrase = phrases[phraseIdx];

  if (isDeleting) {
    typedEl.textContent = currentPhrase.slice(0, --charIdx);
  } else {
    typedEl.textContent = currentPhrase.slice(0, ++charIdx);
  }

  // When phrase complete → pause then delete
  if (!isDeleting && charIdx === currentPhrase.length) {
    isDeleting  = true;
    typingSpeed = 55;
    setTimeout(type, 1600);
    return;
  }

  // When deleted → move to next phrase
  if (isDeleting && charIdx === 0) {
    isDeleting  = false;
    phraseIdx   = (phraseIdx + 1) % phrases.length;
    typingSpeed = 90;
  }

  setTimeout(type, isDeleting ? 45 : typingSpeed);
}

type(); // kick it off


/* ──────────────────────────────────────────────
   5. SCROLL-TRIGGERED ANIMATIONS
────────────────────────────────────────────── */
const animEls = document.querySelectorAll('[data-anim]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || 0);

    setTimeout(() => {
      el.classList.add('visible');
    }, delay);

    observer.unobserve(el); // animate once
  });
}, { threshold: 0.12 });

animEls.forEach(el => observer.observe(el));


/* ──────────────────────────────────────────────
   6. SKILL BAR ANIMATIONS
────────────────────────────────────────────── */
const skillBars = document.querySelectorAll('.skill-bar-fill');

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const bar = entry.target;
    const targetWidth = bar.dataset.width + '%';
    // Brief delay so opacity animation lands first
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 300);
    barObserver.unobserve(bar);
  });
}, { threshold: 0.5 });

skillBars.forEach(bar => barObserver.observe(bar));

/* ──────────────────────────────────────────────
   7. CONTACT FORM (Formspree)
────────────────────────────────────────────── */
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    [!name && form.name, !email && form.email, !message && form.message]
      .filter(Boolean)
      .forEach(field => {
        field.style.borderColor = '#e05565';
        setTimeout(() => (field.style.borderColor = ''), 1200);
      });
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/xzdobokr', {
      method:  'POST',
      headers: { 'Accept': 'application/json' },
      body:    new FormData(form),
    });

    if (res.ok) {
      form.reset();
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    } else {
      alert('Something went wrong. Please try again.');
    }
  } catch {
    alert('Network error — please try again.');
  } finally {
    btn.innerHTML = 'Send Message <i class="bx bx-send"></i>';
    btn.disabled = false;
  }
});

/* ──────────────────────────────────────────────
   8. SMOOTH SCROLL for anchor links
   (already handled by CSS scroll-behavior: smooth
   but this ensures offset for sticky nav)
────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = document.getElementById('navbar').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ──────────────────────────────────────────────
   9. HERO GRID PARALLAX (subtle)
────────────────────────────────────────────── */
const heroGrid = document.querySelector('.hero-grid');
if (heroGrid) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroGrid.style.transform = `translateY(${scrolled * 0.25}px)`;
  }, { passive: true });
}