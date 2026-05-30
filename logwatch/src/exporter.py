# ─────────────────────────────────────────────
#  exporter.py — Save filtered logs to TXT/JSON
# ─────────────────────────────────────────────

import json
import os
from datetime import datetime
from typing import List

from src.parser import LogEntry
from src.config import EXPORT_DIR


def _ensure_export_dir() -> None:
    """Create the exports/ folder if it doesn't exist yet."""
    os.makedirs(EXPORT_DIR, exist_ok=True)


def _timestamp_slug() -> str:
    """Return a filename-safe timestamp like 20240115_080045."""
    return datetime.now().strftime("%Y%m%d_%H%M%S")


# ── TXT export ───────────────────────────────
def export_txt(entries: List[LogEntry]) -> str:
    """
    Write entries to a .txt file.
    Returns the path of the saved file.
    """
    _ensure_export_dir()
    path = os.path.join(EXPORT_DIR, f"logwatch_{_timestamp_slug()}.txt")

    with open(path, "w", encoding="utf-8") as fh:
        fh.write(f"# LogWatch Export — {datetime.now().isoformat()}\n")
        fh.write(f"# Total entries: {len(entries)}\n\n")
        for entry in entries:
            ts_str = entry.timestamp.isoformat() if entry.timestamp else "no-timestamp"
            fh.write(f"[{ts_str}] [{entry.level:<8}] [{entry.source}] {entry.message}\n")

    return path


# ── JSON export ──────────────────────────────
def export_json(entries: List[LogEntry]) -> str:
    """
    Write entries to a .json file.
    Returns the path of the saved file.
    """
    _ensure_export_dir()
    path = os.path.join(EXPORT_DIR, f"logwatch_{_timestamp_slug()}.json")

    records = []
    for entry in entries:
        records.append({
            "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
            "level":     entry.level,
            "source":    entry.source,
            "message":   entry.message,
            "raw":       entry.raw,
        })

    with open(path, "w", encoding="utf-8") as fh:
        json.dump({"exported_at": datetime.now().isoformat(),
                   "count": len(records),
                   "entries": records},
                  fh, indent=2, ensure_ascii=False)

    return path
