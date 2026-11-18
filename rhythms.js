// Модуль ритмических паттернов (Метр + Акценты сильных долей)
// beats: длительность кадра в долях
// accent: true — сильная доля (выделяется тонкой рамкой и микро-сдвигом яркости)

const RHYTHMS = {
  // --- ПРОСТЫЕ И ПОПУЛЯРНЫЕ ---
  autumn: {
    id: 'autumn',
    group: 'Simple & Classic',
    name: 'Autumn Leaves (1–1–1–3)',
    hint: 'Jazz phrase · Three steps & sustained hold',
    defaultBpm: 109, // ~550 мс на долю
    steps: [
      { beats: 1, accent: false },
      { beats: 1, accent: false },
      { beats: 1, accent: false },
      { beats: 3, accent: true }
    ]
  },
  march: {
    id: 'march',
    group: 'Simple & Classic',
    name: 'Even Pulse 4/4 (1–1–1–1)',
    hint: 'Steady flow · Accent on Beat 1',
    defaultBpm: 105,
    steps: [
      { beats: 1, accent: true },
      { beats: 1, accent: false },
      { beats: 1, accent: false },
      { beats: 1, accent: false }
    ]
  },
  waltz: {
    id: 'waltz',
    group: 'Simple & Classic',
    name: 'Waltz 3/4 (2–1)',
    hint: 'Pendulum swing · Heavy step & light lift',
    defaultBpm: 115,
    steps: [
      { beats: 2, accent: true },
      { beats: 1, accent: false }
    ]
  },
  shuffle: {
    id: 'shuffle',
    group: 'Simple & Classic',
    name: 'Blues Shuffle (2–1–2–1)',
    hint: 'Triplet groove · Long-short walking pulse',
    defaultBpm: 135,
    steps: [
      { beats: 2, accent: true },
      { beats: 1, accent: false },
      { beats: 2, accent: false },
      { beats: 1, accent: false }
    ]
  },

  // --- СЛОЖНЫЕ И НЕЧЕТНЫЕ ---
  takeFive: {
    id: 'takeFive',
    group: 'Odd & Asymmetric',
    name: '5/4 Take Five (1–1–1 + 1–1)',
    hint: 'Dave Brubeck · 3 + 2 grouping',
    defaultBpm: 115,
    steps: [
      { beats: 1, accent: true },
      { beats: 1, accent: false },
      { beats: 1, accent: false },
      { beats: 1, accent: true },
      { beats: 1, accent: false }
    ]
  },
  money: {
    id: 'money',
    group: 'Odd & Asymmetric',
    name: '7/8 Money (1–1 + 1–1 + 1–1–1)',
    hint: 'Pink Floyd · 2 + 2 + 3 asymmetric wave',
    defaultBpm: 145,
    steps: [
      { beats: 1, accent: true },
      { beats: 1, accent: false },
      { beats: 1, accent: true },
      { beats: 1, accent: false },
      { beats: 1, accent: true },
      { beats: 1, accent: false },
      { beats: 1, accent: false }
    ]
  },
  limpingWaltz: {
    id: 'limpingWaltz',
    group: 'Odd & Asymmetric',
    name: '5/8 Limping Waltz (2 + 3)',
    hint: 'Short inhale & extended exhale',
    defaultBpm: 130,
    steps: [
      { beats: 2, accent: true },
      { beats: 3, accent: false }
    ]
  }
};

