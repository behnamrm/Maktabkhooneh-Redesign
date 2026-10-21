# Maktabkhooneh course page redesign

An English, LTR prototype of the Maktabkhooneh course player. It keeps the original look (teal brand, grey page background, white rounded cards, pill buttons, Vazirmatn type) and adds learning-motivation features.

Open `index.html` in a browser. There is no build step.

![Course page](docs/course-page.png)

## What's on the page

| Area | What it does |
| --- | --- |
| **Video player** | Play/pause, seek, back 10 s, speed (1×–2×), captions, full screen. A bar under the video shows today's streak goal. |
| **Maki, the AI study buddy** | A small teal owl whose ear tufts echo the logo's arches. Maki answers questions about the lesson in the chat. Its face changes with what's happening: happy, thinking, cheering, or sleepy when you've been idle. |
| **Help circles** | Four round buttons beside the chat: **Motivate** (a personal boost based on your progress, streak and time left), **Simplify** (explains the lesson in plain words, then in one line), **Recap** and **Quiz me**. A circle shows a red dot when Maki thinks it would help, for example Simplify after you replay a part. |
| **Tips** | Reactions to what you do (pausing, replaying, 2× speed, finishing a lesson, leaving the tab, idling, streaks, results) appear as **one** tip bubble under Maki's face. A new tip replaces the old one and it hides after 15 s, so the chat only holds your conversation. |
| **Streak** | The badge in the header opens a weekly view. A day counts when you watch **1 minute of video** or finish **1 AI exercise**. |
| **Course content** (right panel) | Chapters with videos, **AI exercises** (multiple choice plus prompt-writing tasks with instant AI feedback) and **exams** (timed, 70% pass mark). You can filter by type. |
| **On-site course** | Comes after the last chapter. It unlocks once every lesson and exercise is done and the final exam is passed. It shows the graduate price (40% off) and lets you reserve a seat. |
| **Lesson details** | Title, like/dislike, report a problem, lesson summary, "up next", and time-stamped notes. |

Use the **⋮** menu → *Demo: complete everything* to see the unlocked on-site offer, and *Demo: reset progress* to start over.

| Maki | Streak | AI exercise | On-site unlocked |
| --- | --- | --- | --- |
| ![](docs/maki.png) | ![](docs/streak.png) | ![](docs/ai-exercise.png) | ![](docs/onsite-unlocked.png) |

Maki's moods: happy, thinking, cheering, sleepy.

![Maki's moods](docs/maki-moods.png)

## Files

- `index.html`: page markup
- `css/course.css`: styles and design tokens
- `js/course.js`: course data, player, Maki (AI assistant), streak, exercises, exams and unlock logic (mock data, all client-side)
