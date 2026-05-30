# ─────────────────────────────────────────────
#  config.py — App-wide constants & theme colors
# ─────────────────────────────────────────────

# ── Refresh interval (seconds) ──────────────
REFRESH_INTERVAL = 1.0

# ── Max lines to keep in the live feed ──────
MAX_FEED_LINES = 200

# ── Default export folder ────────────────────
EXPORT_DIR = "exports"

# ── Log-level keywords the parser looks for ─
LOG_LEVELS = {
    "ERROR":   "error",
    "WARNING": "warning",
    "WARN":    "warning",
    "INFO":    "info",
    "DEBUG":   "dim",
}

# ── Hacker-green terminal color palette ─────
THEME = {
    # backgrounds / panels
    "bg":           "#0d0d0d",   # near-black canvas
    "panel_border": "#00ff41",   # matrix green
    "panel_title":  "#00ff41",

    # log-level badge colors
    "error":        "#ff2222",   # hot red
    "warning":      "#ffaa00",   # amber
    "info":         "#00cc55",   # green
    "debug":        "#555555",   # muted grey

    # general text
    "text":         "#ccffcc",   # soft green-white
    "dim":          "#446644",   # faded
    "highlight":    "#ffffff",   # pure white for emphasis

    # stats counters
    "stat_error":   "#ff2222",
    "stat_warn":    "#ffaa00",
    "stat_info":    "#00cc55",
    "stat_total":   "#00ff41",

    # banner / branding
    "banner":       "#00ff41",
    "banner_sub":   "#008822",
}
