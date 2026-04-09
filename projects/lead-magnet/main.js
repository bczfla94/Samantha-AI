/* ============================================
   SAMANTHA — Lead Magnet Landing Page
   5-Step Client Conversion System
   ============================================ */

// Always start at the top of the page on refresh
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

/* ============================================
   WORD PULL UP ANIMATION
   Ported from landing-page/main.js
   ============================================ */

class WordPullUp {
  /**
   * @param {HTMLElement} el        — the .scramble-line span
   * @param {string}      text      — full text to animate
   * @param {number}      stagger   — seconds between each word (default 0.12)
   * @param {number}      delayMs   — ms before the first word starts
   */
  constructor(el, text, stagger = 0.12, delayMs = 0) {
    const isGradient = el.classList.contains("scramble-line-gradient");
    const words      = text.split(" ");
    const delayS     = delayMs / 1000;

    el.textContent = "";

    words.forEach((word, i) => {
      const clip = document.createElement("span");
      clip.style.cssText = `
        display: inline-block;
        overflow: hidden;
        vertical-align: bottom;
        margin-right: 0.22em;
      `;

      const inner = document.createElement("span");
      inner.textContent = word;
      inner.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(28px);
        animation: wordPullUp 0.55s cubic-bezier(0.2, 0.6, 0.35, 1) forwards;
        animation-delay: ${delayS + i * stagger}s;
      `;

      if (isGradient) {
        inner.style.background          = "linear-gradient(135deg, #DF69FF 0%, #7B21BA 55%, #4B0BA3 100%)";
        inner.style.webkitBackgroundClip = "text";
        inner.style.webkitTextFillColor  = "transparent";
        inner.style.backgroundClip       = "text";
      }

      clip.appendChild(inner);
      el.appendChild(clip);
    });
  }
}

/* ============================================
   BOOK TILT — Hover-only 3D tilt for PDF book
   Simplified from landing-page/main.js CardTilt
   ============================================ */

class BookTilt {
  constructor(book) {
    this.book  = book;
    this.glare = document.getElementById("book-glare");

    this._rotX   = 0;
    this._rotY   = 0;
    this._scale  = 1;

    this._targetRotX  = 0;
    this._targetRotY  = 0;
    this._targetScale = 1;

    this._hovering     = false;
    this._loopRunning  = false;

    // Prevent text selection and native drag when user clicks/drags on the book
    this.book.addEventListener("selectstart", (e) => e.preventDefault());
    this.book.addEventListener("dragstart",   (e) => e.preventDefault());

    this.book.style.transition = "box-shadow 0.4s ease";
    this.book.style.transform  =
      `perspective(900px) rotateX(0deg) rotateY(0deg) rotate(-4deg) scale(1)`;

    this._bindEvents();
  }

  _bindEvents() {
    // Mouse — uses rAF lerp loop for smooth desktop feel
    this.book.addEventListener("mousemove",  (e) => this._onHover(e));
    this.book.addEventListener("mouseleave", ()  => this._onLeave());

    // Touch — applies transform directly (bypasses rAF loop, required for iOS Safari)
    this.book.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      // Smooth transition for the initial press pop — transform eases in, not instant
      this.book.style.transition =
        "transform 0.38s cubic-bezier(0.2, 0.6, 0.3, 1), box-shadow 0.3s ease";
      this._applyTouchTilt(e.touches[0]);
    }, { passive: false });

    this.book.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      // No transform transition while dragging — tilt must track finger instantly
      this.book.style.transition = "box-shadow 0.2s ease";
      this._applyTouchTilt(e.touches[0]);
    }, { passive: false });

    this.book.addEventListener("touchend",    () => this._resetTouchTilt());
    this.book.addEventListener("touchcancel", () => this._resetTouchTilt());
  }

  _applyTouchTilt(touch) {
    const rect = this.book.getBoundingClientRect();
    const x    = (touch.clientX - rect.left) / rect.width;
    const y    = (touch.clientY - rect.top)  / rect.height;
    const rotY =  (x - 0.5) * 16;
    const rotX = -(y - 0.5) * 16;

    this.book.style.transform =
      `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotate(-4deg) scale(1.04)`;
    this.book.style.boxShadow =
      `0 50px 100px rgba(75,11,163,0.55), 0 0 140px rgba(123,33,186,0.3)`;

    if (this.glare) {
      this.glare.style.opacity    = "1";
      this.glare.style.background =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.13) 0%, transparent 60%)`;
    }
  }

  _resetTouchTilt() {
    this.book.style.transition = "transform 0.5s cubic-bezier(0.2,0.8,0.3,1), box-shadow 0.4s ease";
    this.book.style.transform  =
      `perspective(900px) rotateX(0deg) rotateY(0deg) rotate(-4deg) scale(1)`;
    this.book.style.boxShadow  = "";
    if (this.glare) this.glare.style.opacity = "0";
    setTimeout(() => { this.book.style.transition = "box-shadow 0.4s ease"; }, 500);
  }

  _startLoop() {
    if (this._loopRunning) return;
    this._loopRunning = true;
    this._loop();
  }

  _onHover(e) {
    const rect = this.book.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width;
    const y    = (e.clientY - rect.top)  / rect.height;

    this._targetRotY  =  (x - 0.5) * 16;
    this._targetRotX  = -(y - 0.5) * 16;
    this._targetScale = 1.04;

    if (!this._hovering) {
      // Only set these once on hover enter, not every mousemove
      this._hovering = true;
      if (this.glare) this.glare.style.opacity = "1";
      this.book.style.boxShadow =
        `0 50px 100px rgba(75,11,163,0.55), 0 0 140px rgba(123,33,186,0.3)`;
    }

    if (this.glare) {
      this.glare.style.background =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.13) 0%, transparent 60%)`;
    }

    this._startLoop();
  }

  _onLeave() {
    this._targetRotX  = 0;
    this._targetRotY  = 0;
    this._targetScale = 1;
    this._hovering    = false;

    if (this.glare) this.glare.style.opacity = "0";
    this.book.style.boxShadow = "";
    this._startLoop();
  }

  _lerp(a, b, t) {
    return a + (b - a) * t;
  }

  _loop() {
    const t = this._hovering ? 0.10 : 0.08;

    this._rotX  = this._lerp(this._rotX,  this._targetRotX,  t);
    this._rotY  = this._lerp(this._rotY,  this._targetRotY,  t);
    this._scale = this._lerp(this._scale, this._targetScale, t);

    this.book.style.transform =
      `perspective(900px) rotateX(${this._rotX}deg) rotateY(${this._rotY}deg) rotate(-4deg) scale(${this._scale})`;

    // Stop loop when values have fully converged
    const settled =
      Math.abs(this._rotX  - this._targetRotX)  < 0.01 &&
      Math.abs(this._rotY  - this._targetRotY)  < 0.01 &&
      Math.abs(this._scale - this._targetScale) < 0.0005;

    if (settled) {
      this._loopRunning = false;
    } else {
      requestAnimationFrame(() => this._loop());
    }
  }
}

/* ============================================
   PARTICLES
   Ported from landing-page/main.js
   ============================================ */

function initParticles() {
  if (typeof tsParticles === "undefined") return;

  tsParticles.load("hero-particles", {
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      number: {
        value: 40,
        density: { enable: true, width: 800, height: 600 },
      },
      color: { value: ["#DF69FF", "#ffffff", "#7B21BA"] },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.08, max: 0.45 },
        animation: {
          enable: true,
          speed: 1.2,
          sync: false,
          startValue: "random",
        },
      },
      size: {
        value: { min: 0.8, max: 2.2 },
      },
      move: {
        enable: true,
        speed: { min: 0.2, max: 0.6 },
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
      links: { enable: false },
    },
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
    detectRetina: true,
  });
}

/* ============================================
   CARD TILT — Full interactive playing card
   Ported from landing-page/main.js
   ============================================ */

class CardTilt {
  constructor(card) {
    this.card         = card;
    this.glare        = document.getElementById("card-glare");
    this.frontContent = card.querySelector(".card-front-content");
    this.backContent  = card.querySelector(".card-back-content");
    this.isDragging   = false;
    this._isHovering  = false;
    this.dragStartX   = 0;
    this.dragStartY   = 0;
    this.dragRotX     = 0;
    this.dragRotY     = 0;
    // rAF lerp state for smooth hover
    this._rotX        = 0;
    this._rotY        = 0;
    this._targetRotX  = 0;
    this._targetRotY  = 0;
    this._loopRunning  = false;
    this._loopGen      = 0; // incremented on each new loop to cancel stale ones
    this._isSpringBack = false; // blocks hover/leave during spring-back
    this.card.style.transition = "box-shadow 0.4s ease";
    this._bindEvents();
  }

  _bindEvents() {
    this.card.addEventListener("mousemove",  (e) => this._onHover(e));
    this.card.addEventListener("mouseleave", ()  => this._onLeave());
    this.card.addEventListener("mousedown",  (e) => this._onDragStart(e));

    // Store bound refs so we can add/remove them only while dragging
    this._boundDrag    = (e) => this._onDrag(e);
    this._boundDragEnd = ()  => this._onDragEnd();

    this.card.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this._onDragStart(e.touches[0]);
    }, { passive: false });
    this.card.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this._onDrag(e.touches[0]);
    }, { passive: false });
  }

  _setTransform(rotX, rotY, scale = 1) {
    this.card.style.transform =
      `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
  }

