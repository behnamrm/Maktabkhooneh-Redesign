/* Shared core for the course player pages (lesson page and exercise page):
   course data, saved progress, streak, XP, the learner's assistant (a 2D
   character of the learner), chat quizzes, the course content sidebar, the
   on-site card and shared dialogs. Pages add their own behaviour through
   MK.init(hooks). Everything runs client-side with mock data. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- Icons */
  const ICONS = {
    check: 'M5 12.5l4.5 4.5L19 7.5',
    chevronDown: 'M6 9l6 6 6-6',
    chevronLeft: 'M15 6l-6 6 6 6',
    chevronRight: 'M9 6l6 6-6 6',
    arrowRight: 'M5 12h14M13 6l6 6-6 6',
    arrowUp: 'M12 19V5M6 11l6-6 6 6',
    arrowDown: 'M12 5v14M6 13l6 6 6-6',
    play: 'M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z',
    pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
    star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0',
    dots: 'M12 5h.01M12 12h.01M12 19h.01',
    grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
    sidebar: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM15 4v16',
    flame: 'M12 2.5c.9 3.3 4.9 5.6 4.9 10.4A4.9 4.9 0 0 1 12 21.5a4.9 4.9 0 0 1-4.9-4.9c0-2.1 1-3.7 2.2-4.8.2 1.7 1.1 2.8 2.3 3-.6-2.9-.4-6.8.4-12.3z',
    sparkles: 'M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9zM18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z',
    bolt: 'M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z',
    thumbUp: 'M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.3 20H7',
    thumbDown: 'M17 13V4h3v9zM17 13l-4 7a2 2 0 0 1-2-2v-4H5.5a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 6.7 4H17',
    alert: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5M12 16h.01',
    pencil: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    unlock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 6.6-1.6',
    send: 'M5 12l15-7-6 15-2.5-6.5zM11.5 13.5L20 5',
    volume: 'M4 10v4h4l5 4V6l-5 4zM16.5 9a4 4 0 0 1 0 6',
    fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    cc: 'M3.5 6.5h17v11h-17zM10.5 10.3a2 2 0 1 0 0 3.4M16.5 10.3a2 2 0 1 0 0 3.4',
    rewind: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4',
    refresh: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4',
    swap: 'M7 8h13l-4-4M17 16H4l4 4',
    plus: 'M12 5v14M5 12h14',
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
    chat: 'M4.5 5.5h15v10.5H10l-5.5 4.5zM10.3 9.2a1.8 1.8 0 1 1 2.6 1.6c-.5.2-.9.6-.9 1.2v.3M12 14.1h.01',
    code: 'M8.5 8l-4 4 4 4M15.5 8l4 4-4 4M13.5 5l-3 14',
    terminal: 'M4 5h16v14H4zM7.5 9.5l3 2.5-3 2.5M12.5 15h4',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5h.01',
    book: 'M5 5a2 2 0 0 1 2-2h12v15H7a2 2 0 0 0-2 2zM5 20a2 2 0 0 0 2 2h12v-4',
    briefcase: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
    heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    rocket: 'M12 15l-3-3c1.2-4.3 4.6-7.7 10-9-1.3 5.4-4.7 8.8-9 10zM9 12l-3.5.5L3.5 16l4-1M12 15l-.5 3.5L8 20.5l1-4',
    award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14l-1.5 7 5-3 5 3-1.5-7',
    folder: 'M3.5 6.5a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z'
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

  /* -------------------------------------------------------------- Helpers */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtCode = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const fmt = (s) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const toman = (n) => n.toLocaleString('en-US');
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: progress lives for this visit only */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* -------------------------------------------- The learner and their character */
  const DEFAULT_PROFILE = { name: 'Sam', skin: '#f1c7a5', hair: '#3b2a20', style: 'short', shirt: '#10a39a' };
  const profile = Object.assign({}, DEFAULT_PROFILE, store.get('mk.profile') || {});
  const cleanName = (s) => String(s).replace(/[^\p{L}\p{N} .-]/gu, '').trim().slice(0, 20) || DEFAULT_PROFILE.name;
  profile.name = cleanName(profile.name);
  const assistantName = () => `${profile.name}’s Assistant`;
  const withName = (s) => String(s).split('{name}').join(profile.name);

  const HAIR = {
    short: { back: '', front: 'M17.6 27.5C16.4 17 23.3 11 32 11s15.6 6 14.4 16.5c-1.6-4.6-5.2-7.6-9.4-8.6-3.6 3-10.4 5.2-19.4 8.6z' },
    long: { back: 'M15.5 31c-1.5-13 6.5-20.5 16.5-20.5S50 18 48.5 31v18c-3 2.2-6.5 2.2-9 0V33h-15v16c-2.5 2.2-6 2.2-9 0z', front: 'M18 27c-.6-9.5 6.4-15 14-15s14.6 5.5 14 15c-3-5.5-8-8-14-8s-11 2.5-14 8z' },
    curly: { back: '', front: 'M17 29a5 5 0 0 1 1.5-8.5 6 6 0 0 1 7-6.5 6.5 6.5 0 0 1 13 0 6 6 0 0 1 7 6.5A5 5 0 0 1 47 29c-2.5-4.5-6-6.5-15-6.5S19.5 24.5 17 29z' },
    bun: { back: 'M27 9a5 5 0 1 0 10 0 5 5 0 0 0-10 0z', front: 'M17.8 27C17 17.5 23.5 12.5 32 12.5S47 17.5 46.2 27c-2.5-5-7-7.5-14.2-7.5S20.3 22 17.8 27z' }
  };
  function avatarSVG(p) {
    p = p || profile;
    const h = HAIR[p.style] || HAIR.short;
    return `<svg class="avatar__svg" viewBox="0 0 64 64" aria-hidden="true">
      ${h.back ? `<path d="${h.back}" fill="${p.hair}"/>` : ''}
      <path d="M8 64c1-12.5 11-20 24-20s23 7.5 24 20z" fill="${p.shirt}"/>
      <path d="M26.5 44.5l5.5 6 5.5-6" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27.5 38h9v8c-2.5 2-6.5 2-9 0z" fill="${p.skin}"/><path d="M27.5 38h9v3.5c-2.5 1.4-6.5 1.4-9 0z" fill="rgba(0,0,0,.08)"/>
      <circle cx="18.6" cy="30" r="3" fill="${p.skin}"/><circle cx="45.4" cy="30" r="3" fill="${p.skin}"/>
      <ellipse cx="32" cy="29" rx="13.6" ry="15" fill="${p.skin}"/>
      <path d="${h.front}" fill="${p.hair}"/>
      <path class="a-brows" d="M22.8 23.4q3.2-1.8 6.4 0M34.8 23.4q3.2-1.8 6.4 0" fill="none" stroke="${p.hair}" stroke-width="1.7" stroke-linecap="round"/>
      <g class="a-open"><g class="a-pupils">
        <circle cx="26" cy="29" r="2.3" fill="#1f2a2b"/><circle cx="38" cy="29" r="2.3" fill="#1f2a2b"/>
        <circle cx="26.8" cy="28.2" r=".75" fill="#fff"/><circle cx="38.8" cy="28.2" r=".75" fill="#fff"/>
      </g></g>
      <path class="a-arc" d="M23.6 29.6q2.4-2.8 4.8 0M35.6 29.6q2.4-2.8 4.8 0" fill="none" stroke="#1f2a2b" stroke-width="1.8" stroke-linecap="round"/>
      <path class="a-line" d="M23.6 29.5h4.8M35.6 29.5h4.8" fill="none" stroke="#1f2a2b" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="22.5" cy="34.2" rx="2.6" ry="1.6" fill="#ff8f7d" opacity=".42"/><ellipse cx="41.5" cy="34.2" rx="2.6" ry="1.6" fill="#ff8f7d" opacity=".42"/>
      <path class="a-mouth a-mouth--happy" d="M28 36q4 3.6 8 0" fill="none" stroke="#7a3b2e" stroke-width="1.8" stroke-linecap="round"/>
      <path class="a-mouth a-mouth--cheer" d="M27.5 35.3h9q-.6 5.6-4.5 5.6t-4.5-5.6z" fill="#7a3b2e"/>
      <path class="a-mouth a-mouth--think" d="M29.4 37.4q2.6-1.4 5.2.3" fill="none" stroke="#7a3b2e" stroke-width="1.8" stroke-linecap="round"/>
      <circle class="a-mouth a-mouth--sleepy" cx="32" cy="37.2" r="1.3" fill="#7a3b2e"/>
      <path class="a-zz" d="M51 3h5l-5 5h5M57.5 11h3l-3 3h3" fill="none" stroke="#9aa1aa" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /* ----------------------------------------------------------------- Data */
  const video = (id, title, sec, done) => ({ id, type: 'video', title, dur: sec, done: !!done });
  const quiz = (id, ref, title, done) => ({ id, type: 'quiz', ref, title, mins: 3, done: !!done });
  const coding = (id, ref, title, done, mins) => ({ id, type: 'exercise', ref, title, mins: mins || 8, done: !!done });

  const PYTHON = [
    { id: 'c0', title: 'About this course', items: [
      video('u1', 'What is Python and who is this course for?', 120, 1),
      video('u2', 'How to use this course', 180, 1)
    ] },
    { id: 'c1', title: 'Setting up & your first program', items: [
      video('u3', 'Installing Python and VS Code', 240, 1),
      video('u4', 'Your first program with print()', 300, 1),
      video('u5', 'Comments and running a script', 210, 1),
      quiz('q1', 'q1', 'Quiz: Your first program', 1),
      coding('i1', 'i1', 'Code: Print a welcome card', 1, 6)
    ] },
    { id: 'c2', title: 'Variables & data types', items: [
      video('u6', 'Variables: giving names to values', 300, 1),
      video('u7', 'Numbers and math operators', 360, 1),
      video('u8', 'Strings and f-strings', 360, 1),
      video('u9', 'Getting input from the user', 240, 1),
      coding('i2', 'i2', 'Code: Build a tip calculator', 1)
    ] },
    { id: 'c3', title: 'Making decisions', items: [
      video('u10', 'True, False and comparisons', 300, 1),
      video('u11', 'if, elif and else', 360, 1),
      video('u12', 'Combining conditions with and, or, not', 300, 1),
      quiz('q2', 'q2', 'Quiz: Decisions', 0)
    ] },
    { id: 'c4', title: 'Loops', items: [
      video('u13', 'for loops and range()', 360, 1),
      video('u14', 'while loops', 300, 1),
      video('u15', 'break and continue', 240, 0),
      coding('i3', 'i3', 'Code: FizzBuzz', 0, 10)
    ] },
    { id: 'c5', title: 'Lists & dictionaries', items: [
      video('u16', 'Lists: storing many values', 360, 0),
      video('u17', 'Looping over a list', 300, 0),
      video('u18', 'Dictionaries: keys and values', 360, 0),
      video('u19', 'Useful list and dictionary methods', 300, 0),
      quiz('q3', 'q3', 'Quiz: Lists and dictionaries', 0)
    ] },
    { id: 'c6', title: 'Functions', items: [
      video('u20', 'Defining your own functions', 360, 0),
      video('u21', 'Parameters and return values', 360, 0),
      video('u22', 'Scope: where variables live', 300, 0),
      video('u23', 'Reading error messages without fear', 300, 0),
      coding('i4', 'i4', 'Code: Write a grade function', 0, 10)
    ] },
    { id: 'c7', title: 'Final project', items: [
      video('u24', 'Planning your number guessing game', 240, 0),
      coding('fp', 'fp', 'Final project: Number guessing game', 0, 30)
    ] }
  ];

  const LESSON_EXTRA = {
    u1: {
      about: 'A quick tour of the course: what Python is, what you will build by the end, and who this course is for. If you have never written code, or you tried before and got stuck, this course starts from zero and moves one small step at a time.',
      points: [
        'Python is a programming language that reads almost like English. It runs websites, data analysis, AI and everyday automation.',
        'You learn variables, decisions, loops, lists and functions, then build a number guessing game.',
        'Every chapter ends with a chat quiz or a coding exercise where you see your result live.'
      ],
      captions: [
        'Hi, and welcome to Python Fundamentals.',
        'Python is one of the easiest programming languages to start with, and one of the most useful.',
        'This course is for complete beginners. You don’t need any math or computer science background.',
        'We start with print and variables, then move on to decisions, loops, lists and functions.',
        'After the lessons you practise right away: quick chat quizzes and coding exercises that run in your browser.',
        'At the end you build your own number guessing game and unlock the on-site bootcamp.',
        'Let’s write some code.'
      ],
      oneLine: 'Python lets you tell a computer what to do in words that read almost like English.',
      simple: 'A program is a list of instructions, like a recipe. Python is the language you write the recipe in. This course teaches you the words and the grammar, one small step at a time.',
      howto: ['Install Python and VS Code. Chapter 1 shows you how.', 'Watch each lesson, then type the code yourself.', 'Finish the quiz or coding exercise at the end of each chapter.', 'Ask me whenever something is unclear.'],
      quiz: { q: 'Who is this course for?', options: ['Only people who already code', 'Complete beginners who want to learn Python', 'Only data scientists'], answer: 1 }
    }
  };

  /* Chat quizzes: answered in the assistant panel. Types: mcq (tap or type) and text (type). */
  const QUIZZES = {
    q1: { title: 'Quiz: Your first program', topic: 'print() and comments', questions: [
      { type: 'mcq', q: "What does `print('Hi')` show on the screen?", options: ['Hi', "'Hi'", 'print Hi', 'Nothing'], answer: 0, hint: 'print() shows the text inside the quotes. The quotes only tell Python where the text starts and ends.', why: 'print() shows the text without the quotes.' },
      { type: 'text', q: 'What does `print(2 + 3)` show? Type the answer.', accept: ['5'], hint: 'Python works out the math inside the brackets first.', why: 'Python adds the numbers first, then prints the result: 5.' },
      { type: 'mcq', q: 'Which line is a comment?', options: ['# say hello', "print('# hello')", '"say hello"', '// say hello'], answer: 0, hint: 'In Python, comments start with one special symbol.', why: 'Comments start with #. Python skips them when it runs your code.' }
    ] },
    q2: { title: 'Quiz: Decisions', topic: 'comparisons and if statements', questions: [
      { type: 'mcq', q: 'What is the result of `5 > 3`?', options: ['True', 'False', '5', 'An error'], answer: 0, hint: 'A comparison is a yes-or-no question. Is 5 bigger than 3?', why: 'Comparisons give True or False. 5 is bigger than 3, so it is True.' },
      { type: 'text', q: '`x = 7`. What does `print(x % 2 == 1)` show?', accept: ['true'], hint: '% gives the remainder of a division. What is left over when you divide 7 by 2?', why: '7 % 2 is 1, and 1 == 1 is True. This is how you check for odd numbers.' },
      { type: 'mcq', q: 'Which keyword checks another condition after `if`?', options: ['elif', 'else if', 'elseif', 'then'], answer: 0, hint: 'Python shortens “else if” into one word.', why: 'Python uses elif, short for “else if”.' },
      { type: 'mcq', q: 'What does `not True` give?', options: ['False', 'True', 'None', 'An error'], answer: 0, hint: 'not flips a value to its opposite.', why: 'not flips True to False and False to True.' }
    ] },
    q3: { title: 'Quiz: Lists and dictionaries', topic: 'lists and dictionaries', questions: [
      { type: 'mcq', q: "`fruits = ['apple', 'kiwi', 'fig']`. What is `fruits[1]`?", options: ['kiwi', 'apple', 'fig', 'An error'], answer: 0, hint: 'Python starts counting positions at 0, not 1.', why: 'Positions start at 0, so fruits[1] is the second item: kiwi.' },
      { type: 'text', q: "What does `len(['a', 'b', 'c'])` return? Type the answer.", accept: ['3'], hint: 'len() counts how many items are in the list.', why: 'len() counts the items. There are 3.' },
      { type: 'mcq', q: "`person = {'name': 'Sam', 'age': 30}`. How do you get the age?", options: ["person['age']", 'person.age', 'person(age)', 'age[person]'], answer: 0, hint: 'Dictionaries use square brackets with the key inside.', why: "You read a value with its key in square brackets: person['age']." },
      { type: 'mcq', q: 'Which method adds an item to the end of a list?', options: ['append()', 'add()', 'push()', 'insert_end()'], answer: 0, hint: 'The method name means “attach at the end”.', why: 'append() adds one item to the end of a list.' }
    ] }
  };

  /* Interactive exercises: run on exercise.html. Task types: code (Python, runs live),
     prompt (image prompt studio), order (drag into order) and checklist (deliverables). */
  const nameStr = "'Welcome, {name}!'";
  const PY_EXERCISES = {
    i1: { title: 'Print a welcome card', skills: ['Showing text with print()', 'Repeating text with *'], tasks: [
      { type: 'code', title: 'Say welcome', brief: 'Use `print()` to show `Welcome, {name}!` on the first line.', starter: "# Your first line of code\nprint('Hello')\n",
        tests: [['First line says “Welcome, {name}!”', `__lines__[:1] == [${nameStr}]`]],
        hints: ['Change the text inside the quotes.', 'Keep the quotes and the brackets: `print(\'...\')`.', 'The exact text is `Welcome, {name}!`, including the comma and the exclamation mark.'],
        howto: ['Find the line `print(\'Hello\')`.', 'Replace `Hello` with `Welcome, {name}!`.', 'Keep the quotes and brackets around it.', 'Watch the output on the right update.'],
        solution: `print(${nameStr})` },
      { type: 'code', title: 'Add a divider', brief: "Add a second line that prints 20 dashes. Repeat the dash with `'-' * 20`.", starter: null,
        tests: [['First line still says “Welcome, {name}!”', `__lines__[:1] == [${nameStr}]`], ['Second line is 20 dashes', "len(__lines__) > 1 and __lines__[1] == '-' * 20"], ['Uses * to repeat the dash', "'*' in __code__"]],
        hints: ['Add a new `print()` on line 2.', "Multiplying text repeats it: `'ab' * 3` gives `ababab`.", "Try `print('-' * 20)`."],
        howto: ['Press Enter at the end of your first line.', "Type `print('-' * 20)`.", 'Check that the second output line is a row of dashes.'],
        solution: `print(${nameStr})\nprint('-' * 20)` }
    ] },
    i2: { title: 'Build a tip calculator', skills: ['Variables', 'Math operators', 'f-strings'], tasks: [
      { type: 'code', title: 'Work out the tip', brief: 'The bill is `40` and the tip is `15` percent. Create a variable `tip` that holds the tip amount: bill × percent ÷ 100.', starter: 'bill = 40\ntip_percent = 15\n\n# Create tip here\n',
        tests: [['A variable called tip exists', "'tip' in globals()"], ['tip is 6.0', 'abs(tip - 6) < 1e-9']],
        hints: ['Multiply with `*` and divide with `/`.', 'Use the variable names, not the numbers: `bill * tip_percent`.', 'Then divide by 100: `tip = bill * tip_percent / 100`.'],
        howto: ['Go to the empty line under the comment.', 'Type `tip = ` to create the variable.', 'Write the formula with `bill`, `tip_percent`, `*` and `/ 100`.', 'Add `print(tip)` to see the result.'],
        solution: 'bill = 40\ntip_percent = 15\n\ntip = bill * tip_percent / 100\nprint(tip)' },
      { type: 'code', title: 'Print the total', brief: 'Add the tip to the bill and print it with an f-string and two decimals, like `Total: 46.00`.', starter: null,
        tests: [['Prints “Total: 46.00”', "'Total: 46.00' in __lines__"], ['Uses an f-string', "\"f'\" in __code__ or 'f\"' in __code__"]],
        hints: ['Create `total = bill + tip` first.', "An f-string starts with f before the quote: `f'Total: {total}'`.", 'Add `:.2f` inside the braces for two decimals: `{total:.2f}`.'],
        howto: ['Create a variable `total`.', 'Write `print(f\'Total: {total:.2f}\')`.', 'Check the output says Total: 46.00.'],
        solution: "bill = 40\ntip_percent = 15\n\ntip = bill * tip_percent / 100\ntotal = bill + tip\nprint(f'Total: {total:.2f}')" }
    ] },
    i3: { title: 'FizzBuzz', skills: ['for loops and range()', 'The % operator', 'if, elif, else'], tasks: [
      { type: 'code', title: 'Count to 15', brief: 'Use a `for` loop with `range()` to print the numbers 1 to 15, one per line.', starter: 'for n in range(1, 4):\n    print(n)\n',
        tests: [['Prints 15 lines', 'len(__lines__) == 15'], ['Counts from 1 to 15', '__lines__ == [str(i) for i in range(1, 16)]']],
        hints: ['`range(1, 4)` stops just before 4.', 'To stop after 15, the second number must be one more than 15.', 'Use `range(1, 16)`.'],
        howto: ['Look at the numbers in `range(1, 4)`.', 'Change the 4 so the loop reaches 15.', 'Run it and count the lines.'],
        solution: 'for n in range(1, 16):\n    print(n)' },
      { type: 'code', title: 'Play FizzBuzz', brief: 'Print `Fizz` for multiples of 3, `Buzz` for multiples of 5, `FizzBuzz` for multiples of both, and the number otherwise.', starter: null,
        tests: [['3 becomes Fizz', "__lines__[2] == 'Fizz'"], ['5 becomes Buzz', "__lines__[4] == 'Buzz'"], ['15 becomes FizzBuzz', "__lines__[14] == 'FizzBuzz'"], ['Other numbers stay numbers', "__lines__[0] == '1' and __lines__[6] == '7'"]],
        hints: ['`n % 3 == 0` is True for 3, 6, 9 and so on.', 'Check the “both” case first with `n % 15 == 0`, then 3, then 5.', 'Use `if`, `elif`, `elif`, `else` inside the loop.'],
        howto: ['Inside the loop, start with `if n % 15 == 0:` and print FizzBuzz.', 'Add `elif n % 3 == 0:` for Fizz.', 'Add `elif n % 5 == 0:` for Buzz.', 'Finish with `else:` and print n.'],
        solution: "for n in range(1, 16):\n    if n % 15 == 0:\n        print('FizzBuzz')\n    elif n % 3 == 0:\n        print('Fizz')\n    elif n % 5 == 0:\n        print('Buzz')\n    else:\n        print(n)" }
    ] },
    i4: { title: 'Write a grade function', skills: ['Defining functions', 'Return values', 'Looping over a dictionary'], tasks: [
      { type: 'code', title: 'The grade function', brief: 'Finish `grade(score)` so it returns `A` for 90 and above, `B` for 80–89, `C` for 70–79 and `F` below 70.', starter: "def grade(score):\n    # Your code here\n    return 'F'\n\nprint(grade(95))\n",
        tests: [['grade(95) is A', "grade(95) == 'A'"], ['grade(85) is B', "grade(85) == 'B'"], ['grade(72) is C', "grade(72) == 'C'"], ['grade(40) is F', "grade(40) == 'F'"], ['90 and 80 are on the right side', "grade(90) == 'A' and grade(80) == 'B'"]],
        hints: ['Use `if score >= 90:` and return A inside it.', 'Then `elif score >= 80:` for B, and so on.', 'Keep `return \'F\'` as the last line for everything below 70.'],
        howto: ['Replace the comment with `if score >= 90:`.', "Indent `return 'A'` under it.", 'Add `elif` lines for 80 and 70.', 'Leave `return \'F\'` at the end.'],
        solution: "def grade(score):\n    if score >= 90:\n        return 'A'\n    elif score >= 80:\n        return 'B'\n    elif score >= 70:\n        return 'C'\n    return 'F'\n\nprint(grade(95))" },
      { type: 'code', title: 'Grade the class', brief: "Add `scores = {'Sara': 92, 'Reza': 78, 'Mina': 85}` and print each name with its grade, like `Sara: A`.", starter: null,
        tests: [['Prints “Sara: A”', "'Sara: A' in __lines__"], ['Prints “Reza: C”', "'Reza: C' in __lines__"], ['Prints “Mina: B”', "'Mina: B' in __lines__"]],
        hints: ['Loop over a dictionary with `for name, score in scores.items():`.', 'Call your function inside the loop: `grade(score)`.', "Print with an f-string: `print(f'{name}: {grade(score)}')`."],
        howto: ['Create the `scores` dictionary below your function.', 'Write `for name, score in scores.items():`.', "Inside the loop, print `f'{name}: {grade(score)}'`."],
        solution: "def grade(score):\n    if score >= 90:\n        return 'A'\n    elif score >= 80:\n        return 'B'\n    elif score >= 70:\n        return 'C'\n    return 'F'\n\nscores = {'Sara': 92, 'Reza': 78, 'Mina': 85}\nfor name, score in scores.items():\n    print(f'{name}: {grade(score)}')" }
    ] },
    fp: { title: 'Number guessing game', project: true, skills: ['input() and int()', 'if, elif, else', 'while loops', 'Counting'], tasks: [
      { type: 'code', title: 'Ask for a guess', brief: 'Set `secret = 7`. Ask the player for a guess with `input()` and store it as a whole number in `guess` with `int()`.', starter: '# Number guessing game\n', inputs: ['5'],
        tests: [['secret is 7', 'secret == 7'], ['guess is a whole number', 'isinstance(guess, int)'], ['guess is what the player typed', 'guess == 5']],
        hints: ['Start with `secret = 7`.', "`input('Your guess: ')` gives you text.", "Wrap it in int(): `guess = int(input('Your guess: '))`."],
        howto: ['Create `secret = 7`.', "Ask with `input('Your guess: ')`.", 'Turn the answer into a number with `int()` and store it in `guess`.'],
        solution: "secret = 7\nguess = int(input('Your guess: '))" },
      { type: 'code', title: 'Give feedback', brief: 'Compare the guess with the secret and print `Too low`, `Too high` or `Correct!`.', starter: null, inputs: ['5'],
        tests: [['Says “Too low” when the player types 5', "any('Too low' in l for l in __lines__)"], ['Has a branch for “Too high”', "'Too high' in __code__"], ['Has a branch for “Correct!”', "'Correct!' in __code__"]],
        hints: ['Use `if guess < secret:`.', 'Then `elif guess > secret:`.', "Finish with `else:` and `print('Correct!')`."],
        howto: ['Below your input line, write `if guess < secret:` and print Too low.', 'Add `elif guess > secret:` and print Too high.', 'Add `else:` and print Correct!'],
        solution: "secret = 7\nguess = int(input('Your guess: '))\nif guess < secret:\n    print('Too low')\nelif guess > secret:\n    print('Too high')\nelse:\n    print('Correct!')" },
      { type: 'code', title: 'Keep playing', brief: 'Use a `while` loop so the player keeps guessing until they get it. Count the tries and finish with `You got it in 3 tries!`.', starter: null, inputs: ['5', '9', '7'],
        tests: [['Keeps asking after a wrong guess', "any('Too low' in l for l in __lines__) and any('Too high' in l for l in __lines__)"], ['Stops when the guess is right', "any('Correct!' in l or 'got it' in l for l in __lines__)"], ['Counts the tries', "any('3 tries' in l for l in __lines__)"]],
        hints: ['Start with `tries = 0` and `guess = 0` before the loop.', 'Loop with `while guess != secret:` and ask for the guess inside it.', "Add 1 to tries each time, and after the loop print `f'You got it in {tries} tries!'`."],
        howto: ['Set `tries = 0` and `guess = 0`.', 'Write `while guess != secret:`.', 'Inside the loop: ask, add 1 to tries, print the feedback.', 'After the loop, print how many tries it took.'],
        solution: "secret = 7\ntries = 0\nguess = 0\nwhile guess != secret:\n    guess = int(input('Your guess: '))\n    tries += 1\n    if guess < secret:\n        print('Too low')\n    elif guess > secret:\n        print('Too high')\nprint(f'You got it in {tries} tries!')" }
    ] }
  };

  const LEVELS = [
    { at: 0, name: 'Curious Beginner' },
    { at: 250, name: 'Hello-World Hero' },
    { at: 500, name: 'Loop Learner' },
    { at: 750, name: 'Function Builder' },
    { at: 1000, name: 'Bug Hunter' },
    { at: 1300, name: 'Pythonista' }
  ];

  const ONSITE = {
    title: 'On-site Python Bootcamp',
    place: 'Tehran campus',
    when: '3 Fridays',
    oldPrice: 14800000,
    newPrice: 8880000,
    cohorts: [
      { id: 'nov', label: 'Fridays, Nov 13 – Nov 27, 2026', left: 4 },
      { id: 'dec', label: 'Fridays, Dec 11 – Dec 25, 2026', left: 9 }
    ]
  };

  /* A course made on create.html is stored in the browser and opened with ?course=custom */
  const params = new URLSearchParams(location.search);
  const custom = params.get('course') === 'custom' ? store.get('mk.custom') : null;
  const COURSE_ID = custom ? 'custom' : 'python';
  const COURSE = custom ? custom.chapters : PYTHON;
  const EXERCISES = Object.assign({}, PY_EXERCISES, custom ? custom.exercises : {});
  Object.assign(QUIZZES, custom ? custom.quizzes : {});
  const META = custom
    ? { title: custom.title, about: custom.about, onsite: false }
    : { title: 'Python Fundamentals', about: 'Learn to write real Python programs from scratch: variables, decisions, loops, lists and functions, finishing with a game you build yourself. Every chapter ends with a chat quiz or a hands-on coding exercise with live results.', onsite: true };
  const QS = custom ? '&course=custom' : '';
  const lessonURL = (id) => `index.html?lesson=${id}${QS}`;
  const exerciseURL = (ref) => `exercise.html?ex=${ref}${QS}`;

  const ALL = [];
  COURSE.forEach((ch, ci) => ch.items.forEach((it, ii) => {
    it.chapter = ci; it.index = ii;
    if (it.type === 'video') {
      const extra = LESSON_EXTRA[it.id] || {};
      const lower = it.title.charAt(0).toLowerCase() + it.title.slice(1);
      it.about = extra.about || `In this session you learn ${lower}${it.source ? `. It comes from the course “${it.source}”` : ''}, with a live demo and small examples you can type along with.`;
      it.points = extra.points || [
        `The idea behind “${it.title}” and when to use it`,
        'A live demo you can type along with',
        'Common mistakes and how to avoid them'
      ];
      it.captions = extra.captions || [
        `Welcome to “${it.title}”.`,
        'We start with the idea, then I’ll show you a live demo.',
        'Type along with me. Small experiments are the fastest way to learn.',
        'Pause any time, and ask your assistant if something isn’t clear.'
      ];
      it.simple = extra.simple;
      it.oneLine = extra.oneLine;
      it.howto = extra.howto;
      it.quiz = extra.quiz;
    }
    ALL.push(it);
  }));
  const byId = (id) => ALL.find((i) => i.id === id);
  const byRef = (ref) => ALL.find((i) => i.ref === ref);
  const itemMinutes = (it) => (it.type === 'video' ? Math.round(it.dur / 60) : it.mins);
  const nextItem = (it) => ALL[ALL.indexOf(it) + 1];
  const prevItem = (it) => ALL[ALL.indexOf(it) - 1];
  const finalProject = () => ALL.find((i) => i.type === 'exercise' && EXERCISES[i.ref] && EXERCISES[i.ref].project);

  /* ---------------------------------------------------------- State + save */
  const todayKey = new Date().toDateString();
  const state = {
    activeId: null,
    xp: 640,
    streak: { count: 6, best: 14, today: false, watched: 0, source: null },
    notes: [],
    scores: custom ? {} : { q1: 100, i1: 100, i2: 100 },
    attempts: {},
    projectSteps: {},
    filter: 'all',
    open: new Set()
  };
  const progressKey = `mk.progress.${COURSE_ID}`;
  const savedProgress = store.get(progressKey);
  if (savedProgress) {
    const done = new Set(savedProgress.done || []);
    ALL.forEach((i) => { i.done = done.has(i.id); });
    state.scores = savedProgress.scores || {};
    state.notes = savedProgress.notes || [];
    state.attempts = savedProgress.attempts || {};
    state.projectSteps = savedProgress.projectSteps || {};
  }
  const savedUser = store.get('mk.user');
  if (savedUser) {
    state.xp = savedUser.xp;
    Object.assign(state.streak, savedUser.streak);
    const gap = Math.round((new Date(todayKey) - new Date(savedUser.day)) / 864e5);
    if (gap >= 1) {
      if (gap > 1 || !state.streak.today) state.streak.count = 0;
      Object.assign(state.streak, { today: false, watched: 0, source: null });
    }
  }
  function save() {
    store.set(progressKey, { done: ALL.filter((i) => i.done).map((i) => i.id), scores: state.scores, notes: state.notes, attempts: state.attempts, projectSteps: state.projectSteps });
    store.set('mk.user', { xp: state.xp, streak: state.streak, day: todayKey });
  }

  function stats() {
    const videos = ALL.filter((i) => i.type === 'video');
    const quizzes = ALL.filter((i) => i.type === 'quiz');
    const exs = ALL.filter((i) => i.type === 'exercise');
    const fp = finalProject();
    const done = ALL.filter((i) => i.done).length;
    let projectPct = 0;
    if (fp) projectPct = fp.done ? 100 : Math.round(((state.projectSteps[fp.ref] || 0) / EXERCISES[fp.ref].tasks.length) * 100);
    return {
      done, total: ALL.length, pct: Math.round((done / ALL.length) * 100),
      vDone: videos.filter((i) => i.done).length, vTotal: videos.length,
      qDone: quizzes.filter((i) => i.done).length, qTotal: quizzes.length,
      eDone: exs.filter((i) => i.done).length, eTotal: exs.length,
      projectPct, projectDone: fp ? fp.done : true
    };
  }
  function levelOf(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i++;
    return { n: i + 1, name: LEVELS[i].name, at: LEVELS[i].at, next: LEVELS[i + 1] };
  }

  /* Page hooks, set by MK.init */
  let page = {};
  const current = () => (page.current ? page.current() : byId(state.activeId));

  /* --------------------------------------------------------------- Toasts */
  function toast(text, kind, ic) {
    const el = document.createElement('div');
    el.className = `toast toast--${kind || 'brand'}`;
    el.innerHTML = `${icon(ic || 'check')}<span>${text}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ------------------------------------------------------------------ XP */
  function addXP(n) {
    const before = levelOf(state.xp).n;
    state.xp += n;
    renderXP();
    const chip = $('#xpChip');
    if (chip) { chip.classList.remove('is-pop'); void chip.offsetWidth; chip.classList.add('is-pop'); }
    const lv = levelOf(state.xp);
    if (lv.n > before) nudge({ mood: 'cheer', text: `<b>Level ${lv.n}: ${lv.name}!</b> Everything you finish adds up. Look how far you’ve come.` });
  }
  function renderXP() {
    if (!$('#xpValue')) return;
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
    save();
  }

  /* -------------------------------------------------------------- Streak */
  function renderStreak() {
    const s = state.streak;
    const badge = $('#streakBadge');
    if (badge) {
      badge.classList.toggle('is-lit', s.today);
      $('#streakCount').textContent = s.count;
      badge.setAttribute('aria-label', `${s.count}-day streak${s.today ? ', secured today' : ', not yet secured today'}`);
    }
    const goal = $('#streakGoal');
    if (goal) {
      goal.classList.toggle('is-done', s.today);
      if (s.today) goal.innerHTML = `${icon('flame')}<span><b>${s.count}-day streak</b> secured for today</span>`;
      else if (page.name === 'exercise') goal.innerHTML = `${icon('flame')}<span>Finish this to keep your <b>${s.count}-day streak</b></span>`;
      else {
        const pct = Math.min(100, (s.watched / 60) * 100);
        goal.innerHTML = `${icon('flame')}<span class="hide-xs">Streak goal:</span><b>${fmt(s.watched)} / 1:00</b><span class="mini-bar"><i style="width:${pct}%"></i></span><span class="hide-xs">or 1 exercise</span>`;
      }
    }
    const pop = $('#streakPop');
    if (pop && !pop.hidden) renderStreakPop();
    save();
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
    const vDone = (s.today && s.source === 'video') || s.watched >= 60;
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
        <div class="sp-task ${eDone ? 'is-done' : ''}"><span class="tick">${eDone ? icon('check') : ''}</span><span>Finish 1 quiz or exercise</span><span class="muted">${eDone ? '1' : '0'} / 1</span></div>
      </div>
      <p class="sp-foot">A day counts as soon as you do either one. Miss a day and the streak starts again from zero.</p>`;
  }
  function addWatchTime(sec) {
    const s = state.streak;
    if (s.today) return;
    s.watched += sec;
    if (s.watched >= 60) { s.watched = 60; securedToday('video'); } else renderStreak();
  }
  function securedToday(source) {
    const s = state.streak;
    if (s.today) return false;
    s.today = true; s.source = source; s.count += 1; s.best = Math.max(s.best, s.count);
    renderStreak();
    const badge = $('#streakBadge');
    if (badge) { badge.classList.remove('is-pop'); void badge.offsetWidth; badge.classList.add('is-pop'); }
    nudge({ mood: 'cheer', text: `<b>${s.count}-day streak, ${esc(profile.name)}!</b> ${source === 'video' ? 'One minute watched, so today counts.' : 'That practice counted for today.'} You’ve shown up ${s.count} days in a row.` });
    addXP(15);
    return true;
  }

  /* ----------------------------------------------------- Assistant identity */
  let moodTimer = null;
  function setMood(mood, ms) {
    const el = $('#assistantFace');
    if (!el) return;
    el.dataset.mood = mood;
    clearTimeout(moodTimer);
    if (ms) moodTimer = setTimeout(() => { el.dataset.mood = 'happy'; }, ms);
  }
  function renderIdentity() {
    $$('[data-avatar]').forEach((el) => { el.innerHTML = avatarSVG(); });
    $$('.msg-row .avatar--sm').forEach((el) => { el.innerHTML = avatarSVG(); });
    $$('[data-assistant-name]').forEach((el) => { el.textContent = assistantName(); });
    const input = $('#aiText');
    if (input && !quizRun) input.placeholder = `Ask ${assistantName()}…`;
  }

  const SWATCHES = {
    skin: ['#f6d7bf', '#f1c7a5', '#d9a27a', '#a86b45', '#6e4429'],
    hair: ['#2b211c', '#5a3a22', '#b0683a', '#d9b26a', '#8a8f98'],
    style: ['short', 'long', 'curly', 'bun'],
    shirt: ['#10a39a', '#6a5ae0', '#f0a20f', '#e5484d', '#1d1d1f']
  };
  function openProfile() {
    const draft = Object.assign({}, profile);
    const swatchRow = (key, label) => `<div class="pf-row"><span class="pf-label">${label}</span><div class="pf-swatches" role="radiogroup" aria-label="${label}">${SWATCHES[key].map((v) => key === 'style'
      ? `<button type="button" role="radio" class="pf-style${draft[key] === v ? ' is-on' : ''}" data-pf="${key}" data-v="${v}" aria-checked="${draft[key] === v}" aria-label="${v} hair"><span class="avatar">${avatarSVG(Object.assign({}, draft, { style: v }))}</span></button>`
      : `<button type="button" role="radio" class="pf-swatch${draft[key] === v ? ' is-on' : ''}" data-pf="${key}" data-v="${v}" aria-checked="${draft[key] === v}" aria-label="${label} ${v}" style="--c:${v}"></button>`).join('')}</div></div>`;
    const render = () => {
      $('#modalBody').innerHTML = `<span class="m-eyebrow muted">${icon('user')}Your profile</span>
        <h2 class="m-title" id="modalTitle">Your assistant looks like you</h2>
        <p class="m-sub">Your assistant is a 2D character of you. Change your name and look, and it updates everywhere.</p>
        <div class="pf">
          <div class="pf-preview"><span class="avatar avatar--xl" data-mood="cheer">${avatarSVG(draft)}</span><b>${esc(cleanName(draft.name))}’s Assistant</b></div>
          <div class="pf-fields">
            <label class="pf-label" for="pfName">Your name</label>
            <input id="pfName" class="pf-input" type="text" maxlength="20" value="${esc(draft.name)}" autocomplete="given-name">
            ${swatchRow('skin', 'Skin')}${swatchRow('hair', 'Hair color')}${swatchRow('style', 'Hair style')}${swatchRow('shirt', 'Shirt')}
          </div>
        </div>
        <div class="m-foot"><button class="pill pill--soft" type="button" data-close>Cancel</button><button class="pill pill--primary" type="button" id="pfSave">Save</button></div>`;
      $('#pfName').addEventListener('input', (e) => { draft.name = e.target.value; $('.pf-preview b').textContent = `${cleanName(draft.name)}’s Assistant`; });
    };
    const onClick = (e) => {
      const b = e.target.closest('[data-pf]');
      if (b) { draft[b.dataset.pf] = b.dataset.v; render(); return; }
      if (e.target.closest('#pfSave')) {
        Object.assign(profile, draft, { name: cleanName(draft.name) });
        store.set('mk.profile', profile);
        renderIdentity();
        if (page.onProfile) page.onProfile();
        closeModal();
        toast(`Saved. Say hi to ${esc(assistantName())}!`, 'brand', 'user');
      }
    };
    openModal('');
    render();
    modalCleanup = () => $('#modalBody').removeEventListener('click', onClick);
    $('#modalBody').addEventListener('click', onClick);
  }

  /* ------------------------------------------------------------ Chat */
  const feed = () => $('#aiFeed');
  function scrollFeed() { const f = feed(); if (f) f.scrollTop = f.scrollHeight; }
  function actionsHTML(actions, rec) {
    if (!actions || !actions.length) return '';
    return `<div class="msg__actions${rec ? ' msg__actions--rec' : ''}">${actions.map(([label, act, arg]) => `<button type="button" data-act="${act}"${arg != null ? ` data-arg="${arg}"` : ''}>${label}</button>`).join('')}</div>`;
  }
  function chatRow(html, cls) {
    const el = document.createElement('div');
    el.className = `msg-row${cls ? ` ${cls}` : ''}`;
    el.innerHTML = `<span class="avatar avatar--sm">${avatarSVG()}</span>${html}`;
    feed().appendChild(el); scrollFeed();
    return el;
  }
  function aiSay(html, actions) {
    return chatRow(`<div class="msg msg--ai">${html}${actionsHTML(actions)}</div>`).querySelector('.msg');
  }
  function userSay(text) {
    const el = document.createElement('div');
    el.className = 'msg msg--user';
    el.textContent = text;
    feed().appendChild(el); scrollFeed();
  }
  function typing(then) {
    const el = chatRow('<div class="msg msg--ai typing"><i></i><i></i><i></i></div>');
    setMood('think');
    setTimeout(() => { el.remove(); setMood('happy'); then(); }, 600 + Math.random() * 450);
  }
  function ask(text) {
    userSay(text);
    typing(() => respond(text));
  }

  /* Behaviour-based motivation: a coach message in the chat with its own colour and
     recommended next steps. Only the newest coach message keeps its suggestions. */
  const REC = {
    simplify: ['Simplify this', 'simple'],
    howto: ['How do I do that?', 'howto'],
    example: ['Show an example', 'example'],
    recap: ['Recap so far', 'recap'],
    quiz: ['Quiz me', 'quiz'],
    hint: ['Give me a hint', 'hint'],
    fix: ['How do I fix it?', 'fix'],
    play: ['Keep watching', 'play']
  };
  let lastNudge = '';
  function nudge({ text, options = [], mood = 'happy', moodMs = 3500, orb }) {
    if (!feed() || text === lastNudge) return;
    lastNudge = text;
    $$('.msg--coach .msg__actions').forEach((a) => a.remove());
    chatRow(`<div class="msg msg--coach"><span class="msg__label">${icon('sparkles')}Just for you</span><div>${text}</div>${actionsHTML(options.map((o) => (typeof o === 'string' ? REC[o] : o)), true)}</div>`, 'msg-row--coach');
    setMood(mood, mood === 'sleepy' ? 0 : moodMs);
    if (orb) markOrb(orb, true);
  }
  function markOrb(name, on) { const o = $(`[data-orb="${name}"]`); if (o) o.classList.toggle('has-dot', on); }

  const ORB_PROMPTS = { simplify: 'Make this simpler', recap: 'Recap this lesson', quiz: 'Quiz me', hint: 'Give me a hint', example: 'Show me an example', howto: 'How do I do that?' };

  function motivate() {
    const st = stats();
    const k = state.streak;
    const leftMin = ALL.filter((i) => !i.done).reduce((m, i) => m + itemMinutes(i), 0);
    const lines = [
      st.pct >= 50 ? `You’re <b>${st.pct}%</b> through the course. The hardest part, starting, is behind you.` : `You’re <b>${st.pct}%</b> through. The first weeks are where the habit forms, and you’re building it.`,
      k.today ? `<b>${k.count} days in a row.</b> Showing up is what turns practice into skill.` : `You’re on a <b>${k.count}-day streak</b>. One minute of video or one exercise keeps it going today.`,
      leftMin ? `About <b>${Math.max(1, Math.round(leftMin / 60))} hours</b> left. That’s ${Math.ceil(leftMin / 20)} short sessions of 20 minutes.` : 'Everything is done. Try changing your final project to make it your own.'
    ];
    return aiSay(`<div class="msg__title msg__title--flame">${icon('flame')}You’ve got this, ${esc(profile.name)}</div>${lines.join('<br>')}`);
  }

  function respond(q) {
    const s = q.toLowerCase();
    const c = page.ctx ? page.ctx() : {};
    const title = c.title || current().title;
    const st = stats();
    if (/motivat|encourag|tired|bored|give up|lazy/.test(s)) return motivate();
    if (/fix|error|bug|wrong with my code/.test(s) && c.fix) return aiSay(c.fix(), [REC.example, REC.simplify]);
    if (/hint|stuck|help me/.test(s) && c.hint) {
      return aiSay(`<div class="msg__title msg__title--brand">${icon('bulb')}Hint</div>${c.hint()}`, [['Another hint', 'hint'], REC.howto, REC.example]);
    }
    if (/how (do|can|to)|steps?\b|what do i do/.test(s)) {
      const steps = c.howto || ['Watch the demo once without typing.', 'Pause and type the code yourself in VS Code.', 'Change one thing and run it again to see what happens.', 'If an error appears, ask me. I’ll explain it in plain words.'];
      return aiSay(`<div class="msg__title msg__title--brand">${icon('list')}Step by step</div><ol>${steps.map((x) => `<li>${fmtCode(withName(x))}</li>`).join('')}</ol>`, [REC.example, REC.simplify]);
    }
    if (/even simpler|one line|simplest/.test(s)) {
      return aiSay(`<b>In one line:</b> ${fmtCode(c.oneLine || 'Try one small thing, run it, look at the result, then change one more thing.')}`, [REC.example]);
    }
    if (/summar|recap|tl;?dr|so far/.test(s) && c.points) {
      return aiSay(`Here is the short version of <b>${esc(title)}</b>:<ul>${c.points.map((p) => `<li>${fmtCode(p)}</li>`).join('')}</ul>`, [REC.quiz, REC.howto]);
    }
    if (/quiz|test me|check me/.test(s)) return quickQuiz(c);
    if (/simpl|explain|don.?t (get|understand)|confus|eli5/.test(s)) {
      return aiSay(`<div class="msg__title msg__title--brand">${icon('bulb')}In simple words</div>${fmtCode(c.simple || `“${title}” is one small building block. Watch how it’s used, type it yourself, then change one thing at a time and see what happens.`)}`, [['Even simpler', 'simpler'], REC.example, REC.howto]);
    }
    if (/example/.test(s)) return aiSay(c.example || 'Here’s a tiny example you can try:<pre><code>name = input(\'Your name: \')\nprint(f\'Hello, {name}!\')</code></pre>', [REC.howto]);
    if (/streak/.test(s)) {
      const k = state.streak;
      return aiSay(k.today
        ? `You are on a <b>${k.count}-day streak</b> and today is already counted. Your best is ${k.best} days.`
        : `You are on a <b>${k.count}-day streak</b>. To keep it today, watch at least <b>1 minute</b> of video (you have ${fmt(k.watched)} so far) or finish <b>1 quiz or exercise</b>.`);
    }
    if (META.onsite && /on.?site|bootcamp|workshop|unlock|discount|offer|in.?person|campus/.test(s)) {
      return aiSay(`The <b>on-site bootcamp</b> unlocks when you pass all quizzes (${st.qDone}/${st.qTotal}), watch every video (${st.vDone}/${st.vTotal}) and finish the final project (${st.projectPct}%). Graduates pay <b>${toman(ONSITE.newPrice)} Toman</b> instead of ${toman(ONSITE.oldPrice)}.`, [['Show me the offer', 'onsite']]);
    }
    if (/xp|score|level|point/.test(s)) {
      const lv = levelOf(state.xp);
      return aiSay(`You have <b>${state.xp} XP</b> (Level ${lv.n}, ${lv.name}). You earn XP for watching (+5 every 30 s), finishing lessons (+20), quizzes (+40) and coding exercises (+50).`);
    }
    if (/print/.test(s)) return aiSay('<code>print()</code> shows something on the screen. Put text in quotes, or a number or variable without quotes:<pre><code>print(\'Hello\')\nprint(2 + 3)</code></pre>', [REC.example]);
    if (/variable/.test(s)) return aiSay('A variable is a name for a value, like a labelled box:<pre><code>age = 30\nprint(age)</code></pre>The name goes on the left, the value on the right.', [REC.example]);
    if (/loop|for |while/.test(s)) return aiSay('A loop repeats code. <code>for</code> repeats a set number of times, <code>while</code> repeats until something changes:<pre><code>for n in range(3):\n    print(n)</code></pre>', [REC.example]);
    if (/function|def /.test(s)) return aiSay('A function is a reusable recipe. You define it once with <code>def</code> and call it as often as you like:<pre><code>def greet(name):\n    return f\'Hi, {name}!\'\n\nprint(greet(\'Sara\'))</code></pre>', [REC.example]);
    if (/install|vs ?code|setup|set up/.test(s)) return aiSay('Install Python from python.org, then install VS Code and its Python extension. Chapter 1, “Installing Python and VS Code”, walks you through it.', [['Open that lesson', 'lesson', 'u3']]);
    if (/^(hi|hello|hey|salam)\b/.test(s)) return aiSay(`Hi ${esc(profile.name)}! Ask me anything, or tap a circle on the left.`);
    return aiSay(`Good question. For “${esc(title)}”: try one small piece, run it, look at the result, then change one thing at a time.`, c.hint ? [REC.hint, REC.howto, REC.example] : [REC.simplify, REC.howto, REC.example]);
  }

  function quickQuiz(c) {
    const qz = (c && c.quiz) || { q: 'What does `print(3 * 2)` show?', options: ['6', '32', '3 * 2'], answer: 0 };
    const el = aiSay(`<b>Quick check:</b> ${fmtCode(qz.q)}`, qz.options.map((o, i) => [esc(o), 'answer', i]));
    el.dataset.answer = qz.answer;
  }

  /* ----------------------------------------------- Chat quizzes (conversation) */
  let quizRun = null;
  const norm = (s) => String(s).toLowerCase().replace(/[`'".!]/g, '').trim();
  function startQuiz(ref) {
    const qz = QUIZZES[ref];
    if (!qz || !feed()) return;
    quizRun = { ref, i: 0, correct: 0, asked: null };
    $('#quizBar').hidden = false;
    renderQuizBar();
    $('#aiText').placeholder = 'Type your answer, or ask “why?”';
    aiSay(`<div class="msg__title msg__title--quiz">${icon('chat')}${esc(qz.title)}</div>Let’s chat through ${qz.questions.length} quick questions about ${esc(qz.topic)}. Tap an answer or type it. You can ask me “why?” or “give me a hint” at any time.`);
    if (window.matchMedia('(max-width: 899px)').matches) $('.ai-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(askQuestion, 500);
  }
  function renderQuizBar() {
    const qz = QUIZZES[quizRun.ref];
    $('#quizBar').innerHTML = `<span class="quiz-bar__ic">${icon('chat')}</span><span class="quiz-bar__t"><b>${esc(qz.title)}</b><span>Question ${Math.min(quizRun.i + 1, qz.questions.length)} of ${qz.questions.length}</span></span>
      <span class="quiz-bar__dots">${qz.questions.map((_, k) => `<i class="${k < quizRun.i ? 'is-done' : k === quizRun.i ? 'is-now' : ''}"></i>`).join('')}</span>
      <button class="quiz-bar__x" type="button" data-act="quiz-exit" aria-label="Leave quiz">${icon('close')}</button>`;
  }
  function askQuestion() {
    if (!quizRun) return;
    const q = QUIZZES[quizRun.ref].questions[quizRun.i];
    renderQuizBar();
    const el = aiSay(`<span class="q-num">Question ${quizRun.i + 1}</span>${fmtCode(q.q)}`, q.type === 'mcq' ? q.options.map((o, k) => [esc(o), 'qanswer', k]) : null);
    el.classList.add('msg--question');
    quizRun.asked = el;
    if (q.type === 'text') $('#aiText').focus();
  }
  function answerQuiz(value, label) {
    const qz = QUIZZES[quizRun.ref];
    const q = qz.questions[quizRun.i];
    const ok = q.type === 'mcq' ? value === q.answer : q.accept.some((a) => norm(value) === norm(a));
    if (quizRun.asked) {
      $$('button', quizRun.asked).forEach((b, k) => {
        b.disabled = true;
        if (k === q.answer) b.classList.add('is-right');
        if (k === value && !ok) b.classList.add('is-wrong');
      });
    }
    userSay(label);
    const run = quizRun;
    typing(() => {
      if (quizRun !== run) return;
      if (ok) { run.correct++; aiSay(`${['Exactly!', 'Yes, that’s right!', 'Correct!', 'Nailed it!'][run.i % 4]} ${fmtCode(q.why)}`); setMood('cheer', 1500); }
      else aiSay(`Not quite. The answer is <b>${fmtCode(q.type === 'mcq' ? q.options[q.answer] : q.accept[0])}</b>. ${fmtCode(q.why)}`);
      run.i++;
      if (run.i < qz.questions.length) setTimeout(askQuestion, 700);
      else setTimeout(finishQuiz, 600);
    });
  }
  function quizConversation(text) {
    const q = QUIZZES[quizRun.ref].questions[quizRun.i];
    const t = text.trim();
    if (/^(why|how|what|explain|hint|help|i don.?t|idk)/i.test(t) || t.endsWith('?')) {
      userSay(t);
      typing(() => aiSay(`<div class="msg__title msg__title--brand">${icon('bulb')}Think about it this way</div>${fmtCode(q.hint)}<br>Now give it a try.`));
      return;
    }
    if (q.type === 'text') { answerQuiz(t, t); return; }
    const n = norm(t);
    let k = q.options.findIndex((o) => norm(o) === n);
    if (k < 0 && /^[a-d]$/.test(n)) k = n.charCodeAt(0) - 97;
    if (k < 0 && /^[1-4]$/.test(n)) k = Number(n) - 1;
    if (k >= 0 && k < q.options.length) { answerQuiz(k, t); return; }
    userSay(t);
    typing(() => aiSay('Tap one of the answers above, or ask me “why?” if you’re unsure.'));
  }
  function finishQuiz() {
    if (!quizRun) return;
    const { ref, correct } = quizRun;
    const qz = QUIZZES[ref];
    const item = byRef(ref);
    const total = qz.questions.length;
    const score = Math.round((correct / total) * 100);
    const pass = score >= 60;
    const first = pass && item && !item.done;
    state.scores[ref] = Math.max(state.scores[ref] || 0, score);
    if (pass && item) item.done = true;
    quizRun = null;
    $('#quizBar').hidden = true;
    renderIdentity();
    const xp = first ? 40 : pass ? 10 : 5;
    addXP(xp);
    renderProgress();
    const nx = item && nextItem(item);
    const el = aiSay(`<div class="quiz-result ${pass ? 'is-pass' : 'is-fail'}"><b>${correct}/${total}</b><span>${pass ? 'Quiz passed' : 'Not passed yet'} · +${xp} XP</span></div>
      ${pass ? 'Great work. That’s saved to your progress.' : 'You need 60% to pass. Let’s go over it once more, then try again.'}`,
    pass ? [nx ? [`Next: ${esc(nx.title)}`, 'goto', nx.id] : null, ['Retake quiz', 'quiz-start', ref]].filter(Boolean) : [['Try again', 'quiz-start', ref], REC.simplify]);
    el.classList.add('msg--result');
    if (pass && !securedToday('exercise')) setMood('cheer', 3000);
    if (META.onsite && pass) {
      const st = stats();
      if (st.qDone === st.qTotal && st.vDone === st.vTotal && st.projectDone) celebrateUnlock();
    }
  }

  /* ------------------------------------------------------------ Actions */
  function goTo(it) {
    if (!it) return;
    if (page.goTo && page.goTo(it)) return;
    if (it.type === 'video') location.href = lessonURL(it.id);
    else if (it.type === 'exercise') location.href = exerciseURL(it.ref);
    else if (it.type === 'quiz') startQuiz(it.ref);
  }
  function flashOnsite() {
    const el = $('#onsite');
    if (!el || el.hidden) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el.animate?.([{ boxShadow: '0 0 0 0 rgba(16,163,154,.6)' }, { boxShadow: '0 0 0 10px rgba(16,163,154,0)' }], { duration: 900, iterations: 2 });
  }
  function runAction(btn) {
    const act = btn.dataset.act;
    const arg = btn.dataset.arg;
    if (btn.closest('.msg--coach')) btn.closest('.msg__actions')?.remove();
    if (page.onAction && page.onAction(act, arg, btn)) return;
    switch (act) {
      case 'recap': ask('Recap what we covered so far'); break;
      case 'quiz': ask('Quiz me'); break;
      case 'simple': ask('Make this simpler'); break;
      case 'simpler': ask('Even simpler, in one line'); break;
      case 'howto': ask('How do I do that?'); break;
      case 'hint': ask('Give me another hint'); break;
      case 'example': ask('Show me an example'); break;
      case 'fix': ask('How do I fix this error?'); break;
      case 'quiz-start': startQuiz(arg); break;
      case 'quiz-exit': quizRun = null; $('#quizBar').hidden = true; renderIdentity(); aiSay('No problem. You can restart the quiz from the course content whenever you like.'); break;
      case 'qanswer': if (quizRun) answerQuiz(Number(arg), btn.textContent); break;
      case 'exercise': goTo(byRef(arg)); break;
      case 'lesson': goTo(byId(arg)); break;
      case 'goto': goTo(byId(arg)); break;
      case 'next': goTo(nextItem(current())); break;
      case 'onsite': flashOnsite(); break;
      case 'answer': {
        const msg = btn.closest('.msg');
        const right = Number(msg.dataset.answer);
        const picked = Number(arg);
        $$('button', msg).forEach((b, i) => { b.disabled = true; if (i === right) b.classList.add('is-right'); });
        if (picked !== right) btn.classList.add('is-wrong');
        typing(() => {
          if (picked === right) { aiSay('Correct! Nice work. +10 XP'); addXP(10); }
          else aiSay(`Not quite. The answer is “${esc(msg.querySelectorAll('button')[right].textContent)}”.`, [REC.simplify, REC.howto]);
        });
        break;
      }
    }
  }

  /* ---------------------------------------------------------- Sidebar */
  function itemHTML(it) {
    let meta;
    const sc = state.scores[it.ref];
    if (it.type === 'video') {
      meta = `<span>Video</span><span class="dot"></span><span>${itemMinutes(it)} min</span>`;
    } else if (it.type === 'quiz') {
      meta = `<span class="tag tag--quiz">${icon('chat')}Chat quiz</span><span>${QUIZZES[it.ref].questions.length} questions</span>`;
    } else {
      const ex = EXERCISES[it.ref];
      const isCode = ex.tasks.some((t) => t.type === 'code');
      meta = ex.project
        ? `<span class="tag tag--project">${icon('folder')}Project</span><span>${ex.tasks.length} steps</span>`
        : `<span class="tag tag--code">${icon(isCode ? 'code' : 'sparkles')}Interactive</span><span>${ex.tasks.length} task${ex.tasks.length > 1 ? 's' : ''} · ${it.mins} min</span>`;
    }
    if (it.type !== 'video' && sc != null) meta += `<span class="tag tag--score">Best ${sc}%</span>`;
    const isActive = it.id === state.activeId;
    const cls = ['item', `item--${it.type}`, it.done && 'is-done', isActive && 'is-active'].filter(Boolean).join(' ');
    const status = it.done ? icon('check') : it.type === 'quiz' ? icon('chat') : it.type === 'exercise' ? icon(EXERCISES[it.ref].project ? 'folder' : 'code') : '';
    return `<button class="${cls}" type="button" data-item="${it.id}"${isActive ? ' aria-current="true"' : ''}>
      <span class="item__status">${status}</span>
      <span><span class="item__title">${esc(it.title)}</span><span class="item__meta">${meta}</span>${it.source ? `<span class="item__src">${icon('book')}${esc(it.source)}</span>` : ''}</span>
    </button>`;
  }
  function renderChapters() {
    const box = $('#chapters');
    if (!box) return;
    box.innerHTML = COURSE.map((ch, ci) => {
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
          <span><span class="chapter__title">${custom ? 'Module' : 'Chapter'} ${custom ? ci + 1 : ci} | ${esc(ch.title)}</span>
          <span class="chapter__meta"><span>${ch.items.length} session${ch.items.length > 1 ? 's' : ''}</span><span class="dot"></span><span>${mins} min</span>${status}</span></span>
          <span class="chapter__chev">${icon('chevronDown')}</span>
        </button>
        <div class="chapter__items">${items.map(itemHTML).join('')}</div>
      </div>`;
    }).join('');
  }

  /* Compact on-site card: three numbers and one button */
  function renderOnsite() {
    const el = $('#onsite');
    if (!el) return;
    if (!META.onsite) { el.hidden = true; return; }
    const st = stats();
    const reqs = [
      { ic: 'chat', label: 'Quizzes passed', value: `${st.qDone}/${st.qTotal}`, done: st.qDone === st.qTotal },
      { ic: 'play', label: 'Videos watched', value: `${st.vDone}/${st.vTotal}`, done: st.vDone === st.vTotal },
      { ic: 'folder', label: 'Final project', value: `${st.projectPct}%`, done: st.projectDone }
    ];
    const unlocked = reqs.every((r) => r.done);
    const off = Math.round((1 - ONSITE.newPrice / ONSITE.oldPrice) * 100);
    el.classList.toggle('is-unlocked', unlocked);
    el.innerHTML = `
      <div class="onsite__top">
        <span class="onsite__lock">${icon(unlocked ? 'unlock' : 'lock')}</span>
        <span class="onsite__name"><b>${ONSITE.title}</b><span>${ONSITE.place} · ${ONSITE.when}</span></span>
        <span class="onsite__cost"><b>${toman(ONSITE.newPrice)} T</b><span><s>${toman(ONSITE.oldPrice)}</s> <span class="onsite__off">−${off}%</span></span></span>
      </div>
      <ul class="onsite__reqs">${reqs.map((r) => `<li class="${r.done ? 'is-done' : ''}" title="${r.label}">${icon(r.done ? 'check' : r.ic)}<b>${r.value}</b><span>${r.label}</span></li>`).join('')}</ul>
      <button class="pill ${unlocked ? 'pill--primary' : 'pill--soft'}" type="button" id="onsiteBtn"${unlocked ? '' : ' disabled'}>${unlocked ? `${icon('unlock')}Reserve your seat` : `${icon('lock')}Unlocks when all three are complete`}</button>`;
  }

  function renderProgress() {
    const st = stats();
    const ring = $('#progressRingValue');
    if (ring) {
      const c = 2 * Math.PI * 18;
      ring.style.strokeDasharray = c;
      ring.style.strokeDashoffset = c * (1 - st.pct / 100);
      $('#progressRingLabel').textContent = `${st.pct}%`;
      $('#progressRing').title = `Course progress: ${st.pct}%`;
    }
    if ($('#sumText')) {
      $('#sumText').textContent = `${st.done} of ${st.total} done · ${st.pct}%`;
      const totalMin = ALL.reduce((m, i) => m + itemMinutes(i), 0);
      $('#sumTime').textContent = `${Math.floor(totalMin / 60)}h ${totalMin % 60}m total`;
      $('#sumBar').style.width = `${st.pct}%`;
    }
    renderChapters();
    renderOnsite();
    save();
  }

  /* ---------------------------------------------------------------- Modal */
  let modalCleanup = null;
  function openModal(html) {
    $('#modalBody').innerHTML = html;
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => ($('#modalBody input, #modalBody textarea, #modalBody button') || $('.modal__close')).focus(), 30);
  }
  function closeModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = '';
    if (modalCleanup) { modalCleanup(); modalCleanup = null; }
  }

  function celebrateUnlock() {
    renderProgress();
    if (META.onsite) nudge({ mood: 'cheer', moodMs: 5000, text: `<b>You unlocked the on-site bootcamp, ${esc(profile.name)}!</b> Your graduate price is ${toman(ONSITE.newPrice)} Toman.`, options: [['See the offer', 'onsite']] });
    else nudge({ mood: 'cheer', moodMs: 5000, text: '<b>You finished your course!</b> Every lesson and project is done.' });
  }

  function openOnsite() {
    const off = ONSITE.oldPrice - ONSITE.newPrice;
    openModal(`<span class="m-eyebrow" style="color:var(--brand-ink)">${icon('unlock')}Graduate offer</span>
      <h2 class="m-title" id="modalTitle">${ONSITE.title}</h2>
      <p class="m-sub">${ONSITE.place} · ${ONSITE.when} · 18 hours of hands-on coding in a group of 12</p>
      <div class="cohorts">${ONSITE.cohorts.map((c, k) => `<label class="cohort"><input type="radio" name="cohort" value="${c.id}"${k === 0 ? ' checked' : ''}><span><b>${c.label}</b><span class="muted">10:00 – 16:00 each day</span></span><span class="muted">${c.left} seats left</span></label>`).join('')}</div>
      <div class="summary">
        <div><span>Bootcamp price</span><span>${toman(ONSITE.oldPrice)} Toman</span></div>
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
    const sources = new Set(ALL.map((i) => i.source).filter(Boolean)).size;
    openModal(`<span class="m-eyebrow muted">${icon('info')}Course info</span>
      <h2 class="m-title" id="modalTitle">${esc(META.title)}</h2>
      <p class="m-sub">${esc(META.about)}</p>
      <div class="info-grid">
        <div><span>Length</span><b>${Math.floor(totalMin / 60)}h ${totalMin % 60}m · ${st.total} sessions</b></div>
        <div><span>${custom ? 'Built from' : 'Level'}</span><b>${custom ? `${sources} Maktabkhooneh courses` : 'Complete beginner'}</b></div>
        <div><span>Practice</span><b>${st.qTotal} chat quizzes · ${st.eTotal} interactive</b></div>
        <div><span>Certificate</span><b>Yes, after the final project</b></div>
        <div><span>Your progress</span><b>${st.pct}% complete</b></div>
        <div><span>${custom ? 'Made by' : 'Learners'}</span><b>${custom ? `You and ${esc(assistantName())}` : '5,214 enrolled'}</b></div>
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
      $$('[data-star]').forEach((s) => { s.classList.toggle('is-on', Number(s.dataset.star) <= val); s.setAttribute('aria-checked', Number(s.dataset.star) === val); });
      $('#rateSend').disabled = false;
    }));
    $('#rateSend').addEventListener('click', () => { closeModal(); toast(`Thanks for rating this course ${val}/5`, 'xp', 'star'); });
  }

  /* ------------------------------------------------------------- Demo */
  function demoComplete() {
    ALL.forEach((i) => { i.done = true; });
    const fp = finalProject();
    if (fp) state.projectSteps[fp.ref] = EXERCISES[fp.ref].tasks.length;
    ALL.filter((i) => i.type === 'quiz').forEach((i) => { state.scores[i.ref] = Math.max(state.scores[i.ref] || 0, 100); });
    securedToday('video');
    celebrateUnlock();
    if (page.onProgress) page.onProgress();
    flashOnsite();
  }
  function demoReset() {
    store.del(progressKey);
    store.del('mk.user');
    location.reload();
  }

  /* ------------------------------------------------------------ Popovers */
  function togglePop(btn, pop, render) {
    const open = pop.hidden;
    closePops();
    if (open) { if (render) render(); pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
  }
  function closePops() {
    [['#streakBadge', '#streakPop'], ['#menuBtn', '#menu']].forEach(([b, p]) => {
      if ($(p)) { $(p).hidden = true; $(b).setAttribute('aria-expanded', 'false'); }
    });
  }

  /* --------------------------------------------------------------- Wire */
  function wire() {
    // Chat: during a quiz, typed text is an answer or a question about it
    $('#aiForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#aiText').value.trim();
      if (!v) return;
      $('#aiText').value = '';
      if (quizRun) quizConversation(v); else ask(v);
    });
    $('#aiRail').addEventListener('click', (e) => {
      const b = e.target.closest('[data-orb]');
      if (!b) return;
      markOrb(b.dataset.orb, false);
      ask(ORB_PROMPTS[b.dataset.orb]);
    });
    $('.ai-card').addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) runAction(b); });
    $('#assistantHead').addEventListener('click', openProfile);

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

    // Header
    $('#streakBadge').addEventListener('click', (e) => { e.stopPropagation(); togglePop($('#streakBadge'), $('#streakPop'), renderStreakPop); });
    $('#menuBtn').addEventListener('click', (e) => { e.stopPropagation(); togglePop($('#menuBtn'), $('#menu')); });
    $('#menu').addEventListener('click', (e) => {
      const b = e.target.closest('[data-menu]'); if (!b) return;
      closePops();
      ({ rate: openRate, complete: demoComplete, reset: demoReset, profile: openProfile })[b.dataset.menu]();
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.popover')) closePops(); });
    $('#infoBtn').addEventListener('click', openInfo);
    $('#rateBtn').addEventListener('click', openRate);
    $('#accountBtn').addEventListener('click', openProfile);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closePops(); if (!$('#modal').hidden) closeModal(); }
    });

    // Modal
    $('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  }

  /* --------------------------------------------------------------- Init */
  function init(hooks) {
    page = hooks || {};
    hydrateIcons();
    const title = $('#courseTitle');
    if (title) title.textContent = META.title;
    document.title = `${META.title.split('|')[0].trim()} – Maktabkhooneh`;
    renderIdentity();
    wire();
    const cur = current();
    if (cur) { state.activeId = cur.id; state.open.add(COURSE[cur.chapter].id); }
    const upNext = ALL.find((i) => !i.done);
    if (upNext) state.open.add(COURSE[upNext.chapter].id);
    renderXP();
    renderStreak();
    renderProgress();
  }

  window.MK = {
    icon, hydrateIcons, $, $$, esc, fmtCode, fmt, toman, store,
    COURSE, ALL, EXERCISES, QUIZZES, META, COURSE_ID, LESSON_EXTRA,
    byId, byRef, itemMinutes, nextItem, prevItem, lessonURL, exerciseURL, finalProject,
    state, save, stats, addXP, addWatchTime, securedToday, renderStreak, renderProgress, renderChapters,
    profile, assistantName, withName, avatarSVG, renderIdentity, openProfile,
    setMood, nudge, markOrb, aiSay, userSay, ask, typing, startQuiz, REC,
    toast, openModal, closeModal, celebrateUnlock, goTo, init
  };
})();
