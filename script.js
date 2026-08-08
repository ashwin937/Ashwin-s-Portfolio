// ---------- Nav ----------
document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ---------- Signature element: skills circuit graph ----------
// Every skill gets its own node + its own hover/tap card — nothing here is
// decoration-only. Edit SKILLS below to add/remove/relevel a skill; the
// graph, the legend, and the tooltips all render from this one list.
const svgNS = 'http://www.w3.org/2000/svg';
const skillsSvg = document.getElementById('skillsSvg');
const skillsWrap = document.getElementById('skillsWrap');
const skillsLegend = document.getElementById('skillsLegend');

const SKILLS = [
  { name: 'LangGraph',      level: 9, x: 150, y: 110 },
  { name: 'Python',         level: 9, x: 420, y: 70  },
  { name: 'FastAPI',        level: 8, x: 700, y: 130 },
  { name: 'LangChain',      level: 8, x: 260, y: 260 },
  { name: 'SQL',            level: 8, x: 470, y: 340 },
  { name: 'Ollama',         level: 8, x: 800, y: 300 },
  { name: 'ChromaDB',       level: 7, x: 100, y: 380 },
  { name: 'Supabase',       level: 7, x: 630, y: 260 },
  { name: 'CrewAI',         level: 6, x: 350, y: 170 },
  { name: 'NumPy / Pandas', level: 8, x: 780, y: 60  },
];

