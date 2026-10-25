/* Exercise page: an interactive exercise in place of the video.
   Task types: code (real Python, run in the browser with Pyodide, live output and
   checks), prompt (image prompt with a simulated preview), order (drag steps into
   order) and checklist (project deliverables). Quizzes are not here: they run as a
   conversation in the assistant panel. Shared parts live in core.js. */
(function () {
  'use strict';
  const { icon, $, $$, esc, fmtCode, fmt, ALL, EXERCISES, byId, byRef, nextItem, state, save, COURSE_ID, profile,
    addXP, securedToday, renderProgress, setMood, nudge, aiSay, toast, lessonURL, withName, stats, celebrateUnlock } = window.MK;

  const firstOpen = ALL.find((i) => i.type === 'exercise' && !i.done) || ALL.find((i) => i.type === 'exercise');
  const requested = new URLSearchParams(location.search).get('ex');
  const item = (requested && EXERCISES[requested] && byRef(requested)) || firstOpen;
  const ex = EXERCISES[item.ref];
  const tasks = ex.tasks;
  const isProject = !!ex.project;

  const TYPE_LABEL = { code: 'Write code', prompt: 'Write a prompt', order: 'Put in order', checklist: 'Deliver' };
  const TYPE_KICKER = { code: 'Python · runs as you type', prompt: 'Write a prompt · AI preview', order: 'Drag the steps into order', checklist: 'Project deliverables' };

  const run = {
    i: 0,
    reached: 0,
    results: tasks.map(() => null),
    best: tasks.map(() => 0),
    drafts: tasks.map((t) => (t.type === 'order' ? scramble(t.items.length) : t.type === 'checklist' ? { checked: [], text: '' } : t.type === 'prompt' ? '' : null)),
    startCode: tasks.map(() => null),
    last: tasks.map(() => null),
    hints: tasks.map(() => 0),
    fails: tasks.map(() => 0),
    nudged: new Set(),
    seconds: 0,
    finished: false,
    summary: null
  };
  let clock = null;
  let idle = null;

  function scramble(n) {
    const pattern = [2, 0, 3, 1, 4, 6, 5].filter((k) => k < n);
    for (let k = 0; k < n; k++) if (!pattern.includes(k)) pattern.push(k);
    return pattern;
  }
  const task = () => tasks[run.i];

  /* ------------------------------------------- Python in the browser (Pyodide) */
  const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  const HARNESS = [
    'import sys, io, json, traceback',
    'def __check_json(payload):',
    '    a = json.loads(payload)',
    "    code, inputs, tests = a['code'], a['inputs'], a['tests']",
    '    buf = io.StringIO()',
    "    ns = {'__name__': '__main__', '__code__': code}",
    '    queue = list(inputs)',
    "    def fake_input(prompt=''):",
    '        buf.write(str(prompt))',
    "        v = queue.pop(0) if queue else ''",
    "        buf.write(v + '\\n')",
    '        return v',
    "    ns['input'] = fake_input",
    '    old = sys.stdout',
    '    sys.stdout = buf',
    '    err = None',
    '    try:',
    "        exec(compile(code, 'main.py', 'exec'), ns)",
    '    except BaseException as e:',
    "        line = getattr(e, 'lineno', None) if isinstance(e, SyntaxError) else None",
    '        if line is None:',
    '            for f in reversed(traceback.extract_tb(e.__traceback__)):',
    "                if f.filename == 'main.py':",
    '                    line = f.lineno',
    '                    break',
    "        err = {'type': type(e).__name__, 'msg': str(e), 'line': line}",
    '    finally:',
    '        sys.stdout = old',
    '    out = buf.getvalue()',
    "    ns['__out__'] = out",
    "    ns['__lines__'] = [l.rstrip() for l in out.splitlines()]",
    '    results = []',
    '    for name, expr in tests:',
    '        try:',
    '            ok = bool(eval(expr, ns)) if err is None else False',
    '        except BaseException:',
    '            ok = False',
    '        results.append([name, ok])',
    "    return json.dumps({'out': out[:20000], 'err': err, 'results': results})"
  ].join('\n');
  const WORKER_SRC = `importScripts('${PYODIDE}pyodide.js');
let py = null;
loadPyodide({ indexURL: '${PYODIDE}' }).then((p) => { py = p; py.runPython(${JSON.stringify(HARNESS)}); postMessage({ type: 'ready', version: py.runPython('import sys; sys.version.split()[0]') }); })
  .catch((e) => postMessage({ type: 'fail', msg: String(e) }));
onmessage = (e) => {
  const { id, payload } = e.data;
  try { py.globals.set('__payload', payload); postMessage({ type: 'result', id, res: JSON.parse(py.runPython('__check_json(__payload)')) }); }
  catch (err) { postMessage({ type: 'result', id, res: { out: '', err: { type: 'InternalError', msg: String(err), line: null }, results: [] } }); }
};`;

  /* Code runs in a worker so a loop that never ends can be stopped */
  const PY = {
    worker: null, status: 'idle', seq: 0, pending: null, version: '',
    start() {
      this.set('loading');
      try {
        this.worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' })));
      } catch (e) { this.set('fail'); return; }
      this.worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'ready') { this.version = m.version; this.set('ready'); }
        else if (m.type === 'fail') this.set('fail');
        else if (m.type === 'result' && this.pending && this.pending.id === m.id) {
          clearTimeout(this.pending.timer);
          const p = this.pending;
          this.pending = null;
          this.set('ready');
          p.resolve(m.res);
        }
      };
      this.worker.onerror = () => this.set('fail');
      clearTimeout(this.slowTimer);
      this.slowTimer = setTimeout(() => { if (this.status === 'loading') this.set('slow'); }, 15000);
    },
    set(s) { this.status = s; onPyStatus(s); },
    busy() { return !!this.pending; },
    run(code, inputs, tests) {
      return new Promise((resolve) => {
        if (this.status !== 'ready') { resolve(null); return; }
        const id = ++this.seq;
        const timer = setTimeout(() => {
          this.worker.terminate();
          this.pending = null;
          resolve({ out: '', err: { type: 'Timeout', msg: 'Your code ran for more than 3 seconds, so I stopped it.', line: null }, results: tests.map((t) => [t[0], false]) });
          this.start();
        }, 3000);
        this.pending = { id, resolve, timer };
        this.set('running');
        this.worker.postMessage({ id, payload: JSON.stringify({ code, inputs, tests }) });
      });
    }
  };

  /* -------------------------------------------------------- Code editor */
  const KW = new Set('False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
  const BI = new Set('print input len int str float range list dict set tuple round abs sum min max sorted enumerate zip type isinstance bool'.split(' '));
  function hlLine(line) {
    const re = /(#.*$)|([fFrRbB]{0,2}(?:'(?:\\.|[^'\\])*'?|"(?:\\.|[^"\\])*"?))|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g;
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(line))) {
      if (!m[0]) { re.lastIndex++; continue; }
      out += esc(line.slice(last, m.index));
      const t = m[0];
      if (m[1]) out += `<span class="t-c">${esc(t)}</span>`;
      else if (m[2]) out += `<span class="t-s">${esc(t)}</span>`;
      else if (m[3]) out += `<span class="t-n">${t}</span>`;
      else if (KW.has(t)) out += `<span class="t-k">${t}</span>`;
      else if (BI.has(t)) out += `<span class="t-b">${t}</span>`;
      else if (line[re.lastIndex] === '(') out += `<span class="t-f">${t}</span>`;
      else out += t;
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }
  function paintEditor(errLine) {
    const ta = $('#code');
    if (!ta) return;
    const lines = ta.value.split('\n');
    $('#hl').innerHTML = `${lines.map((l, k) => `<span class="ln${k + 1 === errLine ? ' is-err' : ''}">${hlLine(l)}</span>`).join('\n')}\n`;
    $('#gutter').innerHTML = lines.map((_, k) => `<span${k + 1 === errLine ? ' class="is-err"' : ''}>${k + 1}</span>`).join('');
    syncScroll();
  }
  function syncScroll() {
    const ta = $('#code');
    $('#hl').scrollTop = ta.scrollTop;
    $('#hl').scrollLeft = ta.scrollLeft;
    $('#gutter').scrollTop = ta.scrollTop;
  }
  function insertText(ta, text) {
    ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function onEditorKey(e) {
    const ta = e.target;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); manualRun(); return; }
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); insertText(ta, '    '); return; }
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const start = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
      const spaces = (ta.value.slice(start).match(/^ {1,4}/) || [''])[0].length;
      if (spaces) { const pos = ta.selectionStart; ta.setRangeText('', start, start + spaces, 'preserve'); ta.selectionStart = ta.selectionEnd = Math.max(start, pos - spaces); ta.dispatchEvent(new Event('input', { bubbles: true })); }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const line = ta.value.slice(0, ta.selectionStart).split('\n').pop();
      let indent = line.match(/^\s*/)[0];
      if (/:\s*(#.*)?$/.test(line)) indent += '    ';
      insertText(ta, `\n${indent}`);
    }
  }

  /* ------------------------------------------------------ Running code */
  let liveTimer = null;
  let again = false;
  function onPyStatus(s) {
    const el = $('#pyStatus');
    if (!el) return;
    const map = {
      loading: ['is-loading', 'Starting Python…'],
      slow: ['is-loading', 'Still starting Python…'],
      ready: ['is-ready', `Python ${PY.version ? PY.version.split('.').slice(0, 2).join('.') : ''} · ready`],
      running: ['is-running', 'Running…'],
      fail: ['is-fail', 'Python couldn’t start. Check your internet connection and reload.'],
      idle: ['', '']
    };
    const [cls, text] = map[s] || map.idle;
    el.className = `py-status ${cls}`;
    el.innerHTML = `<i></i>${esc(text)}`;
    if (s === 'ready' && task() && task().type === 'code' && !run.last[run.i]) requestRun();
  }
  function codeTests(t) { return t.tests.map(([name, expr]) => [withName(name), withName(expr)]); }
  function requestRun(manual) {
    if (!task() || task().type !== 'code') return Promise.resolve(null);
    if (PY.busy()) { again = true; return Promise.resolve(null); }
    const i = run.i;
    const t = task();
    const code = run.drafts[i];
    return PY.run(code, t.inputs || [], codeTests(t)).then((res) => {
      if (!res) return null;
      res.code = code;
      run.last[i] = res;
      if (run.i === i && !run.finished) showRun(res, manual);
      if (again) { again = false; requestRun(); }
      return res;
    });
  }
  function manualRun() { return requestRun(true); }
  function showRun(res, manual) {
    const out = $('#out');
    if (!out) return;
    const errLine = res.err && res.err.line;
    out.innerHTML = (res.out ? esc(res.out) : res.err ? '' : '<span class="out__empty">Nothing printed yet. Use print() to show something.</span>')
      + (res.err ? `<span class="out__err">${res.err.type === 'Timeout' ? esc(res.err.msg) : `${errLine ? `Line ${errLine} · ` : ''}${esc(res.err.type)}: ${esc(res.err.msg)}`}</span>` : '');
    out.scrollTop = out.scrollHeight;
    paintEditor(errLine);
    const passed = res.results.filter((r) => r[1]).length;
    $('#checks').innerHTML = res.results.map(([name, ok]) => `<li class="${ok ? 'is-ok' : res.err ? 'is-blocked' : 'is-no'}">${icon(ok ? 'check' : res.err ? 'alert' : 'x')}<span>${fmtCode(name)}</span></li>`).join('');
    $('#checksSum').textContent = res.err ? 'Fix the error to run the checks' : `${passed} of ${res.results.length} checks pass`;
    $('#checksSum').className = `checks__sum${passed === res.results.length && !res.err ? ' is-all' : ''}`;
    if (res.err && manual) {
      const key = `${res.err.type}:${errLine}`;
      if (!run.nudged.has(key)) {
        run.nudged.add(key);
        nudge({ mood: 'think', text: explainError(res.err, res.code), options: ['fix', 'simplify', 'example'] });
      }
    } else if (!res.err && passed === res.results.length && !run.results[run.i] && !run.nudged.has(`allpass${run.i}`)) {
      run.nudged.add(`allpass${run.i}`);
      nudge({ mood: 'cheer', text: `<b>All checks pass!</b> Press <b>${isLast() ? 'Finish' : 'Submit'}</b> to save it.`, options: [] });
    }
  }

  /* Plain-language error explanations from the assistant */
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function explainError(err, code) {
    const at = err.line ? `On line ${err.line}, ` : '';
    const m = err.msg || '';
    switch (err.type) {
      case 'NameError': {
        const name = (m.match(/name '(\w+)'/) || [])[1] || '';
        const ids = [...new Set(code.match(/\b[A-Za-z_]\w*\b/g) || [])].filter((w) => w !== name && !KW.has(w));
        let near = null; let best = 3;
        ids.forEach((w) => { const d = lev(name, w); if (d < best) { best = d; near = w; } });
        return `${at}Python doesn’t know the name <code>${esc(name)}</code> yet. ${near ? `Did you mean <code>${esc(near)}</code>?` : 'Create it before you use it, and check the spelling. If it’s text, put it in quotes.'}`;
      }
      case 'SyntaxError':
        if (/expected ':'/.test(m)) return `${at}a colon is missing. Lines that start with <code>if</code>, <code>for</code>, <code>while</code> or <code>def</code> end with <code>:</code>.`;
        if (/unterminated string|EOL/.test(m)) return `${at}a quote is opened but never closed. Text needs a quote at the start and at the end.`;
        if (/was never closed|unexpected EOF|'\(' was never closed/.test(m)) return `${at}a bracket is opened but never closed. Count your <code>(</code> and <code>)</code>.`;
        return `${at}Python can’t read the line. Look for a missing bracket, quote or colon.`;
      case 'IndentationError':
        return `${at}the spaces at the start of the line don’t match. Code inside <code>if</code>, <code>for</code> or <code>def</code> needs 4 more spaces than the line above it.`;
      case 'TypeError':
        if (/can only concatenate str/.test(m) || /must be str, not int/.test(m)) return `${at}you’re joining text and a number with <code>+</code>. Turn the number into text with <code>str()</code>, or use an f-string.`;
        if (/'<' not supported|'>' not supported/.test(m)) return `${at}you’re comparing text with a number. Turn the text into a number first with <code>int()</code>.`;
        return `${at}a value has the wrong type for what you’re doing. Python says: <i>${esc(m)}</i>.`;
      case 'ValueError':
        if (/invalid literal for int/.test(m)) return `${at}<code>int()</code> got text that isn’t a whole number.`;
        return `${at}a value isn’t what Python expected. Python says: <i>${esc(m)}</i>.`;
      case 'ZeroDivisionError': return `${at}you’re dividing by zero, and that isn’t possible.`;
      case 'IndexError': return `${at}the list doesn’t have that position. Remember, counting starts at 0.`;
      case 'KeyError': return `${at}that key isn’t in the dictionary. Check the spelling and capital letters.`;
      case 'Timeout': return 'Your code kept running for more than 3 seconds, so I stopped it. Is there a <code>while</code> loop whose condition never becomes False?';
      default: return `${at}Python stopped with <b>${esc(err.type)}</b>: <i>${esc(m)}</i>.`;
    }
  }
  function fixSteps() {
    const res = run.last[run.i];
    if (!res || !res.err) {
      const failing = res ? res.results.filter((r) => !r[1]).map((r) => r[0]) : [];
      return failing.length ? `Your code runs without errors. What’s still missing: <b>${fmtCode(failing[0])}</b>. ${fmtCode(withName(task().hints[Math.min(run.hints[run.i], task().hints.length - 1)]))}` : 'Your code has no errors right now. Nice!';
    }
    return `${explainError(res.err, res.code)}<ol><li>Look at the red line in the editor.</li><li>Fix that one thing.</li><li>Press <b>Run</b> again and read the new output.</li></ol>`;
  }

  /* --------------------------------------------------- Prompt rubric (custom courses) */
  const BLOCKS = [
    { key: 'subject', label: 'Subject', test: (t) => t.split(/\s+/).filter(Boolean).length >= 6, tip: 'Say clearly what is in the image.' },
    { key: 'style', label: 'Style', test: (t) => /(photo|realistic|cinematic|illustration|watercolor|retro|vintage|minimal|3d|render|poster|style|flat|oil|sketch|editorial|film)/.test(t), tip: 'Name a style, like “photorealistic”.' },
    { key: 'lighting', label: 'Lighting', test: (t) => /(light|lighting|lit\b|sun|golden|shadow|glow|neon|studio|night|bright|soft|warm|moody|daylight)/.test(t), tip: 'Describe the light, like “soft morning light”.' },
    { key: 'composition', label: 'Composition', test: (t) => /(close-?up|wide|angle|center|centred|centered|left|right|background|foreground|frame|framing|portrait|landscape|space|ratio|top-down|overhead|9:16|16:9|4:5|1:1)/.test(t), tip: 'Add framing, like “centered, space at the top”.' },
    { key: 'keep', label: 'What to keep', test: (t) => /(keep|preserve|without|don.?t|do not|unchanged|same|only|exactly|original)/.test(t), tip: 'Say what must stay the same.' }
  ];
  const BLOCK_TEXT = { subject: 'Your best-selling product on a clean table', style: 'photorealistic', lighting: 'soft studio light with a gentle shadow', composition: 'centered, space at the top for text', keep: 'keep the product’s real colors' };
  function grade(text) {
    const checks = BLOCKS.map((b) => ({ ...b, ok: b.test(text.toLowerCase()) }));
    return { checks, score: checks.filter((c) => c.ok).length * 20 };
  }
  function sceneSVG(text) {
    const t = text.toLowerCase();
    let bg = ['#dfe8f1', '#c9d6e3'];
    if (/studio|minimal|clean|bright/.test(t)) bg = /mint|green/.test(t) ? ['#e3f6f1', '#c7ece2'] : ['#f6f7f9', '#e4e9ee'];
    if (/soft|morning|window|daylight/.test(t)) bg = ['#fdf3e4', '#eadcc6'];
    if (/golden|sunset|sunrise/.test(t)) bg = ['#ffc27a', '#ff8a8a'];
    if (/night|neon|dark/.test(t)) bg = ['#1b2340', '#41306e'];
    const k = /close-?up/.test(t) ? 1.35 : /wide/.test(t) ? 0.72 : 1;
    const dy = /space|headline|title|text/.test(t) ? 26 : 0;
    const headline = dy ? '<rect x="100" y="18" width="120" height="12" rx="6" fill="rgba(255,255,255,.9)"/><rect x="125" y="36" width="70" height="8" rx="4" fill="rgba(255,255,255,.75)"/>' : '';
    return `<svg viewBox="0 0 320 200" role="img" aria-label="Simulated preview of your prompt">
      <defs><linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
      <rect width="320" height="200" fill="url(#pbg)"/>
      <g transform="translate(160 ${110 + dy}) scale(${k}) translate(-160 -110)">
        <ellipse cx="160" cy="152" rx="44" ry="7" fill="rgba(0,0,0,.15)"/>
        <path d="M128 92h64v46a14 14 0 0 1-14 14h-36a14 14 0 0 1-14-14z" fill="#fbfaf7"/>
        <rect x="128" y="104" width="64" height="9" fill="#10a39a"/>
        <path d="M192 104h8a13 13 0 0 1 0 26h-8" fill="none" stroke="#fbfaf7" stroke-width="7"/>
        <ellipse cx="160" cy="92" rx="32" ry="5" fill="#6b4a32"/>
      </g>${headline}
    </svg>`;
  }

  /* --------------------------------------------------------------- Render */
  const isLast = () => run.i === tasks.length - 1;
  function renderSteps() {
    $('#wsSteps').innerHTML = tasks.map((t, k) => {
      const r = run.results[k];
      const cls = ['ws__step', k === run.i && !run.finished && 'is-current', r && (r.score >= 60 ? 'is-done' : 'is-miss')].filter(Boolean).join(' ');
      return `<li class="${cls}"><button type="button" data-step="${k}"${k > run.reached ? ' disabled' : ''} aria-label="Step ${k + 1}: ${esc(t.title || TYPE_LABEL[t.type])}">
        <span class="n">${r ? icon(r.score >= 60 ? 'check' : 'x') : k + 1}</span><span class="lbl">${esc(t.title || TYPE_LABEL[t.type])}</span></button></li>`;
    }).join('');
  }

  function renderTask() {
    const t = task();
    const done = run.results[run.i];
    const head = `<div class="task__head"><span class="task__kicker">${isProject ? 'Step' : 'Task'} ${run.i + 1} of ${tasks.length} · ${TYPE_KICKER[t.type]}</span><h3 class="task__q">${fmtCode(withName(t.brief || t.q))}</h3></div>`;
    let body = '';
    if (t.type === 'code') {
      if (run.drafts[run.i] == null) {
        const prev = run.drafts.slice(0, run.i).reverse().find((d) => typeof d === 'string');
        run.drafts[run.i] = t.starter != null ? withName(t.starter) : (prev || '');
      }
      if (run.startCode[run.i] == null) run.startCode[run.i] = run.drafts[run.i];
      body = `<div class="ide">
        <div class="editor">
          <div class="editor__bar"><span class="editor__tab">${icon('code')}main.py</span><span class="spacer"></span><button class="editor__btn" type="button" id="resetCode">${icon('refresh')}Reset</button></div>
          <div class="editor__body">
            <div class="editor__gutter" id="gutter" aria-hidden="true"></div>
            <div class="editor__code">
              <pre class="editor__hl" id="hl" aria-hidden="true"></pre>
              <textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Python code editor">${esc(run.drafts[run.i])}</textarea>
            </div>
          </div>
        </div>
        <div class="console">
          <div class="console__bar"><span class="console__title">${icon('terminal')}Output</span><span class="py-status" id="pyStatus"></span></div>
          ${t.inputs ? `<div class="console__input">${icon('user')}The player types: ${t.inputs.map((v) => `<code>${esc(v)}</code>`).join('<span class="muted">→</span>')}</div>` : ''}
          <pre class="console__out" id="out"><span class="out__empty">Your output appears here as you type.</span></pre>
        </div>
      </div>
      <div class="checks-live"><div class="checks__head"><span>${icon('target')}Checks</span><span class="checks__sum" id="checksSum">Waiting for the first run</span></div>
        <ul id="checks">${codeTests(t).map(([name]) => `<li class="is-wait">${icon('clock')}<span>${fmtCode(name)}</span></li>`).join('')}</ul></div>`;
    } else if (t.type === 'prompt') {
      const g = grade(run.drafts[run.i]);
      body = `<div class="studio">
        <div class="studio__main">
          <div class="blocks" role="group" aria-label="Add a building block">${BLOCKS.map((b) => `<button class="block${g.checks.find((c) => c.key === b.key).ok ? ' is-on' : ''}" type="button" data-block="${b.key}"${done ? ' disabled' : ''}>${icon('plus')}${b.label}</button>`).join('')}</div>
          <textarea class="prompt-box" id="promptBox" placeholder="Start with what is in the image, then add style, light and framing…"${done ? ' readonly' : ''}>${esc(run.drafts[run.i])}</textarea>
          <div class="meter" id="meter">${meterHTML(g)}</div>
        </div>
        <div class="studio__side">
          <div class="preview" id="preview">${done ? sceneSVG(run.drafts[run.i]) : `<div class="preview__empty">${icon('image')}<span>Your preview appears here.<br>Write a prompt, then press Generate.</span></div>`}</div>
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
    $('#wsStage').innerHTML = `<div class="task task--${t.type}">${head}${body}<div class="task__fb" id="fb">${done && done.feedback ? done.feedback : ''}</div></div>`;
    $('#wsKicker').lastChild.textContent = isProject ? 'Final project' : t.type === 'code' ? 'Interactive · Python' : 'Interactive';
    if (t.type === 'code') {
      const ta = $('#code');
      ta.addEventListener('keydown', onEditorKey);
      ta.addEventListener('scroll', syncScroll);
      paintEditor();
      onPyStatus(PY.status);
      if (run.last[run.i] && run.last[run.i].code === run.drafts[run.i]) showRun(run.last[run.i]);
      else if (PY.status === 'ready') requestRun();
    }
    renderSteps();
    syncAction();
    $('#wsPrev').disabled = run.i === 0;
    armIdle();
  }
  function meterHTML(g) { return g.checks.map((c) => `<span class="meter__seg${c.ok ? ' is-on' : ''}"><i></i>${c.label}</span>`).join(''); }

  function syncAction() {
    const btn = $('#wsAction');
    const t = task();
    const done = run.results[run.i];
    btn.hidden = run.finished;
    $('#wsRun').hidden = run.finished || t.type !== 'code';
    if (done) btn.textContent = isLast() ? 'See results' : 'Next step';
    else btn.textContent = t.type === 'code' ? (isLast() ? 'Finish' : 'Submit') : t.type === 'prompt' ? 'Check my prompt' : t.type === 'checklist' ? 'Submit project' : 'Check answer';
  }

  /* ---------------------------------------------------------------- Check */
  function passTask(score, feedback) {
    run.results[run.i] = { score, feedback };
    if (isProject) {
      state.projectSteps[item.ref] = Math.max(state.projectSteps[item.ref] || 0, run.results.filter((r) => r && r.score >= 60).length);
      save();
      renderProgress();
    }
    renderTask();
  }
  async function check() {
    const t = task();
    const d = run.drafts[run.i];
    if (t.type === 'code') {
      const res = await manualRun();
      if (!res) { if (PY.status !== 'ready') toast(PY.status === 'fail' ? 'Python couldn’t start. Check your connection.' : 'Python is still starting. One moment…', 'brand', 'info'); return; }
      const passed = res.results.filter((r) => r[1]).length;
      const total = res.results.length;
      if (!res.err && passed === total) {
        if (run.fails[run.i] && !isLast()) nudge({ mood: 'cheer', text: `<b>You did it!</b> That took ${run.fails[run.i] + 1} tries, and that’s exactly how programmers work: run, read, fix.`, options: [] });
        else setMood('cheer', 2000);
        passTask(100, '');
        return;
      }
      run.fails[run.i]++;
      run.best[run.i] = Math.max(run.best[run.i], Math.round((passed / total) * 100));
      if (res.err) return;
      const missing = res.results.find((r) => !r[1]);
      if (run.fails[run.i] >= 2) nudge({ mood: 'happy', text: `Every programmer gets stuck right here, ${esc(profile.name)}. You’re close: <b>${passed} of ${total}</b> checks pass. Let’s get “${fmtCode(missing[0])}” working together.`, options: ['hint', 'howto', 'example'], orb: 'hint' });
      else nudge({ mood: 'think', text: `<b>${passed} of ${total}</b> checks pass. Still missing: ${fmtCode(missing[0])}.`, options: ['hint', 'howto'] });
      return;
    }
    let score = 0;
    let feedback = '';
    if (t.type === 'prompt') {
      if (d.trim().length < 10) { toast('Write a little more first', 'brand', 'pencil'); return; }
      const g = grade(d);
      score = g.score;
      showPreview(false);
      feedback = `<div class="feedback"><div class="feedback__head">${icon('sparkles')}Review: ${score}/100</div>
        <ul class="rubric">${g.checks.map((c) => `<li class="${c.ok ? 'ok' : 'miss'}">${icon(c.ok ? 'check' : 'x')}<span><b>${c.label}</b>${c.ok ? '' : ` · ${esc(c.tip)}`}</span></li>`).join('')}</ul></div>`;
    } else if (t.type === 'order') {
      const right = d.filter((k, pos) => k === pos).length;
      score = Math.round((right / d.length) * 100);
      feedback = `<div class="feedback"><div class="feedback__head">${icon(score === 100 ? 'check' : 'info')}${score === 100 ? 'Perfect order!' : `${right} of ${d.length} in the right place.`}</div>
        ${score === 100 ? '' : `<span>The right order: ${t.items.map((x, k) => `${k + 1}. ${esc(x)}`).join(' → ')}</span>`}</div>`;
      if (score < 100) nudge({ mood: 'think', text: 'Close! Ask yourself what has to happen before anything else is possible.', options: ['simplify'] });
    } else if (t.type === 'checklist') {
      const text = $('#reflectBox').value.trim();
      d.text = text;
      score = Math.round((d.checked.length / t.items.length) * 70 + (text.length >= 60 ? 30 : text.length >= 20 ? 15 : 0));
      feedback = `<div class="feedback"><div class="feedback__head">${icon('sparkles')}Review: ${score}/100</div><span>${d.checked.length}/${t.items.length} deliverables done. ${text.length >= 60 ? 'Great reflection.' : 'Write a few more sentences about what you made for full points.'}</span></div>`;
    }
    passTask(score, feedback);
  }

  function next() {
    if (run.i + 1 < tasks.length) { run.i++; run.reached = Math.max(run.reached, run.i); renderTask(); } else finish();
  }

  function finish() {
    run.finished = true;
    clearInterval(clock);
    clearTimeout(idle);
    const firstView = !run.summary;
    if (firstView) {
      const score = Math.round(run.results.reduce((a, r) => a + (r ? r.score : 0), 0) / tasks.length);
      const passed = score >= 60;
      run.summary = { avg: score, pass: passed, xp: passed && !item.done ? (isProject ? 150 : 50) : passed ? 10 : 5 };
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
      <h3>${pass ? (isProject ? 'Your game works!' : 'Exercise complete!') : 'Almost there'}</h3>
      <p>${pass ? `Finished in ${fmt(run.seconds)}. ${isProject ? 'Your final project is done.' : 'Saved to your progress.'}` : 'You need 60% to complete this. Look at the feedback and try again.'}</p>
      <span class="xp-chip">${icon('bolt')}<b>+${xp}</b> XP</span>
      <ul class="breakdown">${tasks.map((t, k) => `<li><span>${isProject ? 'Step' : 'Task'} ${k + 1} · ${esc(t.title || TYPE_LABEL[t.type])}</span><b>${run.results[k] ? run.results[k].score : 0}%</b></li>`).join('')}</ul>
      <div class="ws-result__btns">
        <button class="pill pill--soft" type="button" id="retryBtn">${icon('refresh')}Try again</button>
        ${nx ? `<button class="pill pill--primary" type="button" data-goto="${nx.id}">Next: ${esc(nx.title)}${icon('arrowRight')}</button>` : `<a class="pill pill--primary" href="${backHref()}">Back to course</a>`}
      </div>
    </div>`;
    renderSteps();
    syncAction();
    if (firstView) {
      const st = stats();
      if (pass && isProject && st.qDone === st.qTotal && st.vDone === st.vTotal) celebrateUnlock();
      else if (!securedToday('exercise')) {
        nudge(pass
          ? { mood: 'cheer', text: `<b>${avg}%, ${esc(profile.name)}!</b> ${isProject ? 'You built a whole game from scratch.' : 'Practice like this is what makes it stick.'}`, options: nx ? [[`Next: ${esc(nx.title)}`, 'goto', nx.id]] : [] }
          : { mood: 'think', text: `<b>${avg}% this time.</b> Use a hint or two on the retry. They never lower your score.`, options: ['hint', 'howto'], orb: 'hint' });
      }
    }
  }

  function restart() {
    Object.assign(run, { i: 0, reached: 0, finished: false, seconds: 0, summary: null });
    run.results = tasks.map(() => null);
    run.drafts = tasks.map((t) => (t.type === 'order' ? scramble(t.items.length) : t.type === 'checklist' ? { checked: [], text: '' } : t.type === 'prompt' ? '' : null));
    run.startCode = tasks.map(() => null);
    run.last = tasks.map(() => null);
    run.hints = tasks.map(() => 0);
    run.fails = tasks.map(() => 0);
    startClock();
    renderTask();
  }

  /* ---------------------------------------------- Prompt studio and order helpers */
  function showPreview(withDelay) {
    const box = $('#preview');
    if (!box) return;
    const draw = () => { box.classList.remove('is-loading'); box.classList.add('has-image'); box.innerHTML = sceneSVG(run.drafts[run.i]); };
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
  }
  function addBlock(key) {
    const box = $('#promptBox');
    const cur = box.value.trim().replace(/[.,]$/, '');
    box.value = cur ? `${cur}, ${BLOCK_TEXT[key]}` : BLOCK_TEXT[key];
    box.focus();
    onPromptInput();
  }
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
    const stage = $('#wsStage');
    stage.addEventListener('dragstart', (e) => {
      const li = e.target.closest('.order__item');
      if (!li) return;
      dragFrom = $$('.order__item').indexOf(li);
      li.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(dragFrom));
    });
    stage.addEventListener('dragover', (e) => {
      const li = e.target.closest('.order__item');
      if (!li || dragFrom == null) return;
      e.preventDefault();
      $$('.order__item').forEach((x) => x.classList.toggle('is-over', x === li));
    });
    stage.addEventListener('drop', (e) => {
      const li = e.target.closest('.order__item');
      if (!li || dragFrom == null) return;
      e.preventDefault();
      const from = dragFrom;
      dragFrom = null;
      moveOrder(from, $$('.order__item').indexOf(li));
    });
    stage.addEventListener('dragend', () => { dragFrom = null; $$('.order__item').forEach((x) => x.classList.remove('is-dragging', 'is-over')); });
  }

  /* ------------------------------------------------------------- Assistant help */
  function hintFor() {
    const t = task();
    const n = run.hints[run.i]++;
    if (t.type === 'code') {
      if (n >= t.hints.length) return 'That was my last hint. Tap <b>Show an example</b> to see one working solution, then try typing it yourself.';
      return `${fmtCode(withName(t.hints[n]))}${n + 1 < t.hints.length ? '' : '<br><span class="muted">That’s my most direct hint.</span>'}`;
    }
    if (t.type === 'prompt') {
      const missing = grade(run.drafts[run.i]).checks.filter((c) => !c.ok);
      return missing.length ? `Add <b>${missing[0].label.toLowerCase()}</b>: “${esc(BLOCK_TEXT[missing[0].key])}”.` : 'All five blocks are there. Press Generate to see it.';
    }
    if (t.type === 'order') {
      const pos = [0, t.items.length - 1, 1][n % 3];
      return `${pos === 0 ? 'The first' : pos === t.items.length - 1 ? 'The last' : 'The second'} step is “${esc(t.items[pos])}”.`;
    }
    return 'Tick each deliverable you finished, then describe one thing you made and one thing you learned.';
  }
  function exampleFor() {
    const t = task();
    if (t.type === 'code') return `<div class="msg__title msg__title--brand">${icon('code')}One way to write it</div><pre><code>${esc(withName(t.solution))}</code></pre>Try typing it yourself. Copying teaches less than typing.`;
    if (t.type === 'order') return 'Think of making tea: boil the water, add the tea, let it steep, pour. Each step makes the next one possible.';
    if (t.type === 'prompt') return 'For example: “A white mug centered on a wooden table, photorealistic, soft morning light, space at the top for text, keep the logo unchanged.”';
    return 'For example: “I made 6 posts for my bakery. I learned to keep the same colors in every post.”';
  }
  function simpleFor() {
    const t = task();
    if (t.type === 'code') return `${withName(t.brief).replace(/`/g, '')} Write it one small line at a time and watch the output on the right. The checks under the editor tell you exactly what is still missing.`;
    if (t.type === 'order') return 'Ask yourself: what has to happen first before anything else is possible? Then: what is the very last check?';
    if (t.type === 'prompt') return 'Describe the picture like you’re telling a friend: what’s in it, what it looks like, the light, where things are, and what must not change.';
    return 'Show what you made, and say in a few sentences what you learned while making it.';
  }

  function armIdle() {
    clearTimeout(idle);
    if (run.results[run.i] || run.finished) return;
    idle = setTimeout(() => {
      const key = `idle${run.i}`;
      if (run.nudged.has(key)) return;
      run.nudged.add(key);
      nudge({ mood: 'think', text: `Take your time, ${esc(profile.name)}. Thinking is part of coding. Want a nudge in the right direction? Hints never lower your score.`, options: ['hint', 'howto', 'example'], orb: 'hint' });
    }, 30000);
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
    const hasCode = tasks.some((t) => t.type === 'code');
    $('#exEyebrow').textContent = `${COURSE_ID === 'python' ? `Chapter ${item.chapter}` : `Module ${item.chapter + 1}`} · ${isProject ? 'Final project' : 'Interactive exercise'}`;
    $('#exTitle').textContent = ex.title;
    $('#exTaskCount').textContent = `${tasks.length} ${isProject ? 'step' : 'task'}${tasks.length > 1 ? 's' : ''}`;
    $('#exTime').textContent = item.mins >= 60 ? `About ${Math.round(item.mins / 60)} hours` : `About ${item.mins} min`;
    $('#exXp').textContent = `+${isProject ? 150 : 50} XP`;
    $('#backBtn').href = backHref();
    const nx = nextItem(item);
    $('#panel-about').innerHTML = `
      <div class="about">
        <div>
          <p>${isProject ? 'Your final project brings together everything in the course. You build it step by step, and each step is checked as you go.' : `This exercise puts “${esc(back.title)}” and the lessons before it into practice.`}
          ${hasCode ? ' You write real Python here. It runs right in your browser, so you see the output as you type, and the checks under the editor update live.' : ''}</p>
          <h3>You will practise</h3>
          <ul>${(ex.skills || ['Applying what you learned']).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <h3>How it works</h3>
          <ul><li>Each ${isProject ? 'step' : 'task'} is done when all its checks pass.</li><li>Stuck? Tap <b>Hint</b>, <b>How to</b> or <b>Example</b> beside the chat. Help never lowers your score.</li><li>Shortcuts: <b>Ctrl + Enter</b> runs your code, <b>Tab</b> indents.</li></ul>
        </div>
        <div class="up-next">
          <span class="up-next__label">Rewards</span>
          <span class="up-next__title">+${isProject ? 150 : 50} XP the first time you finish</span>
          <span class="muted">${isProject ? 'Finishing the project also counts toward the on-site bootcamp.' : 'It also keeps your daily streak alive.'}</span>
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
      const block = e.target.closest('[data-block]');
      if (block) { addBlock(block.dataset.block); return; }
      if (e.target.closest('#genBtn')) {
        if (run.drafts[run.i].trim().length < 10) { toast('Write a prompt first', 'brand', 'pencil'); return; }
        showPreview(true);
        return;
      }
      if (e.target.closest('#resetCode')) {
        run.drafts[run.i] = run.startCode[run.i];
        $('#code').value = run.drafts[run.i];
        paintEditor();
        requestRun();
        return;
      }
      const mv = e.target.closest('[data-move]');
      if (mv) { const from = $$('.order__item').indexOf(mv.closest('.order__item')); moveOrder(from, from + Number(mv.dataset.move)); return; }
      if (e.target.closest('#retryBtn')) { restart(); return; }
      const go = e.target.closest('[data-goto]');
      if (go) window.MK.goTo(byId(go.dataset.goto));
    });
    stage.addEventListener('input', (e) => {
      armIdle();
      if (e.target.id === 'code') {
        run.drafts[run.i] = e.target.value;
        paintEditor();
        clearTimeout(liveTimer);
        liveTimer = setTimeout(() => requestRun(), 600);
      }
      if (e.target.id === 'promptBox') onPromptInput();
      if (e.target.id === 'reflectBox') run.drafts[run.i].text = e.target.value;
      const c = e.target.closest('[data-check]');
      if (c) {
        const d = run.drafts[run.i];
        const k = Number(c.dataset.check);
        d.checked = c.checked ? [...d.checked, k] : d.checked.filter((x) => x !== k);
      }
    });
    wireOrderDnD();
    $('#wsAction').addEventListener('click', () => (run.results[run.i] ? next() : check()));
    $('#wsRun').addEventListener('click', () => manualRun());
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
      return { title: t.title || ex.title, simple: simpleFor(), oneLine: withName(t.brief || t.q || ''), hint: hintFor, example: exampleFor(), howto: t.howto, fix: fixSteps };
    },
    goTo: (it) => it === item,
    onAction: (act) => {
      if (act === 'play') { location.href = backHref(); return true; }
      return false;
    },
    onProfile: () => { if (!run.finished) renderTask(); }
  });
  wire();
  renderDetails();
  startClock();
  if (tasks.some((t) => t.type === 'code')) PY.start();
  renderTask();

  aiSay(`Let’s build it, ${esc(profile.name)}! <b>${esc(ex.title)}</b> has ${tasks.length} ${isProject ? 'steps' : 'short tasks'}. ${tasks.some((t) => t.type === 'code') ? 'Your code runs as you type, and the checks under the editor turn green when you’ve got it.' : ''} Tap <b>Hint</b> if you get stuck.`);
  if (item.done) setTimeout(() => nudge({ text: `You already finished this with ${state.scores[item.ref] || 100}%. Practising again still earns XP, and it’s a great warm-up.`, options: [] }), 700);
})();
