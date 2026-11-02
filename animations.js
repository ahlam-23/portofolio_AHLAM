/* ===== Animasi tambahan portfolio (tidak mengubah konten) ===== */
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Perbaiki ikon Font Awesome yang kurang prefix "fa-solid"
  $$('i').forEach(i => {
    const c = [...i.classList];
    if (c.some(x => x.startsWith('fa-')) && !c.some(x => ['fa-solid','fa-brands','fa-regular'].includes(x))) i.classList.add('fa-solid');
  });

  // Progress bar scroll + header
  const bar = document.createElement('div'); bar.id = 'scroll-progress'; document.body.appendChild(bar);
  const header = document.querySelector('header');
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    header.classList.toggle('scrolled', h.scrollTop > 20);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Kursor berkedip di terminal
  const last = $$('#home .font-mono p.text-emerald-400')[0];
  if (last) { const c = document.createElement('span'); c.className = 'cursor'; c.textContent = '▍'; last.appendChild(c); }

  // Hero muncul bertahap + widget melayang
  $$('#home .md\\:col-span-7 > *').forEach((el, i) => { el.classList.add('hero-in'); el.style.animationDelay = (0.1 + i * 0.12) + 's'; });
  const term = document.querySelector('#home .md\\:col-span-5 > div');
  if (term) { const w = term.parentElement; w.classList.add('hero-in'); w.style.animationDelay = '0.5s'; term.classList.add('float-y'); }

  // Kartu: lift + spotlight, chip interaktif
  const cards = $$('#about .grid > div, #skills .grid > div, .project-card, #certificates .grid > div, #experience .relative.pl-8 > div.bg-darkCard');
  cards.forEach(c => {
    c.classList.add('lift');
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  $$('#skills span.rounded-lg').forEach(s => s.classList.add('chip'));

  // Scroll reveal
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = $$('section:not(#home) .text-center > *, #about .grid > div, #skills .grid > div, .project-card, #certificates .grid > div, #experience .relative.pl-8, #contact .rounded-3xl');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; el.classList.add('rv-in'); io.unobserve(el);
      setTimeout(() => el.classList.remove('rv', 'rv-in', 'rv-left'), 1100); // kembalikan agar hover normal
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => {
      const idx = [...el.parentElement.children].indexOf(el);
      el.classList.add('rv');
      if (el.matches('#experience .relative.pl-8')) el.classList.add('rv-left');
      el.style.transitionDelay = (idx % 4) * 0.12 + 's';
      io.observe(el);
    });
  }

  // Hitung naik untuk angka "6+" dan "4+" (nilai akhir tetap sama)
  $$('#about .grid .text-3xl, #about .grid .text-4xl').forEach(el => {
    const m = el.textContent.trim().match(/^(\d+)\+$/); if (!m || reduce) return;
    const end = +m[1], final = el.textContent; let done = false;
    new IntersectionObserver((es, ob) => {
      if (!es[0].isIntersecting || done) return; done = true; ob.disconnect();
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + '+';
        p < 1 ? requestAnimationFrame(tick) : (el.textContent = final);
      })(t0);
    }, { threshold: 0.6 }).observe(el);
  });

  // Animasi ulang saat filter proyek diganti
  $$('.project-filter-btn').forEach(b => b.addEventListener('click', () => {
    $$('.project-card').forEach((c, i) => {
      if (c.style.display === 'none') return;
      c.classList.remove('card-pop'); void c.offsetWidth;
      c.style.animationDelay = (i * 0.08) + 's'; c.classList.add('card-pop');
    });
  }));

  // Highlight menu sesuai section aktif
  const links = $$('header nav a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('nav-active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
})();

/* ===== Efek mengetik di tagline hero ===== */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.querySelector('#home p.text-lg');
  if (!el) return;
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.style.minHeight = el.offsetHeight + 'px'; // cegah layout bergeser
  el.textContent = '';
  const caret = document.createElement('span'); caret.className = 'typing-caret';
  el.append(document.createTextNode(''), caret);
  let i = 0;
  setTimeout(function type() {
    el.firstChild.nodeValue = text.slice(0, ++i);
    if (i < text.length) setTimeout(type, 38 + Math.random() * 40);
  }, 700);
})();

/* ===== Partikel background interaktif ===== */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.id = 'particles';
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  let W, H, dots = [], mouse = { x: -999, y: -999 }, raf;
  const colors = ['82,39,255', '255,159,252'];

  function init() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(Math.floor(W * H / 16000), 90);
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
      r: Math.random() * 1.6 + .6, c: colors[Math.random() < .5 ? 0 : 1]
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      // tolak halus dari kursor
      const dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 110) { a.x += dx / d * 1.6; a.y += dy / d * 1.6; }
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283);
      ctx.fillStyle = `rgba(${a.c},.65)`; ctx.fill();
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j], l = Math.hypot(a.x - b.x, a.y - b.y);
        if (l < 120) {
          ctx.strokeStyle = `rgba(${a.c},${(1 - l / 120) * .22})`;
          ctx.lineWidth = .8; ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('mouseout', () => { mouse.x = mouse.y = -999; });
  addEventListener('resize', init);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? cancelAnimationFrame(raf) : (raf = requestAnimationFrame(frame));
  });
  init(); frame();
})();