  _updateFace(rotX, rotY) {
    const absRotY = ((Math.abs(rotY) % 360) + 360) % 360;
    const absRotX = ((Math.abs(rotX) % 360) + 360) % 360;
    const flipY   = absRotY > 90 && absRotY < 270;
    const flipX   = absRotX > 90 && absRotX < 270;
    const showBack = flipX !== flipY;
    if (this.frontContent) this.frontContent.style.opacity = showBack ? "0" : "1";
    if (this.backContent)  this.backContent.style.opacity  = showBack ? "1" : "0";
    if (this.backContent)  this.backContent.style.transform = flipY ? "scaleX(-1)" : "";
  }

  _setGlare(x, y) {
    if (!this.glare) return;
    this.glare.style.background =
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.13) 0%, transparent 60%)`;
    this.glare.style.opacity = "1";
  }

  _lerp(a, b, t) { return a + (b - a) * t; }

  _startLoop() {
    const gen = ++this._loopGen; // invalidates any previously running loop
    this._loopRunning = true;
    const loop = () => {
      if (gen !== this._loopGen) return; // stale loop — a newer one has started
      const t = this._isHovering ? 0.1 : 0.07;
      this._rotX = this._lerp(this._rotX, this._targetRotX, t);
      this._rotY = this._lerp(this._rotY, this._targetRotY, t);
      this._setTransform(this._rotX, this._rotY, this._isHovering ? 1.03 : 1);
      this._updateFace(this._rotX, this._rotY);
      const settled =
        Math.abs(this._rotX - this._targetRotX) < 0.05 &&
        Math.abs(this._rotY - this._targetRotY) < 0.05;
      if (settled) {
        this._rotX = this._targetRotX;
        this._rotY = this._targetRotY;
        this._loopRunning  = false;
        this._isSpringBack = false;
      } else {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  _onHover(e) {
    if (this.isDragging || this._isSpringBack) return;
    const rect = this.card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width;
    const y    = (e.clientY - rect.top)  / rect.height;
    this._targetRotY =  (x - 0.5) * 22;
    this._targetRotX = -(y - 0.5) * 22;

    if (!this._isHovering) {
      this._isHovering = true;
      this.card.style.boxShadow =
        `0 20px 60px rgba(223,105,255,0.25), 0 0 100px rgba(75,11,163,0.15)`;
    }

    this._setGlare(x * 100, y * 100);
    this._startLoop();
  }

  _onLeave() {
    if (this.isDragging || this._isSpringBack) return;
    this._isHovering = false;
    this._targetRotX = 0;
    this._targetRotY = 0;
    if (this.glare) this.glare.style.opacity = "0";
    this.card.style.boxShadow = "";
    this._startLoop();
  }

  _onDragStart(e) {
    if (e.preventDefault) e.preventDefault();
    this.isDragging = true;
    this._loopGen++; // cancel any running loop
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.card.style.cursor = "grabbing";
    // Only attach global listeners while dragging
    document.addEventListener("mousemove", this._boundDrag);
    document.addEventListener("mouseup",   this._boundDragEnd);
    document.addEventListener("touchend",  this._boundDragEnd);
  }

  _onDrag(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.dragRotY =  dx * 0.4;
    this.dragRotX = -dy * 0.4;
    this._setTransform(this.dragRotX, this.dragRotY, 1.04);
    this._updateFace(this.dragRotX, this.dragRotY);
    this.card.style.boxShadow =
      `0 30px 80px rgba(223,105,255,0.3), 0 0 120px rgba(75,11,163,0.2)`;
  }

  _onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging    = false;
    this._isSpringBack = true;
    this._isHovering   = false;
    this.card.style.cursor    = "grab";
    this.card.style.boxShadow = "";

    // Use CSS transition for spring-back — exactly like mobile
    this.card.style.transition = "transform 0.7s cubic-bezier(0.2,0.8,0.3,1), box-shadow 0.4s ease";
    this.card.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    this._updateFace(0, 0);

    // After animation completes, restore hover-ready state
    setTimeout(() => {
      this.card.style.transition = "box-shadow 0.4s ease";
      this._rotX = 0;
      this._rotY = 0;
      this._targetRotX = 0;
      this._targetRotY = 0;
      this._isSpringBack = false;
    }, 750);

    // Remove global listeners now that drag is done
    document.removeEventListener("mousemove", this._boundDrag);
    document.removeEventListener("mouseup",   this._boundDragEnd);
    document.removeEventListener("touchend",  this._boundDragEnd);
  }
}

/* ============================================
   PROOF GALLERY — IntersectionObserver fade-in + lightbox
   ============================================ */

/* ─── VIDEO TESTIMONIAL PLAYER ─── */
function initVideoPlayer(p, rate) {
  rate = rate || 1.0;
  // p = ID prefix, e.g. 'vt' for Dragana, 'vt2' for Miranda
  const video     = document.getElementById(p + 'Video');
  const overlay   = document.getElementById(p + 'Overlay');
  const vtPlayBtn = document.getElementById(p + 'PlayBtn');
  const toggle    = document.getElementById(p + 'Toggle');
  const iconPlay  = document.getElementById(p + 'IconPlay');
  const iconPause = document.getElementById(p + 'IconPause');
  const muteBtn   = document.getElementById(p + 'Mute');
  const iconVol   = document.getElementById(p + 'IconVol');
  const iconMuted = document.getElementById(p + 'IconMuted');
  const progWrap  = document.getElementById(p + 'ProgWrap');
  const progFill  = document.getElementById(p + 'ProgFill');
  const progThumb = document.getElementById(p + 'ProgThumb');
  const timeEl    = document.getElementById(p + 'Time');
  const volTrack  = document.getElementById(p + 'VolTrack');
  const volFill   = document.getElementById(p + 'VolFill');

  if (!video) return;

  const fmt = s => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const setPlaying = playing => {
    iconPlay.style.display  = playing ? 'none'  : 'block';
    iconPause.style.display = playing ? 'block' : 'none';
    if (!playing) overlay.classList.remove('vt-hidden');
    else          overlay.classList.add('vt-hidden');
  };

  // Big play button (overlay)
  const startPlay = () => {
    video.playbackRate = rate;
    video.play();
    setPlaying(true);
  };
  vtPlayBtn.addEventListener('click', startPlay);
  video.addEventListener('click', () => {
    if (video.paused) { video.play(); setPlaying(true); }
    else              { video.pause(); setPlaying(false); }
  });

  // Controls play/pause
  toggle.addEventListener('click', () => {
    if (video.paused) { video.play(); setPlaying(true); }
    else              { video.pause(); setPlaying(false); }
  });

  // Time update → progress bar
  video.addEventListener('timeupdate', () => {
    const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    progFill.style.width  = pct + '%';
    progThumb.style.left  = pct + '%';
    timeEl.textContent = fmt(video.currentTime / rate) + ' / ' + fmt(video.duration / rate);
  });

  // Show overlay again when ended
  video.addEventListener('ended', () => {
    setPlaying(false);
    video.currentTime = 0;
  });

  // Seek
  const seek = e => {
    const rect = progWrap.getBoundingClientRect();
    const pct  = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = pct * video.duration;
  };
  let seeking = false;
  progWrap.addEventListener('mousedown', e => { seeking = true; seek(e); });
  document.addEventListener('mousemove', e => { if (seeking) seek(e); });
  document.addEventListener('mouseup',   () => { seeking = false; });

  // Touch seek
  progWrap.addEventListener('touchstart', e => {
    seek(e.touches[0]); e.preventDefault();
  }, { passive: false });
  progWrap.addEventListener('touchmove', e => {
    seek(e.touches[0]); e.preventDefault();
  }, { passive: false });

  // Mute
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    iconVol.style.display   = video.muted ? 'none'  : 'block';
    iconMuted.style.display = video.muted ? 'block' : 'none';
    volFill.style.width     = video.muted ? '0%'   : '100%';
  });

  // Volume click
  const setVol = e => {
    const rect = volTrack.getBoundingClientRect();
    const pct  = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    video.volume   = pct;
    video.muted    = pct === 0;
    volFill.style.width     = (pct * 100) + '%';
    iconVol.style.display   = pct === 0 ? 'none'  : 'block';
    iconMuted.style.display = pct === 0 ? 'block' : 'none';
  };
  volTrack.addEventListener('click', setVol);
}

function initProofGallery() {
  const items = document.querySelectorAll(".proof-grid .proof-item");
  if (!items.length) return;

  // Staggered fade-in — only fires when card is meaningfully in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = [...items].indexOf(entry.target);
        const col   = index % (window.innerWidth > 768 ? 3 : 2);
        entry.target.style.transitionDelay = `${col * 140}ms`;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // animate once
        // Clear the stagger delay after the scroll-in completes so hover is instant
        setTimeout(() => { entry.target.style.transitionDelay = "0ms"; }, 900 + col * 140);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -120px 0px"  // don't fire until 120px inside viewport
  });

  items.forEach(item => observer.observe(item));

  // Lightbox
  const lightbox  = document.getElementById("proof-lightbox");
  const lbImg     = document.getElementById("proof-lightbox-img");
  const lbOverlay = document.getElementById("proof-lightbox-overlay");
  const lbClose   = document.getElementById("proof-lightbox-close");
  if (!lightbox) return;

  items.forEach(item => {
    item.addEventListener("click", () => {
      lbImg.src = item.dataset.src;
      lightbox.classList.add("open");
    });
  });

  function closeLightbox() { lightbox.classList.remove("open"); }
  lbOverlay.addEventListener("click", closeLightbox);
  lbClose.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
}

/* ============================================
   FORM HANDLING
   ============================================ */

function validateForm(name, phone, email) {
  const errors = { name: "", phone: "", email: "" };
  let valid = true;

  if (!name.trim()) {
    errors.name = "Please enter your name.";
    valid = false;
  }

  if (!phone.trim()) {
    errors.phone = "Please enter your phone number.";
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    errors.email = "Please enter your email address.";
    valid = false;
  } else if (!emailRegex.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
    valid = false;
  }

  return { valid, errors };
}

function showErrors(errors) {
  ["name", "phone", "email"].forEach((field) => {
    const input     = document.getElementById(`field-${field}`);
    const errorSpan = document.getElementById(`error-${field}`);
    if (!input || !errorSpan) return;

    if (errors[field]) {
      errorSpan.textContent = errors[field];
      input.classList.add("input-error");
    } else {
      errorSpan.textContent = "";
      input.classList.remove("input-error");
    }
  });
}

function clearErrors() {
  showErrors({ name: "", phone: "", email: "" });
}

function showSuccessState(container) {
  container.innerHTML = `
    <div class="form-success">
      <div class="success-icon">✓</div>
      <h3 class="success-heading">You're in! Check your email.</h3>
      <p class="success-sub">Your 5 Step Client Conversion System is on its way to your inbox.</p>
    </div>
  `;
}

function initForm() {
  const form      = document.getElementById("optin-form");
  const container = document.getElementById("form-container");
  if (!form || !container) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const name  = document.getElementById("field-name").value;
    const phone = document.getElementById("field-phone").value;
    const email = document.getElementById("field-email").value;

    const { valid, errors } = validateForm(name, phone, email);

    if (!valid) {
      showErrors(errors);
      return;
    }

    // TODO: wire up your email/SMS provider here (e.g. ActiveCampaign, Zapier webhook)
    // fetch('/api/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify({ name, phone, email }),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    showSuccessState(container);
  });

  // Clear field-level errors on input
  ["field-name", "field-phone", "field-email"].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", () => {
      input.classList.remove("input-error");
      const fieldName = id.replace("field-", "");
      const errorSpan = document.getElementById(`error-${fieldName}`);
      if (errorSpan) errorSpan.textContent = "";
    });
  });
}

/* ============================================
   LOGO BACKGROUND REMOVAL
   Uses Canvas to strip white pixels from the
   NLC logo PNG so it floats on the dark book
   ============================================ */

function removeLogoBg() {
  const img = document.querySelector(".book-logo-img");
  if (!img) return;

  const process = () => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = imageData.data;

      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i + 1], b = px[i + 2];
        // Fade out near-white pixels — smooth edge by scaling alpha
        const brightness = (r + g + b) / 3;
        if (brightness > 200) {
          // Smooth transition: fully white = fully transparent
          px[i + 3] = Math.round(255 * (1 - (brightness - 200) / 55));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      img.src = canvas.toDataURL("image/png");
    } catch (e) {
      // Canvas blocked (e.g. strict CORS) — leave image as-is
      console.warn("Logo bg removal skipped:", e);
    }
  };

  if (img.complete && img.naturalWidth > 0) {
    process();
  } else {
    img.addEventListener("load", process, { once: true });
  }
}

/* ============================================
   INIT
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Hero text animation
  document.querySelectorAll(".scramble-line").forEach((el) => {
    const text  = el.dataset.text;
    const delay = parseInt(el.dataset.delay || "0", 10);
    if (text) new WordPullUp(el, text, 0.12, delay);
  });

  // Book tilt — enabled on all devices including touch
  const bookEl = document.getElementById("hero-book");
  if (bookEl) new BookTilt(bookEl);

  // Card tilt — desktop only (touch devices skip)
  const cardEl = document.getElementById("playing-card");
  const isTouchDevice = window.matchMedia("(hover: none)").matches;
  if (cardEl && !isTouchDevice) new CardTilt(cardEl);

  // Mobile card drag — completely separate from CardTilt, touch devices only
  if (cardEl && isTouchDevice) {
    const frontContent = cardEl.querySelector(".card-front-content");
    const backContent  = cardEl.querySelector(".card-back-content");
    let startX = 0, startY = 0, isDragging = false;

    function setCardTransform(rotX, rotY, scale, transition) {
      cardEl.style.transition = transition || "none";
      cardEl.style.transform  = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    }

    function updateFace(rotX, rotY) {
      const absY = ((Math.abs(rotY) % 360) + 360) % 360;
      const absX = ((Math.abs(rotX) % 360) + 360) % 360;
      const showBack = (absY > 90 && absY < 270) !== (absX > 90 && absX < 270);
      if (frontContent) frontContent.style.opacity = showBack ? "0" : "1";
      if (backContent)  backContent.style.opacity  = showBack ? "1" : "0";
      if (backContent)  backContent.style.transform = (((Math.abs(rotY) % 360) + 360) % 360 > 90) ? "scaleX(-1)" : "";
    }

    cardEl.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      cardEl.style.transition = "none";
    }, { passive: false });

    cardEl.addEventListener("touchmove", (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      const rotY =  dx * 0.4;
      const rotX = -dy * 0.4;
      setCardTransform(rotX, rotY, 1.04);
      updateFace(rotX, rotY);
      cardEl.style.boxShadow = "0 30px 80px rgba(223,105,255,0.3), 0 0 120px rgba(75,11,163,0.2)";
    }, { passive: false });

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      setCardTransform(0, 0, 1, "transform 0.7s cubic-bezier(0.2,0.8,0.3,1)");
      updateFace(0, 0);
      cardEl.style.boxShadow = "";
    }

    cardEl.addEventListener("touchend",    onEnd);
    cardEl.addEventListener("touchcancel", onEnd);
  }

  // Particle background
  initParticles();

  // Remove white background from NLC logo PNG
  removeLogoBg();

  // Video testimonial players — Dragana sped up, Miranda + Player 3 at normal speed
  initVideoPlayer('vt', 1.1);
  initVideoPlayer('vt2', 1.0);
  initVideoPlayer('vt3', 1.0);

  // Proof gallery scroll-scrub + lightbox
  initProofGallery();


  // Opt-in form
  initForm();

  // Prevent pinch-to-zoom on iOS Safari
  document.addEventListener("touchmove", (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener("gesturestart",  (e) => e.preventDefault(), { passive: false });
  document.addEventListener("gesturechange", (e) => e.preventDefault(), { passive: false });
  document.addEventListener("gestureend",    (e) => e.preventDefault(), { passive: false });
});