if (skillsSvg && skillsWrap) {
  const W = 900, H = 460;

  // faint decorative mesh in the background (unlabeled, purely atmospheric)
  const bgNodes = [];
  const cols = 9, rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.32) continue;
      const x = 40 + c * ((W - 80) / (cols - 1)) + (Math.random() * 20 - 10);
      const y = 40 + r * ((H - 80) / (rows - 1)) + (Math.random() * 20 - 10);
      bgNodes.push({ x, y });
    }
  }
  const edgesSet = new Set();
  bgNodes.forEach((n, i) => {
    bgNodes
      .map((m, j) => ({ j, d: Math.hypot(n.x - m.x, n.y - m.y) }))
      .filter(o => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(o => edgesSet.add([i, o.j].sort((a, b) => a - b).join('-')));
  });
  edgesSet.forEach(key => {
    const [i, j] = key.split('-').map(Number);
    const n1 = bgNodes[i], n2 = bgNodes[j];
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', n1.x); line.setAttribute('y1', n1.y);
    line.setAttribute('x2', n2.x); line.setAttribute('y2', n2.y);
    line.setAttribute('stroke', 'rgba(140,150,200,0.18)');
    line.setAttribute('stroke-width', '1');
    skillsSvg.appendChild(line);
  });
  bgNodes.forEach(n => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r', 4);
    circle.setAttribute('fill', '#0d1220');
    circle.setAttribute('stroke', 'rgba(140,150,200,0.3)');
    circle.setAttribute('stroke-width', '1');
    skillsSvg.appendChild(circle);
  });

  // connect the real skill nodes lightly to their nearest neighbours too
  SKILLS.forEach((n, i) => {
    SKILLS
      .map((m, j) => ({ j, d: Math.hypot(n.x - m.x, n.y - m.y) }))
      .filter(o => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(o => {
        const m = SKILLS[o.j];
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', n.x); line.setAttribute('y1', n.y);
        line.setAttribute('x2', m.x); line.setAttribute('y2', m.y);
        line.setAttribute('stroke', 'rgba(124,108,240,0.28)');
        line.setAttribute('stroke-width', '1.3');
        skillsSvg.appendChild(line);
      });
  });

  // one floating card, repositioned per active skill (keeps the DOM light)
  const card = document.createElement('div');
  card.className = 'skill-float-card';
  card.innerHTML = `
    <span class="fact-label" data-role="name"></span>
    <div class="sf-bar"><i data-role="bar"></i></div>
    <span class="sf-level" data-role="level"></span>
  `;
  skillsWrap.appendChild(card);
  const cardName = card.querySelector('[data-role="name"]');
  const cardBar = card.querySelector('[data-role="bar"]');
  const cardLevel = card.querySelector('[data-role="level"]');

  const nodeEls = [];

  function showSkill(i) {
    const s = SKILLS[i];
    cardName.textContent = `Skill : ${s.name}`;
    cardBar.style.width = `${s.level * 10}%`;
    cardLevel.textContent = `Level : ${s.level}`;

    let leftPct = (s.x / W) * 100;
    let topPct = (s.y / H) * 100;
    // keep the card inside the wrap on narrow / edge positions
    leftPct = Math.min(Math.max(leftPct, 14), 78);
    card.style.left = `${leftPct}%`;
    card.style.top = topPct > 55 ? 'auto' : `${Math.min(topPct + 6, 78)}%`;
    card.style.bottom = topPct > 55 ? `${Math.min(100 - topPct + 6, 78)}%` : 'auto';
    card.classList.add('visible');

    nodeEls.forEach((el, j) => el.classList.toggle('active', j === i));
    legendBtns.forEach((btn, j) => btn.classList.toggle('active', j === i));
  }

  function hideSkill() {
    card.classList.remove('visible');
    nodeEls.forEach(el => el.classList.remove('active'));
    legendBtns.forEach(btn => btn.classList.remove('active'));
  }

  SKILLS.forEach((s, i) => {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'skill-node');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${s.name}, level ${s.level} of 10`);

    const hit = document.createElementNS(svgNS, 'circle');
    hit.setAttribute('class', 'hit');
    hit.setAttribute('cx', s.x); hit.setAttribute('cy', s.y); hit.setAttribute('r', 20);
    g.appendChild(hit);

    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('class', 'node-dot');
    dot.setAttribute('cx', s.x); dot.setAttribute('cy', s.y); dot.setAttribute('r', 8);
    dot.setAttribute('fill', '#12182b');
    dot.setAttribute('stroke', '#7c6cf0');
    dot.setAttribute('stroke-width', '1.8');
    g.appendChild(dot);

    g.addEventListener('mouseenter', () => showSkill(i));
    g.addEventListener('focus', () => showSkill(i));
    g.addEventListener('click', () => showSkill(i));
    g.addEventListener('mouseleave', hideSkill);
    g.addEventListener('blur', hideSkill);

    skillsSvg.appendChild(g);
    nodeEls.push(g);
  });

  // legend chips — same data, cross-highlight the matching node on hover/click
  const legendBtns = SKILLS.map((s, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = s.name;
    btn.addEventListener('mouseenter', () => showSkill(i));
    btn.addEventListener('focus', () => showSkill(i));
    btn.addEventListener('click', () => showSkill(i));
    btn.addEventListener('mouseleave', hideSkill);
    btn.addEventListener('blur', hideSkill);
    skillsLegend.appendChild(btn);
    return btn;
  });
}

// ---------- About: typewriter response ----------
const aboutResponseEl = document.getElementById('aboutResponse');
const ABOUT_TEXT = `Ashwin Kumar B is an aspiring AI Engineer specializing in Generative AI, Agentic AI, and LLM application development. He builds RAG pipelines, multi-agent LangGraph workflows, and MCP-based automation using LangChain, LangGraph, and Ollama-hosted LLMs, backed by solid FastAPI and REST API engineering. Alongside his studies, he runs Capo Clicks, a photography and custom-framing business, and has built agentic automation that runs its real order and payment operations.`;

if (aboutResponseEl) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    aboutResponseEl.textContent = ABOUT_TEXT;
  } else {
    let i = 0;
    function typeAbout() {
      if (i <= ABOUT_TEXT.length) {
        aboutResponseEl.textContent = ABOUT_TEXT.slice(0, i);
        i += 2;
        requestAnimationFrame(() => setTimeout(typeAbout, 12));
      }
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeAbout();
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(aboutResponseEl);
  }
}

// ---------- Ask my bot ----------
// Point this at your deployed chat backend (see /server/server.js for a
// ready-to-deploy Node/Express endpoint that calls the Claude API).
const CHAT_ENDPOINT = 'https://ashwin-s-portfolio-production.up.railway.app/api/chat';

const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendMessage(text) {
  addMessage(text, 'user');
  chatInput.value = '';

  const typing = document.createElement('div');
  typing.className = 'msg bot';
  typing.textContent = '...';
  chatLog.appendChild(typing);
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    typing.remove();
    addMessage(data.reply || "Sorry, I didn't get a response.", 'bot');
  } catch (err) {
    typing.remove();
    addMessage(
      "Couldn't reach the chat backend. Make sure /api/chat is deployed (see server/server.js).",
      'error'
    );
    console.error(err);
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (text) sendMessage(text);
});

document.querySelectorAll('.suggestion').forEach(btn => {
  const q = btn.querySelector('.suggestion-q');
  btn.addEventListener('click', () => sendMessage((q ? q.textContent : btn.textContent).trim()));
});

// ---------- Certificates: connected cascade line ----------
const certsCascade = document.getElementById('certsCascade');
const certsConnector = document.getElementById('certsConnector');

function drawCertsConnector() {
  if (!certsCascade || !certsConnector) return;
  const cards = Array.from(certsCascade.querySelectorAll('.cert-card'));
  if (!cards.length) return;

  const wrapRect = certsCascade.getBoundingClientRect();
  certsConnector.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);

  const points = cards.map(card => {
    const r = card.getBoundingClientRect();
    return {
      x: r.left - wrapRect.left + r.width / 2,
      y: r.top - wrapRect.top - 10,
    };
  });

  while (certsConnector.firstChild) certsConnector.removeChild(certsConnector.firstChild);

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'url(#certsGrad)');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-dasharray', '6 6');
  path.setAttribute('stroke-linecap', 'round');

  const defs = document.createElementNS(svgNS, 'defs');
  const grad = document.createElementNS(svgNS, 'linearGradient');
  grad.setAttribute('id', 'certsGrad');
  grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0');
  const stop1 = document.createElementNS(svgNS, 'stop');
  stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', '#7c6cf0');
  const stop2 = document.createElementNS(svgNS, 'stop');
  stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', '#4dd0e1');
  grad.appendChild(stop1); grad.appendChild(stop2);
  defs.appendChild(grad);

  certsConnector.appendChild(defs);
  certsConnector.appendChild(path);

  points.forEach(p => {
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('r', 4);
    dot.setAttribute('fill', '#0a0e17');
    dot.setAttribute('stroke', 'url(#certsGrad)');
    dot.setAttribute('stroke-width', '2');
    certsConnector.appendChild(dot);
  });
}

if (certsCascade) {
  window.addEventListener('load', drawCertsConnector);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawCertsConnector, 150);
  });
  // images loading after layout can shift card heights — redraw once each loads
  certsCascade.querySelectorAll('img').forEach(img => {
    if (img.complete) return;
    img.addEventListener('load', drawCertsConnector);
  });
}
// Contact section interactivity
document.querySelectorAll('.contact-purpose-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.contact-purpose-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

const contactCopyBtn = document.getElementById('contactCopyBtn');
if (contactCopyBtn) {
  contactCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('ashwinkbd3@gmail.com');
    contactCopyBtn.textContent = '✓ Copied';
    setTimeout(() => { contactCopyBtn.textContent = '⧉ Copy Email'; }, 1500);
  });
}

const contactSendBtn = document.getElementById('contactSendBtn');
if (contactSendBtn) {
  contactSendBtn.addEventListener('click', () => {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const msg = document.getElementById('contactMessage').value;
    const purpose = document.querySelector('.contact-purpose-pill.active')?.textContent.trim() || 'General Inquiry';
    const subject = encodeURIComponent(`Portfolio Contact — ${purpose} — from ${name || 'Website Visitor'}`);
    const body = encodeURIComponent(`${msg}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:ashwinkbd3@gmail.com?subject=${subject}&body=${body}`;
  });
}
