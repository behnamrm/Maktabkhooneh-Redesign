/* Course player prototype: lesson player, AI assistant, streaks, AI exercises,
   exams and the on-site course unlock. Everything runs client-side with mock data. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- Icons */
  const ICONS = {
    check: 'M5 12.5l4.5 4.5L19 7.5',
    chevronDown: 'M6 9l6 6 6-6',
    chevronLeft: 'M15 6l-6 6 6 6',
    chevronRight: 'M9 6l6 6-6 6',
    play: 'M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z',
    pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
    star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0',
    dots: 'M12 5h.01M12 12h.01M12 19h.01',
    sidebar: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM15 4v16',
    flame: 'M12 2.5c.9 3.3 4.9 5.6 4.9 10.4A4.9 4.9 0 0 1 12 21.5a4.9 4.9 0 0 1-4.9-4.9c0-2.1 1-3.7 2.2-4.8.2 1.7 1.1 2.8 2.3 3-.6-2.9-.4-6.8.4-12.3z',
    sparkles: 'M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9zM18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z',
    bolt: 'M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z',
    thumbUp: 'M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.3 20H7',
    thumbDown: 'M17 13V4h3v9zM17 13l-4 7a2 2 0 0 1-2-2v-4H5.5a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 6.7 4H17',
    alert: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5M12 16h.01',
    pencil: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    exam: 'M9 3.5h6v3H9zM9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 14l2 2 4-4',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    unlock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 6.6-1.6',
    send: 'M5 12l15-7-6 15-2.5-6.5zM11.5 13.5L20 5',
    volume: 'M4 10v4h4l5 4V6l-5 4zM16.5 9a4 4 0 0 1 0 6',
    fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    cc: 'M3.5 6.5h17v11h-17zM10.5 10.3a2 2 0 1 0 0 3.4M16.5 10.3a2 2 0 1 0 0 3.4',
    rewind: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20.5h6M10 17h4',
    pin: 'M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    calendar: 'M5 6h14v14H5zM5 10h14M9 4v4M15 4v4',
    users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6',
    close: 'M6 6l12 12M18 6L6 18',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    x: 'M7 7l10 10M17 7L7 17',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
    bulb: 'M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z',
    list: 'M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01',
    question: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .9-1 1.6v.4M12 16.8h.01',
    coffee: 'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3'
  };
  const FILLED = new Set(['play', 'pause', 'flame', 'sparkles', 'bolt']);
  function icon(name) {
    const fill = FILLED.has(name) ? ' ico--fill' : '';
    return `<svg class="ico${fill}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
  }
  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach((el) => {
      if (!el.firstChild) el.innerHTML = icon(el.dataset.icon);
    });
  }

  /* ----------------------------------------------------------------- Data */
  const video = (id, title, sec, done) => ({ id, type: 'video', title, dur: sec, done: !!done });
  const exercise = (id, ref, title, done) => ({ id, type: 'exercise', ref, title, mins: 5, done: !!done });
  const exam = (id, ref, title, done) => ({ id, type: 'exam', ref, title, mins: 10, done: !!done });

  const COURSE = [
    { id: 'c0', title: 'About this course', items: [
      video('u1', 'What is this course and who is it for?', 120, 1),
      video('u2', 'How to use this course', 180, 1)
    ] },
    { id: 'c1', title: 'Creating an account, buying access & image editing basics', items: [
      video('u3', 'Creating your Google AI Studio account', 240, 1),
      video('u4', 'Choosing a plan and buying access', 300, 1),
      video('u5', 'Uploading your first image', 210, 1),
      video('u6', 'Basic edits: crop, color and background', 270, 1),
      exercise('e1', 'ex1', 'AI exercise: Describe your first edit', 1)
    ] },
    { id: 'c2', title: 'Face editing & combining people', items: [
      video('u7', 'Swapping faces the right way', 120, 1),
      video('u8', 'Keeping a face consistent across edits', 150, 1),
      video('u9', 'Combining two people in one photo', 120, 1),
      video('u10', 'Matching light and skin tones', 150, 1),
      video('u11', 'Fixing hands, eyes and small details', 120, 1),
      exercise('e2', 'ex2', 'AI exercise: Face edit checklist', 1)
    ] },
    { id: 'c3', title: 'Advertising & creative outputs', items: [
      video('u12', 'Product shots on any background', 240, 1),
      video('u13', 'Ad banners from a single photo', 240, 1),
      video('u14', 'Social posts in your brand colors', 210, 1),
      video('u15', 'Mockups: packaging, billboards and screens', 240, 1),
      video('u16', 'Turning sketches into finished artwork', 210, 1),
      video('u17', 'Building a mini campaign end to end', 240, 1),
      exercise('e3', 'ex3', 'AI exercise: Write an ad creative brief', 1),
      exam('q3', 'quiz3', 'Chapter 3 quiz', 1)
    ] },
    { id: 'c4', title: 'Prompting principles, restoration & style transfer', items: [
      video('u18', 'The anatomy of a prompt', 300, 1),
      video('u19', 'Subject, style, lighting and composition', 360, 1),
      video('u20', 'Restoring old and damaged photos', 330, 1),
      video('u21', 'Colorizing black-and-white images', 300, 0),
      video('u22', 'From photo to illustration: changing style', 330, 0),
      video('u23', 'Reference images and style matching', 270, 0),
      video('u24', 'Common prompt mistakes', 330, 0),
      exercise('e4', 'ex4', 'AI exercise: Build a prompt from 4 blocks', 0)
    ] },
    { id: 'c5', title: 'The Gemini update & Nano Banana', items: [
      video('u25', 'What changed in the latest Gemini update', 330, 0),
      video('u26', 'Nano Banana vs. other image models', 360, 0),
      video('u27', 'Multi-turn editing in one conversation', 390, 0),
      video('u28', 'Working with several reference images', 360, 0),
      video('u29', 'Text inside images: what works now', 330, 0),
      video('u30', 'Speed, limits and quality settings', 300, 0),
      video('u31', 'Real projects with the new features', 390, 0),
      exercise('e5', 'ex5', 'AI exercise: Multi-turn editing', 0)
    ] },
    { id: 'c6', title: 'Building a great prompt', items: [
      video('u32', 'A prompt template you can reuse', 360, 0),
      video('u33', 'Iterating from rough to final', 330, 0),
      video('u34', 'Constraints and “keep this unchanged”', 300, 0),
      video('u35', 'Prompt library: 20 ready-made prompts', 390, 0),
      video('u36', 'Wrap-up and next steps', 300, 0),
      exercise('e6', 'ex6', 'AI exercise: Write your signature prompt', 0)
    ] },
    { id: 'c7', title: 'Final exam', items: [
      exam('fx', 'final', 'Final exam', 0)
    ] }
  ];

  const LESSON_EXTRA = {
    u1: {
      about: 'A short tour of the course: what Nano Banana is, what you will be able to make by the end, and who gets the most out of it. If you design, run social media accounts, sell products online or simply want better images without complicated software, this course is for you.',
      points: [
        'Nano Banana is Google’s image model inside Gemini. You create and edit images by describing what you want in plain language.',
        'The course moves from account setup to face edits, ad creatives and advanced prompting.',
        'Every chapter ends with an AI exercise. Pass the final exam to unlock the on-site workshop.'
      ],
      captions: [
        'Hi, and welcome to the complete Nano Banana course.',
        'Nano Banana is Google’s image model inside Gemini, built for creating and editing images with plain language.',
        'This course is for designers, marketers and content creators, and for anyone who wants better images without Photoshop.',
        'We start with your account, then move on to face edits, ad creatives and advanced prompting.',
        'Every chapter ends with an AI exercise, so you practise right after you learn.',
        'Finish everything and pass the final exam to unlock the on-site workshop at a graduate price.',
        'Let’s get started.'
      ],
      oneLine: 'You will learn to create and edit images just by describing them, and it works for anyone, not only designers.',
      simple: 'Think of Nano Banana as a photo editor you talk to. Instead of menus and brushes, you say what you want, like “remove the car” or “make it sunset”, and it edits the image. This course teaches you how to say it so the result comes out right the first time.',
      quiz: { q: 'Who is this course designed for?', options: ['Only professional photographers', 'Anyone who wants to create and edit images with AI', 'Only software developers'], answer: 1 }
    }
  };

  const EXERCISES = {
    ex1: { chapter: 1, title: 'Describe your first edit', questions: [
      { type: 'mcq', q: 'Which instruction gives Nano Banana the clearest edit?', options: ['Make it better', 'Remove the red car on the left and fill the street naturally', 'Edit the photo please', 'Change some things in the background'], answer: 1, why: 'Clear edits name the object, where it is, and how to fill the gap.' },
      { type: 'prompt', q: 'Write an instruction that changes the background of a product photo of a coffee mug to a cozy kitchen scene.' }
    ] },
    ex2: { chapter: 2, title: 'Face edit checklist', questions: [
      { type: 'mcq', q: 'When you combine two people in one photo, what matters most for a natural result?', options: ['The same file format', 'Matching light direction and skin tones', 'A higher resolution only', 'Using photos from the same camera'], answer: 1, why: 'Mismatched light is the first thing the eye notices in a composite.' },
      { type: 'mcq', q: 'To keep a face consistent across several edits, you should…', options: ['Upload a new photo each time', 'Keep editing in the same conversation and refer to the original', 'Use shorter prompts', 'Crop the face out first'], answer: 1, why: 'Staying in one conversation keeps the original face as the reference.' }
    ] },
    ex3: { chapter: 3, title: 'Write an ad creative brief', questions: [
      { type: 'prompt', q: 'Write a prompt for a social media ad: a running shoe on a bright, minimal background with room for a headline.' },
      { type: 'mcq', q: 'Which detail helps most when you generate an ad banner?', options: ['The aspect ratio and space for text', 'The model version', 'The file name', 'Your screen size'], answer: 0, why: 'Banners live in fixed slots, and the headline needs clear space.' }
    ] },
    ex4: { chapter: 4, title: 'Build a prompt from 4 blocks', questions: [
      { type: 'mcq', q: 'Which of these is a lighting instruction?', options: ['Watercolor style', 'Soft golden-hour light from the left', 'Close-up shot', 'A red bicycle'], answer: 1, why: 'Lighting describes the quality and direction of light. The others are style, composition and subject.' },
      { type: 'prompt', q: 'Restore and colorize an old family photo from the 1960s. Write the full prompt.' }
    ] },
    ex5: { chapter: 5, title: 'Multi-turn editing', questions: [
      { type: 'mcq', q: 'What is the main advantage of multi-turn editing?', options: ['It is free', 'You refine one image step by step without starting over', 'It only works with text', 'It increases resolution automatically'], answer: 1, why: 'Each turn builds on the last image, so good parts stay as they are.' },
      { type: 'mcq', q: 'The image has a spelling mistake in its text. What is the best next step?', options: ['Start a new chat', 'Ask it to fix only that word and keep everything else', 'Lower the quality', 'Add more adjectives'], answer: 1, why: 'A targeted fix protects everything that is already right.' }
    ] },
    ex6: { chapter: 6, title: 'Write your signature prompt', questions: [
      { type: 'prompt', q: 'Use the reusable template to write a prompt for a poster of Tehran’s Milad Tower at night in a retro travel-poster style.' },
      { type: 'mcq', q: 'The result is close, but the colors are off. What do you do?', options: ['Rewrite the whole prompt', 'Keep the image and ask only for the color change', 'Switch to another model', 'Accept it as is'], answer: 1, why: 'Small, targeted changes are faster and keep what already works.' }
    ] }
  };

  const EXAMS = {
    quiz3: { title: 'Chapter 3 quiz', minutes: 6, pass: 70, questions: [
      { q: 'For a product shot, what should stay unchanged when you replace the background?', options: ['The product itself', 'The image size', 'The file name', 'Nothing'], answer: 0 },
      { q: 'Which is the best brief for a story ad?', options: ['Make an ad', 'Vertical 9:16 ad, shoe centered, empty top third for a headline', 'Nice colorful shoe', 'Shoe, ad, cool'], answer: 1 },
      { q: 'Why build a mini campaign from one photo?', options: ['Consistent look across every format', 'It uses less storage', 'It needs no prompt', 'It is required by Gemini'], answer: 0 },
      { q: 'A mockup looks fake. What should you check first?', options: ['Perspective and light on the surface', 'The font size', 'The upload speed', 'The color profile name'], answer: 0 }
    ] },
    final: { title: 'Final exam', minutes: 10, pass: 70, questions: [
      { q: 'Which four building blocks make up a strong image prompt?', options: ['Subject, style, lighting, composition', 'Size, format, color, name', 'Camera, lens, ISO, shutter', 'Title, tags, caption, link'], answer: 0 },
      { q: 'To change only the background of a photo, you should…', options: ['Describe the whole new image from scratch', 'Say what to change and that the subject stays as it is', 'Upload a lower-quality photo', 'Use a negative prompt only'], answer: 1 },
      { q: 'Two people combined in one photo look fake. The most likely cause is…', options: ['Mismatched light direction', 'The file is a PNG', 'The prompt is in English', 'Too many colors'], answer: 0 },
      { q: 'What is the best way to restore a damaged old photo?', options: ['Repair scratches and tears while keeping faces unchanged', 'Ask for a new, similar photo', 'Crop out the damaged areas', 'Increase the contrast'], answer: 0 },
      { q: 'For an ad banner, which detail matters most?', options: ['Aspect ratio and space for the headline', 'The model’s name', 'Lots of adjectives', 'The image file name'], answer: 0 },
      { q: 'The result is 90% right. What next?', options: ['Start over with a new prompt', 'Ask for one targeted change in the same conversation', 'Switch to a different tool', 'Accept it'], answer: 1 }
    ] }
  };

  const LEVELS = [
    { at: 0, name: 'Curious Beginner' },
    { at: 250, name: 'Image Tinkerer' },
    { at: 500, name: 'Prompt Explorer' },
    { at: 750, name: 'Visual Storyteller' },
    { at: 1000, name: 'AI Art Director' },
    { at: 1300, name: 'Nano Banana Pro' }
  ];

  const ONSITE = {
    title: 'Nano Banana Studio: On-site Workshop',
    place: 'Maktabkhooneh campus, Tehran',
    when: '3 Fridays · 18 hours hands-on',
    seats: 'Small group · 12 seats',
    oldPrice: 14800000,
    newPrice: 8880000,
    cohorts: [
      { id: 'nov', label: 'Fridays, Nov 13 – Nov 27, 2026', left: 4 },
      { id: 'dec', label: 'Fridays, Dec 11 – Dec 25, 2026', left: 9 }
    ]
  };

  /* Index items */
  const ALL = [];
  COURSE.forEach((ch, ci) => ch.items.forEach((it, ii) => {
    it.chapter = ci; it.index = ii;
    if (it.type === 'video') {
      const extra = LESSON_EXTRA[it.id] || {};
      it.about = extra.about || `In this session you will learn about ${it.title.charAt(0).toLowerCase() + it.title.slice(1)}, with a step-by-step demo in Gemini and examples you can reuse in your own projects.`;
      it.points = extra.points || [
        `The idea behind “${it.title}” and when to use it`,
        'A live demo in Gemini, from first prompt to final image',
        'Common mistakes and how to avoid them'
      ];
      it.captions = extra.captions || [
        `Welcome to “${it.title}”.`,
        'We start with the core idea, then I’ll show you a live demo in Gemini.',
        'Watch how small changes in the instruction change the result.',
        'Pause any time, try it yourself, and ask the AI assistant if you get stuck.'
      ];
      it.simple = extra.simple;
      it.oneLine = extra.oneLine;
      it.quiz = extra.quiz;
    }
    ALL.push(it);
  }));
  const byId = (id) => ALL.find((i) => i.id === id);
  const byRef = (ref) => ALL.find((i) => i.ref === ref);
  const INITIAL_DONE = Object.fromEntries(ALL.map((i) => [i.id, i.done]));

  /* ---------------------------------------------------------------- State */
  const state = {
    activeId: 'u1',
    xp: 640,
    streak: { count: 6, best: 14, today: false, watched: 0, source: null },
    notes: [],
    scores: { quiz3: 85 },
    filter: 'all',
    open: new Set(['c0', 'c4']),
    liked: false,
    disliked: false
  };
  const pl = { t: 0, playing: false, speed: 1, cc: true, timer: null, last: 0, rewinds: 0, watched: 0, xpAcc: 0, nudged: new Set(), hiddenWhilePlaying: false };
  const SPEEDS = [1, 1.25, 1.5, 2];

  /* -------------------------------------------------------------- Helpers */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const toman = (n) => n.toLocaleString('en-US');
  const active = () => byId(state.activeId);
  const itemMinutes = (it) => (it.type === 'video' ? Math.round(it.dur / 60) : it.mins);
  const nextItem = (it) => ALL[ALL.indexOf(it) + 1];
  const prevItem = (it) => ALL[ALL.indexOf(it) - 1];

  function stats() {
    const videos = ALL.filter((i) => i.type === 'video');
    const exs = ALL.filter((i) => i.type === 'exercise');
    const final = byRef('final');
    const done = ALL.filter((i) => i.done).length;
    return {
      done, total: ALL.length, pct: Math.round((done / ALL.length) * 100),
      vDone: videos.filter((i) => i.done).length, vTotal: videos.length,
      eDone: exs.filter((i) => i.done).length, eTotal: exs.length,
      finalDone: final.done, finalScore: state.scores.final
    };
  }

  function levelOf(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i++;
    return { n: i + 1, name: LEVELS[i].name, at: LEVELS[i].at, next: LEVELS[i + 1] };
  }

  /* --------------------------------------------------------------- Toasts */
  function toast(text, kind, ic) {
    const el = document.createElement('div');
    el.className = `toast toast--${kind || 'brand'}`;
    el.innerHTML = `${icon(ic || 'check')}<span>${text}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ------------------------------------------------------------------ XP */
  function addXP(n, quiet) {
    const before = levelOf(state.xp).n;
    state.xp += n;
    renderXP();
    const chip = $('#xpChip');
    chip.classList.remove('is-pop'); void chip.offsetWidth; chip.classList.add('is-pop');
    const lv = levelOf(state.xp);
    if (lv.n > before) {
      tip({ kind: 'gold', mood: 'cheer', text: `<b>Level ${lv.n}: ${lv.name}!</b> Every lesson, exercise and quiz adds to your score.` });
    }
  }
  function renderXP() {
    const lv = levelOf(state.xp);
    $('#xpValue').textContent = state.xp.toLocaleString('en-US');
    $('#levelName').textContent = `Level ${lv.n} · ${lv.name}`;
    if (lv.next) {
      $('#levelNext').textContent = `${lv.next.at - state.xp} XP to level ${lv.n + 1}`;
      $('#levelBar').style.width = `${((state.xp - lv.at) / (lv.next.at - lv.at)) * 100}%`;
    } else {
      $('#levelNext').textContent = 'Top level';
      $('#levelBar').style.width = '100%';
    }
  }

  /* -------------------------------------------------------------- Streak */
  function renderStreak() {
    const s = state.streak;
    const badge = $('#streakBadge');
    badge.classList.toggle('is-lit', s.today);
    $('#streakCount').textContent = s.count;
    badge.setAttribute('aria-label', `${s.count}-day streak${s.today ? ', secured today' : ', not yet secured today'}`);

    const goal = $('#streakGoal');
    goal.classList.toggle('is-done', s.today);
    if (s.today) {
      goal.innerHTML = `${icon('flame')}<span><b>${s.count}-day streak</b> secured for today</span>`;
    } else {
      const pct = Math.min(100, (s.watched / 60) * 100);
      goal.innerHTML = `${icon('flame')}<span class="hide-xs">Streak goal:</span><b>${fmt(s.watched)} / 1:00</b><span class="mini-bar"><i style="width:${pct}%"></i></span><span class="hide-xs">or 1 exercise</span>`;
    }
    if (!$('#streakPop').hidden) renderStreakPop();
  }

  function renderStreakPop() {
    const s = state.streak;
    const today = new Date();
    let days = '';
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today); date.setDate(today.getDate() - d);
      const isToday = d === 0;
      const done = isToday ? s.today : d <= s.count - (s.today ? 1 : 0);
      days += `<div class="sp-day ${done ? 'is-done' : ''} ${isToday ? 'is-today' : ''}">
        <span class="sp-dot">${done ? icon('flame') : ''}</span>${isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}</div>`;
    }
    const vDone = s.today && s.source === 'video' || s.watched >= 60;
    const eDone = s.source === 'exercise';
    $('#streakPop').innerHTML = `
      <div class="sp-head">
        <div class="sp-flame">${icon('flame')}</div>
        <div><strong>${s.count}-day streak</strong><span class="muted">Your best: ${s.best} days</span></div>
      </div>
      <div class="sp-week">${days}</div>
      <div class="sp-goal">
        <div class="sp-goal__title">${s.today ? 'Today is done. See you tomorrow!' : 'Keep it alive today'}</div>
        <div class="sp-task ${vDone ? 'is-done' : ''}"><span class="tick">${vDone ? icon('check') : ''}</span><span>Watch 1 minute of video</span><span class="muted">${fmt(Math.min(60, s.watched))} / 1:00</span></div>
        <div class="sp-or">or</div>
        <div class="sp-task ${eDone ? 'is-done' : ''}"><span class="tick">${eDone ? icon('check') : ''}</span><span>Finish 1 AI exercise</span><span class="muted">${eDone ? '1' : '0'} / 1</span></div>
      </div>
      <p class="sp-foot">A day counts as soon as you do either one. Miss a day and the streak starts again from zero.</p>`;
  }

  function addWatchTime(sec) {
    const s = state.streak;
    if (s.today) return;
    s.watched += sec;
    if (s.watched >= 60) { s.watched = 60; securedToday('video'); }
    else renderStreak();
  }

  function securedToday(source) {
    const s = state.streak;
    if (s.today) return false;
    s.today = true; s.source = source; s.count += 1; s.best = Math.max(s.best, s.count);
    renderStreak();
    const badge = $('#streakBadge');
    badge.classList.remove('is-pop'); void badge.offsetWidth; badge.classList.add('is-pop');
    tip({ kind: 'flame', mood: 'cheer', text: `<b>${s.count}-day streak!</b> ${source === 'video' ? 'One minute watched, so today counts.' : 'That exercise counted for today.'} See you tomorrow for day ${s.count + 1}.` });
    addXP(15, true);
    return true;
  }

  /* --------------------------------------------------------------- Player */
  function setTime(t) {
    const it = active();
    pl.t = Math.max(0, Math.min(it.dur, t));
    renderPlayer();
  }
  function renderPlayer() {
    const it = active();
    const pct = (pl.t / it.dur) * 100;
    $('#scrubFill').style.width = `${pct}%`;
    $('#scrubKnob').style.left = `${pct}%`;
    $('#scrub').setAttribute('aria-valuenow', Math.round(pct));
    $('#time').textContent = `${fmt(pl.t)} / ${fmt(it.dur)}`;
    $('#noteStamp').textContent = fmt(pl.t);
    const cap = $('#caption');
    if (pl.cc && pl.playing) {
      const idx = Math.min(it.captions.length - 1, Math.floor((pl.t / it.dur) * it.captions.length));
      cap.textContent = it.captions[idx];
      cap.hidden = false;
    } else cap.hidden = true;
  }
  function play() {
    const it = active();
    if (pl.playing) return;
    if (pl.t >= it.dur) pl.t = 0;
    pl.playing = true; pl.last = performance.now();
    $('#player').classList.add('is-playing');
    $('#playBtn').innerHTML = icon('pause'); $('#playBtn').setAttribute('aria-label', 'Pause');
    pl.timer = setInterval(tick, 250);
    if ($('#maki').dataset.mood === 'sleepy') { setMood('happy'); hideTip(); }
    clearTimeout(idleTimer);
    renderPlayer();
  }
  function pause(silent) {
    if (!pl.playing) return;
    pl.playing = false; clearInterval(pl.timer);
    $('#player').classList.remove('is-playing');
    $('#playBtn').innerHTML = icon('play'); $('#playBtn').setAttribute('aria-label', 'Play');
    renderPlayer();
    if (!silent && pl.t > 15 && pl.t < active().dur - 2) {
      setTimeout(() => {
        if (pl.playing || pl.nudged.has('pause' + state.activeId)) return;
        pl.nudged.add('pause' + state.activeId);
        tip({ text: `Taking a break at ${fmt(pl.t)}? I can recap what we covered so far.`, action: ['Recap', 'recap'], orb: 'recap' });
      }, 1200);
    }
  }
  function tick() {
    const now = performance.now();
    const dt = Math.min(1, (now - pl.last) / 1000);
    pl.last = now;
    const it = active();
    pl.t = Math.min(it.dur, pl.t + dt * pl.speed);
    pl.watched += dt;
    addWatchTime(dt);
    pl.xpAcc += dt;
    if (pl.xpAcc >= 30) { pl.xpAcc -= 30; addXP(5, true); }
    renderPlayer();
    if (pl.t >= it.dur) ended();
  }
  function ended() {
    pause(true);
    const it = active();
    const first = !it.done;
    it.done = true;
    renderProgress();
    if (first) addXP(20);
    const nx = nextItem(it);
    tip({
      kind: 'gold', mood: 'cheer', orb: 'quiz',
      text: nx ? `<b>${first ? 'Lesson done, +20 XP.' : 'Finished again.'}</b> Up next: ${esc(nx.title)}` : '<b>That was the last lesson.</b> You are ready for the final exam.',
      action: nx ? [nx.type === 'video' ? 'Next lesson' : nx.type === 'exercise' ? 'Start exercise' : 'Start exam', 'next'] : ['Final exam', 'exam', 'final']
    });
  }
  function seekBack(delta) {
    const before = pl.t;
    setTime(pl.t - delta);
    if (before - pl.t > 3) noteRewind();
  }
  function noteRewind() {
    pl.rewinds++;
    if (pl.rewinds >= 2 && !pl.nudged.has('rewind' + state.activeId)) {
      pl.nudged.add('rewind' + state.activeId);
      tip({ mood: 'think', moodMs: 3000, text: 'You replayed this part a few times. Want me to explain it in simpler words?', action: ['Simplify', 'simple'], orb: 'simplify' });
    }
  }

  function loadLesson(id) {
    const it = byId(id);
    if (!it || it.type !== 'video') return;
    pause(true);
    state.activeId = id;
    pl.t = 0; pl.rewinds = 0;
    $('#lessonTitle').textContent = it.title;
    $('#lessonEyebrow').textContent = `Chapter ${it.chapter} · Session ${it.index + 1}`;
    renderPlayer();
    renderAbout();
    renderNotes();
    renderChapters();
    $('#prevBtn').disabled = !prevItem(it);
    $('#nextBtn').disabled = !nextItem(it);
  }

  function goTo(it) {
    if (!it) return;
    if (it.type === 'video') { loadLesson(it.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (it.type === 'exercise') openExercise(it.ref);
    else openExam(it.ref);
  }

  /* ------------------------------------------------------------ AI feed */
  const feed = () => $('#aiFeed');
  function scrollFeed() { const f = feed(); f.scrollTop = f.scrollHeight; }
  function actionsHTML(actions) {
    if (!actions || !actions.length) return '';
    return `<div class="msg__actions">${actions.map(([label, act, arg]) => `<button type="button" data-act="${act}"${arg != null ? ` data-arg="${arg}"` : ''}>${label}</button>`).join('')}</div>`;
  }
  /* Maki's face. Moods: happy, think, cheer, sleepy */
  function makiSVG() {
    return `<svg class="maki__svg" viewBox="0 0 64 64" aria-hidden="true">
      <path class="m-ear" d="M14 23L10.5 6.5 25.5 15z"/><path class="m-ear" d="M50 23l3.5-16.5L38.5 15z"/>
      <ellipse class="m-body" cx="32" cy="37" rx="24" ry="23"/>
      <path class="m-belly" d="M22 53.5c3 3.7 6.4 5.5 10 5.5s7-1.8 10-5.5c-3 1.4-6.4 2.1-10 2.1s-7-.7-10-2.1z"/>
      <circle class="m-disc" cx="23.5" cy="33.5" r="10.5"/><circle class="m-disc" cx="40.5" cy="33.5" r="10.5"/>
      <g class="m-open"><g class="m-pupils">
        <circle class="m-pupil" cx="24" cy="34.5" r="4.8"/><circle class="m-pupil" cx="40" cy="34.5" r="4.8"/>
        <circle class="m-shine" cx="25.7" cy="32.7" r="1.6"/><circle class="m-shine" cx="41.7" cy="32.7" r="1.6"/>
      </g></g>
      <g class="m-arc"><path d="M18.5 36q5-6.5 10 0"/><path d="M35.5 36q5-6.5 10 0"/></g>
      <g class="m-line"><path d="M19 35h9"/><path d="M36 35h9"/></g>
      <path class="m-beak" d="M28.8 41.2Q32 39.6 35.2 41.2L32 46.8z"/>
      <ellipse class="m-cheek" cx="14.8" cy="43" rx="3.4" ry="2.1"/><ellipse class="m-cheek" cx="49.2" cy="43" rx="3.4" ry="2.1"/>
      <path class="m-zz" d="M52 2h5l-5 5h5M58.5 10h3l-3 3h3"/>
    </svg>`;
  }
  let moodTimer = null;
  function setMood(mood, ms) {
    $('#maki').dataset.mood = mood;
    clearTimeout(moodTimer);
    if (ms) moodTimer = setTimeout(() => { $('#maki').dataset.mood = 'happy'; }, ms);
  }

  /* Behaviour nudges: one tip bubble at a time instead of messages piling up in the chat */
  let tipTimer = null;
  function tip({ kind = 'brand', mood = 'happy', moodMs = 3500, text, action, orb }) {
    const el = $('#tip');
    el.className = `tip tip--${kind}`;
    el.innerHTML = `<p>${text}</p>${action ? `<button class="tip__btn" type="button" data-act="${action[1]}"${action[2] != null ? ` data-arg="${action[2]}"` : ''}>${action[0]}</button>` : ''}<button class="tip__x" type="button" data-act="tip-close" aria-label="Dismiss">${icon('close')}</button>`;
    el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    setMood(mood, mood === 'sleepy' ? 0 : moodMs);
    if (orb) markOrb(orb, true);
    clearTimeout(tipTimer);
    tipTimer = setTimeout(hideTip, 15000);
  }
  function hideTip() { clearTimeout(tipTimer); $('#tip').hidden = true; }
  function markOrb(name, on) { const o = $(`[data-orb="${name}"]`); if (o) o.classList.toggle('has-dot', on); }

  function aiSay(html, actions) {
    const row = document.createElement('div');
    row.className = 'msg-row';
    row.innerHTML = `<span class="maki maki--sm">${makiSVG()}</span><div class="msg msg--ai">${html}${actionsHTML(actions)}</div>`;
    feed().appendChild(row); scrollFeed();
    return row.querySelector('.msg');
  }
  function userSay(text) {
    const el = document.createElement('div');
    el.className = 'msg msg--user';
    el.textContent = text;
    feed().appendChild(el); scrollFeed();
  }
  function typing(then) {
    const row = document.createElement('div');
    row.className = 'msg-row';
    row.innerHTML = `<span class="maki maki--sm">${makiSVG()}</span><div class="msg msg--ai typing"><i></i><i></i><i></i></div>`;
    feed().appendChild(row); scrollFeed();
    setMood('think');
    setTimeout(() => { row.remove(); setMood('happy'); then(); }, 650 + Math.random() * 500);
  }

  const ORB_PROMPTS = { motivate: 'Motivate me', simplify: 'Make this simpler', recap: 'Recap this lesson', quiz: 'Quiz me' };
  let motiveIdx = 0;
  function motivate() {
    const st = stats();
    const k = state.streak;
    const leftMin = ALL.filter((i) => !i.done).reduce((m, i) => m + itemMinutes(i), 0);
    const steps = [st.vDone === st.vTotal, st.eDone === st.eTotal, st.finalDone].filter((x) => !x).length;
    const lines = [
      st.pct < 100
        ? { h: `${st.pct}% done. The hardest part is behind you.`, p: 'Starting is the hard bit, and you did that weeks ago. Keep the momentum going.' }
        : { h: 'Course complete!', p: 'You finished every lesson. That takes real commitment.' },
      k.today
        ? { h: `${k.count} days in a row!`, p: 'Today already counts. Showing up every day is what turns practice into skill.' }
        : { h: `${k.count}-day streak. ${fmt(60 - k.watched)} to go today.`, p: 'One more minute of video, or one exercise, and today counts too.', a: ['Play lesson', 'play'] },
      leftMin
        ? { h: `About ${Math.max(1, Math.round(leftMin / 60))} hours left`, p: `That is ${Math.ceil(leftMin / 15)} short sessions of 15 minutes. Two a day and you finish in about ${Math.ceil(leftMin / 30)} days.` }
        : { h: 'Nothing left but practice', p: 'Try a new prompt every day to keep your skills sharp.' },
      steps
        ? { h: `${steps} step${steps > 1 ? 's' : ''} to the on-site workshop`, p: `Finish ${steps > 1 ? 'them' : 'it'} and you join the workshop for ${toman(ONSITE.newPrice)} Toman instead of ${toman(ONSITE.oldPrice)}.`, a: ['See the steps', 'onsite'] }
        : { h: 'The on-site workshop is yours', p: 'You unlocked it. Your graduate price is held for 30 days.', a: ['See the offer', 'onsite'] }
    ];
    const m = lines[motiveIdx++ % lines.length];
    setMood('cheer', 2500);
    return aiSay(`<div class="msg__title msg__title--flame">${icon('flame')}${m.h}</div>${m.p}`, m.a ? [m.a, ['Another one', 'motivate']] : [['Another one', 'motivate']]);
  }

  function ask(text) {
    userSay(text);
    typing(() => respond(text));
  }

  function respond(q) {
    const s = q.toLowerCase();
    const it = active();
    const st = stats();
    if (/motivat|encourag|tired|bored|give up|lazy/.test(s)) return motivate();
    if (/even simpler|one line|simplest/.test(s)) {
      return aiSay(`<b>In one line:</b> ${esc(it.oneLine || 'Say what to change, say what to keep, then fix one thing at a time.')}`, [['Give me an example', 'example']]);
    }
    if (/summar|recap|tl;?dr|so far/.test(s)) {
      return aiSay(`Here is the short version of <b>${esc(it.title)}</b>:<ul>${it.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`, [['Quiz me', 'quiz']]);
    }
    if (/quiz|test me|check me/.test(s)) return quiz();
    if (/simpl|explain|don.?t (get|understand)|confus|eli5/.test(s)) {
      return aiSay(`<div class="msg__title msg__title--brand">${icon('bulb')}In simple words</div>${esc(it.simple || `“${it.title}” is about telling Nano Banana exactly what to change and what to keep. Name the thing, describe the change, and say what must stay the same. Then look at the result and ask for one small fix at a time.`)}`, [['Even simpler', 'simpler'], ['Give me an example', 'example']]);
    }
    if (/example/.test(s)) {
      return aiSay('Here is an example you can paste into Gemini:<br><i>“Replace the background with a cozy kitchen at morning light, keep the mug exactly as it is, soft shadows, shallow depth of field.”</i>');
    }
    if (/streak/.test(s)) {
      const k = state.streak;
      return aiSay(k.today
        ? `You are on a <b>${k.count}-day streak</b> and today is already counted. Your best is ${k.best} days.`
        : `You are on a <b>${k.count}-day streak</b>. To keep it today, watch at least <b>1 minute</b> of any video (you have ${fmt(k.watched)} so far) or finish <b>1 AI exercise</b>.`,
      k.today ? null : [['Play lesson', 'play'], ['Do an exercise', 'exercise', 'ex4']]);
    }
    if (/on.?site|workshop|unlock|discount|offer|in.?person|campus/.test(s)) {
      return aiSay(`The <b>on-site workshop</b> unlocks when you:<ul><li>Watch all lessons (${st.vDone}/${st.vTotal})</li><li>Complete all AI exercises (${st.eDone}/${st.eTotal})</li><li>Pass the final exam with 70% or more (${st.finalDone ? 'passed' : 'not passed yet'})</li></ul>Graduates get it for <b>${toman(ONSITE.newPrice)} Toman</b> instead of ${toman(ONSITE.oldPrice)}.`, [['Show me the offer', 'onsite']]);
    }
    if (/exam|final|test/.test(s)) {
      return aiSay('The final exam has 6 questions and takes about 10 minutes. You need 70% to pass, and you can retake it. Passing it is one of the steps to unlock the on-site workshop.', [['Start final exam', 'exam', 'final']]);
    }
    if (/xp|score|level|point/.test(s)) {
      const lv = levelOf(state.xp);
      return aiSay(`You have <b>${state.xp} XP</b> (Level ${lv.n}, ${lv.name}). You earn XP for watching (+5 every 30 s), finishing lessons (+20), AI exercises (+50) and passing exams (+100).`);
    }
    if (/nano ?banana|gemini|model/.test(s)) {
      return aiSay('Nano Banana is the nickname of Google’s image model in Gemini. You can generate new images or edit your own photos just by describing the change, and it is especially good at keeping faces and products consistent between edits.');
    }
    if (/prompt/.test(s)) {
      return aiSay('A strong image prompt has four building blocks:<ul><li><b>Subject</b>: what is in the image</li><li><b>Style</b>: photo, illustration, retro poster…</li><li><b>Lighting</b>: golden hour, studio light, neon…</li><li><b>Composition</b>: close-up, wide shot, space for text…</li></ul>Chapter 4 covers this in depth.', [['Practice in an AI exercise', 'exercise', 'ex4']]);
    }
    if (/account|buy|plan|price|pay|subscription|sign ?up/.test(s)) {
      return aiSay('Account setup and buying access are covered step by step in <b>Chapter 1</b>. Start with “Creating your Google AI Studio account”.', [['Open that lesson', 'lesson', 'u3']]);
    }
    if (/^(hi|hello|hey|salam)\b/.test(s)) {
      return aiSay('Hi! I’m Maki. Ask me anything about this lesson, or tap a circle on the left.');
    }
    return aiSay(`Good question. In the context of “${esc(it.title)}”: start by saying exactly what you want to change, then what must stay the same, and refine with one small request at a time. Want me to turn this into a short practice task?`, [['Yes, quiz me', 'quiz'], ['Explain simply', 'simple']]);
  }

  function quiz() {
    const it = active();
    const qz = it.quiz || { q: 'What should a strong image prompt always include?', options: ['Only the subject', 'Subject plus style, lighting and composition', 'Only a list of keywords'], answer: 1 };
    const el = aiSay(`<b>Quick check:</b> ${esc(qz.q)}`, qz.options.map((o, i) => [esc(o), 'answer', i]));
    el.dataset.answer = qz.answer;
  }

  function runAction(btn) {
    const act = btn.dataset.act;
    const arg = btn.dataset.arg;
    if (btn.closest('#tip')) hideTip();
    switch (act) {
      case 'play': play(); break;
      case 'recap': ask('Recap what we covered so far'); break;
      case 'quiz': ask('Quiz me'); break;
      case 'simple': ask('Make this simpler'); break;
      case 'simpler': ask('Even simpler, in one line'); break;
      case 'motivate': ask('Motivate me'); break;
      case 'tip-close': hideTip(); break;
      case 'example': ask('Give me an example'); break;
      case 'exercise': openExercise(arg); break;
      case 'exam': openExam(arg); break;
      case 'lesson': loadLesson(arg); break;
      case 'goto': goTo(byId(arg)); break;
      case 'next': goTo(nextItem(active())); break;
      case 'onsite': $('#onsite').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); $('#onsite').animate?.([{ boxShadow: '0 0 0 0 rgba(16,163,154,.6)' }, { boxShadow: '0 0 0 10px rgba(16,163,154,0)' }], { duration: 900, iterations: 2 }); break;
      case 'dismiss': btn.closest('.msg-row, .msg')?.remove(); break;
      case 'answer': {
        const msg = btn.closest('.msg');
        const right = Number(msg.dataset.answer);
        const picked = Number(arg);
        $$('button', msg).forEach((b, i) => { b.disabled = true; if (i === right) b.classList.add('is-right'); });
        if (picked !== right) btn.classList.add('is-wrong');
        typing(() => {
          if (picked === right) { aiSay('Correct! Nice work. +10 XP'); addXP(10, true); }
          else aiSay(`Not quite. The answer is “${esc(msg.querySelectorAll('button')[right].textContent)}”. Want a simpler explanation?`, [['Explain simply', 'simple']]);
        });
        break;
      }
    }
  }

  /* ---------------------------------------------------------- Sidebar */
  function itemHTML(it) {
    let meta;
    if (it.type === 'video') {
      meta = `<span>Video</span><span class="dot"></span><span>${itemMinutes(it)} min</span>`;
    } else if (it.type === 'exercise') {
      meta = `<span class="tag tag--ai">${icon('sparkles')}AI exercise</span><span>${EXERCISES[it.ref].questions.length} tasks · ${it.mins} min</span>`;
    } else {
      const sc = state.scores[it.ref];
      meta = `<span class="tag tag--exam">${icon('exam')}Exam</span><span>${EXAMS[it.ref].questions.length} questions</span>${sc != null ? `<span class="tag tag--score">Best ${sc}%</span>` : ''}`;
    }
    const cls = ['item', it.done && 'is-done', it.id === state.activeId && 'is-active'].filter(Boolean).join(' ');
    return `<button class="${cls}" type="button" data-item="${it.id}"${it.id === state.activeId ? ' aria-current="true"' : ''}>
      <span class="item__status">${it.done ? icon('check') : ''}</span>
      <span><span class="item__title">${esc(it.title)}</span><span class="item__meta">${meta}</span></span>
    </button>`;
  }

  function renderChapters() {
    const html = COURSE.map((ch, ci) => {
      const items = ch.items.filter((i) => state.filter === 'all' || i.type === state.filter);
      if (!items.length) return '';
      const done = ch.items.filter((i) => i.done).length;
      const mins = ch.items.reduce((m, i) => m + itemMinutes(i), 0);
      const open = state.filter !== 'all' || state.open.has(ch.id);
      const status = done === ch.items.length
        ? '<span class="dot"></span><span class="done-tag">Completed</span>'
        : done ? `<span class="dot"></span><span>${done}/${ch.items.length} done</span>` : '';
      return `<div class="chapter${open ? ' is-open' : ''}" data-ch="${ch.id}">
        <button class="chapter__head" type="button" aria-expanded="${open}">
          <span><span class="chapter__title">Chapter ${ci} | ${esc(ch.title)}</span>
          <span class="chapter__meta"><span>${ch.items.length} session${ch.items.length > 1 ? 's' : ''}</span><span class="dot"></span><span>${mins} min</span>${status}</span></span>
          <span class="chapter__chev">${icon('chevronDown')}</span>
        </button>
        <div class="chapter__items">${items.map(itemHTML).join('')}</div>
      </div>`;
    }).join('');
    $('#chapters').innerHTML = html;
  }

  function renderOnsite() {
    const st = stats();
    const reqs = [
      { label: 'Watch all lessons', done: st.vDone === st.vTotal, count: `${st.vDone}/${st.vTotal}`, pct: (st.vDone / st.vTotal) * 100 },
      { label: 'Complete all AI exercises', done: st.eDone === st.eTotal, count: `${st.eDone}/${st.eTotal}`, pct: (st.eDone / st.eTotal) * 100 },
      { label: 'Pass the final exam (70%+)', done: st.finalDone, count: st.finalScore != null ? `${st.finalScore}%` : 'Not taken', pct: st.finalDone ? 100 : 0 }
    ];
    const left = reqs.filter((r) => !r.done).length;
    const unlocked = left === 0;
    const off = Math.round((1 - ONSITE.newPrice / ONSITE.oldPrice) * 100);
    const el = $('#onsite');
    el.classList.toggle('is-unlocked', unlocked);
    el.innerHTML = `
      <div class="onsite__banner">
        <span class="onsite__eyebrow">${icon(unlocked ? 'unlock' : 'lock')}${unlocked ? 'Unlocked for you' : 'Unlocks when you finish'}</span>
        <h3 class="onsite__title">${ONSITE.title}</h3>
        <div class="onsite__facts">
          <span>${icon('pin')}${ONSITE.place}</span>
          <span>${icon('calendar')}${ONSITE.when}</span>
          <span>${icon('users')}${ONSITE.seats}</span>
        </div>
      </div>
      <div class="onsite__body">
        <div class="price">
          <span class="price__new">${toman(ONSITE.newPrice)} <small>Toman</small></span>
          <span class="price__off">−${off}%</span>
          <span class="price__old">${toman(ONSITE.oldPrice)}</span>
          <span class="price__note">Graduate offer · valid for 30 days after you finish</span>
        </div>
        <ul class="reqs">
          ${reqs.map((r) => `<li class="req${r.done ? ' is-done' : ''}">
            <span class="tick">${r.done ? icon('check') : ''}</span><span>${r.label}</span><span class="req__count">${r.count}</span>
            ${r.done ? '' : `<span class="req__bar"><i style="width:${r.pct}%"></i></span>`}
          </li>`).join('')}
        </ul>
        <button class="pill pill--primary" type="button" id="onsiteBtn"${unlocked ? '' : ' disabled'}>
          ${icon(unlocked ? 'unlock' : 'lock')}${unlocked ? 'Reserve your seat' : `Locked · ${left} step${left > 1 ? 's' : ''} left`}
        </button>
        <p class="onsite__hint">${unlocked ? 'Seats are limited. Your graduate price is held for 30 days.' : 'Only learners who finish this course online can join.'}</p>
      </div>`;
  }

  function renderProgress() {
    const st = stats();
    const c = 2 * Math.PI * 18;
    const ring = $('#progressRingValue');
    ring.style.strokeDasharray = c;
    ring.style.strokeDashoffset = c * (1 - st.pct / 100);
    $('#progressRingLabel').textContent = `${st.pct}%`;
    $('#progressRing').title = `Course progress: ${st.pct}%`;
    $('#sumText').textContent = `${st.done} of ${st.total} done · ${st.pct}%`;
    const totalMin = ALL.reduce((m, i) => m + itemMinutes(i), 0);
    $('#sumTime').textContent = `${Math.floor(totalMin / 60)}h ${totalMin % 60}m total`;
    $('#sumBar').style.width = `${st.pct}%`;
    renderChapters();
    renderOnsite();
  }

  /* ---------------------------------------------------- Lesson details */
  function renderAbout() {
    const it = active();
    const nx = nextItem(it);
    const nxType = nx ? (nx.type === 'video' ? 'Video' : nx.type === 'exercise' ? 'AI exercise' : 'Exam') : '';
    $('#panel-about').innerHTML = `
      <div class="about">
        <div>
          <p>${esc(it.about)}</p>
          <h3>In this session</h3>
          <ul>${it.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        </div>
        ${nx ? `<div class="up-next">
          <span class="up-next__label">Up next · ${nxType}</span>
          <span class="up-next__title">${esc(nx.title)}</span>
          <span class="muted">${itemMinutes(nx)} min · Chapter ${nx.chapter}</span>
          <button class="pill pill--solid" type="button" data-goto="${nx.id}">${nx.type === 'video' ? 'Play next' : 'Start'}${icon('chevronRight')}</button>
        </div>` : ''}
      </div>`;
  }

  function renderNotes() {
    const list = state.notes.filter((n) => n.lesson === state.activeId);
    $('#notesCount').textContent = list.length;
    $('#notesList').innerHTML = list.length
      ? list.map((n) => `<li><button class="stamp" type="button" data-seek="${n.t}">${fmt(n.t)}</button><span>${esc(n.text)}</span></li>`).join('')
      : '';
    if (!list.length) $('#notesList').innerHTML = '<li class="notes-empty" style="background:none;padding:0">No notes for this session yet. Pause on a key moment and add one.</li>';
  }

  function showTab(name) {
    $$('.tab').forEach((t) => { const on = t.dataset.tab === name; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    $('#panel-about').hidden = name !== 'about';
    $('#panel-notes').hidden = name !== 'notes';
  }

  /* ---------------------------------------------------------------- Modal */
  let modalCleanup = null;
  function openModal(html) {
    $('#modalBody').innerHTML = html;
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => ($('#modalBody button, #modalBody textarea, #modalBody input') || $('.modal__close')).focus(), 30);
  }
  function closeModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = '';
    if (modalCleanup) { modalCleanup(); modalCleanup = null; }
  }

  /* Prompt grading: a stand-in for the AI reviewer */
  function gradePrompt(text) {
    const t = text.toLowerCase();
    const words = t.split(/\s+/).filter(Boolean).length;
    const checks = [
      { key: 'Subject', ok: words >= 6, tip: 'Say clearly what is in the image and what you are changing.' },
      { key: 'Style', ok: /(photo|realistic|cinematic|illustration|watercolor|retro|vintage|minimal|3d|render|poster|style|flat|oil|sketch|editorial|film)/.test(t), tip: 'Name a style, e.g. “photorealistic” or “retro travel poster”.' },
      { key: 'Lighting', ok: /(light|lighting|lit\b|sun|golden|shadow|glow|neon|studio|night|bright|soft|warm|moody)/.test(t), tip: 'Describe the light, e.g. “soft morning light from the window”.' },
      { key: 'Composition', ok: /(close-?up|wide|angle|center|centred|centered|left|right|background|foreground|frame|framing|portrait|landscape|space|ratio|top-down|overhead|9:16|16:9|1:1)/.test(t), tip: 'Add framing, e.g. “centered, empty space at the top for a headline”.' },
      { key: 'What to keep', ok: /(keep|preserve|without|don.?t|do not|unchanged|same|only|exactly|original)/.test(t), tip: 'Say what must stay the same, e.g. “keep the faces unchanged”.' }
    ];
    const score = checks.filter((c) => c.ok).length * 20;
    return { score, checks };
  }

  function openExercise(ref) {
    const ex = EXERCISES[ref];
    const item = byRef(ref);
    let i = 0;
    const scores = [];
    let picked = null;
    let checked = false;

    function steps() { return `<div class="m-steps">${ex.questions.map((_, k) => `<i class="${k <= i ? 'is-on' : ''}"></i>`).join('')}</div>`; }
    function head() {
      return `<span class="m-eyebrow" style="color:var(--brand-ink)">${icon('sparkles')}AI exercise · Chapter ${ex.chapter}</span>
        <h2 class="m-title" id="modalTitle">${esc(ex.title)}</h2>
        <p class="m-sub">Task ${i + 1} of ${ex.questions.length} · Your AI coach checks each answer instantly.</p>${steps()}`;
    }
    function renderQ() {
      const q = ex.questions[i];
      picked = null; checked = false;
      const body = q.type === 'mcq'
        ? `<div class="options">${q.options.map((o, k) => `<button class="option" type="button" data-opt="${k}"><span class="option__key">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>`
        : `<textarea class="prompt-box" id="promptBox" placeholder="Write your prompt here…"></textarea>`;
      openModal(`${head()}<p class="m-q">${esc(q.q)}</p>${body}<div id="fb"></div>
        <div class="m-foot"><span class="muted">${q.type === 'prompt' ? 'Tip: cover subject, style, lighting, composition and what to keep.' : 'Pick one answer.'}</span>
        <button class="pill pill--primary" type="button" id="exNext">Check answer</button></div>`);
      wire();
    }
    function wire() {
      const q = ex.questions[i];
      $$('.option', $('#modalBody')).forEach((b) => b.addEventListener('click', () => {
        if (checked) return;
        $$('.option').forEach((o) => o.classList.remove('is-picked'));
        b.classList.add('is-picked'); picked = Number(b.dataset.opt);
      }));
      $('#exNext').addEventListener('click', () => {
        if (!checked) {
          if (q.type === 'mcq') {
            if (picked == null) { toast('Pick an answer first', 'brand', 'info'); return; }
            const ok = picked === q.answer;
            scores.push(ok ? 100 : 0);
            $$('.option').forEach((o, k) => { if (k === q.answer) o.classList.add('is-right'); else if (k === picked) o.classList.add('is-wrong'); });
            $('#fb').innerHTML = `<div class="feedback"><div class="feedback__head">${icon(ok ? 'check' : 'info')}${ok ? 'Correct!' : 'Not quite.'}</div><span>${esc(q.why)}</span></div>`;
          } else {
            const text = $('#promptBox').value.trim();
            if (text.length < 10) { toast('Write a little more first', 'brand', 'pencil'); return; }
            const g = gradePrompt(text);
            scores.push(g.score);
            $('#promptBox').readOnly = true;
            $('#fb').innerHTML = `<div class="feedback"><div class="feedback__head">${icon('sparkles')}AI review: ${g.score}/100</div>
              <ul class="rubric">${g.checks.map((c) => `<li class="${c.ok ? 'ok' : 'miss'}">${icon(c.ok ? 'check' : 'x')}<span><b>${c.key}</b>${c.ok ? '' : ` · ${c.tip}`}</span></li>`).join('')}</ul></div>`;
          }
          checked = true;
          $('#exNext').textContent = i + 1 < ex.questions.length ? 'Next task' : 'See results';
        } else if (i + 1 < ex.questions.length) { i++; renderQ(); }
        else finish();
      });
    }
    function finish() {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const pass = avg >= 60;
      const first = pass && !item.done;
      if (pass) item.done = true;
      const xp = first ? 50 : pass ? 10 : 5;
      openModal(`<div class="result">
        <div class="result__ring ${pass ? 'pass' : 'fail'}" style="--p:${avg}%"><span>${avg}%</span></div>
        <h3 id="modalTitle">${pass ? 'Exercise complete!' : 'Almost there'}</h3>
        <p>${pass ? 'Great work. Your AI coach saved this result to your progress.' : 'You need 60% to complete this exercise. Review the feedback and try again.'}</p>
        <span class="xp-chip">${icon('bolt')}<b>+${xp}</b> XP</span>
      </div>
      <div class="m-foot"><button class="pill pill--soft" type="button" id="exRetry">Try again</button><button class="pill pill--primary" type="button" data-close>Back to course</button></div>`);
      $('#exRetry').addEventListener('click', () => openExercise(ref));
      addXP(xp, true);
      renderProgress();
      if (!securedToday('exercise')) {
        tip(pass
          ? { kind: 'gold', mood: 'cheer', text: `<b>Exercise done: ${avg}%.</b> ${stats().eDone}/${stats().eTotal} AI exercises complete.`, action: nextItem(item) ? ['Continue', 'goto', nextItem(item).id] : null }
          : { mood: 'think', text: `<b>${avg}% this time.</b> Lighting and composition are usually what’s missing.`, action: ['Simplify', 'simple'], orb: 'simplify' });
      }
    }
    renderQ();
  }

  function openExam(ref) {
    const ex = EXAMS[ref];
    const item = byRef(ref);
    const answers = new Array(ex.questions.length).fill(null);
    let i = 0;
    let left = ex.minutes * 60;
    let timer = null;

    openModal(`<span class="m-eyebrow" style="color:#9a6200">${icon('exam')}${ref === 'final' ? 'Final exam' : 'Chapter quiz'}</span>
      <h2 class="m-title" id="modalTitle">${esc(ex.title)}</h2>
      <p class="m-sub">${ex.questions.length} questions · ${ex.minutes} minutes · Pass mark ${ex.pass}%</p>
      <div class="info-grid">
        <div><span>Your best score</span><b>${state.scores[ref] != null ? state.scores[ref] + '%' : 'Not taken yet'}</b></div>
        <div><span>Retakes</span><b>Unlimited</b></div>
      </div>
      ${ref === 'final' ? '<p class="m-sub" style="margin-top:14px">Passing the final exam is one of the three steps to unlock the on-site workshop.</p>' : ''}
      <div class="m-foot"><span class="muted">The timer starts when you begin.</span><button class="pill pill--primary" type="button" id="examStart">Start exam</button></div>`);
    $('#examStart').addEventListener('click', () => {
      timer = setInterval(() => {
        left--;
        const el = $('#examClock'); if (el) el.textContent = fmt(left);
        if (left <= 0) finish();
      }, 1000);
      modalCleanup = () => clearInterval(timer);
      renderQ();
    });

    function renderQ() {
      const q = ex.questions[i];
      $('#modalBody').innerHTML = `<span class="m-eyebrow" style="color:#9a6200">${icon('clock')}<span id="examClock">${fmt(left)}</span> left</span>
        <h2 class="m-title" id="modalTitle">${esc(ex.title)}</h2>
        <p class="m-sub">Question ${i + 1} of ${ex.questions.length}</p>
        <div class="m-steps">${ex.questions.map((_, k) => `<i class="${answers[k] != null || k === i ? 'is-on' : ''}"></i>`).join('')}</div>
        <p class="m-q">${esc(q.q)}</p>
        <div class="options">${q.options.map((o, k) => `<button class="option${answers[i] === k ? ' is-picked' : ''}" type="button" data-opt="${k}"><span class="option__key">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
        <div class="m-foot"><button class="pill pill--soft" type="button" id="examPrev"${i === 0 ? ' disabled' : ''}>Back</button>
        <button class="pill pill--primary" type="button" id="examNext">${i + 1 < ex.questions.length ? 'Next question' : 'Submit exam'}</button></div>`;
      $$('.option', $('#modalBody')).forEach((b) => b.addEventListener('click', () => {
        answers[i] = Number(b.dataset.opt);
        $$('.option').forEach((o) => o.classList.toggle('is-picked', o === b));
      }));
      $('#examPrev').addEventListener('click', () => { i--; renderQ(); });
      $('#examNext').addEventListener('click', () => {
        if (answers[i] == null) { toast('Choose an answer to continue', 'brand', 'info'); return; }
        if (i + 1 < ex.questions.length) { i++; renderQ(); } else finish();
      });
    }

    function finish() {
      clearInterval(timer);
      const right = ex.questions.filter((q, k) => answers[k] === q.answer).length;
      const score = Math.round((right / ex.questions.length) * 100);
      const pass = score >= ex.pass;
      const first = pass && !item.done;
      state.scores[ref] = Math.max(state.scores[ref] || 0, score);
      if (pass) item.done = true;
      const xp = first ? 100 : pass ? 20 : 10;
      $('#modalBody').innerHTML = `<div class="result">
        <div class="result__ring ${pass ? 'pass' : 'fail'}" style="--p:${score}%"><span>${score}%</span></div>
        <h3 id="modalTitle">${pass ? 'You passed!' : 'Not passed yet'}</h3>
        <p>${right} of ${ex.questions.length} correct. ${pass ? (ref === 'final' ? 'The final exam step for the on-site workshop is now complete.' : 'Nice work on this chapter.') : `You need ${ex.pass}% to pass. Your AI assistant can help you review the questions you missed.`}</p>
        <span class="xp-chip">${icon('bolt')}<b>+${xp}</b> XP</span>
      </div>
      <div class="m-foot"><button class="pill pill--soft" type="button" id="examRetry">Retake</button><button class="pill pill--primary" type="button" data-close>Back to course</button></div>`;
      $('#examRetry').addEventListener('click', () => { closeModal(); openExam(ref); });
      addXP(xp, true);
      renderProgress();
      const st = stats();
      if (pass && ref === 'final' && st.vDone === st.vTotal && st.eDone === st.eTotal) celebrateUnlock();
      else tip(pass
        ? { kind: 'gold', mood: 'cheer', text: `<b>${esc(ex.title)} passed: ${score}%.</b>${ref === 'final' ? ' Finish the remaining lessons and exercises to unlock the on-site workshop.' : ''}`, action: ref === 'final' ? ['What’s left?', 'onsite'] : null }
        : { mood: 'think', text: `<b>${esc(ex.title)}: ${score}%.</b> A quick recap usually helps a lot on the retake.`, action: ['Recap', 'recap'], orb: 'recap' });
    }
  }

  function celebrateUnlock() {
    renderProgress();
    tip({ kind: 'gold', mood: 'cheer', moodMs: 5000, text: `<b>You unlocked the on-site workshop!</b> Your graduate price is ${toman(ONSITE.newPrice)} Toman.`, action: ['See offer', 'onsite'] });
  }

  function openOnsite() {
    const off = ONSITE.oldPrice - ONSITE.newPrice;
    openModal(`<span class="m-eyebrow" style="color:var(--brand-ink)">${icon('unlock')}Graduate offer</span>
      <h2 class="m-title" id="modalTitle">${ONSITE.title}</h2>
      <p class="m-sub">${ONSITE.place} · ${ONSITE.when} · ${ONSITE.seats}</p>
      <div class="cohorts">${ONSITE.cohorts.map((c, k) => `<label class="cohort"><input type="radio" name="cohort" value="${c.id}"${k === 0 ? ' checked' : ''}><span><b>${c.label}</b><span class="muted">10:00 – 16:00 each day</span></span><span class="muted">${c.left} seats left</span></label>`).join('')}</div>
      <div class="summary">
        <div><span>Workshop price</span><span>${toman(ONSITE.oldPrice)} Toman</span></div>
        <div class="save"><span>Graduate discount</span><span>−${toman(off)} Toman</span></div>
        <div class="total"><span>You pay</span><span>${toman(ONSITE.newPrice)} Toman</span></div>
      </div>
      <div class="m-foot"><span class="muted">Free cancellation up to 7 days before</span><button class="pill pill--primary" type="button" id="reserveBtn">Reserve and pay</button></div>`);
    $('#reserveBtn').addEventListener('click', () => {
      const c = ONSITE.cohorts.find((x) => x.id === $('input[name="cohort"]:checked').value);
      closeModal();
      toast(`Seat held for “${c.label}”. Checkout is the next step.`, 'brand', 'check');
    });
  }

  function openInfo() {
    const st = stats();
    const totalMin = ALL.reduce((m, i) => m + itemMinutes(i), 0);
    openModal(`<span class="m-eyebrow muted">${icon('info')}Course info</span>
      <h2 class="m-title" id="modalTitle">Nano Banana | The Complete Course on AI Image Generation &amp; Editing</h2>
      <p class="m-sub">Learn to create and edit professional images with Google’s Nano Banana model in Gemini, from your first edit to ad campaigns, photo restoration and your own reusable prompt system.</p>
      <div class="info-grid">
        <div><span>Length</span><b>${Math.floor(totalMin / 60)}h ${totalMin % 60}m · ${st.total} sessions</b></div>
        <div><span>Level</span><b>Beginner to intermediate</b></div>
        <div><span>Practice</span><b>${st.eTotal} AI exercises · 2 exams</b></div>
        <div><span>Certificate</span><b>Yes, after the final exam</b></div>
        <div><span>Your progress</span><b>${st.pct}% complete</b></div>
        <div><span>Learners</span><b>3,482 enrolled</b></div>
      </div>
      <div class="m-foot"><span></span><button class="pill pill--solid" type="button" data-close>Close</button></div>`);
  }

  function openRate() {
    openModal(`<span class="m-eyebrow muted">${icon('star')}Your rating</span>
      <h2 class="m-title" id="modalTitle">How is this course so far?</h2>
      <p class="m-sub">Your rating helps other learners and helps the instructor improve the course.</p>
      <div class="stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map((n) => `<button type="button" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}" data-star="${n}">${icon('star')}</button>`).join('')}</div>
      <textarea class="prompt-box" id="rateText" style="min-height:80px" placeholder="What did you like? What could be better? (optional)"></textarea>
      <div class="m-foot"><span></span><button class="pill pill--primary" type="button" id="rateSend" disabled>Submit rating</button></div>`);
    let val = 0;
    $$('[data-star]').forEach((b) => b.addEventListener('click', () => {
      val = Number(b.dataset.star);
      $$('[data-star]').forEach((s) => { const on = Number(s.dataset.star) <= val; s.classList.toggle('is-on', on); s.setAttribute('aria-checked', Number(s.dataset.star) === val); });
      $('#rateSend').disabled = false;
    }));
    $('#rateSend').addEventListener('click', () => { closeModal(); toast(`Thanks for rating this course ${val}/5`, 'xp', 'star'); });
  }

  /* ------------------------------------------------------------- Demo */
  function demoComplete() {
    ALL.forEach((i) => { i.done = true; });
    state.scores.final = 92;
    securedToday('video');
    celebrateUnlock();
    $('#onsite').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function demoReset() {
    ALL.forEach((i) => { i.done = INITIAL_DONE[i.id]; });
    state.scores = { quiz3: 85 };
    state.xp = 640;
    Object.assign(state.streak, { count: 6, best: 14, today: false, watched: 0, source: null });
    pl.nudged.clear();
    hideTip(); setMood('happy'); $$('.orb').forEach((o) => o.classList.remove('has-dot'));
    renderXP(); renderStreak(); renderProgress(); loadLesson('u1');
    toast('Demo progress reset', 'brand', 'rewind');
  }

  /* ------------------------------------------------------------ Popovers */
  function togglePop(btn, pop, render) {
    const open = pop.hidden;
    closePops();
    if (open) { if (render) render(); pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
  }
  function closePops() {
    [['#streakBadge', '#streakPop'], ['#menuBtn', '#menu']].forEach(([b, p]) => { $(p).hidden = true; $(b).setAttribute('aria-expanded', 'false'); });
  }

  /* --------------------------------------------------------------- Wire */
  let idleTimer = null;
  function wire() {
    // Player
    $('#bigPlay').addEventListener('click', play);
    $('#playBtn').addEventListener('click', () => (pl.playing ? pause() : play()));
    $('#player .player__poster').addEventListener('click', () => (pl.playing ? pause() : play()));
    $('#rewBtn').addEventListener('click', () => seekBack(10));
    $('#speedBtn').addEventListener('click', () => {
      pl.speed = SPEEDS[(SPEEDS.indexOf(pl.speed) + 1) % SPEEDS.length];
      $('#speedBtn').textContent = `${pl.speed}x`;
      if (pl.speed === 2 && !pl.nudged.has('speed')) {
        pl.nudged.add('speed');
        tip({ text: 'Nice pace at 2×! I’ll have a quick question ready when you finish.', orb: 'quiz' });
      }
    });
    $('#ccBtn').addEventListener('click', () => { pl.cc = !pl.cc; $('#ccBtn').classList.toggle('is-on', pl.cc); renderPlayer(); });
    $('#fsBtn').addEventListener('click', () => {
      const p = $('#player');
      if (document.fullscreenElement) document.exitFullscreen?.();
      else p.requestFullscreen?.().catch(() => toast('Full screen is not available here', 'brand', 'info'));
    });
    const scrub = $('#scrub');
    const seekFromEvent = (e) => {
      const r = scrub.getBoundingClientRect();
      const before = pl.t;
      setTime(((e.clientX - r.left) / r.width) * active().dur);
      if (before - pl.t > 3) noteRewind();
    };
    scrub.addEventListener('pointerdown', (e) => { seekFromEvent(e); scrub.setPointerCapture(e.pointerId); });
    scrub.addEventListener('pointermove', (e) => { if (scrub.hasPointerCapture(e.pointerId)) setTime(((e.clientX - scrub.getBoundingClientRect().left) / scrub.getBoundingClientRect().width) * active().dur); });
    scrub.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { setTime(pl.t + 5); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { seekBack(5); e.preventDefault(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closePops(); if (!$('#modal').hidden) closeModal(); }
      const tag = (e.target.tagName || '').toLowerCase();
      if (e.key === ' ' && !['input', 'textarea', 'button'].includes(tag) && $('#modal').hidden) { e.preventDefault(); pl.playing ? pause() : play(); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && pl.playing) { pause(true); pl.hiddenWhilePlaying = true; }
      else if (!document.hidden && pl.hiddenWhilePlaying) {
        pl.hiddenWhilePlaying = false;
        tip({ text: `Welcome back! I paused the video at ${fmt(pl.t)} for you.`, action: ['Resume', 'play'] });
      }
    });
    $('#prevBtn').addEventListener('click', () => goTo(prevItem(active())));
    $('#nextBtn').addEventListener('click', () => goTo(nextItem(active())));

    // AI
    $('#aiForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#aiText').value.trim();
      if (!v) return;
      $('#aiText').value = '';
      ask(v);
    });
    $('#aiRail').addEventListener('click', (e) => {
      const b = e.target.closest('[data-orb]');
      if (!b) return;
      markOrb(b.dataset.orb, false);
      ask(ORB_PROMPTS[b.dataset.orb]);
    });
    $('.ai-card').addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) runAction(b); });

    // Sidebar
    $('#chapters').addEventListener('click', (e) => {
      const it = e.target.closest('[data-item]');
      if (it) { goTo(byId(it.dataset.item)); return; }
      const head = e.target.closest('.chapter__head');
      if (head && state.filter === 'all') {
        const id = head.parentElement.dataset.ch;
        state.open.has(id) ? state.open.delete(id) : state.open.add(id);
        renderChapters();
      }
    });
    $$('.filter').forEach((f) => f.addEventListener('click', () => {
      state.filter = f.dataset.filter;
      $$('.filter').forEach((x) => x.classList.toggle('is-active', x === f));
      renderChapters();
    }));
    $('#collapseAll').addEventListener('click', () => {
      if (state.open.size) state.open.clear(); else COURSE.forEach((c) => state.open.add(c.id));
      renderChapters();
    });
    $('#onsite').addEventListener('click', (e) => { if (e.target.closest('#onsiteBtn')) openOnsite(); });

    // Details
    $$('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
    $('#panel-about').addEventListener('click', (e) => { const b = e.target.closest('[data-goto]'); if (b) goTo(byId(b.dataset.goto)); });
    $('#addNoteBtn').addEventListener('click', () => { showTab('notes'); $('#noteText').focus(); });
    $('#noteForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = $('#noteText').value.trim();
      if (!text) { $('#noteText').focus(); return; }
      state.notes.push({ lesson: state.activeId, t: pl.t, text });
      state.notes.sort((a, b) => a.t - b.t);
      $('#noteText').value = '';
      renderNotes();
      toast('Note saved', 'brand', 'pencil');
    });
    $('#notesList').addEventListener('click', (e) => { const b = e.target.closest('[data-seek]'); if (b) setTime(Number(b.dataset.seek)); });
    $('#likeBtn').addEventListener('click', () => {
      state.liked = !state.liked; if (state.liked && state.disliked) { state.disliked = false; }
      syncVotes();
    });
    $('#dislikeBtn').addEventListener('click', () => {
      state.disliked = !state.disliked; if (state.disliked && state.liked) { state.liked = false; }
      syncVotes();
    });
    $('#reportBtn').addEventListener('click', () => toast('Thanks. Our support team will check this session.', 'brand', 'alert'));

    // Header
    $('#streakBadge').addEventListener('click', (e) => { e.stopPropagation(); togglePop($('#streakBadge'), $('#streakPop'), renderStreakPop); });
    $('#menuBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePop($('#menuBtn'), $('#menu')); });
    $('#menu').addEventListener('click', (e) => {
      const b = e.target.closest('[data-menu]'); if (!b) return;
      closePops();
      ({ rate: openRate, complete: demoComplete, reset: demoReset })[b.dataset.menu]();
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.popover')) closePops(); });
    $('#infoBtn').addEventListener('click', openInfo);
    $('#rateBtn').addEventListener('click', openRate);

    // Modal
    $('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  }

  function syncVotes() {
    $('#likeBtn').setAttribute('aria-pressed', state.liked);
    $('#dislikeBtn').setAttribute('aria-pressed', state.disliked);
    $('#likeCount').textContent = 45 + (state.liked ? 1 : 0);
    $('#dislikeCount').textContent = state.disliked ? 1 : 0;
  }

  /* --------------------------------------------------------------- Boot */
  function boot() {
    hydrateIcons();
    wire();
    renderXP();
    renderStreak();
    renderProgress();
    loadLesson(state.activeId);

    const st = stats();
    $('#maki').innerHTML = makiSVG();
    aiSay(`Hi, I’m <b>Maki</b>, your study buddy. You’re <b>${st.pct}%</b> through the course. Ask me anything, or tap a circle on the left when you need a boost or a simpler explanation.`);
    setTimeout(() => tip({ kind: 'gold', text: 'Chapter 4’s AI exercise takes 5 minutes and keeps your streak alive today.', action: ['Start', 'exercise', 'ex4'] }), 900);
    idleTimer = setTimeout(() => {
      if (pl.playing || state.streak.today) return;
      tip({ kind: 'flame', mood: 'sleepy', text: `<b>Your ${state.streak.count}-day streak is waiting.</b> One minute of video is enough today.`, action: ['Play', 'play'], orb: 'motivate' });
    }, 40000);
  }

  boot();
})();
