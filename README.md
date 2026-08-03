# Portfolio site

Plain HTML/CSS/JS portfolio with a live chatbot ("Ask my bot") wired to the
Claude API through a small Node backend.

## Files

```
index.html          → the site (edit content here: name, links, projects, certs)
style.css            → all styling
script.js             → nav, the animated agent-pipeline graph, chat widget
assets/              → put your photo, resume PDF, and certificate images here
server/
  server.js          → Express backend for /api/chat (calls Claude API)
  package.json
  .env.example
```

## 1. Fill in your real content

In `index.html`:
- Swap the `mailto:youremail@example.com` link in the Contact section.
- Add your real LinkedIn URL in the nav hero-links.
- Drop your CV at `assets/Ashwin_Resume.pdf` (or change the filename in the Download CV button).
- Replace the certificate placeholders in the Certificates section with real
  images from `assets/certs/` and their names.

## 2. Run the site locally

No build step needed — just open `index.html` in a browser, or serve it:

```bash
cd portfolio
python3 -m http.server 8000
# visit http://localhost:8000
```

## 3. Set up the chatbot backend

The frontend can't call the Claude API directly (that would expose your API
key to anyone viewing page source). Instead it calls `/api/chat` on a small
server you deploy separately.

```bash
cd server
npm install
cp .env.example .env
# edit .env and paste your real Anthropic API key
npm start
```

This runs the chat server on `http://localhost:3001`.

**Deploying it** (so the live site can reach it): push the `server/` folder
to its own GitHub repo and deploy it on Render (or Railway/Fly.io) as a Node
web service — same flow you used for the AI News Digest and Ops Suite cron
jobs. Set the `ANTHROPIC_API_KEY` environment variable in the platform's
dashboard, not in code.

Once deployed, open `script.js` and update:

```js
const CHAT_ENDPOINT = '/api/chat';
```

to your deployed server's full URL, e.g.:

```js
const CHAT_ENDPOINT = 'https://your-chat-server.onrender.com/api/chat';
```

## 4. Deploy the site itself

Since it's plain HTML/CSS/JS, you can drop the root folder (excluding
`server/`) straight onto:
- **Vercel** or **Netlify** (drag-and-drop or `vercel deploy`)
- **GitHub Pages** (push to a repo, enable Pages on the main branch)
- Or serve it from the same Render/VPS setup you already use for Capo Clicks

## Customizing the chatbot's knowledge

Edit `SYSTEM_PROMPT` in `server/server.js` — that's the only place the bot's
facts about you live. Keep it updated as you ship new projects.
# Ashwin-s-Portfolio
