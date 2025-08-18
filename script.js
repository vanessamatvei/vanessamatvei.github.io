/* script.js — reveal on scroll, mobile nav toggle, footer-only petals animation, image fade-ins,
   plus contact form submission handling (Formspree + mailto fallback) */

document.addEventListener('DOMContentLoaded', () => {

  /*********** Reveal on scroll (unchanged) ***********/
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
    reveals.forEach(r => r.classList.add('is-visible'));
  }

  /*********** Mobile nav toggle ***********/
  const nav = document.querySelector('nav');
  if (nav) {
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle menu');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.prepend(toggle);
    toggle.addEventListener('click', () => nav.classList.toggle('show'));
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('show')) nav.classList.remove('show');
    });
  }

  /*********** Image fade-in for about/publication images ***********/
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
    img.style.opacity = '0';
    img.style.transform = 'translateY(12px) scale(0.995)';
    if (imgObs) imgObs.observe(img);
    else {
      img.style.opacity = '1';
      img.style.transform = 'translateY(0) scale(1)';
    }
  });

  /*********** FOOTER-ONLY PETALS ANIMATION (unchanged behavior) ***********/
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  const fcanvas = document.createElement('canvas');
  fcanvas.className = 'footer-canvas';
  Object.assign(fcanvas.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  });
  Array.from(footer.children).forEach(ch => {
    ch.style.position = ch.style.position || 'relative';
    ch.style.zIndex = 2;
  });
  footer.appendChild(fcanvas);

  const fctx = fcanvas.getContext('2d');
  let FW = fcanvas.width = footer.clientWidth;
  let FH = fcanvas.height = footer.clientHeight;

  class FooterPetal {
    constructor(initial = true) { this.reset(initial); }
    reset(initial = false) {
      this.x = Math.random() * FW;
      this.y = initial ? Math.random() * FH : -10 - Math.random() * 60;
      this.size = 3 + Math.random() * 6;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = 0.4 + Math.random() * 0.9;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.04;
      this.h = 340 + Math.random() * 12;
      this.s = 62 + Math.random() * 8;
      this.l = 76 - Math.random() * 8;
      this.alpha = 0.5 + Math.random() * 0.35;
      this.wobble = 0.08 + Math.random() * 0.18;
    }
    draw(ctx) {
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
    update(mouseVelX = 0, mouseVelY = 0) {
      this.x += this.speedX + mouseVelX * (Math.random() * 3);
      this.y += this.speedY + mouseVelY * (Math.random() * 2);
      this.angle += this.spin;
      this.x += Math.sin(this.y * this.wobble + this.size) * 0.4;
      if (this.y > FH + 20 || this.x < -40 || this.x > FW + 40) this.reset(false);
    }
  }

  let fpetals = new Array(Math.max(12, Math.floor((FW * FH) / 12000))).fill().map(() => new FooterPetal(true));

  const mouse = { x: FW / 2, y: FH / 2, lastX: FW / 2, lastY: FH / 2 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = Math.max(0, Math.min(FW, e.clientX - footer.getBoundingClientRect().left));
    mouse.y = Math.max(0, Math.min(FH, e.clientY - footer.getBoundingClientRect().top));
  });

  function resizeFooterCanvas() {
    FW = fcanvas.width = footer.clientWidth;
    FH = fcanvas.height = footer.clientHeight;
    fpetals = new Array(Math.max(12, Math.floor((FW * FH) / 12000))).fill().map(() => new FooterPetal(true));
  }
  window.addEventListener('resize', () => resizeFooterCanvas());

  let rafId = null;
  let animating = false;
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) startFooterAnim();
      else stopFooterAnim();
    });
  }, { threshold: 0.02 });
  footerObserver.observe(footer);

  function startFooterAnim() {
    if (animating) return;
    animating = true;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    loop();
  }
  function stopFooterAnim() {
    animating = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    fctx.clearRect(0, 0, FW, FH);
  }
  function loop() {
    const vx = (mouse.x - mouse.lastX) * 0.02;
    const vy = (mouse.y - mouse.lastY) * 0.02;
    mouse.lastX += (mouse.x - mouse.lastX) * 0.12;
    mouse.lastY += (mouse.y - mouse.lastY) * 0.12;
    fctx.clearRect(0, 0, FW, FH);
    for (let p of fpetals) { p.update(vx, vy); p.draw(fctx); }
    rafId = requestAnimationFrame(loop);
  }
  resizeFooterCanvas();
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) stopFooterAnim();

  /*********** CONTACT FORM HANDLING ***********/
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const statusEl = document.getElementById('formStatus');
    const submitBtn = document.getElementById('contactSubmit');

    // Use data-endpoint attribute as Formspree endpoint. If it's the placeholder or empty, fallback to mailto.
    const endpoint = contactForm.dataset.endpoint && !contactForm.dataset.endpoint.includes('yourFormID')
      ? contactForm.dataset.endpoint
      : null;

    function showStatus(msg, isError = false) {
      statusEl.textContent = msg;
      statusEl.style.color = isError ? '#b02a2a' : '#3a6b4a';
      if (!isError) contactForm.reset();
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // basic validation
      const firstName = contactForm.firstName.value.trim();
      const lastName = contactForm.lastName.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      const hp = contactForm._hp ? contactForm._hp.value : '';
      if (hp) { // honeypot filled - likely spam
        return showStatus('Thanks — message received.', true);
      }
      if (!firstName || !lastName || !email || !message) {
        return showStatus('Please complete all fields before sending.', true);
      }
      // simple email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showStatus('Please enter a valid email address.', true);
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        if (endpoint) {
          // POST to Formspree (JSON). Replace endpoint with your actual Formspree form ID URL.
          const payload = {
            firstName, lastName, email, message, _subject: `Website message from ${firstName} ${lastName}`
          };
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            showStatus('Thanks — your message was sent!', false);
          } else {
            const data = await res.json().catch(()=>({}));
            const errMsg = data && data.error ? data.error : 'Error sending message. Try using the email link below.';
            showStatus(errMsg, true);
          }
        } else {
          // Fallback: open mail client with mailto: (prefill)
          const subject = encodeURIComponent(`Website message from ${firstName} ${lastName}`);
          const body = encodeURIComponent(`Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`);
          window.location.href = `mailto:vanessamatvei@gmail.com?subject=${subject}&body=${body}`;
          showStatus('Your email client should open. If not, use the email link below.', false);
        }
      } catch (err) {
        console.error(err);
        showStatus('Network error — please try again or email me directly.', true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      }
    });
  }

});



