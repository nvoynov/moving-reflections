class VisualRhythmPlayer {
  constructor(elements) {
    this.frameEl = elements.frameEl;
    this.pulseEl = elements.pulseEl;
    this.onStateChange = elements.onStateChange || (() => {});

    this.coverImage = 'og-image.jpg';
    this.images = []; // Здесь будут храниться локальные blob-URL из памяти браузера
    this.rhythm = null;
    this.bpm = 110;

    this.imgIndex = 0;
    this.stepIndex = 0;
    this.introStep = 0;
    this.isIntro = true;
    this.isPlaying = false;
    this.isStarted = false;
    this.timer = null;
  }

  // Скачиваем все картинки один раз и кэшируем их в оперативной памяти браузера
  async preloadAndCacheImages(urlList) {
    const cachedUrls = await Promise.all(
      urlList.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch (err) {
          console.warn(`Не удалось закэшировать ${url}, используем прямой путь:`, err);
          return url;
        }
      })
    );

    this.images = cachedUrls;
  }

  setRhythm(rhythmObj, customBpm = null) {
    this.rhythm = rhythmObj;
    this.bpm = customBpm || rhythmObj.defaultBpm || 110;
    this.stepIndex = 0;
    this.introStep = 0;

    if (this.isPlaying) {
      clearTimeout(this.timer);
      this.isIntro = true;
      this.tick();
    }
  }

  setBpm(newBpm) {
    this.bpm = newBpm;
  }

  getBeatDurationMs() {
    return Math.round(60000 / this.bpm);
  }

  togglePlayPause() {
    if (this.images.length === 0 || !this.rhythm) return;

    this.isPlaying = !this.isPlaying;
    this.onStateChange(this.isPlaying);

    if (this.isPlaying) {
      if (!this.isStarted) {
        this.isStarted = true;
        this.isIntro = true;
        this.introStep = 0;
        this.imgIndex = 0;
        this.stepIndex = 0;
      }
      this.tick();
    } else {
      clearTimeout(this.timer);
    }
  }

  stop() {
    this.isPlaying = false;
    this.isStarted = false;
    this.isIntro = true;
    this.introStep = 0;
    this.imgIndex = 0;
    this.stepIndex = 0;

    clearTimeout(this.timer);
    this.onStateChange(false);

    this.pulseEl.style.opacity = 0;
    this.pulseEl.classList.remove('beat-tick', 'beat-accent');

    this.frameEl.classList.remove('hidden-during-intro', 'strong-beat');
    this.frameEl.src = this.coverImage;
  }

  tick() {
    if (!this.isPlaying || this.images.length === 0 || !this.rhythm) return;

    const steps = this.rhythm.steps;
    const baseMs = this.getBeatDurationMs();

    // Фаза 1: Вступительный такт пустой рамкой
    if (this.isIntro) {
      this.frameEl.classList.add('hidden-during-intro');
      this.frameEl.classList.remove('strong-beat');

      const step = steps[this.introStep];
      const durationMs = Math.round(step.beats * baseMs);

      this.pulseEl.classList.remove('beat-tick', 'beat-accent');
      void this.pulseEl.offsetWidth;
      this.pulseEl.classList.add(step.accent ? 'beat-accent' : 'beat-tick');

      this.introStep++;
      if (this.introStep >= steps.length) {
        this.isIntro = false;
      }

      this.timer = setTimeout(() => this.tick(), durationMs);
      return;
    }

    // Фаза 2: Основной цикл показа фотографий из RAM-кэша
    this.pulseEl.style.opacity = 0;
    this.frameEl.classList.remove('hidden-during-intro');

    const step = steps[this.stepIndex];
    const durationMs = Math.round(step.beats * baseMs);

    this.frameEl.src = this.images[this.imgIndex];

    if (step.accent) {
      this.frameEl.classList.add('strong-beat');
    } else {
      this.frameEl.classList.remove('strong-beat');
    }

    this.imgIndex = (this.imgIndex + 1) % this.images.length;
    this.stepIndex = (this.stepIndex + 1) % steps.length;

    this.timer = setTimeout(() => this.tick(), durationMs);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const frameEl = document.getElementById('frame');
  const pulseEl = document.getElementById('pulse-frame');
  const subtitleEl = document.getElementById('header-subtitle');
  const rhythmSelect = document.getElementById('rhythm-select');
  const bpmSlider = document.getElementById('bpm-slider');
  const bpmValue = document.getElementById('bpm-value');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const btnStop = document.getElementById('btn-stop');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const iconFsEnter = document.getElementById('icon-fs-enter');
  const iconFsExit = document.getElementById('icon-fs-exit');

  const player = new VisualRhythmPlayer({
    frameEl,
    pulseEl,
    onStateChange: (isPlaying) => {
      iconPlay.classList.toggle('hidden', isPlaying);
      iconPause.classList.toggle('hidden', !isPlaying);
    }
  });

  function populateRhythmSelect() {
    const groups = {};
    Object.values(RHYTHMS).forEach(r => {
      if (!groups[r.group]) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = r.group;
        groups[r.group] = optgroup;
        rhythmSelect.appendChild(optgroup);
      }
      const option = document.createElement('option');
      option.value = r.id;
      option.textContent = `${r.name} — ${r.hint}`;
      groups[r.group].appendChild(option);
    });
  }

  function applySelectedRhythm(rhythmId) {
    const chosen = RHYTHMS[rhythmId] || RHYTHMS.autumn;
    const snappedBpm = Math.round((chosen.defaultBpm || 110) / 5) * 5;
    bpmSlider.value = snappedBpm;
    bpmValue.textContent = snappedBpm;

    subtitleEl.textContent = `${chosen.name} · ${chosen.hint}`;
    player.setRhythm(chosen, snappedBpm);
  }

  async function loadPhotosList() {
    try {
      const res = await fetch('photos.txt');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const list = text
        .split(/\r?\n/)
        .map(line => line.trim().replace(/\\/g, '/').replace(/^\/+/, ''))
        .filter(line => line.length > 0 && !line.startsWith('#'))
        .map(line => (line.startsWith('photos/') || line.startsWith('http') ? line : `photos/${line}`));

      // Кэшируем все снимки в оперативной памяти браузера при старте
      await player.preloadAndCacheImages(list);
    } catch (e) {
      console.error('Ошибка чтения photos.txt:', e);
    }
  }

  populateRhythmSelect();
  applySelectedRhythm('autumn');
  await loadPhotosList();

  rhythmSelect.addEventListener('change', (e) => {
    applySelectedRhythm(e.target.value);
  });

  bpmSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    bpmValue.textContent = val;
    player.setBpm(val);
  });

  btnPlayPause.addEventListener('click', () => player.togglePlayPause());
  btnStop.addEventListener('click', () => player.stop());

  btnFullscreen.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFs = Boolean(document.fullscreenElement);
    iconFsEnter.classList.toggle('hidden', isFs);
    iconFsExit.classList.toggle('hidden', !isFs);
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement !== rhythmSelect) {
      e.preventDefault();
      player.togglePlayPause();
    }
  });
});
