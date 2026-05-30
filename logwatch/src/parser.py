# ─────────────────────────────────────────────
#  parser.py — Reads log files & detects levels
# ─────────────────────────────────────────────

import os
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from src.config import LOG_LEVELS


# ── Data class: one parsed log line ──────────
@dataclass
class LogEntry:
    """Holds all parsed information for a single log line."""
    raw:       str               # original unmodified text
    source:    str               # which file it came from
    level:     str               # ERROR / WARNING / INFO / DEBUG / UNKNOWN
    timestamp: Optional[datetime] = None   # parsed datetime (if found)
    message:   str = ""          # everything after the level keyword


# ── Patterns we try to extract a datetime with ──
# Handles formats like:  2024-01-15 08:00:01
#                        [2024-01-15 08:00:01]
#                        15/Jan/2024:08:00:01
TIMESTAMP_PATTERNS = [
    r"\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}",
    r"\d{2}/\w{3}/\d{4}:\d{2}:\d{2}:\d{2}",
]

def _parse_timestamp(line: str) -> Optional[datetime]:
    """Try to extract a datetime object from a log line."""
    for pat in TIMESTAMP_PATTERNS:
        m = re.search(pat, line)
        if m:
            raw_ts = m.group(0)
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S",
                        "%d/%b/%Y:%H:%M:%S"):
                try:
                    return datetime.strptime(raw_ts, fmt)
                except ValueError:
                    continue
    return None


def _detect_level(line: str) -> str:
    """Return the highest-severity level found in the line."""
    upper = line.upper()
    # Check in priority order (ERROR first, then WARNING, then INFO)
    for keyword in ("ERROR", "WARNING", "WARN", "INFO", "DEBUG"):
        if keyword in upper:
            # Normalise WARN → WARNING
            return "WARNING" if keyword == "WARN" else keyword
    return "UNKNOWN"


def parse_line(raw_line: str, source: str) -> LogEntry:
    """Convert one raw text line into a structured LogEntry."""
    line   = raw_line.rstrip("\n")
    level  = _detect_level(line)
    ts     = _parse_timestamp(line)

    # Message = everything after the level keyword (best-effort)
    msg_match = re.search(
        r"(?:ERROR|WARNING|WARN|INFO|DEBUG)\s*[:\-–]?\s*(.*)",
        line, re.IGNORECASE
    )
    message = msg_match.group(1).strip() if msg_match else line

    return LogEntry(
        raw=line,
        source=os.path.basename(source),
        level=level,
        timestamp=ts,
        message=message,
    )


# ── File reader with tail-like behaviour ─────
class LogFileReader:
    """
    Watches a single log file.
    Call .read_new_lines() to get any lines added since last call.
    """

    def __init__(self, filepath: str):
        self.filepath = filepath
        # Start at end of file so we only show NEW lines
        self._position = self._get_file_size()

    def _get_file_size(self) -> int:
        try:
            return os.path.getsize(self.filepath)
        except OSError:
            return 0

    def read_new_lines(self) -> list[LogEntry]:
        """Return newly added lines since last read."""
        entries = []
        try:
            current_size = self._get_file_size()
            if current_size < self._position:
                # File was truncated/rotated — reset to beginning
                self._position = 0

            if current_size == self._position:
                return []  # Nothing new

            with open(self.filepath, "r", errors="replace") as fh:
                fh.seek(self._position)
                for raw in fh:
                    entries.append(parse_line(raw, self.filepath))
                self._position = fh.tell()
        except OSError:
            pass
        return entries

    def read_all_lines(self) -> list[LogEntry]:
        """Read entire file from top (used for initial load)."""
        entries = []
        try:
            with open(self.filepath, "r", errors="replace") as fh:
                for raw in fh:
                    entries.append(parse_line(raw, self.filepath))
                self._position = fh.tell()
        except OSError:
            pass
        return entries
