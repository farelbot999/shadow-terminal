# ─────────────────────────────────────────────
#  ui.py — Terminal UI built with Rich
#  Termux-compatible, input-safe version
# ─────────────────────────────────────────────

import time
import threading
from datetime import datetime
from typing import List, Optional

from rich.console import Console
from rich.layout import Layout
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.align import Align
from rich import box

from src.config import THEME, REFRESH_INTERVAL, MAX_FEED_LINES
from src.parser import LogEntry, LogFileReader
from src.stats import Stats
from src.exporter import export_txt, export_json

console = Console()

# ══════════════════════════════════════════════
#  BANNER
# ══════════════════════════════════════════════
BANNER_ART = r"""
 _                __        __    _       _     
| |    ___   __ _\ \      / /_ _| |_ ___| |__  
| |   / _ \ / _` |\ \ /\ / / _` | __/ __| '_ \ 
| |__| (_) | (_| | \ V  V / (_| | || (__| | | |
|_____\___/ \__, |  \_/\_/ \__,_|\__\___|_| |_|
            |___/                               
"""

def show_banner() -> None:
    console.clear()
    for line in BANNER_ART.strip("\n").split("\n"):
        console.print(Align.center(Text(line, style=f"bold {THEME['banner']}")))
        time.sleep(0.06)
    console.print(Align.center(
        Text("  Real-Time Terminal Log Monitor  v1.0  ",
             style=f"bold {THEME['banner_sub']}")))
    console.print(Align.center(Text("─" * 50, style=THEME["panel_border"])))
    time.sleep(0.8)


# ══════════════════════════════════════════════
#  FILTER STATE
# ══════════════════════════════════════════════
class FilterState:
    def __init__(self):
        self.keyword: Optional[str]      = None
        self.levels:  set                = {"ERROR", "WARNING", "INFO", "UNKNOWN"}
        self.since:   Optional[datetime] = None
        self.until:   Optional[datetime] = None

    def matches(self, entry: LogEntry) -> bool:
        if entry.level not in self.levels:
            return False
        if self.keyword:
            combined = (entry.raw + entry.message).lower()
            if self.keyword.lower() not in combined:
                return False
        if entry.timestamp:
            if self.since and entry.timestamp < self.since:
                return False
            if self.until and entry.timestamp > self.until:
                return False
        return True


# ══════════════════════════════════════════════
#  RENDERING
# ══════════════════════════════════════════════
def _level_badge(level: str) -> Text:
    colors = {
        "ERROR":   THEME["error"],
        "WARNING": THEME["warning"],
        "INFO":    THEME["info"],
        "UNKNOWN": THEME["dim"],
    }
    return Text(f"[{level[:4]}]", style=f"bold {colors.get(level, THEME['dim'])}")


def _build_feed_table(entries: List[LogEntry], filters: FilterState) -> Table:
    tbl = Table(box=box.SIMPLE, show_header=True,
                header_style=f"bold {THEME['panel_title']}",
                expand=True, show_edge=False)
    tbl.add_column("Time",    style=THEME["dim"], width=10, no_wrap=True)
    tbl.add_column("Lvl",     width=7,  no_wrap=True)
    tbl.add_column("Src",     style=THEME["dim"], width=12, no_wrap=True)
    tbl.add_column("Message", style=THEME["text"], ratio=1)

    visible = [e for e in entries if filters.matches(e)][-50:]

    for entry in visible:
        ts = entry.timestamp.strftime("%H:%M:%S") if entry.timestamp else "──:──:──"
        msg = Text(entry.message[:80], style=THEME["text"])
        if filters.keyword:
            msg.highlight_words([filters.keyword],
                                style=f"bold reverse {THEME['highlight']}")
        tbl.add_row(ts, _level_badge(entry.level), entry.source[:12], msg)

    if not visible:
        tbl.add_row("", Text("── tidak ada entri ──", style=THEME["dim"]), "", "")
    return tbl


