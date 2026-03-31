# SQLCraft

A free SQL practice platform for aspiring data analysts.

**Live site:** https://sqlcraft.dev

## What it includes

- 36 auto-graded SQL exercises (Easy → Hard)
- Live in-browser SQL editor powered by sql.js
- 12-week study curriculum with weekly deliverables
- SQL cheat sheet with syntax-highlighted code snippets
- Progress tracker (saves locally)
- Contact form

## Project structure

```
sqlcraft/
├── index.html          Home page
├── practice.html       SQL editor + 36 exercises
├── curriculum.html     12-week study plan
├── cheatsheet.html     SQL cheat sheet
├── progress.html       Progress tracker
├── contact.html        Contact form
├── css/
│   └── style.css       All styles
├── js/
│   ├── exercises.js    Database schema + 36 exercises
│   ├── curriculum.js   12-week curriculum data
│   ├── cheatsheet.js   Cheat sheet render function
│   └── app.js          App logic: nav, db, editor, progress
└── README.md
```

## How to run locally

Open any HTML file with VS Code Live Server.

## How to deploy

```bash
git add .
git commit -m "your message"
git push
```

Cloudflare Pages auto-deploys on every push.

## Built by

Salaipome — Data Analyst · Audio Engineer · AI Learner
- Website: https://salaipome.com
- Linktree: https://linktr.ee/salaipome
- GitHub: https://github.com/salaipome
