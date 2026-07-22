// ===== WhatsApp number — change this one line to update it everywhere =====
const WHATSAPP_NUMBER = '917592990655'; // country code + number, no + or spaces

// ===== Google Sheet leads endpoint =====
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwswS5Yc1DI8wnefkHmVnJ9NKXMwRjmKNfTuRJZXQ-Va4n0QN5ymegOhkdOzZEfXA5k1g/exec';

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  // Contact form submission
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        destination: document.getElementById('dest').value,
        source: 'Contact Form',
        message: document.getElementById('msg').value
      };
      fetch(SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(data)
      }).then(() => {
        inquiryForm.innerHTML = '<p style="text-align:center; padding:40px 0;">Thanks! We\'ll get back to you shortly.</p>';
      });
    });
  }

  // Mobile nav open/close
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // Rewrite every WhatsApp link on the page to use the number above
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${WHATSAPP_NUMBER}`);
  });

  // Hero video sound toggle
  const heroVideo = document.getElementById('heroVideo');
  const soundToggle = document.getElementById('soundToggle');
  if (heroVideo && soundToggle) {
    soundToggle.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      soundToggle.querySelector('.icon-muted').style.display = heroVideo.muted ? 'block' : 'none';
      soundToggle.querySelector('.icon-unmuted').style.display = heroVideo.muted ? 'none' : 'block';
    });
  }

  // Split-flap headline effect
  document.querySelectorAll('[data-flap]').forEach(container => {
    const text = container.getAttribute('data-flap');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spans = [];
    const words = text.split(' ');
    words.forEach((word, wi) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'flap-word';
      word.split('').forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'flap-char';
        span.textContent = reduceMotion ? ch : ' ';
        wordSpan.appendChild(span);
        spans.push({ el: span, final: ch });
      });
      container.appendChild(wordSpan);
      if (wi < words.length - 1) container.appendChild(document.createTextNode(' '));
    });
    if (!reduceMotion) {
      spans.forEach((s, i) => {
        const delay = i * 45;
        const cycles = 5 + Math.floor(Math.random() * 4);
        let count = 0;
        setTimeout(() => {
          const interval = setInterval(() => {
            count++;
            s.el.classList.remove('flapping');
            void s.el.offsetWidth;
            s.el.classList.add('flapping');
            if (count >= cycles) {
              clearInterval(interval);
              s.el.textContent = s.final;
            } else {
              s.el.textContent = chars[Math.floor(Math.random() * chars.length)];
            }
          }, 50);
        }, delay);
      });
    }
  });

  // ===== Name + phone modal — now gates EVERY WhatsApp link on the site =====
  function openWaModal(dest, message, waHref) {
    const overlay = document.createElement('div');
    overlay.className = 'wa-modal-overlay';
    overlay.innerHTML = `
      <div class="wa-modal">
        <h3>Quick details first</h3>
        <p class="sub">Just your name and number — we'll take it from there on WhatsApp.</p>
        <div class="form-field">
          <label>Your name</label>
          <input type="text" id="waName" placeholder="Your name" required>
        </div>
        <div class="form-field">
          <label>Phone / WhatsApp number</label>
          <input type="tel" id="waPhone" placeholder="+91 XXXXX XXXXX" required>
        </div>
        <div class="wa-modal-actions">
          <button class="btn btn-gold" id="waSubmit">Continue to WhatsApp</button>
        </div>
        <p style="text-align:center; margin-top:14px;">
          <button class="wa-modal-close" id="waClose">Cancel</button>
        </p>
      </div>`;
    document.body.appendChild(overlay);

    const nameInput = document.getElementById('waName');
    nameInput.focus();

    document.getElementById('waClose').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('waSubmit').addEventListener('click', () => {
      const name = nameInput.value.trim();
      const phone = document.getElementById('waPhone').value.trim();
      if (!name || !phone) { alert('Please fill in both fields.'); return; }

      navigator.sendBeacon(SHEET_URL, JSON.stringify({
        name, phone, destination: dest, source: 'WhatsApp Button',
        message: message
      }));

      const separator = waHref.includes('?') ? '&' : '?text=';
      const nameNote = encodeURIComponent(`Hi! I'm ${name}. `);
      // Insert the name right after "text=" in the original wa.me URL
      const finalHref = waHref.includes('text=')
        ? waHref.replace('text=', 'text=' + nameNote)
        : waHref + separator + nameNote;

      window.location.href = finalHref;
      overlay.remove();
    });
  }

  // Intercept every WhatsApp link on the page — no HTML changes needed
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const dest = link.dataset.dest || '';
      const rawMsg = decodeURIComponent((link.href.split('text=')[1] || '').replace(/\+/g, ' '));
      openWaModal(dest, rawMsg, link.href);
    });
  });
});