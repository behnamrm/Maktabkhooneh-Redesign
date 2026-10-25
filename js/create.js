/* Create a course with AI: a six-step builder (describe, topics, skills, time,
   goal, projects) that assembles a personal course from lessons of several
   Maktabkhooneh courses, then opens it in the course player (?course=custom).
   The "AI" is simulated with keyword matching and a small mock catalog. */
(function () {
  'use strict';
  const { icon, $, $$, esc, toast, store, avatarSVG, assistantName, openProfile, renderIdentity, hydrateIcons } = window.MK;

  /* ------------------------------------------------------------- Catalog */
  const SOURCES = {
    nano: { title: 'Nano Banana: AI Image Generation & Editing', price: 2490000 },
    midj: { title: 'Midjourney for Designers', price: 1990000 },
    ps: { title: 'Photoshop from Zero', price: 1790000 },
    insta: { title: 'Instagram Marketing for Small Businesses', price: 1490000 },
    copy: { title: 'Copywriting with ChatGPT', price: 1290000 },
    brand: { title: 'Brand Identity Design', price: 2190000 },
    figma: { title: 'UI Design with Figma', price: 2690000 },
    capcut: { title: 'Short Video Editing with CapCut', price: 1190000 },
    py: { title: 'Python Fundamentals', price: 1990000 },
    pandas: { title: 'Data Analysis with Pandas', price: 2390000 },
    excel: { title: 'Excel for Business', price: 1390000 }
  };

  const TOPICS = [
    { key: 'aiimg', label: 'AI image generation', phrase: 'AI Images', icon: 'sparkles', skills: [['aiimg-gen', 'Generate images from text'], ['aiimg-edit', 'Edit photos with AI'], ['aiimg-consist', 'Keep a consistent look']] },
    { key: 'prompt', label: 'Prompt writing', phrase: 'Prompt Writing', icon: 'pencil', skills: [['prompt-blocks', 'Write clear prompts'], ['prompt-iter', 'Refine results step by step']] },
    { key: 'photo', label: 'Photo editing', phrase: 'Photo Editing', icon: 'image', skills: [['photo-retouch', 'Retouch and clean up photos'], ['photo-product', 'Product photos']] },
    { key: 'social', label: 'Social media marketing', phrase: 'Instagram Content', icon: 'heart', skills: [['social-plan', 'Plan a content calendar'], ['social-grow', 'Grow engagement'], ['social-ads', 'Run simple ads']] },
    { key: 'copy', label: 'Copywriting', phrase: 'Copywriting', icon: 'list', skills: [['copy-captions', 'Write captions that sell'], ['copy-ai', 'Write faster with ChatGPT']] },
    { key: 'brand', label: 'Branding', phrase: 'Branding', icon: 'star', skills: [['brand-logo', 'Design a simple logo'], ['brand-kit', 'Pick colors and fonts']] },
    { key: 'ui', label: 'UI design', phrase: 'UI Design', icon: 'sidebar', skills: [['ui-figma', 'Design screens in Figma'], ['ui-proto', 'Prototype and test'], ['ui-portfolio', 'Present a case study']] },
    { key: 'video', label: 'Short-form video', phrase: 'Short Videos', icon: 'play', skills: [['video-edit', 'Edit reels and shorts'], ['video-story', 'Tell a story in 30 seconds']] },
    { key: 'python', label: 'Python', phrase: 'Python', icon: 'grip', skills: [['py-basics', 'Python basics'], ['py-auto', 'Automate boring tasks']] },
    { key: 'data', label: 'Data analysis', phrase: 'Data Analysis', icon: 'target', skills: [['data-clean', 'Clean messy data'], ['data-viz', 'Build charts and dashboards']] },
    { key: 'excel', label: 'Excel', phrase: 'Excel', icon: 'calendar', skills: [['excel-formulas', 'Formulas you actually need'], ['excel-pivot', 'Pivot tables and reports']] }
  ];
  const topicOf = (key) => TOPICS.find((t) => t.key === key);
  const skillLabel = (sk) => { for (const t of TOPICS) { const s = t.skills.find((x) => x[0] === sk); if (s) return s[1]; } return sk; };

  const topicOfSkill = (sk) => { const p = sk.split('-')[0]; return p === 'py' ? 'python' : p; };

  /* [title, minutes, level 1-3, source, skill] */
  const LESSONS = [
    ['Your first image from a text prompt', 8, 1, 'nano', 'aiimg-gen'], ['Choosing the right image model', 10, 1, 'midj', 'aiimg-gen'], ['Styles, moods and aspect ratios', 12, 2, 'midj', 'aiimg-gen'],
    ['Changing backgrounds with Nano Banana', 6, 1, 'nano', 'aiimg-edit'], ['Removing and adding objects', 7, 2, 'nano', 'aiimg-edit'], ['Restoring old and damaged photos', 6, 2, 'nano', 'aiimg-edit'],
    ['Keeping a character consistent', 9, 2, 'nano', 'aiimg-consist'], ['Your brand colors in every image', 8, 3, 'midj', 'aiimg-consist'],
    ['The anatomy of a prompt', 5, 1, 'nano', 'prompt-blocks'], ['Subject, style, lighting and composition', 6, 1, 'nano', 'prompt-blocks'],
    ['Iterating from rough to final', 6, 2, 'nano', 'prompt-iter'], ['Multi-turn editing in one conversation', 7, 2, 'nano', 'prompt-iter'], ['A prompt template you can reuse', 6, 3, 'nano', 'prompt-iter'],
    ['The Photoshop workspace in 10 minutes', 10, 1, 'ps', 'photo-retouch'], ['Healing, cloning and clean-up', 12, 2, 'ps', 'photo-retouch'], ['Color correction basics', 11, 2, 'ps', 'photo-retouch'],
    ['Product photos with your phone', 9, 1, 'insta', 'photo-product'], ['Clean white backgrounds', 8, 2, 'ps', 'photo-product'],
    ['Know your audience', 8, 1, 'insta', 'social-plan'], ['A 30-day content calendar', 10, 1, 'insta', 'social-plan'], ['Content pillars for small brands', 9, 2, 'insta', 'social-plan'],
    ['Hashtags, reels and the algorithm', 11, 2, 'insta', 'social-grow'], ['Stories that start conversations', 7, 2, 'insta', 'social-grow'],
    ['Your first Instagram ad', 12, 2, 'insta', 'social-ads'], ['Reading your ad results', 9, 3, 'insta', 'social-ads'],
    ['Hooks: the first line matters', 7, 1, 'copy', 'copy-captions'], ['Captions that sell without being pushy', 8, 2, 'copy', 'copy-captions'],
    ['ChatGPT as your writing partner', 9, 1, 'copy', 'copy-ai'], ['Prompts for ads, emails and bios', 10, 2, 'copy', 'copy-ai'],
    ['What makes a logo work', 9, 1, 'brand', 'brand-logo'], ['From sketch to vector logo', 14, 2, 'brand', 'brand-logo'],
    ['Choosing brand colors', 8, 1, 'brand', 'brand-kit'], ['Font pairing for small brands', 8, 2, 'brand', 'brand-kit'], ['A one-page brand guide', 10, 3, 'brand', 'brand-kit'],
    ['Figma basics: frames and auto layout', 12, 1, 'figma', 'ui-figma'], ['Components and variants', 14, 2, 'figma', 'ui-figma'], ['Designing a landing page', 16, 2, 'figma', 'ui-figma'],
    ['Clickable prototypes', 10, 2, 'figma', 'ui-proto'], ['Quick usability tests', 9, 3, 'figma', 'ui-proto'],
    ['Writing a design case study', 11, 2, 'figma', 'ui-portfolio'], ['Presenting your work to clients', 8, 3, 'figma', 'ui-portfolio'],
    ['CapCut in 15 minutes', 15, 1, 'capcut', 'video-edit'], ['Cuts, captions and music', 12, 1, 'capcut', 'video-edit'], ['Transitions that don’t look cheap', 9, 2, 'capcut', 'video-edit'],
    ['The 3-second hook', 6, 1, 'capcut', 'video-story'], ['Behind-the-scenes stories', 8, 2, 'capcut', 'video-story'],
    ['Install Python and run your first script', 10, 1, 'py', 'py-basics'], ['Variables, lists and loops', 14, 1, 'py', 'py-basics'], ['Functions you can reuse', 12, 2, 'py', 'py-basics'],
    ['Rename 1,000 files in seconds', 10, 2, 'py', 'py-auto'], ['Read and write Excel files with Python', 12, 2, 'py', 'py-auto'],
    ['Loading CSV files with Pandas', 10, 1, 'pandas', 'data-clean'], ['Fixing missing and messy data', 12, 2, 'pandas', 'data-clean'],
    ['Your first chart', 9, 1, 'pandas', 'data-viz'], ['A sales dashboard step by step', 15, 2, 'pandas', 'data-viz'], ['Telling a story with numbers', 10, 3, 'pandas', 'data-viz'],
    ['SUM, IF and VLOOKUP without fear', 12, 1, 'excel', 'excel-formulas'], ['Cleaning data in Excel', 10, 1, 'excel', 'excel-formulas'],
    ['Pivot tables in 10 minutes', 10, 2, 'excel', 'excel-pivot'], ['Monthly reports that update themselves', 12, 3, 'excel', 'excel-pivot']
  ].map(([title, mins, level, src, skill], n) => ({ n, title, mins, level, src, skill, topic: topicOfSkill(skill) }));

  /* One AI exercise per topic, run on exercise.html */
  const TOPIC_EXERCISE = {
    aiimg: [
      { type: 'prompt', scene: 'mug', q: 'Write a prompt for a product photo of your best-seller on a clean, bright background.', example: 'Your best-selling product centered on a clean, bright mint background, soft studio light with a gentle shadow, photorealistic, space at the top for text, keep the product’s real colors.' },
      { type: 'mcq', q: 'How do you keep the same look across ten images?', options: ['Write a new prompt each time', 'Reuse one prompt template and change only the subject', 'Use random styles', 'Lower the quality'], answer: 1, why: 'A shared template keeps style, light and colors the same.' }
    ],
    prompt: [
      { type: 'mcq', q: 'Which of these is a lighting instruction?', options: ['Watercolor style', 'Soft golden-hour light from the left', 'Close-up shot', 'A red bicycle'], answer: 1, why: 'Lighting describes the quality and direction of light.' },
      { type: 'order', q: 'Order the blocks of a strong prompt.', items: ['Subject', 'Style', 'Lighting', 'Composition', 'What to keep'] }
    ],
    photo: [
      { type: 'mcq', q: 'Which tool removes a small spot from a photo?', options: ['Healing brush', 'Crop', 'Text tool', 'Gradient'], answer: 0, why: 'The healing brush blends the spot with the area around it.' },
      { type: 'order', q: 'Order a basic retouch.', items: ['Crop and straighten', 'Fix the exposure', 'Clean up spots', 'Correct the colors'] }
    ],
    social: [
      { type: 'mcq', q: 'What should you do before you plan any posts?', options: ['Know who you are posting for', 'Buy followers', 'Post ten times a day', 'Copy a competitor exactly'], answer: 0, why: 'Everything else depends on who your audience is.' },
      { type: 'order', q: 'Order the steps of a content calendar.', items: ['Pick 3 content pillars', 'Plan 30 days of posts', 'Batch-create the posts', 'Review results every week'] }
    ],
    copy: [
      { type: 'mcq', q: 'Which caption hook is strongest?', options: ['New post!', 'Our bread sells out by 10am. Here’s why.', 'Check this out', 'We hope you like it'], answer: 1, why: 'Specific, surprising hooks make people stop scrolling.' },
      { type: 'order', q: 'Order the parts of a caption that sells.', items: ['Hook', 'Short story', 'Offer', 'Call to action'] }
    ],
    brand: [
      { type: 'mcq', q: 'How many main colors should a small brand use?', options: ['1 to 3', '7 to 10', 'As many as possible', 'Only black'], answer: 0, why: 'A few colors are easy to recognize and easy to reuse.' },
      { type: 'order', q: 'Order the steps of a mini brand kit.', items: ['Research your audience', 'Sketch logo ideas', 'Choose colors and fonts', 'Write the brand guide'] }
    ],
    ui: [
      { type: 'mcq', q: 'Auto layout in Figma helps you…', options: ['Resize designs without breaking them', 'Export to PDF', 'Add animations', 'Write code'], answer: 0, why: 'Auto layout keeps spacing right when content changes.' },
      { type: 'order', q: 'Order a small design project.', items: ['Research', 'Wireframe', 'Visual design', 'Prototype and test'] }
    ],
    video: [
      { type: 'mcq', q: 'Where should the hook of a reel be?', options: ['In the first 3 seconds', 'In the middle', 'At the end', 'Only in the caption'], answer: 0, why: 'Most people decide to keep watching in the first seconds.' },
      { type: 'order', q: 'Order a behind-the-scenes reel.', items: ['Hook', 'Show the process', 'Reveal the result', 'Call to action'] }
    ],
    python: [
      { type: 'mcq', q: 'A list in Python is…', options: ['An ordered collection of items', 'A kind of loop', 'A file', 'An error'], answer: 0, why: 'Lists hold items in order, and you can loop over them.' },
      { type: 'order', q: 'Order a script that cleans a file.', items: ['Read the file', 'Loop over the rows', 'Fix each row', 'Save the result'] }
    ],
    data: [
      { type: 'mcq', q: 'What should you do before making charts?', options: ['Clean the data', 'Pick the colors', 'Print it', 'Delete outliers without checking'], answer: 0, why: 'Charts from messy data tell the wrong story.' },
      { type: 'order', q: 'Order a small analysis.', items: ['Load the data', 'Clean it', 'Analyze it', 'Visualize the result'] }
    ],
    excel: [
      { type: 'mcq', q: 'What is the fastest way to sum sales by month?', options: ['A pivot table', 'Copy and paste', 'A chart only', 'Conditional formatting'], answer: 0, why: 'Pivot tables group and total data in a few clicks.' },
      { type: 'order', q: 'Order a monthly report.', items: ['Clean the data', 'Turn it into a table', 'Insert a pivot table', 'Add a chart'] }
    ]
  };

  /* A second chat-quiz question per topic */
  const QUIZ_EXTRA = {
    aiimg: { q: 'Besides what to change, what should a good edit prompt say?', options: ['What must stay the same', 'The file size', 'Your name', 'Nothing else'], answer: 0, why: 'Saying what to keep stops the AI from changing the parts you like.' },
    prompt: { q: 'The result is 90% right. What next?', options: ['Ask for one small change', 'Start over', 'Add 20 adjectives', 'Switch tools'], answer: 0, why: 'Small, targeted changes keep what already works.' },
    photo: { q: 'Why fix the exposure before the colors?', options: ['Brightness changes how colors look', 'It is faster', 'Colors don’t matter', 'It saves space'], answer: 0, why: 'Brightness changes how colors look, so fix it first.' },
    social: { q: 'What is a content pillar?', options: ['A theme you post about regularly', 'A paid ad', 'A follower count', 'A hashtag'], answer: 0, why: 'Pillars are 3 to 5 themes that keep your feed consistent.' },
    copy: { q: 'How should a caption that sells end?', options: ['With a clear call to action', 'With a long list of hashtags', 'With an apology', 'It doesn’t matter'], answer: 0, why: 'Tell people exactly what to do next.' },
    brand: { q: 'What does a brand guide do?', options: ['Keeps everyone using the brand the same way', 'Replaces the logo', 'Sets prices', 'Lists followers'], answer: 0, why: 'A guide keeps colors, fonts and logo use consistent.' },
    ui: { q: 'Why test a design with real people?', options: ['They find problems you can’t see yourself', 'It makes the design prettier', 'Figma requires it', 'To pick colors'], answer: 0, why: 'Fresh eyes spot confusing parts fast.' },
    video: { q: 'How long should most reels be?', options: ['Short, under 30 seconds', 'At least 10 minutes', 'Exactly one hour', 'Length doesn’t matter'], answer: 0, why: 'Short reels get watched to the end more often.' },
    python: { q: "What does `print(len('cat'))` show?", options: ['3', 'cat', '1', 'An error'], answer: 0, why: 'len() counts the characters: c, a, t.' },
    data: { q: 'What is a CSV file?', options: ['A table saved as plain text with commas', 'An image', 'A Python script', 'A chart'], answer: 0, why: 'CSV means comma-separated values: a simple table.' },
    excel: { q: 'What does VLOOKUP do?', options: ['Finds a value in a table', 'Draws a chart', 'Sorts a column', 'Deletes duplicates'], answer: 0, why: 'It looks up a value and returns the matching data.' }
  };
  /* Coding tasks for code-friendly topics, run with real Python on the exercise page */
  const CODE_TASKS = {
    python: { type: 'code', title: 'Your first loop', brief: 'Print the numbers 1 to 5, one per line, with a `for` loop.', starter: 'for n in range(1, 3):\n    print(n)\n',
      tests: [['Prints 1 to 5', "__lines__ == ['1', '2', '3', '4', '5']"]],
      hints: ['`range(1, 3)` stops just before 3.', 'The second number must be one more than the last number you want.', 'Use `range(1, 6)`.'],
      howto: ['Look at `range(1, 3)`.', 'Change 3 so the loop reaches 5.', 'Check the output shows 1 to 5.'], solution: 'for n in range(1, 6):\n    print(n)' },
    data: { type: 'code', title: 'Average sales', brief: 'The list `sales` holds three days of sales. Print the average with `sum()` and `len()`.', starter: 'sales = [120, 90, 150]\n',
      tests: [['Prints the average, 120.0', "'120.0' in __lines__ or '120' in __lines__"], ['Uses sum()', "'sum(' in __code__"]],
      hints: ['The average is the total divided by how many there are.', '`sum(sales)` gives the total and `len(sales)` the count.', 'Print `sum(sales) / len(sales)`.'],
      howto: ['Add a new line under the list.', 'Write `print(sum(sales) / len(sales))`.', 'Check the output says 120.0.'], solution: 'sales = [120, 90, 150]\nprint(sum(sales) / len(sales))' }
  };

  const PROJECTS = [
    { key: 'launch', topics: ['aiimg', 'social', 'prompt', 'photo', 'copy'], goals: ['business', 'freelance', 'hobby'], title: 'Launch week for your {biz}', blurb: 'Plan and make a week of Instagram content with AI images.', deliver: ['6 feed posts made with AI', '3 stories with a clear call to action', 'A one-week posting plan'], hours: 6 },
    { key: 'catalog', topics: ['aiimg', 'photo'], goals: ['business', 'freelance'], title: 'A product catalog for your {biz}', blurb: 'Turn phone photos into clean, consistent product shots.', deliver: ['10 product photos on a clean background', 'One consistent lighting style', 'A lifestyle shot for each product'], hours: 5 },
    { key: 'brandkit', topics: ['brand', 'aiimg'], goals: ['business', 'freelance', 'job'], title: 'A mini brand kit for your {biz}', blurb: 'A logo, colors, fonts and three ready-to-use templates.', deliver: ['A simple logo', 'A color palette and two fonts', '3 social media templates'], hours: 7 },
    { key: 'captions', topics: ['copy', 'social'], goals: ['business', 'freelance'], title: '30 days of captions for your {biz}', blurb: 'Write a month of captions with ChatGPT, in your own voice.', deliver: ['30 captions with strong hooks', 'A short brand voice guide', '5 reusable ChatGPT prompts'], hours: 4 },
    { key: 'reels', topics: ['video', 'social'], goals: ['business', 'hobby', 'freelance'], title: 'Three reels for your {biz}', blurb: 'Short behind-the-scenes videos that show how you work.', deliver: ['3 reels under 30 seconds', 'Captions on every video', 'A cover image for each reel'], hours: 6 },
    { key: 'landing', topics: ['ui'], goals: ['business', 'freelance'], title: 'A landing page for your {biz}', blurb: 'Design a one-page site in Figma and test it with 3 people.', deliver: ['Desktop and mobile designs', 'A clickable prototype', 'Notes from 3 quick tests'], hours: 8 },
    { key: 'casestudy', topics: ['ui', 'brand'], goals: ['job', 'freelance'], title: 'A portfolio case study', blurb: 'Redesign a real app screen and write it up for your portfolio.', deliver: ['Before and after screens', 'A short case study page', 'A 2-minute walkthrough video'], hours: 9 },
    { key: 'dashboard', topics: ['data', 'excel', 'python'], goals: ['business', 'job'], title: 'A sales dashboard for your {biz}', blurb: 'Turn your sales export into a dashboard that updates itself.', deliver: ['A cleaned sales file', 'A dashboard with 4 charts', '3 insights you found'], hours: 7 },
    { key: 'automate', topics: ['python', 'excel'], goals: ['job', 'business', 'hobby'], title: 'Automate a weekly task', blurb: 'Write a Python script that does a boring task for you.', deliver: ['A working script', 'The time it saves each week', 'Short instructions for a colleague'], hours: 6 },
    { key: 'portfolio', topics: ['aiimg', 'prompt', 'photo', 'brand', 'video'], goals: ['job', 'freelance', 'cert'], title: 'A 10-piece AI art portfolio', blurb: 'Show your range with ten finished images and the prompts behind them.', deliver: ['10 finished images', 'The prompt behind each one', 'A short portfolio page'], hours: 8 },
    { key: 'story', topics: ['aiimg', 'prompt', 'video'], goals: ['hobby', 'cert'], title: 'An illustrated short story', blurb: 'Write a short story and illustrate it with the same characters throughout.', deliver: ['A 6-page story', '6 illustrations with consistent characters', 'A cover'], hours: 5 }
  ];

  const GOALS = [
    { key: 'business', label: 'Grow my business', line: 'Get more customers with better content.', icon: 'rocket' },
    { key: 'freelance', label: 'Win freelance clients', line: 'Offer a new service and get paid for it.', icon: 'briefcase' },
    { key: 'job', label: 'Land a new job', line: 'Build skills and a portfolio employers want.', icon: 'target' },
    { key: 'hobby', label: 'Create for fun', line: 'Learn something new at your own pace.', icon: 'heart' },
    { key: 'cert', label: 'Earn a certificate', line: 'Finish with a certificate you can share.', icon: 'award' }
  ];

  const EXAMPLES = [
    'I run a small bakery and want eye-catching Instagram posts made with AI.',
    'I want to become a UI designer and win my first freelance client.',
    'I want to use Python and Excel to understand my shop’s sales.'
  ];

  /* --------------------------------------------------------- "AI" parsing */
  const KEYWORDS = [
    [/instagram|social|post|story|stories|followers|content|tiktok/, ['social']],
    [/image|photo|picture|visual|ai art|midjourney|nano banana|generate|eye.catching/, ['aiimg', 'prompt']],
    [/edit|retouch|photoshop|restore|product photo/, ['photo']],
    [/logo|brand|identity/, ['brand']],
    [/caption|copy|write|text|email|chatgpt/, ['copy']],
    [/app|website|ui\b|ux|figma|landing|designer/, ['ui']],
    [/video|reel|youtube|capcut|shorts/, ['video']],
    [/python|code|program|automat|script/, ['python']],
    [/data|analy|sales|dashboard|report|numbers/, ['data']],
    [/excel|spreadsheet/, ['excel']]
  ];
  function analyze(text) {
    const t = text.toLowerCase();
    const topics = [];
    KEYWORDS.forEach(([re, keys]) => { if (re.test(t)) keys.forEach((k) => { if (!topics.includes(k)) topics.push(k); }); });
    let goal = null;
    if (/job|career|hired|employ|position/.test(t)) goal = 'job';
    else if (/freelanc|client/.test(t)) goal = 'freelance';
    else if (/business|shop|bakery|store|customers|sell|sales|cafe|restaurant|salon|brand/.test(t)) goal = 'business';
    else if (/fun|hobby|myself|for me/.test(t)) goal = 'hobby';
    else if (/certificate|certif/.test(t)) goal = 'cert';
    const m = t.match(/\b(bakery|caf[eé]|coffee shop|restaurant|boutique|salon|gym|clinic|startup|shop|store)\b/);
    return { topics, goal, biz: m ? m[1].replace('cafe', 'café') : null };
  }

  /* --------------------------------------------------------------- State */
  const W = {
    step: 0,
    desc: '',
    topics: [],
    suggested: [],
    skills: new Set(),
    levels: {},
    hours: 3,
    weeks: 6,
    session: 30,
    goal: null,
    projects: [],
    projOffset: 0,
    plan: null
  };
  const STEPS = ['Describe', 'Topics', 'Skills', 'Time', 'Goal', 'Projects'];
  const LEVEL_LABELS = ['New to it', 'Some experience', 'Confident'];
  const biz = () => analyze(W.desc).biz || 'business';
  const fill = (s) => s.replace('{biz}', biz());
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtH = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ''}` : `${min}m`);
  const dateIn = (weeks) => { const d = new Date(); d.setDate(d.getDate() + weeks * 7); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };

  function syncTopics(list) {
    W.topics = list;
    W.topics.forEach((k) => {
      if (W.levels[k] == null) W.levels[k] = 0;
      topicOf(k).skills.forEach(([sk]) => { if (!W.skills.has(sk) && !W.skills.has(`x:${sk}`)) W.skills.add(sk); });
    });
  }

  /* --------------------------------------------------------- Projects AI */
  function rankedProjects() {
    return PROJECTS.map((p) => ({
      p,
      score: p.topics.filter((t) => W.topics.includes(t)).length * 2 + (W.goal && p.goals.includes(W.goal) ? 3 : 0)
    })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.p);
  }
  function shownProjects() {
    const list = rankedProjects();
    if (list.length <= 3) return list;
    const start = W.projOffset % list.length;
    return [...list.slice(start), ...list.slice(0, start)].slice(0, 3);
  }

  /* ------------------------------------------------------------ Generator */
  function build() {
    const skills = [...W.skills].filter((s) => !s.startsWith('x:') && W.topics.includes(topicOfSkill(s)));
    const projects = W.projects.map((k) => PROJECTS.find((p) => p.key === k));
    const budget = W.hours * W.weeks * 60;
    const projMin = projects.reduce((m, p) => m + p.hours * 60, 0);
    const exMin = W.topics.length * 5;

    let picked = LESSONS.filter((l) => skills.includes(l.skill) && W.topics.includes(l.topic)).filter((l) => {
      const lv = W.levels[l.topic] || 0;
      return lv === 2 ? l.level > 1 : lv === 0 ? l.level < 3 : true;
    });
    // Trim to fit the time budget: drop the most advanced lesson of the biggest skill first
    const lessonBudget = Math.max(60, budget - projMin - exMin);
    const total = () => picked.reduce((m, l) => m + l.mins, 0);
    let guard = 0;
    while (total() > lessonBudget && guard++ < 200) {
      const counts = {};
      picked.forEach((l) => { counts[l.skill] = (counts[l.skill] || 0) + 1; });
      const big = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      if (counts[big] <= 1) break;
      const drop = picked.filter((l) => l.skill === big).sort((a, b) => b.level - a.level)[0];
      picked = picked.filter((l) => l !== drop);
    }

    const chapters = [];
    const exercises = {};
    const quizzes = {};
    W.topics.forEach((tk) => {
      const t = topicOf(tk);
      const lessons = picked.filter((l) => l.topic === tk).sort((a, b) => a.level - b.level || a.n - b.n);
      if (!lessons.length) return;
      const ref = `cx-${tk}`;
      const bank = TOPIC_EXERCISE[tk];
      const hint = 'Read each answer and ask yourself which one is the most specific and practical.';
      quizzes[`cq-${tk}`] = { title: `Quiz: ${t.label}`, topic: t.label.toLowerCase(), questions: [...bank.filter((x) => x.type === 'mcq'), QUIZ_EXTRA[tk]].map((x) => ({ type: 'mcq', q: x.q, options: x.options, answer: x.answer, why: x.why, hint })) };
      const interactive = bank.filter((x) => x.type !== 'mcq').map((x) => ({ ...x, title: x.type === 'order' ? 'Put in order' : 'Write a prompt', brief: x.q }));
      if (CODE_TASKS[tk]) interactive.unshift(CODE_TASKS[tk]);
      exercises[ref] = { title: `${t.label} practice`, skills: t.skills.filter(([sk]) => skills.includes(sk)).map(([, l]) => l), tasks: interactive };
      chapters.push({
        id: `m-${tk}`,
        title: t.label,
        items: [
          ...lessons.map((l) => ({ id: `v${l.n}`, type: 'video', title: l.title, dur: l.mins * 60, source: SOURCES[l.src].title, src: l.src, lesson: l.n, done: false })),
          { id: `q-${tk}`, type: 'quiz', ref: `cq-${tk}`, title: `Quiz: ${t.label}`, mins: 3, done: false },
          { id: `x-${tk}`, type: 'exercise', ref, title: `Practice: ${t.label}`, mins: CODE_TASKS[tk] ? 10 : 5, done: false }
        ]
      });
    });
    if (projects.length) {
      chapters.push({
        id: 'm-projects',
        title: projects.length > 1 ? 'Your projects' : 'Your project',
        items: projects.map((p) => {
          const ref = `cp-${p.key}`;
          exercises[ref] = {
            project: true,
            title: fill(p.title),
            skills: p.deliver,
            tasks: [
              { type: 'order', title: 'Plan it', brief: 'Plan your project: put the milestones in order.', items: ['Collect references and ideas', `Make a first draft of “${p.deliver[0]}”`, 'Get feedback from your assistant and one real person', 'Polish and share the final version'] },
              { type: 'checklist', title: 'Deliver it', brief: `Deliver “${fill(p.title)}”. Tick what you finished.`, items: p.deliver, reflect: 'What did you make? Paste a link or describe it in a few sentences.' }
            ]
          };
          return { id: `p-${p.key}`, type: 'exercise', ref, title: `Project: ${fill(p.title)}`, mins: p.hours * 60, done: false };
        })
      });
    }
    return finishPlan({ chapters, exercises, quizzes });
  }

  function finishPlan(plan) {
    const items = plan.chapters.flatMap((c) => c.items);
    const lessons = items.filter((i) => i.type === 'video');
    const minutes = items.reduce((m, i) => m + (i.type === 'video' ? i.dur / 60 : i.mins), 0);
    const sources = [...new Set(lessons.map((l) => l.src))];
    const t1 = topicOf(W.topics[0]);
    const t2 = W.topics[1] && topicOf(W.topics[1]);
    const goalPart = { business: `for Your ${cap(biz())}`, freelance: 'for Freelancers', job: 'for Your Next Job', hobby: 'for Fun', cert: 'Certificate Track' }[W.goal] || '';
    const title = `${t1 ? t1.phrase : 'My Course'}${t2 ? ` & ${t2.phrase}` : ''} ${goalPart}`.trim();
    const weeksNeeded = Math.max(1, Math.ceil(minutes / (W.hours * 60)));
    const fullPrice = sources.reduce((m, s) => m + SOURCES[s].price, 0);
    const price = Math.round((lessons.length * 69000 + 490000) / 10000) * 10000;
    return Object.assign(plan, {
      title,
      about: `A personal course ${assistantName()} built for you from ${sources.length} Maktabkhooneh courses. Your request: “${W.desc.trim()}”`,
      stats: { lessons: lessons.length, minutes: Math.round(minutes), sources, weeks: weeksNeeded, finish: dateIn(weeksNeeded), fullPrice, price }
    });
  }

  function weeklyPlan(plan) {
    const cap = W.hours * 60;
    const weeks = [];
    let cur = { items: [], min: 0 };
    plan.chapters.flatMap((c) => c.items).forEach((it) => {
      let left = it.type === 'video' ? it.dur / 60 : it.mins;
      while (left > 0) {
        const room = cap - cur.min;
        if (room <= 0) { weeks.push(cur); cur = { items: [], min: 0 }; continue; }
        const take = Math.min(room, left);
        const label = it.title;
        if (!cur.items.includes(label)) cur.items.push(label);
        cur.min += take; left -= take;
      }
    });
    if (cur.items.length) weeks.push(cur);
    return weeks;
  }

  /* --------------------------------------------------------------- Render */
  function renderStepper() {
    $('#stepper').innerHTML = STEPS.map((s, k) => {
      const cls = [k === W.step && !W.plan && 'is-current', (k < W.step || W.plan) && 'is-done'].filter(Boolean).join(' ');
      return `<li class="${cls}"><button type="button" data-step="${k}"${k > W.step && !W.plan ? ' disabled' : ''}><span class="n">${k < W.step || W.plan ? icon('check') : k + 1}</span><span class="lbl">${s}</span></button></li>`;
    }).join('');
  }

  function renderStep() {
    W.plan = null;
    const body = $('#wizBody');
    const steps = [stepDescribe, stepTopics, stepSkills, stepTime, stepGoal, stepProjects];
    body.innerHTML = `<div class="w-step">${steps[W.step]()}</div>`;
    renderStepper();
    $('#wizFoot').hidden = false;
    $('#backBtn').disabled = W.step === 0;
    $('#nextBtn').innerHTML = W.step === STEPS.length - 1 ? `${icon('sparkles')}Generate my course` : `Continue${icon('arrowRight')}`;
    $('#stepCount').textContent = `Step ${W.step + 1} of ${STEPS.length}`;
    renderPlan();
    if (W.step === 0) $('#descBox').focus();
  }

  function stepDescribe() {
    return `<h2 class="w-title">What do you want to learn?</h2>
      <p class="w-sub">Describe it in your own words: what you want to make, for whom, and why. Your assistant reads it and suggests topics, skills and projects.</p>
      <textarea id="descBox" class="desc-box" placeholder="For example: I run a small bakery and want eye-catching Instagram posts made with AI.">${esc(W.desc)}</textarea>
      <div class="examples"><span class="muted">Try one:</span>${EXAMPLES.map((e, k) => `<button class="example" type="button" data-example="${k}">“${esc(e)}”</button>`).join('')}</div>
      <div id="understood">${understoodHTML()}</div>`;
  }
  function understoodHTML() {
    if (W.desc.trim().length < 12) return '';
    const a = analyze(W.desc);
    if (!a.topics.length && !a.goal) return `<div class="understood">${assistantMini()}<p>Tell me a bit more: what would you like to <b>make</b> or <b>do</b> when you finish?</p></div>`;
    return `<div class="understood">${assistantMini()}<div><p><b>Here’s what I understood:</b></p><div class="chipset">
      ${a.topics.map((k) => `<span class="chip-s">${icon(topicOf(k).icon)}${topicOf(k).label}</span>`).join('')}
      ${a.goal ? `<span class="chip-s chip-s--goal">${icon(GOALS.find((g) => g.key === a.goal).icon)}${GOALS.find((g) => g.key === a.goal).label}</span>` : ''}
      ${a.biz ? `<span class="chip-s">${icon('pin')}For your ${esc(a.biz)}</span>` : ''}
    </div></div></div>`;
  }
  function assistantMini() { return `<span class="avatar avatar--sm" data-avatar>${avatarSVG()}</span>`; }

  function stepTopics() {
    return `<h2 class="w-title">Pick your topics</h2>
      <p class="w-sub">Your assistant marked the topics that match what you wrote. Add or remove any. Each topic becomes a module in your course.</p>
      <div class="topic-grid">${TOPICS.map((t) => {
        const on = W.topics.includes(t.key);
        const lessons = LESSONS.filter((l) => l.topic === t.key);
        const srcs = new Set(lessons.map((l) => l.src)).size;
        return `<button class="topic${on ? ' is-on' : ''}" type="button" data-topic="${t.key}" aria-pressed="${on}">
          ${W.suggested.includes(t.key) ? '<span class="topic__tag">Suggested</span>' : ''}
          <span class="topic__ic">${icon(on ? 'check' : t.icon)}</span>
          <span><b>${t.label}</b><small>${lessons.length} lessons · ${srcs} course${srcs > 1 ? 's' : ''}</small></span>
        </button>`;
      }).join('')}</div>`;
  }

  function stepSkills() {
    return `<h2 class="w-title">Choose your skills</h2>
      <p class="w-sub">Tell your assistant your level so it can skip what you already know, then pick the skills you want to build.</p>
      <div class="skill-cards">${W.topics.map((k) => {
        const t = topicOf(k);
        return `<div class="skill-card">
          <div class="skill-card__head">
            <span class="skill-card__name">${icon(t.icon)}${t.label}</span>
            <span class="seg" role="radiogroup" aria-label="Your level in ${t.label}">${LEVEL_LABELS.map((l, n) => `<button type="button" role="radio" aria-checked="${W.levels[k] === n}" class="${W.levels[k] === n ? 'is-on' : ''}" data-level="${k}:${n}">${l}</button>`).join('')}</span>
          </div>
          <div class="chipset">${t.skills.map(([sk, label]) => {
            const on = W.skills.has(sk);
            return `<button class="toggle-chip${on ? ' is-on' : ''}" type="button" data-skill="${sk}" aria-pressed="${on}">${icon(on ? 'check' : 'plus')}${label}</button>`;
          }).join('')}</div>
        </div>`;
      }).join('')}</div>`;
  }

  function stepTime() {
    const total = W.hours * W.weeks;
    return `<h2 class="w-title">How much time do you have?</h2>
      <p class="w-sub">Your assistant fits the course into your week, so you always know what to do next.</p>
      <div class="time-grid">
        <label class="time-card" for="hoursRange"><span class="muted">Hours per week</span><span class="big"><span id="hoursVal">${W.hours}</span> <small>h / week</small></span>
          <input type="range" id="hoursRange" min="1" max="10" step="1" value="${W.hours}"></label>
        <label class="time-card" for="weeksRange"><span class="muted">Finish within</span><span class="big"><span id="weeksVal">${W.weeks}</span> <small>weeks</small></span>
          <input type="range" id="weeksRange" min="2" max="12" step="1" value="${W.weeks}"></label>
      </div>
      <p class="w-label">How long is one study session?</p>
      <div class="chipset">${[15, 30, 45, 60].map((m) => `<button class="toggle-chip${W.session === m ? ' is-on' : ''}" type="button" data-session="${m}" aria-pressed="${W.session === m}">${m} min</button>`).join('')}</div>
      <div class="time-sum" id="timeSum">${timeSum(total)}</div>`;
  }
  function timeSum(total) {
    const sessions = Math.round((W.hours * 60) / W.session);
    return `${icon('calendar')}<span><b>${total} hours in total</b> · about ${sessions} session${sessions > 1 ? 's' : ''} of ${W.session} min a week · finish by <b>${dateIn(W.weeks)}</b></span>`;
  }

  function stepGoal() {
    const a = analyze(W.desc);
    return `<h2 class="w-title">What’s your goal?</h2>
      <p class="w-sub">Your goal shapes the projects your assistant suggests and the order of your lessons.</p>
      <div class="goal-grid" role="radiogroup" aria-label="Goal">${GOALS.map((g) => `<button class="goal${W.goal === g.key ? ' is-on' : ''}" type="button" role="radio" aria-checked="${W.goal === g.key}" data-goal="${g.key}">
        ${a.goal === g.key ? '<span class="topic__tag">Suggested</span>' : ''}
        <span class="goal__ic">${icon(g.icon)}</span><b>${g.label}</b><span class="muted">${g.line}</span></button>`).join('')}</div>`;
  }

  function stepProjects() {
    const list = shownProjects();
    return `<h2 class="w-title">Pick a project to finish with</h2>
      <p class="w-sub">Your assistant generated these ideas from your topics and goal. Pick one or two. You’ll build it at the end of the course, with feedback as you go.</p>
      <div class="proj-grid">${list.map((p) => {
        const on = W.projects.includes(p.key);
        return `<button class="proj${on ? ' is-on' : ''}" type="button" data-project="${p.key}" aria-pressed="${on}">
          <span class="proj__check">${on ? icon('check') : ''}</span>
          <b class="proj__title">${esc(fill(p.title))}</b>
          <span class="muted">${esc(p.blurb)}</span>
          <ul>${p.deliver.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
          <span class="proj__meta"><span class="chip-s">${icon('clock')}${p.hours} hours</span>${p.topics.filter((t) => W.topics.includes(t)).slice(0, 2).map((t) => `<span class="chip-s">${topicOf(t).label}</span>`).join('')}</span>
        </button>`;
      }).join('')}</div>
      ${rankedProjects().length > 3 ? `<button class="pill pill--soft regen" type="button" id="regenBtn">${icon('refresh')}Suggest different ideas</button>` : ''}`;
  }

  /* Live plan panel */
  const STEP_SAY = [
    'Tell me what you want to make. The more specific, the better your course.',
    'These topics become the modules of your course. You can pick as many as you like.',
    'If you’re confident in a topic, I’ll skip the basics and go straight to the good stuff.',
    'Be honest about your time. A plan you can keep beats an ambitious one you drop.',
    'Your goal decides which projects I suggest.',
    'Projects turn lessons into something real you can show people.'
  ];
  function renderPlan() {
    const p = W.plan;
    const box = $('#plan');
    if (p) {
      const weeks = weeklyPlan(p);
      box.innerHTML = `
        <div class="plan__head"><div class="avatar avatar--lg" data-avatar data-mood="cheer">${avatarSVG()}</div><div><strong>Your weekly plan</strong><span class="muted">${W.hours} h a week · ${weeks.length} week${weeks.length > 1 ? 's' : ''} · finish by ${dateIn(weeks.length)}</span></div></div>
        <p class="plan__say">Swap or remove any lesson on the left. I’ll keep your plan up to date.</p>
        <ol class="weeks">${weeks.map((w, k) => `<li class="week"><div class="week__head"><b>Week ${k + 1}</b><span class="muted">${fmtH(Math.round(w.min))}</span></div>
          <ul>${w.items.slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join('')}${w.items.length > 4 ? `<li class="muted">+${w.items.length - 4} more</li>` : ''}</ul></li>`).join('')}</ol>`;
      return;
    }
    const draft = W.topics.length ? build() : null;
    const used = draft ? Math.min(100, (draft.stats.minutes / (W.hours * W.weeks * 60)) * 100) : 0;
    const goal = GOALS.find((g) => g.key === W.goal);
    const skillCount = [...W.skills].filter((s) => !s.startsWith('x:') && W.topics.includes(topicOfSkill(s))).length;
    box.innerHTML = `
      <div class="plan__head"><div class="avatar avatar--lg" data-avatar data-mood="${W.desc.trim().length ? 'happy' : 'think'}">${avatarSVG()}</div><div><strong>${esc(assistantName())} is building your course</strong><span class="muted">Updates as you go</span></div></div>
      <p class="plan__say">${STEP_SAY[W.step]}</p>
      <dl class="plan__rows">
        <div><dt>You want</dt><dd>${W.desc.trim() ? `“${esc(W.desc.trim().slice(0, 90))}${W.desc.trim().length > 90 ? '…' : ''}”` : '<span class="muted">Not described yet</span>'}</dd></div>
        <div><dt>Topics</dt><dd>${W.topics.length ? `<span class="chipset">${W.topics.map((k) => `<span class="chip-s">${topicOf(k).label}</span>`).join('')}</span>` : '<span class="muted">—</span>'}</dd></div>
        <div><dt>Skills</dt><dd>${W.step >= 2 && W.topics.length ? `${skillCount} skill${skillCount === 1 ? '' : 's'}` : '<span class="muted">—</span>'}</dd></div>
        <div><dt>Time</dt><dd>${W.step >= 3 ? `${W.hours} h a week for ${W.weeks} weeks` : '<span class="muted">—</span>'}</dd></div>
        <div><dt>Goal</dt><dd>${goal ? goal.label : '<span class="muted">—</span>'}</dd></div>
        <div><dt>Projects</dt><dd>${W.projects.length ? W.projects.map((k) => esc(fill(PROJECTS.find((x) => x.key === k).title))).join('<br>') : '<span class="muted">—</span>'}</dd></div>
      </dl>
      ${draft ? `<div class="estimate">
        <span class="estimate__label">Estimate so far</span>
        <div class="estimate__nums">
          <span><b>${draft.stats.lessons}</b><small>lessons</small></span>
          <span><b>${fmtH(draft.stats.minutes)}</b><small>to learn</small></span>
          <span><b>${draft.stats.sources.length}</b><small>source courses</small></span>
        </div>
        ${W.step >= 3 ? `<div class="bar"><div class="bar__fill" style="width:${used}%"></div></div><span class="muted">Uses ${Math.round(used)}% of the time you have</span>` : ''}
      </div>` : ''}`;
  }

  /* Result */
  function renderResult() {
    const p = W.plan;
    const s = p.stats;
    renderStepper();
    $('#wizFoot').hidden = true;
    $('#wizBody').innerHTML = `<div class="result-view">
      <span class="r-eyebrow">${icon('sparkles')}Your course is ready</span>
      <h2 class="w-title">${esc(p.title)}</h2>
      <p class="w-sub">${esc(p.about)}</p>
      <div class="r-stats">
        <div><b>${s.lessons}</b><span>lessons</span></div>
        <div><b>${fmtH(s.minutes)}</b><span>in total</span></div>
        <div><b>${s.weeks} wk</b><span>finish by ${s.finish}</span></div>
        <div><b>${s.sources.length}</b><span>source courses</span></div>
      </div>
      <div class="modules">${p.chapters.map((c, ci) => `<section class="module">
        <header class="module__head"><b>Module ${ci + 1} · ${esc(c.title)}</b><span class="muted">${c.items.length} session${c.items.length > 1 ? 's' : ''} · ${fmtH(Math.round(c.items.reduce((m, i) => m + (i.type === 'video' ? i.dur / 60 : i.mins), 0)))}</span></header>
        ${c.items.map((it) => resultItem(it, c)).join('')}
      </section>`).join('')}</div>
      <div class="price-box">
        <div><span class="muted">Built from ${s.sources.length} full courses worth ${s.fullPrice.toLocaleString('en-US')} Toman</span>
          <span class="price-box__now"><b>${s.price.toLocaleString('en-US')}</b> Toman for your course</span></div>
        <span class="price__off">−${Math.round((1 - s.price / s.fullPrice) * 100)}%</span>
      </div>
      <div class="result-actions">
        <button class="pill pill--soft" type="button" id="editBtn">${icon('pencil')}Edit my answers</button>
        <button class="pill pill--primary" type="button" id="startBtn">Start learning${icon('arrowRight')}</button>
      </div>
    </div>`;
    renderPlan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resultItem(it, c) {
    const isVideo = it.type === 'video';
    const ex = W.plan.exercises[it.ref];
    const isQuiz = it.type === 'quiz';
    const kind = isVideo ? 'Video' : isQuiz ? 'Chat quiz' : ex && ex.project ? 'Project' : 'Interactive';
    const mins = isVideo ? it.dur / 60 : it.mins;
    const canSwap = isVideo && alternatives(it).length > 0;
    const canRemove = isVideo && c.items.filter((i) => i.type === 'video').length > 1;
    return `<div class="r-item r-item--${isVideo ? 'video' : isQuiz ? 'quiz' : ex && ex.project ? 'project' : 'ex'}">
      <span class="r-item__ic">${icon(isVideo ? 'play' : isQuiz ? 'chat' : ex && ex.project ? 'folder' : 'code')}</span>
      <span class="r-item__body"><span class="r-item__title">${esc(it.title)}</span>
        <span class="r-item__meta">${kind} · ${fmtH(Math.round(mins))}${it.source ? ` · <span class="r-item__src">${icon('book')}${esc(it.source)}</span>` : ''}</span></span>
      <span class="r-item__btns">
        ${canSwap ? `<button type="button" data-swap="${it.id}" aria-label="Swap “${esc(it.title)}” for another lesson" title="Swap for another lesson">${icon('swap')}</button>` : ''}
        ${canRemove ? `<button type="button" data-remove="${it.id}" aria-label="Remove “${esc(it.title)}”" title="Remove">${icon('close')}</button>` : ''}
      </span>
    </div>`;
  }
  function alternatives(it) {
    const l = LESSONS[it.lesson];
    const used = new Set(W.plan.chapters.flatMap((c) => c.items).filter((i) => i.type === 'video').map((i) => i.lesson));
    const lv = W.levels[l.topic] || 0;
    const fits = (x) => (lv === 2 ? x.level > 1 : lv === 0 ? x.level < 3 : true);
    // Prefer the same skill, then lessons that match the learner's level
    return LESSONS.filter((x) => x.topic === l.topic && !used.has(x.n))
      .sort((a, b) => (b.skill === l.skill) - (a.skill === l.skill) || fits(b) - fits(a) || a.level - b.level);
  }
  function swap(id) {
    const ch = W.plan.chapters.find((c) => c.items.some((i) => i.id === id));
    const k = ch.items.findIndex((i) => i.id === id);
    const alt = alternatives(ch.items[k])[0];
    if (!alt) return;
    ch.items[k] = { id: `v${alt.n}`, type: 'video', title: alt.title, dur: alt.mins * 60, source: SOURCES[alt.src].title, src: alt.src, lesson: alt.n, done: false };
    finishPlan(W.plan);
    renderResult();
    toast(`Swapped in “${alt.title}”`, 'brand', 'swap');
  }
  function remove(id) {
    const ch = W.plan.chapters.find((c) => c.items.some((i) => i.id === id));
    ch.items = ch.items.filter((i) => i.id !== id);
    finishPlan(W.plan);
    renderResult();
  }

  function generate() {
    $('#wizFoot').hidden = true;
    const plan = build();
    const lines = [
      'Reading what you want to learn',
      'Searching 1,200+ Maktabkhooneh courses',
      `Picking ${plan.stats.lessons} lessons from ${plan.stats.sources.length} courses`,
      `Fitting it into ${W.hours} hours a week`,
      'Adding AI exercises and your project'
    ];
    $('#wizBody').innerHTML = `<div class="building">
      <div class="avatar avatar--xl" data-avatar data-mood="think">${avatarSVG()}</div>
      <h2 class="w-title">${esc(assistantName())} is building your course…</h2>
      <ul class="build-steps">${lines.map((l) => `<li>${icon('check')}<span>${l}</span></li>`).join('')}</ul>
    </div>`;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = $$('.build-steps li');
    items.forEach((li, k) => setTimeout(() => li.classList.add('is-done'), reduce ? 0 : 450 * (k + 1)));
    setTimeout(() => { W.plan = plan; renderResult(); }, reduce ? 100 : 450 * (lines.length + 1));
  }

  function start() {
    const p = W.plan;
    const spec = {
      title: p.title,
      about: p.about,
      chapters: p.chapters.map((c) => ({ id: c.id, title: c.title, items: c.items.map((i) => ({ ...i, done: false })) })),
      exercises: p.exercises,
      quizzes: p.quizzes
    };
    store.set('mk.custom', spec);
    store.del('mk.progress.custom');
    if (!store.get('mk.custom')) { toast('Your browser blocked saving. Allow site data to open your course.', 'brand', 'alert'); return; }
    location.href = 'index.html?course=custom';
  }

  /* ----------------------------------------------------------- Validation */
  function canContinue() {
    if (W.step === 0 && W.desc.trim().length < 10) return 'Describe what you want in a sentence or two first.';
    if (W.step === 1 && !W.topics.length) return 'Pick at least one topic.';
    if (W.step === 2 && ![...W.skills].some((s) => !s.startsWith('x:') && W.topics.includes(topicOfSkill(s)))) return 'Pick at least one skill.';
    if (W.step === 4 && !W.goal) return 'Choose a goal to continue.';
    if (W.step === 5 && !W.projects.length) return 'Pick at least one project.';
    return '';
  }
  function next() {
    const why = canContinue();
    if (why) { toast(why, 'brand', 'info'); return; }
    if (W.step === 0) {
      const a = analyze(W.desc);
      W.suggested = a.topics.length ? a.topics : ['aiimg', 'prompt'];
      if (!W.topics.length) syncTopics(W.suggested.slice());
      if (!W.goal && a.goal) W.goal = a.goal;
    }
    if (W.step === STEPS.length - 1) { generate(); return; }
    W.step++;
    renderStep();
  }

  /* --------------------------------------------------------------- Wire */
  function wire() {
    const body = $('#wizBody');
    body.addEventListener('input', (e) => {
      if (e.target.id === 'descBox') { W.desc = e.target.value; $('#understood').innerHTML = understoodHTML(); renderPlan(); }
      if (e.target.id === 'hoursRange') { W.hours = Number(e.target.value); $('#hoursVal').textContent = W.hours; $('#timeSum').innerHTML = timeSum(W.hours * W.weeks); renderPlan(); }
      if (e.target.id === 'weeksRange') { W.weeks = Number(e.target.value); $('#weeksVal').textContent = W.weeks; $('#timeSum').innerHTML = timeSum(W.hours * W.weeks); renderPlan(); }
    });
    body.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const d = b.dataset;
      if (d.example != null) { W.desc = EXAMPLES[Number(d.example)]; $('#descBox').value = W.desc; $('#understood').innerHTML = understoodHTML(); renderPlan(); return; }
      if (d.topic) {
        const list = W.topics.includes(d.topic) ? W.topics.filter((k) => k !== d.topic) : [...W.topics, d.topic];
        syncTopics(list);
        renderStep();
        return;
      }
      if (d.level) { const [k, n] = d.level.split(':'); W.levels[k] = Number(n); renderStep(); return; }
      if (d.skill) {
        if (W.skills.has(d.skill)) { W.skills.delete(d.skill); W.skills.add(`x:${d.skill}`); } else { W.skills.delete(`x:${d.skill}`); W.skills.add(d.skill); }
        renderStep();
        return;
      }
      if (d.session) { W.session = Number(d.session); renderStep(); return; }
      if (d.goal) { W.goal = d.goal; W.projects = W.projects.filter((k) => shownProjects().some((p) => p.key === k)); renderStep(); return; }
      if (d.project) {
        if (W.projects.includes(d.project)) W.projects = W.projects.filter((k) => k !== d.project);
        else if (W.projects.length >= 2) { toast('Pick up to two projects', 'brand', 'info'); return; } else W.projects.push(d.project);
        renderStep();
        return;
      }
      if (b.id === 'regenBtn') { W.projOffset += 3; renderStep(); return; }
      if (d.swap) { swap(d.swap); return; }
      if (d.remove) { remove(d.remove); return; }
      if (b.id === 'editBtn') { W.step = STEPS.length - 1; renderStep(); return; }
      if (b.id === 'startBtn') start();
    });
    $('#nextBtn').addEventListener('click', next);
    $('#backBtn').addEventListener('click', () => { if (W.step > 0) { W.step--; renderStep(); } });
    $('#stepper').addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b || b.disabled) return;
      W.step = Number(b.dataset.step);
      renderStep();
    });
    $('#wizBody').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target.id === 'descBox') next();
    });
  }

  hydrateIcons();
  renderIdentity();
  $('#accountBtn').addEventListener('click', openProfile);
  $('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) window.MK.closeModal(); });
  wire();
  renderStep();
})();
