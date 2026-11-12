/* Mobile menu toggle — the only JS the site needs */
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;

  const setState = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  };

  toggle.addEventListener('click', () => {
    setState(!nav.classList.contains('is-open'));
  });

  // Close when a link is chosen or on Escape
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setState(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setState(false);
  });

  // Close when resizing up to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setState(false);
  });
})();

/* ============================================================
   Mascot — leans toward the cursor on hover
   ============================================================ */
(function () {
  const zone = document.querySelector('.hero-mascot');
  const track = zone && zone.querySelector('.mascot-track');
  if (!zone || !track) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || still.matches) return;

  const MAX_X = 26;   // px of travel toward the cursor
  const MAX_Y = 18;
  const MAX_R = 7;    // degrees of lean

  let raf = 0;
  let tx = 0, ty = 0, tr = 0;   // target
  let cx = 0, cy = 0, cr = 0;   // current

  const clamp = (v, m) => Math.max(-m, Math.min(m, v));

  const render = () => {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cr += (tr - cr) * 0.18;

    track.style.transform =
      `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) rotate(${cr.toFixed(2)}deg)`;

    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 || Math.abs(tr - cr) > 0.02) {
      raf = requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  };

  const kick = () => { if (!raf) raf = requestAnimationFrame(render); };

  zone.addEventListener('pointermove', (e) => {
    const r = zone.getBoundingClientRect();
    // -1 .. 1 from the centre of the mascot zone
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), 1);

    tx = nx * MAX_X;
    ty = ny * MAX_Y;
    tr = nx * MAX_R;

    zone.classList.add('is-tracking');
    kick();
  });

  const reset = () => {
    tx = 0; ty = 0; tr = 0;
    zone.classList.remove('is-tracking');
    kick();
  };

  zone.addEventListener('pointerleave', reset);
  zone.addEventListener('pointercancel', reset);
  window.addEventListener('blur', reset);

  // If the user turns on reduced motion mid-session, stop immediately.
  still.addEventListener('change', (e) => { if (e.matches) reset(); });
})();

/* ============================================================
   Video — click-to-play facade (poster first, video on demand)
   ============================================================ */
(function () {
  const facade = document.querySelector('.video-facade');
  if (!facade) return;
  const shell = facade.closest('.video-shell');
  const video = shell && shell.querySelector('.video-el');
  if (!video) return;

  facade.addEventListener('click', () => {
    video.hidden = false;
    facade.remove();
    const p = video.play();
    if (p && p.catch) p.catch(() => {}); // autoplay blocked → user presses native play
    video.focus({ preventScroll: true });
  });
})();