/* ===== Foto profil: tap/klik untuk perangkat sentuh ===== */
(function () {
  const box = document.getElementById('spidey');
  if (!box) return;
  const toggle = () => box.classList.toggle('is-active');
  box.addEventListener('click', toggle);
  box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
})();

/* ===== Foto cutout: area di sekitar kursor berubah (halus, tanpa library) ===== */
(function () {
  const box = document.getElementById('cutout');
  if (!box) return;
  const base = box.querySelector('.cutout-base'), alt = box.querySelector('.cutout-alt');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Foto kedua belum ada -> pakai salinan foto utama dengan efek warna
  const fallback = () => { if (!alt.classList.contains('alt-fx')) { alt.classList.add('alt-fx'); alt.src = base.src; } };
  alt.addEventListener('error', fallback);
  if (alt.complete && alt.naturalWidth === 0) fallback();

  let tx = 0, ty = 0, tr = 0, x = 0, y = 0, r = 0, running = false;
  const MAX = () => box.offsetWidth * 0.34;           // radius area reveal
  const k = reduce ? 1 : 0.16, kr = reduce ? 1 : 0.1;  // kecepatan easing

  function loop() {
    x += (tx - x) * k; y += (ty - y) * k; r += (tr - r) * kr;
    box.style.setProperty('--mx', x.toFixed(1) + 'px');
    box.style.setProperty('--my', y.toFixed(1) + 'px');
    box.style.setProperty('--r', Math.max(r, .1).toFixed(1) + 'px');
    box.style.setProperty('--o', Math.min(r / (MAX() || 1), 1).toFixed(2));
    if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) > .15) requestAnimationFrame(loop);
    else running = false;
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

  function move(e) {
    const b = box.getBoundingClientRect();
    tx = e.clientX - b.left; ty = e.clientY - b.top; tr = MAX();
    if (r < 2) { x = tx; y = ty; }                    // masuk pertama: langsung di posisi kursor
    kick();
  }
  box.addEventListener('pointerenter', move);
  box.addEventListener('pointermove', move);
  box.addEventListener('pointerdown', move);
  box.addEventListener('pointerleave', () => { tr = 0; kick(); });
  box.addEventListener('pointercancel', () => { tr = 0; kick(); });
})();

/* Mode foto: hover (default) atau otomatis -> <div class="cutout" id="cutout" data-mode="auto"> */
(function () {
  const box = document.getElementById('cutout');
  if (box && box.dataset.mode === 'auto') box.classList.add('auto');
})();

