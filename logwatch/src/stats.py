# ─────────────────────────────────────────────
#  stats.py — Live statistics counter
# ─────────────────────────────────────────────

from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class Stats:
    """
    Tracks running totals of log entries by level and source file.
    Updated every time new lines are parsed.
    """
    total:    int = 0
    errors:   int = 0
    warnings: int = 0
    infos:    int = 0
    unknowns: int = 0

    # Per-file breakdown:  {"server.log": {"ERROR": 3, ...}}
    per_file: dict = field(default_factory=lambda: defaultdict(lambda: defaultdict(int)))

    def update(self, level: str, source: str) -> None:
        """Increment counters for one new log entry."""
        self.total += 1
        self.per_file[source][level] += 1

        if level == "ERROR":
            self.errors += 1
        elif level == "WARNING":
            self.warnings += 1
        elif level == "INFO":
            self.infos += 1
        else:
            self.unknowns += 1

    def reset(self) -> None:
        """Zero out all counters (used when changing filters)."""
        self.total    = 0
        self.errors   = 0
        self.warnings = 0
        self.infos    = 0
        self.unknowns = 0
        self.per_file.clear()
