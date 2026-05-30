# 🖥️ LogWatch — Real-Time Terminal Log Monitor

A hacker-themed, color-rich terminal tool to monitor multiple log files
live, filter by keyword or level, and export results to TXT or JSON.

```
 _                __        __    _       _     
| |    ___   __ _\ \      / /_ _| |_ ___| |__  
| |   / _ \ / _` |\ \ /\ / / _` | __/ __| '_ \ 
| |__| (_) | (_| | \ V  V / (_| | || (__| | | |
|_____\___/ \__, |  \_/\_/ \__,_|\__\___|_| |_|
            |___/                               
```

---

## 📁 Folder Structure

```
logwatch/
├── main.py              ← entry point (run this)
├── generate_logs.py     ← optional: generates fake live logs for testing
├── requirements.txt     ← Python dependencies
├── src/
│   ├── __init__.py
│   ├── config.py        ← colors, constants, theme
│   ├── parser.py        ← reads & parses log files
│   ├── stats.py         ← live statistics tracker
│   ├── exporter.py      ← TXT & JSON export
│   └── ui.py            ← full Rich-based terminal UI
├── logs/
│   ├── sample.log       ← example app log
│   └── server.log       ← example server log
└── exports/             ← saved exports appear here (auto-created)
```

---

## 🚀 Installation

### Option A — Standard Python (Linux / macOS / Windows WSL)

```bash
# 1. Clone or download the project
cd logwatch

# 2. Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run
python main.py
```

### Option B — Termux (Android)

```bash
# 1. Update Termux packages
pkg update && pkg upgrade

# 2. Install Python
pkg install python

# 3. Navigate to project folder
cd /data/data/com.termux.fdroid/files/home/logwatch   # adjust path

# 4. Install dependencies
pip install rich watchdog

# 5. Run
python main.py
```

> **Termux tip**: Make the terminal wider (pinch-zoom) for the best experience.

---

## ▶️ Running

```bash
# Monitor all *.log files in the logs/ folder (default)
python main.py

# Monitor specific files
python main.py logs/server.log /var/log/syslog

# Test with live-generated logs (open a SECOND terminal)
python generate_logs.py
```

---

## ⌨️ Hotkeys (shown in the bottom bar)

| Key | Action |
|-----|--------|
| `F` | Set keyword filter |
| `L` | Toggle log levels (ERROR / WARNING / INFO) |
| `T` | Set time range (HH:MM → HH:MM) |
| `S` | Save filtered results → `exports/*.txt` |
| `J` | Export filtered results → `exports/*.json` |
| `R` | Reset all filters |
| `Q` | Quit |

---

## 📊 Features

- **Live feed** — tail-follows every watched file, new lines appear instantly
- **Color coded** — ERROR in red, WARNING in amber, INFO in green
- **Keyword search** — highlights matches inline in the feed
- **Level filter** — show only the levels you care about
- **Time range filter** — narrow results to a specific hour window
- **Stats panel** — running totals per level + per file
- **TXT export** — clean timestamped text file
- **JSON export** — structured data ready for further processing
- **Animated banner** — Matrix-green ASCII art on startup

---

## 📄 Example Log Format

LogWatch understands timestamps in these formats:

```
2024-01-15 08:00:01 INFO  Application started
2024-01-15 08:01:45 WARNING Disk usage at 78%
2024-01-15 08:02:11 ERROR  Failed to connect: timeout
```

Any line containing ERROR / WARNING / INFO / DEBUG is detected
regardless of surrounding format.

---

## 📦 Dependencies

| Package   | Purpose |
|-----------|---------|
| `rich`    | All terminal colors, tables, panels, Live refresh |
| `watchdog`| (optional) File system event support |

Both installable via:
```bash
pip install -r requirements.txt
```
