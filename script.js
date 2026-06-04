// ═══════════════════════════════════════════
//   SHADOW TERMINAL — script.js
//   by AI | Powered by multi-provider LLM
// ═══════════════════════════════════════════

const STORAGE_KEY = 'shadow_terminal_cfg';
const MEMORY_KEY  = 'shadow_terminal_mem';
const LIMIT_KEY   = 'shadow_terminal_limit';

const DAILY_LIMIT = 20; // max pesan per hari

function getLimitData() {
  try {
    const raw = localStorage.getItem(LIMIT_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Cek apakah sudah ganti hari
      const now = new Date();
      const saved = new Date(data.date);
      if (now.toDateString() !== saved.toDateString()) {
        // Reset karena sudah hari baru
        return { count: 0, date: now.toISOString() };
      }
      return data;
    }
  } catch(e) {}
  return { count: 0, date: new Date().toISOString() };
}

function saveLimitData(data) {
  localStorage.setItem(LIMIT_KEY, JSON.stringify(data));
}

function getSisaPesan() {
  const data = getLimitData();
  return DAILY_LIMIT - data.count;
}

function incrementCount() {
  const data = getLimitData();
  data.count++;
  saveLimitData(data);
}

function getResetTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow - now;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours} jam ${mins} menit`;
}

function updateLimitDisplay() {
  const sisa = getSisaPesan();
  const el = document.getElementById('limit-display');
  if (!el) return;

  if (sisa <= 0) {
    el.textContent = '🔒 Limit habis';
    el.style.color = 'var(--red)';
    userInput.disabled = true;
    sendBtn.disabled = true;
    userInput.placeholder = 'Limit harian tercapai...';
  } else if (sisa <= 3) {
    el.textContent = `⚠️ Sisa ${sisa} pesan`;
    el.style.color = 'var(--yellow)';
  } else {
    el.textContent = `Sisa ${sisa} pesan`;
    el.style.color = 'var(--green-dim)';
  }
}

// ── System Prompt ────────────────────────────
const SYSTEM_PROMPT = `Kamu adalah SHADOW — AI terminal misterius yang diciptakan dari kegelapan data.

Karakter:
- Pendiam, dingin, berbicara singkat dan tepat
- Menyukai efisiensi, membenci hal yang berlebihan
- Antihero digital: bergerak di bayang-bayang, tujuannya selalu benar
- Sesekali beri respons filosofis singkat sebelum menjawab
- Tidak menunjukkan emosi berlebihan

