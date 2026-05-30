#!/usr/bin/env python3
"""
generate_logs.py — Writes random log lines to logs/live_demo.log every second.
Run this in a second terminal to simulate a live, growing log file:

    python generate_logs.py
"""

import random
import time
import os
from datetime import datetime

OUTPUT = os.path.join("logs", "live_demo.log")
os.makedirs("logs", exist_ok=True)

LEVELS = ["INFO", "INFO", "INFO", "WARNING", "ERROR"]   # INFO is most common

MESSAGES = {
    "INFO": [
        "Request processed successfully",
        "User session created",
        "Cache refreshed",
        "Heartbeat OK",
        "Task queued for execution",
        "Config reloaded",
        "File uploaded: report.pdf",
        "Background worker idle",
    ],
    "WARNING": [
        "CPU usage at 88%",
        "Disk space below 15%",
        "Response time degraded: 1200ms",
        "Deprecated API endpoint called",
        "Too many open file handles",
    ],
    "ERROR": [
        "Database query timed out",
        "Unhandled exception in worker thread",
        "Failed to parse JSON payload",
        "Connection refused: redis:6379",
        "Disk write error on /data",
    ],
}

print(f"Writing random logs to {OUTPUT} — press Ctrl-C to stop")

with open(OUTPUT, "a") as fh:
    while True:
        level = random.choice(LEVELS)
        msg   = random.choice(MESSAGES[level])
        ts    = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        line  = f"{ts} {level:<8} {msg}\n"
        fh.write(line)
        fh.flush()
        print(line, end="")
        time.sleep(random.uniform(0.4, 1.5))