def _build_stats_panel(stats: Stats, filters: FilterState) -> Panel:
    tbl = Table(box=box.SIMPLE, show_header=False, expand=True, show_edge=False)
    tbl.add_column("k", style=THEME["dim"])
    tbl.add_column("v", justify="right")

    tbl.add_row("TOTAL",  Text(str(stats.total),    style=f"bold {THEME['stat_total']}"))
    tbl.add_row("ERROR",  Text(str(stats.errors),   style=f"bold {THEME['stat_error']}"))
    tbl.add_row("WARN",   Text(str(stats.warnings), style=f"bold {THEME['stat_warn']}"))
    tbl.add_row("INFO",   Text(str(stats.infos),    style=f"bold {THEME['stat_info']}"))

    # Filter aktif
    tbl.add_row(Text("─FILTER─", style=THEME["dim"]), Text(""))
    kw = f"«{filters.keyword}»" if filters.keyword else "─"
    tbl.add_row("key", Text(kw, style=THEME["highlight"]))
    lvl = ",".join(sorted(filters.levels)) if len(filters.levels) < 4 else "ALL"
    tbl.add_row("lvl", Text(lvl[:12], style=THEME["highlight"]))

    if stats.per_file:
        tbl.add_row(Text("─FILES─", style=THEME["dim"]), Text(""))
        for fname, levels in stats.per_file.items():
            tbl.add_row(Text(fname[:12], style=THEME["dim"]),
                        Text(str(sum(levels.values())), style=THEME["stat_total"]))

    return Panel(tbl, title=f"[bold {THEME['panel_title']}]STATS[/]",
                 border_style=THEME["panel_border"], padding=(0, 1))


def _render(entries, stats, filters, status_msg):
    """Print satu frame ke terminal."""
    console.clear()

    # Header
    h = Text()
    h.append("▶ LogWatch ", style=f"bold {THEME['banner']}")
    h.append(datetime.now().strftime("%H:%M:%S"), style=THEME["dim"])
    if status_msg:
        h.append(f"  ✔ {status_msg}", style=f"bold {THEME['info']}")
    console.print(Panel(Align.center(h), border_style=THEME["panel_border"], height=3))

    # Body: feed + stats berdampingan
    layout = Layout()
    layout.split_row(
        Layout(Panel(_build_feed_table(entries, filters),
                     title=f"[bold {THEME['panel_title']}]LIVE FEED[/]",
                     border_style=THEME["panel_border"], padding=(0,1)),
               ratio=3),
        Layout(_build_stats_panel(stats, filters), ratio=1),
    )
    console.print(layout)

    # Footer hotkeys
    help_t = Text()
    for k, d in [("F","filter"),("L","levels"),("T","time"),
                 ("S","saveTXT"),("J","JSON"),("R","reset"),("Q","quit")]:
        help_t.append(f"[{k}]", style=f"bold {THEME['banner']}")
        help_t.append(f"{d} ",  style=THEME["dim"])
    console.print(Panel(Align.center(help_t), border_style=THEME["dim"], height=3))


# ══════════════════════════════════════════════
#  MENU FUNCTIONS
# ══════════════════════════════════════════════
def _ask(prompt: str) -> str:
    console.print(f"[bold {THEME['banner']}]{prompt}[/] ", end="")
    try:
        return input().strip()
    except (EOFError, KeyboardInterrupt):
        return ""


def menu_keyword(filters: FilterState) -> str:
    kw = _ask("Keyword (kosong=hapus filter):")
    if kw:
        filters.keyword = kw
        return f"keyword=«{kw}»"
    else:
        filters.keyword = None
        return "keyword cleared"


def menu_levels(filters: FilterState) -> str:
    all_lv = ["ERROR", "WARNING", "INFO", "UNKNOWN"]
    console.print(f"[{THEME['dim']}]Aktif: {', '.join(sorted(filters.levels))}[/]")
    console.print(f"[{THEME['dim']}]Contoh: ERROR,WARNING  atau kosong=SEMUA[/]")
    raw = _ask("Level:").upper()
    if not raw:
        filters.levels = set(all_lv)
        return "levels=ALL"
    chosen = {x.strip() for x in raw.split(",") if x.strip() in all_lv}
    if chosen:
        filters.levels = chosen
        return f"levels={','.join(sorted(chosen))}"
    return "input tidak valid"


