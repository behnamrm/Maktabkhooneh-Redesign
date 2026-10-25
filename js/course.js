/* Lesson page: video player, lesson details and notes. Shared parts live in core.js. */
(function () {
  'use strict';
  const { icon, $, $$, esc, fmt, ALL, byId, nextItem, prevItem, itemMinutes, state, save, profile,
    addXP, addWatchTime, renderProgress, renderChapters, setMood, nudge, REC, aiSay, toast, stats, startQuiz, COURSE_ID } = window.MK;
  const typeLabel = (it) => (it.type === 'video' ? 'Video' : it.type === 'quiz' ? 'Chat quiz' : 'Interactive');
  const startLabel = (it) => (it.type === 'video' ? 'Next lesson' : it.type === 'quiz' ? 'Start the quiz' : 'Open the exercise');

  const pl = { t: 0, playing: false, speed: 1, cc: true, timer: null, last: 0, rewinds: 0, xpAcc: 0, nudged: new Set(), hiddenWhilePlaying: false };
  const SPEEDS = [1, 1.25, 1.5, 2];
  const videos = ALL.filter((i) => i.type === 'video');
  const requested = byId(new URLSearchParams(location.search).get('lesson'));
  let lessonId = requested && requested.type === 'video' ? requested.id
    : COURSE_ID === 'python' ? 'u1' : (videos.find((v) => !v.done) || videos[0]).id;
  const active = () => byId(lessonId);
  let idleTimer = null;
  let liked = false;
  let disliked = false;

  /* --------------------------------------------------------------- Player */
  function setTime(t) {
    pl.t = Math.max(0, Math.min(active().dur, t));
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
      cap.textContent = it.captions[Math.min(it.captions.length - 1, Math.floor((pl.t / it.dur) * it.captions.length))];
      cap.hidden = false;
    } else cap.hidden = true;
  }
  function play() {
    if (pl.playing) return;
    if (pl.t >= active().dur) pl.t = 0;
    pl.playing = true; pl.last = performance.now();
    $('#player').classList.add('is-playing');
    $('#playBtn').innerHTML = icon('pause'); $('#playBtn').setAttribute('aria-label', 'Pause');
    pl.timer = setInterval(tick, 250);
    if ($('#assistantFace').dataset.mood === 'sleepy') setMood('happy');
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
        if (pl.playing || pl.nudged.has('pause' + lessonId)) return;
        pl.nudged.add('pause' + lessonId);
        nudge({ text: `Taking a break at ${fmt(pl.t)}? Good time to check it stuck. I can recap the last part or make it simpler.`, options: ['recap', 'simplify', REC.play], orb: 'recap' });
      }, 1200);
    }
  }
  function tick() {
    const now = performance.now();
    const dt = Math.min(1, (now - pl.last) / 1000);
    pl.last = now;
    pl.t = Math.min(active().dur, pl.t + dt * pl.speed);
    addWatchTime(dt);
    pl.xpAcc += dt;
    if (pl.xpAcc >= 30) { pl.xpAcc -= 30; addXP(5); }
    renderPlayer();
    if (pl.t >= active().dur) ended();
  }
  function ended() {
    pause(true);
    const it = active();
    const first = !it.done;
    const before = stats().pct;
    it.done = true;
    renderProgress();
    if (first) addXP(20);
    const after = stats().pct;
    const milestone = [25, 50, 75, 90].find((m) => before < m && after >= m);
    const nx = nextItem(it);
    const chapterLeft = window.MK.COURSE[it.chapter].items.filter((i) => !i.done).length;
    const cheer = milestone ? `<b>${milestone}% of the course done, ${esc(profile.name)}!</b>` : first ? '<b>Lesson done, +20 XP.</b>' : '<b>Finished again.</b>';
    const more = chapterLeft ? ` ${chapterLeft} more to finish this chapter.` : ' That wraps up this chapter.';
    nudge({
      mood: 'cheer', orb: 'quiz',
      text: `${cheer}${more}${nx ? ` Up next: ${esc(nx.title)}.` : ''}`,
      options: [nx ? [startLabel(nx), 'next'] : null, 'quiz', 'recap'].filter(Boolean)
    });
  }
  function seekBack(delta) {
    const before = pl.t;
    setTime(pl.t - delta);
    if (before - pl.t > 3) noteRewind();
  }
  function noteRewind() {
    pl.rewinds++;
    if (pl.rewinds >= 2 && !pl.nudged.has('rewind' + lessonId)) {
      pl.nudged.add('rewind' + lessonId);
      nudge({ mood: 'think', moodMs: 3000, text: 'You replayed this part a few times. Tricky parts are where the real learning happens. Want me to break it down?', options: ['simplify', 'howto', 'example'], orb: 'simplify' });
    }
  }

  function loadLesson(id) {
    const it = byId(id);
    if (!it || it.type !== 'video') return;
    pause(true);
    lessonId = id;
    state.activeId = id;
    pl.t = 0; pl.rewinds = 0;
    $('#lessonTitle').textContent = it.title;
    $('#lessonEyebrow').textContent = `${COURSE_ID === 'python' ? `Chapter ${it.chapter}` : `Module ${it.chapter + 1}`} · Session ${it.index + 1}${it.source ? ` · From “${it.source}”` : ''}`;
    renderPlayer();
    renderAbout();
    renderNotes();
    renderChapters();
    $('#prevBtn').disabled = !prevItem(it);
    $('#nextBtn').disabled = !nextItem(it);
    history.replaceState(null, '', `?lesson=${id}${COURSE_ID === 'custom' ? '&course=custom' : ''}`);
  }

  /* ---------------------------------------------------- Lesson details */
  function renderAbout() {
    const it = active();
    const nx = nextItem(it);
    const nxType = nx ? typeLabel(nx) : '';
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
          <span class="muted">${itemMinutes(nx)} min</span>
          <button class="pill pill--solid" type="button" data-goto="${nx.id}">${nx.type === 'video' ? 'Play next' : nx.type === 'quiz' ? 'Start quiz' : 'Open exercise'}${icon('chevronRight')}</button>
        </div>` : ''}
      </div>`;
  }
  function renderNotes() {
    const list = state.notes.filter((n) => n.lesson === lessonId);
    $('#notesCount').textContent = list.length;
    $('#notesList').innerHTML = list.length
      ? list.map((n) => `<li><button class="stamp" type="button" data-seek="${n.t}">${fmt(n.t)}</button><span>${esc(n.text)}</span></li>`).join('')
      : '<li class="notes-empty">No notes for this session yet. Pause on a key moment and add one.</li>';
  }
  function showTab(name) {
    $$('.tab').forEach((t) => { const on = t.dataset.tab === name; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    $('#panel-about').hidden = name !== 'about';
    $('#panel-notes').hidden = name !== 'notes';
  }
  function syncVotes() {
    $('#likeBtn').setAttribute('aria-pressed', liked);
    $('#dislikeBtn').setAttribute('aria-pressed', disliked);
    $('#likeCount').textContent = 45 + (liked ? 1 : 0);
    $('#dislikeCount').textContent = disliked ? 1 : 0;
  }

  /* --------------------------------------------------------------- Wire */
  function wire() {
    $('#bigPlay').addEventListener('click', play);
    $('#playBtn').addEventListener('click', () => (pl.playing ? pause() : play()));
    $('#player .player__poster').addEventListener('click', () => (pl.playing ? pause() : play()));
    $('#rewBtn').addEventListener('click', () => seekBack(10));
    $('#speedBtn').addEventListener('click', () => {
      pl.speed = SPEEDS[(SPEEDS.indexOf(pl.speed) + 1) % SPEEDS.length];
      $('#speedBtn').textContent = `${pl.speed}x`;
      if (pl.speed === 2 && !pl.nudged.has('speed')) {
        pl.nudged.add('speed');
        nudge({ text: 'Fast pace at 2×! Let’s make sure it sticks. I’ll have a quick question ready when you finish.', options: ['quiz', 'recap'], orb: 'quiz' });
      }
    });
    $('#ccBtn').addEventListener('click', () => { pl.cc = !pl.cc; $('#ccBtn').classList.toggle('is-on', pl.cc); renderPlayer(); });
    $('#fsBtn').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else $('#player').requestFullscreen?.().catch(() => toast('Full screen is not available here', 'brand', 'info'));
    });
    const scrub = $('#scrub');
    const fraction = (e) => { const r = scrub.getBoundingClientRect(); return (e.clientX - r.left) / r.width; };
    scrub.addEventListener('pointerdown', (e) => {
      const before = pl.t;
      setTime(fraction(e) * active().dur);
      if (before - pl.t > 3) noteRewind();
      scrub.setPointerCapture(e.pointerId);
    });
    scrub.addEventListener('pointermove', (e) => { if (scrub.hasPointerCapture(e.pointerId)) setTime(fraction(e) * active().dur); });
    scrub.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { setTime(pl.t + 5); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { seekBack(5); e.preventDefault(); }
    });
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (e.key === ' ' && !['input', 'textarea', 'button'].includes(tag) && $('#modal').hidden) { e.preventDefault(); pl.playing ? pause() : play(); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && pl.playing) { pause(true); pl.hiddenWhilePlaying = true; }
      else if (!document.hidden && pl.hiddenWhilePlaying) {
        pl.hiddenWhilePlaying = false;
        nudge({ text: `Welcome back, ${esc(profile.name)}! I paused the video at ${fmt(pl.t)} for you.`, options: [['Resume', 'play'], 'recap'] });
      }
    });
    $('#prevBtn').addEventListener('click', () => window.MK.goTo(prevItem(active())));
    $('#nextBtn').addEventListener('click', () => window.MK.goTo(nextItem(active())));

    $$('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
    $('#panel-about').addEventListener('click', (e) => { const b = e.target.closest('[data-goto]'); if (b) window.MK.goTo(byId(b.dataset.goto)); });
    $('#addNoteBtn').addEventListener('click', () => { showTab('notes'); $('#noteText').focus(); });
    $('#noteForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = $('#noteText').value.trim();
      if (!text) { $('#noteText').focus(); return; }
      state.notes.push({ lesson: lessonId, t: pl.t, text });
      state.notes.sort((a, b) => a.t - b.t);
      $('#noteText').value = '';
      renderNotes();
      save();
      toast('Note saved', 'brand', 'pencil');
    });
    $('#notesList').addEventListener('click', (e) => { const b = e.target.closest('[data-seek]'); if (b) setTime(Number(b.dataset.seek)); });
    $('#likeBtn').addEventListener('click', () => { liked = !liked; if (liked) disliked = false; syncVotes(); });
    $('#dislikeBtn').addEventListener('click', () => { disliked = !disliked; if (disliked) liked = false; syncVotes(); });
    $('#reportBtn').addEventListener('click', () => toast('Thanks. Our support team will check this session.', 'brand', 'alert'));
  }

  /* --------------------------------------------------------------- Boot */
  window.MK.init({
    name: 'course',
    current: active,
    ctx: () => {
      const it = active();
      return { title: it.title, points: it.points, simple: it.simple, oneLine: it.oneLine, quiz: it.quiz, howto: it.howto };
    },
    goTo: (it) => {
      if (it.type !== 'video') return false;
      loadLesson(it.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    },
    onAction: (act) => {
      if (act === 'play') { play(); return true; }
      return false;
    },
    onProgress: () => renderAbout()
  });
  wire();
  loadLesson(lessonId);

  const st = stats();
  aiSay(`Hi ${esc(profile.name)}! I’m your assistant, and I learn alongside you. Ask me anything about this lesson, or tap a circle on the left.`);
  const quizParam = new URLSearchParams(location.search).get('quiz');
  if (quizParam && window.MK.QUIZZES[quizParam]) setTimeout(() => startQuiz(quizParam), 400);
  else {
    const upNext = ALL.find((i) => i.type !== 'video' && !i.done);
    setTimeout(() => nudge({
      text: state.streak.today
        ? `You’re <b>${st.pct}%</b> through, and today already counts toward your streak. ${upNext ? `Ready for “${esc(upNext.title)}”?` : ''}`
        : `Welcome back! You’re <b>${st.pct}%</b> through and on a <b>${state.streak.count}-day streak</b>.${upNext ? ` “${esc(upNext.title)}” takes about ${upNext.mins} minutes and keeps your streak alive today.` : ''}`,
      options: [upNext ? [startLabel(upNext), 'goto', upNext.id] : null, 'howto'].filter(Boolean)
    }), 900);
  }
  idleTimer = setTimeout(() => {
    if (pl.playing || state.streak.today) return;
    nudge({ mood: 'sleepy', text: `Still there, ${esc(profile.name)}? One minute of video is all it takes to keep your <b>${state.streak.count}-day streak</b> alive today.`, options: [['Play the lesson', 'play'], 'simplify'] });
  }, 40000);
})();
