// ===== WhatsApp number — change this one line to update it everywhere =====
const WHATSAPP_NUMBER = '919107303333'; // country code + number, no + or spaces

// ===== Google Sheet leads endpoint =====
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwKIO_dPdb_2p1urX4dmvprOpMMm5C2lrx9cCBYvKZaitUuWH4VQqo04TH_bhdABGniiQ/exec';
                  
                  

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

    // Desktop call button — shows number popup instead of dialing directly
  const navCallBtn = document.getElementById('navCallBtn');
  if (navCallBtn) {
    const isDesktop = window.matchMedia('(min-width:821px)').matches;

    if (isDesktop) {
      navCallBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Close if already open
        const existing = document.querySelector('.call-popup');
        if (existing) { existing.remove(); return; }

        const popup = document.createElement('div');
        popup.className = 'call-popup';
               popup.innerHTML = `
          <div style="margin-bottom:8px;">Call us:</div>
           <a href="tel:+919107303333">+91 91073 03333</a><br>
          <a href="tel:+919496375555">+91 94963 75555</a>
          
        `;
        navCallBtn.appendChild(popup);

        requestAnimationFrame(() => popup.classList.add('show'));

        // Close when clicking outside
        const closeOnOutsideClick = (evt) => {
          if (!navCallBtn.contains(evt.target)) {
            popup.remove();
            document.removeEventListener('click', closeOnOutsideClick);
          }
        };
        setTimeout(() => document.addEventListener('click', closeOnOutsideClick), 10);
      });
    }
  }

    // Typewriter effect for hero CTA pill text — starts only after the page loader finishes
  const ctaTypewriter = document.getElementById('ctaTypewriter');
  if (ctaTypewriter) {
    const fullText = 'Book your trip now';
    let i = 0;

    function typeChar() {
      if (i <= fullText.length) {
        ctaTypewriter.textContent = fullText.slice(0, i);
        i++;
        setTimeout(typeChar, 55);
      } else {
        ctaTypewriter.classList.add('done');
      }
    }

    function startTypewriter() {
      setTimeout(typeChar, 400);
    }

    if (pageLoader) {
      // If the loader exists and is actively showing, wait for it to finish first
      const alreadyShown = sessionStorage.getItem('flyapnaLoaderShown');
      if (!alreadyShown) {
        // Loader is about to run — wait for it to hide, then start typing
        const loaderCheck = setInterval(() => {
          if (pageLoader.classList.contains('hidden') || !document.body.contains(pageLoader)) {
            clearInterval(loaderCheck);
            startTypewriter();
          }
        }, 100);
      } else {
        // Loader already shown this session — skip straight to typing
        startTypewriter();
      }
    } else {
      startTypewriter();
    }
  }


    // Testimonial carousel — click-to-slide dots, auto-slide stops on manual interaction
  const testimonialWrap = document.querySelector('.testimonial-carousel-wrap');
  if (testimonialWrap) {
    const tTrack = testimonialWrap.querySelector('.testimonial-carousel-track');
    const tPages = tTrack.querySelectorAll('.testimonial-page');
    const tDotsWrap = testimonialWrap.querySelector('.testimonial-dots');
    let tIdx = 0;
    let tTimer;

    function tGoTo(i) {
      tIdx = (i + tPages.length) % tPages.length;
      tTrack.style.transform = `translateX(-${tIdx * 100}%)`;
      tDotsWrap.querySelectorAll('.testimonial-dot').forEach((d, di) => {
        d.classList.toggle('active', di === tIdx);
      });
    }

    function tStartAutoSlide() {
      clearInterval(tTimer);
      tTimer = setInterval(() => tGoTo(tIdx + 1), 5000);
    }

    tPages.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        tGoTo(i);
        clearInterval(tTimer); // permanently stop auto-slide once user manually clicks
      });
      tDotsWrap.appendChild(dot);
    });

    tStartAutoSlide();
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
          <input type="tel" id="waPhone" placeholder="10-digit number" required pattern="[0-9]{10}" maxlength="10" inputmode="numeric" title="Please enter a valid 10-digit phone number">
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


    // Restrict phone number fields to digits only, live as the user types
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  });

    // Restrict "From Date" and "To Date" fields to today or later
  const todayStr = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD

  const fromDateInput = document.getElementById('tf_fromdate');
  const toDateInput = document.getElementById('tf_todate');

  if (fromDateInput) {
    fromDateInput.setAttribute('min', todayStr);
  }
  if (toDateInput) {
    toDateInput.setAttribute('min', todayStr);
  }

  // Keep "To Date" always >= "From Date" once a from-date is chosen
  if (fromDateInput && toDateInput) {
    fromDateInput.addEventListener('change', () => {
      if (fromDateInput.value) {
        toDateInput.setAttribute('min', fromDateInput.value);
        // If the already-selected "to date" is now before the new "from date", clear it
        if (toDateInput.value && toDateInput.value < fromDateInput.value) {
          toDateInput.value = '';
        }
      }
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