def menu_time(filters: FilterState) -> str:
    fmt   = "%H:%M"
    today = datetime.now().date()
    s = _ask("Dari jam HH:MM (kosong=skip):")
    u = _ask("Sampai jam HH:MM (kosong=skip):")
    try:
        filters.since = datetime.combine(today, datetime.strptime(s, fmt).time()) if s else None
        filters.until = datetime.combine(today, datetime.strptime(u, fmt).time()) if u else None
        return f"waktu {s or '─'}→{u or '─'}"
    except ValueError:
        return "format salah, gunakan HH:MM"


# ══════════════════════════════════════════════
#  MAIN APP
# ══════════════════════════════════════════════
class LogWatchApp:
    def __init__(self, filepaths: List[str]):
        self.readers = [LogFileReader(fp) for fp in filepaths]
        self.entries: List[LogEntry] = []
        self.stats    = Stats()
        self.filters  = FilterState()
        self._lock    = threading.Lock()
        self._running = True

    def _poll(self):
        """Background thread: baca baris baru tiap detik."""
        while self._running:
            for reader in self.readers:
                for entry in reader.read_new_lines():
                    with self._lock:
                        self.entries.append(entry)
                        self.stats.update(entry.level, entry.source)
            time.sleep(REFRESH_INTERVAL)

    def _load_initial(self):
        for reader in self.readers:
            for entry in reader.read_all_lines():
                self.entries.append(entry)
                self.stats.update(entry.level, entry.source)

    def run(self):
        self._load_initial()
        threading.Thread(target=self._poll, daemon=True).start()

        status = ""
        while self._running:
            # Render frame
            with self._lock:
                snap = list(self.entries)
            _render(snap, self.stats, self.filters, status)
            status = ""

            # Baca input (blocking tapi dengan timeout via thread)
            console.print(
                f"\n[{THEME['dim']}]Hotkey (F/L/T/S/J/R/Q) + Enter "
                f"atau Enter saja untuk refresh:[/] ", end="")

            result = [""]
            ev = threading.Event()

            def _read():
                try:
                    result[0] = input()
                except Exception:
                    pass
                ev.set()

            t = threading.Thread(target=_read, daemon=True)
            t.start()
            ev.wait(timeout=30)  # tunggu max 1 detik

            key = result[0].strip().lower()
            if not key:
                continue  # timeout atau Enter kosong = refresh saja

            # Proses satu karakter pertama sebagai hotkey
            cmd = key[0]
            if cmd == "q":
                self._running = False
            elif cmd == "r":
                self.filters = FilterState()
                status = "semua filter direset"
            elif cmd == "f":
                # Untuk menu: render dulu hint, lalu input
                console.print(f"\n[bold {THEME['banner']}]── FILTER KEYWORD ──[/]")
                status = menu_keyword(self.filters)
            elif cmd == "l":
                console.print(f"\n[bold {THEME['banner']}]── FILTER LEVEL ──[/]")
                status = menu_levels(self.filters)
            elif cmd == "t":
                console.print(f"\n[bold {THEME['banner']}]── FILTER WAKTU ──[/]")
                status = menu_time(self.filters)
            elif cmd == "s":
                with self._lock:
                    visible = [e for e in self.entries if self.filters.matches(e)]
                path = export_txt(visible)
                status = f"disimpan → {path}"
            elif cmd == "j":
                with self._lock:
                    visible = [e for e in self.entries if self.filters.matches(e)]
                path = export_json(visible)
                status = f"disimpan → {path}"

        console.print(f"\n[bold {THEME['banner']}]LogWatch berhenti. Sampai jumpa![/]\n")
