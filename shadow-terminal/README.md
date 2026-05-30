# 🖤 Shadow Terminal

> *"Dari kegelapan, aku bergerak. Dari bayangan, aku bertindak."*

AI Terminal berbasis web dengan tampilan cyberpunk hitam-hijau.
Dibuat untuk lomba — deploy ready di Railway / Render / Cloud Run.

---

## ✨ Features

- 🤖 **AI Chat** — Tanya apa saja, Shadow menjawab
- 🔑 **Multi Provider** — OpenRouter, Anthropic, Gemini, OpenAI
- 💾 **Config Tersimpan** — API key tidak hilang walau reload
- 🖥️ **Terminal UI** — Tampilan hacker hitam + teks hijau
- ⚡ **Boot Animation** — Animasi startup keren
- 🧠 **Auto Memory** — Ingat konteks percakapan
- 🌐 **Deploy Ready** — Railway, Render, Cloud Run

---

## 🚀 Cara Pakai Lokal (Termux / PC)

```bash
pip install flask
python server.py
```

Buka browser: `http://localhost:8080`

---

## ☁️ Deploy ke Railway

1. Upload folder ini ke GitHub
2. Buka [railway.app](https://railway.app)
3. **New Project** → **Deploy from GitHub**
4. Pilih repo → otomatis deploy
5. Dapat URL permanen 🎉

## ☁️ Deploy ke Render

1. Upload folder ini ke GitHub
2. Buka [render.com](https://render.com)
3. **New** → **Web Service** → pilih repo
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python server.py`

---

## 🔑 Perintah Terminal

| Perintah | Fungsi |
|----------|--------|
| `/help`   | Tampilkan bantuan |
| `/clear`  | Bersihkan layar |
| `/reset`  | Hapus memori chat |
| `/config` | Atur API key & model |
| `/memory` | Lihat jumlah memori |

---

## 🛠️ Tech Stack

- **Backend** — Python + Flask
- **Frontend** — HTML, CSS, Vanilla JS
- **AI** — OpenRouter / Anthropic / Gemini / OpenAI
- **Tunnel** — Cloudflare Tunnel (opsional)

---

## 📁 Struktur Project

```
shadow-terminal/
├── server.py          ← Flask server
├── requirements.txt   ← Dependencies
├── Procfile           ← Railway config
├── railway.json       ← Railway config
├── render.yaml        ← Render config
├── index.html         ← Halaman utama
├── style.css          ← Styling terminal
├── script.js          ← Logic AI & chat
├── assets/            ← Aset tambahan
└── README.md
```

---

*Shadow Terminal — by AI | Built for competition*