/* ===== Welcome intro with interactive threads and layered title ===== */
(function () {
  const screen = document.getElementById('welcome-screen');
  const skip = document.getElementById('welcome-skip');
  if (!screen || !skip) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    screen.remove();
    return;
  }

  let dismissed = false;
  let removeTimer;
  let animationFrame;
  let pointerX = -1;
  let pointerY = -1;
  let pulseStartedAt = 0;
  let tiltX = 0;
  let tiltY = 0;
  const depthText = document.getElementById('welcome-title');
  const depthStage = depthText && depthText.querySelector('.depth-text-stage');
  const depthTextValue = depthText && depthText.dataset.text;
  const depthLayers = 34;
  const addDepthTextLines = element => {
    depthTextValue.split('|').forEach(lineText => {
      const line = document.createElement('span');
      line.className = 'depth-text__line';
      line.textContent = lineText;
      element.appendChild(line);
    });
  };
  if (depthStage && depthTextValue) {
    for (let index = 0; index < depthLayers; index += 1) {
      const layer = document.createElement('span');
      layer.className = `depth-text__layer${index === depthLayers - 1 ? ' depth-text__layer--back' : ''}`;
      layer.setAttribute('aria-hidden', 'true');
      addDepthTextLines(layer);
      layer.style.transform = `translateZ(${-3 * (index + 1) / depthLayers}px)`;
      depthStage.appendChild(layer);
    }

    const face = document.createElement('span');
    face.className = 'depth-text__face';
    face.setAttribute('aria-hidden', 'true');
    addDepthTextLines(face);
    depthStage.appendChild(face);
  }
  const canvas = document.getElementById('welcome-threads');
  const context = canvas && canvas.getContext('2d');
  let width = 0;
  let height = 0;
  const startedAt = performance.now();
  const resizeCanvas = () => {
    const bounds = screen.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };
  const drawThreads = now => {
    if (dismissed) return;

    const elapsed = (now - startedAt) / 1000;
    if (context) {
      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = 'lighter';
      context.globalAlpha = Math.min(elapsed / 1.2, 1);
      context.lineWidth = 1.2;

      for (let index = 0; index < 6; index += 1) {
        const offset = (index - 2.5) / 5;
        const startY = height * (0.18 + index * 0.128);
        const endY = height - startY;
        const wave = Math.sin(elapsed * 0.7 + index * 0.65) * height * 0.035;
        const centerX = width * (0.5 + offset * 0.08);
        const centerY = height * (0.5 + offset * 0.12) + wave;
        const mouseDistance = pointerX < 0 ? 1 : Math.max(0, 1 - Math.hypot((pointerX - centerX) / width, (pointerY - centerY) / height) * 2.8);
        const mousePull = pointerX < 0 ? 0 : mouseDistance * (pointerY - centerY) * 0.18;
        const gradient = context.createLinearGradient(0, startY, width, endY);
        gradient.addColorStop(0, 'rgba(255,159,252,0)');
        gradient.addColorStop(0.28, 'rgba(255,159,252,0.32)');
        gradient.addColorStop(0.5, 'rgba(82,39,255,0.62)');
        gradient.addColorStop(0.72, 'rgba(255,159,252,0.32)');
        gradient.addColorStop(1, 'rgba(255,159,252,0)');

        context.beginPath();
        context.moveTo(0, startY);
        context.bezierCurveTo(width * 0.31, startY + wave + mousePull, centerX - width * 0.12, centerY - wave, centerX, centerY + mousePull);
        context.bezierCurveTo(centerX + width * 0.12, centerY + wave, width * 0.69, endY - wave - mousePull, width, endY);
        context.strokeStyle = gradient;
        context.shadowColor = index % 2 ? '#FF9FFC' : '#5227FF';
        context.shadowBlur = 8;
        context.stroke();
      }

      context.beginPath();
      context.arc(width / 2, height / 2 + Math.sin(elapsed) * height * 0.025, 2.5, 0, Math.PI * 2);
      context.fillStyle = 'rgba(82,39,255,0.75)';
      context.shadowColor = '#5227FF';
      context.shadowBlur = 12;
      context.fill();

      if (pulseStartedAt) {
        const pulseProgress = Math.min((now - pulseStartedAt) / 850, 1);
        context.beginPath();
        context.arc(pointerX < 0 ? width / 2 : pointerX, pointerY < 0 ? height / 2 : pointerY, pulseProgress * Math.max(width, height) * 0.28, 0, Math.PI * 2);
        context.strokeStyle = `rgba(255,159,252,${(1 - pulseProgress) * 0.4})`;
        context.lineWidth = 2;
        context.stroke();
        if (pulseProgress === 1) pulseStartedAt = 0;
      }
      context.restore();
    }

    if (depthStage) {
      const targetX = pointerY < 0 ? 0 : (pointerY / height - 0.5) * -11.5;
      const targetY = pointerX < 0 ? Math.sin(elapsed * 0.35) * 5 : (pointerX / width - 0.5) * 11.5;
      tiltX += (targetX - tiltX) * 0.14;
      tiltY += (targetY - tiltY) * 0.14;
      const orbit = Math.sin(elapsed * 0.35) * 2;
      const float = Math.sin(elapsed * 1.4) * 5;
      depthStage.style.transform = `translateY(${float}px) rotateX(${tiltX}deg) rotateY(${tiltY + orbit}deg)`;
    }

    animationFrame = requestAnimationFrame(drawThreads);
  };
  const onPointerMove = event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  };
  const onPointerLeave = () => {
    pointerX = -1;
    pointerY = -1;
  };
  const onPulse = event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pulseStartedAt = performance.now();
  };
  if (canvas && context) {
    resizeCanvas();
    animationFrame = requestAnimationFrame(drawThreads);
    window.addEventListener('resize', resizeCanvas);
    screen.addEventListener('pointermove', onPointerMove, { passive: true });
    screen.addEventListener('pointerleave', onPointerLeave);
    screen.addEventListener('pointerdown', onPulse);
  }

  const close = () => {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(autoClose);
    clearTimeout(removeTimer);
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', resizeCanvas);
    screen.removeEventListener('pointermove', onPointerMove);
    screen.removeEventListener('pointerleave', onPointerLeave);
    screen.removeEventListener('pointerdown', onPulse);
    screen.classList.add('is-leaving');
    removeTimer = setTimeout(() => screen.remove(), 600);
    document.removeEventListener('keydown', onKeydown);
  };
  const onKeydown = event => {
    if (event.key === 'Escape') close();
  };
  const autoClose = setTimeout(close, 10000);

  skip.addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);
})();
