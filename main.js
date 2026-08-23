// ===== WhatsApp number — change this one line to update it everywhere =====
const WHATSAPP_NUMBER = '919107303333'; // country code + number, no + or spaces

// ===== Google Sheet leads endpoint =====
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyaEmrPaYek26WPHpRed87jTq_Zxs9pK-gMlMuJgKPjbQkrcrdNM3D_C6A2XvfXgDqYtQ/exec';

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

    // Page loader — shows only on first visit per browser session
  const pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    const alreadyShown = sessionStorage.getItem('flyapnaLoaderShown');

    if (alreadyShown) {
      // Skip the loader entirely on repeat visits this session
      pageLoader.remove();
    } else {
      const heroVid = document.getElementById('heroVideo');
      const minTime = new Promise(resolve => setTimeout(resolve, 3000));
      const videoReady = heroVid
        ? new Promise(resolve => {
            if (heroVid.readyState >= 3) return resolve();
            heroVid.addEventListener('canplaythrough', resolve, { once: true });
            setTimeout(resolve, 6000);
          })
        : Promise.resolve();

      Promise.all([minTime, videoReady]).then(() => {
        pageLoader.classList.add('hidden');
        setTimeout(() => pageLoader.remove(), 700);
        sessionStorage.setItem('flyapnaLoaderShown', 'true');
      });
    }
  }

  // Homepage destinations — vertical stack of 3, whole group slides right, mobile only
  const carouselWrap = document.querySelector('.dest-carousel-wrap');
  if (carouselWrap) {
    const track = carouselWrap.querySelector('.dest-carousel-track');
    const pages = track.querySelectorAll('.dest-page');
    const dotsWrap = carouselWrap.querySelector('.dest-dots');
    let idx = 0;
    let timer;

    function goTo(i) {
      idx = (i + pages.length) % pages.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dotsWrap.querySelectorAll('.dest-dot').forEach((d, di) => {
        d.classList.toggle('active', di === idx);
      });
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      pages.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dest-dot' + (i === 0 ? ' active' : '');
        dotsWrap.appendChild(dot);
      });
    }

    function startAutoSlide() {
      clearInterval(timer);
      if (!window.matchMedia('(max-width:600px)').matches || pages.length < 2) return;
      timer = setInterval(() => goTo(idx + 1), 3800);
    }
    function stopAutoSlide() { clearInterval(timer); }

    buildDots();
    startAutoSlide();

       let startX = 0;
    let currentX = 0;
    let isDragging = false;
    

    carouselWrap.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lockedDirection = null;
      isDragging = true;
      track.style.transition = 'none';
    }, { passive: true });

        let startY = 0;
    let lockedDirection = null; // 'horizontal' or 'vertical'

    carouselWrap.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      // Decide swipe direction once, early in the gesture
      if (!lockedDirection) {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 6) {
          lockedDirection = 'horizontal';
        } else if (Math.abs(diffY) > 6) {
          lockedDirection = 'vertical';
        }
      }

      if (lockedDirection === 'horizontal') {
        e.preventDefault(); // stop page scroll only for horizontal swipes
        const percentDiff = (diffX / carouselWrap.offsetWidth) * 100;
        track.style.transform = `translateX(calc(-${idx * 100}% + ${percentDiff}%))`;
      }
      // if vertical, do nothing — let the page scroll normally
    }, { passive: false });

    carouselWrap.addEventListener('touchend', () => {
      isDragging = false;
      track.style.transition = 'transform 0.75s cubic-bezier(.22,1,.36,1)';
      const diff = currentX - startX;
      const threshold = carouselWrap.offsetWidth * 0.15;

      if (diff > threshold) {
        goTo(idx - 1);
      } else if (diff < -threshold) {
        goTo(idx + 1);
      } else {
        goTo(idx);
      }

      currentX = 0;
      startX = 0;
      userInteracted = true; // mark that the user manually swiped
      clearInterval(timer); // permanently stop autoplay
    }, { passive: true });
  }

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

  // Destinations page — live search filter
  const destSearchInput = document.getElementById('destSearchInput');
  const destGrid = document.getElementById('destGrid');
  const destNoResults = document.getElementById('destNoResults');
  const destQueryText = document.getElementById('destQueryText');

  if (destSearchInput && destGrid) {
    const cards = Array.from(destGrid.querySelectorAll('.dest-card'));

    destSearchInput.addEventListener('input', () => {
      const query = destSearchInput.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(card => {
        const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const tagline = (card.querySelector('.tagline')?.textContent || '').toLowerCase();
        const code = (card.querySelector('.code')?.textContent || '').toLowerCase();
        const matches = !query || name.includes(query) || tagline.includes(query) || code.includes(query);

        card.dataset.hidden = matches ? 'false' : 'true';
        if (matches) visibleCount++;
      });

      if (destNoResults) {
        if (visibleCount === 0 && query) {
          destQueryText.textContent = destSearchInput.value.trim();
          destNoResults.hidden = false;
        } else {
          destNoResults.hidden = true;
        }
      }
    });
  }

  // Fade in the image-band quote every time it scrolls into view
  const bandText = document.querySelector('.image-band__text');
  if (bandText) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bandText.classList.add('in-view');
        } else {
          bandText.classList.remove('in-view');
        }
      });
    }, { threshold: 0.35 });

    observer.observe(bandText);
  }

  // Scroll-triggered 3D depth reveal for sections — plays once per section
  const revealEls = document.querySelectorAll('.reveal-3d');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // Itinerary day toggle/accordion
  document.querySelectorAll('.itinerary-day').forEach(day => {
    const header = day.querySelector('.itinerary-day__header');
    if (header) {
      header.addEventListener('click', () => {
        day.classList.toggle('open');
      });
    }
  });


    // Sticky navbar — homepage only, turns white after scrolling
  const homeNavbar = document.querySelector('.navbar-home-sticky');
  if (homeNavbar) {
    const toggleScrolled = () => {
      if (window.scrollY > 60) {
        homeNavbar.classList.add('scrolled');
      } else {
        homeNavbar.classList.remove('scrolled');
      }
    };
    toggleScrolled();
    window.addEventListener('scroll', toggleScrolled, { passive: true });
  }

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