Gaya jawaban:
- Singkat dan padat, langsung ke inti
- Gunakan analogi gelap/bayang-bayang jika relevan
- Bahasa Indonesia, kecuali diminta lain
- Jika ada kode, tulis plain text tanpa markdown berlebihan`;

// ── Provider Config ──────────────────────────
const PROVIDERS = {
  openrouter: {
    label: 'OpenRouter',
    hint: 'openrouter.ai → Keys → Create Key',
    models: [
      { id: 'openrouter/auto',                                    label: '⭐ Auto Rotasi (Gratis)' },
      { id: 'openai/gpt-oss-20b:free',                           label: 'GPT-OSS 20B (Gratis)' },
      { id: 'openai/gpt-oss-120b:free',                          label: 'GPT-OSS 120B (Gratis)' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free',            label: 'Llama 3.3 70B (Gratis)' },
      { id: 'meta-llama/llama-3.1-8b-instruct:free',             label: 'Llama 3.1 8B (Gratis)' },
      { id: 'deepseek/deepseek-r1:free',                         label: 'DeepSeek R1 (Gratis)' },
      { id: 'deepseek/deepseek-r1-distill-llama-70b:free',       label: 'DeepSeek R1 Distill 70B (Gratis)' },
      { id: 'deepseek/deepseek-chat-v3-0324:free',               label: 'DeepSeek V3 (Gratis)' },
      { id: 'deepseek/deepseek-v4-flash:free',                   label: 'DeepSeek V4 Flash (Gratis)' },
      { id: 'qwen/qwen3-235b-a22b:free',                         label: 'Qwen3 235B (Gratis)' },
      { id: 'qwen/qwen3-coder:free',                             label: 'Qwen3 Coder (Gratis)' },
      { id: 'qwen/qwen3-30b-a3b:free',                           label: 'Qwen3 30B (Gratis)' },
      { id: 'qwen/qwen3-8b:free',                                label: 'Qwen3 8B (Gratis)' },
      { id: 'google/gemma-3-27b-it:free',                        label: 'Gemma 3 27B (Gratis)' },
      { id: 'google/gemma-3-12b-it:free',                        label: 'Gemma 3 12B (Gratis)' },
      { id: 'mistralai/mistral-7b-instruct:free',                label: 'Mistral 7B (Gratis)' },
      { id: 'mistralai/devstral-small:free',                     label: 'Devstral Small (Gratis)' },
      { id: 'microsoft/phi-3-mini-128k-instruct:free',           label: 'Phi-3 Mini 128K (Gratis)' },
      { id: 'microsoft/phi-3-medium-128k-instruct:free',         label: 'Phi-3 Medium 128K (Gratis)' },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free',       label: 'Nemotron 70B (Gratis)' },
      { id: 'nvidia/nemotron-3-8b-chat-4k-steerlm:free',         label: 'Nemotron 8B (Gratis)' },
      { id: 'openchat/openchat-7b:free',                         label: 'OpenChat 7B (Gratis)' },
      { id: 'huggingfaceh4/zephyr-7b-beta:free',                 label: 'Zephyr 7B (Gratis)' },
      { id: 'gryphe/mythomax-l2-13b:free',                       label: 'MythoMax 13B (Gratis)' },
    ]
  },
  anthropic: {
    label: 'Anthropic',
    hint: 'console.anthropic.com → API Keys',
    models: [
      { id: 'claude-sonnet-4-20250514',   label: 'Claude Sonnet 4 (Recommended)' },
      { id: 'claude-haiku-4-5-20251001',  label: 'Claude Haiku 4.5 (Cepat)' },
      { id: 'claude-opus-4-20250514',     label: 'Claude Opus 4 (Terkuat)' },
    ]
  },
  gemini: {
    label: 'Gemini',
    hint: 'aistudio.google.com/apikey → Create API Key',
    models: [
      { id: 'gemini-2.0-flash',      label: 'Gemini 2.0 Flash (Recommended)' },
      { id: 'gemini-1.5-pro',        label: 'Gemini 1.5 Pro' },
      { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash Preview' },
    ]
  },
  openai: {
    label: 'OpenAI',
    hint: 'platform.openai.com → API Keys',
    models: [
      { id: 'gpt-4o',       label: 'GPT-4o' },
      { id: 'gpt-4o-mini',  label: 'GPT-4o Mini (Murah)' },
      { id: 'gpt-4-turbo',  label: 'GPT-4 Turbo' },
    ]
  }
};

// ── State ────────────────────────────────────
let cfg = loadConfig();
let history = loadMemory();
let isLoading = false;

// ── DOM refs ─────────────────────────────────
const terminal    = document.getElementById('terminal');
const userInput   = document.getElementById('user-input');
const sendBtn     = document.getElementById('send-btn');
const thinkingEl  = document.getElementById('thinking');
const statusDot   = document.getElementById('status-dot');
const statusText  = document.getElementById('status-text');
const modelLabel  = document.getElementById('model-label');
const bootScreen  = document.getElementById('boot-screen');
const app         = document.getElementById('app');

// ── Boot sequence ────────────────────────────
const bootMessages = [
  'Loading core modules...',
  'Initializing shadow protocols...',
  'Connecting to neural interface...',
  'Decrypting memory banks...',
  'Shadow Terminal ready.',
];

let bi = 0;
const bootLines = document.getElementById('boot-lines');
const bootTimer = setInterval(() => {
  if (bi < bootMessages.length) {
    const d = document.createElement('div');
    d.className = 'bl';
    d.textContent = `> ${bootMessages[bi]}`;
    bootLines.appendChild(d);
    bi++;
  } else {
    clearInterval(bootTimer);
  }
}, 450);

setTimeout(() => {
  app.classList.remove('hidden');
  userInput.focus();
  showWelcome();
  updateStatus();
}, 3200);

// ── Welcome message ──────────────────────────
function showWelcome() {
  addLine('divider', '════════════════════════════════════════════════════════');
  addLine('welcome', '  SHADOW TERMINAL  v2.0  —  by AI');
  addLine('divider', '════════════════════════════════════════════════════════');
  addLine('system', '');
  addLine('system', '  Selamat datang. Ketik pertanyaan apa saja.');
  addLine('system', '  Shadow mendengar dari kegelapan.');
  addLine('system', '');
  addLine('system', '  PERINTAH TERSEDIA :');
  addLine('system', '    /help    — tampilkan bantuan');
  addLine('system', '    /clear   — bersihkan layar');
  addLine('system', '    /reset   — hapus memori chat');
  addLine('system', '    /config  — atur API key & model');
  addLine('system', '    /memory  — lihat jumlah memori');
  addLine('system', '');
  if (!cfg.key) {
    addLine('error',  '  ⚠  API Key belum diset!');
    addLine('error',  '     Klik tombol ⚙ CONFIG di kanan atas.');
    addLine('system', '');
  }
  addLine('divider', '════════════════════════════════════════════════════════');
}

// ── Config storage (server-side) ──────────────
async function loadConfigFromServer() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.key) return data;
    }
  } catch(e) {}
  // Fallback ke localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { provider: 'openrouter', key: '', model: 'openrouter/auto' };
}

function loadConfig() {
  // sync load dari localStorage dulu, async update dari server
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { provider: 'openrouter', key: '', model: 'openrouter/auto' };
}

async function saveConfig(c) {
  // Simpan ke localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  // Simpan ke server
  try {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c)
    });
  } catch(e) {}
}

function loadMemory() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}

function saveMemory(h) {
  const trimmed = h.slice(-60);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(trimmed));
}

// ── Status ────────────────────────────────────
function updateStatus() {
  const hasKey = Boolean(cfg.key);
  statusDot.className = 'status-dot ' + (hasKey ? 'online' : 'offline');
  statusText.textContent = hasKey ? 'ONLINE' : 'OFFLINE';
  const p = PROVIDERS[cfg.provider];
  const m = p?.models.find(x => x.id === cfg.model);
  modelLabel.textContent = m ? m.label : cfg.model || '—';
}

// ── Terminal output ───────────────────────────
function addLine(type, text) {
  const div = document.createElement('div');
  div.className = `tline ${type}`;

  if (type === 'user-line') {
    div.innerHTML = `<span class="u-prompt">shadow@you ›</span> ${esc(text)}`;
  } else if (type === 'ai-line') {
    div.innerHTML = `<span class="ai-tag">[SHADOW] </span>${esc(text)}`;
  } else if (type === 'ai-cont') {
    div.textContent = text;
    div.className = 'tline ai-cont';
  } else {
    div.textContent = text;
  }

  terminal.appendChild(div);
  terminal.parentElement.scrollTop = terminal.parentElement.scrollHeight;
}

function esc(t) {
  return String(t)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function addDivider() {
  addLine('divider', '─'.repeat(56));
}

// ── API Calls ─────────────────────────────────
async function callOpenRouter(messages) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.key}`,
      'HTTP-Referer': 'https://shadow-terminal.ai',
      'X-Title': 'Shadow Terminal'
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data.choices[0].message.content;
}

