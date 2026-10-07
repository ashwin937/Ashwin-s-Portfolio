# Portfolio site

Plain HTML/CSS/JS portfolio with an "Ask my bot" widget that answers predefined
questions about the resume (no LLM or backend needed).

## Files

```
index.html          → the site (edit content here: name, links, projects, certs)
style.css            → all styling
script.js             → nav, skills graph, resume-based chatbot (KB list), contact form
assets/              → put your photo, resume PDF, and certificate images here
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

## 3. The chatbot (no LLM, no backend)

The "Ask my bot" widget is fully offline. It runs in the browser from a
hand-written list of answers based on the resume, so there is no server, no
API key and no cost. Visitors can click the suggested questions or type their
own. Anything that is not about Ashwin's background, skills, projects,
certifications or job-related queries gets the fallback reply:
"...you can contact the owner at ashwinkbd3@gmail.com".

To change what it says, open `script.js` and edit the `KB` list (each entry has
`keys` = trigger words and `answer` = the reply) or `FALLBACK_REPLY`.
To change the clickable questions, edit the `.suggestion` buttons in `index.html`.

## 4. Deploy the site itself

Since it's plain HTML/CSS/JS, you can drop the root folder straight onto:
- **Vercel** or **Netlify** (drag-and-drop or `vercel deploy`)
- **GitHub Pages** (push to a repo, enable Pages on the main branch)
- Or serve it from the same Render/VPS setup you already use for Capo Clicks
