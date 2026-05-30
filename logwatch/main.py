#!/usr/bin/env python3
# ─────────────────────────────────────────────
#  main.py — Entry point for LogWatch
#
#  Usage:
#    python main.py                       → monitors logs/ folder
#    python main.py app.log server.log    → monitor specific files
#    python main.py --help
# ─────────────────────────────────────────────

import argparse
import glob
import os
import sys

# Make sure Python can find the src/ package
sys.path.insert(0, os.path.dirname(__file__))

from src.ui import show_banner, LogWatchApp


def find_log_files(paths: list[str]) -> list[str]:
    """
    Resolve a list of paths / globs into actual file paths.
    If none given, fall back to every *.log inside logs/
    """
    resolved = []
    for p in paths:
        # Expand wildcards like logs/*.log
        expanded = glob.glob(p)
        if expanded:
            resolved.extend(expanded)
        elif os.path.isfile(p):
            resolved.append(p)
        else:
            print(f"⚠  Warning: '{p}' not found, skipping.")

    # Remove duplicates while preserving order
    seen = set()
    unique = []
    for f in resolved:
        if f not in seen:
            seen.add(f)
            unique.append(f)
    return unique


def main():
    parser = argparse.ArgumentParser(
        prog="logwatch",
        description="LogWatch — Real-time terminal log monitor",
    )
    parser.add_argument(
        "files",
        nargs="*",
        default=[],
        metavar="FILE",
        help="Log files to monitor. Default: all *.log files in logs/",
    )
    args = parser.parse_args()

    # ── Resolve file list ────────────────────
    if args.files:
        log_files = find_log_files(args.files)
    else:
        # Auto-discover logs/ folder
        log_files = find_log_files(glob.glob("logs/*.log"))

    if not log_files:
        print("❌  No log files found.")
        print("    Put .log files in the logs/ folder, or pass file paths as arguments.")
        sys.exit(1)

    print(f"📂  Monitoring {len(log_files)} file(s): {', '.join(log_files)}")

    # ── Animated banner ──────────────────────
    show_banner()

    # ── Launch the UI ────────────────────────
    app = LogWatchApp(log_files)
    try:
        app.run()
    except KeyboardInterrupt:
        print("\n[Ctrl-C] LogWatch terminated.")


if __name__ == "__main__":
    main()
