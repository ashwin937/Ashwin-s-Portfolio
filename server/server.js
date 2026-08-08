// Minimal backend for the "Ask my bot" widget.
// Keeps the API key server-side (never expose it in the plain HTML/JS frontend).
//
// Deploy this anywhere that runs Node (Render, Railway, Fly.io, a VPS, etc.)
// then point CHAT_ENDPOINT in script.js at this server's /api/chat URL.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.6-flash';

// Ground the bot in real facts about you so it doesn't hallucinate.
// Edit this freely as your projects/skills change.
const SYSTEM_PROMPT = `
You are the chat assistant embedded in Ashwin's personal portfolio site.
Answer questions about Ashwin in a friendly, concise way (2-4 sentences max
unless asked for detail). Only use the facts below — if something isn't
covered, say you're not sure and suggest the visitor use the contact form.

FACTS ABOUT ASHWIN:
- Ashwin Kumar B, B.Tech in AI & Data Science, Sri Shakthi Institute of
  Engineering and Technology, Coimbatore (CGPA 7.19, graduating 2027).
  Aspiring AI Engineer specializing in Generative AI, Agentic AI, and LLM
  application development.
- Machine Learning Intern at Ether Infotech (Sep-Nov 2025, Coimbatore) —
  data preprocessing, model training/evaluation, Power BI/Tableau visualization.
- Runs Capo Clicks, a photography and custom-framing business in Coimbatore.
- Core stack: Python, SQL, FastAPI, Supabase, LangChain, LangGraph, CrewAI,
  LlamaIndex, Ollama-hosted LLMs, RAG, prompt engineering, ChromaDB, MySQL/PostgreSQL/SQLite,
  plus ML/DL fundamentals (ANN, CNN, RNN, NumPy, Pandas).
- Key projects:
  - Zenith AI (Local RAG Chatbot): fully local, privacy-preserving RAG chatbot
    with FastAPI, LangGraph, ChromaDB, and Mistral 7B via Ollama; offline
    document Q&A across PDF/TXT/CSV/DOCX.
  - Custom AI Agent Builder: no-code agentic automation platform (Gradio,
    Qwen3:4B, ChromaDB RAG, SQLite memory), integrating Gmail/LinkedIn/Instagram/GitHub.
    Built for the InFynd AIM'26 hackathon.
  - Capo Clicks Agentic Ops Suite: LangGraph + FastAPI system running real
    order/payment automation for his business via Supabase webhooks, Twilio WhatsApp, Resend.
  - Capo Clicks Website: Next.js + Vercel + Supabase + Razorpay e-commerce site.
  - Agent Governance-as-Code: version-controls AI agent policy alongside code,
    with CI/CD enforcement and drift detection.
  - Resume Analyzer: FastAPI + Ollama resume feedback tool.
  - AI News Digest: daily WhatsApp AI news summary via a Render cron job.
- Certifications: Oracle Certified Foundations Associate (Agentic AI),
  HackerRank SQL (Advanced), HackerRank Problem Solving (Basic), Lean Six Sigma
  Yellow Belt, Simplilearn Python for Beginners.
- Contact: ashwinkbd3@gmail.com, +91 9342577533.
- GitHub: github.com/ashwin937 · LinkedIn: linkedin.com/in/ashwin-kumar-639675293
  · LeetCode: leetcode.com/u/Ashwinkumar03
`.trim();

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 600 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Chat server running on port ${PORT}`));
