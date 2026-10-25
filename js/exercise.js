/* Exercise page: an interactive AI exercise in place of the video. Task types:
   mcq (choose), prompt (write a prompt with a live, simulated AI preview),
   order (drag steps into order) and checklist (project deliverables).
   Shared parts (Maki, sidebar, streak, XP) live in core.js. */
(function () {
  'use strict';
  const { icon, $, $$, esc, fmt, ALL, EXERCISES, byId, byRef, nextItem, state, save, COURSE_ID,
    addXP, securedToday, renderProgress, setMood, tip, aiSay, toast, lessonURL } = window.MK;

  const firstOpen = ALL.find((i) => i.type === 'exercise' && !i.done) || ALL.find((i) => i.type === 'exercise');
  const requested = new URLSearchParams(location.search).get('ex');
  const item = (requested && EXERCISES[requested] && byRef(requested)) || firstOpen;
  const ex = EXERCISES[item.ref];
  const tasks = ex.tasks;

  const TYPE_LABEL = { mcq: 'Choose', prompt: 'Write a prompt', order: 'Put in order', checklist: 'Deliver' };
  const TYPE_KICKER = { mcq: 'Choose the best answer', prompt: 'Write a prompt · AI preview', order: 'Drag the steps into order', checklist: 'Project deliverables' };

  const run = {
    i: 0,
    reached: 0,
    results: tasks.map(() => null),
    drafts: tasks.map((t) => (t.type === 'order' ? scramble(t.items.length) : t.type === 'checklist' ? { checked: [], text: '' } : t.type === 'prompt' ? '' : null)),
    hints: tasks.map(() => 0),
    out: tasks.map(() => []),
    nudged: new Set(),
    seconds: 0,
    finished: false,
    summary: null
  };
  let clock = null;
  let idle = null;

  function scramble(n) {
    const order = [...Array(n).keys()];
    const pattern = [2, 0, 3, 1, 4, 6, 5];
    const out = pattern.filter((k) => k < n);
    order.forEach((k) => { if (!out.includes(k)) out.push(k); });
    return out;
  }
  const task = () => tasks[run.i];

  /* -------------------------------------------------------- Prompt rubric */
  const BLOCKS = [
    { key: 'subject', label: 'Subject', test: (t) => t.split(/\s+/).filter(Boolean).length >= 6, tip: 'Say clearly what is in the image and what you are changing.' },
    { key: 'style', label: 'Style', test: (t) => /(photo|realistic|cinematic|illustration|watercolor|retro|vintage|minimal|3d|render|poster|style|flat|oil|sketch|editorial|film)/.test(t), tip: 'Name a style, like “photorealistic” or “retro travel poster”.' },
    { key: 'lighting', label: 'Lighting', test: (t) => /(light|lighting|lit\b|sun|golden|shadow|glow|neon|studio|night|bright|soft|warm|moody|daylight)/.test(t), tip: 'Describe the light, like “soft morning light from a window”.' },
    { key: 'composition', label: 'Composition', test: (t) => /(close-?up|wide|angle|center|centred|centered|left|right|background|foreground|frame|framing|portrait|landscape|space|ratio|top-down|overhead|9:16|16:9|4:5|1:1)/.test(t), tip: 'Add framing, like “centered, empty space at the top for a headline”.' },
    { key: 'keep', label: 'What to keep', test: (t) => /(keep|preserve|without|don.?t|do not|unchanged|same|only|exactly|original)/.test(t), tip: 'Say what must stay the same, like “keep the faces unchanged”.' }
  ];
  const BLOCK_TEXT = {
    mug: { subject: 'Replace the background of this coffee mug photo with a cozy kitchen', style: 'photorealistic', lighting: 'soft morning light from a window', composition: 'mug centered, wooden counter in the foreground', keep: 'keep the mug exactly as it is' },
    shoe: { subject: 'A white running shoe for a social media ad', style: 'clean minimal studio photo', lighting: 'bright studio light with a soft shadow', composition: 'shoe in the lower half, empty space at the top for a headline, 4:5 ratio', keep: 'keep the logo unchanged' },
    photo: { subject: 'Restore this 1960s family photo and repair the scratches and tears', style: 'photorealistic, colorized with natural warm tones', lighting: 'soft daylight', composition: 'same framing as the original', keep: 'keep every face and expression exactly unchanged' },
    tower: { subject: 'Milad Tower in Tehran at night', style: 'retro travel-poster style with flat colors and grain', lighting: 'warm city lights under a deep blue sky', composition: 'tower centered with space at the top for the title', keep: 'keep the tower’s real shape' }
  };
  function grade(text) {
    const t = text.toLowerCase();
    const checks = BLOCKS.map((b) => ({ ...b, ok: b.test(t) }));
    return { checks, score: checks.filter((c) => c.ok).length * 20 };
  }

  /* --------------------------------------------- Simulated AI image preview */
  let sceneId = 0;
  function sceneSVG(scene, text) {
    const t = text.toLowerCase();
    const has = (re) => re.test(t);
    const f = {
      night: has(/night|neon|dark|moon|evening/), golden: has(/golden|sunset|sunrise|orange/),
      soft: has(/soft|morning|window|daylight|natural light/), studio: has(/studio|minimal|clean|bright/),
      retro: has(/retro|vintage|poster|travel/), water: has(/watercolor|painting|painted/), bw: has(/black.and.white|monochrome|grayscale/),
      close: has(/close-?up|macro/), wide: has(/wide shot|far away|wide angle/), headline: has(/headline|title|space at the top|copy space|room for/),
      kitchen: has(/kitchen|counter|cafe|table/), restore: has(/restor|repair|scratch|tear/), color: has(/coloriz|colour|color|tones/),
      mint: has(/mint|green/), pink: has(/pink/)
    };
    const id = `s${++sceneId}`;
    let bg = ['#dfe8f1', '#c9d6e3'];
    if (f.studio) bg = f.mint ? ['#e3f6f1', '#c7ece2'] : f.pink ? ['#fde9ef', '#f8d3df'] : ['#f6f7f9', '#e4e9ee'];
    if (f.soft) bg = ['#fdf3e4', '#eadcc6'];
    if (f.golden) bg = ['#ffc27a', '#ff8a8a'];
    if (f.night) bg = ['#1b2340', '#41306e'];
    if (f.retro && !f.night) bg = ['#f3d9a4', '#e39b62'];
    const k = f.close ? 1.35 : f.wide ? 0.72 : 1;
    const dy = f.headline ? 26 : 0;

    let back = '';
    let subj = '';
    if (scene === 'shoe') {
      subj = `<ellipse cx="160" cy="150" rx="70" ry="8" fill="rgba(0,0,0,.14)"/>
        <path d="M96 132c0-16 8-30 22-34l22-8 14 14c10 8 26 10 44 12 16 2 26 8 26 16v8H96z" fill="#fff"/>
        <path d="M96 132h128v8a6 6 0 0 1-6 6H102a6 6 0 0 1-6-6z" fill="#1d1d1f"/>
        <path d="M150 104l10 10M160 100l10 10M170 98l8 10" stroke="#10a39a" stroke-width="3" stroke-linecap="round"/>
        <path d="M120 120c18 4 40 6 60 4" stroke="#10a39a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    } else if (scene === 'photo') {
      const scratches = f.restore ? '' : '<path d="M104 52l42 76M206 48l-22 64M118 142l64-22M170 44l8 40" stroke="#fff" stroke-width="2" opacity=".75"/><path d="M95 120l30 30H95z" fill="#efe6d4"/>';
      subj = `<g ${f.color ? '' : `filter="url(#${id}sepia)"`}>
        <rect x="95" y="38" width="130" height="114" rx="3" fill="#cfd9e0" stroke="#f3ead8" stroke-width="7"/>
        <path d="M118 152v-36a12 12 0 0 1 24 0v36zM148 152v-40a12 12 0 0 1 24 0v40zM178 152v-36a12 12 0 0 1 24 0v36z" fill="#4a6fa5"/>
        <path d="M148 152v-40a12 12 0 0 1 24 0v40z" fill="#c0504d"/><path d="M178 152v-36a12 12 0 0 1 24 0v36z" fill="#6b8e4e"/>
        <circle cx="130" cy="95" r="11" fill="#e8b48f"/><circle cx="160" cy="88" r="11" fill="#e8b48f"/><circle cx="190" cy="95" r="11" fill="#e8b48f"/>
        <path d="M119 93a11 11 0 0 1 22 0c-4-5-18-5-22 0zM149 86a11 11 0 0 1 22 0c-4-5-18-5-22 0zM179 93a11 11 0 0 1 22 0c-4-5-18-5-22 0z" fill="#3b2a20"/>
        ${scratches}
      </g>${f.restore ? '' : '<rect x="95" y="38" width="130" height="114" fill="#f5ecd8" opacity=".25"/>'}`;
    } else if (scene === 'tower') {
      const lights = f.night ? '<g fill="#ffd36b"><circle cx="40" cy="160" r="1.6"/><circle cx="58" cy="168" r="1.6"/><circle cx="250" cy="158" r="1.6"/><circle cx="272" cy="170" r="1.6"/><circle cx="96" cy="172" r="1.6"/><circle cx="222" cy="174" r="1.6"/></g><g fill="#fff" opacity=".8"><circle cx="40" cy="30" r="1"/><circle cx="90" cy="50" r="1.2"/><circle cx="260" cy="36" r="1"/><circle cx="290" cy="70" r="1.2"/></g>' : '';
      back = `<path d="M0 200v-46h30v-14h22v20h26v-28h20v34h30v20h104v-26h24v-18h22v30h22v-12h20v40z" fill="${f.night ? '#232b48' : '#7c8aa0'}"/>${lights}`;
      subj = `<path d="M146 156l9-22h10l9 22z" fill="${f.night ? '#c9cfdb' : '#e5e9ef'}"/>
        <rect x="155.5" y="60" width="9" height="76" fill="${f.night ? '#c9cfdb' : '#e5e9ef'}"/>
        <ellipse cx="160" cy="68" rx="22" ry="12" fill="${f.night ? '#ffe2a6' : '#f1f4f8'}"/>
        <path d="M138 68h44" stroke="${f.night ? '#e6a94a' : '#c3cad4'}" stroke-width="2"/>
        <rect x="158.5" y="18" width="3" height="40" fill="#c9cfdb"/>`;
    } else {
      if (f.kitchen) {
        back = `<rect x="0" y="152" width="320" height="48" fill="#c89b6d"/><rect x="0" y="150" width="320" height="5" fill="#b3855a"/>
          <rect x="28" y="24" width="84" height="74" rx="4" fill="rgba(255,255,255,.55)" stroke="#fff" stroke-width="4"/><path d="M70 24v74M28 61h84" stroke="#fff" stroke-width="3"/>
          <rect x="250" y="126" width="26" height="26" rx="3" fill="#d9825b"/><ellipse cx="256" cy="116" rx="7" ry="13" fill="#4f9a5b"/><ellipse cx="270" cy="114" rx="7" ry="15" fill="#3f8a4c"/>`;
      }
      subj = `<ellipse cx="160" cy="152" rx="44" ry="7" fill="rgba(0,0,0,.15)"/>
        <path d="M128 92h64v46a14 14 0 0 1-14 14h-36a14 14 0 0 1-14-14z" fill="#fbfaf7"/>
        <rect x="128" y="104" width="64" height="9" fill="#10a39a"/>
        <path d="M192 104h8a13 13 0 0 1 0 26h-8" fill="none" stroke="#fbfaf7" stroke-width="7"/>
        <ellipse cx="160" cy="92" rx="32" ry="5" fill="#6b4a32"/>
        <path d="M150 80c-6-8 6-12 0-20M164 80c-6-8 6-12 0-20M178 80c-6-8 6-12 0-20" stroke="rgba(255,255,255,.85)" fill="none" stroke-width="3" stroke-linecap="round"/>`;
    }
    const headline = f.headline
      ? (f.retro && scene === 'tower'
        ? `<text x="160" y="36" text-anchor="middle" font-family="Vazirmatn, sans-serif" font-size="24" font-weight="800" letter-spacing="6" fill="${f.night ? '#ffd36b' : '#7a3b1d'}">TEHRAN</text>`
        : '<rect x="100" y="18" width="120" height="12" rx="6" fill="rgba(255,255,255,.9)"/><rect x="125" y="36" width="70" height="8" rx="4" fill="rgba(255,255,255,.75)"/>')
      : '';
    const frame = f.retro ? `<rect x="6" y="6" width="308" height="188" fill="none" stroke="#f6ecd6" stroke-width="10"/><rect width="320" height="200" filter="url(#${id}grain)" opacity=".18"/>` : '';
    const glow = f.night && scene === 'tower' ? '<circle cx="160" cy="68" r="40" fill="#ffd36b" opacity=".18"/>' : '';
    const filterAll = f.bw ? `filter="url(#${id}bw)"` : f.water ? `filter="url(#${id}water)"` : '';
    return `<svg viewBox="0 0 320 200" role="img" aria-label="AI preview of your prompt">
      <defs>
        <linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
        <filter id="${id}sepia"><feColorMatrix type="matrix" values=".39 .77 .19 0 0 .35 .69 .17 0 0 .27 .53 .13 0 0 0 0 0 1 0"/></filter>
        <filter id="${id}bw"><feColorMatrix type="saturate" values="0"/></filter>
        <filter id="${id}water"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/><feGaussianBlur stdDeviation=".6"/></filter>
        <filter id="${id}grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1"/><feColorMatrix type="saturate" values="0"/></filter>
      </defs>
      <g ${filterAll}>
        <rect width="320" height="200" fill="url(#${id}bg)"/>
        ${back}${glow}
        <g transform="translate(160 ${110 + dy}) scale(${k}) translate(-160 -110)">${subj}</g>
        ${headline}${frame}
      </g>
    </svg>`;
  }

  /* --------------------------------------------------------------- Render */
  function renderSteps() {
    $('#wsSteps').innerHTML = tasks.map((t, k) => {
      const r = run.results[k];
      const cls = ['ws__step', k === run.i && !run.finished && 'is-current', r && (r.score >= 60 ? 'is-done' : 'is-miss')].filter(Boolean).join(' ');
      return `<li class="${cls}"><button type="button" data-step="${k}"${k > run.reached ? ' disabled' : ''} aria-label="Task ${k + 1}: ${TYPE_LABEL[t.type]}">
        <span class="n">${r ? icon(r.score >= 60 ? 'check' : 'x') : k + 1}</span><span class="lbl">${TYPE_LABEL[t.type]}</span></button></li>`;
    }).join('');
  }

  function renderTask() {
    const t = task();
    const done = run.results[run.i];
    const head = `<span class="task__kicker">Task ${run.i + 1} of ${tasks.length} · ${TYPE_KICKER[t.type]}</span><h3 class="task__q">${esc(t.q)}</h3>`;
    let body = '';
    if (t.type === 'mcq') {
      body = `<div class="options options--grid">${t.options.map((o, k) => {
        const cls = ['option', run.drafts[run.i] === k && 'is-picked', run.out[run.i].includes(k) && 'is-out',
          done && k === t.answer && 'is-right', done && run.drafts[run.i] === k && k !== t.answer && 'is-wrong'].filter(Boolean).join(' ');
        return `<button class="${cls}" type="button" data-opt="${k}"${done ? ' disabled' : ''}><span class="option__key">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`;
      }).join('')}</div>`;
    } else if (t.type === 'prompt') {
      const g = grade(run.drafts[run.i]);
      body = `<div class="studio">
        <div class="studio__main">
          <div class="blocks" role="group" aria-label="Add a building block">${BLOCKS.map((b) => `<button class="block${g.checks.find((c) => c.key === b.key).ok ? ' is-on' : ''}" type="button" data-block="${b.key}"${done ? ' disabled' : ''}>${icon('plus')}${b.label}</button>`).join('')}</div>
          <textarea class="prompt-box" id="promptBox" placeholder="Start with what is in the image, then add style, light and framing…"${done ? ' readonly' : ''}>${esc(run.drafts[run.i])}</textarea>
          <div class="meter" id="meter" aria-label="Prompt building blocks">${meterHTML(g)}</div>
        </div>
        <div class="studio__side">
          <div class="preview" id="preview">${done ? sceneSVG(t.scene, run.drafts[run.i]) : `<div class="preview__empty">${icon('image')}<span>Your AI preview appears here.<br>Write a prompt, then press Generate.</span></div>`}</div>
          <button class="pill pill--soft" type="button" id="genBtn"${done ? ' disabled' : ''}>${icon('sparkles')}Generate preview</button>
          <span class="preview__note">Preview is simulated for this prototype</span>
        </div>
      </div>`;
    } else if (t.type === 'order') {
      body = `<ol class="order" id="orderList">${run.drafts[run.i].map((k, pos) => {
        const mark = done ? (k === pos ? ' is-right' : ' is-wrong') : '';
        return `<li class="order__item${mark}" draggable="${done ? 'false' : 'true'}" data-k="${k}">
          <span class="order__grip">${icon('grip')}</span><span class="order__n">${pos + 1}</span><span>${esc(t.items[k])}</span>
          <span class="order__btns">${done ? '' : `<button type="button" data-move="-1" aria-label="Move up"${pos === 0 ? ' disabled' : ''}>${icon('arrowUp')}</button><button type="button" data-move="1" aria-label="Move down"${pos === t.items.length - 1 ? ' disabled' : ''}>${icon('arrowDown')}</button>`}</span>
        </li>`;
      }).join('')}</ol>`;
    } else if (t.type === 'checklist') {
      const d = run.drafts[run.i];
      body = `<div class="checks">${t.items.map((x, k) => `<label class="check"><input type="checkbox" data-check="${k}"${d.checked.includes(k) ? ' checked' : ''}${done ? ' disabled' : ''}><span>${esc(x)}</span></label>`).join('')}</div>
        <label class="note-form__label" for="reflectBox">${esc(t.reflect || 'Describe what you made, or paste a link to it.')}</label>
        <textarea class="prompt-box" id="reflectBox" placeholder="A few sentences is enough…"${done ? ' readonly' : ''}>${esc(d.text)}</textarea>`;
    }
    $('#wsStage').innerHTML = `<div class="task task--${t.type}">${head}${body}<div class="task__fb" id="fb">${done ? done.feedback : ''}</div></div>`;
    renderSteps();
    syncAction();
    $('#wsPrev').disabled = run.i === 0;
    armIdle();
  }

  function meterHTML(g) {
    return g.checks.map((c) => `<span class="meter__seg${c.ok ? ' is-on' : ''}"><i></i>${c.label}</span>`).join('');
  }

  function syncAction() {
    const btn = $('#wsAction');
    const done = run.results[run.i];
    if (!done) btn.textContent = task().type === 'prompt' ? 'Check my prompt' : task().type === 'checklist' ? 'Submit project' : 'Check answer';
    else btn.textContent = run.i + 1 < tasks.length ? 'Next task' : 'See results';
    btn.hidden = run.finished;
  }

  /* ---------------------------------------------------------------- Check */
  function check() {
    const t = task();
    const d = run.drafts[run.i];
    let score = 0;
    let feedback = '';
    if (t.type === 'mcq') {
      if (d == null) { toast('Pick an answer first', 'brand', 'info'); return; }
      const ok = d === t.answer;
      score = ok ? 100 : 0;
      feedback = `<div class="feedback"><div class="feedback__head">${icon(ok ? 'check' : 'info')}${ok ? 'Correct!' : 'Not quite.'}</div><span>${esc(t.why)}</span></div>`;
      if (ok) tip({ kind: 'gold', mood: 'cheer', text: run.hints[run.i] ? '<b>Correct!</b> The hint did its job.' : '<b>Correct!</b> First try, nice.' });
      else tip({ mood: 'think', text: `The answer was “${esc(t.options[t.answer])}”. Want me to explain it in simpler words?`, action: ['Simplify', 'simple'], orb: 'simplify' });
    } else if (t.type === 'prompt') {
      if (d.trim().length < 10) { toast('Write a little more first', 'brand', 'pencil'); return; }
      const g = grade(d);
      score = g.score;
      showPreview(false);
      feedback = `<div class="feedback"><div class="feedback__head">${icon('sparkles')}Maki’s review: ${score}/100</div>
        <ul class="rubric">${g.checks.map((c) => `<li class="${c.ok ? 'ok' : 'miss'}">${icon(c.ok ? 'check' : 'x')}<span><b>${c.label}</b>${c.ok ? '' : ` · ${esc(c.tip)}`}</span></li>`).join('')}</ul>
        ${t.example ? `<details class="strong"><summary>See a strong version</summary><p>“${esc(t.example)}”</p></details>` : ''}</div>`;
      tip(score >= 80 ? { kind: 'gold', mood: 'cheer', text: `<b>${score}/100.</b> That prompt would work well in Gemini.` }
        : { mood: 'think', text: `<b>${score}/100.</b> ${esc(g.checks.find((c) => !c.ok).tip)}`, action: ['Example', 'example'], orb: 'example' });
    } else if (t.type === 'order') {
      const right = d.filter((k, pos) => k === pos).length;
      score = Math.round((right / d.length) * 100);
      feedback = `<div class="feedback"><div class="feedback__head">${icon(score === 100 ? 'check' : 'info')}${score === 100 ? 'Perfect order!' : `${right} of ${d.length} in the right place.`}</div>
        ${score === 100 ? '' : `<span>The right order: ${t.items.map((x, k) => `${k + 1}. ${esc(x)}`).join(' → ')}</span>`}</div>`;
      tip(score === 100 ? { kind: 'gold', mood: 'cheer', text: '<b>Perfect order!</b>' } : { mood: 'think', text: 'Close. Think about what has to happen before anything else is possible.', action: ['Simplify', 'simple'], orb: 'simplify' });
    } else if (t.type === 'checklist') {
      const text = $('#reflectBox').value.trim();
      d.text = text;
      score = Math.round((d.checked.length / t.items.length) * 70 + (text.length >= 60 ? 30 : text.length >= 20 ? 15 : 0));
      feedback = `<div class="feedback"><div class="feedback__head">${icon('sparkles')}Maki’s review: ${score}/100</div>
        <span>${d.checked.length}/${t.items.length} deliverables done. ${text.length >= 60 ? 'Great reflection.' : 'Add a few more sentences about what you made for full points.'}</span></div>`;
    }
    run.results[run.i] = { score, feedback };
    renderTask();
  }

  function next() {
    if (run.i + 1 < tasks.length) {
      run.i++;
      run.reached = Math.max(run.reached, run.i);
      renderTask();
    } else finish();
  }

  function finish() {
    run.finished = true;
    clearInterval(clock);
    clearTimeout(idle);
    const firstView = !run.summary;
    if (firstView) {
      const score = Math.round(run.results.reduce((a, r) => a + r.score, 0) / tasks.length);
      const passed = score >= 60;
      run.summary = { avg: score, pass: passed, xp: passed && !item.done ? 50 : passed ? 10 : 5 };
      if (passed) item.done = true;
      state.scores[item.ref] = Math.max(state.scores[item.ref] || 0, score);
      (state.attempts[item.ref] = state.attempts[item.ref] || []).push({ score, seconds: run.seconds, at: Date.now() });
      addXP(run.summary.xp);
      renderProgress();
      renderAttempts();
      save();
    }
    const { avg, pass, xp } = run.summary;
    const nx = nextItem(item);
    $('#wsStage').innerHTML = `<div class="ws-result">
      <div class="result__ring ${pass ? 'pass' : 'fail'}" style="--p:${avg}%"><span>${avg}%</span></div>
      <h3>${pass ? 'Exercise complete!' : 'Almost there'}</h3>
      <p>${pass ? `Finished in ${fmt(run.seconds)}. Maki saved this result to your progress.` : 'You need 60% to complete this exercise. Look at the feedback and try again.'}</p>
      <span class="xp-chip">${icon('bolt')}<b>+${xp}</b> XP</span>
      <ul class="breakdown">${tasks.map((t, k) => `<li><span>Task ${k + 1} · ${TYPE_LABEL[t.type]}</span><b>${run.results[k].score}%</b></li>`).join('')}</ul>
      <div class="ws-result__btns">
        <button class="pill pill--soft" type="button" id="retryBtn">${icon('refresh')}Try again</button>
        ${nx ? `<button class="pill pill--primary" type="button" data-goto="${nx.id}">Next: ${esc(nx.title)}${icon('arrowRight')}</button>` : `<a class="pill pill--primary" href="${backHref()}">Back to course</a>`}
      </div>
    </div>`;
    renderSteps();
    syncAction();
    if (firstView && !securedToday('exercise')) {
      tip(pass ? { kind: 'gold', mood: 'cheer', text: `<b>Exercise done: ${avg}%.</b> Ready for the next one?`, action: nx ? ['Continue', 'goto', nx.id] : null }
        : { mood: 'think', text: `<b>${avg}% this time.</b> Use a hint or two on the retry.`, action: ['Hint', 'hint'], orb: 'hint' });
    }
  }

  function restart() {
    run.i = 0; run.reached = 0; run.finished = false; run.seconds = 0; run.summary = null;
    run.results = tasks.map(() => null);
    run.drafts = tasks.map((t) => (t.type === 'order' ? scramble(t.items.length) : t.type === 'checklist' ? { checked: [], text: '' } : t.type === 'prompt' ? '' : null));
    run.hints = tasks.map(() => 0);
    run.out = tasks.map(() => []);
    startClock();
    renderTask();
  }

  /* -------------------------------------------------------- Prompt studio */
  function showPreview(withDelay) {
    const box = $('#preview');
    if (!box) return;
    const draw = () => { box.classList.remove('is-loading'); box.classList.add('has-image'); box.innerHTML = sceneSVG(task().scene, run.drafts[run.i]); };
    if (!withDelay) { draw(); return; }
    box.classList.add('is-loading');
    setMood('think');
    setTimeout(() => { draw(); setMood('happy'); }, 1100);
  }
  function onPromptInput() {
    const text = $('#promptBox').value;
    run.drafts[run.i] = text;
    const g = grade(text);
    $('#meter').innerHTML = meterHTML(g);
    $$('.block').forEach((b) => b.classList.toggle('is-on', g.checks.find((c) => c.key === b.dataset.block).ok));
    const on = g.checks.filter((c) => c.ok).length;
    if (on === 4 && !run.nudged.has(`four${run.i}`)) {
      run.nudged.add(`four${run.i}`);
      tip({ text: `Almost there! Add the last block: <b>${g.checks.find((c) => !c.ok).label.toLowerCase()}</b>.` });
    }
    if (on === 5 && !run.nudged.has(`five${run.i}`)) {
      run.nudged.add(`five${run.i}`);
      tip({ kind: 'gold', mood: 'cheer', text: '<b>All five blocks!</b> Press Generate to see it.' });
    }
  }
  function addBlock(key) {
    const box = $('#promptBox');
    const phrase = (BLOCK_TEXT[task().scene] || BLOCK_TEXT.mug)[key];
    const cur = box.value.trim().replace(/[.,]$/, '');
    box.value = cur ? `${cur}, ${phrase}` : phrase.charAt(0).toUpperCase() + phrase.slice(1);
    box.focus();
    onPromptInput();
  }

  /* ------------------------------------------------------------ Order DnD */
  function moveOrder(from, to) {
    const d = run.drafts[run.i];
    if (to < 0 || to >= d.length) return;
    const [k] = d.splice(from, 1);
    d.splice(to, 0, k);
    renderTask();
    const li = $$('.order__item')[to];
    if (li) li.querySelector(`[data-move="${to > from ? 1 : -1}"]`)?.focus();
  }
  function wireOrderDnD() {
    let dragFrom = null;
    $('#wsStage').addEventListener('dragstart', (e) => {
      const li = e.target.closest('.order__item');
      if (!li) return;
      dragFrom = $$('.order__item').indexOf(li);
      li.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(dragFrom));
    });
    $('#wsStage').addEventListener('dragover', (e) => {
      const li = e.target.closest('.order__item');
      if (!li || dragFrom == null) return;
      e.preventDefault();
      $$('.order__item').forEach((x) => x.classList.toggle('is-over', x === li));
    });
    $('#wsStage').addEventListener('drop', (e) => {
      const li = e.target.closest('.order__item');
      if (!li || dragFrom == null) return;
      e.preventDefault();
      const to = $$('.order__item').indexOf(li);
      const from = dragFrom;
      dragFrom = null;
      moveOrder(from, to);
    });
    $('#wsStage').addEventListener('dragend', () => { dragFrom = null; $$('.order__item').forEach((x) => x.classList.remove('is-dragging', 'is-over')); });
  }

  /* ------------------------------------------------------------- Maki help */
  function hintFor() {
    const t = task();
    const n = run.hints[run.i]++;
    if (t.type === 'mcq') {
      const wrong = t.options.map((_, k) => k).filter((k) => k !== t.answer && !run.out[run.i].includes(k));
      if (n === 0 || !wrong.length || run.results[run.i]) return 'Look for the answer that is the most specific. Vague answers are usually wrong.';
      const k = wrong[0];
      run.out[run.i].push(k);
      renderTask();
      return `You can rule out <b>${'ABCD'[k]}</b>: “${esc(t.options[k])}”. I greyed it out for you.`;
    }
    if (t.type === 'prompt') {
      const missing = grade(run.drafts[run.i]).checks.filter((c) => !c.ok);
      if (!missing.length) return 'All five blocks are there. Add one more detail, like texture or mood, then press Generate.';
      const m = missing[0];
      return `Add <b>${m.label.toLowerCase()}</b>. For example: “${esc((BLOCK_TEXT[t.scene] || BLOCK_TEXT.mug)[m.key])}”. You can also tap <b>+ ${m.label}</b> above the text box.`;
    }
    if (t.type === 'order') {
      const pos = [0, t.items.length - 1, 1][n % 3];
      return `${pos === 0 ? 'The first' : pos === t.items.length - 1 ? 'The last' : 'The second'} step is “${esc(t.items[pos])}”.`;
    }
    return 'Tick each deliverable you finished, then describe one thing you made and one thing you learned.';
  }
  const SIMPLE = {
    mcq: 'Pick the answer that says exactly what to do. If an answer is vague, like “make it better”, it is almost never the right one.',
    prompt: 'Describe the picture like you are telling a friend: what is in it, what it looks like, how the light falls, where things are, and what must not change.',
    order: 'Ask yourself: what has to happen first before anything else is possible? Then: what is the very last check?',
    checklist: 'Show what you made, and say in a few sentences what you learned while making it.'
  };
  const ONE_LINE = {
    mcq: 'Specific beats vague.',
    prompt: 'Subject, style, light, framing, and what to keep.',
    order: 'First what makes the rest possible, last the final check.',
    checklist: 'Show it, then say what you learned.'
  };
  function exampleFor() {
    const t = task();
    if (t.type === 'prompt' && t.example) return `Here is a strong version:<br><i>“${esc(t.example)}”</i><br>Notice how it covers all five blocks.`;
    if (t.type === 'order') return 'Think of making tea: boil the water → add the tea → let it steep → pour. Each step makes the next one possible.';
    if (t.type === 'mcq') return 'For example, “Remove the red car on the left” beats “edit the photo”, because it names the thing and where it is.';
    return 'For example: “I made 6 Instagram posts for my bakery. I learned to keep my brand colors the same across every post.”';
  }

  /* Gentle nudges when the learner seems stuck */
  function armIdle() {
    clearTimeout(idle);
    if (run.results[run.i] || run.finished) return;
    idle = setTimeout(() => {
      const key = `idle${run.i}`;
      if (run.nudged.has(key)) return;
      run.nudged.add(key);
      tip({ mood: 'think', text: 'Stuck on this one? I can give you a hint. It won’t lower your score.', action: ['Hint', 'hint'], orb: 'hint' });
    }, 25000);
  }
  function startClock() {
    clearInterval(clock);
    clock = setInterval(() => { run.seconds++; $('#wsTime').textContent = fmt(run.seconds); }, 1000);
  }

  /* -------------------------------------------------------------- Details */
  function backItem() {
    for (let k = ALL.indexOf(item) - 1; k >= 0; k--) if (ALL[k].type === 'video') return ALL[k];
    return ALL.find((i) => i.type === 'video');
  }
  function backHref() { return lessonURL(backItem().id); }

  function renderDetails() {
    const back = backItem();
    $('#exEyebrow').textContent = `${COURSE_ID === 'nano' ? `Chapter ${item.chapter}` : `Module ${item.chapter + 1}`} · ${ex.project ? 'Project' : 'AI exercise'}`;
    $('#exTitle').textContent = ex.title;
    $('#exTaskCount').textContent = `${tasks.length} task${tasks.length > 1 ? 's' : ''}`;
    $('#exTime').textContent = item.mins >= 60 ? `About ${Math.round(item.mins / 60)} hours` : `About ${item.mins} min`;
    $('#backBtn').href = backHref();
    $('#wsKicker').lastChild.textContent = ex.project ? 'Project' : 'AI exercise';
    const types = [...new Set(tasks.map((t) => TYPE_LABEL[t.type].toLowerCase()))];
    const nx = nextItem(item);
    $('#panel-about').innerHTML = `
      <div class="about">
        <div>
          <p>${ex.project ? 'This project brings together everything in your course.' : `This exercise puts “${esc(back.title)}” and the lessons before it into practice.`} You will ${types.join(', ')}, and Maki checks every answer right away.</p>
          <h3>You will practise</h3>
          <ul>${(ex.skills || ['Applying what you learned']).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <h3>How it is scored</h3>
          <ul><li>Each task is scored out of 100. You need an average of 60% to complete it.</li><li>Hints from Maki never lower your score.</li><li>You can retry as often as you like. Your best score counts.</li></ul>
        </div>
        <div class="up-next">
          <span class="up-next__label">Rewards</span>
          <span class="up-next__title">+50 XP the first time you pass${ex.project ? ', plus your certificate' : ''}</span>
          <span class="muted">Completing it also keeps your daily streak alive.</span>
          ${nx ? `<span class="up-next__label" style="margin-top:6px">After this</span><span class="muted">${esc(nx.title)}</span>` : ''}
        </div>
      </div>`;
    renderAttempts();
  }
  function renderAttempts() {
    const list = state.attempts[item.ref] || [];
    $('#attemptsCount').textContent = list.length;
    $('#panel-attempts').innerHTML = list.length
      ? `<ul class="attempts">${list.slice().reverse().map((a) => `<li><span>${new Date(a.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span><span class="muted">${fmt(a.seconds)}</span><b class="${a.score >= 60 ? 'ok' : 'miss'}">${a.score}%</b></li>`).join('')}</ul>`
      : '<p class="notes-empty">No attempts yet. Your scores will appear here.</p>';
  }
  function showTab(name) {
    $$('.tab').forEach((t) => { const on = t.dataset.tab === name; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    $('#panel-about').hidden = name !== 'about';
    $('#panel-attempts').hidden = name !== 'attempts';
  }

  /* --------------------------------------------------------------- Wire */
  function wire() {
    const stage = $('#wsStage');
    stage.addEventListener('click', (e) => {
      armIdle();
      const opt = e.target.closest('[data-opt]');
      if (opt && !run.results[run.i]) {
        run.drafts[run.i] = Number(opt.dataset.opt);
        $$('.option', stage).forEach((o) => o.classList.toggle('is-picked', o === opt));
        return;
      }
      const block = e.target.closest('[data-block]');
      if (block) { addBlock(block.dataset.block); return; }
      if (e.target.closest('#genBtn')) {
        if (run.drafts[run.i].trim().length < 10) { toast('Write a prompt first', 'brand', 'pencil'); return; }
        showPreview(true);
        return;
      }
      const mv = e.target.closest('[data-move]');
      if (mv) { const li = mv.closest('.order__item'); const from = $$('.order__item').indexOf(li); moveOrder(from, from + Number(mv.dataset.move)); return; }
      if (e.target.closest('#retryBtn')) { restart(); return; }
      const go = e.target.closest('[data-goto]');
      if (go) window.MK.goTo(byId(go.dataset.goto));
    });
    stage.addEventListener('input', (e) => {
      armIdle();
      if (e.target.id === 'promptBox') onPromptInput();
      if (e.target.id === 'reflectBox') run.drafts[run.i].text = e.target.value;
      const c = e.target.closest('[data-check]');
      if (c) {
        const d = run.drafts[run.i];
        const k = Number(c.dataset.check);
        d.checked = c.checked ? [...d.checked, k] : d.checked.filter((x) => x !== k);
      }
    });
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (['input', 'textarea'].includes(tag) || !$('#modal').hidden || run.finished) return;
      if (task().type === 'mcq' && /^[1-4]$/.test(e.key) && !run.results[run.i]) {
        const opt = $$('.option', stage)[Number(e.key) - 1];
        if (opt) opt.click();
      }
    });
    wireOrderDnD();
    $('#wsAction').addEventListener('click', () => (run.results[run.i] ? next() : check()));
    $('#wsPrev').addEventListener('click', () => { if (run.i > 0) { run.i--; renderTask(); } });
    $('#wsSteps').addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b || b.disabled) return;
      run.finished = false;
      run.i = Number(b.dataset.step);
      renderTask();
    });
    $$('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
    $('#reportBtn').addEventListener('click', () => toast('Thanks. Our support team will check this exercise.', 'brand', 'alert'));
  }

  /* --------------------------------------------------------------- Boot */
  window.MK.init({
    name: 'exercise',
    current: () => item,
    ctx: () => {
      const t = task();
      return { title: t.q, simple: SIMPLE[t.type], oneLine: ONE_LINE[t.type], hint: hintFor, example: exampleFor() };
    },
    goTo: (it) => it === item,
    onAction: (act) => {
      if (act === 'play') { location.href = backHref(); return true; }
      return false;
    },
    onProgress: () => {}
  });
  wire();
  renderDetails();
  startClock();
  renderTask();

  aiSay(`Let’s practise! <b>${esc(ex.title)}</b> has ${tasks.length} short tasks. Stuck? Tap <b>Hint</b> on the left. Hints never lower your score.`);
  if (item.done) setTimeout(() => tip({ kind: 'gold', text: `You already passed this with ${state.scores[item.ref] || 60}%. Practising again still earns XP.` }), 700);
})();
