// ═══════════════════════════════════════════
//   SHADOW TERMINAL — logmonitor.js
//   Log Monitor tab — pure vanilla JS
//   Tidak mengubah script.js sama sekali
// ═══════════════════════════════════════════

(function () {
  'use strict';

  // ── State ────────────────────────────────
  const state = {
    entries : [],        // semua log entry yang sudah di-load
    files   : {},        // { "nama.log": [entries...] }
    keyword : '',
    levels  : new Set(['ERROR', 'WARNING', 'INFO', 'UNKNOWN']),
    since   : null,
    until   : null,
  };

  // ── Tab switching ─────────────────────────
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ── Parse satu baris teks jadi LogEntry ──
  function parseLine(raw, filename) {
    const line = raw.trim();
    if (!line) return null;

    // Deteksi level (urutan prioritas: ERROR > WARNING > INFO > DEBUG)
    let level = 'UNKNOWN';
    const up  = line.toUpperCase();
    if      (up.includes('ERROR'))   level = 'ERROR';
    else if (up.includes('WARNING') || up.includes('WARN')) level = 'WARNING';
    else if (up.includes('INFO'))    level = 'INFO';
    else if (up.includes('DEBUG'))   level = 'DEBUG';

    // Coba ambil timestamp:  2024-01-15 08:00:01  atau  2024-01-15T08:00:01
    let timestamp = null;
    const tsm = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})/);
    if (tsm) {
      try { timestamp = new Date(tsm[1].replace(' ', 'T')); } catch (_) {}
    }

    // Pesan = teks setelah keyword level
    const mm  = line.match(/(?:ERROR|WARNING|WARN|INFO|DEBUG)\s*[:\-–]?\s*(.*)/i);
    const msg = mm ? mm[1].trim() : line;

    return { raw: line, filename, level, timestamp, message: msg };
  }

  // ── Load file dari input ──────────────────
  document.getElementById('log-file-input').addEventListener('change', function (e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const entries = ev.target.result
          .split('\n')
          .map(l => parseLine(l, file.name))
          .filter(Boolean);

        state.files[file.name] = entries;
        rebuildEntries();
        addFileBadge(file.name, entries.length);
        renderFeed();
        toast(`✔ ${file.name} — ${entries.length} baris loaded`);
      };
      reader.readAsText(file);
    });
    this.value = ''; // reset supaya file yang sama bisa di-load ulang
  });

  function rebuildEntries() {
    state.entries = [];
    Object.values(state.files).forEach(arr => state.entries.push(...arr));
    // Urutkan berdasarkan timestamp (yang tidak ada timestamp taruh di akhir)
    state.entries.sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return a.timestamp - b.timestamp;
    });
    updateStats();
  }

  function addFileBadge(name, count) {
    const wrap = document.getElementById('loaded-files');
    // Hapus placeholder hint
    wrap.querySelector('.no-files-hint') && wrap.querySelector('.no-files-hint').remove();
    // Cegah duplikat
    if (wrap.querySelector(`[data-file="${CSS.escape(name)}"]`)) return;

    const badge = document.createElement('div');
    badge.className = 'file-badge';
    badge.dataset.file = name;
    badge.innerHTML =
      `<span>${name} <span style="color:var(--green-dk)">(${count})</span></span>` +
      `<span class="badge-rm" data-file="${escAttr(name)}" title="hapus">✕</span>`;

    badge.querySelector('.badge-rm').addEventListener('click', () => {
      delete state.files[name];
      badge.remove();
      if (!Object.keys(state.files).length) {
        wrap.innerHTML = '<span class="no-files-hint">belum ada file — load .log atau .txt</span>';
      }
      rebuildEntries();
      renderFeed();
    });

    wrap.appendChild(badge);
  }

  // ── Filter matching ───────────────────────
  function matches(entry) {
    if (!state.levels.has(entry.level)) return false;
    if (state.keyword) {
      const hay = (entry.raw + ' ' + entry.message).toLowerCase();
      if (!hay.includes(state.keyword)) return false;
    }
    if (entry.timestamp) {
      if (state.since && entry.timestamp < state.since) return false;
      if (state.until && entry.timestamp > state.until) return false;
    }
    return true;
  }

  // ── Render feed ───────────────────────────
  function renderFeed() {
    const feed  = document.getElementById('log-feed');
    const empty = document.getElementById('log-empty');
    const vis   = state.entries.filter(matches);

    if (!vis.length) {
      feed.innerHTML = '';
      feed.appendChild(empty);
      empty.style.display = 'block';
      empty.textContent = state.keyword || state.levels.size < 4
        ? '// tidak ada entri yang cocok dengan filter'
        : '// load file .log untuk mulai monitoring';
      return;
    }

    empty.style.display = 'none';
    feed.innerHTML = '';

    vis.forEach(entry => {
      const div = document.createElement('div');
      div.className = `log-entry lvl-${entry.level}`;

      const ts  = entry.timestamp
        ? entry.timestamp.toTimeString().slice(0, 8)
        : '──:──:──';
      const lvl = entry.level === 'WARNING' ? 'WARN' : entry.level;

      div.innerHTML =
        `<span class="le-ts">${ts}</span>` +
        `<span class="le-lvl ${entry.level}">${lvl}</span>` +
        `<span class="le-src" title="${escAttr(entry.filename)}">${escHtml(entry.filename)}</span>` +
        `<span class="le-msg">${highlight(entry.message, state.keyword)}</span>`;

      feed.appendChild(div);
    });

    // Scroll ke bawah (latest)
    feed.scrollTop = feed.scrollHeight;
  }

  // ── Stats ─────────────────────────────────
  function updateStats() {
    const all = state.entries;
    document.getElementById('st-total').textContent = all.length;
    document.getElementById('st-err').textContent   = all.filter(e => e.level === 'ERROR').length;
    document.getElementById('st-warn').textContent  = all.filter(e => e.level === 'WARNING').length;
    document.getElementById('st-info').textContent  = all.filter(e => e.level === 'INFO').length;

    const parts = [];
    if (state.keyword)         parts.push(`key:«${state.keyword}»`);
    if (state.levels.size < 4) parts.push(`lvl:${[...state.levels].join(',')}`);
    if (state.since)           parts.push(`dari:${state.since.toTimeString().slice(0,5)}`);
    if (state.until)           parts.push(`sampai:${state.until.toTimeString().slice(0,5)}`);

    document.getElementById('st-filter-label').textContent = parts.join('  ');
  }

  // ── Keyword filter ────────────────────────
  const kwInput = document.getElementById('log-kw');
  const kwClear = document.getElementById('log-kw-clear');

  kwInput.addEventListener('input', () => {
    state.keyword = kwInput.value.trim().toLowerCase();
    kwClear.style.display = state.keyword ? 'inline' : 'none';
    updateStats();
    renderFeed();
  });

  kwClear.addEventListener('click', () => {
    kwInput.value  = '';
    state.keyword  = '';
    kwClear.style.display = 'none';
    updateStats();
    renderFeed();
  });

  // ── Level toggle ──────────────────────────
  document.querySelectorAll('.lvl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl     = btn.dataset.lvl;
      const cls     = lvl === 'ERROR' ? 'active-err' : lvl === 'WARNING' ? 'active-warn' : 'active-info';
      const isActive = state.levels.has(lvl);

      if (isActive && state.levels.size <= 1) return; // jangan hapus semua

      if (isActive) {
        state.levels.delete(lvl);
        btn.classList.remove(cls);
        btn.style.opacity = '0.35';
      } else {
        state.levels.add(lvl);
        btn.classList.add(cls);
        btn.style.opacity = '1';
      }
      updateStats();
      renderFeed();
    });
  });

  // ── Time range ────────────────────────────
  function parseHHMM(str) {
    if (!str) return null;
    const m = str.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const d = new Date();
    d.setHours(+m[1], +m[2], 0, 0);
    return d;
  }

  ['log-since', 'log-until'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      state.since = parseHHMM(document.getElementById('log-since').value);
      state.until = parseHHMM(document.getElementById('log-until').value);
      updateStats();
      renderFeed();
    });
  });

  // ── Reset semua filter ────────────────────
  document.getElementById('btn-log-reset').addEventListener('click', () => {
    kwInput.value  = '';
    state.keyword  = '';
    state.levels   = new Set(['ERROR', 'WARNING', 'INFO', 'UNKNOWN']);
    state.since    = null;
    state.until    = null;
    kwClear.style.display = 'none';
    document.getElementById('log-since').value = '';
    document.getElementById('log-until').value = '';

    document.querySelectorAll('.lvl-btn').forEach(b => {
      const lvl = b.dataset.lvl;
      const cls = lvl === 'ERROR' ? 'active-err' : lvl === 'WARNING' ? 'active-warn' : 'active-info';
      b.classList.add(cls);
      b.style.opacity = '1';
    });

    updateStats();
    renderFeed();
    toast('✔ semua filter direset');
  });

  // ── Export TXT ────────────────────────────
  document.getElementById('btn-export-txt').addEventListener('click', () => {
    const vis = state.entries.filter(matches);
    if (!vis.length) { toast('⚠ tidak ada data untuk diekspor'); return; }

    const lines = [
      '# Shadow Terminal — Log Export',
      `# ${new Date().toISOString()}`,
      `# Total entri: ${vis.length}`,
      '',
    ];
    vis.forEach(e => {
      const ts = e.timestamp ? e.timestamp.toISOString() : 'no-timestamp';
      lines.push(`[${ts}] [${e.level.padEnd(7)}] [${e.filename}] ${e.message}`);
    });

    dlFile(lines.join('\n'), `shadow-logs-${Date.now()}.txt`, 'text/plain');
    toast(`✔ ${vis.length} baris disimpan → .txt`);
  });

  // ── Export JSON ───────────────────────────
  document.getElementById('btn-export-json').addEventListener('click', () => {
    const vis = state.entries.filter(matches);
    if (!vis.length) { toast('⚠ tidak ada data untuk diekspor'); return; }

    const payload = {
      exported_at : new Date().toISOString(),
      count       : vis.length,
      entries     : vis.map(e => ({
        timestamp : e.timestamp ? e.timestamp.toISOString() : null,
        level     : e.level,
        source    : e.filename,
        message   : e.message,
        raw       : e.raw,
      })),
    };

    dlFile(JSON.stringify(payload, null, 2), `shadow-logs-${Date.now()}.json`, 'application/json');
    toast(`✔ ${vis.length} entri disimpan → .json`);
  });

  // ── Utils ─────────────────────────────────
  function dlFile(content, name, type) {
    const a  = document.createElement('a');
    a.href   = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function highlight(text, kw) {
    const safe = escHtml(text);
    if (!kw) return safe;
    const re = new RegExp(escRe(kw), 'gi');
    return safe.replace(re, m => `<mark>${m}</mark>`);
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }
  function escRe(s)   { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function toast(msg) {
    const el = document.getElementById('log-toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3000);
  }

})();