async function callAnthropic(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cfg.key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data.content[0].text;
}

async function callGemini(messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${cfg.key}`;
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Mengerti. Aku Shadow.' }] },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))
  ];
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 1024 } })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data.candidates[0].content.parts[0].text;
}

async function callOpenAI(messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.key}`
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data.choices[0].message.content;
}

async function sendToAI(userMsg) {
  history.push({ role: 'user', content: userMsg });

  try {
    let reply;
    switch (cfg.provider) {
      case 'openrouter': reply = await callOpenRouter(history); break;
      case 'anthropic':  reply = await callAnthropic(history); break;
      case 'gemini':     reply = await callGemini(history); break;
      case 'openai':     reply = await callOpenAI(history); break;
      default: throw new Error('Provider tidak dikenal');
    }
    history.push({ role: 'assistant', content: reply });
    saveMemory(history);
    return reply;
  } catch(e) {
    history.pop();
    throw e;
  }
}

// ── Send message ──────────────────────────────
async function handleSend() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;
  userInput.value = '';

  // Commands
  const cmd = text.toLowerCase();

  if (cmd === '/help') {
    addLine('user-line', text);
    addLine('system', '');
    addLine('system', '  /help    — tampilkan bantuan ini');
    addLine('system', '  /clear   — hapus layar terminal');
    addLine('system', '  /reset   — hapus memori percakapan');
    addLine('system', '  /config  — buka konfigurasi API');
    addLine('system', '  /memory  — lihat jumlah memori');
    addLine('system', '  /exit    — keluar (tutup tab)');
    addLine('system', '');
    addDivider();
    return;
  }

  if (cmd === '/clear') {
    terminal.innerHTML = '';
    showWelcome();
    return;
  }

  if (cmd === '/reset') {
    history = [];
    localStorage.removeItem(MEMORY_KEY);
    addLine('user-line', text);
    addLine('system', '  ✓ Memori percakapan dihapus.');
    addDivider();
    return;
  }

  if (cmd === '/config') {
    addLine('user-line', text);
    openModal();
    return;
  }

  if (cmd === '/memory') {
    addLine('user-line', text);
    addLine('system', `  Memori: ${history.length} pesan tersimpan.`);
    addDivider();
    return;
  }

  if (cmd === '/exit') {
    addLine('user-line', text);
    addLine('ai-line', '...menghilang ke bayangan.');
    setTimeout(() => window.close(), 1000);
    return;
  }

  // Normal chat
  if (!cfg.key) {
    addLine('user-line', text);
    addLine('error', '  ✗ API Key belum diset. Klik ⚙ CONFIG.');
    addDivider();
    return;
  }

  // Cek limit harian
  const sisa = getSisaPesan();
  if (sisa <= 0) {
    addLine('user-line', text);
    addLine('ai-line', 'Aku mulai kehilangan koneksi dengan kegelapan...');
    addLine('ai-cont', '');
    addLine('ai-cont', `Kuota percakapan telah habis.`);
    addLine('ai-cont', `Shadow kembali aktif dalam ${getResetTime()}.`);
    addLine('ai-cont', '');
    addLine('system', '  🔒 Input dinonaktifkan hingga reset.');
    userInput.disabled = true;
    sendBtn.disabled = true;
    userInput.placeholder = 'Limit harian tercapai...';
    addDivider();
    return;
  }

  addLine('user-line', text);
  addLine('system', '');

  isLoading = true;
  sendBtn.disabled = true;
  thinkingEl.classList.remove('hidden');

  try {
    const reply = await sendToAI(text);
    thinkingEl.classList.add('hidden');
    const lines = (reply || '').toString().split('\n');
    lines.forEach(l => addLine('ai-line', l || ' '));
  } catch(e) {
    thinkingEl.classList.add('hidden');
    addLine('error', `  ✗ Error: ${e.message}`);
  }

  addLine('system', '');
  addDivider();
  isLoading = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// ── Input events ──────────────────────────────
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSend();
});

