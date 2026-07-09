const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const music = $('#weddingMusic');
const musicButton = $('#musicButton');
const openInvite = $('#openInvite');
const scrollLine = $('#scrollLine');
const dust = $('#goldDust');
const starCanvas = $('#starCanvas');
const ctx = starCanvas?.getContext('2d');
const slides = $$('.slide');
const sideLinks = $$('.side-link');
const dotsContainer = $('#slideDots');

let musicPlaying = false;
let stars = [];
let rafId = null;

async function playMusic() {
  try {
    music.volume = 0.68;
    await music.play();
    musicPlaying = true;
    musicButton.classList.add('playing');
    musicButton.setAttribute('aria-label', 'Остановить мелодию любви');
  } catch (error) {
    musicPlaying = false;
    musicButton.classList.remove('playing');
  }
}

function pauseMusic() {
  music.pause();
  musicPlaying = false;
  musicButton.classList.remove('playing');
  musicButton.setAttribute('aria-label', 'Включить мелодию любви');
}

function enterSite() {
  document.body.classList.add('entered');
  document.body.classList.remove('prelude-mode');
  setTimeout(() => {
    $('#frame-home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 220);
}

openInvite?.addEventListener('click', async () => {
  await playMusic();
  enterSite();
});

musicButton?.addEventListener('click', async () => {
  if (musicPlaying) pauseMusic();
  else await playMusic();
});

$$('[data-go]').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!musicPlaying) await playMusic();
    const target = $(button.dataset.go);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Countdown
const weddingDate = new Date('2026-09-18T17:00:00+03:00').getTime();
function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}
function updateCountdown() {
  const diff = Math.max(0, weddingDate - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;
  setText('#days', String(days).padStart(2, '0'));
  setText('#hours', String(hours).padStart(2, '0'));
  setText('#minutes', String(minutes).padStart(2, '0'));
  setText('#seconds', String(seconds).padStart(2, '0'));
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Slide dots
slides.forEach((slide, index) => {
  if (!dotsContainer) return;
  const dot = document.createElement('a');
  dot.href = `#${slide.id}`;
  dot.setAttribute('aria-label', slide.dataset.title || `Кадр ${index + 1}`);
  dotsContainer.appendChild(dot);
});
const dots = dotsContainer ? $$('a', dotsContainer) : [];

const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    slides.forEach(slide => slide.classList.toggle('is-active', slide.id === id));
    sideLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
    dots.forEach(dot => dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`));
    entry.target.querySelectorAll('.reveal-item').forEach(item => item.classList.add('visible'));
  });
}, { threshold: window.innerWidth < 700 ? 0.24 : 0.48 });
slides.forEach(slide => slideObserver.observe(slide));
slides[0]?.classList.add('is-active');
slides[0]?.querySelectorAll('.reveal-item').forEach(item => item.classList.add('visible'));

function updateScrollLine() {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollLine.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
}
window.addEventListener('scroll', updateScrollLine, { passive: true });
updateScrollLine();

function createDust() {
  if (!dust) return;
  dust.innerHTML = '';
  const count = innerWidth < 720 ? 26 : 58;
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('span');
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.setProperty('--x', `${-130 + Math.random() * 260}px`);
    dot.style.setProperty('--o', `${(0.22 + Math.random() * 0.55).toFixed(2)}`);
    dot.style.animationDuration = `${8 + Math.random() * 14}s`;
    dot.style.animationDelay = `${Math.random() * 12}s`;
    dust.appendChild(dot);
  }
}

function resizeStars() {
  if (!ctx || !starCanvas) return;
  const ratio = window.devicePixelRatio || 1;
  starCanvas.width = Math.floor(innerWidth * ratio);
  starCanvas.height = Math.floor(innerHeight * ratio);
  starCanvas.style.width = `${innerWidth}px`;
  starCanvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = innerWidth < 720 ? 95 : 175;
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight * 0.72,
    r: Math.random() * 1.25 + 0.15,
    a: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.015 + 0.006,
    drift: Math.random() * 0.035 + 0.008,
    glow: Math.random() * 8 + 4,
  }));
}

function drawStars() {
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const star of stars) {
    star.a += star.speed;
    star.x += star.drift;
    if (star.x > innerWidth + 3) star.x = -3;
    const alpha = 0.16 + Math.abs(Math.sin(star.a)) * 0.62;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 229, 174, ${alpha})`;
    ctx.shadowColor = 'rgba(255, 205, 112, .62)';
    ctx.shadowBlur = star.glow;
    ctx.fill();
  }
  rafId = requestAnimationFrame(drawStars);
}

createDust();
resizeStars();
drawStars();
window.addEventListener('resize', () => {
  createDust();
  resizeStars();
}, { passive: true });
window.addEventListener('beforeunload', () => {
  if (rafId) cancelAnimationFrame(rafId);
});

// Keyboard navigation for desktop viewing
window.addEventListener('keydown', (event) => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key) || document.body.classList.contains('prelude-mode')) return;
  const currentIndex = slides.findIndex(slide => slide.classList.contains('is-active'));
  if (currentIndex === -1) return;
  const nextIndex = event.key === 'ArrowDown' ? Math.min(slides.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);
  if (nextIndex !== currentIndex) slides[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
});
