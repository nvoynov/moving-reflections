const BASE_BEAT = 550; // Базовая длительность одной доли (мс)
const COVER_IMAGE = 'og-image.jpg';
const LIST_FILE = 'photos.txt';
const PHOTOS_DIR = 'photos/';

const PATTERN = [
  { beats: 1, accent: false },
  { beats: 1, accent: false },
  { beats: 1, accent: false },
  { beats: 3, accent: true }
];

let images = [];
let imgIndex = 0;
let stepIndex = 0;
let introStep = 0;
let isIntro = true;
let isPlaying = false;
let isStarted = false;
let timer = null;

document.addEventListener('DOMContentLoaded', () => {
  const frameEl = document.getElementById('frame');
  const pulseEl = document.getElementById('pulse-frame');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnStop = document.getElementById('btn-stop');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const iconFsEnter = document.getElementById('icon-fs-enter');
  const iconFsExit = document.getElementById('icon-fs-exit');

  // Приводим любой путь из photos.txt к виду "photos/filename.jpg" (безопасно для GitHub Pages)
  function normalizePath(rawLine) {
    let clean = rawLine.trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!clean) return '';
    if (!clean.startsWith(PHOTOS_DIR) && !clean.startsWith('http')) {
      clean = PHOTOS_DIR + clean;
    }
    return clean;
  }

  async function loadImageList() {
    try {
      const res = await fetch(LIST_FILE);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      images = text
        .split(/\r?\n/)
        .map(normalizePath)
        .filter(path => path.length > 0);

      // Предзагрузка кадров в кэш браузера
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    } catch (e) {
      console.error(`Не удалось загрузить ${LIST_FILE}:`, e);
    }
  }

  function updatePlayIcon() {
    if (isPlaying) {
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
    } else {
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
    }
  }

  function tick() {
    if (!isPlaying || images.length === 0) return;

    // Фаза 1: Вступительный такт (отсчет ритма пустой рамкой)
    if (isIntro) {
      frameEl.classList.add('hidden-during-intro');
      const step = PATTERN[introStep];
      const durationMs = step.beats * BASE_BEAT;

      pulseEl.classList.remove('beat-tick', 'beat-accent');
      void pulseEl.offsetWidth;
      pulseEl.classList.add(step.accent ? 'beat-accent' : 'beat-tick');

      introStep++;
      if (introStep >= PATTERN.length) {
        isIntro = false;
      }

      timer = setTimeout(tick, durationMs);
      return;
    }

    // Фаза 2: Показ изображений по ритму
    pulseEl.style.opacity = 0;
    frameEl.classList.remove('hidden-during-intro');

    const step = PATTERN[stepIndex];
    const durationMs = step.beats * BASE_BEAT;

    frameEl.src = images[imgIndex];

    imgIndex = (imgIndex + 1) % images.length;
    stepIndex = (stepIndex + 1) % PATTERN.length;

    timer = setTimeout(tick, durationMs);
  }

  function togglePlayPause() {
    if (images.length === 0) {
      alert(`Не найден список кадров в файле ${LIST_FILE}`);
      return;
    }

    isPlaying = !isPlaying;
    updatePlayIcon();

    if (isPlaying) {
      if (!isStarted) {
        isStarted = true;
        isIntro = true;
        introStep = 0;
      }
      tick();
    } else {
      clearTimeout(timer);
    }
  }

  function stopShow() {
    isPlaying = false;
    isStarted = false;
    isIntro = true;
    introStep = 0;
    imgIndex = 0;
    stepIndex = 0;

    clearTimeout(timer);
    updatePlayIcon();

    pulseEl.style.opacity = 0;
    pulseEl.classList.remove('beat-tick', 'beat-accent');

    frameEl.classList.remove('hidden-during-intro');
    frameEl.src = COVER_IMAGE;
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Ошибка переключения fullscreen:', err);
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      iconFsEnter.classList.add('hidden');
      iconFsExit.classList.remove('hidden');
    } else {
      iconFsEnter.classList.remove('hidden');
      iconFsExit.classList.add('hidden');
    }
  });

  btnPlayPause.addEventListener('click', togglePlayPause);
  btnStop.addEventListener('click', stopShow);
  btnFullscreen.addEventListener('click', toggleFullscreen);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  loadImageList();
});