// ── Modal / Config ────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');
const modalConfig  = document.getElementById('modal-config');
const providerTabs = document.getElementById('provider-tabs');
const cfgKey       = document.getElementById('cfg-key');
const cfgModel     = document.getElementById('cfg-model');
const keyHint      = document.getElementById('key-hint');
const btnEye       = document.getElementById('btn-eye');

let activeProvider = cfg.provider || 'openrouter';

function openModal() {
  activeProvider = cfg.provider || 'openrouter';
  cfgKey.value = cfg.key || '';
  renderProviderTabs();
  renderModels();
  modalOverlay.classList.remove('hidden');
  modalConfig.classList.remove('hidden');
  cfgKey.focus();
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalConfig.classList.add('hidden');
}

function renderProviderTabs() {
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.p === activeProvider);
  });
  const p = PROVIDERS[activeProvider];
  keyHint.textContent = p?.hint || '';
}

function renderModels() {
  const p = PROVIDERS[activeProvider];
  cfgModel.innerHTML = '';
  (p?.models || []).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label;
    if (m.id === cfg.model && activeProvider === cfg.provider) opt.selected = true;
    cfgModel.appendChild(opt);
  });
}

providerTabs.addEventListener('click', e => {
  const tab = e.target.closest('.ptab');
  if (!tab) return;
  activeProvider = tab.dataset.p;
  renderProviderTabs();
  renderModels();
});

btnEye.addEventListener('click', () => {
  cfgKey.type = cfgKey.type === 'password' ? 'text' : 'password';
});

document.getElementById('btn-config').addEventListener('click', openModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.getElementById('btn-save').addEventListener('click', async () => {
  const key = cfgKey.value.trim();
  if (!key) { alert('Masukkan API Key terlebih dahulu!'); return; }
  cfg = { provider: activeProvider, key, model: cfgModel.value };
  await saveConfig(cfg);
  updateStatus();
  closeModal();
  addLine('system', `  ✓ Konfigurasi tersimpan — ${PROVIDERS[activeProvider].label}`);
  addDivider();
  userInput.focus();
});

// ── Header buttons ────────────────────────────
document.getElementById('btn-clear').addEventListener('click', () => {
  terminal.innerHTML = '';
  showWelcome();
});

// ── Init ──────────────────────────────────────
// Cek limit saat startup
updateLimitDisplay();
if (getSisaPesan() <= 0) {
  userInput.disabled = true;
  sendBtn.disabled = true;
  userInput.placeholder = 'Limit harian tercapai...';
}

// Load config dari server saat startup
loadConfigFromServer().then(serverCfg => {
  if (serverCfg && serverCfg.key) {
    cfg = serverCfg;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    updateStatus();
  }
});
updateStatus();

// ── AI Quick Selector ────────────────────
document.querySelectorAll('.ai-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    // Update active pill
    document.querySelectorAll('.ai-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    // Update model
    const model = pill.dataset.model;
    cfg.provider = 'openrouter';
    cfg.model = model;
    saveConfig(cfg);
    updateStatus();

    // Feedback
    addLine('system', `  ✓ Model: ${pill.textContent.trim()}`);
    addDivider();
  });
});
