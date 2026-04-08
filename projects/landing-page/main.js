/* ============================================
   SAMANTHA — Word Pull Up Animation
   Ported from 21st.dev WordPullUp component
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

    // Clear placeholder content
    el.textContent = "";

    words.forEach((word, i) => {
      // Outer wrapper clips the upward motion
      const clip = document.createElement("span");
      clip.style.cssText = `
        display: inline-block;
        overflow: hidden;
        vertical-align: bottom;
        margin-right: 0.22em;
      `;

      // Inner span that animates
      const inner = document.createElement("span");
      inner.textContent = word;
      inner.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(28px);
        animation: wordPullUp 0.55s cubic-bezier(0.2, 0.6, 0.35, 1) forwards;
        animation-delay: ${delayS + i * stagger}s;
      `;

      // Gradient words get the brand gradient applied per-span
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
   PLAYING CARD — 3D Tilt + Drag Rotation
   ============================================ */
class CardTilt {
  constructor(card) {
    this.card         = card;
    this.glare        = document.getElementById("card-glare");
    this.frontContent = card.querySelector(".card-front-content");
    this.backContent  = card.querySelector(".card-back-content");
    this.isDragging   = false;
    this.dragStartX  = 0;
    this.dragStartY  = 0;
    this.dragRotX    = 0;
    this.dragRotY    = 0;

    this._bindEvents();
  }

  _bindEvents() {
    this.card.addEventListener("mousemove",  (e) => this._onHover(e));
    this.card.addEventListener("mouseleave", ()  => this._onLeave());
    this.card.addEventListener("mousedown",  (e) => this._onDragStart(e));
    document.addEventListener("mousemove",   (e) => this._onDrag(e));
    document.addEventListener("mouseup",     ()  => this._onDragEnd());

    // Touch support
    this.card.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this._onDragStart(e.touches[0]);
    }, { passive: false });
    this.card.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this._onDrag(e.touches[0]);
    }, { passive: false });
    document.addEventListener("touchend", () => this._onDragEnd());
  }

  _setTransform(rotX, rotY, scale = 1) {
    this.card.style.transform =
      `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
  }

  // Swap front/back based on X or Y rotation crossing ±90°
  _updateFace(rotX, rotY) {
    const absRotY = ((Math.abs(rotY) % 360) + 360) % 360;
    const absRotX = ((Math.abs(rotX) % 360) + 360) % 360;
    const flipY    = absRotY > 90 && absRotY < 270;
    const flipX    = absRotX > 90 && absRotX < 270;
    const showBack = flipX !== flipY; // XOR: both flipped = back to front

    this.frontContent.style.opacity = showBack ? "0" : "1";
    this.backContent.style.opacity  = showBack ? "1" : "0";

    // Counter the mirror effect for whichever axis caused the flip.
    // Y-axis flip mirrors horizontally — cancel with scaleX(-1) so back reads correctly.
    // X-axis flip makes content upside down via CSS rotateX — leave it, that's physically correct.
    if (flipY) {
      this.backContent.style.transform = "scaleX(-1)";
    } else {
      this.backContent.style.transform = "";
    }
  }

  _setGlare(x, y) {
    if (!this.glare) return;
    this.glare.style.background =
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.13) 0%, transparent 60%)`;
  }

  _onHover(e) {
    if (this.isDragging) return;
    const rect    = this.card.getBoundingClientRect();
    const x       = (e.clientX - rect.left) / rect.width;   // 0–1
    const y       = (e.clientY - rect.top)  / rect.height;  // 0–1
    const rotY    =  (x - 0.5) * 22;   // -11 to +11
    const rotX    = -(y - 0.5) * 22;

    this.card.style.transition = "transform 0.1s ease, box-shadow 0.3s ease";
    this._setTransform(rotX, rotY, 1.03);
    this._setGlare(x * 100, y * 100);

    this.card.style.boxShadow =
      `0 20px 60px rgba(223,105,255,0.25), 0 0 100px rgba(75,11,163,0.15)`;
  }

  _onLeave() {
    if (this.isDragging) return;
    this.card.style.transition = "transform 0.6s cubic-bezier(0.2,0.8,0.3,1), box-shadow 0.4s ease";
    this._setTransform(0, 0, 1);
    this.card.style.boxShadow = "";
  }

  _onDragStart(e) {
    if (e.preventDefault) e.preventDefault();
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.card.style.transition = "box-shadow 0.3s ease";
    this.card.style.cursor = "grabbing";
  }

  _onDrag(e) {
    if (!this.isDragging) return;
    const dx   = e.clientX - this.dragStartX;
    const dy   = e.clientY - this.dragStartY;
    this.dragRotY =  dx * 0.4;
    this.dragRotX = -dy * 0.4;
    this._setTransform(this.dragRotX, this.dragRotY, 1.04);
    this._updateFace(this.dragRotX, this.dragRotY);
    this.card.style.boxShadow =
      `0 30px 80px rgba(223,105,255,0.3), 0 0 120px rgba(75,11,163,0.2)`;
  }

  _onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.card.style.cursor = "grab";
    this.card.style.transition = "transform 0.7s cubic-bezier(0.2,0.8,0.3,1), box-shadow 0.4s ease";
    this._setTransform(0, 0, 1);
    this._updateFace(0, 0); // always return to front
    this.card.style.boxShadow = "";
  }
}

/* --- Subtle sparkle particles in hero background --- */
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

/* --- Initialize all scramble lines on page load --- */
document.addEventListener("DOMContentLoaded", () => {
  // Playing card tilt
  const cardEl = document.getElementById("playing-card");
  if (cardEl) new CardTilt(cardEl);

  // Word pull-up
  document.querySelectorAll(".scramble-line").forEach((el) => {
    const text  = el.dataset.text;
    const delay = parseInt(el.dataset.delay || "0", 10);
    if (text) {
      new WordPullUp(el, text, 0.12, delay);
    }
  });

  // Particles
  initParticles();

  // FAQ accordion
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      // Close all
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Sticky mobile CTA — show after hero scrolls out of view
  const stickyCta = document.getElementById("sticky-cta");
  const heroSection = document.querySelector(".hero");
  if (stickyCta && heroSection) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        stickyCta.classList.toggle("visible", !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    heroObserver.observe(heroSection);
  }

  // Prevent pinch-to-zoom on iOS Safari
  document.addEventListener("touchmove", (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener("gesturestart",  (e) => e.preventDefault(), { passive: false });
  document.addEventListener("gesturechange", (e) => e.preventDefault(), { passive: false });
  document.addEventListener("gestureend",    (e) => e.preventDefault(), { passive: false });
});
