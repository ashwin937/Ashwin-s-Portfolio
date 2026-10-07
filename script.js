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
// Fully offline: no LLM, no backend, no API key. Every answer below is
// written by hand from Ashwin's resume. To change what the bot says, edit
// the KB list. Each entry has:
//   keys   → words/phrases that trigger it (matched on word boundaries)
//   answer → the reply (basic HTML like <a> is allowed here, it's your own text)
// Anything that doesn't match falls through to FALLBACK_REPLY.

const EMAIL = 'ashwinkbd3@gmail.com';
const PHONE = '+91 93425 77533';
const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

const FALLBACK_REPLY =
  `I can only answer questions about Ashwin's background, skills, projects, ` +
  `certifications and job-related queries. For anything else, you can contact ` +
  `the owner directly at ${mail} or ${PHONE}.`;

const KB = [
  {
    id: 'greeting',
    keys: ['hi', 'hello', 'hey', 'hola', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    answer: `Hi there! I can tell you about Ashwin's skills, projects, education, experience, certifications, or how to contact him. What would you like to know?`,
  },
  {
    id: 'thanks',
    keys: ['thanks', 'thank you', 'thx', 'ty', 'bye', 'goodbye'],
    answer: `You're welcome! If you'd like to talk to Ashwin directly, reach him at ${mail}.`,
  },
  {
    id: 'who',
    keys: ['who is ashwin', 'who are you', 'about ashwin', 'about him', 'introduce', 'introduction', 'tell me about ashwin', 'tell me about him', 'what does he do', 'what do you do', 'summary', 'overview', 'profile', 'background'],
    answer: `Ashwin Kumar B is an aspiring AI Engineer specializing in Generative AI, Agentic AI and LLM application development. He builds RAG pipelines, multi-agent LangGraph workflows and MCP-based automation using LangChain, LangGraph and Ollama-hosted LLMs, backed by FastAPI and REST API engineering. He also runs Capo Clicks, a photography and custom-framing business.`,
  },
  {
    id: 'education',
    keys: ['education', 'educational', 'college', 'university', 'degree', 'b.tech', 'btech', 'cgpa', 'gpa', 'graduate', 'graduation', 'graduating', 'study', 'studies', 'studying', 'qualification', 'school', 'marks', 'percentage', 'academic'],
    answer: `Ashwin is pursuing a B.Tech in Artificial Intelligence & Data Science at Sri Shakthi Institute of Engineering and Technology, Coimbatore (CGPA 7.19, graduating 2027). He completed Higher Secondary (Bio-Maths) in 2023 with 75.88% in 12th and 100% in 10th.`,
  },
  {
    id: 'experience',
    keys: ['experience', 'intern', 'internship', 'ether infotech', 'ether', 'work experience', 'worked', 'work history', 'employment', 'job history', 'professional'],
    answer: `Ashwin was a Machine Learning Intern at Ether Infotech, Coimbatore (Sep to Nov 2025). He preprocessed and cleaned datasets using Python, SQL and Excel, built and trained ML models for prediction and classification, engineered features, evaluated model performance, and visualized insights with Power BI and Tableau.`,
  },
  {
    id: 'strongest',
    keys: ['strongest', 'best skill', 'top skill', 'main skill', 'core skill', 'expertise', 'expert', 'specialize', 'specialise', 'specialty', 'good at', 'strength', 'strengths', 'speciality'],
    answer: `Ashwin's strongest areas are Agentic AI and LLM application development: LangGraph multi-agent workflows, RAG pipelines and Python/FastAPI backends. LangGraph and Python are the skills he rates highest, followed by FastAPI, LangChain, SQL and Ollama.`,
  },
  {
    id: 'skills',
    keys: ['skill', 'skills', 'tech stack', 'stack', 'technologies', 'technology', 'tools', 'tech', 'proficient', 'proficiency'],
    answer: `Ashwin's skills in brief:<br>
• Languages: Python, SQL<br>
• Gen AI & LLMs: LangChain, LangGraph, CrewAI, LlamaIndex, Ollama, LLM APIs, RAG<br>
• Backend: FastAPI, Supabase (backend/webhooks)<br>
• ML & DL: Supervised/Unsupervised Learning, NumPy, Pandas, ANN, CNN, RNN<br>
• Databases: MySQL, PostgreSQL, SQLite, ChromaDB<br>
• Prompting: few-shot and zero-shot`,
  },
  {
    id: 'languages',
    keys: ['programming language', 'languages', 'language', 'python'],
    answer: `Ashwin works primarily in Python and SQL. Python powers all his AI, RAG and FastAPI projects, and SQL is backed by an Advanced HackerRank certification.`,
  },
  {
    id: 'genai',
    keys: ['generative ai', 'gen ai', 'genai', 'llm', 'llms', 'langchain', 'langgraph', 'crewai', 'llamaindex', 'ollama', 'rag', 'agentic', 'agent', 'agents', 'multi-agent', 'mcp', 'prompt', 'prompting', 'prompt engineering', 'retrieval'],
    answer: `Gen AI is Ashwin's main focus. He has built RAG pipelines, multi-agent LangGraph workflows and MCP-based automation using LangChain, LangGraph and Ollama-hosted models (Mistral 7B, Qwen3:4B). He also knows CrewAI and LlamaIndex, uses few-shot and zero-shot prompting, and validates AI outputs for retrieval accuracy and hallucination.`,
  },
  {
    id: 'ml',
    keys: ['machine learning', 'ml', 'deep learning', 'dl', 'neural', 'ann', 'cnn', 'rnn', 'numpy', 'pandas', 'model training', 'supervised', 'unsupervised', 'data science', 'power bi', 'tableau', 'data visualization', 'data annotation'],
    answer: `On the ML side, Ashwin knows supervised and unsupervised learning, model evaluation, NumPy, Pandas and data annotation, plus deep learning fundamentals (ANN, CNN, RNN). At Ether Infotech he trained prediction and classification models and visualized results with Power BI and Tableau.`,
  },
  {
    id: 'backend',
    keys: ['backend', 'back-end', 'fastapi', 'api', 'apis', 'rest', 'oauth', 'webhook', 'webhooks', 'supabase', 'api testing', 'testing', 'server'],
    answer: `Ashwin builds backends with Python and FastAPI: REST API design, OAuth 2.0 integration (Gmail, LinkedIn), webhook-driven automation with Supabase, rate limiting and health-monitoring endpoints. He also does end-to-end API testing covering authentication flows, response formats and error handling.`,
  },
  {
    id: 'databases',
    keys: ['database', 'databases', 'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'chromadb', 'chroma', 'vector db', 'vector database', 'vector'],
    answer: `Ashwin works with MySQL, PostgreSQL and SQLite for relational data, and ChromaDB as a vector database for RAG. He also holds the HackerRank SQL (Advanced) certification.`,
  },
  {
    id: 'projects',
    keys: ['projects', 'project', 'portfolio', 'work samples', 'github projects', 'what has he built', 'what did he build', 'what has he made', 'what has he created'],
    answer: `Ashwin's key projects:<br>
• AutoResearch AI: multi-agent research pipeline (final-year project)<br>
• Zenith AI: fully local RAG chatbot<br>
• Custom AI Agent Builder: no-code agentic automation platform<br>
• Capo Clicks Agentic Ops Suite: real order/payment automation<br>
• Capo Clicks Website: Next.js e-commerce site<br>
• Agent Governance-as-Code<br>
• Resume Analyzer<br>
• AI News Digest<br>
Ask me about any of them by name, or see the Projects section above.`,
  },
  {
    id: 'autoresearch',
    keys: ['autoresearch', 'auto research', 'research ai', 'final year project', 'final-year project', 'tavily'],
    answer: `AutoResearch AI is Ashwin's final-year project: a multi-agent LangGraph pipeline using Ollama (qwen3:4b) and Tavily search to autonomously research a topic end-to-end.`,
  },
  {
    id: 'zenith',
    keys: ['zenith', 'local rag', 'rag chatbot', 'offline chatbot', 'mistral'],
    answer: `Zenith AI is a fully local, privacy-preserving RAG chatbot built with FastAPI, LangGraph, ChromaDB and Mistral 7B via Ollama. It answers questions offline across PDF, TXT, CSV and DOCX files using a LangGraph workflow (sanitize, retrieve, generate, format). Ashwin also validated retrieval accuracy and hallucination, and tested the /chat, /upload and /documents endpoints.`,
  },
  {
    id: 'agentbuilder',
    keys: ['agent builder', 'custom ai agent', 'custom agent', 'no-code', 'no code', 'nocode', 'gradio', 'qwen', 'qwen3', 'hackathon', 'infynd', 'aim26', "aim'26", 'aim 26'],
    answer: `Custom AI Agent Builder is a no-code agentic automation platform for non-technical users, built with Gradio, Qwen3:4B (Ollama), LangChain, a ChromaDB RAG pipeline and SQLite long-term memory. It integrates Gmail and LinkedIn (OAuth 2.0), Instagram (custom MCP server) and GitHub (PAT). It was built for the InFynd AIM'26 hackathon.`,
  },
  {
    id: 'opssuite',
    keys: ['ops suite', 'operations suite', 'agentic ops', 'capo clicks ops', 'capo clicks agentic', 'business automation', 'order automation', 'payment automation', 'twilio', 'resend', 'whatsapp alerts', 'render', 'capoclicksagent'],
    answer: `The Capo Clicks Agentic Ops Suite is a multi-agent LangGraph + FastAPI system that automates real order and payment workflows through Supabase webhooks, with Twilio WhatsApp and Resend alerts. It is deployed on Render and serves a live e-commerce business, automating the order lifecycle from webhook event to customer/admin notification.`,
  },
  {
    id: 'capowebsite',
    keys: ['capo clicks website', 'capo website', 'e-commerce', 'ecommerce', 'next.js', 'nextjs', 'vercel', 'razorpay', 'seo', 'telegram'],
    answer: `The Capo Clicks website is a Next.js e-commerce site on Vercel with Supabase and Razorpay payments, custom SEO (JSON-LD and a dynamic sitemap), and a Telegram bot for automated database backups. You can visit it at <a href="https://capoclicks.vercel.app/" target="_blank" rel="noopener">capoclicks.vercel.app</a>.`,
  },
  {
    id: 'governance',
    keys: ['governance', 'policy-as-code', 'policy as code', 'governance-as-code', 'drift', 'ci/cd', 'cicd', 'ci cd'],
    answer: `Agent Governance-as-Code is a two-repo system that version-controls AI agent policy alongside agent code, with CI/CD enforcement, drift detection against Git history and a read-only dashboard.`,
  },
  {
    id: 'resumeanalyzer',
    keys: ['resume analyzer', 'resume analyser', 'resume feedback', 'resume tool'],
    answer: `Resume Analyzer is a FastAPI + Ollama backend with a vanilla JS frontend that gives resume feedback. Ashwin is currently tuning it for local inference performance.`,
  },
  {
    id: 'newsdigest',
    keys: ['news digest', 'ai news', 'daily news', 'news summary', 'cron'],
    answer: `AI News Digest is a standalone service that sends a daily AI news summary straight to WhatsApp, running on a scheduled Render cron job.`,
  },
  {
    id: 'capoclicks',
    keys: ['capo clicks', 'capoclicks', 'capo', 'photography', 'framing', 'photographer', 'business', 'founder', 'startup', 'entrepreneur', 'own business', 'instagram'],
    answer: `Capo Clicks is the photography and custom-framing business Ashwin runs in Coimbatore. He built its website and an agentic automation suite that handles its real order and payment operations. You can follow it on <a href="https://instagram.com/_capo_clicks" target="_blank" rel="noopener">Instagram</a>.`,
  },
  {
    id: 'certs',
    keys: ['certification', 'certifications', 'certificate', 'certificates', 'certified', 'oracle', 'hackerrank', 'six sigma', 'lean six sigma', 'yellow belt', 'simplilearn', 'courses', 'course'],
    answer: `Ashwin's certifications:<br>
• Oracle Certified Foundations Associate (Agentic AI)<br>
• HackerRank SQL (Advanced)<br>
• HackerRank Problem Solving (Basic)<br>
• Lean Six Sigma Yellow Belt<br>
• Simplilearn Python for Beginners<br>
• InFynd AIM'26 Hackathon (Certificate of Participation)<br>
You can view them all in the Certificates section.`,
  },
  {
    id: 'resume',
    keys: ['resume', 'cv', 'curriculum vitae', 'download', 'resume pdf'],
    answer: `You can download Ashwin's CV with the "Download CV" button at the top of this page, or directly <a href="assets/Ashwin_Resume.pdf" download>here</a>.`,
  },
  {
    id: 'contact',
    keys: ['contact', 'reach', 'email', 'e-mail', 'mail', 'phone', 'call', 'number', 'mobile', 'whatsapp', 'get in touch', 'connect', 'message him', 'talk to him', 'speak'],
    answer: `You can reach Ashwin at ${mail} or ${PHONE}. You can also use the contact form at the bottom of this page.`,
  },
  {
    id: 'links',
    keys: ['github', 'linkedin', 'leetcode', 'social', 'profiles', 'links', 'repo', 'repos', 'repository'],
    answer: `Find Ashwin online:<br>
• <a href="https://github.com/ashwin937" target="_blank" rel="noopener">GitHub</a><br>
• <a href="https://www.linkedin.com/in/ashwin-kumar-639675293/" target="_blank" rel="noopener">LinkedIn</a><br>
• <a href="https://leetcode.com/u/Ashwinkumar03/" target="_blank" rel="noopener">LeetCode</a>`,
  },
  {
    id: 'location',
    keys: ['location', 'located', 'where does he live', 'where is he', 'where he lives', 'where are you', 'based', 'relocate', 'relocation', 'remote', 'onsite', 'on-site', 'hybrid'],
    answer: `Ashwin is based in Coimbatore, Tamil Nadu, India. For questions about relocation or remote/hybrid work, please contact him directly at ${mail}.`,
  },
  {
    id: 'hiring',
    keys: ['hire', 'hiring', 'available', 'availability', 'open to', 'opening', 'openings', 'job', 'jobs', 'role', 'roles', 'position', 'opportunity', 'opportunities', 'full-time', 'full time', 'fulltime', 'looking for', 'seeking', 'recruit', 'recruiter', 'join', 'collaborate', 'collaboration', 'freelance', 'work with'],
    answer: `Ashwin is actively seeking AI/LLM engineering internships and full-time roles, and he is open to project collaborations. His areas of interest are AI Engineer, Generative AI, Machine Learning and Software Development Engineer (SDE) roles. Reach him at ${mail}.`,
  },
  {
    id: 'compensation',
    keys: ['salary', 'ctc', 'compensation', 'expected salary', 'notice period', 'joining date', 'when can he join', 'stipend'],
    answer: `Questions about salary, stipend, notice period or joining date are best discussed with Ashwin directly. Please contact him at ${mail} or ${PHONE}.`,
  },
  {
    id: 'interests',
    keys: ['interest', 'interests', 'areas of interest', 'passion', 'passionate', 'goal', 'goals', 'career', 'aspire', 'aspiration', 'future', 'looking to become'],
    answer: `Ashwin's areas of interest are AI Engineering, Generative AI, Machine Learning and Software Development (SDE). His goal is to grow as an AI Engineer building production-grade agentic and LLM-powered systems.`,
  },
  {
    id: 'validation',
    keys: ['hallucination', 'validation', 'validate', 'accuracy', 'quality', 'reliability', 'production', 'debugging', 'debug'],
    answer: `Ashwin validates AI system outputs for retrieval accuracy and hallucination, tests API integrations end-to-end (authentication, response formats, error handling) and debugs agentic workflows for production reliability. He applied this in Zenith AI and the Custom AI Agent Builder.`,
  },
  {
    id: 'age',
    keys: ['age', 'how old', 'birthday', 'birth', 'dob', 'married', 'single', 'gender', 'religion', 'family', 'parents'],
    answer: `I only share professional details from Ashwin's resume. For anything personal, please contact the owner at ${mail}.`,
  },
];

// ---- matcher ----
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');

// Precompile each keyword into a regex once. Short keywords (<=3 chars) must
// match a whole word; longer ones also match plurals/suffixes (e.g. "project" → "projects").
KB.forEach(entry => {
  entry.res = entry.keys.map(k => {
    const body = escapeRe(k.toLowerCase());
    const re = k.length <= 3 ? new RegExp(`(^|[^a-z0-9])${body}($|[^a-z0-9])`) : new RegExp(`(^|[^a-z0-9])${body}`);
    return { re, weight: k.includes(' ') || k.length > 7 ? 2 : 1 };
  });
});

function getReply(text) {
  const q = ` ${text.toLowerCase().trim()} `;
  let best = null, bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const { re, weight } of entry.res) if (re.test(q)) score += weight;
    if (score > 0 && score >= bestScore) { best = entry; bestScore = score; } // ties go to the later (more specific) entry
  }
  if (!best) return FALLBACK_REPLY;

  // Generic requests aimed at the bot itself ("write me a poem", "build me a
  // website", "solve this") are off-topic even if they mention a skill word.
  const mentionsAshwin = /\b(ashwin|he|his|him|capo|zenith)\b/.test(q);
  const asksBotToDoSomething = /\b(write|generate|build|make|create|draft|translate|solve|calculate|explain|teach|debug|fix|joke|poem|story|essay|recipe|weather|stock|lyrics)\b/.test(q);
  if (asksBotToDoSomething && !mentionsAshwin) return FALLBACK_REPLY;

  // A bare greeting only counts if the message is basically just a greeting.
  if (best.id === 'greeting' && text.trim().split(/\s+/).length > 4) return FALLBACK_REPLY;
  if (best.id === 'thanks' && text.trim().split(/\s+/).length > 4) return FALLBACK_REPLY;
  return best.answer;
}

// ---- chat UI ----
const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

function addMessage(content, role, isHtml = false) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if (isHtml) div.innerHTML = content;   // bot answers only (hard-coded above)
  else div.textContent = content;        // anything a visitor types stays plain text
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

let botBusy = false;
function sendMessage(text) {
  if (botBusy) return;
  botBusy = true;
  addMessage(text, 'user');
  chatInput.value = '';

  const typing = addMessage('...', 'bot');
  setTimeout(() => {
    typing.remove();
    addMessage(getReply(text), 'bot', true);
    botBusy = false;
  }, 450);
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