/* document.addEventListener('DOMContentLoaded', () => {

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
    reveals.forEach(r => r.classList.add('is-visible'));
  }

  // Mobile nav toggle: inject a hamburger and wire it up
  const nav = document.querySelector('nav');
  if (nav) {
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle menu');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.prepend(toggle);
    toggle.addEventListener('click', () => nav.classList.toggle('show'));
    // close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('show')) nav.classList.remove('show');
    });
  }

  // Image fade-in for about/publication images
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
    img.style.opacity = '0';
    img.style.transform = 'translateY(12px) scale(0.995)';
    if (imgObs) imgObs.observe(img);
    else {
      img.style.opacity = '1';
      img.style.transform = 'translateY(0) scale(1)';
    }
  });

  /* FOOTER-ONLY PETALS ANIMATION
     - Creates a canvas positioned inside the footer (.site-footer)
     - Starts the animation when the footer enters viewport, pauses when it leaves
     - Draws petals constrained to the footer area so they don't overlap main content
  */
  /*const footer = document.querySelector('.site-footer');
  if (!footer) return;

  // create canvas inside footer
  const fcanvas = document.createElement('canvas');
  fcanvas.className = 'footer-canvas';
  // style via JS to ensure stacking and positioning
  Object.assign(fcanvas.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1, // behind footer text that we'll keep at z-index 2
  });
  // ensure footer children (text) are above the canvas
  Array.from(footer.children).forEach(ch => {
    ch.style.position = ch.style.position || 'relative';
    ch.style.zIndex = 2;
  });
  footer.appendChild(fcanvas);

  const fctx = fcanvas.getContext('2d');

  let FW = fcanvas.width = footer.clientWidth;
  let FH = fcanvas.height = footer.clientHeight;

  // Petal class localized to footer coordinates
  class FooterPetal {
    constructor(initial = true) {
      this.reset(initial);
    }
    reset(initial = false) {
      this.x = Math.random() * FW;
      this.y = initial ? Math.random() * FH : -10 - Math.random() * 60; // spawn above footer when recycled
      this.size = 3 + Math.random() * 6;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = 0.4 + Math.random() * 0.9;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.04;
      this.h = 340 + Math.random() * 12; // pink-ish hue
      this.s = 62 + Math.random() * 8;
      this.l = 76 - Math.random() * 8;
      this.alpha = 0.5 + Math.random() * 0.35;
      // small horizontal wobble amplitude tuned for footer
      this.wobble = 0.08 + Math.random() * 0.18;
    }
    draw(ctx) {
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
    update(mouseVelX = 0, mouseVelY = 0) {
      // subtle attraction to mouse movement while constrained in footer
      this.x += this.speedX + mouseVelX * (Math.random() * 3);
      this.y += this.speedY + mouseVelY * (Math.random() * 2);
      this.angle += this.spin;
      this.x += Math.sin(this.y * this.wobble + this.size) * 0.4;
      // recycle when below footer
      if (this.y > FH + 20 || this.x < -40 || this.x > FW + 40) this.reset(false);
    }
  }

  // create petals sized to footer area
  const FOOT_PETAL_COUNT = Math.max(12, Math.floor((FW * FH) / 12000)); // fewer petals for footer
  let fpetals = new Array(FOOT_PETAL_COUNT).fill().map(() => new FooterPetal(true));

  // mouse velocity tracker (small influence)
  const mouse = { x: FW / 2, y: FH / 2, lastX: FW / 2, lastY: FH / 2 };
  window.addEventListener('mousemove', (e) => {
    // only consider mouse when within window; map to footer coordinate system roughly
    mouse.x = Math.max(0, Math.min(FW, e.clientX - footer.getBoundingClientRect().left));
    mouse.y = Math.max(0, Math.min(FH, e.clientY - footer.getBoundingClientRect().top));
  });

  // Resize handler: update canvas size and recreate petals proportionally
  function resizeFooterCanvas() {
    FW = fcanvas.width = footer.clientWidth;
    FH = fcanvas.height = footer.clientHeight;
    // re-create petals to adapt to new area density
    const newCount = Math.max(12, Math.floor((FW * FH) / 12000));
    fpetals = new Array(newCount).fill().map(() => new FooterPetal(true));
  }
  window.addEventListener('resize', () => {
    resizeFooterCanvas();
  });

  // Animation control: start/stop based on footer visibility
  let rafId = null;
  let animating = false;
  // IntersectionObserver to start when footer visible
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        startFooterAnim();
      } else {
        stopFooterAnim();
      }
    });
  }, { threshold: 0.02 });
  footerObserver.observe(footer);

  function startFooterAnim() {
    if (animating) return;
    animating = true;
    // small smooth mouse velocity tracker
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    loop();
  }

  function stopFooterAnim() {
    animating = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    // clear footer canvas when not animating
    fctx.clearRect(0, 0, FW, FH);
  }

  function loop() {
    // compute small velocity from mouse movement to influence petals slightly
    const vx = (mouse.x - mouse.lastX) * 0.02;
    const vy = (mouse.y - mouse.lastY) * 0.02;
    mouse.lastX += (mouse.x - mouse.lastX) * 0.12;
    mouse.lastY += (mouse.y - mouse.lastY) * 0.12;

    fctx.clearRect(0, 0, FW, FH);
    // draw an optional very subtle overlay (like faint grain) by lowering globalAlpha, but kept off for performance
    for (let p of fpetals) {
      p.update(vx, vy);
      p.draw(fctx);
    }
    rafId = requestAnimationFrame(loop);
  }

  // ensure canvas is sized once on load
  resizeFooterCanvas();

  // Accessibility: reduce motion users may prefer - stop petal animation
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) {
    stopFooterAnim();
  }

}); */
