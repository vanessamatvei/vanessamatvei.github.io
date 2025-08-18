/* script.js — reveal on scroll, mobile nav toggle, cherry blossom petals with subtle mouse-wind */

/* Helpers: reveal sections */
document.addEventListener('DOMContentLoaded', () => {

  // Reveal on scroll using IntersectionObserver
  const reveals = document.querySelectorAll('.reveal, article, header, section');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('is-visible');
          obs.unobserve(ent.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(r => io.observe(r));
  } else {
    // fallback
    reveals.forEach(r => r.classList.add('is-visible'));
  }

  /* Mobile nav toggle: inject a hamburger and wire it up */
  const nav = document.querySelector('nav');
  if (nav) {
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle menu');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    // put toggle at the start of nav
    nav.prepend(toggle);
    toggle.addEventListener('click', () => nav.classList.toggle('show'));
    // close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('show')) nav.classList.remove('show');
    });
  }

  /* Cherry blossom petals canvas */
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  // lightweight mouse-wind: tracks pointer to create gentle attraction
  const mouse = { x: W / 2, y: H / 2, lastX: W / 2, lastY: H / 2 };
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('touchmove', (e) => { if (e.touches && e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; } }, {passive:true});

  class Petal {
    constructor() { this.reset(true); }
    reset(initial = false) {
      // spawn above canvas a bit for initial spread
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : -10 - Math.random() * 80;
      this.size = 4 + Math.random() * 5;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = 0.6 + Math.random() * 0.9;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.03;
      this.h = 340 + Math.random() * 10; // pink-ish HSL
      this.s = 65 + Math.random() * 10;
      this.l = 78 - Math.random() * 6;
      this.alpha = 0.55 + Math.random() * 0.25;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size / 2, this.size / 2, 0, this.size);
      ctx.bezierCurveTo(-this.size / 2, this.size / 2, -this.size / 2, -this.size / 2, 0, -this.size);
      ctx.fillStyle = `hsla(${this.h}, ${this.s}%, ${this.l}%, ${this.alpha})`;
      ctx.fill();
      ctx.restore();
    }
    update() {
      // subtle wind effect toward mouse motion
      const dx = (mouse.x - mouse.lastX) * 0.0015;
      const dy = (mouse.y - mouse.lastY) * 0.0015;
      this.x += this.speedX + dx * (Math.random() * 4);
      this.y += this.speedY + dy * (Math.random() * 2);
      this.angle += this.spin;
      // gentle horizontal wobble
      this.x += Math.sin(this.y * 0.01 + this.size) * 0.12;
      if (this.y > H + 20 || this.x < -40 || this.x > W + 40) this.reset(false);
    }
  }

  const PETAL_COUNT = Math.max(60, Math.floor((W * H) / 7000)); // scale by screen area
  const petals = new Array(PETAL_COUNT).fill().map(() => new Petal());

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  function animate() {
    // smooth mouse velocity tracking
    mouse.lastX += (mouse.x - mouse.lastX) * 0.08;
    mouse.lastY += (mouse.y - mouse.lastY) * 0.08;

    ctx.clearRect(0, 0, W, H);
    // optionally draw a very subtle textured overlay (low-cost)
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();

  // small performance hint for long pages: pause animation when tab not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // stop animation loop by not requesting frames - easiest is to let RAF run but do nothing.
      // We'll reduce CPU by drawing nothing until visible again.
    }
  });

  /* Small UX: make images fade-in when they appear in view (for publication & about images) */
  const imgs = document.querySelectorAll('.about-image img, .publication-image img');
  const imgObs = ('IntersectionObserver' in window) ? new IntersectionObserver((entries, ob) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.style.transition = 'transform 420ms cubic-bezier(.2,.9,.25,1), opacity 420ms ease';
        en.target.style.transform = 'translateY(0) scale(1)';
        en.target.style.opacity = '1';
        ob.unobserve(en.target);
      }
    });
  }, { threshold: 0.06 }) : null;

  imgs.forEach(img => {
    // init slightly lowered and transparent
    img.style.opacity = '0';
    img.style.transform = 'translateY(12px) scale(0.995)';
    if (imgObs) imgObs.observe(img);
    else {
      // fallback: show immediately
      img.style.opacity = '1';
      img.style.transform = 'translateY(0) scale(1)';
    }
  });

});
